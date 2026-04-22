<?php

namespace App\Repositories\Products\Interface;

use Illuminate\Http\Request;

interface IProductsRepository
{
    // Smartphone
    public function getSingleSmartphone(Request $request, string $identifier);

    public function getSmartphonesForShop(Request $request);

    public function getAllSmartphoneTags(Request $request);

    public function filterCategories();
}
