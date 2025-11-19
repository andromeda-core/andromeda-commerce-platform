<?php

namespace App\Http\Controllers\Website;

use App\Http\Controllers\Controller;
use App\Repositories\Floors\Interface\IFloorRepostitory;
use App\Repositories\GlobalSearch\Interface\IGlobalSearchRepository;
use App\Repositories\Posts\Interface\IPostRepository;
use App\Repositories\SearchHistories\Repository\SearchHistoryRepository;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GlobalSearchController extends Controller
{
    public function __construct(private IPostRepository $post, private IGlobalSearchRepository $globalSearch, private IFloorRepostitory $floor, private SearchHistoryRepository $searchHistory) {}

    /**
     * @Perfect But Joseph Changed The Filter Logic
     */
    // public function search(Request $request)
    // {

    //     $data = $this->globalSearch->search($request);

    //     return response()->json(['status' => true, 'data' => $data]);

    // }

    public function index(Request $request)
    {
        $floors = $this->floor->getFloorsForSearch();
        $google_map_api_key = $this->globalSearch->getGoogleMapApiKey();
        $search_history = $this->searchHistory->getHistory($request);
        $filters = [];
        $results = [];
        $pagination = ['next_page_url' => null];
        $query = null;
        $has_searched = false;
        if ($request->has('search')) {
            $response = $this->results($request);

            $filters = $response['filters'];
            $results = $response['results'];
            $pagination = $response['pagination'];
            $query = $response['query'];
            $has_searched = true;

            return Inertia::render('Website/Search/index', compact('floors', 'has_searched', 'google_map_api_key', 'search_history', 'filters', 'results', 'pagination', 'query'));

        }

        return Inertia::render('Website/Search/index', compact('floors', 'google_map_api_key', 'has_searched', 'search_history', 'filters', 'results', 'pagination', 'query'));
    }

    public function autoCompletion(Request $request)
    {

        $response = $this->post->autoCompleteLocations($request);

        if ($response['status'] === false) {
            return response()->json(['status' => false, 'message' => $response['message']], 400);
        }

        return response()->json(['status' => true, 'data' => $response['data']], 200);
    }

    public function getPlaceDetails(Request $request)
    {

        if (empty($request->input('place_id'))) {
            return response()->json(['status' => false, 'message' => 'Place ID Not Found'], 400);
        }

        $response = $this->post->placeDetails($request->input('place_id'));

        return response()->json(['status' => true, 'data' => $response['data']], 200);

    }

    private function results(Request $request)
    {

        $query = $request->input('query');
        $filters = $request->input('filters');

        $data = $this->globalSearch->search($request);

        if ($data['status'] === false) {
            return [
                'status' => false,
                'message' => $data['message'],

            ];
        }

        return [
            'status' => true,
            'results' => $data['data'],
            'pagination' => $data['pagination'],
            'query' => $query,
            'filters' => $filters,
        ];
    }

    // public function searchSessionDestroy()
    // {
    //     if (session()->has('search_data')) {
    //         session()->forget('search_data');
    //     }

    //     return response()->noContent();
    // }

    public function getMoreResults(Request $request)
    {
        if (! $request->ajax()) {
            return to_route('website.global-search.index');
        }

        if ($request->filled('filters') && is_string($request->filters)) {
            $request->merge(['filters' => json_decode($request->filters, true)]);
        }

        if ($request->filled('post_preferences') && is_string($request->post_preferences)) {
            $request->merge(['post_preferences' => json_decode($request->post_preferences, true)]);
        }
        $data = $this->globalSearch->search($request);

        if ($data['status'] == false) {
            return to_route('website.global-search.index')->with('error', $data['message']);
        }

        $results = $data['data'];
        $pagination = $data['pagination'];

        if ($request->ajax()) {
            return response()->json([
                'status' => true,
                'results' => $results,
                'pagination' => $pagination,
            ]);
        }
    }

    public function destroyHistory(Request $request)
    {

        $response = $this->searchHistory->destroyHistory($request, $request->input('id'));

        return response()->json($response);
    }
}
