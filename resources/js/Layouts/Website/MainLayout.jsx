import AppStatusManager from '@/Components/AppStatusManager';
import Preloader from '@/Components/Preloader';
import PWAAlertBar from '@/Components/PWAAlertBar';
import Toast from '@/Components/Toast';
import useWindowSize from '@/Hooks/useWindowSize';
import GlobalFilterModal from '@/Pages/Website/GlobalFilters/GlobalFilterModal';
import BottomBar from '@/partials/Website/BottomBar';
import Sidebar from '@/partials/Website/Sidebar';
import { usePage } from '@inertiajs/react';
import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { useFilterStore } from '@/Hooks/useFilterStore';
// import ActivateNavigationPrompt from '@/Components/ActivateNavigationPrompt';


export default function MainLayout({ children }) {
    const { asset, generalSetting, flash, auth } = usePage().props;

    // Application Logo Sate With Default Images
    const [ApplicationLogoLight, setApplicationLogoLight] = useState(
        asset + 'assets/images/Logo/LightLogo.png',
    );
    const [ApplicationLogoDark, setApplicationLogoDark] = useState(
        asset + 'assets/images/Logo/DarkLogo.png',
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

    // Managing SidebarToggle State (Not Using RN)
    // const [sidebarToggle, setSidebarToggle] = useState(() => {
    //     const saved = localStorage.getItem('sidebarToggle');
    //     if (saved === null) {
    //         return false;
    //     }
    //     try {
    //         const parsed = JSON.parse(saved);
    //         if (typeof parsed === 'boolean') {
    //             return parsed;
    //         }
    //         localStorage.removeItem('sidebarToggle');
    //         return false;
    //     } catch (error) {
    //         localStorage.removeItem('sidebarToggle');
    //         return false;
    //     }
    // });

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



    // Filter Pop Up Modal
    const [filterModal, setFilterModal] = useState(false);
    const setIsOpen = useFilterStore((s) => s.setIsOpen);

    useEffect(() => {
        setIsOpen(filterModal);
    }, [filterModal]);

    return (
        <>
            <div className="relative flex w-full min-h-screen bg-backgroundLight dark:bg-backgroundDark">
                <Preloader loaded={loaded} setLoaded={setLoaded} />
                <AppStatusManager />

                <GlobalFilterModal filterModal={filterModal} setFilterModal={setFilterModal} />

                <Toast flash={flash} />

                {/* Sidebar */}
                {windowSize.width > 1024 && (
                    <div className={`fixed left-0 top-0 z-40 h-screen transition-all duration-300 'w-[240px]`}>
                        <Sidebar
                            light_logo={ApplicationLogoLight}
                            dark_logo={ApplicationLogoDark}
                            app_name={generalSetting?.app_name}
                            darkMode={darkMode}
                            setDarkMode={setDarkMode}
                            setFilterModal={setFilterModal}
                            filterModal={filterModal}
                        />

                    </div>

                )}

                {/* Main Content Area */}
                <div
                    className={`flex-1 min-h-screen transition-all duration-300 ${windowSize.width > 1024
                        ? 'ml-[240px]'
                        : 'ml-0'
                        }`}
                >
                    {/* Main Content */}
                    <main className="min-h-screen px-3 pt-2 bg-backgroundLight dark:bg-backgroundDark lg:px-6 xl:px-8">

                        {/* Activation Navigation Prompt Modal */}
                        {/* {needsActivation &&
                            <ActivateNavigationPrompt setNeedsActivation={setNeedsActivation} />
                        } */}

                        {children ? (
                            children
                        ) : (
                            <div className="flex h-[80vh] items-center justify-center text-sub-text-light dark:text-sub-text-dark">
                                No content available.
                            </div>
                        )}
                    </main>
                </div>
                {/* Mobile Bottom Navigation */}
                {windowSize.width <= 1024 && (
                    <BottomBar
                        darkMode={darkMode}
                        setDarkMode={setDarkMode}
                        moreDropdown={moreDropdown}
                        setMoreDropdown={setMoreDropdown}
                        moreDropdownRef={moreDropdownRef}
                        // cartItemsCount={cartItemsCount}
                        setFilterModal={setFilterModal}
                        filterModal={filterModal}
                    />

                )}

                <PWAAlertBar />
            </div>

            <div id="modal-root"></div>
        </>
    );
}
