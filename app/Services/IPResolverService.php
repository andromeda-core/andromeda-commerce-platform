<?php

namespace App\Services;

use App\Models\Country;
use GeoIp2\Database\Reader;

class IPResolverService
{
    public function __construct(
    ) {}

    public static function resolveCountryIDFromIP(?string $ip)
    {

        try {

            if (request()->hasCookie('pricing_country_id')) {
                return request()->cookie('pricing_country_id');
            }

            if ($ip === '127.0.0.1' || $ip === '::1') {
                $ip = '8.8.8.8';
            }

            $reader = new Reader(storage_path('app/geoip/GeoLite2-Country.mmdb'));

            $record = $reader->country($ip);

            $iso = $record->country->isoCode;

            $country = Country::where('iso_code', $iso)
                ->where('is_active', 1)
                ->first();

            $countryId = $country?->id;

            if (empty($countryId)) {
                return null;
            }

            cookie()->queue(cookie(
                'pricing_country_id',
                $countryId,
                0,
                null,
                null,
                false,
                true
            ));

            return $countryId;

        } catch (\Exception $e) {

            return null;
        }
    }
}
