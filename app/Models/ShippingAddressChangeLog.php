<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ShippingAddressChangeLog extends Model
{
    protected $fillable = [
        'user_id',
        'old_shipping_address',
        'new_shipping_address',
        'ip_address',
        'user_agent',
    ];

    // RelationShips
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    protected $casts = [
        'old_shipping_address' => 'array',
        'new_shipping_address' => 'array',
    ];
}
