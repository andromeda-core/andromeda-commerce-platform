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
}
