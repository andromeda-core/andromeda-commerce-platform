<?php

namespace App\Helpers;

use App\Models\Translation;
use Illuminate\Support\Facades\Cache;

class Trans
{
    public static function get(string $key, ?string $defaultLocale = null)
    {
        $locale = $defaultLocale ?? app()->getLocale();

        return Cache::tags(["translation_{$locale}"])->remember("trans_{$locale}_{$key}", 3600, function () use ($key, $locale) {

            $translation = Translation::whereHas('language', function ($query) use ($locale) {
                $query->where('code', $locale);
            })
                ->whereHas('translationKeys', function ($query) use ($key) {
                    $query->where('key', $key);
                })
                ->first();

            return ($translation && ! empty($translation->value)) ? $translation->value : $key;
        });
    }
}
