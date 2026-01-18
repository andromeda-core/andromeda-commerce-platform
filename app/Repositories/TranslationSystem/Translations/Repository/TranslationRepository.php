<?php

namespace App\Repositories\TranslationSystem\Translations\Repository;

use App\Imports\TranslationImport;
use App\Models\Language;
use App\Models\Translation;
use App\Models\TranslationKey;
use App\Repositories\TranslationSystem\Translations\Interface\ITranslationRepository;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Maatwebsite\Excel\Facades\Excel;

class TranslationRepository implements ITranslationRepository
{
    public function __construct(
        private Translation $translation,
        private TranslationKey $translation_key,
        private Language $language
    ) {}

    public function getAllTranslations(?string $language_code = null)
    {
        $language = $this->language->with(['translations'])->where('code', $language_code)->first();

        if (empty($language)) {
            return [
                'status' => false,
                'message' => 'No Language Found for the Provided Language Code',
            ];
        }

        $translations = $language->translations;

        return [
            'status' => true,
            'translations' => $translations,
        ];
    }

    public function saveTranslations(Request $request)
    {
        try {
            $validated_req = $request->validate([
                'language_code' => ['required', 'string', 'exists:languages,code'],
                'translations' => ['nullable', 'array'],
                'translations.*.translation_key_id' => ['nullable', 'integer', 'exists:translation_keys,id'],
                'translations.*.value' => ['nullable', 'string'],
                'deletedTranslationsData' => ['nullable', 'array'],
            ]);
            $language = $this->language->where('code', $validated_req['language_code'])->first();

            if (empty($language)) {
                throw new Exception('Language Not Found');
            }

            if (! blank($validated_req['deletedTranslationsData'])) {
                $this->translation->where('language_id', $language->id)
                    ->whereIn('translation_key_id', $validated_req['deletedTranslationsData'])
                    ->delete();
            }

            $translations_data = [];
            $now = now();
            foreach ($validated_req['translations'] as $translation_item) {
                $translations_data[] = [
                    'language_id' => $language->id,
                    'translation_key_id' => $translation_item['translation_key_id'],
                    'value' => $translation_item['value'] ?? null,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }

            if (count($translations_data) > 0) {
                $saved = $this->translation->upsert(
                    $translations_data,
                    ['language_id', 'translation_key_id'],
                    ['value', 'updated_at']
                );

                if (! $saved) {
                    throw new Exception('Something Went Wrong While Saving Translations');
                }

                Cache::tags(["translation_{$language->code}"])->flush();
            }

            return [
                'status' => true,
                'message' => 'Translations Saved Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function getLanguageTranslations(Request $request)
    {
        $translations = [];
        if ($request->user()) {
            $translations = $this->translation->where('language_id', $request->user()->language_id)->with('translationKeys')->get()->toArray();
        } else {
            $language_cookie = $request->cookie('language');

            if (empty($language_cookie)) {

                $language_cookie = json_encode([
                    'language_id' => 1,
                    'language_locale' => 'en',
                ]);
            }

            try {
                $decoded = json_decode($language_cookie, true);
                if (json_last_error() === JSON_ERROR_NONE && isset($decoded['language_id'])) {
                    $langId = $decoded['language_id'];
                    $translations = $this->translation->where('language_id', $langId)->with('translationKeys')->get()->toArray();
                }

            } catch (\Exception $e) {
                // info('Error decoding language cookie: ' . $e->getMessage());
            }

        }

        return $translations;
    }

    public function getAllKeysAndLanguageIDForExcelExport(?string $language_id = null)
    {
        try {
            $language = $this->language->findOrFail($language_id);

            $keys = $this->translation_key
                ->with(['translations' => function ($q) use ($language_id) {
                    $q->where('language_id', $language_id);
                }])
                ->orderBy('key')
                ->get();

            return $keys->map(function ($key) use ($language) {
                $translation = $key->translations->first();

                return [
                    $language->code,
                    $key->key,
                    $translation?->value ?? '',
                ];
            })->toArray();

        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function getExcelFileToImportTranslations(Request $request)
    {

        try {

            $validated_req = $request->validate([
                'language_code' => ['required', 'string', 'exists:languages,code'],
                'import_file' => [
                    'required',
                    'file',
                    'mimes:csv,xlsx',
                ],
            ]);

            $language = $this->language->where('code', $validated_req['language_code'])->first();

            if (empty($language)) {
                throw new Exception('Language Not Found');
            }

            $file = $request->file('import_file');
            if (! $file->isValid()) {
                throw new \Exception('Invalid uploaded file');
            }

            Excel::import(
                new TranslationImport($this, $language->id),
                $file
            );

        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }

    }

    public function processTranslationImportExcelRows(
        int $languageId,
        Collection $rows
    ): void {

        if ($rows->isEmpty()) {
            throw new \Exception('Excel file is empty');
        }

        //  Header validation
        $required = ['translation_key', 'translation_value'];
        $headers = array_keys($rows->first()->toArray());

        if ($diff = array_diff($required, $headers)) {
            throw new \Exception(
                'Invalid Excel headers: '.implode(', ', $diff)
            );
        }

        $keysMap = $this->translation_key
            ->pluck('id', 'key')
            ->mapWithKeys(fn ($id, $key) => [
                $this->normalizeKey($key) => $id,
            ])
            ->toArray();

        foreach ($rows as $index => $row) {

            $rowNo = $index + 2;

            if (empty($row['translation_key'])) {
                throw new \Exception("Row {$rowNo}: translation_key missing");
            }

            $key = $this->normalizeKey((string) $row['translation_key']);

            if (! isset($keysMap[$key])) {
                throw new \Exception(
                    "Row {$rowNo}: invalid translation key ({$key})"
                );
            }

            $this->translation->updateOrCreate(
                [
                    'language_id' => $languageId,
                    'translation_key_id' => $keysMap[$key],
                ],
                [
                    'value' => trim((string) $row['translation_value']),
                ]
            );
        }
    }

    private function normalizeKey(string $value): string
    {

        $value = preg_replace('/^\xEF\xBB\xBF/u', '', $value);

        if (class_exists(\Normalizer::class)) {
            $value = \Normalizer::normalize($value, \Normalizer::FORM_C);
        }
        $value = preg_replace('/[\p{Cc}\p{Cf}]/u', '', $value);

        $value = preg_replace('/[\p{Z}\s]+/u', ' ', $value);

        return trim($value);
    }
}
