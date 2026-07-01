<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Repositories\InternalProductVideos\Interface\IInternalProductVideoRepository;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Inertia\Inertia;

class InternalProductVideoController extends Controller implements HasMiddleware
{
    public static function middleware()
    {
        return [
            new Middleware('permission:Internal Product Videos View', ['only' => 'index']),
            new Middleware('permission:Internal Product Videos Create', ['only' => 'create']),
            new Middleware('permission:Internal Product Videos Create', ['only' => 'store']),
            new Middleware('permission:Internal Product Videos Create', ['only' => 'storeFolder']),
            new Middleware('permission:Internal Product Videos Delete', ['only' => 'destroy']),
            new Middleware('permission:Internal Product Videos Delete', ['only' => 'destroyBySelection']),
        ];
    }

    public function __construct(
        private IInternalProductVideoRepository $repository,
    ) {}

    public function index(Request $request)
    {
        return Inertia::render('Dashboard/InternalProductVideos/index', [
            'videos' => $this->repository->getAllInternalProductVideos($request),
            'search' => $request->input('search'),
            'folder' => $request->input('folder'),
            'folders' => $this->repository->getFolders(),
        ]);
    }

    public function create()
    {
        return Inertia::render('Dashboard/InternalProductVideos/create', [
            'folders' => $this->repository->getFolders(),
        ]);
    }

    public function store(Request $request)
    {
        $response = $this->repository->storeInternalProductVideo($request);

        if ($response['status']) {
            return redirect()->route('dashboard.internal-product-videos.index')
                ->with('success', $response['message']);
        }

        return back()->with('error', $response['message']);
    }

    public function storeFolder(Request $request)
    {
        $response = $this->repository->createFolder($request);

        return response()->json([
            'status' => $response['status'],
            'message' => $response['message'],
            'folders' => $response['folders'] ?? [],
            'new_folder' => $response['new_folder'] ?? null,
        ]);
    }

    public function destroy(string $id)
    {
        $response = $this->repository->destroyInternalProductVideo($id);

        if ($response['status']) {
            return back()->with('success', $response['message']);
        }

        return back()->with('error', $response['message']);
    }

    public function destroyBySelection(Request $request)
    {
        $response = $this->repository->destroyInternalProductVideoBySelection($request);

        if ($response['status']) {
            return back()->with('success', $response['message']);
        }

        return back()->with('error', $response['message']);
    }
}
