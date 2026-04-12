<?php

namespace App\Repositories\Commissions\SupplierCommissions\Interface;

use Illuminate\Http\Request;

interface ISupplierCommissionRepository
{
    public function getAllSupplierCommissions(Request $request);

    public function getSingleSupplierCommission(string $id);

    public function updateSupplierCommission(Request $request, string $id);

    public function destroySupplierCommission(string $id);

    public function destroySupplierCommissionBySelection(Request $request);
}
