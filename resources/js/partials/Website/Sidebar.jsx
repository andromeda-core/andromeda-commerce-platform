import DesktopPwaBackButton from '@/Components/DesktopPwaBackButton';
import DropdownMenuItem from '@/Components/DropdownMenuItem';
import useDarkMode from '@/Hooks/useDarkMode';
import { Link, router, usePage } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';

const Sidebar = ({
    light_logo, // Will be Used Later (Maybe)
    dark_logo, // Will be Used Later (Maybe)
    app_name,
    darkMode,
    setDarkMode,
    setActiveModal,
    activeModal,
    __,
}) => {
    const { user } = usePage().props.auth;
    const isDarkMode = useDarkMode();
    const [logoutProcessing, setLogoutProcessing] = useState(false);

    // this state is for sidebar Dropdown
    const [selectedNavLink, setSelectedNavLink] = useState(null);

    // Controls back-button visibility: hidden on the clean home feed,
    // shown when a single-page feed/post/product detail is open or on other pages.
    const [isSinglePageFeedOpen, setIsSinglePageFeedOpen] = useState(false);

    useEffect(() => {
        const checkSinglePageState = () => {
            const pathname = window.location.pathname;
            const params = new URLSearchParams(window.location.search);

            // Canonical detail URL patterns
            const isCanonicalDetailUrl =
                pathname.startsWith('/post/') || pathname.startsWith('/product/');

            // Legacy query param patterns (single-page feed on home)
            const hasLegacyDetailParams = !!(
                params.get('slug') ||
                params.get('m-slug') ||
                params.get('public_id') ||
                params.get('m-public_id') ||
                params.get('single_page') === 'true'
            );

            setIsSinglePageFeedOpen(isCanonicalDetailUrl || hasLegacyDetailParams);
        };

        checkSinglePageState();

        // Patch history methods globally so we can react to
        // programmatic navigation (Inertia + custom pushState calls)
        if (!window.__historyPatchedForBackBtn) {
            const originalPushState = window.history.pushState.bind(window.history);
            const originalReplaceState = window.history.replaceState.bind(window.history);

            window.history.pushState = function (...args) {
                originalPushState(...args);
                window.dispatchEvent(new Event('locationchange'));
            };
            window.history.replaceState = function (...args) {
                originalReplaceState(...args);
                window.dispatchEvent(new Event('locationchange'));
            };
            window.__historyPatchedForBackBtn = true;
        }

        window.addEventListener('locationchange', checkSinglePageState);
        window.addEventListener('popstate', checkSinglePageState);

        return () => {
            window.removeEventListener('locationchange', checkSinglePageState);
            window.removeEventListener('popstate', checkSinglePageState);
        };
    }, []);

    //  Dropdown Auto Open If Any Dropdown item Route is Active
    useEffect(() => {
        const ordersRoute = route().current() === 'website.orders.index';
        const cartRoute = route().current() === 'website.carts.index';
        const bookmarkRoute = route().current() === 'website.bookmarks.index';
        const profileRoute = route().current() === 'website.profile.index';
        const ShippingAddressRoute = route().current() === 'website.shipping-addresses.index';
        const NotificationRoute = route().current() === 'website.notifications.index';

        if (
            profileRoute ||
            ShippingAddressRoute ||
            ordersRoute ||
            cartRoute ||
            bookmarkRoute ||
            NotificationRoute
        ) {
            setSelectedNavLink(__('My Page'));
        }

        const privacyRoute = route().current() === 'website.privacy-policy.index';
        const TermsRoute = route().current() === 'website.terms-of-service.index';
        const dataDeletionRoute = route().current() === 'website.data-deletion.index';
        const contactRoute = route().current() === 'website.contact.index';

        if (privacyRoute || dataDeletionRoute || contactRoute || TermsRoute) {
            setSelectedNavLink(__('Setting'));
        }
    }, []);

    // Toggle Mode Dark + Light
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

    const isHomePage = route().current() === 'home';
    const showBackButton = !isHomePage || isSinglePageFeedOpen;

    return (
        <div className="flex min-h-screen">
            <aside
                className={`flex h-screen w-[clamp(200px,15vw,256px)] shrink-0 flex-col overflow-y-auto bg-backgroundLight p-4 transition-all duration-300 scrollbar-none dark:bg-backgroundDark`}
            >
                {showBackButton && <DesktopPwaBackButton CustomClassName="ml-2" __={__} />}

                {/* Logo */}
                <Link href={route('home')} data-sidebar-link="true">
                    <div className={`flex items-center gap-2 px-4 py-6 transition-all`}>
                        {/* <div className="flex items-center justify-center w-12 h-12 rounded">
                            <div className="block dark:hidden">
                                <img src={light_logo} alt="Logo" />
                            </div>
                            <div className="hidden dark:block">
                                <img src={dark_logo} alt="Logo" />
                            </div>
                        </div> */}
                        <span className="font-['Space_Mono'] text-xl font-bold text-main-text-light dark:text-main-text-dark">
                            {app_name}
                        </span>
                    </div>
                </Link>

                {/* Navigation */}
                <nav className="flex-1 px-2">
                    <ul className="space-y-2">
                        {/* Home */}
                        <li>
                            <Link
                                data-sidebar-link="true"
                                title={__('Explore')}
                                href={route('home')}
                                className={`text-md flex w-full items-center gap-3 rounded-md px-4 py-2.5 transition-colors ${
                                    route().current() === 'home'
                                        ? 'menu-item-active'
                                        : 'menu-item-inactive'
                                }`}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className={`size-6 text-main-text-light dark:text-main-text-dark`}
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

                                <span>{__('Explore')}</span>
                            </Link>
                        </li>

                        {/* Shop */}
                        <li>
                            <Link
                                data-sidebar-link="true"
                                title={__('Shop')}
                                href={route('website.shop.index')}
                                className={`text-md flex w-full items-center gap-3 rounded-md px-4 py-2.5 transition-colors ${
                                    route().current() === 'website.shop.index'
                                        ? 'menu-item-active'
                                        : 'menu-item-inactive'
                                }`}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className={`size-6 text-main-text-light dark:text-main-text-dark`}
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

                                <span>{__('Shop')}</span>
                            </Link>
                        </li>

                        {/* Search */}

                        <li>
                            <Link
                                data-sidebar-link="true"
                                title={__('Search')}
                                href={route('website.global-search.index')}
                                className={`text-md flex w-full items-center gap-3 rounded-md px-4 py-2.5 transition-colors ${
                                    route().current() === 'website.global-search.index'
                                        ? 'menu-item-active'
                                        : 'menu-item-inactive'
                                }`}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className={`size-6 text-main-text-light dark:text-main-text-dark`}
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
                                <span>{__('Search')}</span>
                            </Link>
                        </li>

                        {/* Filters */}
                        <li>
                            <button
                                data-sidebar-link="true"
                                title={__('Filter')}
                                className={`text-md flex w-full items-center gap-3 rounded-md px-4 py-2.5 transition-colors ${
                                    activeModal === 'global-filters'
                                        ? 'menu-item-active'
                                        : 'menu-item-inactive'
                                }`}
                                onClick={(e) => {
                                    if (activeModal === 'global-filters') {
                                        setActiveModal(null);
                                    } else {
                                        setActiveModal('global-filters');
                                    }
                                }}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className={`size-6 text-main-text-light dark:text-main-text-dark`}
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.25"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M10 5H3" />
                                    <path d="M12 19H3" />
                                    <path d="M14 3v4" />
                                    <path d="M16 17v4" />
                                    <path d="M21 12h-9" />
                                    <path d="M21 19h-5" />
                                    <path d="M21 5h-7" />
                                    <path d="M8 10v4" />
                                    <path d="M8 12H3" />
                                </svg>
                                <span>{__('Filter')}</span>
                            </button>
                        </li>

                        {/* Languages */}
                        <li>
                            <button
                                data-sidebar-link="true"
                                title={__('Language')}
                                className={`text-md flex w-full items-center gap-3 rounded-md px-4 py-2.5 transition-colors ${
                                    activeModal === 'language-filters'
                                        ? 'menu-item-active'
                                        : 'menu-item-inactive'
                                }`}
                                onClick={(e) => {
                                    if (activeModal === 'language-filters') {
                                        setActiveModal(null);
                                    } else {
                                        setActiveModal('language-filters');
                                    }
                                }}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className={`size-6 text-main-text-light dark:text-main-text-dark`}
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.25"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20" />
                                    <path d="m8 13 4-7 4 7" />
                                    <path d="M9.1 11h5.7" />
                                </svg>

                                <span>{__('Language')}</span>
                            </button>
                        </li>

                        {/* Currency — display-only switcher, mirrors Language button */}
                        <li>
                            <button
                                data-sidebar-link="true"
                                title={__('Currency')}
                                className={`text-md flex w-full items-center gap-3 rounded-md px-4 py-2.5 transition-colors ${
                                    activeModal === 'currency-switcher'
                                        ? 'menu-item-active'
                                        : 'menu-item-inactive'
                                }`}
                                onClick={() => {
                                    if (activeModal === 'currency-switcher') {
                                        setActiveModal(null);
                                    } else {
                                        setActiveModal('currency-switcher');
                                    }
                                }}
                            >
                                {/* Dollar-circle icon */}
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className={`size-6 text-main-text-light dark:text-main-text-dark`}
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.25"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <circle cx="12" cy="12" r="10" />
                                    <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
                                    <path d="M12 18V6" />
                                </svg>
                                <span>{__('Currency')}</span>
                            </button>
                        </li>

                        {/* My Page */}
                        {user && (
                            <DropdownMenuItem
                                label={__('My Page')}
                                selected={selectedNavLink}
                                setSelected={setSelectedNavLink}
                                icon={
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className={`size-6 text-main-text-light dark:text-main-text-dark`}
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
                                }
                                items={[
                                    user && {
                                        label: __('Notifications'),
                                        href: route('website.notifications.index'),
                                        routeName: 'website.notifications.index',
                                        type: 'link',
                                    },

                                    {
                                        label: __('Orders'),
                                        href: route('website.orders.index'),
                                        routeName: 'website.orders.index',
                                        type: 'link',
                                    },

                                    {
                                        label: __('Cart'),
                                        href: route('website.carts.index'),
                                        routeName: 'website.carts.index',
                                        type: 'link',
                                    },

                                    {
                                        label: __('Bookmark'),
                                        href: route('website.bookmarks.index'),
                                        routeName: 'website.bookmarks.index',
                                        type: 'link',
                                    },

                                    user && {
                                        label: __('Personal Information'),
                                        href: route('website.profile.index'),
                                        routeName: 'website.profile.index',
                                        type: 'link',
                                    },

                                    // user &&
                                    // {
                                    //     label: __('Shipping Address'),
                                    //     href: route('website.shipping-addresses.index'),
                                    //     routeName: 'website.shipping-addresses.index',
                                    //     type: 'link',

                                    // }
                                    // ,
                                ]}
                            />
                        )}

                        <DropdownMenuItem
                            label={__('Setting')}
                            selected={selectedNavLink}
                            setSelected={setSelectedNavLink}
                            icon={
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className={
                                        'size-6 text-main-text-light dark:text-main-text-dark'
                                    }
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.25"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915" />
                                    <circle cx="12" cy="12" r="3" />
                                </svg>
                            }
                            items={[
                                user &&
                                    user.role !== 'Customer' && {
                                        label: __('Dashboard'),
                                        href: route('dashboard'),
                                        routeName: 'dashboard',
                                        type: 'link',
                                    },

                                {
                                    label: __('Terms Of Service'),
                                    href: route('website.terms-of-service.index'),
                                    routeName: 'website.terms-of-service.index',
                                    type: 'link',
                                },

                                {
                                    label: __('Privacy Policy'),
                                    href: route('website.privacy-policy.index'),
                                    routeName: 'website.privacy-policy.index',
                                    type: 'link',
                                },

                                {
                                    label: isDarkMode ? __('Light Mode') : __('Dark Mode'),
                                    type: 'button',
                                    onClick: () => {
                                        setDarkMode(!darkMode);
                                        localStorage.setItem('darkMode', !darkMode);
                                    },
                                },

                                {
                                    label: __('Contact Us'),
                                    href: route('website.contact.index'),
                                    routeName: 'website.contact.index',
                                    type: 'link',
                                },

                                user && {
                                    label: __('Logout'),
                                    type: 'button',
                                    isLogout: true,
                                    onClick: () => {
                                        setLogoutProcessing(true);
                                        router.post(route('logout'), {
                                            onFinish: () => {
                                                setLogoutProcessing(false);
                                                router.visit(route('home'), {
                                                    replace: true,
                                                });
                                                window.history.pushState(
                                                    null,
                                                    '',
                                                    window.location.href,
                                                );
                                                window.addEventListener('popstate', function () {
                                                    router.visit(route('home'));
                                                });
                                                router.reload({
                                                    replace: true,
                                                });
                                            },
                                        });
                                    },
                                    processing: logoutProcessing,
                                },

                                !user && {
                                    label: __('Login'),
                                    href: route('login'),
                                    routeName: 'login',
                                    type: 'link',
                                },
                            ]}
                        />
                    </ul>
                </nav>
            </aside>
        </div>
    );
};

export default Sidebar;
