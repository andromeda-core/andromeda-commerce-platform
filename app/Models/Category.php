<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Category extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'short_description',
        'thumbnail',
        'distributor_id',
        'is_active',
    ];

    // Attributes
    protected $appends = ['added_at', 'thumbnail_url'];

    public function getAddedAtAttribute()
    {
        return ! empty($this->created_at) ? $this->created_at->format('Y-m-d') : null;
    }

    public function getThumbnailUrlAttribute()
    {
        if (! empty($this->thumbnail)) {
            return $this->thumbnail['url'];
        }

        return null;
    }

    // RelationShips
    public function smartphones(): HasMany
    {
        return $this->hasMany(Smartphone::class, 'category_id', 'id');
    }

    public function distributor(): BelongsTo
    {
        return $this->belongsTo(Distributor::class, 'distributor_id', 'id');
    }

    // Casting
    protected $casts = [
        'thumbnail' => 'array',
    ];
}
