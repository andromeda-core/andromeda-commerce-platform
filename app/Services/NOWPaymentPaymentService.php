<?php

namespace App\Services;

use Cache;
use Exception;
use Illuminate\Support\Facades\Http;

class NOWPaymentPaymentService
{
    protected string $apiKey;

    protected string $baseUrl;

    public function __construct()
    {
        $this->apiKey = config('services.now_payments.api_key') ?? '';
        $this->baseUrl = config('services.now_payments.base_url') ?? '';
    }

    public function createPaymentSession($order)
    {
        $currency = Cache::get('currency') ?? 'USD';
        try {
            $payload = [
                'price_amount' => $order['order']['amount'],
                'price_currency' => strtoupper($currency->name),

                'order_id' => $order['order']['id'],
                'order_description' => "Payment for Order #{$order['order']['order_no']}",
                'success_url' => route('website.checkout.crypto-payment-success', ['order_no' => $order['order']['order_no']]),
                // 'cancel_url' => route('website.checkout.crypto-payment-cancel', ['order_no' => $order['order']['order_no']]),
                // 'ipn_callback_url' => route('website.checkout.crypto-payment-ipn'),
            ];

            $response = Http::withHeaders([
                'x-api-key' => $this->apiKey,
                'Content-Type' => 'application/json',
            ])->post("{$this->baseUrl}/invoice", $payload);

            $data = $response->json();

            if (! $response->successful() || empty($data['invoice_url'])) {
                throw new Exception($data['message'] ?? 'Unable to create NOWPayments session.');
            }

            return [
                'status' => true,
                'payment_url' => $data['invoice_url'],
                'message' => 'Payment Session Created Successfully Redirecting To NOWPayments',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }
}
