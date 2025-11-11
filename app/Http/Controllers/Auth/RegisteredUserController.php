<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Contracts\Auth\MustVerifyEmail;
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
        $countries = Cache::get('countries');

        return Inertia::render('Auth/Register', compact('countries'));
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'phone' => 'required|regex:/^\+\d+$/|max:50|unique:users,phone',
            'password' => ['required', 'min:8', 'max:50', 'confirmed', Rules\Password::defaults()],
            'country_id' => ['required', 'exists:countries,id'],
        ],
            [
                'phone.regex' => 'The Number Accepted With + Country Code - Example: +8801xxxxxxxxx',
                'country_id.exists' => 'The Selected Country Does Not Exists',
                'country_id.required' => 'The Country Field Is Required',
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

        // Checking User Model Implements_MustVerifyEmail Inerface
        if ($user instanceof MustVerifyEmail && ! $request->user()->hasRole('Customer')) {

            // Checking Does SMTP Setting Exists In Cache  If Exists Than After Registeration Instantly The Verification Mail Will be Sent If Not Than If Block Will Run
            if (empty(Cache::get('smtp_config'))) {
                return redirect(route('verification.notice', absolute: false))
                    ->with('info', app()->environment('local')
                    ? 'Registration successful! You Havent Configured SMTP Settings Yet Please Remove MustVerifyEmail Interface From User Model'
                    : 'Registeration Successfull But Something Went Wrong While Sending Verification Mail Please Try Again Later');
            }

            // After Registeration The Verification Mail Will be Sent By Default
            event(new Registered($user));

            return redirect(route('verification.notice', absolute: false))
                ->with('success', 'Registration successful! Please Check Your Inbox For Verification Mail');
        } elseif ($request->user()->hasRole('Customer')) {
            return redirect(route('home', absolute: false));
        } else {
            return redirect(route('dashboard', absolute: false));
        }
    }
}
