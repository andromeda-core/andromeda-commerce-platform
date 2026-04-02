<?php

namespace App\Models;

use App\Notifications\OrderPackageVideoAddedNotification;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Cache;

class PackageRecording extends Model
{
    protected $fillable = [
        'order_id',
        'package_video',
        'thumbnail_url',
        'is_visible',
        'is_opened',
        'opened_at',
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

    // static Booting
    public static function booted()
    {
        static::updated(function ($package_recording) {
            if ($package_recording->is_visible) {

                $package_recording->load(['order.customer.user']);

                $user = $package_recording->order?->customer?->user;

                if (
                    ! empty(Cache::get('smtp_config')) &&
                    $package_recording->order &&
                    $user?->email
                ) {
                    $package_recording->order->customer->user->notify(new OrderPackageVideoAddedNotification($package_recording));
                }
            }
        });
    }

    // Casting
    protected $casts = [
        'opened_at' => 'date:Y-m-d',
        'is_visible' => 'boolean',
    ];
}
