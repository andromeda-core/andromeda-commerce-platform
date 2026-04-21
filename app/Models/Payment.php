<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'status',
        'method_type',
        'external_ref',
        'tx_hash',
        'amount',
        'confirmed_at',
        'finalized_at',
        'reversed_at',
        'canceled_at',
        'failed_at',
        'event_id',
        'msap_uri',
    ];


    // Attributes
    protected $appends = ['added_at'];
    public function getAddedAtAttribute()
    {
        return !empty($this->created_at) ? $this->created_at->format('Y-m-d H:i:s') : null;
    }

    protected $casts = [
        'confirmed_at' => 'date:Y-m-d H:i:s',
        'finalized_at' => 'date:Y-m-d H:i:s',
        'reversed_at'  => 'date:Y-m-d H:i:s',
        'failed_at'    => 'date:Y-m-d H:i:s',
        'canceled_at'  => 'date:Y-m-d H:i:s',
        'amount'       => 'decimal:2',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}
