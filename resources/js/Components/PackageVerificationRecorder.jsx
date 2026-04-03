import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { useScanner } from '@/Hooks/useScanner';
import { useNativeScanner } from '@/Hooks/useNativeScanner';
import NativeScannerPreview from '@/Components/NativeScannerPreview';
import axios from 'axios';
import beepSound from '../../assets/sounds/Beep.mp3';
import getSocketId from './getSocketId';
import { router } from '@inertiajs/react';

const PackageVerificationRecorder = memo(
    ({
        isOpen,
        onClose,
        onSave,
        orderNo,
        scannedCode,
        inventoryId,
        onVerified,
        onVerify,
        uploadRoute,
        heading = 'Package Verification',
    }) => {
        // ── Refs ───────────────────────────────────────────────────────────────
        const audioRef = useRef(null);
        const videoRef = useRef(null); // PC only — useScanner feeds into this
        const isVerifiedRef = useRef(false);
        const isScanningRef = useRef(false);

        // ── State ──────────────────────────────────────────────────────────────
        const [torchOn, setTorchOn] = useState(false);
        const [nativeScan, setNativeScan] = useState(false);
        const [nativeScanImageUrl, setNativeScanImageUrl] = useState(null);
        const [desktopScanActive, setDesktopScanActive] = useState(false);
        const [verificationStatus, setVerificationStatus] = useState(null);
        const [verificationMessage, setVerificationMessage] = useState('');
        const [isUploading, setIsUploading] = useState(false);
        const [capturedPhoto, setCapturedPhoto] = useState(null); // blob URL preview
        const [capturedPhotoFile, setCapturedPhotoFile] = useState(null); // File for upload
        const [screenRecordingFile, setScreenRecordingFile] = useState(null);
        const [sceneVideoFile, setSceneVideoFile] = useState(null);

        // ── Device detect ──────────────────────────────────────────────────────
        const isMobileDevice =
            /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
            (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

        // ── useScanner — PC only, completely unchanged behavior ────────────────
        // active: true only on PC when desktopScanActive is true
        // On mobile: always idle (active: false)
        const { refocus, toggleTorch } = useScanner({
            sourceVideoRef: videoRef,
            active: !isMobileDevice && desktopScanActive,
            onScan: async (text) => {
                if (isScanningRef.current) return;
                setDesktopScanActive(false);
                await handleScannedCode(text);
            },
        });

        const { captureImage } = useNativeScanner();

        // ── Audio ──────────────────────────────────────────────────────────────
        useEffect(() => {
            audioRef.current = new Audio(beepSound);
            audioRef.current.preload = 'auto';
        }, []);

        const playBeep = async () => {
            try {
                if (!audioRef.current) return;
                audioRef.current.currentTime = 0;
                await audioRef.current.play();
            } catch (err) {
                console.warn('[PackageRecorder] Beep blocked:', err);
            }
        };

        // ── Torch ──────────────────────────────────────────────────────────────
        const handleTorchToggle = useCallback(async () => {
            const result = await toggleTorch();
            if (result !== null) setTorchOn(result);
        }, [toggleTorch]);

        // ── Full reset + close ─────────────────────────────────────────────────
        const _doClose = useCallback(() => {
            setNativeScan(false);
            setNativeScanImageUrl(null);
            setDesktopScanActive(false);
            setTorchOn(false);
            setVerificationStatus(null);
            setVerificationMessage('');
            setIsUploading(false);
            setCapturedPhoto((prev) => {
                if (prev) URL.revokeObjectURL(prev);
                return null;
            });
            setCapturedPhotoFile(null);
            setScreenRecordingFile(null);
            setSceneVideoFile(null);
            isVerifiedRef.current = false;
            isScanningRef.current = false;
            onClose();
        }, [onClose]);

        const handleClose = useCallback(() => {
            if (desktopScanActive) return; // block close while PC scanning
            _doClose();
        }, [desktopScanActive, _doClose]);

        // ── handleScannedCode ──────────────────────────────────────────────────
        const handleScannedCode = useCallback(
            async (text) => {
                if (isScanningRef.current) return;
                isScanningRef.current = true;

                await playBeep();

                const trimmed = text?.trim();
                if (!trimmed) {
                    isScanningRef.current = false;
                    return;
                }

                try {
                    let isSuccess = false;
                    let responseMsg = null;

                    if (onVerify) {
                        const result = await onVerify(trimmed);
                        isSuccess = result?.success === true;
                        responseMsg = result?.message;
                    } else {
                        const socketId = await getSocketId();
                        const { data } = await axios.post(
                            route('dashboard.orders.verify'),
                            { order_no: orderNo, code: trimmed },
                            { headers: { 'X-Socket-ID': socketId } },
                        );
                        isSuccess =
                            data.status === true || data.status === 1 || data.status === 'success';
                        responseMsg = data?.message;
                    }

                    if (isSuccess) {
                        isVerifiedRef.current = true;
                        const msg =
                            responseMsg || `Verification successful. CODE ${trimmed} matched.`;
                        setVerificationStatus('success');
                        setVerificationMessage(msg);
                        onVerified?.('success', msg);
                    } else {
                        const msg = responseMsg || `CODE does not match: ${trimmed}`;
                        if (onVerify) {
                            setVerificationStatus('mismatch');
                            setVerificationMessage(msg);
                        } else {
                            onVerified?.('mismatch', msg);
                            _doClose();
                            return;
                        }
                    }
                } catch (err) {
                    console.error('[PackageRecorder] Verify request failed:', err);
                    setVerificationStatus('scan_error');
                    setVerificationMessage('Verification failed. Please try again.');
                } finally {
                    setNativeScan(false);
                    isScanningRef.current = false;
                }
            },
            [orderNo, onVerify, onVerified, _doClose],
        );

        // ── handleSnapshot ─────────────────────────────────────────────────────
        // PC:     activates useScanner live scan overlay (unchanged behavior)
        // Mobile: opens native camera, stores photo, opens NativeScannerPreview
        const handleSnapshot = useCallback(async () => {
            if (isScanningRef.current) return;
            setVerificationStatus(null);
            setVerificationMessage('');

            if (isMobileDevice) {
                const { cancelled, imageUrl, file } = await captureImage();
                if (cancelled || !imageUrl) return;
                setCapturedPhoto(imageUrl);
                setCapturedPhotoFile(file);
                setNativeScanImageUrl(imageUrl);
                setNativeScan(true);
            } else {
                setDesktopScanActive(true);
            }
        }, [isMobileDevice, captureImage]);

        // ── Cancel PC scan ─────────────────────────────────────────────────────
        const handleCancelDesktopScan = useCallback(() => {
            setDesktopScanActive(false);
        }, []);

        // ── Rescan — clear verification, keep modal open ───────────────────────
        const handleRescan = useCallback(() => {
            isVerifiedRef.current = false;
            isScanningRef.current = false;
            setCapturedPhoto((prev) => {
                if (prev) URL.revokeObjectURL(prev);
                return null;
            });
            setCapturedPhotoFile(null);
            setScreenRecordingFile(null);
            setSceneVideoFile(null);
            setVerificationStatus(null);
            setVerificationMessage('');
        }, []);

        // ── handleSave — upload barcode photo + optional videos ────────────────
        const handleSave = useCallback(async () => {
            if (!isVerifiedRef.current) return;

            // Required validation
            if (!screenRecordingFile) {
                setVerificationStatus('scan_error');
                setVerificationMessage('Screen Recording Video is required.');
                return;
            }
            if (!sceneVideoFile) {
                setVerificationStatus('scan_error');
                setVerificationMessage('Scene Video is required.');
                return;
            }

            setIsUploading(true);
            try {
                const formData = new FormData();
                if (inventoryId) formData.append('inventory_id', inventoryId);
                if (orderNo) formData.append('order_no', orderNo);
                if (capturedPhotoFile) formData.append('barcode_photo', capturedPhotoFile);
                if (screenRecordingFile) formData.append('screen_recording', screenRecordingFile);
                if (sceneVideoFile) formData.append('scene_video', sceneVideoFile);

                const uploadUrl = uploadRoute ?? route('dashboard.orders.packagerecordingstore');

                if (uploadRoute) {
                    formData.append('scanned_code', scannedCode);
                    router.post(uploadRoute, formData, {
                        forceFormData: true,
                        onSuccess: () => {
                            onSave?.();
                            _doClose();
                        },
                        onError: (errors) => {
                            const firstError = Object.values(errors)[0];
                            setVerificationMessage(
                                firstError || 'Validation failed. Please check your files.',
                            );
                            setVerificationStatus('scan_error');
                            setIsUploading(false);
                        },
                        onFinish: () => {
                            setIsUploading(false);
                        },
                    });
                } else {
                    await axios.post(uploadUrl, formData, {
                        headers: { 'Content-Type': 'multipart/form-data' },
                    });
                    onSave?.();
                    _doClose();
                }
            } catch (err) {
                console.error('[PackageRecorder] Upload failed:', err);
                if (err.response?.status === 422) {
                    const errors = err.response.data?.errors;
                    if (errors) {
                        const firstError = Object.values(errors)[0]?.[0];
                        setVerificationMessage(
                            firstError || 'Validation failed. Please check your files.',
                        );
                    } else {
                        setVerificationMessage(err.response.data?.message || 'Validation failed.');
                    }
                } else {
                    setVerificationMessage('Upload failed. Please try again.');
                }
                setVerificationStatus('scan_error');
            } finally {
                setIsUploading(false);
            }
        }, [
            orderNo,
            capturedPhotoFile,
            inventoryId,
            uploadRoute,
            screenRecordingFile,
            sceneVideoFile,
            onSave,
            _doClose,
        ]);

        // ── Reset when modal closes externally ────────────────────────────────
        useEffect(() => {
            if (!isOpen) {
                setNativeScan(false);
                setDesktopScanActive(false);
            }
        }, [isOpen]);

        if (!isOpen) return null;

        return (
            <>
                <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 hidden bg-black/60 sm:block"
                        onClick={desktopScanActive ? undefined : handleClose}
                        style={desktopScanActive ? { cursor: 'not-allowed' } : {}}
                    />

                    <div className="relative z-10 flex h-full w-full flex-col bg-white text-gray-900 dark:bg-deepcharcoal dark:text-white/80 sm:h-auto sm:max-w-2xl sm:flex-none sm:rounded-2xl sm:shadow-2xl">
                        {/* ── Header ── */}
                        <div className="flex items-center justify-between border-b px-6 pb-4 pt-5 dark:border-white/10">
                            <h3 className="text-base font-semibold">
                                {desktopScanActive ? 'Hold Barcode in the Scan Box' : heading}
                            </h3>
                            <div className="flex items-center gap-2">
                                {/* Torch — PC only, during scan */}
                                {!isMobileDevice && desktopScanActive && (
                                    <button
                                        onClick={handleTorchToggle}
                                        title={
                                            torchOn ? 'Turn off flashlight' : 'Turn on flashlight'
                                        }
                                        className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${torchOn ? 'bg-yellow-400 text-gray-900 lg:hover:bg-yellow-300' : 'text-gray-400 lg:hover:bg-gray-100 lg:hover:text-gray-600 dark:lg:hover:bg-white/10'}`}
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={1.8}
                                            stroke="currentColor"
                                            className="size-5"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"
                                            />
                                        </svg>
                                    </button>
                                )}
                                {/* Close — disabled while PC scanning */}
                                {!desktopScanActive && (
                                    <button
                                        onClick={handleClose}
                                        className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 lg:hover:bg-gray-100 dark:lg:hover:bg-white/10"
                                    >
                                        <svg
                                            className="h-4 w-4"
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
                                )}
                            </div>
                        </div>

                        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-5">
                            {/* ── Verification Banners ── */}
                            {verificationStatus === 'success' && (
                                <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-900/20">
                                    <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40">
                                        <svg
                                            className="h-4 w-4 text-green-600 dark:text-green-400"
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
                                    <p className="text-sm font-medium text-green-800 dark:text-green-300">
                                        {verificationMessage || 'Code verified successfully.'}
                                    </p>
                                </div>
                            )}
                            {verificationStatus === 'mismatch' && (
                                <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
                                    <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/40">
                                        <svg
                                            className="h-4 w-4 text-red-600 dark:text-red-400"
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
                                    </div>
                                    <p className="text-sm font-medium text-red-800 dark:text-red-300">
                                        {verificationMessage || 'Code mismatch. Please try again.'}
                                    </p>
                                </div>
                            )}
                            {verificationStatus === 'scan_error' && (
                                <div className="flex items-center gap-3 rounded-lg border border-orange-200 bg-orange-50 p-3 dark:border-orange-800 dark:bg-orange-900/20">
                                    <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/40">
                                        <svg
                                            className="h-4 w-4 text-orange-600 dark:text-orange-400"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                            />
                                        </svg>
                                    </div>
                                    <p className="text-sm font-medium text-orange-800 dark:text-orange-300">
                                        {verificationMessage || 'Scan failed. Please try again.'}
                                    </p>
                                </div>
                            )}

                            {/* ── PC: live scan video (useScanner feeds videoRef) ── */}
                            {!isMobileDevice && desktopScanActive && (
                                <div className="relative min-h-0 flex-1 overflow-hidden rounded-xl bg-black sm:flex-none sm:[aspect-ratio:16/9]">
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        muted
                                        playsInline
                                        className="h-full w-full object-cover"
                                        onClick={refocus}
                                        onTouchStart={refocus}
                                    />
                                    <div
                                        className="pointer-events-none absolute inset-0"
                                        style={{ boxShadow: '0 0 0 9999px rgba(0,0,0,0.65)' }}
                                    >
                                        <div
                                            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded border-2 border-green-400"
                                            style={{ width: '65%', height: '56px' }}
                                        >
                                            <div className="absolute -left-0.5 -top-0.5 h-4 w-4 rounded-tl border-l-4 border-t-4 border-green-400" />
                                            <div className="absolute -right-0.5 -top-0.5 h-4 w-4 rounded-tr border-r-4 border-t-4 border-green-400" />
                                            <div className="absolute -bottom-0.5 -left-0.5 h-4 w-4 rounded-bl border-b-4 border-l-4 border-green-400" />
                                            <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-br border-b-4 border-r-4 border-green-400" />
                                            <div className="absolute left-2 right-2 top-1/2 h-0.5 -translate-y-1/2 animate-pulse bg-green-400 opacity-80" />
                                        </div>
                                        <p className="absolute bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-black/70 px-3 py-1.5 text-xs text-white">
                                            Hold barcode in the green box to scan
                                        </p>
                                    </div>
                                    <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full bg-green-600 px-3 py-1 text-xs font-semibold text-white">
                                        <div className="h-2 w-2 animate-pulse rounded-full bg-white" />{' '}
                                        SCANNING
                                    </div>
                                    {torchOn && (
                                        <div className="pointer-events-none absolute right-2 top-2 flex items-center gap-1 rounded-full bg-yellow-400/90 px-2 py-1 text-xs font-semibold text-gray-900">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth={2}
                                                stroke="currentColor"
                                                className="size-3"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"
                                                />
                                            </svg>
                                            Flash ON
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ── Mobile: captured barcode photo preview ── */}
                            {isMobileDevice && capturedPhoto && (
                                <div className="relative overflow-hidden rounded-xl bg-black">
                                    <img
                                        src={capturedPhoto}
                                        alt="Captured barcode"
                                        className="max-h-52 w-full object-contain"
                                    />
                                    <div className="absolute left-2 top-2 rounded-full bg-black/70 px-2 py-1 text-xs font-semibold text-white">
                                        Barcode Photo
                                    </div>
                                    {verificationStatus === 'success' && (
                                        <div className="absolute right-2 top-2 rounded-full bg-green-600 px-2 py-1 text-xs font-semibold text-white">
                                            ✓ Verified
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ── Instructions — shown before verification ── */}
                            {!isVerifiedRef.current && !desktopScanActive && (
                                <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/50 p-5 dark:border-white/10 dark:bg-white/5">
                                    <div className="mb-3 flex items-center gap-2">
                                        <div className="flex flex-shrink-0 items-center justify-center rounded-full bg-violet-100 p-1 dark:bg-violet-900/30">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth={1.5}
                                                stroke="currentColor"
                                                className="h-4 w-4 text-violet-600 dark:text-violet-400"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
                                                />
                                            </svg>
                                        </div>
                                        <p className="text-sm font-semibold text-gray-800 dark:text-white/80">
                                            How to complete verification
                                        </p>
                                    </div>

                                    <ol className="space-y-2.5 text-sm text-gray-600 dark:text-white/60">
                                        <li className="flex items-start gap-2.5">
                                            <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-violet-600 text-xs font-bold text-white">
                                                1
                                            </span>
                                            <span>
                                                {isMobileDevice
                                                    ? "Start your phone's screen recorder (swipe down → Screen Record)"
                                                    : 'Ensure your barcode is ready and visible to the camera'}
                                            </span>
                                        </li>
                                        <li className="flex items-start gap-2.5">
                                            <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-violet-600 text-xs font-bold text-white">
                                                2
                                            </span>
                                            <span>
                                                {isMobileDevice
                                                    ? 'Tap "Capture & Scan Barcode"  point camera at barcode and take photo'
                                                    : 'Click "Snapshot & Scan"  hold barcode in the green scan box'}
                                            </span>
                                        </li>
                                        <li className="flex items-start gap-2.5">
                                            <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-violet-600 text-xs font-bold text-white">
                                                3
                                            </span>
                                            <span>
                                                Once verified, upload your screen recording and
                                                scene video as evidence
                                            </span>
                                        </li>
                                    </ol>

                                    {isMobileDevice && (
                                        <div className="mt-3 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 dark:border-amber-800/50 dark:bg-amber-900/20">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth={1.5}
                                                stroke="currentColor"
                                                className="h-4 w-4 flex-shrink-0 text-amber-600 dark:text-amber-400"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                                                />
                                            </svg>
                                            <p className="text-xs text-amber-700 dark:text-amber-300">
                                                Start screen recorder before tapping Capture & Scan
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ── Controls: before verification ── */}
                            {!isVerifiedRef.current && (
                                <div className="flex flex-shrink-0 flex-wrap justify-center gap-3">
                                    {!desktopScanActive && (
                                        <button
                                            onClick={handleSnapshot}
                                            disabled={isScanningRef.current}
                                            className="flex items-center gap-2 rounded-lg bg-violet-600 px-5 py-2 text-sm font-medium text-white transition-transform disabled:opacity-50 lg:hover:bg-violet-700"
                                        >
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
                                                    d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z"
                                                />
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z"
                                                />
                                            </svg>
                                            {isMobileDevice
                                                ? 'Capture & Scan Barcode'
                                                : 'Snapshot & Scan'}
                                        </button>
                                    )}
                                    {!isMobileDevice && desktopScanActive && (
                                        <button
                                            onClick={handleCancelDesktopScan}
                                            className="flex items-center gap-2 rounded-lg bg-gray-500 px-5 py-2 text-sm font-medium text-white transition-transform lg:hover:bg-gray-600"
                                        >
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
                                                    d="M6 18L18 6M6 6l12 12"
                                                />
                                            </svg>
                                            Cancel Scan
                                        </button>
                                    )}
                                    {!desktopScanActive && (
                                        <button
                                            onClick={handleClose}
                                            className="rounded-lg bg-gray-500 px-5 py-2 text-sm font-medium text-white lg:hover:bg-gray-600"
                                        >
                                            Close
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* ── Upload fields + actions after verification ── */}
                            {isVerifiedRef.current && (
                                <div className="flex flex-col gap-4">
                                    {/* Screen Recording Video */}
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-sm font-medium text-gray-700 dark:text-white/70">
                                            Screen Recording Video
                                            <span className="ml-1.5 text-xs font-semibold text-red-500">
                                                *required
                                            </span>
                                        </label>
                                        <p className="text-xs text-gray-400 dark:text-white/40">
                                            Upload the video recorded using your phone's screen
                                            recorder
                                        </p>
                                        <input
                                            type="file"
                                            accept="video/*"
                                            onChange={(e) =>
                                                setScreenRecordingFile(e.target.files?.[0] ?? null)
                                            }
                                            className="block w-full text-sm text-gray-500 file:mr-3 file:rounded-lg file:border-0 file:bg-violet-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-violet-700 dark:text-white/50 dark:file:bg-white/10 dark:file:text-white/70 lg:hover:file:bg-violet-100"
                                        />
                                        {screenRecordingFile && (
                                            <p className="text-xs text-green-600 dark:text-green-400">
                                                ✓ {screenRecordingFile.name}
                                            </p>
                                        )}
                                    </div>

                                    {/* Scene Video */}
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-sm font-medium text-gray-700 dark:text-white/70">
                                            Scene Video
                                            <span className="ml-1.5 text-xs font-semibold text-red-500">
                                                *required
                                            </span>
                                        </label>
                                        <p className="text-xs text-gray-400 dark:text-white/40">
                                            Upload video recorded by an external camera showing the
                                            full packing scene
                                        </p>
                                        <input
                                            type="file"
                                            accept="video/*"
                                            onChange={(e) =>
                                                setSceneVideoFile(e.target.files?.[0] ?? null)
                                            }
                                            className="block w-full text-sm text-gray-500 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-blue-700 dark:text-white/50 dark:file:bg-white/10 dark:file:text-white/70 lg:hover:file:bg-blue-100"
                                        />
                                        {sceneVideoFile && (
                                            <p className="text-xs text-green-600 dark:text-green-400">
                                                ✓ {sceneVideoFile.name}
                                            </p>
                                        )}
                                    </div>

                                    {/* Buttons */}
                                    <div className="flex flex-shrink-0 flex-wrap justify-center gap-3 pb-[env(safe-area-inset-bottom)] sm:pb-0">
                                        <button
                                            onClick={handleSave}
                                            disabled={isUploading}
                                            className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50 lg:hover:bg-blue-700"
                                        >
                                            {isUploading ? 'Uploading...' : 'Save & Done'}
                                        </button>
                                        <button
                                            onClick={handleRescan}
                                            disabled={isUploading}
                                            className="rounded-lg bg-amber-500 px-5 py-2 text-sm font-medium text-white disabled:opacity-50 lg:hover:bg-amber-600"
                                        >
                                            Rescan
                                        </button>
                                        <button
                                            onClick={handleClose}
                                            disabled={isUploading}
                                            className="rounded-lg bg-gray-500 px-5 py-2 text-sm font-medium text-white disabled:opacity-50 lg:hover:bg-gray-600"
                                        >
                                            Close
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── NativeScannerPreview — mobile only ── */}
                <NativeScannerPreview
                    isOpen={nativeScan}
                    fieldLabel="Order Code / Barcode"
                    itemNumber={null}
                    preloadedImageUrl={nativeScanImageUrl}
                    onResult={async (text, meta) => {
                        setNativeScan(false);
                        setNativeScanImageUrl(null);
                        const code = text ?? (meta?.fields ? Object.values(meta.fields)[0] : null);
                        await handleScannedCode(code);
                    }}
                    onClose={() => {
                        setNativeScan(false);
                        setNativeScanImageUrl(null);
                        // photo already captured + stored — keep it, user can retry
                    }}
                    scanBoxWidth={400}
                    scanBoxHeight={50}
                />
            </>
        );
    },
);

PackageVerificationRecorder.displayName = 'PackageVerificationRecorder';
export default PackageVerificationRecorder;
