<?php

namespace App\Repositories\Distributors\Interface;

use Illuminate\Http\Request;

interface IDistributorRepository
{
    public function getAllDistributors(Request $request);

    public function getSingleDistributor(string $id);

    public function storeDistributor(Request $request);

    public function updateDistributor(Request $request, string $id);

    public function destroyDistributor(string $id);

    public function destroyDistributorBySelection(Request $request);
}
