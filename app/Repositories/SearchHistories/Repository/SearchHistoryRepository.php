<?php

namespace App\Repositories\SearchHistories\Repository;

use App\Models\SearchHistory;
use App\Repositories\SearchHistories\Interface\ISearchHistoryRepository;
use Exception;
use Illuminate\Http\Request;

class SearchHistoryRepository implements ISearchHistoryRepository
{
    public function __construct(
        private SearchHistory $searchHistory
    ) {}

    public function getHistory(Request $request)
    {
        if (! $request->user()) {
            return [
                'results' => [],
                'next_page_url' => null,
            ];
        }

        $histories = $this->searchHistory->where('user_id', $request->user()?->id)
            ->latest('created_at')
            ->paginate(10)
            ->withPath(route('website.global-search.history-results-getmore'));

        $histories->getCollection()->transform(function ($history) {
            $results = collect();

            if (! empty($history->results)) {
                $results = json_decode($history->results);
            }

            $history->results = $results;

            return $history;
        });

        return [
            'results' => $histories->items(),
            'next_page_url' => $histories->nextPageUrl(),
        ];

    }

    public function destroyHistory(Request $request, string $id)
    {
        try {
            if (empty($id)) {
                throw new Exception('Somehting Went Wrong While Deleting Search History');
            }

            $deleted = $this->searchHistory->where('user_id', $request->user()?->id)->where('id', $id)->delete();

            if (! $deleted) {
                throw new Exception('Something Went Wrong While Deleting Search History');
            }

            return [
                'status' => true,
                'message' => 'Search History Deleted Successfully',
                'data' => $this->getHistory($request),
            ];

        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function getSingleHistory(Request $request)
    {

        $query = $request->input('query');

        $history = $this->searchHistory->where('user_id', $request->user()?->id)
            ->where('query', $query)
            ->latest('created_at')
            ->first();

        $results = [];

        if (empty($history)) {
            return [
                'status' => false,
                'history' => null,
                'history_results' => null,
            ];
        }

        if (! empty($history?->results)) {
            $results = json_decode($history->results);
        }

        return [
            'status' => true,
            'history' => $history,
            'history_results' => $results,
        ];
    }
}
