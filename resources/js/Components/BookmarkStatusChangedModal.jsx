import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

const BookmarkStatusChangedModal = ({
    viewablePost,
    setBookmarkStatusChanged,
    BookmarkStatusChanged,
}) => {

    useEffect(() => {
        if (BookmarkStatusChanged) {
            const timer = setTimeout(() => {
                setBookmarkStatusChanged(false);
            }, 900);

            return () => clearTimeout(timer);
        }
    }, [BookmarkStatusChanged]);

    if (!BookmarkStatusChanged) return null;

    const isBookmarked = viewablePost?.is_bookmarked;

    return createPortal(
        <div className="fixed inset-0 z-[100004] flex items-center justify-center ">
            <div
                className="fixed inset-0 bg-black/40 backdrop-blur-sm"

            />

            <div
                className="
                    pointer-events-auto
                    animate-fade-in-up
                    rounded-md
                    bg-backgroundLight
                    border
                    dark:bg-surface-1-dark dark:border-surface-3-dark border-surface-3-light
                    z-[100]
                    shadow-lg
                    px-6 py-4
                    lg:px-8 lg:py-6
                    flex flex-col items-center justify-center
                   min-w-[250px] lg:min-w-[300px]
                "

            >

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
                    {isBookmarked ? "Bookmarked!" : "Bookmark Removed"}
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

export default BookmarkStatusChangedModal;
