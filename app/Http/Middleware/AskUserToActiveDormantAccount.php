<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AskUserToActiveDormantAccount
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        $allowedRoutes = [
            'website.profile.activate-dormant-account.*',
            'website.languages-translations.getalljson',
        ];

        if ($user && $user->is_dormant) {
            foreach ($allowedRoutes as $route) {
                if ($request->routeIs($route)) {
                    return $next($request);
                }
            }

            return redirect()->route('website.profile.activate-dormant-account.index');
        } elseif ($user && ! $user->is_dormant && $request->routeIs('website.profile.activate-dormant-account.index')) {
            return redirect()->route('home');
        }

        return $next($request);
    }
}
