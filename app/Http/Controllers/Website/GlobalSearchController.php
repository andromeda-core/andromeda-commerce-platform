<?php

namespace App\Http\Controllers\Website;

use App\Http\Controllers\Controller;
use App\Repositories\Floors\Interface\IFloorRepostitory;
use App\Repositories\GlobalSearch\Interface\IGlobalSearchRepository;
use App\Repositories\Posts\Interface\IPostRepository;
use App\Repositories\SearchHistories\Interface\ISearchHistoryRepository;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GlobalSearchController extends Controller
{
    public function __construct(private IPostRepository $post, private IGlobalSearchRepository $globalSearch, private IFloorRepostitory $floor, private ISearchHistoryRepository $searchHistory) {}

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
        $search_histories_response = $this->searchHistory->getHistory($request);

        $search_histories = $search_histories_response['results'];
        $search_history_next_page_url = $search_histories_response['next_page_url'];
        $all_search_histories = [];
        $filters = [

            'date_range' => null,
            'from_floor_id' => null,
            'to_floor_id' => null,
            'address' => [
                'lat' => null,
                'lng' => null,
            ],
            'radius' => null,
        ];
        $results = [];
        $pagination = ['next_page_url' => null];
        $query = null;

        if ($request->has('search')) {
            $response = $this->results($request);

            if ($response['status'] !== false) {
                $filters = $response['filters'];
                $results = $response['results'];
                $pagination = $response['pagination'];
                $query = $response['query'];

                $new_search_history = $response['new_search_history'];

                $all_search_histories = collect($search_histories);

                if (! empty($new_search_history)) {
                    $all_search_histories->prepend($new_search_history)->unique('id')->values();
                }
            }

            return Inertia::render('Website/Search/index', compact('floors', 'google_map_api_key', 'search_history_next_page_url', 'all_search_histories', 'search_histories', 'filters', 'results', 'pagination', 'query'));

        }

        return Inertia::render('Website/Search/index', compact('floors', 'google_map_api_key', 'all_search_histories', 'search_histories', 'filters', 'results', 'search_history_next_page_url', 'pagination', 'query'));
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
            'new_search_history' => $data['new_search_history'],
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

    public function getSearchHistoryResults(Request $request)
    {
        if (! $request->isXmlHttpRequest()) {
            return to_route('website.global-search.index');
        }

        $response = $this->globalSearch->getSearchHistoryResults($request);

        return response()->json([
            'status' => true,
            ...$response,
        ]);
    }

    public function getSearchHistoryResultsGetMore(Request $request)
    {

        if (! $request->isXmlHttpRequest()) {
            return to_route('website.global-search.index');
        }

        $response = $this->searchHistory->getHistory($request);

        return response()->json([
            'status' => true,
            ...$response,
        ]);
    }

    public function getSingleHistoryResults(Request $request)
    {

        if (! $request->isXmlHttpRequest()) {
            return to_route('website.global-search.index');
        }

        $response = $this->searchHistory->getSingleHistory($request);

        if ($response['status'] === false) {
            return response()->json([
                'status' => false,
                ...$response,
            ]);
        }

        return response()->json([
            'status' => true,
            ...$response,
        ]);

    }
}
