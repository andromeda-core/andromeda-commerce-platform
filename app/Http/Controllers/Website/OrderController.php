<?php

namespace App\Http\Controllers\Website;

use App\Http\Controllers\Controller;
use App\Repositories\Customers\Interface\ICustomerRepository;
use App\Repositories\Orders\Interface\IOrderRepository;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OrderController extends Controller
{
    public function __construct(
        private IOrderRepository $order,
        private ICustomerRepository $customer
    ) {}

    public function index(Request $request)
    {

        $response = $this->order->getCustomerOrders($request);

        if ($request->ajax() && $request->expectsJson() && $response['status'] === false) {
            return response()->json(['status' => false, 'message' => $response['message']], 400);
        }

        if ($response['status'] === false) {
            return to_route('login');
        }

        $orders = $response['orders'];

        $next_page_url = $response['next_page_url'];

        if ($request->ajax() && $request->expectsJson()) {
            return response()->json(['status' => true, 'orders' => $orders, 'next_page_url' => $next_page_url], 200);
        }

        return Inertia::render('Website/Orders/index', compact('orders', 'next_page_url'));
    }

    public function show(Request $request, ?string $order_no = null)
    {
        if (empty($order_no)) {
            return to_route('website.orders.index');
        }

        $order = $this->order->getCustomerSingleOrder($request, $order_no);

        if (empty($order)) {
            return to_route('website.orders.index');
        }

        return Inertia::render('Website/Orders/show', compact('order'));
    }

    public function uploadPaymentProof(Request $request)
    {

        $response = $this->order->uploadPaymentProof($request);
        if ($response['status'] === false) {
            return back()->with('error', $response['message']);
        }

        return back()->with('success', $response['message']);

    }

    public function markPackagingVideoViewed(Request $request)
    {
        $response = $this->order->markPackagingVideoViewed($request);
        if ($response['status'] === false) {
            return response()->json(['status' => false, 'message' => $response['message']], 400);
        }

        return response()->json(['status' => true, 'message' => $response['message']], 200);
    }

    public function refundIndex(Request $request, ?string $order_no = null)
    {
        if (empty($order_no)) {
            return to_route('website.orders.index');
        }

        $notExists = $this->order->refundOrderDoesntExists($request, $order_no);

        if ($notExists['status'] === false) {
            return to_route('website.orders.order-view', ['order_no' => $order_no])->with('info', $notExists['message']);
        }

        return Inertia::render('Website/Orders/Refund/index', compact('order_no'));
    }

    public function refundRequestStore(Request $request, ?string $order_no = null)
    {
        $response = $this->order->refundRequestStore($request, $order_no);

        if ($response['status'] === false) {
            return back()->with('error', $response['message']);
        }

        return to_route('website.orders.order-view', ['order_no' => $order_no])->with('success', $response['message']);
    }

    public function shippingAddressChangeRequestIndex(Request $request, ?string $order_no = null)
    {
        if (empty($order_no)) {
            return to_route('website.orders.index');
        }

        $notExists = $this->order->orderAddressChangeRequestDoesntExists($request, $order_no);

        if ($notExists['status'] === false) {
            return to_route('website.orders.order-view', ['order_no' => $order_no])->with('info', $notExists['message']);
        }

        $countries = collect($this->customer->getCountries())
            ->map(fn ($country) => [
                'name' => $country->name,
            ])
            ->toArray();

        return Inertia::render('Website/Orders/ShippingAddressChangeRequest/index', compact('order_no', 'countries'));

    }

    public function shippingAddressChangeRequestStore(Request $request, ?string $order_no = null)
    {
        $response = $this->order->ShippingAddressChangeRequestStore($request, $order_no);

        if ($response['status'] === false) {
            return back()->with('error', $response['message']);
        }

        return to_route('website.orders.order-view', ['order_no' => $order_no])->with('success', $response['message']);
    }
}
