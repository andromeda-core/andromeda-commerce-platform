<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Repositories\OrderAddressChangeRequest\Interface\IOrderAddressChangeRequestRepository;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Inertia\Inertia;

class OrderAddressChangeRequestController extends Controller implements HasMiddleware
{
    public static function middleware()
    {
        return [
            new Middleware('permission:Order Address Changes View', ['only' => 'index']),
            new Middleware('permission:Order Address Changes Edit', ['only' => 'edit']),
            new Middleware('permission:Order Address Changes Edit', ['only' => 'update']),
        ];
    }

    public function __construct(
        private IOrderAddressChangeRequestRepository $order_address_change_request
    ) {}

    public function index(Request $request)
    {
        $order_address_change_requests = $this->order_address_change_request->getAllOrderAddressChangeRequests($request);
        $status = $request->input('status');

        return Inertia::render('Dashboard/OrderAddressChangeRequests/index', compact('order_address_change_requests', 'status'));
    }

    public function edit(?string $id = null)
    {
        if (empty($id)) {
            return back()->with('error', 'Order Address Change Request Id Not Found');
        }

        $order_address_change_request = $this->order_address_change_request->getSingleOrderAddressChangeRequest($id);
        if (empty($order_address_change_request)) {
            return back()->with('error', 'Order Address Change Request Not Found');
        }

        return Inertia::render('Dashboard/OrderAddressChangeRequests/edit', compact('order_address_change_request'));
    }

    public function update(Request $request, ?string $id = null)
    {
        if (empty($id)) {
            return back()->with('error', 'Order Address Change Request Id Not Found');
        }

        $updated = $this->order_address_change_request->updateOrderAddressChangeRequest($request, $id);

        if ($updated['status'] === false) {
            return back()->with('error', $updated['message']);
        }

        return to_route('dashboard.order-address-change-requests.index')->with('success', $updated['message']);
    }
}
