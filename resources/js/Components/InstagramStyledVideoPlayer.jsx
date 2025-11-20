import { useState, useEffect, useRef } from 'react';

const InstagramStyledVideoPlayer = ({
    videoUrl,
    thumbnail,
    className = '',
    autoPlay = false,
    videoElementRef,
    OnLoadedMetaData = () => { },
    Preload = 'metadata'
}) => {

    const [isPlaying, setIsPlaying] = useState(autoPlay);
    const [isMuted, setIsMuted] = useState(autoPlay ? true : false);
    const [showControls, setShowControls] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [showTimeline, setShowTimeline] = useState(false);

    const progressIntervalRef = useRef(null);
    const videoRef = useRef(null);
    const timelineRef = useRef(null);
    const controlsTimeoutRef = useRef(null);
    const shouldAutoPlayRef = useRef(false);
    const rafRef = useRef(null);

    const getClientX = (e) => {
        if (e.touches) return e.touches[0].clientX;
        return e.clientX;
    };

    // Handle video element ref
    useEffect(() => {
        if (videoRef.current && videoElementRef) {
            if (typeof videoElementRef === 'function') {
                videoElementRef(videoRef.current);
            } else {
                videoElementRef.current = videoRef.current;
            }
        }
    }, [videoElementRef]);

    // Toggle play/pause
    const togglePlayPause = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
                setIsPlaying(false);
            } else {
                videoRef.current.play();
                setIsPlaying(true);
            }
        }
        showControlsTemporarily();
    };

    // Toggle mute
    const toggleMute = (e) => {
        e.stopPropagation();
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    // Show controls temporarily
    const showControlsTemporarily = () => {
        setShowControls(true);

        if (controlsTimeoutRef.current) {
            clearTimeout(controlsTimeoutRef.current);
        }

        controlsTimeoutRef.current = setTimeout(() => {
            if (isPlaying) {
                setShowControls(false);
            }
        }, 3000);
    };

    // Handle video container click
    const handleVideoClick = () => {
        togglePlayPause();
    };

    // Calculate new time from position with RAF optimization
    const calculateTimeFromPosition = (clientX) => {
        if (videoRef.current && timelineRef.current) {
            const rect = timelineRef.current.getBoundingClientRect();
            const clickX = Math.max(0, Math.min(clientX - rect.left, rect.width));
            const percentage = clickX / rect.width;
            const newTime = percentage * duration;
            return newTime;
        }
        return 0;
    };

    // Handle timeline click
    const handleTimelineClick = (e) => {
        e.stopPropagation();
        if (!isDragging) {
            const clientX = getClientX(e);
            const newTime = calculateTimeFromPosition(clientX);

            if (videoRef.current) {
                videoRef.current.currentTime = newTime;
                setCurrentTime(newTime);
            }
        }
    };

    // Handle timeline drag start
    const handleTimelineDragStart = (e) => {
        e.stopPropagation();
        e.preventDefault();
        setIsDragging(true);
        setShowTimeline(true);

        const clientX = getClientX(e);
        const newTime = calculateTimeFromPosition(clientX);

        if (videoRef.current) {
            videoRef.current.currentTime = newTime;
            setCurrentTime(newTime);
        }
    };

    // Handle timeline drag with RAF optimization
    const handleTimelineDrag = (e) => {
        if (!isDragging) return;

        // Cancel previous frame
        if (rafRef.current) {
            cancelAnimationFrame(rafRef.current);
        }

        rafRef.current = requestAnimationFrame(() => {
            const clientX = getClientX(e);
            const newTime = calculateTimeFromPosition(clientX);

            if (videoRef.current) {
                videoRef.current.currentTime = newTime;
                setCurrentTime(newTime);
            }
        });
    };

    // Handle timeline drag end
    const handleTimelineDragEnd = () => {
        setIsDragging(false);
        setTimeout(() => {
            setShowTimeline(false);
        }, 500);
    };

    // Handle timeline hover
    const handleTimelineMouseEnter = () => {
        setShowTimeline(true);
    };

    const handleTimelineMouseLeave = () => {
        if (!isDragging) {
            setShowTimeline(false);
        }
    };

    // Update progress continuously when playing
    useEffect(() => {
        if (isPlaying && videoRef.current) {
            progressIntervalRef.current = setInterval(() => {
                if (videoRef.current && !isDragging) {
                    const video = videoRef.current;
                    setCurrentTime(video.currentTime);
                }
            }, 100);
        } else {
            if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
            }
        }

        return () => {
            if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
            }
        };
    }, [isPlaying, isDragging]);

    // Adding mouse and touch move/up listeners for dragging
    useEffect(() => {
        if (isDragging) {
            const handleMouseMove = (e) => {
                e.preventDefault();
                handleTimelineDrag(e);
            };

            const handleMouseUp = () => handleTimelineDragEnd();

            const handleTouchMove = (e) => {
                e.preventDefault();
                handleTimelineDrag(e);
            };

            const handleTouchEnd = () => handleTimelineDragEnd();

            // Prevent horizontal scroll during drag
            document.body.style.overflowX = 'hidden';

            document.addEventListener('mousemove', handleMouseMove, { passive: false });
            document.addEventListener('mouseup', handleMouseUp);
            document.addEventListener('touchmove', handleTouchMove, { passive: false });
            document.addEventListener('touchend', handleTouchEnd);

            return () => {
                // Restore horizontal scroll
                document.body.style.overflowX = '';
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
                document.removeEventListener('touchmove', handleTouchMove);
                document.removeEventListener('touchend', handleTouchEnd);

                // Cancel any pending animation frame
                if (rafRef.current) {
                    cancelAnimationFrame(rafRef.current);
                }
            };
        }
    }, [isDragging, duration]);

    // Handle metadata loading and initial time setup
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        shouldAutoPlayRef.current = autoPlay;

        const handleLoadedMetadata = () => {
            setDuration(video.duration);
            OnLoadedMetaData();

            if (shouldAutoPlayRef.current) {
                video.muted = false;
                setIsMuted(false);
                video.play()
                    .then(() => {
                        setIsPlaying(true);
                    })
                    .catch((error) => {
                        console.log('Autoplay prevented:', error);
                        setIsPlaying(false);
                    });
            }
        };

        const handleEnded = () => {
            setIsPlaying(false);
            setShowControls(true);
        };

        const handlePause = () => {
            setIsPlaying(false);
            setShowControls(true);
        };

        video.addEventListener('loadedmetadata', handleLoadedMetadata);
        video.addEventListener('ended', handleEnded);
        video.addEventListener('pause', handlePause);

        // Expose video element to parent via ref
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

            if (videoElementRef) {
                videoElementRef.current = null;
            }
        };
    }, [autoPlay, videoElementRef, videoUrl, OnLoadedMetaData]);

    // Making Controls Hidden When Playing
    useEffect(() => {
        if (isPlaying) {
            setShowControls(false);
        }
    }, [isPlaying]);

    // Handle video end
    const handleVideoEnded = () => {
        setIsPlaying(false);
        setShowControls(true);
    };

    // Calculate progress percentage
    const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
        <div className={`relative w-full h-full overflow-hidden bg-black`}>
            {/* Video Element */}
            <video
                ref={videoRef}
                src={videoUrl}
                poster={thumbnail}
                className={`${className} w-full h-full`}
                playsInline
                preload={Preload}
                onEnded={handleVideoEnded}
                onClick={handleVideoClick}
                style={{ cursor: 'pointer' }}
            />

            <div
                className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300
        ${showControls || !isPlaying ? 'opacity-100' : 'opacity-0'}`}
            >
                {/* Center Control Group */}
                <div className="relative flex flex-col items-center justify-center gap-4 pointer-events-auto">


                    {/* Volume Button */}
                    <button
                        onClick={toggleMute}
                        className="flex items-center justify-center w-12 h-12 transition-all rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70"
                    >
                        {isMuted ? (
                            // Muted Icon
                            <svg
                                className="w-5 h-5 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                                />
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
                                />
                            </svg>
                        ) : (
                            // Unmuted Icon
                            <svg
                                className="w-5 h-5 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                                />
                            </svg>
                        )}
                    </button>



                    {/* Play / Pause Button */}
                    <button
                        onClick={togglePlayPause}
                        className="flex items-center justify-center w-16 h-16 transition-all rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70"
                    >
                        {isPlaying ? (
                            // Pause Icon
                            <svg
                                className="w-8 h-8 text-white"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                            </svg>
                        ) : (
                            // Play Icon
                            <svg
                                className="w-8 h-8 text-white"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path d="M8 5v14l11-7z" />
                            </svg>
                        )}
                    </button>


                </div>
            </div>


            {/* Timeline - Bottom */}
            <div
                ref={timelineRef}
                onMouseEnter={handleTimelineMouseEnter}
                onMouseLeave={handleTimelineMouseLeave}
                onMouseDown={handleTimelineDragStart}
                onTouchStart={handleTimelineDragStart}
                onClick={handleTimelineClick}
                className="absolute bottom-0 left-0 right-0 z-20 cursor-pointer touch-none"
                style={{ padding: '12px 0' }}
            >
                <div className="relative w-full px-2">
                    {/* Timeline Background */}
                    <div
                        className={`w-full bg-white/30 rounded-full transition-all duration-200 ${showTimeline || isDragging ? 'h-1' : 'h-0.5'
                            }`}
                    >
                        {/* Progress Bar */}
                        <div
                            className="h-full transition-none bg-white rounded-full"
                            style={{ width: `${progressPercentage}%` }}
                        />
                    </div>

                    {/* Timeline Thumb */}
                    {(showTimeline || isDragging) && (
                        <div
                            className="absolute w-3 h-3 transition-none -translate-y-1/2 bg-white rounded-full shadow-lg top-1/2"
                            style={{
                                left: `calc(${progressPercentage}% + 8px)`,
                                transform: 'translate(-50%, -50%)',
                            }}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default InstagramStyledVideoPlayer;
