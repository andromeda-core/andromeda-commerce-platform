import { useState, useMemo, useEffect, useRef } from 'react';
import { useSwipeable } from 'react-swipeable';
import useWindowSize from '@/Hooks/useWindowSize';
import { motion, AnimatePresence } from 'framer-motion';
import VideoWithThumbnail from '@/Components/VideoWithThumbnail';
import VideoThumbnail from '@/Components/VideoThumbnail';

export default function PostMediaViewer({
    viewablePost,
    selectedMediaIndex,
    onSelectMediaIndex,
    setMediaItems,
    mediaThumbRefs,
}) {
    const selected = selectedMediaIndex ?? 0;

    const MediaRef = useRef(null);

    // Cache for loaded URLs
    const loadedCache = useRef(new Set());

    const windowSize = useWindowSize();

    // Combine images + videos into one array
    const mediaItems = useMemo(() => {
        const images =
            viewablePost?.images?.map((img) => ({
                type: 'image',
                url: img.url,
            })) || [];

        const videos =
            viewablePost?.videos?.map((vid) => ({
                type: 'video',
                url: vid.url,
            })) || [];

        return [...images, ...videos];
    }, [viewablePost]);

    // Mouse wheel navigation
    useEffect(() => {
        const mediaEl = MediaRef.current;
        if (!mediaEl) return;

        const handleWheel = (event) => {
            if (event.ctrlKey || event.metaKey) return;
            event.preventDefault();

            if (event.deltaY < 0) {
                onSelectMediaIndex((prev) => (prev === 0 ? 0 : prev - 1));
            } else {
                onSelectMediaIndex((prev) => (prev === mediaItems.length - 1 ? prev : prev + 1));
            }
        };

        setMediaItems(mediaItems);

        mediaEl.addEventListener('wheel', handleWheel, { passive: false });

        return () => {
            mediaEl.removeEventListener('wheel', handleWheel, { passive: false });
        };
    }, [mediaItems.length]);

    if (mediaItems.length === 0) return null;

    // Reset on post change
    useEffect(() => {
        onSelectMediaIndex(0);
    }, [viewablePost]);

    // Auto-scroll thumbnails
    useEffect(() => {
        if (mediaThumbRefs.current[selected]) {
            mediaThumbRefs.current[selected].scrollIntoView({
                behavior: 'smooth',
                inline: 'center',
                block: 'nearest',
            });
        }
    }, [selected]);

    const [direction, setDirection] = useState(0);

    useEffect(() => {
        setDirection(1);

        document.querySelectorAll('video').forEach((v) => {
            v.pause();
        });
    }, [selected]);

    // Preload
    useEffect(() => {
        const preload = (item) => {
            if (!item || loadedCache.current.has(item.url)) return;
            if (item.type === 'image') {
                const img = new Image();
                img.src = item.url;
                img.onload = () => loadedCache.current.add(item.url);
            } else {
                const video = document.createElement('video');
                video.src = item.url;
                video.preload = 'auto';
                video.oncanplaythrough = () => loadedCache.current.add(item.url);
            }
        };

        // preload current, next, and prev
        preload(mediaItems[selected]);
        preload(mediaItems[selected + 1]);
        preload(mediaItems[selected - 1]);
    }, [selected, mediaItems]);

    // Swiper
    const handlers = useSwipeable({
        onSwipedLeft: (e) => {
            if (mediaItems.length > 1) {
                e.event.stopPropagation();
                setDirection(1);
                onSelectMediaIndex((prev) => (prev + 1) % mediaItems.length);
            }
        },

        onSwipedRight: (e) => {
            if (mediaItems.length > 1) {
                e.event.stopPropagation();
                setDirection(-1);
                onSelectMediaIndex((prev) => (prev - 1 + mediaItems.length) % mediaItems.length);
            }
        },
        trackTouch: true,
        trackMouse: true,
        preventScrollOnSwipe: true,
    });

    return (
        <>
            <div
                className="relative flex flex-col items-center mx-auto mt-5 mb-5 lg:mt-0"
                ref={MediaRef}
            >
                {/* Big Viewer */}
                <div
                    className="relative flex items-center justify-center flex-shrink-0 overflow-hidden rounded-sm"
                    style={{
                        height: windowSize.width >= 1024 ? '70vh' : '60vh',
                        minWidth: windowSize.width >= 1024 ? '30vw' : '100%',
                        maxWidth: windowSize.width >= 1024 ? '30vw' : '100%',
                        width: '100%',
                        position: 'relative',
                    }}
                    {...handlers}
                >
                    <div className="invisible w-full h-full">
                        {mediaItems[selected]?.type === 'image' ? (
                            <img
                                src={mediaItems[selected]?.url}
                                alt={`Media ${selected}`}
                                className="h-full w-full min-w-[300px] max-w-[300px] object-contain lg:min-w-[500px]"
                                loading={"high"}
                                decoding={"async"}
                                fetchpriority={"high"}
                                onError={(e) => e.target.src = Placeholder}
                            />
                        ) : (
                            <VideoWithThumbnail
                                className={
                                    'h-full w-full min-w-[300px] max-w-[300px] rounded-xl object-contain lg:min-w-[500px]'
                                }
                                videoUrl={mediaItems[selected]?.url}
                            />
                        )}
                    </div>
                    {/* Animated layers */}
                    <AnimatePresence initial={false} custom={direction}>
                        <div className="absolute inset-0 flex items-center justify-center w-full h-full">
                            {mediaItems.map((item, idx) => {
                                const isCurrent = idx === selected;

                                return (
                                    <motion.div
                                        key={`${idx}-${item.url}`}
                                        initial={false}
                                        animate={{
                                            opacity: isCurrent ? 1 : 0,
                                            zIndex: isCurrent ? 1 : 0,
                                        }}
                                        transition={{ duration: 0.4, ease: "easeInOut" }}
                                        className="absolute inset-0 flex items-center justify-center w-full h-full"
                                    >
                                        {item.type === "image" ? (
                                            <img
                                                src={item.url}
                                                alt={`Media ${idx}`}
                                                className="object-contain w-full h-full rounded-xl"
                                                loading={isCurrent ? "eager" : "lazy"}
                                                decoding="async"
                                                fetchpriority={isCurrent ? "high" : "low"}
                                                onLoad={() => loadedCache.current.add(item.url)}
                                            />
                                        ) : (
                                            <VideoWithThumbnail
                                                className="object-contain w-full h-full rounded-md"
                                                videoUrl={item.url}
                                                Preload={isCurrent ? "auto" : "metadata"}
                                                OnLoadedMetaData={() => loadedCache.current.add(item.url)}
                                            />
                                        )}
                                    </motion.div>
                                );
                            })}

                        </div>
                    </AnimatePresence>
                </div>

                {/* Thumbnails */}
                {windowSize.width > 1024 && mediaItems.length > 1 && (
                    <div className="mt-3 flex max-w-[31vw] gap-2 overflow-x-hidden px-2 scrollbar-none">
                        {mediaItems.map((item, idx) => (
                            <button
                                key={`${idx}-${item.url}`}
                                ref={(el) => (mediaThumbRefs.current[idx] = el)}
                                onClick={() => onSelectMediaIndex(idx)}
                                className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-sm border transition-all duration-200 ${selectedMediaIndex === idx
                                    ? 'border-indigo-600 ring-2 ring-indigo-400'
                                    : 'border-gray-300 hover:border-gray-500'
                                    }`}
                            >
                                {item.type === 'image' ? (
                                    <img
                                        src={item.url}
                                        alt={`Image ${idx}`}
                                        className="object-cover w-full h-full"
                                        loading={selectedMediaIndex === idx ? "eager" : "lazy"}
                                        decoding="async"
                                        fetchpriority={selectedMediaIndex === idx ? "high" : "low"}
                                    />
                                ) : (


                                    <VideoThumbnail
                                        className={'h-full w-full object-cover opacity-80'}
                                        videoUrl={item.url}
                                        alt={`Video ${idx}`}
                                        FetchPriority={selectedMediaIndex === idx ? "high" : "low"}
                                        Loading={selectedMediaIndex === idx ? "eager" : "lazy"}
                                        Decoding={"async"}
                                    />
                                )}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
