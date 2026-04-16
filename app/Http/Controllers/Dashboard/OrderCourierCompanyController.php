<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Repositories\OrderCourierCompany\Interface\IOrderCourierCompanyRepository;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Inertia\Inertia;

class OrderCourierCompanyController extends Controller implements HasMiddleware
{

    public static function middleware()
    {
        return [
            new Middleware("permission:Order Courier Company View", ['only' => 'index']),
            new Middleware("permission:Order Courier Company Create", ['only' => 'create']),
            new Middleware("permission:Order Courier Company Create", ['only' => 'store']),
            new Middleware("permission:Order Courier Company Edit", ['only' => 'edit']),
            new Middleware("permission:Order Courier Company Edit", ['only' => 'update']),
            new Middleware("permission:Order Courier Company Delete", ['only' => 'destroy']),
            new Middleware("permission:Order Courier Company Delete", ['only' => 'destroyBySelection']),
            new Middleware("permission:Order Courier Company Edit", ['only' => 'toggleStatus']),
        ];
    }

    public function __construct(
        private IOrderCourierCompanyRepository $orderCourierCompany,
    ) {}

    public function index(Request $request)
    {
        $orderCourierCompanies = $this->orderCourierCompany->getAll($request);

        return Inertia::render('Dashboard/OrderCourierCompanies/index', [
            'orderCourierCompanies' => $orderCourierCompanies,
            'search' => $request->input('search'),
        ]);
    }

    public function create()
    {
        return Inertia::render('Dashboard/OrderCourierCompanies/create');
    }

    public function store(Request $request)
    {
        $response = $this->orderCourierCompany->store($request);

        if ($response['status']) {
            return redirect()->route('dashboard.order-courier-companies.index')
                ->with('success', $response['message']);
        }

        return back()->with('error', $response['message']);
    }

    public function edit(string $id)
    {
        $orderCourierCompany = $this->orderCourierCompany->edit($id);

        if (is_array($orderCourierCompany) && !$orderCourierCompany['status']) {
            return redirect()->route('dashboard.order-courier-companies.index')
                ->with('error', $orderCourierCompany['message']);
        }

        return Inertia::render('Dashboard/OrderCourierCompanies/edit', [
            'orderCourierCompany' => $orderCourierCompany,
        ]);
    }

    public function update(Request $request, string $id)
    {
        $response = $this->orderCourierCompany->update($request, $id);

        if ($response['status']) {
            return redirect()->route('dashboard.order-courier-companies.index')
                ->with('success', $response['message']);
        }

        return back()->with('error', $response['message']);
    }

    public function destroy(string $id)
    {
        $response = $this->orderCourierCompany->destroy($id);

        if ($response['status']) {
            return back()->with('success', $response['message']);
        }

        return back()->with('error', $response['message']);
    }

    public function destroyBySelection(Request $request)
    {

        $response = $this->orderCourierCompany->destroyBySelection($request);

        if ($response['status']) {
            return back()->with('success', $response['message']);
        }

        return back()->with('error', $response['message']);
    }

    public function toggleStatus(string $id)
    {
        $response = $this->orderCourierCompany->toggleStatus($id);

        if ($response['status']) {
            return back()->with('success', $response['message']);
        }

        return back()->with('error', $response['message']);
    }
}
