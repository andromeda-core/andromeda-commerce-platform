<?php

namespace App\Repositories\SmartphoneForSales\Interface;

use Illuminate\Http\Request;

interface ISmartphoneForSaleRepository
{
    public function getAllSmartphoneForSales(Request $request);

    public function getSingleSmartphoneForSale(string $id);

    public function storeSmartphoneForSale(Request $request);

    public function updateSmartphoneForSale(Request $request, string $id);

    public function destroySmartphoneForSale(string $id);

    public function destroySmartphoneForSaleBySelection(Request $request);

    public function getAllAdditionalFeeLists();

    public function getAllShippingFeeLists();

    public function getAllImportTaxFeeLists();
}
