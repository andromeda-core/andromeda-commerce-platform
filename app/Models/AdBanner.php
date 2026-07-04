<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Str;

class AdBanner extends Model
{
    protected $fillable = [
        'public_id',
        'name',
        'media_type',
        'original_name',
        'file_name',
        'folder',
        'file_path',
        'file_url',
        'mime_type',
        'extension',
        'size',
        'upload_status',
        'redirect_url',
        'uploaded_by',
    ];

    protected static function booted(): void
    {
        static::creating(function ($model) {
            $model->public_id = 'ad_'.Str::uuid();
        });
    }

    public function uploadedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}
