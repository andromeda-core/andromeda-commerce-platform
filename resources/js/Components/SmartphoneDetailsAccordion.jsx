import React, { useEffect, useRef, useState } from 'react';

const SmartphoneDetailsAccordion = ({
    label = "Product Details",
    productDetails = [],
    defaultOpen = false,
    onToggle = null,
    scrollContainerRef = null,
}) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    const accordionRef = useRef(null);

    const handleToggle = () => {
        const newState = !isOpen;
        setIsOpen(newState);
        if (onToggle) {
            onToggle(newState);
        }
    };

    useEffect(() => {
        if (!isOpen) return;
        if (!accordionRef.current) return;
        if (!scrollContainerRef?.current) return;

        const container = scrollContainerRef.current;
        const accordionEl = accordionRef.current;

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                const containerRect = container.getBoundingClientRect();
                const accordionRect = accordionEl.getBoundingClientRect();

                const offset =
                    accordionRect.top -
                    containerRect.top +
                    container.scrollTop;

                container.scrollTo({
                    top: offset - 12,
                    behavior: 'smooth',
                });
            });
        });
    }, [isOpen]);

    return (
        <div className="w-full">
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



            {/* Accordion Content - Product Details Table */}
            {isOpen && (
                <div className="pt-2 pb-2" ref={accordionRef}>
                    <div className="w-full">
                        {productDetails.map((detail, index) => (
                            <div key={index}>
                                <div className="grid grid-cols-[40%_60%] py-2">
                                    {/* Title Column */}
                                    <div className="pr-4 text-sm font-medium break-words text-main-text-light dark:text-main-text-dark">
                                        {detail.title}
                                    </div>

                                    {/* Value Column */}
                                    <div className="text-sm break-words text-sub-text-light dark:text-sub-text-dark">
                                        {detail.value}
                                    </div>
                                </div>

                                {/* Border between items - show for all items */}
                                {index !== productDetails.length - 1 && (
                                    <div className="h-px w-full bg-[#c8c8c8] dark:bg-surface-3-dark" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

            )}

            {/* Bottom Border */}
            <div className="h-px w-full bg-[#c8c8c8] dark:bg-surface-3-dark" />
        </div>
    );
};

export default SmartphoneDetailsAccordion;
