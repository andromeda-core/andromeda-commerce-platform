<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
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
        'country_id',
        'condition_id',
        'delivery_days',
        'courier_company_id',
        'return_policy_id',
        'upc',
        'images',
        'tag',
        'slug',
        'content',
        'product_details',
        'floor_id',
        'videos',
        'latitude',
        'longitude',
        'location_name',

    ];

    protected $appends = ['added_at', 'created_at_time', 'colors', 'smartphone_image_urls', 'smartphone_video_urls'];

    protected $with = ['addons'];

    public function getColorsAttribute()
    {
        return Color::whereIn('id', $this->color_ids ?? [])->get();
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

    public function getSmartphoneImageUrlsAttribute()
    {
        return array_map(function ($image) {
            return $image['url'];
        }, $this->images ?? []);
    }

    public function getSmartphoneVideoUrlsAttribute()
    {
        return array_map(function ($video) {
            return [
                'url' => $video['url'],
                'thumbnail_url' => $video['thumbnail_url'],
            ];
        }, $this->videos ?? []);
    }

    // RelationShip
    public function model_name(): BelongsTo
    {
        return $this->belongsTo(ModelName::class, 'model_name_id', 'id');
    }

    public function floor(): BelongsTo
    {
        return $this->belongsTo(Floor::class, 'floor_id', 'id');
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

    public function country(): BelongsTo
    {
        return $this->belongsTo(Country::class, 'country_id', 'id');
    }

    public function condition(): BelongsTo
    {
        return $this->belongsTo(Condition::class, 'condition_id', 'id');
    }

    public function courier_company(): BelongsTo
    {
        return $this->belongsTo(CourierCompany::class, 'courier_company_id', 'id');
    }

    public function return_policy(): BelongsTo
    {
        return $this->belongsTo(ReturnPolicy::class, 'return_policy_id', 'id');
    }

    public function smartphoneAddons(): HasMany
    {
        return $this->hasMany(SmartphoneCartAddon::class, 'smartphone_id', 'id');
    }

    // Pivot
    public function addons(): BelongsToMany
    {
        return $this->belongsToMany(Addon::class, 'smartphone_addons', 'smartphone_id', 'addon_id');
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
        static::saving(function ($smartphone) {
            Cache::tags(['feed'])->flush();
            Cache::forget('smartphone_tags');

            $smartphone->model_searchable_name = $smartphone->model_name?->name;
        });

        static::deleted(function ($smartphone) {
            Cache::tags(['feed'])->flush();
            Cache::forget('smartphone_tags');
        });
    }

    // Casting
    protected $casts = [
        'color_ids' => 'array',
        'images' => 'array',
        'videos' => 'array',
        'product_details' => 'array',
    ];
}
