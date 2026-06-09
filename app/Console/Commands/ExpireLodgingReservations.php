<?php

namespace App\Console\Commands;

use App\Repositories\LodgingReservation\Interface\ILodgingReservationRepository;
use Illuminate\Console\Command;

/**
 * Stage 2.4 — lodging expiry cron (BOTH deadlines, lodging-only).
 *
 *   (1) Operator no-response (24h): HOTEL_REVIEW_PENDING past its deadline -> EXPIRED_NO_RESPONSE.
 *   (2) Approved-but-unpaid (60min): approved/awaiting-payment family past approval_expires_at
 *       -> PAYMENT_EXPIRED (and the active payment link -> expired).
 *
 * All status changes go through the controlled transition + are lock/recheck-guarded so they never
 * collide with a payment that confirmed in the same tick. The existing order expiry cron is untouched.
 */
class ExpireLodgingReservations extends Command
{
    protected $signature = 'app:expire-lodging-reservations';

    protected $description = 'Expire stale lodging reservations: 24h operator no-response and 60min approved-but-unpaid';

    public function __construct(
        private ILodgingReservationRepository $lodgingReservation,
    ) {
        parent::__construct();
    }

    public function handle(): int
    {
        $result = $this->lodgingReservation->expireStaleReservations();

        $this->info(sprintf(
            'Lodging expiry: %d no-response, %d payment-expired.',
            $result['no_response_expired'] ?? 0,
            $result['payment_expired'] ?? 0,
        ));

        return self::SUCCESS;
    }
}
