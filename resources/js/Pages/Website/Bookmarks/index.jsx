import MainLayout from '@/Layouts/Website/MainLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import Toast from '@/Components/Toast';
import getCookie from '@/Hooks/useGetCookie';
import Placeholder from 'asset/assets/images/product/placeholder.jpg';
import Spinner from '@/Components/Spinner';
import MasonryFeedItem from '../Home/MasonryFeedItem';
import { useTranslation } from '@/Hooks/useTranslation';
import BookmarkStatusChangedModal from '@/Components/BookmarkStatusChangedModal';
import useWindowSize from '@/Hooks/useWindowSize';


export default function index() {
    const [bookmarkedPosts, setBookmarkedPosts] = useState([]);
    const [bookmarkStatusChanged, setBookmarkStatusChanged] = useState(false);
    const [bookmarkActionPost, setBookmarkActionPost] = useState(null);
    const [nextPageUrl, setNextPageUrl] = useState(null);

    const windowSize = useWindowSize();
    // Translation Hook
    const { __ } = useTranslation();
    const loaderRef = useRef(null);
    const [isLoaded, setIsLoaded] = useState(false);


    const [ErrorMessage, setErrorMessage] = useState(null);
    const [showErrorMessage, setShowErrorMessage] = useState(false);


    const generateURL = (post) => {
        return (
            `?slug=${encodeURIComponent(post?.slug)}&planet=earth${post?.latitude != null ? '&lat=' + encodeURIComponent(post?.latitude) : ''}` +
            `${post?.longitude != null ? '&lng=' + encodeURIComponent(post?.longitude) : ''}` +
            `${post?.location_name != null ? '&location_name=' + encodeURIComponent(post?.location_name) : ''}` +
            `&timestamp=${encodeURIComponent(post?.created_at)}` +
            `${post?.floor_id != null ? '&floor=' + encodeURIComponent(post?.floor?.name) : ''}`
        );
    };

    const isFetchingRef = useRef(false);

    const fetchBookmarkedPosts = async () => {
        try {
            const cookieValue = getCookie('post_preferences');
            let parsed = null;

            if (cookieValue && cookieValue !== 'null' && cookieValue !== 'undefined') {
                try {
                    parsed = JSON.parse(decodeURIComponent(cookieValue));
                } catch (error) {
                    console.warn('⚠️ ' + __('Invalid post_preferences cookie. Using defaults.'), error);
                    parsed = null;
                }
            }

            const defaultPreferences = {
                text: true,
                videos: true,
                images: true,
                show_posts: true,
                show_products: true,
            };

            const finalPreferences =
                parsed && typeof parsed === 'object'
                    ? { ...defaultPreferences, ...parsed }
                    : defaultPreferences;

            const res = await axios.get(route('website.bookmarks.get-bookmarked-posts'), {
                params: finalPreferences,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    Accept: 'application/json',
                },
            });

            setBookmarkedPosts(res.data.posts);
            setNextPageUrl(res.data.next_page_url);
        } catch (error) {
            setErrorMessage(error.message);
            setShowErrorMessage(true);
        } finally {
            setIsLoaded(true);
        }
    };

    useEffect(() => {
        fetchBookmarkedPosts();
    }, []);

    const fetchMoreBookmarkedPosts = async () => {
        if (isFetchingRef.current) return;
        try {
            isFetchingRef.current = true;
            const res = await axios.get(nextPageUrl, {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    Accept: 'application/json',
                },
            });

            setBookmarkedPosts((prev) => {
                const newPosts = res.data.posts;

                const uniqueNewPosts = newPosts.filter(
                    (newPost) => !prev.some((existingPost) => existingPost.id === newPost.id),
                );

                return [...prev, ...uniqueNewPosts];
            });
            setNextPageUrl(res.data.next_page_url);
        } catch (error) {
            console.error(__('Error fetching more posts') + ':', error);
        } finally {
            isFetchingRef.current = false;
        }
    };

    // Infinite Scroll Observer
    useEffect(() => {
        if (!loaderRef.current || !nextPageUrl) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !isFetchingRef.current) {
                    fetchMoreBookmarkedPosts();
                }
            },
            { threshold: 1 },
        );

        observer.observe(loaderRef.current);

        return () => {
            if (loaderRef.current) observer.unobserve(loaderRef.current);
        };
    }, [nextPageUrl]);

    const handleOpenPost = (post) => {
        const url = generateURL(post);
        window.history.replaceState(
            {},
            '',
            route('home'),
        )
        router.visit(route('home') + url, {
            replace: false,
            preserveState: true,
            preserveScroll: true,

        });
    };


    return (
        <MainLayout>
            <Head title={__("Bookmarks", true)} />

            {showErrorMessage && (
                <Toast
                    flash={{ error: ErrorMessage }}
                    onClosed={(type) => {
                        if (type === 'error') {
                            setErrorMessage(null);
                            setShowErrorMessage(false);
                        }
                    }}
                />
            )}

            {!isLoaded && (
                <div className="flex items-center justify-center gap-2 py-10 text-center text-gray-700 transition-all duration-100 animate-pulse dark:text-white/80">
                    <Spinner />
                    {__('Please Wait While We Load Bookmarked Posts...')}
                </div>
            )}

            {/* Masonry Layout */}
            {isLoaded && (
                <div
                    className={`pb-20 pt-3 sm:pb-20 lg:pt-[75px]`}
                >
                    <div className="mx-auto max-w-8xl sm:px-6 lg:px-8">

                        <div className="gap-2 columns-2 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5">
                            {bookmarkedPosts.map((item, index) => {
                                return (
                                    <MasonryFeedItem
                                        key={`${item.type}-${item.id}`}
                                        item={item}
                                        index={index}
                                        onClick={() => handleOpenPost(item)}
                                        Placeholder={Placeholder}
                                        Index={index}
                                        isBookmarkPage={true}
                                        setBookmarkedPosts={setBookmarkedPosts}
                                        setBookmarkStatusChanged={setBookmarkStatusChanged}
                                        setBookmarkActionPost={setBookmarkActionPost}
                                        windowSize={windowSize}


                                    />
                                );
                            })}
                        </div>

                        {bookmarkedPosts?.length === 0 && (
                            <div className="flex min-h-[50vh] items-center justify-center px-6">
                                <div className="text-center">
                                    <h3 className="text-[22px] font-semibold tracking-tight text-black dark:text-white">

                                        {__('No Bookmarks Found')}
                                    </h3>

                                    <p className="max-w-md mt-2 mb-8 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                                        {__('Start bookmarking your favorite Posts to see them here')}
                                    </p>

                                    <Link
                                        href={route('home')}
                                        className="inline-flex items-center justify-center rounded-md bg-black px-10 py-2.5 text-sm font-medium text-white transition-colors hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/80"
                                    >
                                        {__('Bookmark Now')}
                                    </Link>
                                </div>
                            </div>
                        )}

                        {/* Loader */}
                        {bookmarkedPosts?.length > 0 && (
                            <>
                                {nextPageUrl && (
                                    <div
                                        ref={loaderRef}
                                        className="flex items-center justify-center gap-2 py-10 text-center text-gray-700 transition-all duration-100 animate-pulse dark:text-white/80"
                                    >
                                        <Spinner />
                                        {__('Loading more' + '...')}
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Bookmark */}
                    {bookmarkStatusChanged && (
                        <BookmarkStatusChangedModal
                            BookmarkStatusChanged={bookmarkStatusChanged}
                            setBookmarkStatusChanged={setBookmarkStatusChanged}
                            viewablePost={bookmarkActionPost}
                        />
                    )}

                </div>
            )}
        </MainLayout>
    );
}
