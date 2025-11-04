<?php

namespace App\Repositories\Smartphones\Repository;

use App\Jobs\SmartphoneDestroyOnAWS;
use App\Jobs\SmartphoneStoreOnAWS;
use App\Jobs\SmartphoneUpdateOnAWS;
use App\Models\Capacity;
use App\Models\Category;
use App\Models\Color;
use App\Models\ModelName;
use App\Models\Smartphone;
use App\Models\SmartphoneForSale;
use App\Repositories\Smartphones\Interface\ISmartphoneRepository;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
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
            ->with(['model_name', 'capacity', 'selling_info', 'category'])
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return $smartphones;
    }

    public function getSingleSmartphone(string $id)
    {
        $smartphone = $this->smartphone->with(['model_name', 'capacity', 'category', 'selling_info'])->find($id);

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
            'images' => ['required', 'array', 'max:5'],
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
                'mimes:jpg,jpeg,png',
                'max:5048',
            ],

        ], [
            'images.*.mimes' => 'Only JPG, JPEG, PNG, images are allowed.',
            'images.*.max' => 'Each image must not exceed 5MB.',

        ], [
            'images.*' => 'image']);

        if ($validator->fails()) {
            throw ValidationException::withMessages([
                'file_error' => $validator->errors()->first(),
            ]);
        }

        try {

            $validated_req = array_filter($validated_req, function ($value, $key) {
                return ! in_array($key, ['images']);
            }, ARRAY_FILTER_USE_BOTH);

            if (! empty($validated_req['tag']) && ! str_starts_with($validated_req['tag'], '#')) {
                $tag = $validated_req['tag'];
                $concatinated_tag = '#'.$tag;
                $validated_req['tag'] = $concatinated_tag;
            }

            $model_name = $this->model_name->find($validated_req['model_name_id'])?->name ?? 'Smartphone';
            $capacity = $this->capacity->find($validated_req['capacity_id'])?->name ?? '';

            $raw_slug = "{$model_name}-{$capacity}-{$validated_req['upc']}-".Str::uuid();
            $validated_req['slug'] = preg_replace('/\s+/u', '-', trim($raw_slug));

            $smartphone = $this->smartphone->create($validated_req);
            if (empty($smartphone)) {
                throw new Exception('Something Went Wrong While Creating Smartphone');
            }

            if ($request->hasFile('images')) {
                $paths = [];

                foreach ($request->file('images') as $image) {
                    $new_name = time().uniqid().Str::random(10).'.'.$image->getClientOriginalExtension();

                    $resizedImage = ImageManager::imagick()
                        ->read($image)
                        ->encodeByExtension('jpg', quality: 70);

                    $tempPath = 'temp/uploads/'.$new_name;
                    Storage::disk('local')->put($tempPath, (string) $resizedImage);

                    $paths[] = $tempPath;
                }

                dispatch(new SmartphoneStoreOnAWS(['images' => $paths], $smartphone));
            }

            return [
                'status' => true,
                'message' => 'Smartphone Created Successfully',
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
            'upc' => ['required', 'max:255', 'unique:smartphones,upc,'.$id],
            'images' => ['required', 'array', 'max:5'],
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
                'mimes:jpg,jpeg,png',
                'max:10240',
            ],

        ], [
            'new_images.*.mimes' => 'Only JPG, JPEG, PNG, images are allowed.',
            'new_images.*.max' => 'Each image must not exceed 10MB.',

        ], [
            'images.*' => 'image',

        ]);

        if ($validator->fails()) {
            throw ValidationException::withMessages([
                'file_error' => $validator->errors()->first(),
            ]);
        }

        try {
            $validated_req = array_filter($validated_req, function ($value, $key) {
                return ! in_array($key, ['images']);
            }, ARRAY_FILTER_USE_BOTH);

            if (! empty($validated_req['tag']) && ! str_starts_with($validated_req['tag'], '#')) {
                $tag = $validated_req['tag'];
                $concatinated_tag = '#'.$tag;
                $validated_req['tag'] = $concatinated_tag;
            }

            $smartphone = $this->smartphone->find($id);

            if (empty($smartphone->slug)) {
                $model_name = $this->model_name->find($validated_req['model_name_id'])?->name ?? 'Smartphone';
                $capacity = $this->capacity->find($validated_req['capacity_id'])?->name ?? '';
                $raw_slug = "{$model_name}-{$capacity}-{$validated_req['upc']}-".Str::uuid();

                $validated_req['slug'] = preg_replace('/\s+/u', '-', trim($raw_slug));

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

            if (empty($smartphone)) {
                throw new Exception('Smartphone Not Found');
            }

            $updated = $smartphone->update($validated_req);
            if (! $updated) {
                throw new Exception('Something Went Wrong While Updating Smartphone');
            }

            if ($request->hasFile('new_images')) {
                $paths = [];

                foreach ($request->file('new_images') as $image) {
                    $new_name = time().uniqid().Str::random(10).'.'.$image->getClientOriginalExtension();

                    $resizedImage = ImageManager::imagick()
                        ->read($image)
                        ->encodeByExtension('jpg', quality: 70);

                    $tempPath = 'temp/uploads/'.$new_name;
                    Storage::disk('local')->put($tempPath, (string) $resizedImage);

                    $paths[] = $tempPath;
                }

                dispatch(new SmartphoneUpdateOnAWS(['images' => $paths], $smartphone));
            }

            return [
                'status' => true,
                'message' => 'Smartphone Updated Successfully',
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
}
