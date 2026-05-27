<?php

namespace App\Http\Controllers\Website;

use App\Http\Controllers\Controller;
use App\Models\Currency;
use Illuminate\Http\Request;

class CurrencySwitcherController extends Controller
{
    /**
     * Store the manual display-currency cookie.
     *
     * This is DISPLAY-ONLY. The cookie is read by CurrencyResolverService
     * as priority 1 in its resolution chain.
     * No pricing, order, checkout, or financial logic is affected here.
     */
    public function __invoke(Request $request)
    {
        $request->validate([
            'currency_id' => ['required', 'integer', 'exists:currencies,id'],
        ]);

        $currency = Currency::find($request->integer('currency_id'));

        // Guard: only a usable exchange_rate (> 0) is required.
        // is_active is intentionally NOT checked — that flag governs the dashboard
        // base-currency selection only and must NOT restrict website display currencies.
        if (
            is_null($currency?->exchange_rate) ||
            ! is_numeric($currency->exchange_rate) ||
            (float) $currency->exchange_rate <= 0
        ) {
            return redirect()->back()->with('error', 'Selected currency is not available right now.');
        }

        // 30-day, httpOnly cookie (Laravel auto-decrypts on read via Request::cookie)
        $cookie = cookie(
            'display_currency_id',
            $request->integer('currency_id'),
            60 * 24 * 30, // minutes → 30 days
            null,          // path (null = app default)
            null,          // domain (null = app default)
            false,         // secure (false = follow app config)
            true,          // httpOnly
        );

        return redirect()->back()
            ->with('success', 'Currency updated.')
            ->withCookie($cookie);
    }

    /**
     * Forget the manual override so CurrencyResolverService falls back to
     * customer-country → IP geo-location → USD.
     */
    public function reset(Request $request)
    {
        $cookie = \Cookie::forget('display_currency_id');

        return redirect()->back()
            ->with('success', 'Currency reset to automatic.')
            ->withCookie($cookie);
    }
}
