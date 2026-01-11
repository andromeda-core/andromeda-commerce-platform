<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Repositories\TranslationSystem\TranslationKey\Interface\ITranslationKeyRepository;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Inertia\Inertia;

class TranslationKeyController extends Controller implements HasMiddleware
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
        private ITranslationKeyRepository $translation_key
    ) {}

    public function index()
    {
        $translation_keys = $this->translation_key->getAllTranslationKeys();

        return Inertia::render('Dashboard/TranslationSystem/TranslationKeys/index', compact('translation_keys'));
    }

    public function create()
    {
        return Inertia::render('Dashboard/TranslationSystem/TranslationKeys/create');
    }

    public function store(Request $request)
    {
        $created = $this->translation_key->storeTranslationKey($request);

        if ($created['status'] === false) {
            return back()->with('error', $created['message']);
        }

        return to_route('dashboard.translation-system.translation-keys.index')->with('success', $created['message']);
    }

    public function edit(string $id)
    {
        $translation_key = $this->translation_key->getSingleTranslationKey($id);
        if (empty($translation_key)) {
            return to_route('dashboard.translation-system.translation-keys.index')->with('error', 'Translation Key Not Found');
        }

        return Inertia::render('Dashboard/TranslationSystem/TranslationKeys/edit', compact('translation_key'));
    }

    public function update(Request $request, string $id)
    {
        $updated = $this->translation_key->updateTranslationKey($request, $id);

        if ($updated['status'] === false) {
            return back()->with('error', $updated['message']);
        }

        return to_route('dashboard.translation-system.translation-keys.index')->with('success', $updated['message']);
    }

    public function destroy(string $id)
    {
        $deleted = $this->translation_key->destroyTranslationKey($id);

        if ($deleted['status'] === false) {
            return back()->with('error', $deleted['message']);
        }

        return to_route('dashboard.translation-system.translation-keys.index')->with('success', $deleted['message']);
    }

    public function destroyBySelection(Request $request)
    {
        $deleted = $this->translation_key->destroyTranslationKeysBySelection($request);

        if ($deleted['status'] === false) {
            return back()->with('error', $deleted['message']);
        }

        return to_route('dashboard.translation-system.translation-keys.index')->with('success', $deleted['message']);
    }
}
