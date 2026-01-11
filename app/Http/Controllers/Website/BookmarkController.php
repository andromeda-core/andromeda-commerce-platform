<?php

namespace App\Http\Controllers\Website;

use App\Http\Controllers\Controller;
use App\Repositories\Bookmarks\Interface\IBookmarkRepository;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BookmarkController extends Controller
{
    public function __construct(
        private IBookmarkRepository $bookmark
    ) {}

    public function index()
    {
        return Inertia::render('Website/Bookmarks/index');
    }

    public function getBookmarkedPosts(Request $request)
    {

        if (! $request->ajax()) {
            return to_route('home');
        }

        $data = $this->bookmark->getBookmarkedPosts($request);

        if ($data['status'] === false) {
            return to_route('home')->with('error', $data['message']);
        }

        $posts = $data['bookmarks'];
        $next_page_url = $data['next_page_url'];

        if ($request->expectsJson() && ! $request->header('X-Inertia')) {
            return response()->json([
                'posts' => $posts,
                'next_page_url' => $next_page_url,
            ], 200);
        }

    }

    public function destroyBookmark(Request $request)
    {
        $toggled = $this->bookmark->toggleBookmark($request);

        if ($toggled['status'] === false) {
            return back()->with('error', $toggled['message']);
        }

        return back();
    }
}
