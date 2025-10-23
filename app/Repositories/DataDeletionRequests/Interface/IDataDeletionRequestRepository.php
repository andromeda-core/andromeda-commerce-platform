<?php

namespace App\Repositories\DataDeletionRequests\Interface;

use Illuminate\Http\Request;

interface IDataDeletionRequestRepository
{
    public function getAllDataDeletionRequests(Request $request);

    public function storeRequestAndDestroyAccount(Request $request);
}
