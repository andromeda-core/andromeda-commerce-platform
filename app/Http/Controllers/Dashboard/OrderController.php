<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Repositories\Orders\Interface\IOrderRepository;
use App\Repositories\PackageRecordings\Interface\IPackageRecordingsRepository;
use App\Repositories\Suppliers\Interface\ISupplierRepository;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Inertia\Inertia;

class OrderController extends Controller implements HasMiddleware
{
    public static function middleware()
    {
        return [
            new Middleware('permission:Orders View', ['only' => 'index']),
            new Middleware('permission:Orders View', ['only' => 'show']),
            // new Middleware('permission:Orders Create', ['only' => 'create']),
            new Middleware('permission:Orders Create', ['only' => 'store']),
            new Middleware('permission:Orders Edit', ['only' => 'edit']),
            new Middleware('permission:Orders Edit', ['only' => 'assignSupplierIndex']),
            new Middleware('permission:Orders Edit', ['only' => 'assignSupplier']),
            new Middleware('permission:Orders Edit', ['only' => 'orderCancelation']),
            new Middleware('permission:Orders Edit', ['only' => 'update']),
            new Middleware('permission:Orders Delete', ['only' => 'destroy']),
            new Middleware('permission:Orders Delete', ['only' => 'destroyBySelection']),
        ];
    }

    public function __construct(
        private IOrderRepository $order,
        private IPackageRecordingsRepository $package_recording,
        private ISupplierRepository $supplier
    ) {}

    public function index(Request $request)
    {
        $orders = $this->order->getAllOrders($request);
        $search = $request->input('search');
        $status = $request->input('status');

        return Inertia::render('Dashboard/Orders/index', compact('orders', 'search', 'status'));
    }

    public function create()
    {
        return back();

        $smartphones = $this->order->getSmartphones();
        $customers = $this->order->getCustomers();

        return Inertia::render('Dashboard/Orders/create', compact('smartphones', 'customers'));
    }

    // public function store(Request $request)
    // {
    //     $created = $this->order->storeOrder($request);

    //     if ($created['status'] === false) {
    //         return back()->with('error', $created['message']);
    //     }

    //     return to_route('dashboard.orders.index')->with('success', $created['message']);
    // }

    public function show(?string $id = null)
    {
        if (empty($id)) {
            return to_route('dashboard.orders.index')->with('error', 'Order Id not found');
        }

        $order = $this->order->getSingleOrder($id);

        if (empty($order)) {
            return to_route('dashboard.orders.index')->with('error', 'Order not found');
        }

        // return $order;

        return Inertia::render('Dashboard/Orders/show', compact('order'));
    }

    public function edit(?string $id = null)
    {
        if (empty($id)) {
            return to_route('dashboard.orders.index')->with('error', 'Order Id not found');
        }

        $order = $this->order->getSingleOrder($id);

        if (empty($order)) {
            return to_route('dashboard.orders.index')->with('error', 'Order not found');
        }

        if ($order->refund()->exists() && ($order?->refund?->refund_status !== 'withdrawn' && $order?->refund?->refund_status !== 'rejected')) {
            return back()->with('info', 'Order Refund Request Exists And This Order Cannot Be Edited');
        }

        if ($order->cancelationRequest()->exists()) {
            return back()->with('info', 'Order Cancelation Request Exists And This Order Cannot Be Edited');
        }

        if ($order->status === 'delivered' || $order->is_delivery_confirmed) {
            return back()->with('error', 'Already Completed Orders Cannot Be Edited');
        }

        if ($order->status === 'awaiting_payment') {
            return back()->with('error', 'Awaiting Payment Orders Cannot Be Edited');
        }

        if ($order->status === 'failed') {
            return back()->with('error', 'Failed Payment Orders Cannot Be Edited');
        }

        if ($order->status === 'expired') {
            return back()->with('error', 'Expired Payment Orders Cannot Be Edited');
        }

        $smartphones = $this->order->getSmartphones();
        $customers = $this->order->getCustomers();

        return Inertia::render('Dashboard/Orders/edit', compact('order', 'smartphones', 'customers'));
    }

