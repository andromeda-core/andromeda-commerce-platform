import React, { useCallback, useEffect, useRef, useState, memo } from 'react';
import { useNativeScanner } from '@/Hooks/useNativeScanner';
import Toast from './Toast';
import { QrCodeIcon } from 'lucide-react';

function NativeScannerPreview({
    isOpen,
    fieldLabel = 'Barcode',
    itemNumber = null,
    onResult,
    onClose,
    scanBoxWidth = 400,
    scanBoxHeight = 50,
    bottomOffset = 0,
}) {
    const { captureImage, decodeRegion, releaseImage, isProcessing } = useNativeScanner();

    const [imageUrl, setImageUrl] = useState(null);
    const [imgTransform, setImgTransform] = useState({ x: 0, y: 0, scale: 1 });

    const [boxHalfW, setBoxHalfW] = useState(scanBoxWidth / 2);
    const [boxHalfH, setBoxHalfH] = useState(scanBoxHeight / 2);
    const boxHalfWRef = useRef(boxHalfW);
    const boxHalfHRef = useRef(boxHalfH);
    useEffect(() => {
        boxHalfWRef.current = boxHalfW;
    }, [boxHalfW]);
    useEffect(() => {
        boxHalfHRef.current = boxHalfH;
    }, [boxHalfH]);

    // Reset box size when props change
    useEffect(() => {
        setBoxHalfW(scanBoxWidth / 2);
        setBoxHalfH(scanBoxHeight / 2);
    }, [scanBoxWidth, scanBoxHeight]);

    const onResultRef = useRef(onResult);
    const onCloseRef = useRef(onClose);
    const imageUrlRef = useRef(null);
    const isOpenRef = useRef(false);
    const isScanningRef = useRef(false);
    const previewContainerRef = useRef(null);
    const imgTransformRef = useRef(imgTransform);

    const touchRef = useRef({
        startX: 0,
        startY: 0,
        lastX: 0,
        lastY: 0,
        isPinching: false,
        lastPinchDist: 0,
        lastPinchMidX: 0,
        lastPinchMidY: 0,
    });

    // Mouse drag state for pan
    const mouseDragRef = useRef({ dragging: false, startX: 0, startY: 0, lastX: 0, lastY: 0 });

    // Corner resize state
    const cornerRef = useRef({
        active: false,
        corner: null,
        startX: 0,
        startY: 0,
        startHalfW: 0,
        startHalfH: 0,
    });

    const [errorMessage, setErrorMessage] = useState(null);
    const [showErrorMessage, setShowErrorMessage] = useState(false);

    useEffect(() => {
        onResultRef.current = onResult;
    }, [onResult]);
    useEffect(() => {
        onCloseRef.current = onClose;
    }, [onClose]);
    useEffect(() => {
        imageUrlRef.current = imageUrl;
    }, [imageUrl]);
    useEffect(() => {
        isOpenRef.current = isOpen;
    }, [isOpen]);
    useEffect(() => {
        imgTransformRef.current = imgTransform;
    }, [imgTransform]);

    const cleanup = useCallback(() => {
        if (imageUrlRef.current) {
            releaseImage(imageUrlRef.current);
            imageUrlRef.current = null;
        }
        setImageUrl(null);
        setImgTransform({ x: 0, y: 0, scale: 1 });
        isScanningRef.current = false;
    }, [releaseImage]);

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
        return () => {
            cancelled = true;
        };
    }, [isOpen, captureImage, releaseImage, cleanup]);

    useEffect(
        () => () => {
            if (imageUrlRef.current)
                try {
                    URL.revokeObjectURL(imageUrlRef.current);
                } catch {}
        },
        [],
    );

    const onPreviewImgLoad = useCallback((e) => {
        const img = e.target;
        const container = previewContainerRef.current;
        if (!img || !container) return;
        const cW = container.clientWidth;
        const cH = container.clientHeight;
        const fitScale = Math.min(cW / img.naturalWidth, cH / img.naturalHeight);
        const newT = {
            x: (cW - img.naturalWidth * fitScale) / 2,
            y: (cH - img.naturalHeight * fitScale) / 2,
            scale: fitScale,
        };
        setImgTransform(newT);
        imgTransformRef.current = newT;
    }, []);

    const getDistance = (a, b) =>
        Math.sqrt((a.clientX - b.clientX) ** 2 + (a.clientY - b.clientY) ** 2);

    const handleTouchStart = useCallback((e) => {
        if (cornerRef.current.active) return;
        const t = imgTransformRef.current;
        const rect = previewContainerRef.current?.getBoundingClientRect();
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
                isPinching: true,
                lastPinchDist: getDistance(e.touches[0], e.touches[1]),
                lastPinchMidX:
                    (e.touches[0].clientX + e.touches[1].clientX) / 2 - (rect?.left ?? 0),
                lastPinchMidY: (e.touches[0].clientY + e.touches[1].clientY) / 2 - (rect?.top ?? 0),
            };
        }
    }, []);

    const handleTouchMove = useCallback((e) => {
        e.preventDefault();
        if (cornerRef.current.active) return;

        if (e.touches.length === 1 && !touchRef.current.isPinching) {
            const dx = e.touches[0].clientX - touchRef.current.startX;
            const dy = e.touches[0].clientY - touchRef.current.startY;
            setImgTransform((prev) => ({
                ...prev,
                x: touchRef.current.lastX + dx,
                y: touchRef.current.lastY + dy,
            }));
        } else if (e.touches.length === 2) {
            const rect = previewContainerRef.current?.getBoundingClientRect();
            const newDist = getDistance(e.touches[0], e.touches[1]);
            const newMidX = (e.touches[0].clientX + e.touches[1].clientX) / 2 - (rect?.left ?? 0);
            const newMidY = (e.touches[0].clientY + e.touches[1].clientY) / 2 - (rect?.top ?? 0);
            const distRatio = newDist / touchRef.current.lastPinchDist;
            const t = imgTransformRef.current;

            const newScale = Math.max(0.05, Math.min(15, t.scale * distRatio));

            // Incremental: scale around previous midpoint, then pan by midpoint delta
            // Formula: newX = newMidX - (lastMidX - t.x) * distRatio
            const newX = newMidX - (touchRef.current.lastPinchMidX - t.x) * distRatio;
            const newY = newMidY - (touchRef.current.lastPinchMidY - t.y) * distRatio;

            const newT = { x: newX, y: newY, scale: newScale };
            setImgTransform(newT);
            imgTransformRef.current = newT;

            touchRef.current.lastPinchDist = newDist;
            touchRef.current.lastPinchMidX = newMidX;
            touchRef.current.lastPinchMidY = newMidY;
        }
    }, []);

    const handleTouchEnd = useCallback((e) => {
        if (e.touches.length < 2) {
            touchRef.current.isPinching = false;

            if (e.touches.length === 1) {
                const t = imgTransformRef.current;
                touchRef.current.startX = e.touches[0].clientX;
                touchRef.current.startY = e.touches[0].clientY;
                touchRef.current.lastX = t.x;
                touchRef.current.lastY = t.y;
            }
        }
    }, []);

    const handleMouseDown = useCallback((e) => {
        if (cornerRef.current.active) return;
        const t = imgTransformRef.current;
        mouseDragRef.current = {
            dragging: true,
            startX: e.clientX,
            startY: e.clientY,
            lastX: t.x,
            lastY: t.y,
        };
    }, []);

    const handleMouseMove = useCallback((e) => {
        if (cornerRef.current.active) {
            const dx = e.clientX - cornerRef.current.startX;
            const dy = e.clientY - cornerRef.current.startY;
            applyCornerDelta(cornerRef.current.corner, dx, dy);
            return;
        }
        if (!mouseDragRef.current.dragging) return;
        const dx = e.clientX - mouseDragRef.current.startX;
        const dy = e.clientY - mouseDragRef.current.startY;
        setImgTransform((prev) => ({
            ...prev,
            x: mouseDragRef.current.lastX + dx,
            y: mouseDragRef.current.lastY + dy,
        }));
    }, []);

    const handleMouseUp = useCallback(() => {
        mouseDragRef.current.dragging = false;
        cornerRef.current.active = false;
    }, []);

    const handleWheel = useCallback((e) => {
        e.preventDefault();
        const factor = e.deltaY > 0 ? 0.9 : 1.1;
        const rect = previewContainerRef.current?.getBoundingClientRect();
        if (!rect) return;
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        setImgTransform((prev) => {
            const newScale = Math.max(0.05, Math.min(15, prev.scale * factor));
            const sr = newScale / prev.scale;
            return {
                scale: newScale,
                x: mx - (mx - prev.x) * sr,
                y: my - (my - prev.y) * sr,
            };
        });
    }, []);

    const applyCornerDelta = (corner, dx, dy) => {
        const sw = cornerRef.current.startHalfW;
        const sh = cornerRef.current.startHalfH;
        const MIN_W = 30,
            MIN_H = 20;
        let nw = sw,
            nh = sh;
        if (corner === 'br') {
            nw = Math.max(MIN_W, sw + dx);
            nh = Math.max(MIN_H, sh + dy);
        }
        if (corner === 'bl') {
            nw = Math.max(MIN_W, sw - dx);
            nh = Math.max(MIN_H, sh + dy);
        }
        if (corner === 'tr') {
            nw = Math.max(MIN_W, sw + dx);
            nh = Math.max(MIN_H, sh - dy);
        }
        if (corner === 'tl') {
            nw = Math.max(MIN_W, sw - dx);
            nh = Math.max(MIN_H, sh - dy);
        }
        setBoxHalfW(nw);
        setBoxHalfH(nh);
        boxHalfWRef.current = nw;
        boxHalfHRef.current = nh;
    };

    const startCornerDrag = useCallback((corner, clientX, clientY) => {
        cornerRef.current = {
            active: true,
            corner,
            startX: clientX,
            startY: clientY,
            startHalfW: boxHalfWRef.current,
            startHalfH: boxHalfHRef.current,
        };
    }, []);

    const handleCornerMouseDown = useCallback(
        (e, corner) => {
            e.stopPropagation();
            e.preventDefault();
            startCornerDrag(corner, e.clientX, e.clientY);
        },
        [startCornerDrag],
    );

    const handleCornerTouchStart = useCallback(
        (e, corner) => {
            e.stopPropagation();
            startCornerDrag(corner, e.touches[0].clientX, e.touches[0].clientY);
        },
        [startCornerDrag],
    );

    const handleCornerTouchMove = useCallback((e) => {
        e.stopPropagation();
        e.preventDefault();
        if (!cornerRef.current.active) return;
        const dx = e.touches[0].clientX - cornerRef.current.startX;
        const dy = e.touches[0].clientY - cornerRef.current.startY;
        applyCornerDelta(cornerRef.current.corner, dx, dy);
    }, []);

    const handleCornerTouchEnd = useCallback((e) => {
        e.stopPropagation();
        cornerRef.current.active = false;
    }, []);

    const handleScan = useCallback(async () => {
        if (!imageUrlRef.current || !previewContainerRef.current || isScanningRef.current) return;
        isScanningRef.current = true;

        const container = previewContainerRef.current;
        const cW = container.clientWidth;
        const cH = container.clientHeight;
        const t = imgTransformRef.current;
        const hw = boxHalfWRef.current;
        const hh = boxHalfHRef.current;

        const boxLeft = cW / 2 - hw;
        const boxTop = cH / 2 - hh;

        const cropRect = {
            x: (boxLeft - t.x) / t.scale,
            y: (boxTop - t.y) / t.scale,
            width: (hw * 2) / t.scale,
            height: (hh * 2) / t.scale,
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
            onResultRef.current?.(result.text, { fields: result.fields ?? null });
            onCloseRef.current?.();
        } else {
            isScanningRef.current = false;
            setShowErrorMessage(true);
            setErrorMessage(
                result.error ||
                    'Could not detect a barcode. Reposition the barcode inside the box and try again.',
            );
        }
    }, [decodeRegion, releaseImage]);

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

    const handleClose = useCallback(() => {
        cleanup();
        onCloseRef.current?.();
    }, [cleanup]);

    if (!isOpen || !imageUrl) return null;

    const H = 24;
    const bW = boxHalfW * 2;
    const bH = boxHalfH * 2;

    const cornerStyle = (pos) => ({
        position: 'absolute',
        width: H,
        height: H,
        top: pos.includes('t') ? -H / 2 : undefined,
        bottom: pos.includes('b') ? -H / 2 : undefined,
        left: pos.includes('l') ? -H / 2 : undefined,
        right: pos.includes('r') ? -H / 2 : undefined,
        pointerEvents: 'auto',
        cursor: pos === 'tl' || pos === 'br' ? 'nwse-resize' : 'nesw-resize',
        display: 'flex',
        alignItems: pos.includes('t') ? 'flex-start' : 'flex-end',
        justifyContent: pos.includes('l') ? 'flex-start' : 'flex-end',
    });

    const borderStyle = (pos) => ({
        width: 16,
        height: 16,
        borderTop: pos.includes('t') ? '3px solid #60a5fa' : undefined,
        borderBottom: pos.includes('b') ? '3px solid #60a5fa' : undefined,
        borderLeft: pos.includes('l') ? '3px solid #60a5fa' : undefined,
        borderRight: pos.includes('r') ? '3px solid #60a5fa' : undefined,
        borderRadius:
            pos === 'tl'
                ? '2px 0 0 0'
                : pos === 'tr'
                  ? '0 2px 0 0'
                  : pos === 'bl'
                    ? '0 0 0 2px'
                    : '0 0 2px 0',
    });

    return (
        <>
            {showErrorMessage && errorMessage !== null && (
                <Toast
                    flash={{ info: errorMessage }}
                    onClosed={() => {
                        setShowErrorMessage(false);
                        setErrorMessage(null);
                    }}
                />
            )}

            <div
                className="fixed inset-0 z-50 flex flex-col bg-black"
                style={{ paddingBottom: bottomOffset }}
            >
                {/* ── Header ── */}
                <div className="flex flex-shrink-0 items-center justify-between bg-black/80 px-4 py-3">
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
                        <h3 className="text-sm font-semibold text-white">
                            Scan:{' '}
                            <span className="text-blue-400">
                                {fieldLabel}
                                {itemNumber ? ' — Item ' + itemNumber : ''}
                            </span>
                        </h3>
                    </div>
                    <button
                        onClick={handleClose}
                        disabled={isProcessing}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-white/10 hover:text-white disabled:opacity-50"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="size-5"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6 18 18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>

                {/* ── Preview Area ── */}
                <div
                    ref={previewContainerRef}
                    className="relative flex-1 touch-none select-none overflow-hidden"
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onWheel={handleWheel}
                >
                    {/* Zoomable/Pannable image */}
                    <img
                        src={imageUrl}
                        alt="Captured photo for scanning"
                        onLoad={onPreviewImgLoad}
                        className="pointer-events-none absolute left-0 top-0"
                        draggable={false}
                        style={{
                            transformOrigin: '0 0',
                            transform: `translate(${imgTransform.x}px, ${imgTransform.y}px) scale(${imgTransform.scale})`,
                            maxWidth: 'none',
                            maxHeight: 'none',
                        }}
                    />

                    {/* Scan box overlay — centered, resizable */}
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                        <div
                            className="relative"
                            style={{
                                width: bW,
                                height: bH,
                                boxShadow: '0 0 0 9999px rgba(0,0,0,0.55)',
                                borderRadius: '4px',
                            }}
                        >
                            {/* Scan line */}
                            <div
                                className="absolute left-1 right-1 h-0.5 bg-blue-400"
                                style={{
                                    animation: 'nativeScanLine 1.8s ease-in-out infinite',
                                    top: '10%',
                                }}
                            />

                            {/* ── Corner handles ── */}
                            {['tl', 'tr', 'bl', 'br'].map((pos) => (
                                <div
                                    key={pos}
                                    style={cornerStyle(pos)}
                                    onMouseDown={(e) => handleCornerMouseDown(e, pos)}
                                    onTouchStart={(e) => handleCornerTouchStart(e, pos)}
                                    onTouchMove={handleCornerTouchMove}
                                    onTouchEnd={handleCornerTouchEnd}
                                >
                                    <div style={borderStyle(pos)} />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Processing overlay */}
                    {isProcessing && (
                        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-black/60">
                            <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-400/30 border-t-blue-400" />
                            <p className="text-sm font-medium text-white">Scanning barcode...</p>
                        </div>
                    )}
                </div>

                {/* ── Hint ── */}
                <p className="flex-shrink-0 py-2 text-center text-xs text-gray-400">
                    Drag to pan · Pinch to zoom · Drag corners to resize box
                </p>

                {/* ── Buttons ── */}
                <div className="flex flex-shrink-0 items-center justify-center gap-3 px-4 pb-6 pt-2">
                    <button
                        onClick={handleRetake}
                        disabled={isProcessing}
                        className="flex items-center gap-2 rounded-xl bg-white/10 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/20 disabled:opacity-50"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="size-5"
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
                        Retake
                    </button>
                    <button
                        onClick={handleScan}
                        disabled={isProcessing}
                        className="flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-500 disabled:opacity-50"
                    >
                        {isProcessing ? (
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        ) : (
                            <QrCodeIcon className="size-5" />
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
        </>
    );
}

export default memo(NativeScannerPreview);
