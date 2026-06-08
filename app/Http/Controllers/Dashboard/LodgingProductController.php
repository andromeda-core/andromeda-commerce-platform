<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Repositories\Lodging\Interface\ILodgingProductRepository;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Inertia\Inertia;

class LodgingProductController extends Controller implements HasMiddleware
{
    public static function middleware()
    {
        return [
            new Middleware('permission:Lodging Products View', ['only' => 'index']),
            new Middleware('permission:Lodging Products View', ['only' => 'show']),
            new Middleware('permission:Lodging Products Create', ['only' => 'create']),
            new Middleware('permission:Lodging Products Create', ['only' => 'store']),
            new Middleware('permission:Lodging Products Edit', ['only' => 'edit']),
            new Middleware('permission:Lodging Products Edit', ['only' => 'update']),
            new Middleware('permission:Lodging Products Delete', ['only' => 'destroy']),
            new Middleware('permission:Lodging Products Delete', ['only' => 'destroyBySelection']),
        ];
    }

    public function __construct(
        private ILodgingProductRepository $lodgingProduct,
    ) {}

    public function index(Request $request)
    {
        $lodging_products = $this->lodgingProduct->getAllLodgingProducts($request);
        $search = $request->input('search');

        return Inertia::render('Dashboard/Lodging/Products/index', compact('lodging_products', 'search'));
    }

    public function create()
    {
        $formData = $this->lodgingProduct->getCreateFormData();
        $googleMapSettings = $this->lodgingProduct->getGoogleMapSettings();

        return Inertia::render('Dashboard/Lodging/Products/create', array_merge($formData, compact('googleMapSettings')));
    }

    public function store(Request $request)
    {
        $created = $this->lodgingProduct->storeLodgingProduct($request);

        if ($created['status'] === false) {
            return back()->with('error', $created['message']);
        }

        return to_route('dashboard.lodging-products.index')->with('success', $created['message']);
    }

    public function show(?string $id = null)
    {
        if (empty($id)) {
            return to_route('dashboard.lodging-products.index')->with('error', 'Lodging Product Id not found');
        }

        $lodging_product = $this->lodgingProduct->getSingleLodgingProduct($id);
        if (empty($lodging_product)) {
            return to_route('dashboard.lodging-products.index')->with('error', 'Lodging Product not found');
        }

        return Inertia::render('Dashboard/Lodging/Products/show', compact('lodging_product'));
    }

    public function edit(?string $id = null)
    {
        if (empty($id)) {
            return to_route('dashboard.lodging-products.index')->with('error', 'Lodging Product Id not found');
        }

        $lodging_product = $this->lodgingProduct->getSingleLodgingProduct($id);
        if (empty($lodging_product)) {
            return to_route('dashboard.lodging-products.index')->with('error', 'Lodging Product not found');
        }

        $formData = $this->lodgingProduct->getCreateFormData();
        $googleMapSettings = $this->lodgingProduct->getGoogleMapSettings();

        return Inertia::render('Dashboard/Lodging/Products/edit', array_merge($formData, compact('lodging_product', 'googleMapSettings')));
    }

    public function update(Request $request, ?string $id = null)
    {
        if (empty($id)) {
            return back()->with('error', 'Lodging Product Id not found');
        }

        $updated = $this->lodgingProduct->updateLodgingProduct($request, $id);
        if ($updated['status'] === false) {
            return back()->with('error', $updated['message']);
        }

        return to_route('dashboard.lodging-products.index')->with('success', $updated['message']);
    }

    public function destroy(?string $id = null)
    {
        if (empty($id)) {
            return back()->with('error', 'Lodging Product Id not found');
        }

        $deleted = $this->lodgingProduct->destroyLodgingProduct($id);
        if ($deleted['status'] === false) {
            return back()->with('error', $deleted['message']);
        }

        return back()->with('success', $deleted['message']);
    }

    public function destroyBySelection(Request $request)
    {
        $deleted = $this->lodgingProduct->destroyLodgingProductBySelection($request);

        if ($deleted['status'] === false) {
            return back()->with('error', $deleted['message']);
        }

        return back()->with('success', $deleted['message']);
    }

    public function googleLocationAutocomplete(Request $request)
    {
        $response = $this->lodgingProduct->autoCompleteLocations($request);

        if ($response['status'] === false) {
            return response()->json(['status' => false, 'message' => $response['message']], 400);
        }

        return response()->json(['status' => true, 'data' => $response['data']], 200);
    }

    public function googleLocationPlaceDetails(Request $request)
    {
        if (empty($request->input('place_id'))) {
            return response()->json(['status' => false, 'message' => 'Place ID Not Found'], 400);
        }

        $response = $this->lodgingProduct->placeDetails($request->input('place_id'));

        if ($response['status'] === false) {
            return response()->json(['status' => false, 'message' => $response['message']], 400);
        }

        return response()->json(['status' => true, 'data' => $response['data']], 200);
    }
}
