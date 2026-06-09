<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Str;

class LodgingReservation extends Model
{
    protected $table = 'lodging_reservations';

    protected $fillable = [
        // Identity
        'public_id',
        'reservation_no',

        // Links (lodging only — no order linkage)
        'customer_id',
        'lodging_product_id',
        'lodging_room_id',
        'lodging_rate_plan_id',

        // Booking inputs
        'checkin_date',
        'checkout_date',
        'guest_count',
        'request_message',

        // Snapshots at create
        'property_name_snapshot',
        'room_name_snapshot',
        'rate_plan_name_snapshot',
        'price_snapshot',
        'nights',
        'online_amount',
        'currency_code',

        // Status lifecycle
        'status',
        'previous_status',

        // Operator / approval
        'availability_mode',
        'requires_hotel_approval',
        'assigned_dashboard_user_id',
        'hotel_approval_status',
        'hotel_approved_by',
        'hotel_approved_at',
        'hotel_rejected_reason',
        'hotel_rejection_note',
        'alternative_room_suggestion',
        'alternative_date_suggestion',
        'payment_timing',
        'approval_source',
        'approval_expires_at',
        'hotel_response_deadline',

        // MSAP / future
        'booking_source',
        'source_of_truth',
        'sync_status',
        'external_provider',
        'external_listing_id',
        'external_room_id',
        'external_rate_plan_id',
        'external_booking_id',
        'external_case_id',
        'msap_uri',
        'msap_event_ref',
        'event_id',
        'element_bundle',
    ];

    // RelationShips
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class, 'customer_id', 'id');
    }

    public function lodgingProduct(): BelongsTo
    {
        return $this->belongsTo(LodgingProduct::class, 'lodging_product_id', 'id');
    }

    public function lodgingRoom(): BelongsTo
    {
        return $this->belongsTo(LodgingRoom::class, 'lodging_room_id', 'id');
    }

    public function lodgingRatePlan(): BelongsTo
    {
        return $this->belongsTo(LodgingRatePlan::class, 'lodging_rate_plan_id', 'id');
    }

    public function assignedDashboardUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_dashboard_user_id', 'id');
    }

    public function hotelApprovedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'hotel_approved_by', 'id');
    }

    public function payments(): HasMany
    {
        return $this->hasMany(LodgingReservationPayment::class, 'lodging_reservation_id', 'id');
    }

    // Static Booting — identity generation only (no status side-effects/notifications here; that is 2.3/2.4).
    protected static function booted()
    {
        static::created(function ($reservation) {
            $dirty = false;

            if (empty($reservation->public_id)) {
                $reservation->public_id = 'rsv_' . Str::uuid();
                $dirty = true;
            }

            if (empty($reservation->reservation_no)) {
                $reservation->reservation_no = 'RSV-' . str_pad($reservation->id, 5, '0', STR_PAD_LEFT);
                $dirty = true;
            }

            if ($dirty) {
                $reservation->saveQuietly();
            }
        });
    }

    // Casting
    protected $casts = [
        'checkin_date' => 'date',
        'checkout_date' => 'date',
        'guest_count' => 'integer',
        'nights' => 'integer',
        'price_snapshot' => 'decimal:2',
        'online_amount' => 'decimal:2',
        'requires_hotel_approval' => 'boolean',
        'hotel_approved_at' => 'datetime',
        'approval_expires_at' => 'datetime',
        'hotel_response_deadline' => 'datetime',
        'element_bundle' => 'array',
    ];

    // Attributes
    protected $attributes = [
        'status' => 'REQUESTED',
    ];
}
