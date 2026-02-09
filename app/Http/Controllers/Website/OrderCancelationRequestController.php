<?php

namespace App\Http\Controllers\Website;

use App\Http\Controllers\Controller;
use App\Repositories\OrderCancelationRequest\Interface\IOrderCancelationRequestRepository;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OrderCancelationRequestController extends Controller
{
    public function __construct(
        private IOrderCancelationRequestRepository $orderCancelationRequest
    ) {}

    public function index(Request $request, ?string $order_no)
    {

        if (empty($order_no)) {
            return to_route('website.orders.index');
        }

        if (! $this->orderCancelationRequest->canRequest($request, $order_no)) {
            return to_route('website.orders.index');
        }

        return Inertia::render('Website/OrderCancelationRequest/index', compact('order_no'));
    }

    public function store(Request $request)
    {
        $created = $this->orderCancelationRequest->storeRequest($request);

        if ($created['status'] === false) {
            return back()->with('error', $created['message']);
        }

        return to_route('website.orders.index')->with('success', $created['message']);
    }

    public function widthdrawal(Request $request)
    {
        $withdrawled = $this->orderCancelationRequest->withdrwalRequest($request);

        if ($withdrawled['status'] === false) {
            return back()->with('error', $withdrawled['message']);
        }

        return to_route('website.orders.index')->with('success', $withdrawled['message']);
    }
}
