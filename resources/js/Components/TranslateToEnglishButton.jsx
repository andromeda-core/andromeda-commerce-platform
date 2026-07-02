import React, { useState } from 'react';
import axios from 'axios';
import Spinner from '@/Components/Spinner';

/**
 * "Translate to English" authoring helper for the post form.
 *
 * Staff may draft the default (English) fields in a non-English language. This
 * button translates whatever is currently in the four default fields INTO
 * English and writes each result straight back into its own field. From there
 * the staff can use the existing AI translation buttons (which go FROM English
 * TO every other language) as normal.
 *
 * It translates all four default fields at once (each an independent, parallel
 * request; empty fields are skipped): title, content, tag, location_name.
 *
 * This is the REVERSE direction of the existing AiTranslationRepeater flow, and
 * it is deliberately INDEPENDENT of it: it never touches `data.translations`,
 * the AI translation hook/panel/repeater, or content_translations. It only reads
 * the field values and calls each field's onChange with the translated English
 * string, reusing the SAME OpenAI endpoint (dashboard.posts.ai-translate-field)
 * with English as the target language.
 *
 * Props:
 *  - value / onChange                 : body content string (data.content) + setter
 *  - titleValue / titleOnChange       : data.title + setter
 *  - tagValue / tagOnChange           : data.tag + setter
 *  - locationValue / locationOnChange : data.location_name + setter
 *  - englishLanguageId                : integer id of English in the languages table (target)
 */

// English is the app's fallback locale and is seeded with a fixed id=1
// (database/seeders/LanguageSeeder.php). The Posts create/edit `languages` prop
// is built with `where('code','!=','en')`, so it EXCLUDES English — the id passed
// from the page resolves to undefined and this confirmed constant is used instead.
const DEFAULT_ENGLISH_LANGUAGE_ID = 1;

export default function TranslateToEnglishButton({
    value = '',
    onChange,
    titleValue = '',
    titleOnChange,
    tagValue = '',
    tagOnChange,
    locationValue = '',
    locationOnChange,
    englishLanguageId = DEFAULT_ENGLISH_LANGUAGE_ID,
}) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const targetLanguageId = englishLanguageId ?? DEFAULT_ENGLISH_LANGUAGE_ID;

    // The four default fields this button translates. `field` matches the
    // endpoint's allow-list (title, content, tag, location_name); `label` is the
    // human-facing name used in the error message.
    const fields = [
        { field: 'title', label: 'Title', value: titleValue, onChange: titleOnChange },
        { field: 'content', label: 'Content', value: value, onChange: onChange },
        { field: 'tag', label: 'Tag', value: tagValue, onChange: tagOnChange },
        { field: 'location_name', label: 'Location Name', value: locationValue, onChange: locationOnChange },
    ];

    // Enabled when at least one of the four fields has something to translate.
    // OLD (single-field content-only gate):
    // const disabled = loading || !value?.trim();
    const hasAnyValue = fields.some((f) => f.value?.trim());
    const disabled = loading || !hasAnyValue;

    const handleTranslate = async () => {
        if (disabled) return;

        // Clear any previous error on a fresh attempt.
        setError('');
        setLoading(true);

        // Only translate fields that actually have a value; skip empties entirely
        // (no request is sent for them at all).
        const jobs = fields.filter((f) => f.value?.trim());

        try {
            // Fire all field translations in parallel. Each job catches its own
            // error and reports a per-field result, so one failure never drops the
            // successful fields (Promise.all still resolves with every result).
            // OLD (single content-only call):
            // const { data } = await axios.post(route('dashboard.posts.ai-translate-field'), {
            //     field: 'content', value: value, target_language_id: targetLanguageId,
            // });
            // if (data?.status && typeof data.value === 'string') onChange?.(data.value);
            const results = await Promise.all(
                jobs.map(async (job) => {
                    try {
                        // Dedicated reverse endpoint: English is the hardcoded target server-side,
                        // so no target_language_id is sent. Request shape: { field, value }.
                        const { data } = await axios.post(route('dashboard.posts.ai-translate-to-english'), {
                            field: job.field,
                            value: job.value,
                        });

                        // Controller returns the translated text under `value` (NOT `translated`).
                        if (data?.status && typeof data.value === 'string') {
                            job.onChange?.(data.value);
                            return { label: job.label, ok: true };
                        }
                        return { label: job.label, ok: false };
                    } catch (err) {
                        return { label: job.label, ok: false };
                    }
                }),
            );

            const failed = results.filter((r) => !r.ok).map((r) => r.label);
            if (failed.length) {
                setError(`Translation failed for: ${failed.join(', ')}. Please try again.`);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="my-4">
            {/* Right-aligned to match the form layout (button style still mirrors AddSourceLinkButton). */}
            <div className="flex justify-end">
                <button
                    type="button"
                    onClick={handleTranslate}
                    disabled={disabled}
                    className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm font-medium text-main-text-light transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent dark:border-gray-600 dark:text-main-text-dark dark:hover:bg-white/5 dark:disabled:hover:bg-transparent"
                >
                    {loading ? (
                        <Spinner
                            customSize={'h-4 w-4'}
                            Color={
                                'fill-main-text-light dark:fill-main-text-dark text-main-text-dark dark:text-main-text-light'
                            }
                        />
                    ) : (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="h-4 w-4"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="m10.5 21 5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 0 1 6-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 0 1-3.827-5.802m0 0a18.022 18.022 0 0 1-.257-.288"
                            />
                        </svg>
                    )}
                    {loading ? 'Translating…' : 'Translate to English'}
                </button>
            </div>

            {error && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
        </div>
    );
}
