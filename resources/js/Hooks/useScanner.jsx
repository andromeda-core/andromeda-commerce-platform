import { useEffect, useRef, useCallback } from 'react';
import beepSound from "../../assets/sounds/Beep.mp3";

const isIOS = () =>
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

const ZXING_NO_RESULT_ERRORS = new Set([
    'NotFoundException',
    'NotFoundException2',
    'ChecksumException',
    'FormatException',
    'ReedSolomonException',
]);

const isZxingDecodeError = (err) => {
    if (!err) return true;
    const name = err?.name || err?.constructor?.name || '';
    if (ZXING_NO_RESULT_ERRORS.has(name)) return true;
    const msg = err?.message || '';
    if (
        msg.includes('No MultiFormat') ||
        msg.includes('NotFoundException') ||
        msg.includes('ChecksumException') ||
        msg.includes('FormatException')
    ) return true;
    return false;
};

const calculateSharpness = (imageData) => {
    const data = imageData.data;
    const w = imageData.width;
    let sum = 0;
    const len = data.length / 4;
    for (let i = w; i < len - w; i++) {
        const laplacian = Math.abs(
            -data[(i - w) * 4]
            - data[(i + w) * 4]
            - data[(i - 1) * 4]
            - data[(i + 1) * 4]
            + 4 * data[i * 4]
        );
        sum += laplacian;
    }
    return sum / len;
};

const SHARPNESS_THRESHOLD = 8;
const SHARPNESS_THRESHOLD_REGION = 3;

const MANUAL_TAP_COOLDOWN_MS = 6000;

