<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Addon extends Model
{
    protected $fillable = ['name', 'price', 'is_active'];

    protected $appends = ['added_at'];

    // Attributes
    public function getAddedAtAttribute()
    {
        return ! empty($this->created_at) ? $this->created_at->format('Y-m-d') : null;
    }

    // RelationShips

    // Pivot
    public function smartphones(): BelongsToMany
    {
        return $this->belongsToMany(
            Smartphone::class,
            'smartphone_addons',
            'addon_id',
            'smartphone_id'
        );
    }
}
