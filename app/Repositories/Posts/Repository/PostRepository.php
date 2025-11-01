<?php

namespace App\Repositories\Posts\Repository;

use App\Jobs\PostDestroyOnAWSJob;
use App\Jobs\PostStoreOnAWSJob;
use App\Jobs\PostUpdateOnAWSjob;
use App\Models\Floor;
use App\Models\Post;
use App\Models\Smartphone;
use App\Repositories\Posts\Interface\IPostRepository;
use App\Services\GoogleGeoCoderService;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use Intervention\Image\ImageManager;
use Str;

class PostRepository implements IPostRepository
{
    public function __construct(
        private Post $post,
        private GoogleGeoCoderService $googleGeoCoderService,
        private Smartphone $smartphone
    ) {}

    public function getAllPosts(Request $request)
    {
        $posts = $this->post
            ->with(['floor', 'user'])
            ->latest()
            ->paginate(10);

        return $posts;
    }

    public function getSinglePostBySlug(string $slug, ?Request $request = null)
    {
        $images = ! empty($request) ? ($request->has('images') ? $request->boolean('images') : true) : null;
        $videos = ! empty($request) ? ($request->has('videos') ? $request->boolean('videos') : true) : null;
        $text = ! empty($request) ? ($request->has('text') ? $request->boolean('text') : true) : null;
        $show_posts = ! empty($request) ? ($request->has('show_posts') ? $request->boolean('show_posts') : true) : null;

        if ($show_posts) {
            $post = $this->post->with(['floor', 'user'])
                ->where('slug', $slug)
                ->when($request && $request->hasAny(['text', 'images', 'videos']), function ($q) use ($text, $images, $videos) {
                    $q->where(function ($q) use ($text, $images, $videos) {
                        if ($text) {

                            $q->orWhere(function ($sub) {
                                $sub->whereNull('images')
                                    ->whereNull('videos');
                            });
                        }

                        if ($images) {

                            $q->orWhere(function ($sub) {
                                $sub->whereNotNull('images')
                                    ->whereNull('videos');
                            });
                        }

                        if ($videos) {

                            $q->orWhere(function ($sub) {
                                $sub->whereNotNull('videos');
                            });
                        }
                    });
                })
                ->first();

            if (! empty($post)) {
                $related_posts = $this->post
                    ->where('id', '!=', $post->id)
                    ->where(function ($q) use ($text, $images, $videos) {
                        if ($text) {

                            $q->orWhere(function ($sub) {
                                $sub->whereNull('images')
                                    ->whereNull('videos');
                            });
                        }

                        if ($images) {

                            $q->orWhere(function ($sub) {
                                $sub->whereNotNull('images')
                                    ->whereNull('videos');
                            });
                        }

                        if ($videos) {

                            $q->orWhere(function ($sub) {
                                $sub->whereNotNull('videos');
                            });
                        }
                    })
                    ->where(function ($query) use ($post) {
                        $query->where('title', 'like', '%'.$post->title.'%')
                            ->orWhere('content', 'like', '%'.$post->content.'%')
                            ->orWhere('tag', 'like', '%'.$post->tag.'%');
                    })
                    ->where('status', true)
                    ->with(['floor', 'user'])
                    ->take(5)
                    ->get();

                $post->related_posts = $related_posts;
            }

            return $post;
        }

        return null;

    }

    public function getSinglePostById(string $id)
    {
        $post = $this->post->with(['floor', 'user'])->find($id);

        return $post;
    }

