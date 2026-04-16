<?php

namespace App\Repositories\OrderCourierCompany\Repository;

use App\Models\OrderCourierCompany;
use App\Repositories\OrderCourierCompany\Interface\IOrderCourierCompanyRepository;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderCourierCompanyRepository implements IOrderCourierCompanyRepository
{
    public function __construct(
        private OrderCourierCompany $orderCourierCompany,
    ) {}

    public function getAll(Request $request)
    {
        $orderCourierCompanies = $this->orderCourierCompany
            ->when(!empty($request->input('search')), function ($query) use ($request) {
                $query->where(function ($subQ) use ($request) {
                    $subQ->where('name', 'like', '%' . $request->input('search') . '%')
                        ->orWhere('address', 'like', '%' . $request->input('search') . '%')
                        ->orWhere('postal_code', 'like', '%' . $request->input('search') . '%')
                        ->orWhere('phone', 'like', '%' . $request->input('search') . '%');
                });
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return $orderCourierCompanies;
    }

    public function create()
    {
        // Return any data needed for create form
        return [];
    }

    public function store(Request $request)
    {
        $validated_req = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'address' => ['required', 'string'],
            'postal_code' => ['required', 'string', 'max:50'],
            'phone' => ['required', 'string', 'max:50'],
        ]);

        try {
            DB::beginTransaction();

            $created = $this->orderCourierCompany->create($validated_req);

            if (empty($created)) {
                throw new Exception('Something Went Wrong While Creating Order Courier Company');
            }

            DB::commit();

            return [
                'status' => true,
                'message' => 'Order Courier Company Created Successfully',
            ];
        } catch (Exception $e) {
            DB::rollBack();

            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function edit(string $id)
    {
        $orderCourierCompany = $this->orderCourierCompany->find($id);

        if (empty($orderCourierCompany)) {
            return [
                'status' => false,
                'message' => 'Order Courier Company Not Found',
            ];
        }

        return $orderCourierCompany;
    }

    public function update(Request $request, string $id)
    {
        $orderCourierCompany = $this->orderCourierCompany->find($id);

        if (empty($orderCourierCompany)) {
            return [
                'status' => false,
                'message' => 'Order Courier Company Not Found',
            ];
        }

        $validated_req = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'address' => ['required', 'string'],
            'postal_code' => ['required', 'string', 'max:50'],
            'phone' => ['required', 'string', 'max:50'],
        ]);

        try {
            DB::beginTransaction();

            $updated = $orderCourierCompany->update($validated_req);

            if (!$updated) {
                throw new Exception('Something Went Wrong While Updating Order Courier Company');
            }

            DB::commit();

            return [
                'status' => true,
                'message' => 'Order Courier Company Updated Successfully',
            ];
        } catch (Exception $e) {
            DB::rollBack();

            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function toggleStatus(string $id)
    {
        try {
            $orderCourierCompany = $this->orderCourierCompany->find($id);

            if (empty($orderCourierCompany)) {
                throw new Exception('Order Courier Company Not Found');
            }

            DB::beginTransaction();

            $updated = $orderCourierCompany->update([
                'is_active' => !$orderCourierCompany->is_active,
            ]);

            if (!$updated) {
                throw new Exception('Something Went Wrong While Updating Status');
            }

            DB::commit();

            return [
                'status' => true,
                'message' => 'Status Updated Successfully',
            ];
        } catch (Exception $e) {
            DB::rollBack();

            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function destroy(string $id)
    {
        try {
            $orderCourierCompany = $this->orderCourierCompany->find($id);

            if (empty($orderCourierCompany)) {
                throw new Exception('Order Courier Company Not Found');
            }

            DB::beginTransaction();

            $deleted = $orderCourierCompany->delete();

            if (!$deleted) {
                throw new Exception('Something Went Wrong While Deleting Order Courier Company');
            }

            DB::commit();

            return [
                'status' => true,
                'message' => 'Order Courier Company Deleted Successfully',
            ];
        } catch (Exception $e) {
            DB::rollBack();

            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function destroyBySelection(Request $request)
    {
        try {
            $ids = $request->array('ids');

            if (blank($ids)) {
                throw new Exception('Please Select Atleast One Order Courier Company To Delete');
            }

            DB::beginTransaction();

            foreach ($ids as $id) {
                $response = $this->destroy($id);

                if ($response['status'] === false) {
                    throw new Exception($response['message']);
                }
            }

            DB::commit();

            return [
                'status' => true,
                'message' => 'Selected Order Courier Companies Deleted Successfully',
            ];
        } catch (Exception $e) {
            DB::rollBack();

            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function getAllWithoutPagination()
    {
        return $this->orderCourierCompany
            ->where('is_active', true)
            ->orderBy('name')
            ->get();
    }
}
