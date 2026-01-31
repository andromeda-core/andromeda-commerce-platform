<?php

namespace App\Repositories\RiskSignal\Interface;

use Illuminate\Http\Request;

interface IRiskSignalRepository
{
    public function getAllRiskSignals(Request $request);

    public function updateRiskSignal(Request $request, ?string $id = null);
}
