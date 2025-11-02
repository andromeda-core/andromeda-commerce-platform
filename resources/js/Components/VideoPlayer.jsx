import useWindowSize from '@/Hooks/useWindowSize';
import React, { useEffect, useRef, useState } from 'react';

export default function VideoPlayer({ videoUrl, thumbnail, className, controls, feed, autoPlay }) {
    const windowSize = useWindowSize();

    const videoRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const hideTimeout = useRef(null);

    const handleTap = () => {
        const video = videoRef.current;
        if (!video) return;

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

    return (
        <div className="relative flex items-center justify-center w-full h-full select-none">
            <video
                ref={videoRef}
                className={`w-full rounded-lg ${className || ''}`}
                playsInline
                preload="metadata"
                // controls={feed ? false : controls}
                autoPlay={autoPlay}
                controls={controls}
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
        </div>
    );
}
