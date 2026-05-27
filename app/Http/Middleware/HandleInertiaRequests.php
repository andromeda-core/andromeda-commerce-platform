<?php

namespace App\Http\Middleware;

use App\Models\CartItem;
use App\Models\SmartphoneCartAddon;
use App\Services\CurrencyResolverService;
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
        $user = $request->user()?->load(['customer', 'roles', 'distributor']);

        $shouldShareFlash = $request->isMethod('GET') && $request->header('X-Inertia');

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

            'flash' => function () use ($request, $shouldShareFlash) {
                if (! $shouldShareFlash) {
                    return ['success' => null, 'error' => null, 'info' => null, 'flashId' => null];
                }

                $success = $request->session()->pull('success');
                $error = $request->session()->pull('error');
                $info = $request->session()->pull('info');

                // Only generate a unique ID when there is actual flash content.
                // This ID is what we use to deduplicate on the frontend.
                $flashId = ($success || $error || $info)
                    ? uniqid('flash_', true)
                    : null;

                return [
                    'success' => $success,
                    'error' => $error,
                    'info' => $info,
                    'flashId' => $flashId,
                ];
            },

            'generalSetting' => Cache::get('general_config'),
            'currency' => Cache::get('currency'),

            'displayCurrency' => function () {
                try {
                    return (new CurrencyResolverService())->resolve();
                } catch (\Throwable $e) {
                    return [
                        'currency_id'     => null,
                        'code'            => 'USD',
                        'symbol'          => '$',
                        'exchange_rate'   => 1.0,
                        'rate_source'     => null,
                        'rate_updated_at' => null,
                        'is_fallback'     => true,
                    ];
                }
            },

            // Lazy: all active currencies with a usable exchange rate, for the
            // currency-switcher dropdown. Cached 1 hour; invalidated by Currency model events.
            'availableCurrencies' => function () {
                try {
                    return Cache::remember('available_currencies', 3600, function () {
                        return \App\Models\Currency::where('exchange_rate', '>', 0)
                            ->orderBy('name')
                            ->with('country:id,name')
                            ->get(['id', 'name', 'symbol', 'country_id', 'exchange_rate'])
                            ->toArray();
                    });
                } catch (\Throwable $e) {
                    return [];
                }
            },

            // 'googleMapSetting' => Cache::get('google_map_setting'),

            'asset' => asset(''),

            // ...($user && $user?->hasRole('Customer') && $request->routeIs('home') ? [
            //     'cart_items' => CartItem::where('customer_id', $user->customer?->id)->get(),
            //     'smartphone_addon_items' => SmartphoneCartAddon::where('customer_id', $user->customer?->id)->get(),
            // ] : ['cart_items' => [], 'smartphone_addon_items' => []]),

        ];
    }
}
