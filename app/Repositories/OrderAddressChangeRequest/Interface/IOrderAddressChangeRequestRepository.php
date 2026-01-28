<?php

namespace App\Repositories\OrderAddressChangeRequest\Interface;

use Illuminate\Http\Request;

interface IOrderAddressChangeRequestRepository
{
    public function getAllOrderAddressChangeRequests(Request $request);

    public function getSingleOrderAddressChangeRequest(string $id);

    public function updateOrderAddressChangeRequest(Request $request, string $id);
}
