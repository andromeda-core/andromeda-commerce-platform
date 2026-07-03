<?php

namespace App\Repositories\AccommodationOperators\Interface;

use Illuminate\Http\Request;

interface IAccommodationOperatorRepository
{
    public function getAllAccommodationOperators(Request $request);

    public function getSingleAccommodationOperator(string $id);

    public function storeAccommodationOperator(Request $request);

    public function updateAccommodationOperator(Request $request, string $id);

    public function destroyAccommodationOperator(string $id);

    public function destroyAccommodationOperatorBySelection(Request $request);
}
