<?php

namespace App\Repositories\Lodging\Repository;

use App\Jobs\CompressLodgingMediaVideoWithFFMPEG;
use App\Jobs\LodgingMediaDestroyOnAWS;
use App\Jobs\LodgingMediaStoreOnAWS;
use App\Models\ContentTranslation;
use App\Models\Currency;
use App\Models\Floor;
use App\Models\Language;
use App\Models\LodgingAmenity;
use App\Models\LodgingProduct;
use App\Models\LodgingRatePlan;
use App\Models\LodgingRoom;
use App\Models\Post;
use App\Models\Smartphone;
use App\Models\User;
use App\Repositories\Lodging\Interface\ILodgingProductRepository;
use App\Services\ContentTranslationService;
use App\Services\GoogleGeoCoderService;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Intervention\Image\Encoders\WebpEncoder;
use Intervention\Image\ImageManager;
use Str;

class LodgingProductRepository implements ILodgingProductRepository
{
    // Enum option lists (mirror the lodging migration enums).
    private const PROPERTY_TYPES = ['hotel', 'bnb', 'guesthouse', 'villa', 'room', 'pension', 'resort', 'motel'];

    private const ROOM_TYPES = ['entire_place', 'private_room', 'shared_room', 'hotel_room'];

    private const VIEW_TYPES = ['ocean', 'harbor', 'city', 'mountain', 'garden', 'other'];

    private const CHECKIN_METHODS = ['front_desk', 'self_checkin', 'contactless', 'host_meet'];

    private const PARKING_TYPES = ['onsite', 'underground', 'nearby', 'valet', 'no_parking'];

    private const CANCELLATION_POLICY_NAMES = ['flexible', 'moderate', 'firm', 'non_refundable', 'custom'];

    private const EVIDENCE_ROLES = ['marketing', 'room_photo', 'location_guide', 'checkin_guide', 'booking_proof', 'review', 'defect_evidence'];

    // Not DB enums; curated option lists for the json columns (bed_types / payment_methods).
    private const BED_TYPES = ['single', 'super_single', 'double', 'queen', 'king', 'bunk', 'sofa_bed', 'floor_bedding'];

    // Rate-plan stay type (nullable). Not a DB enum — single source of truth here + Rule::in.
    private const STAY_TYPES = ['room_only', 'breakfast_included', 'non_refundable_special', 'late_checkin_special', 'no_consecutive_nights', 'member_special'];

    // private const PAYMENT_METHODS = ['card', 'crypto', 'bank_transfer', 'onsite'];
    // For Launch Safe
    private const PAYMENT_METHODS = ['crypto'];

    // S3 directory conventions (mirror the smartphone job directory style).
    private const IMAGES_DIR = 'Lodging/Images/';

    private const VIDEOS_DIR = 'Lodging/Videos/';

    public function __construct(
        private LodgingProduct $lodging_product,
        private LodgingAmenity $lodging_amenity,
        private Floor $floor,
        private User $user,
        private GoogleGeoCoderService $googleGeoCoderService,
        private Post $post,
        private Smartphone $smartphone,
        // Stage 3.4.1 — injected for later stages (3.4.2) to call syncTranslations(); inert for now.
        private ContentTranslationService $contentTranslationService,
    ) {}

    // ---------------------------------------------------------------------
    // Stage 3.2 — public feed integration (lodging as a third feed type).
    // READ-ONLY: builds lean feed-card payloads for active, slugged properties.
    // member_price is NEVER included (future-only, hidden from customer).
    // ---------------------------------------------------------------------

    /**
     * Paginated lodging properties for the main website feed (mirrors the smartphones feed branch:
     * is_active only, slugged, oldest-first, forPage). Returns a Collection of plain (object) cards.
     */
    public function getLodgingProductsForFeed(int $page, int $perPage, bool $images = true, bool $videos = true, bool $text = true)
    {
        $currencyCode = $this->resolveBaseCurrencyCode();

        $query = $this->lodging_product
            ->where('is_active', true)
            ->whereNotNull('slug');

        $this->applyLodgingMediaFilter($query, $images, $videos, $text);

        $properties = $query
            ->with([
                'media',
                'rooms.ratePlans' => fn ($q) => $q
                    ->whereNotNull('sale_price')
                    ->where('sale_price', '>', 0),
                'rooms.amenities',
                // Detail relations — cards carry full detail (mirrors smartphone/post complete-card
                // pattern) so the viewer has rooms/amenities/policies on every open path. Eager-loaded
                // here to avoid N+1 / lazy-loading violations under Model::shouldBeStrict().
                'amenities',
                'checkinPolicy',
                'cancellationPolicy',
                'parkingPolicy',
                'floor:id,name',
                // Optional floor-range endpoints for the displayed "1F - 3F" label (no N+1).
                'floorStart:id,name',
                'floorEnd:id,name',
                // Stage 3.4.4 — per-record content translations so translatedValue() reads the
                // eager-loaded relation (no N+1 under shouldBeStrict). Amenity is System 2 (label
                // via __()), so amenity contentTranslations are intentionally NOT loaded.
                'contentTranslations',
                'rooms.contentTranslations',
                'rooms.ratePlans.contentTranslations',
                'checkinPolicy.contentTranslations',
                'cancellationPolicy.contentTranslations',
                'parkingPolicy.contentTranslations',
            ])
            ->orderBy('created_at', 'asc')
            ->forPage($page, $perPage)
            ->get();

        // Batched related lookups (one query each) keyed by the page's tags — no N+1.
        $tags = $properties->pluck('tag')->filter()->unique()->values()->all();

        $relatedPosts = blank($tags) ? collect() : $this->relatedPostsByTags($tags, $images, $videos, $text);
        $relatedSmartphones = blank($tags) ? collect() : $this->relatedSmartphonesByTags($tags, $images, $videos, $text);
        $relatedLodging = blank($tags) ? collect() : $this->getRelatedLodgingForFeed($tags, $images, $videos, $text);

        return $properties->map(function ($product) use ($currencyCode, $relatedPosts, $relatedSmartphones, $relatedLodging) {
            $item = $this->buildLodgingFeedItem($product, $currencyCode, true);

            $tag = $product->tag;
            if (! empty($tag)) {
                $itemRelatedPosts = $relatedPosts->filter(fn ($rp) => ! empty($rp->tag) && $rp->tag === $tag)->take(5)->values();
                $itemRelatedSmartphones = $relatedSmartphones->filter(fn ($rs) => ! empty($rs->tag) && $rs->tag === $tag)->take(5)->values();
                $itemRelatedLodging = $relatedLodging->filter(fn ($rl) => ! empty($rl->tag) && $rl->tag === $tag && $rl->id !== $product->id)->take(5)->values();

                $item->related = collect()
                    ->merge($itemRelatedPosts)
                    ->merge($itemRelatedSmartphones)
                    ->merge($itemRelatedLodging)
                    ->shuffle()
                    ->values();
            }

            return $item;
        })->values();
    }

    /**
     * Single active lodging property for the client-side feed fetch (direct_lodging deep-link).
     * Looked up by public_id (preferred) or slug. Returns the same card shape as the list, or null.
     */
    public function getSingleLodgingForFeed(?string $public_id = null, ?string $slug = null)
    {
        if (empty($public_id) && empty($slug)) {
            return null;
        }

        $currencyCode = $this->resolveBaseCurrencyCode();

        $product = $this->lodging_product
            ->where('is_active', true)
            ->when(! empty($public_id), fn ($query) => $query->where('public_id', $public_id))
            ->when(empty($public_id) && ! empty($slug), fn ($query) => $query->where('slug', $slug))
            ->with([
                'media',
                'rooms.ratePlans' => fn ($query) => $query
                    ->whereNotNull('sale_price')
                    ->where('sale_price', '>', 0),
                'rooms.amenities',
                // Single-page (deep-link) detail relations — NOT loaded for feed cards (lean payload).
                'amenities',
                'checkinPolicy',
                'cancellationPolicy',
                'parkingPolicy',
                'floor:id,name',
                // Optional floor-range endpoints for the displayed "1F - 3F" label (no N+1).
                'floorStart:id,name',
                'floorEnd:id,name',
                // Stage 3.4.4 — per-record content translations for translatedValue() (no N+1).
                'contentTranslations',
                'rooms.contentTranslations',
                'rooms.ratePlans.contentTranslations',
                'checkinPolicy.contentTranslations',
                'cancellationPolicy.contentTranslations',
                'parkingPolicy.contentTranslations',
            ])
            ->first();

        if (empty($product)) {
            return null;
        }

        // includeDetails = true → attach rooms + rate plans + amenities + policies for the viewer.
        $item = $this->buildLodgingFeedItem($product, $currencyCode, true);

        // Related (posts + smartphones + other lodging) by this property's tag — mirrors how a
        // single smartphone deep-link shows all related; filters default true for a deep-link.
        if (! empty($product->tag)) {
            $relatedPosts = $this->relatedPostsByTags([$product->tag], true, true, true)->take(5)->values();
            $relatedSmartphones = $this->relatedSmartphonesByTags([$product->tag], true, true, true)->take(5)->values();
            $relatedLodging = $this->getRelatedLodgingForFeed([$product->tag], true, true, true)
                ->filter(fn ($rl) => $rl->id !== $product->id)
                ->take(5)
                ->values();

            $item->related = collect()
                ->merge($relatedPosts)
                ->merge($relatedSmartphones)
                ->merge($relatedLodging)
                ->shuffle()
                ->values();
        }

        return (array) $item;
    }

