<?php

namespace App\Repositories\Commissions\CollaboratorCommissions\Repository;

use App\Models\CollaboratorCommission;
use App\Repositories\Commissions\CollaboratorCommissions\Interface\ICollaboratorCommissionRepository;
use Exception;
use Illuminate\Http\Request;

class CollaboratorCommissionRepository implements ICollaboratorCommissionRepository
{
    public function __construct(
        private CollaboratorCommission $collaborator_commission
    ) {}

    public function getAllCollaboratorCommissions(Request $request)
    {
        $collaborator_commissions = $this->collaborator_commission
            ->with(['collaborator', 'collaborator.user', 'order'])
            ->when(! empty($request->input('search')), function ($query) use ($request) {

                $query->whereHas('order', function ($subQuery) use ($request) {
                    $subQuery->where('order_no', 'like', '%'.$request->input('search').'%');
                })
                    ->orWhereHas('collaborator', function ($subQuery) use ($request) {
                        $subQuery->whereHas('user', function ($subSubQuery) use ($request) {
                            $subSubQuery->where('name', 'like', '%'.$request->input('search').'%');
                        });
                    });
            })
            ->when(! empty($request->input('status')), function ($query) use ($request) {
                $query->where('status', $request->input('status'));
            })
            ->when(! $request->user()->hasRole('Admin'), function ($query) use ($request) {
                $query->whereHas('collaborator.user', function ($subQuery) use ($request) {
                    $subQuery->where('id', $request->user()->id);
                });
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return $collaborator_commissions;
    }

    public function getSingleCollaboratorCommission(string $id)
    {
        $collaborator_commission = $this->collaborator_commission
            ->with(['collaborator', 'collaborator.user', 'order'])
            ->find($id);

        return $collaborator_commission;
    }

    public function updateCollaboratorCommission(Request $request, string $id)
    {
        $validated_req = $request->validate([
            'commission_rate' => ['required', 'numeric'],
            'commission_amount' => ['required', 'numeric'],
            'status' => ['required', 'in:paid,unpaid'],
        ]);

        try {
            $collaborator_commission = $this->collaborator_commission->find($id);
            if (empty($collaborator_commission)) {
                throw new Exception('Collaborator commission not found');
            }

            if ($collaborator_commission->status !== 'paid' && $validated_req['status'] === 'paid') {
                $validated_req['paid_at'] = now();
            }

            $updated = $collaborator_commission->update($validated_req);

            if (! $updated) {
                throw new Exception('Failed to update Collaborator commission');
            }

            return [
                'status' => true,
                'message' => 'Collaborator commission updated successfully',
            ];

        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function destroyCollaboratorCommission(string $id)
    {
        try {
            $collaborator_commission = $this->collaborator_commission->find($id);
            if (empty($collaborator_commission)) {
                throw new Exception('Collaborator commission not found');
            }

            $deleted = $collaborator_commission->delete();

            if (! $deleted) {
                throw new Exception('Failed to delete Collaborator commission');
            }

            return [
                'status' => true,
                'message' => 'Collaborator commission deleted successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function destroyCollaboratorCommissionBySelection(Request $request)
    {
        try {
            $ids = $request->array('ids');
            if (blank($ids)) {
                throw new Exception('Please select at least one Collaborator commission');
            }

            $deleted = $this->collaborator_commission->destroy($ids);

            if ($deleted !== count($ids)) {
                throw new Exception('Failed to delete Collaborator commission');
            }

            return [
                'status' => true,
                'message' => 'Collaborator commission deleted successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }
}
