<?php

namespace App\Repositories\Products\Repository;

use App\Helpers\Trans;
use App\Models\Capacity;
use App\Models\Color;
use App\Models\Condition;
use App\Models\Post;
use App\Models\PriceRange;
use App\Models\Smartphone;
use App\Repositories\Categories\Interface\ICategoryRepository;
use App\Repositories\Products\Interface\IProductsRepository;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class ProductsRepository implements IProductsRepository
{
    public function __construct(
        private Smartphone $smartphone,
        private Post $post,
        private Color $color,
        private Capacity $capacity,
        private Condition $condition,
        private ICategoryRepository $category,
        private Trans $trans,
        private PriceRange $priceRange
    ) {}

    // Smartphone
    public function getSingleSmartphone(Request $request, string $identifier)
    {
        try {

            // $show_products = $request->boolean('show_products', true);
            $show_posts = $request->boolean('show_posts', true);
            $text = $request->boolean('text', true);
            $images = $request->boolean('images', true);
            $videos = $request->boolean('videos', true);

            $smartphone = $this->smartphone
                // ->where(function ($q) use ($text, $images, $videos) {
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
                ->with(['model_name', 'capacity', 'selling_info', 'selling_info.shipping_fee', 'floor', 'selling_info.import_tax', 'country:id,name', 'condition:id,name', 'courier_company:id,courier_name', 'return_policy:id,slug', 'shipping_policy:id,slug'])
                ->withCount([
                    'inventory_items' => function ($query) {
                        $query->where('status', 'in_stock');
                    },
                ])
                ->whereHas('selling_info')
                ->whereNotNull('slug')
                ->where(function ($q) use ($identifier) {
                    $q->where('public_id', $identifier)
                        ->orWhere('slug', $identifier);
                })
                ->get()
                ->map(function ($smartphone) use ($show_posts, $text, $images, $videos) {

                    $related_smartphones = $this->smartphone
                        ->where('id', '!=', $smartphone->id)
                        ->whereHas('selling_info')
                        ->whereNotNull('slug')
                        // ->where(function ($q) use ($text, $images, $videos) {
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

                        ->with(['model_name', 'capacity', 'selling_info', 'floor', 'selling_info.shipping_fee', 'selling_info.import_tax', 'country:id,name', 'condition:id,name', 'courier_company:id,courier_name', 'return_policy:id,slug', 'shipping_policy:id,slug'])
                        ->where('tag', $smartphone->tag)
                        ->withCount([
                            'inventory_items' => function ($query) {
                                $query->where('status', 'in_stock');
                            },
                        ])
                        ->latest()
                        ->take(5)
                        ->get()
                        ->map(function ($smartphone) {
                            return [
                                'id' => $smartphone->id,
                                'name' => $smartphone?->model_name->name,
                                'capacity' => $smartphone?->capacity->name,
                                'images' => $smartphone->images,
                                'smartphone_image_urls' => $smartphone->smartphone_image_urls,
                                'videos' => $smartphone->videos,
                                'smartphone_video_urls' => $smartphone->smartphone_video_urls,
                                'colors' => $smartphone?->colors,
                                'upc' => $smartphone?->upc,
                                'floor' => $smartphone->floor,
                                'selling_info' => $smartphone?->selling_info,
                                'country' => $smartphone?->country,
                                'condition' => $smartphone?->condition,
                                'delivery_days' => $smartphone?->delivery_days,
                                'courier_company' => $smartphone?->courier_company,
                                'return_policy' => $smartphone?->return_policy,
                                'shipping_policy' => $smartphone?->shipping_policy,
                                'inventory_items_count' => $smartphone?->inventory_items_count,
                                'slug' => $smartphone->slug,
                                'public_id' => $smartphone->public_id,
                                'tag' => $smartphone->tag,
                                'content' => $smartphone->content,
                                'type' => 'smartphones',
                                'added_at' => $smartphone->added_at,
                                'created_at_time' => $smartphone->created_at_time,

                            ];
                        });

                    $related_posts = collect();
                    if ($show_posts) {
                        $related_posts = $this->post
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
                            ->where('tag', $smartphone->tag)
                            ->where('status', true)
                            ->with(['floor', 'user'])
                            ->take(5)
                            ->get()
                            ->map(function ($post) {

                                $post->type = 'posts';

                                return $post;
                            });
                    }

                    return [
                        'id' => $smartphone?->id,
                        'name' => $smartphone?->model_name?->name,
                        'capacity' => $smartphone?->capacity->name,
                        'images' => $smartphone->images,
                        'smartphone_image_urls' => $smartphone->smartphone_image_urls,
                        'videos' => $smartphone->videos,
                        'smartphone_video_urls' => $smartphone->smartphone_video_urls,
                        'colors' => $smartphone->colors,
                        'upc' => $smartphone?->upc,
                        'floor' => $smartphone->floor,
                        'selling_info' => $smartphone?->selling_info,
                        'inventory_items_count' => $smartphone?->inventory_items_count,
                        'country' => $smartphone?->country,
                        'condition' => $smartphone?->condition,
                        'delivery_days' => $smartphone?->delivery_days,
                        'courier_company' => $smartphone?->courier_company,
                        'return_policy' => $smartphone?->return_policy,
                        'shipping_policy' => $smartphone?->shipping_policy,
                        'addons' => $smartphone?->addons,
                        'slug' => $smartphone?->slug,
                        'public_id' => $smartphone?->public_id,
                        'tag' => $smartphone?->tag,
                        'content' => $smartphone?->content,
                        'type' => 'smartphones',
                        'added_at' => $smartphone->added_at,
                        'created_at_time' => $smartphone->created_at_time,
                        'related' => collect([...$related_posts, ...$related_smartphones])->shuffle(),
                    ];
                });

            if ($smartphone->isEmpty()) {
                throw new Exception($this->trans->get('Smartphone Not Found'));
            }

            return [
                'status' => true,
                'smartphone' => $smartphone->first(),
            ];

            return [
                'status' => true,
                'smartphone' => null,
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function getSmartphonesForShop(Request $request)
    {
        $filters = $request->array('filters');
        $category_id = $request->query('category_id') ?? $request->input('category_id');
        $category_id = is_numeric($category_id) ? (int) $category_id : null;

        $categories = $this->category->getAllCategoryNames();
        $first_category = $categories->first();

        if (! empty($first_category) && empty($category_id)) {
            $category_id = $first_category->id;
        }

        $priceRangeMap = $this->getActivePriceRanges()
            ->keyBy(fn($r) => $r->type === 'less_than' ? 'under_' . $r->value : 'over_' . $r->value);

        $smartphones = $this->smartphone
            ->with(['condition', 'capacity', 'selling_info', 'model_name', 'category'])
            ->whereHas('selling_info')
            ->whereNotNull('slug')
            ->when(! empty($request->input('tag')), function ($query) use ($request, $priceRangeMap) {
                $query->where('tag', $request->input('tag'));
            })
            ->when(! empty($category_id), function ($query) use ($category_id) {
                $query->whereHas('category', function ($query) use ($category_id) {
                    $query->where('id', $category_id);
                });
            })
            ->when(! blank($filters), function ($query) use ($filters, $priceRangeMap) {
                $storage = isset($filters['storage']) ? $filters['storage'] : [];
                $color = isset($filters['color']) ? $filters['color'] : [];
                $condition = isset($filters['condition']) ? $filters['condition'] : [];
                $price_range = isset($filters['price_range']) ? $filters['price_range'] : [];

                $query->when(! blank($storage), function ($query) use ($storage) {
                    $query->whereHas('capacity', function ($query) use ($storage) {
                        $query->whereIn('id', $storage);
                    });
                })
                    ->when(! blank($color), function ($query) use ($color) {
                        $query->where(function ($q) use ($color) {
                            foreach ($color as $c) {
                                $q->orWhereJsonContains('color_ids', (string) $c);
                            }
                        });
                    })
                    ->when(! blank($condition), function ($query) use ($condition) {
                        $query->whereHas('condition', function ($query) use ($condition) {
                            $query->whereIn('id', $condition);
                        });
                    })

                    ->when(! blank($price_range), function ($query) use ($price_range, $priceRangeMap) {
                        $query->whereHas('selling_info', function ($q) use ($price_range, $priceRangeMap) {

                            $q->where(function ($priceQuery) use ($price_range, $priceRangeMap) {

                                foreach ($price_range as $range_key) {

                                    $range = $priceRangeMap->get($range_key);

                                    if (! $range) {
                                        continue;
                                    }

                                    $operator = $range->type === 'less_than' ? '<=' : '>=';

                                    $priceQuery->orWhere('total_price', $operator, $range->value);
                                }
                            });
                        });
                    });
            })
            ->latest()
            ->paginate(10)
            ->withPath(route('website.shop.loadMore', ['filters' => $filters, 'tag' => $request->input('tag'), 'category_id' => $category_id]));

        $smartphones->getCollection()->transform(function ($smartphone) {
            return [
                'id' => $smartphone->id,
                'name' => $smartphone?->model_name->name,
                'image' => $smartphone->smartphone_image_urls && count($smartphone->smartphone_image_urls) > 0 ? $smartphone->smartphone_image_urls[0] : null,
                'video_thumbnail' => $smartphone->smartphone_video_urls && count($smartphone->smartphone_video_urls) > 0 ? $smartphone->smartphone_video_urls[0]['thumbnail_url'] : null,
                'condition' => $smartphone?->condition?->name,
                'content' => $smartphone?->content,
                'capacity' => $smartphone?->capacity?->name,
                'total_price' => $smartphone?->selling_info?->total_price,
                'color' => $smartphone?->colors[0]?->name,
                'slug' => $smartphone?->slug,
                'public_id' => $smartphone?->public_id,
            ];
        });

        return [
            'smartphones' => $smartphones->items(),
            'nextPageUrl' => $smartphones->nextPageUrl(),
            'categories' => $categories,
        ];
    }

    public function getAllSmartphoneTags(Request $request)
    {
        $filters = $request->array('filters');
        $category_id = $request->query('category_id') ?? $request->input('category_id');
        $category_id = is_numeric($category_id) ? (int) $category_id : null;

        $categories = $this->category->getAllCategoryNames();
        $first_category = $categories->first();

        if (! empty($first_category) && empty($category_id)) {
            $category_id = $first_category->id;
        }


        $priceRangeMap = $this->getActivePriceRanges()
            ->keyBy(fn($r) => $r->type === 'less_than' ? 'under_' . $r->value : 'over_' . $r->value);

        $query = \DB::table('smartphones')
            ->distinct()
            ->select('smartphones.tag')
            ->whereNotNull('smartphones.tag')
            ->where('smartphones.tag', '!=', '')
            ->join(
                'smartphone_for_sales',
                'smartphone_for_sales.smartphone_id',
                '=',
                'smartphones.id'
            );

        // CATEGORY
        if (! empty($category_id)) {
            $query->where('smartphones.category_id', $category_id);
        }

        // FILTERS
        if (! empty($filters)) {

            // STORAGE
            if (! empty($filters['storage'] ?? [])) {
                $query->whereIn('smartphones.capacity_id', $filters['storage']);
            }

            // CONDITION
            if (! empty($filters['condition'] ?? [])) {
                $query->whereIn('smartphones.condition_id', $filters['condition']);
            }

            // COLOR (JSON)
            if (! empty($filters['color'] ?? [])) {
                $query->where(function ($q) use ($filters) {
                    foreach ($filters['color'] as $c) {
                        $q->orWhereJsonContains('smartphones.color_ids', (string) $c);
                    }
                });
            }

            // PRICE RANGE (DYNAMIC)
            if (! empty($filters['price_range'] ?? [])) {
                $query->where(function ($priceQuery) use ($filters, $priceRangeMap) {

                    foreach ($filters['price_range'] as $range_key) {

                        $range = $priceRangeMap->get($range_key);

                        if (! $range) {
                            continue;
                        }

                        $operator = $range->type === 'less_than' ? '<=' : '>=';

                        $priceQuery->orWhere(
                            'smartphone_for_sales.total_price',
                            $operator,
                            $range->value
                        );
                    }
                });
            }
        }

        return $query
            ->orderBy('smartphones.tag')
            ->get()
            ->map(fn($row) => [
                'key' => $row->tag,
                'label' => ucfirst($row->tag),
            ])
            ->values();
    }

    private function getColors()
    {
        $colors = Cache::rememberForever('colors', function () {
            return $this->color->where('is_active', true)->get(['name', 'id'])
                ->map(function ($color) {
                    return [
                        'key' => $color?->id,
                        'label' => $color?->name,
                    ];
                })
                ->toArray();
        });

        return $colors;
    }

    private function getCapacities()
    {
        $capcacities = Cache::rememberForever('capacities', function () {
            return $this->capacity->where('is_active', true)->get(['name', 'id'])
                ->map(function ($capacity) {
                    return [
                        'key' => $capacity?->id,
                        'label' => $capacity?->name,
                    ];
                })
                ->toArray();
        });

        return $capcacities;
    }

    private function getConditions()
    {
        $conditions = Cache::rememberForever('conditions', function () {
            return $this->condition->where('is_active', true)->get(['name', 'id'])
                ->map(function ($condition) {
                    return [
                        'key' => $condition?->id,
                        'label' => $condition?->name,
                    ];
                })
                ->toArray();
        });

        return $conditions;
    }

    // private function getPriceRanges()
    // {
    //     return [
    //         ['key' => 'under_500', 'label' => Trans::get('Under'), 'value' => 500],
    //         ['key' => 'under_1000', 'label' => Trans::get('Under'), 'value' => 1000],
    //         ['key' => 'over_1000', 'label' => Trans::get('Over'), 'value' => 1000],
    //     ];
    // }

    private function getPriceRanges()
    {
        return $this->getActivePriceRanges()
            ->map(function ($range) {
                return [
                    'key' => $range->type === 'less_than' ? 'under_' . $range->value : ('over_' . $range->value),
                    'label' => $range->type === 'less_than' ? Trans::get('Under') : Trans::get('Over'),
                    'value' => (int) $range->value,
                ];
            })
            ->values()
            ->toArray();
    }

    public function getProductPreview(string $public_id): array
    {
        $smartphone = $this->smartphone
            ->whereHas('selling_info')
            ->with(['model_name', 'selling_info'])
            ->where('public_id', $public_id)
            ->first();

        if (! $smartphone) {
            return [
                'exists'    => false,
                'public_id' => $public_id,
            ];
        }

        return [
            'exists'    => true,
            'public_id' => $smartphone->public_id,
            'slug'      => $smartphone->slug,
            'name'      => $smartphone->model_name?->name,
            'image_url' => $smartphone->smartphone_image_urls[0] ?? null,
            'price_usd' => (float) ($smartphone->selling_info?->total_price ?? 0),
        ];
    }

    public function filterCategories()
    {
        $price_ranges = $this->getPriceRanges();
        $capacities = $this->getCapacities();
        $colors = $this->getColors();
        $conditions = $this->getConditions();

        return [
            [
                'id' => 'price_range',
                'label' => Trans::get('Price Range'),
                'options' => $price_ranges,
            ],

            ...(! blank($capacities) ? [[
                'id' => 'storage',
                'label' => Trans::get('Storage'),
                'options' => $capacities,
            ]] : []),

            ...(! blank($colors) ? [[
                'id' => 'color',
                'label' => Trans::get('Color'),
                'options' => $colors,
            ]] : []),

            ...(! blank($conditions) ? [[
                'id' => 'condition',
                'label' => Trans::get('Condition'),
                'options' => $conditions,
            ]] : []),
        ];
    }

    private function getActivePriceRanges()
    {
        return Cache::rememberForever('price_ranges', function () {
            return $this->priceRange::where('is_active', true)
                ->orderBy('value', 'asc')
                ->get(['id', 'value', 'type']);
        });
    }
}
