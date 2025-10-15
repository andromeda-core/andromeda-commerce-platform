<?php

namespace App\Repositories\GlobalSearch\Repository;

use App\Models\Post;
use App\Models\SearchHistory;
use App\Models\Smartphone;
use App\Repositories\GlobalSearch\Interface\IGlobalSearchRepository;
use Cache;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\Request;
use Str;

class GlobalSearchRepository implements IGlobalSearchRepository
{
    public function __construct(
        private Post $post,
        private Smartphone $smartphone,
        private SearchHistory $searchHistory

    ) {}

    /**
     * @Perfect But Joseph Changed The Filter Logic
     */
    // public function search(Request $request)
    // {

    //     $request->validate([
    //         'query' => ['required', 'string', 'max:255'],
    //     ]);

    //     $post_preferences = $request->input('post_preferences');

    //     $text = $post_preferences['text'];
    //     $images = $post_preferences['images'];
    //     $videos = $post_preferences['videos'];

    //     if ($request->input('page') == 'posts') {
    //         $posts = $this->post
    //             ->where(function ($query) use ($request) {
    //                 $query->where('title', 'LIKE', '%'.$request->input('query').'%')
    //                     ->orWhere('content', 'LIKE', '%'.$request->input('query').'%')
    //                     ->orWhere('tag', 'LIKE', '%'.$request->input('query').'%');
    //             })
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
    //             ->with('floor')
    //             ->get()
    //             ->map(function ($post) {
    //                 return [
    //                     'id' => $post->id,
    //                     'title' => Str::length($post->title) > 30 ? Str::limit($post->title, 30, '...') : $post->title,
    //                     'slug' => $post->slug,
    //                     'location_name' => $post->location_name,
    //                     'latitude' => $post->latitude,
    //                     'longitude' => $post->longitude,
    //                     'image' => $post->post_image_urls && count($post->post_image_urls) > 0 ? $post->post_image_urls[0] : null,
    //                     'tag' => $post->tag,
    //                     'floor' => $post?->floor?->name,
    //                     'created_at' => $post->created_at->format('Y-m-d g:i A '),
    //                 ];
    //             });

    //         /**
    //          * @message  Filter Logic With Algolia but Not Needed For Now
    //          */

    //         //  $posts = $this->post::search($request->input('query'))
    //         // ->get()

    //         // ->filter(function ($post) use ($text, $images, $videos) {
    //         //     $show = true;

    //         //     if ($text && $images && $videos) {
    //         //         return true;
    //         //     }

    //         //     if ($text) {
    //         //         $show = $show && (is_null($post->images) && is_null($post->videos));
    //         //     }

    //         //     if ($images) {
    //         //         $show = $show || (! is_null($post->images) && is_null($post->videos));

    //         //     }

    //         //     if ($videos) {

    //         //         $show = $show || (! is_null($post->videos));
    //         //     }

    //         //     return $show;
    //         // })

    //         // ->map(function ($post) {
    //         //     return [
    //         //         'id' => $post->id,
    //         //         'title' => Str::length($post->title) > 30 ? Str::limit($post->title, 30, '...') : $post->title,
    //         //         'slug' => $post->slug,
    //         //         'location_name' => $post->location_name,
    //         //         'latitude' => $post->latitude,
    //         //         'longitude' => $post->longitude,
    //         //         'image' => $post->post_image_urls && count($post->post_image_urls) > 0 ? $post->post_image_urls[0] : null,
    //         //         'tag' => $post->tag,
    //         //         'floor' => $post?->floor?->name,
    //         //         'created_at' => $post->created_at,
    //         //     ];
    //         // });

    //         return [
    //             'data' => $posts,
    //             'type' => 'posts',
    //         ];
    //     }

    //     if ($request->input('page') == 'search') {
    //         $posts = $this->post
    //             ->where(function ($query) use ($request) {
    //                 $query->where('title', 'LIKE', '%'.$request->input('query').'%')
    //                     ->orWhere('content', 'LIKE', '%'.$request->input('query').'%')
    //                     ->orWhere('tag', 'LIKE', '%'.$request->input('query').'%');

