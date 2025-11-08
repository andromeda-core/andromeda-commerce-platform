<?php

namespace App\Repositories\Distributors\Repository;

use App\Models\Distributor;
use App\Models\User;
use App\Repositories\Distributors\Interface\IDistributorRepository;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DistributorRepository implements IDistributorRepository
{
    public function __construct(
        private Distributor $distributor,
        private User $user
    ) {}

    public function getAllDistributors(Request $request)
    {
        $distributors = $this->distributor
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

        return $distributors;
    }

    public function getSingleDistributor(string $id)
    {
        $distributor = $this->distributor
            ->with(['user', 'user.roles', 'categories'])
            ->latest()
            ->find($id);

        return $distributor;
    }

    public function storeDistributor(Request $request)
    {
        $validated_req = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => 'required|regex:/^\+\d+$/|unique:users,phone',
            'password' => ['required', 'string', 'min:8', 'max:50', 'confirmed'],
            'address' => ['required', 'string', 'max:255'],
            'bank_account_no' => ['required', 'string', 'max:255'],
            'bank_name' => ['required', 'string', 'max:255'],
            'bank_account_name' => ['required', 'string', 'max:255'],
            'iban' => ['required', 'string', 'max:255'],
            'swift_code' => ['required', 'string', 'max:255'],
            'commission_rate' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'is_active' => ['required', 'boolean'],
        ], [
            'phone.regex' => 'The Number Accepted With + Country Code - Example: +8801xxxxxxxxx',
            'is_active.required' => 'The Distributor Status Field Is Required.',
            'is_active.boolean' => 'The Distributor Status Must Be Active Or In-Active.',
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
                'is_active' => $validated_req['is_active'],
            ]);

            if (empty($user)) {
                throw new Exception('Something Went Wrong While Creating New Linked User To Distributor');
            }

            $user->syncRoles('Distributor');

            $distributor = $this->distributor->create([
                'user_id' => $user->id,
                'address' => $validated_req['address'],
                'bank_account_no' => $validated_req['bank_account_no'],
                'bank_name' => $validated_req['bank_name'],
                'bank_account_name' => $validated_req['bank_account_name'],
                'iban' => $validated_req['iban'],
                'swift_code' => $validated_req['swift_code'],
                'commission_rate' => $validated_req['commission_rate'] ?? null,
            ]);

            if (empty($distributor)) {
                throw new Exception('Something Went Wrong While Creating New Distributor');
            }

            DB::commit();

            return [
                'status' => true,
                'message' => 'Distributor Created Successfully',
            ];

        } catch (Exception $e) {
            DB::rollBack();

            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function updateDistributor(Request $request, string $id)
    {

        $distributor = $this->getSingleDistributor($id);

        if (empty($distributor)) {
            return [
                'status' => false,
                'message' => 'Something Went Wrong While Fetching Distributor',
            ];
        }

        $user = $this->user->find($distributor->user_id);

        if (empty($user)) {
            return [
                'status' => false,
                'message' => 'Something Went Wrong While Fetching Linked User To Distributor',
            ];

        }

        $validated_req = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => 'required|regex:/^\+\d+$/|unique:users,phone,'.$user->id,
            ...(($request->filled('password') || $request->filled('password_confirmation')) ? ['password' => ['required', 'string', 'min:8', 'confirmed', 'max:50']] : []),
            'address' => ['required', 'string', 'max:255'],
            'bank_account_no' => ['required', 'string', 'max:255'],
            'bank_name' => ['required', 'string', 'max:255'],
            'bank_account_name' => ['required', 'string', 'max:255'],
            'iban' => ['required', 'string', 'max:255'],
            'swift_code' => ['required', 'string', 'max:255'],
            'commission_rate' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'is_active' => ['required', 'boolean'],
        ], [
            'phone.regex' => 'The Number Accepted With + Country Code - Example: +8801xxxxxxxxx',
            'is_active.required' => 'The Distributor Status Field Is Required.',
            'is_active.boolean' => 'The Distributor Status Must Be Active Or In-Active.',
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
                'is_active' => $validated_req['is_active'],
            ]);

            if (! $user_updated) {
                throw new Exception('Something Went Wrong While Updating Linked User To Distributor');
            }

            $distributor_updated = $distributor->update([
                'address' => $validated_req['address'],
                'bank_account_no' => $validated_req['bank_account_no'],
                'bank_name' => $validated_req['bank_name'],
                'bank_account_name' => $validated_req['bank_account_name'],
                'iban' => $validated_req['iban'],
                'swift_code' => $validated_req['swift_code'],
                'commission_rate' => $validated_req['commission_rate'] ?? null,
            ]);

            if (! $distributor_updated) {
                throw new Exception('Something Went Wrong While Updating Distributor');
            }

            DB::commit();

            return [
                'status' => true,
                'message' => 'Distributor Updated Successfully',
            ];

        } catch (Exception $e) {
            DB::rollBack();

            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function destroyDistributor(string $id)
    {
        try {
            $distributor = $this->getSingleDistributor($id);

            if (empty($distributor)) {
                throw new Exception('Something Went Wrong While Fetching Distributor');
            }

            $user = $this->user->find($distributor->user_id);

            if (empty($user)) {
                throw new Exception('Something Went Wrong While Fetching Linked User To Distributor');
            }

            $deleted = $user->delete();
            if (! $deleted) {
                throw new Exception('Something Went Wrong While Deleting Linked User To Distributor');
            }

            return [
                'status' => true,
                'message' => 'Distributor Deleted Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function destroyDistributorBySelection(Request $request)
    {
        try {
            $ids = $request->array('ids');

            if (blank($ids)) {
                throw new Exception('Something Went Wrong While Deleting Distributor');
            }

            foreach ($ids as $id) {
                $response = $this->destroyDistributor($id);

                if ($response['status'] === false) {
                    throw new Exception($response['message']);
                }
            }

            return [
                'status' => true,
                'message' => 'Selected Distributors Deleted Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }
}
