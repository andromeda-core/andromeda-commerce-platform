<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LodgingReservationPayment extends Model
{
    protected $table = 'lodging_reservation_payments';

    protected $fillable = [
        'lodging_reservation_id',
        'status',
        'method_type',

        // Standard payment fields
        'amount',
        'price_amount',
        'price_currency',
        'pay_currency',
        'external_ref',
        'tx_hash',

        // NOWPayments
        'nowpayments_invoice_id',
        'nowpayments_payment_id',
        'nowpayments_payment_url',
        'nowpayments_order_id',
        'nowpayments_payment_status',
        'nowpayments_ipn_received_at',

        // Timing
        'payment_link_created_at',
        'payment_expires_at',
        'payment_confirmed_at',
        'failed_at',

        // MSAP (only two, per decision)
        'msap_uri',
        'event_id',
    ];

    // RelationShip
    public function lodgingReservation(): BelongsTo
    {
        return $this->belongsTo(LodgingReservation::class, 'lodging_reservation_id', 'id');
    }

    // Casting
    protected $casts = [
        'amount' => 'decimal:2',
        'price_amount' => 'decimal:2',
        'nowpayments_ipn_received_at' => 'datetime',
        'payment_link_created_at' => 'datetime',
        'payment_expires_at' => 'datetime',
        'payment_confirmed_at' => 'datetime',
        'failed_at' => 'datetime',
    ];

    // Attributes
    protected $attributes = [
        'status' => 'created',
        'method_type' => 'crypto',
    ];
}
