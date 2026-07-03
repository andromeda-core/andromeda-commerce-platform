<?php

namespace App\Repositories\AccommodationOperators\Repository;

use App\Models\AccommodationOperator;
use App\Models\Role;
use App\Models\User;
use App\Repositories\AccommodationOperators\Interface\IAccommodationOperatorRepository;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AccommodationOperatorRepository implements IAccommodationOperatorRepository
{
    public function __construct(
        private AccommodationOperator $accommodation_operator,
        private Role $role,
        private User $user
    ) {}

    public function getAllAccommodationOperators(Request $request)
    {
        $accommodation_operators = $this->accommodation_operator
            ->with(['user'])
            ->when(! empty($request->input('search')), function ($query) use ($request) {
                $query->where(function ($query) use ($request) {
                    $query->where('company_name', 'like', '%'.$request->input('search').'%')
                        ->orWhereHas('user', function ($subQ) use ($request) {
                            $subQ->where('name', 'like', '%'.$request->input('search').'%')
                                ->orWhere('email', 'like', '%'.$request->input('search').'%')
                                ->orWhere('phone', 'like', '%'.$request->input('search').'%');
                        });
                });
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return $accommodation_operators;
    }

    public function getSingleAccommodationOperator(string $id)
    {
        $accommodation_operator = $this->accommodation_operator
            ->with(['user', 'user.roles'])
            ->find($id);

        return $accommodation_operator;
    }

    public function storeAccommodationOperator(Request $request)
    {
        $validated_req = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'phone' => ['required', 'max:50', 'unique:users,phone'],
            'password' => ['required', 'string', 'min:8', 'max:50', 'confirmed'],
            'company_name' => ['required', 'string', 'max:255'],
            'address' => ['required', 'string', 'max:255'],
            'postal_code' => ['nullable', 'string', 'max:50'],
            'bank_name' => ['nullable', 'string', 'max:255'],
            'bank_account_name' => ['nullable', 'string', 'max:255'],
            'iban' => ['nullable', 'string', 'max:255'],
            'swift_code' => ['nullable', 'string', 'max:255'],
            'bank_account_no' => ['required', 'string', 'max:255'],
        ]);

        try {
            DB::beginTransaction();

            $user = $this->user->create([
                'name' => $validated_req['name'],
                'email' => $validated_req['email'],
                'phone' => $validated_req['phone'],
                'password' => bcrypt($validated_req['password']),
            ]);

            if (empty($user)) {
                throw new Exception('Something Went Wrong While Creating New Linked User To Accommodation Operator');
            }

            $accommodation_operator = $this->accommodation_operator->create([
                'user_id' => $user->id,
                'company_name' => $validated_req['company_name'],
                'address' => $validated_req['address'],
                'postal_code' => $validated_req['postal_code'] ?? null,
                'bank_name' => $validated_req['bank_name'] ?? null,
                'bank_account_name' => $validated_req['bank_account_name'] ?? null,
                'iban' => $validated_req['iban'] ?? null,
                'swift_code' => $validated_req['swift_code'] ?? null,
                'bank_account_no' => $validated_req['bank_account_no'],
            ]);

            if (empty($accommodation_operator)) {
                throw new Exception('Something Went Wrong While Creating New Accommodation Operator');
            }

            $role = $this->role->where('name', 'Accommodation Operator')->first();
            if (empty($role)) {
                throw new Exception('Something Went Wrong While Creating New Accommodation Operator Please Create "Accommodation Operator" Role First');
            }

            $user->syncRoles($role->name);

            DB::commit();

            return [
                'status' => true,
                'message' => 'Accommodation Operator Created Successfully',
            ];
        } catch (Exception $e) {
            DB::rollBack();

            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function updateAccommodationOperator(Request $request, string $id)
    {
        $accommodation_operator = $this->getSingleAccommodationOperator($id);

        if (empty($accommodation_operator)) {
            return [
                'status' => false,
                'message' => 'Something Went Wrong While Fetching Accommodation Operator',
            ];
        }

        $user = $this->user->find($accommodation_operator->user_id);

        if (empty($user)) {
            return [
                'status' => false,
                'message' => 'Something Went Wrong While Fetching Linked User To Accommodation Operator',
            ];
        }

        $validated_req = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email,'.$user->id],
            'phone' => ['required', 'max:50', 'unique:users,phone,'.$user->id],
            ...(
                $request->filled('password') || $request->filled('password_confirmation')
                ? ['password' => ['required', 'string', 'min:8', 'max:50', 'confirmed']]
                : []
            ),
            'company_name' => ['required', 'string', 'max:255'],
            'address' => ['required', 'string', 'max:255'],
            'postal_code' => ['nullable', 'string', 'max:50'],
            'bank_name' => ['nullable', 'string', 'max:255'],
            'bank_account_name' => ['nullable', 'string', 'max:255'],
            'iban' => ['nullable', 'string', 'max:255'],
            'swift_code' => ['nullable', 'string', 'max:255'],
            'bank_account_no' => ['required', 'string', 'max:255'],
        ]);

        try {
            DB::beginTransaction();

            $user_updated = $user->update([
                'name' => $validated_req['name'],
                'email' => $validated_req['email'],
                'phone' => $validated_req['phone'],
                ...($request->filled('password') ? ['password' => bcrypt($validated_req['password'])] : []),
            ]);

            if (! $user_updated) {
                throw new Exception('Something Went Wrong While Updating Linked User To Accommodation Operator');
            }

            $accommodation_operator_updated = $accommodation_operator->update([
                'company_name' => $validated_req['company_name'],
                'address' => $validated_req['address'],
                'postal_code' => $validated_req['postal_code'] ?? null,
                'bank_name' => $validated_req['bank_name'] ?? null,
                'bank_account_name' => $validated_req['bank_account_name'] ?? null,
                'iban' => $validated_req['iban'] ?? null,
                'swift_code' => $validated_req['swift_code'] ?? null,
                'bank_account_no' => $validated_req['bank_account_no'],
            ]);

            if (! $accommodation_operator_updated) {
                throw new Exception('Something Went Wrong While Updating Accommodation Operator');
            }

            $role = $this->role->where('name', 'Accommodation Operator')->first();
            if (empty($role)) {
                throw new Exception('Something Went Wrong While Updating Accommodation Operator Please Create "Accommodation Operator" Role First');
            }

            $user->syncRoles($role->name);

            DB::commit();

            return [
                'status' => true,
                'message' => 'Accommodation Operator Updated Successfully',
            ];
        } catch (Exception $e) {
            DB::rollBack();

            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function destroyAccommodationOperator(string $id)
    {
        try {
            $accommodation_operator = $this->getSingleAccommodationOperator($id);

            if (empty($accommodation_operator)) {
                throw new Exception('Something Went Wrong While Fetching Accommodation Operator');
            }

            $user = $this->user->find($accommodation_operator->user_id);

            if (empty($user)) {
                throw new Exception('Something Went Wrong While Fetching Linked User To Accommodation Operator');
            }

            $deleted = $user->delete();
            if (! $deleted) {
                throw new Exception('Something Went Wrong While Deleting Linked User To Accommodation Operator');
            }

            return [
                'status' => true,
                'message' => 'Accommodation Operator Deleted Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function destroyAccommodationOperatorBySelection(Request $request)
    {
        try {
            $ids = $request->array('ids');

            if (blank($ids)) {
                throw new Exception('Something Went Wrong While Deleting Accommodation Operator');
            }

            foreach ($ids as $id) {
                $response = $this->destroyAccommodationOperator($id);

                if ($response['status'] === false) {
                    throw new Exception($response['message']);
                }
            }

            return [
                'status' => true,
                'message' => 'Selected Accommodation Operators Deleted Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }
}
