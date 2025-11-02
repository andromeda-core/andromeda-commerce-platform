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
    const interactionTimeRef = useRef(0);
    const isInteractingRef = useRef(false);

    const togglePlayPause = () => {
        const now = Date.now();

        // Ignore if we just toggled within 400ms
        if (now - interactionTimeRef.current < 400) {
            return;
        }

        interactionTimeRef.current = now;

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

    // Use mousedown/touchstart for immediate response
    const handleInteractionStart = (e) => {
        if (!feed) return;

        e.preventDefault();
        e.stopPropagation();

        // Mark that we're interacting
        if (isInteractingRef.current) return;
        isInteractingRef.current = true;

        togglePlayPause();
    };

    const handleInteractionEnd = (e) => {
        if (!feed) return;

        e.preventDefault();
        e.stopPropagation();

        // Release interaction lock after a delay
        setTimeout(() => {
            isInteractingRef.current = false;
        }, 100);
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
                onTouchStart={feed ? handleInteractionStart : undefined}
                onTouchEnd={feed ? handleInteractionEnd : undefined}
                onContextMenu={(e) => feed && e.preventDefault()}
                style={{
                    WebkitTapHighlightColor: 'transparent',
                    touchAction: feed ? 'manipulation' : 'auto',
                    userSelect: 'none',
                }}
            >
                <source src={videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
            </video>

            {feed && (
                <div
                    className={`pointer-events-none absolute left-1/2 top-1/2 z-10 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 backdrop-blur-sm transition-all duration-300 ${
                        isPlaying ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
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