    public function storePost(Request $request)
    {

        $validated_req = $request->validate([
            'title' => ['required', 'string', 'max:255', 'min:10'],
            'content' => ['required', 'string', 'min:20'],
            'images' => ['nullable', 'max:35', 'array'],
            'videos' => ['nullable', 'max:5', 'array'],
            'tag' => ['nullable', 'string', 'max:30', function ($attribute, $value, $fail) {
                if (str_contains($value, ',')) {
                    $fail('Only One Tag Allowed In The Post');
                }

                if (substr_count($value, '#') > 1 || str_contains($value, ' ') || str_contains($value, ',')) {
                    return $fail('Only one hashtag is allowed without spaces or commas.');
                }
            }],

            'post_type' => ['required', 'string', 'in:Review,Inquiry'],
            'status' => ['required', 'boolean'],
            'floor_id' => ['nullable', 'exists:floors,id'],
            'latitude' => ['nullable', 'numeric'],
            'longitude' => ['nullable', 'numeric'],
            'location_name' => ['nullable', 'string'],
            'status' => ['required', 'boolean'],
        ], [
            'images.max' => 'The :attribute field must not exceed 35 files.',
            'videos.max' => 'The :attribute field must not exceed 5 files.',
            'tag.max' => 'The :attribute field must not exceed 30 characters.',
            'tag.starts_with' => 'The :attribute field must start with #.',
            'floor_id.exists' => 'Selected Floor field does not exist.',

        ]);

        $validator = Validator::make($request->allFiles(), [
            'images.*' => [
                'mimes:jpg,jpeg,png',
                'max:10240',
            ],

            'videos.*' => [
                'mimes:mp4,mov,avi,webp,webm',
                'max:1048576',
            ],
        ], [
            'images.*.mimes' => 'Only JPG, JPEG, PNG, images are allowed.',
            'images.*.max' => 'Each image must not exceed 10MB.',
            'videos.*.mimes' => 'Only MP4, MOV, WEBP, WEBM and AVI videos are allowed.',
            'videos.*.max' => 'Each video must not exceed 1GB.',

        ], [
            'images.*' => 'image',
            'videos.*' => 'video',
        ]);

        if ($validator->fails()) {
            throw ValidationException::withMessages([
                'file_error' => $validator->errors()->first(),
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

            // Get Location Name  From Google Api Behalf Of Lat/lng
            if (empty($validated_req['location_name']) && ! empty($validated_req['latitude']) && ! empty($validated_req['longitude'])) {
                $response = $this->googleGeoCoderService->getLocationNameFromLatLng($validated_req['latitude'], $validated_req['longitude']);
                if ($response['status'] === false) {
                    throw new Exception($response['message']);
                }

                $validated_req['location_name'] = $response['place_name'] ?? 'No Location Name Found';
            }

            $post = $this->post->create($validated_req);
            if (empty($post)) {
                throw new Exception('Something Went Wrong While Creating Post');
            }

            if ($request->hasFile('images')) {
                $paths = [];

                foreach ($request->file('images') as $image) {
                    $new_name = time().uniqid().'-'.Str::random(10).'.'.$image->getClientOriginalExtension();

                    $resizedImage = ImageManager::imagick()
                        ->read($image)
                        ->encodeByExtension('jpg', quality: 70);

                    // $tempPath = $image->storeAs('temp/uploads', $new_name, 'local');

                    $tempPath = 'temp/uploads/'.$new_name;
                    Storage::disk('local')->put($tempPath, (string) $resizedImage);

                    $paths[] = $tempPath;
                }

                dispatch(new PostStoreOnAWSJob(['images' => $paths], $post));

            }

            if ($request->hasFile('videos')) {
                $paths = [];

                foreach ($request->file('videos') as $video) {
                    $new_name = time().uniqid().'-'.Str::random(10).'.'.$video->getClientOriginalExtension();
                    $tempPath = $video->storeAs('temp/uploads', $new_name, 'local');
                    $paths[] = $tempPath;
                }

                dispatch(new PostStoreOnAWSJob(['videos' => $paths], $post));
            }

            return [
                'status' => true,
                'message' => 'Post Created Successfully'.$request->hasFile('images') && $request->hasFile('videos') ? 'Please Wait While We Upload Your Files On Server' : '',
                'post' => $post,
            ];

        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function updatePost(Request $request, string $slug)
    {

        $validated_req = $request->validate([
            'title' => ['required', 'string', 'max:255', 'min:10'],
            'content' => ['required', 'string', 'min:20'],
            'images' => ['nullable', 'max:35', 'array'],
            'videos' => ['nullable', 'max:5', 'array'],
            'tag' => ['nullable', 'string', 'max:30', function ($attribute, $value, $fail) {
                if (str_contains($value, ',')) {
                    $fail('Only One Tag Allowed In The Post');
                }

                if (substr_count($value, '#') > 1 || str_contains($value, ' ') || str_contains($value, ',')) {
                    return $fail('Only one hashtag is allowed without spaces or commas.');
                }
            }],

            'post_type' => ['required', 'string', 'in:Review,Inquiry'],
            'status' => ['required', 'boolean'],
            'floor_id' => ['nullable'],
            'status' => ['required', 'boolean'],
        ], [
            'images.max' => 'The :attribute field must not exceed 35 files.',
            'videos.max' => 'The :attribute field must not exceed 5 files.',
            'tag.max' => 'The :attribute field must not exceed 30 characters.',
            'tag.starts_with' => 'The :attribute field must start with #.',
            'floor_id.exists' => 'Selected Floor field does not exist.',

        ]);

        $validator = Validator::make($request->allFiles(), [
            'new_images.*' => [
                'mimes:jpg,jpeg,png',
                'max:10240',
            ],

            'new_videos.*' => [
                'mimes:mp4,mov,avi,webp,webm',
                'max:1048576',
            ],
        ], [
            'new_images.*.mimes' => 'Only JPG, JPEG, PNG, images are allowed.',
            'new_images.*.max' => 'Each image must not exceed 10MB.',
            'new_videos.*.mimes' => 'Only MP4, MOV, WEBP, WEBM and AVI videos are allowed.',
            'new_videos.*.max' => 'Each video must not exceed 1GB.',

        ], [
            'images.*' => 'image',
            'videos.*' => 'video',
        ]);

        if ($validator->fails()) {
            throw ValidationException::withMessages([
                'file_error' => $validator->errors()->first(),
            ]);
        }

        try {

            $post = $this->post->where('slug', $slug)->where('status', true)->first();

            if (empty($post)) {
                throw new Exception('Post Not Found');
            }

            if ($request->filled('floor_id')) {
                $floor = Floor::find($request->floor_id);
                if (empty($floor)) {
                    throw new Exception('Selected Floor Does Not Exists');
                }
            }

            if (! empty($validated_req['tag']) && ! str_starts_with($validated_req['tag'], '#')) {
                $tag = $validated_req['tag'];
                $concatinated_tag = '#'.$tag;
                $validated_req['tag'] = $concatinated_tag;
            }

            $validated_req = array_filter($validated_req, function ($value, $key) {
                return ! in_array($key, ['images', 'videos']);
            }, ARRAY_FILTER_USE_BOTH);

            if ($request->filled('deleted_images')) {
                $deleted = $request->array('deleted_images');
                $deleted_image_urls = array_map(function ($deletedItem) {
                    return $deletedItem['url'] ?? null;
                }, $deleted);

                dispatch(new PostDestroyOnAWSJob(['images' => $deleted_image_urls]));

                $oldImages = $post->images ?? [];

                $remeaning_images = array_filter($oldImages, function ($image) use ($deleted) {
                    return ! in_array($image, $deleted);
                });

                $remaining_images_array = array_values($remeaning_images);

                $validated_req['images'] = $remaining_images_array;
            }

            if ($request->filled('deleted_videos')) {
                $deleted = $request->array('deleted_videos');
                $deleted_video_urls = array_map(function ($deletedItem) {
                    return $deletedItem['url'] ?? null;
                }, $deleted);

                dispatch(new PostDestroyOnAWSJob(['videos' => $deleted_video_urls]));

                $old_videos = $post->videos ?? [];

                $remeaning_videos = array_filter($old_videos, function ($video) use ($deleted) {
                    return ! in_array($video, $deleted);
                });

                $remaining_videos_array = array_values($remeaning_videos);

                $validated_req['videos'] = $remaining_videos_array;
            }

            $updated = $post->update($validated_req);

            if (! $updated) {
                throw new Exception('Something Went Wrong While Updating Post');
            }

            if ($request->hasFile('new_images')) {
                $paths = [];

                foreach ($request->file('new_images') as $image) {
                    $new_name = time().uniqid().'-'.Str::random(10).'.'.$image->getClientOriginalExtension();

                    $resizedImage = ImageManager::imagick()
                        ->read($image)
                        ->encodeByExtension('jpg', quality: 70);

                    // $tempPath = $image->storeAs('temp/uploads', $new_name, 'local');

                    $tempPath = 'temp/uploads/'.$new_name;
                    Storage::disk('local')->put($tempPath, (string) $resizedImage);

                    $paths[] = $tempPath;
                }

                dispatch(new PostUpdateOnAWSjob(['images' => $paths], $post));

            }

            if ($request->hasFile('new_videos')) {
                $paths = [];

                foreach ($request->file('new_videos') as $video) {
                    $new_name = time().uniqid().'-'.Str::random(10).'.'.$video->getClientOriginalExtension();
                    $tempPath = $video->storeAs('temp/uploads', $new_name, 'local');
                    $paths[] = $tempPath;
                }

                dispatch(new PostUpdateOnAWSjob(['videos' => $paths], $post));
            }

            $post->refresh();

            return [
                'status' => true,
                'message' => 'Post Updated Successfully '.$request->hasFile('images') && $request->hasFile('videos') ? 'Please Wait While We Upload Your Files On Server' : '',
                'post' => $post,
            ];

        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function destroyPost(string $id)
    {
        try {
            $post = $this->getSinglePostById($id);

            if (empty($post)) {
                throw new Exception('Post Not Found');
            }

            if (! blank($post->post_image_urls)) {
                dispatch(new PostDestroyOnAWSJob(['images' => $post->post_image_urls]));
            }

            if (! blank($post->post_video_urls)) {
                dispatch(new PostDestroyOnAWSJob(['videos' => $post->post_video_urls]));
            }

            $deleted = $post->delete();

            if (! $deleted) {
                throw new Exception('Something Went Wrong While Deleting Post');
            }

            return [
                'status' => true,
                'message' => 'Post Deleted Successfully',
            ];

        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function destroyPostBySelection(Request $request)
    {
        try {

            $ids = $request->array('ids');
            if (blank($ids)) {
                throw new Exception('Please Select Atleast One Post');
            }

            $posts = $this->post->whereIn('id', $ids)->get();
            if ($posts->isEmpty()) {
                throw new Exception('Given Post Ids Are incorrect');
            }

            foreach ($posts as $post) {
                if (! blank($post->post_image_urls)) {
                    dispatch(new PostDestroyOnAWSJob(['images' => $post->post_image_urls]));
                }

                if (! blank($post->post_video_urls)) {
                    dispatch(new PostDestroyOnAWSJob(['videos' => $post->post_video_urls]));
                }

                $post->delete();
            }

            return [
                'status' => true,
                'message' => 'Posts Deleted Successfully',
            ];

        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
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
                'data' => ['lat' => $response['data']['lat'], 'lng' => $response['data']['lng'], 'place_name' => $response['data']['place_name'], 'formatted_address' => $response['data']['formatted_address']],
            ];

        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function toggleBookmark(Request $request)
    {

        $request->validate([
            'post_id' => 'required|exists:posts,id',
        ]);

        try {
            $user = $request->user();
            $post_id = $request->input('post_id');

            if ($user->bookMarkedPosts()->where('post_id', $post_id)->exists()) {
                $user->bookMarkedPosts()->detach($post_id);

                return [
                    'status' => true,
                    'message' => 'Post Removed Successfully from bookmarks',
                ];
            }

            $user->bookMarkedPosts()->attach($post_id);

            return [
                'status' => true,
                'message' => 'Post Added Successfully to bookmarks',
            ];

        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    // Fetching Posts For Website
    public function getPostsForWebsite(Request $request)
    {

        $images = $request->boolean('images', true);
        $text = $request->boolean('text', true);
        $videos = $request->boolean('videos', true);
        $show_products = $request->boolean('show_products', true);
        $show_posts = $request->boolean('show_posts', true);

        $page = $request->input('page', 1);
        $perPage = 10;

        $results = collect();
        $hasMore = false;
        $hasMoreSmartphones = false;
        $posts = [];
        $smartphones = [];

        if ($show_posts) {
            $posts = $this->post
                ->where('status', true)
                ->where(function ($q) use ($text, $images, $videos) {
                    if ($text) {

                        $q->orWhere(function ($sub) {
                            $sub->whereNull('images')
                                ->whereNull('videos');
                        });
                    }

                    if ($images) {

                        $q->orWhere(function ($sub) {
                            $sub->whereNotNull('images')
                                ->whereNull('videos');
                        });
                    }

                    if ($videos) {

                        $q->orWhere(function ($sub) {
                            $sub->whereNotNull('videos');
                        });
                    }
                })
                ->with(['floor', 'user'])
                ->latest()
                ->forPage($page, $perPage)
                ->get()
                ->map(function ($post) use ($images, $text, $videos) {
                    $related_posts = $this->post
                        ->where('id', '!=', $post->id)
                        ->where(function ($q) use ($text, $images, $videos) {
                            if ($text) {

                                $q->orWhere(function ($sub) {
                                    $sub->whereNull('images')
                                        ->whereNull('videos');
                                });
                            }

                            if ($images) {

                                $q->orWhere(function ($sub) {
                                    $sub->whereNotNull('images')
                                        ->whereNull('videos');
                                });
                            }

                            if ($videos) {

                                $q->orWhere(function ($sub) {
                                    $sub->whereNotNull('videos');
                                });
                            }
                        })
                        ->where(function ($query) use ($post) {
                            $query->where('title', 'like', '%'.$post->title.'%')
                                ->orWhere('content', 'like', '%'.$post->content.'%')
                                ->orWhere('tag', 'like', '%'.$post->tag.'%');
                        })
                        ->where('status', true)
                        ->with(['floor', 'user'])
                        ->take(5);

                    $post->related_posts = $related_posts->get();

                    $post->type = 'posts';

                    return $post;
                });

            $hasMore = $hasMore || ($posts->count() === $perPage);

        }

        if ($show_products) {
            $smartphones = $this->smartphone
                ->with(['model_name', 'capacity', 'selling_info'])
                ->withCount('inventory_items')
                ->whereHas('selling_info')
                ->whereNotNull('slug')
                ->latest()
                ->forPage($page, $perPage)
                ->get()
                ->map(function ($smartphone) {
                    return [
                        'id' => $smartphone->id,
                        'name' => $smartphone->model_name->name,
                        'capacity' => $smartphone->capacity->name,
                        'images' => $smartphone->smartphone_image_urls,
                        'colors' => $smartphone->colors,
                        'upc' => $smartphone->upc,
                        'selling_info' => $smartphone->selling_info,
                        'inventory_items_count' => $smartphone->inventory_items_count,
                        'slug' => $smartphone->slug,
                        'tag' => $smartphone->tag,
                        'content' => $smartphone->content,
                        'type' => 'smartphone',

                    ];
                });

            $hasMoreSmartphones = $smartphones->count() === $perPage;

            $hasMore = $hasMore || ($smartphones->count() === $perPage);

        }

        $results = $results->merge([
            'posts' => $posts,
            'products' => [
                'smartphones' => $smartphones,
            ],
        ]);

        $queryParams = [
            'page' => $page + 1,
            'images' => $images,
            'text' => $text,
            'videos' => $videos,
            'show_products' => $show_products,
            'show_posts' => $show_posts,
        ];

        $nextParams = $queryParams;
        $nextParams['page'] = $page + 1;

        $prevParams = $queryParams;
        $prevParams['page'] = max(1, $page - 1);

        return [
            'status' => true,
            'data' => $results,
            'pagination' => [
                'has_more_smartphones' => $hasMoreSmartphones,
                'current_page' => (int) $page,
                'per_page' => (int) $perPage,
                'has_more_pages' => $hasMore,
                'next_page' => $hasMore ? $page + 1 : null,
                'total' => (count($results['posts']) ?? 0) + (count($results['products']['smartphones']) ?? 0),
                'next_page_url' => $hasMore ? route('website.posts.index').'?'.http_build_query($nextParams) : null,
                'prev_page_url' => $page > 1 ? route('website.posts.index').'?'.http_build_query($prevParams) : null,
            ],

        ];
    }

    // public function getInfinityScrollablePostsForWebsite(Request $request)
    // {

    //     $images = $request->boolean('images', true);
    //     $text = $request->boolean('text', true);
    //     $videos = $request->boolean('videos', true);

    //     $posts = $this->post
    //         ->where('status', true)
    //         ->where(function ($q) use ($text, $images, $videos) {
    //             if ($text) {

    //                 $q->orWhere(function ($sub) {
    //                     $sub->whereNull('images')
    //                         ->whereNull('videos');
    //                 });
    //             }

    //             if ($images) {

    //                 $q->orWhere(function ($sub) {
    //                     $sub->whereNotNull('images')
    //                         ->whereNull('videos');
    //                 });
    //             }

    //             if ($videos) {

    //                 $q->orWhere(function ($sub) {
    //                     $sub->whereNotNull('videos');
    //                 });
    //             }
    //         })
    //         ->with(['floor', 'user'])
    //         ->latest()
    //         ->paginate(10)
    //         ->appends([
    //             'images' => $images,
    //             'text' => $text,
    //             'videos' => $videos,
    //         ]);

    //     $posts->getCollection()->transform(function ($post) use ($images, $text, $videos) {
    //         $related_posts = $this->post
    //             ->where('id', '!=', $post->id)
    //             ->where(function ($q) use ($text, $images, $videos) {
    //                 if ($text) {

    //                     $q->orWhere(function ($sub) {
    //                         $sub->whereNull('images')
    //                             ->whereNull('videos');
    //                     });
    //                 }

    //                 if ($images) {

    //                     $q->orWhere(function ($sub) {
    //                         $sub->whereNotNull('images')
    //                             ->whereNull('videos');
    //                     });
    //                 }

    //                 if ($videos) {

    //                     $q->orWhere(function ($sub) {
    //                         $sub->whereNotNull('videos');
    //                     });
    //                 }
    //             })
    //             ->where(function ($query) use ($post) {
    //                 $query->where('title', 'like', '%'.$post->title.'%')
    //                     ->orWhere('content', 'like', '%'.$post->content.'%')
    //                     ->orWhere('tag', 'like', '%'.$post->tag.'%');
    //             })
    //             ->where('status', true)
    //             ->with(['floor', 'user'])
    //             ->take(5)
    //             ->get();

    //         $post->related_posts = $related_posts;

    //         return $post;
    //     });

    //     return [
    //         'posts' => $posts->items(),
    //         'next_page_url' => $posts->nextPageUrl(),

    //     ];
    // }

    public function getGoogleMapSettings()
    {
        return Cache::get('google_map_settings');
    }

    public function getRelatedPosts(Request $request, ?string $slug = null)
    {

        try {
            $post = $this->post->where('slug', $slug)->where('status', true)->first();

            if (empty($post)) {
                return [
                    'status' => true,
                    'related_posts' => [],
                ];
            }

            $images = $request->boolean('images', true);
            $text = $request->boolean('text', true);
            $videos = $request->boolean('videos', true);

            $related_posts = $this->post
                ->where('id', '!=', $post->id)
                ->where(function ($q) use ($text, $images, $videos) {
                    if ($text) {

                        $q->orWhere(function ($sub) {
                            $sub->whereNull('images')
                                ->whereNull('videos');
                        });
                    }

                    if ($images) {

                        $q->orWhere(function ($sub) {
                            $sub->whereNotNull('images')
                                ->whereNull('videos');
                        });
                    }

                    if ($videos) {

                        $q->orWhere(function ($sub) {
                            $sub->whereNotNull('videos');
                        });
                    }
                })
                ->where(function ($query) use ($post) {
                    $query->where('title', 'like', '%'.$post->title.'%')
                        ->orWhere('content', 'like', '%'.$post->content.'%')
                        ->orWhere('tag', 'like', '%'.$post->tag.'%');
                })
                ->where('status', true)
                ->with(['floor', 'user'])
                ->paginate(10)
                ->appends(array_merge(
                    $request->only(['images', 'text', 'videos']),
                    ['slug' => $slug]
                ))
                ->withPath(route('website.posts.getrelated'));

            return [
                'status' => true,
                'related_posts' => $related_posts,
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function hashtagResults(Request $request, ?string $hashtag, array $preferences = [])
    {
        try {

            $text = $preferences['text'] ?? true;
            $images = $preferences['images'] ?? true;
            $videos = $preferences['videos'] ?? true;
            $show_posts = $preferences['show_posts'] ?? true;
            $show_products = $preferences['show_products'] ?? true;

            $page = $request->input('page', 1);
            $perPage = 10;
            $hasMore = false;
            $data = [];

            if ($show_posts) {
                $posts = $this->post
                    ->where('tag', $hashtag)
                    ->where('status', true)
                    ->where(function ($q) use ($text, $images, $videos) {
                        if ($text) {

                            $q->orWhere(function ($sub) {
                                $sub->whereNull('images')
                                    ->whereNull('videos');
                            });
                        }

                        if ($images) {

                            $q->orWhere(function ($sub) {
                                $sub->whereNotNull('images')
                                    ->whereNull('videos');
                            });
                        }

                        if ($videos) {

                            $q->orWhere(function ($sub) {
                                $sub->whereNotNull('videos');
                            });
                        }
                    })
                    ->with(['floor', 'user'])
                    ->latest()
                    ->forPage($page, $perPage)
                    ->get()
                    ->map(function ($post) {
                        return [
                            'id' => $post->id,
                            'title' => Str::length($post->title) > 30 ? Str::limit($post->title, 30, '...') : $post->title,
                            'slug' => $post->slug,
                            'location_name' => $post->location_name,
                            'latitude' => $post->latitude,
                            'longitude' => $post->longitude,
                            'image' => $post->post_image_urls && count($post->post_image_urls) > 0 ? $post->post_image_urls[0] : null,
                            'tag' => $post->tag,
                            'floor' => $post?->floor?->name,
                            'created_at' => $post->created_at->format('Y-m-d g:i A '),
                            'timestamp' => $post->created_at->timestamp,
                            'type' => 'posts',
                        ];
                    });

                $data['posts'] = $posts;
                $hasMore = $hasMore || ($posts->count() === $perPage);
            }

            if ($show_products) {
                $smartphones = $this->smartphone
                    ->where('tag', $hashtag)
                    ->with(['model_name', 'capacity', 'selling_info'])
                    ->withCount('inventory_items')
                    ->whereHas('selling_info')
                    ->whereNotNull('slug')
                    ->latest()
                    ->forPage($page, $perPage)
                    ->get()
                    ->map(function ($smartphone) {
                        return [
                            'id' => $smartphone->id,
                            'name' => $smartphone->model_name->name,
                            'capacity' => $smartphone->capacity->name,
                            'image' => $smartphone->smartphone_image_urls[0],
                            'colors' => $smartphone->colors,
                            'upc' => $smartphone->upc,
                            'selling_info' => $smartphone->selling_info,
                            'inventory_items_count' => $smartphone->inventory_items_count,
                            'slug' => $smartphone->slug,
                            'tag' => $smartphone->tag,
                            'type' => 'smartphone',
                            'created_at' => $smartphone->created_at->format('Y-m-d g:i A '),
                            'timestamp' => $smartphone->created_at->timestamp,

                        ];
                    });

                $hasMore = $hasMore || ($smartphones->count() === $perPage);
                $data['products'] = [
                    'smartphones' => $smartphones,
                ];
            }

            $queryParams = [
                'page' => $page + 1,
                'images' => $images,
                'text' => $text,
                'videos' => $videos,
                'show_products' => $show_products,
                'show_posts' => $show_posts,
            ];

            $nextParams = $queryParams;
            $nextParams['page'] = $page + 1;

            $prevParams = $queryParams;
            $prevParams['page'] = max(1, $page - 1);

            return [
                'status' => true,
                'data' => $data,
                'pagination' => [
                    'current_page' => (int) $page,
                    'per_page' => (int) $perPage,
                    'has_more_pages' => $hasMore,
                    'next_page' => $hasMore ? $page + 1 : null,
                    'total' => (count($data['posts']) ?? 0) + (count($data['products']['smartphones']) ?? 0),
                    'next_page_url' => $hasMore ? route('website.posts.hashtag-results').'?'.http_build_query($nextParams) : null,
                    'prev_page_url' => $page > 1 ? route('website.posts.hashtag-results').'?'.http_build_query($prevParams) : null,
                ],

            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }
}
