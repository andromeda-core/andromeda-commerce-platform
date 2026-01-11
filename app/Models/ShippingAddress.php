<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ShippingAddress extends Model
{
    protected $fillable = [
        'customer_id',
        'country_id',
        'name',
        'phone',
        'state',
        'city',
        'postal_code',
        'address_line1',
        'address_line2',
        'is_active',
    ];

    // RelationShips
    public function country(): BelongsTo
    {
        return $this->belongsTo(Country::class, 'country_id', 'id');
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class, 'customer_id', 'id');
    }
}
