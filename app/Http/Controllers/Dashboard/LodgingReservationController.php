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
 * Approve/reject actions come in Stage 2.3 (gated on 'Lodging Reservations Edit').
 */
class LodgingReservationController extends Controller implements HasMiddleware
{
    public static function middleware()
    {
        return [
            new Middleware('permission:Lodging Reservations View', ['only' => 'index']),
            new Middleware('permission:Lodging Reservations View', ['only' => 'show']),
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
}
