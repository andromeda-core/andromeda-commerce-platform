<?php

namespace App\Http\Controllers\Website;

use App\Http\Controllers\Controller;
use App\Repositories\Cart\Interface\ICartRepository;
use App\Repositories\Orders\Interface\IOrderRepository;
use App\Repositories\Users\Interface\IUserRepository;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class CheckoutController extends Controller
{
    public function __construct(
        private ICartRepository $cart,
        private IUserRepository $user,
        private IOrderRepository $order,
    ) {}

    public function index(Request $request)
    {

        $data = $this->cart->getCartItems($request);
        $cart_items = $data['cart_items'];

        if (empty($cart_items)) {
            return to_route('home');
        }
        $meta_usernames = [];
        $meta_setting = Cache::get('meta_setting');

        if (! empty($meta_setting)) {
            $meta_usernames = [
                'fb_page_username' => $meta_setting->meta_fb_page_username,
                'ig_username' => $meta_setting->meta_ig_username,
            ];
        }

        $refferalSessionData = session()->get('referal_data');

        $raw_customer = $this->user->getSingleCustomer($request->user()->id);

        $customer = [
            'name' => $raw_customer?->name,
            'email' => $raw_customer?->email,
            'phone' => $raw_customer?->phone,
            'address' => $raw_customer?->customer?->address_line1.' '.$raw_customer?->customer?->address_line2,
            'city' => $raw_customer?->customer?->city,
            'state' => $raw_customer?->customer?->state,
            'postal_code' => $raw_customer?->customer?->postal_code,
            'country' => $raw_customer?->customer?->country?->name,

        ];

        $is_eligible_for_social_message = $this->user->isCustomerEligableForSocialMessageSendOrReceive($request->user()->id);

        return Inertia::render('Website/Checkout/index', compact('cart_items', 'refferalSessionData', 'customer', 'meta_usernames', 'is_eligible_for_social_message'));
    }

    public function store(Request $request)
    {

        $is_profile_completed = $this->user->profileCompletionCheck($request);

        if (! $is_profile_completed) {
            return response()->json(['message' => 'Please Complete Your Profile Before Placing An Order'], 400);
        }

        $response = $this->order->placeOrderFromWebsite($request);

        if ($response['status'] === false) {
            return response()->json(['status' => false, 'message' => $response['message']], 400);
        }

        $this->cart->removeReferal($request);

        return response()->json([
            'status' => true,
            'type' => $response['type'],
            'message' => $response['message'],
            'redirect_uri' => $response['redirect_uri'],
        ], 200);

    }

    public function cryptoPaymentSuccess(Request $request)
    {
        $response = $this->order->cryptoPaymentSuccess($request);

        if ($response['status'] === false) {
            return to_route('website.checkout.index')->with('error', $response['message']);
        }

        $this->cart->removeReferal($request);

        return to_route('website.orders.order-view', ['order_no' => $request->order_no])->with('success', 'Thank you! Your payment has been submitted. We’ll confirm it automatically once the blockchain confirms your transaction.');
    }
}