    /**
     * Apply the text/images/videos visibility filter to a LodgingProduct query.
     * Mirrors the smartphone inline-column logic, but lodging media lives in the
     * lodging_media relation, so we use whereHas / whereDoesntHave:
     *   text   = no media at all
     *   images = has an image AND has no video
     *   videos = has at least one video
     */
    private function applyLodgingMediaFilter($query, bool $images, bool $videos, bool $text)
    {
        return $query->where(function ($q) use ($images, $videos, $text) {
            if ($text) {
                $q->orWhereDoesntHave('media');
            }

            if ($images) {
                $q->orWhere(function ($sub) {
                    $sub->whereHas('media', fn ($m) => $m->where('type', 'image'))
                        ->whereDoesntHave('media', fn ($m) => $m->where('type', 'video'));
                });
            }

            if ($videos) {
                $q->orWhereHas('media', fn ($m) => $m->where('type', 'video'));
            }
        });
    }

    /**
     * Feed-shaped lodging cards matching the given tags (respecting filters).
     * Used by PostRepository + ProductsRepository to inject lodging into their
     * related lists, and internally by the lodging feed/single. Returns a Collection
     * of (object) cards (same shape as the lodging feed list).
     *
     * When $page + $perPage are supplied the result is paginated (forPage) so callers
     * that paginate related items (getRelated) can compute has-more; otherwise a flat
     * cap of $limit is used (inline feed related).
     */
    public function getRelatedLodgingForFeed(
        array $tags,
        bool $images = true,
        bool $videos = true,
        bool $text = true,
        array $excludeSlugs = [],
        ?int $page = null,
        ?int $perPage = null,
        int $limit = 50
    ) {
        if (blank($tags)) {
            return collect();
        }

        $currencyCode = $this->resolveBaseCurrencyCode();

        $query = $this->lodging_product
            ->where('is_active', true)
            ->whereNotNull('slug')
            ->whereIn('tag', $tags)
            ->when(! blank($excludeSlugs), fn ($q) => $q->whereNotIn('slug', $excludeSlugs));

        $this->applyLodgingMediaFilter($query, $images, $videos, $text);

        $query->with([
            'media',
            'rooms.ratePlans' => fn ($q) => $q
                ->whereNotNull('sale_price')
                ->where('sale_price', '>', 0),
            'rooms.amenities',
            // Detail relations — related cards also carry full detail so X/Y navigation onto a related
            // lodging item shows rooms/amenities/policies. Eager-loaded (no lazy-loading violation).
            'amenities',
            'checkinPolicy',
            'cancellationPolicy',
            'parkingPolicy',
            'floor:id,name',
            // Optional floor-range endpoints for the displayed "1F - 3F" label (no N+1) — required
            // here too because buildLodgingFeedItem -> buildFloorRange reads floorStart/floorEnd.
            'floorStart:id,name',
            'floorEnd:id,name',
            // Stage 3.4.4 — per-record content translations for translatedValue() (no N+1).
            'contentTranslations',
            'rooms.contentTranslations',
            'rooms.ratePlans.contentTranslations',
            'checkinPolicy.contentTranslations',
            'cancellationPolicy.contentTranslations',
            'parkingPolicy.contentTranslations',
        ])->orderBy('created_at', 'asc');

        if ($page !== null && $perPage !== null) {
            $query->forPage($page, $perPage);
        } else {
            $query->limit($limit);
        }

        return $query->get()
            ->map(fn ($product) => $this->buildLodgingFeedItem($product, $currencyCode, true))
            ->values();
    }

    /** Related posts (feed shape) matching tags, respecting filters. Mirrors PostRepository related-post mapping. */
    private function relatedPostsByTags(array $tags, bool $images, bool $videos, bool $text)
    {
        return $this->post
            ->where('status', true)
            ->whereIn('tag', $tags)
            ->where(function ($q) use ($images, $videos, $text) {
                if ($text) {
                    $q->orWhere(fn ($sub) => $sub->whereNull('images')->whereNull('videos'));
                }
                if ($images) {
                    $q->orWhere(fn ($sub) => $sub->whereNotNull('images')->whereNull('videos'));
                }
                if ($videos) {
                    $q->orWhere(fn ($sub) => $sub->whereNotNull('videos'));
                }
            })
            ->with(['floor:id,name', 'user:id,name', 'contentTranslations'])
            ->limit(50)
            ->get()
            ->map(function ($post) {
                $post->type = 'posts';
                $post->title = $post->translatedValue('title');
                $post->content = $post->translatedValue('content');
                $post->tag_display = $post->translatedValue('tag');

                return $post;
            });
    }

    /** Related smartphones (feed shape) matching tags, respecting filters. MUST match PostRepository smartphone object shape exactly. */
    private function relatedSmartphonesByTags(array $tags, bool $images, bool $videos, bool $text)
    {
        return $this->smartphone
            ->where(function ($q) use ($images, $videos, $text) {
                if ($text) {
                    $q->orWhere(fn ($sub) => $sub->whereNull('images')->whereNull('videos'));
                }
                if ($images) {
                    $q->orWhere(fn ($sub) => $sub->whereNotNull('images')->whereNull('videos'));
                }
                if ($videos) {
                    $q->orWhere(fn ($sub) => $sub->whereNotNull('videos'));
                }
            })
            ->whereNotNull('slug')
            ->whereHas('selling_info')
            ->whereIn('tag', $tags)
            ->with(['capacity:id,name', 'selling_info', 'selling_info.shipping_fee', 'floor', 'selling_info.import_tax', 'country:id,name', 'condition:id,name', 'courier_company:id,courier_name', 'return_policy:id,slug', 'shipping_policy:id,slug', 'contentTranslations', 'model_name.contentTranslations'])
            ->withCount(['inventory_items' => fn ($q) => $q->where('status', 'in_stock')])
            ->limit(50)
            ->get()
            ->map(function ($smartphone) {
                return (object) [
                    '_key' => 'sp_'.$smartphone->id,
                    'id' => $smartphone->id,
                    'name' => optional($smartphone->model_name)->translatedValue('name') ?? $smartphone->model_searchable_name,
                    'capacity' => $smartphone->capacity->name,
                    'images' => $smartphone->images,
                    'smartphone_image_urls' => $smartphone->smartphone_image_urls,
                    'videos' => $smartphone->videos,
                    'smartphone_video_urls' => $smartphone->smartphone_video_urls,
                    'location_name' => $smartphone->location_name,
                    'latitude' => $smartphone->latitude,
                    'longitude' => $smartphone->longitude,
                    'colors' => $smartphone->colors,
                    'floor' => $smartphone->floor,
                    'upc' => $smartphone->upc,
                    'selling_info' => $smartphone->selling_info,
                    'country' => $smartphone?->country,
                    'condition' => $smartphone?->condition,
                    'courier_company' => $smartphone?->courier_company,
                    'return_policy' => $smartphone?->return_policy,
                    'shipping_policy' => $smartphone?->shipping_policy,
                    'delivery_days' => $smartphone?->delivery_days,
                    'addons' => $smartphone?->addons,
                    'inventory_items_count' => $smartphone->inventory_items_count,
                    'slug' => $smartphone->slug,
                    'public_id' => $smartphone->public_id,
                    'tag' => $smartphone->tag,
                    'tag_display' => $smartphone->translatedValue('tag'),
                    'is_sold_out' => $smartphone->is_sold_out,
                    'content' => $smartphone->translatedValue('content'),
                    'type' => 'smartphones',
                    'added_at' => $smartphone->added_at,
                    'created_at_time' => $smartphone->created_at_time,
                    'product_details' => $smartphone->translatedValue('product_details'),
                ];
            });
    }

    /**
     * Build the feed-card payload for one property. member_price is intentionally excluded.
     * $includeDetails = true attaches the heavy rooms/rate-plans/amenities/policies arrays for the
     * single-property viewer ONLY — feed cards + related cards pass false to keep the payload lean.
     */
    private function buildLodgingFeedItem(LodgingProduct $product, ?string $currencyCode, bool $includeDetails = false)
    {
        $coverImage = optional($product->media->first())->file_url;

        $media = $product->media
            ->map(fn ($m) => [
                'type' => $m->type,
                'url' => $m->file_url,
                'thumbnail_url' => $m->thumbnail_url,
            ])
            ->values();

        // Parallel arrays mirroring the smartphone feed shape so the gallery
        // (left panel, thumbnails strip, setMediaItems, scroll wheel) works identically.
        $imageUrls = $product->media
            ->where('type', 'image')
            ->pluck('file_url')
            ->filter()
            ->values()
            ->all();

        $videoUrls = $product->media
            ->where('type', 'video')
            ->map(fn ($m) => [
                'url' => $m->file_url,
                'thumbnail_url' => $m->thumbnail_url,
            ])
            ->values()
            ->all();

        $item = [
            '_key' => 'lod_'.$product->id,
            'id' => $product->id,
            'public_id' => $product->public_id,
            'slug' => $product->slug,
            'type' => 'lodging',
            'property_name' => $product->translatedValue('property_name'),
            'property_type' => $product->property_type,
            'location_name' => $product->translatedValue('location_name'),
            'location_description' => $product->translatedValue('location_description'),
            'city_region' => $product->translatedValue('city_region'),
            'latitude' => $product->latitude,
            'longitude' => $product->longitude,
            // tag stays RAW (hashtag/match key); tag_display is the translated label for rendering.
            'tag' => $product->tag,
            'tag_display' => $product->translatedValue('tag'),
            'cover_image_url' => $coverImage,
            'media' => $media,
            'lodging_image_urls' => $imageUrls,
            'lodging_video_urls' => $videoUrls,
            'content' => $product->translatedValue('content'),
            'base_checkin_time' => $product->base_checkin_time,
            'base_checkout_time' => $product->base_checkout_time,
            // floor stays the single ANCHOR floor (spatiotemporal modal + nav). floor_range is the
            // optional displayable "1F - 3F" label when both range endpoints are set, else null.
            'floor' => $product->floor,
            'floor_range' => $this->buildFloorRange($product),
            'from_price' => $product->from_price,
            'lowest_rate' => $this->resolveLowestRate($product),
            'currency_code' => $currencyCode,
            // The whole lodging domain is manual-approval (Stage 2): always show the approval notice.
            'requires_hotel_approval' => true,
            'is_active' => (bool) $product->is_active,
            'is_reservation_closed' => (bool) $product->is_reservation_closed,
            'added_at' => optional($product->created_at)->format('M d, Y'),
            'created_at_time' => optional($product->created_at)->format('g:i A'),
            'related' => [],
        ];

        // Heavy detail arrays for the single-property viewer only (deep-link / in-feed full page).
        // Feed cards + related cards omit these to avoid bloating the cached feed payload.
        if ($includeDetails) {
            $item['rooms'] = $this->buildRoomsForDetail($product);
            $item['amenities'] = $product->amenities
                ->map(fn ($a) => [
                    'id' => $a->id,
                    'name' => $a->name,
                    'icon' => $a->icon,
                ])
                ->values()
                ->all();
            $item['policies'] = $this->buildPoliciesForDetail($product);
        }

        return (object) $item;
    }

