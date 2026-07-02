import React from 'react';
// NEW: auto-convert a pasted product URL into product-card markup at the caret.
import { matchProductCardUrl, buildProductCardMarkup } from '@/Helpers/productCardUrl';

/**
 * Shared raw-HTML content INPUT (trusted-author authoring).
 *
 * Mirrors the Smartphone "Content" textarea exactly (same label markup, same
 * textarea classes, same error block) so the value is stored as raw HTML
 * exactly as typed — no TipTap, no sanitization, no mangling.
 *
 * Trusted-admin feature: only expose this in dashboards restricted to trusted
 * roles. The pasted HTML is rendered verbatim on the website (see RawHtmlContent).
 *
 * Props mirror the codebase Input convention — `Action` receives the change event:
 *   Action={(e) => setData('content', e.target.value)}
 */
export default function RawHtmlContentInput({
    Label = 'Content',
    Id = 'content',
    Name = 'content',
    Value = '',
    Action,
    Error,
    Required = false,
    Rows = 16,
    Placeholder = 'Paste the full HTML here. It will be saved exactly as entered.',
    // Optional ref to the underlying <textarea> (mirrors Input.jsx InputRef).
    // Used by AddSourceLinkButton to read the caret and insert an <a> at it.
    // Does not touch the existing Value/Action contract.
    InputRef = null,
}) {
    return (
        <div className="my-4">
            <label
                htmlFor={Id}
                className="mb-1.5 block text-sm font-medium text-main-text-light dark:text-main-text-dark"
            >
                {Label}{' '}
                {Required && (
                    <span className="font-bold text-main-text-light dark:text-main-text-dark">
                        {' '}
                        *
                    </span>
                )}
            </label>

            <textarea
                ref={InputRef}
                id={Id}
                name={Name}
                rows={Rows}
                value={Value ?? ''}
                onChange={Action}
                // NEW: if the pasted text is (in full) one of this site's product
                // URLs, replace it with product-card markup at the caret instead
                // of pasting the plain URL. Any other paste behaves normally.
                onPaste={(e) => {
                    const pasted = e.clipboardData?.getData('text') ?? '';
                    const match = matchProductCardUrl(pasted);
                    if (!match) return; // not our product URL -> normal paste

                    e.preventDefault();

                    const el = e.target;
                    const start = el.selectionStart;
                    const end = el.selectionEnd;
                    const markup = buildProductCardMarkup(match);
                    const current = el.value ?? '';
                    const newValue = current.slice(0, start) + markup + current.slice(end);

                    // Mirror the parent's Value/Action contract: Action receives an
                    // event and reads e.target.value (Action={(e)=>setData('content',
                    // e.target.value)}), so hand it a matching synthetic event.
                    Action?.({ target: { value: newValue } });

                    // Restore the caret just after the inserted markup once React has
                    // committed the new controlled value.
                    requestAnimationFrame(() => {
                        const pos = start + markup.length;
                        try {
                            el.selectionStart = el.selectionEnd = pos;
                        } catch (err) {}
                        el.focus();
                    });
                }}
                placeholder={Placeholder}
                className="w-full resize-y rounded-lg border bg-white p-4 font-mono text-sm leading-relaxed text-gray-800 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-900 focus:outline-none dark:border-gray-600 dark:bg-deepcharcoal dark:text-white"
            />

            <div className="h-5">
                {Error && (
                    <p className="ml-1 mt-1 text-sm text-red-500 dark:text-white">{Error}</p>
                )}
            </div>
        </div>
    );
}
