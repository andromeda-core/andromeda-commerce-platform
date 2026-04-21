<?php

namespace App\Repositories\AttributionReward\Repository;

use App\Models\AttributionReward;
use App\Repositories\AttributionReward\Interface\IAttributionRewardRepository;
use Exception;
use Illuminate\Http\Request;

class AttributionRewardRepository implements IAttributionRewardRepository
{
    public function __construct(
        private AttributionReward $attribution_reward
    ) {}

    public function getAllAttributionRewards(Request $request)
    {
        return $this->attribution_reward->with(['productLink', 'rewardedTo', 'smartphone.model_name', 'order'])->latest()->paginate(10);
    }
    public function updateAttributionReward(Request $request, string $id)
    {
        try {
            $reward = $this->attribution_reward->find($id);

            if (empty($reward)) {
                throw new Exception('Attribution reward not found');
            }

            if ($reward->status !== 'accrued') {
                throw new Exception('Only accrued rewards can be released');
            }

            $reward->update([
                'status'      => 'released',
                'released_at' => now(),
            ]);

            return [
                'status'  => true,
                'message' => 'Attribution reward released successfully',
            ];
        } catch (\Exception $e) {
            return [
                'status'  => false,
                'message' => $e->getMessage(),
            ];
        }
    }
}
