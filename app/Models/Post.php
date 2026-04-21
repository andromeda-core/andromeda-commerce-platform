<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Str;

class Post extends Model
{
    protected $fillable = [
        'public_id',
        'user_id',
        'title',
        'content',
        'images',
        'videos',
        'slug',
        'tag',
        'latitude',
        'longitude',
        'location_name',
        'post_type',
        'status',
        'floor_id',
    ];

    protected $appends = ['added_at', 'post_image_urls', 'post_video_urls', 'created_at_time', 'is_bookmarked'];

    /**
     * @message Not Needed For Now
     */
    // Algolia Search Logic
    // public function searchableWith()
    // {
    //     return ['floor'];
    // }

    // public function toSearchableArray()
    // {
    //     return [
    //         'title' => $this->title,
    //         'content' => $this->content,
    //         'tag' => $this->tag,
    //         'location_name' => $this->location_name,
    //         'floor_name' => optional($this->floor)->name,
    //     ];
    // }

    // RelationShips
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    public function floor(): BelongsTo
    {
        return $this->belongsTo(Floor::class, 'floor_id', 'id');
    }

    public function bookmarkedByUsers()
    {
        return $this->belongsToMany(User::class, 'bookmarks', 'post_id', 'user_id')->withTimestamps();
    }

    // Attributes
    public function getAddedAtAttribute()
    {
        return $this->created_at
            ? Carbon::parse($this->created_at)->format('F, d, Y')
            : null;
    }

    public function getCreatedAtTimeAttribute()
    {
        return $this->created_at
            ? Carbon::parse($this->created_at)->format('g:i A')
            : null;
    }

    public function getPostImageUrlsAttribute()
    {
        return array_map(function ($image) {
            return $image['url'];
        }, $this->images ?? []);
    }

    public function getPostVideoUrlsAttribute()
    {
        return array_map(function ($video) {
            return [
                'url' => $video['url'],
                'thumbnail_url' => $video['thumbnail_url'],
            ];
        }, $this->videos ?? []);
    }

    public function getIsBookmarkedAttribute()
    {
        return $this->bookmarkedByUsers()->where('user_id', Auth::id())->exists();
    }

    // Static Booting
    protected static function booted()
    {
        static::creating(function ($post) {
            $post->user_id = Auth::id();
        });

        static::created(function ($post) {

            $cleanTitle = $post->title;

            $cleanTitle = str_replace(['/', '\\'], '-', $cleanTitle);
            $cleanTitle = preg_replace('/[^A-Za-z0-9\- ]/', '', $cleanTitle);

            $cleanTitle = preg_replace('/\s+/u', '-', trim($cleanTitle));

            $post->slug = strtolower(
                $cleanTitle . '-' . time() . '-' . $post->id . '-' . Str::uuid()
            );

            $post->public_id = 'pst_' . Str::uuid();

            $post->save();

            Cache::tags(['feed'])->flush();
        });

        static::updated(function ($post) {
            Cache::tags(['feed'])->flush();
        });

        static::deleted(function ($post) {
            Cache::tags(['feed'])->flush();
        });
    }

    // Scout Searching method
    // public function toSearchableArray()
    // {
    //     return [
    //         'title' => $this->title,
    //         'content' => $this->content,
    //         'tag' => $this->tag,
    //     ];
    // }

    // Casting
    protected $casts = [
        'images' => 'array',
        'videos' => 'array',
    ];
}
