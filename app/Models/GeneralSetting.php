<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class GeneralSetting extends Model
{
    protected $fillable = ['app_name', 'contact_email', 'contact_number', 'app_main_logo_dark', 'app_main_logo_light', 'app_favicon', 'app_pwa_logo', 'app_description'];

    protected static function booted(): void
    {
        static::updated(function () {
            Cache::forget('general_config');
        });

        static::created(function () {
            Cache::forget('general_config');
        });

    }

    protected $appends = ['app_main_logo_dark_url', 'app_main_logo_light_url', 'app_favicon_url'];

    // Attributes
    public function getAppMainLogoDarkUrlAttribute()
    {
        return $this->attributes['app_main_logo_dark'] ? asset('assets/images/Logo/'.$this->attributes['app_main_logo_dark']) : null;
    }

    public function getAppMainLogoLightUrlAttribute()
    {
        return $this->attributes['app_main_logo_light'] ? asset('assets/images/Logo/'.$this->attributes['app_main_logo_light']) : null;
    }

    public function getAppFaviconUrlAttribute()
    {
        return $this->attributes['app_favicon'] ? asset('assets/images/Logo/'.$this->attributes['app_favicon']) : null;
    }
}
