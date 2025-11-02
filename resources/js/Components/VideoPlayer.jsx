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
    const [isPlaying, setIsPlaying] = useState(false);
    const [showPlayButton, setShowPlayButton] = useState(true);
    const videoRef = useRef(null);
    const lastInteractionRef = useRef(0);

    const togglePlayPause = () => {
        const video = videoRef.current;
        if (!video) return;

        const now = Date.now();
        // Prevent rapid toggling within 300ms
        if (now - lastInteractionRef.current < 300) {
            return;
        }
        lastInteractionRef.current = now;

        if (video.paused) {
            video.play().catch((err) => console.warn('Play failed:', err));
        } else {
            video.pause();
        }
    };

    const handleVideoInteraction = (e) => {
        if (!feed) return;

        e.preventDefault();
        e.stopPropagation();
        togglePlayPause();
    };

    const handlePlay = () => {
        setIsPlaying(true);
        setShowPlayButton(false);
    };

    const handlePause = () => {
        setIsPlaying(false);
        setShowPlayButton(true);
    };

    // Sync state with video events
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        video.addEventListener('pause', handlePause);
        video.addEventListener('play', handlePlay);

        return () => {
            video.removeEventListener('pause', handlePause);
            video.removeEventListener('play', handlePlay);
        };
    }, []);

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
                // Use onTouchStart for immediate response on mobile
                onTouchStart={feed ? handleVideoInteraction : undefined}
                // Click handler with touch detection
                onClick={
                    feed
                        ? (e) => {
                              // If touch was just used, ignore click
                              if (Date.now() - lastInteractionRef.current < 300) {
                                  e.preventDefault();
                                  return;
                              }
                              handleVideoInteraction(e);
                          }
                        : undefined
                }
                onPlay={handlePlay}
                onPause={handlePause}
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
