<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DistributorCommission extends Model
{
    protected $fillable = [

        'order_id',
        'distributor_id',
        'commission_rate',
        'commission_amount',
        'status',
        'paid_at',

    ];

    // Attributes
    protected $appends = ['added_at'];

    public function getAddedAtAttribute()
    {
        return ! empty($this->created_at) ? $this->created_at->format('Y-m-d') : null;
    }

    // RelationShips
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class, 'order_id', 'id');
    }

    public function distributor(): BelongsTo
    {
        return $this->belongsTo(Distributor::class, 'distributor_id', 'id');
    }

    protected $casts = [
        'paid_at' => 'date:Y-m-d',
    ];
}
