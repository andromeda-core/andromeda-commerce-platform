<?php

namespace App\Repositories\InternalProductVideos\Interface;

use Illuminate\Http\Request;

interface IInternalProductVideoRepository
{
    public function getAllInternalProductVideos(Request $request);
    public function getFolders();
    public function createFolder(Request $request): array;
    public function storeInternalProductVideo(Request $request): array;
    public function destroyInternalProductVideo(string $id): array;
    public function destroyInternalProductVideoBySelection(Request $request): array;
}
