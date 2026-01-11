<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Repositories\TranslationSystem\TranslationKey\Interface\ITranslationKeyRepository;
use App\Repositories\TranslationSystem\Translations\Interface\ITranslationRepository;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Inertia\Inertia;

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
}
