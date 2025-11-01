<?php

namespace App\Http\Controllers\Website;

use App\Http\Controllers\Controller;
use App\Repositories\GlobalSearch\Repository\GlobalSearchRepository;
use App\Repositories\Posts\Interface\IPostRepository;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PostController extends Controller
{
    public function __construct(
        private IPostRepository $post,
        private GlobalSearchRepository $globalSearch,
    ) {}

    public function index(Request $request)
    {

        if ($request->header('X-Inertia')) {
            return to_route('home');
        }

        if ($request->ajax()) {
            $data = $this->post->getPostsForWebsite($request);

            $posts = $data['data']['posts'];
            $products = $data['data']['products'];
            $next_page_url = $data['pagination']['next_page_url'];
            $has_more_smartphones = $data['pagination']['has_more_smartphones'];

            return response()->json([
                'status' => true,
                'posts' => $posts,
                'products' => $products,
                'next_page_url' => $next_page_url,
                'has_more_smartphones' => $has_more_smartphones,
            ]);
        }

        return to_route('home');
    }

    // public function getMorePosts(Request $request)
    // {

    //     if (! $request->has('page')) {
    //         return back();
    //     }

    //     $posts = $this->post->getInfinityScrollablePostsForWebsite($request);

    //     return response()->json([
    //         'status' => true,
    //         'posts' => $posts['posts'],
    //         'next_page_url' => $posts['next_page_url'],
    //     ]);
    // }

    public function bookmark(Request $request)
    {
        $bookmarked = $this->post->toggleBookmark($request);

        if ($bookmarked['status'] === false) {
            return back()->with('error', $bookmarked['message']);
        }

        return back();
    }

    public function getSinglePostBySlug(?string $slug, Request $request)
    {
        if (! $request->ajax()) {
            return to_route('home');
        }

        if (empty($slug)) {
            return response()->json(['status' => false]);
        }

        $post = $this->post->getSinglePostBySlug($slug, $request);
        // info($slug);

        if (empty($post)) {
            return response()->json(['status' => false]);
        }

        return response()->json(['status' => true, 'post' => $post]);
    }

    public function getRelatedPosts(Request $request, ?string $slug = null)
    {
        if (! $request->ajax()) {
            return to_route('home');
        }

        $slug = $slug ?? $request->query('slug');

        if (empty($slug)) {
            return response()->json(['status' => false, 'message' => 'Post Not Found'], 400);

        }

        $posts = $this->post->getRelatedPosts($request, $slug);
        if ($posts['status'] == false) {
            return response()->json(['status' => false, 'message' => $posts['message']], 400);
        }

        return response()->json(['status' => true, 'posts' => $posts['related_posts']], 200);
    }

    public function hashtagIndex(?string $hashtag = null)
    {

        if (empty($hashtag)) {
            return to_route('home')->with('info', 'Hashtag Not Found');
        }
        $google_map_api_key = $this->globalSearch->getGoogleMapApiKey();

        return Inertia::render('Website/Home/hashtagPosts', compact('hashtag', 'google_map_api_key'));
    }

    public function hashtagResults(Request $request)
    {

        $preferences = $request->input('post_preferences');

        if (empty($preferences)) {
            $preferences = ['text' => true, 'images' => true, 'videos' => true, 'show_posts' => true,
                'show_products' => true];
        }

        if (is_string($preferences)) {
            $decoded = json_decode($preferences, true);
            if (json_last_error() === JSON_ERROR_NONE) {
                $preferences = $decoded;
            }
        }

        $hashtag = $request->input('hashtag');

        if (empty($hashtag)) {
            return response()->json(['status' => false, 'message' => 'Hashtag Not Found'], 400);
        }

        $data = $this->post->hashtagResults($request, $hashtag, $preferences);

        if ($data['status'] === false) {
            return response()->json([
                'status' => false,
                'message' => $data['message'],
            ], 400);
        }

        $posts = $data['data']['posts'];
        $smartphones = $data['data']['products']['smartphones'];

        $results = collect($posts)->merge($smartphones);
        $next_page_url = $data['pagination']['next_page_url'];

        return response()->json([
            'status' => true,
            'backend_retuned_results' => $results,
            'backend_retuned_next_page_url' => $next_page_url,
        ]);

        return Inertia::render('Website/Home/hashtagPosts', compact('results', 'next_page_url', 'hashtag'));

    }
}
