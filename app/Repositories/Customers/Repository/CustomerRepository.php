<?php

namespace App\Repositories\Customers\Repository;

use App\Helpers\Trans;
use App\Models\Country;
use App\Models\Customer;
use App\Models\User;
use App\Repositories\Customers\Interface\ICustomerRepository;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class CustomerRepository implements ICustomerRepository
{
    public function __construct(
        private Customer $customer,
        private User $user,
        private Country $country,
        private Trans $trans,
    ) {}

    public function getAllCustomers(Request $request)
    {
        $customers = $this->customer
            ->with(['user', 'country'])
            ->when(! empty($request->input('search')), function ($query) use ($request) {
                $query->where(function ($subQ) use ($request) {
                    $subQ->whereHas('country', function ($subQQ) use ($request) {
                        $subQQ->where('name', 'like', '%'.$request->input('search').'%');
                    })
                        ->orWhere('state', 'like', '%'.$request->input('search').'%')
                        ->orWhere('city', 'like', '%'.$request->input('search').'%')
                        ->orWhere('postal_code', 'like', '%'.$request->input('search').'%')
                        ->orWhereHas('user', function ($subQQ) use ($request) {
                            $subQQ->where('name', 'like', '%'.$request->input('search').'%')
                                ->orWhere('email', 'like', '%'.$request->input('search').'%')
                                ->orWhere('phone', 'like', '%'.$request->input('search').'%');
                        });

                });
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return $customers;
    }

    public function getSingleCustomer(string $id)
    {
        $customer = $this->customer->with(['user', 'user.roles', 'country'])->find($id);

        return $customer;
    }

    public function storeCustomer(Request $request)
    {
        $validated_req = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'unique:users,email', 'max:255'],
            'phone' => ['required', 'regex:/^\+\d+$/', 'max:50', 'unique:users,phone'],
            'password' => ['required', 'min:8', 'max:50', 'confirmed'],
            'country_id' => ['required', 'exists:countries,id'],
            'state' => ['required', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:255'],
            'postal_code' => ['required', 'string', 'max:255'],
            'address_line1' => ['required', 'string'],
            'address_line2' => ['nullable', 'string'],
            'is_active' => ['required', 'boolean'],
        ], [
            'phone.regex' => 'The Number Accepted With + Country Code - Example: +8801xxxxxxxxx',
            'is_active.required ' => 'Customer Status Is Required',
            'is_active.boolean' => 'Customer Status Must Be in Active Or In-Active',
            'country_id.required' => 'Country Is Required',
            'country_id.exists' => 'Selected Country Is Not Exists',
        ]);

        try {

            DB::beginTransaction();

            $user_created = $this->user->create([
                'name' => $validated_req['name'],
                'email' => $validated_req['email'],
                'phone' => $validated_req['phone'],
                'password' => bcrypt($validated_req['password']),
                'is_active' => $validated_req['is_active'],
            ]);

            if (empty($user_created)) {
                throw new Exception('Something Went Wrong While Creating Linked User With Customer');
            }

            $customer_created = $this->customer->create([
                'user_id' => $user_created->id,
                'country_id' => $validated_req['country_id'],
                'state' => $validated_req['state'],
                'city' => $validated_req['city'],
                'postal_code' => $validated_req['postal_code'],
                'address_line1' => $validated_req['address_line1'],
                'address_line2' => $validated_req['address_line2'],
            ]);

            if (empty($customer_created)) {
                throw new Exception('Something Went Wrong While Creating Customer');
            }

            $user_created->syncRoles('Customer');

            DB::commit();

            return [
                'status' => true,
                'message' => 'Customer Created Successfully',
            ];

        } catch (Exception $e) {
            Db::rollBack();

            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }

    }

    public function updateCustomer(Request $request, string $id)
    {

        $customer = $this->getSingleCustomer($id);

        if (empty($customer)) {
            return [
                'status' => false,
                'message' => 'Customer Not Found',
            ];
        }

        $validated_req = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'unique:users,email,'.$customer->user_id, 'max:255'],
            'phone' => ['required', 'regex:/^\+\d+$/', 'unique:users,phone,'.$customer->user_id, 'max:50'],
            ...(($request->filled('password') || $request->filled('password_confirmation')) ? ['password' => ['required', 'min:8', 'max:50', 'confirmed']] : []),
            'country_id' => ['required', 'exists:countries,id'],
            'state' => ['required', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:255'],
            'postal_code' => ['required', 'string', 'max:255'],
            'address_line1' => ['required', 'string'],
            'address_line2' => ['nullable', 'string'],
            'is_active' => ['required', 'boolean'],
        ], [
            'phone.regex' => 'The Number Accepted With + Country Code - Example: +8801xxxxxxxxx',
            'is_active.required ' => 'Customer Status Is Required',
            'is_active.boolean' => 'Customer Status Must Be in Active Or In-Active',
            'country_id.required' => 'Country Is Required',
            'country_id.exists' => 'Selected Country Is Not Exists',
        ]);

        try {

            DB::beginTransaction();

            $user = $this->user->find($customer->user_id);
            if (empty($user)) {
                throw new Exception('Something Went Wrong While Finding Linked User To Customer');
            }

            $user_updated = $user->update([
                'name' => $validated_req['name'],
                'email' => $validated_req['email'],
                'phone' => $validated_req['phone'],
                ...(! empty($validated_req['password']) ? ['password' => bcrypt($validated_req['password'])] : []),
                'is_active' => $validated_req['is_active'],
            ]);

            if (! $user_updated) {
                throw new Exception('Something Went Wrong While Updating Linked User To Customer');
            }

            $customer_updated = $customer->update([
                'country_id' => $validated_req['country_id'],
                'state' => $validated_req['state'],
                'city' => $validated_req['city'],
                'postal_code' => $validated_req['postal_code'],
                'address_line1' => $validated_req['address_line1'],
                'address_line2' => $validated_req['address_line2'],
            ]);

            if (! $customer_updated) {
                throw new Exception('Something Went Wrong While Updating Customer');
            }

            DB::commit();

            return [
                'status' => true,
                'message' => 'Customer Updated Successfully',
            ];

        } catch (Exception $e) {
            DB::rollBack();

            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function destroyCustomer(string $id)
    {
        try {

            $customer = $this->getSingleCustomer($id);

            if (empty($customer)) {
                throw new Exception('Customer Not Found');
            }

            $deleted = $customer->user()->delete();

            if (! $deleted) {
                throw new Exception('Something went Wrong While Deleting Customer');
            }

            return [
                'status' => true,
                'message' => 'Customer Deleted Successfully',
            ];

        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function destroyCustomerBySelection(Request $request)
    {
        try {

            $ids = $request->array('ids');

            if (blank($ids)) {
                throw new Exception('Please Select Atleast One Customer To Delete');
            }

            foreach ($ids as $id) {
                $response = $this->destroyCustomer($id);

                if ($response['status'] === false) {
                    throw new Exception($response['message']);
                }
            }

            return [
                'status' => true,
                'message' => 'Selected Customers Deleted Successfully',
            ];

        } catch (Exception $e) {

            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function getCountries()
    {

        return Cache::rememberForever('countries', function () {
            return $this->country->where('is_active', true)->get();
        });
    }

    public function updateCustomerProfile(Request $request, string $id)
    {
        $user = $this->user->with(['customer'])->find($id);

        if (empty($user)) {
            return [
                'status' => false,
                'message' => $this->trans::get('Something Went Wrong While Finding Linked User To Customer'),
            ];
        }

        if (! $user->hasRole('Customer')) {
            return [
                'status' => false,
                'message' => $this->trans::get('Only Customers Can Update Profile From Here'),
            ];
        }

        if (! $user->is($request->user())) {
            return [
                'status' => false,
                'message' => $this->trans::get('You Can Only Update Your Profile'),
            ];
        }

        $validated_req = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email,'.$id],
            'phone' => ['required', 'regex:/^\+\d+$/', 'unique:users,phone,'.$id, 'max:50'],
            'country_id' => ['required', 'exists:countries,id'],
            'state' => ['required', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:255'],
            'postal_code' => ['required', 'string', 'max:255'],
            'address_line1' => ['required', 'required', 'string'],
            'address_line2' => ['nullable', 'string'],
        ], [
            'phone.regex' => $this->trans::get('The Number Accepted With + Country Code - Example: +8801xxxxxxxxx'),
        ]);

        DB::beginTransaction();
        try {

            $user->update([
                'name' => $validated_req['name'],
                'email' => $validated_req['email'],
                'phone' => $validated_req['phone'],
            ]);

            $customer = $user->customer;

            if (empty($customer)) {
                throw new Exception($this->trans::get('Something Went Wrong While Finding Customer'));
            }

            $customer->update([
                'country_id' => $validated_req['country_id'],
                'state' => $validated_req['state'],
                'city' => $validated_req['city'],
                'postal_code' => $validated_req['postal_code'],
                'address_line1' => $validated_req['address_line1'],
                'address_line2' => $validated_req['address_line2'],

            ]);

            DB::commit();

            return [
                'status' => true,
                'message' => $this->trans::get('Profile Updated Successfully'),
            ];

        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function changeCustomerPassword(Request $request, string $id)
    {

        $user = $this->user->find($id);
        if (empty($user)) {

            return [
                'status' => false,
                'message' => 'Something Went Wrong While Updating Password',
            ];
        }

        if (! $user->is($request->user())) {

            return [
                'status' => false,
                'message' => 'You Can Only Update Your Password',
            ];
        }

        if (! $user->hasRole('Customer')) {
            return [
                'status' => false,
                'message' => 'Only Customers Can Update Password From Here',
            ];
        }

        $validated_req = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', 'min:8', 'max:50', 'confirmed'],
        ]);

        if ($user->update(['password' => bcrypt($validated_req['password'])])) {
            return [
                'status' => true,
                'message' => 'Password Updated Successfully',
            ];
        }

    }
}
