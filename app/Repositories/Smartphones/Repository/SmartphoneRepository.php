<?php

namespace App\Repositories\Smartphones\Repository;

use App\Jobs\CompressSmartphoneVideoWithFFMEG;
use App\Jobs\SmartphoneDestroyOnAWS;
use App\Jobs\SmartphoneStoreOnAWS;
use App\Jobs\SmartphoneUpdateOnAWS;
use App\Models\Addon;
use App\Models\Capacity;
use App\Models\Category;
use App\Models\Color;
use App\Models\Condition;
use App\Models\Country;
use App\Models\CourierCompany;
use App\Models\ModelName;
use App\Models\ReturnPolicy;
use App\Models\ShippingPolicy;
use App\Models\Smartphone;
use App\Models\SmartphoneForSale;
use App\Repositories\Smartphones\Interface\ISmartphoneRepository;
use App\Services\GoogleGeoCoderService;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use Intervention\Image\Encoders\WebpEncoder;
use Intervention\Image\ImageManager;
use Str;

class SmartphoneRepository implements ISmartphoneRepository
{
    public function __construct(
        private Smartphone $smartphone,
        private Color $color,
        private ModelName $model_name,
        private Capacity $capacity,
        private Category $category,
        private SmartphoneForSale $smartphone_for_sale,
        private Country $country,
        private Condition $condition,
        private CourierCompany $courier_company,
        private ReturnPolicy $return_policy,
        private ShippingPolicy $shipping_policy,
        private Addon $addon,
        private GoogleGeoCoderService $googleGeoCoderService,
    ) {}

    public function getAllSmartphones(Request $request)
    {
        $smartphones = $this->smartphone
            ->when(! empty($request->input('search')), function ($query) use ($request) {
                $query->where(function ($subQ) use ($request) {
                    $subQ->whereHas('model_name', fn ($query) => $query->where('name', 'like', '%'.$request->input('search').'%'))
                        ->orWhere('upc', 'like', '%'.$request->input('search').'%')
                        ->orWhereHas('category', function ($subsubQ) use ($request) {
                            $subsubQ->where('name', 'like', '%'.$request->input('search').'%');
                        });
                });
            })
            ->with(['model_name', 'capacity', 'selling_info', 'category', 'selling_info.shipping_fee', 'selling_info.import_tax', 'addons'])
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return $smartphones;
    }

    public function getSingleSmartphone(string $id)
    {
        $smartphone = $this->smartphone->with(['model_name', 'capacity', 'category', 'country', 'condition', 'courier_company', 'return_policy', 'selling_info', 'selling_info.shipping_fee', 'selling_info.import_tax', 'addons:id'])->find($id);

        if (! empty($smartphone)) {
            $smartphone->addon_ids = ! blank($smartphone->addons) ? $smartphone->addons->pluck('id')->toArray() : [];
        }

        return $smartphone;
    }

