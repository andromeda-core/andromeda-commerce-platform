<?php

namespace App\Repositories\Posts\Repository;

use App\Helpers\Trans;
use App\Jobs\CompressPostVideoWithFFMPEG;
use App\Jobs\PostDestroyOnAWSJob;
use App\Jobs\PostStoreOnAWSJob;
use App\Jobs\PostUpdateOnAWSjob;
use App\Models\Currency;
use App\Models\Floor;
use App\Models\LodgingProduct;
use App\Models\Post;
use App\Models\Smartphone;
use App\Models\User;
use App\Repositories\Lodging\Interface\ILodgingProductRepository;
use App\Repositories\Posts\Interface\IPostRepository;
use App\Services\ContentTranslationService;
use App\Services\GoogleGeoCoderService;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use Intervention\Image\Encoders\WebpEncoder;
use Intervention\Image\ImageManager;
use Str;

class PostRepository implements IPostRepository
{
    public function __construct(
        private Post $post,
        private GoogleGeoCoderService $googleGeoCoderService,
        private Smartphone $smartphone,
        private Trans $trans,
        private ContentTranslationService $contentTranslationService,
        private ILodgingProductRepository $lodging_product_repository,
        private LodgingProduct $lodging_product,
    ) {}

    public function getAllPosts(Request $request)
    {
        $posts = $this->post
            ->when(! $request->user()->hasRole('Admin'), function ($query) use ($request) {
                $query->where('user_id', $request->user()->id);
            })
            ->when(! empty($request->input('search')), function ($query) use ($request) {
                $query->where('title', 'like', '%'.$request->input('search').'%');
            })
            ->when(! empty($request->input('user_id')), function ($query) use ($request) {
                $query->where('user_id', $request->input('user_id'));
            })
            ->with(['floor', 'user'])
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return $posts;
    }

    // Users who authored at least one post, scoped the same way getAllPosts() scopes the list itself
    // (non-Admins only ever see their own posts, so their filter dropdown must not leak other authors).
    public function getPostAuthorsForFilter(Request $request)
    {
        return User::query()
            ->whereHas('posts')
            ->when(! $request->user()->hasRole('Admin'), function ($query) use ($request) {
                $query->where('id', $request->user()->id);
            })
            ->orderBy('name')
            ->get(['id', 'name']);
    }

