<?php

namespace App\Services;

use Illuminate\Database\Eloquent\Model;

class ContentTranslationService
{
    /**
     * Expected $payload shape (from the dashboard form, Phase 2):
     * [
     *   ['language_id' => 2, 'fields' => ['title' => '...', 'content' => '...', 'tag' => '...']],
     *   ['language_id' => 3, 'fields' => ['content' => '...', 'product_details' => [['title'=>'','value'=>'']]]],
     * ]
     *
     * Empty array => no-op. Empty field => translation removed (falls back to default).
     * Idempotent: safe to call on every store/update without creating duplicates.
     */
    public function syncTranslations(Model $model, array $payload): void
    {
        if (! method_exists($model, 'contentTranslations')) {
            return;
        }

        if (empty($payload)) {
            return;
        }

        $allowed = method_exists($model, 'getTranslatableFields')
            ? $model->getTranslatableFields()
            : [];

        if (empty($allowed)) {
            return;
        }

        // Default language is authored in the original columns; never persist a translation for it.
        $defaultLanguageId = \App\Models\Language::where('code', config('app.fallback_locale', 'en'))->value('id');

        foreach ($payload as $block) {
            $languageId = $block['language_id'] ?? null;
            if (! $languageId) {
                continue;
            }

            // Defensive: skip the default language even if a payload somehow includes it.
            if ($defaultLanguageId && (int) $languageId === (int) $defaultLanguageId) {
                continue;
            }

            $fields = $block['fields'] ?? [];

            foreach ($allowed as $field) {
                $value = $fields[$field] ?? null;

                // product_details (and any array field) is stored as JSON
                if (is_array($value)) {
                    $value = json_encode(array_values($value));
                }

                if (is_string($value)) {
                    $value = trim($value);
                }

                if ($value === null || $value === '' || $value === '[]') {
                    $model->contentTranslations()
                        ->where('language_id', $languageId)
                        ->where('field', $field)
                        ->delete();
                    continue;
                }

                $model->contentTranslations()->updateOrCreate(
                    ['language_id' => $languageId, 'field' => $field],
                    ['value' => $value]
                );
            }
        }
    }
}
