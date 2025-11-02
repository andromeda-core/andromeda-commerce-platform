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
    const lastInteractionRef = useRef(null);
    const lastTouchRef = useRef(0);
    const videoRef = useRef(null);

    const [showPlayButton, setShowPlayButton] = useState(true);

    const handleVideoInteraction = (e) => {
        if (!feed) return;
        e.preventDefault();
        e.stopPropagation();

        const video = videoRef.current;
        if (!video) return;

        if (video.paused) {
            setShowPlayButton(false);
            video.play();
        } else {
            video.pause();
            setShowPlayButton(true);
        }
    };

    return (
        <div className="relative flex items-center justify-center w-full h-full">
            {/* Video Player */}
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
                    if (!feed) return;
                    lastTouchRef.current = Date.now();
                    handleVideoInteraction(e);
                }}
                onClick={(e) => {
                    if (!feed) return;
                    // Ignore click if touch happened recently
                    if (Date.now() - lastTouchRef.current < 500) {
                        e.preventDefault();
                        return;
                    }
                    handleVideoInteraction(e);
                }}
                style={{
                    WebkitTapHighlightColor: 'transparent',
                    touchAction: feed ? 'manipulation' : 'auto',
                }}
            >
                <source src={videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
            </video>

            {/* Custom Play Button */}
            {feed && showPlayButton && (
                <button
                    onTouchStart={handleVideoInteraction}
                    onClick={(e) => {
                        if (Date.now() - lastInteractionRef.current < 300) {
                            e.preventDefault();
                            return;
                        }
                        handleVideoInteraction(e);
                    }}
                    className="absolute z-10 flex items-center justify-center w-20 h-20 transition-all duration-300 -translate-x-1/2 -translate-y-1/2 rounded-full left-1/2 top-1/2 bg-black/60 backdrop-blur-sm hover:scale-110 hover:bg-black/80"
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
