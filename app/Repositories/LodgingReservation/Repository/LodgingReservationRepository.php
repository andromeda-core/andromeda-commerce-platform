<?php

namespace App\Repositories\LodgingReservation\Repository;

use App\Models\LodgingReservation;
use App\Repositories\LodgingReservation\Interface\ILodgingReservationRepository;

/**
 * Stage 2.1: skeleton only. Methods are implemented in 2.2–2.4
 * (reservation flow, payment creation, webhooks, crons).
 */
class LodgingReservationRepository implements ILodgingReservationRepository
{
    public function __construct(
        private LodgingReservation $lodging_reservation,
    ) {}
}
