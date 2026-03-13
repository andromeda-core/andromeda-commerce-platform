// import { useEffect, useRef, useCallback } from 'react';
// import beepSound from "../../assets/sounds/Beep.mp3";

// const isIOS = () =>
//     /iPad|iPhone|iPod/.test(navigator.userAgent) ||
//     (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);


// const ZXING_NO_RESULT_ERRORS = new Set([
//     'NotFoundException',
//     'NotFoundException2',
//     'ChecksumException',
//     'FormatException',
//     'ReedSolomonException',
// ]);

// const isZxingDecodeError = (err) => {
//     if (!err) return true;
//     const name = err?.name || err?.constructor?.name || '';
//     if (ZXING_NO_RESULT_ERRORS.has(name)) return true;
//     const msg = err?.message || '';
//     if (
//         msg.includes('No MultiFormat') ||
//         msg.includes('NotFoundException') ||
//         msg.includes('ChecksumException') ||
//         msg.includes('FormatException')
//     ) return true;
//     return false;
// };


// const drawVideoToCanvas = (videoEl, ctx, canvasW, canvasH) => {
//     const region = scanRegionRef.current;
//     if (region && videoEl.videoWidth > 0) {
//         const srcX = region.x * videoEl.videoWidth;
//         const srcY = region.y * videoEl.videoHeight;
//         const srcW = region.width * videoEl.videoWidth;
//         const srcH = region.height * videoEl.videoHeight;
//         ctx.drawImage(videoEl, srcX, srcY, srcW, srcH, 0, 0, canvasW, canvasH);
//     } else {
//         ctx.drawImage(videoEl, 0, 0, canvasW, canvasH);
//     }
// };


// const calculateSharpness = (imageData) => {
//     const data = imageData.data;
//     const w = imageData.width;
//     let sum = 0;
//     const len = data.length / 4;
//     for (let i = w; i < len - w; i++) {
//         const laplacian = Math.abs(
//             -data[(i - w) * 4]
//             - data[(i + w) * 4]
//             - data[(i - 1) * 4]
//             - data[(i + 1) * 4]
//             + 4 * data[i * 4]
//         );
//         sum += laplacian;
//     }
//     return sum / len;
// };

// // Sharpness threshold — frames below this are too blurry to decode reliably.
// // Raise if you want stricter filtering, lower if scanning in poor light.
// const SHARPNESS_THRESHOLD = 8;

// export function useScanner({ active, onScan, sourceVideoRef = null, scanRegion = null }) {
//     const videoRef = useRef(null);
//     const readerRef = useRef(null);
//     const controlsRef = useRef(null);
//     const streamRef = useRef(null);
//     const intervalRef = useRef(null);
//     const refocusTimeoutRef = useRef(null);
//     const retryTimeoutsRef = useRef([]);
//     const onScanRef = useRef(onScan);

//     const autofocusReadyRef = useRef(false);
//     const focusSupportedRef = useRef(false);
//     const isApplyingFocusRef = useRef(false);
//     const autoRefocusAttemptsRef = useRef(0);
//     const removeTapListenersRef = useRef(null);
//     const audioRef = useRef(null);
//     const imageCaptureRef = useRef(null);

//     const isIOSDevice = useRef(isIOS());
//     const scanRegionRef = useRef(scanRegion);

//     useEffect(() => {
//         onScanRef.current = onScan;
//     }, [onScan]);

//     useEffect(() => {
//         scanRegionRef.current = scanRegion;
//     }, [scanRegion]);

//     useEffect(() => {
//         audioRef.current = new Audio(beepSound);
//         audioRef.current.preload = 'auto';
//     }, []);

//     const playBeep = async () => {
//         try {
//             if (!audioRef.current) return;
//             audioRef.current.currentTime = 0;
//             await audioRef.current.play();
//         } catch (err) {
//             console.warn('[Scanner] Beep play blocked:', err);
//         }
//     };

//     const waitForVideoReady = useCallback((videoEl) => {
//         return new Promise((resolve) => {
//             if (!videoEl) { resolve(false); return; }
//             if (videoEl.readyState >= 2 && videoEl.videoWidth > 0) { resolve(true); return; }

//             let doneCalled = false;
//             const done = () => {
//                 if (doneCalled) return;
//                 doneCalled = true;
//                 videoEl.removeEventListener('loadedmetadata', done);
//                 videoEl.removeEventListener('canplay', done);
//                 videoEl.removeEventListener('playing', done);
//                 resolve(true);
//             };

//             videoEl.addEventListener('loadedmetadata', done, { once: true });
//             videoEl.addEventListener('canplay', done, { once: true });
//             videoEl.addEventListener('playing', done, { once: true });
//             setTimeout(done, 3000);
//         });
//     }, []);

//     const initImageCapture = useCallback((track) => {
//         if (typeof ImageCapture === 'undefined') return false;
//         try {
//             imageCaptureRef.current = new ImageCapture(track);
//             return true;
//         } catch (err) {
//             console.warn('[Scanner] ImageCapture init failed:', err);
//             return false;
//         }
//     }, []);

