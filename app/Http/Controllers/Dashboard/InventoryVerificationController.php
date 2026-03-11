<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Repositories\InventoryVerification\Interface\IInventoryVerificationRepository;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InventoryVerificationController extends Controller
{
    public function __construct(private IInventoryVerificationRepository $inventory_verification) {}

    public function index(Request $request)
    {

        $user = $request->user();
        if ($user->hasRole('Distributor')) {
            $user->load(['distributor']);

            if ($user->distributor->can_verify_inventory == false) {
                return to_route('dashboard')->with('error', 'You Are Not Allowed To Verify Inventory');
            }
        }

        $inventory_verifications = $this->inventory_verification->getAllInventoryVerifications($request);

        return Inertia::render('Dashboard/InventoryVerification/index', compact('inventory_verifications'));
    }

    public function create(Request $request)
    {
        return Inertia::render('Dashboard/InventoryVerification/create');
    }

    public function verify(Request $request)
    {

        $code = $request->input('code');
        if (empty($code)) {
            return response()->json([
                'status' => false,
                'message' => 'Code Not Found',
            ]);
        }

        $verified = $this->inventory_verification->verifyInventory($request);

        return response()->json($verified);
    }

    public function store(Request $request)
    {
        $created = $this->inventory_verification->storeInventoryVerification($request);
        if ($created['status'] === false) {
            return back()->with('error', $created['message']);
        }

        return to_route('dashboard.inventory-verifications.index')->with('success', $created['message']);
    }
}
