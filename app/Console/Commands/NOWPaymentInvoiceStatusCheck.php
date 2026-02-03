<?php

namespace App\Console\Commands;

use App\Jobs\Meta\NotifyCustomerAboutOrderCryptoPaymentReceivedJob;
use App\Jobs\Meta\NotifyCustomerOrderCryptoPaymentFailedJob;
use App\Models\Inventory;
use App\Models\Order;
use App\Models\SpecialCountry;
use App\Notifications\NotifyCustomerAboutOrderCryptoPaymentReceived;
use App\Notifications\NotifyCustomerOrderCryptoPaymentFailed;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

class NOWPaymentInvoiceStatusCheck extends Command
{
    protected $signature = 'app:n-o-w-payment-invoice-status-check';

    protected $description = 'This Command Will Check NOW Payment Invoice Status';

    public function handle()
    {
        $now_payment_api_key = config('services.now_payments.api_key');
        $base_url = config('services.now_payments.base_url');
        $currency = Cache::get('currency');
        $meta_setting = Cache::get('meta_setting');
        Order::where('status', 'blockchain_confirmation_pending')
            ->with(['orderItems.inventoryItem', 'customer.user', 'customer.user.metaContacts'])
            ->chunk(100, function ($orders) use ($now_payment_api_key, $base_url, $currency, $meta_setting) {
                foreach ($orders as $order) {
                    $user = $order->customer->user;

                    $np_id = $order->np_id;

                    if (empty($np_id)) {
                        DB::transaction(function () use ($order) {
                            $order->update(['status' => 'failed']);

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

                        continue;
                    }

                    $response = Http::withHeaders([
                        'x-api-key' => $now_payment_api_key,
                    ])->get($base_url."/payment/{$np_id}");

                    $data = $response->json();

                    if (! $response->successful() || empty($data['payment_status'])) {
                        continue;
                    }

                    $paymentStatus = strtolower($data['payment_status']);

                    switch ($paymentStatus) {
                        case 'finished':
                            DB::transaction(function () use ($order) {
                                $order->update(['status' => 'paid']);

                                foreach ($order->orderItems as $item) {

                                    $inventoryItemsIds = $item->inventory_item_ids;
                                    if (empty($inventoryItemsIds)) {
                                        continue;
                                    }
                                    foreach ($inventoryItemsIds as $inventoryItemId) {

                                        $inventoryItem = Inventory::find($inventoryItemId);
                                        if (! empty($inventoryItem)) {
                                            $inventoryItem->update([
                                                'status' => 'sold',
                                            ]);
                                        }
                                    }

                                }
                            });

                            $user->notify(new NotifyCustomerAboutOrderCryptoPaymentReceived($order, $currency));

                            $user_meta_contacts = $order->customer->user->metaContacts;
                            $is_eligible = SpecialCountry::where('country_id', $order->customer->country_id)->exists();
                            if (! empty($meta_setting) && $user_meta_contacts->isNotEmpty() && $is_eligible) {
                                dispatch(new NotifyCustomerAboutOrderCryptoPaymentReceivedJob($user_meta_contacts, $order, $meta_setting, $user, $currency))->onQueue('meta');
                            }

                            break;

                        case 'failed':
                        case 'expired':
                            DB::transaction(function () use ($order) {
                                $order->update(['status' => 'failed']);

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

                            $user->notify(new NotifyCustomerOrderCryptoPaymentFailed($order, $currency));

                            $user_meta_contacts = $order->customer->user->metaContacts;
                            $is_eligible = SpecialCountry::where('country_id', $order->customer->country_id)->exists();
                            if (! empty($meta_setting) && $user_meta_contacts->isNotEmpty() && $is_eligible) {
                                dispatch(new NotifyCustomerOrderCryptoPaymentFailedJob($user_meta_contacts, $order, $meta_setting, $user, $currency))->onQueue('meta');
                            }

                            break;
                    }
                }
            });

    }
}
