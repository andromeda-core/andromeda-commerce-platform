<?php

namespace App\Models;

use Cache;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Country extends Model
{
    protected $fillable = ['name', 'iso_code', 'is_active'];

    // Attributes
    protected $appends = ['added_at'];

    public function getAddedAtAttribute()
    {
        return ! empty($this->created_at) ? $this->created_at->format('Y-m-d') : null;
    }

    // Static Booting
    protected static function booting()
    {
        static::deleted(function () {
            if (static::count() === 1) {
                throw new \Exception('You cannot delete this record because at least one Country must always remain in the system.');
            }

            Cache::forget('countries');
        });

        static::created(function () {
            Cache::forget('countries');
        });

        static::updated(function () {
            Cache::forget('countries');
        });
    }

    // RelationShips
    // public function special_countries() : HasMany
    // {
    //     return $this->hasMany(SpecialCountry::class,'country_id','id');
    // }
}
