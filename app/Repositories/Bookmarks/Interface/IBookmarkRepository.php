<?php

namespace App\Repositories\Bookmarks\Interface;

use Illuminate\Http\Request;

interface IBookmarkRepository
{
    public function getAllBookmarks();

    public function toggleBookmark(Request $request);

    public function destroyBookmark(string $id);

    public function destroyBookmarkBySelection(Request $request);

    public function getBookmakrs(Request $request);
}
