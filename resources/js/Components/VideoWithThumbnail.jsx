import { useState, useEffect, useRef } from 'react';
import VideoPlayer from './VideoPlayer';
import Spinner from './Spinner';
import getCookie from '@/Hooks/useGetCookie';
import CustomizedVideoPlayer from './CustomizedVideoPlayer';

// Global cache to store video timelines
const videoTimeCache = new Map();

const VideoWithThumbnail = ({ className, videoUrl, autoPlay = false, controls = true, type = 'normal', OnLoadedMetaData = () => { }, videoElementRef }) => {
    const [thumbnail, setThumbnail] = useState(null);
    const [loaded, setLoaded] = useState(false);
    const [autoPlayEnabled, setAutoPlayEnabled] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [initialTime, setInitialTime] = useState(0);
    const containerRef = useRef(null);
    const hasBeenVisibleRef = useRef(false);
    const cacheIntervalRef = useRef(null);
    const internalVideoRef = useRef(null);

    // Function to load cached time
    const loadCachedTime = () => {
        const cachedData = videoTimeCache.get(videoUrl);
        if (cachedData) {
            const timeDiff = Date.now() - cachedData.timestamp;


            // Use cached time if less than 5 minutes old
            if (timeDiff < 5 * 60 * 1000) {

                setInitialTime(cachedData.currentTime);
                return cachedData.currentTime;
            } else {
                videoTimeCache.delete(videoUrl);
                setInitialTime(0);
                return 0;
            }
        } else {

            setInitialTime(0);
            return 0;
        }
    };

    // Function to save current time to cache
    const saveCachedTime = () => {
        if (internalVideoRef.current && !isNaN(internalVideoRef.current.currentTime)) {
            const currentTime = internalVideoRef.current.currentTime;
            videoTimeCache.set(videoUrl, {
                currentTime: currentTime,
                timestamp: Date.now()
            });
        }
    };

    // Function to check and update autoplay from cookie
    const updateAutoplayFromCookie = () => {
        const cookieValue = getCookie('video_autoplay');
        const shouldAutoplay = autoPlay || (cookieValue === 'true');
        setAutoPlayEnabled(shouldAutoplay);
        return shouldAutoplay;
    };

    // Initialize on mount
    useEffect(() => {
        updateAutoplayFromCookie();
        loadCachedTime();
    }, [videoUrl, autoPlay]);

    // Listen for global cookie change event
    useEffect(() => {
        const handleChange = () => {
            updateAutoplayFromCookie();
        };

        window.addEventListener('videoAutoplayChanged', handleChange);
        return () => window.removeEventListener('videoAutoplayChanged', handleChange);
    }, [autoPlay]);

    // Continuous cache updates while video is visible and playing
    useEffect(() => {
        if (isVisible && internalVideoRef.current) {
            // Save immediately when becoming visible
            saveCachedTime();

            // Then save every 2 seconds while visible
            cacheIntervalRef.current = setInterval(() => {
                saveCachedTime();
            }, 2000);
        }

        return () => {
            if (cacheIntervalRef.current) {
                clearInterval(cacheIntervalRef.current);
                cacheIntervalRef.current = null;
            }
        };
    }, [isVisible, videoUrl]);

    // Intersection observer - checks cookie EVERY TIME video becomes visible or invisible AND Works Both In Y And X Axis
    useEffect(() => {
        if (!containerRef.current) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {

                    if (entry.isIntersecting && entry.intersectionRatio >= 0.5) { // Changed to 0.5 for better X-axis detection
                        loadCachedTime();
                        setIsVisible(true);
                        updateAutoplayFromCookie();
                        hasBeenVisibleRef.current = true;
                    } else if (!entry.isIntersecting && hasBeenVisibleRef.current) {
                        saveCachedTime();
                        setIsVisible(false);
                        hasBeenVisibleRef.current = false;
                    }
                });
            },
            {
                threshold: 0.5,
                rootMargin: '0px'
            }
        );

        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, [autoPlay, videoUrl]);

    // Generate thumbnail
    useEffect(() => {
        if (!videoUrl) return;

        const video = document.createElement('video');
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        video.crossOrigin = 'anonymous';
        video.src = videoUrl;
        video.muted = true;
        video.playsInline = true;
        video.currentTime = 0.1;

        const capture = () => {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            setThumbnail(canvas.toDataURL('image/jpeg'));
            setLoaded(true);
        };

        video.addEventListener('loadeddata', capture);
        return () => {
            video.removeEventListener('loadeddata', capture);
            video.src = '';
        };
    }, [videoUrl]);


    const handleVideoElementRef = (videoElement) => {
        internalVideoRef.current = videoElement;

        if (videoElementRef) {
            if (typeof videoElementRef === 'function') {
                videoElementRef(videoElement);
            } else {
                videoElementRef.current = videoElement;
            }
        }
    };


    return (
        <div ref={containerRef} className="relative w-full h-full">
            {!loaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <Spinner customSize={'size-10'} />
                </div>
            )}
            {type === 'customized' && (
                <CustomizedVideoPlayer
                    key={`${videoUrl}-${autoPlayEnabled}-${isVisible}-${initialTime}`}
                    videoUrl={videoUrl}
                    loaded={loaded}
                    thumbnail={thumbnail}
                    className={className}
                    autoPlay={autoPlayEnabled && isVisible}
                    controls={controls}
                    fullscreen={true}
                    initialTime={initialTime}
                    videoElementRef={handleVideoElementRef}
                    OnLoadedMetaData={OnLoadedMetaData}
                />
            )}


            {type === 'normal' && (
                <VideoPlayer
                    key={`${videoUrl}-${autoPlayEnabled}-${isVisible}-${initialTime}`}
                    videoUrl={videoUrl}
                    thumbnail={thumbnail}
                    className={className}
                    autoPlay={autoPlayEnabled && isVisible}
                    controls={controls}
                    fullscreen={true}
                    initialTime={initialTime}
                    videoElementRef={videoElementRef}
                />
            )}
        </div>
    );
};

export default VideoWithThumbnail;
