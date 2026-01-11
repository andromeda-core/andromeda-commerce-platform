<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CourierCompany extends Model
{
    protected $fillable = [
        'courier_name',
        'courier_code',
        'tracking_url',
        'is_international',
        'is_active',
    ];

    protected $appends = ['added_at'];

    // Attributes
    public function getAddedAtAttribute()
    {
        return ! empty($this->created_at) ? $this->created_at->format('Y-m-d') : null;
    }
}
