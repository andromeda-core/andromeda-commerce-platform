<?php

namespace App\Repositories\RiskSignal\Repository;

use App\Models\AccountRiskSignal;
use App\Repositories\RiskSignal\Interface\IRiskSignalRepository;
use Exception;
use Illuminate\Http\Request;

class RiskSignalRepository implements IRiskSignalRepository
{
    public function __construct(
        private AccountRiskSignal $account_risk_signal
    ) {}

    public function getAllRiskSignals(Request $request)
    {
        return $this->account_risk_signal
            ->with(['user', 'resolvedBy'])
            ->when(! empty($request->input('search')), function ($query) use ($request) {
                $query->whereHas('user', function ($query) use ($request) {
                    $query->where('name', 'like', '%'.$request->input('search').'%')
                        ->orWhere('email', 'like', '%'.$request->input('search').'%')
                        ->orWhere('phone', 'like', '%'.$request->input('search').'%');
                });
            })
            ->when(! empty($request->input('status')), function ($query) use ($request) {
                $query->where('status', $request->input('status'));
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();
    }

    public function updateRiskSignal(Request $request, ?string $id = null)
    {

        try {
            if (empty($id)) {
                throw new Exception('Risk Signal Id Not Found');
            }
            $risk_signal = $this->account_risk_signal
                ->where('id', $id)
                ->first();

            if (empty($risk_signal)) {
                throw new Exception('Risk Signal Not Found');
            }

            if ($risk_signal->status === 'resolved') {
                throw new Exception('Risk Signal Already Resolved');
            }

            if ($risk_signal->status === 'expired') {
                throw new Exception('Risk Signal Already Expired');
            }

            $updated = $risk_signal->update([
                'resolved_by' => auth()->user()->id,
                'status' => 'resolved',
            ]);

            if (! $updated) {
                throw new Exception('Something Went Wrong While Updating Risk Signal');
            }

            return ['status' => true, 'message' => 'Risk Signal Updated Successfully'];

        } catch (Exception $e) {
            return ['status' => false, 'message' => $e->getMessage()];
        }
    }
}
