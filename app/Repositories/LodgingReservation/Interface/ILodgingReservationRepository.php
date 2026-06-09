<?php

namespace App\Repositories\LodgingReservation\Interface;

use Illuminate\Http\Request;

/**
 * Stage 2.2: reservation creation (customer) + operator dashboard visibility.
 * Approve/reject + NOWPayments invoice come in 2.3; payment/webhooks/expiry in 2.4.
 */
interface ILodgingReservationRepository
{
    // Customer-facing: create a reservation request.
    public function storeReservationRequest(Request $request);

    // Dashboard: paginated list of reservations.
    public function getAllReservations(Request $request);

    // Dashboard: single reservation (full detail) by reservation_no / public_id.
    public function getSingleReservation(string $identifier);
}