    //             })
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
    //             ->with('floor')
    //             ->get()
    //             ->map(function ($post) {
    //                 return [
    //                     'id' => $post->id,
    //                     'title' => Str::length($post->title) > 30 ? Str::limit($post->title, 30, '...') : $post->title,
    //                     'slug' => $post->slug,
    //                     'location_name' => $post->location_name,
    //                     'latitude' => $post->latitude,
    //                     'longitude' => $post->longitude,
    //                     'image' => $post->post_image_urls && count($post->post_image_urls) > 0 ? $post->post_image_urls[0] : null,
    //                     'tag' => $post->tag,
    //                     'floor' => $post?->floor?->name,
    //                     'created_at' => $post->created_at->format('Y-m-d g:i A'),
    //                     'type' => 'posts',
    //                 ];
    //             });

    //         $smartphones = $this->smartphone
    //             ->where(function ($query) use ($request) {
    //                 $query->whereHas('model_name', function ($subQ) use ($request) {
    //                     $subQ->where('name', 'LIKE', '%'.$request->input('query').'%');
    //                 })
    //                     ->orWhereHas('capacity', function ($subQQ) use ($request) {
    //                         $subQQ->where('name', 'LIKE', '%'.$request->input('query').'%');
    //                     })
    //                     ->orWhere('upc', 'LIKE', '%'.$request->input('query').'%');
    //             })
    //             ->with(['model_name', 'capacity'])
    //             ->get()
    //             ->map(function ($smartphone) {
    //                 return [
    //                     'id' => $smartphone->id,
    //                     'name' => $smartphone->model_name->name,
    //                     'capacity' => $smartphone->capacity->name,
    //                     'image' => $smartphone->smartphone_image_urls && count($smartphone->smartphone_image_urls) > 0 ? $smartphone->smartphone_image_urls[0] : null,
    //                     'type' => 'smartphones',
    //                     'created_at' => $smartphone->created_at->format('Y-m-d g:i A'),
    //                 ];
    //             });

    //         $data = collect($posts ?? [])->merge($smartphones ?? []);

    //         return [
    //             'data' => $data,
    //             'type' => 'search',
    //         ];

    //     }
    // }

    public function getGoogleMapApiKey()
    {
        $google_map_setting = Cache::get('google_map_setting');

        if (empty($google_map_setting)) {
            return null;
        }

        return $google_map_setting?->google_map_api_key;
    }

