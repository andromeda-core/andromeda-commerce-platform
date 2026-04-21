<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Str;

class ProductLink extends Model
{
    protected $fillable = [
        'link_public_id',
        'smartphone_id',
        'user_id',
        'post_id',
        'status',
        'event_id',
        'msap_uri',
    ];

    protected $appends = ['added_at'];

    protected static function booted()
    {
        static::creating(function ($model) {
            $model->link_public_id = 'lnk_' . Str::uuid();
        });
    }

    // Relationships
    public function smartphone()
    {
        return $this->belongsTo(Smartphone::class, 'smartphone_id', 'id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    public function post()
    {
        return $this->belongsTo(Post::class, 'post_id', 'id');
    }

    // Shareable URL accessor
    public function getShareableUrlAttribute(): string
    {
        return url("/link/{$this->link_public_id}");
    }

    public function getAddedAtAttribute(): string
    {
        return !empty($this->created_at) ? $this->created_at->format('Y-m-d') : null;
    }
}
