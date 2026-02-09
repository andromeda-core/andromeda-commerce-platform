<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Repositories\OrderCancelationRequest\Interface\IOrderCancelationRequestRepository;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Inertia\Inertia;

class OrderCancelationRequestController extends Controller implements HasMiddleware
{
    public static function middleware()
    {
        return [
            new Middleware('permission:Order Cancelations View', ['only' => 'index']),
            new Middleware('permission:Order Cancelations Edit', ['only' => 'edit']),
            new Middleware('permission:Order Cancelations Edit', ['only' => 'update']),
        ];
    }

    public function __construct(
        private IOrderCancelationRequestRepository $orderCancelationRequest
    ) {}

    public function index(Request $request)
    {
        $orderCancelationRequests = $this->orderCancelationRequest->getAllRequests($request);
        $status = $request->input('status');

        return Inertia::render('Dashboard/OrderCancelationRequest/index', compact('orderCancelationRequests', 'status'));
    }

    public function edit(?string $id = null)
    {
        if (empty($id)) {
            return to_route('dashboard.order-cancelation-requests.index');
        }

        $orderCancelationRequest = $this->orderCancelationRequest->getSingleRequest($id);

        return Inertia::render('Dashboard/OrderCancelationRequest/edit', compact('orderCancelationRequest'));
    }

    public function update(Request $request, ?string $id = null)
    {
        if (empty($id)) {
            return back()->with('error', 'Invalid Request');
        }

        $updated = $this->orderCancelationRequest->updateRequest($request, $id);

        if ($updated['status'] === false) {
            return back()->with('error', $updated['message']);
        }

        return to_route('dashboard.order-cancelation-requests.index')->with('success', 'Request Updated Successfully');

    }
}