    /** Per-room cards with their bookable rate plans (sale_price only — member_price is NEVER exposed). */
    private function buildRoomsForDetail(LodgingProduct $product): array
    {
        return $product->rooms
            ->map(fn ($room) => [
                'id' => $room->id,
                'room_name' => $room->translatedValue('room_name'),
                'room_type' => $room->room_type,
                'standard_guests' => $room->standard_guests,
                'max_guests' => $room->max_guests,
                'bedrooms_count' => $room->bedrooms_count,
                'beds_count' => $room->beds_count,
                'bed_types' => $room->bed_types,
                'bed_size' => $room->translatedValue('bed_size'),
                'bathrooms_count' => $room->bathrooms_count,
                'toilets_count' => $room->toilets_count,
                'is_bathroom_private' => (bool) $room->is_bathroom_private,
                'has_jacuzzi' => (bool) $room->has_jacuzzi,
                'has_bathtub' => (bool) $room->has_bathtub,
                'has_shower_booth' => (bool) $room->has_shower_booth,
                'view_type' => $room->view_type,
                // Custom view text (System-1 translatable); shown verbatim to the customer when
                // view_type === 'other'. translatedValue() applies the English/original fallback.
                'view_type_other' => $room->translatedValue('view_type_other'),
                'room_size' => $room->room_size,
                'room_floor_label' => $room->translatedValue('room_floor_label'),
                'is_smoking_allowed' => (bool) $room->is_smoking_allowed,
                'children_allowed' => (bool) $room->children_allowed,
                'pets_allowed' => (bool) $room->pets_allowed,
                'remaining_room_count' => $room->remaining_room_count,
                'is_available' => (bool) $room->is_available,
                'amenities' => $room->amenities
                    ->map(fn ($amenity) => [
                        'id' => $amenity->id,
                        'name' => $amenity->name,
                        'icon' => $amenity->icon,
                    ])
                    ->values()
                    ->all(),
                'rate_plans' => $room->ratePlans
                    ->map(fn ($rp) => [
                        'id' => $rp->id,
                        'name' => $rp->translatedValue('name'),
                        'stay_type' => $rp->stay_type,
                        'minimum_nights' => $rp->minimum_nights,
                        'maximum_nights' => $rp->maximum_nights,
                        'booking_cutoff_time' => $rp->booking_cutoff_time,
                        'same_day_booking_allowed' => (bool) $rp->same_day_booking_allowed,
                        'original_price' => $rp->original_price,
                        'sale_price' => $rp->sale_price,
                        'discount_rate' => $rp->discount_rate,
                        'crypto_supported' => (bool) $rp->crypto_supported,
                        'payment_methods' => $rp->payment_methods,
                        'is_cancellable' => (bool) $rp->is_cancellable,
                        'is_non_refundable' => (bool) $rp->is_non_refundable,
                        'breakfast_included' => (bool) $rp->breakfast_included,
                        'free_parking_included' => (bool) $rp->free_parking_included,
                        'early_checkin_included' => (bool) $rp->early_checkin_included,
                        'late_checkout_included' => (bool) $rp->late_checkout_included,
                        'consecutive_nights_allowed' => (bool) $rp->consecutive_nights_allowed,
                        'remaining_room_count' => $rp->remaining_room_count,
                        'is_bookable' => (bool) $rp->is_bookable,
                        'is_active' => (bool) $rp->is_active,
                    ])
                    ->values()
                    ->all(),
            ])
            ->values()
            ->all();

    }

    /** Customer-facing subset of the check-in / cancellation / parking policies (null when none set). */
    private function buildPoliciesForDetail(LodgingProduct $product): array
    {
        $checkin = $product->checkinPolicy;
        $cancellation = $product->cancellationPolicy;
        $parking = $product->parkingPolicy;

        $fullPolicies = [
            'checkin' => empty($checkin) ? null : [
                'checkin_time' => $checkin->checkin_time,
                'checkout_time' => $checkin->checkout_time,
                'early_checkin_available' => (bool) $checkin->early_checkin_available,
                'early_checkin_fee' => $checkin->early_checkin_fee,
                // Optional free-text override (translated, English fallback) the customer sees instead
                // of the numeric fee. Display-only — never part of any online calculation.
                'early_checkin_fee_display_text' => $checkin->translatedValue('early_checkin_fee_display_text'),
                'late_checkout_available' => (bool) $checkin->late_checkout_available,
                'late_checkout_fee' => $checkin->late_checkout_fee,
                'late_checkout_fee_display_text' => $checkin->translatedValue('late_checkout_fee_display_text'),
                'checkin_method' => $checkin->checkin_method,
                'front_desk_available' => (bool) $checkin->front_desk_available,
                'self_checkin_available' => (bool) $checkin->self_checkin_available,
                'contactless_checkin_available' => (bool) $checkin->contactless_checkin_available,
                'host_meet_checkin_available' => (bool) $checkin->host_meet_checkin_available,
                'instructions_sent_when' => $checkin->translatedValue('instructions_sent_when'),
                'same_day_booking_notice' => $checkin->translatedValue('same_day_booking_notice'),
                'early_entry_penalty' => $checkin->translatedValue('early_entry_penalty'),
                'late_checkout_penalty' => $checkin->translatedValue('late_checkout_penalty'),
                'id_verification_required' => (bool) $checkin->id_verification_required,
                'minor_policy' => $checkin->translatedValue('minor_policy'),
                'mixed_gender_policy' => $checkin->translatedValue('mixed_gender_policy'),
                'noise_party_restriction' => $checkin->translatedValue('noise_party_restriction'),
                'party_policy' => $checkin->translatedValue('party_policy'),
                'checkin_instruction_message' => $checkin->translatedValue('checkin_instruction_message'),
            ],
            'cancellation' => empty($cancellation) ? null : [
                'policy_name' => $cancellation->policy_name,
                'free_cancellation_deadline' => $cancellation->translatedValue('free_cancellation_deadline'),
                'refund_schedule' => $this->refundScheduleForDetail($cancellation),
                'no_show_policy' => $cancellation->translatedValue('no_show_policy'),
                'rejection_refund_policy' => $cancellation->translatedValue('rejection_refund_policy'),
                'non_refundable_reasons' => $cancellation->translatedValue('non_refundable_reasons'),
                'requires_admin_confirmation' => (bool) $cancellation->requires_admin_confirmation,
                'service_fee' => $cancellation->service_fee,
                'service_fee_online' => (bool) $cancellation->service_fee_online,
                'cleaning_fee' => $cancellation->cleaning_fee,
                'cleaning_fee_online' => (bool) $cancellation->cleaning_fee_online,
                'tax_amount' => $cancellation->tax_amount,
                'tax_online' => (bool) $cancellation->tax_online,
                // On-site fees: the numeric value plus an OPTIONAL free-text override (translated,
                // English fallback) the customer sees instead. Display-only — never online math.
                'extra_guest_fee' => $cancellation->extra_guest_fee,
                'extra_guest_fee_display_text' => $cancellation->translatedValue('extra_guest_fee_display_text'),
                'child_fee' => $cancellation->child_fee,
                'child_fee_display_text' => $cancellation->translatedValue('child_fee_display_text'),
                'pet_fee' => $cancellation->pet_fee,
                'pet_fee_display_text' => $cancellation->translatedValue('pet_fee_display_text'),
                'extension_fee' => $cancellation->extension_fee,
                'extension_fee_display_text' => $cancellation->translatedValue('extension_fee_display_text'),
                'security_deposit' => $cancellation->security_deposit,
                'security_deposit_display_text' => $cancellation->translatedValue('security_deposit_display_text'),
                'onsite_payment_amount' => $cancellation->onsite_payment_amount,
                'onsite_payment_amount_display_text' => $cancellation->translatedValue('onsite_payment_amount_display_text'),
                'damage_fee' => $cancellation->damage_fee,
                'damage_fee_display_text' => $cancellation->translatedValue('damage_fee_display_text'),
                'minibar_incidental_fee' => $cancellation->minibar_incidental_fee,
                'minibar_incidental_fee_display_text' => $cancellation->translatedValue('minibar_incidental_fee_display_text'),
                'onsite_tax' => $cancellation->onsite_tax,
                'onsite_tax_display_text' => $cancellation->translatedValue('onsite_tax_display_text'),
                'damage_policy' => $cancellation->translatedValue('damage_policy'),
            ],
            'parking' => empty($parking) ? null : [
                'parking_available' => (bool) $parking->parking_available,
                'parking_free' => (bool) $parking->parking_free,
                'spaces_per_room' => $parking->spaces_per_room,
                'parking_type' => $parking->parking_type,
                'pre_registration_required' => (bool) $parking->pre_registration_required,
                'parking_availability_time' => $parking->translatedValue('parking_availability_time'),
                'before_checkin_after_checkout' => $parking->translatedValue('before_checkin_after_checkout'),
                'full_lot_policy' => $parking->translatedValue('full_lot_policy'),
                'nearby_parking_available' => (bool) $parking->nearby_parking_available,
                'fee_paid_by_guest' => (bool) $parking->fee_paid_by_guest,
                'vehicle_height_limit' => $parking->vehicle_height_limit,
                'large_vehicle_restrictions' => $parking->translatedValue('large_vehicle_restrictions'),
                'modified_vehicle_restriction' => $parking->translatedValue('modified_vehicle_restriction'),
                'supercar_restriction' => $parking->translatedValue('supercar_restriction'),
                'ev_charging_available' => (bool) $parking->ev_charging_available,
                'refund_if_no_parking' => (bool) $parking->refund_if_no_parking,
                'extra_parking_fee' => $parking->extra_parking_fee,
                // Optional free-text override (translated, English fallback) shown instead of the
                // numeric fee. Display-only — never part of any online calculation.
                'extra_parking_fee_display_text' => $parking->translatedValue('extra_parking_fee_display_text'),
            ],
        ];

        if (! empty($cancellation)) {
            $fullPolicies['online_fees'] = [
                'service_fee' => is_numeric($cancellation->service_fee) ? (float) $cancellation->service_fee : null,
                'service_fee_online' => (bool) $cancellation->service_fee_online,
                'cleaning_fee' => is_numeric($cancellation->cleaning_fee) ? (float) $cancellation->cleaning_fee : null,
                'cleaning_fee_online' => (bool) $cancellation->cleaning_fee_online,
                'tax_amount' => is_numeric($cancellation->tax_amount) ? (float) $cancellation->tax_amount : null,
                'tax_online' => (bool) $cancellation->tax_online,
            ];
        }

        return $fullPolicies;

    }

