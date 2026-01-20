<?php

namespace App\Http\Controllers\Website;

use App\Http\Controllers\Controller;
use App\Repositories\Cart\Interface\ICartRepository;
use App\Repositories\Customers\Interface\ICustomerRepository;
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
        private ICustomerRepository $customer
    ) {}

    public function index(Request $request)
    {

        if (! $request->user()) {
            return to_route('login');
        }

        $data = $this->cart->getCartItems($request);
        $cart_items = $data['cart_items'];
        $addon_items = $data['addon_items'];
        $total_summary = $data['total_summary'];

        if (blank($cart_items)) {
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

        // Its For Strict  Checking The Referal Reward Point, If Cart item or quantity changes and  total_price changes but reward_points isnt so this method is for that purpose
        $refferalSessionData = $this->cart->updateCartRefferalSession(session()->get('referal_data'), $cart_items, $addon_items);

        $shipping_address = $request?->user()?->load(['customer', 'customer.shippingAddresses'])?->customer?->active_shipping_address;

        $is_eligible_for_social_message = $this->user->isCustomerEligableForSocialMessageSendOrReceive($request->user()->id);

        $countries = $this->customer->getCountries();

        return Inertia::render('Website/Checkout/index', compact('cart_items', 'total_summary', 'refferalSessionData', 'countries', 'shipping_address', 'meta_usernames', 'addon_items', 'is_eligible_for_social_message'));
    }

    public function store(Request $request)
    {

        $is_profile_completed = $this->user->profileCompletionCheck($request);

        if (! $is_profile_completed) {
            return response()->json(['message' => 'Please Complete Your Profile Before Placing An Order'], 400);
        }

        $is_email_verified = $this->user->hasVerifiedEmail($request);

        if ($is_email_verified['status'] === false) {
            return response()->json(['message' => $is_email_verified['message']], 400);
        }

        if (! $is_email_verified['hasVerifiedEmail']) {
            return response()->json(['message' => 'Please Verify Your Email Before Placing An Order'], 400);
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
