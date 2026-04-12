<?php

namespace App\Http\Controllers\Dashboard\Commissions;

use App\Http\Controllers\Controller;
use App\Repositories\Commissions\SupplierCommissions\Interface\ISupplierCommissionRepository;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Inertia\Inertia;

class SupplierCommissionController extends Controller implements HasMiddleware
{
    public static function middleware()
    {
        return [
            new Middleware('permission:Supplier Commissions View', ['only' => 'index']),
            new Middleware('permission:Supplier Commissions Edit', ['only' => 'edit']),
            new Middleware('permission:Supplier Commissions Edit', ['only' => 'update']),
            new Middleware('permission:Supplier Commissions Delete', ['only' => 'destroy']),
            new Middleware('permission:Supplier Commissions Delete', ['only' => 'destroyBySelection']),
        ];
    }

    public function __construct(
        private ISupplierCommissionRepository $supplier_commission
    ) {}

    public function index(Request $request)
    {
        $supplier_commissions = $this->supplier_commission->getAllSupplierCommissions($request);

        $search = $request->input('search');
        $status = $request->input('status');

        return Inertia::render('Dashboard/Commissions/SupplierCommissions/index', compact('supplier_commissions', 'search',
            'status'));

    }

    public function edit(?string $id = null)
    {
        if (empty($id)) {
            return to_route('dashboard.commissions.supplier-commissions.index')->with('error', 'Supplier commission ID not found');
        }

        $supplier_commission = $this->supplier_commission->getSingleSupplierCommission($id);
        if (empty($supplier_commission)) {
            return to_route('dashboard.commissions.supplier-commissions.index')->with('error', 'Supplier commission not found');
        }

        return Inertia::render('Dashboard/Commissions/SupplierCommissions/edit', compact('supplier_commission'));
    }

    public function update(Request $request, ?string $id = null)
    {
        if (empty($id)) {
            return back()->with('error', 'Supplier commission ID not found');
        }

        $updated = $this->supplier_commission->updateSupplierCommission($request, $id);
        if ($updated['status'] === false) {
            return back()->with('error', 'Something Went Wrong While Updating Supplier commission');
        }

        return to_route('dashboard.commissions.supplier-commissions.index')->with('success', 'Supplier commission updated successfully');
    }

    public function destroy(?string $id = null)
    {
        if (empty($id)) {
            return back()->with('error', 'Supplier commission ID not found');
        }

        $deleted = $this->supplier_commission->destroySupplierCommission($id);
        if ($deleted['status'] === false) {
            return back()->with('error', 'Something Went Wrong While Deleting Supplier commission');
        }

        return back()->with('success', 'Supplier commission deleted successfully');

    }

    public function destroyBySelection(Request $request)
    {
        $deleted = $this->supplier_commission->destroySupplierCommissionBySelection($request);
        if ($deleted['status'] === false) {
            return back()->with('error', 'Something Went Wrong While Deleting Supplier commission');
        }

        return back()->with('success', 'Supplier commission deleted successfully');
    }
}
