<?php

namespace App\Repositories\Products\Repository;

use App\Models\Post;
use App\Models\Smartphone;
use App\Repositories\Products\Interface\IProductsRepository;
use Exception;
use Illuminate\Http\Request;

class ProductsRepository implements IProductsRepository
{
    public function __construct(
        private Smartphone $smartphone,
        private Post $post,
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

            if ($show_products) {
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
}
