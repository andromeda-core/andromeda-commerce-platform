<?php

namespace App\Http\Controllers\Auth;

use App\Helpers\Trans;
use App\Http\Controllers\Controller;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class NewPasswordController extends Controller
{
    /**
     * Display the password reset view.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('Auth/ResetPassword', [
            'email' => $request->email,
            'token' => $request->route('token'),
        ]);
    }

    /**
     * Handle an incoming new password request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'token' => 'required',
            'email' => ['required', 'email', 'exists:users,email', 'string', 'max:255'],
            'password' => ['required', 'confirmed', 'min:8'],
        ],
            [
                'token.required' => Trans::get('Your password reset link is invalid or has expired. Please request a new one.'),

                'email.required' => Trans::get('Please enter your registered email address.'),
                'email.email' => Trans::get('Please enter a valid email address.'),
                'email.exists' => Trans::get('No account found with this email address.'),
                'email.string' => Trans::get('Email must be a valid text.'),
                'email.max' => Trans::get('Email address cannot exceed 255 characters.'),

                'password.required' => Trans::get('Please enter a new password.'),
                'password.confirmed' => Trans::get('The password confirmation does not match.'),
                'password.min' => Trans::get('Your password must be at least 8 characters long.'),
            ]
        );

        // Here we will attempt to reset the user's password. If it is successful we
        // will update the password on an actual user model and persist it to the
        // database. Otherwise we will parse the error and return the response.
        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user) use ($request) {
                $user->forceFill([
                    'password' => Hash::make($request->password),
                    'remember_token' => Str::random(60),
                ])->save();

                event(new PasswordReset($user));
            }
        );

        // If the password was successfully reset, we will redirect the user back to
        // the application's home authenticated view. If there is an error we can
        // redirect them back to where they came from with their error message.
        if ($status == Password::PASSWORD_RESET) {
            return redirect()->route('login')->with('success', Trans::get('Password Reset Successfully'));
        } else {
            return back()->with('error', Trans::get($status));
        }

    }
}
