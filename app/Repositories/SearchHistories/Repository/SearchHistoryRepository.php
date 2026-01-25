<?php

namespace App\Repositories\SearchHistories\Repository;

use App\Helpers\Trans;
use App\Models\SearchHistory;
use App\Repositories\SearchHistories\Interface\ISearchHistoryRepository;
use Exception;
use Illuminate\Http\Request;

class SearchHistoryRepository implements ISearchHistoryRepository
{
    public function __construct(
        private SearchHistory $searchHistory,
        private Trans $trans
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

        // its For restricting The Text Only Posts -> Not needed Now
        // $filteredCollection = $histories->getCollection()->transform(function ($history) {

        //     $results = collect();

        //     if (! empty($history->results)) {
        //         $decoded = json_decode($history->results);

        //         if (is_array($decoded)) {
        //             $results = collect($decoded)
        //                 ->filter(function ($result) {
        //                     return
        //                         ! empty($result->id)
        //                         && ! empty($result->type)
        //                         && (
        //                             ! empty($result->image)
        //                             || ! empty($result->video_thumbnail)
        //                         );
        //                 })
        //                 ->values();
        //         }
        //     }

        //     $history->results = $results;

        //     return $history;
        // })->filter(function ($history) {
        //     return $history->results->isNotEmpty();
        // })
        //     ->values();

        // $histories->setCollection($filteredCollection);

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
                throw new Exception($this->trans->get('Something Went Wrong While Deleting Search History'));
            }

            $deleted = $this->searchHistory->where('user_id', $request->user()?->id)->where('id', $id)->delete();

            if (! $deleted) {
                throw new Exception($this->trans->get('Something Went Wrong While Deleting Search History'));
            }

            return [
                'status' => true,
                'message' => $this->trans->get('Search History Deleted Successfully'),
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

        if (! $history || empty($history->results)) {
            return [
                'status' => false,
                'history' => null,
                'history_results' => null,
            ];
        }

        // its For restricting The Text Only Posts -> Not needed Now
        // $decoded = json_decode($history->results);

        // if (! is_array($decoded)) {
        //     return [
        //         'status' => false,
        //         'history' => null,
        //         'history_results' => null,
        //     ];
        // }

        // $filteredResults = collect($decoded)
        //     ->filter(function ($result) {
        //         return
        //             ! empty($result->id)
        //             && ! empty($result->type)
        //             && (
        //                 ! empty($result->image)
        //                 || ! empty($result->video_thumbnail)
        //             );
        //     })
        //     ->values();

        // if ($filteredResults->isEmpty()) {
        //     return [
        //         'status' => false,
        //         'history' => null,
        //         'history_results' => null,
        //     ];
        // }

        // $history->results = $filteredResults;

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
