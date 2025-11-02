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
    const lastToggleRef = useRef(0);

    const togglePlayPause = () => {
        const now = Date.now();
        if (now - lastToggleRef.current < 350) return; // debounce
        lastToggleRef.current = now;

        const v = videoRef.current;
        if (!v) return;
        if (v.paused || v.ended) v.play().catch(() => {});
        else v.pause();
    };

    useEffect(() => {
        const v = videoRef.current;
        if (!v) return;
        const onPlay = () => setIsPlaying(true);
        const onPause = () => setIsPlaying(false);
        v.addEventListener('play', onPlay);
        v.addEventListener('pause', onPause);
        v.addEventListener('ended', onPause);
        return () => {
            v.removeEventListener('play', onPlay);
            v.removeEventListener('pause', onPause);
            v.removeEventListener('ended', onPause);
        };
    }, []);

    // unified pointer handler
    const handlePointerUp = (e) => {
        if (!feed) return;
        e.preventDefault();
        e.stopPropagation();
        togglePlayPause();
    };

    // cancel the "ghost click" that mobile sends after touch
    useEffect(() => {
        const cancelGhostClick = (e) => {
            if (feed) e.preventDefault();
        };
        window.addEventListener('click', cancelGhostClick, true);
        return () => window.removeEventListener('click', cancelGhostClick, true);
    }, [feed]);

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
                muted
                onPointerUp={feed ? handlePointerUp : undefined}
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
