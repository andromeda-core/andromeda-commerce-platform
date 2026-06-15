import { useHomeNavStore } from '@/Hooks/useHomeNavStore';
import { Link, router, usePage } from '@inertiajs/react';
import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useBottomBarStore } from '@/Hooks/useBottomBarStore';
import gsap from 'gsap';
import { useFeedCleanupStore } from '@/Hooks/useFeedCleanupStore';
const BottomBar = ({
    darkMode,
    setDarkMode,
    moreDropdownRef,
    moreDropdown,
    setMoreDropdown,
    // cartItemsCount,
    setActiveModal,
    activeModal,
    __,
}) => {
    const { user } = usePage().props.auth;
    const dropdownRef = useRef(null);

    const bottomBarRef = useRef(null);
    const { isVisible, setBarHeight } = useBottomBarStore();

    // Measure height
    useEffect(() => {
        const measureHeight = () => {
            if (bottomBarRef.current) {
                const height = bottomBarRef.current.offsetHeight;
                setBarHeight(height);
            }
        };

        measureHeight();
        window.addEventListener('resize', measureHeight);
        window.addEventListener('orientationchange', measureHeight);

        return () => {
            window.removeEventListener('resize', measureHeight);
            window.removeEventListener('orientationchange', measureHeight);
        };
    }, [setBarHeight]);

    // Animate visibility
    useEffect(() => {
        if (!bottomBarRef.current) return;

        if (isVisible) {
            gsap.to(bottomBarRef.current, {
                y: 0,
                duration: 0.4,
                ease: 'power2.out',
            });
        } else {
            const height = bottomBarRef.current.offsetHeight;
            gsap.to(bottomBarRef.current, {
                y: height,
                duration: 0.4,
                ease: 'power2.in',
            });
        }
    }, [isVisible]);

    //  Mode Dark + Light Storing
    useEffect(() => {
        const saved = localStorage.getItem('darkMode');
        if (saved !== null) {
            try {
                const parsed = JSON.parse(saved);
                if (typeof parsed === 'boolean') {
                    setDarkMode(parsed);
                }
            } catch (e) {
                localStorage.setItem('darkMode', false);
            }
        }
    }, []);

    useEffect(() => {
        if (!moreDropdown) return;
        const handleClickOutside = (event) => {
            if (!moreDropdown) return;
            const dropdownEl = dropdownRef.current;
            const buttonEl = document.getElementById('bottom-more-btn');

            if (dropdownEl.contains(event.target)) return;

            if (buttonEl?.contains(event.target)) return;

            setMoreDropdown(false);
        };

        document.addEventListener('mousedown', handleClickOutside);

        const handlePopState = () => {
            if (moreDropdown) {
                setMoreDropdown(false);
            }
        };

        window.addEventListener('popstate', handlePopState);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('popstate', handlePopState);
        };
    }, [moreDropdown]);

    // Toggeling Theme Mode On Mobile
    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
            document.body.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
            document.body.classList.remove('dark');
        }

        // Save to localStorage
        localStorage.setItem('darkMode', JSON.stringify(darkMode));
    }, [darkMode]);

    return (
        <div
            id="bottom-bar"
            ref={bottomBarRef}
            className="fixed bottom-0 left-0 right-0 z-[70]"
            onClickCapture={() => {
                useFeedCleanupStore.getState().setShouldCleanupBrowserHistory(false);
            }}
        >
            {/* Navigation bar */}
            <nav className="rounded-sm bg-backgroundLight shadow-md backdrop-blur-lg dark:bg-backgroundDark">
                <div className="flex items-center justify-around px-4 py-2">
                    {/* Home */}
                    <button
                        data-sidebar-link="true"
                        onClick={() => {
                            useHomeNavStore.getState().startHomeNavigation();
                            window.history.replaceState({}, '', window.location.pathname);
                            router.visit(route('home'), {
                                onFinish: () => {
                                    useHomeNavStore.getState().endHomeNavigation();
                                },
                            });
                        }}
                        className={`flex flex-col items-center justify-center rounded-lg p-2 transition-all duration-200 ${
                            route().current() === 'home' ? 'menu-item-active' : 'menu-item-inactive'
                        }`}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className={`size-8 text-main-text-light dark:text-main-text-dark`}
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.25"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z" />
                            <circle cx="12" cy="12" r="10" />
                        </svg>
                    </button>

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
                            className={`size-8 text-main-text-light dark:text-main-text-dark`}
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.25"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="m21 21-4.34-4.34" />
                            <circle cx="11" cy="11" r="8" />
                        </svg>
                    </Link>

                    {/* Shop */}
                    <Link
                        href={route('website.shop.index')}
                        className={`relative flex flex-col items-center justify-center rounded-lg p-2 transition-all duration-200 ${
                            route().current() === 'website.shop.index'
                                ? 'menu-item-active'
                                : 'menu-item-inactive'
                        }`}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className={`size-8 text-main-text-light dark:text-main-text-dark`}
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.25"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M16 10a4 4 0 0 1-8 0" />
                            <path d="M3.103 6.034h17.794" />
                            <path d="M3.4 5.467a2 2 0 0 0-.4 1.2V20a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6.667a2 2 0 0 0-.4-1.2l-2-2.667A2 2 0 0 0 17 2H7a2 2 0 0 0-1.6.8z" />
                        </svg>
                    </Link>

                    {/* Stay */}
                    <Link
                        href={route('website.stay.index')}
                        className={`relative flex flex-col items-center justify-center rounded-lg p-2 transition-all duration-200 ${
                            route().current() === 'website.stay.index'
                                ? 'menu-item-active'
                                : 'menu-item-inactive'
                        }`}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className={`size-8 text-main-text-light dark:text-main-text-dark`}
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.25"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8" />
                            <path d="M4 10V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4" />
                            <path d="M12 4v6" />
                            <path d="M2 18h20" />
                        </svg>
                    </Link>

                    {user && (
                        <Link
                            href={route('website.profile.index')}
                            className={`relative flex flex-col items-center justify-center rounded-lg p-2 transition-all duration-200 ${
                                route().current() === 'website.profile.index'
                                    ? 'menu-item-active'
                                    : 'menu-item-inactive'
                            }`}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className={`size-8 text-main-text-light dark:text-main-text-dark`}
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.25"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                            </svg>
                        </Link>
                    )}

                    <button
                        id="bottom-more-btn"
                        className={`flex cursor-pointer items-center rounded-lg p-2 text-white/80 ${moreDropdown ? 'menu-item-active' : 'menu-item-inactive'}`}
                        ref={moreDropdownRef}
                        onClick={() => {
                            setMoreDropdown(!moreDropdown);
                        }}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className={`size-8 text-main-text-light dark:text-main-text-dark`}
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.25"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M4 5h16" />
                            <path d="M4 12h16" />
                            <path d="M4 19h16" />
                        </svg>
                    </button>

                    {moreDropdown &&
                        createPortal(
                            <div
                                ref={dropdownRef}
                                className={`absolute bottom-[155px] right-9 z-[9999] max-h-[200px] w-56 overflow-y-auto overscroll-contain rounded-md border border-surface-3-light bg-backgroundLight p-2 transition-transform duration-300 ease-in-out dark:border-surface-3-dark dark:bg-surface-1-dark`}
                                style={{
                                    position: 'fixed',
                                    transform: 'translateY(83px)',
                                }}
                            >
                                <ul className="flex flex-col">
                                    {user && (
                                        <>
                                            {user?.role !== 'Customer' && (
                                                <li>
                                                    <Link
                                                        href={route('dashboard')}
                                                        className={`menu-sub-item-inactive flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-sm`}
                                                    >
                                                        <span>{__('Dashboard')}</span>
                                                    </Link>
                                                </li>
                                            )}

                                            <li>
                                                <Link
                                                    data-sidebar-link="true"
                                                    href={route('website.notifications.index')}
                                                    className={`${route().current() === 'website.notifications.index' ? 'menu-sub-item-active' : 'menu-sub-item-inactive'} flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-sm`}
                                                >
                                                    {/* <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        strokeWidth={1}
                                                        stroke="currentColor"
                                                        className={`size-4`}
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                                                        />
                                                    </svg> */}
                                                    {__('Notifications')}{' '}
                                                    {/* {cartItemsCount > 0 && (
                                                        <span className="relative ml-auto">
                                                            <span className="flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-indigo-500 rounded-full animate-pulse">
                                                                {cartItemsCount > 99
                                                                    ? '99+'
                                                                    : cartItemsCount}
                                                            </span>
                                                            <span className="absolute top-0 right-0 block w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></span>
                                                        </span>
                                                    )} */}
                                                </Link>
                                            </li>

                                            <li>
                                                <Link
                                                    data-sidebar-link="true"
                                                    href={route('website.carts.index')}
                                                    className={`${route().current() === 'website.carts.index' ? 'menu-sub-item-active' : 'menu-sub-item-inactive'} flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-sm`}
                                                >
                                                    {/* <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        strokeWidth={1}
                                                        stroke="currentColor"
                                                        className={`size-4`}
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                                                        />
                                                    </svg> */}
                                                    {__('Cart')}{' '}
                                                    {/* {cartItemsCount > 0 && (
                                                        <span className="relative ml-auto">
                                                            <span className="flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-indigo-500 rounded-full animate-pulse">
                                                                {cartItemsCount > 99
                                                                    ? '99+'
                                                                    : cartItemsCount}
                                                            </span>
                                                            <span className="absolute top-0 right-0 block w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></span>
                                                        </span>
                                                    )} */}
                                                </Link>
                                            </li>

                                            <li>
                                                <Link
                                                    href={route('website.orders.index')}
                                                    className={`${route().current() === 'website.orders.index' ? 'menu-sub-item-active' : 'menu-sub-item-inactive'} flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-sm`}
                                                >
                                                    {/* <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        strokeWidth={2}
                                                        stroke="currentColor"
                                                        className={`size-4`}
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z"
                                                        />
                                                    </svg> */}
                                                    {__('Orders')}
                                                </Link>
                                            </li>

                                            <li>
                                                <Link
                                                    href={route('website.lodging-reservations.index')}
                                                    className={`${route().current() === 'website.lodging-reservations.index' ? 'menu-sub-item-active' : 'menu-sub-item-inactive'} flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-sm`}
                                                >
                                                    {__('Reservations')}
                                                </Link>
                                            </li>

                                            <li>
                                                <Link
                                                    href={route('website.bookmarks.index')}
                                                    className={`${route().current() === 'website.bookmarks.index' ? 'menu-sub-item-active' : 'menu-sub-item-inactive'} flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-sm`}
                                                >
                                                    {/* <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        strokeWidth={2}
                                                        stroke="currentColor"
                                                        className={`size-4`}
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z"
                                                        />
                                                    </svg> */}
                                                    {__('Bookmark')}
                                                </Link>
                                            </li>
                                        </>
                                    )}

                                    {!user && (
                                        <li>
                                            <Link
                                                href={route('login')}
                                                className={`menu-sub-item-inactive flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-sm`}
                                            >
                                                {/* <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    strokeWidth={2}
                                                    stroke="currentColor"
                                                    className={`size-4`}
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75"
                                                    />
                                                </svg> */}
                                                {__('Login')}
                                            </Link>
                                        </li>
                                    )}

                                    <li>
                                        <button
                                            className={`${activeModal === 'global-filters' ? 'menu-sub-item-active' : 'menu-sub-item-inactive'} flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-sm`}
                                            onClick={() => {
                                                if (activeModal === 'global-filters') {
                                                    setActiveModal(null);
                                                } else {
                                                    setActiveModal('global-filters');
                                                }
                                                setMoreDropdown(false);
                                            }}
                                        >
                                            {/* <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth={2}
                                                stroke="currentColor"
                                                className={`size-4`}
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75"
                                                />
                                            </svg> */}

                                            <span>{__('Filter')}</span>
                                        </button>
                                    </li>

                                    <li>
                                        <button
                                            className={`${activeModal === 'language-filters' ? 'menu-sub-item-active' : 'menu-sub-item-inactive'} flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-sm`}
                                            onClick={(e) => {
                                                if (activeModal === 'language-filters') {
                                                    setActiveModal(null);
                                                } else {
                                                    setActiveModal('language-filters');
                                                }
                                                setMoreDropdown(false);
                                            }}
                                        >
                                            {/* <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                                                className={`size-4`}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="m10.5 21 5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 0 1 6-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 0 1-3.827-5.802" />
                                            </svg> */}

                                            <span>{__('Language')}</span>
                                        </button>
                                    </li>

                                    {/* Currency switcher — display only */}
                                    <li>
                                        <button
                                            className={`${activeModal === 'currency-switcher' ? 'menu-sub-item-active' : 'menu-sub-item-inactive'} flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-sm`}
                                            onClick={() => {
                                                if (activeModal === 'currency-switcher') {
                                                    setActiveModal(null);
                                                } else {
                                                    setActiveModal('currency-switcher');
                                                }
                                                setMoreDropdown(false);
                                            }}
                                        >
                                            <span>{__('Currency')}</span>
                                        </button>
                                    </li>

                                    <li>
                                        <Link
                                            prefetch
                                            href={route('website.terms-of-service.index')}
                                            className={`${route().current() === 'website.terms-of-service.index' ? 'menu-sub-item-active' : 'menu-sub-item-inactive'} flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-sm`}
                                        >
                                            {/* <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth={2}
                                                stroke="currentColor"
                                                className={`size-4`}
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M12 9v3.75m0-10.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.25-8.25-3.286Zm0 13.036h.008v.008H12v-.008Z"
                                                />
                                            </svg> */}
                                            {__('Terms Of Service')}
                                        </Link>
                                    </li>

                                    <li>
                                        <Link
                                            prefetch
                                            href={route('website.privacy-policy.index')}
                                            className={`${route().current() === 'website.privacy-policy.index' ? 'menu-sub-item-active' : 'menu-sub-item-inactive'} flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-sm`}
                                        >
                                            {/* <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth={2}
                                                stroke="currentColor"
                                                className={`size-4`}
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M12 9v3.75m0-10.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.25-8.25-3.286Zm0 13.036h.008v.008H12v-.008Z"
                                                />
                                            </svg> */}
                                            {__('Privacy Policy')}
                                        </Link>
                                    </li>

                                    <li>
                                        <Link
                                            href={route('website.contact.index')}
                                            className={`${route().current() === 'website.contact.index' ? 'menu-sub-item-active' : 'menu-sub-item-inactive'} flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-sm`}
                                        >
                                            {/* <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth={2}
                                                stroke="currentColor"
                                                className={`size-4`}
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z"
                                                />
                                            </svg> */}
                                            {__('Contact Us')}
                                        </Link>
                                    </li>

                                    <li>
                                        <button
                                            className={`menu-sub-item-inactive flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-sm`}
                                            onClick={() => {
                                                setDarkMode(!darkMode);
                                                localStorage.setItem('darkMode', !darkMode);
                                            }}
                                        >
                                            {/* <svg
                                                className={`block size-4 dark:hidden`}
                                                viewBox="0 0 20 20"
                                                fill="none"
                                                strokeWidth={2}
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    clipRule="evenodd"
                                                    d="M9.99998 1.5415C10.4142 1.5415 10.75 1.87729 10.75 2.2915V3.5415C10.75 3.95572 10.4142 4.2915 9.99998 4.2915C9.58577 4.2915 9.24998 3.95572 9.24998 3.5415V2.2915C9.24998 1.87729 9.58577 1.5415 9.99998 1.5415ZM10.0009 6.79327C8.22978 6.79327 6.79402 8.22904 6.79402 10.0001C6.79402 11.7712 8.22978 13.207 10.0009 13.207C11.772 13.207 13.2078 11.7712 13.2078 10.0001C13.2078 8.22904 11.772 6.79327 10.0009 6.79327ZM5.29402 10.0001C5.29402 7.40061 7.40135 5.29327 10.0009 5.29327C12.6004 5.29327 14.7078 7.40061 14.7078 10.0001C14.7078 12.5997 12.6004 14.707 10.0009 14.707C7.40135 14.707 5.29402 12.5997 5.29402 10.0001ZM15.9813 5.08035C16.2742 4.78746 16.2742 4.31258 15.9813 4.01969C15.6884 3.7268 15.2135 3.7268 14.9207 4.01969L14.0368 4.90357C13.7439 5.19647 13.7439 5.67134 14.0368 5.96423C14.3297 6.25713 14.8045 6.25713 15.0974 5.96423L15.9813 5.08035ZM18.4577 10.0001C18.4577 10.4143 18.1219 10.7501 17.7077 10.7501H16.4577C16.0435 10.7501 15.7077 10.4143 15.7077 10.0001C15.7077 9.58592 16.0435 9.25013 16.4577 9.25013H17.7077C18.1219 9.25013 18.4577 9.58592 18.4577 10.0001ZM14.9207 15.9806C15.2135 16.2735 15.6884 16.2735 15.9813 15.9806C16.2742 15.6877 16.2742 15.2128 15.9813 14.9199L15.0974 14.036C14.8045 13.7431 14.3297 13.7431 14.0368 14.036C13.7439 14.3289 13.7439 14.8038 14.0368 15.0967L14.9207 15.9806ZM9.99998 15.7088C10.4142 15.7088 10.75 16.0445 10.75 16.4588V17.7088C10.75 18.123 10.4142 18.4588 9.99998 18.4588C9.58577 18.4588 9.24998 18.123 9.24998 17.7088V16.4588C9.24998 16.0445 9.58577 15.7088 9.99998 15.7088ZM5.96356 15.0972C6.25646 14.8043 6.25646 14.3295 5.96356 14.0366C5.67067 13.7437 5.1958 13.7437 4.9029 14.0366L4.01902 14.9204C3.72613 15.2133 3.72613 15.6882 4.01902 15.9811C4.31191 16.274 4.78679 16.274 5.07968 15.9811L5.96356 15.0972ZM4.29224 10.0001C4.29224 10.4143 3.95645 10.7501 3.54224 10.7501H2.29224C1.87802 10.7501 1.54224 10.4143 1.54224 10.0001C1.54224 9.58592 1.87802 9.25013 2.29224 9.25013H3.54224C3.95645 9.25013 4.29224 9.58592 4.29224 10.0001ZM4.9029 5.9637C5.1958 6.25659 5.67067 6.25659 5.96356 5.9637C6.25646 5.6708 6.25646 5.19593 5.96356 4.90303L5.07968 4.01915C4.78679 3.72626 4.31191 3.72626 4.01902 4.01915C3.72613 4.31204 3.72613 4.78692 4.01902 5.07981L4.9029 5.9637Z"
                                                    fill="currentColor"
                                                />
                                            </svg> */}
                                            {/* <svg
                                                className={`hidden size-4 dark:block`}
                                                viewBox="0 0 20 20"
                                                fill="none"
                                                strokeWidth={2}
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    d="M17.4547 11.97L18.1799 12.1611C18.265 11.8383 18.1265 11.4982 17.8401 11.3266C17.5538 11.1551 17.1885 11.1934 16.944 11.4207L17.4547 11.97ZM8.0306 2.5459L8.57989 3.05657C8.80718 2.81209 8.84554 2.44682 8.67398 2.16046C8.50243 1.8741 8.16227 1.73559 7.83948 1.82066L8.0306 2.5459ZM12.9154 13.0035C9.64678 13.0035 6.99707 10.3538 6.99707 7.08524H5.49707C5.49707 11.1823 8.81835 14.5035 12.9154 14.5035V13.0035ZM16.944 11.4207C15.8869 12.4035 14.4721 13.0035 12.9154 13.0035V14.5035C14.8657 14.5035 16.6418 13.7499 17.9654 12.5193L16.944 11.4207ZM16.7295 11.7789C15.9437 14.7607 13.2277 16.9586 10.0003 16.9586V18.4586C13.9257 18.4586 17.2249 15.7853 18.1799 12.1611L16.7295 11.7789ZM10.0003 16.9586C6.15734 16.9586 3.04199 13.8433 3.04199 10.0003H1.54199C1.54199 14.6717 5.32892 18.4586 10.0003 18.4586V16.9586ZM3.04199 10.0003C3.04199 6.77289 5.23988 4.05695 8.22173 3.27114L7.83948 1.82066C4.21532 2.77574 1.54199 6.07486 1.54199 10.0003H3.04199ZM6.99707 7.08524C6.99707 5.52854 7.5971 4.11366 8.57989 3.05657L7.48132 2.03522C6.25073 3.35885 5.49707 5.13487 5.49707 7.08524H6.99707Z"
                                                    fill="currentColor"
                                                />
                                            </svg> */}
                                            <div className="hidden dark:block">
                                                {__('Light Mode')}
                                            </div>

                                            <div className="block dark:hidden">
                                                {__('Dark Mode')}
                                            </div>
                                        </button>
                                    </li>

                                    {user && (
                                        <li>
                                            <button
                                                className={`logout-menu-item-button flex w-full items-center gap-3 rounded-sm px-2 py-2 text-sm transition-colors`}
                                                onClick={() => {
                                                    router.post(route('logout'), {
                                                        onFinish: () => {
                                                            router.visit(route('home'), {
                                                                replace: true,
                                                            });
                                                            window.history.pushState(
                                                                null,
                                                                '',
                                                                window.location.href,
                                                            );
                                                            window.addEventListener(
                                                                'popstate',
                                                                function () {
                                                                    router.visit(route('home'));
                                                                },
                                                            );
                                                            router.reload({
                                                                replace: true,
                                                            });
                                                        },
                                                    });
                                                }}
                                            >
                                                {/* <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    strokeWidth={2}
                                                    stroke="currentColor"
                                                    className={`size-4`}
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15M12 9l3 3m0 0-3 3m3-3H2.25"
                                                    />
                                                </svg> */}
                                                {__('Logout')}
                                            </button>
                                        </li>
                                    )}
                                </ul>
                            </div>,
                            document.body,
                        )}
                </div>
            </nav>
        </div>
    );
};

export default BottomBar;
