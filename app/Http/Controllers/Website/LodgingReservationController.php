<?php

namespace App\Http\Controllers\Website;

use App\Http\Controllers\Controller;
use App\Repositories\LodgingReservation\Interface\ILodgingReservationRepository;
use Illuminate\Http\Request;
use Inertia\Inertia;

/**
 * Stage 2.2 — customer-facing reservation REQUEST creation.
 * Stage 2.4 Fix 2 — read-only payment success page (the NOWPayments success_url target).
 *
 * The reservation product page is Stage 3. Stage 2.4 confirmation is handled entirely by the
 * scheduled polling command (app:lodging-reservation-payment-status-check) — there is NO IPN/webhook
 * endpoint, and the success page below NEVER confirms payment (it only displays current status).
 */
class LodgingReservationController extends Controller
{
    public function __construct(
        private ILodgingReservationRepository $lodgingReservation,
    ) {}

    public function store(Request $request)
    {
        $response = $this->lodgingReservation->storeReservationRequest($request);

        // API consumers (and the future Stage 3 product page) get JSON.
        if ($request->expectsJson()) {
            if ($response['status'] === false) {
                return response()->json(['status' => false, 'message' => $response['message']], 422);
            }

            return response()->json([
                'status'         => true,
                'message'        => $response['message'],
                'reservation_no' => $response['reservation']->reservation_no ?? null,
                'public_id'      => $response['reservation']->public_id ?? null,
            ], 201);
        }

        if ($response['status'] === false) {
            return back()->with('error', $response['message']);
        }

        return back()->with('success', $response['message']);
    }

    /**
     * Stage 2.4 Fix 2 — NOWPayments success_url landing page for a LODGING reservation.
     *
     * READ-ONLY: it loads the reservation (customer-scoped) and renders a status-aware page.
     * It does NOT confirm payment or change any status — the scheduled poll command does that.
     */
    public function paymentSuccess(Request $request, ?string $reservation_no = null)
    {
        $reservation_no = $reservation_no ?? $request->query('reservation_no');

        if (empty($reservation_no)) {
            return to_route('home');
        }

        $reservation = $this->lodgingReservation->getCustomerReservation($request, $reservation_no);

        if (empty($reservation)) {
            // Not found or not owned by this customer — never a dead-end.
            return to_route('home');
        }

        // Derive the display state from the reservation's REAL status (confirmation is async).
        $status = $reservation->status;
        $displayState = match (true) {
            in_array($status, ['CONFIRMED', 'PAYMENT_CONFIRMED'], true) => 'confirmed',
            in_array($status, ['PAYMENT_PENDING', 'PAYMENT_LINK_CREATED'], true) => 'pending',
            in_array($status, ['PAYMENT_EXPIRED', 'EXPIRED_NO_RESPONSE'], true) => 'expired',
            $status === 'PAYMENT_FAILED' => 'failed',
            default => 'processing',
        };

        // TODO (Stage 3): repoint "Go to My Reservations" at the customer My Reservations route
        // once it exists. Until then it points at the customer orders hub so it is never a dead link.
        $myReservationsUrl = route('website.orders.index');

        return Inertia::render('Website/Lodging/PaymentSuccess', [
            'reservation' => [
                'reservation_no'         => $reservation->reservation_no,
                'status'                 => $status,
                'display_state'          => $displayState,
                'property_name_snapshot' => $reservation->property_name_snapshot,
                'room_name_snapshot'     => $reservation->room_name_snapshot,
                'checkin_date'           => optional($reservation->checkin_date)->toDateString(),
                'checkout_date'          => optional($reservation->checkout_date)->toDateString(),
                'online_amount'          => $reservation->online_amount,
                'currency_code'          => $reservation->currency_code,
            ],
            'my_reservations_url' => $myReservationsUrl,
        ]);
    }
}
