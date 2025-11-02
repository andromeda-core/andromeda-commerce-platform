import React, { useEffect, useRef, useState } from 'react';

export default function VideoPlayer({ videoUrl, thumbnail, className, controls, feed, autoPlay }) {
    const videoRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const hideTimeout = useRef(null);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleTap = () => {
            // Clear any pending hide timer so overlay always shows briefly again
            clearTimeout(hideTimeout.current);
            setShowControls(true);

            if (video.paused || video.ended) {
                video.play().catch((err) => console.warn('Play error:', err));
                setIsPlaying(true);
            } else {
                video.pause();
                setIsPlaying(false);
            }

            // Re-hide overlay after 1.2s
            hideTimeout.current = setTimeout(() => {
                if (!video.paused) setShowControls(false);
            }, 1200);
        };

        // ✅ Attach native listener (not React synthetic)
        video.addEventListener('touchstart', handleTap, { passive: true });
        video.addEventListener('click', handleTap);

        return () => {
            clearTimeout(hideTimeout.current);
            video.removeEventListener('touchstart', handleTap);
            video.removeEventListener('click', handleTap);
        };
    }, []);

    return (
        <div className="relative flex items-center justify-center w-full h-full select-none">
            {/* ✅ Always leave an overlay layer that catches touches */}
            <div
                className="absolute inset-0 z-20 cursor-pointer"
                style={{ background: 'transparent' }}
                onTouchStart={(e) => e.preventDefault()} // prevents native tap delay
            />

            <video
                ref={videoRef}
                className={`w-full rounded-lg ${className || ''}`}
                playsInline
                muted
                preload="metadata"
                controls={feed ? false : controls}
                poster={thumbnail}
                crossOrigin="anonymous"
                style={{
                    WebkitTapHighlightColor: 'transparent',
                    touchAction: 'manipulation',
                    userSelect: 'none',
                    backgroundColor: 'black',
                }}
            >
                <source src={videoUrl} type="video/mp4" />
            </video>

            {/* ✅ Show overlay briefly when tapped or paused */}
            {feed && showControls && (
                <div
                    className="absolute z-30 flex items-center justify-center w-20 h-20 transition-all duration-300 -translate-x-1/2 -translate-y-1/2 rounded-full left-1/2 top-1/2 bg-black/60 backdrop-blur-sm"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                    {isPlaying ? (
                        <svg
                            className="w-10 h-10 text-white"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                        </svg>
                    ) : (
                        <svg
                            className="w-10 h-10 ml-1 text-white"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    )}
                </div>
            )}
        </div>
    );
}
