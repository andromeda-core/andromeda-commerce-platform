<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Repositories\PackageRecordings\Interface\IPackageRecordingsRepository;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Inertia\Inertia;

class PackageRecordingController extends Controller implements HasMiddleware
{
    public static function middleware()
    {
        return [
            new Middleware('permission:Package Recordings View', ['only' => 'index']),
            new Middleware('permission:Package Recordings Create', ['only' => 'create']),
            new Middleware('permission:Package Recordings Create', ['only' => 'store']),
            new Middleware('permission:Package Recordings Delete', ['only' => 'destroy']),
            new Middleware('permission:Package Recordings Delete', ['only' => 'destroyBySelection']),
        ];
    }

    public function __construct(
        private IPackageRecordingsRepository $package_recording
    ) {}

    public function index(Request $request)
    {
        $package_recordings = $this->package_recording->getAllPackageRecordings($request);

        $search = $request->input('search');

        return Inertia::render('Dashboard/PackageRecordings/index', compact('package_recordings', 'search'));
    }

    public function create()
    {
        $orders = $this->package_recording->getOrders();

        return Inertia::render('Dashboard/PackageRecordings/create', compact('orders'));

    }

    public function store(Request $request)
    {
        $created = $this->package_recording->storePackageRecording($request);
        if ($created['status'] === false) {
            return back()->with('error', $created['message']);
        }

        return to_route('dashboard.package-recordings.index')->with('success', $created['message']);
    }

    // Not Needed For Now
    // public function edit(?string $id = null)
    // {
    //     if (empty($id)) {
    //         return to_route('dashboard.package-recordings.index')->with('error', 'Package Recording ID Not Found');
    //     }

    //     $package_recording = $this->package_recording->getSinglePackageRecording($id);

    //     if (empty($package_recording)) {
    //         return to_route('dashboard.package-recordings.index')->with('error', 'Package Recording Not Found');
    //     }

    //     return Inertia::render('Dashboard/PackageRecordings/edit', compact('package_recording'));
    // }

    // public function update(Request $request, ?string $id = null)
    // {

    //     if (empty($id)) {
    //         return to_route('dashboard.package-recordings.index')->with('error', 'Package Recording ID Not Found');
    //     }

    //     $updated = $this->package_recording->updatePackageRecording($request, $id);

    //     if ($updated['status'] === false) {
    //         return back()->with('error', $updated['message']);
    //     }

    //     return to_route('dashboard.package-recordings.index')->with('success', $updated['message']);
    // }
    // Not Needed For Now

    public function destroy(?string $id = null)
    {
        if (empty($id)) {
            return to_route('dashboard.package-recordings.index')->with('error', 'Package Recording ID Not Found');
        }

        $deleted = $this->package_recording->destroyPackageRecording($id);

        if ($deleted['status'] === false) {
            return back()->with('error', $deleted['message']);
        }

        return back()->with('success', $deleted['message']);
    }

    public function destroyBySelection(Request $request)
    {
        $deleted = $this->package_recording->destroyPackageRecordingBySelection($request);

        if ($deleted['status'] === false) {
            return back()->with('error', $deleted['message']);
        }

        return back()->with('success', $deleted['message']);

    }

    public function toggle(?string $id = null)
    {
        if (empty($id)) {
            return to_route('dashboard.package-recordings.index')->with('error', 'Package Recording Not Found');
        }
        $toggled = $this->package_recording->toggleVisibility($id);

        if ($toggled['status'] === false) {
            return back()->with('error', $toggled['message']);
        }

        return back()->with('success', $toggled['message']);
    }
}
