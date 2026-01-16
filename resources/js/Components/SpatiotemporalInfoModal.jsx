import { useTranslation } from '@/Hooks/useTranslation';
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Spinner from './Spinner';

export default function SpatiotemporalModal({ onClose, post }) {
    const [isDragging, setIsDragging] = useState(false);
    const [startY, setStartY] = useState(0);
    const [currentY, setCurrentY] = useState(0);
    const [translateY, setTranslateY] = useState(0);
    const [isMapLoading, setIsMapLoading] = useState(true);
    const modalRef = useRef(null);
    const dragThreshold = 150;

    // Detect if device is mobile
    const isMobile = window.innerWidth <= 1024;
    const { __ } = useTranslation();

    // Touch handlers
    const handleTouchStart = (e) => {
        setIsDragging(true);
        setStartY(e.touches[0].clientY);
        setCurrentY(e.touches[0].clientY);
    };

    const handleTouchMove = (e) => {
        if (!isDragging) return;

        const touchY = e.touches[0].clientY;
        const diff = touchY - startY;

        // Only allow dragging downwards
        if (diff > 0) {
            setCurrentY(touchY);
            setTranslateY(diff);
        }
    };

    const handleTouchEnd = () => {
        setIsDragging(false);

        // If dragged more than threshold, close modal
        if (translateY > dragThreshold) {
            // Animate out
            setTranslateY(window.innerHeight);
            setTimeout(() => {
                onClose();
            }, 50);
        } else {
            // Snap back to original position
            setTranslateY(0);
        }
    };


    if (!isMobile) {
        return createPortal(
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in-up">

                {/* Backdrop with blur effect */}
                <div
                    className="fixed inset-0 transition-opacity duration-300 bg-black/60 backdrop-blur-sm"
                    onClick={onClose}
                    aria-hidden="true"
                />

                {/* Modal Container */}
                <div
                    className="relative w-full max-w-2xl transition-all duration-300 transform rounded-md bg-main-text-dark dark:bg-main-text-light animate-scale-in"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="spatiotemporal-modal"
                >

                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 ">
                        <h3
                            id="spatiotemporal-modal"
                            className="text-lg font-semibold text-main-text-light dark:text-main-text-dark"
                        >
                            {__('Spatiotemporal Information')}
                        </h3>
                        <button
                            onClick={onClose}
                            className="text-main-text-light dark:text-main-text-dark hover:text-main-text-light/80 dark:text-main-text-dark/80  rounded-full p-1.5 transition-colors duration-200"
                            aria-label="Close modal"
                        >
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>

                    {/* Content */}
                    <div className="px-6 py-5">

                        {/* Map Section */}
                        <div className="mb-6">
                            <div className="relative w-full h-56 overflow-hidden rounded-md">

                                {isMapLoading && (
                                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-50 dark:bg-gray-800">
                                        <div className="flex flex-col items-center gap-3">
                                            <Spinner />
                                            <p className="text-sm text-gray-600 dark:text-gray-400">{__('Loading map')}...</p>
                                        </div>
                                    </div>
                                )}

                                <iframe
                                    title="Location Map"
                                    src={`https://maps.google.com/maps?q=${post?.latitude},${post?.longitude}&z=15&output=embed`}
                                    className="w-full h-full border-0"
                                    loading="lazy"
                                    onLoad={() => setIsMapLoading(false)}
                                />
                            </div>
                        </div>

                        {/* Information Grid */}
                        <div className="space-y-4">

                            {/* Location */}
                            <div className="flex items-start gap-3 p-3">
                                <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 rounded-full">


                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-8 h-8 text-main-text-light dark:text-main-text-dark">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                                    </svg>

                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-main-text-light dark:text-main-text-dark mb-0.5">{__('Location')}</p>
                                    <p className="text-sm text-sub-text-light dark:text-sub-text-dark">
                                        {post?.location_name}
                                    </p>
                                    <p className="mt-1 text-xs text-sub-text-light dark:text-sub-text-dark">
                                        {post?.latitude}° N, {post?.longitude}° E
                                    </p>
                                </div>
                            </div>

                            {/* Vertical */}
                            <div className="flex items-start gap-3 p-3 rounded-md">
                                <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 rounded-full">

                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-8 h-8 text-main-text-light dark:text-main-text-dark">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
                                    </svg>

                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-main-text-light dark:text-main-text-dark mb-0.5">{__('Vertical')}</p>
                                    <p className="text-sm text-sub-text-light dark:text-sub-text-dark">
                                        {!post?.floor?.name ? 'N/A' : __('Floor') + post?.floor?.name}
                                    </p>

                                </div>
                            </div>

                            {/* Time */}
                            <div className="flex items-start gap-3 p-3 rounded-md">
                                <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 rounded-full">


                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-8 h-8 text-main-text-light dark:text-main-text-dark">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                    </svg>

                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-main-text-light dark:text-main-text-dark mb-0.5">{__('Time')}</p>
                                    <p className="text-sm text-sub-text-light dark:text-sub-text-dark">
                                        {post?.added_at} {__('at')} {post?.created_at_time}
                                    </p>

                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>,
            document.getElementById('modal-root') || document.body
        );
    }

    // Mobile native-style bottom sheet
    return (
        createPortal(
            <div className="fixed inset-0 z-[100] animate-fadeIn">
                {/* Backdrop */}
                <div
                    className="fixed inset-0 transition-opacity duration-300 bg-black"
                    style={{
                        opacity: isDragging ? Math.max(0.4 - (translateY / 500), 0) : 0.4
                    }}
                    onClick={onClose}
                    aria-hidden="true"
                />

                {/* Bottom Sheet */}
                <div
                    ref={modalRef}
                    className="fixed bottom-0 left-0 right-0 bg-main-text-dark dark:bg-main-text-light rounded-t-3xl shadow-2xl max-h-[85vh] flex flex-col transition-transform"
                    style={{
                        transform: `translateY(${translateY}px)`,
                        transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
                    }}
                    role="dialog"
                    aria-modal="true"
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >
                    {/* Drag Handle */}
                    <div className="flex justify-center pt-3 pb-2">
                        <div className="w-10 h-1 rounded-full bg-surface-3-light dark:bg-surface-3-dark" />
                    </div>

                    {/* Header */}
                    <div className="flex items-center justify-between px-5 py-3">
                        <h3 className="text-base font-semibold text-main-text-light dark:text-main-text-dark">
                            {__('Spatiotemporal Information')}
                        </h3>

                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 px-5 py-4 overflow-y-auto">

                        {/* Map */}
                        <div className="mb-5">
                            <div className="relative w-full h-56 overflow-hidden shadow-md rounded-2xl">
                                {isMapLoading && (
                                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-surface-1-light dark:bg-surface-1-dark">
                                        <div className="flex flex-col items-center gap-3">
                                            <Spinner />
                                            <p className="text-sm text-gray-600 dark:text-gray-400">{__('Loading map')}...</p>
                                        </div>
                                    </div>
                                )}
                                <iframe
                                    title="Location Map"
                                    src={`https://maps.google.com/maps?q=${post?.latitude},${post?.longitude}&z=15&output=embed`}
                                    className="w-full h-full border-0"
                                    loading="lazy"
                                    onLoad={() => setIsMapLoading(false)}
                                />
                            </div>
                        </div>

                        {/* Information Cards */}
                        <div className="space-y-4">

                            {/* Location */}
                            <div className="flex items-start gap-3 ">
                                <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 rounded-full">


                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-8 h-8 text-main-text-light dark:text-main-text-dark">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                                    </svg>

                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-main-text-light dark:text-main-text-dark mb-0.5">{__('Location')}</p>
                                    <p className="text-sm text-sub-text-light dark:text-sub-text-dark">
                                        {post?.location_name}
                                    </p>
                                    <p className="mt-1 text-xs text-sub-text-light dark:text-sub-text-dark">
                                        {post?.latitude}° N, {post?.longitude}° E
                                    </p>
                                </div>
                            </div>

                            {/* Vertical */}
                            <div className="flex items-start gap-3 ">
                                <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 rounded-full">

                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-8 h-8 text-main-text-light dark:text-main-text-dark">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
                                    </svg>

                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-main-text-light dark:text-main-text-dark mb-0.5">{__('Vertical')}</p>
                                    <p className="text-sm text-sub-text-light dark:text-sub-text-dark">
                                        {!post?.floor?.name ? 'N/A' : __('Floor') + post?.floor?.name}
                                    </p>

                                </div>
                            </div>

                            {/* Time */}
                            <div className="flex items-start gap-3">
                                <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 rounded-full">


                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-8 h-8 text-main-text-light dark:text-main-text-dark">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                    </svg>

                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-main-text-light dark:text-main-text-dark mb-0.5">{__('Time')}</p>
                                    <p className="text-sm text-sub-text-light dark:text-sub-text-dark">
                                        {post?.added_at} {__('at')} {post?.created_at_time}
                                    </p>

                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Safe area for iOS home indicator */}
                    <div className="h-6" />

                </div>

                <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        /* Disable pull-to-refresh on mobile */
        body {
          overscroll-behavior-y: contain;
        }
      `}</style>
            </div>,
            document.getElementById('modal-root') || document.body
        )
    );
}
