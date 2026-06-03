<?php

namespace App\Console\Commands;

use App\Models\Currency;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SyncExchangeRates extends Command
{
    protected $signature = 'app:sync-exchange-rates';

    protected $description = 'Sync display-only currency exchange rates from the exchange rate API.';

    public function handle()
    {
        // Resolve the base currency from the currently active currency.
        // Its `name` column holds the 3-letter ISO code (dynamic, never hardcoded).
        $base = Currency::where('is_active', true)->first();
        if (! $base) {
            $this->warn('No active currency found. Skipping exchange rate sync.');

            return self::SUCCESS;
        }
        $baseCode = $base->name; // name holds the ISO code

        // Call the free, no-key ExchangeRate-API Open Access endpoint.
        try {
            $response = Http::timeout(15)
                ->get("https://open.er-api.com/v6/latest/{$baseCode}");
        } catch (\Throwable $e) {
            Log::warning('Exchange rate sync failed: ' . $e->getMessage());
            $this->error('Exchange rate API request failed. Keeping last saved rates.');

            return self::SUCCESS; // do not change anything
        }

        // Validate the response. On any unsuccessful result, abort without
        // touching any row so the last saved rates persist (required fallback).
        $data = $response->ok() ? $response->json() : null;
        $rates = $data['rates'] ?? null;
        if (! $data || ($data['result'] ?? null) !== 'success' || empty($rates) || ! is_array($rates)) {
            Log::warning('Exchange rate sync: unsuccessful API response. Keeping last saved rates.');
            $this->error('Exchange rate API returned an unsuccessful response. Keeping last saved rates.');

            return self::SUCCESS;
        }

        // Update only currencies whose ISO code is present in the API response.
        // Use save() so the model's `updated` hook flushes the currency caches.
        $updated = 0;
        foreach (Currency::all() as $currency) {
            $code = $currency->name; // ISO code
            if (! array_key_exists($code, $rates)) {
                continue; // not in API response -> leave untouched (fallback)
            }

            $rate = $rates[$code];
            if (! is_numeric($rate) || $rate <= 0) {
                continue; // invalid -> leave untouched
            }

            $currency->exchange_rate = $rate;
            $currency->rate_source = 'open.er-api.com';
            $currency->rate_updated_at = now();
            $currency->save();
            $updated++;
        }

        $this->info("Exchange rates synced. Updated {$updated} currencies (base {$baseCode}).");

        return self::SUCCESS;
    }
}
