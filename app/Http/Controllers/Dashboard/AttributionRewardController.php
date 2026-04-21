<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Repositories\AttributionReward\Interface\IAttributionRewardRepository;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Inertia\Inertia;

class AttributionRewardController extends Controller implements HasMiddleware
{

    public static function middleware()
    {
        return [
            new Middleware('permission:Attribution Reward View', ['only' => 'index']),
            new Middleware('permission:Attribution Reward Edit', ['only' => 'update']),
        ];
    }

    public function __construct(
        private IAttributionRewardRepository $attributionReward
    ) {}

    public function index(Request $request)
    {
        $attribution_rewards = $this->attributionReward->getAllAttributionRewards($request);

        return Inertia::render('Dashboard/AttributionRewards/index', [
            'attribution_rewards' => $attribution_rewards,
        ]);
    }

    public function update(Request $request, string $id)
    {
        if (empty($id)) {
            return back()->with('error', 'Attribution reward ID is required');
        }

        $updated = $this->attributionReward->updateAttributionReward($request, $id);

        if ($updated['status'] === false) {
            return back()->with('error', $updated['message']);
        }

        return back()->with('success', $updated['message']);
    }
}
