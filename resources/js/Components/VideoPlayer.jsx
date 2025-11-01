import React, { useEffect, useRef, useState } from 'react';
import Plyr from 'plyr';
import 'plyr/dist/plyr.css';
import Spinner from './Spinner';

export default function VideoPlayer({ videoUrl, thumbnail, className, fullscreen = false }) {
    const [loading, setLoading] = useState(true);
    const loadingRef = useRef(loading);
    const videoRef = useRef(null);
    useEffect(() => {
        loadingRef.current = loading;
    }, [loading]);

    // Loading Video And Showing Loader
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const player = new Plyr(video, {
            controls: [
                'play',
                'progress',
                'current-time',
                'duration',
                'mute',
                'volume',
                'settings',
                ...(fullscreen ? ['fullscreen'] : []),
            ],
            disableContextMenu: true,
            previewThumbnails: true,
            quality: { default: 1080 },
        });

        let isMounted = true;
        player.on('canplay', () => isMounted && setLoading(false));
        player.on('playing', () => isMounted && setLoading(false));
        player.on('waiting', () => isMounted && setLoading(true));
        player.on('seeked', () => isMounted && setLoading(false));

        const handleKeyDown = (e) => {
            if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

            if (fullscreen) {
                if (e.key.toLowerCase() === 'f') {
                    e.preventDefault();
                    if (!loadingRef.current) {
                        player.fullscreen.toggle();
                    }
                }
            }

            if (e.key.toLowerCase() === 'm') {
                e.preventDefault();
                if (!loadingRef.current) {
                    player.muted = !player.muted;
                }
            }

            if (e.code === 'Space') {
                e.preventDefault();
                if (!loadingRef.current) {
                    player.playing ? player.pause() : player.play();
                }
            }

            if (e.key === 'ArrowRight') {
                e.preventDefault();
                player.currentTime += 5;
            }

            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                player.currentTime -= 5;
            }

            if (e.key === 'ArrowUp') {
                e.preventDefault();
                player.volume += 0.1;
            }

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                player.volume -= 0.1;
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            isMounted = false;
            window.removeEventListener('keydown', handleKeyDown);
            player.destroy();
        };
    }, [videoUrl]);

    return (
        <div className="relative top-12">
            {/* <div
                className="absolute inset-0 z-20 flex items-center justify-center mt-10 transition-opacity duration-200 pointer-events-none"
                style={{ opacity: loading ? 1 : 0, pointerEvents: loading ? 'all' : 'none' }}
            >
                <Spinner customSize="w-20 h-20" />
            </div> */}

            <video
                ref={videoRef}
                className={`plyr-react plyr rounded-sm ${className || ''}`}
                controls
                controlsList="nodownload"
                src={videoUrl}
                playsInline
                poster={thumbnail}
                preload="auto"
                muted
            >
                Your browser does not support the video tag.
            </video>
        </div>
    );
}
