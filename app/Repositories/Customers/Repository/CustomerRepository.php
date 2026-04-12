<?php

namespace App\Repositories\Customers\Repository;

use App\Helpers\Trans;
use App\Models\Country;
use App\Models\Customer;
use App\Models\EmailChangeLog;
use App\Models\EmailChangeRequest;
use App\Models\User;
use App\Notifications\AccountDeactiveOrActiveNotification;
use App\Notifications\AccountSuspendNotification;
use App\Notifications\AccountUnderDisputeNotification;
use App\Notifications\AccountUnderInvestigationNotification;
use App\Notifications\AlertUserAboutEmailChangeNotification;
use App\Notifications\EmailChangeConfirmationNotification;
use App\Repositories\Customers\Interface\ICustomerRepository;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\RateLimiter;
use Str;

class CustomerRepository implements ICustomerRepository
{
    public function __construct(
        private Customer $customer,
        private User $user,
        private Country $country,
        private Trans $trans,
        private EmailChangeRequest $emailChangeRequest,
        private EmailChangeLog $emailChangeLog,
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
            'phone' => ['required', 'max:50', 'unique:users,phone'],
            'password' => ['required', 'min:8', 'max:50', 'confirmed'],
            'country_id' => ['required', 'exists:countries,id'],
            'state' => ['required', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:255'],
            'postal_code' => ['required', 'string', 'max:255'],
            'address_line1' => ['required', 'string'],
            'address_line2' => ['nullable', 'string'],
        ], [
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
            'phone' => ['required', 'unique:users,phone,'.$customer->user_id, 'max:50'],
            ...(($request->filled('password') || $request->filled('password_confirmation')) ? ['password' => ['required', 'min:8', 'max:50', 'confirmed']] : []),
            'country_id' => ['required', 'exists:countries,id'],
            'state' => ['required', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:255'],
            'postal_code' => ['required', 'string', 'max:255'],
            'address_line1' => ['required', 'string'],
            'address_line2' => ['nullable', 'string'],
            'status' => ['required', 'in:active,deactivated,suspended,under_dispute,under_investigation'],
            'note' => ['nullable', 'string', 'max:100000'],
        ], [
            'country_id.required' => 'Country Is Required',
            'country_id.exists' => 'Selected Country Is Not Exists',
        ]);

        try {

            DB::beginTransaction();

            $user = User::findOrFail($customer->user_id);

            $user_updated = $user->update([
                'name' => $validated_req['name'],
                'email' => $validated_req['email'],
                'phone' => $validated_req['phone'],
                ...(! empty($validated_req['password']) ? ['password' => bcrypt($validated_req['password'])] : []),
                'status' => $validated_req['status'],
                'deactivated_at' => null,
                'suspended_at' => null,
                'under_dispute_at' => null,
                'under_investigation_at' => null,

                ...match ($validated_req['status']) {
                    'deactivated' => ['deactivated_at' => now()],
                    'suspended' => ['suspended_at' => now()],
                    'under_dispute' => ['under_dispute_at' => now()],
                    'under_investigation' => ['under_investigation_at' => now()],
                    default => [],
                },
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
                'note' => $validated_req['note'] ?? null,
            ]);

            if (! $customer_updated) {
                throw new Exception('Something Went Wrong While Updating Customer');
            }

            if ($user->wasChanged('status')) {
                match ($user->status) {
                    'active' => $user->notify(
                        new AccountDeactiveOrActiveNotification('activated')
                    ),

                    'deactivated' => $user->notify(
                        new AccountDeactiveOrActiveNotification('deactivated')
                    ),

                    'suspended' => $user->notify(
                        new AccountSuspendNotification
                    ),

                    'under_dispute' => $user->notify(
                        new AccountUnderDisputeNotification
                    ),

                    'under_investigation' => $user->notify(
                        new AccountUnderInvestigationNotification
                    ),
                };
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
        $old_email = $user->email;
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
            'phone' => ['required', 'unique:users,phone,'.$id, 'max:50'],
            'country_id' => ['required', 'exists:countries,id'],
            'state' => ['required', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:255'],
            'postal_code' => ['required', 'string', 'max:255'],
            'address_line1' => ['required', 'required', 'string'],
            'address_line2' => ['nullable', 'string'],
        ]);

        DB::beginTransaction();
        try {

            $user->update([
                'name' => $validated_req['name'],
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

            $message = $this->trans::get('Profile Updated Successfully');

            if ($old_email !== $validated_req['email']) {

                $key = 'email-change:'.$user->id;

                if (RateLimiter::tooManyAttempts($key, 1)) {
                    throw new Exception(
                        $this->trans::get('You can request an email change only once per hour. Please try again later.')
                    );
                }

                // Register the attempt with 1 hour cooldown
                RateLimiter::hit($key, 3600);

                $hasPending = $this->emailChangeRequest
                    ->where('user_id', $user->id)
                    ->where('status', 'pending')
                    ->where('expires_at', '>', now())
                    ->exists();

                if ($hasPending) {
                    throw new Exception(
                        $this->trans::get(
                            'You already have a pending email change request. Please confirm it or wait for it to expire.'
                        )
                    );
                }

                $ip = $request->ip();
                $user_agent = $request->userAgent();
                $expires_at = now()->addHour(1);

                $rawToken = Str::random(64);
                $hashedToken = hash('sha256', $rawToken);

                $this->emailChangeRequest->create([
                    'user_id' => $user->id,
                    'old_email' => $old_email,
                    'new_email' => $validated_req['email'],
                    'token' => $hashedToken,
                    'ip_address' => $ip,
                    'user_agent' => $user_agent,
                    'expires_at' => $expires_at,
                ]);

                Notification::route('mail', $validated_req['email'])
                    ->notify(new EmailChangeConfirmationNotification(
                        $rawToken,
                        $ip,
                        $user_agent,
                        $expires_at,
                        $user->name
                    ));
                Notification::route('mail', $old_email)
                    ->notify(new AlertUserAboutEmailChangeNotification(
                        $validated_req['email'],
                        $ip,
                        $user_agent,
                        $user->name
                    ));

                $message = $this->trans::get(
                    'Your profile changes have been saved. Your email address will be updated after you confirm the verification link sent to your new email address.'
                );
            }

            DB::commit();

            return [
                'status' => true,
                'message' => $message,
            ];

        } catch (Exception $e) {
            DB::rollBack();

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

    public function emailChangeVerify(Request $request, string $token)
    {
        try {
            $user = $request->user();

            if (! $user) {
                throw new Exception($this->trans->get('Please login to confirm your email change.'));
            }

            if (empty($token)) {
                throw new Exception($this->trans->get('Token Not Found'));
            }

            $hashedToken = hash('sha256', $token);

            $emailChangeRequest = $this->emailChangeRequest
                ->where('user_id', $user->id)
                ->where('token', $hashedToken)
                ->where('status', 'pending')
                ->where('expires_at', '>', now())
                ->first();

            if (empty($emailChangeRequest)) {
                throw new Exception($this->trans->get('Invalid or expired verification link'));
            }

            DB::transaction(function () use ($user, $emailChangeRequest, $request) {
                $this->emailChangeLog->create([
                    'user_id' => $user->id,
                    'old_email' => $emailChangeRequest->old_email,
                    'new_email' => $emailChangeRequest->new_email,
                    'changed_at' => now(),
                    'ip_address' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                ]);

                $user->email = $emailChangeRequest->new_email;
                $user->email_verified_at = now();
                $user->save();

                $emailChangeRequest->status = 'confirmed';
                $emailChangeRequest->token = null;
                $emailChangeRequest->save();

            });

            return [
                'status' => true,
                'message' => $this->trans->get('Your email address has been updated successfully'),
            ];

        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }
}
