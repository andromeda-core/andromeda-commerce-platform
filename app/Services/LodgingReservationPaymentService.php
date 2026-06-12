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
 * code path. Crypto-only at launch.
 *
 * Stage 2.4: confirmation is POLL-ONLY (no IPN/webhook), mirroring the order flow.
 * getPaymentStatus() is the authoritative server-side re-query the polling command uses to
 * finalize a reservation. success_url / cancel_url remain deferred to Stage 3 (customer pages).
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
                // cancel_url -> deferred (Stage 3): the success page is status-aware and would
                //   misread a cancel as "payment received"; no neutral lodging cancel page yet.
                // No ipn_callback_url: confirmation is poll-only (see getPaymentsByInvoiceId).
            ];

            // success_url -> the LODGING payment success page ONLY (never an order route), carrying
            // the reservation_no like orders carry order_no. The page is read-only UX; the poll
            // confirms. Guarded so invoice creation never fails if the URL cannot be generated.
            try {
                $payload['success_url'] = route('website.lodging-reservations.payment-success', [
                    'reservation_no' => $reservation->reservation_no,
                ]);
            } catch (Exception $e) {
                // Leave it unset; confirmation does not depend on the redirect.
            }

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

    /**
     * Authoritative server-side status re-query for a NOWPayments payment.
     *
     * Mirrors the order polling command's GET {base}/payment/{id} call with the
     * merchant x-api-key. This is the SINGLE source of truth used to confirm/fail a
     * lodging reservation — the IPN body is never trusted on its own (an IPN merely
     * triggers/seeds; this re-query decides). Isolated to lodging, touches no order data.
     *
     * @return array{status: bool, data?: array, message?: string}
     */
    public function getPaymentStatus(string $paymentId): array
    {
        $apiKey  = config('services.now_payments.api_key');
        $baseUrl = config('services.now_payments.base_url');

        if (empty($apiKey) || empty($baseUrl)) {
            return ['status' => false, 'message' => 'NOWPayments is not configured.'];
        }

        if (trim($paymentId) === '') {
            return ['status' => false, 'message' => 'Missing NOWPayments payment id.'];
        }

        try {
            $response = Http::withHeaders([
                'x-api-key' => $apiKey,
            ])->get("{$baseUrl}/payment/{$paymentId}");

            $data = $response->json();

            if (! $response->successful() || empty($data['payment_status'])) {
                return ['status' => false, 'message' => 'Unable to fetch NOWPayments payment status.'];
            }

            return ['status' => true, 'data' => $data];
        } catch (Exception $e) {
            return ['status' => false, 'message' => $e->getMessage()];
        }
    }

    /**
     * List NOWPayments payment(s) for a given INVOICE id and return the most relevant one.
     *
     * Self-contained confirmation: at approval we always store the invoice id (NOWPayments only
     * issues a payment id once the customer starts paying). The poll uses this to discover the
     * payment id, then re-queries it via getPaymentStatus (the authoritative finalize call).
     *
     * Endpoint (ASSUMPTION — flagged): NOWPayments "list payments" endpoint GET {base}/payment/
     * filtered by `invoiceId`. The response is shaped { data: [ {payment_id, payment_status,
     * invoice_id, ...}, ... ] }. We also filter client-side by invoice_id defensively in case the
     * server returns unfiltered results. Same x-api-key + call-time config as getPaymentStatus.
     *
     * Picking rule: prefer a `finished` payment; otherwise the most recent (largest payment_id).
     *
     * @return array{status: bool, data?: array|null, message?: string}
     *         status=false on config/HTTP error; status=true,data=null when no payment exists yet
     *         (customer has not started paying); status=true,data=<payment> when one is found.
     */
    public function getPaymentsByInvoiceId(string $invoiceId): array
    {
        $apiKey  = config('services.now_payments.api_key');
        $baseUrl = config('services.now_payments.base_url');

        if (empty($apiKey) || empty($baseUrl)) {
            return ['status' => false, 'message' => 'NOWPayments is not configured.'];
        }

        if (trim($invoiceId) === '') {
            return ['status' => false, 'message' => 'Missing NOWPayments invoice id.'];
        }

        try {
            $response = Http::withHeaders([
                'x-api-key' => $apiKey,
            ])->get("{$baseUrl}/payment/", ['invoiceId' => $invoiceId]);

            $data = $response->json();
            info(json_encode($data));

            if (! $response->successful()) {
                return ['status' => false, 'message' => 'Unable to list NOWPayments payments by invoice.'];
            }

            // Accept either { data: [...] } or a bare [...] response.
            $list = [];
            if (is_array($data)) {
                $list = isset($data['data']) && is_array($data['data']) ? $data['data'] : $data;
            }

            // Keep only well-formed payment rows; defensively filter to this invoice id.
            $payments = [];
            foreach ($list as $item) {
                if (! is_array($item) || empty($item['payment_id'])) {
                    continue;
                }
                if (isset($item['invoice_id']) && (string) $item['invoice_id'] !== (string) $invoiceId) {
                    continue;
                }
                $payments[] = $item;
            }

            if (empty($payments)) {
                // No payment started yet for this invoice — caller skips safely.
                return ['status' => true, 'data' => null];
            }

            // Prefer a finished payment; otherwise the most recent (largest payment_id).
            $finished = array_values(array_filter($payments, fn ($p) => strtolower((string) ($p['payment_status'] ?? '')) === 'finished'));
            $pool = ! empty($finished) ? $finished : $payments;

            usort($pool, fn ($a, $b) => (int) ($a['payment_id'] ?? 0) <=> (int) ($b['payment_id'] ?? 0));
            $chosen = end($pool);

            return ['status' => true, 'data' => $chosen];
        } catch (Exception $e) {
            return ['status' => false, 'message' => $e->getMessage()];
        }
    }
}
