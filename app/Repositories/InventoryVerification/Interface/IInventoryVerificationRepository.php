<?php

namespace App\Repositories\InventoryVerification\Interface;

use Illuminate\Http\Request;

interface IInventoryVerificationRepository
{
    public function getAllInventoryVerifications(Request $request);

    public function verifyInventory(Request $request, ?string $imei = null);

    public function storeInventoryVerification(Request $request);
}
