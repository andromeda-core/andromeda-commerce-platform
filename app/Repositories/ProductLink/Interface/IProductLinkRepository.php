<?php

namespace App\Repositories\ProductLink\Interface;

use Illuminate\Http\Request;

interface IProductLinkRepository
{
    public function getAllProductLinks(Request $request);
    public function getSingleProductLink(string $id);
    public function storeProductLink(Request $request);
    public function updateProductLink(Request $request, string $id);
    public function destroyProductLink(string $id);
    public function destroyProductLinkBySelection(Request $request);
}
