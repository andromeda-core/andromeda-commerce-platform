import { useRef } from 'react';
import InstagramStyledVideoPlayer from './InstagramStyledVideoPlayer';
import CustomizedVideoPlayer from './CustomizedVideoPlayer';
import VideoPlayer from './VideoPlayer';
const VideoWithThumbnail = ({
    className,
    videoUrl,
    controls = true,
    type = 'normal',
    OnLoadedMetaData = () => { },
    videoElementRef,
    Preload = 'metadata',
    thumbnail,
}) => {

    const containerRef = useRef(null);

    const handleVideoElementRef = (videoElement) => {
        if (videoElement) {
            videoElement.playsInline = true;
            videoElement.setAttribute('playsinline', '');
            videoElement.setAttribute('webkit-playsinline', '');
        }

        // Pass video ref up to parent
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

            {type === 'instagram' && (
                <InstagramStyledVideoPlayer
                    videoUrl={videoUrl}
                    thumbnail={thumbnail}
                    className={className}
                    videoElementRef={handleVideoElementRef}
                    OnLoadedMetaData={OnLoadedMetaData}
                    Preload={Preload}
                />
            )}

            {type === 'customized' && (
                <CustomizedVideoPlayer
                    videoUrl={videoUrl}
                    thumbnail={thumbnail}
                    className={className}
                    autoPlay={false}
                    videoElementRef={handleVideoElementRef}
                    OnLoadedMetaData={OnLoadedMetaData}
                    Preload={Preload}
                />
            )}

            {type === 'normal' && (
                <VideoPlayer
                    videoUrl={videoUrl}
                    thumbnail={thumbnail}
                    className={className}
                    autoPlay={false}
                    controls={controls}
                    videoElementRef={handleVideoElementRef}
                    Preload={Preload}
                />
            )}
        </div>
    );
};

export default VideoWithThumbnail;
