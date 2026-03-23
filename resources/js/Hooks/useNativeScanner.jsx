import { useRef, useCallback, useEffect, useState } from 'react';
import beepSound from '../../assets/sounds/Beep.mp3';

/**
 * Detect mobile/tablet devices that should use native camera
 */
const isMobileDevice = () =>
    /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent,
    ) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

/**
 * useNativeScanner
 *
 * Two-step flow:
 *   1) captureImage()  - opens native rear camera / file picker, returns imageUrl
 *   2) decodeRegion()  - crops a region from that image and decodes barcode
 *
 * This lets the UI show a preview with a scan-box so the user can
 * position the desired barcode inside the box before decoding.
 *
 * Completely independent of useScanner. No WebRTC, no live video.
 */
export function useNativeScanner() {
    const fileInputRef = useRef(null);
    const audioRef = useRef(null);
    const readerRef = useRef(null);
    const isMobile = useRef(isMobileDevice());
    const [isProcessing, setIsProcessing] = useState(false);

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
            console.warn('[NativeScanner] Beep blocked:', err);
        }
    };

    // Lazy-init ZXing reader with ALL common barcode formats
    const getReader = useCallback(async () => {
        if (readerRef.current) return readerRef.current;

        const { BrowserMultiFormatReader } = await import('@zxing/browser');
        const { BarcodeFormat, DecodeHintType } = await import('@zxing/library');

        const hints = new Map();
        hints.set(DecodeHintType.POSSIBLE_FORMATS, [
            BarcodeFormat.CODE_128, BarcodeFormat.EAN_13, BarcodeFormat.QR_CODE,
        ]);
        hints.set(DecodeHintType.TRY_HARDER, true);


        readerRef.current = new BrowserMultiFormatReader(hints);
        return readerRef.current;
    }, []);

    const tryDecode = useCallback(async (reader, canvas) => {
        try {
            const result = reader.decodeFromCanvas(canvas);
            if (result) return result.getText();
        } catch { }
        return null;
    }, []);

    const cropCanvas = useCallback((srcCanvas, x, y, w, h) => {
        const c = document.createElement('canvas');
        c.width = w;
        c.height = h;
        c.getContext('2d').drawImage(srcCanvas, x, y, w, h, 0, 0, w, h);
        return c;
    }, []);

    const rotateCanvas90 = useCallback((srcCanvas) => {
        const c = document.createElement('canvas');
        c.width = srcCanvas.height;
        c.height = srcCanvas.width;
        const ctx = c.getContext('2d');
        ctx.translate(c.width, 0);
        ctx.rotate(Math.PI / 2);
        ctx.drawImage(srcCanvas, 0, 0);
        return c;
    }, []);

    const enhanceCanvas = useCallback((srcCanvas) => {
        const c = document.createElement('canvas');
        c.width = srcCanvas.width;
        c.height = srcCanvas.height;
        const ctx = c.getContext('2d');
        ctx.drawImage(srcCanvas, 0, 0);
        const imageData = ctx.getImageData(0, 0, c.width, c.height);
        const d = imageData.data;
        const factor = 1.6;
        const intercept = 128 * (1 - factor);
        for (let i = 0; i < d.length; i += 4) {
            d[i] = Math.max(0, Math.min(255, factor * d[i] + intercept));
            d[i + 1] = Math.max(0, Math.min(255, factor * d[i + 1] + intercept));
            d[i + 2] = Math.max(0, Math.min(255, factor * d[i + 2] + intercept));
        }
        ctx.putImageData(imageData, 0, 0);
        return c;
    }, []);

    const grayscaleCanvas = useCallback((srcCanvas) => {
        const c = document.createElement('canvas');
        c.width = srcCanvas.width;
        c.height = srcCanvas.height;
        const ctx = c.getContext('2d');
        ctx.drawImage(srcCanvas, 0, 0);
        const imageData = ctx.getImageData(0, 0, c.width, c.height);
        const d = imageData.data;
        for (let i = 0; i < d.length; i += 4) {
            const gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
            // Apply contrast boost (1.8x) on grayscale
            const val = Math.max(0, Math.min(255, 1.8 * gray + 128 * (1 - 1.8)));
            d[i] = val;
            d[i + 1] = val;
            d[i + 2] = val;
        }
        ctx.putImageData(imageData, 0, 0);
        return c;
    }, []);

    /**
     * Run all decode strategies on a single canvas.
     */
    const runAllStrategies = useCallback(
        async (reader, canvas, w, h) => {
            let found = null;

            // 1) Raw
            found = await tryDecode(reader, canvas);
            if (found) return found;
            await new Promise((r) => setTimeout(r, 0));

            // 2) Enhanced contrast
            found = await tryDecode(reader, enhanceCanvas(canvas));
            if (found) return found;
            await new Promise((r) => setTimeout(r, 0));

            // 3) Grayscale + high contrast
            found = await tryDecode(reader, grayscaleCanvas(canvas));
            if (found) return found;
            await new Promise((r) => setTimeout(r, 0));

            // 4) Horizontal strips
            const hStrips = 8;
            const hStripH = Math.floor(h / (hStrips * 0.6 + 0.4));
            for (let i = 0; i < hStrips; i++) {
                const sy = Math.floor(i * hStripH * 0.6);
                const sh = Math.min(hStripH, h - sy);
                if (sh < 30) continue;
                const strip = cropCanvas(canvas, 0, sy, w, sh);
                found = await tryDecode(reader, strip);
                if (found) return found;
                found = await tryDecode(reader, enhanceCanvas(strip));
                if (found) return found;
            }
            await new Promise((r) => setTimeout(r, 0));

            // 5) Vertical strips
            const vStrips = 6;
            const vStripW = Math.floor(w / vStrips);
            for (let i = 0; i < vStrips; i++) {
                const sx = Math.max(0, i * vStripW - Math.floor(vStripW * 0.25));
                const sw = Math.min(vStripW + Math.floor(vStripW * 0.5), w - sx);
                if (sw < 30) continue;
                found = await tryDecode(reader, cropCanvas(canvas, sx, 0, sw, h));
                if (found) return found;
            }
            await new Promise((r) => setTimeout(r, 0));

            // 6) Rotated 90 degrees
            const rotated = rotateCanvas90(canvas);
            found = await tryDecode(reader, rotated);
            if (found) return found;
            found = await tryDecode(reader, enhanceCanvas(rotated));
            if (found) return found;
            await new Promise((r) => setTimeout(r, 0));

            // 7) Scaled up 2x
            const s2 = document.createElement('canvas');
            s2.width = Math.min(w * 2, 3840);
            s2.height = Math.min(h * 2, 2160);
            const s2Ctx = s2.getContext('2d');
            s2Ctx.imageSmoothingEnabled = true;
            s2Ctx.imageSmoothingQuality = 'high';
            s2Ctx.drawImage(canvas, 0, 0, s2.width, s2.height);
            found = await tryDecode(reader, s2);
            if (found) return found;
            await new Promise((r) => setTimeout(r, 0));

            return null;
        },
        [tryDecode, cropCanvas, rotateCanvas90, enhanceCanvas, grayscaleCanvas],
    );

    const captureImage = useCallback(() => {
        return new Promise((resolve) => {
            if (fileInputRef.current) {
                try { document.body.removeChild(fileInputRef.current); } catch { }
            }

            const input = document.createElement('input');
            input.type = 'file';
            input.style.display = 'none';
            input.setAttribute('accept', 'image/*');
            if (isMobile.current) {
                input.setAttribute('capture', 'environment');
            }

            document.body.appendChild(input);
            fileInputRef.current = input;
            let resolved = false;

            const cleanup = () => {
                window.removeEventListener('focus', handleFocus);
                try { document.body.removeChild(input); } catch { }
                if (fileInputRef.current === input) fileInputRef.current = null;
            };

            const handleFocus = () => {
                setTimeout(() => {
                    if (!resolved) {
                        resolved = true;
                        resolve({ cancelled: true, imageUrl: null });
                        cleanup();
                    }
                }, 500);
            };

            input.onchange = (e) => {
                resolved = true;
                window.removeEventListener('focus', handleFocus);
                const file = e.target.files?.[0];
                if (!file) {
                    resolve({ cancelled: true, imageUrl: null });
                    cleanup();
                    return;
                }
                resolve({ cancelled: false, imageUrl: URL.createObjectURL(file) });
                cleanup();
            };

            window.addEventListener('focus', handleFocus);
            input.click();
        });
    }, []);


    const decodeRegion = useCallback(
        async (imageUrl, cropRect) => {
            setIsProcessing(true);
            try {
                await new Promise((r) => setTimeout(r, 50));
                const reader = await getReader();

                const img = await new Promise((res, rej) => {
                    const i = new Image();
                    i.onload = () => res(i);
                    i.onerror = () => rej(new Error('Failed to load image'));
                    i.src = imageUrl;
                });

                // Draw full image
                const fullCanvas = document.createElement('canvas');
                fullCanvas.width = img.width;
                fullCanvas.height = img.height;
                fullCanvas.getContext('2d').drawImage(img, 0, 0);

                // Strict crop - ONLY what's in the box
                const cx = Math.max(0, Math.round(cropRect.x));
                const cy = Math.max(0, Math.round(cropRect.y));
                const cw = Math.min(Math.round(cropRect.width), img.width - cx);
                const ch = Math.min(Math.round(cropRect.height), img.height - cy);

                if (cw < 10 || ch < 10) {
                    return { success: false, text: null, error: 'Scan region is too small.' };
                }

                // Cut it out - nothing else remains
                const cropped = document.createElement('canvas');
                cropped.width = cw;
                cropped.height = ch;
                cropped.getContext('2d').drawImage(fullCanvas, cx, cy, cw, ch, 0, 0, cw, ch);

                // Try at different scales - ZXing works best 400-800px wide
                const sizes = [640, 500, 800, 400, 1000];
                let found = null;

                for (const targetW of sizes) {
                    const ratio = targetW / cw;
                    const targetH = Math.max(20, Math.round(ch * ratio));

                    const scaled = document.createElement('canvas');
                    scaled.width = targetW;
                    scaled.height = targetH;
                    const ctx = scaled.getContext('2d');
                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = 'high';
                    ctx.drawImage(cropped, 0, 0, targetW, targetH);

                    // Try raw
                    found = await tryDecode(reader, scaled);
                    if (found) break;

                    // Try with contrast boost
                    found = await tryDecode(reader, enhanceCanvas(scaled));
                    if (found) break;

                    // Try grayscale
                    found = await tryDecode(reader, grayscaleCanvas(scaled));
                    if (found) break;

                    await new Promise((r) => setTimeout(r, 0));
                }

                if (found) {
                    await playBeep();
                    return { success: true, text: found, error: null };
                }

                return {
                    success: false,
                    text: null,
                    error: 'No barcode found. Make sure barcode is fully inside the box.',
                };
            } catch (err) {
                console.error('[NativeScanner] decodeRegion error:', err);
                return { success: false, text: null, error: 'Scanning failed. Please try again.' };
            } finally {
                setIsProcessing(false);
            }
        },
        [getReader, tryDecode, enhanceCanvas, grayscaleCanvas],
    );

    const releaseImage = useCallback((imageUrl) => {
        if (imageUrl) try { URL.revokeObjectURL(imageUrl); } catch { }
    }, []);

    useEffect(() => {
        return () => {
            if (fileInputRef.current) {
                try { document.body.removeChild(fileInputRef.current); } catch { }
                fileInputRef.current = null;
            }
            try { readerRef.current?.reset?.(); } catch { }
        };
    }, []);

    return {
        captureImage,   // () => Promise<{ cancelled, imageUrl }>
        decodeRegion,   // (imageUrl, { x, y, width, height }) => Promise<{ success, text, error }>
        releaseImage,   // (imageUrl) => void
        isProcessing,   // boolean
        isMobile: isMobile.current,
    };
}
