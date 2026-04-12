<?php

namespace App\Http\Controllers\Auth;

use App\Helpers\Trans;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class PasswordResetLinkController extends Controller
{
    /**
     * Display the password reset link request view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/ForgotPassword');
    }

    /**
     * Handle an incoming password reset link request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'email' => ['required', 'string', 'email', 'max:255'],
        ], [
            'email.required' => Trans::get('Please enter your email address.'),
            'email.email' => Trans::get('Please enter a valid email address.'),
            'email.max' => Trans::get('Email address cannot exceed 255 characters.'),
            'email.string' => Trans::get('Email must be a valid text.'),
        ]);

        if (empty(Cache::get('smtp_config'))) {
            if (app()->environment('local')) {
                return back()->withErrors(['email' => Trans::get('Please Configure SMTP Setting First')])->with('info', Trans::get('Please Configure SMTP Setting First'));
            }
            if (app()->environment('production')) {
                return back()->withErrors(['email' => Trans::get('Failed To Send Reset Password Mail Please Try Again Later')])->with('error', Trans::get('Failed To Send Reset Password Mail Please Try Again Later'));
            }
        }

        // We will send the password reset link to this user. Once we have attempted
        // to send the link, we will examine the response then see the message we
        // need to show to the user. Finally, we'll send out a proper response.
        $status = Password::sendResetLink(
            $request->only('email')
        );

        if ($status == Password::RESET_LINK_SENT) {
            return back()->with('success', Trans::get('Reset password link has been sent to your email address.'));
        }

        throw ValidationException::withMessages([
            'email' => [Trans::get('Please Wait Before Re-Trying')],
        ]);
    }
}
