import { useState, useEffect } from 'react';
import VideoPlayer from './VideoPlayer';
import Spinner from './Spinner';

const VideoWithThumbnail = ({
    className,
    videoUrl,
    autoPlay = false,
    controls = true,
    feed = false,
}) => {
    const [thumbnail, setThumbnail] = useState(null);
    const [loaded, setLoaded] = useState(false);

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
        return () => video.removeEventListener('loadeddata', capture);
    }, [videoUrl]);

    return (
        <div className="relative w-full h-full">
            {!loaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <Spinner customSize={'size-10'} />
                </div>
            )}
            {loaded && (
                <VideoPlayer
                    videoUrl={videoUrl}
                    thumbnail={thumbnail}
                    className={className}
                    autoPlay={autoPlay}
                    controls={controls}
                    fullscreen={true}
                    feed={feed}
                />
            )}
        </div>
    );
};

export default VideoWithThumbnail;
