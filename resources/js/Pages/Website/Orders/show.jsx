import React, { useEffect, useRef, useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import MainLayout from '@/Layouts/Website/MainLayout';
import Placeholder from 'asset/assets/images/product/placeholder.jpg';
import getContrastingColor from '@/Hooks/useColorContraster';
import useWindowSize from '@/Hooks/useWindowSize';
import { createPortal } from 'react-dom';
import CustomFileUploader from '@/Components/CustomFileUploader';
import Toast from '@/Components/Toast';
import VideoWithThumbnail from '@/Components/VideoWithThumbnail';
import axios from 'axios';

export default function OrderView({ order }) {
    const { currency } = usePage().props;
    const windowSize = useWindowSize();

    const [showVideoModal, setShowVideoModal] = useState(false);
    const [selectedVideo, setSelectedVideo] = useState(null);
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
        return clean.toString();
    })();

    const baseUrlRef = useRef(cleanUrl);

    const getStatusColor = (status) => {
        const statusLower = status.toLowerCase();
        switch (statusLower) {
            case 'pending':
                return 'bg-yellow-500 text-white';
            case 'paid':
                return 'bg-blue-500 text-white';
            case 'shipped':
                return 'bg-pink-500 text-white';
            case 'delivered':
                return 'bg-green-500 text-white';
            case 'arrived_locally':
                return 'bg-stone-500 text-white';
            case 'failed':
                return 'bg-red-500 text-white';
            case 'expired':
                return 'bg-gray-500 text-white';
            case 'awaiting_payment':
                return 'bg-indigo-500 text-white';
            case 'blockchain_confirmation_pending':
                return 'bg-indigo-500 text-white';

            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
        }
    };

    const handleVideoView = (videoUrl) => {
        setSelectedVideo(videoUrl);
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
                        errors.payment_proof || 'Failed to upload payment proof. Please try again.',
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

        if (modal === 'packaging-recordings') {
            setSelectedVideo(mediaUrl || null);
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
            url.searchParams.set('url', selectedVideo);

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
            window.history.replaceState({}, '', baseUrlRef.current);
        }
    }, [showVideoModal, showImageModal, selectedVideo, selectedImage, viewBankDetails]);

    // Pop State Handling
    useEffect(() => {
        const handlePopState = () => {
            if (showVideoModal) {
                setShowVideoModal(false);
                setSelectedVideo(null);
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
            <Head title={`Order #${order.order_no}`} />

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
                                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-red-500">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth={2}
                                                stroke="currentColor"
                                                className="h-5 w-5 text-white"
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
                                                Payment Proof Required
                                            </p>
                                            <p className="text-xs text-red-700 dark:text-red-200/80">
                                                Please upload your payment proof to confirm this
                                                order
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={() => setViewBankDetails(true)}
                                            className="flex-shrink-0 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-red-700"
                                        >
                                            View Bank Details
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
                                            className="flex-shrink-0 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-red-700"
                                        >
                                            Upload Now
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
                                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-amber-500">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth={2}
                                                stroke="currentColor"
                                                className="h-5 w-5 text-white"
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
                                                Payment Proof Submitted - Awaiting Approval
                                            </p>
                                            <p className="mt-1 text-xs text-amber-800 dark:text-amber-200/80">
                                                We're reviewing your payment proof. This usually
                                                takes 1-2 business days. If your order isn't
                                                approved within 2-3 days, please contact our support
                                                team.
                                            </p>
                                        </div>
                                    </div>
                                    <Link
                                        href="#"
                                        className="flex-shrink-0 whitespace-nowrap rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-amber-700"
                                    >
                                        Contact Support
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}

                <div
                    className={`mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 ${windowSize.width < 1024 && 'mb-20'}`}
                >
                    {/* Header */}
                    <div className="mb-8">
                        <Link
                            href={route('website.orders.index')}
                            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2}
                                stroke="currentColor"
                                className="h-4 w-4"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                                />
                            </svg>
                            Back to Orders
                        </Link>

                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white/80">
                                    Order #{order.order_no}
                                </h1>
                                <p className="mt-1 text-sm text-gray-600 dark:text-white/60">
                                    Placed on {order.order_placed_date}
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
                            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-deepcharcoal">
                                <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white/80">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={1.5}
                                            stroke="currentColor"
                                            className="h-5 w-5 text-indigo-600 dark:text-indigo-400"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                                            />
                                        </svg>
                                    </div>
                                    Order Items
                                </h2>
                                <div className="space-y-4">
                                    {order.order_items?.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-white/10 dark:bg-gray-900/50 sm:flex-row sm:items-center"
                                        >
                                            <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white dark:bg-deepcharcoal">
                                                <img
                                                    src={
                                                        item?.smartphone
                                                            ?.smartphone_image_urls?.[0] ||
                                                        Placeholder
                                                    }
                                                    alt={item?.smartphone?.model_name?.name}
                                                    className="h-full w-full object-cover"
                                                    loading="lazy"
                                                    onError={(e) => (e.target.src = Placeholder)}
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="mb-1 font-semibold text-gray-900 dark:text-white/80">
                                                    {item?.smartphone?.model_name?.name || 'N/A'}
                                                </h3>
                                                <p className="mb-2 text-sm text-gray-600 dark:text-white/60">
                                                    {item?.smartphone?.capacity?.name && (
                                                        <span className="mr-2">
                                                            {item.smartphone.capacity.name}
                                                        </span>
                                                    )}
                                                    <span
                                                        className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium"
                                                        style={{
                                                            backgroundColor: item?.color?.code,
                                                            color: getContrastingColor(
                                                                item?.color?.code,
                                                            ),
                                                        }}
                                                    >
                                                        {item?.color?.name}
                                                    </span>
                                                </p>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-600 dark:text-white/60">
                                                        Qty: {item.quantity}
                                                    </span>
                                                    <span className="text-lg font-bold text-gray-900 dark:text-white/80">
                                                        {currency?.symbol}
                                                        {parseFloat(
                                                            item.unit_price * item.quantity,
                                                        ).toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Payment Proof Section */}
                            {order.payment_method === 'bank_transfer' && (
                                <div
                                    id="payment-proof-section"
                                    className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-deepcharcoal"
                                >
                                    <div className="mb-4 flex items-center justify-between">
                                        <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white/80">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    strokeWidth={1.5}
                                                    stroke="currentColor"
                                                    className="h-5 w-5 text-indigo-600 dark:text-indigo-400"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                                                    />
                                                </svg>
                                            </div>
                                            Payment Proof
                                        </h2>
                                        {order.payment_proof && order.status === 'pending' && (
                                            <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    strokeWidth={2}
                                                    stroke="currentColor"
                                                    className="h-4 w-4"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                                                    />
                                                </svg>
                                                Pending Approval
                                            </span>
                                        )}
                                    </div>

                                    {order.payment_proof ? (
                                        <div>
                                            <div
                                                onClick={() => handleImageView(order.payment_proof)}
                                                className="group cursor-pointer overflow-hidden rounded-xl border-2 border-gray-600 bg-deepcharcoal transition-all dark:border-white/10"
                                            >
                                                <img
                                                    src={order.payment_proof}
                                                    alt="Payment Proof"
                                                    className="h-64 w-full object-contain transition-transform duration-300 group-hover:scale-105"
                                                />
                                            </div>

                                            {order.status === 'pending' && (
                                                <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/30 dark:bg-amber-900/10">
                                                    <div className="flex gap-3">
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            strokeWidth={2}
                                                            stroke="currentColor"
                                                            className="h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-400"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                                                            />
                                                        </svg>
                                                        <div className="flex-1">
                                                            <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                                                                Your payment proof is under review
                                                            </p>
                                                            <p className="mt-1 text-xs text-amber-700 dark:text-amber-200/80">
                                                                We'll notify you once it's approved.
                                                                This typically takes 1-2 business
                                                                days.
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
                                                uploadButtonText="Upload Payment Proof"
                                                disabled={isUploading}
                                            />

                                            {/* Upload Button */}
                                            {paymentProofPreview && (
                                                <button
                                                    onClick={handleUploadPaymentProof}
                                                    disabled={isUploading}
                                                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    {isUploading ? (
                                                        <>
                                                            <svg
                                                                className="h-5 w-5 animate-spin"
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
                                                            Uploading...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                strokeWidth={2}
                                                                stroke="currentColor"
                                                                className="h-5 w-5"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                                                                />
                                                            </svg>
                                                            Upload Payment Proof
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
                                <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-deepcharcoal">
                                    <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white/80">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth={1.5}
                                                stroke="currentColor"
                                                className="h-5 w-5 text-indigo-600 dark:text-indigo-400"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"
                                                />
                                            </svg>
                                        </div>
                                        Packaging Videos
                                    </h2>
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        {order.order_package_recordings.map((recording, index) => (
                                            <div
                                                key={index}
                                                onClick={() => {
                                                    handleVideoView(recording.package_video);
                                                    setSelectedPackageVideoID(recording.id);
                                                }}
                                                className="group relative cursor-pointer overflow-hidden rounded-xl border-2 border-gray-600 bg-deepcharcoal transition-all dark:border-white/10"
                                            >
                                                <div className="flex aspect-video items-center justify-center bg-deepcharcoal">
                                                    <VideoWithThumbnail
                                                        videoUrl={recording.package_video}
                                                        autoPlay={false}
                                                        controls={false}
                                                        muted
                                                    />

                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 transition group-hover:bg-black/40">
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            strokeWidth="1.5"
                                                            stroke="currentColor"
                                                            className="h-12 w-12 text-indigo-400"
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
                                                    <p className="text-sm font-semibold text-gray-900 dark:text-white/80">
                                                        Packaging Video {index + 1}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Shipping Address */}
                            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-deepcharcoal">
                                <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white/80">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={2}
                                            stroke="currentColor"
                                            className="h-5 w-5 text-indigo-600 dark:text-indigo-400"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                                            />
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                                            />
                                        </svg>
                                    </div>
                                    Shipping Address
                                </h2>
                                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900/50">
                                    <address className="text-sm not-italic text-gray-600 dark:text-white/80">
                                        <p className="font-semibold text-gray-900 dark:text-white/80">
                                            {order.customer?.user?.name}
                                        </p>
                                        <p className="mt-2">
                                            {order.customer?.address_line1}
                                            {order.customer?.address_line2 && (
                                                <>, {order.customer.address_line2}</>
                                            )}
                                        </p>
                                        <p>
                                            {order.customer?.city}, {order.customer?.state}{' '}
                                            {order.customer?.postal_code}
                                        </p>
                                        <p>{order.customer?.country?.name}</p>
                                        {order.customer?.user?.phone && (
                                            <p className="mt-2 flex items-center gap-2">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    strokeWidth={2}
                                                    stroke="currentColor"
                                                    className="h-4 w-4"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
                                                    />
                                                </svg>
                                                {order.customer.user.phone}
                                            </p>
                                        )}
                                    </address>
                                </div>
                            </div>

                            {/* Courier Details */}
                            {order?.status != 'paid' && order?.status != 'pending' && (
                                <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-deepcharcoal">
                                    <h2 className="mb-6 flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white/80">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth={2}
                                                stroke="currentColor"
                                                className="h-5 w-5 text-indigo-600 dark:text-indigo-400"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 4.5v11.25M15.75 4.5v11.25m-7.5-9h7.5"
                                                />
                                            </svg>
                                        </div>
                                        Courier Details
                                    </h2>

                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                        {/* Courier Company */}
                                        <div className="group rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100/50 p-4 transition-all hover:border-indigo-200 hover:shadow-md dark:border-white/10 dark:from-gray-900/50 dark:to-gray-900/30 dark:hover:border-indigo-800">
                                            <div className="mb-2 flex items-center gap-2">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white dark:bg-deepcharcoal">
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        strokeWidth={2}
                                                        stroke="currentColor"
                                                        className="h-4 w-4 text-indigo-600 dark:text-indigo-400"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z"
                                                        />
                                                    </svg>
                                                </div>
                                                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-white/60">
                                                    Courier Company
                                                </span>
                                            </div>
                                            <p className="break-words text-base font-bold text-gray-900 dark:text-white/80">
                                                {order.courier_company || 'Not Assigned'}
                                            </p>
                                        </div>

                                        {/* Tracking Number */}
                                        <div className="group rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100/50 p-4 transition-all hover:border-indigo-200 hover:shadow-md dark:border-white/10 dark:from-gray-900/50 dark:to-gray-900/30 dark:hover:border-indigo-800">
                                            <div className="mb-2 flex items-center gap-2">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white dark:bg-deepcharcoal">
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        strokeWidth={2}
                                                        stroke="currentColor"
                                                        className="h-4 w-4 text-indigo-600 dark:text-indigo-400"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M5.25 8.25h15m-16.5 7.5h15m-1.8-13.5l-3.9 19.5m-2.1-19.5l-3.9 19.5"
                                                        />
                                                    </svg>
                                                </div>
                                                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-white/60">
                                                    Tracking Number
                                                </span>
                                            </div>
                                            <p className="break-words font-mono text-base font-bold text-gray-900 dark:text-white/80">
                                                {order.tracking_no || 'N/A'}
                                            </p>
                                        </div>

                                        {/* Shipping Date */}
                                        <div className="group rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100/50 p-4 transition-all hover:border-indigo-200 hover:shadow-md dark:border-white/10 dark:from-gray-900/50 dark:to-gray-900/30 dark:hover:border-indigo-800">
                                            <div className="mb-2 flex items-center gap-2">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white dark:bg-deepcharcoal">
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        strokeWidth={2}
                                                        stroke="currentColor"
                                                        className="h-4 w-4 text-indigo-600 dark:text-indigo-400"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                                                        />
                                                    </svg>
                                                </div>
                                                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-white/60">
                                                    Shipping Date
                                                </span>
                                            </div>
                                            <p className="break-words text-base font-bold text-gray-900 dark:text-white/80">
                                                {order?.shipping_date || 'Pending'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Order Summary */}
                            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-deepcharcoal">
                                <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white/80">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={2}
                                            stroke="currentColor"
                                            className="h-5 w-5 text-indigo-600 dark:text-indigo-400"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"
                                            />
                                        </svg>
                                    </div>
                                    Order Summary
                                </h2>
                                <div className="space-y-3">
                                    {order.order_items?.map((item) => (
                                        <div key={item.id} className="flex justify-between text-sm">
                                            <span className="text-gray-600 dark:text-white/60">
                                                {item.smartphone?.model_name?.name} ×{' '}
                                                {item.quantity}
                                            </span>
                                            <span className="font-semibold text-gray-900 dark:text-white/80">
                                                {currency?.symbol}
                                                {parseFloat(item.sub_total).toFixed(2)}
                                            </span>
                                        </div>
                                    ))}

                                    {order.discount > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600 dark:text-white/60">
                                                Discount
                                            </span>
                                            <span className="font-semibold text-green-600 dark:text-green-400">
                                                -{currency?.symbol}
                                                {parseFloat(order.discount).toFixed(2)}
                                            </span>
                                        </div>
                                    )}

                                    <div className="border-t border-gray-200 pt-3 dark:border-white/10">
                                        <div className="flex items-center justify-between">
                                            <span className="text-base font-bold text-gray-900 dark:text-white/80">
                                                Total
                                            </span>
                                            <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                                                {currency?.symbol}
                                                {parseFloat(
                                                    order.total_amount || order.amount,
                                                ).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Method */}
                            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-deepcharcoal">
                                <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white/80">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={2}
                                            stroke="currentColor"
                                            className="h-5 w-5 text-indigo-600 dark:text-indigo-400"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
                                            />
                                        </svg>
                                    </div>
                                    Payment Method
                                </h2>
                                <div className="flex items-center gap-3 rounded-lg p-2">
                                    {order.payment_method === 'crypto' ? (
                                        <>
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500">
                                                <svg
                                                    className="h-6 w-6"
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
                                            <span className="font-semibold text-gray-900 dark:text-white/80">
                                                Crypto Payment
                                            </span>
                                        </>
                                    ) : order.payment_method === 'points' ? (
                                        <>
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth={2}
                                                stroke="currentColor"
                                                className="h-6 w-6 text-gray-700 dark:text-white/80"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
                                                />
                                            </svg>
                                            <span className="font-semibold text-gray-900 dark:text-white/80">
                                                Points Payment
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth={2}
                                                stroke="currentColor"
                                                className="h-6 w-6 text-gray-700 dark:text-white/80"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z"
                                                />
                                            </svg>
                                            <span className="font-semibold text-gray-900 dark:text-white/80">
                                                Bank Transfer
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Help Section */}
                            <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-indigo-50 to-purple-50 p-6 dark:border-white/10 dark:from-indigo-900/20 dark:to-purple-900/20">
                                <h2 className="mb-2 text-lg font-bold text-gray-900 dark:text-white/80">
                                    Need Help?
                                </h2>
                                <p className="mb-4 text-sm text-gray-600 dark:text-white/60">
                                    Contact our support team if you have any questions about your
                                    order.
                                </p>
                                <Link
                                    href="#"
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-indigo-500"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={2}
                                        stroke="currentColor"
                                        className="h-4 w-4"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                                        />
                                    </svg>
                                    Contact Support
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Video Modal */}
            {showVideoModal &&
                selectedVideo &&
                createPortal(
                    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto p-4">
                        <div
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
                            onClick={() => {
                                setShowVideoModal(false);
                                setSelectedVideo(null);
                            }}
                        ></div>

                        <div
                            role="dialog"
                            aria-modal="true"
                            className="relative z-[101] my-auto w-[500px] animate-scale-in overflow-hidden rounded-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <video
                                src={selectedVideo}
                                controls
                                autoPlay
                                className="h-auto max-h-[80vh] w-full object-cover"
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
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
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
                                    className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
                                    onClick={() => setViewBankDetails(false)}
                                />

                                {/* Modal Card */}
                                <div className="relative z-10 w-full max-w-2xl rounded-2xl bg-white/95 p-8 shadow-2xl dark:bg-deepcharcoal dark:text-white/80">
                                    {/* Header */}
                                    <div className="flex items-center justify-between border-b border-gray-200 pb-4 dark:border-gray-700">
                                        <h2 className="text-xl font-semibold tracking-tight text-gray-600 dark:text-white/80">
                                            Bank Details
                                        </h2>
                                        <button
                                            onClick={() => setViewBankDetails(false)}
                                            className="rounded-full p-1.5 transition-colors hover:bg-gray-100 dark:hover:bg-gray-900"
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
                                                    d="M6 18L18 6M6 6l12 12"
                                                />
                                            </svg>
                                        </button>
                                    </div>

                                    {/* Content */}
                                    <div className="mt-6 max-h-[70vh] space-y-6 overflow-y-auto pr-1">
                                        <div className="space-y-6">
                                            {/* Bank Name */}
                                            <div className="group rounded-xl border border-gray-200 bg-gray-50 p-4 transition-all hover:border-indigo-200 hover:bg-indigo-50/50 dark:border-white/10 dark:bg-gray-900/50 dark:hover:border-indigo-800 dark:hover:bg-indigo-900/10">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <label className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-white/60">
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                strokeWidth={2}
                                                                stroke="currentColor"
                                                                className="h-4 w-4"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z"
                                                                />
                                                            </svg>
                                                            Bank Name
                                                        </label>
                                                        <p className="text-lg font-bold text-gray-900 dark:text-white/80">
                                                            {order?.order_items[0]?.smartphone
                                                                ?.category?.distributor
                                                                ?.bank_name || 'N/A'}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() =>
                                                            handleCopy(
                                                                order?.order_items[0]?.smartphone
                                                                    ?.category?.distributor
                                                                    ?.bank_name || 'N/A',
                                                                'bank_name',
                                                            )
                                                        }
                                                        className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-white text-gray-600 transition-all hover:bg-indigo-100 hover:text-indigo-600 dark:bg-deepcharcoal dark:text-white/60 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-400"
                                                    >
                                                        {copiedField === 'bank_name' ? (
                                                            <>
                                                                <svg
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    fill="none"
                                                                    viewBox="0 0 24 24"
                                                                    strokeWidth={2}
                                                                    stroke="currentColor"
                                                                    className="h-5 w-5 text-indigo-600 dark:text-indigo-400"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        d="M4.5 12.75l6 6 9-13.5"
                                                                    />
                                                                </svg>
                                                                <span className="absolute top-8 whitespace-nowrap rounded-md bg-indigo-600 px-2 py-1 text-xs font-semibold text-white shadow-lg dark:bg-indigo-500">
                                                                    Copied!
                                                                </span>
                                                            </>
                                                        ) : (
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                strokeWidth={2}
                                                                stroke="currentColor"
                                                                className="h-5 w-5"
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
                                            <div className="group rounded-xl border border-gray-200 bg-gray-50 p-4 transition-all hover:border-indigo-200 hover:bg-indigo-50/50 dark:border-white/10 dark:bg-gray-900/50 dark:hover:border-indigo-800 dark:hover:bg-indigo-900/10">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <label className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-white/60">
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                strokeWidth={2}
                                                                stroke="currentColor"
                                                                className="h-4 w-4"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                                                                />
                                                            </svg>
                                                            Account Name
                                                        </label>
                                                        <p className="text-lg font-bold text-gray-900 dark:text-white/80">
                                                            {order?.order_items[0]?.smartphone
                                                                ?.category?.distributor
                                                                ?.bank_account_name || 'N/A'}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() =>
                                                            handleCopy(
                                                                order?.order_items[0]?.smartphone
                                                                    ?.category?.distributor
                                                                    ?.bank_account_name || 'N/A',
                                                                'account_name',
                                                            )
                                                        }
                                                        className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-white text-gray-600 transition-all hover:bg-indigo-100 hover:text-indigo-600 dark:bg-deepcharcoal dark:text-white/60 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-400"
                                                    >
                                                        {copiedField === 'account_name' ? (
                                                            <>
                                                                <svg
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    fill="none"
                                                                    viewBox="0 0 24 24"
                                                                    strokeWidth={2}
                                                                    stroke="currentColor"
                                                                    className="h-5 w-5 text-indigo-600 dark:text-indigo-400"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        d="M4.5 12.75l6 6 9-13.5"
                                                                    />
                                                                </svg>
                                                                <span className="absolute left-1/2 top-8 -translate-x-1/2 whitespace-nowrap rounded-md bg-indigo-600 px-2 py-1 text-xs font-semibold text-white shadow-lg dark:bg-indigo-500">
                                                                    Copied!
                                                                </span>
                                                            </>
                                                        ) : (
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                strokeWidth={2}
                                                                stroke="currentColor"
                                                                className="h-5 w-5"
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
                                            <div className="group rounded-xl border border-gray-200 bg-gray-50 p-4 transition-all hover:border-indigo-200 hover:bg-indigo-50/50 dark:border-white/10 dark:bg-gray-900/50 dark:hover:border-indigo-800 dark:hover:bg-indigo-900/10">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <label className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-white/60">
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                strokeWidth={2}
                                                                stroke="currentColor"
                                                                className="h-4 w-4"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
                                                                />
                                                            </svg>
                                                            Account Number
                                                        </label>
                                                        <p className="font-mono text-lg font-bold text-gray-900 dark:text-white/80">
                                                            {order?.order_items[0]?.smartphone
                                                                ?.category?.distributor
                                                                ?.bank_account_no || 'N/A'}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() =>
                                                            handleCopy(
                                                                order?.order_items[0]?.smartphone
                                                                    ?.category?.distributor
                                                                    ?.bank_account_no || 'N/A',
                                                                'account_number',
                                                            )
                                                        }
                                                        className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-white text-gray-600 transition-all hover:bg-indigo-100 hover:text-indigo-600 dark:bg-deepcharcoal dark:text-white/60 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-400"
                                                    >
                                                        {copiedField === 'account_number' ? (
                                                            <>
                                                                <svg
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    fill="none"
                                                                    viewBox="0 0 24 24"
                                                                    strokeWidth={2}
                                                                    stroke="currentColor"
                                                                    className="h-5 w-5 text-indigo-600 dark:text-indigo-400"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        d="M4.5 12.75l6 6 9-13.5"
                                                                    />
                                                                </svg>
                                                                <span className="absolute left-1/2 top-8 -translate-x-1/2 whitespace-nowrap rounded-md bg-indigo-600 px-2 py-1 text-xs font-semibold text-white shadow-lg dark:bg-indigo-500">
                                                                    Copied!
                                                                </span>
                                                            </>
                                                        ) : (
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                strokeWidth={2}
                                                                stroke="currentColor"
                                                                className="h-5 w-5"
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
                                            <div className="group rounded-xl border border-gray-200 bg-gray-50 p-4 transition-all hover:border-indigo-200 hover:bg-indigo-50/50 dark:border-white/10 dark:bg-gray-900/50 dark:hover:border-indigo-800 dark:hover:bg-indigo-900/10">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <label className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-white/60">
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                strokeWidth={2}
                                                                stroke="currentColor"
                                                                className="h-4 w-4"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"
                                                                />
                                                            </svg>
                                                            IBAN
                                                        </label>
                                                        <p className="font-mono text-lg font-bold text-gray-900 dark:text-white/80">
                                                            {order?.order_items[0]?.smartphone
                                                                ?.category?.distributor?.iban ||
                                                                'N/A'}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() =>
                                                            handleCopy(
                                                                order?.order_items[0]?.smartphone
                                                                    ?.category?.distributor?.iban ||
                                                                    'N/A',
                                                                'iban',
                                                            )
                                                        }
                                                        className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-white text-gray-600 transition-all hover:bg-indigo-100 hover:text-indigo-600 dark:bg-deepcharcoal dark:text-white/60 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-400"
                                                    >
                                                        {copiedField === 'iban' ? (
                                                            <>
                                                                <svg
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    fill="none"
                                                                    viewBox="0 0 24 24"
                                                                    strokeWidth={2}
                                                                    stroke="currentColor"
                                                                    className="h-5 w-5 text-indigo-600 dark:text-indigo-400"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        d="M4.5 12.75l6 6 9-13.5"
                                                                    />
                                                                </svg>
                                                                <span className="absolute left-1/2 top-8 -translate-x-1/2 whitespace-nowrap rounded-md bg-indigo-600 px-2 py-1 text-xs font-semibold text-white shadow-lg dark:bg-indigo-500">
                                                                    Copied!
                                                                </span>
                                                            </>
                                                        ) : (
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                strokeWidth={2}
                                                                stroke="currentColor"
                                                                className="h-5 w-5"
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
                                            <div className="group rounded-xl border border-gray-200 bg-gray-50 p-4 transition-all hover:border-indigo-200 hover:bg-indigo-50/50 dark:border-white/10 dark:bg-gray-900/50 dark:hover:border-indigo-800 dark:hover:bg-indigo-900/10">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <label className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-white/60">
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                strokeWidth={2}
                                                                stroke="currentColor"
                                                                className="h-4 w-4"
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
                                                            SWIFT Code
                                                        </label>
                                                        <p className="font-mono text-lg font-bold text-gray-900 dark:text-white/80">
                                                            {order?.order_items[0]?.smartphone
                                                                ?.category?.distributor
                                                                ?.swift_code || 'N/A'}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() =>
                                                            handleCopy(
                                                                order?.order_items[0]?.smartphone
                                                                    ?.category?.distributor
                                                                    ?.swift_code || 'N/A',
                                                                'swift_code',
                                                            )
                                                        }
                                                        className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-white text-gray-600 transition-all hover:bg-indigo-100 hover:text-indigo-600 dark:bg-deepcharcoal dark:text-white/60 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-400"
                                                    >
                                                        {copiedField === 'swift_code' ? (
                                                            <>
                                                                <svg
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    fill="none"
                                                                    viewBox="0 0 24 24"
                                                                    strokeWidth={2}
                                                                    stroke="currentColor"
                                                                    className="h-5 w-5 text-indigo-600 dark:text-indigo-400"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        d="M4.5 12.75l6 6 9-13.5"
                                                                    />
                                                                </svg>
                                                                <span className="absolute left-1/2 top-8 -translate-x-1/2 whitespace-nowrap rounded-md bg-indigo-600 px-2 py-1 text-xs font-semibold text-white shadow-lg dark:bg-indigo-500">
                                                                    Copied!
                                                                </span>
                                                            </>
                                                        ) : (
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                strokeWidth={2}
                                                                stroke="currentColor"
                                                                className="h-5 w-5"
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
                                            <div className="mt-6 rounded-xl border-l-4 border-amber-500 bg-amber-50 p-4 dark:bg-amber-900/10">
                                                <div className="flex gap-3">
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        strokeWidth={2}
                                                        stroke="currentColor"
                                                        className="h-6 w-6 flex-shrink-0 text-amber-600 dark:text-amber-400"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                                                        />
                                                    </svg>
                                                    <div>
                                                        <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                                                            Important Instructions
                                                        </p>
                                                        <ul className="mt-2 space-y-1 text-xs text-amber-800 dark:text-amber-200/80">
                                                            <li className="flex items-start gap-2">
                                                                <span className="mt-0.5 flex-shrink-0">
                                                                    •
                                                                </span>
                                                                <span>
                                                                    Please include your order number
                                                                    in the payment reference
                                                                </span>
                                                            </li>
                                                            <li className="flex items-start gap-2">
                                                                <span className="mt-0.5 flex-shrink-0">
                                                                    •
                                                                </span>
                                                                <span>
                                                                    Upload payment proof after
                                                                    completing the transfer
                                                                </span>
                                                            </li>
                                                            <li className="flex items-start gap-2">
                                                                <span className="mt-0.5 flex-shrink-0">
                                                                    •
                                                                </span>
                                                                <span>
                                                                    Processing time: 2-3 business
                                                                    days
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
                                <div className="relative z-10 flex h-[100dvh] w-full flex-col overflow-y-auto bg-white text-black dark:bg-deepcharcoal dark:text-white/80 sm:pb-20">
                                    {/* Top Bar */}
                                    <div className="relative flex items-center border-b border-gray-200 px-4 py-3 dark:border-gray-800">
                                        <button
                                            onClick={() => setViewBankDetails(false)}
                                            className="absolute left-4 rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-800"
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

                                        <h2 className="mx-10 text-xl font-semibold tracking-tight text-gray-800 dark:text-gray-100">
                                            Bank Details
                                        </h2>
                                    </div>

                                    {/* Content */}
                                    <div className="my-4 flex-1 space-y-6 p-4">
                                        {/* Bank Name */}
                                        <div className="group rounded-xl border border-gray-200 bg-gray-50 p-4 transition-all hover:border-indigo-200 hover:bg-indigo-50/50 dark:border-white/10 dark:bg-gray-900/50 dark:hover:border-indigo-800 dark:hover:bg-indigo-900/10">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <label className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-white/60">
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            strokeWidth={2}
                                                            stroke="currentColor"
                                                            className="h-4 w-4"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z"
                                                            />
                                                        </svg>
                                                        Bank Name
                                                    </label>
                                                    <p className="text-lg font-bold text-gray-900 dark:text-white/80">
                                                        {order?.order_items[0]?.smartphone?.category
                                                            ?.distributor?.bank_name || 'N/A'}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() =>
                                                        handleCopy(
                                                            order?.order_items[0]?.smartphone
                                                                ?.category?.distributor
                                                                ?.bank_name || 'N/A',
                                                            'bank_name',
                                                        )
                                                    }
                                                    className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-white text-gray-600 transition-all hover:bg-indigo-100 hover:text-indigo-600 dark:bg-deepcharcoal dark:text-white/60 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-400"
                                                >
                                                    {copiedField === 'bank_name' ? (
                                                        <>
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                strokeWidth={2}
                                                                stroke="currentColor"
                                                                className="h-5 w-5 text-indigo-600 dark:text-indigo-400"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    d="M4.5 12.75l6 6 9-13.5"
                                                                />
                                                            </svg>
                                                            <span className="absolute left-1/2 top-8 -translate-x-1/2 whitespace-nowrap rounded-md bg-indigo-600 px-2 py-1 text-xs font-semibold text-white shadow-lg dark:bg-indigo-500">
                                                                Copied!
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            strokeWidth={2}
                                                            stroke="currentColor"
                                                            className="h-5 w-5"
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
                                        <div className="group rounded-xl border border-gray-200 bg-gray-50 p-4 transition-all hover:border-indigo-200 hover:bg-indigo-50/50 dark:border-white/10 dark:bg-gray-900/50 dark:hover:border-indigo-800 dark:hover:bg-indigo-900/10">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <label className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-white/60">
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            strokeWidth={2}
                                                            stroke="currentColor"
                                                            className="h-4 w-4"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                                                            />
                                                        </svg>
                                                        Account Name
                                                    </label>
                                                    <p className="text-lg font-bold text-gray-900 dark:text-white/80">
                                                        {order?.order_items[0]?.smartphone?.category
                                                            ?.distributor?.bank_account_name ||
                                                            'N/A'}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() =>
                                                        handleCopy(
                                                            order?.order_items[0]?.smartphone
                                                                ?.category?.distributor
                                                                ?.bank_account_name || 'N/A',
                                                            'account_name',
                                                        )
                                                    }
                                                    className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-white text-gray-600 transition-all hover:bg-indigo-100 hover:text-indigo-600 dark:bg-deepcharcoal dark:text-white/60 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-400"
                                                >
                                                    {copiedField === 'account_name' ? (
                                                        <>
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                strokeWidth={2}
                                                                stroke="currentColor"
                                                                className="h-5 w-5 text-indigo-600 dark:text-indigo-400"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    d="M4.5 12.75l6 6 9-13.5"
                                                                />
                                                            </svg>
                                                            <span className="absolute left-1/2 top-8 -translate-x-1/2 whitespace-nowrap rounded-md bg-indigo-600 px-2 py-1 text-xs font-semibold text-white shadow-lg dark:bg-indigo-500">
                                                                Copied!
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            strokeWidth={2}
                                                            stroke="currentColor"
                                                            className="h-5 w-5"
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
                                        <div className="group rounded-xl border border-gray-200 bg-gray-50 p-4 transition-all hover:border-indigo-200 hover:bg-indigo-50/50 dark:border-white/10 dark:bg-gray-900/50 dark:hover:border-indigo-800 dark:hover:bg-indigo-900/10">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <label className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-white/60">
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            strokeWidth={2}
                                                            stroke="currentColor"
                                                            className="h-4 w-4"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
                                                            />
                                                        </svg>
                                                        Account Number
                                                    </label>
                                                    <p className="font-mono text-lg font-bold text-gray-900 dark:text-white/80">
                                                        {order?.order_items[0]?.smartphone?.category
                                                            ?.distributor?.bank_account_no || 'N/A'}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() =>
                                                        handleCopy(
                                                            order?.order_items[0]?.smartphone
                                                                ?.category?.distributor
                                                                ?.bank_account_no || 'N/A',
                                                            'account_number',
                                                        )
                                                    }
                                                    className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-white text-gray-600 transition-all hover:bg-indigo-100 hover:text-indigo-600 dark:bg-deepcharcoal dark:text-white/60 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-400"
                                                >
                                                    {copiedField === 'account_number' ? (
                                                        <>
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                strokeWidth={2}
                                                                stroke="currentColor"
                                                                className="h-5 w-5 text-indigo-600 dark:text-indigo-400"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    d="M4.5 12.75l6 6 9-13.5"
                                                                />
                                                            </svg>
                                                            <span className="absolute left-1/2 top-8 -translate-x-1/2 whitespace-nowrap rounded-md bg-indigo-600 px-2 py-1 text-xs font-semibold text-white shadow-lg dark:bg-indigo-500">
                                                                Copied!
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            strokeWidth={2}
                                                            stroke="currentColor"
                                                            className="h-5 w-5"
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
                                        <div className="group rounded-xl border border-gray-200 bg-gray-50 p-4 transition-all hover:border-indigo-200 hover:bg-indigo-50/50 dark:border-white/10 dark:bg-gray-900/50 dark:hover:border-indigo-800 dark:hover:bg-indigo-900/10">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <label className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-white/60">
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            strokeWidth={2}
                                                            stroke="currentColor"
                                                            className="h-4 w-4"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"
                                                            />
                                                        </svg>
                                                        IBAN
                                                    </label>
                                                    <p className="font-mono text-lg font-bold text-gray-900 dark:text-white/80">
                                                        {order?.order_items[0]?.smartphone?.category
                                                            ?.distributor?.iban || 'N/A'}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() =>
                                                        handleCopy(
                                                            order?.order_items[0]?.smartphone
                                                                ?.category?.distributor?.iban ||
                                                                'N/A',
                                                            'iban',
                                                        )
                                                    }
                                                    className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-white text-gray-600 transition-all hover:bg-indigo-100 hover:text-indigo-600 dark:bg-deepcharcoal dark:text-white/60 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-400"
                                                >
                                                    {copiedField === 'iban' ? (
                                                        <>
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                strokeWidth={2}
                                                                stroke="currentColor"
                                                                className="h-5 w-5 text-indigo-600 dark:text-indigo-400"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    d="M4.5 12.75l6 6 9-13.5"
                                                                />
                                                            </svg>
                                                            <span className="absolute left-1/2 top-8 -translate-x-1/2 whitespace-nowrap rounded-md bg-indigo-600 px-2 py-1 text-xs font-semibold text-white shadow-lg dark:bg-indigo-500">
                                                                Copied!
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            strokeWidth={2}
                                                            stroke="currentColor"
                                                            className="h-5 w-5"
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
                                        <div className="group rounded-xl border border-gray-200 bg-gray-50 p-4 transition-all hover:border-indigo-200 hover:bg-indigo-50/50 dark:border-white/10 dark:bg-gray-900/50 dark:hover:border-indigo-800 dark:hover:bg-indigo-900/10">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <label className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-white/60">
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            strokeWidth={2}
                                                            stroke="currentColor"
                                                            className="h-4 w-4"
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
                                                        SWIFT Code
                                                    </label>
                                                    <p className="font-mono text-lg font-bold text-gray-900 dark:text-white/80">
                                                        {order?.order_items[0]?.smartphone?.category
                                                            ?.distributor?.swift_code || 'N/A'}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() =>
                                                        handleCopy(
                                                            order?.order_items[0]?.smartphone
                                                                ?.category?.distributor
                                                                ?.swift_code || 'N/A',
                                                            'swift_code',
                                                        )
                                                    }
                                                    className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-white text-gray-600 transition-all hover:bg-indigo-100 hover:text-indigo-600 dark:bg-deepcharcoal dark:text-white/60 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-400"
                                                >
                                                    {copiedField === 'swift_code' ? (
                                                        <>
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                strokeWidth={2}
                                                                stroke="currentColor"
                                                                className="h-5 w-5 text-indigo-600 dark:text-indigo-400"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    d="M4.5 12.75l6 6 9-13.5"
                                                                />
                                                            </svg>
                                                            <span className="absolute left-1/2 top-8 -translate-x-1/2 whitespace-nowrap rounded-md bg-indigo-600 px-2 py-1 text-xs font-semibold text-white shadow-lg dark:bg-indigo-500">
                                                                Copied!
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            strokeWidth={2}
                                                            stroke="currentColor"
                                                            className="h-5 w-5"
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
                                        <div className="mt-6 rounded-xl border-l-4 border-amber-500 bg-amber-50 p-4 dark:bg-amber-900/10">
                                            <div className="flex gap-3">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    strokeWidth={2}
                                                    stroke="currentColor"
                                                    className="h-6 w-6 flex-shrink-0 text-amber-600 dark:text-amber-400"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                                                    />
                                                </svg>
                                                <div>
                                                    <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                                                        Important Instructions
                                                    </p>
                                                    <ul className="mt-2 space-y-1 text-xs text-amber-800 dark:text-amber-200/80">
                                                        <li className="flex items-start gap-2">
                                                            <span className="mt-0.5 flex-shrink-0">
                                                                •
                                                            </span>
                                                            <span>
                                                                Please include your order number in
                                                                the payment reference
                                                            </span>
                                                        </li>
                                                        <li className="flex items-start gap-2">
                                                            <span className="mt-0.5 flex-shrink-0">
                                                                •
                                                            </span>
                                                            <span>
                                                                Upload payment proof after
                                                                completing the transfer
                                                            </span>
                                                        </li>
                                                        <li className="flex items-start gap-2">
                                                            <span className="mt-0.5 flex-shrink-0">
                                                                •
                                                            </span>
                                                            <span>
                                                                Processing time: 2-3 business days
                                                            </span>
                                                        </li>
                                                    </ul>
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
            )}
        </MainLayout>
    );
}
