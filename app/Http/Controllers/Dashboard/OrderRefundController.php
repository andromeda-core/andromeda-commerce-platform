<?php

namespace App\Http\Controllers\Dashboard;

use App\Helpers\Trans;
use App\Http\Controllers\Controller;
use App\Repositories\OrderRefund\Interface\IOrderRefundRepository;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Inertia\Inertia;

class OrderRefundController extends Controller implements HasMiddleware
{
    public static function middleware()
    {
        return [
            new Middleware('permission:Order Refunds View', ['only' => 'index']),
            new Middleware('permission:Order Refunds Edit', ['only' => 'edit']),
            new Middleware('permission:Order Refunds Edit', ['only' => 'update']),
        ];
    }

    public function __construct(
        private IOrderRefundRepository $order_refund,
        private Trans $trans
    ) {}

    public function index(Request $request)
    {
        $order_refunds = $this->order_refund->getAllOrderRefunds($request);
        $refund_status = $request->input('refund_status');

        return Inertia::render('Dashboard/OrderRefunds/index', compact('order_refunds', 'refund_status'));
    }

    public function edit(?string $id = null)
    {
        if (empty($id)) {
            return back()->with('error', $this->trans->get('Order Refund Id not found'));
        }

        $order_refund = $this->order_refund->getSingleOrderRefund($id);

        if (empty($order_refund)) {
            return back()->with('error', $this->trans->get('Order Refund Not Found'));
        }

        if ($order_refund->refund_status === 'completed') {
            return back()->with('error', $this->trans->get('Completed refunds cannot be modified.'));
        }

        if ($order_refund->refund_status === 'rejected') {
            return back()->with('error', $this->trans->get('Rejected refunds cannot be modified.'));
        }

        if ($order_refund->refund_status === 'withdrawn') {
            return back()->with('error', $this->trans->get('Withdrawn refunds cannot be modified.'));
        }

        return Inertia::render('Dashboard/OrderRefunds/edit', compact('order_refund'));
    }

    public function update(Request $request, ?string $id = null)
    {
        if (empty($id)) {
            return back()->with('error', $this->trans->get('Order Refund Id not found'));
        }

        $updated = $this->order_refund->updateOrderRefund($request, $id);

        if ($updated['status'] === false) {
            return back()->with('error', $updated['message']);
        }

        return to_route('dashboard.order-refunds.index')->with('success', $updated['message']);
    }
}
