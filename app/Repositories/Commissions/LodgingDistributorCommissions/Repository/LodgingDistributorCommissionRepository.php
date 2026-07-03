<?php

namespace App\Repositories\Commissions\LodgingDistributorCommissions\Repository;

use App\Models\LodgingDistributorCommission;
use App\Repositories\Commissions\LodgingDistributorCommissions\Interface\ILodgingDistributorCommissionRepository;
use Exception;
use Illuminate\Http\Request;

class LodgingDistributorCommissionRepository implements ILodgingDistributorCommissionRepository
{
    public function __construct(
        private LodgingDistributorCommission $lodging_distributor_commission
    ) {}

    /**
     * Admin: unscoped (unchanged). Accommodation Distributor: only their own commission rows.
     * Accommodation Operator: read-only visibility into commissions on their own properties
     * (ledger transparency, per Joseph) — permission grant is View-only for that role, enforced
     * at the controller/permission layer, not here. Any other authenticated role (none currently
     * hold a permission that reaches this method, but this is the data-level backstop if that ever
     * changes) sees nothing, rather than falling through to an unscoped query.
     */
    private function applyOwnershipScope($query)
    {
        $user = auth()->user();

        if (empty($user) || $user->hasRole('Admin')) {
            return $query;
        }

        $isDistributor = $user->hasRole('Accommodation Distributor');
        $isOperator = $user->hasRole('Accommodation Operator');

        if (! $isDistributor && ! $isOperator) {
            return $query->whereRaw('1 = 0');
        }

        return $query
            ->when($isDistributor, function ($q) use ($user) {
                $q->whereHas('accommodationDistributor', function ($subQuery) use ($user) {
                    $subQuery->where('user_id', $user->id);
                });
            })
            ->when($isOperator, function ($q) use ($user) {
                $operatorId = $user->accommodationOperator?->id;
                $q->whereHas('reservation.lodgingProduct', function ($subQuery) use ($operatorId) {
                    $subQuery->where('accommodation_operator_id', $operatorId);
                });
            });
    }

    public function getAllLodgingDistributorCommissions(Request $request)
    {
        $lodging_distributor_commissions = $this->applyOwnershipScope($this->lodging_distributor_commission)
            ->with(['reservation', 'accommodationDistributor', 'accommodationDistributor.user'])
            ->when(! empty($request->input('search')), function ($query) use ($request) {
                $search = $request->input('search');
                $query->whereHas('reservation', function ($subQuery) use ($search) {
                    $subQuery->where('reservation_no', 'like', '%'.$search.'%');
                })
                    ->orWhereHas('accommodationDistributor.user', function ($subQuery) use ($search) {
                        $subQuery->where('name', 'like', '%'.$search.'%');
                    });
            })
            ->when(! empty($request->input('status')), function ($query) use ($request) {
                $query->where('status', $request->input('status'));
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return $lodging_distributor_commissions;
    }

    public function getSingleLodgingDistributorCommission(string $id)
    {
        $lodging_distributor_commission = $this->applyOwnershipScope($this->lodging_distributor_commission)
            ->with(['reservation', 'accommodationDistributor', 'accommodationDistributor.user'])
            ->find($id);

        return $lodging_distributor_commission;
    }

    public function updateLodgingDistributorCommission(Request $request, string $id)
    {
        $validated_req = $request->validate([
            'commission_rate' => ['required', 'numeric'],
            'commission_amount' => ['required', 'numeric'],
            'status' => ['required', 'in:paid,unpaid'],
        ]);

        try {
            $lodging_distributor_commission = $this->applyOwnershipScope($this->lodging_distributor_commission)->find($id);
            if (empty($lodging_distributor_commission)) {
                throw new Exception('Accommodation distributor commission not found');
            }

            if ($lodging_distributor_commission->status !== 'paid' && $validated_req['status'] === 'paid') {
                $validated_req['paid_at'] = now();
            }

            $updated = $lodging_distributor_commission->update($validated_req);

            if (! $updated) {
                throw new Exception('Failed to update accommodation distributor commission');
            }

            return [
                'status' => true,
                'message' => 'Accommodation distributor commission updated successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function destroyLodgingDistributorCommission(string $id)
    {
        try {
            $lodging_distributor_commission = $this->applyOwnershipScope($this->lodging_distributor_commission)->find($id);
            if (empty($lodging_distributor_commission)) {
                throw new Exception('Accommodation distributor commission not found');
            }

            $deleted = $lodging_distributor_commission->delete();

            if (! $deleted) {
                throw new Exception('Failed to delete accommodation distributor commission');
            }

            return [
                'status' => true,
                'message' => 'Accommodation distributor commission deleted successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function destroyLodgingDistributorCommissionBySelection(Request $request)
    {
        try {
            $ids = $request->array('ids');
            if (blank($ids)) {
                throw new Exception('Please select at least one accommodation distributor commission');
            }

            foreach ($ids as $id) {
                $response = $this->destroyLodgingDistributorCommission($id);
                if ($response['status'] === false) {
                    throw new Exception($response['message']);
                }
            }

            return [
                'status' => true,
                'message' => 'Accommodation distributor commission deleted successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }
}
