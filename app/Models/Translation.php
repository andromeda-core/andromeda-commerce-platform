<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Translation extends Model
{
    protected $fillable = [
        'language_id',
        'translation_key_id',
        'value',
    ];

    // RelationShips
    public function language(): BelongsTo
    {
        return $this->belongsTo(Language::class, 'language_id', 'id');
    }

    public function translationKeys(): BelongsTo
    {
        return $this->belongsTo(TranslationKey::class, 'translation_key_id', 'id');
    }
}
