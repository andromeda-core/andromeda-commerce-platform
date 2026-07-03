<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Repositories\AccommodationOperators\Interface\IAccommodationOperatorRepository;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Inertia\Inertia;

class AccommodationOperatorController extends Controller implements HasMiddleware
{
    public static function middleware()
    {
        return [
            new Middleware('permission:Accommodation Operators View', ['only' => 'index']),
            new Middleware('permission:Accommodation Operators Create', ['only' => 'create']),
            new Middleware('permission:Accommodation Operators Create', ['only' => 'store']),
            new Middleware('permission:Accommodation Operators Edit', ['only' => 'edit']),
            new Middleware('permission:Accommodation Operators Edit', ['only' => 'update']),
            new Middleware('permission:Accommodation Operators Delete', ['only' => 'destroy']),
            new Middleware('permission:Accommodation Operators Delete', ['only' => 'destroyBySelection']),
        ];
    }

    public function __construct(
        private IAccommodationOperatorRepository $accommodation_operator
    ) {}

    public function index(Request $request)
    {
        $accommodation_operators = $this->accommodation_operator->getAllAccommodationOperators($request);

        $search = $request->input('search');

        return Inertia::render('Dashboard/AccommodationOperators/index', compact('accommodation_operators', 'search'));
    }

    public function create()
    {
        return Inertia::render('Dashboard/AccommodationOperators/create');
    }

    public function store(Request $request)
    {
        $created = $this->accommodation_operator->storeAccommodationOperator($request);

        if ($created['status'] === false) {
            return back()->with('error', $created['message']);
        }

        return to_route('dashboard.accommodation-operators.index')->with('success', $created['message']);
    }

    public function edit(?string $id = null)
    {
        if (empty($id)) {
            return to_route('dashboard.accommodation-operators.index')->with('error', 'Accommodation Operator ID Not Found');
        }

        $accommodation_operator = $this->accommodation_operator->getSingleAccommodationOperator($id);

        if (empty($accommodation_operator)) {
            return to_route('dashboard.accommodation-operators.index')->with('error', 'Accommodation Operator Not Found');
        }

        return Inertia::render('Dashboard/AccommodationOperators/edit', compact('accommodation_operator'));
    }

    public function update(Request $request, ?string $id = null)
    {
        if (empty($id)) {
            return back()->with('error', 'Accommodation Operator ID Not Found');
        }

        $updated = $this->accommodation_operator->updateAccommodationOperator($request, $id);

        if ($updated['status'] === false) {
            return back()->with('error', $updated['message']);
        }

        return to_route('dashboard.accommodation-operators.index')->with('success', $updated['message']);
    }

    public function destroy(?string $id = null)
    {
        if (empty($id)) {
            return back()->with('error', 'Accommodation Operator ID Not Found');
        }

        $deleted = $this->accommodation_operator->destroyAccommodationOperator($id);

        if ($deleted['status'] === false) {
            return back()->with('error', $deleted['message']);
        }

        return back()->with('success', $deleted['message']);
    }

    public function destroyBySelection(Request $request)
    {
        $deleted = $this->accommodation_operator->destroyAccommodationOperatorBySelection($request);

        if ($deleted['status'] === false) {
            return back()->with('error', $deleted['message']);
        }

        return back()->with('success', $deleted['message']);
    }
}
