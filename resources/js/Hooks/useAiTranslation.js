import { useState, useRef, useCallback, useEffect } from 'react';
import axios from 'axios';
import { router } from '@inertiajs/react';

// Reusable, domain-agnostic AI translation hook.
// Knows nothing about Posts/Smartphones/Lodging. The caller passes its own
// sourceFields, endpoint route name, and onInject merge callback.

// Default per-field order used for the sequential translate + progress bar.
// The caller may override via the fieldOrder arg of startTranslation.
export const DEFAULT_FIELD_ORDER = ['title', 'content', 'tag', 'location_name'];

// FIX (concurrency cap): max LANGUAGES translating in parallel. Extra clicked languages
// wait in a 'queued' state and auto-start as running slots free up. The per-field loop
// inside each job stays sequential; this caps parallel languages only (avoids server 504s).
const MAX_CONCURRENT = 2;

// Reusable functional-merge helper. Reproduces the manual repeater shape
// { language_id, fields: { ... } } so injected values land in data.translations
// and render inside the existing manual repeater for that language.
export function mergeTranslationField(prev, languageId, field, value) {
    const list = Array.isArray(prev) ? prev : [];
    const idx = list.findIndex((b) => String(b?.language_id) === String(languageId));

    if (idx === -1) {
        return [...list, { language_id: languageId, fields: { [field]: value } }];
    }

    return list.map((b, i) =>
        i === idx ? { ...b, fields: { ...(b.fields || {}), [field]: value } } : b,
    );
}

// FIX: remove a single language's block entirely. Used when dismissing a FAILED attempt
// that left a partial AI-injected block, so the language becomes selectable again. Pure
// and domain-agnostic (parallel to mergeTranslationField); never touches other languages.
export function removeTranslationLanguage(prev, languageId) {
    const list = Array.isArray(prev) ? prev : [];
    return list.filter((b) => String(b?.language_id) !== String(languageId));
}

// FIX (incomplete cleanup): undo the partial work of an AI run that did NOT reach 100%
// (failed/cancelled/stopped). If the block was CREATED by this run (no previousBlock), drop
// it entirely so the language's AI button reappears. If the language PRE-EXISTED, never
// delete it; only revert the fields THIS run injected back to their previous values. Pure
// and domain-agnostic. previousBlock is the language's block snapshot taken BEFORE the run.
export function cleanupIncompleteTranslation(prev, { languageId, previousBlock = null, injectedFields = [] }) {
    const list = Array.isArray(prev) ? prev : [];

    // Block was newly created by this run: remove the half-injected record.
    if (!previousBlock) {
        return removeTranslationLanguage(list, languageId);
    }

    // Pre-existing block: revert only the fields this run touched; keep everything else.
    return list.map((b) => {
        if (String(b?.language_id) !== String(languageId)) return b;
        const fields = { ...(b.fields || {}) };
        injectedFields.forEach((f) => {
            const prevVal = previousBlock?.fields?.[f];
            if (prevVal === undefined) {
                delete fields[f]; // field did not exist before this run
            } else {
                fields[f] = prevVal; // restore the pre-run value
            }
        });
        return { ...b, fields };
    });
}

function isAbortError(err) {
    return (
        (axios.isCancel && axios.isCancel(err)) ||
        err?.name === 'CanceledError' ||
        err?.code === 'ERR_CANCELED'
    );
}

