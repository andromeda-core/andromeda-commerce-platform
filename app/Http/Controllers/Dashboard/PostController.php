<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Repositories\Floors\Interface\IFloorRepostitory;
use App\Repositories\Posts\Interface\IPostRepository;
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

        ];
    }

    public function __construct(
        private IPostRepository $post,
        private IFloorRepostitory $floor
    ) {}

    public function index(Request $request)
    {

        $posts = $this->post->getAllPosts($request);

        // return $posts;

        return Inertia::render('Dashboard/Posts/index', compact('posts'));
    }

    public function create()
    {

        $floors = $this->floor->getAllWithoutPaginateFloors();
        $googleMapSettings = $this->post->getGoogleMapSettings();

        return Inertia::render('Dashboard/Posts/create', compact('floors', 'googleMapSettings'));
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

        $post = $this->post->getSinglePostBySlug($slug, $request);

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

        $post = $this->post->getSinglePostBySlug($slug, $request);

        if (empty($post)) {
            return to_route('dashboard.posts.index')->with('error', 'Post Not Found');
        }

        $floors = $this->floor->getAllWithoutPaginateFloors();

        return Inertia::render('Dashboard/Posts/edit', compact('post', 'floors'));
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
}
