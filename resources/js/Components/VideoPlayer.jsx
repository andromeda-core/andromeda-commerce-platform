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
    const [isPlaying, setIsPlaying] = useState(false);
    const lastToggleTime = useRef(0);

    const togglePlayPause = () => {
        const now = Date.now();

        // Prevent rapid toggles (300ms debounce)
        if (now - lastToggleTime.current < 300) {
            return;
        }

        lastToggleTime.current = now;

        const video = videoRef.current;
        if (!video) return;

        if (video.paused || video.ended) {
            video.play().catch(() => {});
        } else {
            video.pause();
        }
    };

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);

        video.addEventListener('play', handlePlay);
        video.addEventListener('pause', handlePause);
        video.addEventListener('ended', handlePause);

        return () => {
            video.removeEventListener('play', handlePlay);
            video.removeEventListener('pause', handlePause);
            video.removeEventListener('ended', handlePause);
        };
    }, []);

    // Video click handler (for clicking outside buttons)
    const handleVideoClick = (e) => {
        if (!feed) return;
        e.preventDefault();
        e.stopPropagation();
        togglePlayPause();
    };

    // Button click handler (for clicking buttons directly)
    const handleButtonClick = (e) => {
        if (!feed) return;
        e.preventDefault();
        e.stopPropagation();
        togglePlayPause();
    };

    return (
        <div className="relative flex items-center justify-center w-full h-full select-none">
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
                onClick={feed ? handleVideoClick : undefined}
                style={{
                    WebkitTapHighlightColor: 'transparent',
                    touchAction: feed ? 'manipulation' : 'auto',
                    userSelect: 'none',
                }}
            >
                <source src={videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
            </video>

            {/* PLAY BUTTON - Shows when paused */}
            {feed && !isPlaying && (
                <div
                    className="absolute z-10 flex items-center justify-center w-20 h-20 transition-all duration-300 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none left-1/2 top-1/2 bg-black/60 backdrop-blur-sm"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                    <svg
                        className="w-10 h-10 ml-1 text-white"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path d="M8 5v14l11-7z" />
                    </svg>
                </div>
            )}

            {/* PAUSE BUTTON - Shows on hover when playing */}
            {feed && isPlaying && (
                <div
                    className="absolute z-10 flex items-center justify-center w-20 h-20 transition-all duration-300 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0 pointer-events-none left-1/2 top-1/2 bg-black/60 backdrop-blur-sm group-hover:opacity-100"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                    <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                    </svg>
                </div>
            )}
        </div>
    );
}
