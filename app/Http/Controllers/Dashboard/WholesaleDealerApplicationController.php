<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Repositories\WholesaleDealerApplication\Interface\IWholesaleDealerApplicationRepository;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Inertia\Inertia;

class WholesaleDealerApplicationController extends Controller implements HasMiddleware
{
    public static function middleware()
    {
        return [
            new Middleware('permission:Wholesale Dealer Applications View', ['only' => 'index']),
            new Middleware('permission:Wholesale Dealer Applications View', ['only' => 'show']),
        ];
    }

    public function __construct(
        private IWholesaleDealerApplicationRepository $wholesale_dealer_application
    ) {}

    public function index(Request $request)
    {
        $wholesale_dealer_applications = $this->wholesale_dealer_application->paginateForDashboard($request);

        $search = $request->input('search');

        return Inertia::render('Dashboard/WholesaleDealerApplication/index', compact('wholesale_dealer_applications', 'search'));
    }

    public function show(?string $public_id = null)
    {
        if (empty($public_id)) {
            return to_route('dashboard.wholesale-dealer-applications.index')->with('error', 'Wholesale dealer application ID not found');
        }

        $wholesale_dealer_application = $this->wholesale_dealer_application->findByPublicId($public_id);

        if (empty($wholesale_dealer_application)) {
            return to_route('dashboard.wholesale-dealer-applications.index')->with('error', 'Wholesale dealer application not found');
        }

        return Inertia::render('Dashboard/WholesaleDealerApplication/show', compact('wholesale_dealer_application'));
    }
}
