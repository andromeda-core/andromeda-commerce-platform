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

    const handleClick = (e) => {
        if (!feed) return;
        e.preventDefault();
        e.stopPropagation();
        togglePlayPause();
    };

    return (
        <div
            className="relative flex items-center justify-center w-full h-full select-none"
            onClick={handleClick}
        >
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
                style={{
                    WebkitTapHighlightColor: 'transparent',
                    touchAction: feed ? 'manipulation' : 'auto',
                    userSelect: 'none',
                }}
            >
                <source src={videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
            </video>
        </div>
    );
}
