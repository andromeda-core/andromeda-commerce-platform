<?php

namespace App\Http\Controllers\Dashboard\Commissions;

use App\Http\Controllers\Controller;
use App\Repositories\Commissions\CollaboratorCommissions\Interface\ICollaboratorCommissionRepository;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Inertia\Inertia;

class CollaboratorCommissionController extends Controller implements HasMiddleware
{
    public static function middleware()
    {
        return [
            new Middleware('permission:Collaborator Commissions View', ['only' => 'index']),
            new Middleware('permission:Collaborator Commissions Edit', ['only' => 'edit']),
            new Middleware('permission:Collaborator Commissions Edit', ['only' => 'update']),
            new Middleware('permission:Collaborator Commissions Delete', ['only' => 'destroy']),
            new Middleware('permission:Collaborator Commissions Delete', ['only' => 'destroyBySelection']),
        ];
    }

    public function __construct(
        private ICollaboratorCommissionRepository $collaborator_commission
    ) {}

    public function index(Request $request)
    {
        $collaborator_commissions = $this->collaborator_commission->getAllCollaboratorCommissions($request);

        $search = $request->input('search');
        $status = $request->input('status');

        return Inertia::render('Dashboard/Commissions/CollaboratorCommissions/index', compact('collaborator_commissions', 'search', 'status'));

    }

    public function edit(?string $id = null)
    {
        if (empty($id)) {
            return to_route('dashboard.commissions.collaborator-commissions.index')->with('error', 'Collaborator commission ID not found');
        }

        $collaborator_commission = $this->collaborator_commission->getSingleCollaboratorCommission($id);
        if (empty($collaborator_commission)) {
            return to_route('dashboard.commissions.collaborator-commissions.index')->with('error', 'Collaborator commission not found');
        }

        return Inertia::render('Dashboard/Commissions/CollaboratorCommissions/edit', compact('collaborator_commission'));
    }

    public function update(Request $request, ?string $id = null)
    {
        if (empty($id)) {
            return back()->with('error', 'Collaborator commission ID not found');
        }

        $updated = $this->collaborator_commission->updateCollaboratorCommission($request, $id);
        if ($updated['status'] === false) {
            return back()->with('error', 'Something Went Wrong While Updating Collaborator commission');
        }

        return to_route('dashboard.commissions.collaborator-commissions.index')->with('success', 'Collaborator commission updated successfully');
    }

    public function destroy(?string $id = null)
    {
        if (empty($id)) {
            return back()->with('error', 'Collaborator commission ID not found');
        }

        $deleted = $this->collaborator_commission->destroyCollaboratorCommission($id);
        if ($deleted['status'] === false) {
            return back()->with('error', 'Something Went Wrong While Deleting Collaborator commission');
        }

        return back()->with('success', 'Collaborator commission deleted successfully');

    }

    public function destroyBySelection(Request $request)
    {
        $deleted = $this->collaborator_commission->destroyCollaboratorCommissionBySelection($request);
        if ($deleted['status'] === false) {
            return back()->with('error', 'Something Went Wrong While Deleting Collaborator commission');
        }

        return back()->with('success', 'Collaborator commission deleted successfully');
    }
}