    /**
     * Stage 3.4.6 — refund_schedule for the customer detail: translated row LABELS with the English
     * base as the source of truth for order, count, and refund_percent (so percents/rows never
     * drift from a stale override). Each label comes from translatedValue('refund_schedule') by
     * index, falling back to the English label; for en this returns the English array unchanged.
     */
    private function refundScheduleForDetail($cancellation): array
    {
        $base = is_array($cancellation->refund_schedule) ? array_values($cancellation->refund_schedule) : [];
        $translated = $cancellation->translatedValue('refund_schedule');
        $translated = is_array($translated) ? array_values($translated) : [];

        return collect($base)->map(function ($row, $i) use ($translated) {
            $row = (array) $row;
            $translatedLabel = $translated[$i]['label'] ?? null;

            return [
                'label' => (is_string($translatedLabel) && trim($translatedLabel) !== '') ? $translatedLabel : ($row['label'] ?? ''),
                'refund_percent' => $row['refund_percent'] ?? null,
            ];
        })->all();
    }

    /**
     * Displayable floor RANGE label (e.g. "1F - 3F") from the optional floor_start_id/floor_end_id
     * endpoints. Returns null when the property has no range configured (single anchor floor only).
     * Reads the eager-loaded floorStart/floorEnd relations — never lazy-loads (no N+1).
     */
    private function buildFloorRange(LodgingProduct $product): ?string
    {
        $start = optional($product->floorStart)->name;
        $end = optional($product->floorEnd)->name;

        if (blank($start) || blank($end)) {
            return null;
        }

        return trim($start).' - '.trim($end);
    }

    /** Lowest effective nightly rate (sale_price) across the property's active bookable rate plans. */
    private function resolveLowestRate(LodgingProduct $product): ?float
    {
        $rates = $product->rooms
            ->flatMap(fn ($room) => $room->ratePlans)
            ->pluck('sale_price')
            ->filter(fn ($price) => is_numeric($price) && (float) $price > 0);

        return $rates->isEmpty() ? null : (float) $rates->min();
    }

    /** Active base currency code (dynamic, never hardcoded) for display next to the rate. */
    private function resolveBaseCurrencyCode(): ?string
    {
        $currency = Cache::get('currency') ?? Currency::where('is_active', true)->first();

        return $currency?->name;
    }

    public function getAllLodgingProducts(Request $request)
    {
        $lodging_products = $this->lodging_product
            ->when(! empty($request->input('search')), function ($query) use ($request) {
                $search = $request->input('search');
                $query->where(function ($subQ) use ($search) {
                    $subQ->where('property_name', 'like', '%'.$search.'%')
                        ->orWhere('city_region', 'like', '%'.$search.'%')
                        ->orWhere('property_type', 'like', '%'.$search.'%')
                        ->orWhere('tag', 'like', '%'.$search.'%');
                });
            })
            ->withCount(['rooms', 'media'])
            ->with(['floor', 'floorStart', 'floorEnd'])
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return $lodging_products;
    }

    public function getSingleLodgingProduct(string $id)
    {
        $lodging_product = $this->lodging_product->with([
            'rooms.ratePlans',
            'rooms.amenities:id,name',
            'amenities:id,name',
            'checkinPolicy',
            'parkingPolicy',
            'cancellationPolicy',
            'media',
            'floor',
            'floorStart:id,name',
            'floorEnd:id,name',
            'assignedDashboardUser:id,name,email',
            // Stage 3.4.2 — per-record content translations for the dashboard editor (admin still
            // authors English in the original columns; these are the per-language overrides).
            'contentTranslations',
            'rooms.contentTranslations',
            'rooms.ratePlans.contentTranslations',
            'checkinPolicy.contentTranslations',
            'parkingPolicy.contentTranslations',
            'cancellationPolicy.contentTranslations',
        ])->find($id);

        if (! empty($lodging_product)) {
            $lodging_product->amenity_ids = ! blank($lodging_product->amenities)
                ? $lodging_product->amenities->pluck('id')->toArray()
                : [];

            // Attach grouped translations as a plain `translations` attribute on each record so the
            // form's pickKeys/mergePolicy round-trips them (mirrors how amenity_ids is attached).
            $lodging_product->translations = $this->groupRecordTranslations($lodging_product);

            $lodging_product->rooms->each(function ($room) {
                $room->amenity_ids = ! blank($room->amenities)
                    ? $room->amenities->pluck('id')->toArray()
                    : [];

                $room->translations = $this->groupRecordTranslations($room);

                $room->ratePlans->each(function ($ratePlan) {
                    $ratePlan->translations = $this->groupRecordTranslations($ratePlan);
                });
            });

            foreach (['checkinPolicy', 'parkingPolicy', 'cancellationPolicy'] as $policyRelation) {
                if ($lodging_product->{$policyRelation}) {
                    $lodging_product->{$policyRelation}->translations = $this->groupRecordTranslations($lodging_product->{$policyRelation});
                }
            }
        }

        return $lodging_product;
    }

    /**
     * Group a model's eager-loaded contentTranslations into the form/repeater shape
     * [{language_id:int, fields:{field:value}}] and drop the raw relation so it isn't shipped twice.
     */
    private function groupRecordTranslations($model): array
    {
        if (empty($model) || ! $model->relationLoaded('contentTranslations')) {
            return [];
        }

        // Array-cast translatable fields (e.g. cancellation refund_schedule) are stored as a JSON
        // string by ContentTranslationService; decode them back to arrays so the dashboard form
        // pre-fills correctly (mirrors how SmartphoneController decodes product_details on edit).
        $casts = method_exists($model, 'getCasts') ? $model->getCasts() : [];
        $arrayFields = array_keys(array_filter(
            $casts,
            fn ($cast) => in_array($cast, ['array', 'json', 'object', 'collection'], true)
        ));

        $grouped = $model->contentTranslations
            ->groupBy('language_id')
            ->map(function ($rows, $languageId) use ($arrayFields) {
                $fields = [];
                foreach ($rows as $row) {
                    if (in_array($row->field, $arrayFields, true)) {
                        $decoded = json_decode($row->value, true);
                        $fields[$row->field] = is_array($decoded) ? $decoded : [];
                    } else {
                        $fields[$row->field] = $row->value;
                    }
                }

                return ['language_id' => (int) $languageId, 'fields' => $fields];
            })
            ->values()
            ->toArray();

        $model->unsetRelation('contentTranslations');

        return $grouped;
    }

