<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Language;
use App\Repositories\AdBanners\Interface\IAdBannerRepository; // NEW: powers the "Add Ad Banner" picker in the post body editor
use App\Repositories\Floors\Interface\IFloorRepostitory;
use App\Repositories\Posts\Interface\IPostRepository;
use App\Services\AiTranslationService; // NEW (additive): reusable AI translation orchestrator
use Illuminate\Http\JsonResponse; // NEW (additive): return type for aiTranslateToEnglish
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Inertia\Inertia;

class PostController extends Controller implements HasMiddleware
{
    public static function middleware()
    {
        return [
            new Middleware('permission:Posts View', ['only' => 'index']),
            new Middleware('permission:Posts View', ['only' => 'show']),
            new Middleware('permission:Posts View', ['only' => 'toggleBookmark']),
            new Middleware('permission:Posts Create', ['only' => 'create']),
            new Middleware('permission:Posts Create', ['only' => 'store']),
            new Middleware('permission:Posts Edit', ['only' => 'edit']),
            new Middleware('permission:Posts Edit', ['only' => 'update']),
            new Middleware('permission:Posts Delete', ['only' => 'destroy']),
            new Middleware('permission:Posts Delete', ['only' => 'destroyBySelection']),

            // NEW (additive): AI translate endpoint gated by the SAME create/edit permissions
            // (pipe = OR in Spatie) plus a throttle using the existing throttle:N,1 convention.
            new Middleware('permission:Posts Create|Posts Edit', ['only' => 'aiTranslateField']),
            new Middleware('throttle:200,1', ['only' => 'aiTranslateField']),

            // NEW (additive): reverse (to-English) AI translate endpoint — SAME gating as
            // aiTranslateField above so the twin endpoints share permission + throttle.
            new Middleware('permission:Posts Create|Posts Edit', ['only' => 'aiTranslateToEnglish']),
            new Middleware('throttle:200,1', ['only' => 'aiTranslateToEnglish']),

        ];
    }

    public function __construct(
        private IPostRepository $post,
        private IFloorRepostitory $floor,
        private IAdBannerRepository $adBanner
    ) {}

    public function index(Request $request)
    {

        $posts = $this->post->getAllPosts($request);
        $postAuthors = $this->post->getPostAuthorsForFilter($request);
        $search = $request->input('search');
        $user_id = $request->input('user_id');

        // return $posts;

        return Inertia::render('Dashboard/Posts/index', compact('posts', 'postAuthors', 'search', 'user_id'));
    }

    public function create()
    {

        $floors = $this->floor->getAllWithoutPaginateFloors();
        $googleMapSettings = $this->post->getGoogleMapSettings();
        $languages = Language::where('code', '!=', config('app.fallback_locale', 'en'))->orderBy('name')->get(['id', 'name', 'code']);
        // NEW: feeds AddAdBannerButton's picker. Additive only — no existing Post field/behavior changes.
        $adBanners = $this->adBanner->getAllAdBannerNames();

        return Inertia::render('Dashboard/Posts/create', compact('floors', 'googleMapSettings', 'languages', 'adBanners'));
    }

    public function store(Request $request)
    {

        $created = $this->post->storePost($request);
        if ($created['status'] === false) {
            return back()->with('error', $created['message']);
        }

        return to_route('dashboard.posts.index')->with('success', $created['message']);
    }

    public function show(Request $request, ?string $slug = null)
    {

        if (empty($slug)) {
            return to_route('dashboard.posts.index')->with('error', 'Post Slug Not Found');
        }

        $post = $this->post->getSinglePostBySlug($slug, $request, isBackend: true);
        if (empty($post)) {
            return to_route('dashboard.posts.index')->with('error', 'Post Not Found');
        }

        return Inertia::render('Dashboard/Posts/show', compact('post'));
    }

    public function edit(Request $request, ?string $slug = null)
    {
        if (empty($slug)) {
            return to_route('dashboard.posts.index')->with('error', 'Post Slug Not Found');
        }

        $post = $this->post->getSinglePostBySlug($slug, $request, isBackend: true);

        if (empty($post)) {
            return to_route('dashboard.posts.index')->with('error', 'Post Not Found');
        }

        $floors = $this->floor->getAllWithoutPaginateFloors();
        $googleMapSettings = $this->post->getGoogleMapSettings();
        $languages = Language::where('code', '!=', config('app.fallback_locale', 'en'))->orderBy('name')->get(['id', 'name', 'code']);
        // NEW: feeds AddAdBannerButton's picker. Additive only — no existing Post field/behavior changes.
        $adBanners = $this->adBanner->getAllAdBannerNames();

        $post->load('contentTranslations');

        $existingTranslations = $post->contentTranslations
            ->groupBy('language_id')
            ->map(function ($rows, $languageId) {
                $fields = [];
                foreach ($rows as $row) {
                    if ($row->field === 'product_details') {
                        $decoded = json_decode($row->value, true);
                        $fields['product_details'] = is_array($decoded) ? $decoded : [];
                    } else {
                        $fields[$row->field] = $row->value;
                    }
                }

                return [
                    'language_id' => (int) $languageId,
                    'fields' => $fields,
                ];
            })
            ->values();

        return Inertia::render('Dashboard/Posts/edit', compact('post', 'floors', 'googleMapSettings', 'languages', 'existingTranslations', 'adBanners'));
    }

