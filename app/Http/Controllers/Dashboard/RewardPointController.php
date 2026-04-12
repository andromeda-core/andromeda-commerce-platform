<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Repositories\RewardPoints\Interface\IRewardPointRepository;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Inertia\Inertia;

class RewardPointController extends Controller implements HasMiddleware
{
    public static function middleware()
    {
        return [
            new Middleware('permission:Reward Points View', ['only' => 'index']),
            new Middleware('permission:Reward Points Create', ['only' => 'create']),
            new Middleware('permission:Reward Points Create', ['only' => 'store']),
            new Middleware('permission:Reward Points Edit', ['only' => 'edit']),
            new Middleware('permission:Reward Points Edit', ['only' => 'update']),
            new Middleware('permission:Reward Points Delete', ['only' => 'destroy']),
            new Middleware('permission:Reward Points Delete', ['only' => 'destroyBySelection']),
        ];
    }

    public function __construct(
        private IRewardPointRepository $reward_point
    ) {}

    public function index(Request $request)
    {
        $reward_points = $this->reward_point->getAllRewardPoints($request);

        $search = $request->input('search');

        return Inertia::render('Dashboard/RewardPoints/index', compact('reward_points', 'search'));
    }

    public function create()
    {
        $users = $this->reward_point->getUsers();

        return Inertia::render('Dashboard/RewardPoints/create', compact('users'));
    }

    public function store(Request $request)
    {
        $created = $this->reward_point->storeRewardPoint($request);

        if ($created['status'] === false) {
            return back()->with('error', $created['message']);
        }

        return to_route('dashboard.reward-points.index')->with('success', $created['message']);
    }

    public function edit(?string $id = null)
    {
        if (empty($id)) {
            return to_route('dashboard.reward-points.index')->with('error', 'Reward Point ID Not Found');
        }

        $reward_point = $this->reward_point->getSingleRewardPoint($id);

        if (empty($reward_point)) {
            return to_route('dashboard.reward-points.index')->with('error', 'Reward Point Not Found');
        }
        $users = $this->reward_point->getUsers();

        return Inertia::render('Dashboard/RewardPoints/edit', compact('reward_point', 'users'));
    }

    public function update(Request $request, ?string $id = null)
    {
        $updated = $this->reward_point->updateRewardPoint($request, $id);

        if ($updated['status'] === false) {
            return back()->with('error', $updated['message']);
        }

        return to_route('dashboard.reward-points.index')->with('success', $updated['message']);
    }

    public function destroy(?string $id = null)
    {
        if (empty($id)) {
            return back()->with('error', 'Reward Point ID Not Found');
        }

        $deleted = $this->reward_point->destroyRewardPoint($id);

        if ($deleted['status'] === false) {
            return back()->with('error', $deleted['message']);
        }

        return back()->with('success', $deleted['message']);
    }

    public function destroyBySelection(Request $request)
    {

        $deleted = $this->reward_point->destroyRewardPointBySelection($request);

        if ($deleted['status'] === false) {
            return back()->with('error', $deleted['message']);
        }

        return back()->with('success', $deleted['message']);
    }
}
