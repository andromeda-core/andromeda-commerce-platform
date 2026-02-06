<?php

namespace App\Console\Commands;

use App\Jobs\Meta\NotifyCustomerOrderCryptoPaymentExpiredJob;
use App\Models\Inventory;
use App\Models\Order;
use App\Models\SpecialCountry;
use App\Notifications\NotifyCustomerOrderCryptoPaymentExpired;
use Cache;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class NOWPaymentAutoMarkingOrderFailedIfNotPaid extends Command
{
    protected $signature = 'app:n-o-w-payment-auto-marking-order-failed-if-not-paid';

    protected $description = 'This Command Will Change Status Of Orders Whose Payment Status Is Not Paid And Not Even User Tries To Pay Via Crypto To Failed';

    public function handle()
    {
        $expiredTime = now()->subMinutes(30);
        $currency = Cache::get('currency');
        $meta_setting = Cache::get('meta_setting');
        Order::where('status', 'awaiting_payment')
            ->where('created_at', '<', $expiredTime)
            ->with(['orderItems.inventoryItem', 'customer.user', 'customer.user.metaContacts'])
            ->chunk(100, function ($orders) use ($currency, $meta_setting) {

                foreach ($orders as $order) {

                    $user = $order->customer->user;

                    DB::transaction(function () use ($order, $user) {
                        $order->update(['status' => 'expired']);

                        if (! empty($order->points_used)) {
                            $user->reward_points()->create([
                                'points' => $order->points_used,
                                'expires_at' => now()->addYears(5),
                            ]);
                        }

                        foreach ($order->orderItems as $item) {

                            $inventoryItemsIds = $item->inventory_item_ids;
                            if (empty($inventoryItemsIds)) {
                                continue;
                            }

                            foreach ($inventoryItemsIds as $inventoryItemId) {

                                $inventoryItem = Inventory::find($inventoryItemId);
                                if (! empty($inventoryItem)) {
                                    $inventoryItem->update([
                                        'status' => 'in_stock',
                                    ]);
                                }
                            }

                        }

                    });

                    $user->notify(new NotifyCustomerOrderCryptoPaymentExpired($order, $currency));

                    $user_meta_contacts = $order->customer->user->metaContacts;
                    $is_eligible = SpecialCountry::where('country_id', $order->customer->country_id)->exists();
                    if (! empty($meta_setting) && $user_meta_contacts->isNotEmpty() && $is_eligible) {
                        dispatch(new NotifyCustomerOrderCryptoPaymentExpiredJob($user_meta_contacts, $order, $meta_setting, $user, $currency))->onQueue('meta');
                    }

                }

            });
    }
}
