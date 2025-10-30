import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

const LinkCopiedModal = ({ linkCopied, setLinkCopied }) => {
    useEffect(() => {
        if (linkCopied) {
            const timer = setTimeout(() => {
                setLinkCopied(false);
            }, 2000);

            return () => clearTimeout(timer);
        }
    }, [linkCopied]);

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
                onClick={() => setLinkCopied(false)}
            ></div>

            {/* Modal */}
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="linkCopiedTitle"
                className="animate-scale-in relative z-[101] w-full max-w-sm rounded-2xl bg-white p-8 shadow-2xl dark:bg-deepcharcoal sm:max-w-md"
            >
                {/* Success Icon */}
                <div className="mb-4 flex justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="h-8 w-8 text-green-600 dark:text-green-400"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                            />
                        </svg>
                    </div>
                </div>

                {/* Title */}
                <div className="text-center">
                    <h2
                        id="linkCopiedTitle"
                        className="mb-2 text-xl font-bold text-gray-900 dark:text-white"
                    >
                        Link Copied!
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        The link has been copied to your clipboard
                    </p>
                </div>
            </div>
        </div>,
        document.body,
    );
};

export default LinkCopiedModal;
