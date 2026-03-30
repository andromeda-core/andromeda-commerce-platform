import { useRef, useCallback, useEffect, useState } from 'react';
import beepSound from '../../assets/sounds/Beep.mp3';

const isMobileDevice = () =>
    /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

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
    // const getReader = useCallback(async () => {
    //     if (readerRef.current) return readerRef.current;

    //     const { BrowserMultiFormatReader } = await import('@zxing/browser');
    //     const { BarcodeFormat, DecodeHintType } = await import('@zxing/library');

    //     const hints = new Map();
    //     hints.set(DecodeHintType.POSSIBLE_FORMATS, [
    //         BarcodeFormat.CODE_128,
    //         BarcodeFormat.EAN_13,
    //         BarcodeFormat.QR_CODE,
    //     ]);
    //     hints.set(DecodeHintType.TRY_HARDER, true);

    //     readerRef.current = new BrowserMultiFormatReader(hints);
    //     return readerRef.current;
    // }, []);

    // const tryDecode = useCallback(async (reader, canvas) => {
    //     try {
    //         const result = reader.decodeFromCanvas(canvas);
    //         if (result) return result.getText();
    //     } catch {}
    //     return null;
    // }, []);

    // const cropCanvas = useCallback((srcCanvas, x, y, w, h) => {
    //     const c = document.createElement('canvas');
    //     c.width = w;
    //     c.height = h;
    //     c.getContext('2d').drawImage(srcCanvas, x, y, w, h, 0, 0, w, h);
    //     return c;
    // }, []);

    // const rotateCanvas90 = useCallback((srcCanvas) => {
    //     const c = document.createElement('canvas');
    //     c.width = srcCanvas.height;
    //     c.height = srcCanvas.width;
    //     const ctx = c.getContext('2d');
    //     ctx.translate(c.width, 0);
    //     ctx.rotate(Math.PI / 2);
    //     ctx.drawImage(srcCanvas, 0, 0);
    //     return c;
    // }, []);

    // const enhanceCanvas = useCallback((srcCanvas) => {
    //     const c = document.createElement('canvas');
    //     c.width = srcCanvas.width;
    //     c.height = srcCanvas.height;
    //     const ctx = c.getContext('2d');
    //     ctx.drawImage(srcCanvas, 0, 0);
    //     const imageData = ctx.getImageData(0, 0, c.width, c.height);
    //     const d = imageData.data;
    //     const factor = 1.6;
    //     const intercept = 128 * (1 - factor);
    //     for (let i = 0; i < d.length; i += 4) {
    //         d[i] = Math.max(0, Math.min(255, factor * d[i] + intercept));
    //         d[i + 1] = Math.max(0, Math.min(255, factor * d[i + 1] + intercept));
    //         d[i + 2] = Math.max(0, Math.min(255, factor * d[i + 2] + intercept));
    //     }
    //     ctx.putImageData(imageData, 0, 0);
    //     return c;
    // }, []);

    // const grayscaleCanvas = useCallback((srcCanvas) => {
    //     const c = document.createElement('canvas');
    //     c.width = srcCanvas.width;
    //     c.height = srcCanvas.height;
    //     const ctx = c.getContext('2d');
    //     ctx.drawImage(srcCanvas, 0, 0);
    //     const imageData = ctx.getImageData(0, 0, c.width, c.height);
    //     const d = imageData.data;
    //     for (let i = 0; i < d.length; i += 4) {
    //         const gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
    //         // Apply contrast boost (1.8x) on grayscale
    //         const val = Math.max(0, Math.min(255, 1.8 * gray + 128 * (1 - 1.8)));
    //         d[i] = val;
    //         d[i + 1] = val;
    //         d[i + 2] = val;
    //     }
    //     ctx.putImageData(imageData, 0, 0);
    //     return c;
    // }, []);

    /**
     * Run all decode strategies on a single canvas.
     */
    // const runAllStrategies = useCallback(
    //     async (reader, canvas, w, h) => {
    //         let found = null;

    //         // 1) Raw
    //         found = await tryDecode(reader, canvas);
    //         if (found) return found;
    //         await new Promise((r) => setTimeout(r, 0));

    //         // 2) Enhanced contrast
    //         found = await tryDecode(reader, enhanceCanvas(canvas));
    //         if (found) return found;
    //         await new Promise((r) => setTimeout(r, 0));

    //         // 3) Grayscale + high contrast
    //         found = await tryDecode(reader, grayscaleCanvas(canvas));
    //         if (found) return found;
    //         await new Promise((r) => setTimeout(r, 0));

    //         // 4) Horizontal strips
    //         const hStrips = 8;
    //         const hStripH = Math.floor(h / (hStrips * 0.6 + 0.4));
    //         for (let i = 0; i < hStrips; i++) {
    //             const sy = Math.floor(i * hStripH * 0.6);
    //             const sh = Math.min(hStripH, h - sy);
    //             if (sh < 30) continue;
    //             const strip = cropCanvas(canvas, 0, sy, w, sh);
    //             found = await tryDecode(reader, strip);
    //             if (found) return found;
    //             found = await tryDecode(reader, enhanceCanvas(strip));
    //             if (found) return found;
    //         }
    //         await new Promise((r) => setTimeout(r, 0));

    //         // 5) Vertical strips
    //         const vStrips = 6;
    //         const vStripW = Math.floor(w / vStrips);
    //         for (let i = 0; i < vStrips; i++) {
    //             const sx = Math.max(0, i * vStripW - Math.floor(vStripW * 0.25));
    //             const sw = Math.min(vStripW + Math.floor(vStripW * 0.5), w - sx);
    //             if (sw < 30) continue;
    //             found = await tryDecode(reader, cropCanvas(canvas, sx, 0, sw, h));
    //             if (found) return found;
    //         }
    //         await new Promise((r) => setTimeout(r, 0));

    //         // 6) Rotated 90 degrees
    //         const rotated = rotateCanvas90(canvas);
    //         found = await tryDecode(reader, rotated);
    //         if (found) return found;
    //         found = await tryDecode(reader, enhanceCanvas(rotated));
    //         if (found) return found;
    //         await new Promise((r) => setTimeout(r, 0));

    //         // 7) Scaled up 2x
    //         const s2 = document.createElement('canvas');
    //         s2.width = Math.min(w * 2, 3840);
    //         s2.height = Math.min(h * 2, 2160);
    //         const s2Ctx = s2.getContext('2d');
    //         s2Ctx.imageSmoothingEnabled = true;
    //         s2Ctx.imageSmoothingQuality = 'high';
    //         s2Ctx.drawImage(canvas, 0, 0, s2.width, s2.height);
    //         found = await tryDecode(reader, s2);
    //         if (found) return found;
    //         await new Promise((r) => setTimeout(r, 0));

    //         return null;
    //     },
    //     [tryDecode, cropCanvas, rotateCanvas90, enhanceCanvas, grayscaleCanvas],
    // );

    const captureImage = useCallback(() => {
        return new Promise((resolve) => {
            if (fileInputRef.current) {
                try {
                    document.body.removeChild(fileInputRef.current);
                } catch { }
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
                try {
                    document.body.removeChild(input);
                } catch { }
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

    const aiDecode = useCallback(async (canvas) => {
        return new Promise((resolve) => {
            canvas.toBlob(
                async (blob) => {
                    if (!blob) {
                        resolve(null);
                        return;
                    }

                    const formData = new FormData();
                    formData.append('image', blob, 'scan.jpg');

                    try {


                        const response = await axios.post(
                            route('scanner.ai-decode'),
                            formData,
                            {
                                headers: {
                                    Accept: 'application/json',
                                },
                            }
                        );



                        const data = response.data;

                        if (!data.found) {
                            resolve(null);
                            return;
                        }

                        // Single value - iPhone IMEI, EID, UPC, Serial
                        if (data.value) {
                            resolve({
                                success: true,
                                text: data.value,
                                fields: null,
                            });
                            return;
                        }

                        // Composite - Samsung (only populated fields returned)
                        if (data.fields) {
                            const primary =
                                data.fields.imei1 ??
                                data.fields.upc ??
                                data.fields.serial ??
                                data.fields.eid ??
                                data.fields.imei2 ??
                                null;

                            resolve({
                                success: true,
                                text: primary,
                                fields: data.fields,
                            });
                            return;
                        }

                        resolve(null);
                    } catch (err) {
                        // Differentiate network errors from 419/500 server errors
                        if (err.response) {
                            console.warn('[NativeScanner] AI fallback server error:', err.response.status, err.response.data);
                        } else {
                            console.warn('[NativeScanner] AI fallback network error:', err.message);
                        }
                        resolve(null);
                    }
                },
                'image/jpeg',
                0.92,
            );
        });
    }, []);

    const decodeRegion = useCallback(
        async (imageUrl, cropRect) => {
            setIsProcessing(true);

            try {
                await new Promise((r) => setTimeout(r, 50));
                // const reader = await getReader();

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

                // No vertical expansion — use exact crop from scan box.
                // Padding was causing upward shift into adjacent barcodes.
                const cropped = document.createElement('canvas');
                cropped.width = cw;
                cropped.height = ch;
                cropped.getContext('2d').drawImage(fullCanvas, cx, cy, cw, ch, 0, 0, cw, ch);

                // const rotateByAngle = (src, angleDeg) => {
                //     const rad = (angleDeg * Math.PI) / 180;
                //     const sin = Math.abs(Math.sin(rad));
                //     const cos = Math.abs(Math.cos(rad));
                //     const newW = Math.round(src.width * cos + src.height * sin);
                //     const newH = Math.round(src.width * sin + src.height * cos);
                //     const c = document.createElement('canvas');
                //     c.width = newW;
                //     c.height = newH;
                //     const ctx = c.getContext('2d');
                //     ctx.imageSmoothingEnabled = true;
                //     ctx.imageSmoothingQuality = 'high';
                //     ctx.translate(newW / 2, newH / 2);
                //     ctx.rotate(rad);
                //     ctx.drawImage(src, -src.width / 2, -src.height / 2);
                //     return c;
                // };

                // const tryAllProcessors = async (canvas) => {
                //     let r = await tryDecode(reader, canvas);
                //     if (r) return r;
                //     r = await tryDecode(reader, enhanceCanvas(canvas));
                //     if (r) return r;
                //     r = await tryDecode(reader, grayscaleCanvas(canvas));
                //     return r;
                // };

                // const sizes = [640, 500, 800, 400, 1000];
                // let found = null;

                // for (const targetW of sizes) {
                //     const ratio = targetW / cw;
                //     const targetH = Math.max(20, Math.round(cropped.height * ratio));

                //     const scaled = document.createElement('canvas');
                //     scaled.width = targetW;
                //     scaled.height = targetH;
                //     const ctx = scaled.getContext('2d');
                //     ctx.imageSmoothingEnabled = true;
                //     ctx.imageSmoothingQuality = 'high';
                //     ctx.drawImage(cropped, 0, 0, targetW, targetH);

                //     found = await tryAllProcessors(scaled);
                //     if (found) break;

                //     await new Promise((r) => setTimeout(r, 0));
                // }

                // if (!found) {
                //     const fractions = [0.7, 0.5, 0.35];
                //     for (const frac of fractions) {
                //         const startY = Math.round(cropped.height * (1 - frac));
                //         const partH = cropped.height - startY;
                //         if (partH < 20) continue;

                //         const part = document.createElement('canvas');
                //         part.width = cw;
                //         part.height = partH;
                //         part.getContext('2d').drawImage(
                //             cropped,
                //             0,
                //             startY,
                //             cw,
                //             partH,
                //             0,
                //             0,
                //             cw,
                //             partH,
                //         );

                //         // Try at 640px wide
                //         const pW = 640;
                //         const pH = Math.max(20, Math.round(partH * (pW / cw)));
                //         const ps = document.createElement('canvas');
                //         ps.width = pW;
                //         ps.height = pH;
                //         const psCtx = ps.getContext('2d');
                //         psCtx.imageSmoothingEnabled = true;
                //         psCtx.imageSmoothingQuality = 'high';
                //         psCtx.drawImage(part, 0, 0, pW, pH);

                //         found = await tryAllProcessors(ps);
                //         if (found) break;

                //         // Also try at native width (no downscaling)
                //         found = await tryAllProcessors(part);
                //         if (found) break;

                //         await new Promise((r) => setTimeout(r, 0));
                //     }
                // }

                // if (!found) {
                //     const PROBE_W = 200;
                //     const PROBE_H = Math.max(20, Math.round((cropped.height * PROBE_W) / cw));
                //     const PAD = 60;
                //     const probeW = PROBE_W + PAD * 2;
                //     const probeH = PROBE_H + PAD * 2;

                //     const probeC = document.createElement('canvas');
                //     probeC.width = probeW;
                //     probeC.height = probeH;
                //     const probeCtx = probeC.getContext('2d');

                //     let bestAngle = 0;
                //     let bestVariance = -1;

                //     for (let deg = -22; deg <= 22; deg += 2) {
                //         probeCtx.clearRect(0, 0, probeW, probeH);
                //         probeCtx.save();
                //         probeCtx.translate(probeW / 2, probeH / 2);
                //         probeCtx.rotate((deg * Math.PI) / 180);
                //         probeCtx.drawImage(cropped, -PROBE_W / 2, -PROBE_H / 2, PROBE_W, PROBE_H);
                //         probeCtx.restore();

                //         const imgData = probeCtx.getImageData(0, 0, probeW, probeH);
                //         const d = imgData.data;

                //         let sumR = 0,
                //             sumR2 = 0;
                //         for (let y = 0; y < probeH; y++) {
                //             let rowDark = 0;
                //             for (let x = 0; x < probeW; x++) {
                //                 const i = (y * probeW + x) * 4;
                //                 const lum = (d[i] * 77 + d[i + 1] * 150 + d[i + 2] * 29) >> 8;
                //                 if (lum < 128) rowDark++;
                //             }
                //             sumR += rowDark;
                //             sumR2 += rowDark * rowDark;
                //         }
                //         const variance = sumR2 / probeH - (sumR / probeH) ** 2;

                //         if (variance > bestVariance) {
                //             bestVariance = variance;
                //             bestAngle = deg;
                //         }
                //     }

                //     if (bestAngle !== 0) {
                //         const straightened = rotateByAngle(cropped, bestAngle);

                //         // Try at 640px
                //         const sW = 640;
                //         const sH = Math.max(
                //             20,
                //             Math.round((straightened.height * sW) / straightened.width),
                //         );
                //         const sC = document.createElement('canvas');
                //         sC.width = sW;
                //         sC.height = sH;
                //         const sCx = sC.getContext('2d');
                //         sCx.imageSmoothingEnabled = true;
                //         sCx.imageSmoothingQuality = 'high';
                //         sCx.drawImage(straightened, 0, 0, sW, sH);

                //         found = await tryAllProcessors(sC);

                //         if (!found) {
                //             found = await tryAllProcessors(straightened);
                //         }

                //         if (!found) {
                //             for (const fine of [bestAngle - 1, bestAngle + 1]) {
                //                 const f = rotateByAngle(cropped, fine);
                //                 const fW = 640;
                //                 const fH = Math.max(20, Math.round((f.height * fW) / f.width));
                //                 const fC = document.createElement('canvas');
                //                 fC.width = fW;
                //                 fC.height = fH;
                //                 fC.getContext('2d').drawImage(f, 0, 0, fW, fH);
                //                 found = await tryAllProcessors(fC);
                //                 if (found) break;
                //             }
                //         }

                //         if (!found) {
                //             for (const frac of [0.6, 0.4]) {
                //                 const sY = Math.round(straightened.height * (1 - frac));
                //                 const pH = straightened.height - sY;
                //                 if (pH < 15) continue;
                //                 const pC = document.createElement('canvas');
                //                 pC.width = straightened.width;
                //                 pC.height = pH;
                //                 pC.getContext('2d').drawImage(
                //                     straightened,
                //                     0,
                //                     sY,
                //                     straightened.width,
                //                     pH,
                //                     0,
                //                     0,
                //                     straightened.width,
                //                     pH,
                //                 );
                //                 const bW = 640;
                //                 const bH = Math.max(20, Math.round((pH * bW) / straightened.width));
                //                 const bC = document.createElement('canvas');
                //                 bC.width = bW;
                //                 bC.height = bH;
                //                 bC.getContext('2d').drawImage(pC, 0, 0, bW, bH);
                //                 found = await tryAllProcessors(bC);
                //                 if (found) break;
                //                 await new Promise((r) => setTimeout(r, 0));
                //             }
                //         }
                //     }
                // }

                // if (!found) {
                //     found = await runAllStrategies(reader, cropped, cw, ch);
                // }

                // if (!found) {
                //     const aiResult = await aiDecode(cropped);

                //     if (aiResult?.success) {
                //         await playBeep();
                //         return {
                //             success: true,
                //             text: aiResult.text,
                //             fields: aiResult.fields,
                //             error: null,
                //         };
                //     }
                // }

                // if (found) {
                //     await playBeep();
                //     return {
                //         success: true,
                //         text: found,
                //         fields: null,
                //         error: null,
                //     };
                // }

                const aiResult = await aiDecode(cropped);

                if (aiResult?.success) {
                    await playBeep();
                    return {
                        success: true,
                        text: aiResult.text,
                        fields: aiResult.fields,
                        error: null,
                    };
                }

                return {
                    success: false,
                    text: null,
                    fields: null,
                    error: 'No barcode found. Make sure the barcode is fully inside the box.',
                };
            } catch (err) {
                console.error('[NativeScanner] decodeRegion error:', err);
                return { success: false, text: null, error: 'Scanning failed. Please try again.' };
            } finally {
                setIsProcessing(false);
            }
        },
        [aiDecode, playBeep],
        // [getReader, tryDecode, enhanceCanvas, grayscaleCanvas],
    );

    const releaseImage = useCallback((imageUrl) => {
        if (imageUrl)
            try {
                URL.revokeObjectURL(imageUrl);
            } catch { }
    }, []);

    useEffect(() => {
        return () => {
            if (fileInputRef.current) {
                try {
                    document.body.removeChild(fileInputRef.current);
                } catch { }
                fileInputRef.current = null;
            }
            try {
                readerRef.current?.reset?.();
            } catch { }
        };
    }, []);

    return {
        captureImage,
        decodeRegion,
        releaseImage,
        isProcessing,
        isMobile: isMobile.current,
    };
}
