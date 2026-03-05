<?php

namespace App\Console\Commands;

use App\Models\Order;
use Illuminate\Console\Command;

class MarkingOrdersAsDeliveryConfirmedAfterSevenDays extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:marking-orders-as-delivery-confirmed-after-seven-days';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'This Command is used to mark orders as delivery confirmed after 7 days';

    public function handle()
    {

        Order::where('is_delivery_confirmed', false)
            ->whereNotNull('delivered_at')
            ->whereDate('delivered_at', '<=', now()->subDays(7))
            ->update([
                'is_delivery_confirmed' => true,
                'delivery_confirmed_at' => now(),
            ]);
    }
}
