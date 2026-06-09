<?php

namespace App\Repositories\LodgingReservation\Repository;

use App\Helpers\Trans;
use App\Models\Currency;
use App\Models\LodgingRatePlan;
use App\Models\LodgingReservation;
use App\Repositories\LodgingReservation\Interface\ILodgingReservationRepository;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

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
                'status'                  => 'HOTEL_REVIEW_PENDING',
                'previous_status'         => 'REQUESTED',
            ]);

            if (empty($reservation)) {
                return ['status' => false, 'message' => Trans::get('Something went wrong while creating the reservation.')];
            }

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
}
