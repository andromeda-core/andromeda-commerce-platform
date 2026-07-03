<?php

namespace App\Repositories\Commissions\LodgingPlatformCommissions\Interface;

use Illuminate\Http\Request;

interface ILodgingPlatformCommissionRepository
{
    public function getAllLodgingPlatformCommissions(Request $request);

    public function getSingleLodgingPlatformCommission(string $id);

    public function updateLodgingPlatformCommission(Request $request, string $id);

    public function destroyLodgingPlatformCommission(string $id);

    public function destroyLodgingPlatformCommissionBySelection(Request $request);
}
