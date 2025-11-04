<?php

namespace App\Repositories\Inventories\Interface;

use Illuminate\Http\Request;

interface IInventoryRepository
{
    public function getAllInventory(Request $request);

    public function getSingleInventory(string $id);

    public function storeInventory(Request $request);

    public function updateInventory(Request $request, string $id);

    public function destroyInventory(string $id);

    public function destroyInventoryBySelection(Request $request);

    public function getBatches();

    public function getStorageLocations();

    public function getSmartPhoneByUpc(string $upc);

    public function getSmartphones();
}
