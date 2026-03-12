import { useEffect, useRef, useCallback } from 'react';
import beepSound from "../../assets/sounds/Beep.mp3";

// iOS does not support programmatic focus control via WebRTC constraints.
// Attempting it causes errors and warnings. We detect iOS and skip all focus logic.
const isIOS = () =>
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

// All ZXing "no barcode found" exception types
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

export function useScanner({ active, onScan, sourceVideoRef = null }) {
    const videoRef = useRef(null);
    const readerRef = useRef(null);
    const controlsRef = useRef(null);
    const streamRef = useRef(null);
    const intervalRef = useRef(null);
    const refocusTimeoutRef = useRef(null);
    const retryTimeoutsRef = useRef([]);
    const onScanRef = useRef(onScan);
    const imageCaptureRef = useRef(null);

    const autofocusReadyRef = useRef(false);
    const focusSupportedRef = useRef(false);
    const isApplyingFocusRef = useRef(false);
    const autoRefocusAttemptsRef = useRef(0);   // stops the auto loop after 3 unsupported attempts
    const removeTapListenersRef = useRef(null);  // cleanup fn for internal tap listeners
    const audioRef = useRef(null);

    // Cache iOS check so we don't call it on every render
    const isIOSDevice = useRef(isIOS());

    useEffect(() => {
        onScanRef.current = onScan;
    }, [onScan]);

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

    // When sourceVideoRef is provided the recorder owns the stream — read from there.
    // Otherwise fall back to streamRef / videoRef.
    const getLiveVideoTrack = useCallback(() => {
        const stream = sourceVideoRef
            ? (sourceVideoRef.current?.srcObject || null)
            : (streamRef.current || videoRef.current?.srcObject || null);
        if (!stream?.getVideoTracks) return { stream: null, track: null };
        const tracks = stream.getVideoTracks();
        const liveTrack = tracks.find((t) => t.readyState === 'live') || tracks[0] || null;
        return { stream, track: liveTrack };
    }, [sourceVideoRef]);

    // S3 fallback only — kept for browsers where ImageCapture is unavailable
    const applyFocusMode = useCallback(async (track, mode) => {
        try {
            await track.applyConstraints({ focusMode: mode });
            return true;
        } catch {
            try {
                await track.applyConstraints({ advanced: [{ focusMode: mode }] });
                return true;
            } catch {
                return false;
            }
        }
    }, []);

    // S3 fallback only
    const applyFocusDistance = useCallback(async (track, value) => {
        try {
            await track.applyConstraints({ focusDistance: value });
            return true;
        } catch {
            try {
                await track.applyConstraints({ advanced: [{ focusDistance: value }] });
                return true;
            } catch {
                return false;
            }
        }
    }, []);

    // Creates the ImageCapture instance from a live track.
    // Returns true on success, false if ImageCapture is unavailable or creation fails.
    const initImageCapture = useCallback((track) => {
        if (typeof ImageCapture === 'undefined') {
            console.warn('[Scanner] ImageCapture API not available on this browser');
            return false;
        }
        try {
            imageCaptureRef.current = new ImageCapture(track);
            return true;
        } catch (err) {
            console.warn('[Scanner] Failed to create ImageCapture instance:', err);
            return false;
        }
    }, []);

    // Called once after the camera stream is ready.
    // Primary: ImageCapture.setOptions() — the correct hardware-level focus API on Android Chrome.
    // Fallback (S3): applyConstraints for browsers without ImageCapture.
    // iOS guard kept; sourceVideoRef guard removed (focus works in both modes now).
    const tryEnableAutoFocus = useCallback(async () => {
        if (isIOSDevice.current) return false;
        if (isApplyingFocusRef.current) return false;

        try {
            isApplyingFocusRef.current = true;

            const { track } = getLiveVideoTrack();
            if (!track || track.readyState !== 'live') return false;

            // Ensure ImageCapture is initialized
            if (!imageCaptureRef.current) {
                initImageCapture(track);
            }

            if (imageCaptureRef.current) {
                try {
                    await imageCaptureRef.current.setOptions({ focusMode: 'continuous' });
                    focusSupportedRef.current = true;
                    return true;
                } catch { }

                try {
                    await imageCaptureRef.current.setOptions({ focusMode: 'single-shot' });
                    focusSupportedRef.current = true;
                    return true;
                } catch { }
            }

            // S3: applyConstraints fallback for browsers without ImageCapture
            if (await applyFocusMode(track, 'continuous')) {
                focusSupportedRef.current = true;
                return true;
            }
            if (await applyFocusMode(track, 'single-shot')) {
                focusSupportedRef.current = true;
                return true;
            }

            // S3: focusDistance midpoint
            try {
                const capabilities = track.getCapabilities?.() || {};
                if (capabilities.focusDistance) {
                    const { min = 0, max = 1 } = capabilities.focusDistance;
                    const mid = min + (max - min) * 0.5;
                    if (await applyFocusDistance(track, mid)) {
                        focusSupportedRef.current = true;
                        return true;
                    }
                }
            } catch { }

            return false;
        } catch (err) {
            console.warn('[Scanner] AutoFocus init failed:', err);
            return false;
        } finally {
            isApplyingFocusRef.current = false;
        }
    }, [applyFocusDistance, applyFocusMode, getLiveVideoTrack, initImageCapture]);

    // Converts the first argument into normalized [0–1] {x, y} coordinates.
    // Three calling conventions:
    //   resolvePoint()              → center {0.5, 0.5}
    //   resolvePoint(event)         → extracted from touch/click event via getBoundingClientRect
    //   resolvePoint(normX, normY)  → passed through as-is
    const resolvePoint = useCallback((tapXOrEvent, tapY) => {
        if (tapXOrEvent === undefined || tapXOrEvent === null) {
            return { x: 0.5, y: 0.5 };
        }

        if (typeof tapXOrEvent === 'object') {
            // In sourceVideoRef mode, bounding rect is on the recorder's video element
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

    // refocus(tapXOrEvent?, tapY?)
    //
    // Safe to pass directly as onTouchStart={refocus} / onClick={refocus}.
    // Works in both direct-camera mode and sourceVideoRef mode.
    // The browser event is auto-resolved into tap coordinates via resolvePoint.
    //
    // Strategy waterfall:
    //   S1: ImageCapture.setOptions({ focusMode: 'single-shot', pointsOfInterest })
    //       → after 500ms hand back to continuous via ImageCapture
    //   S2: ImageCapture.setOptions({ focusMode: 'continuous' }) toggle
    //   S3: applyConstraints waterfall (last resort for browsers without ImageCapture)
    const refocus = useCallback(async (tapXOrEvent, tapY) => {
        if (isIOSDevice.current) return false;
        if (isApplyingFocusRef.current) return false;

        try {
            isApplyingFocusRef.current = true;

            const { track } = getLiveVideoTrack();
            if (!track || track.readyState !== 'live') {
                console.warn('[Scanner] Refocus: no live track available');
                return false;
            }

            const { x, y } = resolvePoint(tapXOrEvent, tapY);

            // Ensure ImageCapture is initialized
            if (!imageCaptureRef.current) {
                initImageCapture(track);
            }

            if (imageCaptureRef.current) {
                // S1: single-shot + pointsOfInterest via ImageCapture
                try {
                    await imageCaptureRef.current.setOptions({
                        focusMode: 'single-shot',
                        pointsOfInterest: [{ x, y }],
                    });
                    // Hand back to continuous so the camera isn't locked on the tap point indefinitely
                    setTimeout(async () => {
                        if (imageCaptureRef.current && track.readyState === 'live') {
                            try {
                                await imageCaptureRef.current.setOptions({ focusMode: 'continuous' });
                            } catch { }
                        }
                    }, 500);
                    focusSupportedRef.current = true;
                    return true;
                } catch { }

                // S2: continuous toggle via ImageCapture — forces re-evaluation of focus point
                try {
                    await imageCaptureRef.current.setOptions({ focusMode: 'continuous' });
                    focusSupportedRef.current = true;
                    return true;
                } catch { }
            }

            // S3: applyConstraints waterfall — last resort for browsers without ImageCapture

            // S3a: single-shot + pointsOfInterest
            const poiOk = await (async () => {
                try {
                    await track.applyConstraints({
                        advanced: [{ focusMode: 'single-shot', pointsOfInterest: [{ x, y }] }],
                    });
                    return true;
                } catch {
                    try {
                        await track.applyConstraints({
                            focusMode: 'single-shot',
                            pointsOfInterest: [{ x, y }],
                        });
                        return true;
                    } catch {
                        return false;
                    }
                }
            })();

            if (poiOk) {
                setTimeout(() => applyFocusMode(track, 'continuous'), 300);
                focusSupportedRef.current = true;
                return true;
            }

            // S3b: continuous toggle
            if (await applyFocusMode(track, 'continuous')) {
                focusSupportedRef.current = true;
                return true;
            }

            // S3c: focusDistance sweep
            try {
                const capabilities = track.getCapabilities?.() || {};
                if (capabilities.focusDistance) {
                    const { min = 0, max = 1, step = 0.1 } = capabilities.focusDistance;
                    const near = Math.max(min, Math.min(max, min + step));
                    const mid = Math.max(min, Math.min(max, min + (max - min) * 0.5));
                    if (await applyFocusDistance(track, near)) {
                        await new Promise(r => setTimeout(r, 150));
                        await applyFocusDistance(track, mid);
                        focusSupportedRef.current = true;
                        return true;
                    }
                }
            } catch { }

            console.warn('[Scanner] All refocus strategies failed on this device');
            return false;
        } catch (err) {
            console.warn('[Scanner] Refocus error:', err);
            return false;
        } finally {
            isApplyingFocusRef.current = false;
        }
    }, [applyFocusDistance, applyFocusMode, getLiveVideoTrack, initImageCapture, resolvePoint]);

    const clearRetryTimeouts = useCallback(() => {
        retryTimeoutsRef.current.forEach((id) => clearTimeout(id));
        retryTimeoutsRef.current = [];
    }, []);

    const startAutoRefocus = useCallback(() => {
        if (isIOSDevice.current) return;

        if (refocusTimeoutRef.current) {
            clearTimeout(refocusTimeoutRef.current);
            refocusTimeoutRef.current = null;
        }

        const run = async () => {
            const { track } = getLiveVideoTrack();
            if (!autofocusReadyRef.current || !track) {
                refocusTimeoutRef.current = setTimeout(run, 3000);
                return;
            }

            if (focusSupportedRef.current) {
                // Focus confirmed working on this device — keep running the loop
                await refocus();
                refocusTimeoutRef.current = setTimeout(run, 3000);
            } else {
                // Haven't confirmed focus support yet — try, but give up after 3 misses
                autoRefocusAttemptsRef.current++;
                if (autoRefocusAttemptsRef.current >= 3) {
                    // Device does not support programmatic focus — stop the loop entirely
                    return;
                }
                await refocus();
                refocusTimeoutRef.current = setTimeout(run, 3000);
            }
        };

        refocusTimeoutRef.current = setTimeout(run, 3000);
    }, [getLiveVideoTrack, refocus]);

    useEffect(() => {
        let cancelled = false;

        const stopAll = () => {
            autofocusReadyRef.current = false;
            focusSupportedRef.current = false;
            autoRefocusAttemptsRef.current = 0;

            // Remove internal tap-to-focus listeners
            removeTapListenersRef.current?.();
            removeTapListenersRef.current = null;

            if (refocusTimeoutRef.current) {
                clearTimeout(refocusTimeoutRef.current);
                refocusTimeoutRef.current = null;
            }

            clearRetryTimeouts();

            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }

            try { controlsRef.current?.stop?.(); } catch { }
            controlsRef.current = null;

            try { readerRef.current?.reset?.(); } catch { }
            readerRef.current = null;

            // Release ImageCapture instance.
            // Never stop the track in sourceVideoRef mode — the recorder component owns the stream.
            imageCaptureRef.current = null;

            if (!sourceVideoRef) {
                try {
                    const stream = streamRef.current || videoRef.current?.srcObject;
                    if (stream) stream.getTracks().forEach((t) => t.stop());

                    const v = videoRef.current;
                    if (v) {
                        v.pause?.();
                        v.srcObject = null;
                        v.load?.();
                    }
                } catch { }
            }

            streamRef.current = null;
        };

        if (!active) {
            stopAll();
            return () => stopAll();
        }

        const start = async () => {
            stopAll();
            if (cancelled) return;

            const { BrowserMultiFormatReader } = await import('@zxing/browser');
            if (cancelled) return;

            const hints = new Map();
            const reader = new BrowserMultiFormatReader(hints);
            readerRef.current = reader;

            if (sourceVideoRef) {
                const canvas = document.createElement('canvas');
                canvas.width = 640;
                canvas.height = 360;
                const ctx = canvas.getContext('2d', { willReadFrequently: true });

                intervalRef.current = setInterval(async () => {
                    if (cancelled) return;

                    const videoEl = sourceVideoRef.current;
                    if (!videoEl?.videoWidth) return;

                    try {
                        ctx.drawImage(videoEl, 0, 0, 640, 360);
                        const result = reader.decodeFromCanvas(canvas);

                        if (result && !cancelled) {
                            await playBeep();
                            onScanRef.current(result.getText());
                        }
                    } catch (err) {
                        if (!isZxingDecodeError(err)) {
                            console.warn('[Scanner] Canvas decode error:', err);
                        }
                    }
                }, 600);

                // Initialize focus in sourceVideoRef mode (iOS skipped).
                // The hook reads frames from canvas and applies focus via ImageCapture —
                // neither operation interferes with the recorder that owns the stream.
                if (!isIOSDevice.current) {
                    const videoEl = sourceVideoRef.current;

                    // The recorder video may already be playing; wait if not yet ready
                    if (videoEl) {
                        await waitForVideoReady(videoEl);
                    }

                    // Small safety delay — recorder may set srcObject on the track slightly
                    // after the video element reports ready state
                    await new Promise(r => setTimeout(r, 300));
                    if (cancelled) return;

                    const { track } = getLiveVideoTrack();
                    if (track) {
                        initImageCapture(track);
                    }

                    autofocusReadyRef.current = true;

                    // Attach tap-to-focus listener to the recorder's video element
                    if (videoEl) {
                        const onTap = (e) => { if (!cancelled) refocus(e); };
                        videoEl.addEventListener('touchstart', onTap, { passive: true });
                        videoEl.addEventListener('click', onTap);
                        removeTapListenersRef.current = () => {
                            videoEl.removeEventListener('touchstart', onTap);
                            videoEl.removeEventListener('click', onTap);
                        };
                    }

                    await tryEnableAutoFocus();

                    retryTimeoutsRef.current.push(
                        setTimeout(async () => {
                            if (!cancelled) await refocus();
                        }, 700)
                    );

                    retryTimeoutsRef.current.push(
                        setTimeout(async () => {
                            if (!cancelled) await refocus();
                        }, 1600)
                    );

                    startAutoRefocus();
                }

                return;
            }

            try {
                const controls = await reader.decodeFromConstraints(
                    {
                        audio: false,
                        video: {
                            facingMode: { ideal: 'environment' },
                            width: { ideal: 1920 },
                            height: { ideal: 1080 },
                        },
                    },
                    videoRef.current,
                    async (result) => {
                        if (result && !cancelled) {
                            await playBeep();
                            onScanRef.current(result.getText());
                        }
                    }
                );

                controlsRef.current = controls;

                const ready = await waitForVideoReady(videoRef.current);
                if (!ready || cancelled) return;

                const resolvedStream = videoRef.current?.srcObject || null;
                streamRef.current = resolvedStream;

                if (!resolvedStream) {
                    console.warn('[Scanner] Stream not available after video ready');
                }

                const { track } = getLiveVideoTrack();
                if (!track) {
                    console.warn('[Scanner] Scanner started but no live video track found');
                }

                // Initialize ImageCapture before any focus calls
                if (track) {
                    initImageCapture(track);
                }

                autofocusReadyRef.current = true;

                if (!isIOSDevice.current) {
                    // Parent handles tap via onTouchStart/onClick on the video element directly.
                    // No internal tap listeners here — attaching both would double-fire refocus().

                    await tryEnableAutoFocus();

                    retryTimeoutsRef.current.push(
                        setTimeout(async () => {
                            if (!cancelled) await refocus();
                        }, 700)
                    );

                    retryTimeoutsRef.current.push(
                        setTimeout(async () => {
                            if (!cancelled) await refocus();
                        }, 1600)
                    );

                    startAutoRefocus();
                }
            } catch (err) {
                if (!cancelled) {
                    console.error('[Scanner] Error starting camera:', err);
                }
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
        clearRetryTimeouts,
        getLiveVideoTrack,
        initImageCapture,
        refocus,
        sourceVideoRef,
        startAutoRefocus,
        tryEnableAutoFocus,
        waitForVideoReady,
    ]);

    return { videoRef, refocus };
}
