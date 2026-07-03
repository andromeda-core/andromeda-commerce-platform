<?php

namespace App\Http\Controllers\Dashboard\Commissions;

use App\Http\Controllers\Controller;
use App\Repositories\Commissions\LodgingDistributorCommissions\Interface\ILodgingDistributorCommissionRepository;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Inertia\Inertia;

class LodgingDistributorCommissionController extends Controller implements HasMiddleware
{
    public static function middleware()
    {
        return [
            new Middleware('permission:Accommodation Distributor Commissions View', ['only' => 'index']),
            new Middleware('permission:Accommodation Distributor Commissions Edit', ['only' => 'edit']),
            new Middleware('permission:Accommodation Distributor Commissions Edit', ['only' => 'update']),
            new Middleware('permission:Accommodation Distributor Commissions Delete', ['only' => 'destroy']),
            new Middleware('permission:Accommodation Distributor Commissions Delete', ['only' => 'destroyBySelection']),
        ];
    }

    public function __construct(
        private ILodgingDistributorCommissionRepository $lodging_distributor_commission
    ) {}

    public function index(Request $request)
    {
        $lodging_distributor_commissions = $this->lodging_distributor_commission->getAllLodgingDistributorCommissions($request);

        $search = $request->input('search');
        $status = $request->input('status');

        return Inertia::render('Dashboard/AccommodationCommissions/DistributorCommissions/index', compact('lodging_distributor_commissions', 'search', 'status'));
    }

    public function edit(?string $id = null)
    {
        if (empty($id)) {
            return to_route('dashboard.accommodation-commissions.distributor-commissions.index')->with('error', 'Accommodation distributor commission ID not found');
        }

        $lodging_distributor_commission = $this->lodging_distributor_commission->getSingleLodgingDistributorCommission($id);
        if (empty($lodging_distributor_commission)) {
            return to_route('dashboard.accommodation-commissions.distributor-commissions.index')->with('error', 'Accommodation distributor commission not found');
        }

        return Inertia::render('Dashboard/AccommodationCommissions/DistributorCommissions/edit', compact('lodging_distributor_commission'));
    }

    public function update(Request $request, ?string $id = null)
    {
        if (empty($id)) {
            return back()->with('error', 'Accommodation distributor commission ID not found');
        }

        $updated = $this->lodging_distributor_commission->updateLodgingDistributorCommission($request, $id);
        if ($updated['status'] === false) {
            return back()->with('error', $updated['message']);
        }

        return to_route('dashboard.accommodation-commissions.distributor-commissions.index')->with('success', $updated['message']);
    }

    public function destroy(?string $id = null)
    {
        if (empty($id)) {
            return back()->with('error', 'Accommodation distributor commission ID not found');
        }

        $deleted = $this->lodging_distributor_commission->destroyLodgingDistributorCommission($id);
        if ($deleted['status'] === false) {
            return back()->with('error', $deleted['message']);
        }

        return back()->with('success', $deleted['message']);
    }

    public function destroyBySelection(Request $request)
    {
        $deleted = $this->lodging_distributor_commission->destroyLodgingDistributorCommissionBySelection($request);
        if ($deleted['status'] === false) {
            return back()->with('error', $deleted['message']);
        }

        return back()->with('success', $deleted['message']);
    }
}
