<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Repositories\Bookmarks\Interface\IBookmarkRepository;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Inertia\Inertia;

class BookmarkController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware('permission:Bookmarks View', ['only' => 'index']),
            new Middleware('permission:Bookmarks View', ['only' => 'toggleBookmark']),
            new Middleware('permission:Bookmarks Delete', ['only' => 'destroy']),
            new Middleware('permission:Bookmarks Delete', ['only' => 'destroyBySelection']),
        ];
    }

    public function __construct(
        private IBookmarkRepository $bookmark
    ) {}

    public function index()
    {
        $bookmarks = $this->bookmark->getAllBookmarks();

        return Inertia::render('Dashboard/Bookmarks/index', compact('bookmarks'));
    }

    public function toggleBookmark(Request $request)
    {
        $toggled = $this->bookmark->toggleBookmark($request);

        if ($toggled['status'] === false) {
            return back()->with('error', $toggled['message']);
        }

        return back()->with('success', $toggled['message']);

    }

    public function destroy(?string $id = null)
    {
        if (empty($id)) {
            return back()->with('error', 'Bookmark ID Not found');
        }

        $deleted = $this->bookmark->destroyBookmark($id);

        if ($deleted['status'] === false) {
            return back()->with('error', $deleted['message']);
        }

        return back()->with('success', $deleted['message']);
    }

    public function destroyBySelection(Request $request)
    {

        $deleted = $this->bookmark->destroyBookmarkBySelection($request);

        if ($deleted['status'] === false) {
            return back()->with('error', $deleted['message']);
        }

        return back()->with('success', $deleted['message']);
    }
}
