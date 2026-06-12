<?php

namespace App\Repositories\LodgingReservation\Repository;

use App\Helpers\Trans;
use App\Models\Currency;
use App\Models\LodgingRatePlan;
use App\Models\LodgingReservation;
use App\Models\LodgingReservationPayment;
use App\Models\User;
use App\Notifications\Lodging\LodgingReservationApproved;
use App\Notifications\Lodging\LodgingReservationConfirmed;
use App\Notifications\Lodging\LodgingReservationExpired;
use App\Notifications\Lodging\LodgingReservationPaymentFailed;
use App\Notifications\Lodging\LodgingReservationRejected;
use App\Notifications\Lodging\LodgingReservationRequestedAdmin;
use App\Repositories\LodgingReservation\Interface\ILodgingReservationRepository;
use App\Services\LodgingReservationPaymentService;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

/**
 * Stage 2.2 — reservation creation backend + operator dashboard read methods.
 *
 * SEPARATE PARALLEL DOMAIN: no FK or linkage to orders / order_items / payments.
 * No approve/reject, no NOWPayments, no notifications here (those are 2.3 / 2.4).
 */
class LodgingReservationRepository implements ILodgingReservationRepository
{
    public function __construct(
        private LodgingReservation $lodging_reservation,
        private LodgingRatePlan $lodging_rate_plan,
        private LodgingReservationPayment $lodging_reservation_payment,
        private LodgingReservationPaymentService $lodging_reservation_payment_service,
    ) {}

