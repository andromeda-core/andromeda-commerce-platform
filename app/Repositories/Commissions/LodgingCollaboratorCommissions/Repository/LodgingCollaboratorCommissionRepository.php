<?php

namespace App\Repositories\Commissions\LodgingCollaboratorCommissions\Repository;

use App\Models\LodgingCollaboratorCommission;
use App\Repositories\Commissions\LodgingCollaboratorCommissions\Interface\ILodgingCollaboratorCommissionRepository;
use Exception;
use Illuminate\Http\Request;

class LodgingCollaboratorCommissionRepository implements ILodgingCollaboratorCommissionRepository
{
    public function __construct(
        private LodgingCollaboratorCommission $lodging_collaborator_commission
    ) {}

    /**
     * Admin: unscoped (unchanged). Accommodation Operator: read-only visibility into commissions
     * on their own properties (ledger transparency), same as the Distributor/Platform ledgers.
     * Collaborator: only their own commission rows — no permission is currently granted for this
     * role to reach this ledger (row creation itself is Phase 4), so this scoping has nothing to
     * scope yet, but is correct and safe the moment that permission/rows exist. Any other
     * authenticated role sees nothing, rather than falling through to an unscoped query.
     */
    private function applyOwnershipScope($query)
    {
        $user = auth()->user();

        if (empty($user) || $user->hasRole('Admin')) {
            return $query;
        }

        $isOperator = $user->hasRole('Accommodation Operator');
        $isCollaborator = $user->hasRole('Collaborator');

        if (! $isOperator && ! $isCollaborator) {
            return $query->whereRaw('1 = 0');
        }

        return $query
            ->when($isOperator, function ($q) use ($user) {
                $operatorId = $user->accommodationOperator?->id;
                $q->whereHas('reservation.lodgingProduct', function ($subQuery) use ($operatorId) {
                    $subQuery->where('accommodation_operator_id', $operatorId);
                });
            })
            ->when($isCollaborator, function ($q) use ($user) {
                $q->whereHas('collaborator', function ($subQuery) use ($user) {
                    $subQuery->where('user_id', $user->id);
                });
            });
    }

    public function getAllLodgingCollaboratorCommissions(Request $request)
    {
        $lodging_collaborator_commissions = $this->applyOwnershipScope($this->lodging_collaborator_commission)
            ->with(['reservation', 'collaborator', 'collaborator.user'])
            ->when(! empty($request->input('search')), function ($query) use ($request) {
                $search = $request->input('search');
                $query->whereHas('reservation', function ($subQuery) use ($search) {
                    $subQuery->where('reservation_no', 'like', '%'.$search.'%');
                })
                    ->orWhereHas('collaborator.user', function ($subQuery) use ($search) {
                        $subQuery->where('name', 'like', '%'.$search.'%');
                    });
            })
            ->when(! empty($request->input('status')), function ($query) use ($request) {
                $query->where('status', $request->input('status'));
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return $lodging_collaborator_commissions;
    }

    public function getSingleLodgingCollaboratorCommission(string $id)
    {
        $lodging_collaborator_commission = $this->applyOwnershipScope($this->lodging_collaborator_commission)
            ->with(['reservation', 'collaborator', 'collaborator.user'])
            ->find($id);

        return $lodging_collaborator_commission;
    }

    public function updateLodgingCollaboratorCommission(Request $request, string $id)
    {
        $validated_req = $request->validate([
            'commission_rate' => ['required', 'numeric'],
            'commission_amount' => ['required', 'numeric'],
            'status' => ['required', 'in:paid,unpaid'],
        ]);

        try {
            $lodging_collaborator_commission = $this->applyOwnershipScope($this->lodging_collaborator_commission)->find($id);
            if (empty($lodging_collaborator_commission)) {
                throw new Exception('Accommodation collaborator commission not found');
            }

            if ($lodging_collaborator_commission->status !== 'paid' && $validated_req['status'] === 'paid') {
                $validated_req['paid_at'] = now();
            }

            $updated = $lodging_collaborator_commission->update($validated_req);

            if (! $updated) {
                throw new Exception('Failed to update accommodation collaborator commission');
            }

            return [
                'status' => true,
                'message' => 'Accommodation collaborator commission updated successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function destroyLodgingCollaboratorCommission(string $id)
    {
        try {
            $lodging_collaborator_commission = $this->applyOwnershipScope($this->lodging_collaborator_commission)->find($id);
            if (empty($lodging_collaborator_commission)) {
                throw new Exception('Accommodation collaborator commission not found');
            }

            $deleted = $lodging_collaborator_commission->delete();

            if (! $deleted) {
                throw new Exception('Failed to delete accommodation collaborator commission');
            }

            return [
                'status' => true,
                'message' => 'Accommodation collaborator commission deleted successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function destroyLodgingCollaboratorCommissionBySelection(Request $request)
    {
        try {
            $ids = $request->array('ids');
            if (blank($ids)) {
                throw new Exception('Please select at least one accommodation collaborator commission');
            }

            foreach ($ids as $id) {
                $response = $this->destroyLodgingCollaboratorCommission($id);
                if ($response['status'] === false) {
                    throw new Exception($response['message']);
                }
            }

            return [
                'status' => true,
                'message' => 'Accommodation collaborator commission deleted successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }
}
