<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderCancelationRequest extends Model
{
    protected $fillable = [
        'reason',
        'status',
        'order_id',
        'customer_id',
        'note',
        'requested_at',
        'approved_at',
        'rejected_at',
    ];

    //    Attributes
    protected $appends = ['added_at'];

    public function getAddedAtAttribute()
    {
        return ! empty($this->created_at) ? $this->created_at->format('Y-m-d H:i:s') : null;
    }

    // RelationShips
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class, 'customer_id', 'id');
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class, 'order_id', 'id');
    }
}
