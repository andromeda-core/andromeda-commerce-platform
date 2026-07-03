<?php

namespace App\Repositories\Commissions\LodgingDistributorCommissions\Interface;

use Illuminate\Http\Request;

interface ILodgingDistributorCommissionRepository
{
    public function getAllLodgingDistributorCommissions(Request $request);

    public function getSingleLodgingDistributorCommission(string $id);

    public function updateLodgingDistributorCommission(Request $request, string $id);

    public function destroyLodgingDistributorCommission(string $id);

    public function destroyLodgingDistributorCommissionBySelection(Request $request);
}
