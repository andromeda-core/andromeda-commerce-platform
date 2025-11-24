<?php

namespace App\Repositories\GlobalSearch\Interface;

use Illuminate\Http\Request;

interface IGlobalSearchRepository
{
    public function search(Request $request);

    public function getGoogleMapApiKey();

    public function getSearchHistoryResults(Request $request);
}
