<?php

namespace App\Repositories\OrderCancelationRequest\Interface;

use Illuminate\Http\Request;

interface IOrderCancelationRequestRepository
{
    public function getAllRequests(Request $request);

    public function getSingleRequest(?string $id = null);

    public function storeRequest(Request $request);

    public function updateRequest(Request $request, ?string $id = null);

    public function canRequest(Request $request, ?string $order_no = null);

    public function withdrwalRequest(Request $request);
}
