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
 * SELF-CONTAINED (Fix 2): it polls by the NOWPayments INVOICE id we always store at approval
 * (NOWPayments only issues a payment id once the customer starts paying), so it does NOT depend
 * on an IPN or the Stage 3 success-redirect to seed a payment id. It selects every non-terminal
 * lodging_reservation_payments row (status created/pending) whose reservation is PAYMENT_PENDING
 * or PAYMENT_LINK_CREATED and that has a nowpayments_invoice_id, then for each delegates to the
 * repository's reconcilePaymentByInvoiceId(): list payments for the invoice -> if none yet, skip
 * safely (the 60-min expiry cron handles never-paid links) -> else seed the payment id and reuse
 * the idempotent, expired-link-safe finalize path (reconcilePaymentById) UNCHANGED.
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
            ->whereNotNull('nowpayments_invoice_id') // poll by the invoice id we always have
            ->whereHas('lodgingReservation', function ($query) {
                $query->whereIn('status', ['PAYMENT_PENDING', 'PAYMENT_LINK_CREATED']);
            })
            ->chunkById(100, function ($payments) {
                foreach ($payments as $payment) {
                    try {
                        // Resolve the payment id from the invoice, then reuse the shared
                        // confirmation core (re-query + idempotent + expired-link-safe).
                        $this->lodgingReservation->reconcilePaymentByInvoiceId((string) $payment->nowpayments_invoice_id);
                    } catch (\Throwable $e) {
                        // One bad row must not stop the batch.
                        \Log::error('Lodging payment poll failed', [
                            'payment_id' => $payment->id,
                            'np_invoice_id' => $payment->nowpayments_invoice_id,
                            'error' => $e->getMessage(),
                        ]);
                    }
                }
            });

        return self::SUCCESS;
    }
}
