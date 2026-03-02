<?php

namespace App\Repositories\Commissions\PlatformCommissions\Repository;

use App\Models\Currency;
use App\Models\PlatformCommission;
use App\Repositories\Commissions\PlatformCommissions\Interface\IPlatformCommissionRepository;
use Exception;
use Illuminate\Http\Request;

class PlatformCommissionRepository implements IPlatformCommissionRepository
{
    public function __construct(
        private PlatformCommission $platform_commission,
        private Currency $currency
    ) {}

    public function getAllPlatformCommissions(Request $request)
    {
        $q = $this->platform_commission
            ->with(['currency', 'order', 'recordedBy'])

            ->when($request->filled('search'), function ($query) use ($request) {
                $search = $request->input('search');
                $query->whereHas('order', function ($sub) use ($search) {
                    $sub->where('order_no', 'like', "%{$search}%");
                });
            })

            // Status (virtual): pending|recorded
            ->when($request->filled('status'), function ($query) use ($request) {
                if ($request->input('status') === 'pending') {
                    $query->whereNull('recorded_at');
                } elseif ($request->input('status') === 'recorded') {
                    $query->whereNotNull('recorded_at');
                }
            })

            ->latest();

        return $q->paginate(10)->withQueryString();
    }

    public function getSinglePlatformCommission(string $id)
    {
        $platform_commission = $this->platform_commission
            ->with(['currency', 'order', 'recordedBy'])
            ->find($id);

        return $platform_commission;
    }

    public function updatePlatformCommission(Request $request, string $id)
    {
        $validated = $request->validate([
            'received_amount' => ['required', 'numeric', 'min:0'],
            'received_method' => ['required', 'in:crypto,bank_transfer,points'],
            'currency_id' => ['required', 'exists:currencies,id'],
            'note' => ['nullable', 'string'],
        ]);

        try {
            $pc = $this->platform_commission->find($id);
            if (empty($pc)) {
                throw new Exception('Platform commission not found');
            }

            if (! is_null($pc->recorded_at)) {
                throw new Exception('This commission is already recorded and cannot be edited.');
            }

            $validated['recorded_at'] = now();
            $validated['recorded_by'] = $request->user()->id;

            $updated = $pc->update($validated);

            if (! $updated) {
                throw new Exception('Failed to update platform commission');
            }

            return [
                'status' => true,
                'message' => 'Platform commission recorded successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function destroyPlatformCommission(string $id)
    {
        try {
            $platform_commission = $this->platform_commission->find($id);
            if (empty($platform_commission)) {
                throw new Exception('Platform commission not found');
            }

            $deleted = $platform_commission->delete();

            if (! $deleted) {
                throw new Exception('Failed to delete Platform commission');
            }

            return [
                'status' => true,
                'message' => 'Platform commission deleted successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function destroyPlatformCommissionBySelection(Request $request)
    {
        try {
            $ids = $request->array('ids');
            if (blank($ids)) {
                throw new Exception('Please select at least one Platform commission');
            }

            $deleted = $this->platform_commission->destroy($ids);

            if ($deleted !== count($ids)) {
                throw new Exception('Failed to delete Platform commission');
            }

            return [
                'status' => true,
                'message' => 'Platform commission deleted successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function getAllCurrencies()
    {
        return $this->currency->all();
    }
}
