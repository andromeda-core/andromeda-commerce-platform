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
}
