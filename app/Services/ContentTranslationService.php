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
     * Empty field => that field's translation removed (falls back to default).
     *
     * $reconcile = true (dashboard forms): the submitted payload is the COMPLETE set of
     * translations for this model instance. Any language NOT present in the payload is
     * treated as removed and its rows are deleted (default language always excluded).
     * This is what makes the "Remove" button actually delete a language, including the
     * case where ALL languages were removed (payload becomes empty). Callers that do not
     * own the full translation set must leave $reconcile = false.
     *
     * Idempotent: safe to call on every store/update without creating duplicates.
     */
    public function syncTranslations(Model $model, array $payload, bool $reconcile = false): void
    {
        if (! method_exists($model, 'contentTranslations')) {
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

        // Language ids present (and valid) in the submitted payload, so reconciliation can
        // delete every OTHER language's rows for this model instance.
        $submittedLanguageIds = [];

        foreach ($payload as $block) {
            $languageId = $block['language_id'] ?? null;
            if (! $languageId) {
                continue;
            }

            // Defensive: skip the default language even if a payload somehow includes it.
            if ($defaultLanguageId && (int) $languageId === (int) $defaultLanguageId) {
                continue;
            }

            $submittedLanguageIds[] = (int) $languageId;

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

        // Reconciliation (dashboard forms only): the payload is authoritative, so any language
        // that exists in the DB for this model but was NOT submitted has been removed in the UI
        // — delete it. The default language is always excluded.
        if ($reconcile) {
            $model->contentTranslations()
                ->when(! empty($submittedLanguageIds), function ($q) use ($submittedLanguageIds) {
                    $q->whereNotIn('language_id', $submittedLanguageIds);
                })
                ->when($defaultLanguageId, function ($q) use ($defaultLanguageId) {
                    $q->where('language_id', '!=', $defaultLanguageId);
                })
                ->delete();
        }
    }
}
