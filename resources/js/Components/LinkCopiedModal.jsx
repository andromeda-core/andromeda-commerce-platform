import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

const LinkCopiedModal = ({ linkCopied, setLinkCopied }) => {
    useEffect(() => {
        if (linkCopied) {
            const timer = setTimeout(() => {
                setLinkCopied(false);
            }, 900);
            return () => clearTimeout(timer);
        }
    }, [linkCopied]);

    if (!linkCopied) return null;

    return createPortal(
        <div className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none">
            <div
                className="fixed inset-0 bg-black/40 backdrop-blur-sm"

            />

            <div
                className="flex flex-col items-center z-[100] justify-center px-6 py-4 bg-white border shadow-lg pointer-events-auto animate-fade-in-up rounded-xl dark:bg-deepcharcoal border-black/5 dark:border-gray-900"
                style={{
                    minWidth: "200px",
                }}
            >
                {/* Success icon */}
                <div className="mb-2">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-6 h-6 text-black dark:text-white"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                        />
                    </svg>
                </div>


                <p className="text-sm font-medium text-black dark:text-white">
                    Link copied!
                </p>
            </div>


            <style>{`
                @keyframes fade-in-up {
                    0% {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    100% {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.25s ease-out;
                }
            `}</style>
        </div>,
        document.body
    );
};

export default LinkCopiedModal;
