<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TrackUserActivity
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {

        $user = $request->user();
        if (! $user || $user?->is_dormant) {
            return $next($request);
        }

        $method = $request->method();

        $isWriteAction = in_array($method, ['POST', 'PUT', 'PATCH', 'DELETE']);

        $routeName = optional($request->route())->getName();

        $trackableRoutes = [
            'website.profile.*',
            'website.carts.*',
            'website.checkout.*',
            'website.shipping-addresses.*',
            'website.orders.*',
        ];

        $shouldTrack = false;

        foreach ($trackableRoutes as $pattern) {
            if (\Str::is($pattern, $routeName)) {
                $shouldTrack = true;
                break;
            }
        }

        if ($shouldTrack) {
            if ($isWriteAction) {
                $track = true;
            } else {
                if (is_null($user->last_activity_at)) {
                    $track = true;
                } else {
                    $last_activity = \Carbon\Carbon::parse($user->last_activity_at);
                    $minutesPassed = now()->greaterThan($last_activity)
                         ? $last_activity->diffInMinutes(now())
                         : 0;
                    $track = $minutesPassed >= 30;
                }
            }

            if ($track) {
                $user->updateQuietly([
                    'last_activity_at' => now(),
                ]);
            }
        }

        return $next($request);
    }
}
