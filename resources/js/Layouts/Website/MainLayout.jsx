import AppStatusManager from '@/Components/AppStatusManager';
import CurrencySwitcher from '@/Components/CurrencySwitcher';
import Preloader from '@/Components/Preloader';
import PWAAlertBar from '@/Components/PWAAlertBar';
import Toast from '@/Components/Toast';
import useWindowSize from '@/Hooks/useWindowSize';
import GlobalFilterModal from '@/Pages/Website/GlobalFilters/GlobalFilterModal';
import BottomBar from '@/partials/Website/BottomBar';
import Sidebar from '@/partials/Website/Sidebar';
import { router, usePage } from '@inertiajs/react';
import React, { useEffect, useRef, useState } from 'react';
import { useFilterStore } from '@/Hooks/useFilterStore';
import GlobalLanguageFilter from '@/Pages/Website/GlobalLanguageFilters/GlobalLanguageFilter';
import { useLanguageStore } from '@/Hooks/useLanguageStore';
import getCookie from '@/Hooks/useGetCookie';
import { useTranslation } from '@/Hooks/useTranslation';
import EmailVerificationPopup from '@/Components/EmailVerificationPopup';


export default function MainLayout({ children }) {
    const { asset, generalSetting, flash, auth } = usePage().props;
    const { __ } = useTranslation();



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

    // Managing Loader State
    const [loaded, setLoaded] = useState(true);

    // Managing Dark Mode State
    const [darkMode, setDarkMode] = useState(false);

    // Email Verification Popup State
    const [showEmailVerification, setShowEmailVerification] = useState(false);



    // Window Size Hook
    const windowSize = useWindowSize();

    const [moreDropdown, setMoreDropdown] = useState(false);
    const moreDropdownRef = useRef(null);



    // Language and Filter Modal Handling State
    const [activeModal, setActiveModal] = useState(null);


    // Previouus URL REF FOR MODALS POP STATE
    const previousUrlRef = useRef(window.location.href);


    // Global Filter Zustand Store Sync
    const setIsOpen = useFilterStore((s) => s.setIsOpen);
    useEffect(() => {
        setIsOpen(activeModal === 'filter');
    }, [activeModal]);


    // Global Language Zustand Store Sync
    const languages = useLanguageStore((state) => state.languages);
    const fetchLanguages = useLanguageStore((state) => state.fetchLanguages);
    const loading = useLanguageStore((state) => state.loading);
    const setLanguageLocale = useLanguageStore(state => state.setLanguageLocale);
    const setLanguageId = useLanguageStore(state => state.setLanguageId);
    const activeLanguageId = useLanguageStore(state => state.activeLanguageId);
    const isLoaded = useLanguageStore(state => state.isLoaded);

    useEffect(() => {
        // Initial Load
        if (!isLoaded) {
            fetchLanguages(true);
            return;
        }

        //  Login (User ID exists but store has old ID or is guest)
        if (auth?.user) {
            if (auth.user.language_id !== activeLanguageId) {
                fetchLanguages(true);
            }
        }

        // Logout (User ID becomes null, but store still has auth data)

        if (!auth?.user && activeLanguageId !== 1 && activeLanguageId !== null) {
            fetchLanguages(true);
        }

    }, [auth?.user?.id, isLoaded]);


    useEffect(() => {
        // Syning User Locales With Zustand Store If Authenticated
        if (auth?.user) {
            setLanguageLocale(auth.user.language_locale);
            setLanguageId(auth.user.language_id);
        }

        if (!auth?.user) {
            const language_cookie = getCookie('language');
            if (!language_cookie) {
                setLanguageLocale('en');
                setLanguageId(1);
            }

            try {
                const name = "language=";
                const match = document.cookie.match(new RegExp('(^|;\\s*)' + name + '([^;]*)'));

                if (match) {
                    const decoded = decodeURIComponent(match[2]);
                    const parsed = JSON.parse(decoded);

                    if (parsed?.language_locale && parsed?.language_id) {
                        setLanguageLocale(parsed.language_locale);
                        setLanguageId(parsed.language_id);
                        return;
                    }
                }
                throw new Error("Invalid Cookie");

            } catch (e) {
                setLanguageLocale('en');
                setLanguageId(1);
            }
        }
    }, [auth.user?.id]);


    // if email needs verification on mount and periodically
    useEffect(() => {

        if (!auth?.user) {
            setShowEmailVerification(false);
            return;
        }

        const checkEmailVerification = () => {
            if (
                auth?.user &&
                !auth?.user.email_verified_at
            ) {
                setShowEmailVerification(true);
            } else {
                setShowEmailVerification(false);
            }
        };

        checkEmailVerification();


        const channel = window.Echo.private(`user.${auth?.user?.id}`);

        channel.listen('.email.verified', (event) => {
            setShowEmailVerification(false);


            router.reload({
                only: ['auth'],
                preserveScroll: true,
                preserveState: true,
            });
        });


        return () => {
            window.Echo.leave(`user.${auth?.user.id}`);
        };
    }, [auth?.user?.id, auth?.user?.email_verified_at]);

    // Appending HISTORY WHEN FILTER OR LANGUAGE MODAL OPENS
    useEffect(() => {
        const url = new URL(window.location.href);

        if (activeModal) {
            url.searchParams.set('modal', activeModal);
            window.history.pushState({ modal: activeModal }, '', url.toString());
            previousUrlRef.current = url.toString();
            document.body.style.overflow = 'hidden';
            document.body.style.touchAction = 'none';
        } else {
            if (url.searchParams.has('modal')) {
                url.searchParams.delete('modal');
                window.history.pushState({}, '', url.toString());
                previousUrlRef.current = url.toString();
            }
            document.body.style.overflow = '';
            document.body.style.touchAction = '';
        }

        return () => {
            document.body.style.overflow = '';
            document.body.style.touchAction = '';
        };
    }, [activeModal]);



    return (
        <>
            <div className="relative flex w-full h-screen !overflow-hidden scrollbar-none bg-backgroundLight dark:bg-backgroundDark"
                style={{ '--sidebar-w': 'clamp(200px,15vw,256px)' }}
            >
                <Preloader loaded={loaded} setLoaded={setLoaded} />
                <AppStatusManager />

                <GlobalFilterModal
                    isOpen={activeModal === 'global-filters'}
                    close={() => setActiveModal(null)}
                    previousUrlRef={previousUrlRef}
                />
                <GlobalLanguageFilter
                    isOpen={activeModal === 'language-filters'}
                    close={() => setActiveModal(null)}
                    previousUrlRef={previousUrlRef}
                    languages={languages}
                    loading={loading}
                />

                {/* Currency switcher — website only, not dashboard */}
                <CurrencySwitcher
                    isOpen={activeModal === 'currency-switcher'}
                    close={() => setActiveModal(null)}
                />


                <Toast flash={flash} />

                {/* Sidebar */}
                {windowSize.width > 1024 && (
                    <aside
                        className="
    hidden lg:flex
    w-[var(--sidebar-w)]
    shrink-0
    h-screen
  "
                    >
                        <Sidebar
                            light_logo={ApplicationLogoLight}
                            dark_logo={ApplicationLogoDark}
                            app_name={generalSetting?.app_name}
                            darkMode={darkMode}
                            setDarkMode={setDarkMode}
                            setActiveModal={setActiveModal}
                            activeModal={activeModal}
                            __={__}
                        />

                    </aside>

                )}

                {/* Main Content Area */}
                <div className="flex-1 min-h-screen !overflow-hidden">
                    <main className="h-full px-3 pt-2 overflow-y-auto scrollbar-none lg:px-6 xl:px-8">
                        {children ?? (
                            <div className="flex h-[80vh] items-center justify-center">
                                {__('No content available.')}
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
                        setActiveModal={setActiveModal}
                        activeModal={activeModal}
                        __={__}
                    />


                )}

                <PWAAlertBar />
            </div>

            <div id="modal-root"></div>


            {showEmailVerification && (
                <EmailVerificationPopup
                    user={auth?.user}
                    onClose={() => setShowEmailVerification(false)}
                />
            )}
        </>
    );
}
