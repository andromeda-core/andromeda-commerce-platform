<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Repositories\AccommodationDistributors\Interface\IAccommodationDistributorRepository;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Inertia\Inertia;

class AccommodationDistributorController extends Controller implements HasMiddleware
{
    public static function middleware()
    {
        return [
            new Middleware('permission:Accommodation Distributors View', ['only' => 'index']),
            new Middleware('permission:Accommodation Distributors Create', ['only' => 'create']),
            new Middleware('permission:Accommodation Distributors Create', ['only' => 'store']),
            new Middleware('permission:Accommodation Distributors Edit', ['only' => 'edit']),
            new Middleware('permission:Accommodation Distributors Edit', ['only' => 'update']),
            new Middleware('permission:Accommodation Distributors Delete', ['only' => 'destroy']),
            new Middleware('permission:Accommodation Distributors Delete', ['only' => 'destroyBySelection']),
        ];
    }

    public function __construct(
        private IAccommodationDistributorRepository $accommodation_distributor
    ) {}

    public function index(Request $request)
    {
        $accommodation_distributors = $this->accommodation_distributor->getAllAccommodationDistributors($request);

        $search = $request->input('search');

        return Inertia::render('Dashboard/AccommodationDistributors/index', compact('accommodation_distributors', 'search'));
    }

    public function create()
    {
        return Inertia::render('Dashboard/AccommodationDistributors/create');
    }

    public function store(Request $request)
    {
        $created = $this->accommodation_distributor->storeAccommodationDistributor($request);

        if ($created['status'] === false) {
            return back()->with('error', $created['message']);
        }

        return to_route('dashboard.accommodation-distributors.index')->with('success', $created['message']);
    }

    public function edit(?string $id = null)
    {
        if (empty($id)) {
            return to_route('dashboard.accommodation-distributors.index')->with('error', 'Accommodation Distributor ID Not Found');
        }

        $accommodation_distributor = $this->accommodation_distributor->getSingleAccommodationDistributor($id);

        if (empty($accommodation_distributor)) {
            return to_route('dashboard.accommodation-distributors.index')->with('error', 'Accommodation Distributor Not Found');
        }

        return Inertia::render('Dashboard/AccommodationDistributors/edit', compact('accommodation_distributor'));
    }

    public function update(Request $request, ?string $id = null)
    {
        if (empty($id)) {
            return back()->with('error', 'Accommodation Distributor ID Not Found');
        }

        $updated = $this->accommodation_distributor->updateAccommodationDistributor($request, $id);

        if ($updated['status'] === false) {
            return back()->with('error', $updated['message']);
        }

        return to_route('dashboard.accommodation-distributors.index')->with('success', $updated['message']);
    }

    public function destroy(?string $id = null)
    {
        if (empty($id)) {
            return back()->with('error', 'Accommodation Distributor ID Not Found');
        }

        $deleted = $this->accommodation_distributor->destroyAccommodationDistributor($id);

        if ($deleted['status'] === false) {
            return back()->with('error', $deleted['message']);
        }

        return back()->with('success', $deleted['message']);
    }

    public function destroyBySelection(Request $request)
    {
        $deleted = $this->accommodation_distributor->destroyAccommodationDistributorBySelection($request);

        if ($deleted['status'] === false) {
            return back()->with('error', $deleted['message']);
        }

        return back()->with('success', $deleted['message']);
    }
}
