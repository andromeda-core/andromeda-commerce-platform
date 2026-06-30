import React from 'react';
// FIX 1: reuse the project's existing Spinner (same one used in Shop/index.jsx + form buttons).
import Spinner from '@/Components/Spinner';

// Reusable, domain-agnostic AI translation generator panel.
// Sits ABOVE the manual TranslationsRepeater and shares data.translations via onInject.
// No domain-specific hardcoding: the caller passes its own fields/languages/endpoint.
//
// Props:
//  - sourceFields      : { [fieldKey]: value }  the current English source values
//  - languages         : [{ id, name, code }]   (already excludes the fallback)
//  - translations      : current data.translations array (manual + injected)
//  - endpointRouteName  : Ziggy route name for the AI translate endpoint
//  - onInject          : (language_id, field, value) => void  functional merge into data.translations
//  - startTranslation  : hook control (language, sourceFields, endpointRouteName, onInject) => void
//  - jobs              : hook jobs list (used to mark running languages)

// FIX 1: use the existing reusable Spinner sized small for inside the button.
// OLD (inline svg, replaced):
// const spinner = (
//     <svg className="w-4 h-4 animate-spin" ...>...</svg>
// );
const spinner = (
    <Spinner
        customSize={'h-4 w-4'}
        Color={'fill-main-text-light dark:fill-main-text-dark text-main-text-dark dark:text-main-text-light'}
    />
);

const sparkleIcon = (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="size-4"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z"
        />
    </svg>
);

export default function AiTranslationRepeater({
    sourceFields = {},
    languages = [],
    translations = [],
    endpointRouteName,
    onInject,
    startTranslation,
    jobs = [],
    // FIX (incomplete cleanup): caller cleanup for a non-completing run (fail/cancel/stop).
    onIncomplete,
}) {
    // Languages already present in data.translations (manual or injected).
    const translatedIds = (Array.isArray(translations) ? translations : [])
        .map((b) => b?.language_id)
        .filter((id) => id !== '' && id !== null && id !== undefined)
        .map(String);

    // Languages with an active (queued/translating) AI job.
    // FIX: ACTIVE only. 'failed' and 'done' jobs are deliberately NOT in the exclusion set,
    // so a dismissed-failed language returns as available (done languages stay excluded via
    // translatedIds because their successful translation lives in data.translations).
    const runningIds = (jobs || [])
        .filter((j) => j.status === 'queued' || j.status === 'translating')
        .map((j) => String(j.language_id));

    const isRunning = (id) => runningIds.includes(String(id));

    // Combined exclusion: available = not already translated AND not running.
    const availableLanguages = (languages || []).filter(
        (l) => !translatedIds.includes(String(l.id)) && !isRunning(l.id),
    );

    const runningLanguages = (languages || []).filter((l) => isRunning(l.id));

    const handleTranslate = (language) => {
        if (typeof startTranslation === 'function') {
            // FIX (incomplete cleanup): snapshot the language's existing block BEFORE the run so
            // an incomplete run can remove (if new) or revert (if pre-existing) exactly its work.
            const list = Array.isArray(translations) ? translations : [];
            const previousBlock =
                list.find((b) => String(b?.language_id) === String(language.id)) || null;
            startTranslation(language, sourceFields, endpointRouteName, onInject, {
                previousBlock,
                onIncomplete,
            });
        }
    };

    const chipBase =
        'inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition';

    return (
        <div className="mt-10">
            <div className="flex items-center gap-2">
                {sparkleIcon}
                <h3 className="text-base font-semibold text-main-text-light dark:text-main-text-dark">
                    AI Translation (Auto-generate)
                </h3>
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Optional. Pick a language to auto-translate the current content. Generated text is
                injected into the Translations section below, where you can review and edit it
                before saving.
            </p>

            {availableLanguages.length === 0 && runningLanguages.length === 0 && (
                <p className="mt-4 rounded-lg border border-dashed border-gray-300 p-4 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
                    No languages left to auto-translate.
                </p>
            )}

            {(availableLanguages.length > 0 || runningLanguages.length > 0) && (
                <div className="mt-4 flex flex-wrap gap-3">
                    {/* Running languages: disabled spinner chip */}
                    {runningLanguages.map((l) => (
                        <button
                            key={`running-${l.id}`}
                            type="button"
                            disabled
                            className={`${chipBase} cursor-not-allowed border-indigo-300 bg-indigo-50 text-indigo-600 opacity-80 dark:border-indigo-500/40 dark:bg-indigo-500/10 dark:text-indigo-300`}
                        >
                            {spinner}
                            Translating {l.name}...
                        </button>
                    ))}

                    {/* Available languages: clickable translate chip */}
                    {availableLanguages.map((l) => (
                        <button
                            key={`available-${l.id}`}
                            type="button"
                            onClick={() => handleTranslate(l)}
                            className={`${chipBase} border-gray-300 bg-white text-main-text-light hover:border-indigo-400 hover:text-indigo-600 dark:border-gray-600 dark:bg-deepcharcoal dark:text-main-text-dark dark:hover:border-indigo-400 dark:hover:text-indigo-300`}
                        >
                            {sparkleIcon}
                            Translate to {l.name}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
