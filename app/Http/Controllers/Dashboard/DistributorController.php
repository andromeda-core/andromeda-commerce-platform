<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Repositories\Distributors\Interface\IDistributorRepository;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Inertia\Inertia;

class DistributorController extends Controller implements HasMiddleware
{
    public static function middleware()
    {
        return [
            new Middleware('permission:Distributors View', ['only' => 'index']),
            new Middleware('permission:Distributors View', ['only' => 'show']),
            new Middleware('permission:Distributors Create', ['only' => 'create']),
            new Middleware('permission:Distributors Create', ['only' => 'store']),
            new Middleware('permission:Distributors Edit', ['only' => 'edit']),
            new Middleware('permission:Distributors Edit', ['only' => 'update']),
            new Middleware('permission:Distributors Delete', ['only' => 'destroy']),
            new Middleware('permission:Distributors Delete', ['only' => 'destroyBySelection']),

        ];
    }

    public function __construct(
        private IDistributorRepository $distributor
    ) {}

    public function index(Request $request)
    {
        $distributors = $this->distributor->getAllDistributors($request);

        $search = $request->input('search');

        return Inertia::render('Dashboard/Distributors/index', compact('distributors', 'search'));
    }

    public function create()
    {
        return Inertia::render('Dashboard/Distributors/create');
    }

    public function store(Request $request)
    {
        $created = $this->distributor->storeDistributor($request);

        if ($created['status'] === false) {
            return back()->with('error', $created['message']);
        }

        return to_route('dashboard.distributors.index')->with('success', $created['message']);
    }

    public function show(?string $id = null)
    {
        if (empty($id)) {
            return to_route('dashboard.distributors.index')->with('error', 'Distributor ID Not Found');
        }

        $distributor = $this->distributor->getSingleDistributor($id);

        if (empty($distributor)) {
            return to_route('dashboard.distributors.index')->with('error', 'Distributor Not Found');
        }

        return Inertia::render('Dashboard/Distributors/show', compact('distributor'));
    }

    public function edit(?string $id = null)
    {
        if (empty($id)) {
            return to_route('dashboard.distributors.index')->with('error', 'Distributor ID Not Found');
        }

        $distributor = $this->distributor->getSingleDistributor($id);

        if (empty($distributor)) {
            return to_route('dashboard.distributors.index')->with('error', 'Distributor Not Found');
        }

        return Inertia::render('Dashboard/Distributors/edit', compact('distributor'));
    }

    public function update(Request $request, ?string $id = null)
    {

        if (empty($id)) {
            return back()->with('error', 'Distributor ID Not Found');
        }
        $updated = $this->distributor->updateDistributor($request, $id);

        if ($updated['status'] === false) {
            return back()->with('error', $updated['message']);
        }

        return to_route('dashboard.distributors.index')->with('success', $updated['message']);
    }

    public function destroy(?string $id = null)
    {
        if (empty($id)) {
            return back()->with('error', 'Distributor ID Not Found');
        }
        $deleted = $this->distributor->destroyDistributor($id);

        if ($deleted['status'] === false) {
            return back()->with('error', $deleted['message']);
        }

        return back()->with('success', $deleted['message']);
    }

    public function destroyBySelection(Request $request)
    {
        $deleted = $this->distributor->destroyDistributorBySelection($request);

        if ($deleted['status'] === false) {
            return back()->with('error', $deleted['message']);
        }

        return back()->with('success', $deleted['message']);
    }
}
