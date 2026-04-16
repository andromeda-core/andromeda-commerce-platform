<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Repositories\Settings\Interface\ISettingRepository;
use App\Repositories\TranslationSystem\Language\Interface\ILanguageRepository;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Inertia\Inertia;

class LanguageController extends Controller implements HasMiddleware
{
    public static function middleware()
    {

        return [
            new Middleware('permission:Translation System View', ['only' => 'index']),
            new Middleware('permission:Translation System View', ['only' => 'create']),
            new Middleware('permission:Translation System View', ['only' => 'store']),
            new Middleware('permission:Translation System View', ['only' => 'edit']),
            new Middleware('permission:Translation System View', ['only' => 'update']),
            new Middleware('permission:Translation System View', ['only' => 'destroy']),
            new Middleware('permission:Translation System View', ['only' => 'destroyBySelection']),

        ];
    }

    public function __construct(
        private ILanguageRepository $language,
        private ISettingRepository $setting
    ) {}

    public function index()
    {
        $languages = $this->language->getAllLanguages();

        return Inertia::render('Dashboard/TranslationSystem/Languages/index', compact('languages'));
    }

    public function create()
    {
        $countries = $this->setting->getCountries(request());
        return Inertia::render('Dashboard/TranslationSystem/Languages/create', compact('countries'));
    }

    public function store(Request $request)
    {
        $created = $this->language->storeLanguage($request);

        if ($created['status'] === false) {
            return back()->with('error', $created['message']);
        }

        return to_route('dashboard.translation-system.languages.index')->with('success', $created['message']);
    }

    public function edit(string $id)
    {
        $language = $this->language->getSingleLanguageById($id);
        $countries = $this->setting->getCountries(request());
        if (empty($language)) {
            return to_route('dashboard.translation-system.languages.index')->with('error', 'Language Not Found');
        }

        return Inertia::render('Dashboard/TranslationSystem/Languages/edit', compact('language', 'countries'));
    }

    public function update(Request $request, string $id)
    {
        $updated = $this->language->updateLanguage($request, $id);

        if ($updated['status'] === false) {
            return back()->with('error', $updated['message']);
        }

        return to_route('dashboard.translation-system.languages.index')->with('success', $updated['message']);
    }

    public function destroy(string $id)
    {
        $deleted = $this->language->destroyLanguage($id);

        if ($deleted['status'] === false) {
            return back()->with('error', $deleted['message']);
        }

        return to_route('dashboard.translation-system.languages.index')->with('success', $deleted['message']);
    }

    public function destroyBySelection(Request $request)
    {
        $deleted = $this->language->destroyLanguageBySelection($request);

        if ($deleted['status'] === false) {
            return back()->with('error', $deleted['message']);
        }

        return to_route('dashboard.translation-system.languages.index')->with('success', $deleted['message']);
    }

    public function getAllLanguagesAndTranslationsJson(Request $request)
    {
        $data = $this->language->getAllLanguagesWithTranslationsWithoutPagination($request);

        return response()->json(['data' => $data], 200);
    }

    public function setLanguage(Request $request)
    {

        $set = $this->language->setLanguageLocale($request);

        if ($set['status'] === false) {
            return back()->with('error', $set['message']);
        }

        $cookieData = json_encode([
            'language_id' => $request->language_id,
            'language_locale' => $request->language_locale,
        ]);

        return back()
            ->withCookie(
                cookie('language', $cookieData, 525600, '/', null, false, false)
            );
    }
}