    /**
     * Create a reservation REQUEST from the authenticated customer.
     *
     * Submit -> HOTEL_REVIEW_PENDING (Doc 2 sec 4). No payment is created here;
     * payment happens only after hotel approval (Stage 2.3).
     */
    public function storeReservationRequest(Request $request)
    {
        // Only an authenticated customer may reserve.
        $user = $request->user();
        if (empty($user) || empty($user->customer)) {
            return ['status' => false, 'message' => Trans::get('Only customers can make a reservation.')];
        }
        $customer = $user->customer;

        $validated = $request->validate([
            'lodging_product_id' => ['required', 'integer', 'exists:lodging_products,id'],
            'lodging_room_id' => ['required', 'integer', 'exists:lodging_rooms,id'],
            'lodging_rate_plan_id' => ['required', 'integer', 'exists:lodging_rate_plans,id'],
            'checkin_date' => ['required', 'date', 'after_or_equal:today'],
            'checkout_date' => ['required', 'date', 'after:checkin_date'],
            'guest_count' => ['required', 'integer', 'min:1'],
            'request_message' => ['nullable', 'string', 'max:2000'],
        ]);

        try {
            // Re-validate the chosen rate plan against the chosen room + product (locked rule).
            $ratePlan = $this->lodging_rate_plan
                ->with(['lodgingRoom.lodgingProduct.cancellationPolicy'])
                ->find($validated['lodging_rate_plan_id']);

            if (empty($ratePlan)) {
                return ['status' => false, 'message' => Trans::get('Selected rate plan was not found.')];
            }

            $room = $ratePlan->lodgingRoom;
            if (empty($room) || (int) $room->id !== (int) $validated['lodging_room_id']) {
                return ['status' => false, 'message' => Trans::get('Selected rate plan does not belong to the chosen room.')];
            }

            $product = $room->lodgingProduct;
            if (empty($product) || (int) $product->id !== (int) $validated['lodging_product_id']) {
                return ['status' => false, 'message' => Trans::get('Selected room does not belong to the chosen property.')];
            }

            // Property, room, and rate plan must all be reservable.
            if (
                ! $product->is_active ||
                $product->is_reservation_closed ||
                ! $room->is_available ||
                ! $ratePlan->is_active ||
                ! $ratePlan->is_bookable
            ) {
                return ['status' => false, 'message' => Trans::get('Not available for reservation')];
            }

            // Rate plan must carry a valid sale price.
            $salePrice = $ratePlan->sale_price;
            if ($salePrice === null || ! is_numeric($salePrice) || (float) $salePrice <= 0) {
                return ['status' => false, 'message' => Trans::get('The selected rate plan does not have a valid price.')];
            }

            // Guest count vs the room's max_guests.
            if (! empty($room->max_guests) && (int) $validated['guest_count'] > (int) $room->max_guests) {
                return ['status' => false, 'message' => Trans::get('Guest count exceeds the room\'s maximum of').' '.(int) $room->max_guests.'.'];
            }

            // Whole nights between the two dates.
            $checkin = Carbon::parse($validated['checkin_date'])->startOfDay();
            $checkout = Carbon::parse($validated['checkout_date'])->startOfDay();
            $nights = (int) abs($checkin->diffInDays($checkout));

            if ($nights < 1) {
                return ['status' => false, 'message' => Trans::get('Check-out must be at least one night after check-in.')];
            }

            // Min / max nights from the rate plan when set.
            if (! empty($ratePlan->minimum_nights) && $nights < (int) $ratePlan->minimum_nights) {
                return ['status' => false, 'message' => Trans::get('This rate plan requires a minimum of').' '.(int) $ratePlan->minimum_nights.' '.Trans::get('night(s).')];
            }
            if (! empty($ratePlan->maximum_nights) && $nights > (int) $ratePlan->maximum_nights) {
                return ['status' => false, 'message' => Trans::get('This rate plan allows a maximum of').' '.(int) $ratePlan->maximum_nights.' '.Trans::get('night(s).')];
            }

            // Consecutive-nights rule from the rate plan - CONDITIONAL, mirroring the min/max-nights
            // guards above: when consecutive_nights_allowed is explicitly false the plan is a
            // single-night-only plan, so a stay of more than one night is refused. A true/null flag
            // (the default) never blocks. Reuses the $nights value computed above; server-authoritative.
            if ($ratePlan->consecutive_nights_allowed === false && $nights > 1) {
                return ['status' => false, 'message' => Trans::get('This rate plan is available for one-night stays only')];
            }

            // Same-day booking rules from the rate plan — CONDITIONAL, mirroring the min/max-nights
            // guards above: enforced only when the governing field disables/sets the rule; an unset
            // rule (null cutoff, or same_day_booking_allowed left at its default true) never blocks.
            // "Today" is evaluated in the app timezone (UTC), matching the panel's UTC check; both
            // rules apply only when the chosen check-in date is today.
            $isCheckinToday = $checkin->isSameDay(Carbon::today());

            // (1) same_day_booking_allowed === false -> a today check-in is not permitted.
            if ($isCheckinToday && $ratePlan->same_day_booking_allowed === false) {
                return ['status' => false, 'message' => Trans::get('Same-day booking is not available for this rate plan')];
            }

            // (2) booking_cutoff_time set -> a today check-in is refused once the current time
            // (UTC) is past the cutoff. A malformed/empty cutoff is ignored (fail-open).
            if ($isCheckinToday && ! empty($ratePlan->booking_cutoff_time)) {
                $cutoff = $this->parseSameDayCutoff($ratePlan->booking_cutoff_time);
                if ($cutoff !== null && now()->greaterThan($cutoff)) {
                    return ['status' => false, 'message' => Trans::get('Bookings for today have closed for this rate plan')];
                }
            }

            // online_amount per Joseph Adjustment 1 (locked):
            //   price_snapshot * nights
            //     + service_fee  (only if service_fee_online)
            //     + cleaning_fee (only if cleaning_fee_online)
            //     + tax_amount   (only if tax_online)
            // On-site fees are NOT included online.
            $cancellation = $product->cancellationPolicy;
            $priceSnapshot = (float) $salePrice;
            $onlineAmount = $priceSnapshot * $nights;

            if (! empty($cancellation)) {
                if ($cancellation->service_fee_online && is_numeric($cancellation->service_fee)) {
                    $onlineAmount += (float) $cancellation->service_fee;
                }
                if ($cancellation->cleaning_fee_online && is_numeric($cancellation->cleaning_fee)) {
                    $onlineAmount += (float) $cancellation->cleaning_fee;
                }
                if ($cancellation->tax_online && is_numeric($cancellation->tax_amount)) {
                    $onlineAmount += (float) $cancellation->tax_amount;
                }
            }

            $onlineAmount = round($onlineAmount, 2);

            // currency_code from the active BASE currency (dynamic, never hardcoded).
            $baseCurrency = Cache::get('currency') ?? Currency::where('is_active', true)->first();
            $currencyCode = $baseCurrency?->name;

            // Create the reservation. Operator/approval fields keep their 2.1 DB defaults
            // (requires_hotel_approval=true, availability_mode=HOTEL_MANUAL_CONFIRMATION,
            //  payment_timing=AFTER_HOTEL_APPROVAL, approval_source=DASHBOARD_MANUAL).
            // hotel_response_deadline = now()+24h — the operator no-response window (Joseph: 24 hours).
            // It is a plain mass-assignable timestamp (in $fillable, NOT a status-authority field),
            // so it is set here directly; only `status` goes through transitionStatus. The 2.4 expiry
            // cron reads this deadline (with a created_at+24h fallback when null on older rows).
            // Identity (public_id rsv_<uuid> / reservation_no RSV-<id>) is set in the model booted().
            $reservation = $this->lodging_reservation->create([
                'customer_id' => $customer->id,
                'lodging_product_id' => $product->id,
                'lodging_room_id' => $room->id,
                'lodging_rate_plan_id' => $ratePlan->id,
                'checkin_date' => $checkin->toDateString(),
                'checkout_date' => $checkout->toDateString(),
                'guest_count' => (int) $validated['guest_count'],
                'request_message' => $validated['request_message'] ?? null,
                'property_name_snapshot' => $product->property_name,
                'room_name_snapshot' => $room->room_name,
                'rate_plan_name_snapshot' => $ratePlan->name,
                'price_snapshot' => $priceSnapshot,
                'nights' => $nights,
                'online_amount' => $onlineAmount,
                'currency_code' => $currencyCode,
                'hotel_response_deadline' => now()->addHours(24),
            ]);

            if (empty($reservation)) {
                return ['status' => false, 'message' => Trans::get('Something went wrong while creating the reservation.')];
            }

            // status is NOT mass-assignable (Point 7); set it through the controlled transition.
            // The model default status is REQUESTED, so this records previous_status = REQUESTED
            // and moves the reservation to HOTEL_REVIEW_PENDING (Doc 2: submit -> HOTEL_REVIEW_PENDING).
            $this->transitionStatus($reservation, 'HOTEL_REVIEW_PENDING');

            // Stage 2.4 — notify operators/admins (dashboard + email) that a request needs review.
            $this->notifyAdminsOfNewRequest($reservation);

            return [
                'status' => true,
                'message' => Trans::get('Your reservation request has been submitted and is awaiting hotel review.'),
                'reservation' => $reservation,
            ];
        } catch (Exception $e) {
            return ['status' => false, 'message' => $e->getMessage()];
        }
    }

    /**
     * Dashboard list — paginated reservations with the columns the list needs.
     */
    public function getAllReservations(Request $request)
    {
        $reservations = $this->lodging_reservation
            ->when(! empty($request->input('search')), function ($query) use ($request) {
                $search = $request->input('search');
                $query->where(function ($subQ) use ($search) {
                    $subQ->where('reservation_no', 'like', '%'.$search.'%')
                        ->orWhere('property_name_snapshot', 'like', '%'.$search.'%')
                        ->orWhere('room_name_snapshot', 'like', '%'.$search.'%')
                        ->orWhere('rate_plan_name_snapshot', 'like', '%'.$search.'%')
                        ->orWhere('status', 'like', '%'.$search.'%');
                });
            })
            ->when(! empty($request->input('status')), function ($query) use ($request) {
                $query->where('status', $request->input('status'));
            })
            ->with([
                'customer.user:id,name,email',
                'payments',
            ])
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return $reservations;
    }

