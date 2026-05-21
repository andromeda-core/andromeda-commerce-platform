<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Repositories\InternalProductImage\Interface\IInternalProductImageRepository;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Inertia\Inertia;

class InternalProductImageController extends Controller implements HasMiddleware
{
    public static function middleware()
    {
        return [
            new Middleware('permission:Internal Product Images View', ['only' => ['index']]),
            new Middleware('permission:Internal Product Images Create', ['only' => ['create', 'store', 'storeFolder']]),
            new Middleware('permission:Internal Product Images Delete', ['only' => ['destroy', 'destroyBySelection']]),
        ];
    }

    public function __construct(
        private IInternalProductImageRepository $repository,
    ) {}

    public function index(Request $request)
    {
        return Inertia::render('Dashboard/InternalProductImages/index', [
            'images' => $this->repository->getAllInternalProductImages($request),
            'search' => $request->input('search'),
            'folder' => $request->input('folder'),
            'folders' => $this->repository->getFolders(),
        ]);
    }

    public function create()
    {
        return Inertia::render('Dashboard/InternalProductImages/create', [
            'folders' => $this->repository->getFolders(),
        ]);
    }

    public function store(Request $request)
    {
        $response = $this->repository->storeInternalProductImage($request);

        if ($response['status']) {
            return redirect()->route('dashboard.internal-product-images.index')
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
        $response = $this->repository->destroyInternalProductImage($id);

        if ($response['status']) {
            return back()->with('success', $response['message']);
        }

        return back()->with('error', $response['message']);
    }

    public function destroyBySelection(Request $request)
    {
        $response = $this->repository->destroyInternalProductImageBySelection($request);

        if ($response['status']) {
            return back()->with('success', $response['message']);
        }

        return back()->with('error', $response['message']);
    }
}
