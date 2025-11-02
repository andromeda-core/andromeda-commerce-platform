import React, { useEffect, useRef, useState } from 'react';

export default function VideoPlayer({
    videoUrl,
    thumbnail,
    className,
    fullscreen = false,
    autoPlay,
    controls,
    feed,
}) {
    const videoRef = useRef(null);
    const [showPlayButton, setShowPlayButton] = useState(true);
    const isTogglingRef = useRef(false);

    // Toggle with debounce to prevent double-firing
    const togglePlayPause = () => {
        // Prevent rapid consecutive toggles
        if (isTogglingRef.current) return;

        isTogglingRef.current = true;
        setTimeout(() => {
            isTogglingRef.current = false;
        }, 300);

        const video = videoRef.current;
        if (!video) return;

        if (video.paused) {
            video.play().catch((err) => console.warn('Play error:', err));
        } else {
            video.pause();
        }
    };

    // Handle play event
    const handlePlay = () => {
        setShowPlayButton(false);
    };

    // Handle pause event
    const handlePause = () => {
        setShowPlayButton(true);
    };

    // Sync with video events
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        video.addEventListener('play', handlePlay);
        video.addEventListener('pause', handlePause);
        video.addEventListener('ended', handlePause);

        return () => {
            video.removeEventListener('play', handlePlay);
            video.removeEventListener('pause', handlePause);
            video.removeEventListener('ended', handlePause);
        };
    }, []);

    // Single handler for all interactions
    const handleInteraction = (e) => {
        if (!feed) return;

        e.preventDefault();
        e.stopPropagation();

        togglePlayPause();
    };

    return (
        <div className="relative flex items-center justify-center w-full h-full">
            {/* Video Player - NO click handlers when button is showing */}
            <video
                ref={videoRef}
                className={`w-full rounded-lg ${className || ''}`}
                controlsList="nodownload noremoteplayback"
                controls={feed ? false : controls}
                autoPlay={autoPlay}
                playsInline
                preload="metadata"
                poster={thumbnail}
                crossOrigin="anonymous"
                // Only allow video clicks when playing (button hidden)
                onTouchEnd={feed && !showPlayButton ? handleInteraction : undefined}
                onClick={feed && !showPlayButton ? handleInteraction : undefined}
                style={{
                    WebkitTapHighlightColor: 'transparent',
                    touchAction: feed ? 'manipulation' : 'auto',
                }}
            >
                <source src={videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
            </video>

            {/* Custom Play Button - Only shows when paused */}
            {feed && showPlayButton && (
                <button
                    onTouchEnd={handleInteraction}
                    onClick={handleInteraction}
                    className="absolute z-10 flex items-center justify-center w-20 h-20 transition-all duration-300 -translate-x-1/2 -translate-y-1/2 rounded-full left-1/2 top-1/2 bg-black/60 backdrop-blur-sm hover:scale-110 hover:bg-black/80 active:scale-95"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                    aria-label="Play video"
                >
                    <svg
                        className="w-10 h-10 ml-1 text-white"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path d="M8 5v14l11-7z" />
                    </svg>
                </button>
            )}
        </div>
    );
}
