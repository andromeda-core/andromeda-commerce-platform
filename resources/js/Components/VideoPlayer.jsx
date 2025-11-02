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
    const toggleLock = useRef(false);

    const togglePlayPause = () => {
        if (toggleLock.current) return;
        toggleLock.current = true;
        setTimeout(() => (toggleLock.current = false), 300);

        const v = videoRef.current;
        if (!v) return;

        if (v.paused || v.ended) v.play().catch(() => {});
        else v.pause();
    };

    useEffect(() => {
        const v = videoRef.current;
        if (!v) return;
        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);

        v.addEventListener('play', handlePlay);
        v.addEventListener('pause', handlePause);
        v.addEventListener('ended', handlePause);

        return () => {
            v.removeEventListener('play', handlePlay);
            v.removeEventListener('pause', handlePause);
            v.removeEventListener('ended', handlePause);
        };
    }, []);

    const handleInteraction = (e) => {
        if (!feed) return;
        e.preventDefault();
        e.stopPropagation();

        setTimeout(() => {
            if (toggleLock.current) return;
            togglePlayPause();
        }, 50);
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
                onTouchStart={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                }}
                onClick={(e) => {
                    e.preventDefault();
                }}
                onPointerUp={feed ? handleInteraction : undefined}
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
