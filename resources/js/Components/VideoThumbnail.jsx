import React, { useEffect, useState } from 'react';

const VideoThumbnail = ({ videoUrl, alt, className, Loading = 'lazy', FetchPriority = 'low', Decoding = 'async' }) => {
    const [thumbnail, setThumbnail] = useState(null);

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
            const imageData = canvas.toDataURL('image/jpeg');
            setThumbnail(imageData);
        };

        video.addEventListener('loadeddata', capture);
        return () => video.removeEventListener('loadeddata', capture);
    }, [videoUrl]);

    if (!thumbnail) {
        return (
            <div className="relative aspect-[1/1] w-full animate-pulse overflow-hidden rounded-md bg-gray-300">
                {/* Skeleton shimmer */}
                <div className="absolute inset-0 animate-[shimmer_1.6s_infinite] bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300"></div>

                {/* Overlay fade pulse */}
                <div className="absolute inset-0 animate-fade bg-gray-200/60"></div>

                <style>{`
                    @keyframes shimmer {
                        0% {
                            background-position: -468px 0;
                        }
                        100% {
                            background-position: 468px 0;
                        }
                    }
                    @keyframes fade {
                        0%,
                        100% {
                            opacity: 0.7;
                        }
                        50% {
                            opacity: 0.4;
                        }
                    }
                `}</style>
            </div>
        );
    }

    return (
        <img
            src={thumbnail}
            alt={alt || 'Video thumbnail'}
            className={className || 'w-full rounded object-cover'}
            loading={Loading}
            fetchpriority={FetchPriority}
            decoding={Decoding}

        />
    );
};

export default VideoThumbnail;
