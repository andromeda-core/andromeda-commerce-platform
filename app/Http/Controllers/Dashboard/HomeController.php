<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Repositories\Dashboard\Interface\IDashboardRepository;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HomeController extends Controller
{
    public function __construct(
        private IDashboardRepository $dashboard
    ) {}

    public function __invoke(Request $request)
    {

        $users_count = $this->dashboard->getTotalUsersCount();
        $customers_count = $this->dashboard->getTotalCustomersCount();
        $suppliers_count = $this->dashboard->getTotalSuppliersCount();
        $collaborators_count = $this->dashboard->getTotalCollaboratorsCount();
        $distributors_count = $this->dashboard->getTotalDistributorsCount();
        $posts_count = $this->dashboard->getTotalPostsCount();

        $months = collect($this->dashboard->getMonths(! empty($request->input('months_count')) ? $request->input('months_count') : 12))->values()->all();

        $orders_data = $this->dashboard->getOrdersForChart($request);
        $total_orders = collect($orders_data['orders'])->values()->all();
        $total_sales = collect($orders_data['sales'])->values()->all();

        $purchasing_customers_type = $this->dashboard->getPurchasingCustomersType();
        $new_customers = collect($purchasing_customers_type['new_customers'])->values()->all();
        $returning_customers = collect($purchasing_customers_type['returning_customers'])->values()->all();

        $shipping_statuses = $this->dashboard->getShippingStatusesCount();

        $collaborators_performance = $this->dashboard->getCollaboratorPerformance();

        $distributors_performance = $this->dashboard->getDistributorPerformance();

        $suppliers_performance = $this->dashboard->getSupplierPerformance();

        return Inertia::render('Dashboard/Home/index', [
            'users_count' => $users_count,
            'customers_count' => $customers_count,
            'suppliers_count' => $suppliers_count,
            'collaborators_count' => $collaborators_count,
            'distributors_count' => $distributors_count,
            'posts_count' => $posts_count,
            'months' => $months,
            'total_orders' => $total_orders,
            'total_sales' => $total_sales,
            'new_customers' => $new_customers,
            'returning_customers' => $returning_customers,
            'shipping_statuses' => $shipping_statuses,
            'collaborators_performance' => $collaborators_performance,
            'distributors_performance' => $distributors_performance,
            'suppliers_performance' => $suppliers_performance,
        ]);
    }
}
