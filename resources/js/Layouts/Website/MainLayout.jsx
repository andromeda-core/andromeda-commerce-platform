import Preloader from '@/Components/Preloader';
import useWindowSize from '@/Hooks/useWindowSize';
import BottomBar from '@/partials/Website/BottomBar';
import Footer from '@/partials/Website/Footer';
import Header from '@/partials/Website/Header';
import Sidebar from '@/partials/Website/Sidebar';
import { usePage } from '@inertiajs/react';
import React, { useEffect, useRef, useState } from 'react';
import { ToastContainer, Bounce, toast } from 'react-toastify';

export default function MainLayout({ children }) {
    const { asset, generalSetting, flash } = usePage().props;

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
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [moreDropdown, setMoreDropdown] = useState(false);
    const moreDropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (moreDropdownRef.current && !moreDropdownRef.current.contains(event.target)) {
                setMoreDropdown(false);
            }
        };

        const handleResize = () => {
            setIsCollapsed(windowSize.width < 1500);
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        document.addEventListener('click', handleClickOutside);
        return () => {
            window.removeEventListener('resize', handleResize);
            document.removeEventListener('click', handleClickOutside);
        };
    }, [windowSize.width]);

    const notify = (type, message) => {
        toast[type](message, {
            position: 'bottom-center',
            autoClose: 5000,
            hideProgressBar: true,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,

            transition: Bounce,
        });
    };

    useEffect(() => {
        if (flash.success) {
            notify('success', flash.success);
        }
        if (flash.error) {
            notify('error', flash.error);
        }
        if (flash.info) {
            notify('info', flash.info);
        }
    }, [flash]);

    return (
        <>
            <div className="relative min-h-screen w-full bg-slate-100 dark:bg-zinc-950/70">
                <Preloader loaded={loaded} setLoaded={setLoaded} />

                <ToastContainer
                    position="bottom-center"
                    autoClose={5000}
                    hideProgressBar
                    newestOnTop={false}
                    closeOnClick={false}
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="colored"
                    transition={Bounce}
                />

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
                    <main className="min-h-screen flex-1 px-3 pt-2 dark:bg-zinc-950/70 lg:px-6">
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
                        <BottomBar darkMode={darkMode} setDarkMode={setDarkMode} />
                    </>
                )}
            </div>
        </>
    );
}
