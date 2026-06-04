<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Repositories\Settings\Interface\ISettingRepository;
use App\Repositories\SmartphoneForSales\Interface\ISmartphoneForSaleRepository;
use App\Repositories\Smartphones\Interface\ISmartphoneRepository;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Inertia\Inertia;

class SmartphoneForSaleController extends Controller implements HasMiddleware
{
    public static function middleware()
    {
        return [
            new Middleware('permission:Smartphone For Sales View', ['only' => 'index']),
            new Middleware('permission:Smartphone For Sales Create', ['only' => 'create']),
            new Middleware('permission:Smartphone For Sales Create', ['only' => 'store']),
            new Middleware('permission:Smartphone For Sales Edit', ['only' => 'edit']),
            new Middleware('permission:Smartphone For Sales Edit', ['only' => 'update']),
            new Middleware('permission:Smartphone For Sales Delete', ['only' => 'destroy']),
            new Middleware('permission:Smartphone For Sales Delete', ['only' => 'destroyBySelection']),
        ];
    }

    public function __construct(
        private ISmartphoneForSaleRepository $smartphone_for_sale,
        private ISmartphoneRepository $smartphone,
        private ISettingRepository $setting,

    ) {}

    public function index(Request $request)
    {
        $smartphone_for_sales = $this->smartphone_for_sale->getAllSmartphoneForSales($request);
        $search = $request->input('search');

        return Inertia::render('Dashboard/SmartphoneForSales/index', compact('smartphone_for_sales', 'search'));
    }

    public function create()
    {

        $smartphones = $this->smartphone->getSmartphones();
        $shipping_fee_lists = $this->smartphone_for_sale->getAllShippingFeeLists();
        $import_tax_lists = $this->smartphone_for_sale->getAllImportTaxFeeLists();
        $countries = $this->setting->getCountriesForSaleForm();

        return Inertia::render('Dashboard/SmartphoneForSales/create', compact('smartphones', 'shipping_fee_lists', 'import_tax_lists', 'countries'));
    }

    public function store(Request $request)
    {
        $created = $this->smartphone_for_sale->storeSmartphoneForSale($request);

        if ($created['status'] === false) {
            return back()->with('error', $created['message']);
        }

        return to_route('dashboard.smartphone-for-sales.index')->with('success', $created['message']);
    }

    public function edit(?string $id = null)
    {

        if (empty($id)) {
            return to_route('dashboard.smartphone-for-sales.index')->with('error', 'Smartphone For Sale ID Not Found');
        }

        $smartphone_for_sale = $this->smartphone_for_sale->getSingleSmartphoneForSale($id, ['countryShippings']);

        if (empty($smartphone_for_sale)) {
            return to_route('dashboard.smartphone-for-sales.index')->with('error', 'Smartphone For Sale Not Found');
        }

        $smartphones = $this->smartphone->getSmartphones($smartphone_for_sale->smartphone_id);

        $shipping_fee_lists = $this->smartphone_for_sale->getAllShippingFeeLists();
        $import_tax_lists = $this->smartphone_for_sale->getAllImportTaxFeeLists();
        $countries = $this->setting->getCountriesForSaleForm($smartphone_for_sale->id);

        return Inertia::render('Dashboard/SmartphoneForSales/edit', compact('smartphones', 'smartphone_for_sale', 'shipping_fee_lists', 'import_tax_lists', 'countries'));
    }

    public function update(Request $request, ?string $id = null)
    {

        if (empty($id)) {
            return back()->with('error', 'Smartphone For Sale ID Not Found');
        }

        $updated = $this->smartphone_for_sale->updateSmartphoneForSale($request, $id);

        if ($updated['status'] === false) {
            return back()->with('error', $updated['message']);
        }

        return to_route('dashboard.smartphone-for-sales.index')->with('success', $updated['message']);
    }

    public function destroy(?string $id = null)
    {

        if (empty($id)) {
            return back()->with('error', 'Smartphone For Sale ID Not Found');
        }

        $deleted = $this->smartphone_for_sale->destroySmartphoneForSale($id);

        if ($deleted['status'] === false) {
            return back()->with('error', $deleted['message']);
        }

        return back()->with('success', $deleted['message']);
    }

    public function destroyBySelection(Request $request)
    {
        $deleted = $this->smartphone_for_sale->destroySmartphoneForSaleBySelection($request);

        if ($deleted['status'] === false) {
            return back()->with('error', $deleted['message']);
        }

        return back()->with('success', $deleted['message']);
    }
}
