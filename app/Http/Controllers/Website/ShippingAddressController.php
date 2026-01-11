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
        $shipping_addresses = $this->shipping_address->getShippingAddresses($request);

        $countries = $this->customer->getCountries();

        return Inertia::render('Website/ShippingAddress/index', compact('shipping_addresses', 'countries'));
    }

    public function store(Request $request)
    {
        $created = $this->shipping_address->storeShippingAddress($request);

        if ($created['status'] === false) {
            return back()->with('error', $created['message']);
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

        return back()->with('success', $created['message']);
    }
}
