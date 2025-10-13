<?php

namespace App\Http\Controllers\Website;

use App\Http\Controllers\Controller;
use App\Repositories\Floors\Interface\IFloorRepostitory;
use App\Repositories\GlobalSearch\Repository\GlobalSearchRepository;
use App\Repositories\Posts\Repository\PostRepository;
use App\Repositories\SearchHistories\Repository\SearchHistoryRepository;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GlobalSearchController extends Controller
{
    public function __construct(private PostRepository $post, private GlobalSearchRepository $globalSearch, private IFloorRepostitory $floor, private SearchHistoryRepository $searchHistory) {}

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

        // dd($search_history->toArray());

        return Inertia::render('Website/Search/index', compact('floors', 'google_map_api_key', 'search_history'));
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

    public function results(Request $request)
    {

        if ($request->hasAny(['query', 'post_filters', 'post_preferences'])) {
            session([
                'search_data' => $request->only(['query', 'post_filters', 'post_preferences']),
            ]);
        } elseif (session()->has('search_data')) {
            $request->merge(session('search_data'));
        } else {
            return to_route('website.global-search.index');
        }

        $query = $request->input('query');
        $post_filters = $request->input('post_filters');

        // if (empty($query) && blank($post_filters['address']['lat']) && blank($post_filters['address']['lng'])) {
        //     return to_route('website.global-search.index');
        // }

        $data = $this->globalSearch->search($request);

        if ($data['status'] == false && ! $request->ajax()) {
            return to_route('website.global-search.index')->with('error', $data['message']);

        }

        if ($request->ajax() && $data['status'] == false) {

            return response()->json(['status' => false, 'message' => $data['message']], 400);
        }

        $results = $data['data'];
        $pagination = $data['pagination'];

        $google_map_api_key = $this->globalSearch->getGoogleMapApiKey();
        $search_history = $this->searchHistory->getHistory($request);

        return Inertia::render('Website/Result/index', compact('results', 'query', 'google_map_api_key', 'post_filters', 'pagination', 'search_history'));
    }

    public function searchSessionDestroy()
    {
        if (session()->has('search_data')) {
            session()->forget('search_data');
        }

        return response()->noContent();
    }

    public function getMoreResults(Request $request)
    {
        if (! $request->ajax()) {
            return to_route('website.global-search.index');
        }

        if ($request->filled('post_filters') && is_string($request->post_filters)) {
            $request->merge(['post_filters' => json_decode($request->post_filters, true)]);
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
