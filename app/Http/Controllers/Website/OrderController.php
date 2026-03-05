<?php

namespace App\Http\Controllers\Website;

use App\Http\Controllers\Controller;
use App\Repositories\Cart\Interface\ICartRepository;
use App\Repositories\Customers\Interface\ICustomerRepository;
use App\Repositories\Orders\Interface\IOrderRepository;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OrderController extends Controller
{
    public function __construct(
        private IOrderRepository $order,
        private ICustomerRepository $customer,
        private ICartRepository $cart,
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

        $countries = $this->customer->getCountries();

        return Inertia::render('Website/Orders/show', compact('order', 'countries'));
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

        $order = $notExists['order'];

        return Inertia::render('Website/Orders/Refund/index', compact('order_no', 'order'));
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

    public function payNow(Request $request)
    {
        $response = $this->order->payNow($request);

        if ($response['status'] === false) {
            return back()->with('error', $response['message']);
        }

        return Inertia::location($response['redirect_url']);
    }

    public function addressChangeWithdrawl(Request $request)
    {
        $widthdrawl = $this->order->AddressChangeRequestWithdrawl($request);
        if ($widthdrawl['status'] === false) {
            return back()->with('error', $widthdrawl['message']);
        }

        return back()->with('success', $widthdrawl['message']);

    }

    public function refundWithdrawl(Request $request)
    {
        $widthdrawl = $this->order->RefundRequestWithdrawl($request);
        if ($widthdrawl['status'] === false) {
            return back()->with('error', $widthdrawl['message']);
        }

        return back()->with('success', $widthdrawl['message']);

    }

    public function reOrder(Request $request)
    {
        $reOrder_response = $this->order->reOrder($request);

        if ($reOrder_response['status'] === false) {
            return back()->with('error', $reOrder_response['message']);
        }

        $smartphones = $reOrder_response['smartphones'];

        $request->merge(['smartphones' => $smartphones]);

        $response = $this->cart->singleProductCheckoutSessionStore($request);

        if ($response['status'] === false) {
            return back()->with('error', $response['message']);
        }

        return to_route('website.checkout.index', ['buy_now' => true]);

    }

    public function verifyOrderProductIMEI(Request $request)
    {
        $response = $this->order->orderProductIMEIVerification($request);

        return response()->json($response);
    }
}
