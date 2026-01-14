import { useState, useEffect, useRef, useCallback } from 'react';
import { useVideoStore } from '@/Hooks/useVideoStore';
const InstagramStyledVideoPlayer = ({
    videoUrl,
    thumbnail,
    className = '',
    OnLoadedMetaData = () => { },
    Preload = 'metadata',
    slug,
    timelinePadding = 12,
    isMainFeed = false,

}) => {



    /* -------------------- INSTANCE -------------------- */
    const instanceId = useRef(`${slug}-${Math.random().toString(36).substr(2, 9)}`).current;

    /* -------------------- STATE -------------------- */
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const [showControls, setShowControls] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [progress, setProgress] = useState(0);

    /* -------------------- REFS -------------------- */
    const videoRef = useRef(null);
    const timelineRef = useRef(null);
    const progressBarRef = useRef(null);
    const isDraggingRef = useRef(false);
    const controlsTimeoutRef = useRef(null);
    const pendingSeekRef = useRef(null);
    const ignoreTimeUpdateRef = useRef(false);


    /* -------------------- STORE -------------------- */
    const registerVideo = useVideoStore(s => s.registerVideo);
    const unregisterVideo = useVideoStore(s => s.unregisterVideo);

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
    const handleVideoClick = () => togglePlayPause();


    /* -------------------- CONTROLS -------------------- */
    const togglePlayPause = () => {
        const video = videoRef.current;
        if (!video) return;
        video.paused ? video.play() : video.pause();
        showControlsTemporarily();
    };

    const toggleMute = useCallback((e) => {
        e.stopPropagation();
        const video = videoRef.current;
        if (!video) return;
        video.muted = !video.muted;
        setIsMuted(video.muted);
    }, []);

    const showControlsTemporarily = () => {
        setShowControls(true);
        clearTimeout(controlsTimeoutRef.current);
        controlsTimeoutRef.current = setTimeout(() => {
            if (isPlaying) setShowControls(false);
        }, 3000);
    };

    /* -------------------- TIMELINE LOGIC -------------------- */
    const getClientX = (e) => e.clientX;

    const seekFromClientX = (clientX) => {
        const bar = timelineRef.current;
        const video = videoRef.current;
        if (!bar || !video || !video.duration) return;

        const rect = bar.getBoundingClientRect();
        const pos = Math.min(Math.max(clientX - rect.left, 0), rect.width);
        const percent = pos / rect.width;
        const time = percent * video.duration;

        pendingSeekRef.current = time;
        setCurrentTime(time);
        setProgress(percent * 100);
    };

    const onPointerDown = (e) => {
        e.preventDefault();
        isDraggingRef.current = true;
        ignoreTimeUpdateRef.current = true;

        seekFromClientX(getClientX(e));

        document.addEventListener('pointermove', onPointerMove);
        document.addEventListener('pointerup', onPointerUp);
        document.addEventListener('pointercancel', onPointerUp);
    };

    const onPointerMove = (e) => {
        if (!isDraggingRef.current) return;
        seekFromClientX(getClientX(e));
    };

    const onPointerUp = () => {
        isDraggingRef.current = false;

        const video = videoRef.current;
        const seekTime = pendingSeekRef.current;
        pendingSeekRef.current = null;

        if (!video || seekTime == null) return;

        const wasPlaying = !video.paused;

        //  iOS compositor safety
        video.pause();

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                if (!video) return;

                video.currentTime = seekTime;

                if (wasPlaying) {
                    video.play().catch(() => { });
                } else {
                    video.play().catch(() => { });
                }

                // allow timeupdate AFTER seek settles
                setTimeout(() => {
                    ignoreTimeUpdateRef.current = false;
                }, 50);
            });
        });

        showControlsTemporarily();

        document.removeEventListener('pointermove', onPointerMove);
        document.removeEventListener('pointerup', onPointerUp);
        document.removeEventListener('pointercancel', onPointerUp);
    };




    useEffect(() => {
        if (!slug) return;
        registerVideo(instanceId, playerMethodsRef.current);
        return () => unregisterVideo(instanceId);
    }, [slug, instanceId]);




    /* -------------------- VIDEO EVENTS -------------------- */
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const onLoaded = () => {
            setDuration(video.duration);
            OnLoadedMetaData();
        };

        const onPlay = () => {
            setIsPlaying(true);
            if (!isDraggingRef.current) {
                setShowControls(false);
            }
        };

        const onPause = () => {
            setIsPlaying(false);
            if (!isDraggingRef.current) {
                setShowControls(true);
            }
        };

        const onTimeUpdate = () => {
            if (isDraggingRef.current || ignoreTimeUpdateRef.current) return;
            setCurrentTime(video.currentTime);
            setProgress((video.currentTime / video.duration) * 100);
        };

        video.addEventListener('loadedmetadata', onLoaded);
        video.addEventListener('play', onPlay);
        video.addEventListener('pause', onPause);
        video.addEventListener('timeupdate', onTimeUpdate);

        return () => {
            video.removeEventListener('loadedmetadata', onLoaded);
            video.removeEventListener('play', onPlay);
            video.removeEventListener('pause', onPause);
            video.removeEventListener('timeupdate', onTimeUpdate);
        };
    }, [OnLoadedMetaData]);








    // CleanUp
    useEffect(() => {
        return () => {
            clearTimeout(controlsTimeoutRef.current);
        };
    }, []);


    return (
        <div className="relative w-full h-full bg-black"
            style={{
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            <video
                ref={videoRef}
                src={videoUrl}
                poster={thumbnail}
                className={`${className} w-full h-full`}
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                }}
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

                    {/* Not Showing Here because Now its Moved Into the timeline */}
                    {/* <button
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
                    </button> */}

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
                ref={progressBarRef}
                className={`absolute left-0 right-0 z-10 flex items-center gap-1 px-2 py-4 ${isMainFeed ? 'bottom-12' : '-bottom-3'}`}
                style={{
                    paddingBottom: `max(16px, env(safe-area-inset-bottom))`,
                }}
            >
                {/* Mute Button */}
                <button
                    onClick={toggleMute}
                    className="flex items-center justify-center flex-shrink-0 w-10 h-10 bg-transparent "
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

                {/* Timeline */}
                <div
                    ref={timelineRef}
                    onPointerDown={onPointerDown}
                    className="relative flex-1 cursor-pointer select-none"
                    style={{
                        padding: "16px 0",
                        touchAction: 'none',
                        WebkitUserSelect: 'none',
                        WebkitTouchCallout: 'none',
                    }}
                >

                    <div className="relative w-full"

                        style={{
                            padding: '0',
                        }}
                    >
                        <div className="w-full bg-white/30 rounded-full h-1.5">
                            <div
                                className="h-full bg-white rounded-full"
                                style={{
                                    width: `${progress}%`,
                                    transition: isDraggingRef.current
                                        ? 'none'
                                        : 'width 120ms linear',
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};



export default InstagramStyledVideoPlayer;
