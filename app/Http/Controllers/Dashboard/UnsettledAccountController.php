<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Repositories\UnsettledAccounts\Interface\IUnsettledAccountsRepository;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UnsettledAccountController extends Controller
{
    public function __construct(
        private IUnsettledAccountsRepository $unsettledAccounts
    ) {}

    public function index(Request $request)
    {
        $unsettledAccounts = $this->unsettledAccounts->getAllUnsettledAccounts($request);

        return Inertia::render('Dashboard/UnsettledAccounts/index', compact('unsettledAccounts'));
    }

    public function update(Request $request, ?string $id = null)
    {
        if (empty($id)) {
            return back()->with('error', 'Risk Signal Id Not Found');
        }

        $response = $this->unsettledAccounts->updateUnsettledAccount($request, $id);

        if ($response['status'] === false) {
            return back()->with('error', $response['message']);
        }

        return back()->with('success', $response['message']);
    }

    public function updateNote(Request $request, ?string $id = null)
    {
        if (empty($id)) {
            return back()->with('error', 'Unsettled Account Id Not Found');
        }

        $response = $this->unsettledAccounts->updateUnsettledAccountNote($request, $id);

        if ($response['status'] === false) {
            return back()->with('error', $response['message']);
        }

        return back()->with('success', $response['message']);
    }

    public function sendMessage(Request $request, ?string $id = null)
    {
        if (empty($id)) {
            return back()->with('error', 'Unsettled Account Id Not Found');
        }

        $response = $this->unsettledAccounts->sendUnsettledAccountMessage($request, $id);

        if ($response['status'] === false) {
            return back()->with('error', $response['message']);
        }

        return back()->with('success', $response['message']);
    }
}
