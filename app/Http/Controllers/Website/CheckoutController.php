<?php

namespace App\Http\Controllers\Website;

use App\Helpers\Trans;
use App\Http\Controllers\Controller;
use App\Repositories\Cart\Interface\ICartRepository;
use App\Repositories\Customers\Interface\ICustomerRepository;
use App\Repositories\Orders\Interface\IOrderRepository;
use App\Repositories\ShippingAddress\Interface\IShippingAddressRepository;
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
        private ICustomerRepository $customer,
        private IShippingAddressRepository $shipping_address,
        private Trans $trans
    ) {}

    public function index(Request $request)
    {

        if (! $request->user()) {
            return to_route('login');
        }

        // dd(session('single_product_checkout_'.auth()->id())['cart_items']->pluck('unit_price', 'quantity'));

        // The customer is at checkout, so any pending "go add a shipping address and
        // come back" intent is resolved — clear it so it can't leak into later visits
        // (e.g. if they used the back button instead of saving the address).
        $request->session()->forget('return_to_checkout');
        $request->session()->forget('return_to_checkout_buy_now');

        $buy_now = $request->has('buy_now');

        $data = [];

        if ($buy_now) {
            $data = session()->get('single_product_checkout_'.$request->user()->id);
        } else {
            $data = $this->cart->getCartItems($request);
        }

        if (blank($data)) {
            return to_route('home');
        }

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

        // Country-based shipping/import are display-only here, resolved against the
        // active shipping address country. The cart/session totals are NOT mutated; we
        // only override the displayed shipping_fee / import_tax / total for checkout so
        // the page matches what the order will actually charge (order placement resolves
        // country-based shipping/import for both the cart and buy-now paths).
        if (! empty($shipping_address) && ! empty($shipping_address->country_id)) {
            $calc_cart_items = null;
            $calc_addon_items = null;

            if ($buy_now) {
                // Buy-now: the session cart_items are already Eloquent CartItem models
                // with smartphone.selling_info loaded, so they can be passed straight to
                // the calculator. countryShippings is not eager-loaded, but the resolver
                // falls back to a query when the relation is absent.
                $calc_cart_items = collect($data['cart_items'] ?? []);
                $calc_addon_items = collect($data['addon_items'] ?? []);


                // dd($calc_cart_items, $calc_addon_items);
            } else {
                // Regular cart: load fresh Eloquent collections (the page's $cart_items
                // may be transformed/serialized, so do not reuse them for calculation).
                $customer = $request->user()->customer;

                if (! empty($customer)) {
                    $calc_cart_items = \App\Models\CartItem::where('customer_id', $customer->id)
                        ->with([
                            'smartphone.selling_info',
                            'smartphone.selling_info.shipping_fee',
                            'smartphone.selling_info.import_tax',
                            'smartphone.selling_info.countryShippings',
                            'smartphone.selling_info.countryShippings.shippingFee',
                            'smartphone.selling_info.countryShippings.importTax',
                        ])
                        ->get();

                    $calc_addon_items = \App\Models\SmartphoneCartAddon::where('customer_id', $customer->id)->get();
                }
            }

            if (! empty($calc_cart_items) && $calc_cart_items->isNotEmpty()) {
                $recalculated = app(\App\Services\CartPriceCalculator::class)
                    ->calculate($calc_cart_items, $calc_addon_items ?? collect(), $shipping_address->country_id);


                // Override only the fee-related display fields; keep the rest of the
                // existing summary shape (items_total / cart_subtotal / addons_subtotal) intact.
                $total_summary['shipping_fee'] = $recalculated['shipping_fee'];
                $total_summary['import_tax'] = $recalculated['import_tax'];
                $total_summary['total'] = $recalculated['total'];
            }
        }

        $is_eligible_for_social_message = $this->user->isCustomerEligableForSocialMessageSendOrReceive($request->user()->id);

        $countries = $this->customer->getCountries();
        $shipping_addresses = $this->shipping_address->getShippingAddresses($request);

        return Inertia::render('Website/Checkout/index', compact('cart_items', 'total_summary', 'shipping_addresses', 'refferalSessionData', 'addon_items', 'buy_now', 'countries', 'shipping_address', 'meta_usernames', 'is_eligible_for_social_message'));
    }

    public function store(Request $request)
    {
        $is_profile_completed = $this->user->profileCompletionCheck($request);

        if (! $is_profile_completed) {
            return response()->json(['message' => $this->trans->get('Please Complete Your Profile Before Placing An Order')], 400);
        }

        $is_email_verified = $this->user->hasVerifiedEmail($request);

        if ($is_email_verified['status'] === false) {
            return response()->json(['message' => $is_email_verified['message']], 400);
        }

        if (! $is_email_verified['hasVerifiedEmail']) {
            return response()->json(['message' => $this->trans->get('Please Verify Your Email Before Placing An Order')], 400);
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

        return to_route('website.orders.order-view', ['order_no' => $request->order_no])->with('success', $this->trans->get('Thank you! Your payment has been submitted. We’ll confirm it automatically once the blockchain confirms your transaction.'));
    }

    public function singleProductCheckoutSessionStore(Request $request)
    {
        $response = $this->cart->singleProductCheckoutSessionStore($request);
        if ($response['status'] === false) {
            return response()->json(['status' => false, 'message' => $response['message']], 400);
        }

        return response()->json(['status' => true, 'message' => $response['message']], 200);
    }
}
