import React, { useEffect, useRef, useState } from 'react';

export default function CustomizedVideoPlayer({
    videoUrl,
    thumbnail,
    className,
    controls,
    autoPlay,
    initialTime = 0,
    videoElementRef,
    loaded
}) {
    const videoRef = useRef(null);
    const containerRef = useRef(null);
    const controlsRef = useRef(null);

    const [isMuted, setIsMuted] = useState(autoPlay ? true : false);
    // const [volume, setVolume] = useState(1);
    const [showVolumeSlider, setShowVolumeSlider] = useState(false);

    const [isPlaying, setIsPlaying] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [hasEnded, setHasEnded] = useState(false);

    const hideTimeout = useRef(null);
    const shouldAutoPlayRef = useRef(false);

    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    const [showActions, setShowActions] = useState(false);
    // event listener for force pause
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleForcePause = () => {
            const video = videoRef.current;
            if (video && !video.paused) {
                video.pause();
                setIsPlaying(false);
                setShowControls(true);
                clearTimeout(hideTimeout.current);
            }
        };

        container.addEventListener('forcePause', handleForcePause);

        return () => {
            container.removeEventListener('forcePause', handleForcePause);
        };
    }, []);

    // Apply initial time when video metadata loads
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        shouldAutoPlayRef.current = autoPlay;

        const handleLoadedMetadata = () => {
            setDuration(video.duration);

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
                                setHasEnded(false);
                                // Hide controls immediately after playback starts
                                hideTimeout.current = setTimeout(() => {
                                    setShowControls(false);
                                }, 100);
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
                            setHasEnded(false);
                            // Hide controls immediately after playback starts
                            hideTimeout.current = setTimeout(() => {
                                setShowControls(false);
                            }, 100);
                        })
                        .catch((err) => {
                            console.error('❌ Autoplay failed:', err.message);
                            setIsPlaying(false);
                        });
                }
            }
        };

        const handleEnded = () => {
            setIsPlaying(false);
            setHasEnded(true);
            setShowControls(false);
            clearTimeout(hideTimeout.current);
        };

        video.addEventListener('loadedmetadata', handleLoadedMetadata);
        video.addEventListener('ended', handleEnded);

        // Expose video element to parent via ref
        if (videoElementRef) {
            videoElementRef.current = video;
        }

        return () => {
            video.removeEventListener('loadedmetadata', handleLoadedMetadata);
            video.removeEventListener('ended', handleEnded);
            if (videoElementRef) {
                videoElementRef.current = null;
            }
        };
    }, [initialTime, autoPlay, videoElementRef, videoUrl]);



    // Tracking Outside clicks to close the dropdown of actins

    useEffect(() => {
        if (!showActions) return;

        const handleClickOutside = (event) => {

            const isClickOutside = !event.target.closest('.actions-dropdown') &&
                !event.target.closest('.ellipsis-button');

            if (isClickOutside) {
                setShowActions(false);
            }
        };

        // Small delay to prevent immediate closing when opening
        setTimeout(() => {
            document.addEventListener('mousedown', handleClickOutside);
        }, 0);

        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showActions]);

    const onTimeUpdate = () => {
        const video = videoRef.current;
        if (!video) return;
        setProgress((video.currentTime / video.duration) * 100);
        setCurrentTime(video.currentTime);
    };

    const togglePlay = () => {
        const video = videoRef.current;
        if (!video) return;

        clearTimeout(hideTimeout.current);

        if (video.paused || hasEnded) {
            if (hasEnded) {
                video.currentTime = 0;
                setHasEnded(false);
            }
            video.play().catch(() => { });
            setIsPlaying(true);
            setShowControls(true);

            // Hide controls immediately after play starts
            hideTimeout.current = setTimeout(() => {
                setShowControls(false);
            }, 100);
        } else {
            video.pause();
            setIsPlaying(false);
            setShowControls(true); // Keep controls visible when paused
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
        if (e.target === videoRef.current || e.target.closest('video')) {
            togglePlay();
        }
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

    const handleProgressBarClick = (e) => {
        const video = videoRef.current;
        if (!video) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        video.currentTime = pos * video.duration;
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

    // const handleVolumeChange = (e) => {
    //     const video = videoRef.current;
    //     if (!video) return;

    //     const newVolume = parseFloat(e.target.value);
    //     video.volume = newVolume;
    //     setVolume(newVolume);

    //     if (newVolume === 0) {
    //         setIsMuted(true);
    //         video.muted = true;
    //     } else {
    //         setIsMuted(false);
    //         video.muted = false;
    //     }
    // };

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
            <div className="relative flex items-center justify-center w-full h-full">
                <video
                    ref={videoRef}
                    className={`w-full h-full  ${className || ''}`}
                    playsInline
                    preload="metadata"
                    controlsList="nodownload noremoteplayback"
                    controls={false}
                    poster={thumbnail}
                    crossOrigin="anonymous"
                    onTimeUpdate={onTimeUpdate}
                    onClick={() => {
                        handleVideoClick();
                        if (isPlaying) {
                            setShowControls(!showControls);
                        }
                    }}
                    style={{
                        WebkitTapHighlightColor: 'transparent',
                        touchAction: 'manipulation',
                        userSelect: 'none',
                    }}
                >
                    <source src={videoUrl} type="video/mp4" />
                </video>

                {/* Center Controls Overlay - ONLY SHOWS WHEN showControls is true */}
                <div
                    className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${showControls || !isPlaying || hasEnded
                        ? 'opacity-100'
                        : 'opacity-0 pointer-events-none'
                        }`}
                    style={{
                        background: 'transparent'

                    }}
                >
                    {/* When video is NOT playing or has ended, show only play button */}
                    {((!isPlaying || hasEnded) && loaded) && (
                        <button
                            onClick={togglePlay}
                            className="flex items-center justify-center w-20 h-20 text-white transition-all rounded-full shadow-lg bg-deepcharcoal/70 hover:bg-deepcharcoal/80 backdrop-blur-sm active:scale-95"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-10">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
                            </svg>
                        </button>
                    )}

                    {/* When video IS playing AND controls visible, show pause and seek controls */}
                    {isPlaying && showControls && !hasEnded && (
                        <div
                            ref={controlsRef}
                            className="flex items-center justify-center gap-12"
                        >
                            {/* Rewind 10s */}
                            <button
                                onClick={() => seek(-10)}
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
                                onClick={togglePlay}
                                className="flex items-center justify-center w-16 h-16 transition-transform active:scale-90"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="#ffffff" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="font-bold text-white size-14">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
                                </svg>
                            </button>

                            {/* Forward 10s */}
                            <button
                                onClick={() => seek(10)}
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

                {/* Timeline Bar - ALWAYS VISIBLE at bottom */}
                <div className="absolute bottom-0 left-0 right-0 w-full">
                    {/* Blurred background layer */}
                    <div className="absolute inset-0 bg-white/70 dark:bg-black/60 backdrop-blur-sm" />

                    {/* Timeline content - NOT blurred */}
                    <div className="relative px-3 py-2">
                        {/* Progress Bar Row */}
                        <div className="flex items-center gap-2">
                            {/* Current Time */}
                            <span className="text-gray-900 dark:text-white text-xs font-medium min-w-[35px]">
                                {formatTime(currentTime)}
                            </span>

                            {/* Progress Bar */}
                            <div
                                className="relative flex-1 h-1 overflow-hidden rounded-full cursor-pointer bg-gray-400/40 dark:bg-white/30 group"
                                onClick={handleProgressBarClick}
                            >
                                <div
                                    className="h-full transition-all duration-100 bg-gray-900 dark:bg-white"
                                    style={{ width: `${progress}%` }}
                                />
                                {/* Hover effect */}
                                <div className="absolute inset-0 transition-opacity opacity-0 bg-gray-900/20 dark:bg-white/20 group-hover:opacity-100" />
                            </div>

                            {/* Duration */}
                            <span className="text-gray-900 dark:text-white text-xs font-medium min-w-[35px] text-right">
                                -{formatTime(duration - currentTime)}
                            </span>


                            <div className="relative">
                                <button
                                    onClick={() => setShowActions(!showActions)}
                                    className="flex items-center justify-center w-6 h-6 transition-colors rounded-full ellipsis-button hover:bg-gray-900/10 dark:hover:bg-white/10"
                                >


                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-900 dark:text-white">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                    </svg>

                                </button>

                                {/* Dropdown Menu */}
                                {showActions && (
                                    <div className="absolute right-0 w-48 mb-2 overflow-hidden bg-white border border-gray-200 rounded-lg shadow-lg actions-dropdown bottom-full dark:bg-deepcharcoal dark:border-white/10">
                                        {/* Volume Control */}
                                        <div
                                            className="relative"
                                            onMouseEnter={() => setShowVolumeSlider(true)}
                                            onMouseLeave={() => setShowVolumeSlider(false)}
                                        >
                                            <button
                                                onClick={toggleMute}
                                                className="flex items-center w-full gap-3 px-4 py-3 text-sm text-gray-700 transition-colors dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800"
                                            >
                                                {isMuted ? (
                                                    <>
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75 19.5 12m0 0 2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6 4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
                                                        </svg>
                                                        <span>Unmute</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
                                                        </svg>
                                                        <span>Mute</span>
                                                    </>
                                                )}
                                            </button>

                                            {/* Volume Slider - Shows on hover FOr LAter */}
                                            {/* {showVolumeSlider && !isMuted && (
                                                <div className="absolute top-0 p-3 ml-2 bg-white border border-gray-200 rounded-lg shadow-lg left-full dark:bg-deepcharcoal dark:border-white/10">
                                                    <input
                                                        type="range"
                                                        min="0"
                                                        max="1"
                                                        step="0.1"
                                                        value={volume}
                                                        onChange={handleVolumeChange}
                                                        className="accent-gray-900 dark:accent-white"
                                                        style={{
                                                            writingMode: 'bt-lr',
                                                            WebkitAppearance: 'slider-vertical',
                                                            height: '80px',
                                                            width: '6px'
                                                        }}
                                                    />
                                                </div>
                                            )} */}
                                        </div>

                                        {/* Fullscreen Button */}
                                        <button
                                            onClick={() => {
                                                toggleFullscreen();
                                                setShowActions(false);
                                            }}
                                            className="flex items-center w-full gap-3 px-4 py-3 text-sm text-gray-700 transition-colors dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                                            </svg>
                                            <span>Fullscreen</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
