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
    if (!err) return true; // null/undefined - treat as no-result
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
            setTimeout(done, 3000); // extended timeout for slow iOS devices
        });
    }, []);

    const getLiveVideoTrack = useCallback(() => {
        // Try streamRef first, then fall back to srcObject
        const stream = streamRef.current || videoRef.current?.srcObject || null;

        if (!stream?.getVideoTracks) return { stream: null, track: null };

        const tracks = stream.getVideoTracks();
        const liveTrack = tracks.find((t) => t.readyState === 'live') || tracks[0] || null;

        return { stream, track: liveTrack };
    }, []);

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

    const tryEnableAutoFocus = useCallback(async () => {
        if (isIOSDevice.current || sourceVideoRef) return false;
        if (isApplyingFocusRef.current) return false;

        try {
            isApplyingFocusRef.current = true;

            const { track } = getLiveVideoTrack();
            if (!track) return false;

            // Try continuous directly without capability check
            try {
                await track.applyConstraints({ advanced: [{ focusMode: 'continuous' }] });
                focusSupportedRef.current = true;
                return true;
            } catch { }

            try {
                await track.applyConstraints({ focusMode: 'continuous' });
                focusSupportedRef.current = true;
                return true;
            } catch { }

            // Fallback to single-shot if continuous not available
            try {
                await track.applyConstraints({ advanced: [{ focusMode: 'single-shot' }] });
                focusSupportedRef.current = true;
                return true;
            } catch { }

            return false;
        } catch (err) {
            console.warn('[Scanner] AutoFocus init failed:', err);
            return false;
        } finally {
            isApplyingFocusRef.current = false;
        }
    }, [getLiveVideoTrack, sourceVideoRef]);

    const refocus = useCallback(async () => {
        if (isIOSDevice.current) return false;

        if (sourceVideoRef) return false; // sourceVideoRef mode doesn't own the track

        if (isApplyingFocusRef.current) return false;

        try {
            isApplyingFocusRef.current = true;

            const { track } = getLiveVideoTrack();
            if (!track || track.readyState !== 'live') {
                console.warn('[Scanner] Refocus: no live track available');
                return false;
            }

            // Strategy 1: single-shot then back to continuous
            // Most reliable on Android Chrome - don't check capabilities first, just try
            try {
                await track.applyConstraints({ advanced: [{ focusMode: 'single-shot' }] });

                // After single-shot triggers, switch back to continuous
                setTimeout(async () => {
                    try {
                        await track.applyConstraints({ advanced: [{ focusMode: 'continuous' }] });
                    } catch { }
                }, 300);

                focusSupportedRef.current = true;
                return true;
            } catch { }

            // Strategy 2: flat focusMode (some Android versions need this form)
            try {
                await track.applyConstraints({ focusMode: 'single-shot' });
                setTimeout(async () => {
                    try {
                        await track.applyConstraints({ focusMode: 'continuous' });
                    } catch { }
                }, 300);
                focusSupportedRef.current = true;
                return true;
            } catch { }

            // Strategy 3: continuous toggle (force re-evaluate focus point)
            try {
                await track.applyConstraints({ advanced: [{ focusMode: 'continuous' }] });
                focusSupportedRef.current = true;
                return true;
            } catch { }

            // Strategy 4: focusDistance sweep (devices that expose distance but not mode)
            try {
                const capabilities = track.getCapabilities?.() || {};
                if (capabilities.focusDistance) {
                    const { min = 0, max = 1, step = 0.1 } = capabilities.focusDistance;
                    const near = Math.max(min, Math.min(max, min + step));
                    const mid = Math.max(min, Math.min(max, min + (max - min) * 0.5));

                    await track.applyConstraints({ advanced: [{ focusDistance: near }] });
                    await new Promise(r => setTimeout(r, 150));
                    await track.applyConstraints({ advanced: [{ focusDistance: mid }] });
                    return true;
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
    }, [getLiveVideoTrack, sourceVideoRef]);

    const clearRetryTimeouts = useCallback(() => {
        retryTimeoutsRef.current.forEach((id) => clearTimeout(id));
        retryTimeoutsRef.current = [];
    }, []);

    const startAutoRefocus = useCallback(() => {
        // iOS: no-op, native autofocus handles everything
        if (isIOSDevice.current || sourceVideoRef) return;

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
            try {
                // Only attempt auto-refocus if focus constraints are known to work on this device
                if (focusSupportedRef.current) {
                    await refocus();
                }
            } finally {
                refocusTimeoutRef.current = setTimeout(run, 3000);
            }
        };

        refocusTimeoutRef.current = setTimeout(run, 3000);
    }, [getLiveVideoTrack, refocus, sourceVideoRef]);

    useEffect(() => {
        let cancelled = false;

        const stopAll = () => {
            autofocusReadyRef.current = false;
            focusSupportedRef.current = false;

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

            const { BrowserMultiFormatReader, } = await import('@zxing/browser');
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
                        // ZXing throws when no barcode is found - this is EXPECTED, not an error
                        // Only log truly unexpected errors
                        if (!isZxingDecodeError(err)) {
                            console.warn('[Scanner] Canvas decode error:', err);
                        }
                    }
                }, 600);

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

                // Store stream reference BEFORE any focus attempts
                const resolvedStream = videoRef.current?.srcObject || null;
                streamRef.current = resolvedStream;

                if (!resolvedStream) {
                    console.warn('[Scanner] Stream not available after video ready');
                }

                const { track } = getLiveVideoTrack();
                if (!track) {
                    console.warn('[Scanner] Scanner started but no live video track found');
                    // Still mark as ready - scanning works, just no focus control
                }

                autofocusReadyRef.current = true;

                // iOS: skip all focus manipulation, native handles it
                if (!isIOSDevice.current) {
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
        refocus,
        sourceVideoRef,
        startAutoRefocus,
        tryEnableAutoFocus,
        waitForVideoReady,
    ]);

    return { videoRef, refocus };
}
