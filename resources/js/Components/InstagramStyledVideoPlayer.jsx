import { useState, useEffect, useRef, useCallback } from 'react';
import { useVideoStore } from '@/Hooks/useVideoStore';

const InstagramStyledVideoPlayer = ({
    videoUrl,
    thumbnail,
    className = '',
    OnLoadedMetaData = () => { },
    Preload = 'metadata',
    slug
}) => {

    //  CREATE UNIQUE INSTANCE ID
    const instanceId = useRef(`${slug}-${Math.random().toString(36).substr(2, 9)}`).current;

    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const [showControls, setShowControls] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [showTimeline, setShowTimeline] = useState(false);

    const videoRef = useRef(null);
    const timelineRef = useRef(null);
    const progressIntervalRef = useRef(null);
    const rafRef = useRef(null);
    const controlsTimeoutRef = useRef(null);

    const registerVideo = useVideoStore(state => state.registerVideo);
    const unregisterVideo = useVideoStore(state => state.unregisterVideo);

    //  STABLE REF WITH INSTANCE ID IN LOGS
    const playerMethodsRef = useRef({
        play: async () => {
            const video = videoRef.current;

            if (!video) {
                console.warn('[VideoPlayer] ❌ No video element for play():', instanceId);
                return;
            }

            try {
                video.playsInline = true;
                video.setAttribute('playsinline', '');

                if (video.readyState < 2) {
                    await new Promise((resolve) => {
                        const onCan = () => {
                            video.removeEventListener('canplay', onCan);
                            resolve();
                        };
                        setTimeout(() => {
                            video.removeEventListener('canplay', onCan);
                            resolve();
                        }, 500);
                        video.addEventListener('canplay', onCan);
                    });
                }

                await video.play();
            } catch (e) {
                // If play fails due to autoplay policy, try muted
                if (e.name === 'NotAllowedError') {
                    try {
                        video.muted = true;
                        setIsMuted(true);
                        await video.play();
                    } catch (retryError) {
                        console.error('[VideoPlayer] Muted play also failed:', retryError);
                        throw retryError;
                    }
                } else {
                    throw e;
                }
            }
        },

        pause: () => {
            const video = videoRef.current;

            if (!video) {
                console.warn('[VideoPlayer] ❌ No video element for pause():', instanceId);
                return;
            }

            video.pause();
        },

        getElement: () => videoRef.current,

        isPaused: () => {
            const video = videoRef.current;
            return !video || video.paused;
        },

        getSlug: () => slug, //  Storing original slug for matching

        getInstanceId: () => instanceId
    });

    //  REGISTER WITH UNIQUE INSTANCE ID
    useEffect(() => {
        if (!slug) return;
        registerVideo(instanceId, playerMethodsRef.current); // Using instanceId instead of slug

        return () => {
            unregisterVideo(instanceId);
        };
    }, [slug, registerVideo, unregisterVideo, instanceId]);

    const getClientX = (e) => (e.touches ? e.touches[0].clientX : e.clientX);

    // SYNC UI WITH REAL VIDEO EVENTS
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;


        const onLoaded = () => {
            setDuration(video.duration);
            OnLoadedMetaData();
        };

        const onPlay = () => {
            setIsPlaying(true);
            setShowControls(false);
        };

        const onPause = () => {
            setIsPlaying(false);
            setShowControls(true);
        };

        const onVolume = () => {
            setIsMuted(video.muted);
        };

        const onEnded = () => {
            setIsPlaying(false);
            setShowControls(true);
        };

        video.addEventListener("loadedmetadata", onLoaded);
        video.addEventListener("play", onPlay);
        video.addEventListener("pause", onPause);
        video.addEventListener("volumechange", onVolume);
        video.addEventListener("ended", onEnded);

        setIsMuted(!!video.muted);
        setIsPlaying(!video.paused);
        setDuration(video.duration || 0);

        return () => {
            video.removeEventListener("loadedmetadata", onLoaded);
            video.removeEventListener("play", onPlay);
            video.removeEventListener("pause", onPause);
            video.removeEventListener("volumechange", onVolume);
            video.removeEventListener("ended", onEnded);
        };
    }, [videoUrl, instanceId, OnLoadedMetaData]);

    // Rest of your component code stays the same...
    const togglePlayPause = () => {
        const video = videoRef.current;
        if (!video) return;

        if (video.paused) {
            video.play().catch(e => console.error('[InstagramPlayer] toggle play error:', e));
        } else {
            video.pause();
        }

        showControlsTemporarily();
    };

    const toggleMute = useCallback((e) => {
        e.stopPropagation();
        const video = videoRef.current;
        if (!video) return;

        const newMutedState = !video.muted;
        video.muted = newMutedState;
        setIsMuted(newMutedState);
    }, []);
    const showControlsTemporarily = () => {
        setShowControls(true);

        clearTimeout(controlsTimeoutRef.current);
        controlsTimeoutRef.current = setTimeout(() => {
            if (isPlaying) setShowControls(false);
        }, 3000);
    };

    const handleVideoClick = () => togglePlayPause();

    const calculateTimeFromPosition = (clientX) => {
        const rect = timelineRef.current.getBoundingClientRect();
        const offset = Math.max(0, Math.min(clientX - rect.left, rect.width));
        return (offset / rect.width) * duration;
    };

    const handleTimelineClick = (e) => {
        if (isDragging) return;
        const newTime = calculateTimeFromPosition(getClientX(e));
        const video = videoRef.current;

        video.currentTime = newTime;
        setCurrentTime(newTime);
    };

    const handleTimelineDragStart = (e) => {
        setIsDragging(true);
        setShowTimeline(true);
        const newTime = calculateTimeFromPosition(getClientX(e));

        const video = videoRef.current;
        video.currentTime = newTime;
        setCurrentTime(newTime);
    };

    const handleTimelineDrag = (e) => {
        if (!isDragging) return;

        cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(() => {
            const newTime = calculateTimeFromPosition(getClientX(e));
            const video = videoRef.current;

            video.currentTime = newTime;
            setCurrentTime(newTime);
        });
    };

    const handleTimelineDragEnd = () => {
        setIsDragging(false);
        setTimeout(() => setShowTimeline(false), 500);
    };

    useEffect(() => {
        if (!isDragging) return;

        const move = (e) => { e.preventDefault(); handleTimelineDrag(e); };
        const up = () => handleTimelineDragEnd();

        document.body.style.overflowX = "hidden";
        document.addEventListener("mousemove", move, { passive: false });
        document.addEventListener("mouseup", up);
        document.addEventListener("touchmove", move, { passive: false });
        document.addEventListener("touchend", up);

        return () => {
            document.body.style.overflowX = "";
            document.removeEventListener("mousemove", move);
            document.removeEventListener("mouseup", up);
            document.removeEventListener("touchmove", move);
            document.removeEventListener("touchend", up);
        };
    }, [isDragging]);

    useEffect(() => {
        if (!isPlaying) {
            clearInterval(progressIntervalRef.current);
            return;
        }

        progressIntervalRef.current = setInterval(() => {
            if (!isDragging && videoRef.current) {
                setCurrentTime(videoRef.current.currentTime);
            }
        }, 100);

        return () => clearInterval(progressIntervalRef.current);
    }, [isPlaying, isDragging]);

    // CleanUp
    useEffect(() => {
        return () => {
            clearInterval(progressIntervalRef.current);
            clearTimeout(controlsTimeoutRef.current);
            cancelAnimationFrame(rafRef.current);
        };
    }, []);

    const progressPercentage = duration ? (currentTime / duration) * 100 : 0;

    return (
        <div className="relative w-full h-full overflow-hidden bg-black">
            <video
                ref={videoRef}
                src={videoUrl}
                poster={thumbnail}
                className={`${className} w-full h-full`}
                playsInline
                preload={Preload}
                onClick={handleVideoClick}
                muted={isMuted}
            />

            {/* Controls - same as before */}
            <div
                className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300
                ${showControls || !isPlaying ? "opacity-100" : "opacity-0"}`}
            >
                <div className="flex flex-col items-center gap-4 pointer-events-auto">
                    <button
                        onClick={toggleMute}
                        className="flex items-center justify-center w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm"
                    >
                        {isMuted ? (
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                            </svg>
                        )}
                    </button>

                    <button onClick={togglePlayPause}
                        className="flex items-center justify-center w-16 h-16 rounded-full bg-black/50 backdrop-blur-sm">
                        {isPlaying ? (
                            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                            </svg>
                        ) : (
                            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                        )}
                    </button>
                </div>
            </div>

            {/* Timeline */}
            <div
                ref={timelineRef}
                onMouseEnter={() => setShowTimeline(true)}
                onMouseLeave={() => !isDragging && setShowTimeline(false)}
                onMouseDown={handleTimelineDragStart}
                onTouchStart={handleTimelineDragStart}
                onClick={handleTimelineClick}
                className="absolute bottom-0 left-0 right-0 z-50 cursor-pointer touch-none"
                style={{ padding: "12px 0" }}
            >
                <div className="relative w-full px-2">
                    <div className={`w-full bg-white/30 rounded-full ${showTimeline ? "h-1" : "h-0.5"}`}>
                        <div className="h-full bg-white rounded-full" style={{ width: `${progressPercentage}%` }} />
                    </div>
                </div>
            </div>
        </div>
    );
};



export default InstagramStyledVideoPlayer;
