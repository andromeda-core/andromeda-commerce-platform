<?php

namespace App\Repositories\Products\Interface;

use Illuminate\Http\Request;

interface IProductsRepository
{
    // Smartphone
    public function getSingleSmartphone(Request $request, string $slug);
}
