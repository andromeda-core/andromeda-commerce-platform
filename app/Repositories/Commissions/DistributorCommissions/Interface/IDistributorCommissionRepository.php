<?php

namespace App\Repositories\Commissions\DistributorCommissions\Interface;

use Illuminate\Http\Request;

interface IDistributorCommissionRepository
{
    public function getAllDistributorCommissions(Request $request);

    public function getSingleDistributorCommission(string $id);

    public function updateDistributorCommission(Request $request, string $id);

    public function destroyDistributorCommission(string $id);

    public function destroyDistributorCommissionBySelection(Request $request);
}
