import React, { useCallback, useEffect, useRef, useState, memo } from 'react';
import { useNativeScanner } from '@/Hooks/useNativeScanner';
import Swal from 'sweetalert2';

function NativeScannerPreview({
    isOpen,
    fieldLabel = 'Barcode',
    itemNumber = null,
    onResult,
    onClose,
    scanBoxWidth = 400,
    scanBoxHeight = 50,
}) {
    const { captureImage, decodeRegion, releaseImage, isProcessing } = useNativeScanner();

    // ── State ──
    const [imageUrl, setImageUrl] = useState(null);
    const [imgTransform, setImgTransform] = useState({ x: 0, y: 0, scale: 1 });

    // ── Refs (prevent stale closures in callbacks) ──
    const onResultRef = useRef(onResult);
    const onCloseRef = useRef(onClose);
    const imageUrlRef = useRef(null);
    const isOpenRef = useRef(false);
    const isScanningRef = useRef(false);
    const previewContainerRef = useRef(null);
    const touchRef = useRef({ startX: 0, startY: 0, lastX: 0, lastY: 0, pinchDist: 0, isPinching: false, pinchScale: 1 });
    const mouseDragRef = useRef({ dragging: false, startX: 0, startY: 0, lastX: 0, lastY: 0 });
    const imgTransformRef = useRef(imgTransform);

    // Keep refs in sync
    useEffect(() => { onResultRef.current = onResult; }, [onResult]);
    useEffect(() => { onCloseRef.current = onClose; }, [onClose]);
    useEffect(() => { imageUrlRef.current = imageUrl; }, [imageUrl]);
    useEffect(() => { isOpenRef.current = isOpen; }, [isOpen]);
    useEffect(() => { imgTransformRef.current = imgTransform; }, [imgTransform]);

    // ── Cleanup helper ──
    const cleanup = useCallback(() => {
        if (imageUrlRef.current) {
            releaseImage(imageUrlRef.current);
            imageUrlRef.current = null;
        }
        setImageUrl(null);
        setImgTransform({ x: 0, y: 0, scale: 1 });
        isScanningRef.current = false;
    }, [releaseImage]);

    // ── Open camera when isOpen transitions to true ──
    useEffect(() => {
        if (!isOpen) {
            cleanup();
            return;
        }

        let cancelled = false;

        (async () => {
            const { cancelled: userCancelled, imageUrl: url } = await captureImage();

            if (cancelled) {
                if (url) releaseImage(url);
                return;
            }

            if (userCancelled) {
                onCloseRef.current?.();
                return;
            }

            setImageUrl(url);
        })();

        return () => { cancelled = true; };
    }, [isOpen, captureImage, releaseImage, cleanup]);

    // ── Cleanup on unmount ──
    useEffect(() => {
        return () => {
            if (imageUrlRef.current) {
                try { URL.revokeObjectURL(imageUrlRef.current); } catch { }
            }
        };
    }, []);

    // ── Image load: fit to container ──
    const onPreviewImgLoad = useCallback((e) => {
        const img = e.target;
        const container = previewContainerRef.current;
        if (!img || !container) return;

        const natW = img.naturalWidth;
        const natH = img.naturalHeight;
        const cW = container.clientWidth;
        const cH = container.clientHeight;

        const fitScale = Math.min(cW / natW, cH / natH);
        const renderedW = natW * fitScale;
        const renderedH = natH * fitScale;

        const newTransform = {
            x: (cW - renderedW) / 2,
            y: (cH - renderedH) / 2,
            scale: fitScale,
        };

        setImgTransform(newTransform);
        imgTransformRef.current = newTransform;
    }, []);

    // ── Touch handlers ──
    const getDistance = (t1, t2) =>
        Math.sqrt((t1.clientX - t2.clientX) ** 2 + (t1.clientY - t2.clientY) ** 2);

    const handleTouchStart = useCallback((e) => {
        const t = imgTransformRef.current;
        if (e.touches.length === 1) {
            touchRef.current = {
                ...touchRef.current,
                startX: e.touches[0].clientX,
                startY: e.touches[0].clientY,
                lastX: t.x,
                lastY: t.y,
                isPinching: false,
            };
        } else if (e.touches.length === 2) {
            touchRef.current = {
                ...touchRef.current,
                pinchDist: getDistance(e.touches[0], e.touches[1]),
                isPinching: true,
                pinchScale: t.scale,
            };
        }
    }, []);

    const handleTouchMove = useCallback((e) => {
        e.preventDefault();
        if (e.touches.length === 1 && !touchRef.current.isPinching) {
            const dx = e.touches[0].clientX - touchRef.current.startX;
            const dy = e.touches[0].clientY - touchRef.current.startY;
            setImgTransform((prev) => ({ ...prev, x: touchRef.current.lastX + dx, y: touchRef.current.lastY + dy }));
        } else if (e.touches.length === 2) {
            const newDist = getDistance(e.touches[0], e.touches[1]);
            const ratio = newDist / touchRef.current.pinchDist;
            const newScale = Math.max(0.05, Math.min(15, touchRef.current.pinchScale * ratio));
            setImgTransform((prev) => ({ ...prev, scale: newScale }));
        }
    }, []);

    const handleTouchEnd = useCallback((e) => {
        if (e.touches.length < 2) touchRef.current.isPinching = false;
    }, []);

    // ── Mouse handlers (desktop testing) ──
    const handleMouseDown = useCallback((e) => {
        const t = imgTransformRef.current;
        mouseDragRef.current = { dragging: true, startX: e.clientX, startY: e.clientY, lastX: t.x, lastY: t.y };
    }, []);

    const handleMouseMove = useCallback((e) => {
        if (!mouseDragRef.current.dragging) return;
        const dx = e.clientX - mouseDragRef.current.startX;
        const dy = e.clientY - mouseDragRef.current.startY;
        setImgTransform((prev) => ({ ...prev, x: mouseDragRef.current.lastX + dx, y: mouseDragRef.current.lastY + dy }));
    }, []);

    const handleMouseUp = useCallback(() => { mouseDragRef.current.dragging = false; }, []);

    const handleWheel = useCallback((e) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        setImgTransform((prev) => ({ ...prev, scale: Math.max(0.05, Math.min(15, prev.scale * delta)) }));
    }, []);

    // ── Scan: crop + decode ──
    const handleScan = useCallback(async () => {
        if (!imageUrlRef.current || !previewContainerRef.current || isScanningRef.current) return;
        isScanningRef.current = true;

        const container = previewContainerRef.current;
        const cW = container.clientWidth;
        const cH = container.clientHeight;
        const t = imgTransformRef.current;

        const boxLeft = (cW - scanBoxWidth) / 2;
        const boxTop = (cH - scanBoxHeight) / 2;

        const cropRect = {
            x: (boxLeft - t.x) / t.scale,
            y: (boxTop - t.y) / t.scale,
            width: scanBoxWidth / t.scale,
            height: scanBoxHeight / t.scale,
        };

        const result = await decodeRegion(imageUrlRef.current, cropRect);

        if (!isOpenRef.current) {
            isScanningRef.current = false;
            return;
        }

        if (result.success) {
            const url = imageUrlRef.current;
            imageUrlRef.current = null;
            setImageUrl(null);
            isScanningRef.current = false;
            releaseImage(url);
            onResultRef.current?.(result.text);
            onCloseRef.current?.();
        } else {
            isScanningRef.current = false;
            Swal.fire({
                icon: 'info',
                title: 'No Barcode Found',
                text: result.error || 'Could not detect a barcode. Reposition the barcode inside the box and try again.',
            });
        }
    }, [scanBoxWidth, scanBoxHeight, decodeRegion, releaseImage]);

    // ── Retake ──
    const handleRetake = useCallback(async () => {
        if (imageUrlRef.current) releaseImage(imageUrlRef.current);
        imageUrlRef.current = null;
        setImageUrl(null);
        setImgTransform({ x: 0, y: 0, scale: 1 });

        const { cancelled, imageUrl: newUrl } = await captureImage();

        if (!isOpenRef.current) {
            if (newUrl) releaseImage(newUrl);
            return;
        }

        if (cancelled) {
            onCloseRef.current?.();
            return;
        }

        setImageUrl(newUrl);
        imageUrlRef.current = newUrl;
    }, [captureImage, releaseImage]);

    // ── Close ──
    const handleClose = useCallback(() => {
        cleanup();
        onCloseRef.current?.();
    }, [cleanup]);

    // Don't render if not open or no image captured yet
    if (!isOpen || !imageUrl) return null;

    return (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/95">
            {/* ── Header ── */}
            <div className="flex items-center justify-between flex-shrink-0 px-4 py-3 bg-black/80">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                    <h3 className="text-sm font-semibold text-white">
                        Scan:{' '}
                        <span className="text-blue-400">
                            {fieldLabel} {itemNumber ? '— Item ' + itemNumber : ''}
                        </span>
                    </h3>
                </div>
                <button
                    onClick={handleClose}
                    disabled={isProcessing}
                    className="flex items-center justify-center w-8 h-8 text-gray-400 rounded-lg hover:text-white hover:bg-white/10 disabled:opacity-50"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* ── Image Preview Area ── */}
            <div
                ref={previewContainerRef}
                className="relative flex-1 overflow-hidden select-none touch-none"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onWheel={handleWheel}
            >
                {/* Draggable/Zoomable Image */}
                <img
                    src={imageUrl}
                    alt="Captured photo for scanning"
                    onLoad={onPreviewImgLoad}
                    className="absolute top-0 left-0 pointer-events-none"
                    draggable={false}
                    style={{
                        transformOrigin: '0 0',
                        transform: `translate(${imgTransform.x}px, ${imgTransform.y}px) scale(${imgTransform.scale})`,
                        maxWidth: 'none',
                        maxHeight: 'none',
                    }}
                />

                {/* Fixed Scan Box Overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div
                        className="relative"
                        style={{
                            width: `${scanBoxWidth}px`,
                            height: `${scanBoxHeight}px`,
                            boxShadow: '0 0 0 9999px rgba(0,0,0,0.55)',
                            borderRadius: '4px',
                        }}
                    >
                        {/* Corner Brackets */}
                        <span className="absolute w-5 h-5 border-t-[3px] border-l-[3px] border-blue-400 -top-px -left-px rounded-tl-sm" />
                        <span className="absolute w-5 h-5 border-t-[3px] border-r-[3px] border-blue-400 -top-px -right-px rounded-tr-sm" />
                        <span className="absolute w-5 h-5 border-b-[3px] border-l-[3px] border-blue-400 -bottom-px -left-px rounded-bl-sm" />
                        <span className="absolute w-5 h-5 border-b-[3px] border-r-[3px] border-blue-400 -bottom-px -right-px rounded-br-sm" />

                        {/* Scan Line */}
                        <div
                            className="absolute left-1 right-1 h-0.5 bg-blue-400"
                            style={{ animation: 'nativeScanLine 1.8s ease-in-out infinite', top: '10%' }}
                        />
                    </div>
                </div>

                {/* Processing Overlay */}
                {isProcessing && (
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-black/60">
                        <div className="w-10 h-10 border-4 rounded-full border-blue-400/30 border-t-blue-400 animate-spin" />
                        <p className="text-sm font-medium text-white">Scanning barcode...</p>
                    </div>
                )}
            </div>

            {/* ── Instructions ── */}
            <p className="flex-shrink-0 py-2 text-xs text-center text-gray-400">
                Drag to position barcode inside the box · Pinch to zoom
            </p>

            {/* ── Action Buttons ── */}
            <div className="flex items-center justify-center flex-shrink-0 gap-3 px-4 pt-2 pb-6">
                <button
                    onClick={handleRetake}
                    disabled={isProcessing}
                    className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-white/10 rounded-xl hover:bg-white/20 transition-colors disabled:opacity-50"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
                    </svg>
                    Retake
                </button>
                <button
                    onClick={handleScan}
                    disabled={isProcessing}
                    className="flex items-center gap-2 px-8 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-500 transition-colors disabled:opacity-50"
                >
                    {isProcessing ? (
                        <div className="w-5 h-5 border-2 rounded-full border-white/30 border-t-white animate-spin" />
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z" />
                        </svg>
                    )}
                    {isProcessing ? 'Scanning...' : 'Scan'}
                </button>
            </div>

            <style>{`
                @keyframes nativeScanLine {
                    0%   { top: 10%; opacity: 1; }
                    45%  { top: 85%; opacity: 1; }
                    50%  { top: 85%; opacity: 0; }
                    51%  { top: 10%; opacity: 0; }
                    55%  { top: 10%; opacity: 1; }
                    100% { top: 10%; opacity: 1; }
                }
            `}</style>
        </div>
    );
}

export default memo(NativeScannerPreview);
