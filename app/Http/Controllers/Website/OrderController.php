<?php

namespace App\Http\Controllers\Website;

use App\Http\Controllers\Controller;
use App\Repositories\Orders\Interface\IOrderRepository;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OrderController extends Controller
{
    public function __construct(
        private IOrderRepository $order
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

    public function show(?string $order_no = null)
    {
        if (empty($order_no)) {
            return to_route('website.orders.index');
        }

        $order = $this->order->getCustomerSingleOrder($order_no);

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
}
