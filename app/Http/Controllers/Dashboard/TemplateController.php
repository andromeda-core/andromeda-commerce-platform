<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Language;
use App\Repositories\Templates\Interface\ITemplateRepository;
use App\Services\AiTranslationService; // NEW (Phase 2): reusable, domain-agnostic AI translation orchestrator
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Inertia\Inertia;

class TemplateController extends Controller implements HasMiddleware
{
    public static function middleware()
    {
        return [
            new Middleware('permission:Templates View', ['only' => 'index']),
            new Middleware('permission:Templates Create', ['only' => 'create']),
            new Middleware('permission:Templates Create', ['only' => 'store']),
            new Middleware('permission:Templates Edit', ['only' => 'edit']),
            new Middleware('permission:Templates Edit', ['only' => 'update']),
            new Middleware('permission:Templates Delete', ['only' => 'destroy']),
            new Middleware('permission:Templates Delete', ['only' => 'destroyBySelection']),

            // NEW (Phase 2): AI translate endpoint gated by the SAME create/edit permissions
            // (pipe = OR in Spatie) plus a throttle using the existing throttle:N,1 convention.
            new Middleware('permission:Templates Create|Templates Edit', ['only' => 'aiTranslateField']),
            new Middleware('throttle:200,1', ['only' => 'aiTranslateField']),
        ];
    }

    public function __construct(
        private ITemplateRepository $template
    ) {}

    public function index(Request $request)
    {
        $templates = $this->template->getAllTemplates($request);
        $search = $request->input('search');

        return Inertia::render('Dashboard/Templates/index', compact('templates', 'search'));
    }

    public function create()
    {
        $languages = Language::where('code', '!=', config('app.fallback_locale', 'en'))->orderBy('name')->get(['id', 'name', 'code']);

        return Inertia::render('Dashboard/Templates/create', compact('languages'));
    }

    public function store(Request $request)
    {
        $created = $this->template->storeTemplate($request);

        if ($created['status'] === false) {
            return back()->with('error', $created['message']);
        }

        return to_route('dashboard.templates.index')->with('success', $created['message']);
    }

    public function edit(?string $id = null)
    {
        if (empty($id)) {
            return to_route('dashboard.templates.index')->with('error', 'Template ID Not Found');
        }

        $result = $this->template->getSingleFormatedTemplateForEdit($id);

        if (empty($result)) {
            return to_route('dashboard.templates.index')->with('error', 'Template Not Found');
        }

        $template = $result['template'];
        $existingTranslations = $result['existingTranslations'];

        $languages = Language::where('code', '!=', config('app.fallback_locale', 'en'))->orderBy('name')->get(['id', 'name', 'code']);

        return Inertia::render('Dashboard/Templates/edit', compact('template', 'existingTranslations', 'languages'));
    }

    public function update(Request $request, ?string $id = null)
    {
        if (empty($id)) {
            return back()->with('error', 'Template ID Not Found');
        }

        $updated = $this->template->updateTemplate($request, $id);

        if ($updated['status'] === false) {
            return back()->with('error', $updated['message']);
        }

        return to_route('dashboard.templates.index')->with('success', $updated['message']);
    }

    public function destroy(?string $id = null)
    {
        if (empty($id)) {
            return back()->with('error', 'Template ID Not Found');
        }

        $deleted = $this->template->destroyTemplate($id);

        if ($deleted['status'] === false) {
            return back()->with('error', $deleted['message']);
        }

        return back()->with('success', $deleted['message']);
    }

    public function destroyBySelection(Request $request)
    {
        $deleted = $this->template->destroyTemplateBySelection($request);

        if ($deleted['status'] === false) {
            return back()->with('error', $deleted['message']);
        }

        return back()->with('success', $deleted['message']);
    }

    // NEW (Phase 2): pure AI translation generator. Returns translated text as JSON.
    // It NEVER writes template_translations; the manual repeater + TemplateTranslationService
    // save path stay untouched. Protected via middleware() (Templates Create|Templates Edit + throttle).
    public function aiTranslateField(Request $request, AiTranslationService $translator)
    {
        $validated = $request->validate([
            'target_language_id' => ['required', 'integer', 'exists:languages,id'],
            'field' => ['required', 'string', 'in:content'], // content only
            'value' => ['nullable', 'string', 'max:1000000'],
        ]);

        $result = $translator->translateField(
            field: $validated['field'],
            value: (string) ($validated['value'] ?? ''),
            targetLanguageId: (int) $validated['target_language_id'],
            allowedFields: ['content'],
            htmlFields: ['content'], // template content is RAW HTML -> DOM path
        );

        if (($result['status'] ?? false) !== true) {
            return response()->json(['status' => false, 'message' => $result['message'] ?? 'Translation failed'], 422);
        }

        return response()->json([
            'status' => true,
            'field' => $result['field'],
            'language_id' => $result['language_id'],
            'value' => $result['value'],
        ]);
    }
}
