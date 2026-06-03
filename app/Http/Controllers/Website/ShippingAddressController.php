<?php

namespace App\Http\Controllers\Website;

use App\Http\Controllers\Controller;
use App\Repositories\Customers\Interface\ICustomerRepository;
use App\Repositories\ShippingAddress\Interface\IShippingAddressRepository;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ShippingAddressController extends Controller
{
    public function __construct(
        private IShippingAddressRepository $shipping_address,
        private ICustomerRepository $customer,
    ) {}

    public function index(Request $request)
    {
        // Guided checkout flow: remember the "came from checkout" intent when the
        // customer arrives here from the checkout popup, and clear any stale intent
        // on direct/profile visits so the flow never leaks outside checkout.
        if ($request->query('from') === 'checkout') {
            $request->session()->put('return_to_checkout', true);
            $request->session()->put('return_to_checkout_buy_now', $request->boolean('buy_now'));
        } else {
            $request->session()->forget('return_to_checkout');
            $request->session()->forget('return_to_checkout_buy_now');
        }

        // One-shot signals set by store() after a checkout-flow save, used to show
        // the "Continue checkout" popup exactly once and to send the customer back
        // to the correct checkout context (cart vs buy-now).
        $show_continue_checkout = (bool) $request->session()->pull('show_continue_checkout', false);
        $continue_checkout_buy_now = (bool) $request->session()->pull('continue_checkout_buy_now', false);

        $shipping_addresses = $this->shipping_address->getShippingAddresses($request);

        $countries = $this->customer->getCountries();

        return Inertia::render('Website/ShippingAddress/index', compact('shipping_addresses', 'countries', 'show_continue_checkout', 'continue_checkout_buy_now'));
    }

    public function store(Request $request)
    {
        $created = $this->shipping_address->storeShippingAddress($request);

        if ($created['status'] === false) {
            return back()->with('error', $created['message']);
        }

        // When the address was saved through the guided checkout flow, send the
        // customer back to the (clean) shipping page and flag the one-shot
        // "Continue checkout" popup. Redirecting to a clean URL also clears the
        // intent via index() so it cannot leak into later, unrelated visits.
        if (! empty($created['from_checkout'])) {
            $redirect = to_route('website.shipping-addresses.index')

                ->with('show_continue_checkout', true);

            if ($request->session()->get('return_to_checkout_buy_now', false)) {
                $redirect->with('continue_checkout_buy_now', true);
            }

            return $redirect;
        }

        return back()->with('success', $created['message']);
    }

    public function toggleStatus(Request $request, string $id)
    {
        $updated = $this->shipping_address->toggleShippingAddress($request, $id);

        if ($updated['status'] === false) {
            return back()->with('error', $updated['message']);
        }

        return back()->with('success', $updated['message']);
    }

    public function update(Request $request, ?string $id = null)
    {
        $updated = $this->shipping_address->updateShippingAddress($request, $id);

        if ($updated['status'] === false) {
            return back()->with('error', $updated['message']);
        }

        return back()->with('success', $updated['message']);
    }

    public function destroy(Request $request, string $id)
    {
        $deleted = $this->shipping_address->destroyShippingAddress($request, $id);

        if ($deleted['status'] === false) {
            return back()->with('error', $deleted['message']);
        }

        return back()->with('success', $deleted['message']);
    }

    public function storeShippingAddressFromProfile(Request $request)
    {
        $created = $this->shipping_address->storeShippingAddressFromProfile($request);

        if ($created['status'] === false) {
            return back()->with('error', $created['message']);
        }

        // Mirror store(): when the profile address was used through the guided
        // checkout flow, send the customer back to the (clean) shipping page and
        // flag the one-shot "Continue checkout" popup. Redirecting to a clean URL
        // also clears the intent via index() so it cannot leak into later visits.
        if (! empty($created['from_checkout'])) {
            $redirect = to_route('website.shipping-addresses.index')
                ->with('show_continue_checkout', true);

            if ($request->session()->get('return_to_checkout_buy_now', false)) {
                $redirect->with('continue_checkout_buy_now', true);
            }

            return $redirect;
        }

        return back()->with('success', $created['message']);
    }
}
