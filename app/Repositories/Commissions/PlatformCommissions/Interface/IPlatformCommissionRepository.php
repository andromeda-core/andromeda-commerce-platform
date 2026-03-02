<?php

namespace App\Repositories\Commissions\PlatformCommissions\Interface;

use Illuminate\Http\Request;

interface IPlatformCommissionRepository
{
    public function getAllPlatformCommissions(Request $request);

    public function getSinglePlatformCommission(string $id);

    public function updatePlatformCommission(Request $request, string $id);

    public function destroyPlatformCommission(string $id);

    public function destroyPlatformCommissionBySelection(Request $request);

    public function getAllCurrencies();
}
