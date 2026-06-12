<?php

namespace App\Console\Commands;

use App\Models\LodgingReservationPayment;
use App\Repositories\LodgingReservation\Interface\ILodgingReservationRepository;
use Illuminate\Console\Command;

/**
 * Stage 2.4 — lodging payment confirmation poller. This is the ONLY confirmation path
 * (there is NO IPN/webhook); it mirrors the order NOWPaymentInvoiceStatusCheck command,
 * scoped to lodging.
 *
 * Stage 3 Fix: it polls by the NOWPayments PAYMENT id (NP_id) that NOWPayments appends to the
 * lodging success_url and which paymentSuccess seeds onto the active payment row. It selects every
 * non-terminal lodging_reservation_payments row (status created/pending) whose reservation is
 * PAYMENT_PENDING or PAYMENT_LINK_CREATED and that HAS a nowpayments_payment_id, then for each
 * delegates to the repository's reconcilePaymentById(): authoritative GET {base}/payment/{NP_id}
 * + the idempotent, expired-link-safe finalize core (finished -> CONFIRMED, failed/expired ->
 * PAYMENT_FAILED) UNCHANGED. Rows without an NP_id (customer has not returned/paid yet) are skipped;
 * the 60-min approved-unpaid expiry cron handles true abandonment.
 *
 * Touches NO order data.
 */
class LodgingReservationPaymentStatusCheck extends Command
{
    protected $signature = 'app:lodging-reservation-payment-status-check';

    protected $description = 'Poll NOWPayments (by invoice id) for in-progress lodging reservation payments and confirm/fail them (idempotent)';

    public function __construct(
        private ILodgingReservationRepository $lodgingReservation,
    ) {
        parent::__construct();
    }

    public function handle(): int
    {
        LodgingReservationPayment::query()
            ->whereIn('status', ['created', 'pending'])
            ->whereNotNull('nowpayments_payment_id') // poll by the NP_id seeded on the success redirect
            ->whereHas('lodgingReservation', function ($query) {
                $query->whereIn('status', ['PAYMENT_PENDING', 'PAYMENT_LINK_CREATED']);
            })
            ->chunkById(100, function ($payments) {
                foreach ($payments as $payment) {
                    try {
                        // No NP_id yet means the customer has not returned from the NOWPayments
                        // hosted page — skip (the 60-min approved-unpaid expiry cron covers true
                        // abandonment). The query already filters these out; this is a belt-and-
                        // suspenders guard against an empty-string value.
                        $npId = trim((string) $payment->nowpayments_payment_id);
                        if ($npId === '') {
                            continue;
                        }

                        // Authoritative re-query by NP_id (GET {base}/payment/{NP_id}) + the shared,
                        // idempotent, expired-link-safe finalize core (finished -> CONFIRMED,
                        // failed/expired -> PAYMENT_FAILED) + notifications. Reused UNCHANGED.
                        $this->lodgingReservation->reconcilePaymentById($npId);
                    } catch (\Throwable $e) {
                        // One bad row must not stop the batch.
                        \Log::error('Lodging payment poll failed', [
                            'payment_id' => $payment->id,
                            'np_id' => $payment->nowpayments_payment_id,
                            'error' => $e->getMessage(),
                        ]);
                    }
                }
            });

        return self::SUCCESS;
    }
}
