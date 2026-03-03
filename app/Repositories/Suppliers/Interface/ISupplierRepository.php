<?php

namespace App\Repositories\Suppliers\Interface;

use Illuminate\Http\Request;

interface ISupplierRepository
{
    public function getAllSuppliers(Request $request);

    public function getSingleSupplier(string $id);

    public function storeSupplier(Request $request);

    public function updateSupplier(Request $request, string $id);

    public function destroySupplier(string $id);

    public function destroySupplierBySelection(Request $request);

    public function getAllSuppliersWithoutPagination();
}