    public function storeSmartphone(Request $request)
    {

        $validated_req = $request->validate([
            'model_name_id' => ['required', 'exists:model_names,id'],
            'capacity_id' => ['required', 'exists:capacities,id'],
            'color_ids' => ['required', 'array'],
            'color_ids.*' => ['required', 'exists:colors,id'],
            'category_id' => ['required', 'exists:categories,id'],
            'upc' => ['required', 'max:255', 'unique:smartphones,upc'],
            'addon_ids' => ['nullable', 'array'],
            'addon_ids.*' => ['nullable', 'exists:addons,id'],
            'delivery_days' => ['required', 'integer', 'min:1', 'max:30'],
            'country_id' => ['required', 'exists:countries,id'],
            'condition_id' => ['required', 'exists:conditions,id'],
            'courier_company_id' => ['required', 'exists:courier_companies,id'],
            'return_policy_id' => ['required', 'exists:return_policies,id'],
            'shipping_policy_id' => ['required', 'exists:shipping_policies,id'],
            'floor_id' => ['nullable', 'exists:floors,id'],
            'latitude' => ['nullable', 'numeric'],
            'longitude' => ['nullable', 'numeric'],
            'location_name' => ['nullable', 'string'],

            'videos' => ['nullable', 'array', 'max:5'],
            'images' => ['nullable', 'array', 'max:5'],
            'tag' => ['nullable', 'string', 'max:30', function ($attribute, $value, $fail) {
                if (str_contains($value, ',')) {
                    $fail('Only One Tag Allowed In The Smartphone');
                }

                if (substr_count($value, '#') > 1 || str_contains($value, ' ') || str_contains($value, ',')) {
                    return $fail('Only one hashtag is allowed without spaces or commas.');
                }
            }],
            'content' => ['required', 'string', 'min:20'],

        ], [
            'color_ids.*.required' => 'Color Is Required ',
            'color_ids.*.exists' => 'Given Color Are incorrect',
            'category_id.required' => 'Category  Is Required',
            'category_id.exists' => 'Given Category  Is incorrect',

        ]);

        $validator = Validator::make($request->allFiles(), [
            'images.*' => [
                'mimes:jpg,jpeg,png,webp',
                'max:5048',
            ],

            'videos.*' => [
                'mimes:mp4,mov,avi,webp,webm',
                'max:1048576',
            ],

        ], [
            'images.*.mimes' => 'Only JPG, JPEG, PNG, WEBP images are allowed.',
            'images.*.max' => 'Each image must not exceed 5MB.',
            'videos.*.mimes' => 'Only MP4, MOV, WEBP, WEBM and AVI videos are allowed.',
            'videos.*.max' => 'Each video must not exceed 1GB.',

        ], [
            'images.*' => 'image',
            'videos.*' => 'video',

        ]);

        if ($validator->fails()) {
            throw ValidationException::withMessages([
                ...($validator->errors()->keys() == 'images.*' ? ['file_error' => $validator->errors()->first()] : ['video_error' => $validator->errors()->first()]),
            ]);
        }

        $productDetailValidator = Validator::make($request->all(), [
            'product_details' => ['nullable', 'array'],
            'product_details.*.title' => ['required', 'string', 'max:255'],
            'product_details.*.value' => ['required', 'string', 'max:255'],

        ], [
            'product_details.*.title.required' => 'Title Is Required',
            'product_details.*.title.max' => 'Title Should Not Exceed 255 Characters',
            'product_details.*.title.string' => 'Title Must Be A String',
            'product_details.*.value.required' => 'Value Is Required',
            'product_details.*.value.max' => 'Value Should Not Exceed 255 Characters',
            'product_details.*.value.string' => 'Value Must Be A String',

        ]);

        if ($productDetailValidator->fails()) {
            throw ValidationException::withMessages([
                'file_error' => $productDetailValidator->errors()->first(),
            ]);
        }

        try {

            $validated_req = array_filter($validated_req, function ($value, $key) {
                return ! in_array($key, ['images', 'videos']);
            }, ARRAY_FILTER_USE_BOTH);

            if (! empty($validated_req['tag']) && ! str_starts_with($validated_req['tag'], '#')) {
                $tag = $validated_req['tag'];
                $concatinated_tag = '#'.$tag;
                $validated_req['tag'] = $concatinated_tag;
            }

            $model_name = $this->model_name->find($validated_req['model_name_id'])?->name ?? 'Smartphone';
            $capacity = $this->capacity->find($validated_req['capacity_id'])?->name ?? '';

            $rawSlug = "{$model_name}-{$capacity}-{$validated_req['upc']}-".Str::uuid();
            $cleanSlug = str_replace(['/', '\\'], '-', $rawSlug);
            $cleanSlug = preg_replace('/[^A-Za-z0-9\- ]/', '', $cleanSlug);
            $cleanSlug = preg_replace('/\s+/u', '-', trim($cleanSlug));
            $validated_req['slug'] = strtolower($cleanSlug);

            // Get Location Name  From Google Api Behalf Of Lat/lng
            if (empty($validated_req['location_name']) && ! empty($validated_req['latitude']) && ! empty($validated_req['longitude'])) {
                $response = $this->googleGeoCoderService->getLocationNameFromLatLng($validated_req['latitude'], $validated_req['longitude']);
                if ($response['status'] === false) {
                    throw new Exception($response['message']);
                }

                $validated_req['location_name'] = $response['place_name'] ?? 'No Location Name Found';
            }

            // Detaching From Request To Let it Create First
            if ($request->has('addon_ids')) {
                unset($validated_req['addon_ids']);
            }

            if (! blank($request->array('product_details'))) {
                $validated_req['product_details'] = $request->array('product_details');
            }

            $smartphone = $this->smartphone->create($validated_req);
            if (empty($smartphone)) {
                throw new Exception('Something Went Wrong While Creating Smartphone');
            }

            if ($request->has('addon_ids')) {
                $smartphone->addons()->attach($request->array('addon_ids'));
            }

            if ($request->hasFile('images')) {
                $paths = [];

                foreach ($request->file('images') as $image) {
                    $new_name = time().uniqid().'-'.Str::random(10).'.webp';

                    $resizedImage = ImageManager::imagick()
                        ->read($image)
                        ->scaleDown(1800)
                        ->encode(new WebpEncoder(quality: 70));

                    $tempPath = 'temp/uploads/'.$new_name;
                    Storage::disk('local')->put($tempPath, (string) $resizedImage);

                    $paths[] = $tempPath;
                }

                dispatch(new SmartphoneStoreOnAWS(['images' => $paths], $smartphone));
            }

            if ($request->hasFile('videos')) {
                $tempPaths = [];

                foreach ($request->file('videos') as $video) {
                    $originalName = time().uniqid().'-'.Str::random(8).'.'.$video->getClientOriginalExtension();
                    $tempPaths[] = $video->storeAs('temp/uploads', $originalName, 'local');
                }

                dispatch(new CompressSmartphoneVideoWithFFMEG($tempPaths, $smartphone, 'store'))->onQueue('video');
            }

            $hasMedia = ($request->hasFile('videos') || $request->hasFile('images'));

            $message = 'Smartphone Created Successfully';

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

    public function updateSmartphone(Request $request, string $id)
    {

        $validated_req = $request->validate([
            'model_name_id' => ['required', 'exists:model_names,id'],
            'capacity_id' => ['required', 'exists:capacities,id'],
            'color_ids' => ['required', 'array'],
            'color_ids.*' => ['required', 'exists:colors,id'],
            'category_id' => ['required', 'exists:categories,id'],
            'delivery_days' => ['required', 'integer', 'min:1', 'max:30'],
            'addon_ids' => ['nullable', 'array'],
            'addon_ids.*' => ['nullable', 'exists:addons,id'],
            'country_id' => ['required', 'exists:countries,id'],
            'condition_id' => ['required', 'exists:conditions,id'],
            'courier_company_id' => ['required', 'exists:courier_companies,id'],
            'return_policy_id' => ['required', 'exists:return_policies,id'],
            'shipping_policy_id' => ['required', 'exists:shipping_policies,id'],
            'upc' => ['required', 'max:255', 'unique:smartphones,upc,'.$id],
            'images' => ['nullable', 'array', 'max:5'],
            'videos' => ['nullable', 'array', 'max:5'],
            'tag' => ['nullable', 'string', 'max:30', function ($attribute, $value, $fail) {
                if (str_contains($value, ',')) {
                    $fail('Only One Tag Allowed In The Smartphone');
                }

                if (substr_count($value, '#') > 1 || str_contains($value, ' ') || str_contains($value, ',')) {
                    return $fail('Only one hashtag is allowed without spaces or commas.');
                }
            }],
            'content' => ['required', 'string', 'min:20'],
        ], [
            'color_ids.*.required' => 'Color Is Required ',
            'color_ids.*.exists' => 'Given Color Are incorrect',
            'category_id.required' => 'Category  Is Required',
            'category_id.exists' => 'Given Category  Is incorrect',
        ]);

        $validator = Validator::make($request->allFiles(), [
            'new_images.*' => [
                'mimes:jpg,jpeg,png,webp',
                'max:10240',
            ],

            'new_videos.*' => [
                'mimes:mp4,mov,avi,webp,webm',
                'max:1048576',
            ],
        ], [
            'new_images.*.mimes' => 'Only JPG, JPEG, PNG, WEBP images are allowed.',
            'new_images.*.max' => 'Each image must not exceed 10MB.',
            'new_videos.*.mimes' => 'Only MP4, MOV, WEBP, WEBM and AVI videos are allowed.',
            'new_videos.*.max' => 'Each video must not exceed 1GB.',

        ], [
            'images.*' => 'image',
            'videos.*' => 'video',
        ]);

        if ($validator->fails()) {
            throw ValidationException::withMessages([
                ...($validator->errors()->keys() == 'images.*' ? ['file_error' => $validator->errors()->first()] : ['video_error' => $validator->errors()->first()]),
            ]);
        }

        $productDetailValidator = Validator::make($request->all(), [
            'product_details' => ['nullable', 'array'],
            'product_details.*.title' => ['required', 'string', 'max:255'],
            'product_details.*.value' => ['required', 'string', 'max:255'],

        ], [
            'product_details.*.title.required' => 'Title Is Required',
            'product_details.*.title.max' => 'Title Should Not Exceed 255 Characters',
            'product_details.*.title.string' => 'Title Must Be A String',
            'product_details.*.value.required' => 'Value Is Required',
            'product_details.*.value.max' => 'Value Should Not Exceed 255 Characters',
            'product_details.*.value.string' => 'Value Must Be A String',

        ]);

        if ($productDetailValidator->fails()) {
            throw ValidationException::withMessages([
                'file_error' => $productDetailValidator->errors()->first(),
            ]);
        }

        try {
            $validated_req = array_filter($validated_req, function ($value, $key) {
                return ! in_array($key, ['images', 'videos']);
            }, ARRAY_FILTER_USE_BOTH);

            if (! empty($validated_req['tag']) && ! str_starts_with($validated_req['tag'], '#')) {
                $tag = $validated_req['tag'];
                $concatinated_tag = '#'.$tag;
                $validated_req['tag'] = $concatinated_tag;
            }

            $smartphone = $this->smartphone->find($id);
            if (empty($smartphone)) {
                throw new Exception('Smartphone Not Found');
            }

            if ($request->has('addon_ids')) {
                unset($validated_req['addon_ids']);
                $smartphone->addons()->sync($request->array('addon_ids'));
            }

            if ($request->filled('deleted_images')) {
                $deleted = $request->array('deleted_images');
                $deleted_image_urls = array_map(function ($deletedItem) {
                    return $deletedItem['url'] ?? null;
                }, $deleted);

                dispatch(new SmartphoneDestroyOnAWS(['images' => $deleted_image_urls]));

                $oldImages = $smartphone->images ?? [];

                $remeaning_images = array_filter($oldImages, function ($image) use ($deleted) {
                    return ! in_array($image, $deleted);
                });

                $remaining_images_array = array_values($remeaning_images);

                $validated_req['images'] = $remaining_images_array;
            }

            if ($request->filled('deleted_videos')) {
                $deleted = $request->array('deleted_videos');

                dispatch(new SmartphoneDestroyOnAWS(['videos' => $deleted]));

                $old_videos = $smartphone->videos ?? [];

                $remeaning_videos = array_filter($old_videos, function ($video) use ($deleted) {
                    return ! in_array($video, $deleted);
                });

                $remaining_videos_array = array_values($remeaning_videos);

                $validated_req['videos'] = $remaining_videos_array;
            }

            if (! blank($request->array('product_details'))) {
                $validated_req['product_details'] = $request->array('product_details');
            } else {
                $validated_req['product_details'] = null;
            }

            if (array_key_exists('images', $validated_req) && empty($validated_req['images'])) {
                $validated_req['images'] = null;
            }

            if (array_key_exists('videos', $validated_req) && empty($validated_req['videos'])) {
                $validated_req['videos'] = null;
            }

            $updated = $smartphone->update($validated_req);
            if (! $updated) {
                throw new Exception('Something Went Wrong While Updating Smartphone');
            }

            if ($request->hasFile('new_images')) {
                $paths = [];

                foreach ($request->file('new_images') as $image) {
                    $new_name = time().uniqid().'-'.Str::random(10).'.webp';

                    $resizedImage = ImageManager::imagick()
                        ->read($image)
                        ->scaleDown(1800)
                        ->encode(new WebpEncoder(quality: 70));

                    $tempPath = 'temp/uploads/'.$new_name;
                    Storage::disk('local')->put($tempPath, (string) $resizedImage);

                    $paths[] = $tempPath;
                }

                dispatch(new SmartphoneUpdateOnAWS(['images' => $paths], $smartphone));
            }

            if ($request->hasFile('new_videos')) {
                $tempPaths = [];

                foreach ($request->file('new_videos') as $video) {
                    $originalName = time().uniqid().'-'.Str::random(8).'.'.$video->getClientOriginalExtension();
                    $tempPaths[] = $video->storeAs('temp/uploads', $originalName, 'local');
                }

                dispatch(new CompressSmartphoneVideoWithFFMEG($tempPaths, $smartphone, 'update'))->onQueue('video');
            }

            $hasMedia = ($request->hasFile('new_videos') || $request->hasFile('new_images'));

            $message = 'Smartphone Updated Successfully';

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

    public function destroySmartphone(string $id)
    {
        try {
            $smartphone = $this->smartphone->find($id);

            if (empty($smartphone)) {
                throw new Exception('Smartphone Not Found');
            }

            if (! blank($smartphone->smartphone_image_urls)) {
                dispatch(new SmartphoneDestroyOnAWS(['images' => $smartphone->smartphone_image_urls]));
            }

            if (! blank($smartphone->smartphone_video_urls)) {
                dispatch(new SmartphoneDestroyOnAWS(['videos' => $smartphone->smartphone_video_urls]));
            }

            $deleted = $smartphone->delete();
            if (! $deleted) {
                throw new Exception('Something Went Wrong While Deleting Smartphone');
            }

            return [
                'status' => true,
                'message' => 'Smartphone Deleted Successfully',
            ];

        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function destroySmartphoneBySelection(Request $request)
    {
        try {
            $ids = $request->array('ids');
            if (blank($ids)) {
                throw new Exception('Please Select Atleast One Smartphone');
            }

            $smartphones = $this->smartphone->whereIn('id', $ids)->get();
            if ($smartphones->isEmpty()) {
                throw new Exception('Given Smartphone Ids Are incorrect');
            }

            foreach ($smartphones as $smartphone) {
                $response = $this->destroySmartphone($smartphone->id);
                if ($response['status'] === false) {
                    throw new Exception($response['message']);
                }
            }

            return [
                'status' => true,
                'message' => 'Smartphones Deleted Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function getColors()
    {
        return $this->color->where('is_active', true)->get();
    }

    public function getModelNames()
    {
        return $this->model_name->where('is_active', true)->get();
    }

    public function getCapacities()
    {
        return $this->capacity->where('is_active', true)->get();
    }

    public function getCategories()
    {
        return $this->category->where('is_active', true)->get();
    }

    public function getSmartphones(?string $id = null)
    {
        $ids = collect($this->smartphone_for_sale->pluck('smartphone_id'))->toArray();
        $excluded_ids = array_filter($ids, function ($ex_id) use ($id) {
            return (int) $ex_id !== (int) $id;
        });

        return $this->smartphone
            ->whereNotIn('id', $excluded_ids)
            ->with(['model_name'])
            ->get()
            ->map(function ($smartphone) {
                return [
                    'id' => $smartphone->id,
                    'name' => $smartphone->model_name->name,
                ];
            });
    }

    public function getCountries()
    {
        return $this->country->where('is_active', true)->get();
    }

    public function getConditions()
    {
        return $this->condition->where('is_active', true)->get();
    }

    public function getCourierCompanies()
    {
        return $this->courier_company->where('is_active', true)->get();
    }

    public function getReturnPolicies()
    {
        return $this->return_policy
            ->where('is_active', true)
            ->with('language')
            ->get()
            ->map(function ($return_policy) {
                return [
                    'id' => $return_policy->id,
                    'name' => $return_policy->name.' ('.$return_policy->language->name.')',
                ];
            });
    }

    public function getShippingPolicies()
    {
        return $this->shipping_policy
            ->where('is_active', true)
            ->with('language')
            ->get()
            ->map(function ($shipping_policy) {
                return [
                    'id' => $shipping_policy->id,
                    'name' => $shipping_policy->name.' ('.$shipping_policy->language->name.')',
                ];
            });
    }

    public function getAddons()
    {
        return $this->addon->where('is_active', true)->get();
    }
}
