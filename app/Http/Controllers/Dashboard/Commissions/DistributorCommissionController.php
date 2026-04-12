<?php

namespace App\Http\Controllers\Dashboard\Commissions;

use App\Http\Controllers\Controller;
use App\Repositories\Commissions\DistributorCommissions\Interface\IDistributorCommissionRepository;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Inertia\Inertia;

class DistributorCommissionController extends Controller implements HasMiddleware
{
    public static function middleware()
    {
        return [
            new Middleware('permission:Distributor Commissions View', ['only' => 'index']),
            new Middleware('permission:Distributor Commissions Edit', ['only' => 'edit']),
            new Middleware('permission:Distributor Commissions Edit', ['only' => 'update']),
            new Middleware('permission:Distributor Commissions Delete', ['only' => 'destroy']),
            new Middleware('permission:Distributor Commissions Delete', ['only' => 'destroyBySelection']),
        ];
    }

    public function __construct(
        private IDistributorCommissionRepository $distributor_commission
    ) {}

    public function index(Request $request)
    {
        $distributor_commissions = $this->distributor_commission->getAllDistributorCommissions($request);

        $search = $request->input('search');
        $status = $request->input('status');

        return Inertia::render('Dashboard/Commissions/DistributorCommissions/index', compact('distributor_commissions', 'search', 'status'));

    }

    public function edit(?string $id = null)
    {
        if (empty($id)) {
            return to_route('dashboard.commissions.distributor-commissions.index')->with('error', 'Distributor commission ID not found');
        }

        $distributor_commission = $this->distributor_commission->getSingleDistributorCommission($id);
        if (empty($distributor_commission)) {
            return to_route('dashboard.commissions.distributor-commissions.index')->with('error', 'Distributor commission not found');
        }

        return Inertia::render('Dashboard/Commissions/DistributorCommissions/edit', compact('distributor_commission'));
    }

    public function update(Request $request, ?string $id = null)
    {
        if (empty($id)) {
            return back()->with('error', 'Distributor commission ID not found');
        }

        $updated = $this->distributor_commission->updateDistributorCommission($request, $id);
        if ($updated['status'] === false) {
            return back()->with('error', 'Something Went Wrong While Updating Distributor commission');
        }

        return to_route('dashboard.commissions.distributor-commissions.index')->with('success', 'Distributor commission updated successfully');
    }

    public function destroy(?string $id = null)
    {
        if (empty($id)) {
            return back()->with('error', 'Distributor commission ID not found');
        }

        $deleted = $this->distributor_commission->destroyDistributorCommission($id);
        if ($deleted['status'] === false) {
            return back()->with('error', 'Something Went Wrong While Deleting Distributor commission');
        }

        return back()->with('success', 'Distributor commission deleted successfully');

    }

    public function destroyBySelection(Request $request)
    {
        $deleted = $this->distributor_commission->destroyDistributorCommissionBySelection($request);
        if ($deleted['status'] === false) {
            return back()->with('error', 'Something Went Wrong While Deleting Distributor commission');
        }

        return back()->with('success', 'Distributor commission deleted successfully');
    }
}
