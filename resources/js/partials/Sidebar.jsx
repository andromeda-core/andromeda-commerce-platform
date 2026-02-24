import DesktopPwaBackButton from '@/Components/DesktopPwaBackButton';
import can from '@/Hooks/useCan';
import { useTranslation } from '@/Hooks/useTranslation';
import useWindowSize from '@/Hooks/useWindowSize';
import { Link, router } from '@inertiajs/react';
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export default function Sidebar({
    sidebarToggle,
    setSidebarToggle,
    ApplicationLogoLight,
    ApplicationLogoDark,
}) {
    // For Managing Sidebar Navlinks Selection State
    const [selected, setSelected] = useState(null);
    const [selectedSubMenu, setSelectedSubMenu] = useState(null);

    const { width } = useWindowSize();

    const { __ } = useTranslation();

    const isLargeScreen = width > 1024;
    const prevIsLargeScreenRef = useRef(isLargeScreen);

    useEffect(() => {
        if (prevIsLargeScreenRef.current && !isLargeScreen && sidebarToggle) {
            setSidebarToggle(false);
        }
        prevIsLargeScreenRef.current = isLargeScreen;
    }, [isLargeScreen, sidebarToggle]);

    useEffect(() => {
        if (isLargeScreen) {
            const saved = localStorage.getItem('sidebarToggle');
            if (saved === null) {
                setSidebarToggle(false);
                localStorage.setItem('sidebarToggle', JSON.stringify(false));
            } else {
                setSidebarToggle(JSON.parse(saved));
            }
        }
    }, [isLargeScreen]);

    useEffect(() => {
        if (isLargeScreen) {
            localStorage.setItem('sidebarToggle', JSON.stringify(sidebarToggle));
        }
    }, [sidebarToggle, isLargeScreen]);


    // Adding Browser History When Sidebar Toggles
    useEffect(() => {
        if (sidebarToggle && width < 1024) {
            const url = new URL(window.location.href);
            url.searchParams.set("modal", "sidebar");
            window.history.replaceState({}, "", url.toString());
            window.history.pushState({}, "", url.toString());
        }

        if (!sidebarToggle) {
            const url = new URL(window.location.href);
            url.searchParams.delete("modal");
            window.history.replaceState({}, "", url.toString());
        }
    }, [sidebarToggle, width]);

    // POP STATE HANDLING
    const sidebarClickRef = useRef(false);
    useEffect(() => {


        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            sidebar.addEventListener('click', () => {
                sidebarClickRef.current = true;
            });
        }
        const handlePopState = (e) => {
            const params = new URLSearchParams(window.location.search);
            const modal = params.get("modal");


            if (modal === "sidebar") {

                if (sidebarClickRef.current) {
                    sidebarClickRef.current = false;
                    return;
                }



                e.preventDefault();
                setSidebarToggle(false);
                sidebarClickRef.current = false;

                window.history.replaceState({}, "", window.location.pathname);
                return;
            }
        };

        const inertiaBefore = router.on("before", (event) => {
            const params = new URLSearchParams(window.location.search);
            const modal = params.get("modal");
            if (modal === "sidebar") {

                if (sidebarClickRef.current) {
                    sidebarClickRef.current = false;
                    return;
                }


                event.preventDefault();
                setSidebarToggle(false);




                window.history.replaceState({}, "", window.location.pathname);
                return false;
            }
        });

        window.addEventListener("popstate", handlePopState);

        return () => {
            window.removeEventListener("popstate", handlePopState);
            inertiaBefore();
        };
    }, []);



    // Auto Selection For Sidebar Menu Behalf Of Current Route
    useEffect(() => {
        const isOrdersRoute = [
            'dashboard.orders.',
            'dashboard.order-refunds.',
            'dashboard.order-cancelation-requests.',
            'dashboard.order-address-change-requests.',
            'dashboard.package-recordings.',
        ].some(prefix => route().current().startsWith(prefix));


        const isProductsRoute = [
            'dashboard.smartphones.',
            'dashboard.smartphone-for-sales.',
            'dashboard.batches.',
            'dashboard.inventories.',
            'dashboard.categories.',
            'dashboard.settings.model_names.',
            'dashboard.settings.colors.',
            'dashboard.settings.capacities.',
            'dashboard.settings.condition-settings.',
            'dashboard.settings.addon-settings.'
        ].some(prefix => route().current().startsWith(prefix));

        const isUsersRoute = [
            'dashboard.customers.',
            'dashboard.reward-points.',
        ].some(prefix => route().current().startsWith(prefix));


        const isFinanceRoute = [
            'dashboard.commissions.',
            'dashboard.unsettled-accounts.',
        ].some(prefix => route().current().startsWith(prefix));


        const isPartnersRoute = [
            'dashboard.suppliers.',
            'dashboard.collaborators.',
            'dashboard.distributors.'
        ].some(prefix => route().current().startsWith(prefix));


        const isContentRoute = [
            'dashboard.posts.',
            'dashboard.bookmarks.',
            'dashboard.floors.'
        ].some(prefix => route().current().startsWith(prefix));

        const isSystemRoute = [
            'dashboard.users.',
            'dashboard.translation-system.',
            'dashboard.risk-signals.',
            'dashboard.system-logs.',
            'dashboard.data-deletion-requests.',
        ].some(prefix => route().current().startsWith(prefix));


        const isSettingRoute = route().current().startsWith('dashboard.settings.');

        const isExcludedSettingRoute = [
            'dashboard.settings.model_names.',
            'dashboard.settings.colors.',
            'dashboard.settings.capacities.',
            'dashboard.settings.condition-settings.',
            'dashboard.settings.addon-settings.',
        ].some(prefix => route().current().startsWith(prefix));

        if (isOrdersRoute) {
            setSelected("Orders");
        } else if (isProductsRoute) {
            setSelected("Products");

            const isSetupRoute = [
                'dashboard.categories.',
                'dashboard.settings.model_names.',
                'dashboard.settings.colors.',
                'dashboard.settings.capacities.',
                'dashboard.settings.condition-settings.',
                'dashboard.settings.addon-settings.'
            ].some(prefix => route().current().startsWith(prefix));


            if (isSetupRoute) {
                setSelectedSubMenu("Setup");
            }
        } else if (isUsersRoute) {
            setSelected("Users");
        } else if (isFinanceRoute) {
            setSelected("Finance");

            const isCommissionsRoute = [
                'dashboard.commissions.',
            ].some(prefix => route().current().startsWith(prefix));

            if (isCommissionsRoute) {
                setSelectedSubMenu("Commissions");
            }
        } else if (isPartnersRoute) {
            setSelected("Partners");
        } else if (isContentRoute) {
            setSelected("Content");
        } else if (isSystemRoute) {
            setSelected("System");

            const isTranslationSystemRoute = [
                'dashboard.translation-system.',
            ].some(prefix => route().current().startsWith(prefix));


            if (isTranslationSystemRoute) {
                setSelectedSubMenu("Translation System");
            }
        } else if (isSettingRoute && !isExcludedSettingRoute) {
            setSelected("Settings");
        }


    }, []);

    return (
        <>
            <aside
                className={`${sidebarToggle ? 'translate-x-0 lg:w-[90px]' : '-translate-x-full'}
                sidebar fixed left-0 top-0 ${width <= 1024 ? "z-[10002]" : "z-50"} flex h-screen w-[290px] flex-col
                overflow-y-hidden border-r border-gray-200 bg-white px-5
                dark:border-gray-800 dark:bg-deepcharcoal lg:static lg:translate-x-0`}
            >




                {width < 1024 && sidebarToggle && (
                    createPortal(
                        <div
                            className="fixed inset-0 bg-black/30 backdrop-blur-lg z-[10001]"
                            onClick={() => setSidebarToggle(false)}
                        ></div>,
                        document.getElementById('modal-root') || document.body
                    )
                )}




                <div
                    className={`flex items-center ${sidebarToggle ? 'justify-center' : 'justify-between'} sidebar-header gap-2 pb-7 pt-8`}
                >


                    <DesktopPwaBackButton __={__} />



                    <Link href={route('home')}>
                        <span className={`logo ${sidebarToggle ? 'hidden' : ''}`}>
                            <img
                                className="h-[80px] w-auto object-contain dark:hidden"
                                src={ApplicationLogoLight}
                                alt="Logo"
                            />

                            <img
                                className="hidden h-[80px] w-auto object-contain dark:block"
                                src={ApplicationLogoDark}
                                alt="Logo"
                            />
                        </span>
                    </Link>

                    <button
                        className={`${sidebarToggle ? 'bg-gray-100 hover:bg-gray-200 dark:bg-zinc-900/80 dark:hover:bg-zinc-900/50 lg:bg-transparent dark:lg:bg-transparent' : ''} z-99999 flex h-10 w-10 items-center justify-center rounded-lg border-gray-200 text-gray-500 dark:border-gray-800 dark:text-gray-400 lg:hidden lg:h-11 lg:w-11 lg:border`}
                        onClick={() => setSidebarToggle(!sidebarToggle)}
                    >
                        <svg
                            className={`${sidebarToggle ? 'block lg:hidden' : 'hidden'} fill-current`}
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z"
                                fill=""
                            />
                        </svg>
                    </button>
                </div>

                <div className="flex flex-col flex-1 overflow-y-auto duration-300 ease-linear no-scrollbar">
                    <nav>
                        <div>
                            <h3 className="mb-4 text-xs uppercase leading-[20px] text-gray-400">
                                <svg
                                    className={`menu-group-icon mx-auto fill-current ${sidebarToggle ? 'hidden lg:block' : 'hidden'}`}
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        fillRule="evenodd"
                                        clipRule="evenodd"
                                        d="M5.99915 10.2451C6.96564 10.2451 7.74915 11.0286 7.74915 11.9951V12.0051C7.74915 12.9716 6.96564 13.7551 5.99915 13.7551C5.03265 13.7551 4.24915 12.9716 4.24915 12.0051V11.9951C4.24915 11.0286 5.03265 10.2451 5.99915 10.2451ZM17.9991 10.2451C18.9656 10.2451 19.7491 11.0286 19.7491 11.9951V12.0051C19.7491 12.9716 18.9656 13.7551 17.9991 13.7551C17.0326 13.7551 16.2491 12.9716 16.2491 12.0051V11.9951C16.2491 11.0286 17.0326 10.2451 17.9991 10.2451ZM13.7491 11.9951C13.7491 11.0286 12.9656 10.2451 11.9991 10.2451C11.0326 10.2451 10.2491 11.0286 10.2491 11.9951V12.0051C10.2491 12.9716 11.0326 13.7551 11.9991 13.7551C12.9656 13.7551 13.7491 12.9716 13.7491 12.0051V11.9951Z"
                                        fill=""
                                    />
                                </svg>
                            </h3>

                            <ul className="flex flex-col gap-4 mb-6">
                                <li>
                                    <Link
                                        href={route('dashboard')}
                                        className={`menu-item group ${route().current() === 'dashboard' ? 'menu-item-active' : 'menu-item-inactive'}`}
                                    >

                                        <span
                                            className={`menu-item-text ${sidebarToggle ? 'lg:hidden' : ''}`}
                                        >
                                            Dashboard
                                        </span>

                                        <svg
                                            className={`menu-item-arrow ${sidebarToggle ? 'lg:hidden' : ''}`}
                                            width="20"
                                            height="20"
                                            viewBox="0 0 20 20"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                d="M4.79175 7.39584L10.0001 12.6042L15.2084 7.39585"
                                                stroke=""
                                                strokeWidth="1.5"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    </Link>
                                </li>


                                {/* Orders */}
                                {can(['Orders View', 'Order Refunds View', 'Order Cancelations View', 'Order Address Changes View', 'Package Recordings View']) && (
                                    <li>
                                        <a
                                            onClick={() => {
                                                if (selected === 'Orders') {
                                                    setSelected(null);
                                                } else {
                                                    setSelected('Orders');
                                                }
                                            }}
                                            className={`menu-item group cursor-pointer
                                                ${selected === 'Orders' ? 'menu-item-active' : 'menu-item-inactive'} `}
                                        >


                                            <span
                                                className={`menu-item-text ${sidebarToggle ? 'lg:hidden' : ''}`}
                                            >
                                                Orders
                                            </span>

                                            <svg
                                                className={`menu-item-arrow absolute right-2.5 top-1/2 -translate-y-1/2 stroke-current ${selected === 'Orders' && 'menu-item-arrow-active'} ${sidebarToggle ? 'lg:hidden' : ''}`}
                                                width="20"
                                                height="20"
                                                viewBox="0 0 20 20"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    d="M4.79175 7.39584L10.0001 12.6042L15.2084 7.39585"
                                                    stroke=""
                                                    strokeWidth="1.5"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                        </a>

                                        <div
                                            className={`translate transform overflow-hidden ${selected === 'Orders' ? 'block' : 'hidden'}`}
                                        >
                                            <ul
                                                className={`menu-dropdown mt-2 flex flex-col gap-1 pl-3 ${sidebarToggle ? 'lg:hidden' : 'flex'} `}
                                            >
                                                {can('Orders View') && (
                                                    <li>
                                                        <Link
                                                            href={route('dashboard.orders.index')}
                                                            className={`menu-dropdown-item group ${route().current() === 'dashboard.orders.index' ? 'menu-dropdown-item-active' : 'menu-dropdown-item-inactive'}`}
                                                        >
                                                            Orders List
                                                        </Link>
                                                    </li>
                                                )}


                                                {can('Order Refunds View') && (
                                                    <li>
                                                        <Link
                                                            href={route('dashboard.order-refunds.index')}
                                                            className={`menu-dropdown-item group ${route().current() === 'dashboard.order-refunds.index' ? 'menu-dropdown-item-active' : 'menu-dropdown-item-inactive'}`}
                                                        >
                                                            Refunds
                                                        </Link>
                                                    </li>
                                                )}


                                                {can('Order Cancelations View') && (
                                                    <li>
                                                        <Link
                                                            href={route('dashboard.order-cancelation-requests.index')}
                                                            className={`menu-dropdown-item group ${route().current() === 'dashboard.order-cancelation-requests.index' ? 'menu-dropdown-item-active' : 'menu-dropdown-item-inactive'}`}
                                                        >
                                                            Cancelations
                                                        </Link>
                                                    </li>
                                                )}

                                                {can('Order Address Changes View') && (
                                                    <li>
                                                        <Link
                                                            href={route('dashboard.order-address-change-requests.index')}
                                                            className={`menu-dropdown-item group ${route().current() === 'dashboard.order-address-change-requests.index' ? 'menu-dropdown-item-active' : 'menu-dropdown-item-inactive'}`}
                                                        >
                                                            Order Address Changes
                                                        </Link>
                                                    </li>
                                                )}


                                                {can('Package Recordings View') && (
                                                    <li>
                                                        <Link
                                                            href={route('dashboard.package-recordings.index')}
                                                            className={`menu-dropdown-item group ${route().current() === 'dashboard.package-recordings.index' ? 'menu-dropdown-item-active' : 'menu-dropdown-item-inactive'}`}
                                                        >
                                                            Package Records
                                                        </Link>
                                                    </li>
                                                )}


                                            </ul>
                                        </div>
                                    </li>
                                )}


                                {/* Products */}
                                {can(['Smartphones View', 'Batch View', 'Categories View', 'Inventories View', 'Smartphone For Sales View', 'Colors View', 'Capacity View', 'Conditions View', 'Model Names View', 'Addon Items View']) && (
                                    <li>
                                        <a
                                            onClick={() => {
                                                if (selected === 'Products') {
                                                    setSelected(null);
                                                } else {
                                                    setSelected('Products');
                                                }
                                            }}
                                            className={`menu-item group cursor-pointer ${selected === 'Products' ? 'menu-item-active' : 'menu-item-inactive'} `}
                                        >


                                            <span
                                                className={`menu-item-text ${sidebarToggle ? 'lg:hidden' : ''}`}
                                            >
                                                Products
                                            </span>

                                            <svg
                                                className={`menu-item-arrow absolute right-2.5 top-1/2 -translate-y-1/2 stroke-current ${selected === 'Products' && 'menu-item-arrow-active'} ${sidebarToggle ? 'lg:hidden' : ''}`}
                                                width="20"
                                                height="20"
                                                viewBox="0 0 20 20"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    d="M4.79175 7.39584L10.0001 12.6042L15.2084 7.39585"
                                                    stroke=""
                                                    strokeWidth="1.5"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                        </a>

                                        <div
                                            className={`translate transform overflow-hidden ${selected === 'Products' ? 'block' : 'hidden'}`}
                                        >
                                            <ul
                                                className={`menu-dropdown mt-2 flex flex-col gap-1 pl-3 ${sidebarToggle ? 'lg:hidden' : 'flex'} `}
                                            >
                                                {can('Smartphones View') && (
                                                    <li>
                                                        <Link
                                                            href={route('dashboard.smartphones.index')}
                                                            className={`menu-dropdown-item group ${route().current() === 'dashboard.smartphones.index' ? 'menu-dropdown-item-active' : 'menu-dropdown-item-inactive'}`}
                                                        >
                                                            Models
                                                        </Link>
                                                    </li>
                                                )}


                                                {can('Smartphone For Sales View') && (
                                                    <li>
                                                        <Link
                                                            href={route('dashboard.smartphone-for-sales.index')}
                                                            className={`menu-dropdown-item group ${route().current() === 'dashboard.smartphone-for-sales.index' ? 'menu-dropdown-item-active' : 'menu-dropdown-item-inactive'}`}
                                                        >
                                                            Sales
                                                        </Link>
                                                    </li>
                                                )}


                                                {can('Batch View') && (
                                                    <li>
                                                        <Link
                                                            href={route('dashboard.batches.index')}
                                                            className={`menu-dropdown-item group ${route().current() === 'dashboard.batches.index' ? 'menu-dropdown-item-active' : 'menu-dropdown-item-inactive'}`}
                                                        >
                                                            Stock
                                                        </Link>
                                                    </li>
                                                )}

                                                {can('Inventories View') && (
                                                    <li>
                                                        <Link
                                                            href={route('dashboard.inventories.index')}
                                                            className={`menu-dropdown-item group ${route().current() === 'dashboard.inventories.index' ? 'menu-dropdown-item-active' : 'menu-dropdown-item-inactive'}`}
                                                        >
                                                            Inventories
                                                        </Link>
                                                    </li>
                                                )}


                                                {can(['Categories View', 'Colors View', 'Capacity View', 'Conditions View', 'Model Names View', 'Addon Items View']) && (
                                                    <li>
                                                        <a
                                                            onClick={() => {
                                                                if (selectedSubMenu === 'Setup') {
                                                                    setSelectedSubMenu(null);
                                                                } else {
                                                                    setSelectedSubMenu('Setup');
                                                                }
                                                            }}
                                                            className={`menu-item group cursor-pointer ${selectedSubMenu === 'Setup' ? 'menu-item-active' : 'menu-item-inactive'} `}
                                                        >


                                                            <span
                                                                className={`menu-item-text ${sidebarToggle ? 'lg:hidden' : ''}`}
                                                            >
                                                                Setup
                                                            </span>

                                                            <svg
                                                                className={`menu-item-arrow absolute right-2.5 top-1/2 -translate-y-1/2 stroke-current ${selectedSubMenu === 'Setup' && 'menu-item-arrow-active'} ${sidebarToggle ? 'lg:hidden' : ''}`}
                                                                width="20"
                                                                height="20"
                                                                viewBox="0 0 20 20"
                                                                fill="none"
                                                                xmlns="http://www.w3.org/2000/svg"
                                                            >
                                                                <path
                                                                    d="M4.79175 7.39584L10.0001 12.6042L15.2084 7.39585"
                                                                    stroke=""
                                                                    strokeWidth="1.5"
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                />
                                                            </svg>
                                                        </a>

                                                        <div
                                                            className={`translate transform overflow-hidden ${selectedSubMenu === 'Setup' ? 'block' : 'hidden'}`}
                                                        >
                                                            <ul
                                                                className={`menu-dropdown mt-2 flex flex-col gap-1 pl-3 ${sidebarToggle ? 'lg:hidden' : 'flex'} `}
                                                            >
                                                                {can('Categories View') && (
                                                                    <li>
                                                                        <Link
                                                                            href={route('dashboard.categories.index')}
                                                                            className={`menu-dropdown-item group ${route().current() === 'dashboard.categories.index' ? 'menu-dropdown-item-active' : 'menu-dropdown-item-inactive'}`}
                                                                        >
                                                                            Categories
                                                                        </Link>
                                                                    </li>
                                                                )}


                                                                {can('Model Names View') && (
                                                                    <li>
                                                                        <Link
                                                                            href={route('dashboard.settings.model_names.index')}
                                                                            className={`menu-dropdown-item group ${route().current() === 'dashboard.settings.model_names.index' ? 'menu-dropdown-item-active' : 'menu-dropdown-item-inactive'}`}
                                                                        >
                                                                            Model Names
                                                                        </Link>
                                                                    </li>
                                                                )}


                                                                {can('Colors View') && (
                                                                    <li>
                                                                        <Link
                                                                            href={route('dashboard.settings.colors.index')}
                                                                            className={`menu-dropdown-item group ${route().current() === 'dashboard.settings.colors.index' ? 'menu-dropdown-item-active' : 'menu-dropdown-item-inactive'}`}
                                                                        >
                                                                            Colors
                                                                        </Link>
                                                                    </li>
                                                                )}

                                                                {can('Capacity View') && (
                                                                    <li>
                                                                        <Link
                                                                            href={route('dashboard.settings.capacities.index')}
                                                                            className={`menu-dropdown-item group ${route().current() === 'dashboard.settings.capacities.index' ? 'menu-dropdown-item-active' : 'menu-dropdown-item-inactive'}`}
                                                                        >
                                                                            Capacity
                                                                        </Link>
                                                                    </li>
                                                                )}


                                                                {can('Conditions View') && (
                                                                    <li>
                                                                        <Link
                                                                            href={route('dashboard.settings.condition-settings.index')}
                                                                            className={`menu-dropdown-item group ${route().current() === 'dashboard.settings.condition-settings.index' ? 'menu-dropdown-item-active' : 'menu-dropdown-item-inactive'}`}
                                                                        >
                                                                            Conditions
                                                                        </Link>
                                                                    </li>
                                                                )}


                                                                {can('Addon Items View') && (
                                                                    <li>
                                                                        <Link
                                                                            href={route('dashboard.settings.addon-settings.index')}
                                                                            className={`menu-dropdown-item group ${route().current() === 'dashboard.settings.addon-settings.index' ? 'menu-dropdown-item-active' : 'menu-dropdown-item-inactive'}`}
                                                                        >
                                                                            Add-on Items
                                                                        </Link>
                                                                    </li>
                                                                )}


                                                            </ul>
                                                        </div>
                                                    </li>
                                                )}


                                            </ul>
                                        </div>
                                    </li>
                                )}

                                {/* Users */}
                                {can(['Customers View', 'Reward Points View']) && (
                                    <li>
                                        <a
                                            onClick={() => {
                                                if (selected === 'Users') {
                                                    setSelected(null);
                                                } else {
                                                    setSelected('Users');
                                                }
                                            }}
                                            className={`menu-item group cursor-pointer ${selected === 'Users' ? 'menu-item-active' : 'menu-item-inactive'} `}
                                        >


                                            <span
                                                className={`menu-item-text ${sidebarToggle ? 'lg:hidden' : ''}`}
                                            >
                                                Users
                                            </span>

                                            <svg
                                                className={`menu-item-arrow absolute right-2.5 top-1/2 -translate-y-1/2 stroke-current ${selected === 'Users' && 'menu-item-arrow-active'} ${sidebarToggle ? 'lg:hidden' : ''}`}
                                                width="20"
                                                height="20"
                                                viewBox="0 0 20 20"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    d="M4.79175 7.39584L10.0001 12.6042L15.2084 7.39585"
                                                    stroke=""
                                                    strokeWidth="1.5"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                        </a>

                                        <div
                                            className={`translate transform overflow-hidden ${selected === 'Users' ? 'block' : 'hidden'}`}
                                        >
                                            <ul
                                                className={`menu-dropdown mt-2 flex flex-col gap-1 pl-3 ${sidebarToggle ? 'lg:hidden' : 'flex'} `}
                                            >
                                                {can('Customers View') && (
                                                    <li>
                                                        <Link
                                                            href={route('dashboard.customers.index')}
                                                            className={`menu-dropdown-item group ${route().current() === 'dashboard.customers.index' ? 'menu-dropdown-item-active' : 'menu-dropdown-item-inactive'}`}
                                                        >
                                                            Customers
                                                        </Link>
                                                    </li>
                                                )}


                                                {can('Reward Points View') && (
                                                    <li>
                                                        <Link
                                                            href={route('dashboard.reward-points.index')}
                                                            className={`menu-dropdown-item group ${route().current() === 'dashboard.reward-points.index' ? 'menu-dropdown-item-active' : 'menu-dropdown-item-inactive'}`}
                                                        >
                                                            Reward Points
                                                        </Link>
                                                    </li>
                                                )}




                                            </ul>
                                        </div>
                                    </li>
                                )}

                                {/* Finance */}
                                {can(['Supplier Commissions View', 'Collaborator Commissions View', 'Distributor Commissions View']) && (
                                    <li>
                                        <a
                                            onClick={() => {
                                                if (selected === 'Finance') {
                                                    setSelected(null);
                                                } else {
                                                    setSelected('Finance');
                                                }
                                            }}
                                            className={`menu-item group cursor-pointer ${selected === 'Finance' ? 'menu-item-active' : 'menu-item-inactive'} `}
                                        >


                                            <span
                                                className={`menu-item-text ${sidebarToggle ? 'lg:hidden' : ''}`}
                                            >
                                                Finance
                                            </span>

                                            <svg
                                                className={`menu-item-arrow absolute right-2.5 top-1/2 -translate-y-1/2 stroke-current ${selected === 'Finance' && 'menu-item-arrow-active'} ${sidebarToggle ? 'lg:hidden' : ''}`}
                                                width="20"
                                                height="20"
                                                viewBox="0 0 20 20"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    d="M4.79175 7.39584L10.0001 12.6042L15.2084 7.39585"
                                                    stroke=""
                                                    strokeWidth="1.5"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                        </a>

                                        <div
                                            className={`translate transform overflow-hidden ${selected === 'Finance' ? 'block' : 'hidden'}`}
                                        >
                                            <ul
                                                className={`menu-dropdown mt-2 flex flex-col gap-1 pl-3 ${sidebarToggle ? 'lg:hidden' : 'flex'} `}
                                            >


                                                {can(['Supplier Commissions View', 'Collaborator Commissions View', 'Distributor Commissions View']) && (
                                                    <li>
                                                        <a
                                                            onClick={() => {
                                                                if (selectedSubMenu === 'Commissions') {
                                                                    setSelectedSubMenu(null);
                                                                } else {
                                                                    setSelectedSubMenu('Commissions');
                                                                }
                                                            }}
                                                            className={`menu-item group cursor-pointer ${selectedSubMenu === 'Commissions' ? 'menu-item-active' : 'menu-item-inactive'} `}
                                                        >


                                                            <span
                                                                className={`menu-item-text ${sidebarToggle ? 'lg:hidden' : ''}`}
                                                            >
                                                                Commissions
                                                            </span>

                                                            <svg
                                                                className={`menu-item-arrow absolute right-2.5 top-1/2 -translate-y-1/2 stroke-current ${selectedSubMenu === 'Commissions' && 'menu-item-arrow-active'} ${sidebarToggle ? 'lg:hidden' : ''}`}
                                                                width="20"
                                                                height="20"
                                                                viewBox="0 0 20 20"
                                                                fill="none"
                                                                xmlns="http://www.w3.org/2000/svg"
                                                            >
                                                                <path
                                                                    d="M4.79175 7.39584L10.0001 12.6042L15.2084 7.39585"
                                                                    stroke=""
                                                                    strokeWidth="1.5"
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                />
                                                            </svg>
                                                        </a>

                                                        <div
                                                            className={`translate transform overflow-hidden ${selectedSubMenu === 'Commissions' ? 'block' : 'hidden'}`}
                                                        >
                                                            <ul
                                                                className={`menu-dropdown mt-2 flex flex-col gap-1 pl-3 ${sidebarToggle ? 'lg:hidden' : 'flex'} `}
                                                            >
                                                                {can('Supplier Commissions View') && (
                                                                    <li>
                                                                        <Link
                                                                            href={route('dashboard.commissions.supplier-commissions.index')}
                                                                            className={`menu-dropdown-item group ${route().current() === 'dashboard.commissions.supplier-commissions.index' ? 'menu-dropdown-item-active' : 'menu-dropdown-item-inactive'}`}
                                                                        >
                                                                            Supplier Commissions
                                                                        </Link>
                                                                    </li>
                                                                )}


                                                                {can('Collaborator Commissions View') && (
                                                                    <li>
                                                                        <Link
                                                                            href={route('dashboard.commissions.collaborator-commissions.index')}
                                                                            className={`menu-dropdown-item group ${route().current() === 'dashboard.commissions.collaborator-commissions.index' ? 'menu-dropdown-item-active' : 'menu-dropdown-item-inactive'}`}
                                                                        >
                                                                            Collaborator Commissions
                                                                        </Link>
                                                                    </li>
                                                                )}


                                                                {can('Distributor Commissions View') && (
                                                                    <li>
                                                                        <Link
                                                                            href={route('dashboard.commissions.distributor-commissions.index')}
                                                                            className={`menu-dropdown-item group ${route().current() === 'dashboard.commissions.distributor-commissions.index' ? 'menu-dropdown-item-active' : 'menu-dropdown-item-inactive'}`}
                                                                        >
                                                                            Distributor Commissions
                                                                        </Link>
                                                                    </li>
                                                                )}




                                                            </ul>
                                                        </div>
                                                    </li>
                                                )}


                                            </ul>
                                        </div>
                                    </li>
                                )}

                                {/* Partners */}
                                {can(['Suppliers View', 'Collaborators View', 'Distributors View']) && (
                                    <li>
                                        <a
                                            onClick={() => {
                                                if (selected === 'Partners') {
                                                    setSelected(null);
                                                } else {
                                                    setSelected('Partners');
                                                }
                                            }}
                                            className={`menu-item group cursor-pointer ${selected === 'Partners' ? 'menu-item-active' : 'menu-item-inactive'} `}
                                        >


                                            <span
                                                className={`menu-item-text ${sidebarToggle ? 'lg:hidden' : ''}`}
                                            >
                                                Partners
                                            </span>

                                            <svg
                                                className={`menu-item-arrow absolute right-2.5 top-1/2 -translate-y-1/2 stroke-current ${selected === 'Partners' && 'menu-item-arrow-active'} ${sidebarToggle ? 'lg:hidden' : ''}`}
                                                width="20"
                                                height="20"
                                                viewBox="0 0 20 20"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    d="M4.79175 7.39584L10.0001 12.6042L15.2084 7.39585"
                                                    stroke=""
                                                    strokeWidth="1.5"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                        </a>

                                        <div
                                            className={`translate transform overflow-hidden ${selected === 'Partners' ? 'block' : 'hidden'}`}
                                        >
                                            <ul
                                                className={`menu-dropdown mt-2 flex flex-col gap-1 pl-3 ${sidebarToggle ? 'lg:hidden' : 'flex'} `}
                                            >
                                                {can('Suppliers View') && (
                                                    <li>
                                                        <Link
                                                            href={route('dashboard.suppliers.index')}
                                                            className={`menu-dropdown-item group ${route().current() === 'dashboard.suppliers.index' ? 'menu-dropdown-item-active' : 'menu-dropdown-item-inactive'}`}
                                                        >
                                                            Suppliers
                                                        </Link>
                                                    </li>
                                                )}


                                                {can('Collaborators View') && (
                                                    <li>
                                                        <Link
                                                            href={route('dashboard.collaborators.index')}
                                                            className={`menu-dropdown-item group ${route().current() === 'dashboard.collaborators.index' ? 'menu-dropdown-item-active' : 'menu-dropdown-item-inactive'}`}
                                                        >
                                                            Collaborators
                                                        </Link>
                                                    </li>
                                                )}


                                                {can('Distributors View') && (
                                                    <li>
                                                        <Link
                                                            href={route('dashboard.distributors.index')}
                                                            className={`menu-dropdown-item group ${route().current() === 'dashboard.distributors.index' ? 'menu-dropdown-item-active' : 'menu-dropdown-item-inactive'}`}
                                                        >
                                                            Distributors
                                                        </Link>
                                                    </li>
                                                )}




                                            </ul>
                                        </div>
                                    </li>
                                )}

                                {/* Content */}
                                {can(['Posts View', 'Bookmarks View', 'Floors View']) && (
                                    <li>
                                        <a
                                            onClick={() => {
                                                if (selected === 'Content') {
                                                    setSelected(null);
                                                } else {
                                                    setSelected('Content');
                                                }
                                            }}
                                            className={`menu-item group cursor-pointer ${selected === 'Content' ? 'menu-item-active' : 'menu-item-inactive'} `}
                                        >


                                            <span
                                                className={`menu-item-text ${sidebarToggle ? 'lg:hidden' : ''}`}
                                            >
                                                Content
                                            </span>

                                            <svg
                                                className={`menu-item-arrow absolute right-2.5 top-1/2 -translate-y-1/2 stroke-current ${selected === 'Partners' && 'menu-item-arrow-active'} ${sidebarToggle ? 'lg:hidden' : ''}`}
                                                width="20"
                                                height="20"
                                                viewBox="0 0 20 20"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    d="M4.79175 7.39584L10.0001 12.6042L15.2084 7.39585"
                                                    stroke=""
                                                    strokeWidth="1.5"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                        </a>

                                        <div
                                            className={`translate transform overflow-hidden ${selected === 'Content' ? 'block' : 'hidden'}`}
                                        >
                                            <ul
                                                className={`menu-dropdown mt-2 flex flex-col gap-1 pl-3 ${sidebarToggle ? 'lg:hidden' : 'flex'} `}
                                            >
                                                {can('Posts View') && (
                                                    <li>
                                                        <Link
                                                            href={route('dashboard.posts.index')}
                                                            className={`menu-dropdown-item group ${route().current() === 'dashboard.posts.index' ? 'menu-dropdown-item-active' : 'menu-dropdown-item-inactive'}`}
                                                        >
                                                            Posts
                                                        </Link>
                                                    </li>
                                                )}


                                                {can('Floors View') && (
                                                    <li>
                                                        <Link
                                                            href={route('dashboard.floors.index')}
                                                            className={`menu-dropdown-item group ${route().current() === 'dashboard.floors.index' ? 'menu-dropdown-item-active' : 'menu-dropdown-item-inactive'}`}
                                                        >
                                                            Floors
                                                        </Link>
                                                    </li>
                                                )}


                                                {can('Bookmarks View') && (
                                                    <li>
                                                        <Link
                                                            href={route('dashboard.bookmarks.index')}
                                                            className={`menu-dropdown-item group ${route().current() === 'dashboard.bookmarks.index' ? 'menu-dropdown-item-active' : 'menu-dropdown-item-inactive'}`}
                                                        >
                                                            Bookmarks
                                                        </Link>
                                                    </li>
                                                )}




                                            </ul>
                                        </div>
                                    </li>
                                )}

                                {/* System */}
                                {can(['Admin/Staff View', 'Translation System View', 'SystemLogs View', 'Risk Signals View', 'Data Deletion Requests View', 'Unsettled Accounts View']) && (
                                    <li>
                                        <a
                                            onClick={() => {
                                                if (selected === 'System') {
                                                    setSelected(null);
                                                } else {
                                                    setSelected('System');
                                                }
                                            }}
                                            className={`menu-item group cursor-pointer ${selected === 'System' ? 'menu-item-active' : 'menu-item-inactive'} `}
                                        >


                                            <span
                                                className={`menu-item-text ${sidebarToggle ? 'lg:hidden' : ''}`}
                                            >
                                                System
                                            </span>

                                            <svg
                                                className={`menu-item-arrow absolute right-2.5 top-1/2 -translate-y-1/2 stroke-current ${selected === 'System' && 'menu-item-arrow-active'} ${sidebarToggle ? 'lg:hidden' : ''}`}
                                                width="20"
                                                height="20"
                                                viewBox="0 0 20 20"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    d="M4.79175 7.39584L10.0001 12.6042L15.2084 7.39585"
                                                    stroke=""
                                                    strokeWidth="1.5"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                        </a>

                                        <div
                                            className={`translate transform overflow-hidden ${selected === 'System' ? 'block' : 'hidden'}`}
                                        >
                                            <ul
                                                className={`menu-dropdown mt-2 flex flex-col gap-1 pl-3 ${sidebarToggle ? 'lg:hidden' : 'flex'} `}
                                            >


                                                {can('Admin/Staff View') && (
                                                    <li>
                                                        <Link
                                                            href={route('dashboard.users.index')}
                                                            className={`menu-dropdown-item group ${route().current() === 'dashboard.users.index' ? 'menu-dropdown-item-active' : 'menu-dropdown-item-inactive'}`}
                                                        >
                                                            Admin/Staff
                                                        </Link>
                                                    </li>
                                                )}


                                                {can(['Translation System View']) && (
                                                    <li>
                                                        <a
                                                            onClick={() => {
                                                                if (selectedSubMenu === 'Translation System') {
                                                                    setSelectedSubMenu(null);
                                                                } else {
                                                                    setSelectedSubMenu('Translation System');
                                                                }
                                                            }}
                                                            className={`menu-item group cursor-pointer ${selectedSubMenu === 'Translation System' ? 'menu-item-active' : 'menu-item-inactive'} `}
                                                        >


                                                            <span
                                                                className={`menu-item-text ${sidebarToggle ? 'lg:hidden' : ''}`}
                                                            >
                                                                Translation System
                                                            </span>

                                                            <svg
                                                                className={`menu-item-arrow absolute right-2.5 top-1/2 -translate-y-1/2 stroke-current ${selectedSubMenu === 'Translation System' && 'menu-item-arrow-active'} ${sidebarToggle ? 'lg:hidden' : ''}`}
                                                                width="20"
                                                                height="20"
                                                                viewBox="0 0 20 20"
                                                                fill="none"
                                                                xmlns="http://www.w3.org/2000/svg"
                                                            >
                                                                <path
                                                                    d="M4.79175 7.39584L10.0001 12.6042L15.2084 7.39585"
                                                                    stroke=""
                                                                    strokeWidth="1.5"
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                />
                                                            </svg>
                                                        </a>

                                                        <div
                                                            className={`translate transform overflow-hidden ${selectedSubMenu === 'Translation System' ? 'block' : 'hidden'}`}
                                                        >
                                                            <ul
                                                                className={`menu-dropdown mt-2 flex flex-col gap-1 pl-3 ${sidebarToggle ? 'lg:hidden' : 'flex'} `}
                                                            >
                                                                {can('Translation System View') && (
                                                                    <li>
                                                                        <Link
                                                                            href={route('dashboard.translation-system.languages.index')}
                                                                            className={`menu-dropdown-item group ${route().current() === 'dashboard.translation-system.languages.index' ? 'menu-dropdown-item-active' : 'menu-dropdown-item-inactive'}`}
                                                                        >
                                                                            Languages
                                                                        </Link>
                                                                    </li>
                                                                )}


                                                                {can('Translation System View') && (
                                                                    <li>
                                                                        <Link
                                                                            href={route('dashboard.translation-system.translation-keys.index')}
                                                                            className={`menu-dropdown-item group ${route().current() === 'dashboard.translation-system.translation-keys.index' ? 'menu-dropdown-item-active' : 'menu-dropdown-item-inactive'}`}
                                                                        >
                                                                            Translation Keys
                                                                        </Link>
                                                                    </li>
                                                                )}




                                                            </ul>
                                                        </div>
                                                    </li>
                                                )}


                                                {can('Unsettled Accounts View') && (
                                                    <li>
                                                        <Link
                                                            href={route('dashboard.unsettled-accounts.index')}
                                                            className={`menu-dropdown-item group ${route().current() === 'dashboard.unsettled-accounts.index' ? 'menu-dropdown-item-active' : 'menu-dropdown-item-inactive'}`}
                                                        >
                                                            Unsettled Accounts
                                                        </Link>
                                                    </li>
                                                )}

                                                {can('Risk Signals') && (
                                                    <li>
                                                        <Link
                                                            href={route('dashboard.risk-signals.index')}
                                                            className={`menu-dropdown-item group ${route().current() === 'dashboard.risk-signals.index' ? 'menu-dropdown-item-active' : 'menu-dropdown-item-inactive'}`}
                                                        >
                                                            Risk Signals
                                                        </Link>
                                                    </li>
                                                )}


                                                {can('SystemLogs View') && (
                                                    <li>
                                                        <Link
                                                            href={route('dashboard.system-logs.index')}
                                                            className={`menu-dropdown-item group ${route().current() === 'dashboard.system-logs.index' ? 'menu-dropdown-item-active' : 'menu-dropdown-item-inactive'}`}
                                                        >
                                                            System Logs
                                                        </Link>
                                                    </li>
                                                )}


                                                {can('Data Deletion Requests View') && (
                                                    <li>
                                                        <Link
                                                            href={route('dashboard.data-deletion-requests.index')}
                                                            className={`menu-dropdown-item group ${route().current() === 'dashboard.data-deletion-requests.index' ? 'menu-dropdown-item-active' : 'menu-dropdown-item-inactive'}`}
                                                        >
                                                            Data Deletion Requests
                                                        </Link>
                                                    </li>
                                                )}
                                            </ul>
                                        </div>
                                    </li>
                                )}

                                {can(['Settings View', 'Dormancy', 'AWS', 'Google Maps', 'NOWPayments', 'Courier Companies', 'Commission', 'Reward Rate', 'Return Policy', 'Privacy Policy', 'Countries', 'General', 'Role', 'Meta', 'SMTP', 'Storage Locations', 'Currency', 'Additional Fees', 'Unsettled Account Notifications', 'Shipping Policy', 'Terms of Service', 'Special Countries']) && (
                                    <li>
                                        <Link
                                            href={route('dashboard.settings.index')}
                                            className={`menu-item group ${selected === 'Settings' ? 'menu-item-active' : 'menu-item-inactive'}`}
                                        >


                                            <span
                                                className={`menu-item-text ${sidebarToggle ? 'lg:hidden' : ''}`}
                                            >
                                                Settings
                                            </span>

                                            <svg
                                                className={`menu-item-arrow ${sidebarToggle ? 'lg:hidden' : ''}`}
                                                width="20"
                                                height="20"
                                                viewBox="0 0 20 20"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    d="M4.79175 7.39584L10.0001 12.6042L15.2084 7.39585"
                                                    stroke=""
                                                    strokeWidth="1.5"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                        </Link>
                                    </li>
                                )}
                            </ul>
                        </div>
                    </nav>
                </div>
            </aside>
        </>
    );
}
