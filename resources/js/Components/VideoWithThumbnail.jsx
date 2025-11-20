import { useState, useEffect, useRef } from 'react';
import VideoPlayer from './VideoPlayer';
import Spinner from './Spinner';
import getCookie from '@/Hooks/useGetCookie';
import CustomizedVideoPlayer from './CustomizedVideoPlayer';
import InstagramStyledVideoPlayer from './InstagramStyledVideoPlayer';

const VideoWithThumbnail = ({ className, videoUrl, autoPlay = false, controls = true, type = 'normal', OnLoadedMetaData = () => { }, videoElementRef, Preload = 'metadata', }) => {
    const [thumbnail, setThumbnail] = useState(null);
    const [loaded, setLoaded] = useState(false);
    const [autoPlayEnabled, setAutoPlayEnabled] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const containerRef = useRef(null);
    const hasBeenVisibleRef = useRef(false);
    const internalVideoRef = useRef(null);


    // Function to check and update autoplay from cookie
    const updateAutoplayFromCookie = () => {
        const cookieValue = getCookie('video_autoplay');
        const shouldAutoplay = autoPlay ?? (cookieValue === 'true');
        setAutoPlayEnabled(shouldAutoplay);
        return shouldAutoplay;
    };

    // Initialize on mount
    useEffect(() => {
        updateAutoplayFromCookie();
    }, [videoUrl, autoPlay]);

    // Listen for global cookie change event
    useEffect(() => {
        const handleChange = () => {
            updateAutoplayFromCookie();
        };

        window.addEventListener('videoAutoplayChanged', handleChange);
        return () => window.removeEventListener('videoAutoplayChanged', handleChange);
    }, [autoPlay]);



    // Intersection observer - checks cookie EVERY TIME video becomes visible or invisible AND Works Both In Y And X Axis
    useEffect(() => {
        if (!containerRef.current || type !== 'instagram') return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {

                    if (entry.isIntersecting && entry.intersectionRatio >= 0.5) { // Changed to 0.5 for better X-axis detection

                        setIsVisible(true);
                        updateAutoplayFromCookie();
                        hasBeenVisibleRef.current = true;
                    } else if (!entry.isIntersecting && hasBeenVisibleRef.current) {

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

            {/* Instagram-styled video player */}
            {type === 'instagram' && (
                <InstagramStyledVideoPlayer
                    key={`${videoUrl}-${autoPlayEnabled}`}
                    videoUrl={videoUrl}
                    thumbnail={thumbnail}
                    className={className}
                    autoPlay={autoPlayEnabled && isVisible}
                    videoElementRef={handleVideoElementRef}
                    OnLoadedMetaData={OnLoadedMetaData}
                    Preload={Preload}
                />
            )}

            {/* Customized video player */}
            {type === 'customized' && (
                <CustomizedVideoPlayer
                    key={`${videoUrl}-${autoPlayEnabled}`}
                    videoUrl={videoUrl}
                    loaded={loaded}
                    thumbnail={thumbnail}
                    className={className}
                    autoPlay={isVisible && autoPlayEnabled}
                    videoElementRef={handleVideoElementRef}
                    OnLoadedMetaData={OnLoadedMetaData}
                    Preload={Preload}
                />
            )}

            {/* Normal video player */}
            {type === 'normal' && (
                <VideoPlayer
                    key={`${videoUrl}-${autoPlayEnabled}`}
                    videoUrl={videoUrl}
                    thumbnail={thumbnail}
                    className={className}
                    autoPlay={autoPlayEnabled && isVisible}
                    controls={controls}
                    videoElementRef={videoElementRef}
                    Preload={Preload}
                />
            )}
        </div>
    );
};

export default VideoWithThumbnail;
