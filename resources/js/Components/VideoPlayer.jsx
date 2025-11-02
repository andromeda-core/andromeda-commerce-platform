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
    const lastActionRef = useRef(0);

    // Toggle logic that respects play state and avoids double triggers
    const togglePlayPause = () => {
        const now = Date.now();
        if (now - lastActionRef.current < 300) return; // debounce
        lastActionRef.current = now;

        const video = videoRef.current;
        if (!video) return;

        if (video.paused || video.ended) {
            video.play().catch((err) => console.warn('Play error:', err));
        } else {
            video.pause();
        }
    };

    // Sync play/pause state
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

    // Unified interaction handler for feed
    const handleInteraction = (e) => {
        if (!feed) return;
        e.preventDefault();
        e.stopPropagation();
        togglePlayPause();
    };

    return (
        <div className="relative flex items-center justify-center w-full h-full">
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
                muted
                onClick={feed ? handleInteraction : undefined}
                onTouchEnd={feed ? handleInteraction : undefined}
                style={{
                    WebkitTapHighlightColor: 'transparent',
                    touchAction: feed ? 'manipulation' : 'auto',
                }}
            >
                <source src={videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
            </video>

            {/* Play icon overlay */}
            {feed && (
                <div
                    className={`pointer-events-none absolute left-1/2 top-1/2 z-10 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 backdrop-blur-sm transition-all duration-300 ${
                        isPlaying ? 'opacity-0' : 'opacity-100'
                    }`}
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
        </div>
    );
}
