<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Repositories\Users\Interface\IUserRepository;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ProfileController extends Controller
{
    public function __construct(
        private IUserRepository $user
    ) {}

    public function index()
    {
        $user = $this->user->getSingleUser(Auth::id());

        if (empty($user)) {
            return to_route('dashboard')->with('error', 'User Not Found');
        }

        return Inertia::render('Dashboard/Profile/index', compact('user'));
    }

    public function updateProfile(Request $request)
    {
        $updated = $this->user->updateProfile($request);

        if ($updated['status'] === false) {
            return back()->with('error', $updated['message']);
        }

        return back()->with('success', $updated['message']);
    }

    public function updatePassword(Request $request)
    {

        $updated = $this->user->updatePassword($request);

        if ($updated['status'] === false) {
            return back()->with('error', $updated['message']);
        }

        return back()->with('success', $updated['message']);
    }

    public function destroyAccount(Request $request)
    {

        $deleted = $this->user->destroyAccount($request);

        if ($deleted['status'] === false) {
            return back()->with('error', $deleted['message']);
        }

        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return to_route('home')->with('success', $deleted['message']);
    }
}
