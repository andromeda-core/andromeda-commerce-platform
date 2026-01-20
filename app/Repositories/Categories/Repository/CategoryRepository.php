<?php

namespace App\Repositories\Categories\Repository;

use App\Jobs\CategoryDestroyOnAWS;
use App\Jobs\CategoryStoreOnAWS;
use App\Jobs\CategoryUpdateOnAWS;
use App\Models\Category;
use App\Models\Distributor;
use App\Repositories\Categories\Interface\ICategoryRepository;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Encoders\WebpEncoder;
use Intervention\Image\ImageManager;
use Str;

class CategoryRepository implements ICategoryRepository
{
    public function __construct(
        private Category $category,
        private Distributor $distributor
    ) {}

    public function getAllCategories(Request $request)
    {
        $categories = $this->category
            ->when(! empty($request->input('search')), function ($query) use ($request) {
                $query->where(function ($subQ) use ($request) {
                    $subQ->where('name', 'like', '%'.$request->input('search').'%')
                        ->orWhereHas('distributor', function ($subQQ) use ($request) {
                            $subQQ->whereHas('user', function ($subQQQ) use ($request) {
                                $subQQQ->where('name', 'like', '%'.$request->input('search').'%');
                            });
                        });
                });
            })
            ->with(['distributor.user'])
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return $categories;
    }

    public function getSingleCategory(string $id)
    {
        $category = $this->category->with(['smartphones', 'smartphones.model_name'])->find($id);

        return $category;
    }

    public function storeCategory(Request $request)
    {
        $validated_req = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:categories,name'],
            'short_description' => ['required', 'string', 'max:255'],
            'thumbnail' => ['required', 'mimes:jpg,jpeg,png,webp', 'max:5048'],
            'distributor_id' => ['required', 'exists:distributors,id'],
            'is_active' => ['required', 'boolean'],
        ], [
            'name.required' => 'Category name is required',
            'name.string' => 'Category name should be a string',
            'name.max' => 'Category name should not exceed 255 characters',

            'short_description.required' => 'Category short description is required',
            'short_description.string' => 'Category short description should be a string',
            'short_description.max' => 'Category short description should not exceed 255 characters',

            'thumbnail.required' => 'Category thumbnail is required',
            'thumbnail.max' => 'Category thumbnail should not exceed 5MB',

            'distributor_id.required' => 'Category distributor is required',
            'distributor_id.exists' => 'Category distributor does not exist',

            'is_active.required' => 'Category status is required',
            'is_active.boolean' => 'Category status should be a Active or In-Active',
        ]);

        try {

            $slug = Str::slug($validated_req['name']);
            $originalSlug = $slug;
            $counter = 1;

            while ($this->category->where('slug', $slug)->exists()) {
                $slug = $originalSlug.'-'.$counter++;
            }

            $validated_req['thumbnail'] = null;
            $validated_req['slug'] = $slug;

            $created = $this->category->create($validated_req);

            if (empty($created)) {
                throw new Exception('Something Went Wrong While Creating Category');
            }
            if ($request->hasFile('thumbnail')) {

                $image = $request->file('thumbnail');

                $new_name = time().uniqid().'-'.Str::random(10).'.webp';

                $resizedImage = ImageManager::imagick()
                    ->read($image)
                    ->scaleDown(1800)
                    ->encode(new WebpEncoder(quality: 70));

                $tempPath = 'temp/uploads/'.$new_name;
                Storage::disk('local')->put($tempPath, (string) $resizedImage);

                dispatch(new CategoryStoreOnAWS($tempPath, $created));
            }

            return [
                'status' => true,
                'message' => 'Category Created Successfully',
            ];

        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function updateCategory(Request $request, string $id)
    {
        $validated_req = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:categories,name,'.$id],
            'short_description' => ['required', 'string', 'max:255'],
            'thumbnail' => ['required', ...($request->file('thumbnail') instanceof \Illuminate\Http\UploadedFile && $request->hasFile('thumbnail') ? ['mimes:jpg,jpeg,png,webp', 'max:5048'] : [])],
            'distributor_id' => ['required', 'exists:distributors,id'],
            'is_active' => ['required', 'boolean'],
        ], [
            'name.required' => 'Category name is required',
            'name.string' => 'Category name should be a string',
            'name.max' => 'Category name should not exceed 255 characters',

            'short_description.required' => 'Category short description is required',
            'short_description.string' => 'Category short description should be a string',
            'short_description.max' => 'Category short description should not exceed 255 characters',

            'thumbnail.required' => 'Category thumbnail is required',
            'thumbnail.max' => 'Category thumbnail should not exceed 5MB',

            'distributor_id.required' => 'Category distributor is required',
            'distributor_id.exists' => 'Category distributor does not exist',

            'is_active.required' => 'Category status is required',
            'is_active.boolean' => 'Category status should be a Active or In-Active',
        ]);

        try {

            $category = $this->getSingleCategory($id);

            if (empty($category)) {
                throw new Exception('Category not found');
            }
            if ($request->file('thumbnail') instanceof \Illuminate\Http\UploadedFile && $request->hasFile('thumbnail')) {

                if (! empty($category->thumbnail_url)) {
                    dispatch(new CategoryDestroyOnAWS($category->thumbnail_url));
                    $validated_req['thumbnail'] = null;
                }

                $image = $request->file('thumbnail');

                $new_name = time().uniqid().'-'.Str::random(10).'.webp';

                $resizedImage = ImageManager::imagick()
                    ->read($image)
                    ->scaleDown(1800)
                    ->encode(new WebpEncoder(quality: 70));

                $tempPath = 'temp/uploads/'.$new_name;
                Storage::disk('local')->put($tempPath, (string) $resizedImage);

                dispatch(new CategoryUpdateOnAWS($tempPath, $category));
            }

            $updated = $category->update($validated_req);

            if (! $updated) {
                throw new Exception('Something Went Wrong While Updating Category');
            }

            return [
                'status' => true,
                'message' => 'Category Updated Successfully',
            ];

        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }

    }

    public function destroyCategory(string $id)
    {
        try {
            $category = $this->getSingleCategory($id);

            if (empty($category)) {
                throw new Exception('Category not found');
            }

            if (! empty($category->thumbnail_url)) {
                dispatch(new CategoryDestroyOnAWS($category->thumbnail_url));
            }

            $deleted = $category->delete();

            if (! $deleted) {
                throw new Exception('Something Went Wrong While Deleting Category');
            }

            return [
                'status' => true,
                'message' => 'Category Deleted Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function destroyCategoryBySelection(Request $request)
    {
        try {
            $ids = $request->array('ids');

            if (blank($ids)) {
                throw new Exception('Category ID Not found');
            }

            $categories = Category::whereIn('id', $ids)->get();
            if ($categories->isEmpty()) {
                throw new Exception('Category not found');
            }

            foreach ($categories as $category) {
                $resposne = $this->destroyCategory($category->id);
                if ($resposne['status'] === false) {
                    throw new Exception($resposne['message']);
                }
            }

            return [
                'status' => true,
                'message' => 'Category Deleted Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function getDistributors()
    {
        return $this->distributor->whereHas('user', function ($query) {
            $query->where('is_active', true);
        })->with('user')->latest()
            ->get()
            ->map(function ($distributor) {
                return [
                    'id' => $distributor->id,
                    'name' => $distributor?->user?->name,
                ];
            });
    }

    public function getAllCategoryNames()
    {
        return $this->category->select('id', 'name')->orderBy('created_at', 'asc')->get();
    }
}
