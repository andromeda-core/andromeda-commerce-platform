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

        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'redirect' => request()->input('redirect'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $redirect = request()->input('redirect');
        $parsedUrl = parse_url($redirect);

        if (isset($parsedUrl['query'])) {
            parse_str($parsedUrl['query'], $query);
        }

        $query['direct'] = 'true';
        $query['single_page'] = 'true';

        $newQuery = http_build_query($query);

        $finalRedirect =
    ($parsedUrl['scheme'] ?? '').($parsedUrl['host'] ?? '').
    ($parsedUrl['path'] ?? '').
    '?'.$newQuery;

        $request->authenticate();

        $request->session()->regenerate();

        $user = $request->user();

        if (! $user->is_dormant && ! $user->is_deactivated) {
            $user->updateQuietly([
                'last_activity_at' => now(),
            ]);
        }

        if ($user->hasRole('Customer')) {

            if ($finalRedirect && str_starts_with($finalRedirect, '/')) {
                return redirect()->to($finalRedirect);
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
