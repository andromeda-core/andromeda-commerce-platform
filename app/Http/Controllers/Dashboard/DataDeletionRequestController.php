<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Repositories\DataDeletionRequests\Interface\IDataDeletionRequestRepository;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Inertia\Inertia;

class DataDeletionRequestController extends Controller implements HasMiddleware
{
    public static function middleware()
    {
        return [
            new Middleware('permission:Data Deletion Requests View', ['only' => 'index']),
        ];
    }

    public function __construct(
        private IDataDeletionRequestRepository $data_deletion_request
    ) {}

    public function index(Request $request)
    {
        $data_deletion_requests = $this->data_deletion_request->getAllDataDeletionRequests($request);

        $search = $request->input('search');

        return Inertia::render('Dashboard/DataDeletionRequest/index', compact('data_deletion_requests', 'search'));
    }
}
