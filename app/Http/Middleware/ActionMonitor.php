<?php

namespace App\Http\Middleware;

use App\Jobs\AnalyzeUserRisk;
use App\Models\ActionLog;
use Closure;
use Illuminate\Http\Request;

class ActionMonitor
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle($request, Closure $next)
    {
        $response = $next($request);

        if (! auth()->check()) {
            return $response;
        }

        if (! auth()->user()->hasRole('Customer')) {
            return $response;
        }

        $route = $request->route();

        if (! $route) {
            return $response;
        }

        $routeName = $route->getName();

        if (! $routeName) {
            return $response;
        }

        if (! in_array($request->method(), ['POST', 'PUT', 'PATCH', 'DELETE'])) {
            return $response;
        }

        if (in_array($routeName, [
            'device-fingerprint.store',
            'pwa.manifest',
        ])) {
            return $response;
        }

        ActionLog::create([
            'user_id' => auth()->id(),
            'route' => $route->getName(),
            'path' => $request->path(),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'device_fingerprint' => $request->session()->get('device_fingerprint'),
        ]);

        AnalyzeUserRisk::dispatch(auth()->id())->onQueue('risk-analyzer');

        return $response;
    }
}
