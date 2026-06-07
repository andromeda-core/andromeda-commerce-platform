<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Language;
use App\Repositories\Floors\Interface\IFloorRepostitory;
use App\Repositories\Posts\Interface\IPostRepository;
use App\Repositories\Smartphones\Interface\ISmartphoneRepository;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Inertia\Inertia;

class SmartphoneController extends Controller implements HasMiddleware
{
    public static function middleware()
    {
        return [
            new Middleware('permission:Smartphones View', ['only' => 'index']),
            new Middleware('permission:Smartphones View', ['only' => 'show']),
            new Middleware('permission:Smartphones Create', ['only' => 'create']),
            new Middleware('permission:Smartphones Create', ['only' => 'store']),
            new Middleware('permission:Smartphones Edit', ['only' => 'edit']),
            new Middleware('permission:Smartphones Edit', ['only' => 'update']),
            new Middleware('permission:Smartphones Edit', ['only' => 'toggleSoldOut']),
            new Middleware('permission:Smartphones Delete', ['only' => 'destroy']),
            new Middleware('permission:Smartphones Delete', ['only' => 'destroyBySelection']),

        ];
    }

    public function __construct(
        private ISmartphoneRepository $smartphone,
        private IFloorRepostitory $floor,
        private IPostRepository $post,

    ) {}

    public function index(Request $request)
    {
        $smartphones = $this->smartphone->getAllSmartphones($request);

        // return $smartphones;
        $search = $request->input('search');

        return Inertia::render('Dashboard/Smartphones/index', compact('smartphones', 'search'));
    }

    public function create()
    {
        $colors = $this->smartphone->getColors();
        $model_names = $this->smartphone->getModelNames();
        $capacities = $this->smartphone->getCapacities();
        $categories = $this->smartphone->getCategories();
        $countries = $this->smartphone->getCountries();
        $conditions = $this->smartphone->getConditions();
        $courier_companies = $this->smartphone->getCourierCompanies();
        $return_policies = $this->smartphone->getReturnPolicies();
        $shipping_policies = $this->smartphone->getShippingPolicies();
        $addons = $this->smartphone->getAddons();
        $floors = $this->floor->getAllWithoutPaginateFloors();
        $googleMapSettings = $this->post->getGoogleMapSettings();
        $languages = Language::orderBy('name')->get(['id', 'name', 'code']);

        return Inertia::render('Dashboard/Smartphones/create', compact('colors', 'model_names', 'capacities', 'shipping_policies', 'categories', 'countries', 'floors', 'conditions', 'googleMapSettings', 'courier_companies', 'return_policies', 'addons', 'languages'));
    }

    public function store(Request $request)
    {

        $created = $this->smartphone->storeSmartphone($request);

        if ($created['status'] === false) {
            return back()->with('error', $created['message']);
        }

        return to_route('dashboard.smartphones.index')->with('success', $created['message']);

    }

    public function show(?string $id = null)
    {
        if (empty($id)) {
            return to_route('dashboard.smartphones.index')->with('error', 'SmartPhone Id not found');
        }

        $smartphone = $this->smartphone->getSingleSmartphone($id);
        if (empty($smartphone)) {
            return to_route('dashboard.smartphones.index')->with('error', 'SmartPhone not found');
        }

        // return $smartphone->colors;

        return Inertia::render('Dashboard/Smartphones/show', compact('smartphone'));
    }

    public function edit(?string $id = null)
    {
        if (empty($id)) {
            return to_route('dashboard.smartphones.index')->with('error', 'SmartPhone Id not found');
        }

        $smartphone = $this->smartphone->getSingleSmartphone($id);
        if (empty($smartphone)) {
            return to_route('dashboard.smartphones.index')->with('error', 'SmartPhone not found');
        }

        $colors = $this->smartphone->getColors();
        $model_names = $this->smartphone->getModelNames();
        $capacities = $this->smartphone->getCapacities();
        $categories = $this->smartphone->getCategories();
        $countries = $this->smartphone->getCountries();
        $conditions = $this->smartphone->getConditions();
        $courier_companies = $this->smartphone->getCourierCompanies();
        $shipping_policies = $this->smartphone->getShippingPolicies();
        $return_policies = $this->smartphone->getReturnPolicies();
        $addons = $this->smartphone->getAddons();

        $floors = $this->floor->getAllWithoutPaginateFloors();
        $googleMapSettings = $this->post->getGoogleMapSettings();
        $languages = Language::orderBy('name')->get(['id', 'name', 'code']);

        $smartphone->load('contentTranslations');

        $existingTranslations = $smartphone->contentTranslations
            ->groupBy('language_id')
            ->map(function ($rows, $languageId) {
                $fields = [];
                foreach ($rows as $row) {
                    if ($row->field === 'product_details') {
                        $decoded = json_decode($row->value, true);
                        $fields['product_details'] = is_array($decoded) ? $decoded : [];
                    } else {
                        $fields[$row->field] = $row->value;
                    }
                }

                return [
                    'language_id' => (int) $languageId,
                    'fields' => $fields,
                ];
            })
            ->values();

        return Inertia::render('Dashboard/Smartphones/edit', compact('colors', 'floors', 'googleMapSettings', 'model_names', 'capacities', 'shipping_policies', 'categories', 'countries', 'conditions', 'courier_companies', 'return_policies', 'smartphone', 'addons', 'languages', 'existingTranslations'));
    }

    public function update(Request $request, ?string $id = null)
    {

        if (empty($id)) {
            return back()->with('error', 'SmartPhone Id not found');
        }

        $updated = $this->smartphone->updateSmartphone($request, $id);
        if ($updated['status'] === false) {
            return back()->with('error', $updated['message']);
        }

        return to_route('dashboard.smartphones.index')->with('success', $updated['message']);
    }

    public function destroy(?string $id = null)
    {
        if (empty($id)) {
            return back()->with('error', 'SmartPhone Id not found');
        }

        $smartphone = $this->smartphone->getSingleSmartphone($id);
        if (empty($smartphone)) {
            return back()->with('error', 'SmartPhone not found');
        }

        $deleted = $this->smartphone->destroySmartphone($id);
        if ($deleted['status'] === false) {
            return back()->with('error', $deleted['message']);
        }

        return back()->with('success', $deleted['message']);
    }

    public function toggleSoldOut(?string $id = null)
    {
        if (empty($id)) {
            return back()->with('error', 'SmartPhone Id not found');
        }

        $response = $this->smartphone->toggleSoldOut($id);

        return back()->with($response['status'] ? 'success' : 'error', $response['message']);
    }

    public function destroyBySelection(Request $request)
    {
        $deleted = $this->smartphone->destroySmartphoneBySelection($request);

        if ($deleted['status'] === false) {
            return back()->with('error', $deleted['message']);
        }

        return back()->with('success', $deleted['message']);
    }
}
