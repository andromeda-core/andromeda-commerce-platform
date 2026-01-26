<?php

namespace App\Http\Middleware;

use App\Helpers\Trans;
use Closure;
use Illuminate\Http\Request;
use Str;

class EnsureAccountStatus
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();

        if (! $user) {
            return $next($request);
        }

        $routeName = optional($request->route())->getName();

        if ($user->status === 'suspended') {

            if (
                $request->routeIs('website.profile.suspend-account.index') ||
                $request->routeIs('website.languages-translations.getalljson') ||
                $request->routeIs('logout')
            ) {
                return $next($request);
            }

            return redirect()->route('website.profile.suspend-account.index');
        } elseif (
            $user->status !== 'suspended' &&
            $request->routeIs('website.profile.suspend-account.index')
        ) {
            return redirect()->route('home');
        }

        if (Str::is('website.data-deletion.*', $routeName) && $user->status !== 'active') {

            if ($request->expectsJson()) {
                return response()->json([
                    'status' => false,
                    'code' => 'ACCOUNT_NOT_ACTIVE',
                    'message' => Trans::get('You can only access the data deletion page when your account is active. current status').': '.Str::title(Str::replace('_', ' ', $user->status)),
                ], 403);
            }

            return redirect()
                ->route('website.profile.index')
                ->with(
                    'error',
                    Trans::get('You can only access the data deletion page when your account is active. current status').': '.Str::title(Str::replace('_', ' ', $user->status))

                );
        }

        $method = $request->method();
        $isWriteAction = in_array($method, ['POST', 'PUT', 'PATCH', 'DELETE']);

        $trackableRoutes = [
            'website.profile.*',
            'website.carts.*',
            'website.checkout.*',
            'website.shipping-addresses.*',
            'website.orders.*',
        ];

        $isTrackableRoute = false;

        foreach ($trackableRoutes as $pattern) {
            if ($routeName && Str::is($pattern, $routeName)) {
                $isTrackableRoute = true;
                break;
            }
        }

        if (! $isWriteAction || ! $isTrackableRoute) {
            return $next($request);
        }

        if ($user->status === 'under_investigation') {

            if ($request->expectsJson()) {
                return response()->json([
                    'status' => false,
                    'code' => 'ACCOUNT_UNDER_INVESTIGATION',
                    'message' => Trans::get('Your account is under investigation. Some actions are restricted.'),
                ], 403);
            }

            return back()->with(
                'error',
                Trans::get('Your account is under investigation. Some actions are restricted.')
            );
        }

        if (
            $user->status === 'under_dispute' &&
            Str::is('website.checkout.*', $routeName)
        ) {

            if ($request->expectsJson()) {
                return response()->json([
                    'status' => false,
                    'code' => 'ACCOUNT_UNDER_DISPUTE',
                    'message' => Trans::get('Checkout is restricted while your account is under dispute.'),
                ], 403);
            }

            return back()->with(
                'error',
                Trans::get('Checkout is restricted while your account is under dispute.')
            );
        }

        return $next($request);
    }
}
