<?php

namespace App\Traits;

use App\Models\Language;
use App\Models\TemplateTranslation;

/**
 * Isolated mirror of HasContentTranslations for the Templates module.
 *
 * Deliberately separate from HasContentTranslations: a simple (non-polymorphic)
 * hasMany on template_id, reading/writing the template_translations table only.
 * The original content-translation stack is never touched or reused.
 */
trait HasTemplateTranslations
{
    public function templateTranslations()
    {
        return $this->hasMany(TemplateTranslation::class, 'template_id');
    }

    public function getTemplateTranslatableFields(): array
    {
        return property_exists($this, 'templateTranslatableFields') ? $this->templateTranslatableFields : [];
    }

    /** memoized per request: locale code => language id (or null) */
    protected static array $resolvedTemplateLanguageIds = [];

    protected function resolveLanguageId(?string $locale = null): ?int
    {
        $locale = $locale ?: app()->getLocale();

        if (array_key_exists($locale, static::$resolvedTemplateLanguageIds)) {
            return static::$resolvedTemplateLanguageIds[$locale];
        }

        $id = Language::where('code', $locale)->value('id');

        return static::$resolvedTemplateLanguageIds[$locale] = $id ? (int) $id : null;
    }

    /**
     * Return the translated value for a field in the given locale,
     * falling back to the original column (English default) when missing/empty.
     */
    public function translatedTemplateValue(string $field, ?string $locale = null)
    {
        $original = $this->{$field} ?? null;

        if (! in_array($field, $this->getTemplateTranslatableFields(), true)) {
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
        if ($this->relationLoaded('templateTranslations')) {
            $translation = $this->templateTranslations
                ->first(fn ($t) => (int) $t->language_id === $languageId && $t->field === $field);
        } else {
            $translation = $this->templateTranslations()
                ->where('language_id', $languageId)
                ->where('field', $field)
                ->first();
        }

        if (! $translation || $translation->value === null || $translation->value === '') {
            return $original;
        }

        // Array fields would be stored as JSON; decode back to array.
        if (is_array($original)) {
            $decoded = json_decode($translation->value, true);

            return is_array($decoded) ? $decoded : $original;
        }

        return $translation->value;
    }
}
