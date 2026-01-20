<?php

namespace App\Http\Controllers\Website;

use App\Http\Controllers\Controller;
use App\Repositories\Categories\Interface\ICategoryRepository;
use App\Repositories\Products\Interface\IProductsRepository;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ShopController extends Controller
{
    public function __construct(
        private ICategoryRepository $category,
        private IProductsRepository $product
    ) {}

    public function __invoke(Request $request)
    {

        $smartphone_data = $this->product->getSmartphonesForShop($request);
        $smartphone_tags = $this->product->getAllSmartphoneTags($request);
        $filterCategories = $this->product->filterCategories();
        $applied_filters = null;

        if ($request->has('filters')) {
            $applied_filters = $request->array('filters');
        }

        $products = $smartphone_data['smartphones'];
        $nextPageUrl = $smartphone_data['nextPageUrl'];
        $categories = $smartphone_data['categories'];

        return Inertia::render('Website/Shop/index', compact(
            'categories', 'products', 'nextPageUrl', 'smartphone_tags',
            'filterCategories',
            'applied_filters'

        ));
    }

    public function loadMore(Request $request)
    {
        $smartphone_data = $this->product->getSmartphonesForShop($request);
        $smartphone_tags = $this->product->getAllSmartphoneTags($request);
        $products = $smartphone_data['smartphones'];
        $nextPageUrl = $smartphone_data['nextPageUrl'];

        return response()->json(['products' => $products, 'nextPageUrl' => $nextPageUrl, 'smartphone_tags' => $smartphone_tags]);
    }
}
