// TRACKING SCROLL EVENT
useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let lastScrollTop = 0;
    let lastScrollLeft = 0;

    const handleScroll = () => {
        const currentScrollTop = container.scrollTop;
        const currentScrollLeft = container.scrollLeft;

        const deltaY = currentScrollTop - lastScrollTop;
        const deltaX = currentScrollLeft - lastScrollLeft;

        if (Math.abs(deltaY) > Math.abs(deltaX)) {
            //    Y AXIS SCROLL
            if (deltaY > 0) {
                console.log('🟢 Scrolling Down', deltaY);
            } else {
                console.log('🔵 Scrolling Up', deltaY);
            }
        } else if (Math.abs(deltaX) > Math.abs(deltaY)) {
            //    X Axis SCROLL
            if (deltaX > 0) {
                console.log('🟣 Scrolling Right', deltaX);
            } else {
                console.log('🟠 Scrolling Left', deltaX);
            }
        }

        // Update previous values
        lastScrollTop = currentScrollTop;
        lastScrollLeft = currentScrollLeft;
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
}, []);
{
    viewablePost !== '' &&
        isMobilePostViewer &&
        createPortal(
            <>
                <div className="fixed inset-0 z-[70] bg-deepcharcoal">
                    {/* Backdrop */}
                    {/* <div className="absolute inset-0 pointer-events-none bg-black/70"></div> */}

                    {/* Scrollable Container */}
                    <div
                        tabIndex={0}
                        className="h-screen w-full snap-y snap-mandatory overflow-y-scroll scrollbar-none"
                        style={{
                            overscrollBehavior: 'contain',
                            scrollSnapType: 'y mandatory',
                            scrollSnapStop: 'always',
                            WebkitOverflowScrolling: 'touch',
                            scrollBehavior: 'smooth',
                        }}
                        ref={mobilePostContainerRef}
                    >
                        {posts.map((post, index) => {
                            const activeViewerType = activeViewerMap[post.slug];
                            const relatedPosts = getRelatedPosts(post.slug);
                            const relatedViewer = getRelatedViewer(post.slug);

                            return (
                                <div
                                    key={post.id}
                                    ref={(el) => (postsRefs.current[index] = el)}
                                    className="relative h-[100dvh] w-full snap-start snap-always"
                                    style={{
                                        scrollSnapAlign: 'start',
                                        scrollSnapStop: 'always',
                                    }}
                                >
                                    {/* Top Bar */}

                                    {(activeViewerType === 'main' || !activeViewerType) && (
                                        <div className="absolute left-0 right-0 top-0 z-20 flex items-center justify-between px-4 py-3 font-bold text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
                                            {/* <button
                                                            onClick={() => {
                                                                setViewablePost('');
                                                                setRelatedPosts(null);
                                                                setIsDesktopPostViewer(false);
                                                                setIsMobilePostViewer(false);
                                                                window.history.replaceState(
                                                                    {},
                                                                    '',
                                                                    window.location.pathname,
                                                                );
                                                            }}
                                                            className="p-1 rounded-full hover:bg-gray-300/20"
                                                        >

                                                            <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            strokeWidth={1.5}
                                                            stroke="currentColor"
                                                            className="size-6"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
                                                            />
                                                        </svg>


                                                            <span className="text-sm prose break-words text-white/80">
                                                            {post?.title}
                                                        </span>
                                                        </button> */}

                                            {/* hashtag */}
                                            <div>
                                                {post?.tag && (
                                                    <button
                                                        onClick={() => {
                                                            navigateToHashtag(post?.tag);
                                                        }}
                                                        className="text-sm text-white/80"
                                                    >
                                                        {post?.tag}
                                                    </button>
                                                )}
                                            </div>

                                            <div className="flex items-center space-x-3">
                                                {/* Elipsis button */}
                                                <button
                                                    ref={elipsisButtonRef}
                                                    data-elipsis-button
                                                    className="rounded-full p-1 hover:bg-gray-300/20"
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        strokeWidth={1.5}
                                                        stroke="currentColor"
                                                        className="pointer-events-none size-6"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                                                            className="pointer-events-none"
                                                        />
                                                    </svg>
                                                </button>

                                                {/* Elipsis Dropdown Menu */}
                                                {showElipsisDropdown && isMobilePostViewer && (
                                                    <>
                                                        <div
                                                            ref={elipsisDropDownRef}
                                                            data-elipsis-dropdown
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="absolute right-0 top-full z-[99999] mt-2 w-36 rounded-lg border border-gray-900 bg-deepcharcoal shadow-xl sm:w-48"
                                                        >
                                                            <ul
                                                                className="overflow-y-scroll py-1 text-sm text-gray-200 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white"
                                                                style={{
                                                                    maxHeight: '180px',
                                                                }}
                                                            >
                                                                <li>
                                                                    <button
                                                                        onClick={(e) => {
                                                                            setShowQrCode(true);
                                                                            setElipsisShowDropdown(
                                                                                false,
                                                                            );
                                                                        }}
                                                                        className="flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-gray-950 hover:text-white"
                                                                    >
                                                                        <svg
                                                                            xmlns="http://www.w3.org/2000/svg"
                                                                            fill="none"
                                                                            viewBox="0 0 24 24"
                                                                            strokeWidth={1.5}
                                                                            stroke="currentColor"
                                                                            className="size-6"
                                                                        >
                                                                            <path
                                                                                strokeLinecap="round"
                                                                                strokeLinejoin="round"
                                                                                d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z"
                                                                            />
                                                                            <path
                                                                                strokeLinecap="round"
                                                                                strokeLinejoin="round"
                                                                                d="M6.75 6.75h.75v.75h-.75v-.75ZM6.75 16.5h.75v.75h-.75v-.75ZM16.5 6.75h.75v.75h-.75v-.75ZM13.5 13.5h.75v.75h-.75v-.75ZM13.5 19.5h.75v.75h-.75v-.75ZM19.5 13.5h.75v.75h-.75v-.75ZM19.5 19.5h.75v.75h-.75v-.75ZM16.5 16.5h.75v.75h-.75v-.75Z"
                                                                            />
                                                                        </svg>
                                                                        QR Code
                                                                    </button>
                                                                </li>

                                                                {auth?.user && (
                                                                    <li>
                                                                        <button
                                                                            className="flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-gray-950 hover:text-white"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                router.put(
                                                                                    route(
                                                                                        'website.posts.bookmark',
                                                                                        post?.id,
                                                                                    ),
                                                                                    {
                                                                                        post_id:
                                                                                            post?.id,
                                                                                    },
                                                                                    {
                                                                                        onSuccess:
                                                                                            () => {
                                                                                                post.is_bookmarked =
                                                                                                    !post.is_bookmarked;

                                                                                                setBookmarkStatusChanged(
                                                                                                    true,
                                                                                                );
                                                                                            },
                                                                                        onError: (
                                                                                            e,
                                                                                        ) => {
                                                                                            {
                                                                                                setShowErrorMessage(
                                                                                                    true,
                                                                                                );
                                                                                                setErrorMessage(
                                                                                                    e.message,
                                                                                                );
                                                                                            }
                                                                                        },

                                                                                        onFinish:
                                                                                            () => {
                                                                                                setElipsisShowDropdown(
                                                                                                    false,
                                                                                                );
                                                                                            },
                                                                                    },
                                                                                );
                                                                            }}
                                                                        >
                                                                            <svg
                                                                                xmlns="http://www.w3.org/2000/svg"
                                                                                fill={
                                                                                    post?.is_bookmarked
                                                                                        ? '#FFFFFF'
                                                                                        : 'none'
                                                                                }
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
                                                                            Bookmark
                                                                        </button>
                                                                    </li>
                                                                )}

                                                                <li>
                                                                    <button
                                                                        className="flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-gray-950 hover:text-white"
                                                                        onClick={(e) => {
                                                                            const url =
                                                                                route('home') +
                                                                                generateURL(post);
                                                                            navigator.clipboard.writeText(
                                                                                url.trim(),
                                                                            );

                                                                            setLinkCopied(true);

                                                                            setElipsisShowDropdown(
                                                                                false,
                                                                            );
                                                                        }}
                                                                    >
                                                                        <svg
                                                                            xmlns="http://www.w3.org/2000/svg"
                                                                            fill="none"
                                                                            viewBox="0 0 24 24"
                                                                            strokeWidth={1.5}
                                                                            stroke="currentColor"
                                                                            className="size-6"
                                                                        >
                                                                            <path
                                                                                strokeLinecap="round"
                                                                                strokeLinejoin="round"
                                                                                d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0 1 18 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3 1.5 1.5 3-3.75"
                                                                            />
                                                                        </svg>
                                                                        Copy Link
                                                                    </button>
                                                                </li>
                                                            </ul>
                                                        </div>
                                                    </>
                                                )}

                                                {/* Filter button */}
                                                {/* <button className="p-1 rounded-full hover:bg-gray-300/20">
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                strokeWidth={1.5}
                                                                stroke="currentColor"
                                                                className="size-6"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75"
                                                                />
                                                            </svg>
                                                        </button> */}
                                            </div>
                                        </div>
                                    )}

                                    {activeViewerType === 'related' && relatedViewer && (
                                        <div className="absolute left-0 right-0 top-0 z-20 flex items-center justify-between px-4 py-3 font-bold text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
                                            {/* <button
                                                            onClick={() => {
                                                                setViewablePost('');
                                                                setRelatedPosts(null);
                                                                setRelatedViewer(null);
                                                                setRelatedPostsNextPageUrl(null);
                                                                setIsDesktopPostViewer(false);
                                                                setIsMobilePostViewer(false);
                                                                window.history.replaceState(
                                                                    {},
                                                                    '',
                                                                    window.location.pathname,
                                                                );
                                                            }}
                                                            className="p-1 rounded-full hover:bg-gray-300/20"
                                                        >

                                                            <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            strokeWidth={1.5}
                                                            stroke="currentColor"
                                                            className="size-6"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
                                                            />
                                                        </svg>


                                                            <span className="text-sm prose break-words text-white/80">
                                                            {relatedViewer?.title}
                                                        </span>


                                                        </button> */}

                                            {/* hashtag */}
                                            <div>
                                                {post?.tag && (
                                                    <button
                                                        onClick={() => {
                                                            navigateToHashtag(relatedViewer?.tag);
                                                        }}
                                                        className="text-sm text-white/80"
                                                    >
                                                        {relatedViewer?.tag}
                                                    </button>
                                                )}
                                            </div>

                                            <div className="flex items-center space-x-3">
                                                {/* Elipsis button */}
                                                <button
                                                    ref={elipsisButtonRef}
                                                    data-elipsis-button
                                                    className="rounded-full p-1 hover:bg-gray-300/20"
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        strokeWidth={1.5}
                                                        stroke="currentColor"
                                                        className="pointer-events-none size-6"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                                                            className="pointer-events-none"
                                                        />
                                                    </svg>
                                                </button>

                                                {/* Elipsis Dropdown Menu */}
                                                {showElipsisDropdown && isMobilePostViewer && (
                                                    <>
                                                        <div
                                                            ref={elipsisDropDownRef}
                                                            data-elipsis-dropdown
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="absolute right-0 top-full z-[99999] mt-2 w-36 rounded-lg border border-gray-900 bg-deepcharcoal shadow-xl sm:w-48"
                                                        >
                                                            <ul
                                                                className="overflow-y-scroll py-1 text-sm text-gray-200 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white"
                                                                style={{
                                                                    maxHeight: '180px',
                                                                }}
                                                            >
                                                                <li>
                                                                    <button
                                                                        onClick={(e) => {
                                                                            setShowQrCode(true);
                                                                            setElipsisShowDropdown(
                                                                                false,
                                                                            );
                                                                        }}
                                                                        className="flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-gray-950 hover:text-white"
                                                                    >
                                                                        <svg
                                                                            xmlns="http://www.w3.org/2000/svg"
                                                                            fill="none"
                                                                            viewBox="0 0 24 24"
                                                                            strokeWidth={1.5}
                                                                            stroke="currentColor"
                                                                            className="size-6"
                                                                        >
                                                                            <path
                                                                                strokeLinecap="round"
                                                                                strokeLinejoin="round"
                                                                                d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z"
                                                                            />
                                                                            <path
                                                                                strokeLinecap="round"
                                                                                strokeLinejoin="round"
                                                                                d="M6.75 6.75h.75v.75h-.75v-.75ZM6.75 16.5h.75v.75h-.75v-.75ZM16.5 6.75h.75v.75h-.75v-.75ZM13.5 13.5h.75v.75h-.75v-.75ZM13.5 19.5h.75v.75h-.75v-.75ZM19.5 13.5h.75v.75h-.75v-.75ZM19.5 19.5h.75v.75h-.75v-.75ZM16.5 16.5h.75v.75h-.75v-.75Z"
                                                                            />
                                                                        </svg>
                                                                        QR Code
                                                                    </button>
                                                                </li>

                                                                {auth?.user && (
                                                                    <li>
                                                                        <button
                                                                            className="flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-gray-950 hover:text-white"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                router.put(
                                                                                    route(
                                                                                        'website.posts.bookmark',
                                                                                        relatedViewer?.id,
                                                                                    ),
                                                                                    {
                                                                                        post_id:
                                                                                            relatedViewer?.id,
                                                                                    },
                                                                                    {
                                                                                        onSuccess:
                                                                                            () => {
                                                                                                relatedViewer.is_bookmarked =
                                                                                                    !relatedViewer.is_bookmarked;

                                                                                                setBookmarkStatusChanged(
                                                                                                    true,
                                                                                                );
                                                                                            },
                                                                                        onError: (
                                                                                            e,
                                                                                        ) => {
                                                                                            {
                                                                                                setShowErrorMessage(
                                                                                                    true,
                                                                                                );
                                                                                                setErrorMessage(
                                                                                                    e.message,
                                                                                                );
                                                                                            }
                                                                                        },

                                                                                        onFinish:
                                                                                            () => {
                                                                                                setElipsisShowDropdown(
                                                                                                    false,
                                                                                                );
                                                                                            },
                                                                                    },
                                                                                );
                                                                            }}
                                                                        >
                                                                            <svg
                                                                                xmlns="http://www.w3.org/2000/svg"
                                                                                fill={
                                                                                    relatedViewer?.is_bookmarked
                                                                                        ? '#FFFFFF'
                                                                                        : 'none'
                                                                                }
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
                                                                            Bookmark
                                                                        </button>
                                                                    </li>
                                                                )}

                                                                <li>
                                                                    <button
                                                                        className="flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-gray-950 hover:text-white"
                                                                        onClick={(e) => {
                                                                            const url =
                                                                                route('home') +
                                                                                generateURL(
                                                                                    relatedViewer,
                                                                                );
                                                                            navigator.clipboard.writeText(
                                                                                url.trim(),
                                                                            );

                                                                            setLinkCopied(true);

                                                                            setElipsisShowDropdown(
                                                                                false,
                                                                            );
                                                                        }}
                                                                    >
                                                                        <svg
                                                                            xmlns="http://www.w3.org/2000/svg"
                                                                            fill="none"
                                                                            viewBox="0 0 24 24"
                                                                            strokeWidth={1.5}
                                                                            stroke="currentColor"
                                                                            className="size-6"
                                                                        >
                                                                            <path
                                                                                strokeLinecap="round"
                                                                                strokeLinejoin="round"
                                                                                d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0 1 18 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3 1.5 1.5 3-3.75"
                                                                            />
                                                                        </svg>
                                                                        Copy Link
                                                                    </button>
                                                                </li>
                                                            </ul>
                                                        </div>
                                                    </>
                                                )}

                                                {/* Filter button */}
                                                {/* <button className="p-1 rounded-full hover:bg-gray-300/20">
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                strokeWidth={1.5}
                                                                stroke="currentColor"
                                                                className="size-6"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75"
                                                                />
                                                            </svg>
                                                        </button> */}
                                            </div>
                                        </div>
                                    )}

                                    {/* Main Post + Related Posts Horizontal Scroll */}
                                    <div
                                        ref={(el) => {
                                            if (el) horizontalCarouselRefs.current[post.slug] = el;
                                        }}
                                        data-carousel-slug={post.slug}
                                        onScroll={(e) => {
                                            e.stopPropagation();
                                            handleHorizontalScroll(post, e);
                                        }}
                                        className="horizontal-scroll-container relative flex h-full w-full select-none snap-x snap-mandatory overflow-x-scroll scrollbar-none"
                                        style={{
                                            scrollSnapType: 'x mandatory',
                                            overscrollBehaviorX: 'auto',
                                            overscrollBehaviorY: 'auto',
                                            touchAction: 'pan-y pan-x',
                                            WebkitOverflowScrolling: 'touch',
                                            scrollBehavior: 'smooth',
                                        }}
                                    >
                                        <div className="relative h-full min-w-full flex-shrink-0 snap-start snap-always">
                                            <div className="relative flex h-full w-full items-center justify-center text-white">
                                                {Array.isArray(post.post_image_urls) &&
                                                post.post_image_urls.length > 0 ? (
                                                    <img
                                                        src={post.post_image_urls[0]}
                                                        alt="Main Post"
                                                        className="absolute inset-0 z-10 h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    Array.isArray(post.post_video_urls) &&
                                                    post.post_video_urls.length > 0 && (
                                                        // <VideoPlayer
                                                        //     videoUrl={
                                                        //         post
                                                        //             .post_video_urls[0]
                                                        //     }
                                                        //     thumbnail={
                                                        //         videoThumbnail
                                                        //     }
                                                        //     className="relative z-10 object-contain max-w-full max-h-full"
                                                        // />

                                                        <VideoWithThumbnail
                                                            videoUrl={post.post_video_urls[0]}
                                                            className={
                                                                'absolute bottom-20 z-10 h-full w-full object-cover'
                                                            }
                                                            autoPlay={false}
                                                            controls={true}
                                                            // feed={true}
                                                        />
                                                    )
                                                )}
                                            </div>
                                        </div>

                                        {relatedPosts?.length > 0 &&
                                            relatedPosts.map((related, i) => (
                                                <div
                                                    key={related.id || i}
                                                    className="relative h-full min-w-full flex-shrink-0 snap-start snap-always"
                                                >
                                                    <div className="relative flex h-full w-full items-center justify-center text-white">
                                                        {Array.isArray(related.post_image_urls) &&
                                                        related.post_image_urls.length > 0 ? (
                                                            <img
                                                                src={related.post_image_urls[0]}
                                                                alt="Related Post"
                                                                className="absolute inset-0 bottom-20 z-10 h-full w-full object-cover"
                                                            />
                                                        ) : (
                                                            Array.isArray(
                                                                related.post_video_urls,
                                                            ) &&
                                                            related.post_video_urls.length > 0 && (
                                                                <VideoWithThumbnail
                                                                    videoUrl={
                                                                        related.post_video_urls[0]
                                                                    }
                                                                    className={
                                                                        'absolute inset-0 z-10 h-full w-full object-cover'
                                                                    }
                                                                    autoPlay={false}
                                                                    controls={true}
                                                                    // feed={true}
                                                                />
                                                            )
                                                        )}
                                                    </div>
                                                </div>
                                            ))}

                                        {/* Skeleton Loader Not Needed Anymore */}
                                        {/* {isFetchingRelated && (
                                                            <div className="fixed inset-0 flex flex-col items-center justify-center flex-shrink-0 h-full min-w-full text-white snap-start snap-always bg-deepcharcoal">
                                                                <div className="absolute w-16 h-4 bg-gray-700 rounded left-4 top-4 animate-pulse"></div>
                                                                <div className="h-[70vh] w-[90%] animate-pulse rounded-2xl bg-gray-800/60"></div>
                                                                <div className="absolute w-full px-6 space-y-2 text-center bottom-16">
                                                                    <div className="w-2/3 h-4 mx-auto bg-gray-700 rounded animate-pulse"></div>
                                                                    <div className="w-1/2 h-4 mx-auto rounded animate-pulse bg-gray-700/70"></div>
                                                                    <div className="w-1/3 h-4 mx-auto rounded animate-pulse bg-gray-700/60"></div>
                                                                </div>
                                                            </div>
                                                        )} */}
                                    </div>

                                    {/* Bottom Overlay */}
                                    {(activeViewerType === 'main' || !activeViewerType) && (
                                        <div
                                            className={`absolute ${
                                                (Array.isArray(post.post_image_urls) &&
                                                    post.post_image_urls.length > 0) ||
                                                (Array.isArray(post.post_video_urls) &&
                                                    post.post_video_urls.length > 0)
                                                    ? 'bottom-0 right-0'
                                                    : 'right-10 top-10'
                                            } left-0 z-[10] p-4 font-bold text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]`}
                                        >
                                            {/* Hashtag */}
                                            <div
                                                className="mb-2 flex items-center justify-end space-x-2"
                                                onClick={() => {
                                                    setShowDetailsPostIds((prev) =>
                                                        prev.includes(post.id)
                                                            ? prev.filter((id) => id !== post.id)
                                                            : [...prev, post.id],
                                                    );
                                                }}
                                            >
                                                {/* <span className="text-sm text-white/80">
                                                            {post?.tag}
                                                        </span> */}

                                                {post?.location_name && (
                                                    <span className="text-sm text-white/80">
                                                        {post?.location_name
                                                            ? post.location_name.length > 7
                                                                ? post.location_name.slice(0, 7)
                                                                : post.location_name
                                                            : ''}
                                                        {post?.location_name ? ' ' : ''}
                                                        {post?.added_at ? post.added_at + ' ' : ''}
                                                        {post?.created_at_time || ''}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Content */}
                                            {(Array.isArray(post.post_image_urls) &&
                                                post.post_image_urls.length > 0) ||
                                            (Array.isArray(post.post_video_urls) &&
                                                post.post_video_urls.length > 0) ? (
                                                <div
                                                    dangerouslySetInnerHTML={{
                                                        __html: post?.content,
                                                    }}
                                                    className={`prose overflow-hidden break-words text-xs text-white/80 transition-all duration-100 ease-in-out [-webkit-box-orient:vertical] [display:-webkit-box] ${
                                                        showDetailsPostIds.includes(post.id)
                                                            ? '[-webkit-line-clamp:5]'
                                                            : '[-webkit-line-clamp:3]'
                                                    }`}
                                                    onClick={() => {
                                                        setShowDetailsPostIds((prev) =>
                                                            prev.includes(post.id)
                                                                ? prev.filter(
                                                                      (id) => id !== post.id,
                                                                  )
                                                                : [...prev, post.id],
                                                        );
                                                    }}
                                                    style={{
                                                        maxHeight: showDetailsPostIds.includes(
                                                            post.id,
                                                        )
                                                            ? '10rem'
                                                            : '4rem',
                                                    }}
                                                ></div>
                                            ) : (
                                                <div
                                                    dangerouslySetInnerHTML={{
                                                        __html: post?.content,
                                                    }}
                                                    className={`prose overflow-hidden break-words text-xs text-white/80 transition-all duration-100 ease-in-out [-webkit-box-orient:vertical] [-webkit-line-clamp:5] [display:-webkit-box]`}
                                                ></div>
                                            )}

                                            {/* Learn More Button */}
                                            {showDetailsPostIds.includes(post.id) && (
                                                <div className="mb-0 mt-3 flex items-center justify-between">
                                                    {/* Username */}
                                                    <div className="mb-0 flex items-center space-x-2">
                                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm text-gray-900">
                                                            {post.user?.avatar || 'U'}
                                                        </div>
                                                        <span className="text-xs font-medium text-white/80">
                                                            {post.user?.name.length > 6
                                                                ? post.user?.name.substring(0, 6) +
                                                                  '...'
                                                                : post.user?.name}

                                                            {!post?.user?.name && 'User'}
                                                        </span>
                                                    </div>

                                                    <button
                                                        className="rounded-md bg-indigo-600 p-1 text-sm font-semibold hover:bg-indigo-400/80"
                                                        onClick={() => {
                                                            setIsMobilePostGallery(true);

                                                            handleStopVideoPlayer();
                                                            window.history.pushState(
                                                                {
                                                                    modal: 'post-gallery',
                                                                },
                                                                '',
                                                            );
                                                        }}
                                                    >
                                                        More
                                                    </button>
                                                </div>
                                            )}

                                            {!showDetailsPostIds.includes(post.id) &&
                                                Array.isArray(post.post_image_urls) &&
                                                post.post_image_urls.length < 1 &&
                                                Array.isArray(post.post_video_urls) &&
                                                post.post_video_urls.length < 1 && (
                                                    <div className="mt-3 flex items-center justify-between">
                                                        <div className="mb-0 flex items-center space-x-2">
                                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm text-gray-900">
                                                                {post.user?.avatar || 'U'}
                                                            </div>
                                                            <span className="text-xs font-medium text-white/80">
                                                                {post.user?.name.length > 6
                                                                    ? post.user?.name.substring(
                                                                          0,
                                                                          6,
                                                                      ) + '...'
                                                                    : post.user?.name}
                                                                {!post?.user?.name && 'User'}
                                                            </span>
                                                        </div>

                                                        <button
                                                            className="rounded-md bg-indigo-600 p-1 text-sm font-semibold hover:bg-indigo-400/80"
                                                            onClick={() => {
                                                                setIsMobilePostGallery(true);
                                                                window.history.pushState(
                                                                    {
                                                                        modal: 'post-gallery',
                                                                    },
                                                                    '',
                                                                );
                                                            }}
                                                        >
                                                            More
                                                        </button>
                                                    </div>
                                                )}
                                        </div>
                                    )}

                                    {activeViewerType === 'related' && relatedViewer && (
                                        <div
                                            className={`absolute ${
                                                (Array.isArray(relatedViewer.post_image_urls) &&
                                                    relatedViewer.post_image_urls.length > 0) ||
                                                (Array.isArray(relatedViewer.post_video_urls) &&
                                                    relatedViewer.post_video_urls.length > 0)
                                                    ? 'bottom-0 right-0'
                                                    : 'right-10 top-10'
                                            } left-0 z-[10] p-4 font-bold text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]`}
                                        >
                                            {/* Hashtag */}
                                            <div
                                                className="mb-2 flex items-center justify-end space-x-2"
                                                onClick={() => {
                                                    setShowDetailsPostIds((prev) =>
                                                        prev.includes(relatedViewer.id)
                                                            ? prev.filter(
                                                                  (id) => id !== relatedViewer.id,
                                                              )
                                                            : [...prev, relatedViewer.id],
                                                    );
                                                }}
                                            >
                                                {/* <span className="text-sm text-white/80">
                                                            {relatedViewer?.tag}
                                                        </span> */}

                                                {relatedViewer?.location_name && (
                                                    <span className="text-sm text-white/80">
                                                        {relatedViewer?.location_name
                                                            ? relatedViewer.location_name.length > 7
                                                                ? relatedViewer.location_name.slice(
                                                                      0,
                                                                      7,
                                                                  )
                                                                : relatedViewer.location_name
                                                            : ''}
                                                        {relatedViewer?.location_name ? ' ' : ''}
                                                        {relatedViewer?.added_at
                                                            ? relatedViewer.added_at + ' '
                                                            : ''}
                                                        {relatedViewer?.created_at_time || ''}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Content */}
                                            {(Array.isArray(relatedViewer.post_image_urls) &&
                                                relatedViewer.post_image_urls.length > 0) ||
                                            (Array.isArray(relatedViewer.post_video_urls) &&
                                                relatedViewer.post_video_urls.length > 0) ? (
                                                <div
                                                    dangerouslySetInnerHTML={{
                                                        __html: relatedViewer?.content,
                                                    }}
                                                    className={`prose overflow-hidden break-words text-xs text-white/80 transition-all duration-100 ease-in-out [-webkit-box-orient:vertical] [display:-webkit-box] ${
                                                        showDetailsPostIds.includes(
                                                            relatedViewer.id,
                                                        )
                                                            ? '[-webkit-line-clamp:5]'
                                                            : '[-webkit-line-clamp:3]'
                                                    }`}
                                                    onClick={() => {
                                                        setShowDetailsPostIds((prev) =>
                                                            prev.includes(relatedViewer.id)
                                                                ? prev.filter(
                                                                      (id) =>
                                                                          id !== relatedViewer.id,
                                                                  )
                                                                : [...prev, relatedViewer.id],
                                                        );
                                                    }}
                                                    style={{
                                                        maxHeight: showDetailsPostIds.includes(
                                                            relatedViewer.id,
                                                        )
                                                            ? '10rem'
                                                            : '4rem',
                                                    }}
                                                ></div>
                                            ) : (
                                                <div
                                                    dangerouslySetInnerHTML={{
                                                        __html: relatedViewer?.content,
                                                    }}
                                                    className={`prose overflow-hidden break-words text-xs text-white/80 transition-all duration-100 ease-in-out [-webkit-box-orient:vertical] [-webkit-line-clamp:5] [display:-webkit-box]`}
                                                ></div>
                                            )}

                                            {/* Learn More Button */}
                                            {showDetailsPostIds.includes(relatedViewer.id) && (
                                                <div className="mb-0 mt-3 flex items-center justify-between">
                                                    {/* Username */}
                                                    <div className="mb-0 flex items-center space-x-2">
                                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm text-gray-900">
                                                            {relatedViewer.user?.avatar || 'U'}
                                                        </div>
                                                        <span className="text-xs font-medium text-white/80">
                                                            {relatedViewer?.user &&
                                                            relatedViewer.user?.name.length > 6
                                                                ? relatedViewer.user?.name.substring(
                                                                      0,
                                                                      6,
                                                                  ) + '...'
                                                                : relatedViewer.user?.name}

                                                            {!relatedViewer?.user && 'User'}
                                                        </span>
                                                    </div>

                                                    <button
                                                        className="rounded-md bg-indigo-600 p-1 text-sm font-semibold hover:bg-indigo-400/80"
                                                        onClick={() => {
                                                            setIsMobilePostGallery(true);
                                                            window.history.pushState(
                                                                {
                                                                    modal: 'post-gallery',
                                                                },
                                                                '',
                                                            );
                                                        }}
                                                    >
                                                        More
                                                    </button>
                                                </div>
                                            )}

                                            {!showDetailsPostIds.includes(relatedViewer.id) &&
                                                Array.isArray(relatedViewer.post_image_urls) &&
                                                relatedViewer.post_image_urls.length < 1 &&
                                                Array.isArray(relatedViewer.post_video_urls) &&
                                                relatedViewer.post_video_urls.length < 1 && (
                                                    <div className="mt-3 flex items-center justify-between">
                                                        <div className="mb-0 flex items-center space-x-2">
                                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm text-gray-900">
                                                                {relatedViewer.user?.avatar || 'U'}
                                                            </div>
                                                            <span className="text-xs font-medium text-white/80">
                                                                {relatedViewer.user?.name.length > 6
                                                                    ? relatedViewer.user?.name.substring(
                                                                          0,
                                                                          6,
                                                                      ) + '...'
                                                                    : relatedViewer.user?.name}

                                                                {!relatedViewer?.user && 'User'}
                                                            </span>
                                                        </div>

                                                        <button
                                                            className="rounded-md bg-indigo-600 p-1 text-sm font-semibold hover:bg-indigo-400/80"
                                                            onClick={() => {
                                                                setIsMobilePostGallery(true);
                                                                window.history.pushState(
                                                                    {
                                                                        modal: 'post-gallery',
                                                                    },
                                                                    '',
                                                                );
                                                            }}
                                                        >
                                                            More
                                                        </button>
                                                    </div>
                                                )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </>,
            document.getElementById('modal-root') || document.body,
        );
}

{
    /* Mobile Post Gallery */
}
{
    isMobilePostGallery &&
        isMobilePostViewer &&
        createPortal(
            <>
                <div className="fixed inset-0 z-[70] bg-black">
                    {/* Elipsis Dropdown Menu */}
                    {showElipsisDropdown && isMobilePostViewer && (
                        <>
                            <div
                                ref={elipsisDropDownRef}
                                data-elipsis-dropdown
                                onClick={(e) => e.stopPropagation()}
                                className="absolute right-0 top-12 z-[9999] mt-2 w-36 rounded-lg border border-gray-900 bg-deepcharcoal shadow-xl sm:w-48"
                            >
                                <ul
                                    className="overflow-y-scroll py-1 text-sm text-gray-200 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white"
                                    style={{ maxHeight: '180px' }}
                                >
                                    <li>
                                        <button
                                            onClick={(e) => {
                                                setShowQrCode(true);
                                                setElipsisShowDropdown(false);
                                            }}
                                            className="flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-gray-950 hover:text-white"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth={1.5}
                                                stroke="currentColor"
                                                className="size-6"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z"
                                                />
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M6.75 6.75h.75v.75h-.75v-.75ZM6.75 16.5h.75v.75h-.75v-.75ZM16.5 6.75h.75v.75h-.75v-.75ZM13.5 13.5h.75v.75h-.75v-.75ZM13.5 19.5h.75v.75h-.75v-.75ZM19.5 13.5h.75v.75h-.75v-.75ZM19.5 19.5h.75v.75h-.75v-.75ZM16.5 16.5h.75v.75h-.75v-.75Z"
                                                />
                                            </svg>
                                            QR Code
                                        </button>
                                    </li>

                                    {auth?.user && (
                                        <li>
                                            <button
                                                className="flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-gray-950 hover:text-white"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    router.put(
                                                        route(
                                                            'website.posts.bookmark',
                                                            viewablePost?.id,
                                                        ),
                                                        {
                                                            post_id: viewablePost?.id,
                                                        },
                                                        {
                                                            onSuccess: () => {
                                                                viewablePost.is_bookmarked =
                                                                    !viewablePost.is_bookmarked;

                                                                setBookmarkStatusChanged(true);
                                                            },
                                                            onError: (e) => {
                                                                setShowErrorMessage(true);
                                                                setErrorMessage(e.message);
                                                            },

                                                            onFinish: () => {
                                                                setElipsisShowDropdown(false);
                                                            },
                                                        },
                                                    );
                                                }}
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill={
                                                        viewablePost?.is_bookmarked
                                                            ? '#FFFFFF'
                                                            : 'none'
                                                    }
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
                                                Bookmark
                                            </button>
                                        </li>
                                    )}

                                    <li>
                                        <button
                                            className="flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-gray-950 hover:text-white"
                                            onClick={(e) => {
                                                const url =
                                                    route('home') + generateURL(viewablePost);
                                                navigator.clipboard.writeText(url.trim());

                                                setLinkCopied(true);

                                                setElipsisShowDropdown(false);
                                            }}
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth={1.5}
                                                stroke="currentColor"
                                                className="size-6"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0 1 18 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3 1.5 1.5 3-3.75"
                                                />
                                            </svg>
                                            Copy Link
                                        </button>
                                    </li>

                                    <li>
                                        <div className="flex w-full flex-col items-start gap-1 px-4 py-2 transition-colors hover:text-white">
                                            <span className="rounded-full text-[10px]">
                                                Post Created Date
                                            </span>
                                            <span className="rounded-full pb-1 text-[10px]">
                                                {viewablePost?.added_at +
                                                    ' ' +
                                                    viewablePost?.created_at_time}
                                            </span>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </>
                    )}

                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/70"></div>

                    <div className="relative z-10 flex h-[100dvh] w-full flex-col bg-deepcharcoal text-white">
                        {/* Top Bar */}
                        <div className="flex items-center justify-between bg-deepcharcoal/50 px-4 py-3 backdrop-blur-sm">
                            {/* Left side */}
                            <div className="flex items-center space-x-2">
                                {/* Close */}
                                {/* <button
                                                    onClick={() => setIsMobilePostGallery(false)}
                                                    className="p-1 rounded-full hover:bg-gray-300/20"
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        strokeWidth={1.5}
                                                        stroke="currentColor"
                                                        className="w-6 h-6"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M6 18 18 6M6 6l12 12"
                                                        />
                                                    </svg>
                                                </button> */}

                                {/* Title */}
                                {/* <h2 className="text-sm font-semibold">
                                                    {viewablePost?.title || 'Post Title'}
                                                </h2> */}

                                {/* Tags */}
                                {viewablePost?.tag && (
                                    <button
                                        onClick={() => {
                                            navigateToHashtag(viewablePost?.tag);
                                        }}
                                        className="flex flex-wrap gap-2 text-sm text-indigo-400"
                                    >
                                        {viewablePost?.tag}
                                    </button>
                                )}
                            </div>

                            {/* Right side */}

                            <div className="flex items-center space-x-3">
                                {/* Ellipsis */}
                                <button
                                    className="rounded-full p-1 hover:bg-gray-300/20"
                                    ref={elipsisButtonRef}
                                    data-elipsis-button
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={1.5}
                                        stroke="currentColor"
                                        className="h-6 w-6"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                                        />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Media Section (fixed height) */}
                        {mediaItems.length > 0 && (
                            <div
                                ref={PostGalleryMediaContainerRef}
                                onScroll={handlePostGalleryMediaScroll}
                                className="relative h-[60vh] w-full snap-x snap-mandatory overflow-x-auto overflow-y-hidden scrollbar-none"
                            >
                                <div className="flex h-full w-full">
                                    {mediaItems?.map((item, idx) => (
                                        <div
                                            key={idx}
                                            className="relative flex h-full w-full flex-shrink-0 snap-center snap-always items-center justify-center text-white"
                                        >
                                            {item.type === 'image' ? (
                                                <>
                                                    {/* <img
                                                                        src={item.url}
                                                                        alt="Post background blur"
                                                                        className="absolute inset-0 z-0 object-cover w-full h-full scale-110 blur-lg"
                                                                    /> */}
                                                    <img
                                                        src={item.url}
                                                        alt={`Media ${idx}`}
                                                        className="relative z-10 max-h-full max-w-full rounded-none object-contain"
                                                    />
                                                </>
                                            ) : (
                                                <>
                                                    {/* <VideoPlayer
                                                                        key={idx}
                                                                        videoUrl={item.url}
                                                                        thumbnail={videoThumbnail}
                                                                        className="relative z-10 object-contain max-w-full max-h-full rounded-xl"
                                                                        fullscreen={true}
                                                                    /> */}

                                                    <VideoWithThumbnail
                                                        key={idx}
                                                        videoUrl={item.url}
                                                        className="relative z-10 max-h-full max-w-full rounded-xl object-contain"
                                                        autoPlay={false}
                                                        controls={true}
                                                    />
                                                </>
                                            )}

                                            <div className="absolute bottom-3 right-3 z-[9999] rounded-full bg-black/70 px-2 py-1 text-xs font-semibold text-white">
                                                {idx + 1} / {mediaItems.length}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Scrollable Bottom Section */}
                        <div className="flex-1 space-y-3 overflow-y-auto p-4 scrollbar-none">
                            <div className="flex items-center justify-end">
                                {/* Tags */}
                                {/* {viewablePost?.tag && (
                                                    <div className="flex flex-wrap gap-2 text-sm text-indigo-400">
                                                        {viewablePost?.tag}
                                                    </div>
                                                )} */}

                                {viewablePost?.location_name && (
                                    <span className="text-sm text-white/80">
                                        {viewablePost?.location_name
                                            ? viewablePost.location_name.length > 7
                                                ? viewablePost.location_name.slice(0, 7)
                                                : viewablePost.location_name
                                            : ''}
                                        {viewablePost?.location_name ? ' ' : ''}
                                        {viewablePost?.added_at ? viewablePost.added_at + ' ' : ''}
                                        {viewablePost?.created_at_time || ''}
                                    </span>
                                )}
                            </div>

                            <div
                                dangerouslySetInnerHTML={{
                                    __html: viewablePost?.content,
                                }}
                                className="prose break-words text-sm text-white/80"
                            ></div>

                            <div className="flex items-center justify-start gap-3">
                                {/* {Userprofile} */}

                                <div className="flex items-center space-x-2">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm text-gray-900">
                                        {viewablePost.user?.avatar || 'U'}
                                    </div>
                                    <span className="text-xs font-medium text-white/80">
                                        {viewablePost.user?.name.length > 6
                                            ? viewablePost.user?.name.substring(0, 6) + '...'
                                            : viewablePost.user?.name}

                                        {!viewablePost.user?.name && 'User'}
                                    </span>
                                </div>

                                {/* Location */}
                                {/* {viewablePost?.location_name && (
                                                    <span className="px-2 py-1 text-sm rounded-full">
                                                        {viewablePost?.location_name}
                                                    </span>
                                                )} */}
                            </div>
                        </div>
                    </div>
                </div>
            </>,
            document.getElementById('modal-root') || document.body,
        );
}
