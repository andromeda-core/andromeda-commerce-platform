<?php

namespace App\Http\Controllers\Auth;

use App\Helpers\Trans;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Notifications\SendEmailToUserAfterRegistration;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        $redirect = request()->input('redirect');
        $countries = Cache::get('countries');

        return Inertia::render('Auth/Register', compact('countries', 'redirect'));
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:'.User::class],
            'password' => ['required', 'min:8', 'max:50', 'confirmed', Rules\Password::defaults()],
        ],
            [
                'name.required' => Trans::get('Please enter your full name.'),
                'name.string' => Trans::get('Name must be a valid text.'),
                'name.max' => Trans::get('Name cannot exceed 255 characters.'),

                'email.required' => Trans::get('Please enter your email address.'),
                'email.email' => Trans::get('Please enter a valid email address.'),
                'email.max' => Trans::get('Email address cannot exceed 255 characters.'),
                'email.unique' => Trans::get('This email is already registered.'),
                'email.lowercase' => Trans::get('This email must be in lowercase.'),

                'password.required' => Trans::get('Please enter your password.'),
                'password.min' => Trans::get('Your password must be at least 8 characters long.'),
                'password.max' => Trans::get('Password cannot exceed 50 characters.'),
                'password.confirmed' => Trans::get('The password confirmation does not match.'),
            ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'password' => Hash::make($request->password),
        ]);

        $user->syncRoles('Customer');
        $user->customer()->create();

        Auth::login($user);
        $user->notify(new SendEmailToUserAfterRegistration($user));
        $user->sendEmailVerificationNotification();

        $redirect = request()->input('redirect');
        if ($redirect && str_starts_with($redirect, '/')) {
            return redirect()->to($redirect);
        }

        return redirect()->intended(route('home'));
    }
}
