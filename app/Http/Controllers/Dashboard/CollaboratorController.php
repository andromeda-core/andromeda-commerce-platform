<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Repositories\Collaborators\Interface\ICollaboratorRepository;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Inertia\Inertia;

class CollaboratorController extends Controller implements HasMiddleware
{
    public static function middleware()
    {
        return [
            new Middleware('permission:Collaborators View', ['only' => 'index']),
            new Middleware('permission:Collaborators View', ['only' => 'show']),
            new Middleware('permission:Collaborators Create', ['only' => 'create']),
            new Middleware('permission:Collaborators Create', ['only' => 'store']),
            new Middleware('permission:Collaborators Edit', ['only' => 'edit']),
            new Middleware('permission:Collaborators Edit', ['only' => 'update']),
            new Middleware('permission:Collaborators Delete', ['only' => 'destroy']),
            new Middleware('permission:Collaborators Delete', ['only' => 'destroyBySelection']),

        ];
    }

    public function __construct(
        private ICollaboratorRepository $collaborator
    ) {}

    public function index(Request $request)
    {
        $collaborators = $this->collaborator->getAllCollaborators($request);
        $search = $request->input('search');

        return Inertia::render('Dashboard/Collaborators/index', compact('collaborators', 'search'));
    }

    public function create()
    {
        return Inertia::render('Dashboard/Collaborators/create');
    }

    public function store(Request $request)
    {
        $created = $this->collaborator->storeCollaborator($request);

        if ($created['status'] === false) {
            return back()->with('error', $created['errors']);
        }

        return to_route('dashboard.collaborators.index')->with('success', 'Collaborator created successfully');
    }

    public function show(?string $id = null)
    {
        if (empty($id)) {
            return to_route('dashboard.collaborators.index')->with('error', 'Collaborator ID not found');
        }

        $collaborator = $this->collaborator->getSingleCollaborator($id);

        if (empty($collaborator)) {
            return to_route('dashboard.collaborators.index')->with('error', 'Collaborator not found');
        }

        return Inertia::render('Dashboard/Collaborators/show', compact('collaborator'));
    }

    public function edit(?string $id = null)
    {
        if (empty($id)) {
            return to_route('dashboard.collaborators.index')->with('error', 'Collaborator ID not found');
        }

        $collaborator = $this->collaborator->getSingleCollaborator($id);

        if (empty($collaborator)) {
            return to_route('dashboard.collaborators.index')->with('error', 'Collaborator not found');
        }

        return Inertia::render('Dashboard/Collaborators/edit', compact('collaborator'));
    }

    public function update(Request $request, ?string $id = null)
    {
        if (empty($id)) {
            return back()->with('error', 'Collaborator ID not found');
        }

        $updated = $this->collaborator->updateCollaborator($request, $id);

        if ($updated['status'] === false) {
            return back()->with('error', $updated['errors']);
        }

        return to_route('dashboard.collaborators.index')->with('success', 'Collaborator updated successfully');
    }

    public function destroy(?string $id = null)
    {
        if (empty($id)) {
            return back()->with('error', 'Collaborator ID not found');
        }

        $deleted = $this->collaborator->destroyCollaborator($id);

        if ($deleted['status'] === false) {
            return back()->with('error', $deleted['errors']);
        }

        return back()->with('success', 'Collaborator deleted successfully');
    }

    public function destroyBySelection(Request $request)
    {
        $deleted = $this->collaborator->destroyCollaboratorBySelection($request);

        if ($deleted['status'] === false) {
            return back()->with('error', $deleted['errors']);
        }

        return back()->with('success', 'Collaborators deleted successfully');
    }
}
