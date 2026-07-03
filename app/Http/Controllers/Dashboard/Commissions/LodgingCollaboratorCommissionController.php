<?php

namespace App\Http\Controllers\Dashboard\Commissions;

use App\Http\Controllers\Controller;
use App\Repositories\Commissions\LodgingCollaboratorCommissions\Interface\ILodgingCollaboratorCommissionRepository;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Inertia\Inertia;

class LodgingCollaboratorCommissionController extends Controller implements HasMiddleware
{
    public static function middleware()
    {
        return [
            new Middleware('permission:Accommodation Collaborator Commissions View', ['only' => 'index']),
            new Middleware('permission:Accommodation Collaborator Commissions Edit', ['only' => 'edit']),
            new Middleware('permission:Accommodation Collaborator Commissions Edit', ['only' => 'update']),
            new Middleware('permission:Accommodation Collaborator Commissions Delete', ['only' => 'destroy']),
            new Middleware('permission:Accommodation Collaborator Commissions Delete', ['only' => 'destroyBySelection']),
        ];
    }

    public function __construct(
        private ILodgingCollaboratorCommissionRepository $lodging_collaborator_commission
    ) {}

    public function index(Request $request)
    {
        $lodging_collaborator_commissions = $this->lodging_collaborator_commission->getAllLodgingCollaboratorCommissions($request);

        $search = $request->input('search');
        $status = $request->input('status');

        return Inertia::render('Dashboard/AccommodationCommissions/CollaboratorCommissions/index', compact('lodging_collaborator_commissions', 'search', 'status'));
    }

    public function edit(?string $id = null)
    {
        if (empty($id)) {
            return to_route('dashboard.accommodation-commissions.collaborator-commissions.index')->with('error', 'Accommodation collaborator commission ID not found');
        }

        $lodging_collaborator_commission = $this->lodging_collaborator_commission->getSingleLodgingCollaboratorCommission($id);
        if (empty($lodging_collaborator_commission)) {
            return to_route('dashboard.accommodation-commissions.collaborator-commissions.index')->with('error', 'Accommodation collaborator commission not found');
        }

        return Inertia::render('Dashboard/AccommodationCommissions/CollaboratorCommissions/edit', compact('lodging_collaborator_commission'));
    }

    public function update(Request $request, ?string $id = null)
    {
        if (empty($id)) {
            return back()->with('error', 'Accommodation collaborator commission ID not found');
        }

        $updated = $this->lodging_collaborator_commission->updateLodgingCollaboratorCommission($request, $id);
        if ($updated['status'] === false) {
            return back()->with('error', $updated['message']);
        }

        return to_route('dashboard.accommodation-commissions.collaborator-commissions.index')->with('success', $updated['message']);
    }

    public function destroy(?string $id = null)
    {
        if (empty($id)) {
            return back()->with('error', 'Accommodation collaborator commission ID not found');
        }

        $deleted = $this->lodging_collaborator_commission->destroyLodgingCollaboratorCommission($id);
        if ($deleted['status'] === false) {
            return back()->with('error', $deleted['message']);
        }

        return back()->with('success', $deleted['message']);
    }

    public function destroyBySelection(Request $request)
    {
        $deleted = $this->lodging_collaborator_commission->destroyLodgingCollaboratorCommissionBySelection($request);
        if ($deleted['status'] === false) {
            return back()->with('error', $deleted['message']);
        }

        return back()->with('success', $deleted['message']);
    }
}
