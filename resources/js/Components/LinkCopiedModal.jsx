import { useTranslation } from '@/Hooks/useTranslation';
import React, { useEffect } from 'react';

import { createPortal } from 'react-dom';

const LinkCopiedModal = ({ linkCopied, setLinkCopied }) => {


    // Translation Hook
    const { __ } = useTranslation();
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
        <div className="fixed inset-0 z-[100004] flex items-center justify-center pointer-events-none">
            <div
                className="fixed inset-0 bg-black/30 backdrop-blur-sm"

            />

            <div
                className="flex flex-col items-center z-[100] min-w-[250px] lg:min-w-[300px] justify-center px-6 py-3 lg:px-8 lg:py-6 bg-main-text-dark border pointer-events-auto animate-fade-in-up rounded-md dark:bg-surface-1-dark dark:border-surface-3-dark border-surface-3-light"

            >
                {/* Success icon */}
                <div className="mb-2">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-6 h-6 text-main-text-light lg:w-8 lg:h-8 dark:text-main-text-dark"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                        />
                    </svg>
                </div>


                <p className="text-sm font-medium text-main-text-light lg:text-xl dark:text-main-text-dark">
                    {__('Link copied')}!
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
        document.getElementById('modal-root') || document.body
    );
};

export default LinkCopiedModal;
