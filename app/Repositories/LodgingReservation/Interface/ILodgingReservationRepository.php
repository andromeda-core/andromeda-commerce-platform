<?php

namespace App\Repositories\LodgingReservation\Interface;

use Illuminate\Http\Request;

/**
 * Stage 2.2: reservation creation (customer) + operator dashboard visibility.
 * Stage 2.3: operator approve/reject/suggest/note + auto NOWPayments invoice on approval.
 * Stage 2.4: payment confirmation (polling only, no IPN), expiry crons, PAYMENT_FAILED, notifications.
 */
interface ILodgingReservationRepository
{
    // Customer-facing: create a reservation request.
    public function storeReservationRequest(Request $request);

    // Dashboard: paginated list of reservations.
    public function getAllReservations(Request $request);

    // Dashboard: single reservation (full detail) by reservation_no / public_id.
    public function getSingleReservation(string $identifier);

    // Dashboard (operator): approve + auto-create NOWPayments invoice.
    public function approveReservation(string $identifier, Request $request);

    // Dashboard (operator): reject with reason/note.
    public function rejectReservation(string $identifier, Request $request);

    // Dashboard (operator): store alternative room/date suggestion (no status change).
    public function suggestAlternative(string $identifier, Request $request);

    // Dashboard (operator): store an internal note.
    public function addInternalNote(string $identifier, Request $request);

    // Stage 2.4 — re-query a payment by NOWPayments payment id and finalize (polling path).
    public function reconcilePaymentById(string $paymentId);

    // Stage 2.4 Fix 2 — resolve a payment id from the invoice id, then finalize (self-contained poll).
    public function reconcilePaymentByInvoiceId(string $invoiceId);

    // Stage 2.4 — expire both deadlines (24h no-response, 60min approved-unpaid).
    public function expireStaleReservations();

    // Stage 2.4 Fix 2 — customer-scoped, READ-ONLY reservation load for the payment success page.
    public function getCustomerReservation(Request $request, string $reservationNo, bool $shouldCheckCustomer = true);

    public function getReservationCustomerInfo(string $reservationNo);

    // Stage 3 Fix — persist the NOWPayments payment id (NP_id) appended to the success_url onto the
    // reservation's active payment row (customer-scoped, idempotent) so polling can re-query by it.
    public function storePaymentNpId(Request $request, string $reservationNo, string $npId): void;

    // Stage 3.1 — customer My Reservations LIST (paginated, customer-scoped, read-only).
    public function getCustomerReservations(Request $request);

    // Stage 3.1 — customer single reservation DETAIL by reservation_no / public_id (customer-scoped, read-only).
    public function getCustomerSingleReservation(Request $request, string $reservation_no);

    // Referral fix — pure lookup/preview (no reservation created/modified); validates a referral
    // code and previews the reward points it would earn, reusing the exact same calculation the
    // real CONFIRMED-time award uses so the preview can never drift.
    public function previewReferralCode(Request $request): array;
}
