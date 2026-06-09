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
     * Stage 3.1 — customer My Reservations LIST. Auth-gated (route middleware 'auth') +
     * strictly customer-scoped inside the repository. Mirrors Website\OrderController::index:
     * returns JSON for the infinite-scroll load-more (ajax) and an Inertia page otherwise.
     */
    public function index(Request $request)
    {
        $response = $this->lodgingReservation->getCustomerReservations($request);

        if ($request->ajax() && $request->expectsJson() && $response['status'] === false) {
            return response()->json(['status' => false, 'message' => $response['message']], 400);
        }

        if ($response['status'] === false) {
            return to_route('login');
        }

        $reservations  = $response['reservations'];
        $next_page_url = $response['next_page_url'];

        if ($request->ajax() && $request->expectsJson()) {
            return response()->json(['status' => true, 'reservations' => $reservations, 'next_page_url' => $next_page_url], 200);
        }

        return Inertia::render('Website/Lodging/Reservations/index', compact('reservations', 'next_page_url'));
    }

    /**
     * Stage 3.1 — customer single reservation DETAIL by reservation_no / public_id.
     * Auth-gated + customer-scoped (the repository returns null for another customer's row);
     * a missing/foreign reservation is a 404. member_price is future-only and intentionally
     * NOT included in the payload (hidden from the customer).
     */
    public function show(Request $request, ?string $reservation_no = null)
    {
        if (empty($reservation_no)) {
            return to_route('website.lodging-reservations.index');
        }

        $reservation = $this->lodgingReservation->getCustomerSingleReservation($request, $reservation_no);

        if (empty($reservation)) {
            // Not found, or owned by another customer (strict scoping) -> 404.
            abort(404);
        }

        $latestPayment = $reservation->payments->first();

        return Inertia::render('Website/Lodging/Reservations/show', [
            'reservation' => [
                'reservation_no'              => $reservation->reservation_no,
                'public_id'                   => $reservation->public_id,
                'status'                      => $reservation->status,
                'property_name_snapshot'      => $reservation->property_name_snapshot,
                'room_name_snapshot'          => $reservation->room_name_snapshot,
                'rate_plan_name_snapshot'     => $reservation->rate_plan_name_snapshot,
                'checkin_date'                => optional($reservation->checkin_date)->toDateString(),
                'checkout_date'               => optional($reservation->checkout_date)->toDateString(),
                'nights'                      => (int) $reservation->nights,
                'guest_count'                 => (int) $reservation->guest_count,
                'request_message'             => $reservation->request_message,
                'online_amount'               => $reservation->online_amount,
                'currency_code'               => $reservation->currency_code,
                'created_at'                  => optional($reservation->created_at)->format('M d, Y'),
                // Shown to the customer only when relevant (the React page gates on status/presence).
                'hotel_rejected_reason'       => $reservation->hotel_rejected_reason,
                'alternative_room_suggestion' => $reservation->alternative_room_suggestion,
                'alternative_date_suggestion' => $reservation->alternative_date_suggestion,
                'payment_url'                 => $latestPayment?->nowpayments_payment_url,
            ],
        ]);
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

        // Stage 3.1 — "Go to My Reservations" points at the customer My Reservations list.
        $myReservationsUrl = route('website.lodging-reservations.index');

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
