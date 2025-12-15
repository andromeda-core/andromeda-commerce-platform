<?php

namespace App\Repositories\Users\Repository;

use App\Models\Role;
use App\Models\SpecialCountry;
use App\Models\User;
use App\Repositories\Users\Interface\IUserRepository;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\RateLimiter;
use Str;

class UserRepository implements IUserRepository
{
    public function __construct(
        private User $user,
        private Role $role,
        private SpecialCountry $special_country
    ) {}

    public function getSingleUser(string $id)
    {
        $user = $this->user->with(['roles', 'supplier', 'collaborator', 'distributor'])->find($id);

        return $user;
    }

    public function updateProfile(Request $request)
    {
        $validated_req = $request->validate([
            'name' => 'required|max:255',
            'email' => 'required|email|max:255|unique:users,email,'.$request->user()->id,
            'phone' => 'required|regex:/^\+\d+$/|max:50|unique:users,phone,'.$request->user()->id,
        ], [
            'phone.regex' => 'The Number Accepted With + Country Code - Example: +8801xxxxxxxxx',
        ]);

        try {

            $throttleKey = 'profile_update_'.$request->user()->id;
            if (RateLimiter::tooManyAttempts($throttleKey, 3)) {
                $seconds = RateLimiter::availableIn($throttleKey);

                throw new Exception('Too many attempts. Try again After '.ceil($seconds / 60).' minutes.');
            }

            RateLimiter::hit($throttleKey, 900);

            $user = $this->getSingleUser($request->user()->id);
            if (empty($user)) {
                throw new Exception('Something Went Wrong While Updating Profile');
            }

            $user->fill($validated_req);

            if ($user->isDirty('email')) {
                $user->email_verified_at = null;
            }

            if ($user->save()) {
                return [
                    'status' => true,
                    'message' => 'Profile Updated Successfully',
                ];
            }

            throw new Exception('Something Went Wrong While Updating Profile');
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function updatePassword(Request $request)
    {
        $validated_req = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', 'min:8', 'max:50'],
            'password_confirmation' => ['required', 'same:password'],
        ]);

        try {

            $throttleKey = 'password_update_'.$request->user()->id;
            if (RateLimiter::tooManyAttempts($throttleKey, 1)) {
                $seconds = RateLimiter::availableIn($throttleKey);

                throw new Exception('Too many attempts. Try again After '.ceil($seconds / 60).' minutes.');
            }

            RateLimiter::hit($throttleKey, 900);

            $user = $this->getSingleUser($request->user()->id);

            if (empty($user)) {
                throw new Exception('Something Went Wrong While Updating Profile');
            }

            if ($user->update(['password' => bcrypt($request->password)])) {
                return [
                    'status' => true,
                    'message' => 'Password Updated Successfully',
                ];
            }

            throw new Exception('Something Went Wrong While Updating Password');
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function destroyAccount(Request $request)
    {
        $request->validate([
            'current_password' => ['required', 'current_password'],
        ]);

        try {

            $user = $this->getSingleUser($request->user()->id);

            if (empty($user)) {
                throw new Exception('Something Went Wrong While Updating Profile');
            }

            if ($user->delete()) {
                return [
                    'status' => true,
                    'message' => 'Account Deleted Successfully',
                ];
            }

            throw new Exception('Something Went Wrong While Deleting Account');
            throw new Exception('Something Went Wrong While Updating Password');
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }

    }

    public function getAllUsers(Request $request)
    {
        $users = $this->user
            ->with(['roles'])
            ->when(! empty($request->input('search')), function ($query) use ($request) {
                $query->where(function ($query) use ($request) {
                    $query->where('name', 'like', '%'.$request->input('search').'%')
                        ->orWhere('email', 'like', '%'.$request->input('search').'%')
                        ->orWhere('phone', 'like', '%'.$request->input('search').'%')
                        ->orWhereHas('roles', function ($query) use ($request) {
                            $query->where('name', 'like', '%'.$request->input('search').'%');
                        });
                });
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return $users;
    }

    public function storeUser(Request $request)
    {
        $validated_req = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'phone' => ['required', 'regex:/^\+\d+$/', 'unique:users,phone', 'max:50'],
            'password' => ['required', 'string', 'min:8', 'max:50', 'confirmed'],
            'role_id' => ['required', 'exists:roles,id'],
            'is_active' => ['required', 'boolean'],
        ], [
            'phone.regex' => 'The Number Accepted With + Country Code - Example: +8801xxxxxxxxx',
            'role_id.exists' => 'The selected role is invalid.',
            'role_id.required' => 'The Role Field Is Required.',

        ]);

        try {
            DB::beginTransaction();
            unset($validated_req['role_id']);

            $role = $this->role->where('id', $request->input('role_id'))->first();
            if (empty($role)) {
                throw new Exception('Something Went Wrong While Creating New User');
            }

            // Supplier Logic
            if ($role->name === 'Supplier') {
                $request->validate([
                    'company_name' => ['required', 'max:255'],
                ]);
            }
            // Supplier Logic

            // Collaborator Logic
            if ($role->name === 'Collaborator') {
                $request->validate([
                    'type' => ['required', 'in:Company,Indivisual'],
                    'address' => ['required', 'max:255'],
                    'bank_account_no' => ['required', 'string', 'max:255'],
                    'bank_name' => ['required', 'string', 'max:255'],
                    'bank_account_name' => ['required', 'string', 'max:255'],
                    'iban' => ['required', 'string', 'max:255'],
                    'swift_code' => ['required', 'string', 'max:255'],
                ], [
                    'type.required' => 'The Collaborator Type Field Is Required.',
                    'type.in' => 'The Collaborator Type Must Be Company Or Indivisual.',
                ]);
            }
            // Collaborator Logic

            // Distributor Logic
            if ($role->name === 'Distributor') {
                $request->validate([
                    'address' => ['required', 'max:255', 'string'],
                    'bank_account_no' => ['required', 'string', 'max:255'],
                    'bank_name' => ['required', 'string', 'max:255'],
                    'bank_account_name' => ['required', 'string', 'max:255'],
                    'iban' => ['required', 'string', 'max:255'],
                    'swift_code' => ['required', 'string', 'max:255'],
                ]);
            }
            // Distributor Logic

            $created = $this->user->create($validated_req);
            if (empty($created)) {
                throw new Exception('Something Went Wrong While Creating New User');
            }

            // Supplier Logic
            if ($role->name === 'Supplier') {
                $created->supplier()->create(['company_name' => $request->input('company_name')]);
            }
            // Supplier Logic

            // Collaborator Logic
            if ($role->name === 'Collaborator') {
                $referral_code = 'Ref-'.Str::random(12);
                $created->collaborator()->create(
                    [
                        'type' => $request->input('type'),
                        'referral_code' => $referral_code,
                        'bank_account_no' => $request->input('bank_account_no'),
                        'bank_name' => $request->input('bank_name'),
                        'bank_account_name' => $request->input('bank_account_name'),
                        'iban' => $request->input('iban'),
                        'swift_code' => $request->input('swift_code'),
                        'address' => $request->input('address'),
                    ]
                );
            }
            // Collaborator Logic

            // Distributor Logic
            if ($role->name === 'Distributor') {
                $created->distributor()->create(
                    [
                        'bank_account_no' => $request->input('bank_account_no'),
                        'bank_name' => $request->input('bank_name'),
                        'bank_account_name' => $request->input('bank_account_name'),
                        'iban' => $request->input('iban'),
                        'swift_code' => $request->input('swift_code'),
                        'address' => $request->input('address'),
                    ]
                );
            }
            // Distributor Logic

            // Customer Logic

            if ($role->name === 'Customer') {
                $created->customer()->create();
            }

            // Customer Logic

            $created->syncRoles($role->name);

            DB::commit();

            return [
                'status' => true,
                'message' => 'User Created Successfully',
            ];

        } catch (Exception $e) {

            DB::rollBack();

            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function updateUser(Request $request, string $id)
    {
        // dd($request->all());

        $validated_req = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email,'.$id],
            'phone' => ['required', 'regex:/^\+\d+$/', 'max:50', 'unique:users,phone,'.$id],
            ...(
                $request->filled('password')
                ||
                $request->filled('password_confirmation')
                ? ['password' => ['required', 'string', 'min:8', 'max:50', 'confirmed']]
                :
                []
            ),
            'role_id' => ['required', 'exists:roles,id'],
            'is_active' => ['required', 'boolean'],
        ], [
            'phone.regex' => 'The Number Accepted With + Country Code - Example: +8801xxxxxxxxx',
            'role_id.exists' => 'The selected role is invalid.',
            'role_id.required' => 'The Role Field Is Required.',

        ]);

        try {
            DB::beginTransaction();
            unset($validated_req['role_id']);

            $user = $this->getSingleUser($id);

            if (empty($user)) {
                throw new Exception('Something Went Wrong While Updating User');
            }

            $role = $this->role->where('id', $request->input('role_id'))->first();
            if (empty($role)) {
                throw new Exception('Something Went Wrong While Updating  User');
            }

            // Supplier Logic
            if ($role->name === 'Supplier') {
                $request->validate([
                    'company_name' => ['required', 'max:255'],
                ]);
            }
            // Supplier Logic

            // Collaborator Logic
            if ($role->name === 'Collaborator') {
                $request->validate([
                    'type' => ['required', 'in:Company,Indivisual'],
                    'address' => ['required', 'max:255'],
                    'bank_account_no' => ['required', 'string', 'max:255'],
                    'bank_name' => ['required', 'string', 'max:255'],
                    'bank_account_name' => ['required', 'string', 'max:255'],
                    'iban' => ['required', 'string', 'max:255'],
                    'swift_code' => ['required', 'string', 'max:255'],
                ], [
                    'type.required' => 'The Collaborator Type Field Is Required.',
                    'type.in' => 'The Collaborator Type Must Be Company Or Indivisual.',
                ]);
            }
            // Collaborator Logic

            // Distributor Logic
            if ($role->name === 'Distributor') {
                $request->validate([
                    'address' => ['required', 'max:255', 'string'],
                    'bank_account_no' => ['required', 'string', 'max:255'],
                    'bank_name' => ['required', 'string', 'max:255'],
                    'bank_account_name' => ['required', 'string', 'max:255'],
                    'iban' => ['required', 'string', 'max:255'],
                    'swift_code' => ['required', 'string', 'max:255'],
                ]);
            }
            // Distributor Logic

            // Supplier Logic
            if ($role->name !== 'Supplier' && $user->supplier()->exists()) {

                $supplier = $user->supplier;
                $createdAt = $supplier->created_at instanceof \Carbon\Carbon
                    ? $supplier->created_at
                    : \Carbon\Carbon::parse($supplier->created_at);

                $yearsPassed = (int) $createdAt->diffInYears(now());
                if ($yearsPassed < 5) {
                    throw new Exception('Supplier Can Not Be Changed Before 5 Years And Currently '.$yearsPassed.' Years Passed');
                }

                $user->supplier()->delete();
            }

            if ($role->name === 'Supplier' && ! $user->supplier()->exists()) {
                $user->supplier()->create(['company_name' => $request->input('company_name')]);
            }

            if ($role->name === 'Supplier' && $user->supplier()->exists()) {
                $user->supplier()->update(['company_name' => $request->input('company_name')]);
            }
            // Supplier Logic

            // Collaborator Logic
            if ($role->name !== 'Collaborator' && $user->collaborator()->exists()) {
                $user->collaborator()->delete();
            }

            if ($role->name === 'Collaborator' && ! $user->collaborator()->exists()) {
                $referral_code = 'Ref-'.Str::random(12);
                $user->collaborator()->create(
                    [
                        'type' => $request->input('type'),
                        'referral_code' => $referral_code,
                        'address' => $request->input('address'),
                        'bank_account_no' => $request->input('bank_account_no'),
                        'bank_name' => $request->input('bank_name'),
                        'bank_account_name' => $request->input('bank_account_name'),
                        'iban' => $request->input('iban'),
                        'swift_code' => $request->input('swift_code'),
                    ]
                );
            }

            if ($role->name === 'Collaborator' && $user->collaborator()->exists()) {
                $user->collaborator()->update(
                    [
                        'type' => $request->input('type'),
                        'address' => $request->input('address'),
                        'bank_account_no' => $request->input('bank_account_no'),
                        'bank_name' => $request->input('bank_name'),
                        'bank_account_name' => $request->input('bank_account_name'),
                        'iban' => $request->input('iban'),
                        'swift_code' => $request->input('swift_code'),
                    ]);
            }
            // Collaborator Logic

            // Distributor Logic
            if ($role->name !== 'Distributor' && $user->distributor()->exists()) {
                $user->distributor()->delete();
            }

            if ($role->name === 'Distributor' && ! $user->distributor()->exists()) {
                $user->distributor()->create(
                    [
                        'address' => $request->input('address'),
                        'bank_account_no' => $request->input('bank_account_no'),
                        'bank_name' => $request->input('bank_name'),
                        'bank_account_name' => $request->input('bank_account_name'),
                        'iban' => $request->input('iban'),
                        'swift_code' => $request->input('swift_code'),

                    ]
                );
            }

            if ($role->name === 'Distributor' && $user->distributor()->exists()) {
                $user->distributor()->update(
                    [
                        'address' => $request->input('address'),
                        'bank_account_no' => $request->input('bank_account_no'),
                        'bank_name' => $request->input('bank_name'),
                        'bank_account_name' => $request->input('bank_account_name'),
                        'iban' => $request->input('iban'),
                        'swift_code' => $request->input('swift_code'),

                    ]
                );
            }
            // Distributor Logic

            // Customer Logic

            if ($role->name !== 'Customer' && $user->customer()->exists()) {
                $user->customer()->delete();
            }

            if ($role->name === 'Customer' && ! $user->customer()->exists()) {
                $user->customer()->create();
            }

            // Customer Logic

            $updated = $user->update($validated_req);

            if (! $updated) {
                throw new Exception('Something Went Wrong While updating User');
            }

            $user->syncRoles($role->name);

            DB::commit();

            return [
                'status' => true,
                'message' => 'User Updated Successfully',
            ];
        } catch (Exception $e) {
            DB::rollBack();

            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function destroyUser(string $id)
    {
        try {
            $user = $this->getSingleUser($id);

            if (empty($user)) {
                throw new Exception('Something Went Wrong While Deleting User');
            }

            if ($user->supplier()->exists()) {
                $supplier = $user->supplier;

                $createdAt = $supplier->created_at instanceof \Carbon\Carbon
                    ? $supplier->created_at
                    : \Carbon\Carbon::parse($supplier->created_at);

                $yearsPassed = (int) $createdAt->diffInYears(now());
                if ($yearsPassed < 5) {
                    throw new Exception('Supplier Can Not Be Deleted Before 5 Years And Currently '.$yearsPassed.' Years Passed');
                }

            }

            $deleted = $user->delete();

            if (! $deleted) {
                throw new Exception('Something Went Wrong While Deleting User');
            }

            return [
                'status' => true,
                'message' => 'User Deleted Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function destroyUserBySelection(Request $request)
    {
        try {
            $ids = $request->array('ids');

            if (blank($ids)) {
                throw new Exception('Something Went Wrong While Deleting User');
            }

            $users = $this->user->whereIn('id', $ids)->get();

            if ($users->isEmpty()) {
                throw new Exception('Something Went Wrong While Deleting User');
            }

            foreach ($users as $user) {
                if ($user->supplier()->exists()) {
                    $supplier = $user->supplier;

                    $createdAt = $supplier->created_at instanceof \Carbon\Carbon
                        ? $supplier->created_at
                        : \Carbon\Carbon::parse($supplier->created_at);

                    $yearsPassed = (int) $createdAt->diffInYears(now());
                    if ($yearsPassed < 5) {
                        throw new Exception('Suppliers Can Not Be Deleted Before 5 Years And Currently '.$yearsPassed.' Years Passed');
                    }

                }

                $user->delete();
            }

            return [
                'status' => true,
                'message' => 'User Deleted Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function getAllRoles()
    {
        return $this->role->all();
    }

    public function getSingleCustomer(string $user_id)
    {
        $user = User::with(['customer' => function ($query) {
            $query->withCount('orders');
        }, 'customer.country'])->find($user_id);
        $user->member_since = $user->created_at->diffForHumans([
            'parts' => 1,
            'short' => false,
            'syntax' => \Carbon\CarbonInterface::DIFF_ABSOLUTE,
        ]);

        return $user;
    }

    public function profileCompletionCheck(Request $request)
    {
        $customer = $this->user->where('id', $request->user()?->id)->first()?->customer;

        if (empty($customer)) {
            return false;
        }

        if (
            empty($customer->country_id) ||
            empty($customer->state) ||
            empty($customer->city) ||
            (empty($customer->address_line1) && empty($customer->address_line2)) ||
            empty($customer->postal_code)
        ) {
            return false;
        }

        return true;
    }

    public function isCustomerEligableForSocialMessageSendOrReceive(string $user_id)
    {
        $customer = $this->user->where('id', $user_id)->first()?->customer;

        if (empty($customer)) {
            return false;
        }

        $customer_country_id = $customer->country_id;
        $eligible_country_ids = $this->special_country->pluck('country_id')->toArray();

        if (in_array($customer_country_id, $eligible_country_ids)) {
            return true;
        }

        return false;

    }
}
