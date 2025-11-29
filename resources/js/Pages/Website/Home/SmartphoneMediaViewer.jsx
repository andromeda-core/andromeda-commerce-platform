import { useState, useMemo, useEffect, useRef } from 'react';
import { useSwipeable } from 'react-swipeable';
import useWindowSize from '@/Hooks/useWindowSize';
import { motion, AnimatePresence } from 'framer-motion';

export default function SmartphoneMediaViewer({
    viewableSmartphone,
    selectedMediaIndex,
    onSelectMediaIndex,
    mediaThumbRefs,
    Placeholder
}) {
    const selected = selectedMediaIndex ?? 0;
    const MediaRef = useRef(null);
    const loadedCache = useRef(new Set());
    const windowSize = useWindowSize();

    const mediaItems = useMemo(() => {
        const images =
            viewableSmartphone?.images?.map((img) => ({
                type: 'image',
                url: img.url || img,
            })) || [];
        return images;
    }, [viewableSmartphone]);

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

        mediaEl.addEventListener('wheel', handleWheel, { passive: false });
        return () => mediaEl.removeEventListener('wheel', handleWheel, { passive: false });
    }, [mediaItems.length, onSelectMediaIndex]);

    if (mediaItems.length === 0) return null;

    useEffect(() => {
        onSelectMediaIndex(0);
    }, [viewableSmartphone, onSelectMediaIndex]);

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
    }, [selected]);

    useEffect(() => {
        const preload = (item) => {
            if (!item || loadedCache.current.has(item.url)) return;
            const img = new Image();
            img.src = item.url;
            img.onload = () => loadedCache.current.add(item.url);
        };

        preload(mediaItems[selected]);
        preload(mediaItems[selected + 1]);
        preload(mediaItems[selected - 1]);
    }, [selected, mediaItems]);

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
        <div
            className="relative flex flex-col items-center mx-auto mt-5 mb-5 lg:mt-0"
            ref={MediaRef}
        >
            <div
                className="relative flex items-center justify-center flex-shrink-0 overflow-hidden rounded-sm "
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
                    <img
                        src={mediaItems[selected]?.url || Placeholder}
                        alt={`Smartphone ${selected}`}
                        className="h-full w-full min-w-[300px] max-w-[300px] object-contain lg:min-w-[500px]"
                        loading="lazy"
                        decoding="async"
                        fetchpriority="low"
                        onError={(e) => e.target.src = Placeholder}
                    />
                </div>
                <AnimatePresence initial={false} custom={direction}>
                    <div className="absolute inset-0 flex items-center justify-center w-full h-full">
                        {mediaItems.map((item, idx) => {

                            const isCurrent = idx === selected;


                            return (
                                <motion.div
                                    key={item.url}
                                    initial={false}
                                    animate={{
                                        opacity: isCurrent ? 1 : 0,
                                        zIndex: isCurrent ? 1 : 0,
                                    }}
                                    transition={{ duration: 0.4, ease: 'easeInOut' }}
                                    className="absolute inset-0 flex items-center justify-center w-full h-full"
                                >
                                    <img
                                        src={item.url || Placeholder}
                                        alt={`Smartphone ${idx}`}
                                        className="object-contain w-full h-full rounded-xl"
                                        onLoad={() => loadedCache.current.add(item.url)}
                                        onError={(e) => e.target.src = Placeholder}
                                        loading={isCurrent ? "eager" : "lazy"}
                                        decoding="async"
                                        fetchpriority={isCurrent ? "high" : "low"}
                                    />
                                </motion.div>
                            )
                        })}
                    </div>
                </AnimatePresence>
            </div>

            {windowSize.width > 1024 && mediaItems.length > 1 && (
                <div className="mt-3 flex max-w-[31vw] gap-2 overflow-x-hidden px-2 scrollbar-none">
                    {mediaItems.map((item, idx) => (
                        <button
                            key={idx}
                            ref={(el) => (mediaThumbRefs.current[idx] = el)}
                            onClick={() => onSelectMediaIndex(idx)}
                            className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-sm border transition-all duration-200 ${selectedMediaIndex === idx
                                ? 'border-indigo-600 ring-2 ring-indigo-400'
                                : 'border-gray-300 hover:border-gray-500'
                                }`}
                        >
                            <img
                                src={item.url || Placeholder}
                                alt={`Smartphone ${idx}`}
                                className="object-contain object-center w-full h-full "
                                onError={(e) => e.target.src = Placeholder}
                                loading={selectedMediaIndex === idx ? "eager" : "lazy"}
                                decoding="async"
                                fetchpriority={selectedMediaIndex === idx ? "high" : "low"}
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
