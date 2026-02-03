<?php

namespace App\Http\Middleware;

use App\Models\CartItem;
use App\Models\SmartphoneCartAddon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user()?->load(['customer', 'roles']);

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user ? [
                    ...collect($user)->except('roles')->toArray(),
                    'customer' => $user->customer,
                    'role' => $user->roles->pluck('name')->implode(''),
                    'permissions' => $user->getAllPermissions()->pluck('name'),

                ] : null,
            ],

            'flash' => function () {
                return [
                    'success' => session('success'),
                    'error' => session('error'),
                    'info' => session('info'),
                ];
            },

            'generalSetting' => Cache::get('general_config'),
            'currency' => Cache::get('currency'),
            // 'googleMapSetting' => Cache::get('google_map_setting'),

            'asset' => asset(''),

            // ...($user && $user?->hasRole('Customer') && $request->routeIs('home') ? [
            //     'cart_items' => CartItem::where('customer_id', $user->customer?->id)->get(),
            //     'smartphone_addon_items' => SmartphoneCartAddon::where('customer_id', $user->customer?->id)->get(),
            // ] : ['cart_items' => [], 'smartphone_addon_items' => []]),

        ];
    }
}
