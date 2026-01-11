import Card from '@/Components/Card';
import LinkButton from '@/Components/LinkButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BreadCrumb from '@/Components/BreadCrumb';
import { Head, useForm, usePage } from '@inertiajs/react';
import React, { useEffect, useRef, useState } from 'react';
import PrimaryButton from '@/Components/PrimaryButton';
import Swal from 'sweetalert2';
import Toast from '@/Components/Toast';
import Placeholder from 'asset/assets/images/product/placeholder.jpg';
import getContrastingColor from '@/Hooks/useColorContraster';
import { useTranslation } from '@/Hooks/useTranslation';

export default function show({ order }) {
    // Currency
    const { currency } = usePage().props;
    const [downloading, setDownloading] = useState(false);

    // Translation Hook
    const { __ } = useTranslation();

    // Error State
    const [ValidationErrors, setValidationErrors] = useState({});
    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-500 text-white ',
            paid: 'bg-blue-500 text-white ',
            shipped: 'bg-pink-500 text-white ',
            arrived_locally: 'bg-stone-500 text-white ',
            delivered: 'bg-green-500 text-white ',
            awaiting_payment: 'bg-indigo-500 text-white ',
            failed: 'bg-red-500 text-white ',
            expired: 'bg-gray-500 text-white ',
        };
        return colors[status] || colors.pending;
    };

    const handleFileDownload = async (fileName, fileUrl) => {
        try {
            setDownloading(true);
            const response = await fetch(fileUrl, { mode: 'cors' });
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Download failed - CORS issue',
                text: error,
            }).then((result) => {
                if (result.isConfirmed) {
                    window.open(fileUrl, '_blank');
                }
            });
        } finally {
            setDownloading(false);
        }
    };

    // Package Recording Logic

    const {
        data: package_video,
        setData: setPackageVideo,
        processing: packageVideoProcessing,
        post: postPackageVideo,
        errors: packageVideoErrors,
    } = useForm({ package_video: '', order_id: order.id });

    const fileInputRef = useRef(null);
    const [openRecorder, setOpenRecorder] = useState(false);
    const [recordingSaving, setRecordingSaving] = useState(false);
    const [stream, setStream] = useState(null);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [recordedVideoUrl, setRecordedVideoUrl] = useState(null);
    const [error, setError] = useState(null);
    const [availableDevices, setAvailableDevices] = useState([]);
    const [useFrontCamera, setUseFrontCamera] = useState(false);
    const [videoIsntBeignUploadedYetOnAWS, setVideoIsntBeignUploadedYetOnAWS] = useState(false);

    const videoRef = useRef(null);

    const getAvailableDevices = async () => {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter((device) => device.kind === 'videoinput');
            const audioDevices = devices.filter((device) => device.kind === 'audioinput');

            setAvailableDevices({
                video: videoDevices,
                audio: audioDevices,
            });

            return { video: videoDevices, audio: audioDevices };
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: error.message || 'Something went wrong',
            });
            return { video: [], audio: [] };
        }
    };

    // Try multiple camera access strategies
    const startCameraWithFallback = async () => {
        setError(null);

        // Stop existing stream first
        if (stream) {
            stream.getTracks().forEach((track) => track.stop());
            setStream(null);
        }

        const strategies = [
            // Strategy 1: Basic constraints (most compatible)
            {
                video: {
                    facingMode: useFrontCamera ? 'user' : 'environment',
                },
                audio: true,
            },

            // Strategy 2: Just video, no audio
            {
                video: {
                    facingMode: useFrontCamera ? 'user' : 'environment',
                },
                audio: false,
            },

            // Strategy 3: Specific device constraints
            {
                video: {
                    facingMode: useFrontCamera ? 'user' : 'environment',
                    width: { min: 320, ideal: 640, max: 1920 },
                    height: { min: 240, ideal: 480, max: 1080 },
                },
                audio: true,
            },

            // Strategy 4: Mobile-friendly constraints
            {
                video: {
                    facingMode: useFrontCamera ? 'user' : 'environment',
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                },
                audio: true,
            },

            // Strategy 5: Environment camera (back camera)
            {
                video: {
                    facingMode: useFrontCamera ? 'user' : 'environment',
                },
                audio: true,
            },
        ];

        for (let i = 0; i < strategies.length; i++) {
            const constraints = strategies[i];

            try {
                const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);

                // Success! Setup the stream
                setStream(mediaStream);

                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream;
                    try {
                        await videoRef.current.play();
                    } catch (playError) {
                        console.warn('Video play error (usually harmless):', playError);
                    }
                }

                // Setup MediaRecorder
                try {
                    let mimeType = 'video/webm';

                    // Try different mime types
                    const supportedTypes = [
                        'video/webm;codecs=vp9',
                        'video/webm;codecs=vp8',
                        'video/webm',
                        'video/mp4',
                    ];

                    for (const type of supportedTypes) {
                        if (MediaRecorder.isTypeSupported(type)) {
                            mimeType = type;
                            break;
                        }
                    }

                    const recorder = new MediaRecorder(mediaStream, { mimeType });
                    const chunks = [];

                    recorder.ondataavailable = (event) => {
                        if (event.data.size > 0) {
                            chunks.push(event.data);
                        }
                    };

                    recorder.onstop = () => {
                        const blob = new Blob(chunks, { type: mimeType });
                        const url = URL.createObjectURL(blob);
                        setRecordedVideoUrl(url);
                        setIsRecording(false);
                        chunks.length = 0; // Clear chunks
                    };

                    recorder.onerror = (event) => {
                        setError('Recording error: ' + event.error.message);
                    };

                    setMediaRecorder(recorder);
                } catch (recorderError) {
                    setError('MediaRecorder not supported: ' + recorderError.message);
                }

                return; // Success, exit the loop
            } catch (err) {
                if (i === strategies.length - 1) {
                    // Last strategy failed
                    let errorMessage = 'All camera access strategies failed. ';

                    switch (err.name) {
                        case 'NotFoundError':
                        case 'DevicesNotFoundError':
                            errorMessage += 'No camera device found. Please connect a camera.';
                            break;
                        case 'NotAllowedError':
                        case 'PermissionDeniedError':
                            errorMessage +=
                                'Camera permission denied. Please allow camera access in browser settings.';
                            break;
                        case 'NotReadableError':
                        case 'TrackStartError':
                            errorMessage +=
                                'Camera is being used by another application. Please close other camera apps.';
                            break;
                        case 'OverconstrainedError':
                        case 'ConstraintNotSatisfiedError':
                            errorMessage += 'Camera constraints not supported by your device.';
                            break;
                        default:
                            errorMessage += `Error: ${err.message}`;
                    }

                    setError(errorMessage);
                }
            }
        }
    };

    const handleStartRecording = () => {
        if (mediaRecorder && mediaRecorder.state === 'inactive') {
            try {
                mediaRecorder.start(1000);
                setIsRecording(true);
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: error.message || 'Something went wrong',
                });
            } finally {
                setRecordedVideoUrl(null);
            }
        }
    };

    const handleStopRecording = () => {
        if (mediaRecorder && mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
        }
    };

    const handleSave = async () => {
        if (!recordedVideoUrl) return;

        setRecordingSaving(true);

        try {
            const response = await fetch(recordedVideoUrl);
            const blob = await response.blob();
            const file = new File([blob], `recording-${Date.now()}.webm`, {
                type: blob.type,
            });

            setPackageVideo('package_video', file);
            handleClose();
        } catch (err) {
            console.error('Save error:', err);
            setError(`Save error: ${err.message}`);
        } finally {
            setRecordingSaving(false);
        }
    };

    const handleRetake = () => {
        if (recordedVideoUrl) {
            URL.revokeObjectURL(recordedVideoUrl);
        }
        setRecordedVideoUrl(null);
        // Restart camera
        startCameraWithFallback();
    };

    const handleClose = () => {
        if (stream) {
            stream.getTracks().forEach((track) => track.stop());
            setStream(null);
        }

        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
        }

        if (recordedVideoUrl) {
            URL.revokeObjectURL(recordedVideoUrl);
        }

        setMediaRecorder(null);
        setRecordedVideoUrl(null);
        setIsRecording(false);
        setError(null);
        setOpenRecorder(false);
    };

    // Auto-start camera when modal opens
    useEffect(() => {
        if (openRecorder) {
            getAvailableDevices().then(() => {
                if (!recordedVideoUrl) {
                    startCameraWithFallback();
                }
            });
        }
    }, [openRecorder, useFrontCamera]);

    // Auto Upload If File Found
    useEffect(() => {
        if (package_video && package_video.package_video) {
            postPackageVideo(route('dashboard.orders.packagerecordingstore'), {
                forceFormData: true,

                onError: (error) => {
                    setValidationErrors(error);

                    const timeout = setTimeout(() => {
                        setValidationErrors({});
                    }, 5000);

                    return () => clearTimeout(timeout);
                },

                onFinish: () => {
                    setPackageVideo('package_video', null);
                },
            });
        }
    }, [package_video]);

    useEffect(() => {
        if (videoIsntBeignUploadedYetOnAWS) {
            const timer = setTimeout(() => {
                setVideoIsntBeignUploadedYetOnAWS(false);
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [videoIsntBeignUploadedYetOnAWS]);


    return (
        <>
            <AuthenticatedLayout>
                <Head title={`Orders`} />

                <BreadCrumb
                    header={'View Order'}
                    parent={'Orders'}
                    parent_link={route('dashboard.orders.index')}
                    child={'View Order'}
                />

                {Object.keys(ValidationErrors).length > 0 && (
                    <Toast
                        flash={{
                            error: Object.values(ValidationErrors)[0],
                        }}
                    />
                )}

                <div className="space-y-6">
                    <Card
                        Content={
                            <div className="p-6">
                                <div className="flex flex-col mb-6 lg:flex-row lg:items-center lg:justify-between">
                                    <div className="mb-4 lg:mb-0">
                                        <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white/90">
                                            Order: {order.order_no}
                                        </h1>
                                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-white/90">
                                            <span>Placed on {order.added_at}</span>
                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(order.status)}`}
                                            >
                                                {order.status.charAt(0).toUpperCase() +
                                                    order.status.slice(1)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-4 lg:flex-nowrap">
                                        {order.status !== 'pending' && (
                                            <>
                                                <LinkButton
                                                    CustomClass={'w-[250px] '}
                                                    Text={'Customer Invoice'}
                                                    URL={route(
                                                        'orders.customer-order-invoice',
                                                        order.order_no,
                                                    )}
                                                    Icon={
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
                                                                d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                                                            />
                                                        </svg>
                                                    }
                                                />

                                                <LinkButton
                                                    CustomClass={'w-[250px] '}
                                                    Text={'Shipping Invoice'}
                                                    URL={route(
                                                        'orders.shipping-invoice',
                                                        order.order_no,
                                                    )}
                                                    Icon={
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
                                                                d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                                                            />
                                                        </svg>
                                                    }
                                                />
                                            </>
                                        )}

                                        <LinkButton
                                            Text={'Back To Orders'}
                                            URL={route('dashboard.orders.index')}
                                            Icon={
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    strokeWidth={1.5}
                                                    stroke="currentColor"
                                                    className="size-4"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"
                                                    />
                                                </svg>
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                        }
                    />

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* Main Content */}
                        <div className="space-y-6 lg:col-span-2">
                            {/* Order Items */}
                            <Card
                                Content={
                                    <div className="p-6">
                                        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white/90">
                                            Order Items
                                        </h2>
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
                                                    <Card
                                                        key={item.id}
                                                        Content={
                                                            <div className="flex flex-col gap-4 p-4 rounded-md sm:flex-row sm:items-start">

                                                                {/* IMAGE */}
                                                                <div className="flex items-center justify-center flex-shrink-0 w-24 h-24 overflow-hidden rounded-md bg-surface-3-light dark:bg-surface-3-dark">
                                                                    <img
                                                                        src={
                                                                            item?.smartphone?.smartphone_image_urls?.[0] ||
                                                                            Placeholder
                                                                        }
                                                                        alt={item?.smartphone?.model_name?.name}
                                                                        className="object-cover w-full h-full"
                                                                        loading="lazy"
                                                                        onError={(e) => (e.target.src = Placeholder)}
                                                                    />
                                                                </div>

                                                                {/* DETAILS */}
                                                                <div className="flex-1 space-y-3">

                                                                    {/* HEADER */}
                                                                    <div>
                                                                        <h3 className="text-base font-semibold text-main-text-light dark:text-main-text-dark">
                                                                            {item?.smartphone?.model_name?.name || 'N/A'}
                                                                        </h3>

                                                                        <div className="flex flex-wrap gap-2 mt-1 text-xs">
                                                                            {item?.smartphone?.capacity?.name && (
                                                                                <span className="px-2 py-0.5 rounded-md bg-surface-3-light dark:bg-surface-3-dark text-sub-text-light dark:text-sub-text-dark">
                                                                                    {item.smartphone.capacity.name}
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
                                                                                UPC / EAN
                                                                            </span>
                                                                            <span className="font-medium text-main-text-light dark:text-main-text-dark">
                                                                                {item.smartphone?.upc || '—'}
                                                                            </span>
                                                                        </div>

                                                                        <div className="flex justify-between">
                                                                            <span className="text-sub-text-light dark:text-sub-text-dark">
                                                                                Quantity
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
                                                                                Unit Price
                                                                            </span>
                                                                            <span className="text-main-text-light dark:text-main-text-dark">
                                                                                {currency?.symbol}
                                                                                {Number(item.unit_price).toFixed(2)}
                                                                            </span>
                                                                        </div>

                                                                        <div className="flex justify-between">
                                                                            <span className="text-sub-text-light dark:text-sub-text-dark">
                                                                                Product Total
                                                                            </span>
                                                                            <span className="text-main-text-light dark:text-main-text-dark">
                                                                                {currency?.symbol}
                                                                                {(item.unit_price * item.quantity).toFixed(2)}
                                                                            </span>
                                                                        </div>

                                                                        <div className="flex justify-between">
                                                                            <span className="text-sub-text-light dark:text-sub-text-dark">
                                                                                Shipping
                                                                            </span>
                                                                            <span className="text-main-text-light dark:text-main-text-dark">
                                                                                {currency?.symbol}
                                                                                {Number(item.shipping_cost || 0).toFixed(2)}
                                                                            </span>
                                                                        </div>

                                                                        <div className="flex justify-between">
                                                                            <span className="text-sub-text-light dark:text-sub-text-dark">
                                                                                Import Tax
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
                                                                                Add-ons
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
                                                                                    <span className="text-sub-text-light dark:text-sub-text-dark">Add-ons Total</span>
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
                                                                            Final Item Total
                                                                        </span>
                                                                        <span className="text-base font-bold text-main-text-light dark:text-main-text-dark">
                                                                            {currency?.symbol}
                                                                            {finalItemTotal.toFixed(2)}
                                                                        </span>
                                                                    </div>

                                                                </div>
                                                            </div>
                                                        }
                                                    />
                                                );
                                            })}

                                        </div>
                                    </div>
                                }
                            />

                            {/* Payment Proof And Courier Invoice */}


                            <Card
                                Content={
                                    <div className="p-6">
                                        <h2 className="mb-6 text-lg font-semibold text-gray-900 dark:text-white/90">
                                            Payment Proof & Courier Invoice
                                        </h2>

                                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                            {/* Payment Proof */}
                                            <div className="space-y-3">
                                                <h3 className="flex items-center text-sm font-medium text-gray-700 dark:text-white/80">
                                                    <div className="w-2 h-2 mr-2 bg-green-500 rounded-full"></div>
                                                    Payment Proof
                                                </h3>

                                                {order.payment_proof ? (
                                                    <div className="relative p-4 transition-all bg-white border border-gray-200 shadow-sm group rounded-xl hover:shadow-md dark:border-gray-700 dark:bg-deepcharcoal">
                                                        {/* File Icon */}
                                                        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-3 rounded-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
                                                            <svg
                                                                className="w-8 h-8 text-green-600 dark:text-green-400"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth="2"
                                                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                                />
                                                            </svg>
                                                        </div>

                                                        {/* File Info */}
                                                        <div className="mb-4 text-center">
                                                            <p className="text-sm font-medium text-gray-900 truncate dark:text-white/90">
                                                                Payment Screenshot
                                                            </p>
                                                        </div>

                                                        {/* Action Buttons */}
                                                        <div className="flex justify-center space-x-2">
                                                            <a
                                                                href={order.payment_proof}
                                                                target='_blank'
                                                                className="flex items-center justify-center text-blue-600 transition-colors rounded-full h-9 w-9 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
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
                                                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                                    />
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        strokeWidth="2"
                                                                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                                    />
                                                                </svg>
                                                            </a>
                                                            <button
                                                                onClick={() =>
                                                                    handleFileDownload(
                                                                        'Payment Proof',
                                                                        order.payment_proof,
                                                                    )
                                                                }
                                                                className="flex items-center justify-center text-gray-600 transition-colors rounded-full h-9 w-9 bg-gray-50 hover:bg-gray-100 dark:bg-zinc-900/80 dark:text-gray-400 dark:hover:bg-zinc-900/50"
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
                                                                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                                    />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="p-6 text-center border-2 border-gray-200 border-dashed rounded-xl bg-gray-50/50 dark:border-gray-700 dark:bg-deepcharcoal">
                                                        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-lg dark:bg-deepcharcoal">
                                                            <svg
                                                                className="w-6 h-6 text-gray-400"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth="2"
                                                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                                />
                                                            </svg>
                                                        </div>
                                                        <p className="text-sm font-medium text-gray-500 dark:text-white/60">
                                                            No payment proof
                                                        </p>
                                                        <p className="mt-1 text-xs text-gray-400 dark:text-white/50">
                                                            Payment proof Upload pending
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Courier Invoice */}
                                            <div className="space-y-3">
                                                <h3 className="flex items-center text-sm font-medium text-gray-700 dark:text-white/80">
                                                    <div className="w-2 h-2 mr-2 bg-blue-500 rounded-full"></div>
                                                    Courier Invoice
                                                </h3>

                                                {order.courier_invoice ? (
                                                    <div className="relative p-4 transition-all bg-white border border-gray-200 shadow-sm group rounded-xl hover:shadow-md dark:border-gray-700 dark:bg-deepcharcoal">
                                                        {/* PDF Icon */}
                                                        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-3 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
                                                            <svg
                                                                className="w-8 h-8 text-blue-600 dark:text-blue-400"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth="2"
                                                                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                                                                />
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth="2"
                                                                    d="M16 3v6a2 2 0 002 2h2"
                                                                />
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth="1.5"
                                                                    d="M9 15h6m-6-3h6"
                                                                />
                                                            </svg>
                                                        </div>

                                                        {/* File Info */}
                                                        <div className="mb-4 text-center">
                                                            <p className="text-sm font-medium text-gray-900 truncate dark:text-white/90">
                                                                Courier Invoice
                                                            </p>
                                                        </div>

                                                        {/* Action Buttons */}
                                                        <div className="flex justify-center space-x-2">
                                                            <a
                                                                href={order.courier_invoice}
                                                                target='_blank'
                                                                className="flex items-center justify-center text-blue-600 transition-colors rounded-full h-9 w-9 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
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
                                                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                                    />
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        strokeWidth="2"
                                                                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                                    />
                                                                </svg>
                                                            </a>
                                                            <button
                                                                onClick={() =>
                                                                    handleFileDownload(
                                                                        'Courier Invoice',
                                                                        order.courier_invoice,
                                                                    )
                                                                }
                                                                className="flex items-center justify-center text-gray-600 transition-colors rounded-full h-9 w-9 bg-gray-50 hover:bg-gray-100 dark:bg-zinc-900/80 dark:text-gray-400 dark:hover:bg-zinc-900/50"
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
                                                                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                                    />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="p-6 text-center border-2 border-gray-200 border-dashed rounded-xl bg-gray-50/50 dark:border-gray-700 dark:bg-deepcharcoal">
                                                        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-lg dark:bg-deepcharcoal">
                                                            <svg
                                                                className="w-6 h-6 text-gray-400"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth="2"
                                                                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                                                                />
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth="2"
                                                                    d="M16 3v6a2 2 0 002 2h2"
                                                                />
                                                            </svg>
                                                        </div>
                                                        <p className="text-sm font-medium text-gray-500 dark:text-white/60">
                                                            No invoice available
                                                        </p>
                                                        <p className="mt-1 text-xs text-gray-400 dark:text-white/50">
                                                            Invoice Upload Pending
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                }
                            />

                            {/* Packaging Recordings */}
                            <Card
                                Content={
                                    <div className="p-6">
                                        <h2 className="mb-6 text-lg font-semibold text-gray-900 dark:text-white/90">
                                            Packaging Videos
                                        </h2>

                                        <div className="grid grid-cols-1 gap-6 md:grid-cols-1">
                                            {/* Packaging Videos */}
                                            <div className="space-y-3">
                                                <div className="flex flex-wrap items-center justify-between text-sm font-medium text-gray-700 dark:text-white/80">
                                                    <div className="flex items-center">
                                                        <div className="w-2 h-2 mr-2 bg-red-500 rounded-full"></div>
                                                        <h3>Packaging Videos</h3>
                                                    </div>

                                                    <div className="flex items-center gap-3">
                                                        <div className="w-auto lg:w-[200px]">
                                                            <PrimaryButton
                                                                Text={'Record Video'}
                                                                Icon={
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
                                                                            d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"
                                                                        />
                                                                    </svg>
                                                                }
                                                                Type={'button'}
                                                                Action={() => setOpenRecorder(true)}
                                                            />
                                                        </div>
                                                        {/* <div className="w-auto lg:w-[200px]">
                                                            <PrimaryButton
                                                                Text={'Upload Video'}
                                                                Icon={
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
                                                                            d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
                                                                        />
                                                                    </svg>
                                                                }
                                                                Type={'button'}
                                                                Action={() =>
                                                                    fileInputRef.current?.click()
                                                                }
                                                            />
                                                        </div> */}
                                                    </div>
                                                </div>

                                                {/* Hidden File Input */}
                                                <input
                                                    type="file"
                                                    accept="video/*"
                                                    ref={fileInputRef}
                                                    style={{ display: 'none' }}
                                                    onChange={(e) => {
                                                        if (e.target.files.length > 0) {
                                                            const file = e.target.files[0];
                                                            setPackageVideo('package_video', file);
                                                        }
                                                    }}
                                                />

                                                {order?.order_package_recordings.length > 0 ? (
                                                    order?.order_package_recordings.map(
                                                        (item, index) => {
                                                            return (
                                                                <div
                                                                    key={index}
                                                                    className="relative p-4 transition-all bg-white border border-gray-200 shadow-sm group rounded-xl hover:shadow-md dark:border-gray-700 dark:bg-deepcharcoal"
                                                                >
                                                                    {/* File Icon */}
                                                                    <div className="flex items-center justify-center w-16 h-16 mx-auto mb-3 rounded-lg bg-gradient-to-br from-red-50 to-red-100 dark:from-green-900/20 dark:to-red-800/20">
                                                                        <svg
                                                                            xmlns="http://www.w3.org/2000/svg"
                                                                            fill="none"
                                                                            viewBox="0 0 24 24"
                                                                            strokeWidth={1.5}
                                                                            stroke="currentColor"
                                                                            className="w-8 h-8 text-red-600 dark:text-red-400"
                                                                        >
                                                                            <path
                                                                                strokeLinecap="round"
                                                                                strokeLinejoin="round"
                                                                                d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"
                                                                            />
                                                                        </svg>
                                                                    </div>

                                                                    {/* File Info */}
                                                                    <div className="mb-4 text-center">
                                                                        <p className="text-sm font-medium text-gray-900 truncate dark:text-white/90">
                                                                            Packaging Video{' '}
                                                                            {index + 1}
                                                                        </p>
                                                                    </div>

                                                                    {/* Action Buttons */}
                                                                    <div className="flex justify-center space-x-2">
                                                                        <a
                                                                            onClick={(e) => {
                                                                                if (
                                                                                    !item?.package_video
                                                                                ) {
                                                                                    e.preventDefault();
                                                                                    setVideoIsntBeignUploadedYetOnAWS(
                                                                                        true,
                                                                                    );
                                                                                }
                                                                            }}
                                                                            href={item?.package_video}
                                                                            target='_blank'
                                                                            className="flex items-center justify-center text-blue-600 transition-colors rounded-full h-9 w-9 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
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
                                                                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                                                />
                                                                                <path
                                                                                    strokeLinecap="round"
                                                                                    strokeLinejoin="round"
                                                                                    strokeWidth="2"
                                                                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                                                />
                                                                            </svg>
                                                                        </a>
                                                                        <button
                                                                            onClick={() =>
                                                                                handleFileDownload(
                                                                                    'Packaging Video',
                                                                                    item.package_video,
                                                                                )
                                                                            }
                                                                            className="flex items-center justify-center text-gray-600 transition-colors rounded-full h-9 w-9 bg-gray-50 hover:bg-gray-100 dark:bg-zinc-900/80 dark:text-gray-400 dark:hover:bg-zinc-900/50"
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
                                                                                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                                                />
                                                                            </svg>
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            );
                                                        },
                                                    )
                                                ) : (
                                                    <div className="p-6 text-center border-2 border-gray-200 border-dashed rounded-xl bg-gray-50/50 dark:border-gray-700 dark:bg-deepcharcoal">
                                                        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-lg dark:bg-deepcharcoal">
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                strokeWidth={1.5}
                                                                stroke="currentColor"
                                                                className="text-gray-400 size-6"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"
                                                                />
                                                            </svg>
                                                        </div>
                                                        <p className="text-sm font-medium text-gray-500 dark:text-white/60">
                                                            No Videos Found
                                                        </p>
                                                        <p className="mt-1 text-xs text-gray-400 dark:text-white/50">
                                                            Packaging Videos Upload pending
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                }
                            />

                            {/* Customer Information */}
                            <Card
                                Content={
                                    <div className="p-6">
                                        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white/90">
                                            Customer Information
                                        </h2>
                                        <div className="flex items-start space-x-4">
                                            <div className="flex items-center justify-center w-20 h-20 text-white bg-indigo-500 rounded-full">
                                                <span className="text-3xl">
                                                    {order?.customer?.user?.avatar ?? 'N/A'}
                                                </span>
                                            </div>

                                            <div className="flex-1">
                                                <p className="flex items-center text-sm text-gray-600 break-words whitespace-normal dark:text-white/90">
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        strokeWidth={1.5}
                                                        stroke="currentColor"
                                                        className="w-4 h-4 mr-2"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                                                        />
                                                    </svg>

                                                    <span className="min-w-0 break-all whitespace-normal">
                                                        {order.customer?.user?.name || 'N/A'}
                                                    </span>
                                                </p>
                                                <div className="mt-1 space-y-1">
                                                    <p className="flex items-center text-sm text-gray-600 break-words whitespace-normal dark:text-white/90">
                                                        <svg
                                                            className="w-4 h-4 mr-2"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth="2"
                                                                d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                                            />
                                                        </svg>
                                                        <span className="min-w-0 break-all whitespace-normal">
                                                            {order.customer?.user?.email || 'N/A'}
                                                        </span>
                                                    </p>
                                                    {order.customer?.user?.phone && (
                                                        <p className="flex items-center text-sm text-gray-600 dark:text-white/90">
                                                            <svg
                                                                className="w-4 h-4 mr-2"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth="2"
                                                                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                                                />
                                                            </svg>
                                                            {order.customer.user?.phone ?? 'N/A'}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                }
                            />

                            {/* Addresses */}
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                {order?.shipping_address?.address_line1 && (
                                    <Card
                                        Content={
                                            <div className="p-6">
                                                <h3 className="flex items-center mb-3 font-semibold text-gray-900 text-md dark:text-white/90">
                                                    <svg
                                                        className="w-5 h-5 mr-2"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth="2"
                                                            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                                                        />
                                                    </svg>
                                                    Shipping Address 1
                                                </h3>
                                                <address className="text-sm not-italic text-gray-600 break-all whitespace-normal dark:text-white/90">
                                                    {order?.shipping_address?.state || 'N/A'},{' '}
                                                    {order?.shipping_address?.city || 'N/A'}
                                                    <br />
                                                    {order?.shipping_address?.address_line1},{' '}
                                                    {order?.shipping_address?.postal_code || ''}
                                                    <br />
                                                    {order?.shipping_address?.country?.name || ''}
                                                </address>
                                            </div>
                                        }
                                    />
                                )}

                                {order.shipping_address?.address_line2 && (
                                    <Card
                                        Content={
                                            <div className="p-6">
                                                <h3 className="flex items-center mb-3 font-semibold text-gray-900 text-md dark:text-white/90">
                                                    <svg
                                                        className="w-5 h-5 mr-2"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth="2"
                                                            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                                                        />
                                                    </svg>
                                                    Shipping Address 2
                                                </h3>
                                                <address className="text-sm not-italic text-gray-600 break-all whitespace-normal dark:text-white/90">
                                                    {order?.shipping_address?.state || 'N/A'},{' '}
                                                    {order?.shipping_address?.city || 'N/A'}
                                                    <br />
                                                    {order?.shipping_address?.address_line2},{' '}
                                                    {order?.shipping_address?.postal_code || ''}
                                                    <br />
                                                    {order?.shipping_address?.country?.name || ''}
                                                </address>
                                            </div>
                                        }
                                    />
                                )}
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Order Summary */}
                            <Card
                                Content={
                                    <div className="p-6">
                                        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white/90">
                                            Order Summary
                                        </h3>

                                        {/* Products */}
                                        <div className="space-y-3">

                                            {/* Subtotal */}
                                            <div className="flex justify-between text-sm">
                                                <span className="text-sub-text-light dark:text-sub-text-dark">{__('Product SubTotal')}</span>
                                                <span className="font-semibold text-sub-text-ight dark:text-sub-text-dark">
                                                    {currency?.symbol}{parseFloat(Number(order.sub_total)).toFixed(2) || '0.00'}
                                                </span>
                                            </div>

                                            {/* Addon Total */}
                                            <div className="flex justify-between text-sm">
                                                <span className="text-sub-text-light dark:text-sub-text-dark">{__('Addons SubTotal')}</span>
                                                <span className="font-semibold text-sub-text-ight dark:text-sub-text-dark">
                                                    {currency?.symbol}{parseFloat(Number(order.addons_sub_total)).toFixed(2) || '0.00'}
                                                </span>
                                            </div>


                                            {/* Shipping Fee */}
                                            <div className="flex justify-between text-sm">
                                                <span className="text-sub-text-light dark:text-sub-text-dark">{__('Shipping Fee')}</span>
                                                <span className="font-semibold text-sub-text-ight dark:text-sub-text-dark">
                                                    {currency?.symbol}{parseFloat(Number(order.shipping_fee)).toFixed(2) || '0.00'}
                                                </span>
                                            </div>

                                            {/* Improt Tax */}
                                            <div className="flex justify-between text-sm">
                                                <span className="text-sub-text-light dark:text-sub-text-dark">{__('Import Tax')}</span>
                                                <span className="font-semibold text-sub-text-ight dark:text-sub-text-dark">
                                                    {currency?.symbol}{parseFloat(Number(order.import_tax)).toFixed(2) || '0.00'}
                                                </span>
                                            </div>


                                            {order?.discount > 0 && (
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

                                            {/* Summary */}
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
                                }
                            />

                            {/* Distributor & Payment Information */}
                            <Card
                                Content={
                                    <div className="p-6">
                                        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white/90">
                                            Distributor & Payment
                                        </h3>

                                        {/* Distributor Information */}
                                        <div className="mb-6">
                                            <h4 className="flex items-center mb-3 text-sm font-medium text-gray-900 dark:text-white/90">
                                                <svg
                                                    className="w-4 h-4 mr-2 text-gray-600 dark:text-white/90"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h1a1 1 0 011 1v5m-4 0h4"
                                                    />
                                                </svg>
                                                Distributor
                                            </h4>
                                            <div className="space-y-2">
                                                <p className="flex items-center text-sm text-gray-600 break-words whitespace-normal dark:text-white/90">
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        strokeWidth={1.5}
                                                        stroke="currentColor"
                                                        className="w-4 h-4 mr-2"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                                                        />
                                                    </svg>
                                                    <span className="min-w-0 break-all whitespace-normal">
                                                        {order?.order_items[0]?.smartphone?.category
                                                            ?.distributor?.user?.name || 'N/A'}
                                                    </span>
                                                </p>
                                                <p className="flex items-center text-sm text-gray-600 break-words whitespace-normal dark:text-white/90">
                                                    <svg
                                                        className="flex-shrink-0 w-4 h-4 mr-2"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth="2"
                                                            d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                                        />
                                                    </svg>
                                                    {
                                                        <span className="min-w-0 break-all whitespace-normal">
                                                            {order?.order_items[0]?.smartphone
                                                                ?.category?.distributor?.user
                                                                ?.email || 'N/A'}
                                                        </span>
                                                    }
                                                </p>

                                                <p className="flex items-center text-sm text-gray-600 break-words whitespace-normal dark:text-white/90">
                                                    <svg
                                                        className="w-4 h-4 mr-2"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth="2"
                                                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                                        />
                                                    </svg>

                                                    <span className="min-w-0 break-all whitespace-normal">
                                                        {order?.order_items[0]?.smartphone?.category
                                                            ?.distributor?.user?.phone || 'N/A'}
                                                    </span>
                                                </p>
                                            </div>
                                        </div>

                                        {/* Bank Account Information */}
                                        <div className="p-4 mb-6 border rounded-lg bg-gray-50 dark:bg-deepcharcoal">
                                            <h4 className="flex items-center mb-3 text-sm font-medium text-gray-900 dark:text-white/90">
                                                <svg
                                                    className="w-4 h-4 mr-2 text-gray-600 dark:text-white/90"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                                                    />
                                                </svg>
                                                Bank Account Details
                                            </h4>
                                            <div className="grid grid-cols-1 gap-3 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="mx-3 text-gray-600 dark:text-white/90">
                                                        Bank Name:
                                                    </span>
                                                    <span className="min-w-0 font-medium text-gray-900 break-all whitespace-normal dark:text-white/90">
                                                        {order?.order_items[0]?.smartphone?.category
                                                            ?.distributor?.bank_name || 'N/A'}
                                                    </span>
                                                </div>

                                                <div className="flex justify-between">
                                                    <span className="mx-3 text-gray-600 dark:text-white/90">
                                                        Bank Account Name :
                                                    </span>
                                                    <span className="min-w-0 font-medium text-gray-900 break-all whitespace-normal dark:text-white/90">
                                                        {order?.order_items[0]?.smartphone?.category
                                                            ?.distributor?.bank_account_name ||
                                                            'N/A'}
                                                    </span>
                                                </div>

                                                <div className="flex justify-between">
                                                    <span className="mx-3 text-gray-600 dark:text-white/90">
                                                        Bank Account No:
                                                    </span>
                                                    <span className="min-w-0 font-medium text-gray-900 break-all whitespace-normal dark:text-white/90">
                                                        {order?.order_items[0]?.smartphone?.category
                                                            ?.distributor?.bank_account_no || 'N/A'}
                                                    </span>
                                                </div>

                                                <div className="flex justify-between">
                                                    <span className="mx-3 text-gray-600 dark:text-white/90">
                                                        IBAN:
                                                    </span>
                                                    <span className="min-w-0 font-medium text-gray-900 break-all whitespace-normal dark:text-white/90">
                                                        {order?.order_items[0]?.smartphone?.category
                                                            ?.distributor?.iban || 'N/A'}
                                                    </span>
                                                </div>

                                                <div className="flex justify-between">
                                                    <span className="mx-3 text-gray-600 dark:text-white/90">
                                                        SWIFT CODE:
                                                    </span>
                                                    <span className="min-w-0 font-medium text-gray-900 break-all whitespace-normal dark:text-white/90">
                                                        {order?.order_items[0]?.smartphone?.category
                                                            ?.distributor?.swift_code || 'N/A'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Payment Method */}
                                        <div className="flex items-center justify-between p-4 my-4 border border-gray-200 rounded-lg bg-gray-50 dark:border-gray-700 dark:bg-deepcharcoal">
                                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                Payment Method
                                            </span>

                                            <div className="flex items-center space-x-2">
                                                {order.payment_method === 'bank_transfer' && (
                                                    <>
                                                        <svg
                                                            className="w-5 h-5 text-blue-600 dark:text-blue-400"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                                                            />
                                                        </svg>
                                                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                                            Bank Transfer
                                                        </span>
                                                    </>
                                                )}

                                                {order.payment_method === 'crypto' && (
                                                    <>
                                                        <svg
                                                            className="w-5 h-5 text-orange-600 dark:text-orange-400"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                            />
                                                        </svg>
                                                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                                            Crypto Currency
                                                        </span>
                                                    </>
                                                )}

                                                {order.payment_method === 'points' && (
                                                    <>
                                                        <svg
                                                            className="w-5 h-5 text-green-600 dark:text-green-400"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                                                            />
                                                        </svg>
                                                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                                            Reward Points
                                                        </span>
                                                    </>
                                                )}

                                                {!['bank_transfer', 'crypto', 'points'].includes(
                                                    order.payment_method,
                                                ) && (
                                                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                                            N/A
                                                        </span>
                                                    )}
                                            </div>
                                        </div>

                                        {/* Cash Collected Status */}
                                        {order.is_cash_collected == 1 && (
                                            <div className="flex items-center my-3 space-x-3">
                                                <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                                                    <svg
                                                        className="w-4 h-4 text-green-600"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth="2"
                                                            d="M5 13l4 4L19 7"
                                                        />
                                                    </svg>
                                                </div>

                                                <div>
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white/90">
                                                        Cash Collected
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                }
                            />
                        </div>
                    </div>
                </div>

                {/* Downloading Modal */}
                {downloading && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto sm:p-6">
                        <div className="fixed inset-0 backdrop-blur-[32px]"></div>

                        {/* Modal content */}
                        <div className="relative z-10 w-full max-w-lg max-h-screen p-6 overflow-y-auto bg-white shadow-xl rounded-2xl dark:bg-deepcharcoal sm:p-8">
                            <div className="text-center">
                                <h2 className="text-lg font-medium text-gray-800 dark:text-white">
                                    Please Wait While We Are Dowloading File For You
                                </h2>

                                <div className="flex items-center justify-center mt-5">
                                    <div role="status">
                                        <svg
                                            aria-hidden="true"
                                            className="w-8 h-8 text-gray-200 animate-spin fill-blue-600 dark:text-gray-600"
                                            viewBox="0 0 100 101"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                                fill="currentColor"
                                            />
                                            <path
                                                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                                fill="currentFill"
                                            />
                                        </svg>
                                        <span className="sr-only">Loading...</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Package Recording Uploading Modal */}
                {packageVideoProcessing && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto sm:p-6">
                        <div className="fixed inset-0 backdrop-blur-[32px]"></div>

                        {/* Modal content */}
                        <div className="relative z-10 w-full max-w-lg max-h-screen p-6 overflow-y-auto bg-white shadow-xl rounded-2xl dark:bg-deepcharcoal sm:p-8">
                            <div className="text-center">
                                <h2 className="text-lg font-medium text-gray-800 dark:text-white">
                                    Please Wait While We Are Uploading Package Video
                                </h2>

                                <div className="flex items-center justify-center mt-5">
                                    <div role="status">
                                        <svg
                                            aria-hidden="true"
                                            className="w-8 h-8 text-gray-200 animate-spin fill-blue-600 dark:text-gray-600"
                                            viewBox="0 0 100 101"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                                fill="currentColor"
                                            />
                                            <path
                                                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                                fill="currentFill"
                                            />
                                        </svg>
                                        <span className="sr-only">Loading...</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {videoIsntBeignUploadedYetOnAWS && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto sm:p-6">
                        <div
                            className="fixed inset-0 backdrop-blur-[32px]"
                            onClick={() => setVideoIsntBeignUploadedYetOnAWS(false)}
                        ></div>

                        {/* Modal content */}
                        <div className="relative z-10 w-full max-w-lg max-h-screen p-6 overflow-y-auto bg-white shadow-xl rounded-2xl dark:bg-deepcharcoal sm:p-8">
                            <div className="text-center">
                                <h2 className="text-lg font-medium text-gray-800 dark:text-white">
                                    Please Wait The Package Recording Is Processing In Backend
                                    Please Refresh Page After 2 to 3 minutes
                                </h2>

                                <div className="flex items-center justify-center mt-5">
                                    <div role="status">
                                        <svg
                                            aria-hidden="true"
                                            className="w-8 h-8 text-gray-200 animate-spin fill-blue-600 dark:text-gray-600"
                                            viewBox="0 0 100 101"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                                fill="currentColor"
                                            />
                                            <path
                                                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                                fill="currentFill"
                                            />
                                        </svg>
                                        <span className="sr-only">Loading...</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Recording Save Loading Modal */}
                {openRecorder && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto sm:p-6">
                        <div className="fixed inset-0 bg-black/50" onClick={handleClose} />

                        <div className="relative z-10 w-full max-w-3xl max-h-screen p-6 overflow-y-auto text-gray-900 bg-white shadow-xl rounded-2xl dark:bg-deepcharcoal dark:text-white/80 sm:p-8">
                            {/* Header */}
                            <div className="flex items-center justify-between pb-4 mb-4 border-b">
                                <h3 className="text-lg font-semibold">Video Recorder</h3>
                            </div>

                            {/* Error display */}
                            {error && (
                                <div className="p-3 mb-4 border border-red-200 rounded-md bg-red-50">
                                    <div className="mb-2 text-sm text-red-800">{error}</div>
                                    <button
                                        onClick={startCameraWithFallback}
                                        className="px-3 py-1 text-sm text-red-800 bg-red-100 rounded hover:bg-red-200"
                                    >
                                        Retry Camera
                                    </button>
                                </div>
                            )}

                            {/* Device info */}
                            {availableDevices.video && availableDevices.video.length > 0 && (
                                <div className="mb-4 text-sm text-gray-600 dark:text-white/80">
                                    Found {availableDevices.video.length} camera(s) and{' '}
                                    {availableDevices.audio?.length || 0} microphone(s)
                                </div>
                            )}

                            {/* Video display */}
                            <div
                                className="relative mb-4 overflow-hidden bg-black rounded-lg"
                                style={{ aspectRatio: '16/9' }}
                            >
                                {!recordedVideoUrl ? (
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        muted
                                        playsInline
                                        className="object-cover w-full h-full"
                                    />
                                ) : (
                                    <video
                                        key={recordedVideoUrl}
                                        src={recordedVideoUrl}
                                        controls
                                        className="object-cover w-full h-full"
                                        onLoadedMetadata={(e) => {
                                            // ensure it actually starts
                                            try {
                                                e.currentTarget.play();
                                            } catch { }
                                        }}
                                    />
                                )}

                                {/* Recording indicator */}
                                {isRecording && (
                                    <div className="absolute flex items-center px-3 py-1 space-x-2 text-white bg-red-600 rounded-full left-4 top-4">
                                        <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                                        <span className="text-sm font-medium">Recording</span>
                                    </div>
                                )}

                                {!isRecording && !recordedVideoUrl && (
                                    <div
                                        onClick={() => setUseFrontCamera(!useFrontCamera)}
                                        className="absolute flex items-center px-3 py-1 space-x-2 text-white bg-blue-600 rounded-full cursor-pointer right-4 top-4"
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
                                                d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 0 0-3.7-3.7 48.678 48.678 0 0 0-7.324 0 4.006 4.006 0 0 0-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 0 0 3.7 3.7 48.656 48.656 0 0 0 7.324 0 4.006 4.006 0 0 0 3.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3-3 3"
                                            />
                                        </svg>
                                    </div>
                                )}

                                {/* Status overlay when no stream */}
                                {!stream && !recordedVideoUrl && (
                                    <div className="absolute inset-0 flex items-center justify-center text-center text-white">
                                        <div>
                                            <div className="mb-2 text-lg font-medium">
                                                Connecting to camera...
                                            </div>
                                            <div className="text-sm opacity-75">
                                                Please allow camera access if prompted
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Controls */}
                            <div className="flex justify-center space-x-3">
                                {!recordedVideoUrl ? (
                                    <>
                                        <button
                                            onClick={handleStartRecording}
                                            disabled={!stream || isRecording}
                                            className="px-6 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {isRecording ? 'Recording...' : 'Start Recording'}
                                        </button>

                                        <button
                                            onClick={handleStopRecording}
                                            disabled={!isRecording}
                                            className="px-6 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            Stop Recording
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            onClick={handleSave}
                                            disabled={recordingSaving}
                                            className="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                        >
                                            {recordingSaving ? 'Saving...' : 'Upload Video'}
                                        </button>

                                        <button
                                            onClick={handleRetake}
                                            className="px-6 py-2 text-white rounded-lg bg-amber-500 hover:bg-amber-600"
                                        >
                                            Retake
                                        </button>
                                    </>
                                )}

                                <button
                                    onClick={handleClose}
                                    className="px-6 py-2 text-white bg-gray-500 rounded-lg hover:bg-gray-600"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </AuthenticatedLayout>
        </>
    );
}