export function useScanner({ active, onScan, sourceVideoRef = null, scanRegion = null }) {
    const videoRef = useRef(null);
    const readerRef = useRef(null);
    const streamRef = useRef(null);
    const intervalRef = useRef(null);
    const retryTimeoutsRef = useRef([]);
    const onScanRef = useRef(onScan);

    const autofocusReadyRef = useRef(false);
    const isApplyingFocusRef = useRef(false);
    const removeTapListenersRef = useRef(null);
    const audioRef = useRef(null);
    const imageCaptureRef = useRef(null);
    const isScannedRef = useRef(false);
    const isDecodingRef = useRef(false);

    const isIOSDevice = useRef(isIOS());
    const lastManualTapRef = useRef(0);
    const focusOpIdRef = useRef(0);
    const torchOnRef = useRef(false);
    const scanRegionRef = useRef(scanRegion);


    const drawVideoToCanvas = (videoEl, ctx, canvasW, canvasH) => {
        const region = scanRegionRef.current;
        if (region && videoEl.videoWidth > 0) {
            const srcX = region.x * videoEl.videoWidth;
            const srcY = region.y * videoEl.videoHeight;
            const srcW = region.width * videoEl.videoWidth;
            const srcH = region.height * videoEl.videoHeight;
            ctx.drawImage(videoEl, srcX, srcY, srcW, srcH, 0, 0, canvasW, canvasH);
        } else {
            ctx.drawImage(videoEl, 0, 0, canvasW, canvasH);
        }
    };

    useEffect(() => { onScanRef.current = onScan; }, [onScan]);
    useEffect(() => { scanRegionRef.current = scanRegion; }, [scanRegion]);

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
            console.warn('[Scanner] Beep play blocked:', err);
        }
    };

    const waitForVideoReady = useCallback((videoEl) => {
        return new Promise((resolve) => {
            if (!videoEl) { resolve(false); return; }
            if (videoEl.readyState >= 2 && videoEl.videoWidth > 0) { resolve(true); return; }

            let doneCalled = false;
            const done = () => {
                if (doneCalled) return;
                doneCalled = true;
                videoEl.removeEventListener('loadedmetadata', done);
                videoEl.removeEventListener('canplay', done);
                videoEl.removeEventListener('playing', done);
                resolve(true);
            };
            videoEl.addEventListener('loadedmetadata', done, { once: true });
            videoEl.addEventListener('canplay', done, { once: true });
            videoEl.addEventListener('playing', done, { once: true });
            setTimeout(done, 3000);
        });
    }, []);

    const initImageCapture = useCallback((track) => {
        if (typeof ImageCapture === 'undefined') return false;
        try {
            imageCaptureRef.current = new ImageCapture(track);
            return true;
        } catch (err) {
            console.warn('[Scanner] ImageCapture init failed:', err);
            return false;
        }
    }, []);

    const getLiveVideoTrack = useCallback(() => {
        const stream = sourceVideoRef
            ? (sourceVideoRef.current?.srcObject || null)
            : (streamRef.current || videoRef.current?.srcObject || null);
        if (!stream?.getVideoTracks) return { stream: null, track: null };
        const tracks = stream.getVideoTracks();
        const liveTrack = tracks.find((t) => t.readyState === 'live') || tracks[0] || null;
        return { stream, track: liveTrack };
    }, [sourceVideoRef]);

    const applyZoomForCloseRange = useCallback(async (track) => {
        if (!track || track.readyState !== 'live') return;
        if (isIOSDevice.current) return;
        try {
            const capabilities = track.getCapabilities?.() || {};
            if (!capabilities.zoom) return;
            const { min = 1, max = 10 } = capabilities.zoom;
            const targetZoom = Math.min(max, Math.max(min, 1.5));
            await track.applyConstraints({ advanced: [{ zoom: targetZoom }] });
        } catch (err) {
            console.log('[Scanner] Zoom trick failed (non-critical):', err?.message);
        }
    }, []);


    const measureSharpnessAtPoint = useCallback((videoEl, normX, normY) => {
        if (!videoEl?.videoWidth) return 0;
        const cropW = 160;
        const cropH = 160;
        const cx = Math.round(normX * videoEl.videoWidth);
        const cy = Math.round(normY * videoEl.videoHeight);
        const cropX = Math.max(0, Math.min(videoEl.videoWidth - cropW, cx - cropW / 2));
        const cropY = Math.max(0, Math.min(videoEl.videoHeight - cropH, cy - cropH / 2));
        const offCanvas = document.createElement('canvas');
        offCanvas.width = cropW;
        offCanvas.height = cropH;
        const offCtx = offCanvas.getContext('2d', { willReadFrequently: true });
        offCtx.drawImage(videoEl, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
        return calculateSharpness(offCtx.getImageData(0, 0, cropW, cropH));
    }, []);

    const pollForSharpness = useCallback(async (videoEl, normX, normY, baseline, timeoutMs = 2000) => {
        const deadline = Date.now() + timeoutMs;
        while (Date.now() < deadline) {
            await new Promise(r => setTimeout(r, 100));
            if (measureSharpnessAtPoint(videoEl, normX, normY) > baseline * 1.25) return true;
        }
        return false;
    }, [measureSharpnessAtPoint]);

    const resolvePoint = useCallback((tapXOrEvent, tapY) => {
        if (tapXOrEvent === undefined || tapXOrEvent === null) return { x: 0.5, y: 0.5 };

        if (typeof tapXOrEvent === 'object') {
            const videoEl = sourceVideoRef ? sourceVideoRef.current : videoRef.current;
            let clientX, clientY;
            if (tapXOrEvent.touches?.length > 0) {
                clientX = tapXOrEvent.touches[0].clientX;
                clientY = tapXOrEvent.touches[0].clientY;
            } else if (typeof tapXOrEvent.clientX === 'number') {
                clientX = tapXOrEvent.clientX;
                clientY = tapXOrEvent.clientY;
            }
            if (videoEl && typeof clientX === 'number') {
                const rect = videoEl.getBoundingClientRect();
                return {
                    x: Math.max(0, Math.min(1, (clientX - rect.left) / rect.width)),
                    y: Math.max(0, Math.min(1, (clientY - rect.top) / rect.height)),
                };
            }
            return { x: 0.5, y: 0.5 };
        }

        if (typeof tapXOrEvent === 'number') {
            return {
                x: Math.max(0, Math.min(1, tapXOrEvent)),
                y: Math.max(0, Math.min(1, typeof tapY === 'number' ? tapY : 0.5)),
            };
        }

        return { x: 0.5, y: 0.5 };
    }, [sourceVideoRef]);

    const iosTapToFocus = useCallback(async (normX, normY) => {
        const videoEl = sourceVideoRef ? sourceVideoRef.current : videoRef.current;
        if (!videoEl?.videoWidth) return false;
        const baseline = measureSharpnessAtPoint(videoEl, normX, normY);
        if (baseline >= SHARPNESS_THRESHOLD * 2) return true; // already sharp
        return await pollForSharpness(videoEl, normX, normY, baseline, 2000);
    }, [sourceVideoRef, measureSharpnessAtPoint, pollForSharpness]);


    const refocus = useCallback(async (tapXOrEvent, tapY) => {

        if (isIOSDevice.current) {
            const isManualTap = tapXOrEvent !== undefined && tapXOrEvent !== null;
            if (!isManualTap) return false;
            const { x, y } = resolvePoint(tapXOrEvent, tapY);
            return await iosTapToFocus(x, y);
        }

        const isManualTap = tapXOrEvent !== undefined && tapXOrEvent !== null;

        if (isManualTap) {
            focusOpIdRef.current += 2;
            isApplyingFocusRef.current = false;
            lastManualTapRef.current = Date.now();
        } else {
            // Auto-refocus path: respect cooldown and in-flight guard.
            if (Date.now() - lastManualTapRef.current < MANUAL_TAP_COOLDOWN_MS) return false;
            if (isApplyingFocusRef.current) return false;
        }

        const opId = ++focusOpIdRef.current;

        try {
            isApplyingFocusRef.current = true;

            const { x, y } = resolvePoint(tapXOrEvent, tapY);
            const videoEl = sourceVideoRef ? sourceVideoRef.current : videoRef.current;


            if (isManualTap && videoEl?.videoWidth) {
                const current = measureSharpnessAtPoint(videoEl, x, y);
                if (current >= SHARPNESS_THRESHOLD * 2) {
                    return true;
                }
            }

            if (opId !== focusOpIdRef.current) return false;

            const { track } = getLiveVideoTrack();
            if (!track || track.readyState !== 'live') return false;

            const capabilities = track.getCapabilities?.() || {};


            if (capabilities.focusMode?.includes('single-shot')) {
                try {
                    await track.applyConstraints({ advanced: [{ focusMode: 'single-shot' }] });

                    if (opId !== focusOpIdRef.current) return false;

                    // Poll up to 2s for the driver to converge
                    if (videoEl?.videoWidth) {
                        await pollForSharpness(videoEl, x, y, SHARPNESS_THRESHOLD, 2000);
                    } else {
                        await new Promise(r => setTimeout(r, 800));
                    }

                    if (opId !== focusOpIdRef.current) return false;


                    try {
                        await track.applyConstraints({ advanced: [{ focusMode: 'continuous' }] });
                    } catch { }

                    return true;
                } catch (err) {
                    console.log('[Scanner] single-shot failed:', err?.message);
                }
            }

            if (opId !== focusOpIdRef.current) return false;


            if (isManualTap && typeof ImageCapture !== 'undefined') {
                try {
                    if (!imageCaptureRef.current) initImageCapture(track);
                    if (imageCaptureRef.current) {
                        await imageCaptureRef.current.grabFrame();

                        if (opId !== focusOpIdRef.current) return false;

                        // Give the driver up to 2s to converge after grabFrame trigger
                        if (videoEl?.videoWidth) {
                            await pollForSharpness(videoEl, x, y, SHARPNESS_THRESHOLD, 2000);
                        } else {
                            await new Promise(r => setTimeout(r, 800));
                        }

                        return true;
                    }
                } catch (err) {
                    console.log('[Scanner] grabFrame failed:', err?.message);
                }
            }

            if (opId !== focusOpIdRef.current) return false;


            try {
                await track.applyConstraints({ advanced: [{ focusMode: 'continuous' }] });
                return true;
            } catch { }

            return false;
        } finally {
            isApplyingFocusRef.current = false;
        }
    }, [
        getLiveVideoTrack,
        initImageCapture,
        resolvePoint,
        iosTapToFocus,
        measureSharpnessAtPoint,
        pollForSharpness,
        sourceVideoRef,
    ]);


    const toggleTorch = useCallback(async () => {
        const { track } = getLiveVideoTrack();
        if (!track || track.readyState !== 'live') return null;
        const capabilities = track.getCapabilities?.() || {};
        if (!capabilities.torch) return null;

        const newState = !torchOnRef.current;
        try {
            await track.applyConstraints({ advanced: [{ torch: newState }] });
            torchOnRef.current = newState;
            return newState;
        } catch (err) {
            console.log('[Scanner] Torch toggle failed:', err?.message);
            return null;
        }
    }, [getLiveVideoTrack]);


    const initializeFocus = useCallback(async (track, isCancelled) => {
        if (isIOSDevice.current || !track) return;

        // Preferred: single-shot kick then continuous
        const capabilities = track.getCapabilities?.() || {};
        if (capabilities.focusMode?.includes('single-shot')) {
            try {
                await track.applyConstraints({ advanced: [{ focusMode: 'single-shot' }] });
                await new Promise(r => setTimeout(r, 600));
                if (isCancelled?.()) return;
                await track.applyConstraints({ advanced: [{ focusMode: 'continuous' }] });
                return;
            } catch { }
        }

        if (isCancelled?.()) return;

        // grabFrame once to kick HW AF
        if (typeof ImageCapture !== 'undefined' && imageCaptureRef.current) {
            try {
                await imageCaptureRef.current.grabFrame();
                await new Promise(r => setTimeout(r, 400));
            } catch { }
        }

        if (isCancelled?.()) return;

        // Set continuous directly
        try {
            await track.applyConstraints({ advanced: [{ focusMode: 'continuous' }] });
            return;
        } catch { }

        try {
            await track.applyConstraints({ focusMode: 'continuous' });
        } catch { }
    }, []);

    const clearRetryTimeouts = useCallback(() => {
        retryTimeoutsRef.current.forEach((id) => clearTimeout(id));
        retryTimeoutsRef.current = [];
    }, []);


    useEffect(() => {
        let cancelled = false;
        const isCancelled = () => cancelled;

        const stopAll = () => {
            autofocusReadyRef.current = false;
            isApplyingFocusRef.current = false;
            isScannedRef.current = false;
            isDecodingRef.current = false;
            imageCaptureRef.current = null;
            lastManualTapRef.current = 0;
            focusOpIdRef.current = 0;
            torchOnRef.current = false;

            removeTapListenersRef.current?.();
            removeTapListenersRef.current = null;

            clearRetryTimeouts();

            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }

            try { readerRef.current?.reset?.(); } catch { }
            readerRef.current = null;

            if (!sourceVideoRef) {
                try {
                    const stream = streamRef.current || videoRef.current?.srcObject;
                    if (stream) stream.getTracks().forEach((t) => t.stop());
                    const v = videoRef.current;
                    if (v) { v.pause?.(); v.srcObject = null; v.load?.(); }
                } catch { }
            }

            streamRef.current = null;
        };

        if (!active) {
            stopAll();
            return () => stopAll();
        }

        const buildScanInterval = (reader, videoEl, intervalMs) => {
            const canvas = document.createElement('canvas');
            canvas.width = 640;
            canvas.height = 360;
            const ctx = canvas.getContext('2d', { willReadFrequently: true });

            return setInterval(async () => {
                if (cancelled || !videoEl?.videoWidth || isScannedRef.current) return;

                try {
                    drawVideoToCanvas(videoEl, ctx, 640, 360);
                    const imageData = ctx.getImageData(0, 0, 640, 360);
                    const threshold = scanRegionRef.current ? SHARPNESS_THRESHOLD_REGION : SHARPNESS_THRESHOLD;
                    if (calculateSharpness(imageData) < threshold) return;
                    if (isDecodingRef.current) return;

                    isDecodingRef.current = true;
                    try {
                        const result = reader.decodeFromCanvas(canvas);
                        if (result && !cancelled && !isScannedRef.current) {
                            isScannedRef.current = true;
                            await playBeep();
                            onScanRef.current(result.getText());
                        }
                    } catch (decodeErr) {
                        if (!isZxingDecodeError(decodeErr)) console.warn('[Scanner] Decode error:', decodeErr);
                    } finally {
                        isDecodingRef.current = false;
                    }
                } catch (err) {
                    if (!isZxingDecodeError(err)) console.warn('[Scanner] Canvas error:', err);
                }
            }, intervalMs);
        };

        const start = async () => {
            stopAll();
            if (cancelled) return;

            const { BrowserMultiFormatReader } = await import('@zxing/browser');
            const { BarcodeFormat, DecodeHintType } = await import('@zxing/library');
            if (cancelled) return;

            const hints = new Map();
            hints.set(DecodeHintType.POSSIBLE_FORMATS, [
                BarcodeFormat.CODE_128,
                BarcodeFormat.CODE_39,
                BarcodeFormat.CODE_93,
                BarcodeFormat.EAN_13,
                BarcodeFormat.EAN_8,
                BarcodeFormat.UPC_A,
                BarcodeFormat.UPC_E,
                BarcodeFormat.ITF,
                BarcodeFormat.CODABAR,
                BarcodeFormat.QR_CODE,
                BarcodeFormat.DATA_MATRIX,
            ]);
            hints.set(DecodeHintType.TRY_HARDER, true);

            const reader = new BrowserMultiFormatReader(hints);
            readerRef.current = reader;

            if (sourceVideoRef) {
                const videoEl = sourceVideoRef.current;
                intervalRef.current = buildScanInterval(reader, videoEl, 250);

                if (!isIOSDevice.current && videoEl) {
                    await waitForVideoReady(videoEl);
                    await new Promise(r => setTimeout(r, 300));
                    if (cancelled) return;

                    autofocusReadyRef.current = true;

                    const { track: srcTrack } = getLiveVideoTrack();
                    if (srcTrack) {
                        initImageCapture(srcTrack);
                        await applyZoomForCloseRange(srcTrack);
                        await initializeFocus(srcTrack, isCancelled);
                    }

                    const onTap = (e) => { if (!cancelled) refocus(e); };
                    videoEl.addEventListener('touchstart', onTap, { passive: true });
                    videoEl.addEventListener('click', onTap);
                    removeTapListenersRef.current = () => {
                        videoEl.removeEventListener('touchstart', onTap);
                        videoEl.removeEventListener('click', onTap);
                    };
                }
                return;
            }


            try {
                let stream;
                try {
                    stream = await navigator.mediaDevices.getUserMedia({
                        audio: false,
                        video: {
                            facingMode: { ideal: 'environment' },
                            width: { ideal: 1920 },
                            height: { ideal: 1080 },
                            focusMode: 'continuous',
                            advanced: [{ focusMode: 'continuous' }, { focusMode: 'auto' }],
                        },
                    });
                } catch {
                    stream = await navigator.mediaDevices.getUserMedia({
                        audio: false,
                        video: {
                            facingMode: { ideal: 'environment' },
                            width: { ideal: 1920 },
                            height: { ideal: 1080 },
                        },
                    });
                }

                if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }

                streamRef.current = stream;
                const videoEl = videoRef.current;
                videoEl.srcObject = stream;
                await videoEl.play().catch(() => { });

                const ready = await waitForVideoReady(videoEl);
                if (!ready || cancelled) return;

                intervalRef.current = buildScanInterval(reader, videoEl, 150);

                const { track } = getLiveVideoTrack();
                if (track) {
                    initImageCapture(track);
                    await applyZoomForCloseRange(track);
                }

                autofocusReadyRef.current = true;

                if (!isIOSDevice.current) {
                    if (track) await initializeFocus(track, isCancelled);
                    if (cancelled) return;

                    // Attach tap listeners to the video element
                    if (videoEl) {
                        const onTap = (e) => { if (!cancelled) refocus(e); };
                        videoEl.addEventListener('touchstart', onTap, { passive: true });
                        videoEl.addEventListener('click', onTap);
                        removeTapListenersRef.current = () => {
                            videoEl.removeEventListener('touchstart', onTap);
                            videoEl.removeEventListener('click', onTap);
                        };
                    }
                }
            } catch (err) {
                if (!cancelled) console.error('[Scanner] Error starting camera:', err);
                stopAll();
            }
        };

        start();
        return () => {
            cancelled = true;
            stopAll();
        };
    }, [
        active,
        applyZoomForCloseRange,
        clearRetryTimeouts,
        getLiveVideoTrack,
        initImageCapture,
        initializeFocus,
        refocus,
        sourceVideoRef,
        waitForVideoReady,
    ]);

    return { videoRef, refocus, toggleTorch };
}
