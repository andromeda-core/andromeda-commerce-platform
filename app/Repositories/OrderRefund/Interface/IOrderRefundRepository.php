<?php

namespace App\Repositories\OrderRefund\Interface;

use Illuminate\Http\Request;

interface IOrderRefundRepository
{
    public function getAllOrderRefunds(Request $request);

    public function getSingleOrderRefund(string $id);

    public function updateOrderRefund(Request $request, string $id);

    public function uploadReturnTrackingSlip(Request $request, string $id);
}
