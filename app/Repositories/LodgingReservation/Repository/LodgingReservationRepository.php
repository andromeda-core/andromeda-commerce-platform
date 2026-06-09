<?php

namespace App\Repositories\LodgingReservation\Repository;

use App\Helpers\Trans;
use App\Models\Currency;
use App\Models\LodgingRatePlan;
use App\Models\LodgingReservation;
use App\Models\LodgingReservationPayment;
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
            'lodging_product_id'   => ['required', 'integer', 'exists:lodging_products,id'],
            'lodging_room_id'      => ['required', 'integer', 'exists:lodging_rooms,id'],
            'lodging_rate_plan_id' => ['required', 'integer', 'exists:lodging_rate_plans,id'],
            'checkin_date'         => ['required', 'date', 'after_or_equal:today'],
            'checkout_date'        => ['required', 'date', 'after:checkin_date'],
            'guest_count'          => ['required', 'integer', 'min:1'],
            'request_message'      => ['nullable', 'string', 'max:2000'],
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

            // Property must be active and open for reservations.
            if (! $product->is_active || $product->is_reservation_closed) {
                return ['status' => false, 'message' => Trans::get('This property is not currently open for reservations.')];
            }

            // Room must be available.
            if (! $room->is_available) {
                return ['status' => false, 'message' => Trans::get('The selected room is not available.')];
            }

            // Rate plan must be active + bookable + carry a valid sale price.
            if (! $ratePlan->is_active || ! $ratePlan->is_bookable) {
                return ['status' => false, 'message' => Trans::get('The selected rate plan is not available for booking.')];
            }

            $salePrice = $ratePlan->sale_price;
            if ($salePrice === null || ! is_numeric($salePrice) || (float) $salePrice <= 0) {
                return ['status' => false, 'message' => Trans::get('The selected rate plan does not have a valid price.')];
            }

            // Guest count vs the room's max_guests.
            if (! empty($room->max_guests) && (int) $validated['guest_count'] > (int) $room->max_guests) {
                return ['status' => false, 'message' => Trans::get('Guest count exceeds the room\'s maximum of') . ' ' . (int) $room->max_guests . '.'];
            }

            // Whole nights between the two dates.
            $checkin  = Carbon::parse($validated['checkin_date'])->startOfDay();
            $checkout = Carbon::parse($validated['checkout_date'])->startOfDay();
            $nights   = (int) abs($checkin->diffInDays($checkout));

            if ($nights < 1) {
                return ['status' => false, 'message' => Trans::get('Check-out must be at least one night after check-in.')];
            }

            // Min / max nights from the rate plan when set.
            if (! empty($ratePlan->minimum_nights) && $nights < (int) $ratePlan->minimum_nights) {
                return ['status' => false, 'message' => Trans::get('This rate plan requires a minimum of') . ' ' . (int) $ratePlan->minimum_nights . ' ' . Trans::get('night(s).')];
            }
            if (! empty($ratePlan->maximum_nights) && $nights > (int) $ratePlan->maximum_nights) {
                return ['status' => false, 'message' => Trans::get('This rate plan allows a maximum of') . ' ' . (int) $ratePlan->maximum_nights . ' ' . Trans::get('night(s).')];
            }

            // online_amount per Joseph Adjustment 1 (locked):
            //   price_snapshot * nights
            //     + service_fee  (only if service_fee_online)
            //     + cleaning_fee (only if cleaning_fee_online)
            //     + tax_amount   (only if tax_online)
            // On-site fees are NOT included online.
            $cancellation  = $product->cancellationPolicy;
            $priceSnapshot = (float) $salePrice;
            $onlineAmount  = $priceSnapshot * $nights;

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
            // hotel_response_deadline is intentionally left NULL — the no-response window
            // duration is not specified by Joseph yet (its cron is Stage 2.4).
            // Identity (public_id rsv_<uuid> / reservation_no RSV-<id>) is set in the model booted().
            $reservation = $this->lodging_reservation->create([
                'customer_id'             => $customer->id,
                'lodging_product_id'      => $product->id,
                'lodging_room_id'         => $room->id,
                'lodging_rate_plan_id'    => $ratePlan->id,
                'checkin_date'            => $checkin->toDateString(),
                'checkout_date'           => $checkout->toDateString(),
                'guest_count'             => (int) $validated['guest_count'],
                'request_message'         => $validated['request_message'] ?? null,
                'property_name_snapshot'  => $product->property_name,
                'room_name_snapshot'      => $room->room_name,
                'rate_plan_name_snapshot' => $ratePlan->name,
                'price_snapshot'          => $priceSnapshot,
                'nights'                  => $nights,
                'online_amount'           => $onlineAmount,
                'currency_code'           => $currencyCode,
            ]);

            if (empty($reservation)) {
                return ['status' => false, 'message' => Trans::get('Something went wrong while creating the reservation.')];
            }

            // status is NOT mass-assignable (Point 7); set it through the controlled transition.
            // The model default status is REQUESTED, so this records previous_status = REQUESTED
            // and moves the reservation to HOTEL_REVIEW_PENDING (Doc 2: submit -> HOTEL_REVIEW_PENDING).
            $this->transitionStatus($reservation, 'HOTEL_REVIEW_PENDING');

            return [
                'status'      => true,
                'message'     => Trans::get('Your reservation request has been submitted and is awaiting hotel review.'),
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
                    $subQ->where('reservation_no', 'like', '%' . $search . '%')
                        ->orWhere('property_name_snapshot', 'like', '%' . $search . '%')
                        ->orWhere('room_name_snapshot', 'like', '%' . $search . '%')
                        ->orWhere('rate_plan_name_snapshot', 'like', '%' . $search . '%')
                        ->orWhere('status', 'like', '%' . $search . '%');
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
                        'status'      => true,
                        'idempotent'  => true,
                        'message'     => $existing->status === 'confirmed'
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
                        'status'  => false,
                        'message' => 'This reservation cannot be approved from its current status (' . $locked->status . ').',
                    ];
                }

                // Record the approval once (only on the first transition out of review-pending);
                // a re-entry after a failed invoice keeps the original approval bookkeeping.
                if ($locked->status === 'HOTEL_REVIEW_PENDING') {
                    $locked->hotel_approval_status = 'approved';
                    $locked->hotel_approved_by     = $userId;
                    $locked->hotel_approved_at     = now();
                    $locked->approval_expires_at   = now()->addMinutes(60);
                    $this->transitionStatus($locked, 'HOTEL_APPROVED_AWAITING_PAYMENT');
                }

                // Auto-create the NOWPayments invoice (isolated lodging path -> lodging_reservation_payments).
                $invoice = $this->lodging_reservation_payment_service->createInvoice($locked);

                if ($invoice['status'] === false) {
                    // Keep the approval (committed on return); no payment row; NOT PAYMENT_FAILED (Stage 2.4).
                    return [
                        'status'  => false,
                        'message' => 'Reservation approved, but the payment link could not be created: '
                            . ($invoice['message'] ?? 'Unknown error')
                            . ' The reservation is now in Hotel Approved (Awaiting Payment) with no payment link yet.',
                    ];
                }

                $data = $invoice['data'];

                // Crypto-only lodging payment row. payment_id / payment_status / pay_currency are
                // filled later by the IPN (Stage 2.4) once the customer picks a coin.
                $this->lodging_reservation_payment->create([
                    'lodging_reservation_id'     => $locked->id,
                    'status'                     => 'pending',
                    'method_type'                => 'crypto',
                    'amount'                     => $locked->online_amount,
                    'price_amount'               => $data['price_amount'] ?? $locked->online_amount,
                    'price_currency'             => $data['price_currency'] ?? $locked->currency_code,
                    'pay_currency'               => $data['pay_currency'] ?? null,
                    'nowpayments_invoice_id'     => isset($data['id']) ? (string) $data['id'] : null,
                    'nowpayments_order_id'       => $data['order_id'] ?? null,
                    'nowpayments_payment_url'    => $data['invoice_url'] ?? null,
                    'nowpayments_payment_status' => $data['payment_status'] ?? null,
                    'payment_link_created_at'    => now(),
                    'payment_expires_at'         => now()->addMinutes(60),
                ]);

                // HOTEL_APPROVED_AWAITING_PAYMENT -> PAYMENT_LINK_CREATED -> PAYMENT_PENDING
                $this->transitionStatus($locked, 'PAYMENT_LINK_CREATED');
                $this->transitionStatus($locked, 'PAYMENT_PENDING');

                return [
                    'status'      => true,
                    'message'     => 'Reservation approved and payment link created.',
                    'payment_url' => $data['invoice_url'] ?? null,
                ];
            });
        } catch (Exception $e) {
            return ['status' => false, 'message' => 'Approval failed: ' . $e->getMessage()];
        }

        $reservation = $reservation->fresh(['payments']);

        if ($result['status'] === true) {
            return [
                'status'           => true,
                'message'          => $result['message'],
                // Customer-facing text (translated) — delivery/notification is Stage 2.4.
                'customer_message' => Trans::get('Your reservation has been approved.') . ' '
                    . Trans::get('A payment link has been created. Please complete your crypto payment before it expires to confirm your booking.'),
                'payment_url'      => $result['payment_url'] ?? null,
                'idempotent'       => $result['idempotent'] ?? false,
                'reservation'      => $reservation,
            ];
        }

        return [
            'status'      => false,
            'message'     => $result['message'],
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
            'hotel_rejection_note'  => ['nullable', 'string', 'max:2000'],
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

        return [
            'status'           => true,
            'message'          => 'Reservation rejected.',
            // Customer-facing notice (translated); the operator reason/note stay as typed.
            'customer_message' => Trans::get('Your reservation request was not approved by the property.'),
            'reservation'      => $reservation->fresh(['payments']),
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
            'status'      => true,
            'message'     => 'Alternative suggestion saved.',
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
            'status'      => true,
            'message'     => 'Internal note saved.',
            'reservation' => $reservation->fresh(['payments']),
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
}
