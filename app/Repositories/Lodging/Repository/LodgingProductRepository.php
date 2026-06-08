<?php

namespace App\Repositories\Lodging\Repository;

use App\Jobs\CompressLodgingMediaVideoWithFFMPEG;
use App\Jobs\LodgingMediaDestroyOnAWS;
use App\Jobs\LodgingMediaStoreOnAWS;
use App\Models\Floor;
use App\Models\LodgingAmenity;
use App\Models\LodgingProduct;
use App\Models\User;
use App\Repositories\Lodging\Interface\ILodgingProductRepository;
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

    private const PARKING_TYPES = ['onsite', 'underground', 'nearby', 'valet'];

    private const CANCELLATION_POLICY_NAMES = ['flexible', 'moderate', 'firm', 'non_refundable', 'custom'];

    private const EVIDENCE_ROLES = ['marketing', 'room_photo', 'location_guide', 'checkin_guide', 'booking_proof', 'review', 'defect_evidence'];

    // Not DB enums; curated option lists for the json columns (bed_types / payment_methods).
    private const BED_TYPES = ['single', 'super_single', 'double', 'queen', 'king', 'bunk', 'sofa_bed', 'floor_bedding'];


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
    ) {}

    public function getAllLodgingProducts(Request $request)
    {
        $lodging_products = $this->lodging_product
            ->when(! empty($request->input('search')), function ($query) use ($request) {
                $search = $request->input('search');
                $query->where(function ($subQ) use ($search) {
                    $subQ->where('property_name', 'like', '%' . $search . '%')
                        ->orWhere('city_region', 'like', '%' . $search . '%')
                        ->orWhere('property_type', 'like', '%' . $search . '%')
                        ->orWhere('tag', 'like', '%' . $search . '%');
                });
            })
            ->withCount(['rooms', 'media'])
            ->with(['floor'])
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
            'assignedDashboardUser:id,name,email',
        ])->find($id);

        if (! empty($lodging_product)) {
            $lodging_product->amenity_ids = ! blank($lodging_product->amenities)
                ? $lodging_product->amenities->pluck('id')->toArray()
                : [];

            $lodging_product->rooms->each(function ($room) {
                $room->amenity_ids = ! blank($room->amenities)
                    ? $room->amenities->pluck('id')->toArray()
                    : [];
            });
        }

        return $lodging_product;
    }

    public function getCreateFormData()
    {
        return [
            'floors' => $this->floor->orderBy('name')->get(['id', 'name']),
            'amenities' => $this->lodging_amenity->where('is_active', true)->orderBy('name')->get(['id', 'name', 'icon', 'category']),
            'dashboard_users' => $this->user->where('status', 'active')->orderBy('name')->get(['id', 'name', 'email']),
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
            ],
        ];
    }

    public function storeLodgingProduct(Request $request)
    {
        $validated = $request->validate($this->rules(false));

        $this->validateMediaFiles($request, false);

        try {
            $product = DB::transaction(function () use ($request, $validated) {
                $productData = collect($validated)->except([
                    'amenity_ids', 'rooms', 'checkin_policy', 'parking_policy', 'cancellation_policy',
                ])->toArray();

                $productData = $this->normalizeProductData($productData);

                $product = $this->lodging_product->create($productData);
                if (empty($product)) {
                    throw new Exception('Something Went Wrong While Creating Lodging Product');
                }

                if ($request->has('amenity_ids')) {
                    $product->amenities()->sync($request->array('amenity_ids'));
                }

                foreach ($request->input('rooms', []) as $roomInput) {
                    $roomData = collect($roomInput)
                        ->except(['id', 'amenity_ids', 'rate_plans', 'lodging_product_id'])
                        ->toArray();

                    $room = $product->rooms()->create($roomData);

                    if (array_key_exists('amenity_ids', $roomInput)) {
                        $room->amenities()->sync($roomInput['amenity_ids'] ?? []);
                    }

                    foreach ($roomInput['rate_plans'] ?? [] as $ratePlanInput) {
                        $ratePlanData = collect($ratePlanInput)
                            ->except(['id', 'lodging_room_id'])
                            ->toArray();

                        $room->ratePlans()->create($ratePlanData);
                    }
                }

                if ($request->filled('checkin_policy')) {
                    $product->checkinPolicy()->create($this->policyData($request->input('checkin_policy')));
                }

                if ($request->filled('parking_policy')) {
                    $product->parkingPolicy()->create($this->policyData($request->input('parking_policy')));
                }

                if ($request->filled('cancellation_policy')) {
                    $product->cancellationPolicy()->create($this->policyData($request->input('cancellation_policy')));
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
        $validated = $request->validate($this->rules(true));

        $this->validateMediaFiles($request, true);

        try {
            $product = $this->lodging_product->find($id);
            if (empty($product)) {
                throw new Exception('Lodging Product Not Found');
            }

            $deletedMediaPaths = collect();

            DB::transaction(function () use ($request, $validated, $product, &$deletedMediaPaths) {
                $productData = collect($validated)->except([
                    'amenity_ids', 'rooms', 'checkin_policy', 'parking_policy', 'cancellation_policy', 'deleted_media_ids', 'existing_image_order',
                ])->toArray();

                $productData = $this->normalizeProductData($productData);

                $updated = $product->update($productData);
                if (! $updated) {
                    throw new Exception('Something Went Wrong While Updating Lodging Product');
                }

                if ($request->has('amenity_ids')) {
                    $product->amenities()->sync($request->array('amenity_ids'));
                }

                // Sync rooms: update existing (by id, scoped to this product), create new, delete removed.
                $submittedRoomIds = [];
                foreach ($request->input('rooms', []) as $roomInput) {
                    $roomId = $roomInput['id'] ?? null;
                    $roomData = collect($roomInput)
                        ->except(['id', 'amenity_ids', 'rate_plans', 'lodging_product_id'])
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

                    $submittedRatePlanIds = [];
                    foreach ($roomInput['rate_plans'] ?? [] as $ratePlanInput) {
                        $ratePlanId = $ratePlanInput['id'] ?? null;
                        $ratePlanData = collect($ratePlanInput)
                            ->except(['id', 'lodging_room_id'])
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
                    }

                    $room->ratePlans()->whereNotIn('id', $submittedRatePlanIds)->delete();
                }

                $product->rooms()->whereNotIn('id', $submittedRoomIds)->delete();

                // Policies (1:1) — update existing or create. Additive on omit: a missing section
                // is left untouched (clearing semantics are deferred to the Prompt 3b form phase).
                if ($request->filled('checkin_policy')) {
                    $product->checkinPolicy()->updateOrCreate([], $this->policyData($request->input('checkin_policy')));
                }

                if ($request->filled('parking_policy')) {
                    $product->parkingPolicy()->updateOrCreate([], $this->policyData($request->input('parking_policy')));
                }

                if ($request->filled('cancellation_policy')) {
                    $product->cancellationPolicy()->updateOrCreate([], $this->policyData($request->input('cancellation_policy')));
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
            $productData['tag'] = '#' . $productData['tag'];
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
        return collect($data ?? [])->except(['id', 'lodging_product_id'])->toArray();
    }

    private function handleMediaUploads(Request $request, LodgingProduct $product, string $imageKey = 'images', string $videoKey = 'videos'): bool
    {
        $hasMedia = false;
        $sortBase = (int) $product->media()->max('sort_order');

        if ($request->hasFile($imageKey)) {
            foreach ($request->file($imageKey) as $index => $image) {
                $newName = time() . uniqid() . '-' . Str::random(10) . '.webp';

                $resizedImage = ImageManager::imagick()
                    ->read($image)
                    ->scaleDown(1800)
                    ->encode(new WebpEncoder(quality: 70));

                $tempPath = 'temp/uploads/' . $newName;
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
                $originalName = time() . uniqid() . '-' . Str::random(8) . '.' . $video->getClientOriginalExtension();
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
            $imageKey . '.*' => ['mimes:jpg,jpeg,png,webp', 'max:10240'],
            $videoKey . '.*' => ['mimes:mp4,mov,avi,webp,webm', 'max:1048576'],
        ], [
            $imageKey . '.*.mimes' => 'Only JPG, JPEG, PNG, WEBP images are allowed.',
            $imageKey . '.*.max' => 'Each image must not exceed 10MB.',
            $videoKey . '.*.mimes' => 'Only MP4, MOV, WEBP, WEBM and AVI videos are allowed.',
            $videoKey . '.*.max' => 'Each video must not exceed 1GB.',
        ], [
            $imageKey . '.*' => 'image',
            $videoKey . '.*' => 'video',
        ]);

        if ($validator->fails()) {
            throw ValidationException::withMessages([
                ...(str_contains($validator->errors()->keys()[0] ?? '', 'image')
                    ? ['file_error' => $validator->errors()->first()]
                    : ['video_error' => $validator->errors()->first()]),
            ]);
        }
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
            'tag' => ['nullable', 'string', 'max:30'],
            'content' => ['nullable', 'string'],
            'base_checkin_time' => ['nullable', 'string', 'max:50'],
            'base_checkout_time' => ['nullable', 'string', 'max:50'],
            'from_price' => ['nullable', 'numeric', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
            'is_reservation_closed' => ['nullable', 'boolean'],

            'amenity_ids' => ['nullable', 'array'],
            'amenity_ids.*' => ['exists:lodging_amenities,id'],

            'rooms' => ['nullable', 'array'],
            'rooms.*.room_name' => ['required', 'string', 'max:255'],
            'rooms.*.room_type' => ['required', Rule::in(self::ROOM_TYPES)],
            'rooms.*.standard_guests' => ['nullable', 'integer', 'min:1'],
            'rooms.*.max_guests' => ['nullable', 'integer', 'min:1'],
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

            'rooms.*.rate_plans' => ['nullable', 'array'],
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
            'rooms.*.rate_plans.*.consecutive_nights_allowed' => ['nullable', 'boolean'],
            'rooms.*.rate_plans.*.remaining_room_count' => ['nullable', 'integer', 'min:0'],
            'rooms.*.rate_plans.*.is_bookable' => ['nullable', 'boolean'],
            'rooms.*.rate_plans.*.is_active' => ['nullable', 'boolean'],
            'rooms.*.rate_plans.*.external_rate_plan_id' => ['nullable', 'string', 'max:255'],

            'checkin_policy' => ['nullable', 'array'],
            'checkin_policy.checkin_time' => ['nullable', 'string', 'max:50'],
            'checkin_policy.checkout_time' => ['nullable', 'string', 'max:50'],
            'checkin_policy.early_checkin_available' => ['nullable', 'boolean'],
            'checkin_policy.early_checkin_fee' => ['nullable', 'numeric', 'min:0'],
            'checkin_policy.late_checkout_available' => ['nullable', 'boolean'],
            'checkin_policy.late_checkout_fee' => ['nullable', 'numeric', 'min:0'],
            'checkin_policy.checkin_method' => ['nullable', Rule::in(self::CHECKIN_METHODS)],
            'checkin_policy.instructions_sent_when' => ['nullable', 'string', 'max:255'],
            'checkin_policy.same_day_booking_notice' => ['nullable', 'string'],
            'checkin_policy.early_entry_penalty' => ['nullable', 'string'],
            'checkin_policy.late_checkout_penalty' => ['nullable', 'string'],
            'checkin_policy.id_verification_required' => ['nullable', 'boolean'],
            'checkin_policy.minor_policy' => ['nullable', 'string'],
            'checkin_policy.mixed_gender_policy' => ['nullable', 'string'],
            'checkin_policy.noise_party_restriction' => ['nullable', 'string'],
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
            'parking_policy.ev_charging_available' => ['nullable', 'boolean'],
            'parking_policy.refund_if_no_parking' => ['nullable', 'boolean'],
            'parking_policy.extra_parking_fee' => ['nullable', 'numeric', 'min:0'],

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
            'cancellation_policy.extra_guest_fee' => ['nullable', 'numeric', 'min:0'],
            'cancellation_policy.child_fee' => ['nullable', 'numeric', 'min:0'],
            'cancellation_policy.pet_fee' => ['nullable', 'numeric', 'min:0'],
            'cancellation_policy.extension_fee' => ['nullable', 'numeric', 'min:0'],
            'cancellation_policy.security_deposit' => ['nullable', 'numeric', 'min:0'],
            'cancellation_policy.onsite_payment_amount' => ['nullable', 'numeric', 'min:0'],
            'cancellation_policy.damage_fee' => ['nullable', 'numeric', 'min:0'],
            'cancellation_policy.minibar_incidental_fee' => ['nullable', 'numeric', 'min:0'],
            'cancellation_policy.onsite_tax' => ['nullable', 'numeric', 'min:0'],
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
