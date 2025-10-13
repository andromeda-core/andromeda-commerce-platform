<?php

namespace App\Http\Controllers\Website;

use App\Http\Controllers\Controller;
use App\Repositories\GlobalSearch\Repository\GlobalSearchRepository;
use App\Repositories\SearchHistories\Repository\SearchHistoryRepository;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HomeController extends Controller
{
    public function __construct(private GlobalSearchRepository $globalSearch, private SearchHistoryRepository $searchHistory) {}

    public function index(Request $request)
    {
        $google_map_api_key = $this->globalSearch->getGoogleMapApiKey();
        $search_history = $this->searchHistory->getHistory($request);

        return Inertia::render('Website/Home/index', compact('google_map_api_key', 'search_history'));
    }
}