//     const getLiveVideoTrack = useCallback(() => {
//         const stream = sourceVideoRef
//             ? (sourceVideoRef.current?.srcObject || null)
//             : (streamRef.current || videoRef.current?.srcObject || null);
//         if (!stream?.getVideoTracks) return { stream: null, track: null };
//         const tracks = stream.getVideoTracks();
//         const liveTrack = tracks.find((t) => t.readyState === 'live') || tracks[0] || null;
//         return { stream, track: liveTrack };
//     }, [sourceVideoRef]);


//     const applyZoomForCloseRange = useCallback(async (track) => {
//         if (!track || track.readyState !== 'live') return;
//         if (isIOSDevice.current) return;
//         try {
//             const capabilities = track.getCapabilities?.() || {};
//             if (!capabilities.zoom) return;
//             const { min = 1, max = 10 } = capabilities.zoom;
//             // 1.5x is enough to trigger close-range focus without distorting the view
//             const targetZoom = Math.min(max, Math.max(min, 1.5));
//             await track.applyConstraints({ advanced: [{ zoom: targetZoom }] });
//             // console.log('[Scanner] Zoom applied for close-range focus:', targetZoom);
//         } catch (err) {
//             console.log('[Scanner] Zoom trick failed (non-critical):', err?.message);
//         }
//     }, []);

//     const tryEnableAutoFocus = useCallback(async () => {
//         if (isIOSDevice.current) return false;
//         if (isApplyingFocusRef.current) return false;

//         try {
//             isApplyingFocusRef.current = true;

//             const { track } = getLiveVideoTrack();
//             if (!track || track.readyState !== 'live') return false;

//             // S0: grabFrame() — triggers hardware autofocus on Android Chrome
//             if (typeof ImageCapture !== 'undefined') {
//                 try {
//                     if (!imageCaptureRef.current) initImageCapture(track);
//                     if (imageCaptureRef.current) {
//                         await imageCaptureRef.current.grabFrame();
//                         focusSupportedRef.current = true;
//                         return true;
//                     }
//                 } catch (err) {
//                     console.log('[Scanner] grabFrame autofocus failed:', err?.message);
//                 }
//             }

//             try {
//                 await track.applyConstraints({ advanced: [{ focusMode: 'continuous' }] });
//                 focusSupportedRef.current = true;
//                 return true;
//             } catch (err) {
//                 console.log('[Scanner] Strategy failed: tryEnableAutoFocus advanced continuous', err?.message);
//             }

//             try {
//                 await track.applyConstraints({ focusMode: 'continuous' });
//                 focusSupportedRef.current = true;
//                 return true;
//             } catch (err) {
//                 console.log('[Scanner] Strategy failed: tryEnableAutoFocus flat continuous', err?.message);
//             }

//             try {
//                 await track.applyConstraints({ advanced: [{ focusMode: 'single-shot' }] });
//                 focusSupportedRef.current = true;
//                 return true;
//             } catch (err) {
//                 console.log('[Scanner] Strategy failed: tryEnableAutoFocus advanced single-shot', err?.message);
//             }

//             return false;
//         } finally {
//             isApplyingFocusRef.current = false;
//         }
//     }, [getLiveVideoTrack, initImageCapture]);

//     const resolvePoint = useCallback((tapXOrEvent, tapY) => {
//         if (tapXOrEvent === undefined || tapXOrEvent === null) {
//             return { x: 0.5, y: 0.5 };
//         }

//         if (typeof tapXOrEvent === 'object') {
//             const videoEl = sourceVideoRef ? sourceVideoRef.current : videoRef.current;
//             let clientX, clientY;

//             if (tapXOrEvent.touches?.length > 0) {
//                 clientX = tapXOrEvent.touches[0].clientX;
//                 clientY = tapXOrEvent.touches[0].clientY;
//             } else if (typeof tapXOrEvent.clientX === 'number') {
//                 clientX = tapXOrEvent.clientX;
//                 clientY = tapXOrEvent.clientY;
//             }

//             if (videoEl && typeof clientX === 'number') {
//                 const rect = videoEl.getBoundingClientRect();
//                 return {
//                     x: Math.max(0, Math.min(1, (clientX - rect.left) / rect.width)),
//                     y: Math.max(0, Math.min(1, (clientY - rect.top) / rect.height)),
//                 };
//             }

//             return { x: 0.5, y: 0.5 };
//         }

//         if (typeof tapXOrEvent === 'number') {
//             return {
//                 x: Math.max(0, Math.min(1, tapXOrEvent)),
//                 y: Math.max(0, Math.min(1, typeof tapY === 'number' ? tapY : 0.5)),
//             };
//         }

//         return { x: 0.5, y: 0.5 };
//     }, [sourceVideoRef]);



//     const softwareTapToFocus = useCallback(async (tapX, tapY) => {
//         if (isIOSDevice.current) return false;

//         const { track } = getLiveVideoTrack();
//         if (!track || track.readyState !== 'live') return false;

