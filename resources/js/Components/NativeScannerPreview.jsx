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
    preloadedImageUrl = null,
}) {
    const { captureImage, decodeRegion, releaseImage, isProcessing } = useNativeScanner();

    const [imageUrl, setImageUrl] = useState(null);
    const [imgTransform, setImgTransform] = useState({ x: 0, y: 0, scale: 1 });

    const [boxHalfW, setBoxHalfW] = useState(scanBoxWidth / 2);
    const [boxHalfH, setBoxHalfH] = useState(scanBoxHeight / 2);
    const boxHalfWRef = useRef(boxHalfW);
    const boxHalfHRef = useRef(boxHalfH);
    useEffect(() => { boxHalfWRef.current = boxHalfW; }, [boxHalfW]);
    useEffect(() => { boxHalfHRef.current = boxHalfH; }, [boxHalfH]);

    useEffect(() => {
        setBoxHalfW(scanBoxWidth / 2);
        setBoxHalfH(scanBoxHeight / 2);
    }, [scanBoxWidth, scanBoxHeight]);

    // ── Tooltip state ──────────────────────────────────────────────
    const [showTooltips, setShowTooltips] = useState(true);
    const tooltipTimerRef = useRef(null);

    const dismissTooltips = useCallback(() => {
        setShowTooltips(false);
        if (tooltipTimerRef.current) clearTimeout(tooltipTimerRef.current);
    }, []);

    // Auto-dismiss after 5s
    useEffect(() => {
        if (isOpen && imageUrl) {
            tooltipTimerRef.current = setTimeout(() => setShowTooltips(false), 5000);
        }
        return () => { if (tooltipTimerRef.current) clearTimeout(tooltipTimerRef.current); };
    }, [isOpen, imageUrl]);

    // Reset tooltips on new image
    useEffect(() => {
        if (imageUrl) setShowTooltips(true);
    }, [imageUrl]);
    // ──────────────────────────────────────────────────────────────

    const onResultRef = useRef(onResult);
    const onCloseRef = useRef(onClose);
    const imageUrlRef = useRef(null);
    const isOpenRef = useRef(false);
    const isScanningRef = useRef(false);
    const previewContainerRef = useRef(null);
    const imgTransformRef = useRef(imgTransform);

    const touchRef = useRef({
        startX: 0, startY: 0, lastX: 0, lastY: 0,
        isPinching: false, lastPinchDist: 0, lastPinchMidX: 0, lastPinchMidY: 0,
    });

    const mouseDragRef = useRef({ dragging: false, startX: 0, startY: 0, lastX: 0, lastY: 0 });

    const cornerRef = useRef({
        active: false, corner: null,
        startX: 0, startY: 0, startHalfW: 0, startHalfH: 0,
    });

    const [errorMessage, setErrorMessage] = useState(null);
    const [showErrorMessage, setShowErrorMessage] = useState(false);

    useEffect(() => { onResultRef.current = onResult; }, [onResult]);
    useEffect(() => { onCloseRef.current = onClose; }, [onClose]);
    useEffect(() => { imageUrlRef.current = imageUrl; }, [imageUrl]);
    useEffect(() => { isOpenRef.current = isOpen; }, [isOpen]);
    useEffect(() => { imgTransformRef.current = imgTransform; }, [imgTransform]);

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
        if (!isOpen) { cleanup(); return; }

        if (preloadedImageUrl) {
            setImageUrl(preloadedImageUrl);
            return;
        }

        let cancelled = false;
        (async () => {
            const { cancelled: userCancelled, imageUrl: url } = await captureImage();
            if (cancelled) { if (url) releaseImage(url); return; }
            if (userCancelled) { onCloseRef.current?.(); return; }
            setImageUrl(url);
        })();
        return () => { cancelled = true; };
    }, [isOpen, preloadedImageUrl, captureImage, releaseImage, cleanup]);

    useEffect(() => () => {
        if (imageUrlRef.current) try { URL.revokeObjectURL(imageUrlRef.current); } catch { }
    }, []);

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

        // Clamp box here — container fully measured, guaranteed safe
        const mw = (cW / 2) - EDGE_PAD;
        const mh = (cH / 2) - EDGE_PAD;
        setBoxHalfW((prev) => Math.min(prev, Math.max(30, mw)));
        setBoxHalfH((prev) => Math.min(prev, Math.max(20, mh)));
    }, []);

    const getDistance = (a, b) =>
        Math.sqrt((a.clientX - b.clientX) ** 2 + (a.clientY - b.clientY) ** 2);

    const handleTouchStart = useCallback((e) => {
        dismissTooltips();
        if (cornerRef.current.active) return;
        const t = imgTransformRef.current;
        const rect = previewContainerRef.current?.getBoundingClientRect();
        if (e.touches.length === 1) {
            touchRef.current = {
                ...touchRef.current,
                startX: e.touches[0].clientX, startY: e.touches[0].clientY,
                lastX: t.x, lastY: t.y, isPinching: false,
            };
        } else if (e.touches.length === 2) {
            touchRef.current = {
                ...touchRef.current, isPinching: true,
                lastPinchDist: getDistance(e.touches[0], e.touches[1]),
                lastPinchMidX: (e.touches[0].clientX + e.touches[1].clientX) / 2 - (rect?.left ?? 0),
                lastPinchMidY: (e.touches[0].clientY + e.touches[1].clientY) / 2 - (rect?.top ?? 0),
            };
        }
    }, [dismissTooltips]);

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
        dismissTooltips();
        if (cornerRef.current.active) return;
        const t = imgTransformRef.current;
        mouseDragRef.current = {
            dragging: true,
            startX: e.clientX, startY: e.clientY,
            lastX: t.x, lastY: t.y,
        };
    }, [dismissTooltips]);

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
        dismissTooltips();
        const factor = e.deltaY > 0 ? 0.9 : 1.1;
        const rect = previewContainerRef.current?.getBoundingClientRect();
        if (!rect) return;
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        setImgTransform((prev) => {
            const newScale = Math.max(0.05, Math.min(15, prev.scale * factor));
            const sr = newScale / prev.scale;
            return { scale: newScale, x: mx - (mx - prev.x) * sr, y: my - (my - prev.y) * sr };
        });
    }, [dismissTooltips]);

    // ── Boundary-clamped corner resize ────────────────────────────
    const EDGE_PAD = 40; // equal padding all 4 sides — defined once

    const getMaxHalfW = useCallback(() => {
        const c = previewContainerRef.current;
        return c ? (c.clientWidth / 2) - EDGE_PAD : 9999;
    }, []);

    const getMaxHalfH = useCallback(() => {
        const c = previewContainerRef.current;
        return c ? (c.clientHeight / 2) - EDGE_PAD : 9999;
    }, []);

    const applyCornerDelta = (corner, dx, dy) => {
        const sw = cornerRef.current.startHalfW;
        const sh = cornerRef.current.startHalfH;
        const MIN_W = 30, MIN_H = 20;

        const MAX_W = getMaxHalfW();
        const MAX_H = getMaxHalfH();

        let nw = sw, nh = sh;
        if (corner === 'br') { nw = sw + dx; nh = sh + dy; }
        if (corner === 'bl') { nw = sw - dx; nh = sh + dy; }
        if (corner === 'tr') { nw = sw + dx; nh = sh - dy; }
        if (corner === 'tl') { nw = sw - dx; nh = sh - dy; }

        nw = Math.max(MIN_W, Math.min(MAX_W, nw));
        nh = Math.max(MIN_H, Math.min(MAX_H, nh));

        setBoxHalfW(nw);
        setBoxHalfH(nh);
        boxHalfWRef.current = nw;
        boxHalfHRef.current = nh;
    };
    // ─────────────────────────────────────────────────────────────

    const startCornerDrag = useCallback((corner, clientX, clientY) => {
        dismissTooltips();
        cornerRef.current = {
            active: true, corner,
            startX: clientX, startY: clientY,
            startHalfW: boxHalfWRef.current, startHalfH: boxHalfHRef.current,
        };
    }, [dismissTooltips]);

    const handleCornerMouseDown = useCallback((e, corner) => {
        e.stopPropagation(); e.preventDefault();
        startCornerDrag(corner, e.clientX, e.clientY);
    }, [startCornerDrag]);

    const handleCornerTouchStart = useCallback((e, corner) => {
        e.stopPropagation();
        startCornerDrag(corner, e.touches[0].clientX, e.touches[0].clientY);
    }, [startCornerDrag]);

    const handleCornerTouchMove = useCallback((e) => {
        e.stopPropagation(); e.preventDefault();
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
        dismissTooltips();

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

        if (!isOpenRef.current) { isScanningRef.current = false; return; }

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
                result.error || 'Could not detect a barcode. Reposition the barcode inside the box and try again.',
            );
        }
    }, [decodeRegion, releaseImage, dismissTooltips]);

    const handleRetake = useCallback(async () => {
        if (imageUrlRef.current) releaseImage(imageUrlRef.current);
        imageUrlRef.current = null;
        setImageUrl(null);
        setImgTransform({ x: 0, y: 0, scale: 1 });
        const { cancelled, imageUrl: newUrl } = await captureImage();
        if (!isOpenRef.current) { if (newUrl) releaseImage(newUrl); return; }
        if (cancelled) { onCloseRef.current?.(); return; }
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
        width: H, height: H,
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
        width: 16, height: 16,
        borderTop: pos.includes('t') ? '3px solid #60a5fa' : undefined,
        borderBottom: pos.includes('b') ? '3px solid #60a5fa' : undefined,
        borderLeft: pos.includes('l') ? '3px solid #60a5fa' : undefined,
        borderRight: pos.includes('r') ? '3px solid #60a5fa' : undefined,
        borderRadius:
            pos === 'tl' ? '2px 0 0 0' : pos === 'tr' ? '0 2px 0 0'
                : pos === 'bl' ? '0 0 0 2px' : '0 0 2px 0',
    });

    return (
        <>
            {showErrorMessage && errorMessage !== null && (
                <Toast
                    flash={{ info: errorMessage }}
                    onClosed={() => { setShowErrorMessage(false); setErrorMessage(null); }}
                />
            )}

            <div
                className="fixed inset-0 z-50 flex flex-col bg-black"
                style={{ paddingBottom: bottomOffset }}
            >
                {/* ── Header ── */}
                <div className="flex items-center justify-between flex-shrink-0 px-4 py-3 bg-black/80">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                        <h3 className="text-sm font-semibold text-white">
                            Scan:{' '}
                            <span className="text-blue-400">
                                {fieldLabel}{itemNumber ? ' — Item ' + itemNumber : ''}
                            </span>
                        </h3>
                    </div>
                    <button
                        onClick={handleClose}
                        disabled={isProcessing}
                        className="flex items-center justify-center w-8 h-8 text-gray-400 rounded-lg lg:hover:bg-white/10 lg:hover:text-white disabled:opacity-50"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* ── Preview Area ── */}
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
                    {/* Zoomable / Pannable image */}
                    <img
                        src={imageUrl}
                        alt="Captured photo for scanning"
                        onLoad={onPreviewImgLoad}
                        className="absolute top-0 left-0 pointer-events-none"
                        draggable={false}
                        style={{
                            transformOrigin: '0 0',
                            transform: `translate(${imgTransform.x}px, ${imgTransform.y}px) scale(${imgTransform.scale})`,
                            maxWidth: 'none', maxHeight: 'none',
                        }}
                    />

                    {/* Scan box overlay — centered, resizable */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div
                            className="relative"
                            style={{
                                width: bW, height: bH,
                                boxShadow: '0 0 0 9999px rgba(0,0,0,0.55)',
                                borderRadius: '4px',
                            }}
                        >
                            {/* Scan line */}
                            <div
                                className="absolute left-1 right-1 h-0.5 bg-blue-400"
                                style={{ animation: 'nativeScanLine 1.8s ease-in-out infinite', top: '10%' }}
                            />

                            {/* Corner handles */}
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

                    {/* ── Tooltips overlay ── */}
                    {showTooltips && (
                        <div
                            className="absolute inset-0 z-10 pointer-events-none"
                            style={{ animation: 'tooltipFadeIn 0.4s ease-out' }}
                        >
                            {/* Tooltip 1 — Image zoom/pan (bottom-left) */}
                            <div
                                className="absolute flex items-end gap-2"
                                style={{ bottom: '30%', left: 16 }}
                            >
                                <div
                                    className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-white"
                                    style={{
                                        background: 'rgba(0,0,0,0.72)',
                                        border: '1px solid rgba(255,255,255,0.15)',
                                        backdropFilter: 'blur(6px)',
                                        maxWidth: 150,
                                        lineHeight: 1.4,
                                    }}
                                >
                                    {/* Arrow pointing right toward image */}
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <span style={{ fontSize: 14 }}>🔍</span>
                                        <span className="font-semibold text-blue-300">Photo</span>
                                    </div>
                                    Pinch to zoom · Drag to move photo
                                    {/* Curved arrow pointing right */}
                                    <div
                                        style={{
                                            position: 'absolute',
                                            right: -18,
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            fontSize: 16,
                                            filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.8))',
                                        }}
                                    >
                                        ➜
                                    </div>
                                </div>
                            </div>

                            {/* Tooltip 2 — Corner handles (top-right, pointing toward box corner) */}
                            <div
                                className="absolute flex items-start gap-2"
                                style={{ top: '22%', right: 16 }}
                            >
                                <div
                                    className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-white text-right"
                                    style={{
                                        background: 'rgba(0,0,0,0.72)',
                                        border: '1px solid rgba(255,255,255,0.15)',
                                        backdropFilter: 'blur(6px)',
                                        maxWidth: 150,
                                        lineHeight: 1.4,
                                    }}
                                >
                                    {/* Arrow pointing left toward corner handle */}
                                    <div
                                        style={{
                                            position: 'absolute',
                                            left: -18,
                                            top: '50%',
                                            transform: 'translateY(-50%) scaleX(-1)',
                                            fontSize: 16,
                                            filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.8))',
                                        }}
                                    >
                                        ➜
                                    </div>
                                    <div className="flex items-center justify-end gap-1.5 mb-1">
                                        <span className="font-semibold text-blue-300">Scan Area</span>
                                        <span style={{ fontSize: 14 }}>⤡</span>
                                    </div>
                                    Drag blue corners to resize scan box
                                </div>
                            </div>

                            {/* Tap anywhere to dismiss */}
                            <button
                                className="absolute pointer-events-auto bottom-4 left-1/2"
                                style={{
                                    transform: 'translateX(-50%)',
                                    background: 'rgba(0,0,0,0.6)',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    borderRadius: 20,
                                    padding: '4px 14px',
                                    color: 'rgba(255,255,255,0.5)',
                                    fontSize: 11,
                                }}
                                onClick={dismissTooltips}
                            >
                                Tap to dismiss
                            </button>
                        </div>
                    )}

                    {/* Processing overlay */}
                    {isProcessing && (
                        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-black/60">
                            <div className="w-10 h-10 border-4 rounded-full animate-spin border-blue-400/30 border-t-blue-400" />
                            <p className="text-sm font-medium text-white">Scanning barcode...</p>
                        </div>
                    )}
                </div>

                {/* ── Hint ── */}
                <p className="flex-shrink-0 py-2 text-xs text-center text-gray-400">
                    Drag to pan · Pinch to zoom · Drag corners to resize box
                </p>

                {/* ── Buttons ── */}
                <div className="flex items-center justify-center flex-shrink-0 gap-3 px-4 pt-2 pb-6">
                    <button
                        onClick={handleRetake}
                        disabled={isProcessing}
                        className="flex items-center gap-2 rounded-xl bg-white/10 px-5 py-2.5 text-sm font-medium text-white transition-colors lg:hover:bg-white/20 disabled:opacity-50"
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
                        className="flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-2.5 text-sm font-semibold text-white transition-colors lg:hover:bg-blue-500 disabled:opacity-50"
                    >
                        {isProcessing ? (
                            <div className="w-5 h-5 border-2 rounded-full animate-spin border-white/30 border-t-white" />
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
                    @keyframes tooltipFadeIn {
                        from { opacity: 0; }
                        to   { opacity: 1; }
                    }
                `}</style>
            </div>
        </>
    );
}

export default memo(NativeScannerPreview);
