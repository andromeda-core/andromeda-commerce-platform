import React, { useEffect, useRef, useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import MainLayout from '@/Layouts/Website/MainLayout';
import Placeholder from 'asset/assets/images/product/placeholder.jpg';
import useWindowSize from '@/Hooks/useWindowSize';
import { createPortal } from 'react-dom';
import CustomFileUploader from '@/Components/CustomFileUploader';
import Toast from '@/Components/Toast';
import VideoWithThumbnail from '@/Components/VideoWithThumbnail';
import axios from 'axios';
import { useTranslation } from '@/Hooks/useTranslation';
import { BuildingLibraryIcon } from '@heroicons/react/24/solid';

export default function OrderView({ order }) {
    const { currency } = usePage().props;
    const windowSize = useWindowSize();


    const generateSmartphoneURL = (smartphone, isDirect = false, isSinglePage = false) => {
        return (
            `?m-slug=${smartphone?.slug}${isSinglePage ? '&single_page=true' : ''}${isDirect ? '&direct=true' : ''}`
        );
    }

    // Translation Hook
    const { __ } = useTranslation();

    const [showVideoModal, setShowVideoModal] = useState(false);
    const [selectedVideo, setSelectedVideo] = useState({});
    const [showImageModal, setShowImageModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [viewBankDetails, setViewBankDetails] = useState(false);
    const [selectedPackageVideoID, setSelectedPackageVideoID] = useState(null);
    const [ErrorMessage, setErrorMessage] = useState(null);
    const [showErrorMessage, setShowErrorMessage] = useState(false);

    const cleanUrl = (() => {
        const clean = new URL(window.location.href);
        clean.searchParams.delete('modal');
        clean.searchParams.delete('url');
        clean.searchParams.delete('thumbnail_url');

        return clean.toString();
    })();

    const baseUrlRef = useRef(cleanUrl);

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

    const handleVideoView = (recording) => {
        setSelectedVideo({
            url: recording.package_video,
            thumbnail_url: recording.thumbnail_url,
        });
        setShowVideoModal(true);
    };

    const handleImageView = (imageUrl) => {
        setSelectedImage(imageUrl);
        setShowImageModal(true);
    };

    // Payment proof upload states
    const [paymentProofFile, setPaymentProofFile] = useState(null);
    const [paymentProofPreview, setPaymentProofPreview] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    const [copiedField, setCopiedField] = useState(null);

    const handleCopy = (text, fieldName) => {
        navigator.clipboard.writeText(text);
        setCopiedField(fieldName);
        setTimeout(() => setCopiedField(null), 2000);
    };

    const handleFileSelect = (file) => {
        setPaymentProofFile(file);

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPaymentProofPreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

    // Handle file removal
    const handleFileRemove = () => {
        setPaymentProofFile(null);
        setPaymentProofPreview(null);
    };

    // Upload payment proof
    const handleUploadPaymentProof = async () => {
        if (!paymentProofFile) return;

        setIsUploading(true);

        const formData = new FormData();
        formData.append('payment_proof', paymentProofFile);
        formData.append('order_id', order.id);
        formData.append('order_no', order.order_no);

        try {
            await router.post(route('website.orders.upload-payment-proof'), formData, {
                preserveScroll: true,
                onSuccess: () => {
                    setPaymentProofFile(null);
                    setPaymentProofPreview(null);
                },
                onError: (errors) => {
                    setShowErrorMessage(true);
                    setErrorMessage(
                        errors.payment_proof || __('Failed to upload payment proof. Please try again.'),
                    );
                },
                onFinish: () => {
                    setIsUploading(false);
                },
            });
        } catch (error) {
            console.error('Upload error:', error);
            setIsUploading(false);
        }
    };

    useEffect(() => {
        const url = new URL(window.location.href);
        const modal = url.searchParams.get('modal');
        const mediaUrl = url.searchParams.get('url');
        const mediaThumbnail = url.searchParams.get('thumbnail_url');

        if (modal === 'packaging-recordings') {
            setSelectedVideo({
                url: mediaUrl,
                thumbnail_url: mediaThumbnail,
            });
            setShowVideoModal(true);
        } else if (modal === 'payment-proof') {
            setSelectedImage(mediaUrl || null);
            setShowImageModal(true);
        } else if (modal === 'bank-details') {
            setViewBankDetails(true);
        }
    }, []);
    // Prevent body scroll when modal is open
    useEffect(() => {
        if (showVideoModal || showImageModal || (viewBankDetails && !order.payment_proof)) {
            document.body.style.overflow = 'hidden';
            document.body.style.touchAction = 'none';
        } else {
            setSelectedPackageVideoID(null);
            document.body.style.overflow = '';
            document.body.style.touchAction = '';
        }
        return () => {
            document.body.style.overflow = '';
            document.body.style.touchAction = '';
        };
    }, [showVideoModal, showImageModal, viewBankDetails]);

    // updating history whenever modal opens/closes
    useEffect(() => {
        const url = new URL(window.location.href);

        if (showVideoModal) {
            window.history.pushState({}, '', window.location.pathname);

            url.searchParams.set('modal', 'packaging-recordings');
            url.searchParams.set('url', selectedVideo?.url);
            url.searchParams.set('thumbnail_url', selectedVideo?.thumbnail_url);

            window.history.replaceState({}, '', url.toString());
        } else if (showImageModal) {
            window.history.pushState({}, '', window.location.pathname);

            url.searchParams.set('modal', 'payment-proof');
            url.searchParams.set('url', selectedImage);

            window.history.replaceState({}, '', url.toString());
        } else if (viewBankDetails) {
            window.history.pushState({}, '', window.location.pathname);
            url.searchParams.set('modal', 'bank-details');
            window.history.replaceState({}, '', url.toString());
        } else {
            url.searchParams.delete('modal');
            url.searchParams.delete('url');
            url.searchParams?.delete('thumbnail_url');
            window.history.replaceState({}, '', baseUrlRef.current);
        }
    }, [showVideoModal, showImageModal, selectedVideo, selectedImage, viewBankDetails]);

    // Pop State Handling
    useEffect(() => {
        const handlePopState = () => {
            if (showVideoModal) {
                setShowVideoModal(false);
                setSelectedVideo({});
                setSelectedPackageVideoID(null);
                return;
            }
            if (showImageModal) {
                setShowImageModal(false);
                setSelectedImage(null);
                return;
            }

            if (viewBankDetails) {
                setViewBankDetails(false);
                return;
            }
        };

        const preventInertiaNavigation = (event) => {
            const pathname = event.detail?.visit?.url?.pathname || '';
            const currentPath = `/orders/order-view/${order.order_no}`;
            if ((showVideoModal || showImageModal || viewBankDetails) && pathname === currentPath) {
                event.preventDefault();
            }
        };

        window.addEventListener('popstate', handlePopState);
        const removeRouterEvent = router.on('before', preventInertiaNavigation);

        return () => {
            window.removeEventListener('popstate', handlePopState);
            if (removeRouterEvent) removeRouterEvent();
        };
    }, [showVideoModal, showImageModal, viewBankDetails]);

    useEffect(() => {
        if (selectedPackageVideoID != null) {
            axios.post(
                route('website.orders.mark-packaging-video-viewed', {
                    package_video_id: selectedPackageVideoID,
                }),
            );
        }
    }, [selectedPackageVideoID]);


    return (
        <MainLayout>
            <Head title={`${__('Order', true)} #${order.order_no}`} />

            {showErrorMessage && (
                <Toast
                    flash={{ error: ErrorMessage }}
                    onClosed={(type) => {
                        if (type === 'error') {
                            setErrorMessage(null);
                            setShowErrorMessage(false);
                        }
                    }}
                />
            )}

            <div className="min-h-screen transition-colors duration-200">
                {/* Payment Proof Required Alert */}
                {!order.payment_proof &&
                    order.status === 'pending' &&
                    order.payment_method === 'bank_transfer' && (
                        <div className="relative top-0 z-[60] mx-auto max-w-7xl border-b border-red-200 bg-gradient-to-r from-red-50 to-orange-50 shadow-md dark:border-red-900/30 dark:from-red-900/20 dark:to-orange-900/20">
                            <div className="px-4 py-3 sm:px-6 lg:px-8">
                                <div className="flex flex-col items-center justify-between gap-3 sm:flex-row sm:gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 bg-red-500 rounded-full">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth={2}
                                                stroke="currentColor"
                                                className="w-5 h-5 text-white"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                                                />
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-semibold text-red-900 dark:text-red-100">
                                                {__('Payment Proof Required')}
                                            </p>
                                            <p className="text-xs text-red-700 dark:text-red-200/80">
                                                {__('Please upload your payment proof to confirm this order')}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={() => setViewBankDetails(true)}
                                            className="flex-shrink-0 px-4 py-2 text-sm font-semibold text-white transition-all bg-red-600 rounded-lg hover:bg-red-700"
                                        >
                                            {__('View Bank Details')}
                                        </button>

                                        <button
                                            onClick={() => {
                                                const paymentSection =
                                                    document.getElementById(
                                                        'payment-proof-section',
                                                    );
                                                if (paymentSection) {
                                                    paymentSection.scrollIntoView({
                                                        behavior: 'smooth',
                                                        block: 'center',
                                                    });
                                                }
                                            }}
                                            className="flex-shrink-0 px-4 py-2 text-sm font-semibold text-white transition-all bg-red-600 rounded-lg hover:bg-red-700"
                                        >
                                            {__('Upload Now')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                {/* Payment Proof Pending Approval Alert */}
                {order.payment_proof &&
                    order.status === 'pending' &&
                    order.payment_method === 'bank_transfer' && (
                        <div className="relative top-0 z-[60] mx-auto max-w-7xl border-b border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 shadow-md dark:border-amber-900/30 dark:from-amber-900/20 dark:to-yellow-900/20">
                            <div className="px-4 py-3 sm:px-6 lg:px-8">
                                <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4">
                                    <div className="flex items-start gap-3">
                                        <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-full bg-amber-500">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth={2}
                                                stroke="currentColor"
                                                className="w-5 h-5 text-white"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                                                />
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                                                {__('Payment Proof Submitted - Awaiting Approval')}
                                            </p>
                                            <p className="mt-1 text-xs text-amber-800 dark:text-amber-200/80">
                                                {__("We're reviewing your payment proof. This usually takes 1-2 business days. If your order isn't approved within 2-3 days, please contact our support team.")}
                                            </p>
                                        </div>
                                    </div>
                                    <Link
                                        href={route('website.contact.index')}
                                        className="flex-shrink-0 px-4 py-2 text-sm font-semibold text-white transition-all rounded-lg whitespace-nowrap bg-amber-600 hover:bg-amber-700"
                                    >
                                        {__('Contact Support')}
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}

                <div
                    className={`mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 ${windowSize.width <= 1024 && 'mb-20'}`}
                >
                    {/* Header */}
                    <div className="mb-8">
                        <Link
                            href={route('website.orders.index')}
                            className="inline-flex items-center gap-2 mb-4 text-sm font-medium transition-colors text-main-text-light dark:hover:text-sub-text-dark dark:text-main-text-dark hover:text-sub-text-light"
                        >
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
                                    d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                                />
                            </svg>
                            {__('Back to Orders')}
                        </Link>

                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-main-text-light dark:text-main-text-dark">
                                    {__('Order')} #{order.order_no}
                                </h1>
                                <p className="mt-1 text-sm text-sub-text-light dark:text-sub-text-dark">
                                    {__('Placed on')} {order.order_placed_date}
                                </p>
                            </div>
                            <span
                                className={`inline-flex items-center self-start rounded-full px-4 py-2 text-sm font-semibold uppercase sm:self-center ${getStatusColor(order.status)}`}
                            >
                                {order.status.replace(/_/g, ' ')}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* Main Content */}
                        <div className="space-y-6 lg:col-span-2">
                            {/* Order Items */}
                            <div className="p-6 border rounded-md border-surface-3-light bg-surface-1-light dark:border-surface-3-dark dark:bg-surface-1-dark">
                                <h2 className="flex items-center gap-2 mb-4 text-lg font-semibold text-main-text-light dark:text-main-text-dark">

                                    {__('Order Items')}
                                </h2>
                                <div className="space-y-4">

                                    <div className="space-y-4">

                                        {order.order_items?.map((item) => {
                                            const addonsTotal =
                                                item.smartphone_addons?.reduce(
                                                    (total, addon) => total + Number(addon.total_price),
                                                    0
                                                ) || 0;

                                            const finalItemTotal =
                                                Number(item.sub_total) + addonsTotal;

                                            return (
                                                <div
                                                    className="flex flex-col gap-4 p-4 border rounded-md border-surface-3-light bg-surface-1-light dark:border-surface-3-dark dark:bg-surface-1-dark sm:flex-row sm:items-center"
                                                    key={item.id}
                                                >

                                                    {/* IMAGE */}
                                                    {(item?.inventory_item?.smartphone?.smartphone_image_urls.length > 0 || item?.inventory_item?.smartphone?.smartphone_video_urls?.length > 0) && (
                                                        <div className="relative w-24 h-24 overflow-hidden transition-all border-2 rounded-md cursor-pointer border-trasparent bg-surface-1-light group/img aspect-square dark:bg-surface-1-dark dark:hover:border-surface-3-dark"

                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                router.get(route('home') + generateSmartphoneURL(item?.inventory_item?.smartphone, true, true));
                                                            }}
                                                        >
                                                            <img
                                                                src={
                                                                    item?.inventory_item?.smartphone?.smartphone_image_urls?.[0] ||
                                                                    item?.inventory_item?.smartphone?.smartphone_video_urls[0]?.thumbnail_url ||
                                                                    Placeholder
                                                                }
                                                                alt={item?.inventory_item?.smartphone?.model_name?.name}
                                                                className="object-cover w-full h-full transition-transform duration-300 group-hover/img:scale-110"
                                                                loading="lazy"
                                                                onError={(e) => (e.target.src = Placeholder)}
                                                            />
                                                        </div>
                                                    )}

                                                    {/* DETAILS */}
                                                    <div className="flex-1 space-y-3">

                                                        {/* HEADER */}
                                                        <div>
                                                            <h3 className="text-base font-semibold text-main-text-light dark:text-main-text-dark">
                                                                {item?.inventory_item?.smartphone?.model_name?.name || 'N/A'}
                                                            </h3>

                                                            <div className="flex flex-wrap gap-2 mt-1 text-xs">
                                                                {item?.inventory_item?.smartphone?.capacity?.name && (
                                                                    <span className="px-2 py-0.5 rounded-md bg-surface-3-light dark:bg-surface-3-dark text-sub-text-light dark:text-sub-text-dark">
                                                                        {item.inventory_item?.smartphone.capacity.name}
                                                                    </span>
                                                                )}

                                                                {item?.color?.name && (
                                                                    <span className="px-2 py-0.5 rounded-md bg-surface-3-light dark:bg-surface-3-dark text-sub-text-light dark:text-sub-text-dark">
                                                                        {item.color.name}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* META */}
                                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                                            <div className="flex justify-between">
                                                                <span className="text-sub-text-light dark:text-sub-text-dark">
                                                                    {__('UPC / EAN')}
                                                                </span>
                                                                <span className="font-medium text-main-text-light dark:text-main-text-dark">
                                                                    {item.inventory_item?.smartphone?.upc || '—'}
                                                                </span>
                                                            </div>

                                                            <div className="flex justify-between">
                                                                <span className="text-sub-text-light dark:text-sub-text-dark">
                                                                    {__('Quantity')}
                                                                </span>
                                                                <span className="font-medium text-main-text-light dark:text-main-text-dark">
                                                                    {item.quantity}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* PRICING BREAKDOWN */}
                                                        <div className="pt-3 space-y-1 text-sm border-t border-dashed border-surface-3-light dark:border-surface-3-dark">
                                                            <div className="flex justify-between">
                                                                <span className="text-sub-text-light dark:text-sub-text-dark">
                                                                    {__('Unit Price')}
                                                                </span>
                                                                <span className="text-main-text-light dark:text-main-text-dark">
                                                                    {currency?.symbol}
                                                                    {Number(item.unit_price).toFixed(2)}
                                                                </span>
                                                            </div>

                                                            <div className="flex justify-between">
                                                                <span className="text-sub-text-light dark:text-sub-text-dark">
                                                                    {__('Product Total')}
                                                                </span>
                                                                <span className="text-main-text-light dark:text-main-text-dark">
                                                                    {currency?.symbol}
                                                                    {(item.unit_price * item.quantity).toFixed(2)}
                                                                </span>
                                                            </div>

                                                            <div className="flex justify-between">
                                                                <span className="text-sub-text-light dark:text-sub-text-dark">
                                                                    {__('Shipping')}
                                                                </span>
                                                                <span className="text-main-text-light dark:text-main-text-dark">
                                                                    {currency?.symbol}
                                                                    {Number(item.shipping_cost || 0).toFixed(2)}
                                                                </span>
                                                            </div>

                                                            <div className="flex justify-between">
                                                                <span className="text-sub-text-light dark:text-sub-text-dark">
                                                                    {__('Import Tax')}
                                                                </span>
                                                                <span className="text-main-text-light dark:text-main-text-dark">
                                                                    {currency?.symbol}
                                                                    {Number(item.import_cost || 0).toFixed(2)}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* ADDONS */}
                                                        {item.smartphone_addons?.length > 0 && (
                                                            <div className="pt-3 border-t border-dashed border-surface-3-light dark:border-surface-3-dark">
                                                                <p className="mb-2 text-xs font-semibold text-sub-text-light dark:text-sub-text-dark">
                                                                    {__('Add-ons')}
                                                                </p>

                                                                <div className="space-y-1 text-sm">
                                                                    {item.smartphone_addons.map((addon) => (
                                                                        <div
                                                                            key={addon.id}
                                                                            className="flex justify-between"
                                                                        >
                                                                            <span className="text-sub-text-light dark:text-sub-text-dark">
                                                                                {addon.name} × {addon.quantity}
                                                                            </span>
                                                                            <span className="text-main-text-light dark:text-main-text-dark">
                                                                                {currency?.symbol}
                                                                                {Number(addon.total_price).toFixed(2)}
                                                                            </span>
                                                                        </div>
                                                                    ))}

                                                                    <div className="flex justify-between pt-1 font-medium">
                                                                        <span className="text-sub-text-light dark:text-sub-text-dark">{__('Add-ons Total')}</span>
                                                                        <span className="text-main-text-light dark:text-main-text-dark">
                                                                            {currency?.symbol}
                                                                            {addonsTotal.toFixed(2)}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* FINAL TOTAL */}
                                                        <div className="flex justify-between pt-3 mt-3 border-t border-surface-3-light dark:border-surface-3-dark">
                                                            <span className="text-sm font-semibold text-main-text-light dark:text-main-text-dark">
                                                                {__('Final Item Total')}
                                                            </span>
                                                            <span className="text-base font-bold text-main-text-light dark:text-main-text-dark">
                                                                {currency?.symbol}
                                                                {finalItemTotal.toFixed(2)}
                                                            </span>
                                                        </div>

                                                    </div>
                                                </div>
                                            );
                                        })}


                                    </div>


                                </div>
                            </div>

                            {/* Payment Proof Section */}
                            {order.payment_method === 'bank_transfer' && (
                                <div
                                    id="payment-proof-section"
                                    className="p-6 border rounded-md bg-surface-1-light border-surface-3-light dark:border-surface-3-dark dark:bg-surface-1-dark"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="flex items-center gap-2 text-lg font-semibold text-main-text-light dark:text-main-text-dark">

                                            {__('Payment Proof')}
                                        </h2>
                                        {order.payment_proof && order.status === 'pending' && (
                                            <span className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
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
                                                        d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                                                    />
                                                </svg>
                                                {__('Pending Approval')}
                                            </span>
                                        )}
                                    </div>

                                    {order.payment_proof ? (
                                        <div>
                                            <div
                                                onClick={() => handleImageView(order.payment_proof)}
                                                className="overflow-hidden transition-all border-2 rounded-md cursor-pointer bg-surface-3-light border-surface-3-light group dark:bg-surface-3-dark dark:border-surface-3-dark"
                                            >
                                                <img
                                                    src={order.payment_proof}
                                                    alt={__('Payment Proof')}
                                                    className="object-contain w-full h-64 transition-transform duration-300 group-hover:scale-105"
                                                />
                                            </div>

                                            {order.status === 'pending' && (
                                                <div className="p-4 mt-4 border rounded-lg border-amber-200 bg-amber-50 dark:border-amber-900/30 dark:bg-amber-900/10">
                                                    <div className="flex gap-3">
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            strokeWidth={2}
                                                            stroke="currentColor"
                                                            className="flex-shrink-0 w-5 h-5 text-amber-600 dark:text-amber-400"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                                                            />
                                                        </svg>
                                                        <div className="flex-1">
                                                            <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                                                                {__('Your payment proof is under review')}
                                                            </p>
                                                            <p className="mt-1 text-xs text-amber-700 dark:text-amber-200/80">
                                                                {__("We'll notify you once it's approved. This typically takes 1-2 business days.")}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {/* File Uploader Component */}
                                            <CustomFileUploader
                                                onFileSelect={handleFileSelect}
                                                onFileRemove={handleFileRemove}
                                                accept="image/*"
                                                maxSize={5 * 1024 * 1024}
                                                preview={paymentProofPreview}
                                                fileName={paymentProofFile?.name}
                                                fileSize={paymentProofFile?.size}
                                                uploadButtonText={__('Upload Payment Proof')}
                                                disabled={isUploading}
                                            />

                                            {/* Upload Button */}
                                            {paymentProofPreview && (
                                                <button
                                                    onClick={handleUploadPaymentProof}
                                                    disabled={isUploading}
                                                    className="flex items-center justify-center w-full gap-2 px-6 py-3 text-sm font-semibold transition-all rounded-md bg-main-text-light text-main-text-dark hover:bg-main-text-light/80 dark:bg-main-text-dark dark:text-main-text-light dark:hover:bg-main-text-dark/80 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    {isUploading ? (
                                                        <>
                                                            <svg
                                                                className="w-5 h-5 animate-spin"
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <circle
                                                                    className="opacity-25"
                                                                    cx="12"
                                                                    cy="12"
                                                                    r="10"
                                                                    stroke="currentColor"
                                                                    strokeWidth="4"
                                                                ></circle>
                                                                <path
                                                                    className="opacity-75"
                                                                    fill="currentColor"
                                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                                ></path>
                                                            </svg>
                                                            {__('Uploading')}...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                strokeWidth={2}
                                                                stroke="currentColor"
                                                                className="w-5 h-5"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                                                                />
                                                            </svg>
                                                            {__('Upload Payment Proof')}
                                                        </>
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Packaging Videos */}
                            {order.order_package_recordings?.length > 0 && (
                                <div className="p-6 border rounded-md bg-surface-1-light border-surface-3-light dark:border-surface-3-dark dark:bg-surface-1-dark">
                                    <h2 className="flex items-center gap-2 mb-4 text-lg font-semibold text-main-text-light dark:text-main-text-dark">

                                        {__('Packaging Videos')}
                                    </h2>
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                        {order.order_package_recordings.map((recording, index) => (
                                            <div
                                                key={index}
                                                onClick={() => {
                                                    handleVideoView(recording);
                                                    setSelectedPackageVideoID(recording.id);
                                                }}
                                                className="relative overflow-hidden transition-all border-2 rounded-md cursor-pointer border-surface-3-light bg-surface-3-light group dark:bg-surface-3-dark dark:border-surface-3-dark"
                                            >
                                                <div className="flex items-center justify-center aspect-video bg-surface-3-dark">
                                                    <img
                                                        src={recording.thumbnail_url || Placeholder}
                                                        alt={"Thumbnail " + index}
                                                        onError={(e) => e.target.src = Placeholder}
                                                    />

                                                    <div className="absolute inset-0 flex items-center justify-center transition bg-black/30 group-hover:bg-black/40">
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            strokeWidth="1.5"
                                                            stroke="currentColor"
                                                            className="w-12 h-12 text-main-text-dark"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                d="M5.25 5.25v13.5l13.5-6.75L5.25 5.25z"
                                                            />
                                                        </svg>
                                                    </div>
                                                </div>
                                                <div className="p-3 text-center">
                                                    <p className="text-sm font-semibold text-sub-text-light dark:text-sub-text-dark">
                                                        {__('Packaging Video')} {index + 1}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}



                            <div className="p-6 border rounded-md bg-surface-1-light border-surface-3-light dark:border-surface-3-dark dark:bg-surface-1-dark">
                                <h2 className="flex items-center gap-2 mb-4 text-lg font-semibold text-main-text-light dark:text-main-text-dark">

                                    {__('Shipping Address')}
                                </h2>
                                <div className="p-4 border rounded-md bg-surface-2-light border-surface-3-light dark:bg-surface-2-dark dark:border-surface-3-dark">
                                    <address className="text-sm not-italic text-sub-text-light dark:text-sub-text-dark">

                                        <p className="font-semibold break-words">
                                            {order?.shipping_name || ''}
                                        </p>

                                        <p className="mt-2 text-sm break-words">
                                            {order?.shipping_address_line1 || ''}
                                            {', '}
                                            {order?.shipping_address_line2 || ''}
                                        </p>
                                        <p className="break-words ">
                                            {order?.shipping_city || ''}
                                        </p>

                                        <p className="break-words">
                                            {order?.shipping_state || ''}
                                        </p>

                                        <p className="break-words">
                                            {order?.shipping_postal_code || ''}
                                        </p>

                                        <p className="break-words">
                                            {order?.shipping_country || ''}
                                        </p>

                                        <p className="flex items-center gap-2 mt-2 break-all ">
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
                                                    d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
                                                />
                                            </svg>
                                            {order?.shipping_phone || ''}

                                        </p>

                                    </address>
                                </div>
                            </div>
                            {/* Courier Details */}
                            {order?.status != 'paid' && order?.status != 'pending' && (
                                <div className="p-6 border rounded-md border-surface-3-light bg-surface-1-light dark:border-surface-3-dark dark:bg-surface-1-dark">
                                    <h2 className="flex items-center gap-2 mb-6 text-lg font-semibold text-main-text-light dark:text-main-text-dark">

                                        {__('Courier Details')}
                                    </h2>

                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                        {/* Courier Company */}
                                        <div className="p-4 transition-all border rounded-md bg-surface-2-light border-surface-3-light group dark:bg-surface-2-dark dark:border-surface-3-dark">
                                            <div className="flex items-center gap-2 mb-2">

                                                <span className="text-xs font-semibold tracking-wider uppercase text-sub-text-light dark:text-sub-text-dark">
                                                    {__('Courier Company')}
                                                </span>
                                            </div>
                                            <p className="text-base font-bold break-words text-sub-text-light dark:text-sub-text-dark">
                                                {order.courier_company || 'N/A'}
                                            </p>
                                        </div>

                                        {/* Tracking Number */}
                                        <div className="p-4 transition-all border rounded-md bg-surface-2-light border-surface-3-light group dark:bg-surface-2-dark dark:border-surface-3-dark">
                                            <div className="flex items-center gap-2 mb-2">

                                                <span className="text-xs font-semibold tracking-wider uppercase text-sub-text-light dark:text-sub-text-dark">
                                                    {__('Tracking Number')}
                                                </span>
                                            </div>
                                            <p className="font-mono text-base font-bold break-words text-sub-text-light dark:text-sub-text-dark">
                                                {order.tracking_no || 'N/A'}
                                            </p>
                                        </div>

                                        {/* Shipping Date */}
                                        <div className="p-4 transition-all border rounded-md bg-surface-2-light border-surface-3-light group dark:bg-surface-2-dark dark:border-surface-3-dark">
                                            <div className="flex items-center gap-2 mb-2">

                                                <span className="text-xs font-semibold tracking-wider uppercase text-sub-text-light dark:text-sub-text-dark">
                                                    {__('Shipping Date')}
                                                </span>
                                            </div>
                                            <p className="text-base font-bold break-words text-sub-text-light dark:text-sub-text-dark">
                                                {order?.shipping_date || __('Pending')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Order Summary */}
                            <div className="p-6 border rounded-md border-surface-3-light bg-surface-1-light dark:border-surface-3-dark dark:bg-surface-1-dark">
                                <h2 className="flex items-center gap-2 mb-4 text-lg font-semibold text-main-text-light dark:text-main-text-dark">

                                    {__('Order Summary')}
                                </h2>
                                <div className="space-y-3">

                                    {/* Subtotal */}
                                    <div className="flex justify-between text-sm">
                                        <span className="text-sub-text-light dark:text-sub-text-dark">{__('Product SubTotal')}</span>
                                        <span className="font-semibold text-sub-text-ight dark:text-sub-text-dark">
                                            {currency?.symbol}{parseFloat(Number(order.sub_total)).toFixed(2) || '0.00'}
                                        </span>
                                    </div>

                                    {/* Addon Total */}
                                    {order.addons_sub_total > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-sub-text-light dark:text-sub-text-dark">{__('Addons SubTotal')}</span>
                                            <span className="font-semibold text-sub-text-ight dark:text-sub-text-dark">
                                                {currency?.symbol}{parseFloat(Number(order.addons_sub_total)).toFixed(2) || '0.00'}
                                            </span>
                                        </div>
                                    )}


                                    {/* Shipping Fee */}
                                    {order?.shipping_fee > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-sub-text-light dark:text-sub-text-dark">{__('Shipping Fee')}</span>
                                            <span className="font-semibold text-sub-text-ight dark:text-sub-text-dark">
                                                {currency?.symbol}{parseFloat(Number(order.shipping_fee)).toFixed(2) || '0.00'}
                                            </span>
                                        </div>
                                    )}

                                    {/* Improt Tax */}
                                    {order?.import_tax > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-sub-text-light dark:text-sub-text-dark">{__('Import Tax')}</span>
                                            <span className="font-semibold text-sub-text-ight dark:text-sub-text-dark">
                                                {currency?.symbol}{parseFloat(Number(order.import_tax)).toFixed(2) || '0.00'}
                                            </span>
                                        </div>
                                    )}


                                    {order.discount > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-sub-text-light dark:text-sub-text-dark">
                                                {__('Discount')}
                                            </span>
                                            <span className="font-semibold text-green-600 dark:text-green-400">
                                                -{currency?.symbol}
                                                {parseFloat(order.discount).toFixed(2)}
                                            </span>
                                        </div>
                                    )}

                                    <div className="pt-3 border-t border-surface-3-light dark:border-surface-3-dark">
                                        <div className="flex items-center justify-between">
                                            <span className="text-base font-semibold text-sub-text-light dark:text-sub-text-dark">
                                                {__('Total')}
                                            </span>
                                            <span className="text-xl font-semibold text-sub-text-light dark:text-sub-text-dark">
                                                {currency?.symbol}
                                                {parseFloat(
                                                    order.amount,
                                                ).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Method */}
                            <div className="p-6 border rounded-md bg-surface-1-light border-surface-3-light dark:border-surface-3-dark dark:bg-surface-1-dark">
                                <h2 className="flex items-center gap-2 mb-4 text-lg font-semibold text-sub-text-light dark:text-sub-text-dark">

                                    {__('Payment Method')}
                                </h2>
                                <div className="flex items-center justify-center gap-2 py-3 mb-4 border rounded-md bg-surface-1-light border-surface-3-light dark:bg-surface-2-dark dark:border-surface-3-dark ">
                                    {order.payment_method === 'crypto' ? (
                                        <>
                                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-surface-2-light dark:bg-surface-3-dark">
                                                <svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 fill-main-text-light dark:fill-main-text-dark">
                                                    <path d="M128 0C57.3 0 0 57.3 0 128s57.3 128 128 128 128-57.3 128-128S198.7 0 128 0zm62 91h-46v24.3c37.6 1.9 66 10 66 19.7 0 9.7-28.4 17.8-66 19.7V201h-32v-46.3c-37.6-1.9-66-10-66-19.7 0-9.7 28.4-17.8 66-19.7V91H66V63h124v28zm-78 35.2v25.2c-33.6-1.6-58-6.6-58-12.6 0-6 24.4-11 58-12.6zm32 25.2v-25.2c33.6 1.6 58 6.6 58 12.6 0 6-24.4 11-58 12.6z"
                                                    />
                                                </svg>
                                            </div>
                                            <span className="text-sm font-semibold text-main-text-light dark:text-main-text-dark">
                                                {__('Crypto Payment')}
                                            </span>
                                        </>
                                    ) : order.payment_method === 'points' ? (
                                        <>
                                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-surface-2-light dark:bg-surface-3-dark">
                                                <svg className="w-6 h-6 fill-main-text-light dark:fill-main-text-dark" viewBox="0 0 24 24">
                                                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27z" />
                                                </svg>
                                            </div>
                                            <span className="text-sm font-semibold text-main-text-light dark:text-main-text-dark">
                                                {__('Points Payment')}
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-surface-2-light dark:bg-surface-3-dark">
                                                <BuildingLibraryIcon className="w-6 h-6 fill-main-text-light dark:fill-main-text-dark" />
                                            </div>
                                            <span className="text-sm font-semibold text-main-text-light dark:text-main-text-dark">
                                                {__('Bank Transfer')}
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Help Section */}
                            <div className="p-6 border rounded-md bg-surface-1-light border-surface-3-light dark:border-surface-3-dark dark:bg-surface-1-dark">
                                <h2 className="mb-2 text-lg font-semibold text-main-text-light dark:text-main-text-dark">
                                    {__('Need Help')}?
                                </h2>
                                <p className="mb-4 text-sm text-sub-text-light dark:text-sub-text-dark">
                                    {__('Contact our support team if you have any questions about your order.')}
                                </p>
                                <Link
                                    href={route('website.contact.index')}
                                    className="flex items-center justify-center w-full gap-2 px-4 py-3 font-semibold transition-all rounded-md bg-main-text-light text-md text-main-text-dark dark:text-main-text-light dark:bg-main-text-dark hover:bg-main-text-light/80 dark:hover:bg-main-text-dark/80 "
                                >

                                    {__('Contact Support')}
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Video Modal */}
            {showVideoModal &&
                Object.values(selectedVideo).length > 0 &&
                createPortal(
                    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto p-4">
                        <div
                            className="fixed inset-0 transition-opacity duration-300 bg-black/40 backdrop-blur-sm"
                            onClick={() => {
                                setShowVideoModal(false);
                                setSelectedVideo({});
                            }}
                        ></div>

                        <div
                            role="dialog"
                            aria-modal="true"
                            className="relative z-[101] my-auto w-[500px] animate-scale-in overflow-hidden rounded-2xl bg-backgroundLight dark:bg-backgroundDark"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <VideoWithThumbnail
                                thumbnail={selectedVideo?.thumbnail_url || Placeholder}
                                videoUrl={selectedVideo?.url}
                                className="h-auto max-h-[80vh] w-full object-cover"
                                controls={true}
                                type='customized'
                            />
                        </div>
                    </div>,
                    document.getElementById('modal-root') || document.body,
                )}
            {/* Image Modal */}
            {showImageModal &&
                selectedImage &&
                createPortal(
                    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto p-4">
                        <div
                            className="fixed inset-0 transition-opacity duration-300 bg-black/40 backdrop-blur-sm"
                            onClick={() => {
                                setShowImageModal(false);
                                setSelectedImage(null);
                            }}
                        ></div>

                        <div
                            role="dialog"
                            aria-modal="true"
                            className="relative z-[101] my-auto w-[300px] animate-scale-in overflow-hidden rounded-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <img
                                src={selectedImage}
                                alt="Payment Proof"
                                className="h-auto max-h-[80vh] w-full object-contain"
                            />
                        </div>
                    </div>,
                    document.getElementById('modal-root') || document.body,
                )}

            {/* BankDetails Modal */}

            {viewBankDetails && !order.payment_proof && (
                <>
                    {createPortal(
                        windowSize.width > 1024 ? (
                            //  PC VERSION
                            <div className="fixed inset-0 z-50 flex items-center justify-center">
                                {/* Backdrop */}
                                <div
                                    className="fixed inset-0 transition-opacity duration-300 bg-black/30 backdrop-blur-sm"
                                    onClick={() => setViewBankDetails(false)}
                                />

                                {/* Modal Card */}
                                <div className="relative z-10 w-full max-w-3xl p-8 rounded-md bg-backgroundLight dark:bg-surface-1-dark dark:text-main-text-dark text-main-text-light">
                                    {/* Header */}
                                    <div className="flex items-center justify-between pb-4">
                                        <h2 className="text-xl font-semibold tracking-tight dark:text-main-text-dark text-main-text-light0">
                                            {__('Bank Details')}
                                        </h2>

                                    </div>

                                    {/* Content */}
                                    <div className="mt-6 max-h-[70vh] space-y-6 overflow-y-auto pr-1">
                                        <div className="space-y-6">
                                            {/* Bank Name */}
                                            <div className="p-4 transition-all bg-white border rounded-md border-surface-3-light group dark:border-surface-3-dark dark:bg-surface-2-dark ">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <label className="flex items-center gap-2 mb-1 text-xs font-semibold tracking-wide uppercase text-sub-text-light dark:text-sub-text-dark">
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
                                                                    d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z"
                                                                />
                                                            </svg>
                                                            {__('Bank Name')}
                                                        </label>
                                                        <p className="text-lg font-bold text-sub-text-light dark:text-sub-text-dark">
                                                            {order?.order_items[0]?.inventory_item?.smartphone
                                                                ?.category?.distributor
                                                                ?.bank_name || 'N/A'}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() =>
                                                            handleCopy(
                                                                order?.order_items[0]?.inventory_item?.smartphone
                                                                    ?.category?.distributor
                                                                    ?.bank_name || 'N/A',
                                                                'bank_name',
                                                            )
                                                        }
                                                        className="relative flex items-center justify-center text-gray-600 transition-all rounded-md bg-main-text-dark h-9 w-9 hover:bg-main-text-dark/80 dark:bg-surface-1-dark dark:text-white/60 dark:hover:bg-surface-3-dark"
                                                    >
                                                        {copiedField === 'bank_name' ? (
                                                            <>
                                                                <svg
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    fill="none"
                                                                    viewBox="0 0 24 24"
                                                                    strokeWidth={2}
                                                                    stroke="currentColor"
                                                                    className="w-5 h-5 "
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        d="M4.5 12.75l6 6 9-13.5"
                                                                    />
                                                                </svg>
                                                                <span className="absolute px-2 py-1 text-xs font-semibold rounded-md shadow-lg text-main-text-light dark:text-main-text-dark bg-surface-3-light top-10 whitespace-nowrap dark:bg-surface-3-dark">
                                                                    {__('Copied')}!
                                                                </span>
                                                            </>
                                                        ) : (
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                strokeWidth={2}
                                                                stroke="currentColor"
                                                                className="w-5 h-5"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"
                                                                />
                                                            </svg>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Account Name */}
                                            <div className="p-4 transition-all bg-white border rounded-md border-surface-3-light group dark:border-surface-3-dark dark:bg-surface-2-dark ">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <label className="flex items-center gap-2 mb-1 text-xs font-semibold tracking-wide uppercase text-sub-text-light dark:text-sub-text-dark">
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
                                                                    d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                                                                />
                                                            </svg>
                                                            {__('Account Name')}
                                                        </label>
                                                        <p className="text-lg font-bold text-sub-text-light dark:text-sub-text-dark">
                                                            {order?.order_items[0]?.inventory_item?.smartphone
                                                                ?.category?.distributor
                                                                ?.bank_account_name || 'N/A'}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() =>
                                                            handleCopy(
                                                                order?.order_items[0]?.inventory_item?.smartphone
                                                                    ?.category?.distributor
                                                                    ?.bank_account_name || 'N/A',
                                                                'account_name',
                                                            )
                                                        }
                                                        className="relative flex items-center justify-center text-gray-600 transition-all rounded-md bg-main-text-dark h-9 w-9 hover:bg-main-text-dark/80 dark:bg-surface-1-dark dark:text-white/60 dark:hover:bg-surface-3-dark"
                                                    >
                                                        {copiedField === 'account_name' ? (
                                                            <>
                                                                <svg
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    fill="none"
                                                                    viewBox="0 0 24 24"
                                                                    strokeWidth={2}
                                                                    stroke="currentColor"
                                                                    className="w-5 h-5"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        d="M4.5 12.75l6 6 9-13.5"
                                                                    />
                                                                </svg>
                                                                <span className="absolute px-2 py-1 text-xs font-semibold rounded-md shadow-lg text-main-text-light dark:text-main-text-dark bg-surface-3-light top-10 whitespace-nowrap dark:bg-surface-3-dark">
                                                                    {__('Copied')}!
                                                                </span>
                                                            </>
                                                        ) : (
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                strokeWidth={2}
                                                                stroke="currentColor"
                                                                className="w-5 h-5"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"
                                                                />
                                                            </svg>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Account Number */}
                                            <div className="p-4 transition-all bg-white border rounded-md border-surface-3-light group dark:border-surface-3-dark dark:bg-surface-2-dark ">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <label className="flex items-center gap-2 mb-1 text-xs font-semibold tracking-wide uppercase text-sub-text-light dark:text-sub-text-dark">
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
                                                                    d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
                                                                />
                                                            </svg>
                                                            {__('Account Number')}
                                                        </label>
                                                        <p className="text-lg font-bold text-sub-text-light dark:text-sub-text-dark">
                                                            {order?.order_items[0]?.inventory_item?.smartphone
                                                                ?.category?.distributor
                                                                ?.bank_account_no || 'N/A'}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() =>
                                                            handleCopy(
                                                                order?.order_items[0]?.inventory_item?.smartphone
                                                                    ?.category?.distributor
                                                                    ?.bank_account_no || 'N/A',
                                                                'account_number',
                                                            )
                                                        }
                                                        className="relative flex items-center justify-center text-gray-600 transition-all rounded-md bg-main-text-dark h-9 w-9 hover:bg-main-text-dark/80 dark:bg-surface-1-dark dark:text-white/60 dark:hover:bg-surface-3-dark"
                                                    >
                                                        {copiedField === 'account_number' ? (
                                                            <>
                                                                <svg
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    fill="none"
                                                                    viewBox="0 0 24 24"
                                                                    strokeWidth={2}
                                                                    stroke="currentColor"
                                                                    className="w-5 h-5"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        d="M4.5 12.75l6 6 9-13.5"
                                                                    />
                                                                </svg>
                                                                <span className="absolute px-2 py-1 text-xs font-semibold rounded-md shadow-lg text-main-text-light dark:text-main-text-dark bg-surface-3-light top-10 whitespace-nowrap dark:bg-surface-3-dark">
                                                                    {__('Copied')}!
                                                                </span>
                                                            </>
                                                        ) : (
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                strokeWidth={2}
                                                                stroke="currentColor"
                                                                className="w-5 h-5"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"
                                                                />
                                                            </svg>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>

                                            {/* IBAN */}
                                            <div className="p-4 transition-all bg-white border rounded-md border-surface-3-light group dark:border-surface-3-dark dark:bg-surface-2-dark ">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <label className="flex items-center gap-2 mb-1 text-xs font-semibold tracking-wide uppercase text-sub-text-light dark:text-sub-text-dark">
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
                                                                    d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"
                                                                />
                                                            </svg>
                                                            {__('IBAN')}
                                                        </label>
                                                        <p className="text-lg font-bold text-sub-text-light dark:text-sub-text-dark">
                                                            {order?.order_items[0]?.inventory_item?.smartphone
                                                                ?.category?.distributor?.iban ||
                                                                'N/A'}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() =>
                                                            handleCopy(
                                                                order?.order_items[0]?.inventory_item?.smartphone
                                                                    ?.category?.distributor?.iban ||
                                                                'N/A',
                                                                'iban',
                                                            )
                                                        }
                                                        className="relative flex items-center justify-center text-gray-600 transition-all rounded-md bg-main-text-dark h-9 w-9 hover:bg-main-text-dark/80 dark:bg-surface-1-dark dark:text-white/60 dark:hover:bg-surface-3-dark"
                                                    >
                                                        {copiedField === 'iban' ? (
                                                            <>
                                                                <svg
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    fill="none"
                                                                    viewBox="0 0 24 24"
                                                                    strokeWidth={2}
                                                                    stroke="currentColor"
                                                                    className="w-5 h-5"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        d="M4.5 12.75l6 6 9-13.5"
                                                                    />
                                                                </svg>
                                                                <span className="absolute px-2 py-1 text-xs font-semibold rounded-md shadow-lg text-main-text-light dark:text-main-text-dark bg-surface-3-light top-10 whitespace-nowrap dark:bg-surface-3-dark">
                                                                    {__('Copied')}!
                                                                </span>
                                                            </>
                                                        ) : (
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                strokeWidth={2}
                                                                stroke="currentColor"
                                                                className="w-5 h-5"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"
                                                                />
                                                            </svg>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>

                                            {/* SWIFT Code */}
                                            <div className="p-4 transition-all bg-white border rounded-md border-surface-3-light group dark:border-surface-3-dark dark:bg-surface-2-dark ">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <label className="flex items-center gap-2 mb-1 text-xs font-semibold tracking-wide uppercase text-sub-text-light dark:text-sub-text-dark">
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
                                                                    d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z"
                                                                />
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75h-.75v-.75z"
                                                                />
                                                            </svg>
                                                            {__('SWIFT Code')}
                                                        </label>
                                                        <p className="text-lg font-bold text-sub-text-light dark:text-sub-text-dark">
                                                            {order?.order_items[0]?.inventory_item?.smartphone
                                                                ?.category?.distributor
                                                                ?.swift_code || 'N/A'}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() =>
                                                            handleCopy(
                                                                order?.order_items[0]?.inventory_item?.smartphone
                                                                    ?.category?.distributor
                                                                    ?.swift_code || 'N/A',
                                                                'swift_code',
                                                            )
                                                        }
                                                        className="relative flex items-center justify-center text-gray-600 transition-all rounded-md bg-main-text-dark h-9 w-9 hover:bg-main-text-dark/80 dark:bg-surface-1-dark dark:text-white/60 dark:hover:bg-surface-3-dark"
                                                    >
                                                        {copiedField === 'swift_code' ? (
                                                            <>
                                                                <svg
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    fill="none"
                                                                    viewBox="0 0 24 24"
                                                                    strokeWidth={2}
                                                                    stroke="currentColor"
                                                                    className="w-5 h-5"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        d="M4.5 12.75l6 6 9-13.5"
                                                                    />
                                                                </svg>
                                                                <span className="absolute px-2 py-1 text-xs font-semibold rounded-md shadow-lg text-main-text-light dark:text-main-text-dark bg-surface-3-light top-10 whitespace-nowrap dark:bg-surface-3-dark">
                                                                    {__('Copied')}!
                                                                </span>
                                                            </>
                                                        ) : (
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                strokeWidth={2}
                                                                stroke="currentColor"
                                                                className="w-5 h-5"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"
                                                                />
                                                            </svg>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Important Notice */}
                                            <div className="p-4 mt-6 border-l-4 rounded-md border-amber-500 bg-amber-50 dark:bg-amber-900/10">
                                                <div className="flex gap-3">
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        strokeWidth={2}
                                                        stroke="currentColor"
                                                        className="flex-shrink-0 w-6 h-6 text-amber-600 dark:text-amber-400"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                                                        />
                                                    </svg>
                                                    <div>
                                                        <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                                                            {__('Important Instructions')}
                                                        </p>
                                                        <ul className="mt-2 space-y-1 text-xs text-amber-800 dark:text-amber-200/80">
                                                            <li className="flex items-start gap-2">
                                                                <span className="mt-0.5 flex-shrink-0">
                                                                    •
                                                                </span>
                                                                <span>
                                                                    {__('Please include your order number in the payment reference')}
                                                                </span>
                                                            </li>
                                                            <li className="flex items-start gap-2">
                                                                <span className="mt-0.5 flex-shrink-0">
                                                                    •
                                                                </span>
                                                                <span>
                                                                    {__('Upload payment proof after completing the transfer')}
                                                                </span>
                                                            </li>
                                                            <li className="flex items-start gap-2">
                                                                <span className="mt-0.5 flex-shrink-0">
                                                                    •
                                                                </span>
                                                                <span>
                                                                    {__('Processing time: 2-3 business days')}
                                                                </span>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            //  MOBILE VERSION
                            <div className="fixed inset-0 z-50 bg-black">
                                {/* Backdrop */}
                                <div className="absolute inset-0 bg-black/70"></div>

                                {/* Fullscreen slide-over */}
                                <div className="relative z-10 flex h-[100dvh] w-full flex-col overflow-y-auto bg-backgroundLight text-main-text-light dark:bg-surface-1-dark dark:text-main-text-dark pb-24">
                                    {/* Top Bar */}

                                    <div className="flex items-center justify-center px-4 py-3">
                                        <button
                                            onClick={() => setViewBankDetails(false)}
                                            className="absolute p-1 rounded-full left-4"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth={1.5}
                                                stroke="currentColor"
                                                className="size-6"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
                                                />
                                            </svg>
                                        </button>

                                        <h3 className="text-base font-semibold truncate text-main-text-light dark:text-main-text-dark sm:text-lg">
                                            {__('Bank Details')}
                                        </h3>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 p-4 my-4 space-y-6">
                                        <div className="space-y-6">
                                            {/* Bank Name */}
                                            <div className="p-4 transition-all bg-white border rounded-md border-surface-3-light group dark:border-surface-3-dark dark:bg-surface-2-dark ">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <label className="flex items-center gap-2 mb-1 text-xs font-semibold tracking-wide uppercase text-sub-text-light dark:text-sub-text-dark">
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
                                                                    d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z"
                                                                />
                                                            </svg>
                                                            {__('Bank Name')}
                                                        </label>
                                                        <p className="text-lg font-bold text-sub-text-light dark:text-sub-text-dark">
                                                            {order?.order_items[0]?.inventory_item?.smartphone
                                                                ?.category?.distributor
                                                                ?.bank_name || 'N/A'}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() =>
                                                            handleCopy(
                                                                order?.order_items[0]?.inventory_item?.smartphone
                                                                    ?.category?.distributor
                                                                    ?.bank_name || 'N/A',
                                                                'bank_name',
                                                            )
                                                        }
                                                        className="relative flex items-center justify-center text-gray-600 transition-all rounded-md bg-main-text-dark h-9 w-9 hover:bg-main-text-dark/80 dark:bg-surface-1-dark dark:text-white/60 dark:hover:bg-surface-3-dark"
                                                    >
                                                        {copiedField === 'bank_name' ? (
                                                            <>
                                                                <svg
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    fill="none"
                                                                    viewBox="0 0 24 24"
                                                                    strokeWidth={2}
                                                                    stroke="currentColor"
                                                                    className="w-5 h-5 "
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        d="M4.5 12.75l6 6 9-13.5"
                                                                    />
                                                                </svg>
                                                                <span className="absolute px-2 py-1 text-xs font-semibold rounded-md shadow-lg text-main-text-light dark:text-main-text-dark bg-surface-3-light top-10 whitespace-nowrap dark:bg-surface-3-dark">
                                                                    {__('Copied')}!
                                                                </span>
                                                            </>
                                                        ) : (
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                strokeWidth={2}
                                                                stroke="currentColor"
                                                                className="w-5 h-5"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"
                                                                />
                                                            </svg>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Account Name */}
                                            <div className="p-4 transition-all bg-white border rounded-md border-surface-3-light group dark:border-surface-3-dark dark:bg-surface-2-dark ">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <label className="flex items-center gap-2 mb-1 text-xs font-semibold tracking-wide uppercase text-sub-text-light dark:text-sub-text-dark">
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
                                                                    d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                                                                />
                                                            </svg>
                                                            {__('Account Name')}
                                                        </label>
                                                        <p className="text-lg font-bold text-sub-text-light dark:text-sub-text-dark">
                                                            {order?.order_items[0]?.inventory_item?.smartphone
                                                                ?.category?.distributor
                                                                ?.bank_account_name || 'N/A'}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() =>
                                                            handleCopy(
                                                                order?.order_items[0]?.inventory_item?.smartphone
                                                                    ?.category?.distributor
                                                                    ?.bank_account_name || 'N/A',
                                                                'account_name',
                                                            )
                                                        }
                                                        className="relative flex items-center justify-center text-gray-600 transition-all rounded-md bg-main-text-dark h-9 w-9 hover:bg-main-text-dark/80 dark:bg-surface-1-dark dark:text-white/60 dark:hover:bg-surface-3-dark"
                                                    >
                                                        {copiedField === 'account_name' ? (
                                                            <>
                                                                <svg
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    fill="none"
                                                                    viewBox="0 0 24 24"
                                                                    strokeWidth={2}
                                                                    stroke="currentColor"
                                                                    className="w-5 h-5"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        d="M4.5 12.75l6 6 9-13.5"
                                                                    />
                                                                </svg>
                                                                <span className="absolute px-2 py-1 text-xs font-semibold rounded-md shadow-lg text-main-text-light dark:text-main-text-dark bg-surface-3-light top-10 whitespace-nowrap dark:bg-surface-3-dark">
                                                                    {__('Copied')}!
                                                                </span>
                                                            </>
                                                        ) : (
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                strokeWidth={2}
                                                                stroke="currentColor"
                                                                className="w-5 h-5"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"
                                                                />
                                                            </svg>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Account Number */}
                                            <div className="p-4 transition-all bg-white border rounded-md border-surface-3-light group dark:border-surface-3-dark dark:bg-surface-2-dark ">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <label className="flex items-center gap-2 mb-1 text-xs font-semibold tracking-wide uppercase text-sub-text-light dark:text-sub-text-dark">
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
                                                                    d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
                                                                />
                                                            </svg>
                                                            {__('Account Number')}
                                                        </label>
                                                        <p className="text-lg font-bold text-sub-text-light dark:text-sub-text-dark">
                                                            {order?.order_items[0]?.inventory_item?.smartphone
                                                                ?.category?.distributor
                                                                ?.bank_account_no || 'N/A'}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() =>
                                                            handleCopy(
                                                                order?.order_items[0]?.inventory_item?.smartphone
                                                                    ?.category?.distributor
                                                                    ?.bank_account_no || 'N/A',
                                                                'account_number',
                                                            )
                                                        }
                                                        className="relative flex items-center justify-center text-gray-600 transition-all rounded-md bg-main-text-dark h-9 w-9 hover:bg-main-text-dark/80 dark:bg-surface-1-dark dark:text-white/60 dark:hover:bg-surface-3-dark"
                                                    >
                                                        {copiedField === 'account_number' ? (
                                                            <>
                                                                <svg
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    fill="none"
                                                                    viewBox="0 0 24 24"
                                                                    strokeWidth={2}
                                                                    stroke="currentColor"
                                                                    className="w-5 h-5"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        d="M4.5 12.75l6 6 9-13.5"
                                                                    />
                                                                </svg>
                                                                <span className="absolute px-2 py-1 text-xs font-semibold rounded-md shadow-lg text-main-text-light dark:text-main-text-dark bg-surface-3-light top-10 whitespace-nowrap dark:bg-surface-3-dark">
                                                                    {__('Copied')}!
                                                                </span>
                                                            </>
                                                        ) : (
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                strokeWidth={2}
                                                                stroke="currentColor"
                                                                className="w-5 h-5"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"
                                                                />
                                                            </svg>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>

                                            {/* IBAN */}
                                            <div className="p-4 transition-all bg-white border rounded-md border-surface-3-light group dark:border-surface-3-dark dark:bg-surface-2-dark ">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <label className="flex items-center gap-2 mb-1 text-xs font-semibold tracking-wide uppercase text-sub-text-light dark:text-sub-text-dark">
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
                                                                    d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"
                                                                />
                                                            </svg>
                                                            {__('IBAN')}
                                                        </label>
                                                        <p className="text-lg font-bold text-sub-text-light dark:text-sub-text-dark">
                                                            {order?.order_items[0]?.inventory_item?.smartphone
                                                                ?.category?.distributor?.iban ||
                                                                'N/A'}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() =>
                                                            handleCopy(
                                                                order?.order_items[0]?.inventory_item?.smartphone
                                                                    ?.category?.distributor?.iban ||
                                                                'N/A',
                                                                'iban',
                                                            )
                                                        }
                                                        className="relative flex items-center justify-center text-gray-600 transition-all rounded-md bg-main-text-dark h-9 w-9 hover:bg-main-text-dark/80 dark:bg-surface-1-dark dark:text-white/60 dark:hover:bg-surface-3-dark"
                                                    >
                                                        {copiedField === 'iban' ? (
                                                            <>
                                                                <svg
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    fill="none"
                                                                    viewBox="0 0 24 24"
                                                                    strokeWidth={2}
                                                                    stroke="currentColor"
                                                                    className="w-5 h-5"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        d="M4.5 12.75l6 6 9-13.5"
                                                                    />
                                                                </svg>
                                                                <span className="absolute px-2 py-1 text-xs font-semibold rounded-md shadow-lg text-main-text-light dark:text-main-text-dark bg-surface-3-light top-10 whitespace-nowrap dark:bg-surface-3-dark">
                                                                    {__('Copied')}!
                                                                </span>
                                                            </>
                                                        ) : (
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                strokeWidth={2}
                                                                stroke="currentColor"
                                                                className="w-5 h-5"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"
                                                                />
                                                            </svg>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>

                                            {/* SWIFT Code */}
                                            <div className="p-4 transition-all bg-white border rounded-md border-surface-3-light group dark:border-surface-3-dark dark:bg-surface-2-dark ">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <label className="flex items-center gap-2 mb-1 text-xs font-semibold tracking-wide uppercase text-sub-text-light dark:text-sub-text-dark">
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
                                                                    d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z"
                                                                />
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75h-.75v-.75z"
                                                                />
                                                            </svg>
                                                            {__('SWIFT Code')}
                                                        </label>
                                                        <p className="text-lg font-bold text-sub-text-light dark:text-sub-text-dark">
                                                            {order?.order_items[0]?.inventory_item?.smartphone
                                                                ?.category?.distributor
                                                                ?.swift_code || 'N/A'}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() =>
                                                            handleCopy(
                                                                order?.order_items[0]?.inventory_item?.smartphone
                                                                    ?.category?.distributor
                                                                    ?.swift_code || 'N/A',
                                                                'swift_code',
                                                            )
                                                        }
                                                        className="relative flex items-center justify-center text-gray-600 transition-all rounded-md bg-main-text-dark h-9 w-9 hover:bg-main-text-dark/80 dark:bg-surface-1-dark dark:text-white/60 dark:hover:bg-surface-3-dark"
                                                    >
                                                        {copiedField === 'swift_code' ? (
                                                            <>
                                                                <svg
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    fill="none"
                                                                    viewBox="0 0 24 24"
                                                                    strokeWidth={2}
                                                                    stroke="currentColor"
                                                                    className="w-5 h-5"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        d="M4.5 12.75l6 6 9-13.5"
                                                                    />
                                                                </svg>
                                                                <span className="absolute px-2 py-1 text-xs font-semibold rounded-md shadow-lg text-main-text-light dark:text-main-text-dark bg-surface-3-light top-10 whitespace-nowrap dark:bg-surface-3-dark">
                                                                    {__('Copied')}!
                                                                </span>
                                                            </>
                                                        ) : (
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                strokeWidth={2}
                                                                stroke="currentColor"
                                                                className="w-5 h-5"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"
                                                                />
                                                            </svg>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Important Notice */}
                                            <div className="p-4 mt-6 border-l-4 rounded-md border-amber-500 bg-amber-50 dark:bg-amber-900/10">
                                                <div className="flex gap-3">
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        strokeWidth={2}
                                                        stroke="currentColor"
                                                        className="flex-shrink-0 w-6 h-6 text-amber-600 dark:text-amber-400"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                                                        />
                                                    </svg>
                                                    <div>
                                                        <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                                                            {__('Important Instructions')}
                                                        </p>
                                                        <ul className="mt-2 space-y-1 text-xs text-amber-800 dark:text-amber-200/80">
                                                            <li className="flex items-start gap-2">
                                                                <span className="mt-0.5 flex-shrink-0">
                                                                    •
                                                                </span>
                                                                <span>
                                                                    {__('Please include your order number in the payment reference')}
                                                                </span>
                                                            </li>
                                                            <li className="flex items-start gap-2">
                                                                <span className="mt-0.5 flex-shrink-0">
                                                                    •
                                                                </span>
                                                                <span>
                                                                    {__('Upload payment proof after completing the transfer')}
                                                                </span>
                                                            </li>
                                                            <li className="flex items-start gap-2">
                                                                <span className="mt-0.5 flex-shrink-0">
                                                                    •
                                                                </span>
                                                                <span>
                                                                    {__('Processing time: 2-3 business days')}
                                                                </span>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ),
                        document.getElementById('modal-root') || document.body,
                    )}
                </>
            )
            }
        </MainLayout >
    );
}
