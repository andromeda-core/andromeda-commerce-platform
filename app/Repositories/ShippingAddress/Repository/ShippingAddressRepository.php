<?php

namespace App\Repositories\ShippingAddress\Repository;

use App\Models\ShippingAddress;
use App\Repositories\ShippingAddress\Interface\IShippingAddressRepository;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ShippingAddressRepository implements IShippingAddressRepository
{
    public function __construct(
        private ShippingAddress $shipping_address
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
        ]);

        try {
            $user = $request?->user()->load(['customer', 'customer.shippingAddresses']);

            if (empty($user)) {
                throw new Exception('User Not Found');
            }

            if (! $user->hasRole('Customer')) {
                throw new Exception('Only Customers Can Create Shipping Address');
            }

            if ($this->shipping_address->where('customer_id', $user->customer->id)->count() >= 2) {
                throw new Exception('You Can Only Have 2 Shipping Address At a Time');
            }

            $validated_req['customer_id'] = $user?->customer->id;

            if ($user->customer->shippingAddresses()->doesntExist()) {
                $validated_req['is_active'] = 1;
            }

            $created = $this->shipping_address->create($validated_req);

            if (empty($created)) {
                throw new Exception('Failed to create shipping address.');
            }

            return [
                'status' => true,
                'message' => 'Shipping address created successfully.',
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
        ]);

        try {

            $user = $request?->user();

            if (empty($user)) {
                throw new Exception('User Not Found');
            }

            if (! $user->hasRole('Customer')) {
                throw new Exception('Only Customers Can Update Shipping Address');
            }

            $shipping_address = $this->getSingleShippingAddress($request, $id);
            if (empty($shipping_address)) {
                throw new Exception('Shipping address not found.');
            }

            $updated = $shipping_address->update($validated_req);
            if (! $updated) {
                throw new Exception('Failed to update shipping address.');
            }

            return [
                'status' => true,
                'message' => 'Shipping address updated successfully.',
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
                throw new Exception('User Not Found');
            }

            if (! $user->hasRole('Customer')) {
                throw new Exception('Only Customers Can Update Shipping Address');
            }

            $shipping_address = $this->getSingleShippingAddress($request, $id);
            if (empty($shipping_address)) {
                throw new Exception('Shipping address not found.');
            }

            DB::transaction(function () use ($shipping_address, $request) {
                $changed = $this->shipping_address->where('is_active', true)->where('customer_id', $request->user()->customer->id)->update(['is_active' => false]);
                $updated = $shipping_address->update(['is_active' => ! $shipping_address->is_active]);

                if (! $updated || ! $changed) {
                    throw new Exception('Failed to toggle shipping address.');
                }
            });

            return [
                'status' => true,
                'message' => 'Shipping address updated successfully.',
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
                throw new Exception('User Not Found');
            }

            if (! $user->hasRole('Customer')) {
                throw new Exception('Only Customers Can Update Shipping Address');
            }

            $shipping_address = $this->getSingleShippingAddress($request, $id);
            if (! $shipping_address) {
                throw new Exception('Shipping address not found.');
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
                    throw new Exception('Failed to delete shipping address.');
                }
            });

            return [
                'status' => true,
                'message' => 'Shipping address deleted successfully.',
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
        ]);

        try {
            $user = $request->user()->load(['customer', 'customer.shippingAddresses']);

            if (empty($user)) {
                throw new Exception('User Not Found');
            }

            if (! $user->hasRole('Customer')) {
                throw new Exception('Only Customers Can Save Shipping Address From Profile');
            }

            if ($user->customer->shippingAddresses()->exists()) {
                throw new Exception("You've Already Added Shipping Address From Your Profile");
            }

            $validated_req['customer_id'] = $user?->customer->id;

            if ($user->customer->shippingAddresses()->doesntExist()) {
                $validated_req['is_active'] = 1;
            }

            $created = $this->shipping_address->create($validated_req);

            if (empty($created)) {
                throw new Exception('Failed to Save shipping address.');
            }

            return [
                'status' => true,
                'message' => 'Shipping address Saved successfully.',
            ];

        } catch (\Throwable $th) {
            return [
                'status' => false,
                'message' => $th->getMessage(),
            ];
        }
    }
}
