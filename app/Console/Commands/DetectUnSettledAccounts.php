<?php

namespace App\Console\Commands;

use App\Models\Order;
use App\Models\UnsettledAccount;
use Illuminate\Console\Command;

class DetectUnSettledAccounts extends Command
{
    protected $signature = 'app:detect-un-settled-accounts';

    protected $description = 'Detects unsettled accounts based on unfinished orders/payments';

    public function handle()
    {
        $this->detectPaymentPendingTooLong();
        $this->detectPaymentFailed();
        $this->detectRefundNotResolved();
        $this->detectPaidButNotFulfilled();
        $this->detectRepeatedFailedOrders();
    }

    protected function detectPaymentPendingTooLong()
    {
        Order::with(['customer.user'])->where(function ($query) {
            $query->where('status', 'pending')
                ->orWhere('status', 'awaiting_payment');
        })
            ->where('created_at', '<=', now()->subHours(24))
            ->chunkById(100, function ($orders) {
                foreach ($orders as $order) {
                    $this->markIssue(
                        $order->customer->user->id,
                        'payment_pending_too_long',
                        $order->id,
                    );
                }
            });
    }

    protected function detectPaymentFailed()
    {
        Order::with(['customer.user'])->where(function ($query) {
            $query->where('status', 'expired')
                ->orWhere('status', 'failed');
        })
            ->whereNot('status', 'canceled')
            ->where('updated_at', '<=', now()->subHours(6))
            ->chunkById(100, function ($orders) {
                foreach ($orders as $order) {
                    $this->markIssue(
                        $order->customer->user->id,
                        'payment_failed',
                        $order->id,
                    );
                }
            });
    }

    protected function detectRefundNotResolved()
    {
        Order::with(['customer.user'])->whereIn('status', ['refund_requested', 'refund_approved'])
            ->where('updated_at', '<=', now()->subDays(3))
            ->chunkById(100, function ($orders) {
                foreach ($orders as $order) {
                    $this->markIssue(
                        $order->customer->user->id,
                        'refund_not_resolved',
                        $order->id
                    );
                }
            });
    }

    protected function detectPaidButNotFulfilled()
    {
        Order::with(['customer.user'])->whereIn('status', ['paid', 'shipped', 'arrived_locally'])
            ->where('updated_at', '<=', now()->subDays(2))
            ->chunkById(100, function ($orders) {
                foreach ($orders as $order) {
                    $this->markIssue(
                        $order->customer->user->id,
                        'paid_but_not_fulfilled',
                        $order->id
                    );
                }
            });
    }

    protected function detectRepeatedFailedOrders()
    {
        $users = Order::join('customers', 'orders.customer_id', '=', 'customers.id')
            ->select('customers.user_id')
            ->whereIn('orders.status', ['failed', 'expired'])
            ->where('orders.created_at', '>=', now()->subDays(7))
            ->groupBy('customers.user_id')
            ->havingRaw('COUNT(orders.id) >= 3')
            ->pluck('customers.user_id');

        foreach ($users as $userId) {

            $orderNos = Order::join('customers', 'orders.customer_id', '=', 'customers.id')
                ->where('customers.user_id', $userId)
                ->whereIn('orders.status', ['failed', 'expired'])
                ->where('orders.created_at', '>=', now()->subDays(7))
                ->pluck('orders.order_no');

            $this->markIssue(
                $userId,
                'repeated_failed_orders_in_this_week',
                null,
                [
                    'order_nos' => $orderNos,
                    'failed_orders_count' => $orderNos->count(),
                ]
            );
        }
    }

    protected function markIssue(
        int $userId,
        string $reason,
        ?int $orderId = null,
        array $meta = []
    ) {

        $issue = UnsettledAccount::where('user_id', $userId)
            ->where('reason', $reason)
            ->where('status', 'open')
            ->first();

        if ($issue) {
            $issue->update([
                'meta' => array_merge($issue->meta ?? [], $meta),
            ]);

            return;
        }

        UnsettledAccount::create([
            'user_id' => $userId,
            'order_id' => $orderId,
            'reason' => $reason,
            'meta' => $meta,
            'status' => 'open',
            'detected_at' => now(),
        ]);

    }
}
