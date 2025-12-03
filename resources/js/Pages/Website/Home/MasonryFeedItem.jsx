import React, { memo, useEffect } from 'react';



const MasonryFeedItem = memo(({ item, onClick, Placeholder, currency }) => {

    useEffect(() => {
        function fixSafari() {
            window.dispatchEvent(new Event("resize"));
        }

        document.addEventListener("webkitfullscreenchange", fixSafari);
        document.addEventListener("fullscreenchange", fixSafari);

        return () => {
            document.removeEventListener("webkitfullscreenchange", fixSafari);
            document.removeEventListener("fullscreenchange", fixSafari);
        };
    }, []);


    if (item.type === 'posts') {
        return (
            <article
                className="[-webkit-column-break-inside:avoid] relative mb-1 overflow-hidden transition-all duration-300 rounded-none shadow-md cursor-pointer will-change-transform masonry-item no-touch-hover group break-inside-avoid  hover:-translate-y-1 hover:shadow-xl lg:mb-2"
                onClick={onClick}
            >
                {item?.images ? (
                    <div className="relative">
                        <img
                            src={item?.images[0]?.url || Placeholder}
                            alt={item?.title}
                            loading="lazy"
                            decoding="async"
                            onError={(e) => (e.target.src = Placeholder)}
                            className="w-full object-cover text-[10px] text-gray-700 transition-all duration-500 group-hover:scale-105 dark:text-white/80 dark:opacity-80"
                        />

                        <div className="absolute left-3 top-3">
                            <span className="text-[8px] text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)] sm:text-[9px] md:text-[10px] lg:text-[17px]">
                                {item?.tag}
                            </span>
                        </div>

                        <div className="absolute inset-x-0 bottom-0 p-4">
                            <div className="mt-1 flex items-center justify-between text-[8px] font-bold text-gray-200 drop-shadow-sm sm:text-[9px] md:text-[10px] lg:text-[17px]">
                                <p className="text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)] overflow-hidden text-ellipsis whitespace-nowrap block">
                                    {item?.content && item.content.length > 30 ? (
                                        <span
                                            dangerouslySetInnerHTML={{
                                                __html:
                                                    item.content.substring(0, 30) +
                                                    '...',
                                            }}
                                        />
                                    ) : (
                                        <span
                                            dangerouslySetInnerHTML={{
                                                __html: item?.content,
                                            }}
                                        />
                                    )}
                                </p>

                            </div>
                        </div>
                    </div>
                ) : !item?.images && item?.videos ? (
                    <div className="relative">
                        <img
                            src={item?.videos[0]?.thumbnail_url || Placeholder}
                            alt={item?.title}
                            loading="lazy"
                            decoding="async"

                            onError={(e) => (e.target.src = Placeholder)}
                            className="w-full object-cover text-[10px] text-gray-700 transition-all duration-500 group-hover:scale-105 dark:text-white/80 dark:opacity-80"
                        />

                        <div className="absolute left-3 top-3">
                            <span className="text-[8px] text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)] sm:text-[9px] md:text-[10px] lg:text-[17px]">
                                {item?.tag}
                            </span>
                        </div>

                        <div className="absolute inset-x-0 bottom-0 p-4">
                            <div className="mt-1 flex items-center justify-between text-[8px] font-bold text-gray-200 drop-shadow-sm sm:text-[9px] md:text-[10px] lg:text-[17px]">
                                <p className="text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)] overflow-hidden text-ellipsis whitespace-nowrap block">
                                    {item?.content && item.content.length > 30 ? (
                                        <span
                                            dangerouslySetInnerHTML={{
                                                __html:
                                                    item.content.substring(0, 30) +
                                                    '...',
                                            }}
                                        />
                                    ) : (
                                        <span
                                            dangerouslySetInnerHTML={{
                                                __html: item?.content,
                                            }}
                                        />
                                    )}
                                </p>


                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="relative flex flex-col justify-between bg-[#F2F2F2] p-5 text-gray-700 dark:bg-[#485260] dark:text-white/80">
                        <div className="flex items-center justify-between">
                            <span className="mb-3 text-[8px] drop-shadow-md sm:text-[9px] md:text-[10px] lg:text-[17px]">
                                {item?.tag}
                            </span>
                        </div>

                        <div>
                            <p className="line-clamp-5 text-[8px] opacity-90 sm:text-[9px] md:text-[10px] lg:text-[17px]">
                                {item.content.length > 400 ? (
                                    <span
                                        dangerouslySetInnerHTML={{
                                            __html: item?.content.substring(0, 400) + '...',
                                        }}
                                    ></span>
                                ) : (
                                    <span
                                        dangerouslySetInnerHTML={{
                                            __html: item?.content,
                                        }}
                                    ></span>
                                )}
                            </p>
                        </div>
                        <div className="mt-1 flex items-center justify-between text-[8px] font-medium drop-shadow-sm sm:text-[9px] md:text-[10px] lg:text-[17px]">
                            <span>
                                {item?.title.length > 20
                                    ? item?.title.slice(0, 20) + '...'
                                    : item?.title}
                            </span>
                        </div>
                    </div>
                )}
            </article>
        );
    }

    // Smartphones
    return (
        <article
            className="[-webkit-column-break-inside:avoid] relative mb-1 overflow-hidden transition-all  duration-300 rounded-none shadow-md cursor-pointer will-change-transform no-touch-hover group break-inside-avoid hover:-translate-y-1 hover:shadow-xl"
            onClick={onClick}
        >
            <div className="relative">
                <img
                    src={item.images?.[0] || Placeholder}
                    alt={item.name}
                    loading="lazy"
                    decoding="async"
                    onError={(e) => (e.target.src = Placeholder)}

                    className="object-cover w-full transition-all duration-500 group-hover:scale-105 dark:opacity-80"
                />

                <div className="absolute left-3 top-3">
                    <span className="text-[8px] text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)] sm:text-[9px] md:text-[10px] lg:text-[17px]">
                        {item?.tag}
                    </span>
                </div>

                <div className="absolute inset-x-0 bottom-0 p-3 bg-transparent">
                    <div className="mt-2 flex items-center justify-between text-[8px] font-bold text-gray-200 drop-shadow-sm sm:text-[9px] md:text-[10px] lg:text-[17px]">
                        <p className="text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)] overflow-hidden text-ellipsis whitespace-nowrap block">
                            {item.name.length > 20 ? item.name.slice(0, 20) + '...' : item.name}{' '}
                            (
                            {item.capacity.length > 10
                                ? item.capacity.slice(0, 10) + '...'
                                : item.capacity}
                            )
                        </p>

                        <p className="text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)] overflow-hidden text-ellipsis whitespace-nowrap block">
                            {item.selling_info?.total_price
                                ? `${currency?.symbol} ${item.selling_info.total_price}`
                                : ''}
                        </p>
                    </div>
                </div>
            </div>
        </article>
    );
}, (prevProps, nextProps) => {
    return (
        prevProps.item.id === nextProps.item.id &&
        prevProps.item.type === nextProps.item.type &&
        prevProps.index === nextProps.index
    );
});


export default MasonryFeedItem;
