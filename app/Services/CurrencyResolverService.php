<?php

namespace App\Services;

use App\Models\Currency;

/**
 * CurrencyResolverService
 *
 * Decides which display currency and exchange rate a website visitor should see.
 * This service is DISPLAY-ONLY and must never be used in pricing, orders,
 * rewards, commissions, or checkout logic.
 *
 * Resolution priority (highest → lowest):
 *  1. Manual override — 'display_currency_id' cookie
 *  2. Authenticated customer's linked country
 *  3. Visitor IP geo-location country (via IPResolverService)
 *  4. USD fallback (always safe, never throws)
 *
 * This service does NOT write any cookies. Cookie management is delegated to
 * the calling controller layer.
 */
class CurrencyResolverService
{
    // ─────────────────────────────────────────────────────────────────────────
    // Public API
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Resolve the display currency for the current visitor.
     *
     * @return array{
     *   currency_id: int|null,
     *   code: string,
     *   symbol: string,
     *   exchange_rate: float,
     *   rate_source: string|null,
     *   rate_updated_at: string|null,
     *   is_fallback: bool
     * }
     */
    public function resolve(): array
    {
        // ── Priority 1: Manual cookie override ────────────────────────────────
        try {
            $cookieId = request()->cookie('display_currency_id');

            if (! empty($cookieId) && is_numeric($cookieId)) {
                // Look up by ID only. is_active is intentionally NOT checked here —
                // that flag governs the dashboard base-currency selector only and must
                // not restrict which display currencies the website visitor can choose.
                // Only a usable exchange_rate (> 0) is required, matching the same
                // contract enforced by CurrencySwitcherController and availableCurrencies.
                $currency = Currency::find((int) $cookieId);

                if ($currency !== null && $this->hasValidRate($currency)) {
                    return $this->buildResult($currency);
                }
            }
        } catch (\Throwable $e) {
            // Degrade silently to next priority
        }

        // ── Priority 2: Logged-in customer's country ──────────────────────────
        try {
            $customerCountryId = request()->user()?->customer?->country_id;

            if (! empty($customerCountryId)) {
                $currency = $this->getCurrencyByCountryId((int) $customerCountryId);

                if ($currency !== null && $this->hasValidRate($currency)) {
                    return $this->buildResult($currency);
                }
            }
        } catch (\Throwable $e) {
            // Degrade silently to next priority
        }

        // ── Priority 3: IP geo-location country ───────────────────────────────
        try {
            $geoCountryId = IPResolverService::resolveCountryIDFromIP(request()->ip());

            if (! empty($geoCountryId)) {
                $currency = $this->getCurrencyByCountryId((int) $geoCountryId);

                if ($currency !== null && $this->hasValidRate($currency)) {
                    return $this->buildResult($currency);
                }
            }
        } catch (\Throwable $e) {
            // Degrade silently to USD fallback
        }

        // ── Priority 4: USD fallback ───────────────────────────────────────────
        return $this->usdFallback();
    }

    /**
     * Convert a USD amount to the resolved display currency.
     *
     * This is display math ONLY — must never be used for pricing, orders,
     * commissions, rewards, or checkout.
     *
     * @param  float      $usdAmount  The USD amount to convert
     * @param  array|null $resolved   A pre-resolved array from resolve(); calls resolve() if null
     * @return float                  Converted amount rounded to 2 decimal places
     */
    public function convert(float $usdAmount, ?array $resolved = null): float
    {
        $resolved ??= $this->resolve();

        $rate = isset($resolved['exchange_rate']) && is_numeric($resolved['exchange_rate'])
            ? (float) $resolved['exchange_rate']
            : 1.0;

        return round($usdAmount * $rate, 2);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Private helpers
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Look up the active currency linked to the given country ID.
     * Used by priority steps 2 and 3.
     */
    private function getCurrencyByCountryId(?int $countryId): ?Currency
    {
        if (empty($countryId)) {
            return null;
        }

        return Currency::where('country_id', $countryId)
            ->first();
    }

    /**
     * Determine whether a currency has a usable exchange rate.
     * A rate is usable when it is non-null, numeric, and strictly greater than 0.
     */
    private function hasValidRate(Currency $currency): bool
    {
        $rate = $currency->exchange_rate;

        return $rate !== null
            && is_numeric($rate)
            && (float) $rate > 0;
    }

    /**
     * Build the standard resolved-currency result array for a valid currency row.
     */
    private function buildResult(Currency $currency): array
    {
        return [
            'currency_id'     => $currency->id,
            'code'            => (string) $currency->name,
            'symbol'          => (string) $currency->symbol,
            'exchange_rate'   => (float) $currency->exchange_rate,
            'rate_source'     => $currency->rate_source ?? null,
            'rate_updated_at' => $currency->rate_updated_at
                ? $currency->rate_updated_at->toDateTimeString()
                : null,
            'is_fallback'     => false,
        ];
    }

    /**
     * Build the USD fallback result.
     *
     * Tries to find the USD currency row in the database to obtain the correct
     * symbol. The exchange_rate is always enforced as 1.0 regardless of what
     * is stored, because USD is the platform base currency.
     *
     * If the database lookup itself fails (e.g. no connection), returns safe
     * hardcoded defaults so a page render is never broken.
     */
    private function usdFallback(): array
    {
        try {
            $usd = Currency::where('name', 'USD')
                ->first();

            if ($usd !== null) {
                return [
                    'currency_id'     => $usd->id,
                    'code'            => 'USD',
                    'symbol'          => (string) $usd->symbol,
                    'exchange_rate'   => 1.0, // USD base is always 1 — ignore stored value
                    'rate_source'     => $usd->rate_source ?? null,
                    'rate_updated_at' => $usd->rate_updated_at
                        ? $usd->rate_updated_at->toDateTimeString()
                        : null,
                    'is_fallback'     => true,
                ];
            }
        } catch (\Throwable $e) {
            // Even the DB lookup failed — fall through to hardcoded safe defaults
        }

        // Absolute last resort — no database dependency
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
}
