<?php

namespace App\Repositories\SmartphoneCountryPrice\Interface;

use Illuminate\Http\Request;

interface ISmartphoneCountryPriceRepository
{
    public function getAllSmartphoneCountryPrice();

    public function getSingleSmartphoneCountryPrice(?string $id = null);

    public function storeSmartphoneCountryPrice(Request $request);

    public function updateSmartphoneCountryPrice(Request $request, ?string $id = null);

    public function destroySmartphoneCountryPrice(?string $id = null);

    public function destroyBySelectionSmartphoneCountryPrice(Request $request);
}
