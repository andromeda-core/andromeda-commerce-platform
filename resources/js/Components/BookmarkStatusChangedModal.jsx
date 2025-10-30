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
            }, 2000);

            return () => clearTimeout(timer);
        }
    }, [BookmarkStatusChanged]);

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
                onClick={() => setBookmarkStatusChanged(false)}
            ></div>

            {/* Modal */}
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="bookmarkTitle"
                className="animate-scale-in relative z-[101] w-full max-w-sm rounded-2xl bg-white p-8 shadow-2xl dark:bg-deepcharcoal sm:max-w-md"
            >
                {/* Icon */}
                <div className="mb-4 flex justify-center">
                    <div
                        className={`flex h-16 w-16 items-center justify-center rounded-full ${
                            viewablePost?.is_bookmarked
                                ? 'bg-indigo-100 dark:bg-indigo-900/30'
                                : 'bg-red-100 dark:bg-red-900/30'
                        }`}
                    >
                        {viewablePost?.is_bookmarked ? (
                            // Bookmarked Icon
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                className="h-8 w-8 text-indigo-600 dark:text-indigo-400"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M6.32 2.577a49.255 49.255 0 0 1 11.36 0c1.497.174 2.57 1.46 2.57 2.93V21a.75.75 0 0 1-1.085.67L12 18.089l-7.165 3.583A.75.75 0 0 1 3.75 21V5.507c0-1.47 1.073-2.756 2.57-2.93Z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        ) : (
                            // Unbookmarked Icon
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2}
                                stroke="currentColor"
                                className="h-8 w-8 text-red-600 dark:text-red-400"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z"
                                />
                            </svg>
                        )}
                    </div>
                </div>

                {/* Title */}
                <div className="text-center">
                    <h2
                        id="bookmarkTitle"
                        className="mb-2 text-xl font-bold text-gray-900 dark:text-white"
                    >
                        {viewablePost?.is_bookmarked ? 'Bookmarked!' : 'Bookmark Removed'}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        {viewablePost?.is_bookmarked
                            ? 'This post has been saved to your bookmarks'
                            : 'This post has been removed from your bookmarks'}
                    </p>
                </div>
            </div>
        </div>,
        document.body,
    );
};

export default BookmarkStatusChangedModal;
