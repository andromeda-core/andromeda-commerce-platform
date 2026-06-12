<?php

namespace App\Repositories\Lodging\Interface;

use Illuminate\Http\Request;

interface ILodgingProductRepository
{
    public function getAllLodgingProducts(Request $request);

    public function getSingleLodgingProduct(string $id);

    public function getCreateFormData();

    public function storeLodgingProduct(Request $request);

    public function updateLodgingProduct(Request $request, string $id);

    public function destroyLodgingProduct(string $id);

    public function destroyLodgingProductBySelection(Request $request);

    public function getGoogleMapSettings();

    public function autoCompleteLocations(Request $request);

    public function placeDetails(string $placeId);

    // Stage 3.2 — public feed integration (lodging as a third feed type).
    public function getLodgingProductsForFeed(int $page, int $perPage, bool $images = true, bool $videos = true, bool $text = true);

    public function getSingleLodgingForFeed(?string $public_id = null, ?string $slug = null);

    // Tag-based related lodging cards for cross-domain related lists (posts + smartphones inject this).
    public function getRelatedLodgingForFeed(array $tags, bool $images = true, bool $videos = true, bool $text = true, array $excludeSlugs = [], ?int $page = null, ?int $perPage = null, int $limit = 50);
}
