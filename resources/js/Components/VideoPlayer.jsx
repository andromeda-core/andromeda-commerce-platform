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
    // const [loading, setLoading] = useState(true);
    // const loadingRef = useRef(loading);
    // const videoRef = useRef(null);
    // const playerRef = useRef(null);

    // useEffect(() => {
    //     loadingRef.current = loading;
    // }, [loading]);

    // // Initialize Plyr
    // useEffect(() => {
    //     const video = videoRef.current;
    //     if (!video) return;

    //     // Cleanup previous player
    //     if (playerRef.current) {
    //         try {
    //             playerRef.current.destroy();
    //         } catch (e) {
    //             console.warn('Player cleanup error:', e);
    //         }
    //         playerRef.current = null;
    //     }

    //     // Small delay to ensure DOM is ready
    //     const initTimer = setTimeout(() => {
    //         const player = new Plyr(video, {
    //             controls: [
    //                 'play-large',
    //                 'play',
    //                 'progress',
    //                 'current-time',
    //                 'duration',
    //                 'mute',
    //                 'volume',
    //                 'settings',
    //                 ...(fullscreen ? ['fullscreen'] : []),
    //             ],
    //             settings: ['quality', 'speed'],
    //             quality: {
    //                 default: 720,
    //                 options: [1080, 720, 480, 360],
    //             },
    //             disableContextMenu: true,
    //             hideControls: true,
    //             resetOnEnd: false,
    //             clickToPlay: true,
    //             keyboard: { focused: false, global: false },
    //             tooltips: { controls: true, seek: true },
    //             displayDuration: true,
    //             fullscreen: {
    //                 enabled: fullscreen,
    //                 fallback: true,
    //                 iosNative: false,
    //                 container: null,
    //             },
    //         });

    //         playerRef.current = player;

    //         let isMounted = true;

    //         // Loading events
    //         player.on('loadedmetadata', () => {
    //             if (isMounted) setLoading(false);
    //         });

    //         player.on('loadeddata', () => {
    //             if (isMounted) setLoading(false);
    //         });

    //         player.on('canplay', () => {
    //             if (isMounted) setLoading(false);
    //         });

    //         player.on('playing', () => {
    //             if (isMounted) setLoading(false);
    //         });

    //         player.on('waiting', () => {
    //             if (isMounted) setLoading(true);
    //         });

    //         player.on('seeked', () => {
    //             if (isMounted) setLoading(false);
    //         });

    //         // Force controls to show on initialization
    //         player.on('ready', () => {
    //             const controlsElement = player.elements.container.querySelector('.plyr__controls');
    //             if (controlsElement) {
    //                 controlsElement.style.opacity = '1';
    //                 controlsElement.style.visibility = 'visible';
    //             }
    //         });

    //         // Keyboard shortcuts
    //         const handleKeyDown = (e) => {
    //             if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
    //             if (!player || loadingRef.current) return;

    //             const key = e.key.toLowerCase();

    //             try {
    //                 switch (key) {
    //                     case 'f':
    //                         if (fullscreen && player.fullscreen.enabled) {
    //                             e.preventDefault();
    //                             player.fullscreen.toggle();
    //                         }
    //                         break;

    //                     case 'm':
    //                         e.preventDefault();
    //                         player.muted = !player.muted;
    //                         break;

    //                     case ' ':
    //                         e.preventDefault();
    //                         player.togglePlay();
    //                         break;

    //                     case 'arrowright':
    //                         e.preventDefault();
    //                         player.forward(5);
    //                         break;

    //                     case 'arrowleft':
    //                         e.preventDefault();
    //                         player.rewind(5);
    //                         break;

    //                     case 'arrowup':
    //                         e.preventDefault();
    //                         player.increaseVolume(0.1);
    //                         break;

    //                     case 'arrowdown':
    //                         e.preventDefault();
    //                         player.decreaseVolume(0.1);
    //                         break;

    //                     default:
    //                         break;
    //                 }
    //             } catch (err) {
    //                 console.warn('Keyboard shortcut error:', err);
    //             }
    //         };

    //         window.addEventListener('keydown', handleKeyDown);

    //         return () => {
    //             isMounted = false;
    //             window.removeEventListener('keydown', handleKeyDown);
    //             clearTimeout(initTimer);
    //             if (playerRef.current) {
    //                 try {
    //                     playerRef.current.destroy();
    //                 } catch (e) {
    //                     console.warn('Player cleanup error:', e);
    //                 }
    //                 playerRef.current = null;
    //             }
    //         };
    //     }, 100);

    //     return () => clearTimeout(initTimer);
    // }, [videoUrl, fullscreen]);

    const [isPlaying, setIsPlaying] = useState(false);
    const [showPlayButton, setShowPlayButton] = useState(true);
    const videoRef = useRef(null);

    const handleVideoClick = () => {
        const video = videoRef.current;
        if (!video) return;

        if (video.paused) {
            video.play();
            setIsPlaying(true);
            setShowPlayButton(false);
        } else {
            video.pause();
            setIsPlaying(false);
            setShowPlayButton(true);
        }
    };

    const handlePlay = () => {
        setIsPlaying(true);
        setShowPlayButton(false);
    };

    const handlePause = () => {
        setIsPlaying(false);
        setShowPlayButton(true);
    };

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
                onClick={feed ? handleVideoClick : undefined}
                onPlay={handlePlay}
                onPause={handlePause}
            >
                <source src={videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
            </video>

            {feed && showPlayButton && (
                <button
                    onClick={handleVideoClick}
                    className="absolute z-10 flex items-center justify-center w-20 h-20 transition-all duration-300 -translate-x-1/2 -translate-y-1/2 rounded-full left-1/2 top-1/2 bg-black/60 backdrop-blur-sm hover:scale-110 hover:bg-black/80"
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                    {!isPlaying ? (
                        <svg
                            className="w-10 h-10 ml-1 text-white"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    ) : (
                        <svg
                            className="w-10 h-10 text-white"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                        </svg>
                    )}
                </button>
            )}
        </div>
    );
}
