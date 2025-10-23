<?php

namespace App\Http\Controllers\Website;

use App\Http\Controllers\Controller;
use App\Repositories\DataDeletionRequests\Interface\IDataDeletionRequestRepository;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DataDeletionRequestController extends Controller
{
    public function __construct(
        private IDataDeletionRequestRepository $data_deletion
    ) {}

    public function index()
    {
        return Inertia::render('Website/DataDeletionRequest/index');
    }

    public function store(Request $request)
    {
        $response = $this->data_deletion->storeRequestAndDestroyAccount($request);

        if ($response['status'] === false) {
            return back()->with('error', $response['message']);
        }

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return to_route('home')->with('success', $response['message']);
    }
}
