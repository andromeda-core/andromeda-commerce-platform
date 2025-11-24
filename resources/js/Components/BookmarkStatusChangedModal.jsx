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
        <div className="fixed inset-0 z-[200] flex items-center justify-center ">
            <div
                className="fixed inset-0 bg-black/40 backdrop-blur-sm"

            />

            <div
                className="
                    pointer-events-auto
                    animate-fade-in-up
                    rounded-xl
                    bg-white
                    dark:bg-deepcharcoal
                    z-[100]
                    shadow-lg
                    px-6 py-4
                    flex flex-col items-center justify-center
                    border border-black/5
                   dark:border-gray-700
                "
                style={{ minWidth: "190px" }}
            >

                <div className="mb-2">
                    {isBookmarked ? (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="w-6 h-6 text-indigo-600 dark:text-indigo-300"
                        >
                            <path
                                fillRule="evenodd"
                                d="M6.32 2.577a49.255 49.255 0 0 1 11.36 0c1.497.174 2.57 1.46 2.57 2.93V21a.75.75 0 0 1-1.085.67L12 18.089l-7.165 3.583A.75.75 0 0 1 3.75 21V5.507c0-1.47 1.073-2.756 2.57-2.93Z"
                                clipRule="evenodd"
                            />
                        </svg>
                    ) : (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="w-6 h-6 text-red-600 dark:text-red-400"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z"
                            />
                        </svg>
                    )}
                </div>


                <p className="text-sm font-medium text-black dark:text-white">
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
