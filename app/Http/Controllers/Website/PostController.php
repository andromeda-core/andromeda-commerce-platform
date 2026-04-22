<?php

namespace App\Http\Controllers\Website;

use App\Helpers\Trans;
use App\Http\Controllers\Controller;
use App\Repositories\GlobalSearch\Interface\IGlobalSearchRepository;
use App\Repositories\Posts\Interface\IPostRepository;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PostController extends Controller
{
    public function __construct(
        private IPostRepository $post,
        private IGlobalSearchRepository $globalSearch,
        private Trans $trans
    ) {}

    public function index(Request $request)
    {

        if ($request->header('X-Inertia')) {
            return to_route('home');
        }

        if ($request->ajax()) {
            $data = $this->post->getPostsAndProductsForWebsite($request);

            $posts = $data['data']['posts'];
            $products = $data['data']['products'];
            $next_page_url = $data['pagination']['next_page_url'];

            return response()->json([
                'status' => true,
                'posts' => $posts,
                'products' => $products,
                'next_page_url' => $next_page_url,
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

    public function getSinglePostBySlug(
        ?string $public_id = null,
        ?string $slug = null,
        Request $request
    ) {
        if (! $request->ajax()) {
            return to_route('home');
        }


        $identifier = $public_id ?? $slug;

        if (empty($identifier)) {
            return response()->json(['status' => false]);
        }

        $post = $this->post->getSinglePostBySlug($identifier, $request);

        if (empty($post)) {
            return response()->json(['status' => false]);
        }

        return response()->json(['status' => true, 'post' => $post]);
    }

    public function getRelated(Request $request, ?string $slug = null)
    {
        if (! $request->ajax()) {
            return to_route('home');
        }

        $slug = $slug ?? $request->query('slug');

        if (empty($slug)) {
            return response()->json(['status' => false, 'message' => $this->trans->get('Post Not Found')], 400);
        }

        $results = $this->post->getRelated($request, $slug);
        if ($results['status'] == false && isset($results['message'])) {
            return response()->json(['status' => false, 'message' => $results['message']], 400);
        }

        if ($results['status'] === false && isset($results['type']) && $results['type'] === 'nothing_found') {
            return response()->json(['status' => false, 'type' => 'nothing_found'], 200);
        }

        $nextUrl = $results['pagination']['next_page_url'];

        $relatedFeed = $results['data'];
        $related_slug = $results['slug'];

        return response()->json(['status' => true, 'results' => $relatedFeed, 'nextUrl' => $nextUrl, 'related_slug' => $related_slug], 200);
    }

    public function hashtagIndex(Request $request, ?string $hashtag = null)
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
            $preferences = [
                'text' => true,
                'images' => true,
                'videos' => true,
                'show_posts' => true,
                'show_products' => true
            ];
        }

        if (is_string($preferences)) {
            $decoded = json_decode($preferences, true);
            if (json_last_error() === JSON_ERROR_NONE) {
                $preferences = $decoded;
            }
        }

        $hashtag = $request->input('hashtag');

        if (empty($hashtag)) {
            return response()->json(['status' => false, 'message' => $this->trans->get('Hashtag Not Found')], 400);
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
