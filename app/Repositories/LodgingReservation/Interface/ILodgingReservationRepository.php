<?php

namespace App\Repositories\LodgingReservation\Interface;

use Illuminate\Http\Request;

/**
 * Stage 2.2: reservation creation (customer) + operator dashboard visibility.
 * Stage 2.3: operator approve/reject/suggest/note + auto NOWPayments invoice on approval.
 * Payment confirmation (webhook/IPN), expiry crons, and notifications are Stage 2.4.
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
}
