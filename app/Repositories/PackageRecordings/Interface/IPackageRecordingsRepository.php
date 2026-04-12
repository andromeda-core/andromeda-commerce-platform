<?php

namespace App\Repositories\PackageRecordings\Interface;

use Illuminate\Http\Request;

interface IPackageRecordingsRepository
{
    public function getAllPackageRecordings(Request $request);

    public function getSinglePackageRecording(string $id);

    public function storePackageRecording(Request $request);

    // public function updatePackageRecording(Request $request, string $id);

    public function destroyPackageRecording(string $id);

    public function destroyPackageRecordingBySelection(Request $request);

    public function toggleVisibility(string $id);

    public function getOrders();
}
