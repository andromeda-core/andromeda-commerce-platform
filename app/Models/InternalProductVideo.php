<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Str;

class InternalProductVideo extends Model
{
    protected $fillable = [
        'public_id',
        'original_name',
        'file_name',
        'folder',
        'file_path',
        'file_url',
        'mime_type',
        'extension',
        'size',
        'upload_status',
        'uploaded_by',
    ];

    protected $appends = ['human_size', 'created_at_formatted'];

    protected static function booted(): void
    {
        static::creating(function ($model) {
            $model->public_id = 'vid_' . Str::uuid();
        });
    }

    public function uploadedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function getHumanSizeAttribute(): ?string
    {
        if (empty($this->size)) {
            return null;
        }
        $bytes = $this->size;
        if ($bytes >= 1048576) {
            return number_format($bytes / 1048576, 2) . ' MB';
        }
        if ($bytes >= 1024) {
            return number_format($bytes / 1024, 2) . ' KB';
        }
        return $bytes . ' B';
    }

    public function getCreatedAtFormattedAttribute(): ?string
    {
        return !empty($this->created_at) ? $this->created_at->format('Y-m-d H:i:s') : null;
    }
}
