<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Cache;
use Str;

class LodgingMedia extends Model
{
    protected $table = 'lodging_media';

    protected $fillable = [
        'public_id',
        'lodging_product_id',
        'source_post_id',
        'source_product_id',
        'file_path',
        'file_url',
        'file_name',
        'type',
        'thumbnail_url',
        'mime_type',
        'size',
        'upload_status',
        'caption',
        'alt_text',
        'hashtags',
        'space_ref',
        'time_ref',
        'evidence_role',
        'future_payload_ref',
        'visibility',
        'sort_order',
    ];

    // RelationShip
    public function lodgingProduct(): BelongsTo
    {
        return $this->belongsTo(LodgingProduct::class, 'lodging_product_id', 'id');
    }

    public function sourcePost(): BelongsTo
    {
        return $this->belongsTo(Post::class, 'source_post_id', 'id');
    }

    // Static Booting
    protected static function booted()
    {
        static::created(function ($media) {
            if (empty($media->public_id)) {
                $media->public_id = 'lmd_' . Str::uuid();
                $media->saveQuietly();
            }
        });

        static::saving(function ($media) {
            Cache::tags(['feed'])->flush();
        });

        static::deleted(function ($media) {
            Cache::tags(['feed'])->flush();
        });
    }

    // Casting
    protected $casts = [
        'hashtags' => 'array',
        'source_product_id' => 'integer',
    ];
}
