import React, { useEffect, useRef, useState } from 'react';

const Accordion = ({
    label,
    content,
    isHtml = false,
    defaultOpen = false,
    onToggle = null
}) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    const handleToggle = () => {
        const newState = !isOpen;
        setIsOpen(newState);
        if (onToggle) {
            onToggle(newState);
        }
    };
    const accordionRef = useRef(null);


    useEffect(() => {
        if (isOpen && accordionRef.current) {
            accordionRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            });
        }
    }, [isOpen]);

    return (
        <div className={isOpen ? 'w-full border-b border-[#c8c8c8] dark:border-surface-3-dark' : ''}>
            {/* Accordion Header */}
            <button
                onClick={handleToggle}
                className="flex items-center justify-start w-full px-0 py-4 text-left focus:outline-none"
                aria-expanded={isOpen}
            >
                <span className="pr-2 text-base font-medium text-main-text-light dark:text-main-text-dark">
                    {label}
                </span>

                {/* Chevron Icon */}
                <svg
                    className={`w-5 h-5 text-main-text-light dark:text-main-text-dark transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180' : 'rotate-0'
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

            {/* Accordion Content */}
            {isOpen && (
                <div className="pt-2 pb-6" ref={accordionRef}>
                    {isHtml ? (
                        <div
                            className="text-sm leading-relaxed break-words break-all whitespace-pre-wrap text-sub-text-light dark:text-sub-text-dark"
                            dangerouslySetInnerHTML={{ __html: content }}
                        />
                    ) : (
                        <p className="text-sm leading-relaxed break-words whitespace-pre-wrap text-sub-text-light dark:text-sub-text-dark">
                            {content}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

export default Accordion;
