<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Repositories\Customers\Interface\ICustomerRepository;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Inertia\Inertia;

class CustomerController extends Controller implements HasMiddleware
{
    public static function middleware()
    {
        return [
            new Middleware('permission:Customers View', ['only' => 'index']),
            new Middleware('permission:Customers View', ['only' => 'show']),
            new Middleware('permission:Customers Create', ['only' => 'create']),
            new Middleware('permission:Customers Create', ['only' => 'store']),
            new Middleware('permission:Customers Edit', ['only' => 'edit']),
            new Middleware('permission:Customers Edit', ['only' => 'update']),
            new Middleware('permission:Customers Delete', ['only' => 'destroy']),
            new Middleware('permission:Customers Delete', ['only' => 'destroyBySelection']),

        ];
    }

    public function __construct(
        private ICustomerRepository $customer
    ) {}

    public function index(Request $request)
    {
        $customers = $this->customer->getAllCustomers($request);

        $search = $request->input('search');

        return Inertia::render('Dashboard/Customers/index', compact('customers', 'search'));
    }

    public function create()
    {
        $countries = $this->customer->getCountries();

        return Inertia::render('Dashboard/Customers/create', compact('countries'));
    }

    public function store(Request $request)
    {
        $created = $this->customer->storeCustomer($request);

        if ($created['status'] === false) {
            return back()->with('error', $created['message']);
        }

        return to_route('dashboard.customers.index')->with('success', $created['message']);
    }

    public function show(?string $id = null)
    {
        if (empty($id)) {
            return to_route('dashboard.customers.index')->with('error', 'Customer ID Not Found');
        }

        $customer = $this->customer->getSingleCustomer($id);

        if (empty($customer)) {

            return to_route('dashboard.customers.index')->with('error', 'Customer Not Found');
        }

        return Inertia::render('Dashboard/Customers/show', compact('customer'));
    }

    public function edit(?string $id = null)
    {
        if (empty($id)) {
            return to_route('dashboard.customers.index')->with('error', 'Customer ID Not Found');
        }

        $customer = $this->customer->getSingleCustomer($id);

        if (empty($customer)) {

            return to_route('dashboard.customers.index')->with('error', 'Customer Not Found');
        }
        $countries = $this->customer->getCountries();

        return Inertia::render('Dashboard/Customers/edit', compact('customer', 'countries'));
    }

    public function update(Request $request, ?string $id = null)
    {
        if (empty($id)) {
            return back()->with('error', 'Customer ID Not Found');
        }
        $updated = $this->customer->updateCustomer($request, $id);

        if ($updated['status'] === false) {
            return back()->with('error', $updated['message']);
        }

        return to_route('dashboard.customers.index')->with('success', $updated['message']);
    }

    public function destroy(?string $id = null)
    {
        if (empty($id)) {
            return back()->with('error', 'Customer ID Not Found');
        }

        $deleted = $this->customer->destroyCustomer($id);

        if ($deleted['status'] === false) {
            return back()->with('error', $deleted['message']);
        }

        return back()->with('success', $deleted['message']);
    }

    public function destroyBySelection(Request $request)
    {
        $deleted = $this->customer->destroyCustomerBySelection($request);

        if ($deleted['status'] === false) {
            return back()->with('error', $deleted['message']);
        }

        return back()->with('success', $deleted['message']);
    }
}
