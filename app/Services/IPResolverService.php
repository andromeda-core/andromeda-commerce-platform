<?php

namespace App\Services;

use App\Models\Country;
use GeoIp2\Database\Reader;
use Illuminate\Support\Facades\Log;

class IPResolverService
{

    // FOR PROD
    public static function resolveCountryIDFromIP(?string $ip = null)
    {
        try {
            // STEP 1: Resolve actual IP first (this was completely missing)
            $ip = $ip ?? request()->ip();

            // STEP 2: Local dev fallback for testing
            if (in_array($ip, ['127.0.0.1', '::1'])) {
                $ip = '39.45.0.1'; // Pakistan IP for local testing
            }

            // STEP 3: Check cookie cache, but VALIDATE it points to an active country
            if (request()->hasCookie('pricing_country_id')) {
                $cachedId = (int) request()->cookie('pricing_country_id');

                if ($cachedId > 0) {
                    $exists = Country::where('id', $cachedId)
                        ->where('is_active', 1)
                        ->exists();

                    if ($exists) {
                        return $cachedId;
                    }
                    // If cache is stale/invalid, fall through to re-resolve
                }
            }

            // STEP 4: MMDB file check
            $mmdbPath = storage_path('app/geoip/GeoLite2-Country.mmdb');

            if (!file_exists($mmdbPath)) {
                Log::warning('GeoIP MMDB file missing at: ' . $mmdbPath);
                return null;
            }

            // STEP 5: GeoIP lookup
            $reader = new Reader($mmdbPath);
            $record = $reader->country($ip);
            $iso = $record->country->isoCode;

            Log::info('GeoIP Resolved', ['ip' => $ip, 'iso' => $iso]);

            // STEP 6: Database lookup
            $country = Country::where('iso_code', $iso)
                ->where('is_active', 1)
                ->first();

            if (!$country) {
                Log::info('Country not found or inactive', ['iso' => $iso]);
                return null;
            }

            // STEP 7: Cache in cookie for 30 days
            cookie()->queue(cookie(
                'pricing_country_id',
                $country->id,
                60 * 24 * 30, // 30 days in minutes
                null,
                null,
                false,
                true // httpOnly
            ));

            return $country->id;
        } catch (\Exception $e) {
            Log::error('IPResolverService failed', [
                'ip' => $ip ?? null,
                'message' => $e->getMessage(),
            ]);
            return null;
        }
    }


    // FOR LOCAL DEV TESTING ONLY
    // public static function resolveCountryIDFromIP(?string $ip = null)
    // {
    //     try {
    //         // Step 1: IP resolve karo (real IP ya local fallback)
    //         $ip = $ip ?? request()->ip();

    //         if (in_array($ip, ['127.0.0.1', '::1'])) {
    //             $ip = '39.45.0.1'; // Local testing ke liye Pakistan IP
    //         }

    //         // Step 2: Cookie check karo, LEKIN validate karo
    //         if (request()->hasCookie('pricing_country_id')) {
    //             $cachedId = (int) request()->cookie('pricing_country_id');

    //             if ($cachedId > 0) {
    //                 $valid = Country::where('id', $cachedId)
    //                     ->where('is_active', 1)
    //                     ->exists();

    //                 if ($valid) {
    //                     return $cachedId;
    //                 }
    //                 // Agar cookie invalid hai, niche chalo aur re-resolve karo
    //             }
    //         }

    //         // Step 3: GeoIP lookup
    //         $reader = new Reader(storage_path('app/geoip/GeoLite2-Country.mmdb'));
    //         $record = $reader->country($ip);
    //         $iso = $record->country->isoCode;

    //         $country = Country::where('iso_code', $iso)
    //             ->where('is_active', 1)
    //             ->first();

    //         if (!$country) {
    //             return null;
    //         }

    //         cookie()->queue(cookie(
    //             'pricing_country_id',
    //             $country->id,
    //             60 * 24 * 30, // 30 days
    //             null,
    //             null,
    //             false,
    //             true
    //         ));

    //         return $country->id;
    //     } catch (\Exception $e) {
    //         return null;
    //     }
    // }
}
