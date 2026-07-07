import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import MainLayout from '@/Layouts/Website/MainLayout';
import Placeholder from 'asset/assets/images/product/placeholder.jpg';
import Toast from '@/Components/Toast';
import axios from 'axios';
import Spinner from '@/Components/Spinner';
import { useTranslation } from '@/Hooks/useTranslation';
import { Copy } from 'lucide-react';
import LinkCopiedModal from '@/Components/LinkCopiedModal';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import utc from 'dayjs/plugin/utc';
import { useConfirm } from '@/Hooks/useConfirm';
import { trackPixelEvent, buildEventId, isPaidOrLaterOrderStatus } from '@/Helpers/metaPixel';

dayjs.extend(duration);
dayjs.extend(utc);

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
    const [linkCopied, setLinkCopied] = useState(false);

    // Translation Hook
    const { __ } = useTranslation();

    const [activeTab, setActiveTab] = useState('to_pay');

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
        setAllOrders(orders || []);
    }, [orders]);

    // Meta Pixel Purchase — fires per-order for entries whose real status is 'paid' OR any status
    // only reachable after having been paid (see PAID_OR_LATER_ORDER_STATUSES), so an order first
    // seen in this list after it already progressed past 'paid' still fires. Watches the full
    // accumulated allOrders (not just the initial `orders` prop) so infinite-scroll load-more pages
    // are covered too. Same localStorage key format as Orders/show.jsx so neither location
    // double-fires for the same order. Mirrors the identical fix already applied to
    // Reservations/index.jsx for Schedule.
    useEffect(() => {
        (allOrders || []).forEach((order) => {
            if (!isPaidOrLaterOrderStatus(order?.status)) return;

            const firedKey = `meta_purchase_fired_${order.order_no}`;
            if (localStorage.getItem(firedKey)) return;

            const eventId = buildEventId('Purchase', order.order_no);
            trackPixelEvent(
                'Purchase',
                {
                    order_id: order.order_no,
                    content_ids: (order.order_items || [])
                        .map((item) => item.smartphone?.public_id)
                        .filter(Boolean),
                    content_type: 'product',
                    content_category: 'smartphone',
                    value: Number(order.full_amount || 0),
                    currency: currency?.name,
                    num_items: (order.order_items || []).reduce(
                        (sum, item) => sum + Number(item.quantity || 0),
                        0,
                    ),
                },
                eventId,
            );

            localStorage.setItem(firedKey, '1');
        });
    }, [allOrders]);

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
        if (status === 'all') {
            return allOrders;
        }

        if (status === 'to_pay') {
            const toPayStatuses = ['awaiting_payment', 'pending', 'failed'];

            return allOrders.filter((order) => toPayStatuses.includes(order.status.toLowerCase()));
        }

        if (status === 'in_progress') {
            const toPayStatuses = [
                'paid',
                'shipped',
                'blockchain_confirmation_pending',
                'arrived_locally',
                'refund_requested',
                'refund_approved',
            ];

            return allOrders.filter((order) => toPayStatuses.includes(order.status.toLowerCase()));
        }

        if (status === 'order_history') {
            const orderHistoryStatuses = ['delivered'];

            return allOrders.filter((order) =>
                orderHistoryStatuses.includes(order.status.toLowerCase()),
            );
        }

        if (status === 'canceled') {
            const cancelStatuses = ['expired', 'canceled'];

            return allOrders.filter((order) => cancelStatuses.includes(order.status.toLowerCase()));
        }

        if (status === 'refund_completed') {
            const refundStatuses = ['refund_completed'];

            return allOrders.filter((order) => refundStatuses.includes(order.status.toLowerCase()));
        }

        return [];
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
            <Head title={__('Orders', true)} />

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
                <div className="w-full mx-auto overflow-x-hidden text-black max-w-7xl dark:text-main-text-dark sm:px-8">
                    <div className="px-4 mt-2 sm:px-0">
                        <div className="w-full mt-3 mb-4">
                            <div className="relative grid w-full grid-cols-1 overflow-hidden">
                                <div className="relative flex items-center w-full">
                                    {/* Left Arrow */}
                                    {canScrollLeft && (
                                        <button
                                            onClick={scrollLeft}
                                            className="absolute left-0 z-20 flex items-center justify-center flex-shrink-0 p-2 transition-all duration-200 rounded-full bg-surface-1-light hover:scale-110 hover:bg-surface-1-light dark:bg-surface-3-dark dark:hover:bg-surface-3-dark md:flex"
                                            style={{ left: '0px' }}
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth={2}
                                                stroke="currentColor"
                                                className="size-4 text-sub-text-light dark:text-sub-text-dark"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M15.75 19.5L8.25 12l7.5-7.5"
                                                />
                                            </svg>
                                        </button>
                                    )}

                                    <div
                                        ref={scrollContainerRef}
                                        className="flex items-center w-full overflow-x-auto flex-nowrap gap-7 scroll-smooth scrollbar-none"
                                        style={{
                                            transform: 'translateZ(0)',
                                            WebkitOverflowScrolling: 'touch',
                                            scrollbarWidth: 'none',
                                            msOverflowStyle: 'none',
                                            maxWidth: '100%',
                                            display: 'flex',
                                        }}
                                    >
                                        {/* Status Tabs */}
                                        {orders.length > 0 && (
                                            <>
                                                <TabButton
                                                    label={__('To Pay')}
                                                    count={
                                                        filterOrdersByStatus('to_pay').length || 0
                                                    }
                                                    active={activeTab === 'to_pay'}
                                                    onClick={() => setActiveTab('to_pay')}
                                                />
                                                <TabButton
                                                    label={__('In Progress')}
                                                    count={
                                                        filterOrdersByStatus('in_progress')
                                                            .length || 0
                                                    }
                                                    active={activeTab === 'in_progress'}
                                                    onClick={() => setActiveTab('in_progress')}
                                                />

                                                <TabButton
                                                    label={__('Order History')}
                                                    count={
                                                        filterOrdersByStatus('order_history')
                                                            .length || 0
                                                    }
                                                    active={activeTab === 'order_history'}
                                                    onClick={() => setActiveTab('order_history')}
                                                />

                                                <TabButton
                                                    label={__('Canceled')}
                                                    count={
                                                        filterOrdersByStatus('canceled').length || 0
                                                    }
                                                    active={activeTab === 'canceled'}
                                                    onClick={() => setActiveTab('canceled')}
                                                />

                                                <TabButton
                                                    label={__('Refunded')}
                                                    count={
                                                        filterOrdersByStatus('refund_completed')
                                                            .length || 0
                                                    }
                                                    active={activeTab === 'refund_completed'}
                                                    onClick={() => setActiveTab('refund_completed')}
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
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth={2}
                                                stroke="currentColor"
                                                className="size-4 text-sub-text-light dark:text-sub-text-dark"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M8.25 4.5l7.5 7.5-7.5 7.5"
                                                />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                        {filteredOrders.length === 0 ? (
                            <EmptyOrders __={__} />
                        ) : (
                            <div className="grid grid-cols-1 gap-4 lg:grid-cols-1">
                                {filteredOrders.map((order) => (
                                    <OrderCard
                                        key={order.id}
                                        order={order}
                                        currency={currency}
                                        __={__}
                                        setLinkCopied={setLinkCopied}
                                    />
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
                    className="flex items-center justify-center gap-2 py-10 text-center transition-all duration-100 animate-pulse text-main-text-light dark:text-main-text-dark"
                >
                    <Spinner />
                    {__('Loading More')}...
                </div>
            )}

            <LinkCopiedModal
                linkCopied={linkCopied}
                setLinkCopied={setLinkCopied}
                message={__('Order No Copied')}
            />
        </MainLayout>
    );
}

// Tab Button Component
function TabButton({ label, count, active, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`flex flex-shrink-0 items-center gap-2 whitespace-nowrap border-b-[3px] py-3.5 pl-1 text-sm font-semibold transition-all ${
                active
                    ? 'border-main-text-light text-main-text-light dark:border-main-text-dark dark:text-main-text-dark'
                    : 'border-transparent text-main-text-light dark:text-main-text-dark hover:lg:border-main-text-light dark:lg:hover:border-main-text-dark'
            }`}
        >
            <span className="text-[24px] font-semibold text-main-text-light dark:text-main-text-dark">
                {label} {count > 0 ? `(${count})` : ''}
            </span>
        </button>
    );
}

// Order Card Component
function OrderCard({ order, currency, __, setLinkCopied }) {
    const firstProduct = order.order_items?.[0];
    const productImage =
        firstProduct?.smartphone?.smartphone_image_urls?.[0] ||
        firstProduct?.smartphone?.smartphone_video_urls?.[0]?.thumbnail_url;

    const { data, setData, processing, post } = useForm({
        order_id: order?.id,
    });

    const { confirm, ConfirmDialog } = useConfirm();

    const [isWithdrawlProcessing, setIsWithdrawlProcessing] = useState(false);
    const [reOrderProcessing, setReOrderProcessing] = useState(false);

    const handlePayNow = () => {
        post(route('website.orders.pay-now'), {
            preserveScroll: true,
            onSuccess: () => {},
            onError: () => {},
            onFinish: () => {},
        });
    };

    const handleWithdrawlCancelationRequest = async (orderNo) => {
        const result = await confirm({
            title: __('Confirm Cancelation Request Withdraw'),
            text: __('Are you sure you want to withdraw this Cancelation request?'),
            icon: 'info',
            showCancelButton: true,
            confirmButtonText: __('Yes'),
            cancelButtonText: __('No'),
        });

        if (result.isConfirmed) {
            setIsWithdrawlProcessing(true);
            router.post(
                route('website.order-cancelation.withdrawl'),
                { order_no: orderNo },
                { onFinish: () => setIsWithdrawlProcessing(false) },
            );
        }
    };

    const handleWithdrawlAddressChangeRequest = async (orderNo) => {
        const result = await confirm({
            title: __('Confirm Address Change Request Withdraw'),
            text: __('Are you sure you want to withdraw this Address Change Request?'),
            icon: 'info',
            showCancelButton: true,
            confirmButtonText: __('Yes'),
            cancelButtonText: __('No'),
        });

        if (result.isConfirmed) {
            setIsWithdrawlProcessing(true);
            router.post(
                route('website.orders.address-change.withdrawl'),
                { order_no: orderNo },
                { onFinish: () => setIsWithdrawlProcessing(false) },
            );
        }
    };

    const handleWithdrawlRefundRequest = async (orderNo) => {
        const result = await confirm({
            title: __('Confirm Refund Request Withdraw'),
            text: __(
                'Are you sure you want to withdraw this Refund Request You wont Be Able to Request Again',
            ),
            icon: 'info',
            showCancelButton: true,
            confirmButtonText: __('Yes'),
            cancelButtonText: __('No'),
        });

        if (result.isConfirmed) {
            setIsWithdrawlProcessing(true);
            router.post(
                route('website.orders.refund.withdrawl'),
                { order_no: orderNo },
                { onFinish: () => setIsWithdrawlProcessing(false) },
            );
        }
    };

    const generateSmartphoneURL = (smartphone, isDirect = false, isSinglePage = false) => {
        return `/product/${encodeURIComponent(smartphone?.public_id)}/${smartphone?.slug}`; //${isSinglePage ? '&single_page=true' : ''}${isDirect ? '&direct=true' : ''}`;
    };

    const handleReOrder = (orderNo) => {
        setReOrderProcessing(true);
        router.post(
            route('website.orders.re-order'),
            { order_no: orderNo },
            { onFinish: () => setReOrderProcessing(false) },
        );
    };

    const getRemainingTime = (expiresAt) => {
        if (!expiresAt) return null;

        const now = dayjs();
        const expiry = dayjs.utc(expiresAt);

        if (expiry.isBefore(now)) {
           return __('a few moments',true);
        }

        const diffMs = expiry.diff(now);
        const d = dayjs.duration(diffMs);

        const hours = Math.floor(d.asHours());
        const minutes = d.minutes();

        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }

        return `${minutes}m`;
    };

    const remainingTime = getRemainingTime(order?.expires_at);
    const shouldShowRefundButton = () => {
        if (!order?.is_delivery_confirmed) return true;

        if (!order?.refund_expires_at) return true;

        const expiresAt = dayjs.utc(order.refund_expires_at);
        if (!expiresAt.isValid()) return true;

        return dayjs().isBefore(expiresAt);
    };

    return (
        <>
            <ConfirmDialog />

            <div className="overflow-hidden transition-all bg-white border rounded-md border-surface-3-light dark:border-surface-3-dark dark:bg-surface-1-dark">
                {/* Header Section */}
                <div className="flex flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-6">
                    {/* Status and Expiry */}
                    <div className="flex flex-col gap-1 md:flex-row md:items-center md:gap-3">
                        <h3 className="text-[18px] font-semibold text-main-text-light dark:text-main-text-dark">
                            {__(order.status.replace(/_/g, ' ').toUpperCase(), true)}{' '}
                            {order?.is_purchase_confirmed
                                ? `(${__('Purchase Confirmed')}) `
                                : order?.is_delivery_confirmed
                                  ? `(${__('Delivery Confirmed')}) `
                                  : ''}
                        </h3>
                        {['awaiting_payment', 'pending'].includes(order.status.toLowerCase()) &&
                            order?.payment_proof === null && (
                                <span className="text-[14px] font-semibold text-[#ff0000]">
                                    {remainingTime &&
                                        (remainingTime === 'Expired'
                                            ? __('Expired', true)
                                            : `${__('Expires in', true)} ${remainingTime}`)}
                                </span>
                            )}
                    </div>

                    {/* Order Info */}
                    <div className="flex flex-col gap-2 text-sm text-sub-text-light dark:text-sub-text-dark md:flex-row md:items-center md:gap-4">
                        <span className="flex items-center gap-1">
                            {__('Order date')}:{' '}
                            <span className="text-[14px] font-medium text-main-text-light dark:text-main-text-dark">
                                {' '}
                                {order.order_placed_date}
                            </span>
                        </span>
                        <span className="hidden text-gray-400 dark:text-gray-500 md:inline">/</span>
                        <div className="flex items-center gap-2">
                            <span className="flex items-center gap-1">
                                {__('Order ID')}:{' '}
                                <span className="text-[14px] font-medium text-main-text-light dark:text-main-text-dark">
                                    {' '}
                                    {order.order_no}
                                </span>
                                <button
                                    className="font-semibold text-main-text-light dark:text-main-text-dark lg:hover:text-main-text-light/80 dark:lg:hover:text-main-text-dark/80"
                                    onClick={() => {
                                        navigator.clipboard.writeText(order.order_no);
                                        setLinkCopied(true);
                                    }}
                                >
                                    <Copy className="size-3" />
                                </button>
                            </span>
                        </div>

                        <Link
                            href={route('website.orders.order-view', order.order_no)}
                            className="text[14px] flex items-center gap-1 font-semibold text-main-text-light dark:text-main-text-dark lg:ml-5 lg:hover:text-main-text-light/80 dark:lg:hover:text-main-text-dark/80"
                        >
                            <span>{__('Order details')}</span>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2}
                                stroke="currentColor"
                                className="w-3 h-3"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M8.25 4.5l7.5 7.5-7.5 7.5"
                                />
                            </svg>
                        </Link>
                    </div>
                </div>

                <div className="m-auto max-w-[calc(100%-32px)] border-t border-surface-3-light dark:border-surface-3-dark"></div>

                {/* Content Section */}
                <div className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:gap-6 md:p-6">
                    {/* Product Image and Details Container */}
                    <div className="flex flex-1 gap-4">
                        {/* Product Image */}
                        {productImage && (
                            <div className="flex-shrink-0">
                                <div
                                    className="relative w-20 h-20 overflow-hidden transition-all duration-300 border rounded-md cursor-pointer border-surface-3-light dark:border-surface-3-dark md:h-28 md:w-28 lg:hover:scale-105"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        router.get(
                                            route('home') +
                                                generateSmartphoneURL(
                                                    firstProduct?.smartphone,
                                                    true,
                                                    true,
                                                ),
                                        );
                                    }}
                                >
                                    <img
                                        src={productImage}
                                        alt={
                                            firstProduct?.smartphone?.model_name?.name || 'Product'
                                        }
                                        className="object-cover w-full h-full"
                                        onError={(e) => (e.target.src = Placeholder)}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Product Details */}
                        <div className="flex-1">
                            <h4 className="mb-1 text-[16px] font-semibold text-main-text-light dark:text-main-text-dark">
                                {firstProduct?.smartphone?.model_name?.name ||
                                    __('Product Name Here')}
                            </h4>
                            <p className="mb-1 text-[14px] text-sub-text-light dark:text-sub-text-dark">
                                {firstProduct?.smartphone?.capacity?.name || '512G'},{' '}
                                {firstProduct?.smartphone?.colors[0]?.name || __('Cosmic Orange')}
                            </p>

                            <p className="text-[17px] font-semibold text-main-text-light dark:text-main-text-dark md:mt-3 lg:mt-10">
                                {__('Total')}: {currency?.name} {currency?.symbol}
                                {Number(order.full_amount).toLocaleString('en-US')}
                            </p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col flex-shrink-0 gap-2 md:gap-3">
                        {order.status.toLowerCase() === 'awaiting_payment' && (
                            <>
                                {!order?.is_cancelation_requested ? (
                                    <button
                                        onClick={() =>
                                            router.visit(
                                                route('website.order-cancelation.index', {
                                                    order_no: order.order_no,
                                                }),
                                            )
                                        }
                                        className="text-md flex h-[50px] w-full items-center justify-center gap-2 rounded-md border border-surface-3-light bg-[#f7f7f7] text-[16px] font-semibold text-main-text-light transition-all dark:border-surface-3-dark dark:bg-main-text-dark dark:text-main-text-light lg:w-[210px] lg:hover:bg-[#c8c8c8] dark:lg:hover:bg-main-text-dark/80"
                                    >
                                        {__('Cancel Order')}
                                    </button>
                                ) : (
                                    <button
                                        onClick={() =>
                                            handleWithdrawlCancelationRequest(order?.order_no)
                                        }
                                        className="flex h-[50px] w-full items-center justify-center gap-2 rounded-md border border-surface-3-light bg-[#f7f7f7] text-[16px] text-sm font-semibold text-main-text-light transition-all dark:border-surface-3-dark dark:bg-main-text-dark dark:text-main-text-light lg:w-[210px] lg:hover:bg-[#c8c8c8] dark:lg:hover:bg-main-text-dark/80"
                                    >
                                        {!isWithdrawlProcessing ? (
                                            <span>
                                                {__('Cancelation')}:{' '}
                                                {__(
                                                    order.cancelation_request_status
                                                        .replace(/_/g, ' ')
                                                        .toUpperCase(),
                                                    true,
                                                )}
                                            </span>
                                        ) : (
                                            <Spinner />
                                        )}
                                    </button>
                                )}

                                {order?.is_cancelation_requested &&
                                order?.cancelation_request_status !== 'rejected' ? null : (
                                    <button
                                        onClick={() => handlePayNow()}
                                        className="text-md flex h-[50px] w-full items-center justify-center gap-2 rounded-md bg-[#282828] text-[16px] font-semibold text-main-text-dark transition-all dark:bg-main-text-dark dark:text-main-text-light lg:w-[210px] lg:hover:bg-[#282828]/80 dark:lg:hover:bg-main-text-dark/80"
                                    >
                                        {!processing ? <span>{__('Pay Now')}</span> : <Spinner />}
                                    </button>
                                )}
                            </>
                        )}

                        {order.status.toLowerCase() === 'pending' && (
                            <>
                                {!order?.is_cancelation_requested ? (
                                    <button
                                        onClick={() =>
                                            router.visit(
                                                route('website.order-cancelation.index', {
                                                    order_no: order.order_no,
                                                }),
                                            )
                                        }
                                        className="text-md flex h-[50px] w-full items-center justify-center gap-2 rounded-md border border-surface-3-light bg-[#f7f7f7] text-[16px] font-semibold text-main-text-light transition-all dark:border-surface-3-dark dark:bg-main-text-dark dark:text-main-text-light lg:w-[210px] lg:hover:bg-[#c8c8c8] dark:lg:hover:bg-main-text-dark/80"
                                    >
                                        {__('Cancel Order')}
                                    </button>
                                ) : (
                                    <button
                                        disabled={
                                            order.cancelation_request_status === 'approved' ||
                                            order.cancelation_request_status === 'rejected'
                                        }
                                        onClick={() =>
                                            handleWithdrawlCancelationRequest(order?.order_no)
                                        }
                                        className="flex h-[50px] w-full items-center justify-center gap-2 rounded-md border border-surface-3-light bg-[#f7f7f7] text-[16px] text-sm font-semibold text-main-text-light transition-all dark:border-surface-3-dark dark:bg-main-text-dark dark:text-main-text-light lg:w-[210px] lg:hover:bg-[#c8c8c8] dark:lg:hover:bg-main-text-dark/80"
                                    >
                                        {!isWithdrawlProcessing ? (
                                            <span>
                                                {__('Cancelation')}:{' '}
                                                {__(
                                                    order.cancelation_request_status
                                                        .replace(/_/g, ' ')
                                                        .toUpperCase(),
                                                    true,
                                                )}
                                            </span>
                                        ) : (
                                            <Spinner />
                                        )}
                                    </button>
                                )}

                                {order?.is_cancelation_requested &&
                                order?.cancelation_request_status !== 'rejected' ? null : (
                                    <>
                                        {order?.payment_proof === null ? (
                                            <button
                                                onClick={() => {
                                                    router.visit(
                                                        route(
                                                            'website.orders.order-view',
                                                            order?.order_no,
                                                        ),
                                                    );
                                                }}
                                                className="text-md flex h-[50px] w-full items-center justify-center gap-2 rounded-md bg-[#282828] text-[16px] font-semibold text-main-text-dark transition-all dark:bg-main-text-dark dark:text-main-text-light lg:w-[210px] lg:hover:bg-[#282828]/80 dark:lg:hover:bg-main-text-dark/80"
                                            >
                                                {__('Upload Proof')}
                                            </button>
                                        ) : (
                                            <button
                                                disabled={true}
                                                className="text-md flex h-[50px] w-full items-center justify-center gap-2 rounded-md bg-[#282828] text-[16px] font-semibold text-main-text-dark transition-all dark:bg-main-text-dark dark:text-main-text-light lg:w-[210px] lg:hover:bg-[#282828]/80 dark:lg:hover:bg-main-text-dark/80"
                                            >
                                                {__('Under Admin Review')}
                                            </button>
                                        )}
                                    </>
                                )}
                            </>
                        )}

                        {order.status.toLowerCase() === 'failed' && (
                            <>
                                <button
                                    onClick={() => handleReOrder(order?.order_no)}
                                    className="text-md flex h-[50px] w-full items-center justify-center gap-2 rounded-md bg-[#282828] text-[16px] font-semibold text-main-text-dark transition-all dark:bg-main-text-dark dark:text-main-text-light lg:w-[210px] lg:hover:bg-[#282828]/80 dark:lg:hover:bg-main-text-dark/80"
                                >
                                    {!reOrderProcessing ? (
                                        <span>{__('Reorder')}</span>
                                    ) : (
                                        <Spinner />
                                    )}
                                </button>
                            </>
                        )}

                        {order.status?.toLowerCase() !== 'refund_completed' &&
                            (order.status?.toLowerCase()?.startsWith('refund_')
                                ? order.previous_status?.toLowerCase() === 'paid'
                                : order.status?.toLowerCase() === 'paid') && (
                                <>
                                    {/* ADDRESS CHANGE */}
                                    {!order.is_address_change_requested ? (
                                        <button
                                            onClick={() =>
                                                router.visit(
                                                    route(
                                                        'website.orders.address-change-request.index',
                                                        order.order_no,
                                                    ),
                                                )
                                            }
                                            className="text-md flex h-[50px] w-full items-center justify-center gap-2 rounded-md border border-surface-3-light bg-[#f7f7f7] text-[16px] font-semibold text-main-text-light transition-all dark:border-surface-3-dark dark:bg-main-text-dark dark:text-main-text-light lg:w-[210px] lg:hover:bg-[#c8c8c8] dark:lg:hover:bg-main-text-dark/80"
                                        >
                                            {__('Change Address')}
                                        </button>
                                    ) : (
                                        <button
                                            disabled={
                                                order.address_change_request_status ===
                                                    'approved' ||
                                                order.address_change_request_status === 'rejected'
                                            }
                                            onClick={() =>
                                                handleWithdrawlAddressChangeRequest(order?.order_no)
                                            }
                                            className="flex h-[50px] w-full items-center justify-center gap-2 rounded-md border border-surface-3-light bg-[#f7f7f7] text-[16px] text-sm font-semibold text-main-text-light transition-all dark:border-surface-3-dark dark:bg-main-text-dark dark:text-main-text-light lg:w-[210px] lg:hover:bg-[#c8c8c8] dark:lg:hover:bg-main-text-dark/80"
                                        >
                                            {__('Address Change')}:{' '}
                                            {__(
                                                order.address_change_request_status
                                                    .replace(/_/g, ' ')
                                                    .toUpperCase(),
                                                true,
                                            )}
                                        </button>
                                    )}

                                    {/* REFUND */}
                                    {!order.is_refund_requested ? (
                                        <button
                                            onClick={() =>
                                                router.visit(
                                                    route(
                                                        'website.orders.refund.index',
                                                        order.order_no,
                                                    ),
                                                )
                                            }
                                            className="text-md flex h-[50px] w-full items-center justify-center gap-2 rounded-md bg-[#282828] text-[16px] font-semibold text-main-text-dark transition-all dark:bg-main-text-dark dark:text-main-text-light lg:w-[210px] lg:hover:bg-[#282828]/80 dark:lg:hover:bg-main-text-dark/80"
                                        >
                                            {__('Return, Refund')}
                                        </button>
                                    ) : (
                                        <button
                                            disabled={
                                                order.refund_request_status === 'approved' ||
                                                order.refund_request_status === 'rejected' ||
                                                order.refund_request_status === 'withdrawn'
                                            }
                                            onClick={() =>
                                                handleWithdrawlRefundRequest(order?.order_no)
                                            }
                                            className="flex h-[50px] w-full items-center justify-center gap-2 rounded-md bg-[#282828] text-[16px] text-sm font-semibold text-main-text-dark transition-all dark:bg-main-text-dark dark:text-main-text-light lg:w-[210px] lg:hover:bg-[#282828]/80 dark:lg:hover:bg-main-text-dark/80"
                                        >
                                            {__('Refund Request')}:{' '}
                                            {__(
                                                order.refund_request_status
                                                    .replace(/_/g, ' ')
                                                    .toUpperCase(),
                                                true,
                                            )}
                                        </button>
                                    )}
                                </>
                            )}

                        {['shipped', 'arrived_locally'].includes(order.status.toLowerCase()) && (
                            <>
                                <button
                                    onClick={() => {
                                        router.visit(
                                            route('website.orders.order-view', order.order_no),
                                        );
                                    }}
                                    className="text-md flex h-[50px] w-full items-center justify-center gap-2 rounded-md bg-[#282828] text-[16px] font-semibold text-main-text-dark transition-all dark:bg-main-text-dark dark:text-main-text-light lg:w-[210px] lg:hover:bg-[#282828]/80 dark:lg:hover:bg-main-text-dark/80"
                                >
                                    {__('Track Order')}
                                </button>
                            </>
                        )}

                        {order.status.toLowerCase() === 'delivered' && (
                            <>
                                <button
                                    onClick={() => handleReOrder(order?.order_no)}
                                    className="text-md flex h-[50px] w-full items-center justify-center gap-2 rounded-md bg-[#282828] text-[16px] font-semibold text-main-text-dark transition-all dark:bg-main-text-dark dark:text-main-text-light lg:w-[210px] lg:hover:bg-[#282828]/80 dark:lg:hover:bg-main-text-dark/80"
                                >
                                    {!reOrderProcessing ? (
                                        <span>{__('Reorder')}</span>
                                    ) : (
                                        <Spinner />
                                    )}
                                </button>
                                {/* REFUND */}

                                {shouldShowRefundButton() && (
                                    <>
                                        {!order.is_refund_requested ? (
                                            <button
                                                onClick={() =>
                                                    router.visit(
                                                        route(
                                                            'website.orders.refund.index',
                                                            order.order_no,
                                                        ),
                                                    )
                                                }
                                                className="text-md flex h-[50px] w-full items-center justify-center gap-2 rounded-md bg-[#282828] text-[16px] font-semibold text-main-text-dark transition-all dark:bg-main-text-dark dark:text-main-text-light lg:w-[210px] lg:hover:bg-[#282828]/80 dark:lg:hover:bg-main-text-dark/80"
                                            >
                                                {__('Return, Refund')}
                                            </button>
                                        ) : (
                                            <button
                                                disabled={
                                                    order.refund_request_status === 'approved' ||
                                                    order.refund_request_status === 'rejected' ||
                                                    order.refund_request_status === 'withdrawn'
                                                }
                                                onClick={() =>
                                                    handleWithdrawlRefundRequest(order?.order_no)
                                                }
                                                className="flex h-[50px] w-full items-center justify-center gap-2 rounded-md bg-[#282828] text-[16px] text-sm font-semibold text-main-text-dark transition-all dark:bg-main-text-dark dark:text-main-text-light lg:w-[210px] lg:hover:bg-[#282828]/80 dark:lg:hover:bg-main-text-dark/80"
                                            >
                                                {__('Refund Request')}:{' '}
                                                {__(
                                                    order.refund_request_status
                                                        .replace(/_/g, ' ')
                                                        .toUpperCase(),
                                                    true,
                                                )}
                                            </button>
                                        )}
                                    </>
                                )}
                            </>
                        )}

                        {['canceled', 'expired', 'refund_completed'].includes(
                            order.status.toLowerCase(),
                        ) && (
                            <>
                                <button
                                    onClick={() => handleReOrder(order?.order_no)}
                                    className="text-md flex h-[50px] w-full items-center justify-center gap-2 rounded-md bg-[#282828] text-[16px] font-semibold text-main-text-dark transition-all dark:bg-main-text-dark dark:text-main-text-light lg:w-[210px] lg:hover:bg-[#282828]/80 dark:lg:hover:bg-main-text-dark/80"
                                >
                                    {!reOrderProcessing ? (
                                        <span>{__('Reorder')}</span>
                                    ) : (
                                        <Spinner />
                                    )}
                                </button>
                            </>
                        )}

                        {order.status?.toLowerCase() !== 'refund_completed' &&
                            order.status?.toLowerCase()?.startsWith('refund_') &&
                            order.previous_status?.toLowerCase() === 'delivered' && (
                                <>
                                    {/* REFUND */}
                                    {!order.is_refund_requested ? (
                                        <button
                                            onClick={() =>
                                                router.visit(
                                                    route(
                                                        'website.orders.refund.index',
                                                        order.order_no,
                                                    ),
                                                )
                                            }
                                            className="text-md flex h-[50px] w-full items-center justify-center gap-2 rounded-md bg-[#282828] text-[16px] font-semibold text-main-text-dark transition-all dark:bg-main-text-dark dark:text-main-text-light lg:w-[210px] lg:hover:bg-[#282828]/80 dark:lg:hover:bg-main-text-dark/80"
                                        >
                                            {__('Return, Refund')}
                                        </button>
                                    ) : (
                                        <button
                                            disabled={
                                                order.refund_request_status === 'approved' ||
                                                order.refund_request_status === 'rejected' ||
                                                order.refund_request_status === 'withdrawn'
                                            }
                                            onClick={() =>
                                                handleWithdrawlRefundRequest(order?.order_no)
                                            }
                                            className="flex h-[50px] w-full items-center justify-center gap-2 rounded-md bg-[#282828] text-[16px] text-sm font-semibold text-main-text-dark transition-all dark:bg-main-text-dark dark:text-main-text-light lg:w-[210px] lg:hover:bg-[#282828]/80 dark:lg:hover:bg-main-text-dark/80"
                                        >
                                            {__('Refund Request')}:{' '}
                                            {__(
                                                order.refund_request_status
                                                    .replace(/_/g, ' ')
                                                    .toUpperCase(),
                                                true,
                                            )}
                                        </button>
                                    )}
                                </>
                            )}
                    </div>
                </div>
            </div>
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
                    className="text-md dark:text-main-text inline-flex items-center justify-center rounded-md bg-main-text-light px-10 py-2.5 font-semibold text-main-text-dark transition-colors hover:bg-main-text-light/80 dark:bg-main-text-dark dark:text-main-text-light dark:hover:bg-main-text-dark/80"
                >
                    {__('Start shopping')}
                </Link>
            </div>
        </div>
    );
}
