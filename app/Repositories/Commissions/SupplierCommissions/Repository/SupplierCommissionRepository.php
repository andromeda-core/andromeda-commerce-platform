<?php

namespace App\Repositories\Commissions\SupplierCommissions\Repository;

use App\Models\SupplierCommission;
use App\Models\User;
use App\Repositories\Commissions\SupplierCommissions\Interface\ISupplierCommissionRepository;
use Exception;
use Illuminate\Http\Request;

class SupplierCommissionRepository implements ISupplierCommissionRepository
{
    public function __construct(
        private SupplierCommission $supplier_commission,
        private User $user,
    ) {}

    public function getAllSupplierCommissions(Request $request)
    {
        $supplier_commissions = $this->supplier_commission
            ->with(['order', 'supplier', 'supplier.user'])
            ->when(! empty($request->input('search')), function ($query) use ($request) {

                $query->whereHas('order', function ($subQuery) use ($request) {
                    $subQuery->where('order_no', 'like', '%'.$request->input('search').'%');
                })
                    ->orWhereHas('supplier', function ($subQuery) use ($request) {
                        $subQuery->whereHas('user', function ($subSubQuery) use ($request) {
                            $subSubQuery->where('name', 'like', '%'.$request->input('search').'%');
                        });
                    });
            })
            ->when(! empty($request->input('status')), function ($query) use ($request) {
                $query->where('status', $request->input('status'));
            })
            ->when(! $request->user()->hasRole('Admin'), function ($query) use ($request) {
                $query->whereHas('supplier.user', function ($subQuery) use ($request) {
                    $subQuery->where('id', $request->user()->id);
                });
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return $supplier_commissions;
    }

    public function getSingleSupplierCommission(string $id)
    {
        $supplier_commission = $this->supplier_commission
            ->with(['order', 'supplier', 'supplier.user'])
            ->find($id);

        return $supplier_commission;
    }

    public function updateSupplierCommission(Request $request, string $id)
    {
        $validated_req = $request->validate([
            'commission_rate' => ['required', 'numeric'],
            'commission_amount' => ['required', 'numeric'],
            'status' => ['required', 'in:paid,unpaid'],
        ]);

        try {
            $supplier_commission = $this->supplier_commission->find($id);
            if (empty($supplier_commission)) {
                throw new Exception('Supplier commission not found');
            }

            if ($supplier_commission->status !== 'paid' && $validated_req['status'] === 'paid') {
                $validated_req['paid_at'] = now();
            }

            $updated = $supplier_commission->update($validated_req);

            if (! $updated) {
                throw new Exception('Failed to update supplier commission');
            }

            return [
                'status' => true,
                'message' => 'Supplier commission updated successfully',
            ];

        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function destroySupplierCommission(string $id)
    {
        try {
            $supplier_commission = $this->supplier_commission->find($id);
            if (empty($supplier_commission)) {
                throw new Exception('Supplier commission not found');
            }

            $deleted = $supplier_commission->delete();

            if (! $deleted) {
                throw new Exception('Failed to delete supplier commission');
            }

            return [
                'status' => true,
                'message' => 'Supplier commission deleted successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function destroySupplierCommissionBySelection(Request $request)
    {
        try {
            $ids = $request->array('ids');
            if (blank($ids)) {
                throw new Exception('Please select at least one supplier commission');
            }

            $deleted = $this->supplier_commission->destroy($ids);

            if ($deleted !== count($ids)) {
                throw new Exception('Failed to delete supplier commission');
            }

            return [
                'status' => true,
                'message' => 'Supplier commission deleted successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }
}