    public function update(Request $request, ?string $id = null)
    {
        if (empty($id)) {
            return back()->with('error', 'Order Id not found');
        }
        $updated = $this->order->updateOrder($request, $id);

        if ($updated['status'] === false) {
            return back()->with('error', $updated['message']);
        }

        return to_route('dashboard.orders.index')->with('success', $updated['message']);
    }

    public function destroy(?string $id = null)
    {
        if (empty($id)) {
            return back()->with('error', 'Order Id not found');
        }

        $deleted = $this->order->destroyOrder($id);

        if ($deleted['status'] === false) {
            return back()->with('error', $deleted['message']);
        }

        return back()->with('success', $deleted['message']);
    }

    public function destroyBySelection(Request $request)
    {
        $deleted = $this->order->destroyOrderBySelection($request);

        if ($deleted['status'] === false) {
            return back()->with('error', $deleted['message']);
        }

        return back()->with('success', $deleted['message']);
    }

    public function updateCashCollectedStatus(?string $id = null)
    {

        if (empty($id)) {
            return back()->with('error', 'Order ID Not Found');
        }

        $updated = $this->order->updateCashCollectedStatus($id);

        if ($updated['status'] === false) {
            return back()->with('error', $updated['message']);
        }

        return back()->with('success', $updated['message']);
    }

    public function customerOrderInvoice(Request $request, ?string $order_no = null)
    {

        if (empty($order_no)) {
            return back()->with('info', 'Invoice No. Is Missing');
        }

        $response = $this->order->customerOrderInvoiceByOrderNo($request, $order_no);

        if ($response['status'] === false) {
            return to_route('home')->with('info', $response['message']);
        }

        $order = $response['order'];

        return Inertia::render('Dashboard/Orders/CustomerOrderInvoice', compact('order'));
    }

    public function shippingInvoice(Request $request, ?string $order_no = null)
    {
        if (empty($order_no)) {
            return back()->with('info', 'Invoice No. Is Missing');
        }

        $response = $this->order->ShippingOrderInvoice($request, $order_no);

        if ($response['status'] === false) {
            return back()->with('info', $response['message']);
        }

        $order = $response['order'];

        return Inertia::render('Dashboard/Orders/ShippingInvoice', compact('order'));
    }

    public function packageRecordingStore(Request $request)
    {
        $created = $this->package_recording->storePackageRecording($request);

        if ($created['status'] === false) {
            return back()->with('error', $created['message']);
        }

        return back()->with('success', $created['message']);
    }

    public function showByOrderNo(?string $order_no = null)
    {
        if (empty($order_no)) {
            return back()->with('error', 'Order No. Is Missing');
        }

        $order = $this->order->getSingleOrderByNo($order_no);

        if (empty($order)) {
            return back()->with('error', 'Order Not Found');
        }

        return Inertia::render('Dashboard/Orders/show', compact('order'));
    }

    public function assignSupplierIndex(?string $order_id = null)
    {
        if (empty($order_id)) {
            return to_route('dashboard.orders.index')->with('error', 'Order ID not found');
        }

        $suppliers = $this->supplier->getAllSuppliersWithoutPagination();

        return Inertia::render('Dashboard/Orders/assign-supplier', compact('suppliers', 'order_id'));
    }

    public function assignSupplier(Request $request)
    {
        $assigned = $this->order->assignSupplier($request);

        if ($assigned['status'] === false) {
            return back()->with('error', $assigned['message']);
        }

        return to_route('dashboard.orders.index')->with('success', $assigned['message']);

        return Inertia::render('Dashboard/Orders/assign-supplier', compact('suppliers'));
    }

    public function orderCancelation(Request $request)
    {
        $canceled = $this->order->orderCancelationByAdmin($request);

        if ($canceled['status'] === false) {
            return back()->with('error', $canceled['message']);
        }

        return back()->with('success', $canceled['message']);

    }

    public function orderSecondaryVerification(Request $request)
    {

        $response = $this->order->orderSecondaryVerification($request);

        return response()->json($response);
    }
}
