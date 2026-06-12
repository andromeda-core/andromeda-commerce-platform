<?php

namespace App\Http\Controllers\Website;

use App\Http\Controllers\Controller;
use App\Models\LodgingReservation;
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

        // Stage 3 (show rebuild — ACCURATE fee breakdown) — the Payment Summary needs the ONLINE-
        // collected fee components so it can render Subtotal / Service fee / Cleaning fee / Tax
        // instead of one misleading derived "Taxes & fees" line. The reservation snapshots only the
        // per-night price (price_snapshot) + the final online_amount, NOT the individual fee
        // components, so they are read from the LIVE cancellation policy (reachable via
        // lodgingProduct). cancellationPolicy is not part of the repository's eager-load, so it is
        // additively loaded here (single record — negligible). buildOnlineFeeBreakdown() also reports
        // whether the parts still sum to online_amount (`reconciles`) so the page can degrade safely
        // if the policy changed after booking. On-site-only fees are never read; member_price never
        // exposed.
        $reservation->loadMissing('lodgingProduct.cancellationPolicy');
        $onlineFees = $this->buildOnlineFeeBreakdown($reservation);

        return Inertia::render('Website/Lodging/Reservations/show', [
            'reservation' => [
                'reservation_no'              => $reservation->reservation_no,
                'public_id'                   => $reservation->public_id,
                'status'                      => $reservation->status,
                // Stage 3.4.4 — translated CURRENT name where the relation survives; else the frozen
                // English snapshot (Option A — stored snapshot columns are never modified).
                'property_name_snapshot'      => $reservation->lodgingProduct?->translatedValue('property_name') ?? $reservation->property_name_snapshot,
                'room_name_snapshot'          => $reservation->lodgingRoom?->translatedValue('room_name') ?? $reservation->room_name_snapshot,
                'rate_plan_name_snapshot'     => $reservation->lodgingRatePlan?->translatedValue('name') ?? $reservation->rate_plan_name_snapshot,
                'checkin_date'                => optional($reservation->checkin_date)->toDateString(),
                'checkout_date'               => optional($reservation->checkout_date)->toDateString(),
                'nights'                      => (int) $reservation->nights,
                'guest_count'                 => (int) $reservation->guest_count,
                'request_message'             => $reservation->request_message,
                'online_amount'               => $reservation->online_amount,
                'currency_code'               => $reservation->currency_code,
                // Stage 3 (show rebuild) — the per-night sale price (NOT member_price). Subtotal =
                // price_snapshot * nights. The per-fee breakdown rides on `online_fees` below; Total
                // stays online_amount (authoritative — never recomputed from parts).
                'price_snapshot'              => $reservation->price_snapshot,
                // Stage 3 (show rebuild — accurate fee breakdown) — ONLINE-collected fee components
                // for the Payment Summary: { subtotal, service_fee, cleaning_fee, tax, reconciles }.
                // Each fee is null unless it is online-collected AND > 0. `reconciles` is false when
                // the live policy no longer sums to online_amount (e.g. edited after booking) — the
                // page then degrades to a single derived line. On-site fees / member_price excluded.
                'online_fees'                 => $onlineFees,
                'created_at'                  => optional($reservation->created_at)->format('M d, Y'),
                // Shown to the customer only when relevant (the React page gates on status/presence).
                'hotel_rejected_reason'       => $reservation->hotel_rejected_reason,
                'alternative_room_suggestion' => $reservation->alternative_room_suggestion,
                'alternative_date_suggestion' => $reservation->alternative_date_suggestion,
                'payment_url'                 => $latestPayment?->nowpayments_payment_url,
                // Stage 3 Fix — lets the page hide "Complete Payment" once the customer has gone to
                // NOWPayments (the success redirect seeds this NP_id onto the active payment row).
                'nowpayments_payment_id'      => $latestPayment?->nowpayments_payment_id,

                // Stage 3 (show rebuild) — additive, READ-ONLY display detail read from the SAME
                // already-eager-loaded latest payment ($latestPayment) + reservation columns. No new
                // query, no logic/transition/pricing change, no change to the payments relation shape.
                // Powers the customer "Status & Payment" card; member_price is still never exposed.
                // Each is null-safe and the React page renders a row only when its value exists.
                'payment_status'              => $latestPayment?->status,
                'payment_method'              => $latestPayment?->method_type,
                'pay_currency'                => $latestPayment?->pay_currency,
                'tx_hash'                     => $latestPayment?->tx_hash,
                'payment_confirmed_at'        => optional($latestPayment?->payment_confirmed_at)->format('M d, Y'),
                // The 60-min payment-window deadline (set at approval); the page shows it only while
                // the reservation is still awaiting payment.
                'approval_expires_at'         => optional($reservation->approval_expires_at)->format('M d, Y h:i A'),
                // Stage 3 — RAW ISO-8601 sibling of the formatted deadline above, for the Order-style
                // static "Expires in" countdown (parsed with dayjs.utc). Same field the expiry cron
                // gates on; the formatted "Payment Deadline" display value stays unchanged.
                'approval_expires_at_raw'     => optional($reservation->approval_expires_at)?->toIso8601String(),
            ],
        ]);
    }

    /**
     * Stage 3 (show rebuild) — build the ONLINE fee breakdown for the customer Payment Summary.
     *
     * Source: the reservation snapshots only price_snapshot (per night) + the final online_amount,
     * so the per-fee components are read from the LIVE cancellation policy — service_fee /
     * cleaning_fee / tax_amount, each gated by its matching *_online flag (exactly the columns the
     * online_amount formula in LodgingReservationRepository::storeReservationRequest uses). On-site-
     * only fees (deposit, parking, pet, etc.) are NEVER read here; member_price is never exposed. A
     * fee is null unless it is online-collected AND greater than zero (so the page renders no empty
     * rows).
     *
     * Because the components are read live (not snapshotted at booking), `reconciles` reports whether
     * subtotal + service + cleaning + tax still equals the authoritative online_amount. When a policy
     * was edited after booking they may diverge; the page shows the per-fee breakdown only when it
     * reconciles, otherwise it degrades to a single derived line so the displayed parts can never
     * disagree with the Total.
     */
    private function buildOnlineFeeBreakdown(LodgingReservation $reservation): array
    {
        $nights   = (int) $reservation->nights;
        $perNight = (float) $reservation->price_snapshot;
        $subtotal = round($perNight * $nights, 2);

        $policy = $reservation->lodgingProduct?->cancellationPolicy;

        // An online fee is shown only when its *_online flag is set and the amount is a positive number.
        $onlineFee = function ($amount, $flag) {
            if (! $flag || ! is_numeric($amount) || (float) $amount <= 0) {
                return null;
            }

            return round((float) $amount, 2);
        };

        $serviceFee  = $onlineFee($policy?->service_fee, (bool) $policy?->service_fee_online);
        $cleaningFee = $onlineFee($policy?->cleaning_fee, (bool) $policy?->cleaning_fee_online);
        $tax         = $onlineFee($policy?->tax_amount, (bool) $policy?->tax_online);

        $online     = (float) $reservation->online_amount;
        $partsSum   = round($subtotal + (float) $serviceFee + (float) $cleaningFee + (float) $tax, 2);
        $reconciles = abs($partsSum - $online) < 0.01;

        return [
            'subtotal'     => $subtotal,
            'service_fee'  => $serviceFee,
            'cleaning_fee' => $cleaningFee,
            'tax'          => $tax,
            'reconciles'   => $reconciles,
        ];
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

        // NOWPayments appends the PAYMENT id as ?NP_id=... on the success redirect. Persist it onto
        // the reservation's active payment row (idempotent, customer-scoped) so the polling command
        // can re-query payment status by it. Never blocks/ breaks the render if absent or failing.
        $npId = $request->query('NP_id');
        if (! empty($npId)) {
            $this->lodgingReservation->storePaymentNpId($request, $reservation_no, (string) $npId);
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
                // Stage 3.4.4 — translated live name (Option A); frozen English snapshot is the fallback.
                'property_name_snapshot' => $reservation->lodgingProduct?->translatedValue('property_name') ?? $reservation->property_name_snapshot,
                'room_name_snapshot'     => $reservation->lodgingRoom?->translatedValue('room_name') ?? $reservation->room_name_snapshot,
                'checkin_date'           => optional($reservation->checkin_date)->toDateString(),
                'checkout_date'          => optional($reservation->checkout_date)->toDateString(),
                'online_amount'          => $reservation->online_amount,
                'currency_code'          => $reservation->currency_code,
            ],
            'my_reservations_url' => $myReservationsUrl,
        ]);
    }
}