//         const capabilities = track.getCapabilities?.() || {};
//         if (!capabilities.focusDistance || !capabilities.focusMode) {
//             try {
//                 await track.applyConstraints({ advanced: [{ focusMode: 'continuous' }] });
//             } catch { }
//             return false;
//         }

//         const { min, max } = capabilities.focusDistance;
//         const videoEl = sourceVideoRef ? sourceVideoRef.current : videoRef.current;
//         if (!videoEl?.videoWidth) return false;

//         const cropW = 120;
//         const cropH = 120;
//         const cx = Math.round(tapX * 640);
//         const cy = Math.round(tapY * 360);
//         const cropX = Math.max(0, Math.min(640 - cropW, cx - cropW / 2));
//         const cropY = Math.max(0, Math.min(360 - cropH, cy - cropH / 2));

//         const offCanvas = document.createElement('canvas');
//         offCanvas.width = cropW;
//         offCanvas.height = cropH;
//         const offCtx = offCanvas.getContext('2d', { willReadFrequently: true });

//         const measureRegionSharpness = () => {
//             offCtx.drawImage(videoEl, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
//             return calculateSharpness(offCtx.getImageData(0, 0, cropW, cropH));
//         };

//         const baselineSharpness = measureRegionSharpness();
//         if (baselineSharpness >= SHARPNESS_THRESHOLD * 2) return true;

//         try {
//             // ─────────────────────────────────────────────────────────────────
//             // FIX: currentDistance se start karo — min pe jump NAHI karna.
//             // min pe jaana Blur #1 ka cause tha. Current setting pe rehna
//             // means lens already kuch sane position pe hai.
//             // ─────────────────────────────────────────────────────────────────
//             const currentDistance = track.getSettings?.()?.focusDistance;
//             // Barcodes 15-40cm door hote hain — near range estimate ~20% of range
//             const nearRangeGuess = min + (max - min) * 0.2;
//             // Current valid hai to use it, warna near range guess
//             const startDistance = (typeof currentDistance === 'number' && currentDistance >= min && currentDistance <= max)
//                 ? currentDistance
//                 : nearRangeGuess;

//             await track.applyConstraints({
//                 advanced: [{ focusMode: 'manual', focusDistance: startDistance }]
//             });
//             await new Promise(r => setTimeout(r, 80));

//             const numSteps = 8;
//             const stepSize = (max - min) / numSteps;

//             let bestDistance = startDistance;
//             let bestSharpness = measureRegionSharpness();
//             let droppingCount = 0;

//             for (let d = min; d <= max + stepSize * 0.5; d += stepSize) {
//                 // Skip steps that are very close to where we already are
//                 if (Math.abs(d - startDistance) < stepSize * 0.4) continue;

//                 await track.applyConstraints({
//                     advanced: [{ focusMode: 'manual', focusDistance: d }]
//                 });
//                 await new Promise(r => setTimeout(r, 120));
//                 const s = measureRegionSharpness();

//                 if (s > bestSharpness) {
//                     bestSharpness = s;
//                     bestDistance = d;
//                     droppingCount = 0;
//                 } else {
//                     droppingCount++;
//                     // ─────────────────────────────────────────────────────────
//                     // FIX: Early exit — 2 consecutive drops matlab peak already
//                     // mil gayi. Aage jaana sirf aur blur karega (Blur #2 ka cause).
//                     // ─────────────────────────────────────────────────────────
//                     if (droppingCount >= 2) break;
//                 }
//             }

//             await track.applyConstraints({
//                 advanced: [{ focusMode: 'manual', focusDistance: bestDistance }]
//             });

//             setTimeout(async () => {
//                 try {
//                     await track.applyConstraints({ advanced: [{ focusMode: 'continuous' }] });
//                 } catch { }
//             }, 2500);

//             return bestSharpness > baselineSharpness;
//         } catch (err) {
//             console.log('[Scanner] Software focus sweep failed:', err?.message);
//             try {
//                 await track.applyConstraints({ advanced: [{ focusMode: 'continuous' }] });
//             } catch { }
//             return false;
//         }
//     }, [getLiveVideoTrack, sourceVideoRef]);

//     const iosTapToFocus = useCallback(async (tapX, tapY) => {
//         const videoEl = sourceVideoRef ? sourceVideoRef.current : videoRef.current;
//         if (!videoEl?.videoWidth) return false;

//         const cropW = 120;
//         const cropH = 120;
//         const cx = Math.round(tapX * 640);
//         const cy = Math.round(tapY * 360);
//         const cropX = Math.max(0, Math.min(640 - cropW, cx - cropW / 2));
//         const cropY = Math.max(0, Math.min(360 - cropH, cy - cropH / 2));

//         const offCanvas = document.createElement('canvas');
//         offCanvas.width = cropW;
//         offCanvas.height = cropH;
//         const offCtx = offCanvas.getContext('2d', { willReadFrequently: true });

//         const measure = () => {
//             offCtx.drawImage(videoEl, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
//             return calculateSharpness(offCtx.getImageData(0, 0, cropW, cropH));
//         };

