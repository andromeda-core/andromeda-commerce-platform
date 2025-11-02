import React, { useEffect, useRef, useState } from 'react';

export default function VideoPlayer({ videoUrl, thumbnail, className, controls, feed, autoPlay }) {
    const videoRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [showControls, setShowControls] = useState(true);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        // Attach a native (non-React) event listener for Safari
        const handleNativeTap = () => {
            if (video.paused || video.ended) {
                video.play().catch((err) => console.warn('Play error:', err));
                setIsPlaying(true);
            } else {
                video.pause();
                setIsPlaying(false);
            }
        };

        // Attach directly to the element (bypassing React)
        video.addEventListener('touchend', handleNativeTap);
        video.addEventListener('click', handleNativeTap);

        return () => {
            video.removeEventListener('touchend', handleNativeTap);
            video.removeEventListener('click', handleNativeTap);
        };
    }, []);

    // Hide overlay after play
    useEffect(() => {
        if (isPlaying) {
            const t = setTimeout(() => setShowControls(false), 1000);
            return () => clearTimeout(t);
        } else {
            setShowControls(true);
        }
    }, [isPlaying]);

    return (
        <div className="relative flex items-center justify-center w-full h-full select-none">
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
                    className="absolute z-10 flex items-center justify-center w-20 h-20 transition-all duration-300 -translate-x-1/2 -translate-y-1/2 rounded-full left-1/2 top-1/2 bg-black/60 backdrop-blur-sm"
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
