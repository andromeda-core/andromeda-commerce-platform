import React, { useRef, useEffect, useState } from 'react';
import videoThumbnail from '../../../../../public/assets/images/video-thumb/general-video.png';

export default function PostsGrid({
    posts,
    onSelect,
    nextPageUrl,
    fetchMorePosts,
    fetchSinglePost,
    selectedPostIndex,
    onSelectIndex,
}) {
    const loaderRef = useRef(null);
    const selected = selectedPostIndex ?? 0;
    const thumbRefs = useRef([]);
    const containerRef = useRef(null);

    // Find Post From Slug If Refreshed
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const slug = params.get('slug');

        if (slug) {
            const postIndex = posts.findIndex((p) => p.slug === slug);
            if (postIndex !== -1) {
                onSelectIndex(postIndex);
            } else {
                fetchSinglePost(slug);
            }
        }
    }, [posts]);

    // Infinite scroll loader
    useEffect(() => {
        if (!loaderRef.current || !nextPageUrl) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    fetchMorePosts();
                }
            },
            { threshold: 1 },
        );

        observer.observe(loaderRef.current);
        return () => {
            if (loaderRef.current) observer.unobserve(loaderRef.current);
        };
    }, [nextPageUrl]);

    // Auto-scroll to keep selected thumbnail in view
    useEffect(() => {
        if (thumbRefs.current[selected]) {
            thumbRefs.current[selected].scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
            });
        }
    }, [selected]);

    // Mouse wheel handler
    const wheelTimeout = useRef(null);
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleWheel = (e) => {
            if (e.ctrlKey || e.metaKey) return;
            e.preventDefault();

            let nextIndex;
            if (e.deltaY > 0) {
                nextIndex =
                    selectedPostIndex === posts.length - 1
                        ? selectedPostIndex
                        : selectedPostIndex + 1;
            } else {
                nextIndex = selectedPostIndex === 0 ? 0 : selectedPostIndex - 1;
            }

            onSelectIndex(nextIndex);

            if (wheelTimeout.current) clearTimeout(wheelTimeout.current);
            wheelTimeout.current = setTimeout(() => {
                if (posts[nextIndex]) {
                    onSelect(posts[nextIndex]);
                }

                if (nextIndex >= posts.length - 5 && nextPageUrl) {
                    fetchMorePosts();
                }
            }, 500);
        };

        container.addEventListener('wheel', handleWheel, { passive: false });
        return () => container.removeEventListener('wheel', handleWheel);
    }, [posts.length, nextPageUrl, fetchMorePosts]);

    return (
        <div className={`overflow-hidden lg:h-[85vh]`}>
            <div
                ref={containerRef}
                className="hide-y-scrollbar flex max-h-[75vh] cursor-pointer flex-row gap-2 overflow-x-hidden overflow-y-hidden border-gray-700 lg:w-28 lg:flex-col lg:overflow-y-auto lg:overflow-x-hidden"
            >
                {posts.map((post, idx) => (
                    <button
                        key={post.id}
                        ref={(el) => (thumbRefs.current[idx] = el)}
                        onClick={() => {
                            onSelectIndex(idx);

                            setTimeout(() => {
                                onSelect(post);
                            }, 500);
                        }}
                        className={`md:h-15 md:w-15 relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg border-2 text-xs transition sm:h-12 sm:w-12 lg:h-20 lg:w-20 ${
                            selected === idx
                                ? 'z-10 scale-105 border-indigo-800 shadow-lg shadow-indigo-500/50'
                                : 'border-gray-700 border-transparent opacity-70 hover:opacity-100 dark:border-white/80'
                        }`}
                    >
                        {post.images?.length > 0 ? (
                            <img
                                src={post.images[0].url}
                                alt={
                                    post.title.length > 20
                                        ? post.title.slice(0, 20) + '...'
                                        : post.title
                                }
                                loading="eager"
                                className="h-full w-full object-cover text-[5px] text-gray-700 dark:text-white/80 lg:text-[10px]"
                            />
                        ) : post.videos?.length > 0 ? (
                            <img
                                src={videoThumbnail}
                                alt={
                                    post.title.length > 20
                                        ? post.title.slice(0, 20) + '...'
                                        : post.title
                                }
                                loading="eager"
                                className="h-full w-full object-cover text-[5px] text-gray-700 dark:text-white/80 lg:text-[10px]"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gray-200 text-[5px] text-gray-700 dark:bg-deepcharcoal dark:text-white/80 lg:text-[10px]">
                                {post.title.length > 20
                                    ? post.title.slice(0, 20) + '...'
                                    : post.title}
                            </div>
                        )}
                    </button>
                ))}

                {/* Loader */}
                {nextPageUrl && (
                    <div
                        ref={loaderRef}
                        className="flex animate-pulse items-center justify-center py-6 text-xs text-gray-500 dark:text-white/60"
                    >
                        <div role="status">
                            <svg
                                aria-hidden="true"
                                className="h-5 w-5 animate-spin fill-indigo-600 text-gray-200 dark:text-gray-600"
                                viewBox="0 0 100 101"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                    fill="currentColor"
                                />
                                <path
                                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                    fill="currentFill"
                                />
                            </svg>
                            <span className="sr-only">Loading...</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
