<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Repositories\LodgingReservation\Interface\ILodgingReservationRepository;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Inertia\Inertia;

/**
 * Stage 2.2 — operator dashboard visibility for lodging reservations (list + detail).
 * Stage 2.3 — operator approve/reject/suggest/note (gated on 'Lodging Reservations Edit'),
 *             approval auto-creates a NOWPayments invoice (lodging_reservation_payments).
 */
class LodgingReservationController extends Controller implements HasMiddleware
{
    public static function middleware()
    {
        return [
            new Middleware('permission:Lodging Reservations View', ['only' => 'index']),
            new Middleware('permission:Lodging Reservations View', ['only' => 'show']),
            new Middleware('permission:Lodging Reservations Edit', ['only' => 'approve']),
            new Middleware('permission:Lodging Reservations Edit', ['only' => 'reject']),
            new Middleware('permission:Lodging Reservations Edit', ['only' => 'suggestAlternative']),
            new Middleware('permission:Lodging Reservations Edit', ['only' => 'addNote']),
        ];
    }

    public function __construct(
        private ILodgingReservationRepository $lodgingReservation,
    ) {}

    public function index(Request $request)
    {
        $lodging_reservations = $this->lodgingReservation->getAllReservations($request);
        $search = $request->input('search');
        $status = $request->input('status');

        return Inertia::render('Dashboard/Lodging/Reservations/index', compact('lodging_reservations', 'search', 'status'));
    }

    public function show(?string $identifier = null)
    {
        if (empty($identifier)) {
            return to_route('dashboard.lodging-reservations.index')->with('error', 'Reservation identifier not found');
        }

        $lodging_reservation = $this->lodgingReservation->getSingleReservation($identifier);

        if (empty($lodging_reservation)) {
            return to_route('dashboard.lodging-reservations.index')->with('error', 'Reservation not found');
        }

        return Inertia::render('Dashboard/Lodging/Reservations/show', compact('lodging_reservation'));
    }

    public function approve(Request $request, ?string $identifier = null)
    {
        if (empty($identifier)) {
            return back()->with('error', 'Reservation identifier not found');
        }

        $response = $this->lodgingReservation->approveReservation($identifier, $request);

        if ($response['status'] === false) {
            return back()->with('error', $response['message']);
        }

        return back()->with('success', $response['message']);
    }

    public function reject(Request $request, ?string $identifier = null)
    {
        if (empty($identifier)) {
            return back()->with('error', 'Reservation identifier not found');
        }

        $response = $this->lodgingReservation->rejectReservation($identifier, $request);

        if ($response['status'] === false) {
            return back()->with('error', $response['message']);
        }

        return back()->with('success', $response['message']);
    }

    public function suggestAlternative(Request $request, ?string $identifier = null)
    {
        if (empty($identifier)) {
            return back()->with('error', 'Reservation identifier not found');
        }

        $response = $this->lodgingReservation->suggestAlternative($identifier, $request);

        if ($response['status'] === false) {
            return back()->with('error', $response['message']);
        }

        return back()->with('success', $response['message']);
    }

    public function addNote(Request $request, ?string $identifier = null)
    {
        if (empty($identifier)) {
            return back()->with('error', 'Reservation identifier not found');
        }

        $response = $this->lodgingReservation->addInternalNote($identifier, $request);

        if ($response['status'] === false) {
            return back()->with('error', $response['message']);
        }

        return back()->with('success', $response['message']);
    }
}
