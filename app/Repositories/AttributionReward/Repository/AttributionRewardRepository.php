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
        $rewards = $this->attribution_reward
            ->with(['productLink', 'rewardedTo', 'smartphone.model_name', 'smartphone.model_name.contentTranslations', 'order'])
            ->latest()
            ->paginate(10);

        // Locale-aware model name (Phase 3c): display-only in-memory translation.
        // Default locale short-circuits (no change, no extra queries).
        // if (app()->getLocale() !== config('app.fallback_locale', 'en')) {
        //     $rewards->getCollection()->each(function ($reward) {
        //         $modelName = $reward->smartphone?->model_name;
        //         if ($modelName) {
        //             $modelName->name = $modelName->translatedValue('name');
        //         }
        //     });
        // }

        return $rewards;
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