//         const baseline = measure();

//         // Already sharp — nothing to do
//         if (baseline >= SHARPNESS_THRESHOLD * 2) return true;

//         // Poll for up to 2s — iOS continuous AF will focus naturally
//         // 150ms interval x 13 attempts = ~2s max wait
//         for (let i = 0; i < 13; i++) {
//             await new Promise(r => setTimeout(r, 150));
//             const s = measure();
//             // 30% improvement over baseline counts as focused
//             if (s > baseline * 1.3) return true;
//         }

//         return false;
//     }, [sourceVideoRef]);


//     const refocus = useCallback(async (tapXOrEvent, tapY) => {
//         if (isIOSDevice.current) {
//             const isManualTap = tapXOrEvent !== undefined && tapXOrEvent !== null;
//             if (!isManualTap) return false;

//             const { x, y } = resolvePoint(tapXOrEvent, tapY);
//             return await iosTapToFocus(x, y);
//         }

//         const isManualTap = tapXOrEvent !== undefined && tapXOrEvent !== null;
//         if (isManualTap) {
//             isApplyingFocusRef.current = false;
//         } else {
//             if (isApplyingFocusRef.current) return false;
//         }

//         try {
//             isApplyingFocusRef.current = true;

//             const { x, y } = resolvePoint(tapXOrEvent, tapY);
//             const hasSpecificPoint = isManualTap && !(x === 0.5 && y === 0.5);

//             // For manual tap: software sweep FIRST — this actually works
//             if (hasSpecificPoint) {
//                 const swept = await softwareTapToFocus(x, y);
//                 if (swept) return true;
//                 // If device doesn't support focusDistance, fall through to grabFrame
//             }

//             // For auto refocus (no specific point): grabFrame triggers
//             // generic center-weighted autofocus
//             if (!hasSpecificPoint && typeof ImageCapture !== 'undefined') {
//                 try {
//                     if (!imageCaptureRef.current) initImageCapture(getLiveVideoTrack().track);
//                     if (imageCaptureRef.current) {
//                         await imageCaptureRef.current.grabFrame();
//                         focusSupportedRef.current = true;
//                         return true;
//                     }
//                 } catch (err) {
//                     console.log('[Scanner] grabFrame failed:', err?.message);
//                 }
//             }

//             // Last resort: toggle continuous (forces driver re-evaluation)
//             const { track } = getLiveVideoTrack();
//             if (track) {
//                 try {
//                     await track.applyConstraints({ advanced: [{ focusMode: 'continuous' }] });
//                     focusSupportedRef.current = true;
//                     return true;
//                 } catch { }
//             }

//             return false;
//         } finally {
//             isApplyingFocusRef.current = false;
//         }
//     }, [getLiveVideoTrack, initImageCapture, resolvePoint, softwareTapToFocus]);

//     const clearRetryTimeouts = useCallback(() => {
//         retryTimeoutsRef.current.forEach((id) => clearTimeout(id));
//         retryTimeoutsRef.current = [];
//     }, []);

//     const startAutoRefocus = useCallback(() => {
//         if (isIOSDevice.current) return;

//         if (refocusTimeoutRef.current) {
//             clearTimeout(refocusTimeoutRef.current);
//             refocusTimeoutRef.current = null;
//         }

//         const run = async () => {
//             const { track } = getLiveVideoTrack();
//             if (!autofocusReadyRef.current || !track) {
//                 refocusTimeoutRef.current = setTimeout(run, 3000);
//                 return;
//             }

//             if (focusSupportedRef.current) {
//                 await refocus();
//                 refocusTimeoutRef.current = setTimeout(run, 3000);
//             } else {
//                 autoRefocusAttemptsRef.current++;
//                 if (autoRefocusAttemptsRef.current >= 3) return;
//                 await refocus();
//                 refocusTimeoutRef.current = setTimeout(run, 3000);
//             }
//         };

//         refocusTimeoutRef.current = setTimeout(run, 3000);
//     }, [getLiveVideoTrack, refocus]);

//     useEffect(() => {
//         let cancelled = false;

//         const stopAll = () => {
//             autofocusReadyRef.current = false;
//             focusSupportedRef.current = false;
//             autoRefocusAttemptsRef.current = 0;
//             imageCaptureRef.current = null;

//             removeTapListenersRef.current?.();
//             removeTapListenersRef.current = null;

//             if (refocusTimeoutRef.current) {
//                 clearTimeout(refocusTimeoutRef.current);
//                 refocusTimeoutRef.current = null;
//             }

//             clearRetryTimeouts();

//             if (intervalRef.current) {
//                 clearInterval(intervalRef.current);
//                 intervalRef.current = null;
//             }

//             try { controlsRef.current?.stop?.(); } catch { }
//             controlsRef.current = null;

//             try { readerRef.current?.reset?.(); } catch { }
//             readerRef.current = null;

//             if (!sourceVideoRef) {
//                 try {
//                     const stream = streamRef.current || videoRef.current?.srcObject;
//                     if (stream) stream.getTracks().forEach((t) => t.stop());

