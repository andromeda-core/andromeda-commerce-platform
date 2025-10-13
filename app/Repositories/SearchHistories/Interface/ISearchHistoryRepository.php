<?php

namespace App\Repositories\SearchHistories\Interface;

use Illuminate\Http\Request;

interface ISearchHistoryRepository
{
    public function getHistory(Request $request);

    public function destroyHistory(Request $request, string $id);
}
