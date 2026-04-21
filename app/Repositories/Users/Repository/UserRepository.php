<?php

namespace App\Repositories\Users\Repository;

use App\Helpers\Trans;
use App\Jobs\DestroyUserProfileOnAWS;
use App\Models\Role;
use App\Models\SpecialCountry;
use App\Models\User;
use App\Notifications\AccountDeactiveOrActiveNotification;
use App\Notifications\DormantAccountNotification;
use App\Repositories\Users\Interface\IUserRepository;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Encoders\WebpEncoder;
use Intervention\Image\ImageManager;
use Str;

class UserRepository implements IUserRepository
{
    public function __construct(
        private User $user,
        private Role $role,
        private SpecialCountry $special_country,
        private Trans $trans,
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
            'email' => 'required|email|max:255|unique:users,email,' . $request->user()->id,
            'phone' => 'required|max:50|unique:users,phone,' . $request->user()->id,
        ]);

        try {

            $throttleKey = 'profile_update_' . $request->user()->id;
            if (RateLimiter::tooManyAttempts($throttleKey, 3)) {
                $seconds = RateLimiter::availableIn($throttleKey);

                throw new Exception('Too many attempts. Try again After ' . ceil($seconds / 60) . ' minutes.');
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

            $throttleKey = 'password_update_' . $request->user()->id;
            if (RateLimiter::tooManyAttempts($throttleKey, 1)) {
                $seconds = RateLimiter::availableIn($throttleKey);

                throw new Exception('Too many attempts. Try again After ' . ceil($seconds / 60) . ' minutes.');
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
            ->whereHas('roles', function ($query) {
                $query->whereNotIn('name', ['Customer', 'Supplier', 'Collaborator', 'Distributor']);
            })
            ->when(! empty($request->input('search')), function ($query) use ($request) {
                $query->where(function ($query) use ($request) {
                    $query->where('name', 'like', '%' . $request->input('search') . '%')
                        ->orWhere('email', 'like', '%' . $request->input('search') . '%')
                        ->orWhere('phone', 'like', '%' . $request->input('search') . '%')
                        ->orWhereHas('roles', function ($query) use ($request) {
                            $query->where('name', 'like', '%' . $request->input('search') . '%');
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
            'phone' => ['required', 'unique:users,phone', 'max:50'],
            'password' => ['required', 'string', 'min:8', 'max:50', 'confirmed'],
            'role_id' => ['required', 'exists:roles,id'],
        ], [
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

            $created = $this->user->create($validated_req);
            if (empty($created)) {
                throw new Exception('Something Went Wrong While Creating New User');
            }

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

        $validated_req = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email,' . $id],
            'phone' => ['required', 'max:50', 'unique:users,phone,' . $id],
            ...(
                $request->filled('password')
                ||
                $request->filled('password_confirmation')
                ? ['password' => ['required', 'string', 'min:8', 'max:50', 'confirmed']]
                :
                []
            ),
            'role_id' => ['required', 'exists:roles,id'],
        ], [
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
                    throw new Exception('Supplier Can Not Be Deleted Before 5 Years And Currently ' . $yearsPassed . ' Years Passed');
                }
            }
            if (! empty($user->profile)) {
                dispatch(new DestroyUserProfileOnAWS($user->profile));
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
                        throw new Exception('Suppliers Can Not Be Deleted Before 5 Years And Currently ' . $yearsPassed . ' Years Passed');
                    }
                }

                if (! empty($user->profile)) {
                    dispatch(new DestroyUserProfileOnAWS($user->profile));
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
        return $this->role->whereNotIn('name', ['Customer', 'Supplier', 'Collaborator', 'Distributor'])->get();
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

    public function uploadProfilePicture(Request $request)
    {
        $request->validate([
            'profile' => ['required', 'image', 'mimes:jpeg,png,jpg,webp', 'max:2048'],
        ]);

        try {
            $user = $request->user();

            $profile = $request->file('profile');
            $new_name = time() . uniqid() . '-' . Str::random(10) . '.webp';

            $resizedImage = ImageManager::imagick()
                ->read($profile)
                ->scaleDown(1200)
                ->encode(new WebpEncoder(quality: 70));

            $tempPath = 'temp/uploads/' . $new_name;
            Storage::disk('local')->put($tempPath, (string) $resizedImage);

            $dir = 'Users/Profile';
            $url = null;
            if (empty($user->profile)) {
                $url = $this->storeUserProfileOnAWS($tempPath, $dir);

                $user->update([
                    'profile' => $url,
                ]);
            } else {
                dispatch(new DestroyUserProfileOnAWS($user->profile));
                $url = $this->storeUserProfileOnAWS($tempPath, $dir);

                $user->update([
                    'profile' => $url,
                ]);
            }

            if (empty($url)) {
                throw new Exception('Something Went Wrong While Uploading Profile Picture');
            }

            return [
                'status' => true,
                'message' => 'Profile Picture Uploaded Successfully',
                'profile' => $url,
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    private function storeUserProfileOnAWS($path, $dir)
    {
        if (empty($path)) {
            return;
        }

        $fullLocalPath = Storage::disk('local')->path($path);
        $extension = pathinfo($path, PATHINFO_EXTENSION);
        $new_name = time() . uniqid() . '-' . Str::random(10) . '.' . $extension;

        Storage::disk('s3')
            ->put($dir . $new_name, file_get_contents($fullLocalPath), [
                'CacheControl' => 'public, max-age=31536000',
                'ContentType' => mime_content_type($fullLocalPath),
            ]);

        Storage::disk('local')->delete($path);

        $url = Storage::disk('s3')->url($dir . $new_name);

        return $url;
    }

    public function hasVerifiedEmail(Request $request)
    {
        $user = $request->user();

        try {
            if (empty($user)) {
                throw new Exception($this->trans->get('User not Found'));
            }

            return [
                'status' => true,
                'message' => 'User Found',
                'hasVerifiedEmail' => $user->hasVerifiedEmail(),
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function activateDormantAccount(Request $request)
    {
        try {
            $user = $request->user();

            if (empty($user) || ! $user->is_dormant || ! $user->hasRole('Customer')) {
                throw new Exception($this->trans->get('User not Found'));
            }

            $user->is_dormant = false;
            $user->dormant_at = null;
            $user->last_activity_at = now();
            $user->save();

            // Notify User
            $user->notify(new DormantAccountNotification('reactivated'));

            return [
                'status' => true,
                'message' => $this->trans->get('Account Activated Successfully'),
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function activateDeactiveAccount(Request $request)
    {
        try {
            $user = $request->user();

            if (empty($user) || ! $user->status === 'deactivated' || ! $user->hasRole('Customer')) {
                throw new Exception($this->trans->get('User not Found'));
            }

            $user->status = 'active';
            $user->deactivated_at = null;
            $user->last_activity_at = now();
            $user->save();

            // Notify User
            $user->notify(new AccountDeactiveOrActiveNotification('activated'));

            return [
                'status' => true,
                'message' => $this->trans->get('Account Activated Successfully'),
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function getUsers()
    {
        return $this->user->where('status', 'active')->where('is_dormant', false)->whereHas('roles', function ($query) {
            $query->where('name', "!=", 'Customer');
        })->latest()->get(['id', 'name']);
    }
}
