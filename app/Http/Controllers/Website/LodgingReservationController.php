<?php

namespace App\Http\Controllers\Website;

use App\Http\Controllers\Controller;
use App\Repositories\LodgingReservation\Interface\ILodgingReservationRepository;
use Illuminate\Http\Request;

/**
 * Stage 2.2 — customer-facing reservation REQUEST creation.
 *
 * No customer UI/page here (the lodging product page is Stage 3). This endpoint
 * exists so the creation flow can be exercised via API now and wired to the
 * Stage 3 product page later. Payment happens only after hotel approval (2.3).
 */
class LodgingReservationController extends Controller
{
    public function __construct(
        private ILodgingReservationRepository $lodgingReservation,
    ) {}

    public function store(Request $request)
    {
        $response = $this->lodgingReservation->storeReservationRequest($request);

        // API consumers (and the future Stage 3 product page) get JSON.
        if ($request->expectsJson()) {
            if ($response['status'] === false) {
                return response()->json(['status' => false, 'message' => $response['message']], 422);
            }

            return response()->json([
                'status'         => true,
                'message'        => $response['message'],
                'reservation_no' => $response['reservation']->reservation_no ?? null,
                'public_id'      => $response['reservation']->public_id ?? null,
            ], 201);
        }

        if ($response['status'] === false) {
            return back()->with('error', $response['message']);
        }

        return back()->with('success', $response['message']);
    }
}
