<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Repositories\SystemLogs\Interface\ISystemLogsRepository;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Inertia\Inertia;

class SystemLogsController extends Controller implements HasMiddleware
{
    public static function middleware()
    {
        return [
            new Middleware('permission:SystemLogs View', ['only' => 'index']),
            new Middleware('permission:SystemLogs View', ['only' => 'emailChangeLogs']),
            new Middleware('permission:SystemLogs View', ['only' => 'shippingAddressChangeLogs']),
        ];
    }

    public function __construct(
        private ISystemLogsRepository $system_logs
    ) {}

    public function index(Request $request)
    {
        return Inertia::render('Dashboard/SystemLogs/Index');
    }

    public function emailChangeLogs(Request $request)
    {
        $system_logs = $this->system_logs->getAllEmailAddressChangeLogs($request);
        $search = $request->input('search');

        return Inertia::render('Dashboard/SystemLogs/EmailAddressChangeLogs/index', [
            'system_logs' => $system_logs,
            'search' => $search,
        ]);
    }

    public function shippingAddressChangeLogs(Request $request)
    {
        $system_logs = $this->system_logs->getAllShippingAddressChangeLogs($request);
        $search = $request->input('search');

        return Inertia::render('Dashboard/SystemLogs/ShippingAddressChangeLogs/index', [
            'system_logs' => $system_logs,
            'search' => $search,
        ]);
    }
}
