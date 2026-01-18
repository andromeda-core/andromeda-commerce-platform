<?php

namespace App\Repositories\Products\Interface;

use Illuminate\Http\Request;

interface IProductsRepository
{
    // Smartphone
    public function getSingleSmartphone(Request $request, string $slug);

    public function getSmartphonesForShop(Request $request);

    public function getAllSmartphoneTags();

    public function filterCategories();
}
