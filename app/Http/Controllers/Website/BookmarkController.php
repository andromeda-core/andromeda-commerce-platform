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

    public function index(Request $request)
    {
        $data = $this->bookmark->getBookmakrs($request);

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

        return Inertia::render('Website/Bookmarks/index', compact('posts', 'next_page_url'));
    }
}
