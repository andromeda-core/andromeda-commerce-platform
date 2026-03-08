<?php

namespace App\Console\Commands;

use App\Jobs\CollaboratorCommissionSet;
use App\Jobs\DistributorCommissionSet;
use App\Jobs\SupplierCommissionSet;
use App\Models\Order;
use Illuminate\Console\Command;

class ConfirmPurchaseOrders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:confirm-purchase-orders';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'This Command is to confirm purchase orders And marking them after 72 hours as Purchase Confirmed and Assigning Commissions to Partners';

    public function handle()
    {
        Order::where('is_delivery_confirmed', true)
            ->where('status', 'delivered')
            ->where('delivery_confirmed_at', '<=', now()->subHours(72))
            ->where('is_purchase_confirmed', false)
            ->chunk(100, function ($orders) {
                foreach ($orders as $order) {
                    dispatch(new CollaboratorCommissionSet($order))->afterCommit();
                    dispatch(new DistributorCommissionSet($order))->afterCommit();
                    dispatch(new SupplierCommissionSet($order))->afterCommit();

                    $order->update([
                        'is_purchase_confirmed' => true,
                        'purchase_confirmed_at' => now(),
                    ]);
                }
            });
    }
}
