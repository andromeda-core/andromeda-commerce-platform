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
            'phone' => ['required', 'regex:/^\+\d+$/', 'max:50', 'unique:users,phone'],
            'password' => ['required', 'min:8', 'max:50', 'confirmed', Rules\Password::defaults()],
            'country_id' => ['required', 'exists:countries,id'],
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

                'phone.required' => Trans::get('Please enter your phone number.'),
                'phone.regex' => Trans::get('Phone number must include country code. Example: +8801XXXXXXXXX'),
                'phone.max' => Trans::get('Phone number cannot exceed 50 characters.'),
                'phone.unique' => Trans::get('This phone number is already registered.'),

                'password.required' => Trans::get('Please enter your password.'),
                'password.min' => Trans::get('Your password must be at least 8 characters long.'),
                'password.max' => Trans::get('Password cannot exceed 50 characters.'),
                'password.confirmed' => Trans::get('The password confirmation does not match.'),

                'country_id.required' => Trans::get('The Country Field Is Required'),
                'country_id.exists' => Trans::get('The Selected Country Does Not Exists'),
            ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'password' => Hash::make($request->password),
        ]);

        $user->syncRoles('Customer');
        $user->customer()->create([
            'country_id' => $request->country_id,
        ]);

        Auth::login($user);
        $user->notify(new SendEmailToUserAfterRegistration($user));

        $redirect = request()->input('redirect');
        if ($redirect && str_starts_with($redirect, '/')) {
            return redirect()->to($redirect);
        }

        return redirect()->intended(route('home'));
    }
}
