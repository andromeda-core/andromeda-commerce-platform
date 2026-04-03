import WebTextArea from '@/Components/WebTextArea';
import { useConfirm } from '@/Hooks/useConfirm';
import { useTranslation } from '@/Hooks/useTranslation';
import useWindowSize from '@/Hooks/useWindowSize';
import MainLayout from '@/Layouts/Website/MainLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ChevronLeft, Flashlight, FlashlightOff } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useScanner } from '@/Hooks/useScanner';
import axios from 'axios';
import { useVideoRecorder } from '@/Hooks/useVideoRecorder';
import NativeScannerPreview from '@/Components/NativeScannerPreview';

const index = ({ order_no, order }) => {
    const { confirm, ConfirmDialog } = useConfirm();
    const { data, setData, post, processing, errors } = useForm({
        refund_reason: '',
        scanned_code: '',
        return_Packaging_video: '',
        defect_evidence_video: '',
    });

    const [activeRecorder, setActiveRecorder] = useState(null);
    // Translation Hook
    const { __ } = useTranslation();

    const [isDisabled, setIsDisabled] = useState(false);

    const [imeiVerified, setImeiVerified] = useState(false);
    const [showVerificationModal, setShowVerificationModal] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [scanCooldown, setScanCooldown] = useState(false);
    const [scanError, setScanError] = useState(null);
    const cooldownRef = useRef(null);
    const scanOverlayRef = useRef(null);
    const [scanRegion, setScanRegion] = useState(null);
    const [torchOn, setTorchOn] = useState(false);
    const [nativeScanOpen, setNativeScanOpen] = useState(false);

    const isMobileDevice =
        /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    const {
        videoRef: scannerVideoRef,
        refocus,
        toggleTorch,
    } = useScanner({
        active: showVerificationModal && !scanCooldown && !isVerifying && !isMobileDevice,
        scanRegion,
    });

    // Add handler near other handlers:
    const handleTorchToggle = async () => {
        const result = await toggleTorch();
        if (result !== null) setTorchOn(result);
    };

    useEffect(() => {
        if (!showVerificationModal) {
            setScanRegion(null);
            return;
        }

        const calculate = () => {
            const videoEl = scannerVideoRef.current;
            const overlayEl = scanOverlayRef.current;
            if (!videoEl || !overlayEl) return;

            const vRect = videoEl.getBoundingClientRect();
            if (vRect.width === 0 || vRect.height === 0) return;

            const videoW = videoEl.videoWidth;
            const videoH = videoEl.videoHeight;
            if (!videoW || !videoH) return;

            const scaleX = vRect.width / videoW;
            const scaleY = vRect.height / videoH;
            const scale = Math.max(scaleX, scaleY);

            const renderedW = videoW * scale;
            const renderedH = videoH * scale;

            const offsetX = (vRect.width - renderedW) / 2;
            const offsetY = (vRect.height - renderedH) / 2;

            const oRect = overlayEl.getBoundingClientRect();
            const relLeft = oRect.left - vRect.left;
            const relTop = oRect.top - vRect.top;

            const x = (relLeft - offsetX) / renderedW;
            const y = (relTop - offsetY) / renderedH;
            const w = oRect.width / renderedW;
            const h = oRect.height / renderedH;

            setScanRegion({
                x: Math.max(0, Math.min(1, x)),
                y: Math.max(0, Math.min(1, y)),
                width: Math.max(0.05, Math.min(1, w)),
                height: Math.max(0.05, Math.min(1, h)),
            });
        };

        let retryCount = 0;
        const tryCalculate = () => {
            const videoEl = scannerVideoRef.current;
            if (videoEl?.videoWidth > 0) {
                calculate();
            } else if (retryCount < 20) {
                retryCount++;
                setTimeout(tryCalculate, 100);
            }
        };

        const t = setTimeout(tryCalculate, 200);
        window.addEventListener('resize', calculate);

        return () => {
            clearTimeout(t);
            window.removeEventListener('resize', calculate);
        };
    }, [showVerificationModal]);

    const windowSize = useWindowSize();
    useEffect(() => {
        setIsDisabled(data.refund_reason === '');
    }, [data]);

    const handleIMEIScan = async (scannedValue) => {
        if (scanCooldown || isVerifying) return;

        const lines = scannedValue.trim().split(/[\n\r\s,;|]+/);
        const code = lines[0]?.trim();

        if (!code) {
            setScanError('Could not read a valid CODE. Please try again.');
            setScanCooldown(true);
            cooldownRef.current = setTimeout(() => {
                setScanCooldown(false);
                setScanError(null);
            }, 2500);
            return;
        }

        setScanCooldown(true);
        setIsVerifying(true);
        setScanError(null);

        try {
            await axios
                .post(route('website.orders.verify'), { code: code, order_no: order_no })
                .then((res) => {
                    if (res.data.status) {
                        setData('scanned_code', code);
                        setImeiVerified(true);
                        setShowVerificationModal(false);
                        setTorchOn(false);
                    }

                    const msg =
                        res?.data?.message ||
                        __('CODE not found. Device not registered in inventory.');
                    setScanError(msg);
                    cooldownRef.current = setTimeout(() => {
                        setScanCooldown(false);
                        setScanError(null);
                    }, 3000);
                });
        } catch (err) {
            const msg =
                err?.response?.data?.message ||
                __('CODE not found. Device not registered in inventory.');
            setScanError(msg);
            cooldownRef.current = setTimeout(() => {
                setScanCooldown(false);
                setScanError(null);
            }, 3000);
        } finally {
            setIsVerifying(false);
        }
    };

    const submit = async (e) => {
        e.preventDefault();

        if (isDisabled) {
            return;
        }

        const result = await confirm({
            title: __('Confirm Refund Request'),
            text: __(
                'Are you sure you want to submit this refund request? Our team will review it before taking any action.',
            ),
            icon: 'info',
            showCancelButton: true,
            confirmButtonText: __('Submit Request'),
            cancelButtonText: __('Cancel'),
        });

        if (result.isConfirmed) {
            post(route('website.orders.refund.request.store', order_no), {
                preserveScroll: true,
                preserveState: true,
            });
        }
    };

    useEffect(() => {
        if (order?.status === 'delivered' && !imeiVerified) {
            setShowVerificationModal(true);
        }
        return () => clearTimeout(cooldownRef.current);
    }, []);

    return (
        <MainLayout>
            <Head title={__('Refund Request', true)} />
            <ConfirmDialog />

            <div className="sm:px-6 lg:px-8">
                <div
                    className={`mx-auto lg:mt-6 ${windowSize.width > 1024 ? 'pb-0' : 'pb-24'} sm:max-w-3xl lg:max-w-6xl`}
                >
                    {/* Hero Section */}
                    <div className="relative overflow-hidden">
                        <div className="absolute inset-0" />

                        <div className="relative mx-auto my-2 px-6 sm:max-w-3xl lg:max-w-6xl">
                            <Link
                                href={route('website.orders.index')}
                                className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-main-text-light transition-colors dark:text-main-text-dark lg:hidden lg:hover:text-main-text-light/80 dark:lg:hover:text-main-text-dark/80"
                            >
                                <ChevronLeft />
                            </Link>

                            <h1 className="text-[24px] font-semibold text-main-text-light dark:text-main-text-dark">
                                {__('Request a Refund')}
                            </h1>

                            <p className="dark:sub-text-dark mt-1 max-w-3xl text-sm text-sub-text-light">
                                {__(
                                    'You can submit a refund request for this order. All refund requests are carefully reviewed by our team before being approved or rejected.',
                                )}
                            </p>

                            <div className="mt-5 flex flex-wrap gap-4">
                                {/* Review Badge */}
                                <div className="flex items-center gap-2 rounded-full bg-surface-1-light px-3 py-1.5 dark:bg-surface-1-dark">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={1.5}
                                        stroke="currentColor"
                                        className="h-4 w-4 text-sub-text-light dark:text-sub-text-dark"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                                        />
                                    </svg>

                                    <span className="text-sm font-medium text-sub-text-light dark:text-sub-text-dark">
                                        {__('Admin Review Required')}
                                    </span>
                                </div>

                                {/* Processing Badge */}
                                <div className="flex items-center gap-2 rounded-full bg-surface-1-light px-3 py-1.5 dark:bg-surface-1-dark">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={1.5}
                                        stroke="currentColor"
                                        className="h-4 w-4 text-sub-text-light dark:text-sub-text-dark"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 0 0-3.7-3.7 48.678 48.678 0 0 0-7.324 0 4.006 4.006 0 0 0-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 0 0 3.7 3.7 48.656 48.656 0 0 0 7.324 0 4.006 4.006 0 0 0 3.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3-3 3"
                                        />
                                    </svg>

                                    <span className="text-sm font-medium text-sub-text-light dark:text-sub-text-dark">
                                        {__('Processed After Approval')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className={`mx-auto mt-10 px-6 sm:max-w-3xl lg:max-w-6xl`}>
                        <div className="grid gap-8 lg:grid-cols-1">
                            {/* Form */}
                            <form onSubmit={submit}>
                                <h2 className="mb-6 text-xl font-semibold text-main-text-light dark:text-main-text-dark">
                                    {__('Submit Refund Request')}
                                </h2>

                                <div className="space-y-3">
                                    {/* Reason Field */}
                                    <div>
                                        <WebTextArea
                                            InputName={__('Reason for Refund')}
                                            Id={'reason'}
                                            Name={'reason'}
                                            Error={errors.refund_reason}
                                            Value={data.refund_reason}
                                            Action={(e) => setData('refund_reason', e.target.value)}
                                            Required={true}
                                            Rows={6}
                                            Placeholder={__(
                                                'Please briefly explain why you are requesting a refund',
                                            )}
                                            ClassName={'dark:bg-surface-1-dark'}
                                        />

                                        {order?.status === 'delivered' && (
                                            <>
                                                <VideoRecorderPanel
                                                    label={__('Defect Evidence Video')}
                                                    onFileSaved={(file) =>
                                                        setData('defect_evidence_video', file)
                                                    }
                                                    isActive={activeRecorder === 'defect'}
                                                    onOpen={() => setActiveRecorder('defect')}
                                                    onClose={() => setActiveRecorder(null)}
                                                    __={__}
                                                />

                                                <VideoRecorderPanel
                                                    label={__('Return Packaging Video')}
                                                    onFileSaved={(file) =>
                                                        setData('return_Packaging_video', file)
                                                    }
                                                    isActive={activeRecorder === 'packaging'}
                                                    onOpen={() => setActiveRecorder('packaging')}
                                                    onClose={() => setActiveRecorder(null)}
                                                    __={__}
                                                />
                                            </>
                                        )}
                                    </div>

                                    {/* Info Box */}
                                    <div className="rounded-md border border-surface-3-light bg-surface-1-light p-4 dark:border-surface-3-dark dark:bg-surface-1-dark">
                                        <p className="text-sm text-sub-text-light dark:text-sub-text-dark">
                                            {__(
                                                'Your refund request will be reviewed by our team. Once reviewed, you will be notified about the approval or rejection.',
                                            )}
                                        </p>
                                    </div>

                                    {/* Submit Button */}
                                    <div className="flex justify-end py-4">
                                        <button
                                            disabled={
                                                processing ||
                                                isDisabled ||
                                                (!imeiVerified && order?.status === 'delivered')
                                            }
                                            type="submit"
                                            className={`text-md flex h-[50px] w-[180px] items-center justify-center gap-2 rounded-md bg-black font-semibold text-white transition-all hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/80 ${(processing || isDisabled || (!imeiVerified && order?.status === 'delivered')) && 'cursor-not-allowed opacity-25 dark:opacity-40'}`}
                                        >
                                            <div className="flex items-center justify-center gap-2">
                                                {processing && (
                                                    <div role="status">
                                                        <svg
                                                            aria-hidden="true"
                                                            className={`size-5 animate-spin fill-red-500 text-white/80`}
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
                                                        <span className="sr-only"></span>
                                                    </div>
                                                )}
                                                <span>{__('Request Refund')}</span>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {showVerificationModal && (
                <>
                    {windowSize.width <= 1024 ? (
                        <>
                            <div className="fixed inset-0 z-40 bg-backgroundLight/80 backdrop-blur-sm dark:bg-backgroundDark/90" />

                            <div
                                className="fixed inset-0 z-40 flex items-start overflow-y-scroll scrollbar-none"
                                style={{ WebkitOverflowScrolling: 'touch' }}
                            >
                                <div className="relative mb-16 flex w-full flex-col gap-0 overflow-hidden rounded-sm border border-surface-3-light bg-backgroundLight shadow-xl dark:border-surface-3-dark dark:bg-surface-1-dark sm:mb-8">
                                    {/* Header */}
                                    <div className="flex items-center justify-between px-4 py-4">
                                        <button
                                            onClick={() =>
                                                router.get(route('website.orders.index'))
                                            }
                                            className="inline-flex items-center text-sm font-medium text-main-text-light transition-colors dark:text-main-text-dark lg:hidden lg:hover:text-main-text-light/80 dark:lg:hover:text-main-text-dark/80"
                                        >
                                            <ChevronLeft />
                                        </button>
                                    </div>

                                    <div className="grid gap-6 px-6 lg:grid-cols-2">
                                        {/* LEFT: Explanation */}
                                        <div className="flex flex-col justify-between gap-5">
                                            <div>
                                                <h2 className="text-lg font-semibold text-main-text-light dark:text-main-text-dark">
                                                    {__('Verify Your Device First')}
                                                </h2>
                                                <p className="mt-1.5 text-sm leading-relaxed text-sub-text-light dark:text-sub-text-dark">
                                                    {__(
                                                        'Before you can submit a refund request, we need to verify the IMEI of the device included in this order. This helps us confirm the device condition and process your refund accurately.',
                                                    )}
                                                </p>
                                            </div>

                                            <div className="space-y-3">
                                                {[
                                                    {
                                                        num: '1',
                                                        title: __('Scan Device Barcode'),
                                                        desc: __(
                                                            'Point your camera at the barcode printed on the device or its box.',
                                                        ),
                                                    },
                                                    {
                                                        num: '2',
                                                        title: __('Auto Verification'),
                                                        desc: __(
                                                            'Scanned Code is extracted and matched against your order automatically.',
                                                        ),
                                                    },
                                                    {
                                                        num: '3',
                                                        title: __('Submit Your Request'),
                                                        desc: __(
                                                            'Once verified, you can fill in the reason and submit your refund.',
                                                        ),
                                                    },
                                                ].map((s) => (
                                                    <div
                                                        key={s.num}
                                                        className="flex items-start gap-3"
                                                    >
                                                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-xs font-semibold text-main-text-light dark:text-main-text-dark">
                                                            {s.num}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-main-text-light dark:text-main-text-dark">
                                                                {s.title}
                                                            </p>
                                                            <p className="mt-0.5 text-xs text-sub-text-light dark:text-sub-text-dark">
                                                                {s.desc}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="flex items-start gap-2 rounded-md border border-surface-3-light bg-surface-1-light p-3 dark:border-surface-3-dark dark:bg-surface-1-dark">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    strokeWidth={1.5}
                                                    stroke="currentColor"
                                                    className="mt-0.5 size-4 shrink-0 text-sub-text-light dark:text-sub-text-dark"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
                                                    />
                                                </svg>
                                                <p className="text-xs leading-relaxed text-sub-text-light dark:text-sub-text-dark">
                                                    {__(
                                                        'IMEI 1, IMEI 2, SERIAL NO., EID Codes Are used for verification. Make sure the barcode is clean and well-lit for best results',
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        {/* RIGHT: Scanner */}
                                        <div className="flex flex-col gap-3 pb-8">
                                            <p className="text-xs font-medium uppercase tracking-wide text-sub-text-light dark:text-sub-text-dark">
                                                {__('Scanner')}
                                            </p>

                                            {/* Viewport — Mobile: tap to open NativeScannerPreview */}
                                            <div
                                                className="relative overflow-hidden rounded-md bg-gray-950"
                                                style={{ aspectRatio: '4/3' }}
                                            >
                                                {/* Idle / error cooldown: tap button */}
                                                {!isVerifying && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setNativeScanOpen(true)}
                                                        disabled={isVerifying}
                                                        className="absolute inset-0 flex h-full w-full flex-col items-center justify-center gap-3 bg-gray-950 transition-colors hover:bg-gray-900 disabled:opacity-50"
                                                    >
                                                        <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-white/30">
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                strokeWidth={1.5}
                                                                stroke="currentColor"
                                                                className="size-8 text-white/60"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z"
                                                                />
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z"
                                                                />
                                                            </svg>
                                                        </div>
                                                        <p className="text-sm font-semibold text-white">
                                                            {__('Tap to Scan Barcode')}
                                                        </p>
                                                        <p className="text-xs text-white/40">
                                                            {__('Opens camera to capture barcode')}
                                                        </p>
                                                    </button>
                                                )}

                                                {/* Verifying with API */}
                                                {isVerifying && (
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gray-950">
                                                        <svg
                                                            className="h-9 w-9 animate-spin text-white/60"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <circle
                                                                className="opacity-20"
                                                                cx="12"
                                                                cy="12"
                                                                r="10"
                                                                stroke="currentColor"
                                                                strokeWidth="3"
                                                            />
                                                            <path
                                                                className="opacity-80"
                                                                fill="currentColor"
                                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                                            />
                                                        </svg>
                                                        <p className="text-sm font-medium text-white/80">
                                                            {__('Verifying IMEI...')}
                                                        </p>
                                                        <p className="text-xs text-white/30">
                                                            {__('Checking order records')}
                                                        </p>
                                                    </div>
                                                )}

                                                {/* Error cooldown overlay */}
                                                {scanCooldown && !isVerifying && scanError && (
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gray-950/95 p-5">
                                                        <div className="flex h-11 w-11 items-center justify-center rounded-full border border-red-800 bg-red-900/30">
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                viewBox="0 0 20 20"
                                                                fill="currentColor"
                                                                className="size-5 text-red-400"
                                                            >
                                                                <path
                                                                    fillRule="evenodd"
                                                                    d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
                                                                    clipRule="evenodd"
                                                                />
                                                            </svg>
                                                        </div>
                                                        <div className="text-center">
                                                            <p className="text-sm font-semibold text-red-300">
                                                                {__('Verification Failed')}
                                                            </p>
                                                            <p className="mt-1 max-w-[180px] text-center text-xs text-white/40">
                                                                {scanError}
                                                            </p>
                                                        </div>
                                                        <p className="animate-pulse text-xs text-white/25">
                                                            {__('Tap to try again...')}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            {!isVerifying && !scanCooldown && (
                                                <div className="flex items-center gap-2">
                                                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
                                                    <span className="text-xs text-sub-text-light dark:text-sub-text-dark">
                                                        {__('Tap the box above to open camera')}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="absolute inset-0 z-40 flex items-start overflow-y-auto scrollbar-none lg:items-center">
                                <div className="absolute inset-0 bg-backgroundLight/80 backdrop-blur-sm dark:bg-backgroundDark/90" />

                                {/* Panel */}
                                <div className="relative z-10 mx-auto mb-16 flex w-full max-w-2xl flex-col gap-0 overflow-hidden rounded-md border border-surface-3-light bg-backgroundLight shadow-xl dark:border-surface-3-dark dark:bg-surface-1-dark sm:mb-8">
                                    {/* Header */}
                                    <div className="flex items-center justify-between border-b border-surface-3-light px-6 py-4 dark:border-surface-3-dark">
                                        <div className="flex items-center gap-2.5">
                                            <div className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
                                            <h3 className="text-sm font-semibold text-main-text-light dark:text-main-text-dark">
                                                {__('Step Required Before Submitting')}
                                            </h3>
                                        </div>

                                        {/* ← Torch button add karo */}
                                        <button
                                            onClick={handleTorchToggle}
                                            title={
                                                torchOn
                                                    ? __('Turn off flashlight')
                                                    : __('Turn on flashlight')
                                            }
                                            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                                                torchOn
                                                    ? 'bg-yellow-400 text-gray-900 hover:bg-yellow-300'
                                                    : 'border border-surface-3-light text-sub-text-light hover:bg-surface-1-light dark:border-surface-3-dark dark:text-sub-text-dark dark:hover:bg-surface-1-dark'
                                            }`}
                                        >
                                            {torchOn ? (
                                                <Flashlight className="size-3.5" />
                                            ) : (
                                                <FlashlightOff className="size-3.5" />
                                            )}
                                            {torchOn ? __('Flash ON') : __('Flash')}
                                        </button>
                                    </div>

                                    <div className="grid gap-6 p-6 lg:grid-cols-2">
                                        {/* LEFT: Explanation */}
                                        <div className="flex flex-col justify-between gap-5">
                                            {/* What is this */}
                                            <div>
                                                <h2 className="text-lg font-semibold text-main-text-light dark:text-main-text-dark">
                                                    {__('Verify Your Device First')}
                                                </h2>
                                                <p className="mt-1.5 text-sm leading-relaxed text-sub-text-light dark:text-sub-text-dark">
                                                    {__(
                                                        'Before you can submit a refund request, we need to verify the IMEI of the device included in this order. This helps us confirm the device condition and process your refund accurately.',
                                                    )}
                                                </p>
                                            </div>

                                            {/* Steps */}
                                            <div className="space-y-3">
                                                {[
                                                    {
                                                        num: '1',
                                                        title: __('Scan Device Barcode'),
                                                        desc: __(
                                                            'Point your camera at the barcode printed on the device or its box.',
                                                        ),
                                                    },
                                                    {
                                                        num: '2',
                                                        title: __('Auto Verification'),
                                                        desc: __(
                                                            'Scanned Code is extracted and matched against your order automatically.',
                                                        ),
                                                    },
                                                    {
                                                        num: '3',
                                                        title: __('Submit Your Request'),
                                                        desc: __(
                                                            'Once verified, you can fill in the reason and submit your refund.',
                                                        ),
                                                    },
                                                ].map((s) => (
                                                    <div
                                                        key={s.num}
                                                        className="flex items-start gap-3"
                                                    >
                                                        <div
                                                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-xs font-semibold text-main-text-light dark:text-main-text-dark`}
                                                        >
                                                            {s.num}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-main-text-light dark:text-main-text-dark">
                                                                {s.title}
                                                            </p>
                                                            <p className="mt-0.5 text-xs text-sub-text-light dark:text-sub-text-dark">
                                                                {s.desc}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Info note */}
                                            <div className="flex items-start gap-2 rounded-md border border-surface-3-light bg-surface-1-light p-3 dark:border-surface-3-dark dark:bg-surface-1-dark">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    strokeWidth={1.5}
                                                    stroke="currentColor"
                                                    className="mt-0.5 size-4 shrink-0 text-sub-text-light dark:text-sub-text-dark"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
                                                    />
                                                </svg>
                                                <p className="text-xs leading-relaxed text-sub-text-light dark:text-sub-text-dark">
                                                    {__(
                                                        'IMEI 1, IMEI 2, SERIAL NO., EID Codes Are used for verification. Make sure the barcode is clean and well-lit for best results',
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        {/* RIGHT: Scanner */}
                                        <div className="flex flex-col gap-3">
                                            <p className="text-xs font-medium uppercase tracking-wide text-sub-text-light dark:text-sub-text-dark">
                                                {__('Scanner')}
                                            </p>

                                            {/* Viewport */}
                                            <div
                                                className="relative overflow-y-auto rounded-md bg-gray-950"
                                                style={{ aspectRatio: '4/3' }}
                                            >
                                                <video
                                                    ref={scannerVideoRef}
                                                    className="h-full w-full object-cover"
                                                    muted
                                                    playsInline
                                                    onTouchStart={refocus}
                                                    onClick={refocus}
                                                />
                                                {/* Scan guide corners */}
                                                {!isVerifying && !scanCooldown && (
                                                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                                                        <div
                                                            ref={scanOverlayRef}
                                                            className="relative h-32 w-56"
                                                            style={{
                                                                boxShadow:
                                                                    '0 0 0 9999px rgba(0,0,0,0.6)',
                                                                borderRadius: '4px',
                                                            }}
                                                        >
                                                            <span className="absolute -left-px -top-px h-5 w-5 rounded-tl-sm border-l-[3px] border-t-[3px] border-blue-400" />
                                                            <span className="absolute -right-px -top-px h-5 w-5 rounded-tr-sm border-r-[3px] border-t-[3px] border-blue-400" />
                                                            <span className="absolute -bottom-px -left-px h-5 w-5 rounded-bl-sm border-b-[3px] border-l-[3px] border-blue-400" />
                                                            <span className="absolute -bottom-px -right-px h-5 w-5 rounded-br-sm border-b-[3px] border-r-[3px] border-blue-400" />
                                                            <div
                                                                className="absolute left-1 right-1 h-0.5 bg-blue-400"
                                                                style={{
                                                                    animation:
                                                                        'scanLine 1.8s ease-in-out infinite',
                                                                    top: '10%',
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Verifying overlay */}
                                                {isVerifying && (
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gray-950">
                                                        <svg
                                                            className="h-9 w-9 animate-spin text-white/60"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <circle
                                                                className="opacity-20"
                                                                cx="12"
                                                                cy="12"
                                                                r="10"
                                                                stroke="currentColor"
                                                                strokeWidth="3"
                                                            />
                                                            <path
                                                                className="opacity-80"
                                                                fill="currentColor"
                                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                                            />
                                                        </svg>
                                                        <p className="text-sm font-medium text-white/80">
                                                            {__('Verifying IMEI...')}
                                                        </p>
                                                        <p className="text-xs text-white/30">
                                                            {__('Checking order records')}
                                                        </p>
                                                    </div>
                                                )}

                                                {/* Error cooldown overlay */}
                                                {scanCooldown && !isVerifying && scanError && (
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gray-950/95 p-5">
                                                        <div className="flex h-11 w-11 items-center justify-center rounded-full border border-red-800 bg-red-900/30">
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                viewBox="0 0 20 20"
                                                                fill="currentColor"
                                                                className="size-5 text-red-400"
                                                            >
                                                                <path
                                                                    fillRule="evenodd"
                                                                    d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
                                                                    clipRule="evenodd"
                                                                />
                                                            </svg>
                                                        </div>
                                                        <div className="text-center">
                                                            <p className="text-sm font-semibold text-red-300">
                                                                {__('Verification Failed')}
                                                            </p>
                                                            <p className="mt-1 max-w-[180px] text-center text-xs text-white/40">
                                                                {scanError}
                                                            </p>
                                                        </div>
                                                        <p className="animate-pulse text-xs text-white/25">
                                                            {__('Scanner restarting...')}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Active indicator */}
                                            {!isVerifying && !scanCooldown && (
                                                <div className="flex items-center gap-2">
                                                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
                                                    <span className="text-xs text-sub-text-light dark:text-sub-text-dark">
                                                        {__(
                                                            'Scanner active - align barcode within the frame',
                                                        )}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    <style>{`
                                    @keyframes scanLine {
                                        0%   { top: 10%; opacity: 1; }
                                        45%  { top: 85%; opacity: 1; }
                                        50%  { top: 85%; opacity: 0; }
                                        51%  { top: 10%; opacity: 0; }
                                        55%  { top: 10%; opacity: 1; }
                                        100% { top: 10%; opacity: 1; }
                                    }
                    `}</style>
                </>
            )}
            <NativeScannerPreview
                isOpen={nativeScanOpen}
                fieldLabel={__('Device Barcode')}
                itemNumber={null}
                onResult={(text, meta) => {
                    setNativeScanOpen(false);

                    if (meta?.fields) {
                        const priority = ['imei1', 'imei2'];
                        const excluded = ['upc'];

                        // Try priority fields first
                        for (const key of priority) {
                            if (meta.fields[key]) {
                                handleIMEIScan(meta.fields[key]);
                                return;
                            }
                        }

                        // Fallback: first non-excluded field
                        for (const [key, val] of Object.entries(meta.fields)) {
                            if (!excluded.includes(key) && val) {
                                handleIMEIScan(val);
                                return;
                            }
                        }
                    } else if (text) {
                        handleIMEIScan(text);
                    }
                }}
                onClose={() => setNativeScanOpen(false)}
                scanBoxWidth={400}
                scanBoxHeight={50}
                bottomOffset={72}
            />
        </MainLayout>
    );
};

export default index;

function formatTime(secs) {
    const m = String(Math.floor(secs / 60)).padStart(2, '0');
    const s = String(secs % 60).padStart(2, '0');
    return `${m}:${s}`;
}

function VideoRecorderPanel({ label, onFileSaved, isActive, onOpen, onClose, __ }) {
    const {
        recordingVideoRef,
        isReady,
        isRecording,
        recordedFile,
        recordedUrl,
        cameraError,
        elapsed,
        startCamera,
        stopCamera,
        startRecording,
        stopRecording,
        retake,
    } = useVideoRecorder();

    const [saved, setSaved] = useState(false);

    useEffect(() => {
        if (!isActive && isReady) {
            stopCamera();
        }
    }, [isActive]);

    const handleOpenCamera = () => {
        onOpen();
        startCamera();
    };

    const handleSave = () => {
        onFileSaved(recordedFile);
        setSaved(true);
        stopCamera();
        onClose();
    };

    const handleCancel = () => {
        stopCamera();
        onFileSaved(null);
        onClose();
    };

    const handleRetake = () => {
        setSaved(false);
        onFileSaved(null);
        retake();
        if (!isReady) {
            onOpen();
            startCamera();
        }
    };

    return (
        <div className="mt-3 rounded-md border border-surface-3-light bg-surface-1-light p-4 dark:border-surface-3-dark dark:bg-surface-1-dark">
            {/* Label + status */}
            <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-main-text-light dark:text-main-text-dark">
                    {label}
                </p>
                {saved && recordedFile && (
                    <span className="flex items-center gap-1.5 text-xs font-medium text-green-600 dark:text-green-400">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            className="size-4"
                        >
                            <path
                                fillRule="evenodd"
                                d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                                clipRule="evenodd"
                            />
                        </svg>
                        {__('Video saved')}
                    </span>
                )}
            </div>

            {/* Saved state - compact */}
            {saved && recordedFile ? (
                <div className="flex items-center justify-between rounded-md border border-surface-3-light p-3 dark:border-surface-3-dark">
                    <div className="flex items-center gap-2">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="size-5 text-sub-text-light dark:text-sub-text-dark"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"
                            />
                        </svg>
                        <p className="max-w-[180px] truncate font-mono text-xs text-sub-text-light dark:text-sub-text-dark">
                            {recordedFile.name}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={handleRetake}
                        className="text-xs font-medium text-amber-600 hover:underline dark:text-amber-400"
                    >
                        {__('Re-record')}
                    </button>
                </div>
            ) : (
                <>
                    {!isReady && !cameraError ? (
                        /* ── Open Camera button ── */
                        <button
                            type="button"
                            onClick={handleOpenCamera}
                            className="flex w-full items-center justify-center gap-2 rounded-md border-2 border-dashed border-surface-3-light py-8 text-sm font-medium text-sub-text-light transition-colors hover:border-main-text-light dark:border-surface-3-dark dark:text-sub-text-dark dark:hover:border-main-text-dark"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="size-5"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"
                                />
                            </svg>
                            {__('Open Camera')}
                        </button>
                    ) : cameraError ? (
                        <div className="rounded-md border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
                            <p className="text-sm text-red-700 dark:text-red-400">{cameraError}</p>
                            <button
                                type="button"
                                onClick={handleOpenCamera}
                                className="mt-1 text-xs font-medium text-red-600 underline dark:text-red-400"
                            >
                                {__('Retry')}
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {/* Video viewport */}
                            <div
                                className="relative overflow-hidden rounded-md bg-gray-950"
                                style={{ aspectRatio: '16/9' }}
                            >
                                {isReady && (
                                    <video
                                        ref={recordingVideoRef}
                                        className={`h-full w-full object-cover ${recordedUrl ? 'hidden' : 'block'}`}
                                        muted
                                        playsInline
                                        autoPlay
                                    />
                                )}

                                {recordedUrl && (
                                    <video
                                        key={recordedUrl}
                                        src={recordedUrl}
                                        controls
                                        autoPlay
                                        playsInline
                                        className="h-full w-full object-cover"
                                        onLoadedMetadata={(e) =>
                                            e.currentTarget.play().catch(() => {})
                                        }
                                    />
                                )}

                                {isRecording && (
                                    <div className="absolute left-2 top-2 flex items-center gap-1.5 rounded-full bg-red-600 px-2.5 py-1 shadow">
                                        <span
                                            className="h-1.5 w-1.5 animate-ping rounded-full bg-white"
                                            style={{ animationDuration: '1s' }}
                                        />
                                        <span className="text-xs font-bold uppercase tracking-widest text-white">
                                            REC
                                        </span>
                                        <span className="font-mono text-xs text-white/80">
                                            {formatTime(elapsed)}
                                        </span>
                                    </div>
                                )}

                                {isRecording && elapsed >= 270 && (
                                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-center">
                                        <span className="rounded-full bg-amber-600/90 px-2 py-1 text-xs font-medium text-white">
                                            {__('Max 5 min')} — {formatTime(300 - elapsed)}{' '}
                                            {__('remaining')}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Controls */}
                            <div className="flex flex-wrap gap-2">
                                {!recordedUrl ? (
                                    <>
                                        {!isRecording ? (
                                            <button
                                                type="button"
                                                onClick={startRecording}
                                                className="flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
                                            >
                                                <span className="h-2 w-2 rounded-full bg-white" />
                                                {__('Start Recording')}
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={stopRecording}
                                                className="flex items-center gap-2 rounded-md bg-gray-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
                                            >
                                                <span className="h-2 w-2 rounded-sm bg-white" />
                                                {__('Stop Recording')}
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            onClick={handleCancel}
                                            className="rounded-md border border-surface-3-light px-4 py-2 text-sm font-medium text-sub-text-light transition-colors hover:bg-surface-1-light dark:border-surface-3-dark dark:text-sub-text-dark dark:hover:bg-surface-3-dark"
                                        >
                                            {__('Cancel')}
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            type="button"
                                            onClick={handleSave}
                                            className="flex items-center gap-2 rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/80"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                                className="size-4"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                            {__('Save Video')}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleRetake}
                                            className="flex items-center gap-2 rounded-md bg-amber-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-600"
                                        >
                                            {__('Retake')}
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
