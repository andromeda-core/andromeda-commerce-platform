<?php

namespace App\Repositories\Floors\Interface;

use Illuminate\Http\Request;

interface IFloorRepostitory
{
    public function getAllFloors(Request $request);

    public function getSingleFloor(string $id);

    public function storeFloor(Request $request);

    public function updateFloor(Request $request, string $id);

    public function destroyFloor(string $id);

    public function destroyFloorBySelection(Request $request);

    public function getAllWithoutPaginateFloors();

    public function getFloorsForSearch();
}
