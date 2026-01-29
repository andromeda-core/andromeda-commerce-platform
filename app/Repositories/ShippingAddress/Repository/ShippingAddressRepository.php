<?php

namespace App\Repositories\ShippingAddress\Repository;

use App\Helpers\Trans;
use App\Models\ShippingAddress;
use App\Models\ShippingAddressChangeLog;
use App\Notifications\ShippingAddressChangeNotification;
use App\Repositories\ShippingAddress\Interface\IShippingAddressRepository;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ShippingAddressRepository implements IShippingAddressRepository
{
    public function __construct(
        private ShippingAddress $shipping_address,
        private Trans $trans,
        private ShippingAddressChangeLog $shipping_address_change_log
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

        DB::beginTransaction();
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

            $ip = $request->ip();
            $user_agent = $request->userAgent();
            $this->shipping_address_change_log->create([
                'ip_address' => $ip,
                'user_agent' => $user_agent,
                'user_id' => $user->id,
                'old_shipping_address' => null,
                'new_shipping_address' => $validated_req,
            ]);

            $created = $this->shipping_address->create($validated_req);

            if (empty($created)) {
                throw new Exception($this->trans->get('Failed to create shipping address.'));
            }

            DB::commit();

            $user->notify(new ShippingAddressChangeNotification(
                'created',
                $ip,
                $user_agent
            ));

            return [
                'status' => true,
                'message' => $this->trans->get('Shipping address created successfully.'),
            ];
        } catch (Exception $e) {
            DB::rollBack();

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

        DB::beginTransaction();
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

            $ip = $request->ip();
            $user_agent = $request->userAgent();
            $this->shipping_address_change_log->create([
                'ip_address' => $ip,
                'user_agent' => $user_agent,
                'user_id' => $user->id,
                'old_shipping_address' => $shipping_address->toArray(),
                'new_shipping_address' => $validated_req,
            ]);

            $updated = $shipping_address->update($validated_req);
            if (! $updated) {
                throw new Exception($this->trans->get('Failed to update shipping address.'));
            }

            DB::commit();

            $user->notify(new ShippingAddressChangeNotification(
                'updated',
                $ip,
                $user_agent
            ));

            return [
                'status' => true,
                'message' => $this->trans->get('Shipping address updated successfully.'),
            ];

        } catch (Exception $e) {
            DB::rollBack();

            return [
                'status' => false,
                'message' => $e->getMessage(),
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

            $ip = $request->ip();
            $user_agent = $request->userAgent();
            DB::transaction(function () use ($shipping_address, $user_agent, $ip, $user) {

                $oldActive = $this->shipping_address
                    ->where('customer_id', $user->customer->id)
                    ->where('is_active', true)
                    ->first();

                $this->shipping_address
                    ->where('customer_id', $user->customer->id)
                    ->update(['is_active' => false]);

                // Activate selected
                $shipping_address->update(['is_active' => true]);

                $this->shipping_address_change_log->create([
                    'user_id' => $user->id,
                    'ip_address' => $ip,
                    'user_agent' => $user_agent,
                    'old_shipping_address' => $oldActive?->toArray(),
                    'new_shipping_address' => $shipping_address->fresh()->toArray(),
                ]);

            });

            $user->notify(new ShippingAddressChangeNotification(
                'activated',
                $ip,
                $user_agent
            ));

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

            $ip = $request->ip();
            $user_agent = $request->userAgent();
            $another = null;
            DB::transaction(function () use ($shipping_address, $user, $ip, $user_agent, &$another) {

                $oldAddress = $shipping_address->toArray();

                if ($shipping_address->is_active) {
                    $another = $this->shipping_address
                        ->where('customer_id', $user->customer->id)
                        ->where('id', '!=', $shipping_address->id)
                        ->first();

                    if ($another) {
                        $another->update(['is_active' => true]);
                    }
                }

                $shipping_address->delete();

                $this->shipping_address_change_log->create([
                    'user_id' => $user->id,
                    'ip_address' => $ip,
                    'user_agent' => $user_agent,
                    'old_shipping_address' => $oldAddress,
                    'new_shipping_address' => ! empty($another) ? $another->toArray() : null,
                ]);
            });

            $user->notify(new ShippingAddressChangeNotification(
                'deleted',
                $ip,
                $user_agent
            ));

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

        DB::beginTransaction();
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

            $ip = $request->ip();
            $user_agent = $request->userAgent();
            $this->shipping_address_change_log->create([
                'ip_address' => $ip,
                'user_agent' => $user_agent,
                'user_id' => $user->id,
                'old_shipping_address' => null,
                'new_shipping_address' => $validated_req,
            ]);

            $created = $this->shipping_address->create($validated_req);

            if (empty($created)) {
                throw new Exception($this->trans->get('Failed to Save shipping address.'));
            }

            DB::commit();

            $user->notify(new ShippingAddressChangeNotification(
                'created',
                $ip,
                $user_agent
            ));

            return [
                'status' => true,
                'message' => $this->trans->get('Shipping address Saved successfully.'),
            ];

        } catch (Exception $e) {
            DB::rollBack();

            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }
}
