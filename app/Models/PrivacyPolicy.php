<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PrivacyPolicy extends Model
{
    protected $fillable = ['name', 'content', 'slug', 'company_name',  'dpo_name', 'dpo_email', 'dpo_phone', 'dpo_address', 'country', 'state', 'language_id', 'is_active'];

    protected $appends = ['added_at', 'human_updated_at'];

    // Attributes
    public function getAddedAtAttribute()
    {
        return ! empty($this->created_at) ? $this->created_at->format('Y-m-d') : null;
    }

    public function getHumanUpdatedAtAttribute()
    {
        return ! empty($this->updated_at) ? $this->updated_at->format('M-d-Y') : $this->updated_at ?? null;
    }

    // RelationShips
    public function language(): BelongsTo
    {
        return $this->belongsTo(Language::class, 'language_id', 'id');
    }

    protected $casts = [
        'content' => 'array',
    ];
}