    /**
     * Dashboard detail — single reservation with all relations + its payments.
     * Looked up by reservation_no or public_id (order_no-style identifier).
     */
    public function getSingleReservation(string $identifier)
    {
        $reservation = $this->lodging_reservation
            ->with([
                'customer.user:id,name,email',
                'lodgingProduct',
                'lodgingRoom',
                'lodgingRatePlan',
                'assignedDashboardUser:id,name,email',
                'hotelApprovedBy:id,name,email',
                'payments',
            ])
            ->where(function ($query) use ($identifier) {
                $query->where('reservation_no', $identifier)
                    ->orWhere('public_id', $identifier);
            })
            ->first();

        return $reservation;
    }

    /**
     * Customer-scoped, READ-ONLY reservation load for the lodging payment success page (Fix 2).
     *
     * Returns the reservation only if it belongs to the authenticated customer. Changes NOTHING
     * (no status write, no confirmation) — the page is pure UX; the poll command confirms.
     */
    public function getCustomerReservation(Request $request, string $reservationNo)
    {
        $customerId = $request->user()?->customer?->id;
        if (empty($customerId)) {
            return null;
        }

        return $this->lodging_reservation
            // Stage 3.4.4 — translate the live names on the success page (Option A); snapshot fallback.
            ->with([
                'lodgingProduct.contentTranslations',
                'lodgingRoom.contentTranslations',
            ])
            ->where('reservation_no', $reservationNo)
            ->where('customer_id', $customerId)
            ->first();
    }

