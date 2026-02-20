
import Spinner from '@/Components/Spinner';
import { router } from '@inertiajs/react';
import React, { memo, useState } from 'react';

const MasonryFeedItem = memo(
    ({
        item,
        onClick,
        Placeholder,
        currency,
        Index,
        isBookmarkPage = false,
        setBookmarkedPosts,
        setBookmarkStatusChanged,
        setBookmarkActionPost,
        windowSize,
    }) => {
        const [loaded, setLoaded] = useState(false);

        const [unmarking, setUnmarking] = useState(false);
        const loadingStrategy = Index < 6 ? 'eager' : 'lazy';

        if (item.type === 'posts') {
            return (
                <article
                    className="relative mb-2 overflow-hidden transition-all duration-300 rounded-md cursor-pointer group break-inside-avoid"
                    style={{
                        WebkitColumnBreakInside: 'avoid',
                        pageBreakInside: 'avoid',
                        breakInside: 'avoid',
                    }}
                    onClick={onClick}
                >
                    {item?.images ? (
                        <div className="relative">
                            <div className="transition-transform duration-500 lg:group-hover:scale-105">
                                {/* Top gradient */}
                                <div
                                    className="pointer-events-none absolute inset-x-0 top-0 h-[40%]"
                                    style={{
                                        background:
                                            'linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(0,0,0,0))',
                                        mixBlendMode: 'multiply',
                                    }}
                                />

                                {/* Bottom gradient */}
                                <div
                                    className="pointer-events-none absolute inset-x-0 bottom-0 h-[40%]"
                                    style={{
                                        background:
                                            'linear-gradient(to top, rgba(0,0,0,0.4), rgba(0,0,0,0))',
                                        mixBlendMode: 'multiply',
                                    }}
                                />

                                {!loaded && (
                                    <div
                                        className="relative w-full overflow-hidden"
                                        style={{ paddingBottom: '100%' }}
                                    >
                                        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-surface-1-light via-surface-2-light to-surface-3-light dark:from-surface-1-dark dark:via-surface-2-dark dark:to-surface-3-dark" />
                                    </div>
                                )}
                                <img
                                    src={item?.images[0]?.url || Placeholder}
                                    alt={item?.title}
                                    loading={loadingStrategy}
                                    decoding="async"
                                    onLoad={() => {
                                        setLoaded(true);
                                    }}
                                    onError={(e) => {
                                        e.target.src = Placeholder;
                                        setLoaded(true);
                                    }}
                                    style={{
                                        opacity: loaded ? 1 : 0,
                                        width: '100%',
                                        height: 'auto',
                                    }}
                                    className="object-cover text-[10px] text-black dark:text-white"
                                />
                            </div>

                            {loaded && (
                                <>
                                    <div className="absolute left-3 top-3">
                                        <span className=" text-white font-semibold text-[13px] lg:text-[14px] leading-[17px]">
                                            {item?.tag}
                                        </span>
                                    </div>

                                    {isBookmarkPage && (
                                        <div
                                            className="absolute z-30 pointer-events-auto right-3 top-3"
                                            onClick={(e) => {
                                                setUnmarking(true);
                                                e.stopPropagation();
                                                router.delete(
                                                    route('website.bookmarks.destroy', {
                                                        post_id: item.id,
                                                    }),
                                                    {
                                                        preserveScroll: true,

                                                        onSuccess: () => {
                                                            const updatedItem = {
                                                                ...item,
                                                                is_bookmarked: false,
                                                            };
                                                            setBookmarkActionPost(updatedItem);
                                                            setBookmarkStatusChanged(true);
                                                            setBookmarkedPosts((prev) =>
                                                                prev.filter(
                                                                    (post) => post.id !== item.id,
                                                                ),
                                                            );
                                                        },

                                                        onFinish: () => {
                                                            setUnmarking(false);
                                                        },
                                                    },
                                                );
                                            }}
                                        >
                                            <button className="text-[8px] text-main-text-light dark:text-main-text-dark sm:text-[9px] md:text-[10px] lg:text-[14px]">
                                                {unmarking ? (
                                                    <Spinner />
                                                ) : (
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill={'white'}
                                                        viewBox="0 0 24 24"
                                                        strokeWidth={1.5}
                                                        stroke="currentColor"
                                                        className="size-6"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z"
                                                        />
                                                    </svg>
                                                )}
                                            </button>
                                        </div>
                                    )}

                                    <div className="absolute inset-x-0 bottom-0 p-4">
                                        <div className="mt-1 flex items-center justify-between text-[13px] lg:text-[14px] leading-[17px]">
                                            <p className="flex-1 min-w-0 font-semibold text-main-text-dark">
                                                <span
                                                    className="line-clamp-2 break-all !display-['-webkit-box'] [&_*]:inline "
                                                    dangerouslySetInnerHTML={{
                                                        __html: item?.content?.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim(),
                                                    }}
                                                />
                                            </p>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    ) : !item?.images && item?.videos ? (
                        <div className="relative">
                            <div className="transition-transform duration-500 lg:group-hover:scale-105">
                                {/* Top gradient */}
                                <div
                                    className="pointer-events-none absolute inset-x-0 top-0 h-[40%]"
                                    style={{
                                        background:
                                            'linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(0,0,0,0))',
                                        mixBlendMode: 'multiply',
                                    }}
                                />

                                {/* Bottom gradient */}
                                <div
                                    className="pointer-events-none absolute inset-x-0 bottom-0 h-[40%]"
                                    style={{
                                        background:
                                            'linear-gradient(to top, rgba(0,0,0,0.4), rgba(0,0,0,0))',
                                        mixBlendMode: 'multiply',
                                    }}
                                />

                                {!loaded && (
                                    <div
                                        className="relative w-full overflow-hidden"
                                        style={{ paddingBottom: '100%' }}
                                    >
                                        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-surface-1-light via-surface-2-light to-surface-3-light dark:from-surface-1-dark dark:via-surface-2-dark dark:to-surface-3-dark" />
                                    </div>
                                )}

                                <img
                                    src={item?.videos[0]?.thumbnail_url || Placeholder}
                                    alt={item?.title}
                                    loading={loadingStrategy}
                                    decoding="async"
                                    onLoad={() => {
                                        setLoaded(true);
                                    }}
                                    onError={(e) => {
                                        e.target.src = Placeholder;
                                        setLoaded(true);
                                    }}
                                    style={{
                                        opacity: loaded ? 1 : 0,
                                        width: '100%',
                                        height: 'auto',
                                    }}
                                    className="object-cover text-[10px] text-black dark:text-white"
                                />
                            </div>

                            {loaded && (
                                <>
                                    <div className="absolute left-3 top-3">
                                        <span className=" text-white  font-semibold text-[13px] lg:text-[14px] leading-[17px]">
                                            {item?.tag}
                                        </span>
                                    </div>


                                    {isBookmarkPage && (
                                        <div
                                            className="absolute z-30 pointer-events-auto right-3 top-3"
                                            onClick={(e) => {
                                                setUnmarking(true);
                                                e.stopPropagation();
                                                router.delete(
                                                    route('website.bookmarks.destroy', {
                                                        post_id: item.id,
                                                    }),
                                                    {
                                                        preserveScroll: true,

                                                        onSuccess: () => {
                                                            const updatedItem = {
                                                                ...item,
                                                                is_bookmarked: false,
                                                            };
                                                            setBookmarkActionPost(updatedItem);
                                                            setBookmarkStatusChanged(true);
                                                            setBookmarkedPosts((prev) =>
                                                                prev.filter(
                                                                    (post) => post.id !== item.id,
                                                                ),
                                                            );
                                                        },

                                                        onFinish: () => {
                                                            setUnmarking(false);
                                                        },
                                                    },
                                                );
                                            }}
                                        >
                                            <button className="text-[8px] text-main-text-light dark:text-main-text-dark sm:text-[9px] md:text-[10px] lg:text-[14px]">
                                                {unmarking ? (
                                                    <Spinner />
                                                ) : (
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill={'white'}
                                                        viewBox="0 0 24 24"
                                                        strokeWidth={1.5}
                                                        stroke="currentColor"
                                                        className="size-6"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z"
                                                        />
                                                    </svg>
                                                )}
                                            </button>
                                        </div>
                                    )}

                                    <div className="absolute inset-x-0 bottom-0 p-4">
                                        <div className="mt-1 flex items-center justify-between text-[13px] lg:text-[14px] leading-[17px]">
                                            <p className="flex-1 min-w-0 font-semibold text-main-text-dark">
                                                <span
                                                    className="line-clamp-2 break-all !display-['-webkit-box'] [&_*]:inline"
                                                    dangerouslySetInnerHTML={{
                                                        __html: item?.content?.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim(),
                                                    }}
                                                />
                                            </p>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className={`relative flex flex-col bg-surface-2-light lg:group-hover:scale-[1.02] transition-all duration-500 dark:bg-surface-2-dark p-[18px] text-black dark:text-white w-full ${windowSize.width > 1024 ? ' min-h-[clamp(300px,100%,100%)]' : ''}`}>

                            <div className="absolute left-4 top-3">
                                <span className=" text-black dark:text-white font-semibold text-[13px] lg:text-[14px] leading-[17px]">
                                    {item?.tag}
                                </span>
                            </div>

                            {isBookmarkPage && (
                                <div
                                    className="absolute z-30 pointer-events-auto right-3 top-3"
                                    onClick={(e) => {
                                        setUnmarking(true);
                                        e.stopPropagation();
                                        router.delete(
                                            route('website.bookmarks.destroy', {
                                                post_id: item.id,
                                            }),
                                            {
                                                preserveScroll: true,

                                                onSuccess: () => {
                                                    const updatedItem = {
                                                        ...item,
                                                        is_bookmarked: false,
                                                    };
                                                    setBookmarkActionPost(updatedItem);
                                                    setBookmarkStatusChanged(true);
                                                    setBookmarkedPosts((prev) =>
                                                        prev.filter(
                                                            (post) => post.id !== item.id,
                                                        ),
                                                    );
                                                },

                                                onFinish: () => {
                                                    setUnmarking(false);
                                                },
                                            },
                                        );
                                    }}
                                >
                                    <button className="text-[8px] text-main-text-light dark:text-main-text-dark sm:text-[9px] md:text-[10px] lg:text-[14px]">
                                        {unmarking ? (
                                            <Spinner />
                                        ) : (
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill={'white'}
                                                viewBox="0 0 24 24"
                                                strokeWidth={1.5}
                                                stroke="currentColor"
                                                className="size-6"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z"
                                                />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            )}

                            <div className="mt-10">
                                <p className="xl:line-clamp-[20] lg:line-clamp-[16] line-clamp-6 md:line-clamp-[12] sm:line-clamp-[10] whitespace-pre-line break-all opacity-90  text-[13px] lg:text-[14px] leading-[17px]">
                                    <span
                                        dangerouslySetInnerHTML={{
                                            __html: item?.content.trim(),
                                        }}
                                    ></span>
                                </p>
                            </div>
                        </div>
                    )}



                </article>
            );
        }

        // Smartphones
        return (
            <article
                className="relative mb-2 overflow-hidden transition-all duration-300 rounded-md cursor-pointer group break-inside-avoid"
                style={{
                    WebkitColumnBreakInside: 'avoid',
                    pageBreakInside: 'avoid',
                    breakInside: 'avoid',
                }}
                onClick={onClick}
            >
                {item?.images ? (
                    <div className="relative">
                        <div className="transition-transform duration-500 lg:group-hover:scale-105">
                            {/* Top gradient */}
                            <div
                                className="pointer-events-none absolute inset-x-0 top-0 h-[40%]"
                                style={{
                                    background:
                                        'linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(0,0,0,0))',
                                    mixBlendMode: 'multiply',
                                }}
                            />

                            {/* Bottom gradient */}
                            <div
                                className="pointer-events-none absolute inset-x-0 bottom-0 h-[40%]"
                                style={{
                                    background:
                                        'linear-gradient(to top, rgba(0,0,0,0.4), rgba(0,0,0,0))',
                                    mixBlendMode: 'multiply',
                                }}
                            />

                            {!loaded && (
                                <div
                                    className="relative w-full overflow-hidden"
                                    style={{ paddingBottom: '100%' }}
                                >
                                    <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-surface-1-light via-surface-2-light to-surface-3-light dark:from-surface-1-dark dark:via-surface-2-dark dark:to-surface-3-dark" />
                                </div>
                            )}

                            <img
                                src={item.images[0]?.url || Placeholder}
                                alt={item.name}
                                loading={loadingStrategy}
                                decoding="async"
                                onLoad={() => {
                                    setLoaded(true);
                                }}
                                onError={(e) => {
                                    e.target.src = Placeholder;
                                    setLoaded(true);
                                }}
                                style={{
                                    opacity: loaded ? 1 : 0,
                                    width: '100%',
                                    height: 'auto',
                                }}
                                className="object-cover text-[10px] text-black dark:text-white"
                            />
                        </div>

                        {loaded && (
                            <>
                                <div className="absolute left-3 top-3">
                                    <span className="font-semibold text-white  text-[13px] lg:text-[14px] leading-[17px]">
                                        {item?.tag}
                                    </span>
                                </div>

                                <div className="absolute inset-x-0 bottom-0 p-3 bg-transparent">
                                    <div className="mt-2 flex flex-col font-semibold items-start text-[13px] lg:text-[14px] leading-[17px] w-full">
                                        <p className="w-full text-white truncate">
                                            {item.selling_info?.total_price
                                                ? `${currency?.symbol}${item.selling_info.total_price}`
                                                : ''}
                                        </p>

                                        <p className="w-full text-white truncate">
                                            {item.name} ({item.capacity})
                                        </p>
                                    </div>
                                </div>

                            </>
                        )}
                    </div>
                ) : !item?.images && item?.videos ? (
                    <div className="relative">
                        <div className="transition-transform duration-500 lg:group-hover:scale-105">
                            {/* Top gradient */}
                            <div
                                className="pointer-events-none absolute inset-x-0 top-0 h-[40%]"
                                style={{
                                    background:
                                        'linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(0,0,0,0))',
                                    mixBlendMode: 'multiply',
                                }}
                            />

                            {/* Bottom gradient */}
                            <div
                                className="pointer-events-none absolute inset-x-0 bottom-0 h-[40%]"
                                style={{
                                    background:
                                        'linear-gradient(to top, rgba(0,0,0,0.4), rgba(0,0,0,0))',
                                    mixBlendMode: 'multiply',
                                }}
                            />

                            {!loaded && (
                                <div
                                    className="relative w-full overflow-hidden"
                                    style={{ paddingBottom: '100%' }}
                                >
                                    <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-surface-1-light via-surface-2-light to-surface-3-light dark:from-surface-1-dark dark:via-surface-2-dark dark:to-surface-3-dark" />
                                </div>
                            )}

                            <img
                                src={item?.videos[0]?.thumbnail_url || Placeholder}
                                alt={item?.title}
                                loading={loadingStrategy}
                                decoding="async"
                                onLoad={() => {
                                    setLoaded(true);
                                }}
                                onError={(e) => {
                                    e.target.src = Placeholder;
                                    setLoaded(true);
                                }}
                                style={{
                                    opacity: loaded ? 1 : 0,
                                    width: '100%',
                                    height: 'auto',
                                }}
                                className="object-cover text-[10px] text-black dark:text-white"
                            />
                        </div>

                        {loaded && (
                            <>
                                <div className="absolute inset-x-0 bottom-0 p-3 bg-transparent">
                                    <div className="mt-2 flex flex-col font-semibold items-start text-[13px] lg:text-[14px] leading-[17px] w-full">
                                        <p className="w-full text-white truncate">
                                            {item.selling_info?.total_price
                                                ? `${currency?.symbol}${item.selling_info.total_price}`
                                                : ''}
                                        </p>

                                        <p className="w-full text-white truncate">
                                            {item.name} ({item.capacity})
                                        </p>
                                    </div>
                                </div>

                            </>
                        )}
                    </div>
                ) : (
                    <div className={`relative flex flex-col bg-surface-2-light dark:bg-surface-2-dark p-[18px] text-black lg:group-hover:scale-[1.02] transition-all duration-500 dark:text-white w-full ${windowSize.width > 1024 ? ' min-h-[clamp(300px,100%,100%)]' : ''}`}>

                        <div className="absolute left-4 top-3">
                            <span className=" text-black dark:text-white font-semibold text-[13px] lg:text-[14px] leading-[17px]">
                                {item?.tag}
                            </span>
                        </div>



                        <div className="relative mt-10 pb-[42px]">
                            <p className="xl:line-clamp-[20] lg:line-clamp-[16] line-clamp-6 md:line-clamp-[12] sm:line-clamp-[10] whitespace-pre-line break-all opacity-90 text-[13px] lg:text-[14px] leading-[17px]]">
                                <span
                                    dangerouslySetInnerHTML={{
                                        __html: item?.content.trim(),
                                    }}
                                ></span>
                            </p>

                            {/* PRICE bottom bar */}
                            <div className="absolute inset-x-0 bottom-0 bg-transparent text-main-text-light dark:text-main-text-dark">
                                <div className="flex flex-col font-semibold items-start text-[13px] lg:text-[14px] leading-[17px] w-full">
                                    <p className="w-full truncate">
                                        {item.selling_info?.total_price
                                            ? `${currency?.symbol}${item.selling_info.total_price}`
                                            : ''}
                                    </p>
                                </div>
                            </div>
                        </div>


                    </div>
                )}

            </article>
        );
    },
    (prevProps, nextProps) => {
        return (
            prevProps.item.id === nextProps.item.id &&
            prevProps.item.type === nextProps.item.type &&
            prevProps.index === nextProps.index
        );
    },
);

export default MasonryFeedItem;