    public function update(Request $request, ?string $slug = null)
    {

        if (empty($slug)) {
            return back()->with('error', 'Post Slug Not Found');
        }

        $updated = $this->post->updatePost($request, $slug);

        if ($updated['status'] === false) {
            return back()->with('error', $updated['message']);
        }

        return to_route('dashboard.posts.index')->with('success', $updated['message']);
    }

    public function destroy(?string $id = null)
    {
        if (empty($id)) {
            return back()->with('error', 'Post ID Not Found');
        }

        $deleted = $this->post->destroyPost($id);

        if ($deleted['status'] === false) {
            return back()->with('error', $deleted['message']);
        }

        return back()->with('success', $deleted['message']);

    }

    public function destroyBySelection(Request $request)
    {
        $deleted = $this->post->destroyPostBySelection($request);

        if ($deleted['status'] === false) {
            return back()->with('error', $deleted['message']);
        }

        return back()->with('success', $deleted['message']);
    }

    public function googleLocationAutoComplete(Request $request)
    {

        $response = $this->post->autoCompleteLocations($request);

        if ($response['status'] === false) {
            return response()->json(['status' => false, 'message' => $response['message']], 400);
        }

        return response()->json(['status' => true, 'data' => $response['data']], 200);

    }

    public function googleLocationPlaceDetails(Request $request)
    {
        if (empty($request->input('place_id'))) {
            return response()->json(['status' => false, 'message' => 'Place ID Not Found'], 400);
        }

        $response = $this->post->placeDetails($request->input('place_id'));

        if ($response['status'] === false) {
            return response()->json(['status' => false, 'message' => $response['message']], 400);
        }

        return response()->json(['status' => true, 'data' => $response['data']], 200);
    }

    public function toggleBookmark(Request $request)
    {
        $toggled = $this->post->toggleBookmark($request);

        if ($toggled['status'] === false) {
            return back()->with('error', $toggled['message']);
        }

        return back();

    }

    // NEW (additive): pure AI translation generator. Returns translated text as JSON.
    // It NEVER writes content_translations; the manual repeater + syncTranslations save
    // path stay untouched. Protected via middleware() (Posts Create|Posts Edit + throttle).
    public function aiTranslateField(Request $request, AiTranslationService $translator)
    {
        $validated = $request->validate([
            'target_language_id' => ['required', 'integer', 'exists:languages,id'],
            'field' => ['required', 'string', 'in:title,content,tag,location_name'],
            // BUGFIX (Bug 3): was 'required'; allow empty so an accidental empty source
            // returns a safe success (status:true, value:'') instead of a 422 error.
            // FIX (422 size cap): was max:50000 -> 200000; raised to a sane 1000000 (~1MB) upper
            // bound so large HTML content is never rejected before translation (not removed).
            'value' => ['nullable', 'string', 'max:1000000'],
        ]);

        $result = $translator->translateField(
            field: $validated['field'],
            value: (string) ($validated['value'] ?? ''), // BUGFIX (Bug 3): coerce null/empty to ''
            targetLanguageId: (int) $validated['target_language_id'],
            allowedFields: ['title', 'content', 'tag', 'location_name'],
            htmlFields: ['content'], // Post content is RAW HTML
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

    // NEW (additive): reverse AI translation — translate a field's value INTO English.
    // Mirrors aiTranslateField() but with English hardcoded as the target (no target_language_id).
    // DEVIATION from the requested snippet: uses method injection for AiTranslationService exactly
    // like aiTranslateField() — this controller has no $this->translator property.
    public function aiTranslateToEnglish(Request $request, AiTranslationService $translator): JsonResponse
    {
        $validated = $request->validate([
            'field' => 'required|string|in:title,content,tag,location_name',
            'value' => 'required|string',
        ]);

        $result = $translator->translateFieldToEnglish(
            field: $validated['field'],
            value: (string) ($validated['value'] ?? ''),
            allowedFields: ['title', 'content', 'tag', 'location_name'],
            htmlFields: ['content'],
        );

        if (($result['status'] ?? false) !== true) {
            return response()->json([
                'status' => false,
                'message' => $result['message'] ?? 'Translation failed',
            ], 422);
        }

        return response()->json([
            'status' => true,
            'field' => $result['field'],
            'value' => $result['value'],
        ]);
    }
}
