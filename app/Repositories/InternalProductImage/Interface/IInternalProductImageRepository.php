<?php

namespace App\Repositories\InternalProductImage\Interface;

use Illuminate\Http\Request;

interface IInternalProductImageRepository
{
    public function getAllInternalProductImages(Request $request);
    public function getFolders();
    public function createFolder(Request $request): array;
    public function storeInternalProductImage(Request $request): array;
    public function destroyInternalProductImage(string $id): array;
    public function destroyInternalProductImageBySelection(Request $request): array;
}
