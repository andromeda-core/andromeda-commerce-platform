<?php

namespace App\Repositories\TranslationSystem\Translations\Repository;

use App\Models\Language;
use App\Models\Translation;
use App\Repositories\TranslationSystem\Translations\Interface\ITranslationRepository;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class TranslationRepository implements ITranslationRepository
{
    public function __construct(
        private Translation $translation,
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
}
