<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class AwsSetting extends Model
{
    protected $fillable = [
        'aws_access_key_id',
        'aws_secret_access_key',
        'aws_region',
        'aws_bucket',
        'aws_url',
        'is_active',
    ];

    // Attributes
    protected $appends = ['added_at'];

    public function getAddedAtAttribute()
    {
        return ! empty($this->created_at) ? $this->created_at->format('Y-m-d') : null;
    }

    // Static Booting
    public static function booted()
    {

        static::updated(function ($aws_setting) {
            Cache::forget('aws_setting');
        });

        static::deleting(function () {
            if (static::count() === 1) {
                throw new \Exception('You cannot delete this record because at least one AWS Setting must always remain in the system.');
            }
        });

    }

    // Casting
    protected $casts = [
        'aws_access_key_id' => 'encrypted',
        'aws_secret_access_key' => 'encrypted',
    ];
}
