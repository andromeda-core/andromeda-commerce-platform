import React, { useEffect, useRef, useState } from 'react';

export default function VideoPlayer({
    videoUrl,
    thumbnail,
    className,
    controls,
    autoPlay,
    initialTime = 0,
    videoElementRef,
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


            if (initialTime > 0) {
                video.pause();
                video.currentTime = initialTime;

                // Wait for seek to complete
                const handleSeeked = () => {

                    video.removeEventListener('seeked', handleSeeked);

                    // NOW autoplay if needed
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

                video.addEventListener('seeked', handleSeeked);
            } else {


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
    }, [initialTime, autoPlay, videoElementRef, videoUrl]);

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
                preload="metadata"
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