    public function getCreateFormData()
    {
        return [
            'from_floors' => $this->floor->orderBy('id', 'asc')->get(['id', 'name']),
            'to_floors' => $this->floor->orderBy('id', 'desc')->get(['id', 'name']),
            'amenities' => $this->lodging_amenity->where('is_active', true)->orderBy('name')->get(['id', 'name', 'icon', 'category']),
            'dashboard_users' => $this->user->where('status', 'active')->orderBy('name')->get(['id', 'name', 'email']),
            // Stage 3.4.2 — non-default languages for the dashboard TranslationsRepeater (English is
            // the original column, never a translation target). Passed to BOTH create() and edit().
            'languages' => Language::where('code', '!=', config('app.fallback_locale', 'en'))->orderBy('name')->get(['id', 'name', 'code']),
            'enums' => [
                'property_type' => self::PROPERTY_TYPES,
                'room_type' => self::ROOM_TYPES,
                'view_type' => self::VIEW_TYPES,
                'bed_types' => self::BED_TYPES,
                'checkin_method' => self::CHECKIN_METHODS,
                'parking_type' => self::PARKING_TYPES,
                'policy_name' => self::CANCELLATION_POLICY_NAMES,
                'evidence_role' => self::EVIDENCE_ROLES,
                'payment_methods' => self::PAYMENT_METHODS,
                'stay_type' => self::STAY_TYPES,
            ],
        ];
    }