    /**
     * Stage 3 Fix — persist the NOWPayments PAYMENT id (NP_id) that NOWPayments appends to the
     * lodging success_url (?NP_id=...) onto the reservation's active payment row, so the polling
     * command can re-query payment status by it (GET {base}/payment/{NP_id}).
     *
     * Customer-scoped (mirrors getCustomerReservation): only the reservation's OWNER may seed it.
     * Targets the latest ACTIVE payment row (status created/pending — the one created at invoice
     * creation) and writes nowpayments_payment_id ONLY when it is currently empty (IDEMPOTENT: a
     * value already present is never overwritten). Does NOT change the reservation status —
     * confirmation stays with the poll command. Never throws: a failure here must not break the
     * success page render.
     */
    public function storePaymentNpId(Request $request, string $reservationNo, string $npId): void
    {
        try {
            $npId = trim($npId);
            if ($npId === '' || trim($reservationNo) === '') {
                return;
            }

            $customerId = $request->user()?->customer?->id;
            if (empty($customerId)) {
                return;
            }

            $reservation = $this->lodging_reservation
                ->where('reservation_no', $reservationNo)
                ->where('customer_id', $customerId)
                ->first();

            if (empty($reservation)) {
                return;
            }

            // The active invoice's payment row (created at approval). The whereNull guard makes this
            // idempotent: a row that already carries a payment id is excluded, so we never overwrite.
            $payment = $this->lodging_reservation_payment
                ->where('lodging_reservation_id', $reservation->id)
                ->whereIn('status', ['created', 'pending'])
                ->whereNull('nowpayments_payment_id')
                ->latest('id')
                ->first();

            if (empty($payment)) {
                return;
            }

            $payment->nowpayments_payment_id = $npId;
            $payment->saveQuietly();
        } catch (Exception $e) {
            \Log::error('Lodging storePaymentNpId failed', [
                'reservation_no' => $reservationNo,
                'np_id' => $npId,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Stage 3.1 — customer-facing My Reservations LIST (paginated, customer-scoped, READ-ONLY).
     *
     * Mirrors the order list contract (getCustomerOrders): paginate(35), latest first, returning
     * the page items + next_page_url for the infinite-scroll list. STRICTLY scoped to the
     * authenticated customer's own rows — another customer's reservations can never appear. Each
     * card carries only the snapshot/display fields the list needs (member_price is never part of a
     * reservation and is never exposed). The latest payment's url is attached so the customer can
     * resume an unpaid crypto invoice. Changes NOTHING (no status write, no side effects).
     */
    public function getCustomerReservations(Request $request)
    {
        $user = $request->user();
        if (empty($user)) {
            return ['status' => false, 'message' => Trans::get('Please Login First')];
        }

        $customerId = $user->customer?->id;
        if (empty($customerId)) {
            // A logged-in non-customer owns no reservations (never expose another customer's data).
            return ['status' => true, 'reservations' => [], 'next_page_url' => null];
        }

        $reservations = $this->lodging_reservation
            ->where('customer_id', $customerId)
            ->with([
                'payments' => fn ($query) => $query->latest('id'),
                // Stage 3.4.4 — translate the live CURRENT name on display (Option A); the frozen
                // English snapshot is the fallback when the relation is gone. Eager-loaded (no N+1).
                'lodgingProduct.contentTranslations',
                'lodgingRoom.contentTranslations',
                'lodgingRatePlan.contentTranslations',
            ])
            ->latest()
            ->paginate(35);

        $reservations->setCollection(
            $reservations->getCollection()->map(function ($reservation) {
                $latestPayment = $reservation->payments->first();

                return [
                    'id' => $reservation->id,
                    'reservation_no' => $reservation->reservation_no,
                    'public_id' => $reservation->public_id,
                    // Translated CURRENT name where the relation survives; else the frozen English
                    // snapshot (Option A — the stored snapshot column itself is never changed).
                    'property_name_snapshot' => $reservation->lodgingProduct?->translatedValue('property_name') ?? $reservation->property_name_snapshot,
                    'room_name_snapshot' => $reservation->lodgingRoom?->translatedValue('room_name') ?? $reservation->room_name_snapshot,
                    'rate_plan_name_snapshot' => $reservation->lodgingRatePlan?->translatedValue('name') ?? $reservation->rate_plan_name_snapshot,
                    'checkin_date' => optional($reservation->checkin_date)->toDateString(),
                    'checkout_date' => optional($reservation->checkout_date)->toDateString(),
                    'nights' => (int) $reservation->nights,
                    'guest_count' => (int) $reservation->guest_count,
                    'online_amount' => $reservation->online_amount,
                    'currency_code' => $reservation->currency_code,
                    'status' => $reservation->status,
                    'created_at' => optional($reservation->created_at)->format('M d, Y'),
                    // Stage 3 — RAW ISO-8601 approved-unpaid deadline (the SAME approval_expires_at
                    // the expiry cron gates on) so the list can render the Order-style static
                    // "Expires in" countdown via dayjs.utc. Display-only; deadline logic unchanged.
                    'approval_expires_at' => optional($reservation->approval_expires_at)?->toIso8601String(),
                    'payment_url' => $latestPayment?->nowpayments_payment_url,
                    // Stage 3 Fix — per-row guard for hiding "Complete Payment" once the customer
                    // has gone to NOWPayments (NP_id seeded on the success redirect).
                    'nowpayments_payment_id' => $latestPayment?->nowpayments_payment_id,
                ];
            })
        );

        return [
            'status' => true,
            'reservations' => $reservations->items(),
            'next_page_url' => $reservations->nextPageUrl(),
        ];
    }

    /**
     * Stage 3.1 — customer-facing single reservation DETAIL (customer-scoped, READ-ONLY).
     *
     * Looked up by reservation_no ONLY (the canonical URL identifier, mirroring order_no for
     * orders) and ALWAYS constrained to the authenticated customer's own rows, so one customer can
     * never load another's reservation (returns null -> the controller 404s). Eager-loads the
     * lodging relations + all payments + customer.user so the detail page has everything it needs.
     * member_price is a future-only field and is never surfaced (the controller shapes an explicit
     * safe payload). Changes NOTHING.
     */
    public function getCustomerSingleReservation(Request $request, string $reservation_no)
    {
        $customerId = $request->user()?->customer?->id;
        if (empty($customerId)) {
            return null;
        }

        return $this->lodging_reservation
            ->with([
                // Stage 3.4.4 — load contentTranslations so the detail page can translate the live
                // names (Option A); the frozen English snapshot remains the fallback.
                'lodgingProduct.contentTranslations',
                'lodgingRoom.contentTranslations',
                'lodgingRatePlan.contentTranslations',
                'payments' => fn ($query) => $query->latest('id'),
                'customer.user:id,name,email',
            ])
            ->where('customer_id', $customerId)
            ->where('reservation_no', $reservation_no)
            ->first();
    }

    // ---------------------------------------------------------------------
    // Stage 2.3 — operator actions (dashboard side; operator messages = English).
    // ---------------------------------------------------------------------

    /**
     * Approve a reservation and auto-create the NOWPayments invoice — IDEMPOTENT (Point 3).
     *
     * The whole check-and-create runs inside a DB::transaction with lockForUpdate on the
     * reservation row, so two near-simultaneous approves serialize: the second waits, then sees
     * the payment created by the first and returns its existing link (a double-click is harmless).
     *
     * Idempotency rule: if a NON-TERMINAL payment already exists (status created / pending /
     * confirmed — an active invoice that has not failed/expired/canceled), NO new invoice or
     * payment row is created and the existing payment_url is returned. A new invoice is created
     * only when none exists (all prior attempts terminal: failed/expired/canceled).
     *
     * First-approval flow: HOTEL_REVIEW_PENDING -> HOTEL_APPROVED_AWAITING_PAYMENT ->
     * PAYMENT_LINK_CREATED -> PAYMENT_PENDING. On invoice failure the approval is KEPT (status
     * stays HOTEL_APPROVED_AWAITING_PAYMENT); PAYMENT_FAILED is NOT set here (Stage 2.4).
     *
     * Amount = online_amount, currency = currency_code, crypto only (payment mapping unchanged from 2.3).
     */
    public function approveReservation(string $identifier, Request $request)
    {
        $reservation = $this->findReservationByIdentifier($identifier);
        if (empty($reservation)) {
            return ['status' => false, 'message' => 'Reservation not found.'];
        }

        $userId = $request->user()?->id;

        try {
            $result = DB::transaction(function () use ($reservation, $userId) {
                // Lock the reservation row so two near-simultaneous approves serialize.
                $locked = $this->lodging_reservation->whereKey($reservation->id)->lockForUpdate()->first();
                if (empty($locked)) {
                    return ['status' => false, 'message' => 'Reservation not found.'];
                }

                // Idempotency (Point 3): reuse an existing non-terminal payment; never duplicate.
                $existing = $this->lodging_reservation_payment
                    ->where('lodging_reservation_id', $locked->id)
                    ->whereIn('status', ['created', 'pending', 'confirmed'])
                    ->latest('id')
                    ->first();

                if (! empty($existing)) {
                    return [
                        'status' => true,
                        'idempotent' => true,
                        'message' => $existing->status === 'confirmed'
                            ? 'Reservation already has a confirmed payment; no new invoice created.'
                            : 'Reservation already has an active payment link; returning the existing link (no duplicate created).',
                        'payment_url' => $existing->nowpayments_payment_url,
                    ];
                }

                // Controlled states from which an invoice may be created: a first approval
                // (HOTEL_REVIEW_PENDING) or an already-approved reservation whose invoice does
                // not yet exist (HOTEL_APPROVED_AWAITING_PAYMENT — e.g. a prior invoice attempt failed).
                if (! in_array($locked->status, ['HOTEL_REVIEW_PENDING', 'HOTEL_APPROVED_AWAITING_PAYMENT'], true)) {
                    return [
                        'status' => false,
                        'message' => 'This reservation cannot be approved from its current status ('.$locked->status.').',
                    ];
                }

                // Record the approval once (only on the first transition out of review-pending);
                // a re-entry after a failed invoice keeps the original approval bookkeeping.
                if ($locked->status === 'HOTEL_REVIEW_PENDING') {
                    $locked->hotel_approval_status = 'approved';
                    $locked->hotel_approved_by = $userId;
                    $locked->hotel_approved_at = now();
                    $locked->approval_expires_at = now()->addMinutes(60);
                    $this->transitionStatus($locked, 'HOTEL_APPROVED_AWAITING_PAYMENT');
                }

                // Auto-create the NOWPayments invoice (isolated lodging path -> lodging_reservation_payments).
                $invoice = $this->lodging_reservation_payment_service->createInvoice($locked);

                if ($invoice['status'] === false) {
                    // Keep the approval (committed on return); no payment row; NOT PAYMENT_FAILED (Stage 2.4).
                    return [
                        'status' => false,
                        'message' => 'Reservation approved, but the payment link could not be created: '
                            .($invoice['message'] ?? 'Unknown error')
                            .' The reservation is now in Hotel Approved (Awaiting Payment) with no payment link yet.',
                    ];
                }

                $data = $invoice['data'];

                // Crypto-only lodging payment row. payment_id / payment_status / pay_currency are
                // filled later by the IPN (Stage 2.4) once the customer picks a coin.
                $this->lodging_reservation_payment->create([
                    'lodging_reservation_id' => $locked->id,
                    'status' => 'pending',
                    'method_type' => 'crypto',
                    'amount' => $locked->online_amount,
                    'price_amount' => $data['price_amount'] ?? $locked->online_amount,
                    'price_currency' => $data['price_currency'] ?? $locked->currency_code,
                    'pay_currency' => $data['pay_currency'] ?? null,
                    'nowpayments_invoice_id' => isset($data['id']) ? (string) $data['id'] : null,
                    'nowpayments_order_id' => $data['order_id'] ?? null,
                    'nowpayments_payment_url' => $data['invoice_url'] ?? null,
                    'nowpayments_payment_status' => $data['payment_status'] ?? null,
                    'payment_link_created_at' => now(),
                    'payment_expires_at' => now()->addMinutes(60),
                ]);

                // HOTEL_APPROVED_AWAITING_PAYMENT -> PAYMENT_LINK_CREATED -> PAYMENT_PENDING
                $this->transitionStatus($locked, 'PAYMENT_LINK_CREATED');
                $this->transitionStatus($locked, 'PAYMENT_PENDING');

                return [
                    'status' => true,
                    'message' => 'Reservation approved and payment link created.',
                    'payment_url' => $data['invoice_url'] ?? null,
                ];
            });
        } catch (Exception $e) {
            return ['status' => false, 'message' => 'Approval failed: '.$e->getMessage()];
        }

        $reservation = $reservation->fresh(['payments']);

        if ($result['status'] === true) {
            // Stage 2.4 — deliver the approved + payment-link notification to the customer.
            // Only when a NEW link was just created (idempotent re-approves must NOT re-notify).
            if (empty($result['idempotent']) && ! empty($result['payment_url'])) {
                $this->notifyCustomer($reservation, new LodgingReservationApproved($reservation, $result['payment_url']));
            }

            return [
                'status' => true,
                'message' => $result['message'],
                // Customer-facing text (translated) — also delivered via the notification above.
                'customer_message' => Trans::get('Your reservation has been approved.').' '
                    .Trans::get('A payment link has been created. Please complete your crypto payment before it expires to confirm your booking.'),
                'payment_url' => $result['payment_url'] ?? null,
                'idempotent' => $result['idempotent'] ?? false,
                'reservation' => $reservation,
            ];
        }

        return [
            'status' => false,
            'message' => $result['message'],
            'reservation' => $reservation,
        ];
    }

    /**
     * Reject a HOTEL_REVIEW_PENDING reservation -> HOTEL_REJECTED.
     * Reason + note are free-text operator input; the customer-facing notice is translated.
     */
    public function rejectReservation(string $identifier, Request $request)
    {
        $validated = $request->validate([
            'hotel_rejected_reason' => ['required', 'string', 'max:255'],
            'hotel_rejection_note' => ['nullable', 'string', 'max:2000'],
        ]);

        $reservation = $this->findReservationByIdentifier($identifier);
        if (empty($reservation)) {
            return ['status' => false, 'message' => 'Reservation not found.'];
        }

        // Guard: reject is only valid while awaiting hotel review.
        if ($reservation->status !== 'HOTEL_REVIEW_PENDING') {
            return ['status' => false, 'message' => 'Only reservations awaiting hotel review can be rejected.'];
        }

        $reservation->hotel_approval_status = 'rejected';
        $reservation->hotel_rejected_reason = $validated['hotel_rejected_reason'];
        if (! empty($validated['hotel_rejection_note'])) {
            $reservation->hotel_rejection_note = $validated['hotel_rejection_note'];
        }
        $this->transitionStatus($reservation, 'HOTEL_REJECTED');

        $fresh = $reservation->fresh(['payments']);

        // Stage 2.4 — deliver the rejection notification to the customer.
        $this->notifyCustomer($fresh, new LodgingReservationRejected($fresh));

        return [
            'status' => true,
            'message' => 'Reservation rejected.',
            // Customer-facing notice (translated); the operator reason/note stay as typed.
            'customer_message' => Trans::get('Your reservation request was not approved by the property.'),
            'reservation' => $fresh,
        ];
    }

    /**
     * Store an operator alternative-room / alternative-date suggestion.
     * Informational only — does NOT change the reservation status. Operator-only (English).
     */
    public function suggestAlternative(string $identifier, Request $request)
    {
        $validated = $request->validate([
            'alternative_room_suggestion' => ['nullable', 'string', 'max:2000'],
            'alternative_date_suggestion' => ['nullable', 'string', 'max:2000'],
        ]);

        if (empty($validated['alternative_room_suggestion']) && empty($validated['alternative_date_suggestion'])) {
            return ['status' => false, 'message' => 'Provide at least one alternative suggestion (room or date).'];
        }

        $reservation = $this->findReservationByIdentifier($identifier);
        if (empty($reservation)) {
            return ['status' => false, 'message' => 'Reservation not found.'];
        }

        if (! empty($validated['alternative_room_suggestion'])) {
            $reservation->alternative_room_suggestion = $validated['alternative_room_suggestion'];
        }
        if (! empty($validated['alternative_date_suggestion'])) {
            $reservation->alternative_date_suggestion = $validated['alternative_date_suggestion'];
        }
        $reservation->save();

        return [
            'status' => true,
            'message' => 'Alternative suggestion saved.',
            'reservation' => $reservation->fresh(['payments']),
        ];
    }

    /**
     * Store an operator internal note. No dedicated note column exists in the 2.1 schema,
     * so it is stored on hotel_rejection_note (per the locked decision). Operator-only (English).
     */
    public function addInternalNote(string $identifier, Request $request)
    {
        $validated = $request->validate([
            'note' => ['required', 'string', 'max:2000'],
        ]);

        $reservation = $this->findReservationByIdentifier($identifier);
        if (empty($reservation)) {
            return ['status' => false, 'message' => 'Reservation not found.'];
        }

        $reservation->hotel_rejection_note = $validated['note'];
        $reservation->save();

        return [
            'status' => true,
            'message' => 'Internal note saved.',
            'reservation' => $reservation->fresh(['payments']),
        ];
    }

    // ---------------------------------------------------------------------
    // Stage 2.4 — payment confirmation (POLLING ONLY), expiry, PAYMENT_FAILED.
    // Confirmation mirrors the order NOWPaymentInvoiceStatusCheck flow: a scheduled command
    // re-queries NOWPayments by payment id (getPaymentStatus) and converges on
    // applyRemotePaymentOutcome() — idempotent, lock-guarded, expired-link-safe. No IPN/webhook.
    // ---------------------------------------------------------------------

    /**
     * Re-query NOWPayments for a given payment id and finalize the reservation (the poll path).
     *
     * Called by the polling command for each in-progress reservation. The server-side status is
     * authoritative; the shared core applies it idempotently and refuses to confirm an expired
     * link (point 5).
     */
    public function reconcilePaymentById(string $paymentId): array
    {
        $payment = $this->lodging_reservation_payment
            ->with('lodgingReservation')
            ->where('nowpayments_payment_id', $paymentId)
            ->latest('id')
            ->first();

        if (empty($payment) || empty($payment->lodgingReservation)) {
            return ['status' => false, 'message' => 'No lodging payment found for the given payment id.'];
        }

        $remote = $this->lodging_reservation_payment_service->getPaymentStatus($paymentId);
        // info("REMOTE: "); info($remote);

        if ($remote['status'] === false) {
            return ['status' => false, 'message' => $remote['message'] ?? 'Unable to fetch payment status.'];
        }

        $data = $remote['data'];
        $remoteStatus = (string) ($data['payment_status'] ?? '');

        $result = $this->applyRemotePaymentOutcome((int) $payment->lodging_reservation_id, (int) $payment->id, $remoteStatus, $data);
        $this->dispatchOutcomeNotification($result);

        return ['status' => true] + $result;
    }

    /**
     * Self-contained poll entry: resolve a payment id from the INVOICE id we always have,
     * then finalize through the shared core (the poll command calls this per in-progress row).
     *
     * We only ever store nowpayments_invoice_id at approval (NOWPayments issues a payment id once
     * the customer starts paying). This lists payments for the invoice; if none exists yet, it is a
     * safe no-op (the 60-min expiry cron handles never-paid links). When a payment exists it seeds
     * the id onto the row and delegates to reconcilePaymentById() — the idempotent, expired-link-safe
     * finalize path is reused UNCHANGED.
     */
    public function reconcilePaymentByInvoiceId(string $invoiceId): array
    {
        $payment = $this->lodging_reservation_payment
            ->with('lodgingReservation')
            ->where('nowpayments_invoice_id', $invoiceId)
            ->latest('id')
            ->first();

        if (empty($payment) || empty($payment->lodgingReservation)) {
            return ['status' => false, 'message' => 'No lodging payment found for the given invoice id.'];
        }

        $found = $this->lodging_reservation_payment_service->getPaymentsByInvoiceId($invoiceId);
        if (($found['status'] ?? false) === false) {
            return ['status' => false, 'message' => $found['message'] ?? 'Unable to list payments by invoice.'];
        }

        $chosen = $found['data'] ?? null;
        if (empty($chosen) || empty($chosen['payment_id'])) {
            // Not started yet — skip safely (expiry cron covers never-paid links).
            return ['status' => true, 'pending' => true, 'message' => 'No payment started yet for this invoice.'];
        }

        $paymentId = (string) $chosen['payment_id'];

        // Seed the resolved payment id (records it for visibility; idempotent if already set).
        if (empty($payment->nowpayments_payment_id)) {
            $payment->nowpayments_payment_id = $paymentId;
            $payment->saveQuietly();
        }

        // Reuse the unchanged finalize path (authoritative re-query by id + idempotent + expired-safe).
        return $this->reconcilePaymentById($paymentId);
    }

    /**
     * Expire stale reservations — BOTH deadlines, lodging-only (Stage 2.4 cron).
     *
     *   (1) Operator no-response (24h): HOTEL_REVIEW_PENDING past hotel_response_deadline
     *       (or created_at + 24h when the deadline is null) -> EXPIRED_NO_RESPONSE.
     *   (2) Approved-but-unpaid (60min): the approved/awaiting-payment family past
     *       approval_expires_at -> PAYMENT_EXPIRED (and the active payment link -> expired).
     *
     * Each transition re-locks + re-checks the row inside a transaction, so it never collides
     * with a confirm that landed in the same tick (already-CONFIRMED rows are skipped). Customer
     * notifications are dispatched AFTER commit (a rollback never notifies).
     */
    public function expireStaleReservations(): array
    {
        $noResponseExpired = 0;
        $paymentExpired = 0;

        // (1) Operator no-response (24h).
        $this->lodging_reservation
            ->where('status', 'HOTEL_REVIEW_PENDING')
            ->with('customer.user')
            ->chunkById(100, function ($reservations) use (&$noResponseExpired) {
                foreach ($reservations as $reservation) {
                    $deadline = ! empty($reservation->hotel_response_deadline)
                        ? Carbon::parse($reservation->hotel_response_deadline)
                        : Carbon::parse($reservation->created_at)->addHours(24);

                    if (now()->lessThan($deadline)) {
                        continue;
                    }

                    $changed = DB::transaction(function () use ($reservation) {
                        $locked = $this->lodging_reservation->whereKey($reservation->id)->lockForUpdate()->first();
                        // Skip if it raced with an approve/reject and is no longer review-pending.
                        if (empty($locked) || $locked->status !== 'HOTEL_REVIEW_PENDING') {
                            return false;
                        }
                        $this->transitionStatus($locked, 'EXPIRED_NO_RESPONSE');

                        return true;
                    });

                    if ($changed) {
                        $noResponseExpired++;
                        $this->notifyCustomer($reservation, new LodgingReservationExpired($reservation, 'no_response'));
                    }
                }
            });

        // (2) Approved-but-unpaid (60min).
        $this->lodging_reservation
            ->whereIn('status', ['HOTEL_APPROVED_AWAITING_PAYMENT', 'PAYMENT_LINK_CREATED', 'PAYMENT_PENDING'])
            ->whereNotNull('approval_expires_at')
            ->where('approval_expires_at', '<=', now())
            ->with('customer.user')
            ->chunkById(100, function ($reservations) use (&$paymentExpired) {
                foreach ($reservations as $reservation) {
                    $changed = DB::transaction(function () use ($reservation) {
                        $locked = $this->lodging_reservation->whereKey($reservation->id)->lockForUpdate()->first();
                        if (empty($locked)) {
                            return false;
                        }
                        // Skip if it confirmed in the same tick (or otherwise left the pending family).
                        if (! in_array($locked->status, ['HOTEL_APPROVED_AWAITING_PAYMENT', 'PAYMENT_LINK_CREATED', 'PAYMENT_PENDING'], true)) {
                            return false;
                        }

                        if (empty($locked->approval_expires_at)) {
                            return false;
                        }

                        $deadline = Carbon::parse($locked->approval_expires_at);
                        $graceCutoff = $deadline->copy()->addMinutes(3);

                        if (now()->lessThanOrEqualTo($graceCutoff)) {
                            return false;
                        }

                        // Expire any active (non-terminal) payment link too.
                        $this->lodging_reservation_payment
                            ->where('lodging_reservation_id', $locked->id)
                            ->whereIn('status', ['created', 'pending'])
                            ->update(['status' => 'expired']);

                        $this->transitionStatus($locked, 'PAYMENT_EXPIRED');

                        return true;
                    });

                    if ($changed) {
                        $paymentExpired++;
                        $this->notifyCustomer($reservation, new LodgingReservationExpired($reservation, 'payment'));
                    }
                }
            });

        return [
            'status' => true,
            'no_response_expired' => $noResponseExpired,
            'payment_expired' => $paymentExpired,
        ];
    }

    // ---------------------------------------------------------------------
    // Private helpers
    // ---------------------------------------------------------------------

    /** Find a reservation (with its payments) by reservation_no or public_id. */
    private function findReservationByIdentifier(string $identifier): ?LodgingReservation
    {
        return $this->lodging_reservation
            ->with(['payments'])
            ->where(function ($query) use ($identifier) {
                $query->where('reservation_no', $identifier)
                    ->orWhere('public_id', $identifier);
            })
            ->first();
    }

    /** Persist a status change while tracking the immediately prior status. */
    private function transitionStatus(LodgingReservation $reservation, string $newStatus): void
    {
        $reservation->previous_status = $reservation->status;
        $reservation->status = $newStatus;
        $reservation->save();
    }

    /**
     * Parse a rate plan's `booking_cutoff_time` ('HH:MM', 24h) into a Carbon instant at that time
     * TODAY in the app timezone (UTC). Returns null for an empty / unrecognized value so a malformed
     * cutoff can never block a booking (fail-open — consistent with the conditional-guard intent).
     */
    private function parseSameDayCutoff(?string $time): ?Carbon
    {
        $time = trim((string) $time);
        if (! preg_match('/^\d{1,2}:\d{2}$/', $time)) {
            return null;
        }

        [$hours, $minutes] = array_map('intval', explode(':', $time));
        if ($hours > 23 || $minutes > 59) {
            return null;
        }

        return Carbon::today()->setTime($hours, $minutes);
    }

    /**
     * The single idempotent, lock-guarded core both confirmation paths (IPN + poll) call.
     *
     * Returns an 'outcome' string so the caller can dispatch the right notification AFTER commit:
     *   confirmed | failed | failed_recorded | expired_no_confirm | already_confirmed |
     *   already_failed | pending | not_found | no_payment
     *
     * Guarantees:
     *  - IDEMPOTENT (point 4): a row already CONFIRMED / payment confirmed is a no-op (no double
     *    confirm, no double notify). Re-processing the same signal changes nothing.
     *  - EXPIRED LINK NEVER CONFIRMS (point 5): if the reservation is already PAYMENT_EXPIRED, or
     *    the payment's 60-min window has passed, a late "finished" is RECORDED on the payment row
     *    but the reservation is left expired (no CONFIRMED transition).
     *  - Lock on the reservation row serializes with the expiry cron, so confirm-vs-expire in the
     *    same tick cannot both win.
     */
    private function applyRemotePaymentOutcome(int $reservationId, int $paymentId, string $remoteStatus, array $remote = []): array
    {
        $status = strtolower(trim($remoteStatus));
        $paid = in_array($status, ['finished'], true);
        $failed = in_array($status, ['failed', 'expired', 'refunded'], true);

        return DB::transaction(function () use ($reservationId, $paymentId, $status, $paid, $failed, $remote) {
            $reservation = $this->lodging_reservation->whereKey($reservationId)->lockForUpdate()->first();
            if (empty($reservation)) {
                return ['outcome' => 'not_found'];
            }

            $payment = $this->lodging_reservation_payment->whereKey($paymentId)->first();
            if (empty($payment)) {
                return ['outcome' => 'no_payment'];
            }

            // Idempotency: already finalized -> no-op.
            if ($reservation->status === 'CONFIRMED' || $payment->status === 'confirmed') {
                return ['outcome' => 'already_confirmed', 'reservation_no' => $reservation->reservation_no];
            }

            // Always record what NOWPayments last reported (visibility on the payment row).
            $payment->nowpayments_payment_status = $status;
            $payment->nowpayments_ipn_received_at = now();
            if (! empty($remote['pay_currency'])) {
                $payment->pay_currency = strtoupper((string) $remote['pay_currency']);
            }
            if (! empty($remote['payment_id'])) {
                $payment->nowpayments_payment_id = (string) $remote['payment_id'];
            }
            if (! empty($remote['payin_hash'])) {
                $payment->tx_hash = (string) $remote['payin_hash'];
            }

            if ($paid) {
                // Expired-link guard (point 5): a late payment must NOT confirm an expired booking.
                $windowPassed = ! empty($payment->payment_expires_at) && now()->greaterThan(Carbon::parse($payment->payment_expires_at));
                $alreadyExpired = in_array($reservation->status, ['PAYMENT_EXPIRED', 'EXPIRED_NO_RESPONSE'], true);

                if ($alreadyExpired || $windowPassed) {
                    $payment->save(); // record the outcome only; leave the reservation expired.

                    return ['outcome' => 'expired_no_confirm', 'reservation_no' => $reservation->reservation_no];
                }

                // Valid + within window -> confirm: PAYMENT_PENDING -> PAYMENT_CONFIRMED -> CONFIRMED.
                $payment->status = 'confirmed';
                $payment->payment_confirmed_at = now();

                // On confirmation, record the blockchain transaction hash — PREFER the final
                // settlement outcome_hash, else the incoming payin_hash. This supersedes any
                // payin_hash captured by the in-progress recording above; the already_confirmed
                // guard makes this confirm branch run once, so it is never re-clobbered on later
                // polls (idempotent — skipped when the same hash is already recorded).
                $txHash = $remote['outcome_hash'] ?? $remote['payin_hash'] ?? null;
                if (! empty($txHash) && $payment->tx_hash !== $txHash) {
                    $payment->tx_hash = (string) $txHash;
                }

                $payment->save();

                $this->transitionStatus($reservation, 'PAYMENT_CONFIRMED');
                $this->transitionStatus($reservation, 'CONFIRMED');

                return ['outcome' => 'confirmed', 'reservation_no' => $reservation->reservation_no];
            }

            if ($failed) {
                if ($payment->status === 'failed' && $reservation->status === 'PAYMENT_FAILED') {
                    $payment->save();

                    return ['outcome' => 'already_failed', 'reservation_no' => $reservation->reservation_no];
                }

                $payment->status = 'failed';
                $payment->failed_at = now();
                $payment->save();

                if (in_array($reservation->status, ['PAYMENT_PENDING', 'PAYMENT_LINK_CREATED', 'HOTEL_APPROVED_AWAITING_PAYMENT'], true)) {
                    $this->transitionStatus($reservation, 'PAYMENT_FAILED');

                    return ['outcome' => 'failed', 'reservation_no' => $reservation->reservation_no];
                }

                return ['outcome' => 'failed_recorded', 'reservation_no' => $reservation->reservation_no];
            }

            // In-progress (waiting / confirming / sending / partially_paid): record only, no transition.
            $payment->save();

            return ['outcome' => 'pending', 'reservation_no' => $reservation->reservation_no];
        });
    }

    /** Map a confirmation outcome to the customer notification (confirmed / failed only). */
    private function dispatchOutcomeNotification(array $result): void
    {
        $outcome = $result['outcome'] ?? null;
        if (! in_array($outcome, ['confirmed', 'failed'], true)) {
            return;
        }

        $reservationNo = $result['reservation_no'] ?? null;
        if (empty($reservationNo)) {
            return;
        }

        $reservation = $this->lodging_reservation->with('customer.user')
            ->where('reservation_no', $reservationNo)->first();
        if (empty($reservation)) {
            return;
        }

        if ($outcome === 'confirmed') {
            $this->notifyCustomer($reservation, new LodgingReservationConfirmed($reservation));
        } elseif ($outcome === 'failed') {
            $this->notifyCustomer($reservation, new LodgingReservationPaymentFailed($reservation));
        }
    }

    /** Send a notification to the reservation's customer user (safe if any link is missing). */
    private function notifyCustomer(LodgingReservation $reservation, $notification): void
    {
        try {
            $reservation->loadMissing('customer.user');
            $user = $reservation->customer?->user;
            if (! empty($user)) {
                $user->notify($notification);
            }
        } catch (Exception $e) {
            // A notification failure must never break the payment/expiry flow.
        }
    }

    /** Notify operator/admin users that a new reservation request needs review (dashboard + email). */
    private function notifyAdminsOfNewRequest(LodgingReservation $reservation): void
    {
        try {
            $admins = User::whereHas('roles', fn ($query) => $query->where('name', 'Admin'))->get();
            foreach ($admins as $admin) {
                $admin->notify(new LodgingReservationRequestedAdmin($reservation));
            }
        } catch (Exception $e) {
            // Notification failure must never break reservation creation.
        }
    }
}
