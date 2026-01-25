<?php

namespace App\Repositories\ShippingAddress\Repository;

use App\Helpers\Trans;
use App\Models\ShippingAddress;
use App\Repositories\ShippingAddress\Interface\IShippingAddressRepository;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ShippingAddressRepository implements IShippingAddressRepository
{
    public function __construct(
        private ShippingAddress $shipping_address,
        private Trans $trans,
    ) {}

    public function getShippingAddresses(Request $request)
    {
        $user = $request->user()->load(['customer', 'customer.shippingAddresses', 'customer.shippingAddresses.country']);

        if (empty($user)) {
            return [];
        }

        return $user?->customer?->shippingAddresses()?->latest()?->get() ?? [];

    }

    public function getSingleShippingAddress(Request $request, string $id)
    {
        $user = $request->user()->load('customer');

        if (! $user->customer) {
            return null;
        }

        $shippingAddress = $user->customer
            ->shippingAddresses()
            ->where('id', $id)
            ->first();

        if (! $shippingAddress) {
            return null;
        }

        return $shippingAddress;
    }

    public function storeShippingAddress(Request $request)
    {
        $validated_req = $request->validate([
            'name' => ['required', 'max:255', 'string'],
            'phone' => ['required', 'max:50'],
            'country_id' => ['required', 'exists:countries,id'],
            'state' => ['required', 'max:255', 'string'],
            'city' => ['required', 'max:255', 'string'],
            'postal_code' => ['required', 'max:255', 'string'],
            'address_line1' => ['required', 'max:255', 'string'],
            'address_line2' => ['nullable', 'max:255', 'string'],
        ],
            [
                'name.required' => $this->trans->get('Full name is required.'),
                'name.string' => $this->trans->get('Full name must be a valid text.'),
                'name.max' => $this->trans->get('Full name cannot exceed 255 characters.'),

                'phone.required' => $this->trans->get('Phone number is required.'),
                'phone.max' => $this->trans->get('Phone number cannot exceed 50 characters.'),

                'country_id.required' => $this->trans->get('Please select a country.'),
                'country_id.exists' => $this->trans->get('Selected country is invalid.'),

                'state.required' => $this->trans->get('State is required.'),
                'state.string' => $this->trans->get('State must be a valid text.'),
                'state.max' => $this->trans->get('State cannot exceed 255 characters.'),

                'city.required' => $this->trans->get('City is required.'),
                'city.string' => $this->trans->get('City must be a valid text.'),
                'city.max' => $this->trans->get('City cannot exceed 255 characters.'),

                'postal_code.required' => $this->trans->get('Postal code is required.'),
                'postal_code.string' => $this->trans->get('Postal code must be a valid text.'),
                'postal_code.max' => $this->trans->get('Postal code cannot exceed 255 characters.'),

                'address_line1.required' => $this->trans->get('Address line 1 is required.'),
                'address_line1.string' => $this->trans->get('Address line 1 must be a valid text.'),
                'address_line1.max' => $this->trans->get('Address line 1 cannot exceed 255 characters.'),

                'address_line2.string' => $this->trans->get('Address line 2 must be a valid text.'),
                'address_line2.max' => $this->trans->get('Address line 2 cannot exceed 255 characters.'),
            ]);

        try {
            $user = $request?->user()->load(['customer', 'customer.shippingAddresses']);

            if (empty($user)) {
                throw new Exception($this->trans->get('User Not Found'));
            }

            if (! $user->hasRole('Customer')) {
                throw new Exception($this->trans->get('Only Customers Can Create Shipping Address'));
            }

            if ($this->shipping_address->where('customer_id', $user->customer->id)->count() >= 2) {
                throw new Exception($this->trans->get('You Can Only Have 2 Shipping Address At a Time'));
            }

            $validated_req['customer_id'] = $user?->customer->id;

            if ($user->customer->shippingAddresses()->doesntExist()) {
                $validated_req['is_active'] = 1;
            }

            $created = $this->shipping_address->create($validated_req);

            if (empty($created)) {
                throw new Exception($this->trans->get('Failed to create shipping address.'));
            }

            return [
                'status' => true,
                'message' => $this->trans->get('Shipping address created successfully.'),
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }

    }

    public function updateShippingAddress(Request $request, string $id)
    {
        $validated_req = $request->validate([
            'name' => ['required', 'max:255', 'string'],
            'phone' => ['required', 'max:50'],
            'country_id' => ['required', 'exists:countries,id'],
            'state' => ['required', 'max:255', 'string'],
            'city' => ['required', 'max:255', 'string'],
            'postal_code' => ['required', 'max:255', 'string'],
            'address_line1' => ['required', 'max:255', 'string'],
            'address_line2' => ['nullable', 'max:255', 'string'],
        ],
            [
                'name.required' => $this->trans->get('Full name is required.'),
                'name.string' => $this->trans->get('Full name must be a valid text.'),
                'name.max' => $this->trans->get('Full name cannot exceed 255 characters.'),

                'phone.required' => $this->trans->get('Phone number is required.'),
                'phone.max' => $this->trans->get('Phone number cannot exceed 50 characters.'),

                'country_id.required' => $this->trans->get('Please select a country.'),
                'country_id.exists' => $this->trans->get('Selected country is invalid.'),

                'state.required' => $this->trans->get('State is required.'),
                'state.string' => $this->trans->get('State must be a valid text.'),
                'state.max' => $this->trans->get('State cannot exceed 255 characters.'),

                'city.required' => $this->trans->get('City is required.'),
                'city.string' => $this->trans->get('City must be a valid text.'),
                'city.max' => $this->trans->get('City cannot exceed 255 characters.'),

                'postal_code.required' => $this->trans->get('Postal code is required.'),
                'postal_code.string' => $this->trans->get('Postal code must be a valid text.'),
                'postal_code.max' => $this->trans->get('Postal code cannot exceed 255 characters.'),

                'address_line1.required' => $this->trans->get('Address line 1 is required.'),
                'address_line1.string' => $this->trans->get('Address line 1 must be a valid text.'),
                'address_line1.max' => $this->trans->get('Address line 1 cannot exceed 255 characters.'),

                'address_line2.string' => $this->trans->get('Address line 2 must be a valid text.'),
                'address_line2.max' => $this->trans->get('Address line 2 cannot exceed 255 characters.'),
            ]);
        try {

            $user = $request?->user();

            if (empty($user)) {
                throw new Exception($this->trans->get('User Not Found'));
            }

            if (! $user->hasRole('Customer')) {
                throw new Exception($this->trans->get('Only Customers Can Create Shipping Address'));
            }
            $shipping_address = $this->getSingleShippingAddress($request, $id);
            if (empty($shipping_address)) {
                throw new Exception($this->trans->get('Shipping address not found.'));
            }

            $updated = $shipping_address->update($validated_req);
            if (! $updated) {
                throw new Exception($this->trans->get('Failed to update shipping address.'));
            }

            return [
                'status' => true,
                'message' => $this->trans->get('Shipping address updated successfully.'),
            ];

        } catch (\Throwable $th) {
            return [
                'status' => false,
                'message' => $th->getMessage(),
            ];
        }
    }

    public function toggleShippingAddress(Request $request, string $id)
    {

        try {

            $user = $request?->user();

            if (empty($user)) {
                throw new Exception($this->trans->get('User Not Found'));
            }

            if (! $user->hasRole('Customer')) {
                throw new Exception($this->trans->get('Only Customers Can Create Shipping Address'));
            }

            $shipping_address = $this->getSingleShippingAddress($request, $id);
            if (empty($shipping_address)) {
                throw new Exception($this->trans->get('Shipping address not found.'));
            }
            DB::transaction(function () use ($shipping_address, $request) {
                $changed = $this->shipping_address->where('is_active', true)->where('customer_id', $request->user()->customer->id)->update(['is_active' => false]);
                $updated = $shipping_address->update(['is_active' => ! $shipping_address->is_active]);

                if (! $updated || ! $changed) {
                    throw new Exception($this->trans->get('Failed to toggle shipping address.'));
                }
            });

            return [
                'status' => true,
                'message' => $this->trans->get('Shipping address updated successfully.'),
            ];

        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function destroyShippingAddress(Request $request, string $id)
    {
        try {
            $user = $request->user();

            if (empty($user)) {
                throw new Exception($this->trans->get('User Not Found'));
            }

            if (! $user->hasRole('Customer')) {
                throw new Exception($this->trans->get('Only Customers Can Create Shipping Address'));
            }

            $shipping_address = $this->getSingleShippingAddress($request, $id);
            if (empty($shipping_address)) {
                throw new Exception($this->trans->get('Shipping address not found.'));
            }

            DB::transaction(function () use ($shipping_address, $user) {
                if ($shipping_address->is_active) {

                    $another_shipping_address = $this->shipping_address
                        ->where('customer_id', $user->customer->id)
                        ->where('id', '!=', $shipping_address->id)
                        ->first();

                    if (! empty($another_shipping_address)) {
                        $another_shipping_address->update([
                            'is_active' => true,
                        ]);
                    }
                }

                $deleted = $shipping_address->delete();
                if (! $deleted) {
                    throw new Exception($this->trans->get('Failed to delete shipping address.'));
                }
            });

            return [
                'status' => true,
                'message' => $this->trans->get('Shipping address deleted successfully.'),
            ];

        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function storeShippingAddressFromProfile(Request $request)
    {

        $validated_req = $request->validate([
            'name' => ['required', 'max:255', 'string'],
            'phone' => ['required', 'max:50'],
            'country_id' => ['required', 'exists:countries,id'],
            'state' => ['required', 'max:255', 'string'],
            'city' => ['required', 'max:255', 'string'],
            'postal_code' => ['required', 'max:255', 'string'],
            'address_line1' => ['required', 'max:255', 'string'],
            'address_line2' => ['nullable', 'max:255', 'string'],
        ],
            [
                'name.required' => $this->trans->get('Full name is required.'),
                'name.string' => $this->trans->get('Full name must be a valid text.'),
                'name.max' => $this->trans->get('Full name cannot exceed 255 characters.'),

                'phone.required' => $this->trans->get('Phone number is required.'),
                'phone.max' => $this->trans->get('Phone number cannot exceed 50 characters.'),

                'country_id.required' => $this->trans->get('Please select a country.'),
                'country_id.exists' => $this->trans->get('Selected country is invalid.'),

                'state.required' => $this->trans->get('State is required.'),
                'state.string' => $this->trans->get('State must be a valid text.'),
                'state.max' => $this->trans->get('State cannot exceed 255 characters.'),

                'city.required' => $this->trans->get('City is required.'),
                'city.string' => $this->trans->get('City must be a valid text.'),
                'city.max' => $this->trans->get('City cannot exceed 255 characters.'),

                'postal_code.required' => $this->trans->get('Postal code is required.'),
                'postal_code.string' => $this->trans->get('Postal code must be a valid text.'),
                'postal_code.max' => $this->trans->get('Postal code cannot exceed 255 characters.'),

                'address_line1.required' => $this->trans->get('Address line 1 is required.'),
                'address_line1.string' => $this->trans->get('Address line 1 must be a valid text.'),
                'address_line1.max' => $this->trans->get('Address line 1 cannot exceed 255 characters.'),

                'address_line2.string' => $this->trans->get('Address line 2 must be a valid text.'),
                'address_line2.max' => $this->trans->get('Address line 2 cannot exceed 255 characters.'),
            ]);

        try {
            $user = $request?->user()->load(['customer', 'customer.shippingAddresses']);

            if (empty($user)) {
                throw new Exception($this->trans->get('User Not Found'));
            }

            if (! $user->hasRole('Customer')) {
                throw new Exception($this->trans->get('Only Customers Can Create Shipping Address'));
            }

            if ($user->customer->shippingAddresses()->exists()) {
                throw new Exception($this->trans->get("You've Already Added Shipping Address From Your Profile"));
            }

            $validated_req['customer_id'] = $user?->customer->id;

            if ($user->customer->shippingAddresses()->doesntExist()) {
                $validated_req['is_active'] = 1;
            }

            $created = $this->shipping_address->create($validated_req);

            if (empty($created)) {
                throw new Exception($this->trans->get('Failed to Save shipping address.'));
            }

            return [
                'status' => true,
                'message' => $this->trans->get('Shipping address Saved successfully.'),
            ];

        } catch (\Throwable $th) {
            return [
                'status' => false,
                'message' => $th->getMessage(),
            ];
        }
    }
}
