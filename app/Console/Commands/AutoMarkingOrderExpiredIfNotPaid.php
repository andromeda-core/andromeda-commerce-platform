<?php

namespace App\Console\Commands;

use App\Jobs\Meta\NotifyCustomerOrderExpiredJob;
use App\Models\Inventory;
use App\Models\Order;
use App\Models\SpecialCountry;
use App\Notifications\NotifyCustomerOrderExpired;
use Cache;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class AutoMarkingOrderExpiredIfNotPaid extends Command
{
    protected $signature = 'app:order-expired';

    protected $description = 'This Command Will Change Status Of Orders Whose Payment Status Is Not Paid';

    public function handle()
    {
        $currency = Cache::get('currency');
        $meta_setting = Cache::get('meta_setting');
        Order::whereIn('status', ['awaiting_payment', 'pending'])
            ->with(['orderItems.inventoryItem', 'customer.user', 'customer.user.metaContacts'])
            ->chunk(100, function ($orders) use ($currency, $meta_setting) {

                foreach ($orders as $order) {

                    if (empty($order->expires_at)) {
                        continue;
                    }

                    $deadline = Carbon::parse($order->expires_at);
                    $graceCutoff = $deadline->copy()->addMinutes(3);

                    if (now()->lessThanOrEqualTo($graceCutoff)) {
                        continue;
                    }

                    $user = $order->customer->user;

                    DB::transaction(function () use ($order, $user) {
                        $locked = Order::whereKey($order->id)
                            ->with(['orderItems'])
                            ->lockForUpdate()->first();

                        if (! in_array($locked->status, ['awaiting_payment', 'pending'], true)) {
                            return;
                        }

                        $locked->update(['status' => 'expired', 'expired_at' => now()]);

                        if (! empty($locked->points_used)) {
                            $user->reward_points()->create([
                                'points' => $locked->points_used,
                                'expires_at' => now()->addYears(5),
                            ]);
                        }

                        foreach ($locked->orderItems as $item) {

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

                    $user->notify(new NotifyCustomerOrderExpired($order, $currency));

                    $user_meta_contacts = $order->customer->user->metaContacts;
                    $is_eligible = SpecialCountry::where('country_id', $order->customer->country_id)->exists();
                    if (! empty($meta_setting) && $user_meta_contacts->isNotEmpty() && $is_eligible) {
                        dispatch(new NotifyCustomerOrderExpiredJob($user_meta_contacts, $order, $meta_setting, $user, $currency))->onQueue('meta');
                    }

                }

            });
    }
}
