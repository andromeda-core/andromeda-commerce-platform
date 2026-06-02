<?php

namespace App\Repositories\PriceRange\Interface;

use Illuminate\Http\Request;

interface IPriceRangeRepository
{
    public function getAllPriceRanges(Request $request);
    public function getSinglePriceRange(string $id);
    public function storePriceRange(Request $request);
    public function updatePriceRange(Request $request, string $id);
    public function destroyPriceRange(string $id);
    public function destroyPriceRangeBySelection(Request $request);
    public function togglePriceRangeStatus(string $id);
    public function getPriceRangesCount();
}
