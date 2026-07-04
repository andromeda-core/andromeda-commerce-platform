import React, { useEffect, useRef, useState } from 'react';
import { HtmlFrame, containsHtml, hasProductCards, hasAdBanners } from '@/Components/RawHtmlContentFrame';
import { useLanguageStore } from '@/Hooks/useLanguageStore';
import { isRtlLocale } from '@/Helpers/rtlLocales';
import useProductCardHydration from '@/Hooks/useProductCardHydration';
// NEW: hydrates ad-banner embed markers inserted via AddAdBannerButton, mirrors useProductCardHydration.
import useAdBannerHydration from '@/Hooks/useAdBannerHydration';

const SmartphoneContentAccordion = ({
    label,
    content,
    isHtml = false,
    defaultOpen = false,
    onToggle = null,
    scrollContainerRef = null,
    // NEW: forwarded to HtmlFrame so About-This-Product HTML is clickable (matches Posts).
    // Defaults to false to preserve prior behavior for any other caller.
    interactive = false,
}) => {
    // const [isOpen, setIsOpen] = useState(defaultOpen);
    const [isOpen, setIsOpen] = useState(true);

    // Lay the plain-text branch out RTL when the active website language is right-to-left
    // (Arabic/Urdu). The HtmlFrame branch gets its dir from HtmlFrame itself. LTR is a no-op.
    const activeLanguageLocale = useLanguageStore((state) => state.activeLanguageLocale);
    const isRtl = isRtlLocale(activeLanguageLocale);

    const accordionRef = useRef(null);
    const shouldScrollRef = useRef(false);
    const embedContentRef = useRef(null);

    // Use content exactly as it is. No processing.
    const renderAsHtml = isHtml && containsHtml(content);

    // HtmlFrame renders content in a sandboxed iframe — portals cannot reach inside it. Content
    // embedding product-card / ad-banner markers must render INLINE instead so the hooks below
    // can hydrate them via portals, same rationale as RawHtmlContentFrame's own routing.
    const hasEmbeds = renderAsHtml && (hasProductCards(content) || hasAdBanners(content));
    // isOpen folded into the key: the ref-bearing div below unmounts/remounts on each
    // accordion toggle, so the hydration effect must re-run on every reopen, not just once.
    const embedHydrationKey = `${content}-${isOpen ? 'open' : 'closed'}`;
    const productCardPortals = useProductCardHydration(embedContentRef, embedHydrationKey);
    const adBannerPortals = useAdBannerHydration(embedContentRef, embedHydrationKey);

    // console.log(
    //     'IS HTML?',
    //     isHtml,
    //     'CONTAINS HTML?',
    //     containsHtml(content),
    //     'RENDER AS HTML?',
    //     renderAsHtml,
    // );
    const handleToggle = () => {
        const newState = !isOpen;
        shouldScrollRef.current = newState;
        setIsOpen(newState);
        if (onToggle) onToggle(newState);
    };

    useEffect(() => {
        if (!isOpen || !accordionRef.current || !scrollContainerRef?.current) return;

        if (!shouldScrollRef.current) return;
        shouldScrollRef.current = false;

        const container = scrollContainerRef.current;
        const accordionEl = accordionRef.current;
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                const containerRect = container.getBoundingClientRect();
                const accordionRect = accordionEl.getBoundingClientRect();
                const offset = accordionRect.top - containerRect.top + container.scrollTop;
                container.scrollTo({ top: offset - 12, behavior: 'smooth' });
            });
        });
    }, [isOpen]);

    return (
        <div className="w-full">
            <button
                onClick={handleToggle}
                className="flex w-full items-center justify-start px-0 py-4 text-left focus:outline-none"
                aria-expanded={isOpen}
            >
                <span className="pr-2 text-base font-medium text-main-text-light dark:text-main-text-dark">
                    {label}
                </span>
                <svg
                    className={`h-5 w-5 flex-shrink-0 text-main-text-light transition-transform duration-200 dark:text-main-text-dark ${
                        isOpen ? 'rotate-180' : 'rotate-0'
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                    />
                </svg>
            </button>

            {isOpen && (
                <div className="pb-2 pt-2" ref={accordionRef}>
                    {renderAsHtml ? (
                        hasEmbeds ? (
                            // NEW: inline (not the sandboxed iframe) so product-card / ad-banner
                            // portals below can hydrate the embedded markers.
                            <div
                                ref={embedContentRef}
                                dir={isRtl ? 'rtl' : 'ltr'}
                                className="prose prose-sm max-w-none whitespace-pre-line break-words text-sm leading-relaxed text-sub-text-light dark:prose-invert dark:text-sub-text-dark"
                                dangerouslySetInnerHTML={{ __html: content }}
                            />
                        ) : (
                            // OLD (no interactive prop — caused About-This-Product HTML to be non-clickable): <HtmlFrame html={content} />
                            <HtmlFrame html={content} interactive={interactive} />
                        )
                    ) : (
                        <p
                            dir={isRtl ? 'rtl' : 'ltr'}
                            className="whitespace-pre-wrap break-words text-sm leading-relaxed text-sub-text-light dark:text-sub-text-dark"
                        >
                            {content}
                        </p>
                    )}
                    {hasEmbeds && (
                        <>
                            {productCardPortals}
                            {adBannerPortals}
                        </>
                    )}
                </div>
            )}

            <div className="h-px w-full bg-[#c8c8c8] dark:bg-surface-3-dark" />
        </div>
    );
};

export default SmartphoneContentAccordion;
