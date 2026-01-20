<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class EmailVerificationNotificationController extends Controller
{
    /**
     * Send a new email verification notification.
     */
    public function store(Request $request): RedirectResponse
    {

        if (empty(Cache::get('smtp_config'))) {

            if (app()->environment('local')) {
                return back()
                    ->withErrors(['error' => 'Please Configure SMTP Setting First And Remove The MustVerifyEmail Interface From User Model'])
                    ->with('info', 'Please Configure SMTP Setting First And Remove The MustVerifyEmail Interface From User Model');
            }

            if (app()->environment('production')) {
                return back()
                    ->withErrors(['error' => 'Please Configure SMTP Setting First And Remove The MustVerifyEmail Interface From User Model'])
                    ->with('error', 'Error Occured While Sending Verification Mail Please Try Again Later');
            }
        }

        if ($request->user()->hasVerifiedEmail()) {
            return redirect()->intended(route('dashboard', absolute: false));
        }

        $user = $request->user();
        $user->is_email_verification_sent = true;
        $user->save();
        $user->sendEmailVerificationNotification();

        return back()->with('success', 'Verification link sent! Please Check your Mail Inbox');
    }
}
