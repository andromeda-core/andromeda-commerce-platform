<?php

namespace App\Repositories\Products\Repository;

use App\Helpers\Trans;
use App\Models\Capacity;
use App\Models\Color;
use App\Models\Condition;
use App\Models\Post;
use App\Models\Smartphone;
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
    ) {}

    // Smartphone
    public function getSingleSmartphone(Request $request, string $slug)
    {
        try {

            $show_products = $request->boolean('show_products', true);
            $show_posts = $request->boolean('show_posts', true);
            $text = $request->boolean('text', true);
            $images = $request->boolean('images', true);
            $videos = $request->boolean('videos', true);

            if ($show_products && $images) {
                $smartphone = $this->smartphone
                    ->with(['model_name', 'capacity', 'selling_info', 'selling_info.shipping_fee', 'selling_info.import_tax', 'country:id,name', 'condition:id,name', 'courier_company:id,courier_name', 'return_policy:id,slug'])
                    ->withCount([
                        'inventory_items' => function ($query) {
                            $query->where('status', 'in_stock');
                        },
                    ])
                    ->whereHas('selling_info')
                    ->whereNotNull('slug')
                    ->where('slug', $slug)
                    ->get()
                    ->map(function ($smartphone) use ($show_posts, $text, $images, $videos) {

                        $related_smartphones = $this->smartphone
                            ->where('id', '!=', $smartphone->id)
                            ->whereHas('selling_info')
                            ->whereNotNull('slug')
                            ->with(['model_name', 'capacity', 'selling_info', 'selling_info.shipping_fee', 'selling_info.import_tax', 'country:id,name', 'condition:id,name', 'courier_company:id,courier_name', 'return_policy:id,slug'])
                            ->where(function ($query) use ($smartphone) {
                                $query->where('tag', 'like', '%'.$smartphone->tag.'%')
                                    ->orWhere('content', 'like', '%'.$smartphone->content.'%')
                                    ->orWhereHas('model_name', function ($q) use ($smartphone) {
                                        $q->where('name', 'like', '%'.$smartphone->model_name->name.'%')
                                            ->orWhere('name', 'like', '%'.$smartphone->content.'%')
                                            ->orWhere('name', 'like', '%'.$smartphone->tag.'%');
                                    });
                            })
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
                                    'images' => $smartphone?->smartphone_image_urls,
                                    'colors' => $smartphone?->colors,
                                    'upc' => $smartphone?->upc,
                                    'selling_info' => $smartphone?->selling_info,
                                    'country' => $smartphone?->country,
                                    'condition' => $smartphone?->condition,
                                    'delivery_days' => $smartphone?->delivery_days,
                                    'courier_company' => $smartphone?->courier_company,
                                    'return_policy' => $smartphone?->return_policy,
                                    'inventory_items_count' => $smartphone?->inventory_items_count,
                                    'slug' => $smartphone->slug,
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
                                ->where(function ($query) use ($smartphone) {
                                    $query->where('tag', 'like', '%'.$smartphone->tag.'%')
                                        ->orWhere('content', 'like', '%'.$smartphone->content.'%')
                                        ->orWhere('title', 'like', '%'.$smartphone->model_name->name.'%');
                                })
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
                            'images' => $smartphone?->smartphone_image_urls,
                            'colors' => $smartphone->colors,
                            'upc' => $smartphone?->upc,
                            'selling_info' => $smartphone?->selling_info,
                            'inventory_items_count' => $smartphone?->inventory_items_count,
                            'country' => $smartphone?->country,
                            'condition' => $smartphone?->condition,
                            'courier_company' => $smartphone?->courier_company,
                            'return_policy' => $smartphone?->return_policy,
                            'addons' => $smartphone?->addons,
                            'slug' => $smartphone?->slug,
                            'tag' => $smartphone?->tag,
                            'content' => $smartphone?->content,
                            'type' => 'smartphones',
                            'added_at' => $smartphone->added_at,
                            'created_at_time' => $smartphone->created_at_time,
                            'related' => collect([...$related_posts, ...$related_smartphones])->shuffle(),
                        ];
                    });

                if ($smartphone->isEmpty()) {
                    throw new Exception('Smartphone Not Found');
                }

                return [
                    'status' => true,
                    'smartphone' => $smartphone->first(),
                ];
            }

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
        // dd($filters);
        $smartphones = $this->smartphone
            ->with(['condition', 'capacity', 'selling_info'])
            ->whereHas('selling_info')
            ->whereNotNull('slug')
            ->when(! empty($request->input('tag')), function ($query) use ($request) {
                $query->where('tag', $request->input('tag'));
            })
            ->when(! blank($filters), function ($query) use ($filters) {
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

                    ->when(! blank($price_range), function ($query) use ($price_range) {
                        $query->whereHas('selling_info', function ($q) use ($price_range) {

                            $q->where(function ($priceQuery) use ($price_range) {

                                foreach ($price_range as $range) {

                                    if ($range === 'under_500') {
                                        $priceQuery->orWhere('total_price', '<=', 500);
                                    }

                                    if ($range === 'under_1000') {
                                        $priceQuery->orWhere('total_price', '<=', 1000);
                                    }

                                    if ($range === 'over_1000') {
                                        $priceQuery->orWhere('total_price', '>=', 1000);
                                    }

                                }

                            });
                        });
                    });

            })
            ->latest()
            ->paginate(10)
            ->withPath(route('website.shop.loadMore', ['filters' => $filters]));

        $smartphones->getCollection()->transform(function ($smartphone) {
            return [
                'id' => $smartphone->id,
                'tag' => $smartphone->tag,
                'image' => $smartphone->smartphone_image_urls[0],
                'condition' => $smartphone->condition->name,
                'capacity' => $smartphone->capacity->name,
                'total_price' => $smartphone->selling_info->total_price,
                'color' => $smartphone->colors[0]?->name,
                'slug' => $smartphone->slug,
            ];

        });

        return [
            'smartphones' => $smartphones->items(),
            'nextPageUrl' => $smartphones->nextPageUrl(),
        ];
    }

    public function getAllSmartphoneTags()
    {
        $smartphone_tags = Cache::rememberForever('smartphone_tags', function () {
            return \DB::table('smartphones')
                ->whereNotNull('tag')
                ->where('tag', '!=', '')
                ->selectRaw('tag')
                ->distinct()
                ->orderBy('tag')
                ->get()
                ->map(fn ($row) => [
                    'key' => $row->tag,
                    'label' => ucfirst($row->tag),
                ])
                ->values();
        });

        return $smartphone_tags;

    }

    private function getColors()
    {
        $colors = Cache::rememberForever('colors', function () {
            return $this->color->where('is_active', true)->get(['name', 'id'])
                ->map(function ($color) {
                    return [
                        'key' => $color->id,
                        'label' => $color->name,
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
                        'key' => $capacity->id,
                        'label' => $capacity->name,
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
                        'key' => $condition->id,
                        'label' => $condition->name,
                    ];
                })
                ->toArray();
        });

        return $conditions;
    }

    private function getPriceRanges()
    {
        $currency = Cache::get('currency');

        return [
            ['key' => 'under_500', 'label' => "Under {$currency?->symbol}500", 'value' => 500],
            ['key' => 'under_1000', 'label' => "Under {$currency?->symbol}1000", 'value' => 1000],
            ['key' => 'over_1000', 'label' => "Over {$currency?->symbol}1000", 'value' => 1000],
        ];
    }

    public function filterCategories()
    {
        return [
            [
                'id' => 'price_range',
                'label' => Trans::get('Price Range'),
                'options' => [
                    ...$this->getPriceRanges(),
                ],
            ],

            [
                'id' => 'storage',
                'label' => Trans::get('Storage'),
                'options' => [
                    ...$this->getCapacities(),
                ],
            ],

            [
                'id' => 'color',
                'label' => Trans::get('Color'),
                'options' => [
                    ...$this->getColors(),
                ],
            ],

            [
                'id' => 'condition',
                'label' => Trans::get('Condition'),
                'options' => [
                    ...$this->getConditions(),
                ],
            ],

        ];
    }
}
