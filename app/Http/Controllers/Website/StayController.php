<?php

namespace App\Http\Controllers\Website;

use App\Http\Controllers\Controller;
use App\Repositories\Lodging\Interface\ILodgingProductRepository;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StayController extends Controller
{
    public function __construct(
        private ILodgingProductRepository $lodging
    ) {}

    public function __invoke(Request $request)
    {
        $stay_data = $this->lodging->getLodgingProductsForStay($request);
        $filterOptions = $this->lodging->getStayFilterOptions();
        $applied_filters = null;

        if ($request->has('filters')) {
            $applied_filters = $request->array('filters');
        }

        $products = $stay_data['lodgings'];
        $nextPageUrl = $stay_data['nextPageUrl'];

        return Inertia::render('Website/Stay/index', compact(
            'products',
            'nextPageUrl',
            'filterOptions',
            'applied_filters'
        ));
    }

    public function loadMore(Request $request)
    {
        $stay_data = $this->lodging->getLodgingProductsForStay($request);
        $products = $stay_data['lodgings'];
        $nextPageUrl = $stay_data['nextPageUrl'];

        return response()->json(['products' => $products, 'nextPageUrl' => $nextPageUrl]);
    }
}
