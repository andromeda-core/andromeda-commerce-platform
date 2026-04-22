<?php

namespace App\Services;

use App\Models\AttributionReward;
use App\Models\AttributionRewardSetting;
use App\Models\Order;

class AttributionRewardService
{
    public function createReward(Order $order): ?AttributionReward
    {
        if (
            empty($order->attribution_link_id) ||
            empty($order->attributed_to_user_id) ||
            empty($order->attributed_smartphone_id)
        ) {
            return null;
        }

        if ($order->attributionReward()->exists()) {
            return null;
        }

        $setting = AttributionRewardSetting::first();
        if (empty($setting) || $setting->value <= 0) {
            return null;
        }



        $attributedItem = $order->orderItems()
            ->where('smartphone_id', $order->attributed_smartphone_id)
            ->first();


        if (empty($attributedItem)) {
            return null;
        }


        $smartphone = $order->attributedSmartphone()
            ->with('selling_info')
            ->first();

        if (empty($smartphone) || empty($smartphone->selling_info)) {
            return null;
        }


        $rewardBase = (float) $attributedItem->unit_price * (int) $attributedItem->quantity;

        $rewardAmount = match ($setting->calculation_type) {
            'percentage' => round(($rewardBase * $setting->value) / 100, 2),
            'fixed'      => (float) $setting->value,
            default      => 0,
        };

        if ($rewardAmount <= 0) {
            return null;
        }



        return AttributionReward::create([
            'order_id'            => $order->id,
            'product_link_id'     => $order->attribution_link_id,
            'rewarded_to_user_id' => $order->attributed_to_user_id,
            'smartphone_id'       => $order->attributed_smartphone_id,
            'calculation_type'    => $setting->calculation_type,
            'calculation_value'   => $setting->value,
            'order_amount'        => $rewardBase,
            'reward_amount'       => $rewardAmount,
            'status'              => 'accrued',
        ]);
    }

    public function reverseReward(Order $order): void
    {
        $reward = $order->attributionReward;

        if (empty($reward) || $reward->status === 'reversed') {
            return;
        }

        $reward->update([
            'status'      => 'reversed',
            'reversed_at' => now(),
        ]);
    }
}
