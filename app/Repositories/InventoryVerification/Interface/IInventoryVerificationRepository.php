<?php

namespace App\Repositories\InventoryVerification\Interface;

use Illuminate\Http\Request;

interface IInventoryVerificationRepository
{
    public function getAllInventoryVerifications(Request $request);

    public function verifyInventory(Request $request);

    public function storeInventoryVerification(Request $request);
}
