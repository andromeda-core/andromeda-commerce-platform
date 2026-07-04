<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Repositories\AdBanners\Interface\IAdBannerRepository;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Inertia\Inertia;

class AdBannerController extends Controller implements HasMiddleware
{
    public static function middleware()
    {
        return [
            new Middleware('permission:Ad Banners View', ['only' => 'index']),

            new Middleware('permission:Ad Banners Create', ['only' => 'create']),
            new Middleware('permission:Ad Banners Create', ['only' => 'store']),

            new Middleware('permission:Ad Banners Edit', ['only' => 'edit']),
            new Middleware('permission:Ad Banners Edit', ['only' => 'update']),

            new Middleware('permission:Ad Banners Delete', ['only' => 'destroy']),
            new Middleware('permission:Ad Banners Delete', ['only' => 'destroyBySelection']),
        ];
    }

    public function __construct(
        private IAdBannerRepository $adBanner
    ) {}

    public function index(Request $request)
    {
        $adBanners = $this->adBanner->getAllAdBanners($request);
        $search = $request->input('search');

        return Inertia::render('Dashboard/AdBanners/index', compact('adBanners', 'search'));
    }

    public function create()
    {
        return Inertia::render('Dashboard/AdBanners/create');
    }

    public function store(Request $request)
    {
        $created = $this->adBanner->storeAdBanner($request);

        if ($created['status'] === false) {
            return back()->with('error', $created['message']);
        }

        return to_route('dashboard.ad-banners.index')->with('success', $created['message']);
    }

    public function edit(?string $id = null)
    {
        if (empty($id)) {
            return to_route('dashboard.ad-banners.index')->with('error', 'Ad Banner ID Not Found');
        }

        $adBanner = $this->adBanner->getSingleAdBanner($id);

        if (empty($adBanner)) {
            return to_route('dashboard.ad-banners.index')->with('error', 'Ad Banner Not Found');
        }

        return Inertia::render('Dashboard/AdBanners/edit', compact('adBanner'));
    }

    public function update(Request $request, ?string $id = null)
    {
        if (empty($id)) {
            return back()->with('error', 'Ad Banner ID Not Found');
        }

        $updated = $this->adBanner->updateAdBanner($request, $id);

        if ($updated['status'] === false) {
            return back()->with('error', $updated['message']);
        }

        return to_route('dashboard.ad-banners.index')->with('success', $updated['message']);
    }

    public function destroy(?string $id = null)
    {
        if (empty($id)) {
            return back()->with('error', 'Ad Banner ID Not Found');
        }

        $deleted = $this->adBanner->destroyAdBanner($id);

        if ($deleted['status'] === false) {
            return back()->with('error', $deleted['message']);
        }

        return back()->with('success', $deleted['message']);
    }

    public function destroyBySelection(Request $request)
    {
        $deleted = $this->adBanner->destroyAdBannerBySelection($request);

        if ($deleted['status'] === false) {
            return back()->with('error', $deleted['message']);
        }

        return back()->with('success', $deleted['message']);
    }
}
