import { Link, usePage } from '@inertiajs/react';
import React, { useEffect } from 'react';

const BottomBar = ({ darkMode, setDarkMode }) => {
    const { user } = usePage().props.auth;

    // Toggle Mode Dark + Light
    useEffect(() => {
        const saved = localStorage.getItem('darkMode');
        if (saved === null) {
            return;
        }

        try {
            const parsed = JSON.parse(saved);
            if (typeof parsed === 'boolean') {
                setDarkMode(parsed);

                if (darkMode) {
                    document.body.classList.add('dark', 'bg-deepcharcoal');
                } else {
                    document.body.classList = '';
                }
            } else {
                localStorage.setItem('darkMode', false);
            }
        } catch (e) {
            localStorage.setItem('darkMode', false);
        }
    }, [darkMode]);

    return (
        <div className="fixed bottom-0 left-0 right-0 z-10 p-1 lg:hidden">
            {/* Navigation bar */}
            <nav className="rounded-md border-b border-gray-200 bg-white shadow-md backdrop-blur-lg dark:border-t dark:border-gray-800 dark:bg-deepcharcoal">
                <div className="flex items-center justify-around px-4 py-2">
                    {/* Home */}
                    <Link
                        href={route('home')}
                        className={`flex flex-col items-center justify-center rounded-lg p-2 transition-all duration-200 ${
                            route().current() === 'home' ? 'menu-item-active' : 'menu-item-inactive'
                        }`}
                    >
                        <svg
                            className={`size-8`}
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            stroke="none"
                            strokeWidth="1"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <g id="Compass">
                                <path
                                    d="M16.1011 7.89894C16.3154 8.11321 16.3903 8.43045 16.2944 8.71791L14.5267 14.0212C14.447 14.2598 14.2598 14.447 14.0212 14.5267L8.7179 16.2945C8.43043 16.3903 8.11319 16.3154 7.89893 16.1011C7.68466 15.8868 7.60975 15.5696 7.70558 15.2821L9.47334 9.97883C9.553 9.74028 9.74027 9.55302 9.97882 9.47336L15.2821 7.70559C15.5696 7.60977 15.8868 7.68468 16.1011 7.89894ZM10.8648 10.8648L9.72953 14.2705L13.1352 13.1353L14.2705 9.72955L10.8648 10.8648Z"
                                    fill="currentColor"
                                ></path>
                                <path
                                    d="M19.834 12C19.834 7.6734 16.3266 4.16602 12 4.16602C7.6734 4.16602 4.16602 7.6734 4.16602 12C4.16602 16.3266 7.6734 19.834 12 19.834V21.5C6.75329 21.5 2.5 17.2467 2.5 12C2.5 6.75329 6.75329 2.5 12 2.5C17.2467 2.5 21.5 6.75329 21.5 12C21.5 17.2467 17.2467 21.5 12 21.5V19.834C16.3266 19.834 19.834 16.3266 19.834 12Z"
                                    fill="currentColor"
                                ></path>
                            </g>
                        </svg>
                    </Link>

                    {/* Search */}
                    <Link
                        href={route('website.global-search.index')}
                        className={`relative flex flex-col items-center justify-center rounded-lg p-2 transition-all duration-200 ${
                            route().current() === 'website.global-search.index'
                                ? 'menu-item-active'
                                : 'menu-item-inactive'
                        }`}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="size-7"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                            />
                        </svg>
                    </Link>

                    {/* Posts */}
                    {/* <Link
                        href={route('website.posts.index')}
                        className={`relative flex flex-col items-center justify-center rounded-lg p-2 transition-all duration-200 ${
                            route().current() === 'website.posts.index'
                                ? 'text-indigo-600 dark:text-indigo-500'
                                : 'text-gray-600 hover:text-gray-600 dark:text-white/80 dark:hover:text-white/60'
                        }`}
                        prefetch
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="size-7"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                            />
                        </svg>
                    </Link> */}

                    <div className="flex cursor-pointer items-center text-white/80">
                        <span className="hover:text-dark-900 mr-3 flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-indigo-600 hover:bg-indigo-500">
                            {user && user.avatar}
                            {!user && (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="size-6"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                                    />
                                </svg>
                            )}
                        </span>
                    </div>
                </div>
            </nav>
        </div>
    );
};

export default BottomBar;
