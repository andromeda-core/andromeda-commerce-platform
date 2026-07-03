<?php

namespace App\Models;

use App\Traits\HasContentTranslations;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Facades\Cache;
use Str;

class LodgingProduct extends Model
{
    use HasContentTranslations;

    // System 1 (per-record content translation). Customer-facing free-text only;
    // preset/enum (property_type) + numeric/bool + internal/MSAP columns are excluded.
    protected array $translatableFields = ['property_name', 'location_description', 'location_name', 'city_region', 'content', 'tag'];

    protected $table = 'lodging_products';

    protected $fillable = [
        'public_id',
        'accommodation_operator_id',
        'accommodation_distributor_id',
        'property_name',
        'property_type',
        'city_region',
        'location_description',
        'latitude',
        'longitude',
        'location_name',
        'floor_id',
        'floor_start_id',
        'floor_end_id',
        'tag',
        'content',
        'base_checkin_time',
        'base_checkout_time',
        'from_price',
        'is_active',
        'is_reservation_closed',
        'assigned_dashboard_user_id',
        'booking_source',
        'source_of_truth',
        'sync_status',
        'external_provider',
        'external_listing_id',
        'external_api_render_mode',
        'external_api_payload_snapshot',
        'msap_uri',
        'msap_event_ref',
        'element_bundle',
        'msap_ready',
    ];

    // RelationShip
    public function rooms(): HasMany
    {
        return $this->hasMany(LodgingRoom::class, 'lodging_product_id', 'id');
    }

    public function media(): HasMany
    {
        return $this->hasMany(LodgingMedia::class, 'lodging_product_id', 'id')->orderBy('sort_order');
    }

    public function checkinPolicy(): HasOne
    {
        return $this->hasOne(LodgingCheckinPolicy::class, 'lodging_product_id', 'id');
    }

    public function parkingPolicy(): HasOne
    {
        return $this->hasOne(LodgingParkingPolicy::class, 'lodging_product_id', 'id');
    }

    public function cancellationPolicy(): HasOne
    {
        return $this->hasOne(LodgingCancellationPolicy::class, 'lodging_product_id', 'id');
    }

    public function floor(): BelongsTo
    {
        return $this->belongsTo(Floor::class, 'floor_id', 'id');
    }

    // Optional floor RANGE endpoints (e.g. "1F - 3F"). floor() above stays the single anchor floor.
    public function floorStart(): BelongsTo
    {
        return $this->belongsTo(Floor::class, 'floor_start_id', 'id');
    }

    public function floorEnd(): BelongsTo
    {
        return $this->belongsTo(Floor::class, 'floor_end_id', 'id');
    }

    public function assignedDashboardUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_dashboard_user_id', 'id');
    }

    public function accommodationOperator(): BelongsTo
    {
        return $this->belongsTo(AccommodationOperator::class, 'accommodation_operator_id', 'id');
    }

    public function accommodationDistributor(): BelongsTo
    {
        return $this->belongsTo(AccommodationDistributor::class, 'accommodation_distributor_id', 'id');
    }

    // Pivot
    public function amenities(): BelongsToMany
    {
        return $this->belongsToMany(LodgingAmenity::class, 'lodging_product_amenities', 'lodging_product_id', 'lodging_amenity_id');
    }

    // Static Booting
    protected static function booted()
    {
        static::created(function ($product) {
            $dirty = false;

            if (empty($product->public_id)) {
                $product->public_id = 'lod_' . Str::uuid();
                $dirty = true;
            }

            // Stage 3.2 — canonical slug (stable after first generation): property-name + id + random.
            // slug is NOT in $fillable (never mass-assigned); generated here only.
            if (empty($product->slug)) {
                $product->slug = Str::slug($product->property_name) . '-' . $product->id . '-' . Str::lower(Str::random(6));
                $dirty = true;
            }

            if ($dirty) {
                $product->saveQuietly();
            }
        });

        // Backfill guard only: regenerate the slug if a rename ever lands on a row that still has none.
        // A slug is otherwise STABLE once set (do not regenerate on normal updates).
        static::updated(function ($product) {
            if ($product->wasChanged('property_name') && empty($product->slug)) {
                $product->slug = Str::slug($product->property_name) . '-' . $product->id . '-' . Str::lower(Str::random(6));
                $product->saveQuietly();
            }
        });

        static::saving(function ($product) {
            Cache::tags(['feed'])->flush();
        });

        static::deleted(function ($product) {
            Cache::tags(['feed'])->flush();
        });
    }

    // Casting
    protected $casts = [
        'external_api_payload_snapshot' => 'array',
        'element_bundle' => 'array',
        'is_active' => 'boolean',
        'is_reservation_closed' => 'boolean',
        'msap_ready' => 'boolean',
        // NOT in $fillable (see migration comment) — set only via the dedicated toggle endpoint.
        'accommodation_distributor_can_manage' => 'boolean',
    ];
}
