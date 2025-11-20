import React, { useEffect, useRef, useState } from 'react';

export default function VideoPlayer({
    videoUrl,
    thumbnail,
    className,
    controls,
    autoPlay,

    videoElementRef,
    Preload,
}) {



    const videoRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const hideTimeout = useRef(null);
    const shouldAutoPlayRef = useRef(false);

    // Apply initial time when video metadata loads
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        shouldAutoPlayRef.current = autoPlay;

        const handleLoadedMetadata = () => {


            if (shouldAutoPlayRef.current) {
                video.muted = true;
                video.play()
                    .then(() => {

                        setIsPlaying(true);
                    })
                    .catch((err) => {
                        console.error('❌ Autoplay failed:', err.message);
                        setIsPlaying(false);
                    });
            }
        };

        video.addEventListener('loadedmetadata', handleLoadedMetadata);

        // Expose video element to parent via ref
        if (videoElementRef) {
            videoElementRef.current = video;
        }

        return () => {
            video.removeEventListener('loadedmetadata', handleLoadedMetadata);
            if (videoElementRef) {
                videoElementRef.current = null;
            }
        };
    }, [autoPlay, videoElementRef, videoUrl]);

    const handleTap = () => {
        const video = videoRef.current;
        if (!video) return;

        clearTimeout(hideTimeout.current);
        setShowControls(true);

        if (video.paused || video.ended) {
            video.play().catch((err) => console.warn('Play error:', err));
            setIsPlaying(true);
        } else {
            video.pause();
            setIsPlaying(false);
        }

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
                preload={Preload}
                controlsList="nodownload noremoteplayback"
                controls={controls}
                poster={thumbnail}
                crossOrigin="anonymous"
                style={{
                    WebkitTapHighlightColor: 'transparent',
                    touchAction: 'manipulation',
                    userSelect: 'none',
                }}
            >
                <source src={videoUrl} type="video/mp4" />
            </video>
        </div>
    );
}
