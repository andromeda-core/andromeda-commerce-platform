<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Repositories\Orders\Interface\IOrderRepository;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SupplierAssignedOrderController extends Controller
{
    public function __construct(private IOrderRepository $order) {}

    public function index(Request $request)
    {

        $data = $this->order->supplierAssignedOrders($request);
        if ($data['status'] === false) {
            return back()->with('error', $data['message']);
        }

        $orders = isset($data['orders']) ? $data['orders'] : [];

        $status = $request->input('status');
        $search = $request->input('search');

        return Inertia::render('Dashboard/Suppliers/Orders/index', compact('orders', 'status', 'search'));
    }

    public function fulfillOrderIndex(Request $request, ?string $id = null)
    {
        $data = $this->order->fulfillOrderStockDetails($request, $id);

        if (isset($data['status']) && $data['status'] === false) {
            return back()->with('error', $data['message']);
        }

        return Inertia::render('Dashboard/Suppliers/Orders/FulfillOrder', [
            ...$data,
        ]);
    }

    public function fulfillOrder(Request $request, ?string $id = null)
    {
        $created = $this->order->fulfillOrderStock($request);

        if (isset($created['status']) && $created['status'] === false) {
            return back()->with('error', $created['message']);
        }

        return to_route('dashboard.supplier-assigned-orders.index')->with('success', $created['message']);
    }

    public function saveDraft(Request $request, ?string $id = null)
    {
        $saved = $this->order->fulfillOrdersaveDraft($request, $id);

        if (isset($saved['status']) && $saved['status'] === false) {
            return back()->with('error', $saved['message']);
        }

        return back()->with('success', $saved['message']);
    }

    public function addLog(Request $request, ?string $id = null)
    {
        $added = $this->order->addLogForAssignment($request, $id);

        if (isset($added['status']) && $added['status'] === false) {
            return back()->with('error', $added['message']);
        }

        return back()->with('success', $added['message']);
    }
}
