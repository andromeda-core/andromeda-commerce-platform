<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Repositories\PriceRange\Interface\IPriceRangeRepository;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Inertia\Inertia;

class PriceRangeController extends Controller implements HasMiddleware
{

    public static function middleware()
    {
        return [
            new Middleware("permission:Price Ranges View", ['only' => 'index']),
            new Middleware("permission:Price Ranges Create", ['only' => 'create']),
            new Middleware("permission:Price Ranges Create", ['only' => 'store']),
            new Middleware("permission:Price Ranges Edit", ['only' => 'edit']),
            new Middleware("permission:Price Ranges Edit", ['only' => 'update']),
            new Middleware("permission:Price Ranges Delete", ['only' => 'destroy']),
            new Middleware("permission:Price Ranges Delete", ['only' => 'destroyBySelection']),
            new Middleware("permission:Price Ranges Edit", ['only' => 'toggleStatus']),
        ];
    }

    public function __construct(
        private IPriceRangeRepository $priceRange,
    ) {}

    public function index(Request $request)
    {
        $priceRanges = $this->priceRange->getAllPriceRanges($request);

        $can_create_more_price_range = $this->priceRange->getPriceRangesCount() < 10;

        return Inertia::render('Dashboard/Settings/PriceRanges/index', [
            'priceRanges' => $priceRanges,
            'search' => $request->input('search'),
            'can_create_more_price_range' => $can_create_more_price_range,
        ]);
    }

    public function create()
    {
        if ($this->priceRange->getPriceRangesCount() >= 10) {
            return redirect()->route('dashboard.settings.price-ranges.index')
                ->with('error', 'Maximum Price Ranges Limit Reached. You Can not Add More Than 10 Price Ranges.');
        }

        return Inertia::render('Dashboard/Settings/PriceRanges/create');
    }

    public function store(Request $request)
    {
        $response = $this->priceRange->storePriceRange($request);

        if ($response['status']) {
            return redirect()->route('dashboard.settings.price-ranges.index')
                ->with('success', $response['message']);
        }

        return back()->with('error', $response['message']);
    }

    public function edit(string $id)
    {
        $priceRange = $this->priceRange->getSinglePriceRange($id);

        if (is_array($priceRange) && !$priceRange['status']) {
            return redirect()->route('dashboard.settings.price-ranges.index')
                ->with('error', $priceRange['message']);
        }

        return Inertia::render('Dashboard/Settings/PriceRanges/edit', [
            'priceRange' => $priceRange,
        ]);
    }

    public function update(Request $request, string $id)
    {
        $response = $this->priceRange->updatePriceRange($request, $id);

        if ($response['status']) {
            return redirect()->route('dashboard.settings.price-ranges.index')
                ->with('success', $response['message']);
        }

        return back()->with('error', $response['message']);
    }

    public function destroy(string $id)
    {
        $response = $this->priceRange->destroyPriceRange($id);

        if ($response['status']) {
            return back()->with('success', $response['message']);
        }

        return back()->with('error', $response['message']);
    }

    public function destroyBySelection(Request $request)
    {
        $response = $this->priceRange->destroyPriceRangeBySelection($request);

        if ($response['status']) {
            return back()->with('success', $response['message']);
        }

        return back()->with('error', $response['message']);
    }

    public function toggleStatus(string $id)
    {
        $response = $this->priceRange->togglePriceRangeStatus($id);

        if ($response['status']) {
            return back()->with('success', $response['message']);
        }

        return back()->with('error', $response['message']);
    }
}
