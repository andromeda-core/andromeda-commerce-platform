<?php

namespace App\Services;

use App\Models\LodgingReservation;
use Exception;
use Illuminate\Support\Facades\Http;

/**
 * Stage 2.3 — isolated lodging NOWPayments invoice creator.
 *
 * Mirrors the existing NOWPaymentPaymentService pattern (same `services.now_payments`
 * config keys, same hosted-invoice `/invoice` endpoint, same x-api-key header) but is
 * SCOPED TO LODGING and returns the FULL invoice payload so the caller can persist the
 * identifiers into lodging_reservation_payments.
 *
 * It NEVER touches the orders / order_items / payments tables, nor the order payment
 * code path. Crypto-only at launch. The customer success/cancel pages (Stage 3) and the
 * IPN/webhook callback (Stage 2.4) are intentionally NOT wired here.
 */
class LodgingReservationPaymentService
{
    /**
     * Create a NOWPayments hosted invoice for a lodging reservation.
     *
     * Operator-facing context (invoked from the dashboard approve action), so messages
     * are plain English (not translated).
     *
     * @return array{status: bool, data?: array, message?: string}
     */
    public function createInvoice(LodgingReservation $reservation): array
    {
        // Read config at call time (AppServiceProvider populates these from the
        // now_payments settings table at boot).
        $apiKey  = config('services.now_payments.api_key');
        $baseUrl = config('services.now_payments.base_url');

        if (empty($apiKey) || empty($baseUrl)) {
            return ['status' => false, 'message' => 'NOWPayments is not configured.'];
        }

        $amount   = (float) ($reservation->online_amount ?? 0);
        $currency = strtoupper((string) ($reservation->currency_code ?? ''));

        if ($amount <= 0 || $currency === '') {
            return ['status' => false, 'message' => 'Reservation online amount or currency is invalid for invoicing.'];
        }

        try {
            $payload = [
                'price_amount'      => $amount,
                'price_currency'    => $currency, // dynamic base currency, not hardcoded
                'order_id'          => $reservation->reservation_no,
                'order_description' => "Lodging reservation {$reservation->reservation_no}",
                // success_url / cancel_url -> Stage 3 (customer pages).
                // ipn_callback_url -> Stage 2.4 (webhook confirmation).
            ];

            $response = Http::withHeaders([
                'x-api-key'    => $apiKey,
                'Content-Type' => 'application/json',
            ])->post("{$baseUrl}/invoice", $payload);

            $data = $response->json();

            if (! $response->successful() || empty($data['invoice_url'])) {
                $message = is_array($data) && ! empty($data['message'])
                    ? $data['message']
                    : 'Unable to create NOWPayments invoice.';

                return ['status' => false, 'message' => $message];
            }

            return ['status' => true, 'data' => $data];
        } catch (Exception $e) {
            return ['status' => false, 'message' => $e->getMessage()];
        }
    }
}
