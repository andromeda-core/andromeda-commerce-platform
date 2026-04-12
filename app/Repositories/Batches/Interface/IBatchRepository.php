<?php

namespace App\Repositories\Batches\Interface;

use Illuminate\Http\Request;

interface IBatchRepository
{
    public function getAllBatches(Request $request);

    public function getSingleBatch(string $id);

    public function getSingleFormatedBatchForEdit(string $id);

    public function storeBatch(Request $request);

    public function updateBatch(Request $request, string $id);

    public function destroyBatch(string $id);

    public function destroyBatchBySelection(Request $request);

    public function getSuppliers();
}