    public function search(Request $request)
    {

        try {
            $request->validate([
                'post_filters' => ['required', 'array'],
                'post_preferences' => ['required', 'array'],

                'post_preferences.text' => ['required'],
                'post_preferences.images' => ['required'],
                'post_preferences.videos' => ['required'],
                'query' => ['nullable', 'string'],
            ], [
                'post_filters.required' => 'Please select at least one filter before searching.',
                'post_filters.array' => 'Invalid filter format. Please refresh the page and try again.',

                'post_preferences.required' => 'Please choose your content preferences before searching.',
                'post_preferences.array' => 'Invalid preferences data. Please refresh and try again.',

                'post_preferences.text.required' => 'Please specify whether to include text-only posts.',
                'post_preferences.images.required' => 'Please specify whether to include image posts.',
                'post_preferences.videos.required' => 'Please specify whether to include video posts.',
            ]);

            $page = $request->input('page', 1);
            $perPage = 10;
            $results = collect();

            // Post Preferences Filter Logic
            $post_preferences = $request->input('post_preferences');

            // Post Additional Filters
            $post_filters = $request->input('post_filters');

            $query = trim($request->input('query'));

            if (isset($post_preferences['show_posts']) && $post_preferences['show_posts'] == true) {
                $posts = $this->post::query();

                if (isset($post_filters['address']) && ! empty($post_filters['address']['lat']) && ! empty($post_filters['address']['lng']) && ! empty($post_filters['radius'])) {

                    $lat = (float) $post_filters['address']['lat'];
                    $lng = (float) $post_filters['address']['lng'];
                    $radius = (float) $post_filters['radius'];
                    $from_floor_id = $post_filters['from_floor_id'];
                    $to_floor_id = $post_filters['to_floor_id'];
                    $date_range = $post_filters['date_range'];

                    $posts = $posts->where('floor_id', '!=', null);

                    if (! empty($from_floor_id) && ! empty($to_floor_id)) {
                        $posts = $posts->whereBetween('floor_id', [$from_floor_id, $to_floor_id]);
                    }

                    if (! empty($date_range)) {
                        $from_date = Carbon::parse($date_range[0]);
                        $to_date = Carbon::parse($date_range[1]);
                        $posts = $posts->whereBetween('created_at', [$from_date, $to_date]);
                    }

                    $posts = $posts->select('*')
                        ->selectRaw('
                (6371000 * acos(
                    cos(radians(?)) *
                    cos(radians(latitude)) *
                    cos(radians(longitude) - radians(?)) +
                    sin(radians(?)) *
                    sin(radians(latitude))
                )) AS distance
              ', [$lat, $lng, $lat])
                        ->having('distance', '<', $radius)
                        ->orderBy('distance', 'asc');
                }

                if (blank($post_filters) || blank($post_preferences)) {
                    return $results;
                }

                $text = filter_var($post_preferences['text'], FILTER_VALIDATE_BOOLEAN);
                $images = filter_var($post_preferences['images'], FILTER_VALIDATE_BOOLEAN);
                $videos = filter_var($post_preferences['videos'], FILTER_VALIDATE_BOOLEAN);

                if ($request->filled('query')) {

                    $posts = $posts->where(function ($q) use ($query) {

                        if (Str::startsWith($query, '#')) {
                            $q->where('tag', '=', $query);
                        } elseif (Str::startsWith($query, 'http://') || Str::startsWith($query, 'https://')) {
                            $encodedQuery = e($query);
                            $q->where(function ($sub) use ($query, $encodedQuery) {
                                $sub->where('content', 'LIKE', '%href="'.$query.'"%')
                                    ->orWhere('content', 'LIKE', '%href="'.$encodedQuery.'"%');
                            });
                        } else {
                            $q->where(function ($sub) use ($query) {
                                $sub->where('title', 'LIKE', '%'.$query.'%')
                                    ->orWhere('content', 'LIKE', '%'.$query.'%');
                            });
                        }
                    });
                }

                $posts = $posts->where(function ($q) use ($text, $images, $videos) {
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

                $posts = $posts->with(['floor'])
                    ->latest()
                    ->forPage($page, $perPage)
                    ->get()
                    ->map(function ($post) use ($query) {

                        $matchType = null;
                        if (! empty($query)) {
                            if (Str::startsWith($query, '#')) {
                                $matchType = 'hashtag';
                            } elseif (Str::startsWith($query, 'http://') || Str::startsWith($query, 'https://')) {
                                $matchType = 'url';
                            } else {
                                $matchType = 'search_terms';
                            }
                        }

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
                            'type' => 'posts',
                            'timestamp' => $post->created_at->timestamp,
                            'matchType' => $matchType,
                        ];
                    });

                $results = $results->merge($posts);
            }

            if (isset($post_preferences['show_products']) && $post_preferences['show_products'] == true) {
                if (isset($post_filters['address']) && blank($post_filters['address']['lat']) && blank($post_filters['address']['lng'])) {
                    $smartphones = $this->smartphone::query();

                    if ($request->filled('query')) {
                        $smartphones = $smartphones->where(function ($query) use ($request) {
                            $query->whereHas('model_name', function ($subQ) use ($request) {
                                $subQ->where('name', 'LIKE', '%'.$request->input('query').'%');
                            })
                                ->orWhereHas('capacity', function ($subQQ) use ($request) {
                                    $subQQ->where('name', 'LIKE', '%'.$request->input('query').'%');
                                })
                                ->orWhere('upc', 'LIKE', '%'.$request->input('query').'%');
                        });
                    }

                    $smartphones = $smartphones->with(['model_name', 'capacity'])
                        ->latest()
                        ->forPage($page, $perPage)
                        ->get()
                        ->map(function ($smartphone) use ($query) {

                            $matchType = null;
                            if (! empty($query)) {
                                if (Str::startsWith($query, '#')) {
                                    $matchType = 'hashtag';
                                } elseif (Str::startsWith($query, 'http://') || Str::startsWith($query, 'https://')) {
                                    $matchType = 'url';
                                } else {
                                    $matchType = 'search_terms';
                                }
                            }

                            return [
                                'id' => $smartphone->id,
                                'name' => $smartphone->model_name->name,
                                'capacity' => $smartphone->capacity->name,
                                'image' => $smartphone->smartphone_image_urls && count($smartphone->smartphone_image_urls) > 0 ? $smartphone->smartphone_image_urls[0] : null,
                                'type' => 'smartphones',
                                'created_at' => $smartphone->created_at->format('Y-m-d g:i A'),
                                'timestamp' => $smartphone->created_at->timestamp,
                                'matchType' => $matchType,
                            ];
                        });

                    $results = $results->merge($smartphones)
                        ->sortByDesc('timestamp')
                        ->values();
                }
            }

            // Storing Search History
            if ($request->user() && (! empty($query) || (! empty($post_filters['address']['lat']) && ! empty($post_filters['address']['lng'])))) {

                $normalizedFilters = ! empty($post_filters['address']['lat']) && ! empty($post_filters['address']['lng'])
        ? json_encode($post_filters, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)
        : null;

                $filtersHash = $this->stableJsonHash($post_filters);

                $previous_search = $this->searchHistory
                    ->where('user_id', $request->user()->id)
                    ->where(function ($q) use ($query, $filtersHash) {
                        if (! empty($query) && empty($filtersHash)) {

                            $q->where('query', $query);
                        } elseif (empty($query) && ! empty($filtersHash)) {

                            $q->where('filters_hash', $filtersHash);
                        } elseif (! empty($query) && ! empty($filtersHash)) {

                            $q->where('query', $query)->where('filters_hash', $filtersHash);
                        }
                    })
                    ->first();

                // info([
                //     'query' => $query,
                //     'filtersHash' => $filtersHash,
                //     'previous_search' => optional($previous_search)->filters_hash,
                // ]);

                if (empty($previous_search) && $results->isNotEmpty()) {

                    $results_for_history = [];
                    $post = $results->where('type', 'posts')->first();
                    $smartphone = $results->where('type', 'smartphones')->first();

                    if (! empty($post)) {
                        $results_for_history[] = [
                            'type' => 'post',
                            'id' => $post['id'] ?? null,
                            'title' => $post['title'] ?? null,
                            'tag' => $post['tag'] ?? null,
                            'image' => ! empty($post['image']) ? $post['image'] : null,
                            'location_name' => $post['location_name'] ?? null,
                            'added_at' => $post['created_at'] ?? null,

                        ];
                    } elseif (! empty($smartphone)) {
                        $results_for_history[] = [
                            'type' => 'smartphone',
                            'id' => $smartphone['id'] ?? null,
                            'name' => $smartphone['name'] ?? null,
                            'capacity' => $smartphone['capacity'] ?? null,
                            'image' => ! empty($smartphone['image']) ? $smartphone['image'] : null,
                            'added_at' => $smartphone['created_at'] ?? null,
                        ];
                    } else {
                        $results_for_history = null;
                    }

                    $this->searchHistory->create([
                        'user_id' => $request->user()->id,
                        'query' => $query ?: null,
                        'filters' => $normalizedFilters,
                        'filters_hash' => $filtersHash,
                        'filter_summary' => ! empty($post_filters['address']['lat'])
                            ? "Advanced Filter You Applied: {$post_filters['address']['lat']}, {$post_filters['address']['lng']}"
                            : null,
                        'results' => json_encode($results_for_history),
                        'results_count' => $results->count(),
                    ]);
                }
            }

            $hasMore = ($results->where('type', 'posts')->count() === $perPage) || ($results->where('type', 'smartphones')->count() === $perPage);
            $queryParams = [
                'page' => $page + 1,
                'query' => $query,
                'post_filters' => json_encode($post_filters),
                'post_preferences' => json_encode($post_preferences),
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
                    'total' => $results->count(),
                    'next_page_url' => $hasMore ? route('website.global-search.getmoreresults').'?'.http_build_query($nextParams) : null,
                    'prev_page_url' => $page > 1 ? route('website.global-search.getmoreresults').'?'.http_build_query($prevParams) : null,
                ],
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    private function stableJsonHash(?array $filters = null): ?string
    {
        if (empty($filters['address']['lat']) || empty($filters['address']['lng'])) {
            return null;
        }

        // Sort array recursively by keys to ensure consistent encoding
        ksort($filters);
        foreach ($filters as &$value) {
            if (is_array($value)) {
                ksort($value);
            }
        }

        // Encode with fixed options and hash
        $normalizedJson = json_encode($filters, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

        return md5($normalizedJson);
    }
}
