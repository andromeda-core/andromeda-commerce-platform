<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SetAppLocale
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $locale = config('app.locale');
        if (auth()->check()) {
            $locale = auth()->user()->language_locale;
        } else {
            // 2. Agar guest hai toh Cookie check karein
            $languageCookie = $request->cookie('language');
            if ($languageCookie) {

                $decoded = json_decode($languageCookie, true);
                if (json_last_error() === JSON_ERROR_NONE && isset($decoded['language_locale'])) {
                    $locale = $decoded['language_locale'] ?? config('app.locale');

                } else {
                    $locale = config('app.locale');
                }
            }
        }

        app()->setLocale($locale);

        return $next($request);
    }
}
