<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Repositories\Settings\Interface\ISettingRepository;
use App\Repositories\SmartphoneCountryPrice\Interface\ISmartphoneCountryPriceRepository;
use App\Repositories\SmartphoneForSales\Interface\ISmartphoneForSaleRepository;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Inertia\Inertia;

class SmartphoneCountryPriceController extends Controller implements HasMiddleware
{
    public static function middleware()
    {
        return [
            new Middleware('permission:Smartphone Country Price View', ['only' => 'index']),
            new Middleware('permission:Smartphone Country Price Create', ['only' => 'create']),
            new Middleware('permission:Smartphone Country Price Create', ['only' => 'store']),
            new Middleware('permission:Smartphone Country Price Edit', ['only' => 'edit']),
            new Middleware('permission:Smartphone Country Price Edit', ['only' => 'update']),
            new Middleware('permission:Smartphone Country Price Delete', ['only' => 'destroy']),
            new Middleware('permission:Smartphone Country Price Delete', ['only' => 'destroyBySelection']),
        ];
    }

    public function __construct(
        private ISmartphoneCountryPriceRepository $smartphone_country_price,
        private ISettingRepository $setting,
        private ISmartphoneForSaleRepository $smartphone_for_sale
    ) {}

    public function index(Request $request)
    {
        // ROLLBACK: previous body was a no-arg call returning all rows:
        // $smartphone_country_prices = $this->smartphone_country_price->getAllSmartphoneCountryPrice();
        // return Inertia::render('Dashboard/SmartphoneCountryPrices/index', compact('smartphone_country_prices'));

        $smartphone_country_prices = $this->smartphone_country_price->getAllSmartphoneCountryPrice($request);

        $countries = $this->setting->getCountries();

        $country_id = $request->input('country_id');
        $q = $request->input('q');

        $missing_smartphones = $country_id
            ? $this->smartphone_country_price->getMissingSmartphonesForCountry($country_id)
            : [];

        return Inertia::render('Dashboard/SmartphoneCountryPrices/index', compact(
            'smartphone_country_prices',
            'countries',
            'missing_smartphones',
            'country_id',
            'q'
        ));
    }

    public function create()
    {
        $countries = $this->setting->getCountries();
        $sales = $this->smartphone_for_sale->getAllSmartphoneForSalesForCountryPrices();

        return Inertia::render('Dashboard/SmartphoneCountryPrices/create', compact('countries', 'sales'));
    }

    public function store(Request $request)
    {
        $created = $this->smartphone_country_price->storeSmartphoneCountryPrice($request);

        if ($created['status'] === false) {
            return back()->with('error', $created['message']);
        }

        // ROLLBACK: previously returned to the index without filters:
        // return to_route('dashboard.smartphone-country-prices.index')->with('success', $updated['message']);

        $searched_q = $request->input('searched_query');
        $searched_country_id = $request->input('searched_country_id');

        return to_route('dashboard.smartphone-country-prices.index',
            [
                ...(! empty($searched_country_id) ? ['country_id' => $searched_country_id] : []),
                ...(! empty($searched_q) ? ['q' => $searched_q] : [])])
            ->with('success', $created['message']);
    }

    public function edit(string $id)
    {
        if (empty($id)) {
            return to_route('dashboard.smartphone-country-prices.index')->with('error', 'Smartphone Country Price ID not found');
        }

        $smartphone_country_price = $this->smartphone_country_price->getSingleSmartphoneCountryPrice($id);

        if (empty($smartphone_country_price)) {
            return to_route('dashboard.smartphone-country-prices.index')->with('error', 'Smartphone Country Price not found');
        }

        $countries = $this->setting->getCountries();
        $sales = $this->smartphone_for_sale->getAllSmartphoneForSalesForCountryPrices();

        return Inertia::render('Dashboard/SmartphoneCountryPrices/edit', compact('smartphone_country_price', 'countries', 'sales'));
    }

    public function update(Request $request, string $id)
    {
        $updated = $this->smartphone_country_price->updateSmartphoneCountryPrice($request, $id);

        if ($updated['status'] === false) {
            return back()->with('error', $updated['message']);
        }

        // ROLLBACK: previously returned to the index without filters:
        // return to_route('dashboard.smartphone-country-prices.index')->with('success', $updated['message']);

        $searched_country_id = $request->input('searched_country_id');
        $searched_q = $request->input('searched_query');

        return to_route('dashboard.smartphone-country-prices.index', [
            ...(! empty($searched_country_id) ? ['country_id' => $searched_country_id] : []),
            ...(! empty($searched_q) ? ['q' => $searched_q] : []),
        ])->with('success', $updated['message']);
    }

    public function destroy(string $id)
    {
        if (empty($id)) {
            return to_route('dashboard.smartphone-country-prices.index')->with('error', 'Smartphone Country Price ID not found');
        }

        $deleted = $this->smartphone_country_price->destroySmartphoneCountryPrice($id);

        if ($deleted['status'] === false) {
            return back()->with('error', $deleted['message']);
        }

        return to_route('dashboard.smartphone-country-prices.index')->with('success', $deleted['message']);
    }

    public function destroyBySelection(Request $request)
    {
        $deleted = $this->smartphone_country_price->destroyBySelectionSmartphoneCountryPrice($request);

        if ($deleted['status'] === false) {
            return back()->with('error', $deleted['message']);
        }

        return to_route('dashboard.smartphone-country-prices.index')->with('success', $deleted['message']);
    }
}
