<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class PriceRange extends Model
{
    use HasFactory;

    protected $fillable = [
        'value',
        'type',
        'is_active',
    ];

    protected $casts = [
        'value' => 'integer',
        'is_active' => 'boolean',
    ];

    protected $appends = ['type_label', 'added_at'];

    // Attributes
    public function getTypeLabelAttribute()
    {
        return match ($this->type) {
            'less_than' => 'Less Than (Under)',
            'greater_than' => 'Greater Than (Over)',
            default => $this->type,
        };
    }

    public function getAddedAtAttribute()
    {
        return ! empty($this->created_at) ? $this->created_at->format('Y-m-d') : null;
    }

    // Static Booting
    protected static function booted(): void
    {
        static::saved(fn() => Cache::forget('price_ranges'));
        static::deleted(fn() => Cache::forget('price_ranges'));
    }
}
