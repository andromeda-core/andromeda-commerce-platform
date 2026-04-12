<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EmailVerificationPromptController extends Controller
{
    public function __invoke(Request $request): RedirectResponse|Response
    {

        return $request->user()->hasVerifiedEmail()
                    ? redirect()->intended(route('dashboard', absolute: false))
                    : ($request->user() instanceof MustVerifyEmail ? (! $request->user()->hasRole('Customer') ? Inertia::render('Auth/VerifyEmail') : to_route('home')) : to_route('dashboard'));
    }
}
