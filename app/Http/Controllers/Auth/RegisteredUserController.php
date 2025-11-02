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
        return Inertia::render('Auth/Register');
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
        ],
            [
                'phone.regex' => 'The Number Accepted With + Country Code - Example: +8801xxxxxxxxx',
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
            return redirect(route('home', absolute: false))
                ->with('success', 'Registration successful!');
        } else {
            return redirect(route('dashboard', absolute: false))
                ->with('success', 'Registration successful!');
        }
    }
}
