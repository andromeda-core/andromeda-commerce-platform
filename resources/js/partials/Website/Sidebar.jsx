import DropdownMenuItem from '@/Components/DropdownMenuItem';
import useDarkMode from '@/Hooks/useDarkMode';
import { Link, router, usePage } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';

const Sidebar = ({
    light_logo,  // Will be Used Later (Maybe)
    dark_logo, // Will be Used Later (Maybe)
    app_name,
    darkMode,
    setDarkMode,
    setActiveModal,
    activeModal,
    __
}) => {
    const { user } = usePage().props.auth;
    const isDarkMode = useDarkMode();
    const [logoutProcessing, setLogoutProcessing] = useState(false);

    // this state is for sidebar Dropdown
    const [selectedNavLink, setSelectedNavLink] = useState(null);



    //  Dropdown Auto Open If Any Dropdown item Route is Active
    useEffect(() => {
        const ordersRoute = route().current() === 'website.orders.index';
        const cartRoute = route().current() === 'website.carts.index';
        const bookmarkRoute = route().current() === 'website.bookmarks.index';
        const profileRoute = route().current() === 'website.profile.index';
        const ShippingAddressRoute = route().current() === 'website.shipping-addresses.index';

        if (profileRoute || ShippingAddressRoute || ordersRoute || cartRoute || bookmarkRoute) {
            setSelectedNavLink(__('My Page'));
        }


        const privacyRoute = route().current() === 'website.privacy-policy.index';
        const dataDeletionRoute = route().current() === 'website.data-deletion.index';
        const contactRoute = route().current() === 'website.contact.index';


        if (privacyRoute || dataDeletionRoute || contactRoute) {
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

    return (
        <div className="flex min-h-screen">
            <aside
                className={`fixed left-0 top-0 z-[50] p-4  flex h-full flex-col overflow-y-auto bg-backgroundLight transition-all duration-300 dark:bg-backgroundDark xl:w-64 `}
            >
                {/* Logo */}
                <Link href={route('home')} data-sidebar-link="true" >
                    <div
                        className={`flex items-center gap-2 px-6 py-6 transition-all`}
                    >
                        {/* <div className="flex items-center justify-center w-12 h-12 rounded">
                            <div className="block dark:hidden">
                                <img src={light_logo} alt="Logo" />
                            </div>
                            <div className="hidden dark:block">
                                <img src={dark_logo} alt="Logo" />
                            </div>
                        </div> */}
                        <span className="text-2xl font-semibold text-main-text-light dark:text-main-text-dark">
                            {app_name}
                        </span>
                    </div>
                </Link>

                {/* Navigation */}
                <nav className="flex-1 px-2 ">
                    <ul className="space-y-2">

                        {/* Home */}
                        <li>
                            <Link
                                data-sidebar-link="true"
                                title={__('Explore')}
                                href={route('home')}
                                className={`flex w-full items-center gap-3 px-4   rounded-md py-2.5 text-md transition-colors ${route().current() === 'home'
                                    ? 'menu-item-active'
                                    : 'menu-item-inactive'
                                    }`}

                            >
                                <svg
                                    className={`size-6 text-main-text-light dark:text-main-text-dark`}
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

                                <span>{__('Explore')}</span>
                            </Link>
                        </li>



                        {/* Shop */}
                        <li>
                            <Link
                                data-sidebar-link="true"
                                title={__('Shop')}
                                href={route('website.shop.index')}
                                className={`flex w-full items-center gap-3 px-4   rounded-md py-2.5 text-md transition-colors ${route().current() === 'website.shop.index'
                                    ? 'menu-item-active'
                                    : 'menu-item-inactive'
                                    }`}

                            >

                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`size-6 text-main-text-light dark:text-main-text-dark`}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z" />
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
                                className={`flex w-full items-center gap-3 px-4 rounded-md py-2.5 text-md transition-colors ${route().current() === 'website.global-search.index'
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
                                    className={`size-6 text-main-text-light dark:text-main-text-dark`}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                                    />
                                </svg>
                                <span>{__('Search')}</span>
                            </Link>
                        </li>

                        {/* Filters */}
                        <li>
                            <button
                                data-sidebar-link="true"
                                title={__('Filter')}

                                className={`flex w-full items-center gap-3 px-4 rounded-md py-2.5 text-md transition-colors ${activeModal === 'global-filters'
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
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className={`size-6 text-main-text-light dark:text-main-text-dark`}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75"
                                    />
                                </svg>
                                <span>{__('Filter')}</span>
                            </button>
                        </li>


                        {/* My Page */}
                        {user && (
                            <DropdownMenuItem
                                label={__('My Page')}
                                selected={selectedNavLink}
                                setSelected={setSelectedNavLink}

                                icon={
                                    <svg xmlns="http://www.w3.org/2000/svg" className={`size-6 text-main-text-light dark:text-main-text-dark`} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                                    </svg>

                                }
                                items={[
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

                                    user &&
                                    {
                                        label: __('Personal Information'),
                                        href: route('website.profile.index'),
                                        routeName: 'website.profile.index',
                                        type: 'link',

                                    }
                                    ,


                                    user &&
                                    {
                                        label: __('Shipping Address'),
                                        href: route('website.shipping-addresses.index'),
                                        routeName: 'website.shipping-addresses.index',
                                        type: 'link',

                                    }
                                    ,

                                ]}
                            />

                        )}



                        <DropdownMenuItem
                            label={__('Setting')}
                            selected={selectedNavLink}
                            setSelected={setSelectedNavLink}

                            icon={
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={"size-6 text-main-text-light dark:text-main-text-dark"}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                </svg>



                            }
                            items={[

                                user && user.role !== 'Customer' &&
                                {
                                    label: __('Dashboard'),
                                    href: route('dashboard'),
                                    routeName: 'dashboard',
                                    type: 'link',
                                }
                                ,



                                {
                                    label: __('Privacy Policy'),
                                    href: route('website.privacy-policy.index'),
                                    routeName: 'website.privacy-policy.index',
                                    type: 'link',

                                },

                                user &&
                                {
                                    label: __('Data Deletion'),
                                    href: route('website.data-deletion.index'),
                                    routeName: 'website.data-deletion.index',
                                    type: 'link',

                                },

                                {
                                    label: isDarkMode ? __('Light Mode') : __('Dark Mode'),
                                    type: 'button',
                                    onClick: () => {
                                        setDarkMode(!darkMode);
                                        localStorage.setItem('darkMode', !darkMode);
                                    }

                                },

                                {
                                    label: __('Language'),
                                    type: 'button',
                                    onClick: () => {
                                        if (activeModal === 'language-filters') {
                                            setActiveModal(null);
                                        } else {
                                            setActiveModal('language-filters');
                                        }
                                    }

                                },

                                {
                                    label: __('Contact Us'),
                                    href: route('website.contact.index'),
                                    routeName: 'website.contact.index',
                                    type: 'link',


                                },

                                user &&
                                {
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
                                                window.addEventListener(
                                                    'popstate',
                                                    function () {
                                                        router.visit(
                                                            route('home'),
                                                        );
                                                    },
                                                );
                                                router.reload({
                                                    replace: true,
                                                });
                                            },
                                        });
                                    },
                                    processing: logoutProcessing,



                                },


                                !user &&
                                {
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
