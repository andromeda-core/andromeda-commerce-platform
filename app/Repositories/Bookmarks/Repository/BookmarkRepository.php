<?php

namespace App\Repositories\Bookmarks\Repository;

use App\Models\Bookmark;
use App\Repositories\Bookmarks\Interface\IBookmarkRepository;
use Exception;
use Illuminate\Http\Request;

class BookmarkRepository implements IBookmarkRepository
{
    public function __construct(
        private Bookmark $bookmark
    ) {}

    public function getAllBookmarks()
    {
        $bookmarks = $this->bookmark->with(['user', 'post'])->latest()->paginate(10);

        return $bookmarks;
    }

    public function toggleBookmark(Request $request)
    {

        $request->validate([
            'post_id' => 'required|exists:posts,id',
        ]);

        try {
            $user = $request->user();
            $post_id = $request->input('post_id');

            if ($user->bookMarkedPosts()->where('post_id', $post_id)->exists()) {
                $user->bookMarkedPosts()->detach($post_id);

                return [
                    'status' => true,
                    'message' => 'Post Removed Successfully from bookmarks',
                ];
            }

            $user->bookMarkedPosts()->attach($post_id);

            return [
                'status' => true,
                'message' => 'Post Added Successfully to bookmarks',
            ];

        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function destroyBookmark(string $id)
    {

        try {

            $bookmark = $this->bookmark->find($id);
            if (empty($bookmark)) {
                throw new Exception('Bookmark not found');
            }

            $deleted = $bookmark->delete();
            if (! $deleted) {
                throw new Exception('Something Went Wrong While Deleting Bookmark');
            }

            return [
                'status' => true,
                'message' => 'Bookmark deleted successfully',
            ];

        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function destroyBookmarkBySelection(Request $request)
    {

        try {

            $ids = $request->array('ids');

            if (blank($ids)) {
                throw new Exception('Please select at least one bookmark');
            }

            $deleted = $this->bookmark->destroy($ids);

            if ($deleted !== count($ids)) {
                throw new Exception('Something Went Wrong While Deleting Bookmark');
            }

            return [
                'status' => true,
                'message' => 'Bookmark deleted successfully',
            ];

        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function getBookmakrs(Request $request)
    {
        $user = $request->user();

        if (empty($user)) {
            return [
                'status' => false,
                'message' => 'User Not Found',
            ];
        }

        $bookmarks = $user->bookMarkedPosts()->with(['floor'])->latest()->paginate(10);

        return [
            'status' => true,
            'bookmarks' => $bookmarks->items(),
            'next_page_url' => $bookmarks->nextPageUrl(),
        ];

    }
}
