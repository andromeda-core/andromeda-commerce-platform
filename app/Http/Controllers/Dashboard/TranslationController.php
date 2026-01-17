<?php

namespace App\Http\Controllers\Dashboard;

use App\Exports\TranslationExport;
use App\Http\Controllers\Controller;
use App\Models\Language;
use App\Repositories\TranslationSystem\TranslationKey\Interface\ITranslationKeyRepository;
use App\Repositories\TranslationSystem\Translations\Interface\ITranslationRepository;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class TranslationController extends Controller implements HasMiddleware
{
    public static function middleware()
    {

        return [
            new Middleware('permission:Translation System View', ['only' => 'index']),
            new Middleware('permission:Translation System View', ['only' => 'saveTranslations']),

        ];
    }

    public function __construct(
        private ITranslationKeyRepository $translation_key,
        private ITranslationRepository $translation
    ) {}

    public function index(?string $language_code = null)
    {
        if (empty($language_code)) {
            return to_route('dashboard.translation-system.languages.index')->with('error', 'No Language Selected. Please Select a Language to Manage Translations');
        }

        $translation_keys = $this->translation_key->getAllTranslationKeysWithoutPagination();
        if ($translation_keys->isEmpty()) {
            return to_route('dashboard.translation-system.languages.index')->with('info', 'No Translation Keys Found. Please Create Translation Keys First');
        }

        $data = $this->translation->getAllTranslations($language_code);

        if ($data['status'] === false) {
            return to_route('dashboard.translation-system.languages.index')->with('error', $data['message']);
        }

        $translations = $data['translations'];

        return Inertia::render('Dashboard/TranslationSystem/Translations/Index', [
            'translation_keys' => $translation_keys,
            'translations' => $translations,
            'selected_language_code' => $language_code,
        ]);

    }

    public function saveTranslations(Request $request)
    {
        // dd($request->all());
        $saved = $this->translation->saveTranslations($request);

        if ($saved['status'] === false) {
            return to_route('dashboard.translation-system.translations.index', ['language_code' => $request->language_code])->with('error', $saved['message']);

        }

        return to_route('dashboard.translation-system.translations.index', ['language_code' => $request->language_code])->with('success', $saved['message']);
    }

    public function exportTranslations(Language $language)
    {

        $data = $this->translation->getAllKeysAndLanguageIDForExcelExport($language->id);

        if (isset($data['status']) && $data['status'] === false) {
            return back()->with('error', $data['message']);
        }

        return Excel::download(
            new TranslationExport($data),
            'translations_'.$language->code.'.xlsx'
        );
    }

    public function importTranslations(Request $request)
    {

        try {
            $data = $this->translation
                ->getExcelFileToImportTranslations($request);

            if (isset($data['status']) && $data['status'] === false) {
                return back()->with('error', $data['message']);
            }

            return back()->with('success', 'Translations imported');

        } catch (\Throwable $e) {
            return back()->with('error', $e->getMessage());
        }
    }
}