    public function getSinglePostBySlug(string $identifier, ?Request $request = null, $isBackend = false)
    {

        // $from_backend = ! empty($request) ? ($request->has('from_backend') ? $request->boolean('from_backend') : false) : false;

        $images = ! empty($request) ? ($request->has('images') ? $request->boolean('images') : true) : null;
        $videos = ! empty($request) ? ($request->has('videos') ? $request->boolean('videos') : true) : null;
        $text = ! empty($request) ? ($request->has('text') ? $request->boolean('text') : true) : null;
        $show_posts = ! empty($request) ? ($request->has('show_posts') ? $request->boolean('show_posts') : true) : null;
        $show_products = ! empty($request) ? ($request->has('show_products') ? $request->boolean('show_products') : true) : null;

        $post = $this->post->with(['floor', 'user', 'contentTranslations'])
            ->where(function ($q) use ($identifier) {
                $q->where('public_id', $identifier)
                    ->orWhere('slug', $identifier);
            })
            ->when(! empty($show_posts), function ($q) {
                $q->where('status', true);
            })

            // its For restricting The Text Only Posts -> Not needed Now
            ->when($isBackend, function ($q) use ($request) {
                $user = $request?->user();
                if (! $user || ! $user->hasRole('Admin')) {
                    $q->where('user_id', $user?->id);
                }
            })
            // ->when($request && $request->hasAny(['text', 'images', 'videos']), function ($q) use ($images, $videos, $text) {
            //     $q->where(function ($q) use ($images, $videos, $text) {
            //         if ($text) {

            //             $q->orWhere(function ($sub) {
            //                 $sub->whereNull('images')
            //                     ->whereNull('videos');
            //             });
            //         }

            //         if ($images) {

            //             $q->orWhere(function ($sub) {
            //                 $sub->whereNotNull('images')
            //                     ->whereNull('videos');
            //             });
            //         }

            //         if ($videos) {

            //             $q->orWhere(function ($sub) {
            //                 $sub->whereNotNull('videos');
            //             });
            //         }
            //     });
            // })
            ->first();

        if (! empty($post) && ! $isBackend) {
            $related_posts = collect();
            $related_smartphones = collect();

            $related_posts = $this->post
                ->where('id', '!=', $post->id)

                // its For restricting The Text Only Posts -> Not needed Now
                // ->where(function ($sub) {
                //     $sub->whereRaw('JSON_LENGTH(images) > 0')
                //         ->orWhereRaw('JSON_LENGTH(videos) > 0');
                // })
                // ->where(function ($q) use ($images, $videos, $text) {
                //     if ($text) {

                //         $q->orWhere(function ($sub) {
                //             $sub->whereNull('images')
                //                 ->whereNull('videos');
                //         });
                //     }

                //     if ($images) {

                //         $q->orWhere(function ($sub) {
                //             $sub->whereNotNull('images')
                //                 ->whereNull('videos');
                //         });
                //     }

                //     if ($videos) {

                //         $q->orWhere(function ($sub) {
                //             $sub->whereNotNull('videos');
                //         });
                //     }
                // })
                ->where('tag', $post->tag)
                ->where('status', true)
                ->with(['floor', 'user', 'contentTranslations'])
                ->limit(5)
                ->get()
                ->map(function ($post) {
                    $post->type = 'posts';
                    $post->title = $post->translatedValue('title');
                    $post->content = $post->translatedValue('content');
                    $post->tag_display = $post->translatedValue('tag');
                    $post->location_name_display = $post->translatedValue('location_name');

                    return $post;
                });

            if ($show_products) {
                $related_smartphones = $this->smartphone
                    ->where(function ($q) use ($images, $videos, $text) {
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
                    ->whereHas('selling_info')
                    ->whereNotNull('slug')
                    ->with(['capacity:id,name', 'selling_info', 'selling_info.shipping_fee', 'floor', 'selling_info.import_tax', 'country:id,name', 'condition:id,name', 'courier_company:id,courier_name', 'return_policy:id,slug', 'shipping_policy:id,slug', 'contentTranslations', 'model_name.contentTranslations'])
                    ->where('tag', $post->tag)
                    ->withCount([
                        'inventory_items' => function ($query) {
                            $query->where('status', 'in_stock');
                        },
                    ])

                    ->latest()
                    ->limit(5)
                    ->get()
                    ->map(function ($smartphone) {

                        return [
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
                            'delivery_days' => $smartphone?->delivery_days,
                            'return_policy' => $smartphone?->return_policy,
                            'shipping_policy' => $smartphone?->shipping_policy,
                            'addons' => $smartphone?->addons,
                            'inventory_items_count' => $smartphone->inventory_items_count,
                            'slug' => $smartphone->slug,
                            'public_id' => $smartphone->public_id,
                            'tag' => $smartphone->tag,
                            'tag_display' => $smartphone->translatedValue('tag'),
                            'location_name_display' => $smartphone->translatedValue('location_name'),
                            'is_sold_out' => $smartphone->is_sold_out,
                            'content' => $smartphone->translatedValue('content'),
                            'type' => 'smartphones',
                            'added_at' => $smartphone->added_at,
                            'created_at_time' => $smartphone->created_at_time,
                            'product_details' => $smartphone->translatedValue('product_details'),
                        ];
                    });
            }

            // Stage refinement — related lodging (tag-based) injected alongside posts + smartphones.
            $related_lodging = collect();
            if ($show_products && ! empty($post->tag)) {
                $related_lodging = $this->lodging_product_repository
                    ->getRelatedLodgingForFeed([$post->tag], $images ?? true, $videos ?? true, $text ?? true)
                    ->take(5)
                    ->values();
            }

            $post->related = collect([...$related_posts, ...$related_smartphones, ...$related_lodging])->shuffle();
            $post->type = 'posts';
            $post->title = $post->translatedValue('title');
            $post->content = $post->translatedValue('content');
            $post->tag_display = $post->translatedValue('tag');
            $post->location_name_display = $post->translatedValue('location_name');
        }

        return $post;

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
            'created_at' => ['nullable', 'date'],
            // OLD (removed Phase 2 — superseded by the Ad Banner Archive content-embed system):
            // 'banner_image_url' => ['nullable', 'url'],
            // 'banner_redirect_url' => ['nullable', 'url'],
            // 'banner_position' => ['nullable', 'in:top,bottom'],
        ], [
            'images.max' => 'The :attribute field must not exceed 35 files.',
            'videos.max' => 'The :attribute field must not exceed 5 files.',
            'tag.max' => 'The :attribute field must not exceed 30 characters.',
            'tag.starts_with' => 'The :attribute field must start with #.',
            'floor_id.exists' => 'Selected Floor field does not exist.',

        ]);

        $validator = Validator::make($request->allFiles(), [
            'images.*' => [
                'mimes:jpg,jpeg,png,webp',
                'max:10240',
            ],

            'videos.*' => [
                'mimes:mp4,mov,avi,webp,webm',
                'max:1048576',
            ],
        ], [
            'images.*.mimes' => 'Only JPG, JPEG, PNG, WEBP images are allowed.',
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

        // Light, non-breaking validation for optional manual content translations (Phase 1).
        // Validated separately so the `translations` key never leaks into create() under strict mode.
        $translationsValidator = Validator::make($request->all(), [
            'translations' => ['sometimes', 'array'],
            'translations.*.language_id' => ['required_with:translations', 'integer', 'exists:languages,id'],
            'translations.*.fields' => ['sometimes', 'array'],
        ]);

        if ($translationsValidator->fails()) {
            throw ValidationException::withMessages([
                'translation_error' => $translationsValidator->errors()->first(),
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

            if ($request->filled('created_at')) {
                $validated_req['created_at'] = $request->date('created_at');
            } else {
                unset($validated_req['created_at']);
            }

            $post = $this->post->create($validated_req);
            if (empty($post)) {
                throw new Exception('Something Went Wrong While Creating Post');
            }

            if ($request->hasFile('images')) {
                $paths = [];

                foreach ($request->file('images') as $image) {
                    $new_name = time().uniqid().'-'.Str::random(10).'.webp';

                    $resizedImage = ImageManager::imagick()
                        ->read($image)
                        ->scaleDown(1800)
                        ->encode(new WebpEncoder(quality: 70));

                    // $tempPath = $image->storeAs('temp/uploads', $new_name, 'local');

                    $tempPath = 'temp/uploads/'.$new_name;
                    Storage::disk('local')->put($tempPath, (string) $resizedImage);

                    $paths[] = $tempPath;
                }

                dispatch(new PostStoreOnAWSJob(['images' => $paths], $post));
            }

            if ($request->hasFile('videos')) {
                $tempPaths = [];

                foreach ($request->file('videos') as $video) {
                    $originalName = time().uniqid().'-'.Str::random(8).'.'.$video->getClientOriginalExtension();
                    $tempPaths[] = $video->storeAs('temp/uploads', $originalName, 'local');
                }

                dispatch(new CompressPostVideoWithFFMPEG($tempPaths, $post, 'store'))->onQueue('video');
            }

            // No-op unless a `translations` payload is sent (Phase 2 dashboard form).
            $this->contentTranslationService->syncTranslations(
                $post,
                (array) ($request->input('translations') ?? []),
                true
            );

            $hasMedia = ($request->hasFile('videos') || $request->hasFile('images'));

            $message = 'Post Created Successfully';

            if ($hasMedia) {
                $message .= ' Please Wait While We Upload Your Files On Server';
            }

            return [
                'status' => true,
                'message' => $message,

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

        // dump($request->all());
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
            'latitude' => ['nullable', 'numeric'],
            'longitude' => ['nullable', 'numeric'],
            'location_name' => ['nullable', 'string'],
            'status' => ['required', 'boolean'],
            'created_at' => ['nullable', 'date'],
            // OLD (removed Phase 2 — superseded by the Ad Banner Archive content-embed system):
            // 'banner_image_url' => ['nullable', 'url'],
            // 'banner_redirect_url' => ['nullable', 'url'],
            // 'banner_position' => ['nullable', 'in:top,bottom'],
        ], [
            'images.max' => 'The :attribute field must not exceed 35 files.',
            'videos.max' => 'The :attribute field must not exceed 5 files.',
            'tag.max' => 'The :attribute field must not exceed 30 characters.',
            'tag.starts_with' => 'The :attribute field must start with #.',
            'floor_id.exists' => 'Selected Floor field does not exist.',

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
                'file_error' => $validator->errors()->first(),
            ]);
        }

        // Light, non-breaking validation for optional manual content translations (Phase 1).
        // Validated separately so the `translations` key never leaks into update() under strict mode.
        $translationsValidator = Validator::make($request->all(), [
            'translations' => ['sometimes', 'array'],
            'translations.*.language_id' => ['required_with:translations', 'integer', 'exists:languages,id'],
            'translations.*.fields' => ['sometimes', 'array'],
        ]);

        if ($translationsValidator->fails()) {
            throw ValidationException::withMessages([
                'translation_error' => $translationsValidator->errors()->first(),
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

            // Get Location Name  From Google Api Behalf Of Lat/lng
            if (empty($validated_req['location_name']) && ! empty($validated_req['latitude']) && ! empty($validated_req['longitude'])) {
                $response = $this->googleGeoCoderService->getLocationNameFromLatLng($validated_req['latitude'], $validated_req['longitude']);
                if ($response['status'] === false) {
                    throw new Exception($response['message']);
                }

                $validated_req['location_name'] = $response['place_name'] ?? 'No Location Name Found';
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

                dispatch(new PostDestroyOnAWSJob(['videos' => $deleted]));

                $old_videos = $post->videos ?? [];

                $remeaning_videos = array_filter($old_videos, function ($video) use ($deleted) {
                    return ! in_array($video, $deleted);
                });

                $remaining_videos_array = array_values($remeaning_videos);

                $validated_req['videos'] = $remaining_videos_array;
            }

            if (array_key_exists('images', $validated_req) && empty($validated_req['images'])) {
                $validated_req['images'] = null;
            }

            if (array_key_exists('videos', $validated_req) && empty($validated_req['videos'])) {
                $validated_req['videos'] = null;
            }

            // Handle Image Reordering
            if ($request->filled('image_order')) {

                $currentImages = $post->images ?? [];

                $orderedImages = [];

                foreach ($request->image_order as $url) {

                    foreach ($currentImages as $image) {

                        if (isset($image['url']) && $image['url'] === $url) {
                            $orderedImages[] = $image;
                            break;
                        }
                    }
                }

                // Safety: Prevent accidental overwrite
                if (! empty($orderedImages)) {
                    $validated_req['images'] = $orderedImages;
                }
            }

            // Handle Video Reordering
            if ($request->filled('video_order')) {

                $currentVideos = $post->videos ?? [];

                // Create lookup map by URL
                $videoMap = collect($currentVideos)->keyBy('url')->toArray();

                $orderedVideos = [];

                foreach ($request->video_order as $url) {
                    if (isset($videoMap[$url])) {
                        $orderedVideos[] = $videoMap[$url];
                    }
                }

                // Safety check to prevent wiping data
                if (! empty($orderedVideos)) {
                    $validated_req['videos'] = $orderedVideos;
                }
            }

            // dd($validated_req);

            if ($request->filled('created_at')) {
                $validated_req['created_at'] = $request->date('created_at');
            } else {
                unset($validated_req['created_at']);
            }

            $updated = $post->update($validated_req);

            if (! $updated) {
                throw new Exception('Something Went Wrong While Updating Post');
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

                dispatch(new PostUpdateOnAWSjob(['images' => $paths], $post));
            }

            if ($request->hasFile('new_videos')) {

                $tempPaths = [];

                foreach ($request->file('new_videos') as $video) {
                    $originalName = time().uniqid().'-'.Str::random(8).'.'.$video->getClientOriginalExtension();
                    $tempPaths[] = $video->storeAs('temp/uploads', $originalName, 'local');
                }
                dispatch(new CompressPostVideoWithFFMPEG($tempPaths, $post, 'update'))->onQueue('video');
            }

            $post->refresh();

            // No-op unless a `translations` payload is sent (Phase 2 dashboard form).
            $this->contentTranslationService->syncTranslations(
                $post,
                (array) ($request->input('translations') ?? []),
                true
            );

            $hasMedia = ($request->hasFile('new_videos') || $request->hasFile('new_images'));

            $message = 'Post Updated Successfully';

            if ($hasMedia) {
                $message .= ' Please Wait While We Upload Your Files On Server';
            }

            return [
                'status' => true,
                'message' => $message,

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

                if (! blank($post->videos)) {
                    dispatch(new PostDestroyOnAWSJob(['videos' => $post->videos]));
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
                    'message' => $this->trans->get('Post Removed Successfully from bookmarks'),
                ];
            }

            $user->bookMarkedPosts()->attach($post_id);

            return [
                'status' => true,
                'message' => $this->trans->get('Post Added Successfully to bookmarks'),
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    // Fetching Feed For Website
    public function getPostsAndProductsForWebsite(Request $request)
    {

        $images = $request->boolean('images', true);
        $text = $request->boolean('text', true);
        $videos = $request->boolean('videos', true);
        $show_products = $request->boolean('show_products', true);
        $show_posts = $request->boolean('show_posts', true);

        $page = $request->input('page', 1);
        $perPage = 10;

        $cacheTags = [
            'images:'.(int) $images,
            'text:'.(int) $text,
            'videos:'.(int) $videos,
            'products:'.(int) $show_products,
            'posts:'.(int) $show_posts,
            "page:{$page}",
        ];

        $cacheKey = app()->getLocale().':'.implode(':', $cacheTags);

        return Cache::tags(['feed'])->rememberForever($cacheKey, function () use ($images, $videos, $text, $show_products, $show_posts, $page, $perPage) {

            $results = collect();
            $hasMore = false;
            $posts = [];
            $smartphones = [];
            $lodging_properties = collect();

            if ($show_posts) {
                $posts = $this->post
                    ->where('status', true)
                    // its For restricting The Text Only Posts -> Not needed Now
                    // ->where(function ($sub) {
                    //     $sub->whereRaw('JSON_LENGTH(images) > 0')
                    //         ->orWhereRaw('JSON_LENGTH(videos) > 0');
                    // })
                    ->where(function ($q) use ($images, $videos, $text) {
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
                    ->with([
                        'floor:id,name',
                        'user:id,name',
                        'contentTranslations',
                    ])
                    ->orderBy('created_at', 'desc')
                    ->orderBy('id', 'desc')
                    ->forPage($page, $perPage)
                    ->get();

                $allHashtags = [];
                foreach ($posts as $post) {
                    if (! empty($post->tag)) {
                        $allHashtags[] = $post->tag;
                        $post->hashtag = $post->tag;
                    }
                }
                $allHashtags = array_unique($allHashtags);
                $relatedPosts = collect();

                if (! blank($allHashtags)) {
                    $relatedPosts = $this->post->where('status', true)
                        ->whereIn('tag', $allHashtags)
                        // its For restricting The Text Only Posts -> Not needed Now
                        // ->where(function ($sub) {
                        //     $sub->whereRaw('JSON_LENGTH(images) > 0')
                        //         ->orWhereRaw('JSON_LENGTH(videos) > 0');
                        // })
                        ->where(function ($q) use ($images, $videos, $text) {
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
                        ->with(['floor:id,name', 'user:id,name', 'contentTranslations'])
                        ->limit(50)
                        ->get()
                        ->map(function ($post) {

                            $post->type = 'posts';
                            $post->title = $post->translatedValue('title');
                            $post->content = $post->translatedValue('content');
                            $post->tag_display = $post->translatedValue('tag');
                            $post->location_name_display = $post->translatedValue('location_name');

                            return $post;
                        });
                }

                $relatedSmartphones = collect();

                if ($show_products && ! blank($allHashtags)) {
                    $relatedSmartphones = $this->smartphone
                        ->where(function ($q) use ($images, $videos, $text) {
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
                        ->whereNotNull('slug')
                        ->whereHas('selling_info')
                        ->whereIn('tag', $allHashtags)
                        ->with(['capacity:id,name', 'selling_info', 'selling_info.shipping_fee', 'floor', 'selling_info.import_tax', 'country:id,name', 'condition:id,name', 'courier_company:id,courier_name', 'return_policy:id,slug', 'shipping_policy:id,slug', 'contentTranslations', 'model_name.contentTranslations'])
                        ->withCount([
                            'inventory_items' => function ($query) {
                                $query->where('status', 'in_stock');
                            },
                        ])

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
                                'location_name_display' => $smartphone->translatedValue('location_name'),
                                'is_sold_out' => $smartphone->is_sold_out,
                                'content' => $smartphone->translatedValue('content'),
                                'type' => 'smartphones',
                                'added_at' => $smartphone->added_at,
                                'created_at_time' => $smartphone->created_at_time,
                                'created_at' => $smartphone->created_at,
                                'product_details' => $smartphone->translatedValue('product_details'),
                            ];
                        });
                }

                // Stage refinement — related lodging (tag-based) injected alongside posts + smartphones.
                $relatedLodging = collect();
                if ($show_products && ! blank($allHashtags)) {
                    $relatedLodging = $this->lodging_product_repository
                        ->getRelatedLodgingForFeed($allHashtags, $images, $videos, $text);
                }

                foreach ($posts as $post) {
                    $postHashtag = $post->tag;

                    $postRelatedPosts = $relatedPosts
                        ->filter(
                            fn ($rp) => $rp->id !== $post->id &&
                                ! empty($rp->tag) &&
                                $rp->tag === $postHashtag
                        )
                        ->take(5)
                        ->values();

                    $postRelatedSmartphones = $relatedSmartphones
                        ->filter(
                            fn ($sp) => ! empty($sp->tag) &&
                                $sp->tag === $postHashtag
                        )
                        ->take(5)
                        ->values();

                    $postRelatedLodging = $relatedLodging
                        ->filter(fn ($rl) => ! empty($rl->tag) && $rl->tag === $postHashtag)
                        ->take(5)
                        ->values();

                    $post->related = collect()
                        ->merge($postRelatedPosts->values())
                        ->merge($postRelatedSmartphones->values())
                        ->merge($postRelatedLodging->values())
                        ->shuffle()
                        ->values();

                    $post->type = 'posts';
                    $post->title = $post->translatedValue('title');
                    $post->content = $post->translatedValue('content');
                    $post->tag_display = $post->translatedValue('tag');
                    $post->location_name_display = $post->translatedValue('location_name');
                }

                $hasMore = $hasMore || ($posts->count() === $perPage);
            }

            if ($show_products) {
                $smartphones = $this->smartphone
                    ->where(function ($q) use ($images, $videos, $text) {
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
                    ->with([
                        'model_name:id,name',
                        'capacity:id,name',
                        'selling_info',
                        'selling_info.shipping_fee',
                        'selling_info.import_tax',
                        'floor',
                        'country:id,name',
                        'condition:id,name',
                        'courier_company:id,courier_name',
                        'return_policy:id,slug',
                        'shipping_policy:id,slug',
                        'contentTranslations',
                        'model_name.contentTranslations',
                    ])
                    ->withCount([
                        'inventory_items' => function ($query) {
                            $query->where('status', 'in_stock');
                        },
                    ])

                    ->whereHas('selling_info')
                    ->whereNotNull('slug')
                    ->orderBy('created_at', 'desc')
                    ->orderBy('id', 'desc')
                    ->forPage($page, $perPage)
                    ->get();

                $allHashtags = [];
                foreach ($smartphones as $sp) {
                    if (! empty($sp->tag)) {
                        $allHashtags[] = $sp->tag;
                        $sp->hashtag = $sp->tag;
                    }
                }
                $allHashtags = array_unique($allHashtags);

                $relatedSmartphones = collect();

                if (! blank($allHashtags)) {
                    $relatedSmartphones = $this->smartphone
                        ->where(function ($q) use ($images, $videos, $text) {
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
                        ->whereNotNull('slug')
                        ->whereHas('selling_info')
                        ->whereIn('tag', $allHashtags)
                        ->with(['capacity:id,name', 'selling_info', 'selling_info.shipping_fee', 'floor', 'selling_info.import_tax', 'country:id,name', 'condition:id,name', 'courier_company:id,courier_name', 'return_policy:id,slug', 'shipping_policy:id,slug', 'contentTranslations', 'model_name.contentTranslations'])
                        ->withCount([
                            'inventory_items' => function ($query) {
                                $query->where('status', 'in_stock');
                            },
                        ])

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
                                'floor' => $smartphone->floor,
                                'colors' => $smartphone->colors,
                                'upc' => $smartphone->upc,
                                'selling_info' => $smartphone->selling_info,
                                'country' => $smartphone?->country,
                                'condition' => $smartphone?->condition,
                                'courier_company' => $smartphone?->courier_company,
                                'delivery_days' => $smartphone?->delivery_days,
                                'return_policy' => $smartphone?->return_policy,
                                'shipping_policy' => $smartphone?->shipping_policy,
                                'addons' => $smartphone?->addons,
                                'inventory_items_count' => $smartphone->inventory_items_count,
                                'slug' => $smartphone->slug,
                                'public_id' => $smartphone->public_id,
                                'tag' => $smartphone->tag,
                                'tag_display' => $smartphone->translatedValue('tag'),
                                'location_name_display' => $smartphone->translatedValue('location_name'),
                                'is_sold_out' => $smartphone->is_sold_out,
                                'content' => $smartphone->translatedValue('content'),
                                'type' => 'smartphones',
                                'added_at' => $smartphone->added_at,
                                'created_at_time' => $smartphone->created_at_time,
                                'created_at' => $smartphone->created_at,
                                'product_details' => $smartphone->translatedValue('product_details'),
                            ];
                        });
                }

                $relatedPosts = collect();

                if ($show_posts && ! blank($allHashtags)) {
                    $relatedPosts = $this->post
                        ->where('status', true)
                        ->whereIn('tag', $allHashtags)
                        // its For restricting The Text Only Posts -> Not needed Now
                        // ->where(function ($sub) {
                        //     $sub->whereRaw('JSON_LENGTH(images) > 0')
                        //         ->orWhereRaw('JSON_LENGTH(videos) > 0');
                        // })
                        ->where(function ($q) use ($images, $videos, $text) {
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
                        ->with(['floor:id,name', 'user:id,name', 'contentTranslations'])
                        ->limit(50)
                        ->get()
                        ->map(function ($post) {
                            $post->type = 'posts';
                            $post->title = $post->translatedValue('title');
                            $post->content = $post->translatedValue('content');
                            $post->tag_display = $post->translatedValue('tag');
                            $post->location_name_display = $post->translatedValue('location_name');

                            return $post;
                        });
                }

                // Stage refinement — related lodging (tag-based) injected alongside posts + smartphones.
                // The method guards blank($allHashtags) internally, so no outer guard is needed here.
                $relatedLodging = $this->lodging_product_repository
                    ->getRelatedLodgingForFeed($allHashtags, $images, $videos, $text);

                foreach ($smartphones as $sp) {
                    $spHashtag = $sp->tag;

                    $spRelatedSmartphones = $relatedSmartphones
                        ->filter(
                            fn ($rs) => $rs->id !== $sp->id &&
                                ! empty($rs->tag) &&
                                $rs->tag === $spHashtag
                        )
                        ->take(5)
                        ->values();

                    // Filter related posts with same hashtag
                    $spRelatedPosts = $relatedPosts
                        ->filter(
                            fn ($rp) => ! empty($rp->tag) &&
                                $rp->tag === $spHashtag
                        )
                        ->take(5)
                        ->values();

                    $spRelatedLodging = $relatedLodging
                        ->filter(fn ($rl) => ! empty($rl->tag) && $rl->tag === $spHashtag)
                        ->take(5)
                        ->values();

                    $sp->structured = [
                        '_key' => 'sp_'.$sp->id,
                        'id' => $sp->id,
                        'name' => optional($sp->model_name)->translatedValue('name') ?? $sp->model_searchable_name,
                        'capacity' => $sp->capacity->name,
                        'images' => $sp->images,
                        'smartphone_image_urls' => $sp->smartphone_image_urls,
                        'videos' => $sp->videos,
                        'smartphone_video_urls' => $sp->smartphone_video_urls,
                        'location_name' => $sp->location_name,
                        'latitude' => $sp->latitude,
                        'longitude' => $sp->longitude,
                        'colors' => $sp->colors,
                        'upc' => $sp->upc,
                        'selling_info' => $sp->selling_info,
                        'inventory_items_count' => $sp->inventory_items_count,
                        'country' => $sp->country,
                        'condition' => $sp->condition,
                        'courier_company' => $sp->courier_company,
                        'return_policy' => $sp->return_policy,
                        'shipping_policy' => $sp?->shipping_policy,
                        'delivery_days' => $sp?->delivery_days,
                        'floor' => $sp->floor,
                        'addons' => $sp?->addons,
                        'slug' => $sp->slug,
                        'public_id' => $sp->public_id,
                        'tag' => $sp->tag,
                        'tag_display' => $sp->translatedValue('tag'),
                        'location_name_display' => $sp->translatedValue('location_name'),
                        'is_sold_out' => $sp->is_sold_out,
                        'content' => $sp->translatedValue('content'),
                        'type' => 'smartphones',
                        'added_at' => $sp->added_at,
                        'created_at_time' => $sp->created_at_time,
                        'product_details' => $sp->translatedValue('product_details'),
                        'created_at' => $sp->created_at,
                        'related' => collect()
                            ->merge($spRelatedPosts->values())
                            ->merge($spRelatedSmartphones->values())
                            ->merge($spRelatedLodging->values())
                            ->shuffle()
                            ->values(),
                    ];
                }
                $smartphones = $smartphones->map(fn ($sp) => $sp->structured);
                $hasMore = $hasMore || ($smartphones->count() === $perPage);
            }

            // Stage 3.2 — lodging properties as a third feed type (additive; built in LodgingProductRepository).
            // Gated by the Products filter; the image/video/text filters are forwarded to the lodging query.
            if ($show_products) {
                $lodging_properties = $this->lodging_product_repository->getLodgingProductsForFeed(
                    $page,
                    $perPage,
                    $images,
                    $videos,
                    $text
                );
                $hasMore = $hasMore || ($lodging_properties->count() === $perPage);
            }

            $results = $results->merge([
                'posts' => $posts,
                'products' => [
                    'smartphones' => $smartphones,
                    'lodging_properties' => $lodging_properties,
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
                    'current_page' => (int) $page,
                    'per_page' => (int) $perPage,
                    'has_more_pages' => $hasMore,
                    'next_page' => $hasMore ? $page + 1 : null,
                    'total' => (count($results['posts']) ?? 0) + (count($results['products']['smartphones']) ?? 0) + (count($results['products']['lodging_properties']) ?? 0),
                    'next_page_url' => $hasMore ? route('website.posts.index').'?'.http_build_query($nextParams) : null,
                    'prev_page_url' => $page > 1 ? route('website.posts.index').'?'.http_build_query($prevParams) : null,
                ],

            ];
        });
    }

    public function getGoogleMapSettings()
    {
        return Cache::get('google_map_setting');
    }

    public function getRelated(Request $request, ?string $slug = null)
    {

        $images = $request->boolean('images', true);
        $text = $request->boolean('text', false);
        $videos = $request->boolean('videos', true);
        $show_posts = $request->boolean('show_posts', true);
        $show_products = $request->boolean('show_products', true);

        $hasMore = false;
        $related_posts = [];
        $related_smartphones = [];

        try {
            $hashtag = null;

            $existing_slugs = $request->input('excluded_slugs');

            $post = $this->post->where('slug', $slug)->where('status', true)->first();

            $smartphone = null;
            $page = $request->input('page', 1);
            $perPage = 10;

            if (! empty($post)) {
                $hashtag = $post->tag;
            } else {
                $smartphone = $this->smartphone
                    ->where(function ($q) use ($images, $videos, $text) {
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
                    ->where('slug', $slug)
                    ->with(['capacity:id,name', 'selling_info', 'selling_info.shipping_fee', 'floor', 'selling_info.import_tax', 'country:id,name', 'condition:id,name', 'courier_company:id,courier_name', 'return_policy:id,slug', 'shipping_policy:id,slug'])
                    ->withCount([
                        'inventory_items' => function ($query) {
                            $query->where('status', 'in_stock');
                        },
                    ])

                    ->whereHas('selling_info')
                    ->whereNotNull('slug')
                    ->latest()
                    ->first();

                if (empty($smartphone)) {
                    return [
                        'status' => false,
                        'type' => 'nothing_found',

                    ];
                }

                $hashtag = $smartphone->tag;
            }

            if ($show_posts && ! empty($hashtag)) {
                $related_posts = $this->post
                    ->when(! empty($post), function ($subQuery) use ($post) {
                        $subQuery->where('id', '!=', $post->id);
                    })
                    ->when(! blank($existing_slugs), function ($subQQuery) use ($existing_slugs) {
                        $subQQuery->whereNotIn('slug', $existing_slugs);
                    })
                    // its For restricting The Text Only Posts -> Not needed Now
                    // ->where(function ($sub) {
                    //     $sub->whereRaw('JSON_LENGTH(images) > 0')
                    //         ->orWhereRaw('JSON_LENGTH(videos) > 0');
                    // })
                    ->where(function ($subQQQuery) use ($images, $videos, $text) {
                        if ($text) {

                            $subQQQuery->orWhere(function ($sub) {
                                $sub->whereNull('images')
                                    ->whereNull('videos');
                            });
                        }

                        if ($images) {

                            $subQQQuery->orWhere(function ($sub) {
                                $sub->whereNotNull('images')
                                    ->whereNull('videos');
                            });
                        }

                        if ($videos) {

                            $subQQQuery->orWhere(function ($sub) {
                                $sub->whereNotNull('videos');
                            });
                        }
                    })
                    ->where('tag', $hashtag)
                    ->where('status', true)
                    ->with(['floor', 'user', 'contentTranslations'])
                    ->forPage($page, $perPage)
                    ->latest()
                    ->get()
                    ->map(function ($post) {
                        $post->type = 'posts';
                        $post->title = $post->translatedValue('title');
                        $post->content = $post->translatedValue('content');
                        $post->tag_display = $post->translatedValue('tag');
                        $post->location_name_display = $post->translatedValue('location_name');

                        return $post;
                    });

                $hasMore = $hasMore || ($related_posts->count() === $perPage);
            }

            if ($show_products && ! empty($hashtag)) {
                $related_smartphones = $this->smartphone
                    ->where(function ($q) use ($images, $videos, $text) {
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
                    ->when(! empty($smartphone), function ($subQuery) use ($smartphone) {
                        $subQuery->where('id', '!=', $smartphone->id);
                    })
                    ->when(! blank($existing_slugs), function ($subQQuery) use ($existing_slugs) {
                        $subQQuery->whereNotIn('slug', $existing_slugs);
                    })
                    ->whereHas('selling_info')
                    ->whereNotNull('slug')
                    ->with(['capacity:id,name', 'selling_info', 'selling_info.shipping_fee', 'floor', 'selling_info.import_tax', 'country:id,name', 'condition:id,name', 'courier_company:id,courier_name', 'return_policy:id,slug', 'shipping_policy:id,slug', 'contentTranslations', 'model_name.contentTranslations'])
                    ->withCount([
                        'inventory_items' => function ($query) {
                            $query->where('status', 'in_stock');
                        },
                    ])

                    ->where('tag', $hashtag)
                    ->forPage($page, $perPage)
                    ->latest()
                    ->get()
                    ->map(function ($smartphone) {
                        return [
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
                            'upc' => $smartphone->upc,
                            'selling_info' => $smartphone->selling_info,
                            'floor' => $smartphone->floor,
                            'country' => $smartphone?->country,
                            'condition' => $smartphone?->condition,
                            'delivery_days' => $smartphone?->delivery_days,
                            'courier_company' => $smartphone?->courier_company,
                            'return_policy' => $smartphone?->return_policy,
                            'shipping_policy' => $smartphone?->shipping_policy,
                            'addons' => $smartphone?->addons,
                            'inventory_items_count' => $smartphone->inventory_items_count,
                            'slug' => $smartphone->slug,
                            'public_id' => $smartphone->public_id,
                            'tag' => $smartphone->tag,
                            'tag_display' => $smartphone->translatedValue('tag'),
                            'location_name_display' => $smartphone->translatedValue('location_name'),
                            'is_sold_out' => $smartphone->is_sold_out,
                            'content' => $smartphone->translatedValue('content'),
                            'type' => 'smartphones',
                            'added_at' => $smartphone->added_at,
                            'created_at_time' => $smartphone->created_at_time,
                            'created_at' => $smartphone->created_at,
                            'product_details' => $smartphone->translatedValue('product_details'),

                        ];
                    });

                $hasMore = $hasMore || ($related_smartphones->count() === $perPage);
            }

            // Stage refinement — paginated related lodging (tag-based), respecting already-shown slugs.
            $related_lodging = [];
            if ($show_products && ! empty($hashtag)) {
                $related_lodging = $this->lodging_product_repository
                    ->getRelatedLodgingForFeed(
                        [$hashtag],
                        $images,
                        $videos,
                        $text,
                        ! blank($existing_slugs) ? $existing_slugs : [],
                        $page,
                        $perPage
                    )
                    ->all();

                $hasMore = $hasMore || (count($related_lodging) === $perPage);
            }

            $results = collect([...$related_posts, ...$related_smartphones, ...$related_lodging])->toArray();

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
                'slug' => $slug,
                'data' => $results,
                'pagination' => [
                    'current_page' => (int) $page,
                    'per_page' => (int) $perPage,
                    'has_more_pages' => $hasMore,
                    'next_page' => $hasMore ? $page + 1 : null,
                    'total' => (count($results) ?? 0),
                    'next_page_url' => $hasMore ? route('website.posts.getrelated').'?'.http_build_query($nextParams) : null,
                    'prev_page_url' => $page > 1 ? route('website.posts.getrelated').'?'.http_build_query($prevParams) : null,
                ],

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
            // $text = $preferences['text'] ?? true;
            // $images = $preferences['images'] ?? true;
            // $videos = $preferences['videos'] ?? true;
            // $show_posts = $preferences['show_posts'] ?? true;
            // $show_products = $preferences['show_products'] ?? true;

            $page = $request->input('page', 1);
            $perPage = 10;
            $hasMore = false;
            $data = [
                'posts' => [],
                'products' => [
                    'smartphones' => [],
                ],
            ];

            // if ($show_posts) {

            // }
            $posts = $this->post
                ->where('tag', $hashtag)
                ->where('status', true)
                // its For restricting The Text Only Posts -> Not needed Now
                // ->where(function ($sub) {
                //     $sub->whereRaw('JSON_LENGTH(images) > 0')
                //         ->orWhereRaw('JSON_LENGTH(videos) > 0');
                // })
                // ->where(function ($q) use ($images, $videos, $text) {
                //     if ($text) {

                //         $q->orWhere(function ($sub) {
                //             $sub->whereNull('images')
                //                 ->whereNull('videos');
                //         });
                //     }

                //     if ($images) {

                //         $q->orWhere(function ($sub) {
                //             $sub->whereNotNull('images')
                //                 ->whereNull('videos');
                //         });
                //     }

                //     if ($videos) {

                //         $q->orWhere(function ($sub) {
                //             $sub->whereNotNull('videos');
                //         });
                //     }
                // })
                ->with(['floor', 'user', 'contentTranslations'])
                ->latest()
                ->forPage($page, $perPage)
                ->get()
                ->map(function ($post) {
                    $translatedTitle = $post->translatedValue('title');

                    return [
                        'id' => $post->id,
                        'title' => Str::length($translatedTitle) > 30 ? Str::limit($translatedTitle, 30, '...') : $translatedTitle,
                        'slug' => $post->slug,
                        'public_id' => $post->public_id,
                        'location_name' => $post->location_name,
                        'latitude' => $post->latitude,
                        'longitude' => $post->longitude,
                        'image' => $post->post_image_urls && count($post->post_image_urls) > 0 ? $post->post_image_urls[0] : null,
                        'video_thumbnail' => $post->post_video_urls && count($post->post_video_urls) > 0 ? $post->post_video_urls[0]['thumbnail_url'] : null,
                        'content' => $post->translatedValue('content'),
                        'tag' => $post->tag,
                        'tag_display' => $post->translatedValue('tag'),
                        'location_name_display' => $post->translatedValue('location_name'),
                        'floor' => $post?->floor?->name,
                        'created_at' => $post->created_at->format('Y-m-d g:i A '),
                        'timestamp' => $post->created_at->timestamp,
                        'type' => 'posts',
                    ];
                });

            $data['posts'] = $posts;
            $hasMore = $hasMore || ($posts->count() === $perPage);

            // if ($show_products) {

            // }

            $smartphones = $this->smartphone
                // ->where(function ($q) use ($images, $videos, $text) {
                //     if ($text) {

                //         $q->orWhere(function ($sub) {
                //             $sub->whereNull('images')
                //                 ->whereNull('videos');
                //         });
                //     }

                //     if ($images) {

                //         $q->orWhere(function ($sub) {
                //             $sub->whereNotNull('images')
                //                 ->whereNull('videos');
                //         });
                //     }

                //     if ($videos) {

                //         $q->orWhere(function ($sub) {
                //             $sub->whereNotNull('videos');
                //         });
                //     }
                // })
                ->where('tag', $hashtag)
                ->with(['capacity:id,name', 'selling_info', 'selling_info.shipping_fee', 'floor', 'selling_info.import_tax', 'country:id,name', 'condition:id,name', 'courier_company:id,courier_name', 'return_policy:id,slug', 'shipping_policy:id,slug', 'contentTranslations', 'model_name.contentTranslations'])
                ->withCount([
                    'inventory_items' => function ($query) {
                        $query->where('status', 'in_stock');
                    },
                ])
                ->whereHas('selling_info')
                ->whereNotNull('slug')
                ->latest()
                ->forPage($page, $perPage)
                ->get()
                ->map(function ($smartphone) {
                    return [
                        'id' => $smartphone->id,
                        'name' => optional($smartphone->model_name)->translatedValue('name') ?? $smartphone->model_searchable_name,
                        'capacity' => $smartphone->capacity->name,
                        'image' => $smartphone->smartphone_image_urls && count($smartphone->smartphone_image_urls) > 0 ? $smartphone->smartphone_image_urls[0] : null,
                        'video_thumbnail' => $smartphone->smartphone_video_urls && count($smartphone->smartphone_video_urls) > 0 ? $smartphone->smartphone_video_urls[0]['thumbnail_url'] : null,
                        'location_name' => $smartphone->location_name,
                        'latitude' => $smartphone->latitude,
                        'longitude' => $smartphone->longitude,
                        'colors' => $smartphone->colors,
                        'upc' => $smartphone->upc,
                        'floor' => $smartphone->floor,
                        'selling_info' => $smartphone->selling_info,
                        'inventory_items_count' => $smartphone->inventory_items_count,
                        'country' => $smartphone?->country,
                        'condition' => $smartphone?->condition,
                        'delivery_days' => $smartphone?->delivery_days,
                        'courier_company' => $smartphone?->courier_company,
                        'return_policy' => $smartphone?->return_policy,
                        'shipping_policy' => $smartphone?->shipping_policy,
                        'content' => $smartphone->translatedValue('content'),
                        'slug' => $smartphone->slug,
                        'public_id' => $smartphone->public_id,
                        'addons' => $smartphone?->addons,
                        'tag' => $smartphone->tag,
                        'tag_display' => $smartphone->translatedValue('tag'),
                        'location_name_display' => $smartphone->translatedValue('location_name'),
                        'is_sold_out' => $smartphone->is_sold_out,
                        'type' => 'smartphones',
                        'created_at' => $smartphone->created_at->format('Y-m-d g:i A '),
                        'timestamp' => $smartphone->created_at->timestamp,
                        'added_at' => $smartphone->added_at,
                        'created_at_time' => $smartphone->created_at_time,
                        'product_details' => $smartphone->translatedValue('product_details'),

                    ];
                });

            $hasMore = $hasMore || ($smartphones->count() === $perPage);

            // Lodging — third hashtag-result type. LEAN + hashtag-only: same matching/translation/
            // pagination as smartphones, but NO related queries and NO heavy detail (rooms/policies/
            // amenities) are shipped. Only rooms.ratePlans (bookable sale_price > 0) is eager-loaded
            // to compute the lowest nightly rate for the card. Gates mirror the public feed.
            $currencyCode = $this->resolveHashtagBaseCurrencyCode();

            $lodging = $this->lodging_product
                ->where('tag', $hashtag)
                ->where('is_active', true)
                ->whereNotNull('slug')
                ->with([
                    'media',
                    'contentTranslations',
                    'rooms.ratePlans' => fn ($q) => $q
                        ->whereNotNull('sale_price')
                        ->where('sale_price', '>', 0),
                ])
                ->latest()
                ->forPage($page, $perPage)
                ->get()
                ->map(function ($product) use ($currencyCode) {
                    $coverImage = optional($product->media->first(fn ($m) => $m->type === 'image'))->file_url;
                    $videoThumbnail = optional($product->media->first(fn ($m) => $m->type === 'video'))->thumbnail_url;

                    $rates = $product->rooms
                        ->flatMap(fn ($room) => $room->ratePlans)
                        ->pluck('sale_price')
                        ->filter(fn ($price) => is_numeric($price) && (float) $price > 0);

                    return [
                        'id' => $product->id,
                        'type' => 'lodging',
                        'public_id' => $product->public_id,
                        'slug' => $product->slug,
                        'name' => $product->translatedValue('property_name'),
                        'image' => $coverImage,
                        'video_thumbnail' => $videoThumbnail,
                        'tag' => $product->tag,
                        'tag_display' => $product->translatedValue('tag'),
                        'location_name' => $product->location_name,
                        'location_name_display' => $product->translatedValue('location_name'),
                        'lowest_rate' => $rates->isEmpty() ? null : (float) $rates->min(),
                        'currency_code' => $currencyCode,
                        'created_at' => $product->created_at->format('Y-m-d g:i A '),
                        'timestamp' => $product->created_at->timestamp,
                    ];
                });

            $hasMore = $hasMore || ($lodging->count() === $perPage);

            $data['products'] = [
                'smartphones' => $smartphones,
                'lodging_properties' => $lodging,
            ];
            $queryParams = [
                'page' => $page + 1,
                // 'images' => $images,
                // 'text' => $text,
                // 'videos' => $videos,
                // 'show_products' => $show_products,
                // 'show_posts' => $show_posts,
            ];

            $nextParams = $queryParams;
            $nextParams['page'] = $page + 1;

            $prevParams = $queryParams;
            $prevParams['page'] = max(1, $page - 1);

            // Translated display value for the hashtag header (display-only).
            // The original $hashtag stays canonical for matching/navigation.
            $sourceModel = $this->post->where('tag', $hashtag)->whereHas('contentTranslations')->with('contentTranslations')->first()
    ?? $this->smartphone->where('tag', $hashtag)->whereHas('contentTranslations')->with('contentTranslations', 'model_name.contentTranslations')->first()
    ?? $this->lodging_product->where('tag', $hashtag)->whereHas('contentTranslations')->with('contentTranslations')->first();

            $hashtagDisplay = $sourceModel
                ? $sourceModel->translatedValue('tag')
                : $hashtag;

            return [
                'status' => true,
                'data' => $data,
                'hashtag_display' => $hashtagDisplay,
                'pagination' => [
                    'current_page' => (int) $page,
                    'per_page' => (int) $perPage,
                    'has_more_pages' => $hasMore,
                    'next_page' => $hasMore ? $page + 1 : null,
                    'total' => (count($data['posts']) ?? 0) + (count($data['products']['smartphones']) ?? 0) + (count($data['products']['lodging_properties']) ?? 0),
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

    /** Active base currency code (dynamic, never hardcoded) for the lodging hashtag card rate. */
    private function resolveHashtagBaseCurrencyCode(): ?string
    {
        $currency = Cache::get('currency') ?? Currency::where('is_active', true)->first();

        return $currency?->name;
    }

    // private function extractKeywords($text)
    // {
    //     //  Remove HTML
    //     $text = strip_tags($text);

    //     // Keep only letters/numbers/spaces
    //     $text = preg_replace('/[^A-Za-z0-9 ]/', ' ', $text);

    //     //  Lowercase
    //     $text = strtolower($text);

    //     // Split into words
    //     $words = preg_split('/\s+/', $text);

    //     // Filter trash
    //     $words = array_filter($words, function ($w) {
    //         return strlen($w) >= 3; // remove "is", "to", "on", etc.
    //     });

    //     // Keep unique only
    //     $words = array_unique($words);

    //     // Limit max 8 words (best accuracy)
    //     $words = array_slice($words, 0, 8);

    //     return array_values($words);
    // }

    // private function applyKeywordMatch($query, array $words, array $columns)
    // {
    //     $query->where(function ($q) use ($words, $columns) {
    //         foreach ($words as $word) {
    //             $q->orWhere(function ($sub) use ($word, $columns) {
    //                 foreach ($columns as $col) {
    //                     $sub->orWhere($col, 'like', '%'.$word.'%');
    //                 }
    //             });
    //         }
    //     });
    // }

    // Combining The Item That macthes For Posts And products  For WEbsite
    // private function itemMatches($item, array $keywords)
    // {
    //     if (is_array($item)) {
    //         $item = (object) $item;
    //     }

    //     $fields = [];

    //     if (($item->type ?? null) === 'posts') {
    //         $fields = [
    //             $item->title ?? '',
    //             $item->content ?? '',
    //             $item->tag ?? '',
    //         ];
    //     } elseif (($item->type ?? null) === 'smartphones') {
    //         $fields = [
    //             $item->name ?? '',
    //             $item->content ?? '',
    //             $item->tag ?? '',
    //         ];
    //     } else {

    //         $fields = [
    //             $item->title ?? '',
    //             $item->name ?? '',
    //             $item->content ?? '',
    //             $item->tag ?? '',
    //         ];
    //     }

    //     $haystack = strtolower(implode(' ', $fields));

    //     foreach ($keywords as $keyword) {
    //         if (stripos($haystack, strtolower($keyword)) !== false) {
    //             return true;
    //         }
    //     }

    //     return false;
    // }

    public function getPosts()
    {
        return $this->post->where('status', true)->latest()->get(['id', 'title', 'content', 'tag']);
    }
}
