<?php

namespace App\Repositories\Commissions\LodgingPlatformCommissions\Repository;

use App\Models\LodgingPlatformCommission;
use App\Repositories\Commissions\LodgingPlatformCommissions\Interface\ILodgingPlatformCommissionRepository;
use Exception;
use Illuminate\Http\Request;

class LodgingPlatformCommissionRepository implements ILodgingPlatformCommissionRepository
{
    public function __construct(
        private LodgingPlatformCommission $lodging_platform_commission
    ) {}

    /**
     * Admin: unscoped (unchanged). Platform commission has no partner FK, so only Accommodation
     * Operator scoping applies here (read-only visibility into their own properties' rows).
     * Accommodation Distributor / Collaborator hold no permission to reach this ledger today, and
     * by design should never see platform-level rows outside their own properties (they have none)
     * — any non-Operator, non-Admin authenticated user sees nothing here, never an unscoped list.
     */
    private function applyOwnershipScope($query)
    {
        $user = auth()->user();

        if (empty($user) || $user->hasRole('Admin')) {
            return $query;
        }

        if (! $user->hasRole('Accommodation Operator')) {
            return $query->whereRaw('1 = 0');
        }

        $operatorId = $user->accommodationOperator?->id;

        return $query->whereHas('reservation.lodgingProduct', function ($subQuery) use ($operatorId) {
            $subQuery->where('accommodation_operator_id', $operatorId);
        });
    }

    public function getAllLodgingPlatformCommissions(Request $request)
    {
        $lodging_platform_commissions = $this->applyOwnershipScope($this->lodging_platform_commission)
            ->with(['reservation'])
            ->when(! empty($request->input('search')), function ($query) use ($request) {
                $search = $request->input('search');
                $query->whereHas('reservation', function ($subQuery) use ($search) {
                    $subQuery->where('reservation_no', 'like', '%'.$search.'%');
                });
            })
            ->when(! empty($request->input('status')), function ($query) use ($request) {
                $query->where('status', $request->input('status'));
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return $lodging_platform_commissions;
    }

    public function getSingleLodgingPlatformCommission(string $id)
    {
        $lodging_platform_commission = $this->applyOwnershipScope($this->lodging_platform_commission)
            ->with(['reservation'])
            ->find($id);

        return $lodging_platform_commission;
    }

    public function updateLodgingPlatformCommission(Request $request, string $id)
    {
        $validated_req = $request->validate([
            'commission_rate' => ['required', 'numeric'],
            'commission_amount' => ['required', 'numeric'],
            'status' => ['required', 'in:paid,unpaid'],
        ]);

        try {
            $lodging_platform_commission = $this->applyOwnershipScope($this->lodging_platform_commission)->find($id);
            if (empty($lodging_platform_commission)) {
                throw new Exception('Accommodation platform commission not found');
            }

            if ($lodging_platform_commission->status !== 'paid' && $validated_req['status'] === 'paid') {
                $validated_req['paid_at'] = now();
            }

            $updated = $lodging_platform_commission->update($validated_req);

            if (! $updated) {
                throw new Exception('Failed to update accommodation platform commission');
            }

            return [
                'status' => true,
                'message' => 'Accommodation platform commission updated successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function destroyLodgingPlatformCommission(string $id)
    {
        try {
            $lodging_platform_commission = $this->applyOwnershipScope($this->lodging_platform_commission)->find($id);
            if (empty($lodging_platform_commission)) {
                throw new Exception('Accommodation platform commission not found');
            }

            $deleted = $lodging_platform_commission->delete();

            if (! $deleted) {
                throw new Exception('Failed to delete accommodation platform commission');
            }

            return [
                'status' => true,
                'message' => 'Accommodation platform commission deleted successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function destroyLodgingPlatformCommissionBySelection(Request $request)
    {
        try {
            $ids = $request->array('ids');
            if (blank($ids)) {
                throw new Exception('Please select at least one accommodation platform commission');
            }

            foreach ($ids as $id) {
                $response = $this->destroyLodgingPlatformCommission($id);
                if ($response['status'] === false) {
                    throw new Exception($response['message']);
                }
            }

            return [
                'status' => true,
                'message' => 'Accommodation platform commission deleted successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }
}
