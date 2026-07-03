<?php

namespace App\Repositories\AccommodationDistributors\Interface;

use Illuminate\Http\Request;

interface IAccommodationDistributorRepository
{
    public function getAllAccommodationDistributors(Request $request);

    public function getSingleAccommodationDistributor(string $id);

    public function storeAccommodationDistributor(Request $request);

    public function updateAccommodationDistributor(Request $request, string $id);

    public function destroyAccommodationDistributor(string $id);

    public function destroyAccommodationDistributorBySelection(Request $request);
}
