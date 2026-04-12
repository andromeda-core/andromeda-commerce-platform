<?php

namespace App\Repositories\RewardPoints\Interface;

use Illuminate\Http\Request;

interface IRewardPointRepository
{
    public function getAllRewardPoints(Request $request);

    public function getSingleRewardPoint(string $id);

    public function storeRewardPoint(Request $request);

    public function updateRewardPoint(Request $request, string $id);

    public function destroyRewardPoint(string $id);

    public function destroyRewardPointBySelection(Request $request);

    public function getUsers();
}
