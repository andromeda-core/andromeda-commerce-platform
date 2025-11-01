import React, { useEffect, useRef, useState } from 'react';
import Plyr from 'plyr';
import 'plyr/dist/plyr.css';
import Spinner from './Spinner';

export default function VideoPlayer({ videoUrl, thumbnail, className, fullscreen = false }) {
    const [loading, setLoading] = useState(true);
    const loadingRef = useRef(loading);
    const videoRef = useRef(null);
    const playerRef = useRef(null);

    useEffect(() => {
        loadingRef.current = loading;
    }, [loading]);

    // Initialize Plyr
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        // Cleanup previous player
        if (playerRef.current) {
            try {
                playerRef.current.destroy();
            } catch (e) {
                console.warn('Player cleanup error:', e);
            }
            playerRef.current = null;
        }

        // Small delay to ensure DOM is ready
        const initTimer = setTimeout(() => {
            const player = new Plyr(video, {
                controls: [
                    'play-large',
                    'play',
                    'progress',
                    'current-time',
                    'duration',
                    'mute',
                    'volume',
                    'settings',
                    ...(fullscreen ? ['fullscreen'] : []),
                ],
                settings: ['quality', 'speed'],
                quality: {
                    default: 720,
                    options: [1080, 720, 480, 360],
                },
                disableContextMenu: true,
                hideControls: true,
                resetOnEnd: false,
                clickToPlay: true,
                keyboard: { focused: false, global: false },
                tooltips: { controls: true, seek: true },
                displayDuration: true,
                fullscreen: {
                    enabled: fullscreen,
                    fallback: true,
                    iosNative: false,
                    container: null,
                },
            });

            playerRef.current = player;

            let isMounted = true;

            // Loading events
            player.on('loadedmetadata', () => {
                if (isMounted) setLoading(false);
            });

            player.on('loadeddata', () => {
                if (isMounted) setLoading(false);
            });

            player.on('canplay', () => {
                if (isMounted) setLoading(false);
            });

            player.on('playing', () => {
                if (isMounted) setLoading(false);
            });

            player.on('waiting', () => {
                if (isMounted) setLoading(true);
            });

            player.on('seeked', () => {
                if (isMounted) setLoading(false);
            });

            // Force controls to show on initialization
            player.on('ready', () => {
                const controlsElement = player.elements.container.querySelector('.plyr__controls');
                if (controlsElement) {
                    controlsElement.style.opacity = '1';
                    controlsElement.style.visibility = 'visible';
                }
            });

            // Keyboard shortcuts
            const handleKeyDown = (e) => {
                if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
                if (!player || loadingRef.current) return;

                const key = e.key.toLowerCase();

                try {
                    switch (key) {
                        case 'f':
                            if (fullscreen && player.fullscreen.enabled) {
                                e.preventDefault();
                                player.fullscreen.toggle();
                            }
                            break;

                        case 'm':
                            e.preventDefault();
                            player.muted = !player.muted;
                            break;

                        case ' ':
                            e.preventDefault();
                            player.togglePlay();
                            break;

                        case 'arrowright':
                            e.preventDefault();
                            player.forward(5);
                            break;

                        case 'arrowleft':
                            e.preventDefault();
                            player.rewind(5);
                            break;

                        case 'arrowup':
                            e.preventDefault();
                            player.increaseVolume(0.1);
                            break;

                        case 'arrowdown':
                            e.preventDefault();
                            player.decreaseVolume(0.1);
                            break;

                        default:
                            break;
                    }
                } catch (err) {
                    console.warn('Keyboard shortcut error:', err);
                }
            };

            window.addEventListener('keydown', handleKeyDown);

            return () => {
                isMounted = false;
                window.removeEventListener('keydown', handleKeyDown);
                clearTimeout(initTimer);
                if (playerRef.current) {
                    try {
                        playerRef.current.destroy();
                    } catch (e) {
                        console.warn('Player cleanup error:', e);
                    }
                    playerRef.current = null;
                }
            };
        }, 100);

        return () => clearTimeout(initTimer);
    }, [videoUrl, fullscreen]);

    return (
        <div className="relative flex items-center justify-center w-full h-full">
            {/* Video Player */}
            <video
                // ref={videoRef}
                className={`w-full rounded-lg ${className || ''}`}
                controls
                controlsList="nodownload noremoteplayback"
                playsInline
                preload="metadata"
                poster={thumbnail}
                muted
            >
                <source src={videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
            </video>
        </div>
    );
}
