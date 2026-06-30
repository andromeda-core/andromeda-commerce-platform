import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
// BUGFIX (Bug 4): reuse the project's existing Spinner for visual consistency.
import Spinner from '@/Components/Spinner';

// Reusable, domain-agnostic progress panel (Drive-style upload widget).
// Takes jobs + handlers as props. No domain-specific text.
//
// Props:
//  - jobs       : [{ language_id, language_name, status, fieldProgress, error }]
//  - onCancel   : (language_id) => void   abort a running job
//  - onRetry    : (language_id) => void   re-run a failed job
//  - onDismiss  : (language_id) => void   remove a done/leaving row

const DONE_DISMISS_MS = 4000; // auto-dismiss a done row after this delay
const SLIDE_MS = 350; // right-slide animation duration before removal

const overallPercent = (job) => {
    const vals = Object.values(job?.fieldProgress || {});
    if (vals.length === 0) return 0;
    return Math.round(vals.reduce((a, b) => a + (Number(b) || 0), 0) / vals.length);
};

// BUGFIX (Bug 4): use the existing reusable Spinner instead of an inline SVG.
// OLD (inline svg, replaced):
// const spinner = (
//     <svg className="w-4 h-4 animate-spin text-indigo-500" ...>...</svg>
// );
const spinner = (
    <Spinner
        customSize={'h-4 w-4'}
        Color={'fill-indigo-500 text-indigo-200 dark:fill-indigo-400 dark:text-indigo-900'}
    />
);

export default function AiTranslationPanel({ jobs = [], onCancel, onRetry, onDismiss }) {
    const [collapsed, setCollapsed] = useState(false);
    const [leaving, setLeaving] = useState({}); // language_id -> true while sliding out
    const scheduledRef = useRef({}); // language_id -> timeout id

    // Auto-dismiss done rows with a right-slide.
    useEffect(() => {
        jobs.forEach((job) => {
            if (job.status === 'done' && !scheduledRef.current[job.language_id]) {
                scheduledRef.current[job.language_id] = setTimeout(() => {
                    setLeaving((p) => ({ ...p, [job.language_id]: true }));
                    setTimeout(() => {
                        onDismiss?.(job.language_id);
                        delete scheduledRef.current[job.language_id];
                        setLeaving((p) => {
                            const next = { ...p };
                            delete next[job.language_id];
                            return next;
                        });
                    }, SLIDE_MS);
                }, DONE_DISMISS_MS);
            }
        });
    }, [jobs, onDismiss]);

    // Clear any pending timers on unmount.
    useEffect(
        () => () => {
            Object.values(scheduledRef.current).forEach((t) => clearTimeout(t));
            scheduledRef.current = {};
        },
        [],
    );

    if (!jobs || jobs.length === 0) return null;

    const runningCount = jobs.filter(
        (j) => j.status === 'queued' || j.status === 'translating',
    ).length;

    return createPortal(
        // FIX 2: responsive. Mobile (default): bottom-docked bar, full width minus small side
        // margins, never top-stuck or full-screen. Desktop (sm+): floating bottom-right, w-80.
        // OLD (desktop-only, replaced):
        // <div className="fixed bottom-4 right-4 z-[99999] w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl ...">
        <div className="fixed inset-x-2 bottom-2 z-[99999] overflow-hidden rounded-xl border border-gray-200 bg-white text-main-text-light shadow-2xl dark:border-gray-700 dark:bg-deepcharcoal dark:text-main-text-dark sm:inset-x-auto sm:bottom-4 sm:left-auto sm:right-4 sm:w-80">
            {/* Header */}
            <div className="flex items-center justify-between gap-2 border-b border-gray-200 px-4 py-3 dark:border-gray-700">
                <div className="flex items-center gap-2 text-sm font-semibold">
                    {runningCount > 0 && spinner}
                    <span>
                        AI Translation
                        {runningCount > 0 ? ` (${runningCount} running)` : ''}
                    </span>
                </div>
                <button
                    type="button"
                    onClick={() => setCollapsed((c) => !c)}
                    className="rounded p-1 text-gray-500 transition hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/10"
                    aria-label={collapsed ? 'Expand' : 'Collapse'}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className={`size-4 transition-transform ${collapsed ? 'rotate-180' : ''}`}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m19.5 8.25-7.5 7.5-7.5-7.5"
                        />
                    </svg>
                </button>
            </div>

            {/* Body */}
            {!collapsed && (
                // FIX 2: cap height to 40vh on mobile (internal scroll) so it never covers the
                // whole screen; keep the prior max-h-80 on desktop.
                <div className="max-h-[40vh] divide-y divide-gray-100 overflow-y-auto overflow-x-hidden scrollbar-thin dark:divide-gray-700/60 sm:max-h-80">
                    {jobs.map((job) => {
                        const percent = overallPercent(job);
                        // FIX (concurrency cap): distinguish queued (waiting for a slot) from
                        // translating. Both are cancelable, but queued must not look like a
                        // running 0% bar.
                        const isQueued = job.status === 'queued';
                        const isTranslating = job.status === 'translating';
                        const isRunning = isQueued || isTranslating;
                        const isDone = job.status === 'done';
                        const isFailed = job.status === 'failed';
                        const isLeaving = !!leaving[job.language_id];

                        return (
                            <div
                                key={job.language_id}
                                className={`px-4 py-3 transition-all duration-300 ease-in-out ${
                                    isLeaving
                                        ? 'translate-x-full opacity-0'
                                        : 'translate-x-0 opacity-100'
                                }`}
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <span className="truncate text-sm font-medium">
                                        {job.language_name}
                                    </span>

                                    <span className="flex shrink-0 items-center gap-2 text-xs">
                                        {isRunning && (
                                            <>
                                                {/* FIX (concurrency cap): Queued label for waiting jobs, percent for active. */}
                                                <span className="text-gray-500 dark:text-gray-400">
                                                    {isQueued ? 'Queued' : `${percent}%`}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => onCancel?.(job.language_id)}
                                                    className="rounded px-2 py-0.5 font-medium text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                                                >
                                                    Cancel
                                                </button>
                                            </>
                                        )}
                                        {isDone && (
                                            <span className="font-medium text-green-600 dark:text-green-400">
                                                Done
                                            </span>
                                        )}
                                        {isFailed && (
                                            <>
                                                <span className="font-medium text-red-600 dark:text-red-400">
                                                    Failed
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => onRetry?.(job.language_id)}
                                                    className="rounded px-2 py-0.5 font-medium text-indigo-600 transition hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-500/10"
                                                >
                                                    Retry
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => onDismiss?.(job.language_id)}
                                                    className="rounded px-2 py-0.5 font-medium text-gray-500 transition hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/10"
                                                >
                                                    Dismiss
                                                </button>
                                            </>
                                        )}
                                    </span>
                                </div>

                                {/* Progress bar (FIX: queued shows a pulsing empty track, not a 0% run) */}
                                <div
                                    className={`mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700 ${isQueued ? 'animate-pulse' : ''}`}
                                >
                                    <div
                                        className={`h-full rounded-full transition-all duration-300 ease-out ${
                                            isFailed
                                                ? 'bg-red-500'
                                                : isDone
                                                  ? 'bg-green-500'
                                                  : 'bg-indigo-500'
                                        }`}
                                        style={{ width: `${isFailed ? 100 : percent}%` }}
                                    />
                                </div>

                                {isFailed && job.error && (
                                    <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">
                                        {job.error}
                                    </p>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>,
        document.body,
    );
}
