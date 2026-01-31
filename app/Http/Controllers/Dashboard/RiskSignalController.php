<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Repositories\RiskSignal\Interface\IRiskSignalRepository;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RiskSignalController extends Controller
{
    public function __construct(
        private IRiskSignalRepository $risk_signal
    ) {}

    public function index(Request $request)
    {
        $signals = $this->risk_signal->getAllRiskSignals($request);

        return Inertia::render('Dashboard/RiskSignals/index', compact('signals'));
    }

    public function update(Request $request, ?string $id = null)
    {
        if (empty($id)) {
            return back()->with('error', 'Risk Signal Id Not Found');
        }

        $response = $this->risk_signal->updateRiskSignal($request, $id);

        if ($response['status'] === false) {
            return back()->with('error', $response['message']);
        }

        return back()->with('success', $response['message']);
    }
}
