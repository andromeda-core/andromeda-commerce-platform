<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Repositories\Inventories\Interface\IInventoryRepository;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Inertia\Inertia;

class InventoryController extends Controller implements HasMiddleware
{
    public static function middleware()
    {
        return [
            new Middleware('permission:Inventories View', ['only' => 'index']),
            new Middleware('permission:Inventories Edit', ['only' => 'edit']),
            new Middleware('permission:Inventories Edit', ['only' => 'update']),
            new Middleware('permission:Inventories Delete', ['only' => 'destroy']),
            new Middleware('permission:Inventories Delete', ['only' => 'destroyBySelection']),
        ];
    }

    public function __construct(
        private IInventoryRepository $inventory,
    ) {}

    public function index(Request $request)
    {
        $inventories = $this->inventory->getAllInventory($request);
        $batches = $this->inventory->getBatches();
        $storage_locations = $this->inventory->getStorageLocations();
        $smartphones = $this->inventory->getSmartphones();

        $smartphone_id = $request->input('smartphone_id');
        $batch_id = $request->input('batch_id');
        $storage_location_id = $request->input('storage_location_id');
        $status = $request->input('status');

        return Inertia::render('Dashboard/Inventories/index', compact('inventories', 'batches', 'storage_locations', 'smartphones', 'smartphone_id', 'batch_id', 'storage_location_id', 'status'));
    }

    /**
     * @Message This Method is not in used right now
     */
    public function create()
    {
        $batches = $this->inventory->getBatches();
        $storage_locations = $this->inventory->getStorageLocations();
        $smartphones = $this->inventory->getSmartphones();

        return Inertia::render('Dashboard/Inventories/create', compact('batches', 'storage_locations', 'smartphones'));
    }

    /**
     * @Message This Method is not in used right now
     */
    public function store(Request $request)
    {
        $created = $this->inventory->storeInventory($request);

        if ($created['status'] === false) {
            return back()->with('error', $created['message']);
        }

        return to_route('dashboard.inventories.index')->with('success', $created['message']);
    }

    public function edit(?string $id = null)
    {

        if (empty($id)) {
            return to_route('dashboard.inventories.index')->with('error', 'Inventory ID Not Found');
        }

        $inventory = $this->inventory->getSingleInventory($id);

        if (empty($inventory)) {
            return to_route('dashboard.inventories.index')->with('error', 'Inventory Not Found');
        }

        $batches = $this->inventory->getBatches();
        $storage_locations = $this->inventory->getStorageLocations();
        $smartphones = $this->inventory->getSmartphones();

        return Inertia::render('Dashboard/Inventories/edit', compact('inventory', 'batches', 'storage_locations', 'smartphones'));

    }

    public function update(Request $request, ?string $id = null)
    {
        if (empty($id)) {
            return back()->with('error', 'Inventory ID Not Found');
        }

        $updated = $this->inventory->updateInventory($request, $id);

        if ($updated['status'] === false) {
            return back()->with('error', $updated['message']);
        }

        return to_route('dashboard.inventories.index')->with('success', $updated['message']);
    }

    public function destroy(?string $id = null)
    {
        if (empty($id)) {
            return back()->with('error', 'Inventory ID Not Found');
        }

        $deleted = $this->inventory->destroyInventory($id);

        if ($deleted['status'] === false) {
            return back()->with('error', $deleted['message']);
        }

        return back()->with('success', $deleted['message']);
    }

    public function destroyBySelection(Request $request)
    {
        $deleted = $this->inventory->destroyInventoryBySelection($request);

        if ($deleted['status'] === false) {
            return back()->with('error', $deleted['message']);
        }

        return back()->with('success', $deleted['message']);
    }

    public function getSmartPhoneByUpc(?string $upc = null)
    {
        if (empty($upc)) {
            return response()->json([
                'status' => false,
                'message' => 'UPC Not Found',
            ], 404);

        }

        $smartphone = $this->inventory->getSmartPhoneByUpc($upc);

        if ($smartphone['status'] === false) {
            return response()->json([
                'status' => false,
                'message' => $smartphone['message'],
            ]);
        }

        return response()->json([
            'status' => true,
            'smartphone' => $smartphone['smartphone'],
        ]);
    }
}
