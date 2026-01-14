import React, { useEffect, useMemo, useRef, useState } from 'react';
import SunSpinner from './SunSpinner';
import { useTranslation } from '@/Hooks/useTranslation';
import { useVideoStore } from '@/Hooks/useVideoStore';

export default function CustomizedVideoPlayer({
    videoUrl,
    thumbnail,
    className,
    autoPlay,
    videoElementRef,
    loaded,
    OnLoadedMetaData,
    Preload,
    slug,
}) {

    const instanceId = useMemo(() => {
        return `${slug}-${videoUrl}`;
    }, [slug, videoUrl]);

    const { __ } = useTranslation();

    const videoRef = useRef(null);
    const containerRef = useRef(null);
    const controlsRef = useRef(null);
    const progressBarRef = useRef(null);
    const isAutoPlayingRef = useRef(false);
    const playVerifyTimerRef = useRef(null);
    const previousSlugRef = useRef(null);

    const [isMuted, setIsMuted] = useState(autoPlay ? true : false);
    const [showVolumeSlider, setShowVolumeSlider] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const [isPlaying, setIsPlaying] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [hasEnded, setHasEnded] = useState(false);

    const [isBuffering, setIsBuffering] = useState(false);

    const hideTimeout = useRef(null);

    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isDragging, setIsDragging] = useState(false);

    const [showActions, setShowActions] = useState(false);

    /* -------------------- STORE -------------------- */
    const registerVideo = useVideoStore(s => s.registerVideo);
    const unregisterVideo = useVideoStore(s => s.unregisterVideo);

    /* -------------------- AUTOPLAY HANDLER -------------------- */
    const attemptAutoPlay = async () => {
        const video = videoRef.current;
        if (!video || !autoPlay) {
            return;
        }


        isAutoPlayingRef.current = true;

        try {
            // Reset video state
            video.currentTime = 0;
            video.muted = true;
            video.playsInline = true;
            video.setAttribute('playsinline', '');

            setIsMuted(true);
            setIsPlaying(false);
            setHasEnded(false);
            setProgress(0);
            setCurrentTime(0);

            // Wait for video to be ready
            await new Promise((resolve) => {
                if (video.readyState >= 2) {
                    resolve();
                } else {
                    video.addEventListener('loadeddata', resolve, { once: true });
                    setTimeout(resolve, 1000); // Fallback
                }
            });

            // Attempt play
            await video.play();


            // Verify playback started
            setTimeout(() => {
                if (video && !video.paused && !video.ended) {
                    setIsPlaying(true);

                } else {
                    setIsPlaying(false);
                    console.error('[AutoPlay] Playback failed for:', slug);
                }
            }, 150);

        } catch (error) {
            console.error('[AutoPlay] Failed for', slug, ':', error.name, error.message);
            setIsPlaying(false);
        } finally {
            setTimeout(() => {
                isAutoPlayingRef.current = false;
            }, 500);
        }
    };

    /* -------------------- REGISTER PLAYER -------------------- */
    const playerMethodsRef = useRef({
        play: async () => {
            const video = videoRef.current;
            if (!video) return;

            try {
                video.playsInline = true;
                video.setAttribute('playsinline', '');
                await video.play();
            } catch (e) {
                if (e.name === 'NotAllowedError') {
                    video.muted = true;
                    setIsMuted(true);
                    await video.play();
                }
            }
        },
        pause: () => videoRef.current?.pause(),
        getElement: () => videoRef.current,
        isPaused: () => !videoRef.current || videoRef.current.paused,
        getSlug: () => slug,
        getInstanceId: () => instanceId,
    });

    /* -------------------- SLUG CHANGE HANDLER - UNREGISTER OLD, REGISTER NEW -------------------- */
    useEffect(() => {

        if (!autoPlay) return;

        const currentSlug = slug;
        const previousSlug = previousSlugRef.current;


        // Agar slug change hua hai
        if (previousSlug !== null && previousSlug !== currentSlug && autoPlay) {
            // Old video ko unregister karo
            const oldInstanceId = `${previousSlug}-${videoUrl}`;
            unregisterVideo(oldInstanceId);

            // Pause old video if exists
            const video = videoRef.current;
            if (video) {
                video.pause();
                video.currentTime = 0;
            }
        }

        // Update previous slug reference
        previousSlugRef.current = currentSlug;

        // Reset state for new video
        isAutoPlayingRef.current = false;
        setIsPlaying(false);
        setHasEnded(false);
        setProgress(0);
        setCurrentTime(0);
        setShowControls(true);
        setIsMuted(autoPlay ? true : false);

        // Cleanup timers
        clearTimeout(playVerifyTimerRef.current);
        clearTimeout(hideTimeout.current);

        // Register new video
        if (autoPlay) {
            registerVideo(instanceId, playerMethodsRef.current);
        }

        // Cleanup on unmount
        return () => {
            if (autoPlay) {
                unregisterVideo(instanceId);
            }
        };
    }, [slug, instanceId, videoUrl, autoPlay]);

    /* -------------------- AUTOPLAY TRIGGER -------------------- */
    useEffect(() => {

        const video = videoRef.current;
        if (!video || !autoPlay) {
            return;
        }

        if (!autoPlay) {
            // Ensure video is paused and shows thumbnail
            if (video) {
                video.pause();
                video.currentTime = 0;
            }
            return;
        }



        // Small delay to ensure video element is fully ready
        const timer = setTimeout(() => {
            attemptAutoPlay();
        }, 150);

        return () => {
            clearTimeout(timer);
        };
    }, [slug, autoPlay]);

    /* -------------------- EVENT LISTENERS -------------------- */
    // Force pause event
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleForcePause = () => {
            const video = videoRef.current;
            if (video) {
                video.pause();
                setShowControls(true);
                clearTimeout(hideTimeout.current);
            }
        };

        container.addEventListener('forcePause', handleForcePause);
        return () => container.removeEventListener('forcePause', handleForcePause);
    }, []);

    // Video metadata and events
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleLoadedMetadata = () => {
            setDuration(video.duration);
        };

        const handleEnded = () => {
            setHasEnded(true);
            setIsPlaying(false);
            clearTimeout(hideTimeout.current);
        };

        const handleWaiting = () => setIsBuffering(true);
        const handleCanPlay = () => setIsBuffering(false);
        const handlePlaying = () => setIsBuffering(false);
        const handleStalled = () => setIsBuffering(true);

        const handlePause = () => {
            if (!isAutoPlayingRef.current) {
                setShowControls(true);
            }
        };

        video.addEventListener('loadedmetadata', handleLoadedMetadata);
        video.addEventListener('ended', handleEnded);
        video.addEventListener('pause', handlePause);
        video.addEventListener('waiting', handleWaiting);
        video.addEventListener('canplay', handleCanPlay);
        video.addEventListener('playing', handlePlaying);
        video.addEventListener('stalled', handleStalled);

        if (videoElementRef) {
            if (typeof videoElementRef === 'function') {
                videoElementRef(video);
            } else if (videoElementRef.current !== undefined) {
                videoElementRef.current = video;
            }
        }

        return () => {
            video.removeEventListener('loadedmetadata', handleLoadedMetadata);
            video.removeEventListener('ended', handleEnded);
            video.removeEventListener('pause', handlePause);
            video.removeEventListener('waiting', handleWaiting);
            video.removeEventListener('canplay', handleCanPlay);
            video.removeEventListener('playing', handlePlaying);
            video.removeEventListener('stalled', handleStalled);

            if (videoElementRef) {
                videoElementRef.current = null;
            }
        };
    }, [videoElementRef, slug]);

    // Click outside for actions dropdown
    useEffect(() => {
        if (!showActions) return;

        const handleClickOutside = (event) => {
            const isClickOutside = !event.target.closest('.actions-dropdown') &&
                !event.target.closest('.ellipsis-button');

            if (isClickOutside) {
                setShowActions(false);
            }
        };

        setTimeout(() => {
            document.addEventListener('mousedown', handleClickOutside);
        }, 0);

        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showActions]);

    // Progress bar dragging
    useEffect(() => {
        if (isDragging) {
            const handleMouseMove = (e) => updateProgressFromEvent(e);
            const handleTouchMove = (e) => updateProgressFromEvent(e.touches[0]);
            const handleMouseUp = () => setIsDragging(false);
            const handleTouchEnd = () => setIsDragging(false);

            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            document.addEventListener('touchmove', handleTouchMove);
            document.addEventListener('touchend', handleTouchEnd);

            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
                document.removeEventListener('touchmove', handleTouchMove);
                document.removeEventListener('touchend', handleTouchEnd);
            };
        }
    }, [isDragging, duration]);

    // Video playback sync
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleTimeUpdate = () => {
            if (isDragging) return;
            setCurrentTime(video.currentTime);
            setProgress((video.currentTime / video.duration) * 100);
        };

        const handlePlay = () => {
            clearTimeout(playVerifyTimerRef.current);

            playVerifyTimerRef.current = setTimeout(() => {
                const video = videoRef.current;
                if (!video) return;

                if (!video.paused && !video.ended) {
                    setIsPlaying(true);
                    setHasEnded(false);
                } else {
                    setIsPlaying(false);
                    console.error('[Video] Play event but not playing for slug:', slug);
                }
            }, 100);
        };

        const handlePauseEvent = () => {
            if (isAutoPlayingRef.current) {
                console.warn('[Video] Pause ignored during autoplay for slug:', slug);
                return;
            }

            setIsPlaying(false);
            setShowControls(true);
        };

        video.addEventListener('timeupdate', handleTimeUpdate);
        video.addEventListener('play', handlePlay);
        video.addEventListener('pause', handlePauseEvent);

        return () => {
            video.removeEventListener('timeupdate', handleTimeUpdate);
            video.removeEventListener('play', handlePlay);
            video.removeEventListener('pause', handlePauseEvent);
        };
    }, [isDragging, slug]);

    // Fullscreen tracking
    useEffect(() => {
        const handleFullscreenChange = () => {
            const isCurrentlyFullscreen = !!(
                document.fullscreenElement ||
                document.webkitFullscreenElement ||
                document.mozFullScreenElement ||
                document.msFullscreenElement
            );

            setIsFullscreen(isCurrentlyFullscreen);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.addEventListener('mozfullscreenchange', handleFullscreenChange);
        document.addEventListener('MSFullscreenChange', handleFullscreenChange);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
            document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
            document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
        };
    }, []);

    /* -------------------- CONTROL FUNCTIONS -------------------- */
    const togglePlayPause = () => {
        const video = videoRef.current;
        if (!video) return;

        clearTimeout(hideTimeout.current);

        if (video.paused || hasEnded) {
            if (hasEnded) {
                video.currentTime = 0;
                setHasEnded(false);
            }
            video.play().catch(() => { });
            setShowControls(true);

            hideTimeout.current = setTimeout(() => {
                setShowControls(false);
            }, 100);
        } else {
            video.pause();
            setShowControls(true);
        }
    };

    const seek = (sec) => {
        const video = videoRef.current;
        if (!video) return;

        video.currentTime = Math.max(0, Math.min(video.duration, video.currentTime + sec));

        clearTimeout(hideTimeout.current);
        setShowControls(true);

        if (isPlaying) {
            hideTimeout.current = setTimeout(() => setShowControls(false), 500);
        }
    };

    const formatTime = (seconds) => {
        if (!seconds || isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleVideoClick = (e) => {
        togglePlayPause();
    };

    const handleContainerInteraction = (e) => {
        if (isPlaying) {
            clearTimeout(hideTimeout.current);
            setShowControls(true);

            const isControlElement = e.target.closest('button') ||
                e.target.closest('svg') ||
                e.target.tagName === 'BUTTON' ||
                e.target.tagName === 'svg' ||
                e.target.tagName === 'path' ||
                e.target.tagName === 'text' ||
                e.target.tagName === 'circle';

            if (isControlElement) {
                clearTimeout(hideTimeout.current);
                setShowControls(true);
                return;
            }

            hideTimeout.current = setTimeout(() => {
                setShowControls(false);
            }, 1000);
        }
    };

    const updateProgressFromEvent = (e) => {
        const video = videoRef.current;
        const progressBar = progressBarRef.current;

        if (!video || !progressBar) return;

        const rect = progressBar.getBoundingClientRect();
        const clientX = e.clientX || e.pageX;
        const pos = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        const newTime = pos * video.duration;

        setProgress(pos * 100);
        setCurrentTime(newTime);
        video.currentTime = newTime;
    };

    const handleProgressBarMouseDown = (e) => {
        e.preventDefault();
        setIsDragging(true);
        updateProgressFromEvent(e);
    };

    const handleProgressBarTouchStart = (e) => {
        e.preventDefault();
        setIsDragging(true);
        updateProgressFromEvent(e.touches[0]);
    };

    const handleProgressBarClick = (e) => {
        if (!isDragging) {
            updateProgressFromEvent(e);
        }
    };

    const toggleMute = () => {
        const video = videoRef.current;
        if (!video) return;

        if (isMuted) {
            video.muted = false;
            video.volume = 1;
            setIsMuted(false);
        } else {
            video.muted = true;
            setIsMuted(true);
        }
    };

    const toggleFullscreen = () => {
        const container = containerRef.current;
        if (!container) return;

        if (!document.fullscreenElement) {
            container.requestFullscreen?.() ||
                container.webkitRequestFullscreen?.() ||
                container.mozRequestFullScreen?.();
        } else {
            document.exitFullscreen?.() ||
                document.webkitExitFullscreen?.() ||
                document.mozCancelFullScreen?.();
        }
    };


    return (
        <div
            ref={containerRef}
            data-video-player="true"
            className="relative w-full h-full select-none video-player"
            onMouseEnter={(e) => handleContainerInteraction(e)}
            onMouseMove={(e) => handleContainerInteraction(e)}
            onTouchStart={(e) => handleContainerInteraction(e)}
        >
            {/* Video Container */}
            <div className="relative flex items-center justify-center w-full h-full pb-10 ">
                {/* Video with click handler */}
                <video
                    ref={videoRef}
                    className={`w-full h-full ${!isFullscreen && className || 'object-contain'}`}
                    playsInline
                    preload={Preload}
                    controlsList="nodownload noremoteplayback"
                    controls={false}
                    poster={thumbnail}
                    crossOrigin="anonymous"
                    muted={isMuted}
                    onLoadedMetadata={OnLoadedMetaData}
                    onClick={handleVideoClick}
                    style={{
                        WebkitTapHighlightColor: 'transparent',
                        touchAction: 'manipulation',
                        userSelect: 'none',
                    }}
                >
                    <source src={videoUrl} type="video/mp4" />
                </video>

                {/* BUFFERING  */}
                {isBuffering && isPlaying && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-black/20 ">
                            <SunSpinner color='#fff' />
                        </div>
                    </div>
                )}

                {/* Center Controls Overlay */}
                <div
                    className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 pointer-events-none ${showControls || !isPlaying || hasEnded
                        ? 'opacity-100'
                        : 'opacity-0'
                        }`}
                >
                    {/* When video is NOT playing or has ended, show only play button */}
                    {((!isPlaying || hasEnded)) && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                togglePlayPause();
                            }}
                            className="flex items-center justify-center w-20 h-20 text-white transition-all rounded-full shadow-lg pointer-events-auto bg-deepcharcoal/70 hover:bg-deepcharcoal/80 backdrop-blur-sm active:scale-95"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-10 fill-white">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
                            </svg>
                        </button>
                    )}

                    {/* When video IS playing AND controls visible, show pause and seek controls */}
                    {!isBuffering && isPlaying && showControls && !hasEnded && (
                        <div
                            ref={controlsRef}
                            className="flex items-center justify-center gap-12 pointer-events-auto"
                        >
                            {/* Rewind 10s */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    seek(-10);
                                }}
                                className="relative flex items-center justify-center w-16 h-16 transition-transform active:scale-90"
                            >
                                <svg
                                    fill="#000000"
                                    viewBox="0 0 32 32"
                                    xmlns="http://www.w3.org/2000/svg"
                                    className='font-bold fill-white size-10'
                                >
                                    <path d="M6,18A10,10,0,1,0,16,8h-4v5L6,7l6-6V6h4A12,12,0,1,1,4,18Z" />
                                    <path d="M19.63,22.13a2.84,2.84,0,0,1-1.28-.27,2.44,2.44,0,0,1-.89-.77,3.57,3.57,0,0,1-.52-1.25,7.83,7.83,0,0,1-.17-1.68,7.69,7.69,0,0,1,.17-1.68,3.57,3.57,0,0,1,.52-1.25,2.44,2.44,0,0,1,.89-.77,2.84,2.84,0,0,1,1.28-.27,2.44,2.44,0,0,1,2.16,1,5.23,5.23,0,0,1,.7,2.93,5.23,5.23,0,0,1-.7,2.93A2.44,2.44,0,0,1,19.63,22.13Zm0-1.22a1.07,1.07,0,0,0,1-.55A3.38,3.38,0,0,0,21,18.85V17.47a3.31,3.31,0,0,0-.29-1.5,1.23,1.23,0,0,0-2.06,0,3.31,3.31,0,0,0-.29,1.5v1.38a3.38,3.38,0,0,0,.29,1.51A1.06,1.06,0,0,0,19.63,20.91Z" />
                                    <path d="M10.63,22V20.82h2V15.63l-1.86,1-.55-1.06,2.32-1.3H14v6.5h1.78V22Z" />
                                </svg>
                            </button>

                            {/* Pause Button */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    togglePlayPause();
                                }}
                                className="flex items-center justify-center w-16 h-16 transition-transform active:scale-90"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="#ffffff" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="font-bold text-white size-14">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
                                </svg>
                            </button>

                            {/* Forward 10s */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    seek(10);
                                }}
                                className="relative flex items-center justify-center w-16 h-16 transition-transform active:scale-90"
                            >
                                <svg
                                    fill="#000000"
                                    viewBox="0 0 32 32"
                                    xmlns="http://www.w3.org/2000/svg"
                                    className='font-bold fill-white size-10'
                                >
                                    <path d="M26,18A10,10,0,1,1,16,8h4v5l6-6L20,1V6H16A12,12,0,1,0,28,18Z" />
                                    <path d="M19.63,22.13a2.84,2.84,0,0,1-1.28-.27,2.44,2.44,0,0,1-.89-.77,3.57,3.57,0,0,1-.52-1.25,7.69,7.69,0,0,1-.17-1.68,7.83,7.83,0,0,1,.17-1.68,3.65,3.65,0,0,1,.52-1.25,2.44,2.44,0,0,1,.89-.77,2.84,2.84,0,0,1,1.28-.27,2.44,2.44,0,0,1,2.16,1,5.23,5.23,0,0,1,.7,2.93,5.23,5.23,0,0,1-.7,2.93A2.44,2.44,0,0,1,19.63,22.13Zm0-1.22a1.07,1.07,0,0,0,1-.55A3.38,3.38,0,0,0,21,18.85V17.47a3.31,3.31,0,0,0-.29-1.5,1.23,1.23,0,0,0-2.06,0,3.31,3.31,0,0,0-.29,1.5v1.38a3.38,3.38,0,0,0,.29,1.51A1.06,1.06,0,0,0,19.63,20.91Z" />
                                    <path d="M10.63,22V20.82h2V15.63l-1.86,1-.55-1.06,2.32-1.3H14v6.5h1.78V22Z" />
                                </svg>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Timeline Bar */}
            {(!isPlaying || showControls) && (
                <div className="absolute bottom-0 left-0 right-0 z-50 w-full pointer-events-none">
                    <div className="absolute inset-0 rounded-full bg-backgroundLight dark:bg-backgroundDark" />

                    <div className="relative flex items-center gap-3 py-2 pointer-events-auto">
                        {/* Current Time */}
                        <span className="text-[10px] text-gray-900 dark:text-white font-semibold min-w-[26px] text-right">
                            {formatTime(currentTime)}
                        </span>

                        {/* Progress Bar */}
                        <div
                            ref={progressBarRef}
                            className="relative flex-1 h-2 overflow-hidden rounded-full cursor-pointer bg-gray-400/40 dark:bg-white/30"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleProgressBarClick(e);
                            }}
                            onMouseDown={(e) => {
                                e.stopPropagation();
                                handleProgressBarMouseDown(e);
                            }}
                            onTouchStart={(e) => {
                                e.stopPropagation();
                                handleProgressBarTouchStart(e);
                            }}
                        >
                            {/* Filled portion */}
                            <div
                                className="h-full transition-none bg-gray-900 pointer-events-none dark:bg-white"
                                style={{ width: `${progress}%` }}
                            />

                            {/* Thumb */}
                            <div
                                className="absolute w-4 h-4 transition-none -translate-y-1/2 bg-gray-900 rounded-full pointer-events-none top-1/2 dark:bg-white"
                                style={{ left: `calc(${progress}% - 8px)` }}
                            />
                        </div>

                        {/* Remaining Time */}
                        <span className="text-[10px] text-gray-900 dark:text-white font-semibold min-w-[26px]">
                            -{formatTime(duration - currentTime)}
                        </span>

                        {/* Options */}
                        <div className="relative">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowActions(!showActions);
                                }}
                                className="flex items-center justify-center w-6 h-6 transition-colors rounded-full ellipsis-button hover:bg-gray-900/10 dark:hover:bg-white/10"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-900 dark:text-white">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                </svg>
                            </button>

                            {/* Dropdown Menu */}
                            {showActions && (
                                <div
                                    className="absolute right-0 w-48 mb-2 overflow-hidden bg-white border border-gray-200 rounded-lg shadow-lg actions-dropdown bottom-full dark:bg-deepcharcoal dark:border-white/10"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {/* Volume Control */}
                                    <div
                                        className="relative"
                                        onMouseEnter={() => setShowVolumeSlider(true)}
                                        onMouseLeave={() => setShowVolumeSlider(false)}
                                    >
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleMute();
                                            }}
                                            className="flex items-center w-full gap-3 px-4 py-3 text-sm text-gray-700 transition-colors dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800"
                                        >
                                            {isMuted ? (
                                                <>
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75 19.5 12m0 0 2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6 4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
                                                    </svg>
                                                    <span>{__('Unmute')}</span>
                                                </>
                                            ) : (
                                                <>
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
                                                    </svg>
                                                    <span>{__('Mute')}</span>
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    {/* Fullscreen Button */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleFullscreen();
                                            setShowActions(false);
                                        }}
                                        className="flex items-center w-full gap-3 px-4 py-3 text-sm text-gray-700 transition-colors dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                                        </svg>
                                        <span>{__('Fullscreen')}</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