//                     const v = videoRef.current;
//                     if (v) {
//                         v.pause?.();
//                         v.srcObject = null;
//                         v.load?.();
//                     }
//                 } catch { }
//             }

//             streamRef.current = null;
//         };

//         if (!active) {
//             stopAll();
//             return () => stopAll();
//         }

//         const start = async () => {
//             stopAll();
//             if (cancelled) return;

//             const { BrowserMultiFormatReader } = await import('@zxing/browser');
//             if (cancelled) return;

//             const hints = new Map();
//             const reader = new BrowserMultiFormatReader(hints);
//             readerRef.current = reader;


//             if (sourceVideoRef) {
//                 const canvas = document.createElement('canvas');
//                 canvas.width = 640;
//                 canvas.height = 360;
//                 const ctx = canvas.getContext('2d', { willReadFrequently: true });

//                 intervalRef.current = setInterval(async () => {
//                     if (cancelled) return;

//                     const videoEl = sourceVideoRef.current;
//                     if (!videoEl?.videoWidth) return;

//                     try {
//                         drawVideoToCanvas(videoEl, ctx, 640, 360);


//                         const imageData = ctx.getImageData(0, 0, 640, 360);
//                         const sharpness = calculateSharpness(imageData);
//                         if (sharpness < SHARPNESS_THRESHOLD) return;

//                         const result = reader.decodeFromCanvas(canvas);
//                         if (result && !cancelled) {
//                             await playBeep();
//                             onScanRef.current(result.getText());
//                         }
//                     } catch (err) {
//                         if (!isZxingDecodeError(err)) {
//                             console.warn('[Scanner] Canvas decode error:', err);
//                         }
//                     }
//                 }, 600);

//                 if (!isIOSDevice.current) {
//                     const videoEl = sourceVideoRef.current;

//                     if (videoEl) await waitForVideoReady(videoEl);

//                     await new Promise(r => setTimeout(r, 300));
//                     if (cancelled) return;

//                     autofocusReadyRef.current = true;

//                     const { track: srcTrack } = getLiveVideoTrack();
//                     if (srcTrack) {
//                         initImageCapture(srcTrack);

//                         await applyZoomForCloseRange(srcTrack);
//                     }

//                     if (videoEl) {
//                         const onTap = (e) => { if (!cancelled) refocus(e); };
//                         videoEl.addEventListener('touchstart', onTap, { passive: true });
//                         videoEl.addEventListener('click', onTap);
//                         removeTapListenersRef.current = () => {
//                             videoEl.removeEventListener('touchstart', onTap);
//                             videoEl.removeEventListener('click', onTap);
//                         };
//                     }

//                     await tryEnableAutoFocus();

//                     retryTimeoutsRef.current.push(
//                         setTimeout(async () => { if (!cancelled) await refocus(); }, 700)
//                     );
//                     retryTimeoutsRef.current.push(
//                         setTimeout(async () => { if (!cancelled) await refocus(); }, 1600)
//                     );

//                     startAutoRefocus();
//                 }

//                 return;
//             }


//             try {
//                 let stream;
//                 try {
//                     stream = await navigator.mediaDevices.getUserMedia({
//                         audio: false,
//                         video: {
//                             facingMode: { ideal: 'environment' },
//                             width: { ideal: 1920 },
//                             height: { ideal: 1080 },
//                             focusMode: 'continuous',
//                             advanced: [
//                                 { focusMode: 'continuous' },
//                                 { focusMode: 'auto' },
//                             ],
//                         },
//                     });
//                 } catch {
//                     try {
//                         stream = await navigator.mediaDevices.getUserMedia({
//                             audio: false,
//                             video: {
//                                 facingMode: { ideal: 'environment' },
//                                 width: { ideal: 1920 },
//                                 height: { ideal: 1080 },
//                             },
//                         });
//                     } catch (err2) {
//                         throw err2;
//                     }
//                 }

//                 if (cancelled) {
//                     stream.getTracks().forEach(t => t.stop());
//                     return;
//                 }

//                 streamRef.current = stream;

//                 const videoEl = videoRef.current;
//                 videoEl.srcObject = stream;
//                 await videoEl.play().catch(() => { });

//                 const ready = await waitForVideoReady(videoEl);
//                 if (!ready || cancelled) return;


//                 const canvas = document.createElement('canvas');
//                 canvas.width = 640;
//                 canvas.height = 360;
//                 const ctx = canvas.getContext('2d', { willReadFrequently: true });

//                 intervalRef.current = setInterval(async () => {
//                     if (cancelled) return;
//                     if (!videoEl?.videoWidth) return;

//                     try {
//                         ctx.drawImage(videoEl, 0, 0, 640, 360);

//                         // Sharpness check — iOS + Android dono pe blurry frames skip
//                         const imageData = ctx.getImageData(0, 0, 640, 360);
//                         const sharpness = calculateSharpness(imageData);
//                         if (sharpness < SHARPNESS_THRESHOLD) return;

