<?php

namespace App\Repositories\RewardPoints\Repository;

use App\Models\RewardPoint;
use App\Models\User;
use App\Repositories\RewardPoints\Interface\IRewardPointRepository;
use Exception;
use Illuminate\Http\Request;

class RewardPointRepository implements IRewardPointRepository
{
    public function __construct(
        private RewardPoint $reward_point,
        private User $user
    ) {}

    public function getAllRewardPoints(Request $request)
    {
        $reward_points = $this->reward_point
            ->with('user')
            ->when(! empty($request->input('search')), function ($query) use ($request) {
                $query->whereHas('user', function ($query) use ($request) {
                    $query->where('name', 'like', '%'.$request->input('search').'%');
                });
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return $reward_points;
    }

    public function getSingleRewardPoint(string $id)
    {
        $reward_point = $this->reward_point
            ->with('user')
            ->find($id);

        return $reward_point;
    }

    public function storeRewardPoint(Request $request)
    {
        $validated_req = $request->validate([
            'user_id' => ['required', 'exists:users,id'],
            'points' => ['required', 'integer', 'min:1'],
        ], [
            'user_id.required' => 'User Field Is Required.',
            'user_id.exists' => 'User Does Not Exists.',
        ]);

        try {
            $expiry = now()->addYears(5);

            $reward_point = $this->reward_point->create([
                'user_id' => $validated_req['user_id'],
                'points' => $validated_req['points'],
                'expires_at' => $expiry,
            ]);

            if (empty($reward_point)) {
                throw new Exception('Something Went Wrong While Creating Reward Point');
            }

            return [
                'status' => true,
                'message' => 'Reward Point Created Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function updateRewardPoint(Request $request, string $id)
    {

        $validated_req = $request->validate([
            'user_id' => ['required', 'exists:users,id'],
            'points' => ['required', 'integer', 'min:1'],
        ], [
            'user_id.required' => 'User Field Is Required.',
            'user_id.exists' => 'User Does Not Exists.',
        ]);

        try {

            $reward_point = $this->getSingleRewardPoint($id);

            if (empty($reward_point)) {
                throw new Exception('Something Went Wrong While Fetching Reward Point');
            }

            $updated = $reward_point->update($validated_req);

            if (! $updated) {
                throw new Exception('Something Went Wrong While Updating Reward Point');
            }

            return [
                'status' => true,
                'message' => 'Reward Point Updated Successfully',
            ];

        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function destroyRewardPoint(string $id)
    {
        try {
            $reward_point = $this->getSingleRewardPoint($id);

            if (empty($reward_point)) {
                throw new Exception('Something Went Wrong While Fetching Reward Point');
            }

            $deleted = $reward_point->delete();

            if (! $deleted) {
                throw new Exception('Something Went Wrong While Deleting Reward Point');
            }

            return [
                'status' => true,
                'message' => 'Reward Point Deleted Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function destroyRewardPointBySelection(Request $request)
    {
        try {
            $ids = $request->array('ids');

            if (blank($ids)) {
                throw new Exception('Something Went Wrong While Deleting Reward Point');
            }

            $deleted = $this->reward_point->destroy($ids);

            if ($deleted !== count($ids)) {
                throw new Exception('Something Went Wrong While Deleting Reward Point');
            }

            return [
                'status' => true,
                'message' => 'Selected Reward Points Deleted Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function getUsers()
    {
        return $this->user->get()->map(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name.' ('.$user->email.')',
            ];
        });
    }
}
