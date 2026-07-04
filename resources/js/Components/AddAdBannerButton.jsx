import React, { useEffect, useMemo, useRef, useState } from 'react';
import PrimaryButton from '@/Components/PrimaryButton';
import SelectInput from '@/Components/SelectInput';
import { buildAdBannerMarkup } from '@/Helpers/adBannerUrl';

/**
 * "Add Ad Banner" authoring helper for the post body (RawHtmlContentInput).
 *
 * Mirrors AddSourceLinkButton's caret/insertion mechanics exactly (there is no
 * button-based product-card inserter in this codebase to mirror instead — product
 * cards are inserted via paste-rule auto-detection in RawHtmlContentInput/
 * AddSourceLinkButton, not a dedicated button). Purely a frontend authoring
 * convenience: writes a ready-made ad-banner embed marker into the body content
 * string at the textarea's caret. No backend change.
 *
 * The inserted markup is: <div data-ad-id="ad_xxx" data-type="ad-banner"></div>
 *
 * Props:
 *  - textareaRef : ref to the body <textarea> (from RawHtmlContentInput InputRef)
 *  - value       : current body content string (data.content)
 *  - onChange    : (newValue) => void  e.g. (v) => setData('content', v)
 *  - adBanners   : [{ id, public_id, name, media_type }] — only fully-uploaded banners
 *  - Id          : base id used to keep the picker's select id unique
 */
export default function AddAdBannerButton({ textareaRef, value = '', onChange, adBanners = [], Id = 'content' }) {
    const [open, setOpen] = useState(false);
    const [selectedPublicId, setSelectedPublicId] = useState('');

    // NEW: SelectInput builds each option's value from `item.id ?? item[itemKey]` — so `id`
    // here must carry the public_id (what handleInsert needs), while `name` carries the
    // composed label (same "Name (media_type)" text the old native <select> showed).
    const adBannerOptions = useMemo(
        () =>
            adBanners.map((banner) => ({
                id: banner.public_id,
                name: `${banner.name} (${banner.media_type})`,
            })),
        [adBanners],
    );

    // Remember the last caret position inside the body textarea, same mechanism as
    // AddSourceLinkButton — clicking this button blurs the textarea.
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
        setSelectedPublicId('');
        setOpen(false);
    };

    const handleInsert = () => {
        if (!selectedPublicId) return;

        const markup = buildAdBannerMarkup({ publicId: selectedPublicId });

        const content = value ?? '';
        let start = content.length;
        let end = content.length;
        const caret = lastCaretRef.current;
        if (caret && typeof caret.start === 'number') {
            start = Math.min(caret.start, content.length);
            end = Math.min(caret.end, content.length);
        }
        const newValue = content.slice(0, start) + markup + content.slice(end);
        const nextCaret = start + markup.length;

        onChange?.(newValue);
        lastCaretRef.current = { start: nextCaret, end: nextCaret };
        resetAndClose();

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
                        d="M2.25 15.75l5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159M14.25 12.75l1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M6.75 19.5h10.5a2.25 2.25 0 0 0 2.25-2.25V6.75a2.25 2.25 0 0 0-2.25-2.25H6.75A2.25 2.25 0 0 0 4.5 6.75v10.5a2.25 2.25 0 0 0 2.25 2.25Z"
                    />
                </svg>
                Add Ad Banner
            </button>

            {open && (
                <div
                    className="mt-2 rounded-lg border border-gray-300 bg-white p-4 dark:border-gray-600 dark:bg-deepcharcoal"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            handleInsert();
                        }
                    }}
                >
                    {adBanners.length === 0 ? (
                        <p className="text-sm text-main-text-light dark:text-main-text-dark">
                            No ad banners available yet. Create one first from the Ad Banners
                            section.
                        </p>
                    ) : (
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            {/* OLD (native <select>, replaced for visual consistency with every
                                other dropdown on this page — Post Type, Floor, Status, etc. all
                                use SelectInput): rollback note only, do not restore without reason.
                            <div className="w-full">
                                <label
                                    htmlFor={`${Id}-ad-banner-select`}
                                    className="mb-1.5 block text-sm font-medium text-main-text-light dark:text-main-text-dark"
                                >
                                    Ad Banner
                                </label>
                                <select
                                    id={`${Id}-ad-banner-select`}
                                    name={`${Id}-ad-banner-select`}
                                    value={selectedPublicId}
                                    onChange={(e) => setSelectedPublicId(e.target.value)}
                                    className="dark:bg-dark-900 shadow-theme-xs focus:ring-3 focus:outline-hidden w-full min-w-0 max-w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2.5 text-sm text-gray-800 focus:border-blue-300 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-deepcharcoal dark:text-white/90 dark:focus:border-blue-800"
                                >
                                    <option value="">Select an ad banner…</option>
                                    {adBanners.map((banner) => (
                                        <option key={banner.public_id} value={banner.public_id}>
                                            {banner.name} ({banner.media_type})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            */}
                            <SelectInput
                                InputName={'Ad Banner'}
                                Id={`${Id}-ad-banner-select`}
                                Name={`${Id}-ad-banner-select`}
                                Value={selectedPublicId}
                                Required={false}
                                Action={(value) => setSelectedPublicId(value)}
                                items={adBannerOptions}
                                itemKey={'name'}
                            />
                        </div>
                    )}

                    <div className="mt-3 flex items-center gap-2">
                        <PrimaryButton
                            Type={'button'}
                            Text={'Insert Ad Banner'}
                            Action={handleInsert}
                            CustomClass={'w-auto'}
                            Disabled={!selectedPublicId}
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
