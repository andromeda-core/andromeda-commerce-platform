<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Language extends Model
{
    protected $fillable = [
        'name',
        'code',
    ];

    // RelationShips
    public function translations(): HasMany
    {
        return $this->hasMany(Translation::class, 'language_id', 'id');
    }

    // Attributes
    protected $appends = ['added_at'];

    public function getAddedAtAttribute()
    {
        return ! empty($this->created_at) ? $this->created_at->format('Y-m-d') : null;
    }

    // Static Booting
    protected static function booted()
    {
        static::deleting(function (Language $language) {
            if ($language->id === 1 && $language->code === 'en') {
                throw new \Exception('Default en language cannot be deleted. Please try deleting another language.');
            }
        });
    }
}
