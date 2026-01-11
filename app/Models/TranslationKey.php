<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TranslationKey extends Model
{
    protected $fillable = [
        'key',
    ];

    // RelationShips
    public function translations(): HasMany
    {
        return $this->hasMany(Translation::class, 'translation_key_id', 'id');
    }

    // Attributes
    protected $appends = ['added_at'];

    public function getAddedAtAttribute()
    {
        return ! empty($this->created_at) ? $this->created_at->format('Y-m-d') : null;
    }
}
