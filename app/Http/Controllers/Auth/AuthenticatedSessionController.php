<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        // dd(session()->get('errors'));

        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $redirect = request()->input('redirect');

        $request->authenticate();

        $request->session()->regenerate();

        if ($request->user()->hasRole('Customer')) {

            if ($redirect && str_starts_with($redirect, '/')) {
                return redirect()->to($redirect);
            }

            return redirect()->intended(route('home'));
        }

        return redirect()->intended(route('dashboard'));
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return to_route('home');
    }
}
