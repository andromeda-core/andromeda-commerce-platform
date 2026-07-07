import React, { useEffect, useState } from 'react';
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
import { ChevronLeft, Copy } from 'lucide-react';
import LinkCopiedModal from '@/Components/LinkCopiedModal';
import duration from 'dayjs/plugin/duration';
import utc from 'dayjs/plugin/utc';
import dayjs from 'dayjs';
import { trackPixelEvent, buildEventId } from '@/Helpers/metaPixel';
dayjs.extend(duration);
dayjs.extend(utc);

export default function OrderView({ order, countries }) {
    const { currency } = usePage().props;
    const windowSize = useWindowSize();

    // Translation Hook
    const { __ } = useTranslation();

    const [showVideoModal, setShowVideoModal] = useState(false);
    const [selectedVideo, setSelectedVideo] = useState({});
    const [showImageModal, setShowImageModal] = useState(false);

    const [showRecordingModal, setShowRecordingModal] = useState(false);
    const [selectedRecording, setSelectedRecording] = useState(null);
    const [selectedPackageVideoID, setSelectedPackageVideoID] = useState(null);

    const [selectedImage, setSelectedImage] = useState(null);
    const [ErrorMessage, setErrorMessage] = useState(null);
    const [showErrorMessage, setShowErrorMessage] = useState(false);

    const [copied, setCopied] = useState(null);
    const [copiedMessage, setCopiedMessage] = useState(null);

    const cleanUrl = (() => {
        const clean = new URL(window.location.href);
        clean.searchParams.delete('modal');
        clean.searchParams.delete('url');
        clean.searchParams.delete('thumbnail_url');

        return clean.toString();
    })();

    const [shippingInfo, setShippingInfo] = useState({
        name: order?.shipping_name || '',
        phone: order?.shipping_phone || '',
        address_line1: order?.shipping_address_line1 || '',
        address_line2: order?.shipping_address_line1 || '',
        city: order?.shipping_city || '',
        state: order?.shipping_state || '',
        postal_code: order?.shipping_postal_code || '',
        country_id:
            countries.filter((country) => country.name === order?.shipping_country)[0]?.id || '',
    });

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

    const handleRecordingView = (recording) => {
        setSelectedRecording(recording);
        setShowRecordingModal(true);
        setSelectedPackageVideoID(recording.id);
    };

    // Payment proof upload states
    const [paymentProofFile, setPaymentProofFile] = useState(null);
    const [paymentProofPreview, setPaymentProofPreview] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

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
                    // Meta Pixel AddPaymentInfo — bank_transfer's payment-info moment (crypto/points
                    // fire at checkout submission instead; see Checkout/index.jsx handlePlaceOrder).
                    trackPixelEvent('AddPaymentInfo', {
                        content_type: 'product',
                        content_category: 'smartphone',
                        value: Number(order?.full_amount || 0),
                        currency: currency?.name,
                    });
                    setPaymentProofFile(null);
                    setPaymentProofPreview(null);
                },
                onError: (errors) => {
                    setShowErrorMessage(true);
                    setErrorMessage(
                        errors.payment_proof ||
                            __('Failed to upload payment proof. Please try again.'),
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

    // Tracking slip states
    const [trackingSlipFile, setTrackingSlipFile] = useState(null);
    const [trackingSlipPreview, setTrackingSlipPreview] = useState(null);
    const [isUploadingTrackingSlip, setIsUploadingTrackingSlip] = useState(false);

    const handleTrackingSlipSelect = (file) => {
        setTrackingSlipFile(file);
        const reader = new FileReader();
        reader.onloadend = () => setTrackingSlipPreview(reader.result);
        reader.readAsDataURL(file);
    };

    const handleTrackingSlipRemove = () => {
        setTrackingSlipFile(null);
        setTrackingSlipPreview(null);
    };

    const handleUploadTrackingSlip = async () => {
        if (!trackingSlipFile) return;
        setIsUploadingTrackingSlip(true);

        const formData = new FormData();
        formData.append('return_tracking_image', trackingSlipFile);

        try {
            await router.post(
                route('website.orders.refund.upload-tracking-slip', order.order_no),
                formData,
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        setTrackingSlipFile(null);
                        setTrackingSlipPreview(null);
                    },
                    onError: (errors) => {
                        setShowErrorMessage(true);
                        setErrorMessage(
                            errors.return_tracking_image ||
                                __('Failed to upload tracking slip. Please try again.'),
                        );
                    },
                    onFinish: () => setIsUploadingTrackingSlip(false),
                },
            );
        } catch (error) {
            console.error('Upload error:', error);
            setIsUploadingTrackingSlip(false);
        }
    };

    useEffect(() => {
        window.history.replaceState({}, '', cleanUrl);
    }, []);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (showImageModal || showRecordingModal) {
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
    }, [showImageModal, showRecordingModal]);

    // updating history whenever modal opens/closes
    useEffect(() => {
        const url = new URL(window.location.href);

        if (showImageModal) {
            window.history.pushState({}, '', window.location.pathname);
            url.searchParams.set('modal', 'payment-proof');
            url.searchParams.set('url', selectedImage);
            window.history.replaceState({}, '', url.toString());
        } else if (showRecordingModal) {
            window.history.pushState({}, '', window.location.pathname);
            url.searchParams.set('modal', 'packaging-recording');
            window.history.replaceState({}, '', url.toString());
        } else {
            url.searchParams.delete('modal');
            url.searchParams.delete('url');
            url.searchParams.delete('thumbnail_url');
            window.history.replaceState({}, '', route('website.orders.index'));
            window.history.replaceState({}, '', route('website.orders.order-view', order.order_no));
        }
    }, [showImageModal, showRecordingModal, selectedImage]);

    // Pop State Handling
    useEffect(() => {
        const handlePopState = () => {
            if (showImageModal) {
                setShowImageModal(false);
                setSelectedImage(null);
                return;
            }
            if (showRecordingModal) {
                setShowRecordingModal(false);
                setSelectedRecording(null);
                return;
            }
        };

        const preventInertiaNavigation = (event) => {
            const pathname = event.detail?.visit?.url?.pathname || '';
            const currentPath = `/orders/order-view/${order.order_no}`;
            if ((showImageModal || showRecordingModal) && pathname === currentPath) {
                event.preventDefault();
            }
        };

        window.addEventListener('popstate', handlePopState);
        const removeRouterEvent = router.on('before', preventInertiaNavigation);

        return () => {
            window.removeEventListener('popstate', handlePopState);
            if (removeRouterEvent) removeRouterEvent();
        };
    }, [showImageModal, showRecordingModal]);

    useEffect(() => {
        if (selectedPackageVideoID != null) {
            axios.post(
                route('website.orders.mark-packaging-video-viewed', {
                    package_video_id: selectedPackageVideoID,
                }),
            );
        }
    }, [selectedPackageVideoID]);

    // Meta Pixel Purchase — STRICT: only when the order's real status is exactly 'paid'. This is
    // the single unified firing point for all 3 payment methods. points reaches 'paid' on first
    // load of this page; bank_transfer/crypto reach it only once backend/admin has confirmed it,
    // whenever the customer next loads or reloads this page. Never fires for awaiting_payment,
    // blockchain_confirmation_pending, pending, or any other non-'paid' status. localStorage guards
    // against re-firing on repeat visits to an already-fired order.
    useEffect(() => {
        if (order?.status !== 'paid') return;

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
    }, [order?.status]);

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
                <div
                    className={`max-w-8xl mx-auto px-6 lg:my-7 lg:px-8 ${windowSize.width <= 1024 && 'mb-20'}`}
                >
                    {/* Header */}
                    <div className="my-2">
                        <Link
                            href={route('website.orders.index')}
                            className="inline-flex items-center gap-2 mb-4 text-sm font-medium transition-colors text-main-text-light dark:text-main-text-dark lg:hidden lg:hover:text-main-text-light/80 dark:lg:hover:text-main-text-dark/80"
                        >
                            <ChevronLeft />
                        </Link>

                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-5">
                                <h1 className="text-[24px] font-semibold text-main-text-light dark:text-main-text-dark">
                                    {__('View Details')} - #{order.order_no}
                                </h1>

                                <span
                                    className={`inline-flex items-center self-start rounded-full bg-main-text-light px-5 py-1 text-[16px] text-sm font-semibold uppercase text-main-text-dark dark:bg-main-text-dark dark:text-main-text-light sm:self-center`}
                                >
                                    {__(order.status.replace(/_/g, ' ').toUpperCase(), true)}{' '}
                                    {order?.is_purchase_confirmed
                                        ? `(${__('Purchase Confirmed')}) `
                                        : order?.is_delivery_confirmed
                                          ? `(${__('Delivery Confirmed')}) `
                                          : ''}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-8 mb-20 lg:grid-cols-3">
                        {/* Left Section: Shipping & Payment */}
                        <div className="space-y-6 lg:col-span-2">
                            {/* Shipping Information */}
                            <ShippingInfoCard
                                shippingInfo={shippingInfo}
                                countries={countries}
                                __={__}
                            />

                            <CourierInfoCard order={order} __={__} />

                            {(order?.payment_method === 'bank_transfer' ||
                                order?.secondary_payment_method === 'bank_transfer') &&
                                order?.status === 'pending' && (
                                    <>
                                        <OrderReferenceCard
                                            order={order}
                                            setCopied={setCopied}
                                            setCopiedMessage={setCopiedMessage}
                                            __={__}
                                        />

                                        <BankDetailsCard
                                            order={order}
                                            setCopied={setCopied}
                                            setCopiedMessage={setCopiedMessage}
                                            __={__}
                                        />

                                        <PaymentProof
                                            order={order}
                                            __={__}
                                            handleFileRemove={handleFileRemove}
                                            handleFileSelect={handleFileSelect}
                                            isUploading={isUploading}
                                            paymentProofFile={paymentProofFile}
                                            paymentProofPreview={paymentProofPreview}
                                            handleUploadPaymentProof={handleUploadPaymentProof}
                                            handleImageView={handleImageView}
                                        />
                                    </>
                                )}

                            <OrderItems __={__} currency={currency} order={order} />

                            <PackagingVideos
                                __={__}
                                handleVideoView={handleVideoView}
                                order={order}
                                setSelectedPackageVideoID={setSelectedPackageVideoID}
                                handleRecordingView={handleRecordingView}
                            />

                            {/* Return Tracking Slip — shown only when refund is approved and awaiting tracking */}
                            <ReturnTrackingSlipUpload
                                order={order}
                                __={__}
                                handleTrackingSlipSelect={handleTrackingSlipSelect}
                                handleTrackingSlipRemove={handleTrackingSlipRemove}
                                trackingSlipFile={trackingSlipFile}
                                trackingSlipPreview={trackingSlipPreview}
                                isUploadingTrackingSlip={isUploadingTrackingSlip}
                                handleUploadTrackingSlip={handleUploadTrackingSlip}
                                handleImageView={handleImageView}
                            />
                        </div>

                        {/* Right Section: Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="space-y-4">
                                <OrderSummaryCard currency={currency} order={order} __={__} />

                                {/* Help Section */}
                                <div className="p-6 bg-white border rounded-md border-surface-3-light dark:border-surface-3-dark dark:bg-surface-1-dark">
                                    <h2 className="mb-2 text-lg font-semibold text-main-text-light dark:text-main-text-dark">
                                        {__('Need Help')}?
                                    </h2>
                                    <p className="mb-4 text-sm font-medium text-main-text-light dark:text-main-text-dark">
                                        {__(
                                            'Contact our support team if you have any questions about your order.',
                                        )}
                                    </p>
                                    <Link
                                        href={route('website.contact.index')}
                                        className="flex items-center justify-center w-full gap-2 px-4 py-2 font-semibold transition-all rounded-md text-md bg-main-text-light text-main-text-dark hover:bg-main-text-light/80 dark:bg-main-text-dark dark:text-main-text-light dark:hover:bg-main-text-dark/80"
                                    >
                                        {__('Contact Support')}
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <LinkCopiedModal
                message={copiedMessage}
                linkCopied={copied}
                setLinkCopied={setCopied}
            />

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
                            className="relative z-[101] my-auto max-w-[80%] animate-scale-in overflow-hidden rounded-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <img
                                src={selectedImage}
                                alt={__('Payment Proof')}
                                className="h-auto max-h-[80vh] w-full object-contain"
                            />
                        </div>
                    </div>,
                    document.getElementById('modal-root') || document.body,
                )}

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
                            className="relative z-[101] my-auto max-w-[80%] animate-scale-in overflow-hidden rounded-2xl bg-backgroundLight dark:bg-backgroundDark"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <VideoWithThumbnail
                                thumbnail={selectedVideo?.thumbnail_url || Placeholder}
                                videoUrl={selectedVideo?.url}
                                className="h-auto max-h-[80vh] w-full object-cover"
                                controls={true}
                                type="customized"
                            />
                        </div>
                    </div>,
                    document.getElementById('modal-root') || document.body,
                )}

            {showRecordingModal &&
                selectedRecording &&
                createPortal(
                    <div
                        className={`fixed inset-0 z-[100] flex justify-center overflow-y-auto ${
                            windowSize.width <= 1024
                                ? 'items-stretch'
                                : 'items-end sm:items-center sm:p-4'
                        }`}
                    >
                        <div
                            className="fixed inset-0 transition-opacity duration-300 bg-black/50 backdrop-blur-sm"
                            onClick={() => {
                                setShowRecordingModal(false);
                                setSelectedRecording(null);
                            }}
                        />
                        <div
                            role="dialog"
                            aria-modal="true"
                            className={`relative z-[101] w-full overflow-y-auto bg-white dark:bg-surface-1-dark ${
                                windowSize.width <= 1024
                                    ? 'h-full max-h-screen rounded-none'
                                    : 'max-h-[90vh] rounded-t-2xl sm:max-w-2xl sm:rounded-2xl'
                            }`}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 bg-white border-b border-surface-3-light dark:border-surface-3-dark dark:bg-surface-1-dark">
                                <h3 className="text-base font-semibold text-main-text-light dark:text-main-text-dark">
                                    {__('Packaging Verification')} #{selectedRecording.index + 1}
                                </h3>
                                <button
                                    onClick={() => {
                                        setShowRecordingModal(false);
                                        setSelectedRecording(null);
                                    }}
                                    className="flex items-center justify-center w-8 h-8 rounded-md text-sub-text-light hover:bg-surface-1-light dark:text-sub-text-dark dark:hover:bg-surface-3-dark"
                                >
                                    <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            </div>

                            <div className="flex flex-col gap-5 p-5">
                                {/* Barcode Photo */}
                                {selectedRecording.barcode_photo && (
                                    <div className="flex flex-col gap-2">
                                        <p className="text-xs font-semibold tracking-wide uppercase text-sub-text-light dark:text-sub-text-dark">
                                            {__('Barcode Photo')}
                                        </p>
                                        <div className="overflow-hidden rounded-xl bg-surface-3-light dark:bg-surface-3-dark">
                                            <img
                                                src={selectedRecording.barcode_photo}
                                                alt="Barcode"
                                                onError={(e) => (e.target.src = Placeholder)}
                                                className="object-contain w-full max-h-56"
                                                style={{ touchAction: 'pinch-zoom' }}
                                                onMouseMove={(e) => {
                                                    const rect =
                                                        e.currentTarget.getBoundingClientRect();
                                                    const x =
                                                        ((e.clientX - rect.left) / rect.width) *
                                                        100;
                                                    const y =
                                                        ((e.clientY - rect.top) / rect.height) *
                                                        100;
                                                    e.currentTarget.style.transformOrigin = `${x}% ${y}%`;
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.transform = 'scale(2.5)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.transform = 'scale(1)';
                                                    e.currentTarget.style.transformOrigin =
                                                        'center center';
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}
                                {/* Screen Recording */}
                                {selectedRecording.screen_recording_video && (
                                    <div className="flex flex-col gap-2">
                                        <p className="text-xs font-semibold tracking-wide uppercase text-sub-text-light dark:text-sub-text-dark">
                                            {__('Screen Recording')}
                                        </p>
                                        <div className="overflow-hidden bg-black rounded-xl">
                                            <VideoWithThumbnail
                                                thumbnail={
                                                    selectedRecording.screen_recording_thumbnail ||
                                                    Placeholder
                                                }
                                                videoUrl={selectedRecording.screen_recording_video}
                                                className="w-full"
                                                controls={true}
                                                type="customized"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Scene Video */}
                                {selectedRecording.scene_video && (
                                    <div className="flex flex-col gap-2">
                                        <p className="text-xs font-semibold tracking-wide uppercase text-sub-text-light dark:text-sub-text-dark">
                                            {__('Scene Video')}
                                        </p>
                                        <div className="overflow-hidden bg-black rounded-xl">
                                            <VideoWithThumbnail
                                                thumbnail={
                                                    selectedRecording.scene_video_thumbnail ||
                                                    Placeholder
                                                }
                                                videoUrl={selectedRecording.scene_video}
                                                className="w-full"
                                                controls={true}
                                                type="customized"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>,
                    document.getElementById('modal-root') || document.body,
                )}
        </MainLayout>
    );
}

// Shipping Info Component
function ShippingInfoCard({ shippingInfo, countries, __ }) {
    // Get country name from ID
    const countryName =
        countries?.find((country) => country.id === Number(shippingInfo.country_id))?.name ||
        shippingInfo.country ||
        '';

    // Format full address
    const formatAddress = () => {
        const parts = [
            shippingInfo.address_line1,
            shippingInfo.address_line2,
            shippingInfo.city,
            shippingInfo.state,
            shippingInfo.postal_code,
            countryName,
        ].filter(Boolean);

        return parts.join(', ');
    };

    return (
        <div className="p-8 bg-white border rounded-md border-surface-3-light dark:border-surface-3-dark dark:bg-surface-1-dark">
            {/* Header with Edit Button */}
            <div className="flex items-start justify-between mb-4">
                <h2 className="text-[18px] font-semibold text-main-text-light dark:text-main-text-dark">
                    {__('Shipping Information')}
                </h2>
            </div>

            {/* Address Information */}
            <div className="space-y-1 break-words">
                {/* Line 1: Name + Phone */}
                <p className="text-[14px] font-semibold text-main-text-light dark:text-main-text-dark">
                    {shippingInfo.name}
                    {shippingInfo.phone && (
                        <span className="font-medium"> {shippingInfo.phone}</span>
                    )}
                </p>

                {/* Line 2: Country, City, State */}
                <p className="text-[14px] text-main-text-light dark:text-main-text-dark">
                    {[countryName, shippingInfo.city, shippingInfo.state]
                        .filter(Boolean)
                        .join(', ')}
                </p>

                {/* Line 3: Address + Postal Code */}
                <p className="text-[14px] text-main-text-light dark:text-main-text-dark">
                    {formatAddress()}
                </p>
            </div>
        </div>
    );
}

// Courier Info component
function CourierInfoCard({ order, __ }) {
    return (
        <div className="p-8 bg-white border rounded-md border-surface-3-light dark:border-surface-3-dark dark:bg-surface-1-dark">
            {/* Header with Edit Button */}
            <div className="flex items-start justify-between mb-4">
                <h2 className="text-[18px] font-semibold text-main-text-light dark:text-main-text-dark">
                    {__('Courier Details')}
                </h2>
            </div>

            {/* Information */}
            <div className="space-y-1 break-words">
                <p className="text-[14px] font-semibold text-main-text-light dark:text-main-text-dark">
                    {__('Courier Company')}: {order?.courier_company || 'N/A'}
                </p>

                <p className="text-[14px] font-semibold text-main-text-light dark:text-main-text-dark">
                    {__('Tracking Number')}: {order?.tracking_no || 'N/A'}
                </p>

                <p className="text-[14px] font-semibold text-main-text-light dark:text-main-text-dark">
                    {__('Shipping Date')}: {order?.shipping_date || 'N/A'}
                </p>

                {order?.delivered_at && (
                    <p className="text-[14px] font-semibold text-main-text-light dark:text-main-text-dark">
                        {__('Delivered Date')}: {order?.delivered_at}
                    </p>
                )}
            </div>
        </div>
    );
}

// Reference Info Component
function OrderReferenceCard({ order, __, setCopied, setCopiedMessage }) {
    if (order?.is_cancelation_requested && order?.cancelation_request_status !== 'rejected')
        return null;
    return (
        <div className="p-8 bg-white border rounded-md border-surface-3-light dark:border-surface-3-dark dark:bg-surface-1-dark">
            {/* Header with Edit Button */}
            <div className="flex items-start justify-between mb-4">
                <h2 className="text-[18px] font-semibold text-main-text-light dark:text-main-text-dark">
                    {__('Reference No')}{' '}
                    <span className="ml-2 text-sm font-normal text-sub-text-light dark:text-sub-text-dark">
                        {' '}
                        {__('Use this reference when making the bank transfer')}{' '}
                    </span>
                </h2>
            </div>

            {/* Information */}
            <div className="space-y-1 break-words">
                <p className="flex items-center gap-2 text-[14px] font-semibold text-main-text-light dark:text-main-text-dark">
                    <span>{order?.order_no || 'N/A'}</span>

                    <button
                        onClick={() => {
                            navigator.clipboard.writeText(order?.order_no);
                            setCopiedMessage(__('Reference Copied'));
                            setCopied(true);
                        }}
                    >
                        <Copy className="size-4" />
                    </button>
                </p>
            </div>
        </div>
    );
}

// Bank Details Component
function BankDetailsCard({ order, __, setCopied, setCopiedMessage }) {
    if (order?.is_cancelation_requested && order?.cancelation_request_status !== 'rejected')
        return null;
    return (
        <div className="p-8 bg-white border rounded-md border-surface-3-light dark:border-surface-3-dark dark:bg-surface-1-dark">
            {/* Header with Edit Button */}
            <div className="flex items-start justify-between mb-4">
                <h2 className="text-[18px] font-semibold text-main-text-light dark:text-main-text-dark">
                    {__('Bank Details')}
                </h2>
            </div>

            {/* Information */}
            <div className="space-y-2 break-words">
                <p className="flex items-center gap-2 text-[14px] font-semibold text-main-text-light dark:text-main-text-dark">
                    <span>
                        {__('Bank Name')}:{' '}
                        {order?.order_items[0]?.smartphone?.category?.distributor?.bank_name ||
                            'N/A'}
                    </span>

                    <button
                        onClick={() => {
                            navigator.clipboard.writeText(order?.order_no);
                            setCopiedMessage(__('Bank Name Copied'));
                            setCopied(true);
                        }}
                    >
                        <Copy className="size-4" />
                    </button>
                </p>

                <div className="flex items-center gap-2 text-[14px] font-semibold text-main-text-light dark:text-main-text-dark">
                    <span>
                        {__('Account Holder')}:{' '}
                        {order?.order_items[0]?.smartphone?.category?.distributor
                            ?.bank_account_name || 'N/A'}
                    </span>

                    <button
                        onClick={() => {
                            navigator.clipboard.writeText(order?.order_no);
                            setCopiedMessage(__('Account Holder Copied'));
                            setCopied(true);
                        }}
                    >
                        <Copy className="size-4" />
                    </button>
                </div>

                <p className="flex items-center gap-2 text-[14px] font-semibold text-main-text-light dark:text-main-text-dark">
                    <span>
                        {__('Account Number')}:{' '}
                        {order?.order_items[0]?.smartphone?.category?.distributor
                            ?.bank_account_no || 'N/A'}
                    </span>

                    <button
                        onClick={() => {
                            navigator.clipboard.writeText(order?.order_no);
                            setCopiedMessage(__('Account Number Copied'));
                            setCopied(true);
                        }}
                    >
                        <Copy className="size-4" />
                    </button>
                </p>

                <p className="flex items-center gap-2 text-[14px] font-semibold text-main-text-light dark:text-main-text-dark">
                    <span>
                        {__('IBAN')}:{' '}
                        {order?.order_items[0]?.smartphone?.category?.distributor?.iban || 'N/A'}
                    </span>

                    <button
                        onClick={() => {
                            navigator.clipboard.writeText(order?.order_no);
                            setCopiedMessage(__('IBAN Copied'));
                            setCopied(true);
                        }}
                    >
                        <Copy className="size-4" />
                    </button>
                </p>

                <p className="flex items-center gap-2 text-[14px] font-semibold text-main-text-light dark:text-main-text-dark">
                    <span>
                        {__('SWIFT Code')}:{' '}
                        {order?.order_items[0]?.smartphone?.category?.distributor?.swift_code ||
                            'N/A'}
                    </span>

                    <button
                        onClick={() => {
                            navigator.clipboard.writeText(order?.order_no);
                            setCopiedMessage(__('Swift Code Copied'));
                            setCopied(true);
                        }}
                    >
                        <Copy className="size-4" />
                    </button>
                </p>
            </div>

            <div className="mt-5 w-full rounded-md border border-[#FBBABA] bg-red-50 p-4 px-7 dark:border-surface-3-dark dark:bg-surface-1-dark">
                <h3 className="mb-2 text-[13px] font-semibold text-main-text-light dark:text-main-text-dark">
                    {__('Important Instructions')}
                </h3>

                <ul className="mb-2 list-inside list-disc space-y-1 text-[13px] font-medium text-main-text-light dark:text-main-text-dark">
                    <li>{__('Please include your order number in the payment reference')}</li>
                    <li>{__('Upload payment proof after completing the transfer')}</li>
                    <li>{__('Processing time: 2–3 business days')}</li>
                </ul>
            </div>
        </div>
    );
}

// Payment Proof
function PaymentProof({
    order,
    __,
    handleFileSelect,
    handleFileRemove,
    paymentProofPreview,
    paymentProofFile,
    isUploading,
    handleUploadPaymentProof,
    handleImageView,
}) {
    if (order?.is_cancelation_requested && order?.cancelation_request_status !== 'rejected')
        return null;

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

    return (
        <div className="p-8 bg-white border rounded-md border-surface-3-light dark:border-surface-3-dark dark:bg-surface-1-dark">
            {/* Header with Edit Button */}
            <div className="flex items-center justify-start gap-4 mb-4">
                <h2 className="text-[18px] font-semibold text-main-text-light dark:text-main-text-dark">
                    {__('Payment Proof')}
                </h2>

                {['pending'].includes(order.status.toLowerCase()) &&
                    order?.payment_proof === null && (
                        <span className="text-[14px] font-semibold text-[#ff0000]">
                            {remainingTime &&
                                (remainingTime === 'Expired'
                                    ? __('Expired', true)
                                    : `${__('Expires in', true)} ${remainingTime}`)}
                        </span>
                    )}
            </div>

            {/* Information */}
            <div className="space-y-2 break-words">
                {order.payment_proof ? (
                    <div>
                        <div
                            onClick={() => handleImageView(order.payment_proof)}
                            className="overflow-hidden transition-all border-2 rounded-md cursor-pointer group border-surface-3-light bg-surface-3-light dark:border-surface-3-dark dark:bg-surface-3-dark"
                        >
                            <img
                                src={order.payment_proof}
                                alt={__('Payment Proof')}
                                className="object-contain w-full h-64 transition-transform duration-300 group-hover:scale-105"
                            />
                        </div>

                        {order.status === 'pending' && (
                            <div className="p-4 mt-4 border rounded-md border-surface-3-light bg-surface-1-light dark:border-surface-3-dark dark:bg-surface-1-dark">
                                <div className="flex gap-3">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={2}
                                        stroke="currentColor"
                                        className="flex-shrink-0 w-5 h-5 text-main-text-light dark:text-main-text-dark"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                                        />
                                    </svg>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-main-text-light dark:text-main-text-dark">
                                            {__('Your payment proof is under review')}
                                        </p>
                                        <p className="mt-1 text-xs text-main-text-light dark:text-main-text-dark">
                                            {__("We'll notify you once it's approved.")}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
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
                            customMessage={__(
                                'Please upload proof of your bank transfer to complete the payment.',
                            )}
                        />

                        {/* Upload Button */}
                        {paymentProofPreview && (
                            <button
                                onClick={handleUploadPaymentProof}
                                disabled={isUploading}
                                className="flex items-center justify-center w-full gap-2 px-6 py-4 text-sm font-semibold transition-all rounded-md bg-main-text-light text-main-text-dark hover:bg-main-text-light/80 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-main-text-dark dark:text-main-text-light dark:hover:bg-main-text-dark/80"
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
        </div>
    );
}

// Items
function OrderItems({ order, currency, __ }) {
    const generateSmartphoneURL = (smartphone, isDirect = false, isSinglePage = false) => {
        return `/product/${encodeURIComponent(smartphone?.public_id)}/${smartphone?.slug}`; //${isSinglePage ? '&single_page=true' : ''}${isDirect ? '&direct=true' : ''}`;
    };

    return (
        <div className="p-8 bg-white border rounded-md border-surface-3-light dark:border-surface-3-dark dark:bg-surface-1-dark">
            {/* Header */}
            <h2 className="mb-10 text-[18px] font-semibold text-main-text-light dark:text-main-text-dark">
                {__('Order Items')} ({order.order_items?.length || 0})
            </h2>

            {/* Items List */}
            <div className="space-y-6">
                {order.order_items?.map((item, index) => {
                    // Calculate addons total
                    const addonsTotal =
                        item.smartphone_addons?.reduce(
                            (total, addon) => total + Number(addon.total_price),
                            0,
                        ) || 0;

                    // Calculate product total (unit price × quantity)
                    const productTotal = Number(item.unit_price) * Number(item.quantity);

                    // Calculate final item total
                    const finalItemTotal = Number(item.sub_total) + addonsTotal;

                    return (
                        <div key={item.id}>
                            <div className="flex flex-col items-start gap-6 lg:flex-row">
                                {/* Product Image */}
                                {(item?.smartphone?.smartphone_image_urls?.length > 0 ||
                                    item?.smartphone?.smartphone_video_urls?.length > 0) && (
                                    <div
                                        className="relative overflow-hidden transition-all rounded-md cursor-pointer group/img aspect-square h-28 w-28 shrink-0 bg-surface-2-light dark:bg-surface-2-dark"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            router.get(
                                                route('home') +
                                                    generateSmartphoneURL(
                                                        item?.smartphone,
                                                        true,
                                                        true,
                                                    ),
                                            );
                                        }}
                                    >
                                        <img
                                            src={
                                                item?.smartphone?.smartphone_image_urls?.[0] ||
                                                item?.smartphone?.smartphone_video_urls?.[0]
                                                    ?.thumbnail_url ||
                                                Placeholder
                                            }
                                            alt={item?.smartphone?.model_name?.name}
                                            className="object-cover w-full h-full transition-transform duration-300 lg:group-hover/img:scale-110"
                                            loading="lazy"
                                            onError={(e) => (e.target.src = Placeholder)}
                                        />
                                    </div>
                                )}

                                {/* Product Details */}
                                <div className="flex-1 space-y-2">
                                    {/* Item Name */}
                                    <div>
                                        <h3 className="text-sm font-medium text-main-text-light dark:text-main-text-dark">
                                            {__('Item Name')} :{' '}
                                            {item?.smartphone?.model_name?.name || 'N/A'}
                                        </h3>
                                    </div>

                                    {/* Product Options */}
                                    {(item?.smartphone?.capacity?.name || item?.color?.name) && (
                                        <div className="text-sm font-medium text-main-text-light dark:text-main-text-dark">
                                            <span className="font-medium">
                                                {__('Product Options')} :{' '}
                                            </span>
                                            {[item?.smartphone?.capacity?.name, item?.color?.name]
                                                .filter(Boolean)
                                                .join(', ')}
                                        </div>
                                    )}

                                    {/* UPC / EAN */}
                                    {['shipped', 'arrived_locally', 'delivered'].includes(
                                        order.status.toLowerCase(),
                                    ) && (
                                        <div className="text-sm font-medium text-main-text-light dark:text-main-text-dark">
                                            <span className="font-medium">
                                                {__('UPC / EAN')} :{' '}
                                            </span>
                                            {item?.smartphone?.upc || 'N/A'}
                                        </div>
                                    )}

                                    {/* Quantity */}
                                    <div className="text-sm font-medium text-main-text-light dark:text-main-text-dark">
                                        <span className="font-medium">{__('Quantity')} : </span>
                                        {item.quantity}
                                    </div>

                                    {/* Unit Price */}
                                    <div className="text-sm font-medium text-main-text-light dark:text-main-text-dark">
                                        <span className="font-medium">{__('Unit Price')} : </span>
                                        {currency?.symbol}
                                        {Number(item.unit_price).toLocaleString('en-US')}
                                    </div>

                                    {/* Product Total */}
                                    <div className="text-sm font-medium text-main-text-light dark:text-main-text-dark">
                                        <span className="font-medium">
                                            {__('Product Total')} :{' '}
                                        </span>
                                        {currency?.symbol}
                                        {productTotal.toLocaleString('en-US')}
                                    </div>

                                    {/* Shipping */}
                                    <div className="text-sm font-medium text-main-text-light dark:text-main-text-dark">
                                        <span className="font-medium">{__('Shipping')} : </span>
                                        {Number(item.shipping_cost || 0) === 0
                                            ? __('Free')
                                            : `${currency?.symbol}${Number(item.shipping_cost).toLocaleString('en-US')}`}
                                    </div>

                                    {/* Import Tax */}
                                    <div className="pb-4 text-sm font-medium text-main-text-light dark:text-main-text-dark">
                                        <span className="font-medium">{__('Import Tax')} : </span>
                                        {currency?.symbol}
                                        {Number(item.import_cost || 0).toLocaleString('en-US')}
                                    </div>

                                    {/* Add-ons */}
                                    {item.smartphone_addons?.length > 0 && (
                                        <>
                                            <div className="mt-10 border-t border-surface-3-light dark:border-surface-3-dark" />
                                            <div className="py-3 space-y-2">
                                                {item.smartphone_addons.map((addon) => (
                                                    <div
                                                        key={addon.id}
                                                        className="text-sm font-medium text-main-text-light dark:text-main-text-dark"
                                                    >
                                                        <span className="font-medium">
                                                            {addon.name} x {addon.quantity} :{' '}
                                                        </span>
                                                        {currency?.symbol}
                                                        {Number(addon.total_price).toFixed(2)}
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    )}

                                    <div className="mt-10 border-b border-surface-3-light dark:border-surface-3-dark" />

                                    {/* Final Item Total */}
                                    <div className="pt-4 text-[16px] font-semibold text-main-text-light dark:text-main-text-dark">
                                        {__('Final Item Total')} : {currency?.symbol}
                                        {Number(finalItemTotal).toLocaleString('en-US')}
                                    </div>
                                </div>
                            </div>

                            {/* Divider */}
                            {index < order.order_items.length - 1 && (
                                <div className="mt-10 mb-10 border-b border-surface-3-light dark:border-surface-3-dark" />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ORder Summary
function OrderSummaryCard({ order, currency, __ }) {
    return (
        <div className="space-y-3">
            {/* Summary Card */}
            <div className="p-8 bg-white border rounded-md border-surface-3-light dark:border-surface-3-dark dark:bg-surface-1-dark">
                <h2 className="mb-6 text-[18px] font-semibold text-main-text-light dark:text-main-text-dark">
                    {__('Order Summary')}
                </h2>

                {/* Price Breakdown */}
                <div className="pb-5 mb-5 space-y-3 border-b border-surface-3-light dark:border-surface-3-dark">
                    {/* Items Total */}
                    <div className="flex items-center justify-between">
                        <span className="text-[14px] font-semibold text-main-text-light dark:text-main-text-dark">
                            {__('Items total')}
                        </span>
                        <span className="text-[20px] font-semibold text-main-text-light dark:text-main-text-dark">
                            {currency?.symbol}
                            {(
                                Number(order?.sub_total || 0) + Number(order.addons_sub_total || 0)
                            ).toLocaleString('en-US')}
                        </span>
                    </div>

                    {/* Shipping */}
                    <div className="flex items-center justify-between">
                        <span className="text-[14px] font-semibold text-main-text-light dark:text-main-text-dark">
                            {__('Shipping')}
                        </span>
                        <span className="text-[20px] font-semibold text-main-text-light dark:text-main-text-dark">
                            {order.shipping_fee == 0
                                ? __('Free')
                                : `${currency?.symbol}${Number(order.shipping_fee).toLocaleString('en-US')}`}
                        </span>
                    </div>

                    {/* Import Tax */}
                    <div className="flex items-center justify-between">
                        <span className="text-[14px] font-semibold text-main-text-light dark:text-main-text-dark">
                            {__('Import Tax')}
                        </span>
                        <span className="text-[20px] font-semibold text-main-text-light dark:text-main-text-dark">
                            {currency?.symbol}
                            {Number(order.import_tax).toLocaleString('en-US')}
                        </span>
                    </div>

                    {/* Points */}
                    <div className="flex items-center justify-between">
                        <span className="text-[14px] font-semibold text-main-text-light dark:text-main-text-dark">
                            {__('Points')}
                        </span>
                        <span className="text-[20px] font-semibold text-[#ff4400]">
                            - {currency?.symbol}
                            {Number(order.points_used).toLocaleString('en-US')}
                        </span>
                    </div>
                </div>

                {/* Total Due */}
                <div className="flex items-center justify-between">
                    <span className="text-[14px] font-semibold text-main-text-light dark:text-main-text-dark">
                        {__('Total due')}
                    </span>
                    <span className="text-[30px] font-semibold text-[#ff4400]">
                        {currency?.symbol}
                        {Number(order?.amount).toLocaleString('en-US')}
                    </span>
                </div>
            </div>
        </div>
    );
}

// Packaging Videos Component
function PackagingVideos({ order, __, handleRecordingView }) {
    if (!order.order_package_recordings?.length) return null;

    return (
        <div className="p-6 bg-white border rounded-md border-surface-3-light dark:border-surface-3-dark dark:bg-surface-1-dark">
            <h2 className="mb-6 text-[18px] font-semibold text-main-text-light dark:text-main-text-dark">
                {__('Packaging Verification')}
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {order.order_package_recordings.map((recording, index) => {
                    const hasBarcodePhoto = !!recording.barcode_photo;
                    const hasScreenRecording = !!recording.screen_recording_video;
                    const hasSceneVideo = !!recording.scene_video;
                    const mediaCount = [hasBarcodePhoto, hasScreenRecording, hasSceneVideo].filter(
                        Boolean,
                    ).length;

                    // Thumbnail — prefer screen recording, fallback scene video thumbnail, fallback placeholder
                    const thumbnail =
                        recording.screen_recording_thumbnail ||
                        recording.scene_video_thumbnail ||
                        Placeholder;

                    return (
                        <div
                            key={index}
                            onClick={() => handleRecordingView({ ...recording, index })}
                            className="relative overflow-hidden transition-all bg-white border cursor-pointer group rounded-xl border-surface-3-light hover:shadow-md dark:border-surface-3-dark dark:bg-surface-1-dark"
                        >
                            {/* Thumbnail */}
                            <div className="relative overflow-hidden aspect-video bg-surface-3-dark">
                                <img
                                    src={thumbnail}
                                    alt={'Recording ' + (index + 1)}
                                    onError={(e) => (e.target.src = Placeholder)}
                                    className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                                />
                                {/* Play overlay */}
                                <div className="absolute inset-0 flex items-center justify-center transition bg-black/20 group-hover:bg-black/35">
                                    <div className="flex items-center justify-center w-12 h-12 transition rounded-full shadow-lg bg-white/90 group-hover:scale-110">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            fill="currentColor"
                                            className="h-5 w-5 translate-x-0.5 text-main-text-light"
                                        >
                                            <path d="M5.25 5.25v13.5l13.5-6.75L5.25 5.25z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="px-3 py-3">
                                <p className="text-sm font-semibold text-main-text-light dark:text-main-text-dark">
                                    {__('Verification')} #{index + 1}
                                </p>

                                {/* Media type pills */}
                                <div className="mt-1.5 flex flex-wrap gap-1">
                                    {hasBarcodePhoto && (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-medium text-violet-700 dark:bg-violet-900/20 dark:text-violet-300">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                className="h-2.5 w-2.5"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z"
                                                />
                                            </svg>
                                            {__('Photo')}
                                        </span>
                                    )}
                                    {hasScreenRecording && (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                className="h-2.5 w-2.5"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25A2.25 2.25 0 0 1 5.25 3h13.5A2.25 2.25 0 0 1 21 5.25Z"
                                                />
                                            </svg>
                                            {__('Screen')}
                                        </span>
                                    )}
                                    {hasSceneVideo && (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-medium text-green-700 dark:bg-green-900/20 dark:text-green-300">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                className="h-2.5 w-2.5"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"
                                                />
                                            </svg>
                                            {__('Scene')}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// Return Tracking Slip Upload Component
function ReturnTrackingSlipUpload({
    order,
    __,
    handleTrackingSlipSelect,
    handleTrackingSlipRemove,
    trackingSlipFile,
    trackingSlipPreview,
    isUploadingTrackingSlip,
    handleUploadTrackingSlip,
    handleImageView,
}) {
    const refund = order?.refund;
    // Only show when refund exists and status is approved
    if (
        !refund ||
        (refund.refund_status !== 'awaiting_return_tracking' &&
            refund.refund_status !== 'awaiting_returned_item' &&
            !refund.return_tracking_uploaded_at)
    )
        return null;

    const deadlinePassed = refund.return_tracking_deadline_at
        ? dayjs.utc(refund.return_tracking_deadline_at).diff(dayjs(), 'minute') <= 0
        : false;

    // If uploaded_at is set, customer already uploaded — show processing
    // regardless of whether S3 job has completed yet
    const alreadyUploaded = !!refund.return_tracking_uploaded_at;

    return (
        <div className="p-8 bg-white border rounded-md border-surface-3-light dark:border-surface-3-dark dark:bg-surface-1-dark">
            {/* Header */}
            <div className="flex items-center justify-start gap-4 mb-4">
                <h2 className="text-[18px] font-semibold text-main-text-light dark:text-main-text-dark">
                    {__('Return Tracking Slip')}
                </h2>

                {/* Deadline badge */}
                {!alreadyUploaded && (
                    <span className="text-[14px] font-semibold text-[#ff0000]">
                        {(() => {
                            const totalMinutes = dayjs
                                .utc(refund.return_tracking_deadline_at)
                                .diff(dayjs(), 'minute');
                            if (totalMinutes <= 0) return __('Deadline Passed');
                            const hours = Math.floor(totalMinutes / 60);
                            const minutes = totalMinutes % 60;
                            if (hours > 0 && minutes > 0)
                                return `${__('Expires in')} ${hours}h ${minutes}m`;
                            if (hours > 0) return `${__('Expires in')} ${hours}h`;
                            return `${__('Expires in')} ${minutes}m`;
                        })()}
                    </span>
                )}
            </div>

            {/* Deadline info line */}
            {refund.return_tracking_deadline_at && !alreadyUploaded && (
                <p className="mb-4 text-[13px] font-medium text-sub-text-light dark:text-sub-text-dark">
                    {__('Deadline')}:{' '}
                    {dayjs
                        .utc(refund.return_tracking_deadline_at)
                        .local()
                        .toDate()
                        .toLocaleString()}
                </p>
            )}

            {/* Already uploaded — show processing state */}
            {alreadyUploaded && (
                <div className="space-y-4">
                    {/* If S3 job completed, show the image */}
                    {refund.return_tracking_image ? (
                        <div>
                            <div
                                onClick={() => handleImageView(refund.return_tracking_image)}
                                className="overflow-hidden transition-all border-2 rounded-md cursor-pointer group border-surface-3-light bg-surface-3-light dark:border-surface-3-dark dark:bg-surface-3-dark"
                            >
                                <img
                                    src={refund.return_tracking_image}
                                    alt={__('Return Tracking Slip')}
                                    className="object-contain w-full h-64 transition-transform duration-300 group-hover:scale-105"
                                />
                            </div>

                            <div className="p-4 mt-4 border rounded-md border-surface-3-light bg-surface-1-light dark:border-surface-3-dark dark:bg-surface-1-dark">
                                <div className="flex gap-3">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={2}
                                        stroke="currentColor"
                                        className="flex-shrink-0 w-5 h-5 text-main-text-light dark:text-main-text-dark"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                                        />
                                    </svg>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-main-text-light dark:text-main-text-dark">
                                            {__('Your tracking slip has been submitted')}
                                        </p>
                                        <p className="mt-1 text-xs text-main-text-light dark:text-main-text-dark">
                                            {__("We'll process your refund shortly.")}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        // S3 job still processing
                        <div className="p-4 border rounded-md border-surface-3-light bg-surface-1-light dark:border-surface-3-dark dark:bg-surface-1-dark">
                            <div className="flex gap-3">
                                <svg
                                    className="flex-shrink-0 w-5 h-5 animate-spin text-main-text-light dark:text-main-text-dark"
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
                                    />
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    />
                                </svg>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-main-text-light dark:text-main-text-dark">
                                        {__('Your tracking slip is being processed')}
                                    </p>
                                    <p className="mt-1 text-xs text-main-text-light dark:text-main-text-dark">
                                        {__('This may take a moment. Please check back shortly.')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Deadline passed and not uploaded */}
            {!alreadyUploaded && deadlinePassed && (
                <div className="mt-2 w-full rounded-md border border-[#FBBABA] bg-red-50 p-4 px-7 dark:border-surface-3-dark dark:bg-surface-1-dark">
                    <p className="text-[13px] font-semibold text-main-text-light dark:text-main-text-dark">
                        {__(
                            'The deadline to upload your return tracking slip has passed. Your refund request may be rejected automatically.',
                        )}
                    </p>
                </div>
            )}

            {/* Upload form — only when not yet uploaded and deadline not passed */}
            {!alreadyUploaded && !deadlinePassed && (
                <div className="space-y-4">
                    {/* Instruction box */}
                    <div className="w-full rounded-md border border-[#FBBABA] bg-red-50 p-4 px-7 dark:border-surface-3-dark dark:bg-surface-1-dark">
                        <h3 className="mb-2 text-[13px] font-semibold text-main-text-light dark:text-main-text-dark">
                            {__('Important Instructions')}
                        </h3>
                        <ul className="mb-2 list-inside list-disc space-y-1 text-[13px] font-medium text-main-text-light dark:text-main-text-dark">
                            <li>{__('Ship the item back to us using a trackable courier')}</li>
                            <li>{__('Take a clear photo of the return shipping tracking slip')}</li>
                            <li>
                                {__(
                                    'Upload the photo before the deadline to avoid automatic rejection',
                                )}
                            </li>
                        </ul>
                    </div>

                    <CustomFileUploader
                        onFileSelect={handleTrackingSlipSelect}
                        onFileRemove={handleTrackingSlipRemove}
                        accept="image/*"
                        maxSize={5 * 1024 * 1024}
                        preview={trackingSlipPreview}
                        fileName={trackingSlipFile?.name}
                        fileSize={trackingSlipFile?.size}
                        uploadButtonText={__('Upload Tracking Slip')}
                        disabled={isUploadingTrackingSlip}
                        customMessage={__('Upload a photo of your return shipping tracking slip.')}
                    />

                    {trackingSlipPreview && (
                        <button
                            onClick={handleUploadTrackingSlip}
                            disabled={isUploadingTrackingSlip}
                            className="flex items-center justify-center w-full gap-2 px-6 py-4 text-sm font-semibold transition-all rounded-md bg-main-text-light text-main-text-dark hover:bg-main-text-light/80 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-main-text-dark dark:text-main-text-light dark:hover:bg-main-text-dark/80"
                        >
                            {isUploadingTrackingSlip ? (
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
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        />
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
                                    {__('Upload Tracking Slip')}
                                </>
                            )}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
