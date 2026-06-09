import React, { useEffect, useRef, useState } from 'react';
import { HtmlFrame, containsHtml } from '@/Components/RawHtmlContentFrame';

const SmartphoneContentAccordion = ({
    label,
    content,
    isHtml = false,
    defaultOpen = false,
    onToggle = null,
    scrollContainerRef = null,
}) => {
    // const [isOpen, setIsOpen] = useState(defaultOpen);
    const [isOpen, setIsOpen] = useState(true);

    const accordionRef = useRef(null);
    const shouldScrollRef = useRef(false);

    // Use content exactly as it is. No processing.
    const renderAsHtml = isHtml && containsHtml(content);

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
                        <HtmlFrame html={content} />
                    ) : (
                        <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-sub-text-light dark:text-sub-text-dark">
                            {content}
                        </p>
                    )}
                </div>
            )}

            <div className="h-px w-full bg-[#c8c8c8] dark:bg-surface-3-dark" />
        </div>
    );
};

export default SmartphoneContentAccordion;
