<?php

namespace App\Console\Commands;

use App\Models\Order;
use App\Notifications\NotifyCustomerAboutOrderCryptoPaymentReceived;
use App\Notifications\NotifyCustomerOrderCryptoPaymentFailed;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
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

        Order::where('status', 'blockchain_confirmation_pending')
            ->with(['orderItems.smartphone.inventory_items', 'customer.user'])
            ->chunk(100, function ($orders) use ($now_payment_api_key, $base_url, $currency) {
                foreach ($orders as $order) {
                    $user = $order->customer->user;

                    $np_id = $order->np_id;

                    if (empty($np_id)) {
                        $order->status = 'failed';
                        $order->save();

                        foreach ($order->orderItems as $item) {
                            $quantity = $item->quantity;

                            $inventoryItems = $item->smartphone->inventory_items()
                                ->where('status', 'on_hold')
                                ->limit($quantity)
                                ->get();

                            foreach ($inventoryItems as $inventoryItem) {
                                $inventoryItem->update(['status' => 'in_stock']);
                            }
                        }

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
                            $order->update(['status' => 'paid']);

                            foreach ($order->orderItems as $item) {
                                $quantity = $item->quantity;
                                $inventoryItems = $item->smartphone->inventory_items()
                                    ->where('status', 'on_hold')
                                    ->limit($quantity)
                                    ->get();

                                foreach ($inventoryItems as $inventoryItem) {
                                    $inventoryItem->update(['status' => 'sold']);
                                }
                            }

                            $user->notify(new NotifyCustomerAboutOrderCryptoPaymentReceived($order, $currency));

                            break;

                        case 'failed':
                        case 'expired':
                            $order->update(['status' => 'failed']);

                            foreach ($order->orderItems as $item) {
                                $quantity = $item->quantity;
                                $inventoryItems = $item->smartphone->inventory_items()
                                    ->where('status', 'on_hold')
                                    ->limit($quantity)
                                    ->get();

                                foreach ($inventoryItems as $inventoryItem) {
                                    $inventoryItem->update(['status' => 'in_stock']);
                                }
                            }

                            $user->notify(new NotifyCustomerOrderCryptoPaymentFailed($order, $currency));
                            break;
                    }
                }
            });

    }
}
