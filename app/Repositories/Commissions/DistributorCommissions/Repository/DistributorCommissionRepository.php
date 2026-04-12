<?php

namespace App\Repositories\Commissions\DistributorCommissions\Repository;

use App\Models\DistributorCommission;
use App\Repositories\Commissions\DistributorCommissions\Interface\IDistributorCommissionRepository;
use Exception;
use Illuminate\Http\Request;

class DistributorCommissionRepository implements IDistributorCommissionRepository
{
    public function __construct(
        private DistributorCommission $distributor_commission
    ) {}

    public function getAllDistributorCommissions(Request $request)
    {
        $distributor_commissions = $this->distributor_commission
            ->with('order', 'distributor', 'distributor.user')
            ->when(! empty($request->input('search')), function ($query) use ($request) {

                $query->whereHas('order', function ($subQuery) use ($request) {
                    $subQuery->where('order_no', 'like', '%'.$request->input('search').'%');
                })
                    ->orWhereHas('distributor', function ($subQuery) use ($request) {
                        $subQuery->whereHas('user', function ($subSubQuery) use ($request) {
                            $subSubQuery->where('name', 'like', '%'.$request->input('search').'%');
                        });
                    });
            })
            ->when(! empty($request->input('status')), function ($query) use ($request) {
                $query->where('status', $request->input('status'));
            })
            ->when(! $request->user()->hasRole('Admin'), function ($query) use ($request) {
                $query->whereHas('distributor.user', function ($subQuery) use ($request) {
                    $subQuery->where('id', $request->user()->id);
                });
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return $distributor_commissions;
    }

    public function getSingleDistributorCommission(string $id)
    {
        $distributor_commission = $this->distributor_commission
            ->with('order', 'distributor', 'distributor.user')
            ->find($id);

        return $distributor_commission;
    }

    public function updateDistributorCommission(Request $request, string $id)
    {
        $validated_req = $request->validate([
            'commission_rate' => ['required', 'numeric'],
            'commission_amount' => ['required', 'numeric'],
            'status' => ['required', 'in:paid,unpaid'],
        ]);

        try {
            $distributor_commission = $this->distributor_commission->find($id);
            if (empty($distributor_commission)) {
                throw new Exception('Distributor commission not found');
            }

            if ($distributor_commission->status !== 'paid' && $validated_req['status'] === 'paid') {
                $validated_req['paid_at'] = now();
            }

            $updated = $distributor_commission->update($validated_req);

            if (! $updated) {
                throw new Exception('Failed to update Distributor commission');
            }

            return [
                'status' => true,
                'message' => 'Distributor commission updated successfully',
            ];

        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function destroyDistributorCommission(string $id)
    {
        try {
            $distributor_commission = $this->distributor_commission->find($id);
            if (empty($distributor_commission)) {
                throw new Exception('Distributor commission not found');
            }

            $deleted = $distributor_commission->delete();

            if (! $deleted) {
                throw new Exception('Failed to delete Distributor commission');
            }

            return [
                'status' => true,
                'message' => 'Distributor commission deleted successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function destroyDistributorCommissionBySelection(Request $request)
    {
        try {
            $ids = $request->array('ids');
            if (blank($ids)) {
                throw new Exception('Please select at least one Distributor commission');
            }

            $deleted = $this->distributor_commission->destroy($ids);

            if ($deleted !== count($ids)) {
                throw new Exception('Failed to delete Distributor commission');
            }

            return [
                'status' => true,
                'message' => 'Distributor commission deleted successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }
}
