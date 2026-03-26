import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { useVideoRecorder } from '@/Hooks/useVideoRecorder';
import { useScanner } from '@/Hooks/useScanner';
import NativeScannerPreview from '@/Components/NativeScannerPreview';
import axios from 'axios';

const PackageVerificationRecorder = memo(
    ({ isOpen, onClose, onSave, orderNo, onVerified, onVerify }) => {
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
            pauseRecording,
            resumeRecording,
            retake,
        } = useVideoRecorder();

        const [torchOn, setTorchOn] = useState(false);
        const [nativeScan, setNativeScan] = useState(false);
        const [desktopScanActive, setDesktopScanActive] = useState(false);
        const [verificationStatus, setVerificationStatus] = useState(null);
        const [verificationMessage, setVerificationMessage] = useState('');
        const [isSaving, setIsSaving] = useState(false);

        const isVerifiedRef = useRef(false);
        const manualStopRef = useRef(false);
        const pendingCloseRef = useRef(false);
        const isScanningRef = useRef(false);

        const isMobileDevice =
            /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
            (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

        const { refocus, toggleTorch } = useScanner({
            sourceVideoRef: recordingVideoRef,
            active: false,
            onScan: () => { },
        });

        const handleTorchToggle = useCallback(async () => {
            const result = await toggleTorch();
            if (result !== null) setTorchOn(result);
        }, [toggleTorch]);

        const handleScannedCode = useCallback(
            async (text, meta) => {
                if (isVerifiedRef.current || isScanningRef.current) return;
                isScanningRef.current = true;

                const trimmed = text?.trim();
                if (!trimmed) {
                    isScanningRef.current = false;
                    return;
                }

                try {
                    let isSuccess = false;
                    let responseMsg = null;

                    if (onVerify) {
                        // Custom verify function provided (e.g. inventory verification)
                        const result = await onVerify(trimmed);
                        isSuccess = result?.success === true;
                        responseMsg = result?.message;
                    } else {
                        // Default: orders verify API
                        const { data } = await axios.post(route('dashboard.orders.verify'), {
                            order_no: orderNo,
                            code: trimmed,
                        });
                        isSuccess =
                            data.status === true || data.status === 1 || data.status === 'success';
                        responseMsg = data?.message;
                    }

                    if (isSuccess) {
                        isVerifiedRef.current = true;
                        stopRecording();
                        const msg =
                            responseMsg || `Verification successful. CODE ${trimmed} matched.`;
                        setVerificationStatus('success');
                        setVerificationMessage(msg);
                        onVerified?.('success', msg);
                    } else {
                        const msg = responseMsg || `CODE does not match: ${trimmed}`;
                        if (onVerify) {
                            // Custom verify mismatch: stop recording, show error + preview
                            // Upload stays locked, user can Retake or Close
                            setVerificationStatus('mismatch');
                            setVerificationMessage(msg);
                            stopRecording();
                        } else {
                            // Default orders mismatch: fire page banner, close modal
                            onVerified?.('mismatch', msg);
                            setNativeScan(false);
                            setDesktopScanActive(false);
                            setTorchOn(false);
                            setVerificationStatus(null);
                            setVerificationMessage('');
                            setIsSaving(false);
                            isVerifiedRef.current = false;
                            manualStopRef.current = false;
                            pendingCloseRef.current = false;
                            isScanningRef.current = false;
                            stopCamera();
                            onClose();
                            return;
                        }
                    }
                } catch (err) {
                    console.error('[PackageRecorder] Verify request failed:', err);
                    const msg = 'Verification failed. Recording resumed, please try again.';
                    setVerificationStatus('scan_error');
                    setVerificationMessage(msg);
                    resumeRecording();
                } finally {
                    setNativeScan(false);
                    isScanningRef.current = false;
                }
            },
            [orderNo, stopRecording, stopCamera, onClose, resumeRecording, onVerified],
        );

        const handleSnapshot = useCallback(() => {
            if (!isRecording || isScanningRef.current) return;

            setVerificationStatus(null);
            setVerificationMessage('');
            pauseRecording();

            if (isMobileDevice) {
                // Mobile: native camera
                setNativeScan(true);
            } else {
                setDesktopScanActive(true);
            }
        }, [isRecording, isMobileDevice, pauseRecording]);
        const handleCancelDesktopScan = useCallback(() => {
            setDesktopScanActive(false);
            resumeRecording();
        }, [resumeRecording]);

        const handleStopRecording = useCallback(() => {
            manualStopRef.current = true;
            setDesktopScanActive(false);
            setNativeScan(false);
            stopRecording();
        }, [stopRecording]);

        const _doClose = useCallback(() => {
            setNativeScan(false);
            setDesktopScanActive(false);
            setTorchOn(false);
            setVerificationStatus(null);
            setVerificationMessage('');
            setIsSaving(false);
            isVerifiedRef.current = false;
            manualStopRef.current = false;
            pendingCloseRef.current = false;
            isScanningRef.current = false;
            stopCamera();
            onClose();
        }, [stopCamera, onClose]);

        const handleSave = useCallback(() => {
            if (!recordedFile || !isVerifiedRef.current) return;
            setIsSaving(true);
            try {
                onSave(recordedFile);
                setNativeScan(false);
                setDesktopScanActive(false);
                setTorchOn(false);
                setVerificationStatus(null);
                setVerificationMessage('');
                setIsSaving(false);
                isVerifiedRef.current = false;
                manualStopRef.current = false;
                pendingCloseRef.current = false;
                isScanningRef.current = false;
                stopCamera();
            } catch (err) {
                console.error('[PackageRecorder] Save error:', err);
                setIsSaving(false);
            }
        }, [recordedFile, onSave, stopCamera]);

        const handleRetake = useCallback(() => {
            isVerifiedRef.current = false;
            manualStopRef.current = false;
            isScanningRef.current = false;
            setDesktopScanActive(false);
            setNativeScan(false);
            setVerificationStatus(null);
            setVerificationMessage('');
            retake();
            setTimeout(() => startRecording(), 50);
        }, [retake, startRecording]);

        const handleClose = useCallback(() => {
            if (isRecording) {
                pendingCloseRef.current = true;
                manualStopRef.current = true;
                setDesktopScanActive(false);
                setNativeScan(false);
                stopRecording();
                return;
            }
            _doClose();
        }, [isRecording, stopRecording, _doClose]);

        // Start/stop camera with modal
        useEffect(() => {
            if (isOpen) startCamera();
            else {
                setNativeScan(false);
                setDesktopScanActive(false);
            }
        }, [isOpen]);

        useEffect(() => {
            if (isReady && isOpen && !isRecording && !recordedUrl) {
                isVerifiedRef.current = false;
                manualStopRef.current = false;
                startRecording();
            }
        }, [isReady]);

        useEffect(() => {
            if (!isRecording && pendingCloseRef.current) _doClose();
        }, [isRecording]);

        useEffect(() => {
            if (recordedUrl && manualStopRef.current && !isVerifiedRef.current) {
                retake();
                manualStopRef.current = false;
            }
        }, [recordedUrl]);

        useEffect(() => {
            if (!desktopScanActive) return;

            let cancelled = false;

            const runScanner = async () => {
                try {
                    const { BrowserMultiFormatReader } = await import('@zxing/browser');
                    const { BarcodeFormat, DecodeHintType } = await import('@zxing/library');

                    const hints = new Map();
                    hints.set(DecodeHintType.POSSIBLE_FORMATS, [
                        BarcodeFormat.CODE_128,
                        BarcodeFormat.EAN_13,
                        BarcodeFormat.QR_CODE,
                    ]);
                    hints.set(DecodeHintType.TRY_HARDER, true);

                    const reader = new BrowserMultiFormatReader(hints);

                    const tick = async () => {
                        if (cancelled || isScanningRef.current) return;

                        const video = recordingVideoRef.current;
                        if (!video || !video.videoWidth || !video.videoHeight) return;

                        const vW = video.videoWidth;
                        const vH = video.videoHeight;
                        const eH = video.offsetHeight || Math.round((vW * 9) / 16);

                        const cropW = Math.round(vW * 0.65);
                        const cropH = Math.max(40, Math.round(vH * (56 / eH)));
                        const cropX = Math.round((vW - cropW) / 2);
                        const cropY = Math.round((vH - cropH) / 2);

                        const canvas = document.createElement('canvas');
                        canvas.width = cropW;
                        canvas.height = cropH;
                        canvas
                            .getContext('2d')
                            .drawImage(video, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

                        try {
                            const result = await reader.decodeFromCanvas(canvas);
                            if (result && !cancelled && !isScanningRef.current) {
                                setDesktopScanActive(false);
                                await handleScannedCode(result.getText());
                            }
                        } catch {
                            // No barcode in region — keep scanning
                        }
                    };

                    const interval = setInterval(tick, 300);
                    return () => clearInterval(interval);
                } catch (err) {
                    console.error('[PackageRecorder] Region scanner init error:', err);
                }
            };

            let cleanup = () => { };
            runScanner().then((fn) => {
                if (fn) cleanup = fn;
            });

            return () => {
                cancelled = true;
                cleanup();
            };
        }, [desktopScanActive, handleScannedCode]);

        if (!isOpen) return null;

        return (
            <>
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={isRecording || desktopScanActive ? undefined : handleClose}
                        style={isRecording || desktopScanActive ? { cursor: 'not-allowed' } : {}}
                    />

                    <div className="relative z-10 w-full max-w-2xl text-gray-900 bg-white shadow-2xl rounded-2xl dark:bg-deepcharcoal dark:text-white/80">
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b dark:border-white/10">
                            <h3 className="text-base font-semibold">
                                {desktopScanActive
                                    ? 'Hold Barcode in the Scan Box'
                                    : 'Package Verification Recorder'}
                            </h3>
                            <div className="flex items-center gap-2">
                                {/* Torch — live feed only, not during desktop scan (can confuse) */}
                                {!recordedUrl && !desktopScanActive && (
                                    <button
                                        onClick={handleTorchToggle}
                                        title={
                                            torchOn ? 'Turn off flashlight' : 'Turn on flashlight'
                                        }
                                        className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${torchOn
                                                ? 'bg-yellow-400 text-gray-900 lg:hover:bg-yellow-300'
                                                : 'text-gray-400 lg:hover:bg-gray-100 lg:hover:text-gray-600 dark:lg:hover:bg-white/10'
                                            }`}
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

                                {/* Close — disabled while recording or desktop scanning */}
                                {!isRecording && !desktopScanActive && (
                                    <button
                                        onClick={handleClose}
                                        className="flex items-center justify-center w-8 h-8 text-gray-400 rounded-full lg:hover:bg-gray-100 dark:lg:hover:bg-white/10"
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
                                )}
                            </div>
                        </div>

                        <div className="p-5">
                            {/* Camera Error */}
                            {cameraError && (
                                <div className="p-3 mb-4 border border-red-200 rounded-lg bg-red-50 dark:border-red-800 dark:bg-red-900/20">
                                    <p className="mb-2 text-sm text-red-800 dark:text-red-300">
                                        {cameraError}
                                    </p>
                                    <button
                                        onClick={startCamera}
                                        className="px-3 py-1 text-sm text-red-800 bg-red-100 rounded-lg lg:hover:bg-red-200"
                                    >
                                        Retry Camera
                                    </button>
                                </div>
                            )}

                            {/* Verification Banners */}
                            {verificationStatus === 'success' && (
                                <div className="flex items-center gap-3 p-3 mb-4 border border-green-200 rounded-lg bg-green-50 dark:border-green-800 dark:bg-green-900/20">
                                    <div className="flex items-center justify-center flex-shrink-0 bg-green-100 rounded-full h-7 w-7 dark:bg-green-900/40">
                                        <svg
                                            className="w-4 h-4 text-green-600 dark:text-green-400"
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
                                        {verificationMessage || 'CODE verified. Upload or retake.'}
                                    </p>
                                </div>
                            )}
                            {verificationStatus === 'mismatch' && (
                                <div className="flex items-center gap-3 p-3 mb-4 border border-red-200 rounded-lg bg-red-50 dark:border-red-800 dark:bg-red-900/20">
                                    <div className="flex items-center justify-center flex-shrink-0 bg-red-100 rounded-full h-7 w-7 dark:bg-red-900/40">
                                        <svg
                                            className="w-4 h-4 text-red-600 dark:text-red-400"
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
                                        {verificationMessage ||
                                            'CODE mismatch. Video discarded. Recording restarted.'}
                                    </p>
                                </div>
                            )}
                            {verificationStatus === 'scan_error' && (
                                <div className="flex items-center gap-3 p-3 mb-4 border border-orange-200 rounded-lg bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20">
                                    <div className="flex items-center justify-center flex-shrink-0 bg-orange-100 rounded-full h-7 w-7 dark:bg-orange-900/40">
                                        <svg
                                            className="w-4 h-4 text-orange-600 dark:text-orange-400"
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
                                        {verificationMessage ||
                                            'Scan failed. Recording resumed, try again.'}
                                    </p>
                                </div>
                            )}

                            {/* Video Area */}
                            <div
                                className="relative overflow-hidden bg-black rounded-xl"
                                style={{ aspectRatio: '16/9' }}
                            >
                                {/* Live Feed — always mounted, hidden during playback */}
                                <video
                                    ref={recordingVideoRef}
                                    autoPlay
                                    muted
                                    playsInline
                                    className={`h-full w-full object-cover ${recordedUrl ? 'hidden' : 'block'}`}
                                    onTouchStart={refocus}
                                    onClick={desktopScanActive ? undefined : refocus}
                                />

                                {/* Playback after stop */}
                                {recordedUrl && (
                                    <video
                                        key={recordedUrl}
                                        src={recordedUrl}
                                        controls
                                        autoPlay
                                        className="object-cover w-full h-full"
                                    />
                                )}

                                {/* ── Desktop Scan Overlay — same vignette + scan box as useScanner ── */}
                                {desktopScanActive && !recordedUrl && (
                                    <div
                                        className="absolute inset-0 pointer-events-none"
                                        style={{ boxShadow: '0 0 0 9999px rgba(0,0,0,0.65)' }}
                                    >
                                        {/* Scan Box */}
                                        <div
                                            className="absolute -translate-x-1/2 -translate-y-1/2 border-2 border-green-400 rounded left-1/2 top-1/2"
                                            style={{
                                                width: '65%',
                                                height: '56px',
                                                boxShadow: 'none',
                                            }}
                                        >
                                            {/* Corner accents */}
                                            <div className="absolute -left-0.5 -top-0.5 h-4 w-4 rounded-tl border-l-4 border-t-4 border-green-400" />
                                            <div className="absolute -right-0.5 -top-0.5 h-4 w-4 rounded-tr border-r-4 border-t-4 border-green-400" />
                                            <div className="absolute -bottom-0.5 -left-0.5 h-4 w-4 rounded-bl border-b-4 border-l-4 border-green-400" />
                                            <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-br border-b-4 border-r-4 border-green-400" />
                                            {/* Animated scan line */}
                                            <div className="absolute left-2 right-2 top-1/2 h-0.5 -translate-y-1/2 animate-pulse bg-green-400 opacity-80" />
                                        </div>
                                        {/* Hint text */}
                                        <p className="absolute bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-black/70 px-3 py-1.5 text-xs text-white">
                                            Hold barcode in the green box to scan
                                        </p>
                                    </div>
                                )}

                                {/* Scanning active badge */}
                                {desktopScanActive && !recordedUrl && (
                                    <div className="absolute flex items-center gap-2 px-3 py-1 text-xs font-semibold text-white bg-green-600 rounded-full left-3 top-3">
                                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                                        SCANNING
                                    </div>
                                )}

                                {/* REC Badge */}
                                {isRecording && !desktopScanActive && (
                                    <div className="absolute flex items-center gap-2 px-3 py-1 text-sm font-semibold text-white bg-red-600 rounded-full left-3 top-3">
                                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                                        REC{' '}
                                        {elapsed > 0 &&
                                            `${Math.floor(elapsed / 60)}:${String(elapsed % 60).padStart(2, '0')}`}
                                    </div>
                                )}

                                {/* Paused Badge (while desktop scan is active) */}
                                {!isRecording && desktopScanActive && (
                                    <div className="absolute flex items-center gap-2 px-3 py-1 text-xs font-semibold text-white rounded-full right-3 top-3 bg-amber-500">
                                        ⏸ Recording Paused
                                    </div>
                                )}

                                {/* Flash ON Badge */}
                                {torchOn && !recordedUrl && !desktopScanActive && (
                                    <div className="absolute flex items-center gap-1 px-2 py-1 text-xs font-semibold text-gray-900 rounded-full pointer-events-none right-2 top-2 bg-yellow-400/90">
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

                                {/* Camera Initializing */}
                                {!isReady && !recordedUrl && !cameraError && (
                                    <div className="absolute inset-0 flex items-center justify-center text-white">
                                        <div className="text-center">
                                            <svg
                                                className="w-8 h-8 mx-auto mb-2 animate-spin"
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
                                                    d="M4 12a8 8 0 018-8v8z"
                                                />
                                            </svg>
                                            <p className="text-sm">Starting camera...</p>
                                        </div>
                                    </div>
                                )}

                                {/* Bottom Hint during recording */}
                                {isRecording && !desktopScanActive && (
                                    <div className="absolute flex items-center gap-2 px-3 py-1 text-xs text-white -translate-x-1/2 rounded-full bottom-3 left-1/2 whitespace-nowrap bg-black/60">
                                        <div className="w-2 h-2 rounded-full animate-pulse bg-violet-400" />
                                        Press "Snapshot &amp; Scan" to verify order
                                    </div>
                                )}
                            </div>

                            {/* Controls */}
                            <div className="flex flex-wrap justify-center gap-3 mt-4">
                                {!recordedUrl ? (
                                    <>
                                        {/* Desktop scan active — show cancel */}
                                        {desktopScanActive && (
                                            <button
                                                onClick={handleCancelDesktopScan}
                                                className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white transition-transform bg-gray-500 rounded-lg lg:hover:bg-gray-600 active:scale-95"
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

                                        {/* Normal recording controls */}
                                        {!desktopScanActive && (
                                            <>
                                                {/* Snapshot & Scan — only during recording */}
                                                {isRecording && (
                                                    <button
                                                        onClick={handleSnapshot}
                                                        className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white transition-transform rounded-lg bg-violet-600 lg:hover:bg-violet-700 active:scale-95"
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
                                                        Snapshot &amp; Scan
                                                    </button>
                                                )}

                                                {/* Stop Recording */}
                                                {isRecording && (
                                                    <button
                                                        onClick={handleStopRecording}
                                                        className="px-5 py-2 text-sm font-medium text-white transition-transform bg-red-600 rounded-lg lg:hover:bg-red-700 active:scale-95"
                                                    >
                                                        Stop Recording
                                                    </button>
                                                )}

                                                {/* Camera preparing */}
                                                {!isReady && !isRecording && !cameraError && (
                                                    <p className="text-sm text-gray-400 animate-pulse dark:text-white/40">
                                                        Preparing camera...
                                                    </p>
                                                )}

                                                {/* Close — only when not recording */}
                                                {!isRecording && (
                                                    <button
                                                        onClick={handleClose}
                                                        className="px-5 py-2 text-sm font-medium text-white bg-gray-500 rounded-lg lg:hover:bg-gray-600"
                                                    >
                                                        Close
                                                    </button>
                                                )}
                                            </>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        {/* Upload — locked until verified */}
                                        <button
                                            onClick={handleSave}
                                            disabled={isSaving || !isVerifiedRef.current}
                                            title={
                                                !isVerifiedRef.current
                                                    ? 'Scan a barcode to verify the order first'
                                                    : ''
                                            }
                                            className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg lg:hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {isSaving ? 'Uploading...' : 'Upload Video'}
                                        </button>

                                        {/* Retake */}
                                        <button
                                            onClick={handleRetake}
                                            className="px-5 py-2 text-sm font-medium text-white rounded-lg bg-amber-500 lg:hover:bg-amber-600"
                                        >
                                            Retake
                                        </button>

                                        {/* Close */}
                                        <button
                                            onClick={handleClose}
                                            className="px-5 py-2 text-sm font-medium text-white bg-gray-500 rounded-lg lg:hover:bg-gray-600"
                                        >
                                            Close
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <NativeScannerPreview
                    isOpen={nativeScan}
                    fieldLabel="Order Code / Barcode"
                    itemNumber={null}
                    onResult={async (text, meta) => {
                        setNativeScan(false);
                        const code = (meta?.fields ? Object.values(meta.fields)[0] : null) ?? text;
                        await handleScannedCode(code);
                    }}
                    onClose={() => {
                        setNativeScan(false);
                        resumeRecording();
                    }}
                    scanBoxWidth={400}
                    scanBoxHeight={50}
                />
            </>
        );
    },
);

export default PackageVerificationRecorder;
