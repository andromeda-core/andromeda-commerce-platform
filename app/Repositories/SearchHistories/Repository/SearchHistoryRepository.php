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
            return [];
        }

        return $this->searchHistory->where('user_id', $request->user()?->id)
            ->latest('created_at')
            ->limit(10)
            ->get()
            ->map(function ($history) {

                if (! empty($history->filters)) {
                    $history->filters = json_decode($history->filters);
                }

                return $history;
            });
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
}
