<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LodgingDistributorCommission extends Model
{
    protected $fillable = [
        'reservation_id',
        'accommodation_distributor_id',
        'commission_rate',
        'commission_amount',
        'status',
        'paid_at',
    ];

    protected $appends = ['added_at'];

    public function getAddedAtAttribute()
    {
        return ! empty($this->created_at) ? $this->created_at->format('Y-m-d') : null;
    }

    // RelationShips
    public function reservation(): BelongsTo
    {
        return $this->belongsTo(LodgingReservation::class, 'reservation_id', 'id');
    }

    public function accommodationDistributor(): BelongsTo
    {
        return $this->belongsTo(AccommodationDistributor::class, 'accommodation_distributor_id', 'id');
    }

    protected $casts = [
        'paid_at' => 'date:Y-m-d',
    ];
}
