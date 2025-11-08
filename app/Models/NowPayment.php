<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class NowPayment extends Model
{
    protected $fillable = [
        'now_payment_api_key',
        'now_payment_public_key',
        'now_payment_baseurl',
        'is_active',
    ];

    protected $appends = ['added_at'];

    //    Attributes\
    public function getAddedAtAttribute()
    {
        return ! empty($this->created_at) ? $this->created_at->format('Y-m-d') : null;
    }

    // Static Booting
    public static function booted()
    {

        static::updated(function ($now_payment_setting) {
            Cache::forget('now_payment_setting');
        });

        static::deleting(function () {
            if (static::count() === 1) {
                throw new \Exception('You cannot delete this record because at least one NOWPayment Setting must always remain in the system.');
            }
        });

    }

    protected $casts = [
        'now_payment_api_key' => 'encrypted',
        'now_payment_public_key' => 'encrypted',
    ];
}
