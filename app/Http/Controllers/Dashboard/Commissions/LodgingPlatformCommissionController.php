<?php

namespace App\Http\Controllers\Dashboard\Commissions;

use App\Http\Controllers\Controller;
use App\Repositories\Commissions\LodgingPlatformCommissions\Interface\ILodgingPlatformCommissionRepository;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Inertia\Inertia;

class LodgingPlatformCommissionController extends Controller implements HasMiddleware
{
    public static function middleware()
    {
        return [
            new Middleware('permission:Accommodation Platform Commissions View', ['only' => 'index']),
            new Middleware('permission:Accommodation Platform Commissions Edit', ['only' => 'edit']),
            new Middleware('permission:Accommodation Platform Commissions Edit', ['only' => 'update']),
            new Middleware('permission:Accommodation Platform Commissions Delete', ['only' => 'destroy']),
            new Middleware('permission:Accommodation Platform Commissions Delete', ['only' => 'destroyBySelection']),
        ];
    }

    public function __construct(
        private ILodgingPlatformCommissionRepository $lodging_platform_commission
    ) {}

    public function index(Request $request)
    {
        $lodging_platform_commissions = $this->lodging_platform_commission->getAllLodgingPlatformCommissions($request);

        $search = $request->input('search');
        $status = $request->input('status');

        return Inertia::render('Dashboard/AccommodationCommissions/PlatformCommissions/index', compact('lodging_platform_commissions', 'search', 'status'));
    }

    public function edit(?string $id = null)
    {
        if (empty($id)) {
            return to_route('dashboard.accommodation-commissions.platform-commissions.index')->with('error', 'Accommodation platform commission ID not found');
        }

        $lodging_platform_commission = $this->lodging_platform_commission->getSingleLodgingPlatformCommission($id);
        if (empty($lodging_platform_commission)) {
            return to_route('dashboard.accommodation-commissions.platform-commissions.index')->with('error', 'Accommodation platform commission not found');
        }

        return Inertia::render('Dashboard/AccommodationCommissions/PlatformCommissions/edit', compact('lodging_platform_commission'));
    }

    public function update(Request $request, ?string $id = null)
    {
        if (empty($id)) {
            return back()->with('error', 'Accommodation platform commission ID not found');
        }

        $updated = $this->lodging_platform_commission->updateLodgingPlatformCommission($request, $id);
        if ($updated['status'] === false) {
            return back()->with('error', $updated['message']);
        }

        return to_route('dashboard.accommodation-commissions.platform-commissions.index')->with('success', $updated['message']);
    }

    public function destroy(?string $id = null)
    {
        if (empty($id)) {
            return back()->with('error', 'Accommodation platform commission ID not found');
        }

        $deleted = $this->lodging_platform_commission->destroyLodgingPlatformCommission($id);
        if ($deleted['status'] === false) {
            return back()->with('error', $deleted['message']);
        }

        return back()->with('success', $deleted['message']);
    }

    public function destroyBySelection(Request $request)
    {
        $deleted = $this->lodging_platform_commission->destroyLodgingPlatformCommissionBySelection($request);
        if ($deleted['status'] === false) {
            return back()->with('error', $deleted['message']);
        }

        return back()->with('success', $deleted['message']);
    }
}
