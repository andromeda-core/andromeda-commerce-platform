import React, { memo, useEffect, useState } from 'react';



const MasonryFeedItem = memo(({ item, onClick, Placeholder, currency, Index }) => {
    const [loaded, setLoaded] = useState(false);
    const loadingStrategy = Index < 6 ? 'eager' : 'lazy';

    if (item.type === 'posts') {
        return (
            <article
                className="relative mb-2 overflow-hidden transition-all duration-300 rounded-md cursor-pointer no-touch-hover break-inside-avoid group"
                style={{
                    WebkitColumnBreakInside: 'avoid',
                    pageBreakInside: 'avoid',
                    breakInside: 'avoid'
                }}
                onClick={onClick}
            >


                {item?.images ? (
                    <div className="relative">

                        {!loaded && (
                            <div
                                className="relative w-full overflow-hidden"
                                style={{ paddingBottom: '100%' }} // 1:1 aspect ratio
                            >
                                <div
                                    className="absolute inset-0 animate-pulse bg-gradient-to-r from-surface-1-light via-surface-2-light to-surface-3-light dark:from-surface-1-dark dark:via-surface-2-dark dark:to-surface-3-dark"
                                />
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
                                display: loaded ? 'block' : 'none',
                                width: '100%',
                                height: 'auto'
                            }}
                            className="object-cover text-[10px] text-black  transition-transform duration-500 group-hover:scale-105  no-touch-hover    dark:text-white"
                        />

                        {loaded && (
                            <>
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
                            </>
                        )}
                    </div>
                ) : !item?.images && item?.videos ? (
                    <div className="relative">


                        {!loaded && (
                            <div
                                className="relative w-full overflow-hidden"
                                style={{ paddingBottom: '100%' }} // 1:1 aspect ratio
                            >
                                <div
                                    className="absolute inset-0 animate-pulse bg-gradient-to-r from-surface-1-light via-surface-2-light to-surface-3-light dark:from-surface-1-dark dark:via-surface-2-dark dark:to-surface-3-dark"
                                />
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
                                display: loaded ? 'block' : 'none',
                                width: '100%',
                                height: 'auto'
                            }}
                            className="object-cover text-[10px] text-black transition-transform duration-500  no-touch-hover  group-hover:scale-105 dark:text-white"
                        />

                        {loaded && (
                            <>
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
                            </>
                        )}

                    </div>
                ) : (
                    <div className="relative flex flex-col justify-between bg-[#F2F2F2] p-5 text-black dark:bg-[#485260] dark:text-white">
                        <div className="flex items-center justify-between">
                            <span className="mb-3 text-[8px] drop-shadow-md sm:text-[9px] md:text-[10px] lg:text-[17px]">
                                {item?.tag}
                            </span>
                        </div>

                        <div>
                            <p className="line-clamp-5 break-all whitespace-pre-line text-[8px] opacity-90 sm:text-[9px] md:text-[10px] lg:text-[17px]">
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
            className="relative mb-2 overflow-hidden transition-all duration-300 rounded-md cursor-pointer break-inside-avoid group"
            style={{
                WebkitColumnBreakInside: 'avoid',
                pageBreakInside: 'avoid',
                breakInside: 'avoid'
            }}
            onClick={onClick}
        >



            <div className="relative">

                {!loaded && (
                    <div
                        className="relative w-full overflow-hidden"
                        style={{ paddingBottom: '100%' }} // 1:1 aspect ratio
                    >
                        <div
                            className="absolute inset-0 animate-pulse bg-gradient-to-r from-surface-1-light via-surface-2-light to-surface-3-light dark:from-surface-1-dark dark:via-surface-2-dark dark:to-surface-3-dark"
                        />
                    </div>
                )}

                <img
                    src={item.images?.[0] || Placeholder}
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
                        display: loaded ? 'block' : 'none',
                        width: '100%',
                        height: 'auto'
                    }}
                    className="object-cover text-[10px] text-black transition-transform duration-500  no-touch-hover  group-hover:scale-105  dark:text-white"
                />

                {loaded && (
                    <>
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
                    </>
                )}
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
