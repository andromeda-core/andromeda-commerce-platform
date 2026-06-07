<?php

namespace App\Traits;

use App\Models\ContentTranslation;
use App\Models\Language;

trait HasContentTranslations
{
    public function contentTranslations()
    {
        return $this->morphMany(ContentTranslation::class, 'translatable');
    }

    public function getTranslatableFields(): array
    {
        return property_exists($this, 'translatableFields') ? $this->translatableFields : [];
    }

    /** memoized per request: locale code => language id (or null) */
    protected static array $resolvedLanguageIds = [];

    protected function resolveLanguageId(?string $locale = null): ?int
    {
        $locale = $locale ?: app()->getLocale();

        if (array_key_exists($locale, static::$resolvedLanguageIds)) {
            return static::$resolvedLanguageIds[$locale];
        }

        $id = Language::where('code', $locale)->value('id');

        return static::$resolvedLanguageIds[$locale] = $id ? (int) $id : null;
    }

    /**
     * Return the translated value for a field in the given locale,
     * falling back to the original column (English default) when missing/empty.
     */
    public function translatedValue(string $field, ?string $locale = null)
    {
        $original = $this->{$field} ?? null;

        if (! in_array($field, $this->getTranslatableFields(), true)) {
            return $original;
        }

        $locale = $locale ?: app()->getLocale();

        // English / default locale IS the original column. No lookup, no behaviour change.
        if ($locale === config('app.fallback_locale', 'en')) {
            return $original;
        }

        $languageId = $this->resolveLanguageId($locale);
        if (! $languageId) {
            return $original;
        }

        // Use the eager-loaded collection when available, else a scoped lazy query.
        if ($this->relationLoaded('contentTranslations')) {
            $translation = $this->contentTranslations
                ->first(fn ($t) => (int) $t->language_id === $languageId && $t->field === $field);
        } else {
            $translation = $this->contentTranslations()
                ->where('language_id', $languageId)
                ->where('field', $field)
                ->first();
        }

        if (! $translation || $translation->value === null || $translation->value === '') {
            return $original;
        }

        // Array fields (e.g. product_details) are stored as JSON; decode back to array.
        if (is_array($original)) {
            $decoded = json_decode($translation->value, true);

            return is_array($decoded) ? $decoded : $original;
        }

        return $translation->value;
    }
}
