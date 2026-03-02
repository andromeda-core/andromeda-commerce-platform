<?php

namespace App\Http\Controllers\Dashboard\Commissions;

use App\Http\Controllers\Controller;
use App\Repositories\Commissions\PlatformCommissions\Interface\IPlatformCommissionRepository;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Inertia\Inertia;

class PlatformCommissionController extends Controller implements HasMiddleware
{
    public static function middleware()
    {
        return [
            new Middleware('permission:Platform Commissions  View', ['only' => 'index']),
            new Middleware('permission:Platform Commissions Edit', ['only' => 'edit']),
            new Middleware('permission:Platform Commissions Edit', ['only' => 'update']),
            new Middleware('permission:Platform Commissions Delete', ['only' => 'destroy']),
            new Middleware('permission:Platform Commissions Delete', ['only' => 'destroyBySelection']),
        ];
    }

    public function __construct(
        private IPlatformCommissionRepository $platform_commission
    ) {}

    public function index(Request $request)
    {
        $platform_commissions = $this->platform_commission->getAllPlatformCommissions($request);

        $search = $request->input('search');
        $status = $request->input('status');

        return Inertia::render('Dashboard/Commissions/PlatformCommissions/index', compact('platform_commissions', 'search', 'status'));

    }

    public function edit(?string $id = null)
    {
        if (empty($id)) {
            return to_route('dashboard.commissions.platform-commissions.index')->with('error', 'Platform commission ID not found');
        }

        $platform_commission = $this->platform_commission->getSinglePlatformCommission($id);
        if (empty($platform_commission)) {
            return to_route('dashboard.commissions.platform-commissions.index')->with('error', 'Platform commission not found');
        }

        $currencies = $this->platform_commission->getAllCurrencies();

        return Inertia::render('Dashboard/Commissions/PlatformCommissions/edit', compact('platform_commission', 'currencies'));
    }

    public function update(Request $request, ?string $id = null)
    {
        if (empty($id)) {
            return back()->with('error', 'Platform commission ID not found');
        }

        $updated = $this->platform_commission->updatePlatformCommission($request, $id);
        if ($updated['status'] === false) {
            return back()->with('error', 'Something Went Wrong While Updating Platform commission');
        }

        return to_route('dashboard.commissions.platform-commissions.index')->with('success', 'Platform commission updated successfully');
    }

    public function destroy(?string $id = null)
    {
        if (empty($id)) {
            return back()->with('error', 'Platform commission ID not found');
        }

        $deleted = $this->platform_commission->destroyPlatformCommission($id);
        if ($deleted['status'] === false) {
            return back()->with('error', 'Something Went Wrong While Deleting Platform commission');
        }

        return back()->with('success', 'Platform commission deleted successfully');

    }

    public function destroyBySelection(Request $request)
    {
        $deleted = $this->platform_commission->destroyPlatformCommissionBySelection($request);
        if ($deleted['status'] === false) {
            return back()->with('error', 'Something Went Wrong While Deleting Platform commission');
        }

        return back()->with('success', 'Platform commission deleted successfully');
    }
}
