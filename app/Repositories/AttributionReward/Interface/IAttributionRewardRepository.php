<?php

namespace App\Repositories\AttributionReward\Interface;

use Illuminate\Http\Request;

interface IAttributionRewardRepository
{
    public function getAllAttributionRewards(Request $request);
    public function updateAttributionReward(Request $request, string $id);
}
