<?php

namespace App\Repositories\Products\Repository;

use App\Models\Smartphone;
use App\Repositories\Products\Interface\IProductsRepository;
use Exception;
use Illuminate\Http\Request;

class ProductsRepository implements IProductsRepository
{
    public function __construct(
        private Smartphone $smartphone
    ) {}

    // Smartphone
    public function getSingleSmartphone(Request $request, string $slug)
    {
        try {

            $show_products = $request->boolean('show_products', true);

            if ($show_products) {
                $smartphone = $this->smartphone
                    ->with(['model_name', 'capacity', 'selling_info'])
                    ->withCount('inventory_items')
                    ->whereHas('selling_info')
                    ->whereNotNull('slug')
                    ->where('slug', $slug)
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
                            'type' => 'smartphone',

                        ];
                    });

                return [
                    'status' => true,
                    'smartphone' => $smartphone[0],
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