//                         const result = reader.decodeFromCanvas(canvas);
//                         if (result && !cancelled) {
//                             await playBeep();
//                             onScanRef.current(result.getText());
//                         }
//                     } catch (err) {
//                         if (!isZxingDecodeError(err)) {
//                             console.warn('[Scanner] Canvas decode error:', err);
//                         }
//                     }
//                 }, 600);

//                 const { track } = getLiveVideoTrack();
//                 if (!track) {
//                     console.warn('[Scanner] Scanner started but no live video track found');
//                 }

//                 if (track) {
//                     initImageCapture(track);
//                     await applyZoomForCloseRange(track);
//                 }

//                 autofocusReadyRef.current = true;

//                 if (!isIOSDevice.current) {
//                     await tryEnableAutoFocus();

//                     retryTimeoutsRef.current.push(
//                         setTimeout(async () => { if (!cancelled) await refocus(); }, 700)
//                     );
//                     retryTimeoutsRef.current.push(
//                         setTimeout(async () => { if (!cancelled) await refocus(); }, 1600)
//                     );

//                     startAutoRefocus();
//                 }
//             } catch (err) {
//                 if (!cancelled) {
//                     console.error('[Scanner] Error starting camera:', err);
//                 }
//                 stopAll();
//             }
//         };

//         start();

//         return () => {
//             cancelled = true;
//             stopAll();
//         };
//     }, [
//         active,
//         applyZoomForCloseRange,
//         clearRetryTimeouts,
//         getLiveVideoTrack,
//         initImageCapture,
//         refocus,
//         sourceVideoRef,
//         startAutoRefocus,
//         tryEnableAutoFocus,
//         waitForVideoReady,
//     ]);

//     return { videoRef, refocus };
// }





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

