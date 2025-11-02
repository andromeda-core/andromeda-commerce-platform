import React, { useRef, useState, useEffect } from 'react';

export default function VideoPlayer({ videoUrl, thumbnail, className, controls, feed, autoPlay }) {
    const videoRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [showControls, setShowControls] = useState(true);

    // ✅ Direct toggle that works in Safari's "gesture" context
    const handleTap = (e) => {
        e.preventDefault();
        e.stopPropagation();

        const video = videoRef.current;
        if (!video) return;

        // Call play/pause *synchronously* inside gesture
        if (video.paused || video.ended) {
            video.play().catch((err) => console.warn('Play error:', err));
            setIsPlaying(true);
        } else {
            video.pause();
            setIsPlaying(false);
        }
    };

    // Auto-hide play icon after playback starts
    useEffect(() => {
        if (isPlaying) {
            const timer = setTimeout(() => setShowControls(false), 1000);
            return () => clearTimeout(timer);
        } else {
            setShowControls(true);
        }
    }, [isPlaying]);

    return (
        <div
            className="relative flex items-center justify-center w-full h-full select-none"
            onTouchEnd={handleTap} // ✅ Safari prefers onTouchEnd
            onClick={handleTap} // ✅ fallback for desktop
        >
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

            {feed && showControls && (
                <div
                    className="absolute z-10 flex items-center justify-center w-20 h-20 transition-all duration-300 -translate-x-1/2 -translate-y-1/2 rounded-full left-1/2 top-1/2 bg-black/60 backdrop-blur-sm hover:scale-110 active:scale-95"
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
