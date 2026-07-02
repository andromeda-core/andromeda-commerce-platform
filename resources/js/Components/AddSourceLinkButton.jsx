import React, { useEffect, useRef, useState } from 'react';
import Input from '@/Components/Input';
import PrimaryButton from '@/Components/PrimaryButton';
// NEW: detect this site's product URLs so they insert as a product card, not a link.
import { matchProductCardUrl, buildProductCardMarkup } from '@/Helpers/productCardUrl';

/**
 * "Add Source Link" authoring helper for the post body (RawHtmlContentInput).
 *
 * Purely a frontend authoring convenience: it writes a ready-made anchor tag
 * into the body content string at the textarea's caret. No backend change, no
 * link limit. The inserted markup is:
 *
 *   <a href="URL" target="_blank" rel="noopener noreferrer">LABEL_OR_URL</a>
 *
 * where LABEL_OR_URL is the label when provided, else the URL itself. Because
 * the inserted tag is inline-only, the body still renders on the inline path
 * (paragraph breaks preserved) per the RawHtmlContentFrame render fix.
 *
 * Props:
 *  - textareaRef : ref to the body <textarea> (from RawHtmlContentInput InputRef)
 *  - value       : current body content string (data.content)
 *  - onChange    : (newValue) => void  e.g. (v) => setData('content', v)
 *  - Id          : base id used to keep the URL/Label field ids unique
 */
export default function AddSourceLinkButton({ textareaRef, value = '', onChange, Id = 'content' }) {
    const [open, setOpen] = useState(false);
    const [url, setUrl] = useState('');
    const [label, setLabel] = useState('');
    const [urlError, setUrlError] = useState('');

    // Remember the last caret position inside the body textarea. Clicking this
    // button blurs the textarea, so we snapshot selectionStart/End on the
    // textarea's own interaction events and reuse it on insert. Stays null until
    // the admin actually places a caret, so an untouched body appends at the end.
    const lastCaretRef = useRef(null);

    useEffect(() => {
        const el = textareaRef?.current;
        if (!el) return;
        const remember = () => {
            lastCaretRef.current = { start: el.selectionStart, end: el.selectionEnd };
        };
        el.addEventListener('keyup', remember);
        el.addEventListener('mouseup', remember);
        el.addEventListener('select', remember);
        el.addEventListener('focus', remember);
        return () => {
            el.removeEventListener('keyup', remember);
            el.removeEventListener('mouseup', remember);
            el.removeEventListener('select', remember);
            el.removeEventListener('focus', remember);
        };
    }, [textareaRef]);

    const resetAndClose = () => {
        setUrl('');
        setLabel('');
        setUrlError('');
        setOpen(false);
    };

    const handleInsert = () => {
        let href = (url || '').trim();
        if (!href) {
            setUrlError('URL is required.');
            return;
        }
        // URL safety: default to https:// so a bare "example.com" still links.
        if (!/^https?:\/\//i.test(href)) {
            href = 'https://' + href;
        }
        const text = (label || '').trim() || href;
        const anchor = `<a href="${href}" target="_blank" rel="noopener noreferrer">${text}</a>`;

        // NEW: if the entered URL is one of this site's product URLs, insert
        // product-card markup instead of a plain <a> link. Same caret mechanics.
        const productMatch = matchProductCardUrl(href);
        const markup = productMatch ? buildProductCardMarkup(productMatch) : anchor;

        const content = value ?? '';
        // Insert at the current/last caret; replace a selection when present;
        // fall back to the end of the body when no caret was ever placed.
        let start = content.length;
        let end = content.length;
        const caret = lastCaretRef.current;
        if (caret && typeof caret.start === 'number') {
            start = Math.min(caret.start, content.length);
            end = Math.min(caret.end, content.length);
        }
        // OLD (always inserted the anchor):
        // const newValue = content.slice(0, start) + anchor + content.slice(end);
        // const nextCaret = start + anchor.length;
        const newValue = content.slice(0, start) + markup + content.slice(end);
        const nextCaret = start + markup.length;

        onChange?.(newValue);
        // Keep our caret snapshot in sync so a follow-up insert lands correctly.
        lastCaretRef.current = { start: nextCaret, end: nextCaret };
        resetAndClose();

        // Restore focus + caret just after the inserted anchor once React has
        // committed the new value to the controlled textarea.
        requestAnimationFrame(() => {
            const el = textareaRef?.current;
            if (!el) return;
            el.focus();
            try {
                el.setSelectionRange(nextCaret, nextCaret);
            } catch (e) {}
        });
    };

    return (
        <div className="mb-2">
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm font-medium text-main-text-light transition hover:bg-gray-100 dark:border-gray-600 dark:text-main-text-dark dark:hover:bg-white/5"
            >
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
                        d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244"
                    />
                </svg>
                Add Source Link
            </button>

            {open && (
                <div
                    className="mt-2 rounded-lg border border-gray-300 bg-white p-4 dark:border-gray-600 dark:bg-deepcharcoal"
                    // This popover lives inside the post <form>. Intercept Enter so a
                    // URL/Label keypress inserts the link instead of submitting the form.
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            handleInsert();
                        }
                    }}
                >
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <Input
                            Id={`${Id}-source-url`}
                            Name={`${Id}-source-url`}
                            InputName={'URL'}
                            Type={'text'}
                            Required={true}
                            Placeholder={'https://example.com'}
                            Value={url}
                            Action={(e) => {
                                setUrl(e.target.value);
                                if (urlError) setUrlError('');
                            }}
                            Error={urlError}
                        />
                        <Input
                            Id={`${Id}-source-label`}
                            Name={`${Id}-source-label`}
                            InputName={'Label (optional)'}
                            Type={'text'}
                            Placeholder={'Shown text (defaults to the URL)'}
                            Value={label}
                            Action={(e) => setLabel(e.target.value)}
                        />
                    </div>

                    <div className="mt-1 flex items-center gap-2">
                        <PrimaryButton
                            Type={'button'}
                            Text={'Insert Link'}
                            Action={handleInsert}
                            CustomClass={'w-auto'}
                        />
                        <button
                            type="button"
                            onClick={resetAndClose}
                            className="rounded-md px-3 py-2 text-sm font-medium text-main-text-light underline-offset-2 hover:underline dark:text-main-text-dark"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