export function useScanner({ active, onScan, sourceVideoRef = null, scanRegion = null }) {
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
    const autoRefocusAttemptsRef = useRef(0);
    const removeTapListenersRef = useRef(null);
    const audioRef = useRef(null);
    const imageCaptureRef = useRef(null);
    const isScannedRef = useRef(false);
    const isDecodingRef = useRef(false);

    const isIOSDevice = useRef(isIOS());
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

    useEffect(() => {
        onScanRef.current = onScan;
    }, [onScan]);

    useEffect(() => {
        scanRegionRef.current = scanRegion;
    }, [scanRegion]);

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

    const tryEnableAutoFocus = useCallback(async () => {
        if (isIOSDevice.current) return false;
        if (isApplyingFocusRef.current) return false;

        try {
            isApplyingFocusRef.current = true;

            const { track } = getLiveVideoTrack();
            if (!track || track.readyState !== 'live') return false;

            if (typeof ImageCapture !== 'undefined') {
                try {
                    if (!imageCaptureRef.current) initImageCapture(track);
                    if (imageCaptureRef.current) {
                        await imageCaptureRef.current.grabFrame();
                        focusSupportedRef.current = true;
                        return true;
                    }
                } catch (err) {
                    console.log('[Scanner] grabFrame autofocus failed:', err?.message);
                }
            }

            try {
                await track.applyConstraints({ advanced: [{ focusMode: 'continuous' }] });
                focusSupportedRef.current = true;
                return true;
            } catch (err) {
                console.log('[Scanner] tryEnableAutoFocus advanced continuous failed:', err?.message);
            }

            try {
                await track.applyConstraints({ focusMode: 'continuous' });
                focusSupportedRef.current = true;
                return true;
            } catch (err) {
                console.log('[Scanner] tryEnableAutoFocus flat continuous failed:', err?.message);
            }

            try {
                await track.applyConstraints({ advanced: [{ focusMode: 'single-shot' }] });
                focusSupportedRef.current = true;
                return true;
            } catch (err) {
                console.log('[Scanner] tryEnableAutoFocus advanced single-shot failed:', err?.message);
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

    const softwareTapToFocus = useCallback(async (tapX, tapY) => {
        if (isIOSDevice.current) return false;

        const { track } = getLiveVideoTrack();
        if (!track || track.readyState !== 'live') return false;

        const capabilities = track.getCapabilities?.() || {};
        if (!capabilities.focusDistance || !capabilities.focusMode) {
            try {
                await track.applyConstraints({ advanced: [{ focusMode: 'continuous' }] });
            } catch { }
            return false;
        }

        const { min, max } = capabilities.focusDistance;
        const videoEl = sourceVideoRef ? sourceVideoRef.current : videoRef.current;
        if (!videoEl?.videoWidth) return false;

        const cropW = 120;
        const cropH = 120;
        const cx = Math.round(tapX * 640);
        const cy = Math.round(tapY * 360);
        const cropX = Math.max(0, Math.min(640 - cropW, cx - cropW / 2));
        const cropY = Math.max(0, Math.min(360 - cropH, cy - cropH / 2));

        const offCanvas = document.createElement('canvas');
        offCanvas.width = cropW;
        offCanvas.height = cropH;
        const offCtx = offCanvas.getContext('2d', { willReadFrequently: true });

        const measureRegionSharpness = () => {
            offCtx.drawImage(videoEl, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
            return calculateSharpness(offCtx.getImageData(0, 0, cropW, cropH));
        };

        const baselineSharpness = measureRegionSharpness();
        if (baselineSharpness >= SHARPNESS_THRESHOLD * 2) return true;

        try {
            const currentDistance = track.getSettings?.()?.focusDistance;
            const nearRangeGuess = min + (max - min) * 0.2;
            const startDistance = (typeof currentDistance === 'number' && currentDistance >= min && currentDistance <= max)
                ? currentDistance
                : nearRangeGuess;

            await track.applyConstraints({
                advanced: [{ focusMode: 'manual', focusDistance: startDistance }]
            });
            await new Promise(r => setTimeout(r, 80));

            const numSteps = 8;
            const stepSize = (max - min) / numSteps;
            let bestDistance = startDistance;
            let bestSharpness = measureRegionSharpness();
            let droppingCount = 0;

            for (let d = min; d <= max + stepSize * 0.5; d += stepSize) {
                if (Math.abs(d - startDistance) < stepSize * 0.4) continue;

                await track.applyConstraints({
                    advanced: [{ focusMode: 'manual', focusDistance: d }]
                });
                await new Promise(r => setTimeout(r, 120));
                const s = measureRegionSharpness();

                if (s > bestSharpness) {
                    bestSharpness = s;
                    bestDistance = d;
                    droppingCount = 0;
                } else {
                    droppingCount++;
                    if (droppingCount >= 2) break;
                }
            }

            await track.applyConstraints({
                advanced: [{ focusMode: 'manual', focusDistance: bestDistance }]
            });

            setTimeout(async () => {
                try {
                    await track.applyConstraints({ advanced: [{ focusMode: 'continuous' }] });
                } catch { }
            }, 2500);

            return bestSharpness > baselineSharpness;
        } catch (err) {
            console.log('[Scanner] Software focus sweep failed:', err?.message);
            try {
                await track.applyConstraints({ advanced: [{ focusMode: 'continuous' }] });
            } catch { }
            return false;
        }
    }, [getLiveVideoTrack, sourceVideoRef]);

    const iosTapToFocus = useCallback(async (tapX, tapY) => {
        const videoEl = sourceVideoRef ? sourceVideoRef.current : videoRef.current;
        if (!videoEl?.videoWidth) return false;

        const cropW = 120;
        const cropH = 120;
        const cx = Math.round(tapX * 640);
        const cy = Math.round(tapY * 360);
        const cropX = Math.max(0, Math.min(640 - cropW, cx - cropW / 2));
        const cropY = Math.max(0, Math.min(360 - cropH, cy - cropH / 2));

        const offCanvas = document.createElement('canvas');
        offCanvas.width = cropW;
        offCanvas.height = cropH;
        const offCtx = offCanvas.getContext('2d', { willReadFrequently: true });

        const measure = () => {
            offCtx.drawImage(videoEl, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
            return calculateSharpness(offCtx.getImageData(0, 0, cropW, cropH));
        };

        const baseline = measure();
        if (baseline >= SHARPNESS_THRESHOLD * 2) return true;

        for (let i = 0; i < 13; i++) {
            await new Promise(r => setTimeout(r, 150));
            const s = measure();
            if (s > baseline * 1.3) return true;
        }

        return false;
    }, [sourceVideoRef]);

    const refocus = useCallback(async (tapXOrEvent, tapY) => {
        if (isIOSDevice.current) {
            const isManualTap = tapXOrEvent !== undefined && tapXOrEvent !== null;
            if (!isManualTap) return false;
            const { x, y } = resolvePoint(tapXOrEvent, tapY);
            return await iosTapToFocus(x, y);
        }

        const isManualTap = tapXOrEvent !== undefined && tapXOrEvent !== null;
        if (isManualTap) {
            isApplyingFocusRef.current = false;
        } else {
            if (isApplyingFocusRef.current) return false;
        }

        try {
            isApplyingFocusRef.current = true;

            const { x, y } = resolvePoint(tapXOrEvent, tapY);
            const hasSpecificPoint = isManualTap && !(x === 0.5 && y === 0.5);

            if (hasSpecificPoint) {
                const swept = await softwareTapToFocus(x, y);
                if (swept) return true;
            }

            if (!hasSpecificPoint && typeof ImageCapture !== 'undefined') {
                try {
                    if (!imageCaptureRef.current) initImageCapture(getLiveVideoTrack().track);
                    if (imageCaptureRef.current) {
                        await imageCaptureRef.current.grabFrame();
                        focusSupportedRef.current = true;
                        return true;
                    }
                } catch (err) {
                    console.log('[Scanner] grabFrame failed:', err?.message);
                }
            }

            const { track } = getLiveVideoTrack();
            if (track) {
                try {
                    await track.applyConstraints({ advanced: [{ focusMode: 'continuous' }] });
                    focusSupportedRef.current = true;
                    return true;
                } catch { }
            }

            return false;
        } finally {
            isApplyingFocusRef.current = false;
        }
    }, [getLiveVideoTrack, initImageCapture, resolvePoint, softwareTapToFocus, iosTapToFocus]);

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
                await refocus();
                refocusTimeoutRef.current = setTimeout(run, 3000);
            } else {
                autoRefocusAttemptsRef.current++;
                if (autoRefocusAttemptsRef.current >= 3) return;
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
            isScannedRef.current = false;
            isDecodingRef.current = false;
            imageCaptureRef.current = null;

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
                const canvas = document.createElement('canvas');
                canvas.width = 640;
                canvas.height = 360;
                const ctx = canvas.getContext('2d', { willReadFrequently: true });

                intervalRef.current = setInterval(async () => {
                    if (cancelled) return;

                    const videoEl = sourceVideoRef.current;
                    if (!videoEl?.videoWidth) return;

                    if (isScannedRef.current) return;

                    try {
                        drawVideoToCanvas(videoEl, ctx, 640, 360);

                        const imageData = ctx.getImageData(0, 0, 640, 360);
                        const sharpness = calculateSharpness(imageData);
                        const threshold = scanRegionRef.current ? SHARPNESS_THRESHOLD_REGION : SHARPNESS_THRESHOLD;
                        if (sharpness < threshold) return;

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
                            if (!isZxingDecodeError(decodeErr)) {
                                console.warn('[Scanner] Canvas decode error:', decodeErr);
                            }
                        } finally {
                            isDecodingRef.current = false;
                        }
                    } catch (err) {
                        if (!isZxingDecodeError(err)) {
                            console.warn('[Scanner] Canvas decode error:', err);
                        }
                    }
                }, 250);

                if (!isIOSDevice.current) {
                    const videoEl = sourceVideoRef.current;

                    if (videoEl) await waitForVideoReady(videoEl);

                    await new Promise(r => setTimeout(r, 300));
                    if (cancelled) return;

                    autofocusReadyRef.current = true;

                    const { track: srcTrack } = getLiveVideoTrack();
                    if (srcTrack) {
                        initImageCapture(srcTrack);
                        await applyZoomForCloseRange(srcTrack);
                    }

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
                        setTimeout(async () => { if (!cancelled) await refocus(); }, 700)
                    );
                    retryTimeoutsRef.current.push(
                        setTimeout(async () => { if (!cancelled) await refocus(); }, 1600)
                    );

                    startAutoRefocus();
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
                            advanced: [
                                { focusMode: 'continuous' },
                                { focusMode: 'auto' },
                            ],
                        },
                    });
                } catch {
                    try {
                        stream = await navigator.mediaDevices.getUserMedia({
                            audio: false,
                            video: {
                                facingMode: { ideal: 'environment' },
                                width: { ideal: 1920 },
                                height: { ideal: 1080 },
                            },
                        });
                    } catch (err2) {
                        throw err2;
                    }
                }

                if (cancelled) {
                    stream.getTracks().forEach(t => t.stop());
                    return;
                }

                streamRef.current = stream;

                const videoEl = videoRef.current;
                videoEl.srcObject = stream;
                await videoEl.play().catch(() => { });

                const ready = await waitForVideoReady(videoEl);
                if (!ready || cancelled) return;

                const canvas = document.createElement('canvas');
                canvas.width = 640;
                canvas.height = 360;
                const ctx = canvas.getContext('2d', { willReadFrequently: true });

                intervalRef.current = setInterval(async () => {
                    if (cancelled) return;
                    if (!videoEl?.videoWidth) return;
                    if (isScannedRef.current) return;
                    try {
                        // BUG FIX 2: drawVideoToCanvas — crops to scan region
                        drawVideoToCanvas(videoEl, ctx, 640, 360);

                        const imageData = ctx.getImageData(0, 0, 640, 360);
                        const sharpness = calculateSharpness(imageData);
                        const threshold = scanRegionRef.current ? SHARPNESS_THRESHOLD_REGION : SHARPNESS_THRESHOLD;
                        if (sharpness < threshold) return;

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
                            if (!isZxingDecodeError(decodeErr)) {
                                console.warn('[Scanner] Canvas decode error:', decodeErr);
                            }
                        } finally {
                            isDecodingRef.current = false;
                        }
                    } catch (err) {
                        if (!isZxingDecodeError(err)) {
                            console.warn('[Scanner] Canvas decode error:', err);
                        }
                    }

                }, 150);

                const { track } = getLiveVideoTrack();
                if (!track) {
                    console.warn('[Scanner] Scanner started but no live video track found');
                }

                if (track) {
                    initImageCapture(track);
                    await applyZoomForCloseRange(track);
                }

                autofocusReadyRef.current = true;

                if (!isIOSDevice.current) {
                    await tryEnableAutoFocus();

                    retryTimeoutsRef.current.push(
                        setTimeout(async () => { if (!cancelled) await refocus(); }, 700)
                    );
                    retryTimeoutsRef.current.push(
                        setTimeout(async () => { if (!cancelled) await refocus(); }, 1600)
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
        applyZoomForCloseRange,
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
