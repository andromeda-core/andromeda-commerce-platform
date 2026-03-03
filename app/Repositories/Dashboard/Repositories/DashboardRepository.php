<?php

namespace App\Repositories\Dashboard\Repositories;

use App\Models\Collaborator;
use App\Models\Customer;
use App\Models\Distributor;
use App\Models\Order;
use App\Models\Post;
use App\Models\Supplier;
use App\Models\SupplierCommission;
use App\Models\User;
use App\Repositories\Dashboard\Interface\IDashboardRepository;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Str;

class DashboardRepository implements IDashboardRepository
{
    public function __construct(
        private User $user,
        private Customer $customer,
        private Supplier $supplier,
        private Collaborator $collaborator,
        private Distributor $distributor,
        private Post $post,
        private Order $order,
        private SupplierCommission $supplier_commission
    ) {}

    public function getTotalUsersCount()
    {
        return $this->user->count();
    }

    public function getTotalCustomersCount()
    {
        return $this->customer->count();
    }

    public function getTotalSuppliersCount()
    {
        return $this->supplier->count();
    }

    public function getTotalCollaboratorsCount()
    {
        return $this->collaborator->count();
    }

    public function getTotalDistributorsCount()
    {
        return $this->distributor->count();
    }

    public function getTotalPostsCount()
    {
        return $this->post->count();
    }

    public function getMonths($months_count = 12)
    {
        $months = [];
        $current = Carbon::now();

        if ($months_count != 12) {
            for ($i = $months_count - 1; $i >= 0; $i--) {
                $month = $current->copy()->subMonths($i);
                $months[$month->month] = $month->format('F');
            }
        } else {
            for ($i = 1; $i <= $months_count; $i++) {
                $months[$i] = Carbon::create()->month($i)->format('F');
            }
        }

        return $months;
    }

    public function getOrdersForChart(Request $request)
    {

        $months = $this->getMonths(! empty($request->input('months_count')) ? $request->input('months_count') : 12);

        // $orders = $this->order
        //     ->selectRaw('MONTH(created_at) as month, COUNT(*) as total')
        //     ->whereYear('created_at', Carbon::now()->year)
        //     ->groupBy('month')
        //     ->pluck('total', 'month');

        $orders = $this->order
            ->selectRaw('MONTH(created_at) as month, COUNT(*) as total_orders, SUM(amount) as total_sales')
            ->whereYear('created_at', Carbon::now()->year)
            ->groupBy('month')
            ->get()
            ->keyBy('month');

        $orderCounts = [];
        $salesTotals = [];

        foreach ($months as $key => $month) {
            $orderCounts[] = $orders->get($key)->total_orders ?? 0;
            $salesTotals[] = $orders->get($key)->total_sales ?? 0;
        }

        return [
            'orders' => $orderCounts,
            'sales' => $salesTotals,
        ];

    }

    public function getPurchasingCustomersType()
    {

        $total_customers = Order::select('customer_id')
            ->distinct()
            ->count('customer_id');

        $new_customers = Order::select('customer_id')
            ->groupBy('customer_id')
            ->havingRaw('COUNT(*) = 1')
            ->count();

        $returning_customers = Order::select('customer_id')
            ->groupBy('customer_id')
            ->havingRaw('COUNT(*) > 1')
            ->count();

        $new_percent = $total_customers > 0
            ? round(($new_customers / $total_customers) * 100, 2)
            : 0;

        $returning_percent = $total_customers > 0
            ? round(($returning_customers / $total_customers) * 100, 2)
            : 0;

        return [
            'new_customers' => $new_percent,
            'returning_customers' => $returning_percent,
        ];
    }

    public function getShippingStatusesCount()
    {
        $allStatuses = [
            'PAID' => 0,
            'PENDING' => 0,
            'SHIPPED' => 0,
            'ARRIVEDLOCALLY' => 0,
            'DELIVERED' => 0,
        ];

        $dbStatuses = Order::selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status')
            ->toArray();

        $customizedStatuses = [];

        foreach ($dbStatuses as $key => $value) {
            $customizedKey = Str::of($key)->replace('_', ' ')->upper()->toString();
            $customizedStatuses[$customizedKey] = $value;
        }

        $shippingStatus = array_merge($allStatuses, $customizedStatuses);

        return $shippingStatus;
    }

    public function getCollaboratorPerformance()
    {
        $collaborator_performance = $this->order
            ->selectRaw('
        collaborators.id as collaborator_id,
        users.name,
        COUNT(orders.id) as total_orders,
        SUM(orders.amount) as total_sales,
        SUM(CASE WHEN collaborator_commissions.status = "paid" THEN collaborator_commissions.commission_amount ELSE 0 END) as paid_commissions,
        SUM(CASE WHEN collaborator_commissions.status = "unpaid" THEN collaborator_commissions.commission_amount ELSE 0 END) as unpaid_commissions
    ')
            ->join('collaborators', 'orders.collaborator_id', '=', 'collaborators.id')
            ->join('users', 'collaborators.user_id', '=', 'users.id')
            ->leftJoin('collaborator_commissions', 'orders.id', '=', 'collaborator_commissions.order_id')
            ->groupBy('collaborators.id', 'users.name')
            ->get();

        return $collaborator_performance;
    }

    public function getDistributorPerformance()
    {
        $distributor_performance = Order::selectRaw('
        distributors.id as distributor_id,
        users.name,
        COUNT(DISTINCT orders.id) as total_orders,
        SUM(orders.amount) as total_sales,
        SUM(CASE WHEN distributor_commissions.status = "paid" THEN distributor_commissions.commission_amount ELSE 0 END) as paid_commissions,
        SUM(CASE WHEN distributor_commissions.status = "unpaid" THEN distributor_commissions.commission_amount ELSE 0 END) as unpaid_commissions
    ')
            ->join('order_items', 'orders.id', '=', 'order_items.order_id')
            ->join('smartphones', 'order_items.smartphone_id', '=', 'smartphones.id')
            ->join('categories', 'smartphones.category_id', '=', 'categories.id')
            ->join('distributors', 'categories.distributor_id', '=', 'distributors.id')
            ->join('users', 'distributors.user_id', '=', 'users.id')
            ->leftJoin('distributor_commissions', 'orders.id', '=', 'distributor_commissions.order_id')
            ->groupBy('distributors.id', 'users.name')
            ->get();

        return $distributor_performance;
    }

    public function getSupplierPerformance()
    {
        $supplier_performance = $this->supplier_commission->selectRaw('
        suppliers.id as supplier_id,
        users.name,
        COUNT(DISTINCT supplier_commissions.order_id) as total_orders,
        SUM(supplier_commissions.commission_amount) as total_commissions,
        SUM(CASE WHEN supplier_commissions.status = "paid" THEN supplier_commissions.commission_amount ELSE 0 END) as paid_commissions,
        SUM(CASE WHEN supplier_commissions.status = "unpaid" THEN supplier_commissions.commission_amount ELSE 0 END) as unpaid_commissions
    ')
            ->join('suppliers', 'supplier_commissions.supplier_id', '=', 'suppliers.id')
            ->join('users', 'suppliers.user_id', '=', 'users.id')
            ->groupBy('suppliers.id', 'users.name')
            ->get();

        return $supplier_performance;

    }
}
