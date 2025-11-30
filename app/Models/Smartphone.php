<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Facades\Cache;

class Smartphone extends Model
{
    protected $fillable = [
        'model_name_id',
        'model_searchable_name',
        'capacity_id',
        'color_ids',
        'category_id',
        'upc',
        'images',
        'tag',
        'slug',
        'content',

    ];

    protected $appends = ['added_at', 'colors', 'smartphone_image_urls'];

    public function getColorsAttribute()
    {
        return Color::whereIn('id', $this->color_ids ?? [])->get();
    }

    public function getAddedAtAttribute()
    {
        return $this->created_at
           ? Carbon::parse($this->created_at)->format('Y-m-d')
           : null;
    }

    public function getSmartphoneImageUrlsAttribute()
    {
        return array_map(function ($image) {
            return $image['url'];
        }, $this->images ?? []);
    }

    // RelationShip
    public function model_name(): BelongsTo
    {
        return $this->belongsTo(ModelName::class, 'model_name_id', 'id');
    }

    public function capacity(): BelongsTo
    {
        return $this->belongsTo(Capacity::class, 'capacity_id', 'id');
    }

    public function inventory_items(): HasMany
    {
        return $this->hasMany(Inventory::class, 'smartphone_id', 'id');
    }

    public function selling_info(): HasOne
    {
        return $this->hasOne(SmartphoneForSale::class, 'smartphone_id', 'id');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'category_id', 'id');
    }

    public function orders(): HasMany
    {
        return $this->hasMany(OrderItem::class, 'smartphone_id', 'id');
    }

    public function cart_items(): HasMany
    {
        return $this->hasMany(CartItem::class, 'smartphone_id', 'id');
    }

    // Scout Searching method
    // public function toSearchableArray()
    // {
    //     return [
    //         'model_searchable_name' => $this->model_searchable_name,
    //         'content' => $this->content,
    //         'tag' => $this->tag,
    //     ];
    // }

    // Static Booting
    protected static function booted()
    {
        static::created(function ($smartphone) {
            Cache::tags(['feed'])->flush();

            $smartphone->model_searchable_name = $smartphone?->model_name?->name;
            $smartphone->save();
        });

        static::updated(function ($smartphone) {
            Cache::tags(['feed'])->flush();

            $smartphone->model_searchable_name = $smartphone?->model_name?->name;
            $smartphone->save();
        });

        static::deleted(function ($smartphone) {
            Cache::tags(['feed'])->flush();
        });
    }

    // Casting
    protected $casts = [
        'color_ids' => 'array',
        'images' => 'array',
    ];
}
