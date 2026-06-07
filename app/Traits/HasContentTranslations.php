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

    /**
     * Return the translated value for a field in the given locale,
     * falling back to the original column (English default) when missing/empty.
     * NOTE: Phase 1 does not call this on the website yet. It exists for Phase 2.
     */
    public function translatedValue(string $field, ?string $locale = null)
    {
        $original = $this->{$field} ?? null;

        if (! in_array($field, $this->getTranslatableFields(), true)) {
            return $original;
        }

        $locale = $locale ?: app()->getLocale();

        $language = Language::where('code', $locale)->first();
        if (! $language) {
            return $original;
        }

        $translation = $this->contentTranslations
            ->first(fn ($t) => $t->language_id === $language->id && $t->field === $field);

        if (! $translation || $translation->value === null || $translation->value === '') {
            return $original;
        }

        return $translation->value;
    }
}
