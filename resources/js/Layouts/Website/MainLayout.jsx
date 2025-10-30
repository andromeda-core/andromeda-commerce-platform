import Preloader from '@/Components/Preloader';
import PWAAlertBar from '@/Components/PWAAlertBar';
import Toast from '@/Components/Toast';
import useWindowSize from '@/Hooks/useWindowSize';
import BottomBar from '@/partials/Website/BottomBar';

import Sidebar from '@/partials/Website/Sidebar';
import { usePage } from '@inertiajs/react';
import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export default function MainLayout({ children }) {
    const { asset, generalSetting, flash, auth } = usePage().props;

    // Application Logo Sate With Default Images
    const [ApplicationLogoLight, setApplicationLogoLight] = useState(
        asset + 'assets/images/Logo/256b.png',
    );
    const [ApplicationLogoDark, setApplicationLogoDark] = useState(
        asset + 'assets/images/Logo/256w.png',
    );

    // For Updating Application Logo
    useEffect(() => {
        // Assigning Application logos
        if (generalSetting?.app_main_logo_light) {
            setApplicationLogoLight(generalSetting.app_main_logo_light);
        }

        if (generalSetting?.app_main_logo_dark) {
            setApplicationLogoDark(generalSetting.app_main_logo_dark);
        }
    }, []);

    // Managing SidebarToggle State
    const [sidebarToggle, setSidebarToggle] = useState(() => {
        const saved = localStorage.getItem('sidebarToggle');
        if (saved === null) {
            return false;
        }
        try {
            const parsed = JSON.parse(saved);
            if (typeof parsed === 'boolean') {
                return parsed;
            }
            localStorage.removeItem('sidebarToggle');
            return false;
        } catch (error) {
            localStorage.removeItem('sidebarToggle');
            return false;
        }
    });

    // Managing Loader State
    const [loaded, setLoaded] = useState(true);

    // Managing Dark Mode State
    const [darkMode, setDarkMode] = useState(false);

    // Window Size Hook
    const windowSize = useWindowSize();

    // Sidebar Collapse Logic
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [moreDropdown, setMoreDropdown] = useState(false);
    const moreDropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (moreDropdownRef.current && !moreDropdownRef.current.contains(event.target)) {
                setMoreDropdown(false);
            }
        };

        // const handleResize = () => {
        //     setIsCollapsed(windowSize.width < 1500);
        // };

        // handleResize();
        // window.addEventListener('resize', handleResize);
        document.addEventListener('click', handleClickOutside);
        return () => {
            // window.removeEventListener('resize', handleResize);
            document.removeEventListener('click', handleClickOutside);
        };
    }, [windowSize.width]);

    const [CurrentUrl, setCurrentUrl] = useState(window.location.href);
    const [needsActivation, setNeedsActivation] = useState(false);

    useEffect(() => {
        const nav = performance.getEntriesByType('navigation')[0];

        const wasReload = nav?.type === 'reload';
        const wasNavigated = nav?.type === 'navigate';
        const cameExternally =
            document.referrer && !document.referrer.startsWith(window.location.origin);

        if (wasReload || cameExternally || wasNavigated) {
            const url = new URL(CurrentUrl);

            if (url.searchParams.get('slug') || url.searchParams.get('m-slug')) {
                setNeedsActivation(true);
            }
        }
    }, []);

    // This logic Not Needed For Now
    // const [isStandalone, setIsStandalone] = useState(false);

    // useEffect(() => {
    //     if (windowSize.width < 1024) {
    //         const isInStandaloneMode =
    //             window.matchMedia('(display-mode: standalone)').matches ||
    //             window.navigator.standalone === true;

    //         if (!isInStandaloneMode) {
    //             setIsStandalone(isInStandaloneMode);
    //         }
    //     }
    // }, [windowSize.width]);

    const [cartItemsCount, setCartItemsCount] = useState(0);
    useEffect(() => {
        if (auth?.user) {
            axios.get(route('website.carts.get-items-count')).then((response) => {
                const data = response.data;

                setCartItemsCount(data.cart_items_count);
            });
        }
    }, []);

    return (
        <>
            <div className="relative w-full min-h-screen bg-white dark:bg-zinc-950/70">
                <Preloader loaded={loaded} setLoaded={setLoaded} />

                <Toast flash={flash} />

                {/* Sidebar */}
                {windowSize.width > 1024 && (
                    <Sidebar
                        light_logo={ApplicationLogoLight}
                        dark_logo={ApplicationLogoDark}
                        app_name={generalSetting?.app_name}
                        darkMode={darkMode}
                        setDarkMode={setDarkMode}
                        isCollapsed={isCollapsed}
                        moreDropdown={moreDropdown}
                        setMoreDropdown={setMoreDropdown}
                        moreDropdownRef={moreDropdownRef}
                        cartItemsCount={cartItemsCount}
                    />
                )}

                {/* Main Content Area */}
                <div
                    className={`absolute left-0 top-0 min-h-screen w-full transition-all duration-300 ${
                        windowSize.width > 1024
                            ? isCollapsed
                                ? 'pl-[30px]'
                                : 'pl-[208px]'
                            : 'pl-0'
                    }`}
                >
                    {/* Main Content */}
                    <main className="flex-1 min-h-screen px-3 pt-2 mx-0 bg-white dark:bg-zinc-950/70 lg:px-20 xl:px-36">
                        {needsActivation &&
                            createPortal(
                                <div
                                    className="fixed inset-0 z-[99999] flex cursor-pointer flex-col items-center justify-center bg-black/70 text-white"
                                    onClick={() => {
                                        setNeedsActivation(false);
                                    }}
                                >
                                    <p className="mb-3 text-sm text-center opacity-80">
                                        Tap anywhere to activate navigation
                                    </p>
                                </div>,
                                document.body,
                            )}

                        {children ? (
                            children
                        ) : (
                            <div className="flex h-[80vh] items-center justify-center text-gray-400">
                                No content available.
                            </div>
                        )}
                    </main>
                </div>
                {/* Mobile Bottom Navigation */}
                {windowSize.width < 1024 && (
                    <>
                        <BottomBar
                            darkMode={darkMode}
                            setDarkMode={setDarkMode}
                            moreDropdown={moreDropdown}
                            setMoreDropdown={setMoreDropdown}
                            moreDropdownRef={moreDropdownRef}
                            cartItemsCount={cartItemsCount}
                        />
                    </>
                )}

                <PWAAlertBar />
            </div>

            <div id="modal-root"></div>
        </>
    );
}
