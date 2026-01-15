import React, { memo, useEffect, useRef, useState } from 'react';

const MobileFeedSkeleton = () => {
    const containerRef = useRef(null);
    const [feedItemHeight, setFeedItemHeight] = useState(window.innerHeight);

    useEffect(() => {
        const updateHeight = () => {
            setFeedItemHeight(window.visualViewport?.height || window.innerHeight);
        };

        window.addEventListener('resize', updateHeight);
        window.addEventListener('orientationchange', updateHeight);

        return () => {
            window.removeEventListener('resize', updateHeight);
            window.removeEventListener('orientationchange', updateHeight);
        };
    }, []);

    return (
        <div className="fixed inset-0 z-[60] bg-backgroundLight dark:bg-backgroundDark">

            <div
                ref={containerRef}
                className="relative min-w-full snap-start"
                style={{
                    height: feedItemHeight,
                    scrollSnapAlign: 'start',
                    scrollSnapStop: 'always',
                    overflow: 'hidden',
                }}
            >
                {/* HEADER */}
                <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 pt-4">
                    <div className="w-20 h-5 bg-gray-200 rounded animate-pulse dark:bg-zinc-700" />
                    <div className="w-6 h-6 bg-gray-200 rounded animate-pulse dark:bg-zinc-700" />
                </div>

                {/* MEDIA AREA */}
                <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-gray-200 animate-pulse dark:bg-zinc-700" />

                    {/* TOP GRADIENT */}
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-[40%] bg-gradient-to-b from-black/40 to-transparent" />

                    {/* BOTTOM GRADIENT */}
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[40%] bg-gradient-to-t from-black/40 to-transparent" />
                </div>

                {/* BOTTOM CONTENT */}
                <div className="absolute left-0 right-0 z-20 px-5 bottom-20">
                    <div className="flex justify-end mb-3">
                        <div className="h-[30px] w-[90px] rounded-full bg-gray-200 animate-pulse dark:bg-zinc-700" />
                    </div>

                    <div className="space-y-2">
                        <div className="w-full h-4 bg-gray-200 rounded animate-pulse dark:bg-zinc-700" />
                        <div className="w-2/3 h-4 bg-gray-200 rounded animate-pulse dark:bg-zinc-700" />
                    </div>
                </div>
            </div>
        </div>
    )
};

export default memo(MobileFeedSkeleton);