    public function storeLodgingProduct(Request $request)
    {
        $validated = $request->validate($this->rules(false), $this->validationMessages());

        $this->validateMediaFiles($request, false);

        // Stage 3.4.2 — validate the per-record translation arrays separately (keeps them out of
        // mass-assignment). Surfaced under `translation_error`, mirroring Posts/Smartphones.
        $translationsValidator = Validator::make($request->all(), $this->translationRules());
        if ($translationsValidator->fails()) {
            throw ValidationException::withMessages([
                'translation_error' => $translationsValidator->errors()->first(),
            ]);
        }

        try {
            $product = DB::transaction(function () use ($request, $validated) {
                $productData = collect($validated)->except([
                    'amenity_ids', 'rooms', 'checkin_policy', 'parking_policy', 'cancellation_policy', 'created_at',
                ])->toArray();

                $productData = $this->normalizeProductData($productData);

                $product = $this->lodging_product->create($productData);
                if (empty($product)) {
                    throw new Exception('Something Went Wrong While Creating Lodging Product');
                }

                // Optional custom created_at (mirrors Posts/Smartphones). Only when provided.
                if ($request->filled('created_at')) {
                    $product->created_at = $request->date('created_at');
                    $product->save();
                }

                if ($request->has('amenity_ids')) {
                    $product->amenities()->sync($request->array('amenity_ids'));
                }

                // Stage 3.4.2 — product per-language overrides (idempotent; no-op when none sent).
                $this->contentTranslationService->syncTranslations($product, (array) $request->input('translations', []));

                foreach ($request->input('rooms', []) as $roomInput) {
                    $roomData = collect($roomInput)
                        ->except(['id', 'amenity_ids', 'rate_plans', 'lodging_product_id', 'translations'])
                        ->toArray();

                    $room = $product->rooms()->create($roomData);

                    if (array_key_exists('amenity_ids', $roomInput)) {
                        $room->amenities()->sync($roomInput['amenity_ids'] ?? []);
                    }

                    $this->contentTranslationService->syncTranslations($room, (array) ($roomInput['translations'] ?? []));

                    foreach ($roomInput['rate_plans'] ?? [] as $ratePlanInput) {
                        $ratePlanData = collect($ratePlanInput)
                            ->except(['id', 'lodging_room_id', 'translations'])
                            ->toArray();

                        $ratePlan = $room->ratePlans()->create($ratePlanData);
                        $this->contentTranslationService->syncTranslations($ratePlan, (array) ($ratePlanInput['translations'] ?? []));
                    }
                }

                if ($request->filled('checkin_policy')) {
                    $checkinPolicy = $product->checkinPolicy()->create($this->policyData($request->input('checkin_policy')));
                    $this->contentTranslationService->syncTranslations($checkinPolicy, (array) $request->input('checkin_policy.translations', []));
                }

                if ($request->filled('parking_policy')) {
                    $parkingPolicy = $product->parkingPolicy()->create($this->policyData($request->input('parking_policy')));
                    $this->contentTranslationService->syncTranslations($parkingPolicy, (array) $request->input('parking_policy.translations', []));
                }

                if ($request->filled('cancellation_policy')) {
                    $cancellationPolicy = $product->cancellationPolicy()->create($this->policyData($request->input('cancellation_policy')));
                    $this->contentTranslationService->syncTranslations($cancellationPolicy, (array) $request->input('cancellation_policy.translations', []));
                }

                return $product;
            });

            // Media is handled after commit so queued jobs never reference rolled-back rows.
            $hasMedia = $this->handleMediaUploads($request, $product);

            $message = 'Lodging Product Created Successfully';
            if ($hasMedia) {
                $message .= ' Please Wait While We Upload Your Files On Server';
            }

            return [
                'status' => true,
                'message' => $message,
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function updateLodgingProduct(Request $request, string $id)
    {
        $validated = $request->validate($this->rules(true), $this->validationMessages());

        $this->validateMediaFiles($request, true);

        // Stage 3.4.2 — validate the per-record translation arrays separately (keeps them out of
        // mass-assignment). Surfaced under `translation_error`, mirroring Posts/Smartphones.
        $translationsValidator = Validator::make($request->all(), $this->translationRules());
        if ($translationsValidator->fails()) {
            throw ValidationException::withMessages([
                'translation_error' => $translationsValidator->errors()->first(),
            ]);
        }

        try {
            $product = $this->lodging_product->find($id);
            if (empty($product)) {
                throw new Exception('Lodging Product Not Found');
            }

            $deletedMediaPaths = collect();

            DB::transaction(function () use ($request, $validated, $product, &$deletedMediaPaths) {
                $productData = collect($validated)->except([
                    'amenity_ids', 'rooms', 'checkin_policy', 'parking_policy', 'cancellation_policy', 'deleted_media_ids', 'existing_image_order', 'created_at',
                ])->toArray();

                $productData = $this->normalizeProductData($productData);

                $updated = $product->update($productData);
                if (! $updated) {
                    throw new Exception('Something Went Wrong While Updating Lodging Product');
                }

                // Optional custom created_at (mirrors Posts/Smartphones). Only when provided.
                if ($request->filled('created_at')) {
                    $product->created_at = $request->date('created_at');
                    $product->save();
                }

                if ($request->has('amenity_ids')) {
                    $product->amenities()->sync($request->array('amenity_ids'));
                }

                // Stage 3.4.2 — product per-language overrides (idempotent; no-op when none sent).
                $this->contentTranslationService->syncTranslations($product, (array) $request->input('translations', []));

                // Sync rooms: update existing (by id, scoped to this product), create new, delete removed.
                $submittedRoomIds = [];
                foreach ($request->input('rooms', []) as $roomInput) {
                    $roomId = $roomInput['id'] ?? null;
                    $roomData = collect($roomInput)
                        ->except(['id', 'amenity_ids', 'rate_plans', 'lodging_product_id', 'translations'])
                        ->toArray();

                    if ($roomId) {
                        $room = $product->rooms()->where('id', $roomId)->first();
                        if (empty($room)) {
                            throw new Exception('A room you tried to update no longer exists');
                        }
                        $room->update($roomData);
                    } else {
                        $room = $product->rooms()->create($roomData);
                    }

                    $submittedRoomIds[] = $room->id;

                    if (array_key_exists('amenity_ids', $roomInput)) {
                        $room->amenities()->sync($roomInput['amenity_ids'] ?? []);
                    }

                    $this->contentTranslationService->syncTranslations($room, (array) ($roomInput['translations'] ?? []));

                    $submittedRatePlanIds = [];
                    foreach ($roomInput['rate_plans'] ?? [] as $ratePlanInput) {
                        $ratePlanId = $ratePlanInput['id'] ?? null;
                        $ratePlanData = collect($ratePlanInput)
                            ->except(['id', 'lodging_room_id', 'translations'])
                            ->toArray();

                        if ($ratePlanId) {
                            $ratePlan = $room->ratePlans()->where('id', $ratePlanId)->first();
                            if (empty($ratePlan)) {
                                throw new Exception('A rate plan you tried to update no longer exists');
                            }
                            $ratePlan->update($ratePlanData);
                        } else {
                            $ratePlan = $room->ratePlans()->create($ratePlanData);
                        }

                        $submittedRatePlanIds[] = $ratePlan->id;
                        $this->contentTranslationService->syncTranslations($ratePlan, (array) ($ratePlanInput['translations'] ?? []));
                    }

                    // Stage 3.4.1 — clear orphaned content_translations for rate plans being
                    // hard-deleted here (none exist yet; later stages write them). Polymorphic
                    // rows are not FK-constrained, so they must be removed explicitly.
                    $removedRatePlanIds = $room->ratePlans()->whereNotIn('id', $submittedRatePlanIds)->pluck('id')->all();
                    if (! empty($removedRatePlanIds)) {
                        ContentTranslation::where('translatable_type', LodgingRatePlan::class)
                            ->whereIn('translatable_id', $removedRatePlanIds)
                            ->delete();
                    }

                    $room->ratePlans()->whereNotIn('id', $submittedRatePlanIds)->delete();
                }

                // Stage 3.4.1 — clear orphaned content_translations for rooms being hard-deleted,
                // plus the rate plans the DB cascade-deletes with those rooms (those rate plans are
                // never visited by the loop above, so their translation rows must be cleared here).
                $removedRoomIds = $product->rooms()->whereNotIn('id', $submittedRoomIds)->pluck('id')->all();
                if (! empty($removedRoomIds)) {
                    $cascadedRatePlanIds = LodgingRatePlan::whereIn('lodging_room_id', $removedRoomIds)->pluck('id')->all();
                    if (! empty($cascadedRatePlanIds)) {
                        ContentTranslation::where('translatable_type', LodgingRatePlan::class)
                            ->whereIn('translatable_id', $cascadedRatePlanIds)
                            ->delete();
                    }

                    ContentTranslation::where('translatable_type', LodgingRoom::class)
                        ->whereIn('translatable_id', $removedRoomIds)
                        ->delete();
                }

                $product->rooms()->whereNotIn('id', $submittedRoomIds)->delete();

                // Policies (1:1) — update existing or create. Additive on omit: a missing section
                // is left untouched (clearing semantics are deferred to the Prompt 3b form phase).
                if ($request->filled('checkin_policy')) {
                    $checkinPolicy = $product->checkinPolicy()->updateOrCreate([], $this->policyData($request->input('checkin_policy')));
                    $this->contentTranslationService->syncTranslations($checkinPolicy, (array) $request->input('checkin_policy.translations', []));
                }

                if ($request->filled('parking_policy')) {
                    $parkingPolicy = $product->parkingPolicy()->updateOrCreate([], $this->policyData($request->input('parking_policy')));
                    $this->contentTranslationService->syncTranslations($parkingPolicy, (array) $request->input('parking_policy.translations', []));
                }

                if ($request->filled('cancellation_policy')) {
                    $cancellationPolicy = $product->cancellationPolicy()->updateOrCreate([], $this->policyData($request->input('cancellation_policy')));
                    $this->contentTranslationService->syncTranslations($cancellationPolicy, (array) $request->input('cancellation_policy.translations', []));
                }

                // Collect removed-media S3 paths, delete the rows in-transaction; the S3 destroy
                // jobs are dispatched only AFTER commit so a rollback can never orphan files.
                if ($request->filled('deleted_media_ids')) {
                    $deletedIds = $request->array('deleted_media_ids');
                    $deletedMediaPaths = $product->media()->whereIn('id', $deletedIds)->get(['file_path', 'thumbnail_url']);
                    $product->media()->whereIn('id', $deletedIds)->delete();
                }

                // Re-sequence kept images by the submitted order (first image = main image).
                // IDOR-safe: every row is resolved through the product relation, so a foreign/stale
                // id is ignored and lodging_product_id is never reassigned.
                $imageOrder = $request->input('existing_image_order', []);
                if (is_array($imageOrder) && ! blank($imageOrder)) {
                    $position = 1;
                    foreach ($imageOrder as $mediaId) {
                        $media = $product->media()->where('id', $mediaId)->where('type', 'image')->first();
                        if (! empty($media)) {
                            $media->update(['sort_order' => $position]);
                            $position++;
                        }
                    }
                }
            });

            // After commit: fire S3 deletions for removed media, then upload any new media.
            foreach ($deletedMediaPaths as $media) {
                dispatch(new LodgingMediaDestroyOnAWS($media->file_path, $media->thumbnail_url));
            }

            $hasMedia = $this->handleMediaUploads($request, $product, 'new_images', 'new_videos');

            $message = 'Lodging Product Updated Successfully';
            if ($hasMedia) {
                $message .= ' Please Wait While We Upload Your Files On Server';
            }

            return [
                'status' => true,
                'message' => $message,
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function destroyLodgingProduct(string $id)
    {
        try {
            $product = $this->lodging_product->with('media')->find($id);
            if (empty($product)) {
                throw new Exception('Lodging Product Not Found');
            }

            foreach ($product->media as $media) {
                dispatch(new LodgingMediaDestroyOnAWS($media->file_path, $media->thumbnail_url));
            }

            // FK cascadeOnDelete removes rooms, rate plans, policies, media rows and pivots.
            $deleted = $product->delete();
            if (! $deleted) {
                throw new Exception('Something Went Wrong While Deleting Lodging Product');
            }

            return [
                'status' => true,
                'message' => 'Lodging Product Deleted Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function destroyLodgingProductBySelection(Request $request)
    {
        try {
            $ids = $request->array('ids');
            if (blank($ids)) {
                throw new Exception('Please Select Atleast One Lodging Product');
            }

            $products = $this->lodging_product->whereIn('id', $ids)->get();
            if ($products->isEmpty()) {
                throw new Exception('Given Lodging Product Ids Are incorrect');
            }

            foreach ($products as $product) {
                $response = $this->destroyLodgingProduct($product->id);
                if ($response['status'] === false) {
                    throw new Exception($response['message']);
                }
            }

            return [
                'status' => true,
                'message' => 'Lodging Products Deleted Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function getGoogleMapSettings()
    {
        return Cache::get('google_map_setting');
    }

    public function autoCompleteLocations(Request $request)
    {
        try {
            $response = $this->googleGeoCoderService->autoCompleteLocations($request);
            if ($response['status'] === false) {
                throw new Exception($response['message']);
            }

            return [
                'status' => true,
                'data' => $response['data'],
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function placeDetails(string $placeId)
    {
        try {
            $response = $this->googleGeoCoderService->placeDetails($placeId);
            if ($response['status'] === false) {
                throw new Exception($response['message']);
            }

            return [
                'status' => true,
                'data' => [
                    'lat' => $response['data']['lat'],
                    'lng' => $response['data']['lng'],
                    'place_name' => $response['data']['place_name'],
                    'formatted_address' => $response['data']['formatted_address'],
                ],
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    // ---------------------------------------------------------------------
    // Helpers
    // ---------------------------------------------------------------------

    private function normalizeProductData(array $productData): array
    {
        if (! empty($productData['tag']) && ! str_starts_with($productData['tag'], '#')) {
            $productData['tag'] = '#'.$productData['tag'];
        }

        // Spatiotemporal anchor is server-owned. The "Floor (anchor)" input was removed from the
        // operator form (they only fill Floor Range Start + End), so the anchor floor_id is derived
        // here from the range start whenever a start is provided. This keeps floor_id populated for
        // the feed up/down navigation, the spatiotemporal info modal, the geo-search non-null gate,
        // and the single-floor whereBetween branch — all of which read floor_id unchanged. When no
        // range start is provided, floor_id is left as submitted (create: null; edit: the existing
        // legacy anchor round-trips and is preserved — never wiped).
        if (! empty($productData['floor_start_id'])) {
            $productData['floor_id'] = $productData['floor_start_id'];
        }

        // Resolve a human location name from lat/lng when none was provided (mirror smartphone).
        if (empty($productData['location_name']) && ! empty($productData['latitude']) && ! empty($productData['longitude'])) {
            $response = $this->googleGeoCoderService->getLocationNameFromLatLng($productData['latitude'], $productData['longitude']);
            if ($response['status'] === false) {
                throw new Exception($response['message']);
            }

            $productData['location_name'] = $response['place_name'] ?? 'No Location Name Found';
        }

        return $productData;
    }

    private function policyData($data): array
    {
        // Strip id + ownership FK so they can never be mass-assigned; the hasOne relation
        // sets lodging_product_id itself on create and must not change it on update.
        // `translations` is handled separately via syncTranslations (never mass-assigned).
        return collect($data ?? [])->except(['id', 'lodging_product_id', 'translations'])->toArray();
    }

    /**
     * Stage 3.4.2 — loose validation for the optional per-record translation arrays. Kept OUT of
     * rules() so the `translations` keys never enter mass-assignment under strict models. An empty
     * language_id (a block with no language picked yet) is allowed and ignored by syncTranslations.
     */
    private function translationRules(): array
    {
        $languageIdRule = [
            'nullable',
            function ($attribute, $value, $fail) {
                if ($value === '' || $value === null) {
                    return;
                }
                if (! Language::whereKey($value)->exists()) {
                    $fail('The selected translation language is invalid.');
                }
            },
        ];

        $paths = [
            'translations',
            'rooms.*.translations',
            'rooms.*.rate_plans.*.translations',
            'checkin_policy.translations',
            'parking_policy.translations',
            'cancellation_policy.translations',
        ];

        $rules = [];
        foreach ($paths as $path) {
            $rules[$path] = ['sometimes', 'array'];
            $rules[$path.'.*.language_id'] = $languageIdRule;
            $rules[$path.'.*.fields'] = ['sometimes', 'array'];
        }

        return $rules;
    }

    private function handleMediaUploads(Request $request, LodgingProduct $product, string $imageKey = 'images', string $videoKey = 'videos'): bool
    {
        $hasMedia = false;
        $sortBase = (int) $product->media()->max('sort_order');

        if ($request->hasFile($imageKey)) {
            foreach ($request->file($imageKey) as $index => $image) {
                $newName = time().uniqid().'-'.Str::random(10).'.webp';

                $resizedImage = ImageManager::imagick()
                    ->read($image)
                    ->scaleDown(1800)
                    ->encode(new WebpEncoder(quality: 70));

                $tempPath = 'temp/uploads/'.$newName;
                Storage::disk('local')->put($tempPath, (string) $resizedImage);

                // sort_order follows upload order; the first image is the main image.
                $media = $product->media()->create([
                    'type' => 'image',
                    'upload_status' => 'pending',
                    'sort_order' => $sortBase + $index + 1,
                ]);

                dispatch(new LodgingMediaStoreOnAWS($tempPath, $media, self::IMAGES_DIR));
                $hasMedia = true;
            }
        }

        if ($request->hasFile($videoKey)) {
            foreach ($request->file($videoKey) as $index => $video) {
                $originalName = time().uniqid().'-'.Str::random(8).'.'.$video->getClientOriginalExtension();
                $tempPath = $video->storeAs('temp/uploads', $originalName, 'local');

                $media = $product->media()->create([
                    'type' => 'video',
                    'upload_status' => 'pending',
                    'sort_order' => $sortBase + 1000 + $index + 1,
                ]);

                dispatch(new CompressLodgingMediaVideoWithFFMPEG($tempPath, $media, self::VIDEOS_DIR))->onQueue('video');
                $hasMedia = true;
            }
        }

        return $hasMedia;
    }

    private function validateMediaFiles(Request $request, bool $isUpdate): void
    {
        $imageKey = $isUpdate ? 'new_images' : 'images';
        $videoKey = $isUpdate ? 'new_videos' : 'videos';

        $validator = Validator::make($request->allFiles(), [
            $imageKey.'.*' => ['mimes:jpg,jpeg,png,webp', 'max:10240'],
            $videoKey.'.*' => ['mimes:mp4,mov,avi,webp,webm', 'max:1048576'],
        ], [
            $imageKey.'.*.mimes' => 'Only JPG, JPEG, PNG, WEBP images are allowed.',
            $imageKey.'.*.max' => 'Each image must not exceed 10MB.',
            $videoKey.'.*.mimes' => 'Only MP4, MOV, WEBP, WEBM and AVI videos are allowed.',
            $videoKey.'.*.max' => 'Each video must not exceed 1GB.',
        ], [
            $imageKey.'.*' => 'image',
            $videoKey.'.*' => 'video',
        ]);

        if ($validator->fails()) {
            throw ValidationException::withMessages([
                ...(str_contains($validator->errors()->keys()[0] ?? '', 'image')
                    ? ['file_error' => $validator->errors()->first()]
                    : ['video_error' => $validator->errors()->first()]),
            ]);
        }
    }

    private function validationMessages(): array
    {
        return [
            'rooms.required' => 'At least one room is required.',
            'rooms.min' => 'At least one room is required.',
            'rooms.*.rate_plans.required' => 'Each room must have at least one rate plan.',
            'rooms.*.rate_plans.min' => 'Each room must have at least one rate plan.',
        ];
    }

    private function rules(bool $isUpdate): array
    {
        $rules = [
            'property_name' => ['required', 'string', 'max:255'],
            'property_type' => ['required', Rule::in(self::PROPERTY_TYPES)],
            'city_region' => ['nullable', 'string', 'max:255'],
            'location_description' => ['nullable', 'string'],
            'latitude' => ['nullable', 'numeric'],
            'longitude' => ['nullable', 'numeric'],
            'location_name' => ['nullable', 'string'],
            'floor_id' => ['nullable', 'exists:floors,id'],
            // Optional floor RANGE (anchor floor_id is kept untouched). Both-or-neither, and the end
            // must be >= the start by floor id — the same ordering basis the floor search uses
            // (whereBetween on floor_id). Empty selects arrive as null (ConvertEmptyStringsToNull),
            // so required_with only fires when the sibling is actually chosen.
            'floor_start_id' => ['nullable', 'exists:floors,id', 'required_with:floor_end_id'],
            'floor_end_id' => ['nullable', 'exists:floors,id', function ($attribute, $value, $fail) {
                $start = request()->input('floor_start_id');
                if ($value !== null && $value !== '' && $start !== null && $start !== '' && (int) $value < (int) $start) {
                    $fail('The floor range end must be the same as or above the floor range start.');
                }
            }],
            'tag' => ['nullable', 'string', 'max:30'],
            'content' => ['nullable', 'string'],
            'base_checkin_time' => ['nullable', 'string', 'max:50'],
            'base_checkout_time' => ['nullable', 'string', 'max:50'],
            'from_price' => ['nullable', 'numeric', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
            'is_reservation_closed' => ['nullable', 'boolean'],
            'created_at' => ['nullable', 'date'],

            'amenity_ids' => ['nullable', 'array'],
            'amenity_ids.*' => ['exists:lodging_amenities,id'],

            'rooms' => ['required', 'array', 'min:1'],
            'rooms.*.room_name' => ['required', 'string', 'max:255'],
            'rooms.*.room_type' => ['required', Rule::in(self::ROOM_TYPES)],
            // standard_guests is the mandatory base capacity: the DB column is NOT NULL, so the
            // validation is REQUIRED to agree with it (a blank value must fail here with a clear
            // field error rather than become null and crash the save). max_guests stays optional
            // (null = no cap, mirroring rate-plan maximum_nights).
            'rooms.*.standard_guests' => ['required', 'integer', 'min:1'],
            'rooms.*.max_guests' => ['nullable', 'integer', 'min:1', function ($attribute, $value, $fail) {
                // max_guests >= standard_guests when both are present (same room / index) — mirrors
                // the maximum_nights >= minimum_nights closure below.
                $standard = data_get(request()->all(), str_replace('max_guests', 'standard_guests', $attribute));
                if ($value !== null && $value !== '' && $standard !== null && $standard !== '' && (int) $value < (int) $standard) {
                    $fail('The max guests must be greater than or equal to the standard guests.');
                }
            }],
            'rooms.*.bedrooms_count' => ['nullable', 'integer', 'min:0'],
            'rooms.*.beds_count' => ['nullable', 'integer', 'min:0'],
            'rooms.*.bed_types' => ['nullable', 'array'],
            'rooms.*.bed_types.*' => [Rule::in(self::BED_TYPES)],
            'rooms.*.bed_size' => ['nullable', 'string', 'max:100'],
            'rooms.*.bathrooms_count' => ['nullable', 'integer', 'min:0'],
            'rooms.*.toilets_count' => ['nullable', 'integer', 'min:0'],
            'rooms.*.is_bathroom_private' => ['nullable', 'boolean'],
            'rooms.*.has_jacuzzi' => ['nullable', 'boolean'],
            'rooms.*.has_bathtub' => ['nullable', 'boolean'],
            'rooms.*.has_shower_booth' => ['nullable', 'boolean'],
            'rooms.*.view_type' => ['nullable', Rule::in(self::VIEW_TYPES)],
            'rooms.*.view_type_other' => ['nullable', 'string', 'max:255', function ($attribute, $value, $fail) {
                // required_if equivalent (same room / index): when view_type is 'other' a custom view
                // text is required; otherwise it is ignored. Mirrors the max_guests/maximum_nights
                // closures above (the codebase resolves sibling fields by str_replace on $attribute,
                // not a wildcard required_if).
                $viewType = data_get(request()->all(), str_replace('view_type_other', 'view_type', $attribute));
                if ($viewType === 'other' && ($value === null || trim((string) $value) === '')) {
                    $fail('Please enter a custom view type when View Type is set to Other.');
                }
            }],
            'rooms.*.room_size' => ['nullable', 'string', 'max:100'],
            'rooms.*.room_floor_label' => ['nullable', 'string', 'max:100'],
            'rooms.*.is_smoking_allowed' => ['nullable', 'boolean'],
            'rooms.*.children_allowed' => ['nullable', 'boolean'],
            'rooms.*.pets_allowed' => ['nullable', 'boolean'],
            'rooms.*.is_random_assignment' => ['nullable', 'boolean'],
            'rooms.*.remaining_room_count' => ['nullable', 'integer', 'min:0'],
            'rooms.*.is_available' => ['nullable', 'boolean'],
            'rooms.*.external_room_id' => ['nullable', 'string', 'max:255'],

            'rooms.*.amenity_ids' => ['nullable', 'array'],
            'rooms.*.amenity_ids.*' => ['exists:lodging_amenities,id'],

            'rooms.*.rate_plans' => ['required', 'array', 'min:1'],
            'rooms.*.rate_plans.*.name' => ['required', 'string', 'max:255'],
            'rooms.*.rate_plans.*.original_price' => ['nullable', 'numeric', 'min:0'],
            'rooms.*.rate_plans.*.sale_price' => ['required', 'numeric', 'min:0'],
            'rooms.*.rate_plans.*.discount_rate' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'rooms.*.rate_plans.*.member_price' => ['nullable', 'numeric', 'min:0'],
            'rooms.*.rate_plans.*.crypto_supported' => ['nullable', 'boolean'],
            'rooms.*.rate_plans.*.payment_methods' => ['nullable', 'array'],
            'rooms.*.rate_plans.*.payment_methods.*' => [Rule::in(self::PAYMENT_METHODS)],
            'rooms.*.rate_plans.*.is_cancellable' => ['nullable', 'boolean'],
            'rooms.*.rate_plans.*.is_non_refundable' => ['nullable', 'boolean'],
            'rooms.*.rate_plans.*.breakfast_included' => ['nullable', 'boolean'],
            'rooms.*.rate_plans.*.free_parking_included' => ['nullable', 'boolean'],
            'rooms.*.rate_plans.*.early_checkin_included' => ['nullable', 'boolean'],
            'rooms.*.rate_plans.*.late_checkout_included' => ['nullable', 'boolean'],
            'rooms.*.rate_plans.*.consecutive_nights_allowed' => ['nullable', 'boolean', function ($attribute, $value, $fail) {
                // Cross-field config guard (same rate plan / index), mirroring the maximum_nights >=
                // minimum_nights closure below. When consecutive nights are DISABLED for a plan it is
                // single-night-only, so both minimum_nights and maximum_nights must be 1 or left empty.
                // An unset/true flag is unconstrained (the normal min/max rules apply).
                $disabled = $value !== null && $value !== '' && ! filter_var($value, FILTER_VALIDATE_BOOLEAN);
                if (! $disabled) {
                    return;
                }
                $all = request()->all();
                $min = data_get($all, str_replace('consecutive_nights_allowed', 'minimum_nights', $attribute));
                $max = data_get($all, str_replace('consecutive_nights_allowed', 'maximum_nights', $attribute));
                $minInvalid = $min !== null && $min !== '' && (int) $min !== 1;
                $maxInvalid = $max !== null && $max !== '' && (int) $max !== 1;
                if ($minInvalid || $maxInvalid) {
                    $fail('When consecutive nights are disabled, minimum and maximum nights must be 1 or left empty.');
                }
            }],
            'rooms.*.rate_plans.*.remaining_room_count' => ['nullable', 'integer', 'min:0'],
            'rooms.*.rate_plans.*.is_bookable' => ['nullable', 'boolean'],
            'rooms.*.rate_plans.*.is_active' => ['nullable', 'boolean'],
            'rooms.*.rate_plans.*.stay_type' => ['nullable', Rule::in(self::STAY_TYPES)],
            'rooms.*.rate_plans.*.minimum_nights' => ['nullable', 'integer', 'min:0'],
            'rooms.*.rate_plans.*.maximum_nights' => ['nullable', 'integer', 'min:0', function ($attribute, $value, $fail) {
                // maximum_nights >= minimum_nights when both are present (same rate plan / index).
                $min = data_get(request()->all(), str_replace('maximum_nights', 'minimum_nights', $attribute));
                if ($value !== null && $value !== '' && $min !== null && $min !== '' && (int) $value < (int) $min) {
                    $fail('The maximum nights must be greater than or equal to the minimum nights.');
                }
            }],
            'rooms.*.rate_plans.*.booking_cutoff_time' => ['nullable', 'string', 'max:50'],
            'rooms.*.rate_plans.*.same_day_booking_allowed' => ['nullable', 'boolean'],
            'rooms.*.rate_plans.*.external_rate_plan_id' => ['nullable', 'string', 'max:255'],

            'checkin_policy' => ['nullable', 'array'],
            'checkin_policy.checkin_time' => ['nullable', 'string', 'max:50'],
            'checkin_policy.checkout_time' => ['nullable', 'string', 'max:50'],
            'checkin_policy.early_checkin_available' => ['nullable', 'boolean'],
            'checkin_policy.early_checkin_fee' => ['nullable', 'numeric', 'min:0'],
            // Optional free-text override for the on-site fee (display-only; never online math).
            'checkin_policy.early_checkin_fee_display_text' => ['nullable', 'string', 'max:255'],
            'checkin_policy.late_checkout_available' => ['nullable', 'boolean'],
            'checkin_policy.late_checkout_fee' => ['nullable', 'numeric', 'min:0'],
            'checkin_policy.late_checkout_fee_display_text' => ['nullable', 'string', 'max:255'],
            'checkin_policy.checkin_method' => ['nullable', Rule::in(self::CHECKIN_METHODS)],
            'checkin_policy.front_desk_available' => ['nullable', 'boolean'],
            'checkin_policy.self_checkin_available' => ['nullable', 'boolean'],
            'checkin_policy.contactless_checkin_available' => ['nullable', 'boolean'],
            'checkin_policy.host_meet_checkin_available' => ['nullable', 'boolean'],
            'checkin_policy.instructions_sent_when' => ['nullable', 'string', 'max:255'],
            'checkin_policy.same_day_booking_notice' => ['nullable', 'string'],
            'checkin_policy.early_entry_penalty' => ['nullable', 'string'],
            'checkin_policy.late_checkout_penalty' => ['nullable', 'string'],
            'checkin_policy.id_verification_required' => ['nullable', 'boolean'],
            'checkin_policy.minor_policy' => ['nullable', 'string'],
            'checkin_policy.mixed_gender_policy' => ['nullable', 'string'],
            'checkin_policy.noise_party_restriction' => ['nullable', 'string'],
            'checkin_policy.party_policy' => ['nullable', 'string'],
            'checkin_policy.checkin_instruction_message' => ['nullable', 'string'],

            'parking_policy' => ['nullable', 'array'],
            'parking_policy.parking_available' => ['nullable', 'boolean'],
            'parking_policy.parking_free' => ['nullable', 'boolean'],
            'parking_policy.spaces_per_room' => ['nullable', 'integer', 'min:0'],
            'parking_policy.parking_type' => ['nullable', Rule::in(self::PARKING_TYPES)],
            'parking_policy.pre_registration_required' => ['nullable', 'boolean'],
            'parking_policy.parking_availability_time' => ['nullable', 'string', 'max:100'],
            'parking_policy.before_checkin_after_checkout' => ['nullable', 'string'],
            'parking_policy.full_lot_policy' => ['nullable', 'string'],
            'parking_policy.nearby_parking_available' => ['nullable', 'boolean'],
            'parking_policy.fee_paid_by_guest' => ['nullable', 'boolean'],
            'parking_policy.vehicle_height_limit' => ['nullable', 'string', 'max:100'],
            'parking_policy.large_vehicle_restrictions' => ['nullable', 'string'],
            'parking_policy.modified_vehicle_restriction' => ['nullable', 'string'],
            'parking_policy.supercar_restriction' => ['nullable', 'string'],
            'parking_policy.ev_charging_available' => ['nullable', 'boolean'],
            'parking_policy.refund_if_no_parking' => ['nullable', 'boolean'],
            'parking_policy.extra_parking_fee' => ['nullable', 'numeric', 'min:0'],
            // Optional free-text override for the on-site fee (display-only; never online math).
            'parking_policy.extra_parking_fee_display_text' => ['nullable', 'string', 'max:255'],

            'cancellation_policy' => ['nullable', 'array'],
            'cancellation_policy.policy_name' => ['nullable', Rule::in(self::CANCELLATION_POLICY_NAMES)],
            'cancellation_policy.free_cancellation_deadline' => ['nullable', 'string', 'max:100'],
            'cancellation_policy.refund_schedule' => ['nullable', 'array'],
            'cancellation_policy.no_show_policy' => ['nullable', 'string'],
            'cancellation_policy.rejection_refund_policy' => ['nullable', 'string'],
            'cancellation_policy.non_refundable_reasons' => ['nullable', 'string'],
            'cancellation_policy.requires_admin_confirmation' => ['nullable', 'boolean'],
            'cancellation_policy.service_fee' => ['nullable', 'numeric', 'min:0'],
            'cancellation_policy.service_fee_online' => ['nullable', 'boolean'],
            'cancellation_policy.cleaning_fee' => ['nullable', 'numeric', 'min:0'],
            'cancellation_policy.cleaning_fee_online' => ['nullable', 'boolean'],
            'cancellation_policy.tax_amount' => ['nullable', 'numeric', 'min:0'],
            'cancellation_policy.tax_online' => ['nullable', 'boolean'],
            // On-site fees: numeric column stays strictly numeric; each gets an OPTIONAL free-text
            // display override (display-only — these never enter online_amount / the NOWPayments invoice).
            'cancellation_policy.extra_guest_fee' => ['nullable', 'numeric', 'min:0'],
            'cancellation_policy.extra_guest_fee_display_text' => ['nullable', 'string', 'max:255'],
            'cancellation_policy.child_fee' => ['nullable', 'numeric', 'min:0'],
            'cancellation_policy.child_fee_display_text' => ['nullable', 'string', 'max:255'],
            'cancellation_policy.pet_fee' => ['nullable', 'numeric', 'min:0'],
            'cancellation_policy.pet_fee_display_text' => ['nullable', 'string', 'max:255'],
            'cancellation_policy.extension_fee' => ['nullable', 'numeric', 'min:0'],
            'cancellation_policy.extension_fee_display_text' => ['nullable', 'string', 'max:255'],
            'cancellation_policy.security_deposit' => ['nullable', 'numeric', 'min:0'],
            'cancellation_policy.security_deposit_display_text' => ['nullable', 'string', 'max:255'],
            'cancellation_policy.onsite_payment_amount' => ['nullable', 'numeric', 'min:0'],
            'cancellation_policy.onsite_payment_amount_display_text' => ['nullable', 'string', 'max:255'],
            'cancellation_policy.damage_fee' => ['nullable', 'numeric', 'min:0'],
            'cancellation_policy.damage_fee_display_text' => ['nullable', 'string', 'max:255'],
            'cancellation_policy.minibar_incidental_fee' => ['nullable', 'numeric', 'min:0'],
            'cancellation_policy.minibar_incidental_fee_display_text' => ['nullable', 'string', 'max:255'],
            'cancellation_policy.onsite_tax' => ['nullable', 'numeric', 'min:0'],
            'cancellation_policy.onsite_tax_display_text' => ['nullable', 'string', 'max:255'],
            'cancellation_policy.damage_policy' => ['nullable', 'string'],
        ];

        if ($isUpdate) {
            // Existing-child identifiers + media removal payload.
            $rules['rooms.*.id'] = ['nullable', 'integer'];
            $rules['rooms.*.rate_plans.*.id'] = ['nullable', 'integer'];
            $rules['deleted_media_ids'] = ['nullable', 'array'];
            $rules['deleted_media_ids.*'] = ['integer'];
            // Kept-image display order (first = main image); array of lodging_media ids.
            $rules['existing_image_order'] = ['nullable', 'array'];
            $rules['existing_image_order.*'] = ['integer'];
        }

        return $rules;
    }
}
