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

    const autofocusReadyRef = useRef(false);
    const focusSupportedRef = useRef(false);
    const isApplyingFocusRef = useRef(false);
    const autoRefocusAttemptsRef = useRef(0);   // stops the auto loop after 3 unsupported attempts
    const removeTapListenersRef = useRef(null);  // cleanup fn for internal tap listeners
    const audioRef = useRef(null);
    const imageCaptureRef = useRef(null);

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

    // Called once after the camera stream is ready.
    // S0: grabFrame() — triggers hardware autofocus on Android Chrome (the only reliable method).
    // Falls back to applyConstraints strategies on devices without ImageCapture support.
    const tryEnableAutoFocus = useCallback(async () => {
        if (isIOSDevice.current) return false;
        if (isApplyingFocusRef.current) return false;

        try {
            isApplyingFocusRef.current = true;

            const { track } = getLiveVideoTrack();
            if (!track || track.readyState !== 'live') return false;

            // S0: grabFrame() — triggers hardware autofocus on Android Chrome
            if (typeof ImageCapture !== 'undefined') {
                try {
                    if (!imageCaptureRef.current) initImageCapture(track);
                    if (imageCaptureRef.current) {
                        await imageCaptureRef.current.grabFrame();
                        // console.log('[Scanner] AutoFocus triggered via: grabFrame()');
                        focusSupportedRef.current = true;
                        return true;
                    }
                } catch (err) {
                    console.log('[Scanner] grabFrame autofocus failed:', err?.message);
                }
            }

            // Try continuous directly — no capability check
            try {
                await track.applyConstraints({ advanced: [{ focusMode: 'continuous' }] });
                // console.log('[Scanner] Focus applied via: tryEnableAutoFocus advanced continuous');
                focusSupportedRef.current = true;
                return true;
            } catch (err) {
                console.log('[Scanner] Strategy failed: tryEnableAutoFocus advanced continuous', err?.message);
            }

            try {
                await track.applyConstraints({ focusMode: 'continuous' });
                // console.log('[Scanner] Focus applied via: tryEnableAutoFocus flat continuous');
                focusSupportedRef.current = true;
                return true;
            } catch (err) {
                console.log('[Scanner] Strategy failed: tryEnableAutoFocus flat continuous', err?.message);
            }

            try {
                await track.applyConstraints({ advanced: [{ focusMode: 'single-shot' }] });
                // console.log('[Scanner] Focus applied via: tryEnableAutoFocus advanced single-shot');
                focusSupportedRef.current = true;
                return true;
            } catch (err) {
                console.log('[Scanner] Strategy failed: tryEnableAutoFocus advanced single-shot', err?.message);
            }

            return false;
        } finally {
            isApplyingFocusRef.current = false;
        }
    }, [getLiveVideoTrack, initImageCapture]);


    const resolvePoint = useCallback((tapXOrEvent, tapY) => {
        if (tapXOrEvent === undefined || tapXOrEvent === null) {
            return { x: 0.5, y: 0.5 };
        }

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

            // S0: grabFrame() — triggers hardware autofocus on Android Chrome
            // This is the only reliable way to force physical lens movement.
            // Unlike applyConstraints, it cannot be silently ignored by the driver.
            if (typeof ImageCapture !== 'undefined') {
                try {
                    if (!imageCaptureRef.current) initImageCapture(track);
                    if (imageCaptureRef.current) {
                        await imageCaptureRef.current.grabFrame();
                        // console.log('[Scanner] Focus triggered via: S0 grabFrame()');
                        focusSupportedRef.current = true;
                        autoRefocusAttemptsRef.current = 0;
                        return true;
                    }
                } catch (err) {
                    console.log('[Scanner] S0 grabFrame failed:', err?.message);
                }
            }

            // S1: single-shot + pointsOfInterest, advanced form
            try {
                await track.applyConstraints({
                    advanced: [{ focusMode: 'single-shot', pointsOfInterest: [{ x, y }] }],
                });
                // console.log('[Scanner] Focus applied via: S1 advanced single-shot + pointsOfInterest');
                setTimeout(async () => {
                    try {
                        await track.applyConstraints({ advanced: [{ focusMode: 'continuous' }] });
                    } catch { }
                }, 500);
                focusSupportedRef.current = true;
                return true;
            } catch (err) {
                console.log('[Scanner] Strategy failed: S1 advanced single-shot + pointsOfInterest', err?.message);
            }

            // S2: single-shot + pointsOfInterest, flat form
            try {
                await track.applyConstraints({
                    focusMode: 'single-shot',
                    pointsOfInterest: [{ x, y }],
                });
                // console.log('[Scanner] Focus applied via: S2 flat single-shot + pointsOfInterest');
                setTimeout(async () => {
                    try {
                        await track.applyConstraints({ focusMode: 'continuous' });
                    } catch { }
                }, 500);
                focusSupportedRef.current = true;
                return true;
            } catch (err) {
                console.log('[Scanner] Strategy failed: S2 flat single-shot + pointsOfInterest', err?.message);
            }

            // S3: continuous toggle without poi (forces re-evaluation)
            try {
                await track.applyConstraints({ advanced: [{ focusMode: 'continuous' }] });
                // console.log('[Scanner] Focus applied via: S3 advanced continuous toggle');
                focusSupportedRef.current = true;
                return true;
            } catch (err) {
                console.log('[Scanner] Strategy failed: S3 advanced continuous toggle', err?.message);
            }

            try {
                await track.applyConstraints({ focusMode: 'continuous' });
                // console.log('[Scanner] Focus applied via: S3 flat continuous toggle');
                focusSupportedRef.current = true;
                return true;
            } catch (err) {
                console.log('[Scanner] Strategy failed: S3 flat continuous toggle', err?.message);
            }

            // S4: focusDistance sweep — last resort
            try {
                const capabilities = track.getCapabilities?.() || {};
                if (capabilities.focusDistance) {
                    const { min = 0, max = 1, step = 0.1 } = capabilities.focusDistance;
                    const near = Math.max(min, Math.min(max, min + step));
                    const mid = Math.max(min, Math.min(max, min + (max - min) * 0.5));
                    await track.applyConstraints({ advanced: [{ focusDistance: near }] });
                    await new Promise(r => setTimeout(r, 150));
                    await track.applyConstraints({ advanced: [{ focusDistance: mid }] });
                    // console.log('[Scanner] Focus applied via: S4 focusDistance sweep');
                    focusSupportedRef.current = true;
                    return true;
                }
            } catch (err) {
                console.log('[Scanner] Strategy failed: S4 focusDistance sweep', err?.message);
            }

            console.warn('[Scanner] All refocus strategies failed');
            return false;
        } catch (err) {
            console.warn('[Scanner] Refocus error:', err);
            return false;
        } finally {
            isApplyingFocusRef.current = false;
        }
    }, [getLiveVideoTrack, initImageCapture, resolvePoint]);

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
            imageCaptureRef.current = null;

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

            // Never stop the track in sourceVideoRef mode — the recorder component owns the stream.
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

                    autofocusReadyRef.current = true;

                    const { track: srcTrack } = getLiveVideoTrack();
                    if (srcTrack) initImageCapture(srcTrack);

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

                if (track) initImageCapture(track);

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
