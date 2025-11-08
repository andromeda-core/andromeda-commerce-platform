<?php

namespace App\Console\Commands;

use App\Models\Order;
use App\Notifications\NotifyCustomerOrderCryptoPaymentExpired;
use Cache;
use Illuminate\Console\Command;

class NOWPaymentAutoMarkingOrderFailedIfNotPaid extends Command
{
    protected $signature = 'app:n-o-w-payment-auto-marking-order-failed-if-not-paid';

    protected $description = 'This Command Will Change Status Of Orders Whose Payment Status Is Not Paid And Not Even User Tries To Pay Via Crypto To Failed';

    public function handle()
    {
        $expiredTime = now()->subMinutes(30);
        $currency = Cache::get('currency');
        Order::where('status', 'awaiting_payment')
            ->where('created_at', '<', $expiredTime)
            ->with(['orderItems.smartphone.inventory_items', 'customer.user'])
            ->chunk(100, function ($orders) use ($currency) {

                foreach ($orders as $order) {

                    $user = $order->customer->user;

                    $order->update(['status' => 'expired']);

                    foreach ($order->orderItems as $item) {
                        $inventoryItems = $item->smartphone->inventory_items()
                            ->where('status', 'on_hold')
                            ->limit($item->quantity)
                            ->get();

                        foreach ($inventoryItems as $inventoryItem) {
                            $inventoryItem->update(['status' => 'in_stock']);
                        }

                    }

                    $user->notify(new NotifyCustomerOrderCryptoPaymentExpired($order, $currency));
                }

            });
    }
}
