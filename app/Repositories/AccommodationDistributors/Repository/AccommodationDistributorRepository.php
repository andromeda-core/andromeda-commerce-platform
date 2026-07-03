<?php

namespace App\Repositories\AccommodationDistributors\Repository;

use App\Models\AccommodationDistributor;
use App\Models\User;
use App\Repositories\AccommodationDistributors\Interface\IAccommodationDistributorRepository;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AccommodationDistributorRepository implements IAccommodationDistributorRepository
{
    public function __construct(
        private AccommodationDistributor $accommodation_distributor,
        private User $user
    ) {}

    public function getAllAccommodationDistributors(Request $request)
    {
        $accommodation_distributors = $this->accommodation_distributor
            ->when(! empty($request->input('search')), function ($query) use ($request) {
                $query->where(function ($query) use ($request) {
                    $query->Where('bank_account_no', 'like', '%'.$request->input('search').'%')
                        ->orWhereHas('user', function ($subQ) use ($request) {
                            $subQ->where('name', 'like', '%'.$request->input('search').'%')
                                ->orWhere('email', 'like', '%'.$request->input('search').'%')
                                ->orWhere('phone', 'like', '%'.$request->input('search').'%');
                        });
                });
            })
            ->with('user')
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return $accommodation_distributors;
    }

    public function getSingleAccommodationDistributor(string $id)
    {
        $accommodation_distributor = $this->accommodation_distributor
            ->with(['user', 'user.roles'])
            ->latest()
            ->find($id);

        return $accommodation_distributor;
    }

    public function storeAccommodationDistributor(Request $request)
    {
        $validated_req = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['required', 'max:50', 'unique:users,phone'],
            'password' => ['required', 'string', 'min:8', 'max:50', 'confirmed'],
            'address' => ['required', 'string', 'max:255'],
            'postal_code' => ['required', 'string', 'max:50'],
            'bank_account_no' => ['required', 'string', 'max:255'],
            'bank_name' => ['required', 'string', 'max:255'],
            'bank_account_name' => ['required', 'string', 'max:255'],
            'iban' => ['required', 'string', 'max:255'],
            'swift_code' => ['required', 'string', 'max:255'],
            'commission_rate' => ['nullable', 'numeric', 'min:0', 'max:100'],
        ]);

        if ($validated_req['commission_rate'] == 0) {
            $validated_req['commission_rate'] = null;
        }

        try {
            DB::beginTransaction();

            $user = $this->user->create([
                'name' => $validated_req['name'],
                'email' => $validated_req['email'],
                'phone' => $validated_req['phone'],
                'password' => bcrypt($validated_req['password']),
            ]);

            if (empty($user)) {
                throw new Exception('Something Went Wrong While Creating New Linked User To Accommodation Distributor');
            }

            $user->syncRoles('Accommodation Distributor');

            $accommodation_distributor = $this->accommodation_distributor->create([
                'user_id' => $user->id,
                'address' => $validated_req['address'],
                'postal_code' => $validated_req['postal_code'],
                'bank_account_no' => $validated_req['bank_account_no'],
                'bank_name' => $validated_req['bank_name'],
                'bank_account_name' => $validated_req['bank_account_name'],
                'iban' => $validated_req['iban'],
                'swift_code' => $validated_req['swift_code'],
                'commission_rate' => $validated_req['commission_rate'] ?? null,
            ]);

            if (empty($accommodation_distributor)) {
                throw new Exception('Something Went Wrong While Creating New Accommodation Distributor');
            }

            DB::commit();

            return [
                'status' => true,
                'message' => 'Accommodation Distributor Created Successfully',
            ];
        } catch (Exception $e) {
            DB::rollBack();

            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function updateAccommodationDistributor(Request $request, string $id)
    {
        $accommodation_distributor = $this->getSingleAccommodationDistributor($id);

        if (empty($accommodation_distributor)) {
            return [
                'status' => false,
                'message' => 'Something Went Wrong While Fetching Accommodation Distributor',
            ];
        }

        $user = $this->user->find($accommodation_distributor->user_id);

        if (empty($user)) {
            return [
                'status' => false,
                'message' => 'Something Went Wrong While Fetching Linked User To Accommodation Distributor',
            ];
        }

        $validated_req = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['required', 'max:50', 'unique:users,phone,'.$user->id],
            ...(($request->filled('password') || $request->filled('password_confirmation')) ? ['password' => ['required', 'string', 'min:8', 'confirmed', 'max:50']] : []),
            'address' => ['required', 'string', 'max:255'],
            'postal_code' => ['required', 'string', 'max:50'],
            'bank_account_no' => ['required', 'string', 'max:255'],
            'bank_name' => ['required', 'string', 'max:255'],
            'bank_account_name' => ['required', 'string', 'max:255'],
            'iban' => ['required', 'string', 'max:255'],
            'swift_code' => ['required', 'string', 'max:255'],
            'commission_rate' => ['nullable', 'numeric', 'min:0', 'max:100'],
        ]);

        if ($validated_req['commission_rate'] == 0) {
            $validated_req['commission_rate'] = null;
        }

        try {
            DB::beginTransaction();

            $user_updated = $user->update([
                'name' => $validated_req['name'],
                'email' => $validated_req['email'],
                'phone' => $validated_req['phone'],
                ...($request->filled('password') ? ['password' => bcrypt($validated_req['password'])] : []),
            ]);

            if (! $user_updated) {
                throw new Exception('Something Went Wrong While Updating Linked User To Accommodation Distributor');
            }

            $accommodation_distributor_updated = $accommodation_distributor->update([
                'address' => $validated_req['address'],
                'postal_code' => $validated_req['postal_code'],
                'bank_account_no' => $validated_req['bank_account_no'],
                'bank_name' => $validated_req['bank_name'],
                'bank_account_name' => $validated_req['bank_account_name'],
                'iban' => $validated_req['iban'],
                'swift_code' => $validated_req['swift_code'],
                'commission_rate' => $validated_req['commission_rate'] ?? null,
            ]);

            if (! $accommodation_distributor_updated) {
                throw new Exception('Something Went Wrong While Updating Accommodation Distributor');
            }

            DB::commit();

            return [
                'status' => true,
                'message' => 'Accommodation Distributor Updated Successfully',
            ];
        } catch (Exception $e) {
            DB::rollBack();

            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function destroyAccommodationDistributor(string $id)
    {
        try {
            $accommodation_distributor = $this->getSingleAccommodationDistributor($id);

            if (empty($accommodation_distributor)) {
                throw new Exception('Something Went Wrong While Fetching Accommodation Distributor');
            }

            $user = $this->user->find($accommodation_distributor->user_id);

            if (empty($user)) {
                throw new Exception('Something Went Wrong While Fetching Linked User To Accommodation Distributor');
            }

            $deleted = $user->delete();
            if (! $deleted) {
                throw new Exception('Something Went Wrong While Deleting Linked User To Accommodation Distributor');
            }

            return [
                'status' => true,
                'message' => 'Accommodation Distributor Deleted Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function destroyAccommodationDistributorBySelection(Request $request)
    {
        try {
            $ids = $request->array('ids');

            if (blank($ids)) {
                throw new Exception('Something Went Wrong While Deleting Accommodation Distributor');
            }

            foreach ($ids as $id) {
                $response = $this->destroyAccommodationDistributor($id);

                if ($response['status'] === false) {
                    throw new Exception($response['message']);
                }
            }

            return [
                'status' => true,
                'message' => 'Selected Accommodation Distributors Deleted Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }
}