export default function useAiTranslation() {
    // jobs: [{ language_id, language_name, status, fieldProgress, error }]
    const [jobs, setJobs] = useState([]);

    // language_id -> { [field]: AbortController } so Cancel aborts in-flight requests.
    const controllersRef = useRef({});

    // FIX (concurrency cap): scheduler state (refs so it is reliable inside async flows).
    const paramsRef = useRef({}); // language_id -> { sourceFields, endpointRouteName, onInject, fieldOrder, previousBlock, onIncomplete }
    const queueRef = useRef([]); // language_ids waiting for a slot (FIFO)
    const runningRef = useRef(new Set()); // String(language_id) currently running
    const pumpRef = useRef(null); // latest scheduler, called on completion/cancel/dismiss

    // FIX (incomplete cleanup): fields actually injected during the current run, per language,
    // so a non-completing run can undo exactly what it injected.
    const injectedRef = useRef({}); // language_id -> [field, ...]

    const updateJob = useCallback((languageId, patch) => {
        setJobs((prev) =>
            prev.map((j) =>
                String(j.language_id) === String(languageId)
                    ? { ...j, ...(typeof patch === 'function' ? patch(j) : patch) }
                    : j,
            ),
        );
    }, []);

    // FIX (incomplete cleanup): a run that did NOT reach 100% must undo the partial fields it
    // injected. Delegates the actual data.translations mutation to the caller-provided
    // onIncomplete (functional setData). No-op when nothing was injected.
    const finalizeIncomplete = useCallback((languageId) => {
        const params = paramsRef.current[languageId];
        const injected = injectedRef.current[languageId] || [];
        if (params?.onIncomplete && injected.length > 0) {
            params.onIncomplete(languageId, {
                previousBlock: params.previousBlock ?? null,
                injectedFields: [...injected],
            });
        }
    }, []);

    // FIX (concurrency cap): runs ONE language's 4-field sequence (unchanged field logic).
    // Promotes the job to 'translating', runs fields in order, then frees its slot and
    // pumps the next queued language.
    const runJob = useCallback(
        async (languageId) => {
            const params = paramsRef.current[languageId];
            if (!params) {
                runningRef.current.delete(String(languageId));
                pumpRef.current?.();
                return;
            }

            const { sourceFields, endpointRouteName, onInject, fieldOrder } = params;

            // Promote queued -> translating now that a slot is ours.
            updateJob(languageId, { status: 'translating' });
            controllersRef.current[languageId] = {};

            let failed = false;
            let aborted = false;

            for (const field of fieldOrder) {
                const value = (sourceFields?.[field] ?? '').toString();

                // Empty source field: advance the bar, no API call (so empty
                // location_name never blocks completion).
                if (value.trim() === '') {
                    updateJob(languageId, (j) => ({
                        fieldProgress: { ...j.fieldProgress, [field]: 100 },
                    }));
                    continue;
                }

                const controller = new AbortController();
                if (controllersRef.current[languageId]) {
                    controllersRef.current[languageId][field] = controller;
                }

                try {
                    const { data } = await axios.post(
                        route(endpointRouteName),
                        { field, value, target_language_id: languageId },
                        { signal: controller.signal },
                    );

                    if (data?.status && typeof data.value === 'string') {
                        // Inject immediately so the manual repeater reflects it live.
                        onInject?.(languageId, field, data.value);
                        // FIX (incomplete cleanup): record what this run injected.
                        if (injectedRef.current[languageId]) {
                            injectedRef.current[languageId].push(field);
                        }
                        updateJob(languageId, (j) => ({
                            fieldProgress: { ...j.fieldProgress, [field]: 100 },
                        }));
                    } else {
                        failed = true;
                        updateJob(languageId, { error: data?.message || 'Translation failed' });
                        break;
                    }
                } catch (err) {
                    // Cancel: bail out quietly (cancel() already removed the job row).
                    if (isAbortError(err)) {
                        aborted = true;
                        break;
                    }
                    failed = true;
                    updateJob(languageId, {
                        error: err?.response?.data?.message || 'Translation failed',
                    });
                    break;
                } finally {
                    if (controllersRef.current[languageId]) {
                        delete controllersRef.current[languageId][field];
                    }
                }
            }

            delete controllersRef.current[languageId];
            runningRef.current.delete(String(languageId));

            // Aborted jobs were already finalized + removed by cancel(); just free the slot.
            if (aborted) {
                delete injectedRef.current[languageId];
                delete paramsRef.current[languageId];
                pumpRef.current?.();
                return;
            }

            // FIX (incomplete cleanup): a FAILED run did not reach 100%, so undo its partial
            // injects (remove the AI-created block, or revert pre-existing fields) BEFORE the
            // params/injected snapshot is dropped. A successful (done) run keeps its injects.
            if (failed) {
                finalizeIncomplete(languageId);
            }

            delete injectedRef.current[languageId];
            delete paramsRef.current[languageId];
            updateJob(languageId, { status: failed ? 'failed' : 'done' });
            pumpRef.current?.();
        },
        [updateJob, finalizeIncomplete],
    );

    // FIX (concurrency cap): start queued languages until MAX_CONCURRENT are running.
    const pump = useCallback(() => {
        while (runningRef.current.size < MAX_CONCURRENT && queueRef.current.length > 0) {
            const nextId = queueRef.current.shift();
            const sid = String(nextId);
            // Skip stale entries (cancelled/dismissed) or already-running languages.
            if (!paramsRef.current[nextId] || runningRef.current.has(sid)) {
                continue;
            }
            runningRef.current.add(sid);
            runJob(nextId);
        }
    }, [runJob]);

    // Keep pumpRef pointing at the latest pump so runJob/cancel/dismiss can call it
    // without forming a dependency cycle.
    useEffect(() => {
        pumpRef.current = pump;
    }, [pump]);

    // FIX (concurrency cap): startTranslation now ENQUEUES instead of running immediately.
    // OLD: it set status 'translating' and ran the field loop inline. The 2-at-a-time
    // scheduler (pump) promotes queued jobs to running as slots free.
    // FIX (incomplete cleanup): options carries previousBlock (the language's block snapshot
    // taken BEFORE this run, or null if it did not exist) and onIncomplete (caller cleanup).
    // createdByThisRun is derived = !previousBlock and stored on the job per requirement.
    const startTranslation = useCallback(
        (language, sourceFields, endpointRouteName, onInject, options = {}) => {
            const languageId = language?.id;
            if (languageId == null || !endpointRouteName) return;

            const fieldOrder = options.fieldOrder || DEFAULT_FIELD_ORDER;
            const previousBlock = options.previousBlock ?? null;
            const onIncomplete = options.onIncomplete ?? null;

            paramsRef.current[languageId] = {
                sourceFields,
                endpointRouteName,
                onInject,
                fieldOrder,
                previousBlock,
                onIncomplete,
            };
            injectedRef.current[languageId] = []; // fresh per run

            const initialProgress = {};
            fieldOrder.forEach((f) => {
                initialProgress[f] = 0;
            });

            // Seed/replace the job as 'queued'; the scheduler promotes it to 'translating'.
            setJobs((prev) => [
                ...prev.filter((j) => String(j.language_id) !== String(languageId)),
                {
                    language_id: languageId,
                    language_name: language?.name ?? '',
                    status: 'queued',
                    fieldProgress: initialProgress,
                    error: null,
                    // FIX (incomplete cleanup): true when this run created the block (no prior block).
                    createdByThisRun: !previousBlock,
                },
            ]);

            // Enqueue (dedupe) and try to start now.
            queueRef.current = queueRef.current.filter((id) => String(id) !== String(languageId));
            queueRef.current.push(languageId);
            pumpRef.current?.();
        },
        [],
    );

    const cancel = useCallback(
        (languageId) => {
            const ctrls = controllersRef.current[languageId];
            if (ctrls) {
                Object.values(ctrls).forEach((c) => {
                    try {
                        c.abort();
                    } catch (e) {
                        // ignore
                    }
                });
                delete controllersRef.current[languageId];
            }
            // FIX (incomplete cleanup): undo this run's partial injects BEFORE dropping params.
            finalizeIncomplete(languageId);
            // FIX (concurrency cap): free the slot + queue entry so the next queued job starts.
            delete paramsRef.current[languageId];
            delete injectedRef.current[languageId];
            queueRef.current = queueRef.current.filter((id) => String(id) !== String(languageId));
            runningRef.current.delete(String(languageId));
            setJobs((prev) => prev.filter((j) => String(j.language_id) !== String(languageId)));
            pumpRef.current?.();
        },
        [finalizeIncomplete],
    );

    const dismiss = useCallback((languageId) => {
        // FIX (concurrency cap): defensively free any slot/queue entry too (a done/failed
        // job already freed its slot on completion; this also covers dismissing a queued one).
        const ctrls = controllersRef.current[languageId];
        if (ctrls) {
            Object.values(ctrls).forEach((c) => {
                try {
                    c.abort();
                } catch (e) {
                    // ignore
                }
            });
            delete controllersRef.current[languageId];
        }
        // FIX (incomplete cleanup): dismiss never mutates translations. A 'done' job keeps its
        // completed translation; a 'failed' job was already cleaned on fail. Just drop the row
        // and free bookkeeping.
        delete paramsRef.current[languageId];
        delete injectedRef.current[languageId];
        queueRef.current = queueRef.current.filter((id) => String(id) !== String(languageId));
        runningRef.current.delete(String(languageId));
        setJobs((prev) => prev.filter((j) => String(j.language_id) !== String(languageId)));
        pumpRef.current?.();
    }, []);

    const isBusy = jobs.some((j) => j.status === 'queued' || j.status === 'translating');

    // Navigation locks while busy: warn on tab close/refresh and block in-app nav.
    useEffect(() => {
        if (!isBusy) return undefined;

        const beforeUnload = (e) => {
            e.preventDefault();
            e.returnValue = '';
            return '';
        };
        window.addEventListener('beforeunload', beforeUnload);

        const removeInertiaHook = router.on('before', () => {
            // eslint-disable-next-line no-alert
            const proceed = window.confirm(
                'AI translation is still running. Leaving will cancel it. Continue?',
            );
            if (!proceed) {
                return false;
            }
            return undefined;
        });

        return () => {
            window.removeEventListener('beforeunload', beforeUnload);
            removeInertiaHook();
        };
    }, [isBusy]);

    return { jobs, startTranslation, cancel, dismiss, isBusy };
}
