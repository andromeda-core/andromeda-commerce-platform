<?php

namespace App\Models;

use App\Jobs\Meta\ExchangeTokenJob;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class MetaSetting extends Model
{
    protected $fillable = [
        'meta_fb_app_name',
        'meta_fb_app_id',
        'meta_fb_app_secret',
        'meta_fb_page_access_token',
        'meta_fb_page_username',
        'meta_fb_page_id',
        'meta_fb_token_type',
        'meta_fb_token_expires_at',
        'meta_verify_token',

        'meta_ig_app_name',
        'meta_ig_app_id',
        'meta_ig_app_secret',
        'meta_ig_access_token',
        'meta_ig_username',
        'meta_ig_account_id',
        'meta_ig_bussiness_account_id',
        'meta_ig_token_type',
        'meta_ig_token_expires_at',

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

        static::creating(function ($meta_setting) {
            Cache::forget('meta_setting');
            $meta_setting->meta_fb_token_expires_at = now()->addHours(2);
            $meta_setting->meta_ig_token_expires_at = now()->addHours(2);
        });

        static::updating(function ($meta_setting) {
            Cache::forget('meta_setting');

            if ($meta_setting->isDirty('meta_fb_page_access_token')) {
                $meta_setting->meta_fb_token_type = 'short_lived';

                if (! empty($meta_setting->meta_fb_token_expires_at)) {
                    $meta_setting->meta_fb_token_expires_at = now()->addHours(2);
                }
            }

            if ($meta_setting->isDirty('meta_ig_access_token')) {
                $meta_setting->meta_ig_token_type = 'short_lived';

                if (! empty($meta_setting->meta_ig_token_expires_at)) {
                    $meta_setting->meta_ig_token_expires_at = now()->addHours(2);
                }
            }

            if (empty($meta_setting->meta_fb_token_expires_at)) {
                $meta_setting->meta_fb_token_expires_at = now()->addHours(2);
            }

            if (empty($meta_setting->meta_ig_token_expires_at)) {
                $meta_setting->meta_ig_token_expires_at = now()->addHours(2);
            }
        });

        static::deleting(function () {
            if (static::count() === 1) {
                throw new \Exception('You cannot delete this record because at least one Meta Setting must always remain in the system.');
            }
        });

        static::saved(function ($meta_setting) {

            if (! $meta_setting->is_active) {
                return;
            }

            if ($meta_setting->wasChanged(['meta_fb_page_access_token', 'meta_ig_access_token', 'is_active'])) {
                dispatch(new ExchangeTokenJob($meta_setting));
            }
        });

    }

    // casting
    protected $casts = [
        'meta_fb_app_id' => 'encrypted',
        'meta_fb_app_secret' => 'encrypted',

        'meta_ig_app_id' => 'encrypted',
        'meta_ig_app_secret' => 'encrypted',

        'meta_fb_page_access_token' => 'encrypted',
        'meta_ig_access_token' => 'encrypted',
        'meta_verify_token' => 'encrypted',
    ];
}
