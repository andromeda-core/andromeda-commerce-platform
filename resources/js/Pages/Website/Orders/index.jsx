import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import MainLayout from '@/Layouts/Website/MainLayout';
import Placeholder from 'asset/assets/images/product/placeholder.jpg';
import Toast from '@/Components/Toast';
import axios from 'axios';

import Spinner from '@/Components/Spinner';
import { useTranslation } from '@/Hooks/useTranslation';

export default function index({ orders, next_page_url }) {
    const { currency } = usePage().props;
    const [allOrders, setAllOrders] = useState(orders || []);
    const nextPageUrlRef = useRef(next_page_url || null);

    const [infoMessage, setInfoMessage] = useState(null);
    const [showInfoMessage, setShowInfoMessage] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    const [showErrorMessage, setShowErrorMessage] = useState(false);
    const [successMessage, setSuccessMessage] = useState(null);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);


    // Translation Hook
    const { __ } = useTranslation();

    const [activeTab, setActiveTab] = useState('all');

    const loaderRef = useRef(null);

    const isfetchingMorePosts = useRef(false);

    const fetchMoreOrders = () => {
        if (!nextPageUrlRef.current) return;

        isfetchingMorePosts.current = true;
        axios
            .get(nextPageUrlRef.current, {
                headers: {
                    Accept: 'application/json',
                },
            })
            .then((response) => {
                const data = response.data;
                setAllOrders((prev) => {
                    const ids = new Set(prev.map((p) => p.id));
                    const newOnes = data.orders.filter((p) => !ids.has(p.id));
                    return [...prev, ...newOnes];
                });

                nextPageUrlRef.current = data.next_page_url;
            })
            .catch((error) => {
                setErrorMessage(error.response.data.message || error.message);
                setShowErrorMessage(true);
            })
            .finally(() => {
                isfetchingMorePosts.current = false;
            });
    };

    useEffect(() => {
        const interval = setInterval(() => {
            if (loaderRef.current && nextPageUrlRef.current) {
                const observer = new IntersectionObserver(
                    (entries) => {
                        if (entries[0].isIntersecting && !isfetchingMorePosts.current) {
                            fetchMoreOrders();
                        }
                    },
                    { rootMargin: '200px', threshold: 0.1 },
                );
                observer.observe(loaderRef.current);

                clearInterval(interval);

                return () => {
                    observer.disconnect();
                };
            }
        }, 200);

        return () => clearInterval(interval);
    }, []);

    const filterOrdersByStatus = (status) => {
        if (status === 'all') return allOrders;
        return allOrders.filter((order) => order.status.toLowerCase() === status.toLowerCase());
    };

    const filteredOrders = filterOrdersByStatus(activeTab);


    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);
    const scrollContainerRef = useRef(null);


    // Scroll handlers
    const scrollLeft = useCallback(() => {
        scrollContainerRef.current?.scrollBy({ left: -200, behavior: 'smooth' });
    }, []);

    const scrollRight = useCallback(() => {
        scrollContainerRef.current?.scrollBy({ left: 200, behavior: 'smooth' });
    }, []);




    // Optimized scroll button update with debouncing
    const updateScrollButtons = useCallback(() => {
        if (scrollContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
            const newCanScrollLeft = scrollLeft > 0;
            const newCanScrollRight = scrollLeft < scrollWidth - clientWidth - 20;

            // Only update if values changed
            if (newCanScrollLeft !== canScrollLeft || newCanScrollRight !== canScrollRight) {

                setCanScrollLeft(newCanScrollLeft);
                setCanScrollRight(newCanScrollRight);
            }
        }
    }, [canScrollLeft, canScrollRight]);


    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const raf = requestAnimationFrame(() => {
            updateScrollButtons();
        });

        container.addEventListener('scroll', updateScrollButtons);
        window.addEventListener('resize', updateScrollButtons);

        return () => {
            cancelAnimationFrame(raf);
            container.removeEventListener('scroll', updateScrollButtons);
            window.removeEventListener('resize', updateScrollButtons);
        };
    }, [updateScrollButtons, orders.length]);



    return (
        <MainLayout>
            <Head title={__("Orders", true)} />

            {(showInfoMessage || showErrorMessage || showSuccessMessage) && (
                <Toast
                    flash={{
                        ...(showInfoMessage
                            ? { info: infoMessage }
                            : showErrorMessage
                                ? { error: errorMessage }
                                : { success: successMessage }),
                    }}
                    onClosed={(type) => {
                        if (type === 'info') {
                            setInfoMessage(null);
                            setShowInfoMessage(false);
                        }
                        if (type === 'error') {
                            setErrorMessage(null);
                            setShowErrorMessage(false);
                        }
                        if (type === 'success') {
                            setSuccessMessage(null);
                            setShowSuccessMessage(false);
                        }
                    }}
                />
            )}
            <div className="min-h-screen pb-20 my-0 lg:my-3">

                <div className="w-full px-4 mx-auto overflow-x-hidden text-black max-w-7xl sm:px-8 dark:text-main-text-dark">


                    <div className="w-full mt-6 mb-4">
                        <div className="relative grid w-full grid-cols-1 overflow-hidden">

                            <div className="relative flex items-center w-full">
                                {/* Left Arrow */}
                                {canScrollLeft && (
                                    <button
                                        onClick={scrollLeft}
                                        className="absolute left-0 z-20 flex items-center justify-center flex-shrink-0 p-2 transition-all duration-200 rounded-full bg-surface-1-light hover:scale-110 hover:bg-surface-1-light dark:bg-surface-3-dark dark:hover:bg-surface-3-dark md:flex"
                                        style={{ left: '0px' }}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="text-sub-text-light size-4 dark:text-sub-text-dark"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
                                    </button>
                                )}


                                <div
                                    ref={scrollContainerRef}
                                    className="flex items-center w-full gap-3 overflow-x-auto flex-nowrap scrollbar-none scroll-smooth"
                                    style={{
                                        transform: 'translateZ(0)',
                                        WebkitOverflowScrolling: 'touch',
                                        scrollbarWidth: 'none',
                                        msOverflowStyle: 'none',
                                        maxWidth: '100%',
                                        display: 'flex'
                                    }}
                                >


                                    {/* Status Tabs */}
                                    {orders.length > 0 && (
                                        <>
                                            <TabButton
                                                label={__('All')}
                                                count={orders.length}
                                                active={activeTab === 'all'}
                                                onClick={() => setActiveTab('all')}
                                            />
                                            <TabButton
                                                label={__('Pending')}
                                                count={filterOrdersByStatus('pending').length}
                                                active={activeTab === 'pending'}
                                                onClick={() => setActiveTab('pending')}
                                            />

                                            <TabButton
                                                label={__('Awaiting Payment')}
                                                count={filterOrdersByStatus('awaiting_payment').length}
                                                active={activeTab === 'awaiting_payment'}
                                                onClick={() => setActiveTab('awaiting_payment')}
                                            />

                                            <TabButton
                                                label={__('Paid')}
                                                count={filterOrdersByStatus('paid').length}
                                                active={activeTab === 'paid'}
                                                onClick={() => setActiveTab('paid')}
                                            />
                                            <TabButton
                                                label={__('Shipped')}
                                                count={filterOrdersByStatus('shipped').length}
                                                active={activeTab === 'shipped'}
                                                onClick={() => setActiveTab('shipped')}
                                            />
                                            <TabButton
                                                label={__('Delivered')}
                                                count={filterOrdersByStatus('delivered').length}
                                                active={activeTab === 'delivered'}
                                                onClick={() => setActiveTab('delivered')}
                                            />
                                            <TabButton
                                                label={__('Arrived Locally')}
                                                count={filterOrdersByStatus('arrived_locally').length}
                                                active={activeTab === 'arrived_locally'}
                                                onClick={() => setActiveTab('arrived_locally')}
                                            />

                                            <TabButton
                                                label={__('Failed')}
                                                count={filterOrdersByStatus('failed').length}
                                                active={activeTab === 'failed'}
                                                onClick={() => setActiveTab('failed')}
                                            />
                                            <TabButton
                                                label={__('Expired')}
                                                count={filterOrdersByStatus('expired').length}
                                                active={activeTab === 'expired'}
                                                onClick={() => setActiveTab('expired')}
                                            />
                                        </>
                                    )}

                                </div>

                                {/* Right Arrow */}
                                {canScrollRight && (
                                    <button
                                        onClick={scrollRight}
                                        className="absolute right-0 z-20 flex items-center justify-center flex-shrink-0 p-2 transition-all duration-200 rounded-full bg-surface-1-light hover:scale-110 hover:bg-surface-1-light dark:bg-surface-3-dark dark:hover:bg-surface-3-dark md:flex"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="text-sub-text-light size-4 dark:text-sub-text-dark"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                                    </button>
                                )}


                            </div>
                        </div>
                    </div>


                    {/* Orders Grid */}
                    <div className="px-4 mt-10 sm:px-0">
                        {filteredOrders.length === 0 ? (
                            <EmptyOrders __={__} />
                        ) : (
                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                {filteredOrders.map((order) => (
                                    <OrderCard key={order.id} order={order} currency={currency} __={__} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Loader */}
            {nextPageUrlRef.current && (
                <div
                    ref={loaderRef}
                    className="flex items-center justify-center gap-2 py-10 text-center transition-all duration-100 text-main-text-light animate-pulse dark:text-main-text-dark"
                >
                    <Spinner />
                    {__('Loading More')}...
                </div>
            )}
        </MainLayout>
    );
}

// Tab Button Component
function TabButton({ label, count, active, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`flex flex-shrink-0 items-center gap-2 whitespace-nowrap
        border-b-2 px-5 py-3.5 text-sm font-semibold transition-all
        ${active
                    ? 'border-surface-3-light text-main-text-light dark:text-main-text-dark dark:border-surface-3-dark'
                    : 'border-transparent text-main-text-light hover:border-surface-3-light dark:text-main-text-dark dark:hover:border-surface-3-dark'
                }`}
        >
            <span className='text-main-text-light dark:text-main-text-dark'>{label}</span>
            {count > 0 && (
                <span
                    className={`flex h-6 min-w-[24px] items-center justify-center rounded-full px-2 text-xs font-bold ${active
                        ? 'bg-main-text-light text-main-text-dark dark:bg-main-text-dark dark:text-main-text-light'
                        : 'bg-main-text-light/80 text-main-text-dark dark:bg-main-text-dark/80 dark:text-main-text-light'
                        }`}
                >
                    {count}
                </span>
            )}
        </button>
    );
}

// Order Card Component
function OrderCard({ order, currency, __ }) {
    const getStatusColor = (status) => {
        const statusLower = status.toLowerCase();
        switch (statusLower) {
            case __('pending'):
                return 'bg-yellow-500 text-main-text-dark';
            case __('paid'):
                return 'bg-blue-500 text-main-text-dark';
            case __('shipped'):
                return 'bg-pink-500 text-main-text-dark';
            case __('delivered'):
                return 'bg-green-500 text-main-text-dark';
            case __('arrived_locally'):
                return 'bg-stone-500 text-main-text-dark';
            case __('failed'):
                return 'bg-red-500 text-main-text-dark';
            case __('expired'):
                return 'bg-gray-500 text-main-text-dark';
            case __('awaiting_payment'):
                return 'bg-indigo-500 text-main-text-dark';

            case __('blockchain_confirmation_pending'):
                return 'bg-indigo-500 text-main-text-dark';

            default:
                return 'bg-gray-100 text-main-text-light dark:bg-gray-900/30 dark:text-main-text-dark';
        }
    };

    const displayImages = order.order_items?.slice(0, 4) || [];
    const remainingCount = (order.order_items?.length || 0) - 4;

    return (
        <>
            <Link
                href={route('website.orders.order-view', order.order_no)}
                className="relative block overflow-hidden transition-all border rounded-md border-surface-3-light bg-surface-1-light group dark:border-surface-3-dark dark:bg-surface-1-dark"
            >
                {!order.payment_proof &&
                    order.status === 'pending' &&
                    order.payment_method === 'bank_transfer' && (
                        <div className="px-4 py-3 border-b border-red-200 rounded-t-2xl bg-gradient-to-r from-red-50 to-orange-50 dark:border-red-900/30 dark:from-red-900/20 dark:to-orange-900/20">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center flex-shrink-0 w-6 h-6 bg-red-500 rounded-full">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={2}
                                        stroke="currentColor"
                                        className="w-4 h-4 text-white"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                                        />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs font-semibold tracking-wide text-red-900 uppercase dark:text-red-100">
                                        {__('Payment Proof Required')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                {/* Payment Proof Pending Approval Alert */}
                {order.payment_proof &&
                    order.status === 'pending' &&
                    order.payment_method === 'bank_transfer' && (
                        <div className="px-4 py-3 border-b rounded-t-2xl border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 dark:border-amber-900/30 dark:from-amber-900/20 dark:to-yellow-900/20">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center flex-shrink-0 w-6 h-6 rounded-full bg-amber-500">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={2}
                                        stroke="currentColor"
                                        className="w-4 h-4 text-white"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs font-semibold tracking-wide uppercase text-amber-900 dark:text-amber-100">
                                        {__('Awaiting Payment Approval')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                {/* Order Header */}
                <div className="p-5 border-b border-surface-3-light bg-surface-1-light dark:border-surface-3-dark dark:bg-surface-1-dark">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-3 mb-2">
                                <h3 className="text-lg font-semibold text-main-text-light dark:text-main-text-dark">
                                    #{order.order_no}
                                </h3>
                                <span
                                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase ${getStatusColor(order.status)}`}
                                >
                                    {order.status.replace(/_/g, ' ')}
                                </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-sub-text-light dark:text-sub-text-dark">
                                <span className="flex items-center gap-1.5">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={2}
                                        stroke="currentColor"
                                        className="w-4 h-4"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                                        />
                                    </svg>
                                    {order.order_placed_date}
                                </span>
                                <span className="flex items-center gap-1.5 font-medium">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={2}
                                        stroke="currentColor"
                                        className="w-4 h-4"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                                        />
                                    </svg>
                                    {order.order_items_count}{' '}
                                    {order.order_items_count === 1 ? __('Item') : __('Items')}
                                </span>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-black dark:text-sub-text-dark">{__('Total')}</p>
                            <p className="text-xl font-semibold text-sub-text-light dark:text-sub-text-dark">
                                {currency?.symbol}
                                {parseFloat(order.amount).toFixed(2)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Product Images Grid */}
                <div className="p-5">
                    <div className="grid grid-cols-4 gap-3 mb-4">
                        {displayImages.map((item) => (
                            <div
                                key={item.id}
                                className="relative overflow-hidden transition-all border-2 rounded-md border-trasparent bg-surface-1-light group/img aspect-square dark:bg-surface-1-dark dark:hover:border-surface-3-dark"
                            >
                                <img
                                    src={
                                        item?.smartphone?.smartphone_image_urls?.[0] || Placeholder
                                    }
                                    alt={item?.smartphone?.model_name?.name || 'Product'}
                                    className="object-cover w-full h-full transition-transform duration-300 group-hover/img:scale-110"
                                    loading="lazy"
                                    onError={(e) => (e.target.src = Placeholder)}
                                />
                                {item.quantity > 1 && (
                                    <div className="absolute flex items-center justify-center w-6 h-6 text-xs font-semibold rounded-full shadow-lg text-main-text-light bg-surface-3-light dark:text-main-text-dark dark:bg-surface-3-dark right-2 top-2">
                                        {item.quantity}
                                    </div>
                                )}
                            </div>
                        ))}

                        {remainingCount > 0 && (
                            <div className="flex items-center justify-center border-2 border-dashed rounded-md border-surface-3-light bg-surface-1-light aspect-square dark:border-surface-3-dark dark:bg-surface-1-dark">
                                <span className="text-sm font-semibold text-center text-sub-text-light dark:text-sub-text-dark">
                                    +{remainingCount}
                                    <br />
                                    <span className="text-xs font-normal">{__('More')}</span>
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Payment Method Badge */}
                    <div className="flex items-center justify-center gap-2 py-3 mb-4 border rounded-md bg-surface-1-light border-surface-3-light dark:bg-surface-2-dark dark:border-surface-3-dark ">
                        {order.payment_method === 'crypto' ? (
                            <>
                                <div className="flex items-center justify-center bg-orange-500 rounded-full h-7 w-7">
                                    <svg
                                        className="w-6 h-6 text-main-text-light dark:text-main-text-dark"
                                        viewBox="0.004 0 64 64"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                    >
                                        <path
                                            d="M46.11 27.441c.636-4.258-2.606-6.547-7.039-8.074l1.438-5.768-3.512-.875-1.4 5.616c-.922-.23-1.87-.447-2.812-.662l1.41-5.653-3.509-.875-1.439 5.766c-.764-.174-1.514-.346-2.242-.527l.004-.018-4.842-1.209-.934 3.75s2.605.597 2.55.634c1.422.355 1.68 1.296 1.636 2.042l-1.638 6.571c.098.025.225.061.365.117l-.37-.092-2.297 9.205c-.174.432-.615 1.08-1.609.834.035.051-2.552-.637-2.552-.637l-1.743 4.02 4.57 1.139c.85.213 1.683.436 2.502.646l-1.453 5.835 3.507.875 1.44-5.772c.957.26 1.887.5 2.797.726L27.504 50.8l3.511.875 1.453-5.823c5.987 1.133 10.49.676 12.383-4.738 1.527-4.36-.075-6.875-3.225-8.516 2.294-.531 4.022-2.04 4.483-5.157zM38.087 38.69c-1.086 4.36-8.426 2.004-10.807 1.412l1.928-7.729c2.38.594 10.011 1.77 8.88 6.317zm1.085-11.312c-.99 3.966-7.1 1.951-9.083 1.457l1.748-7.01c1.983.494 8.367 1.416 7.335 5.553z"
                                            fill="#ffffff"
                                        />
                                    </svg>
                                </div>
                                <span className="text-sm font-semibold text-main-text-light dark:text-main-text-dark">
                                    {__('Crypto Payment')}
                                </span>
                            </>
                        ) : order.payment_method === 'points' ? (
                            <>
                                <div className="flex items-center justify-center rounded-full h-7 w-7">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={1.5}
                                        stroke="currentColor"
                                        className="w-6 h-6 text-main-text-light dark:text-main-text-dark"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M21 11.25v8.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1 0 9.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1 1 14.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z"
                                        />
                                    </svg>
                                </div>
                                <span className="text-sm font-semibold text-main-text-light dark:text-main-text-dark">
                                    {__('Points Payment')}
                                </span>
                            </>
                        ) : (
                            <>
                                <div className="flex items-center justify-center rounded-full h-7 w-7">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={2}
                                        stroke="currentColor"
                                        className="w-6 h-6 text-main-text-light dark:text-main-text-dark"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z"
                                        />
                                    </svg>
                                </div>
                                <span className="text-sm font-semibold text-main-text-light dark:text-main-text-dark">
                                    {__('Bank Transfer')}
                                </span>
                            </>
                        )}
                    </div>

                    {/* View Order Button */}
                    <button className="flex items-center justify-center w-full gap-2 px-4 py-3 font-semibold transition-all rounded-md bg-main-text-light text-md text-main-text-dark dark:text-main-text-light dark:bg-main-text-dark hover:bg-main-text-light/80 dark:hover:bg-main-text-dark/80 ">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="w-4 h-4"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                            />
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                        </svg>
                        {__('View Details')}
                    </button>
                </div>
            </Link>
        </>
    );
}

// Empty Orders Component
function EmptyOrders({ __ }) {


    return (
        <div className="flex min-h-[50vh] items-center justify-center px-6">
            <div className="text-center">
                <h3 className="text-[22px] font-semibold tracking-tight text-main-text-light dark:text-main-text-dark">
                    {__('No orders yet')}
                </h3>

                <p className="max-w-xs mt-2 mb-8 text-sm leading-relaxed text-sub-text-light dark:text-sub-text-dark">
                    {__('Start shopping to see your orders here')}
                </p>

                <Link
                    href={route('home')}
                    className="inline-flex items-center justify-center rounded-md bg-main-text-light px-10 py-2.5 text-md font-semibold dark:text-main-text-light  text-main-text-dark transition-colors hover:bg-main-text-light/80 dark:bg-main-text-dark dark:text-main-text  dark:hover:bg-main-text-dark/80"
                >
                    {__('Start shopping')}
                </Link>
            </div>
        </div>
    );
}
