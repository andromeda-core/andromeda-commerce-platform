<?php

namespace App\Repositories\Suppliers\Repository;

use App\Models\Role;
use App\Models\Supplier;
use App\Models\User;
use App\Repositories\Suppliers\Interface\ISupplierRepository;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SupplierRepository implements ISupplierRepository
{
    public function __construct(
        private Supplier $supplier,
        private Role $role,
        private User $user
    ) {}

    public function getAllSuppliers(Request $request)
    {
        $suppliers = $this->supplier
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

        return $suppliers;
    }

    public function getSingleSupplier(string $id)
    {
        $supplier = $this->supplier
            ->with(['user', 'user.roles'])
            ->find($id);

        return $supplier;
    }

    public function storeSupplier(Request $request)
    {
        $validated_req = $request->validate([
            'company_name' => ['required', 'string', 'max:255'],
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'max:50', 'confirmed'],
            'phone' => ['required', 'max:50', 'unique:users,phone'],
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
                throw new Exception('Something Went Wrong While Creating New Linked User To Supplier');
            }

            $supplier = $this->supplier->create([

                'company_name' => $validated_req['company_name'],
                'user_id' => $user->id,
            ]);

            if (empty($supplier)) {
                throw new Exception('Something Went Wrong While Creating New Supplier');
            }

            $role = $this->role->where('name', 'Supplier')->first();
            if (empty($role)) {
                throw new Exception('Something Went Wrong While Creating New Supplier Please Create "Supplier" Role First');
            }

            $user->syncRoles($role->name);

            DB::commit();

            return [
                'status' => true,
                'message' => 'Supplier Created Successfully',
            ];

        } catch (Exception $e) {
            DB::rollBack();

            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function updateSupplier(Request $request, string $id)
    {

        $supplier = $this->getSingleSupplier($id);

        if (empty($supplier)) {
            return [
                'status' => false,
                'message' => 'Something Went Wrong While Fetching Supplier',
            ];
        }

        $user = $this->user->find($supplier->user_id);

        if (empty($user)) {
            return [
                'status' => false,
                'message' => 'Something Went Wrong While Fetching Linked User To Supplier',
            ];
        }

        $validated_req = $request->validate([
            'company_name' => ['required', 'string', 'max:255'],

            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email,'.$user->id],
            ...(
                $request->filled('password')
                ||
                $request->filled('password_confirmation')
                ? ['password' => ['required', 'string', 'min:8', 'max:50', 'confirmed']]
                :
                []
            ),
            'phone' => ['required', 'max:50', 'unique:users,phone,'.$user->id],
        ]);

        try {
            DB::beginTransaction();
            $user_updated = $user->update([
                'name' => $validated_req['name'],
                'email' => $validated_req['email'],
                'phone' => $validated_req['phone'],
                ...(! empty($validated_req['password']) ? ['password' => $validated_req['password']] : []),
            ]);

            if (! $user_updated) {
                throw new Exception('Something Went Wrong While Updating Linked User To Supplier');
            }

            $supplier_updated = $supplier->update([
                'company_name' => $validated_req['company_name'],

            ]);

            if (! $supplier_updated) {
                throw new Exception('Something Went Wrong While Updating Supplier');
            }

            $role = $this->role->where('name', 'Supplier')->first();
            if (empty($role)) {
                throw new Exception('Something Went Wrong While Creating New Supplier Please Create "Supplier" Role First');
            }

            $user->syncRoles($role->name);
            DB::commit();

            return [
                'status' => true,
                'message' => 'Supplier Updated Successfully',
            ];

        } catch (Exception  $e) {
            DB::rollBack();

            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function destroySupplier(string $id)
    {
        try {
            DB::beginTransaction();
            $supplier = $this->getSingleSupplier($id);

            if (empty($supplier)) {
                throw new Exception('Something Went Wrong While Deleting Supplier');
            }

            $createdAt = $supplier->created_at instanceof \Carbon\Carbon
                    ? $supplier->created_at
                    : \Carbon\Carbon::parse($supplier->created_at);

            $yearsPassed = (int) $createdAt->diffInYears(now());
            if ($yearsPassed < 5) {
                throw new Exception('Supplier Can Not Be Deleted Before 5 Years And Currently '.$yearsPassed.' Years Passed');
            }

            $user = $this->user->find($supplier->user_id);

            if (empty($user)) {
                throw new Exception('Something Went Wrong While Deleting Linked User To Supplier');
            }

            $supplier_deleted = $supplier->delete();

            if (! $supplier_deleted) {
                throw new Exception('Something Went Wrong While Deleting Supplier');
            }

            $user_deleted = $user->delete();

            if (! $user_deleted) {
                throw new Exception('Something Went Wrong While Deleting Linked User To Supplier');
            }

            DB::commit();

            return [
                'status' => true,
                'message' => 'Supplier Deleted Successfully',
            ];

        } catch (Exception  $e) {
            DB::rollBack();

            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function destroySupplierBySelection(Request $request)
    {
        try {

            $ids = $request->array('ids');

            if (blank($ids)) {
                throw new Exception('Something Went Wrong While Deleting Supplier');
            }

            $suppliers = $this->supplier->whereIn('id', $ids)->get();

            foreach ($suppliers as $supplier) {
                $response = $this->destroySupplier($supplier->id);

                if ($response['status'] === false) {
                    throw new Exception($response['message']);
                }
            }

            return [
                'status' => true,
                'message' => 'Selected Suppliers Deleted Successfully',
            ];

        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }
}
