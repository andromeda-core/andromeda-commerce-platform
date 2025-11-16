import useWindowSize from '@/Hooks/useWindowSize';
import MainLayout from '@/Layouts/Website/MainLayout';
import { Head, router, usePage } from '@inertiajs/react';
import React, { Fragment, useEffect, useRef, useState } from 'react';
import QRCode from 'react-qr-code';
import { createPortal, flushSync } from 'react-dom';
import axios from 'axios';
import GlobalSearch from '@/Components/GlobalSearch';
import LinkCopiedModal from '@/Components/LinkCopiedModal';
import BookmarkStatusChangedModal from '@/Components/BookmarkStatusChangedModal';
import useSidebarClick from '@/Hooks/useSidebarClick';
import SmartphoneDesktopModal from './SmartphoneDesktopModal';
import getCookie from '@/Hooks/useGetCookie';
import Toast from '@/Components/Toast';
import VideoThumbnail from '@/Components/VideoThumbnail';
import Placeholder from 'asset/assets/images/product/placeholder.jpg';
import PostDesktopModal from './PostDesktopModal';
import MobileFeed from './MobileFeed';

export default function index({ google_map_api_key, search_history }) {
    const { currency, auth, cart_items } = usePage().props;

    const [ErrorMessage, setErrorMessage] = useState(null);
    const [showErrorMessage, setShowErrorMessage] = useState(false);

    const [InfoMessage, setInfoMessage] = useState(null);
    const [showInfoMessage, setShowInfoMessage] = useState(false);

    const [isFeedLoaded, setIsFeedLoaded] = useState(false);
    const [feed, setFeed] = useState([]);
    const [feedGallery, setFeedGallery] = useState(null);
    const [feedOpen, setFeedOpen] = useState(false);
    const [feedIndex, setFeedIndex] = useState(0);
    const [relatedFeed, setRelatedFeed] = useState({});
    const relatedFeedNextUrlsRef = useRef({});
    const [MobileFeedGalleryOpen, setMobileFeedGalleryOpen] = useState(false);






    const [bookmarkStatusChanged, setBookmarkStatusChanged] = useState(false);
    const [linkCopied, setLinkCopied] = useState(false);
    const [nextPageUrl, setNextPageUrl] = useState(null);
    const [hasMoreSmartphones, setHasMoreSmartphones] = useState(false);

    const nextPageUrlRef = useRef(null);
    // Initialize with first load
    useEffect(() => {
        nextPageUrlRef.current = nextPageUrl;
    }, [nextPageUrl]);


    const fetchPostsAndProducts = async () => {
        const cookieValue = getCookie('post_preferences');
        let parsed = null;

        if (cookieValue && cookieValue !== 'null' && cookieValue !== 'undefined') {
            try {
                parsed = JSON.parse(decodeURIComponent(cookieValue));
            } catch (error) {
                console.warn('⚠️ Invalid post_preferences cookie. Using defaults.', error);
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

        try {
            const res = await axios.get(route('website.posts.index'), {
                params: finalPreferences,
            });

            const { posts, products } = res.data;



            flushSync(() => {
                setFeed((prevFeed) => {
                    const existingIds = new Set(
                        prevFeed.map((item) =>
                            item.type === 'posts' ? `posts-${item.id}` : `smartphones-${item.id}`,
                        ),
                    );

                    const newPosts = posts.filter((post) => !existingIds.has(`posts-${post.id}`));

                    const newSmartphones = products.smartphones.filter(
                        (smartphone) => !existingIds.has(`smartphones-${smartphone.id}`),
                    );

                    return [...prevFeed, ...newPosts, ...newSmartphones];
                });


                //  Extracting and storing all related feeds by slug
                setRelatedFeed((prevRelated) => {
                    const updatedRelated = { ...prevRelated };

                    // Extracting related from posts (only if not already stored)
                    posts.forEach((post) => {
                        if (
                            post.related &&
                            Array.isArray(post.related) &&
                            post.related.length > 0 &&
                            !prevRelated[post.slug]
                        ) {
                            updatedRelated[post.slug] = post.related;

                        }
                    });

                    // Extracting related from smartphones (only if not already stored)
                    products.smartphones.forEach((smartphone) => {
                        if (
                            smartphone.related &&
                            Array.isArray(smartphone.related) &&
                            smartphone.related.length > 0 &&
                            !prevRelated[smartphone.slug]
                        ) {
                            updatedRelated[smartphone.slug] = smartphone.related;

                        }
                    });



                    return updatedRelated;
                });

                setNextPageUrl(res.data.next_page_url);
                setHasMoreSmartphones(res.data.has_more_smartphones);
                setIsFeedLoaded(true);
            });
        } catch (error) {
            console.error(error.message);

            setShowErrorMessage(true);
            setErrorMessage('Failed to Fetch Feed Please try again later.');
        }
    };

    useEffect(() => {
        fetchPostsAndProducts();
    }, []);



    // POST UNIQUE URL GENERATION
    const generateURL = (post) => {

        return (
            `?slug=${encodeURIComponent(post?.slug)}&planet=earth${post?.latitude != null ? '&lat=' + encodeURIComponent(post?.latitude) : ''}` +
            `${post?.longitude != null ? '&lng=' + encodeURIComponent(post?.longitude) : ''}` +
            `${post?.location_name != null ? '&location_name=' + encodeURIComponent(post?.location_name) : ''}` +
            `&timestamp=${encodeURIComponent(post?.created_at)}` +
            `${post?.floor_id != null ? '&floor=' + encodeURIComponent(post?.floor?.name) : ''}`
        );
    };

    // NAVIGATING TO HASHTAG PAGE AFTER RECEIVING HASHTAG
    const navigateToHashtag = async (hashtag) => {
        const tag = encodeURIComponent(hashtag);
        try {
            router.visit(route('website.posts.hashtag.index', tag), {
                replace: true,
                preserveState: true,
                preserveScroll: true,
            });
        } catch (error) {
            console.error('Hashtag navigation failed:', error);
        }
    };



    const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);

    const loaderRef = useRef(null);
    const [showQrCode, setShowQrCode] = useState(false);
    const windowSize = useWindowSize();

    // Set Media items For Media Viewer In the bottom bar
    const [mediaItems, setMediaItems] = useState([]);

    // All Refs
    const thumbRefs = useRef([]);
    const isfetchingMoreYAxisFeed = useRef(false);
    const MobileFeedGalleryOpenRef = useRef(false);
    const feedOpenRef = useRef(false);

    // FEED GALLERY REF JUST FOR POP STATE TRACKING
    const feedGalleryRef = useRef(null);
    useEffect(() => {
        if (feedGallery !== null) {
            feedGalleryRef.current = feedGallery;
        }
    }, [feedGallery]);


    // FEED OPEN REF FOR SYNCING WITH Actual STATE
    useEffect(() => {
        feedOpenRef.current = feedOpen;
    }, [feedOpen]);




    // Checking Slug In URL If Found Than Auto Opening PC FEED Modal
    const hasOpenedSlugRef = useRef(false);

    useEffect(() => {
        if (!isFeedLoaded || hasOpenedSlugRef.current) return;

        const params = new URLSearchParams(window.location.search);
        const post_slug = params.get('slug');
        const smartphone_slug = params.get('m-slug');

        if (!post_slug && !smartphone_slug) return;

        let feedItem = null;
        if (post_slug) {
            feedItem = feed.find((item) => item.type === 'posts' && item.slug === post_slug);
        } else if (smartphone_slug) {
            feedItem = feed.find(
                (item) => item.type === 'smartphones' && item.slug === smartphone_slug,
            );
        }

        if (feedItem) {
            hasOpenedSlugRef.current = true;
            const index = feed.findIndex(i => i.slug === feedItem.slug);
            if (index !== -1) {
                setFeedGallery(feedItem);
                setFeedOpen(true);
                setFeedIndex(index);
            }
            window.history.replaceState({}, '', window.location.href);

        } else {
            hasOpenedSlugRef.current = true;

            if (post_slug) fetchSinglePost(post_slug);
            else if (smartphone_slug) fetchSingleSmartphone(smartphone_slug);

            window.history.replaceState({}, '', window.location.href);
            window.history.pushState({}, '', window.location.href);
        }


    }, [isFeedLoaded, feed]);

    // Fetch Single Post Method
    const fetchSinglePost = async (slug) => {
        try {
            if (!isFeedLoaded) {
                return;
            }
            const cookieValue = getCookie('post_preferences');
            let parsed = null;

            if (cookieValue && cookieValue !== 'null' && cookieValue !== 'undefined') {
                try {
                    parsed = JSON.parse(decodeURIComponent(cookieValue));
                } catch (error) {
                    console.warn('⚠️ Invalid post_preferences cookie. Using defaults.', error);
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

            const res = await axios.get(route('website.posts.getsingle', encodeURIComponent(slug)), {
                params: finalPreferences,
            });

            const data = await res.data;

            if (data.status) {

                let newIndex = -1;

                flushSync(() => {


                    //  Extracting and storing all related feeds by slug
                    setRelatedFeed((prevRelated) => {
                        const updatedRelated = { ...prevRelated };
                        const post = data.post;

                        // Extracting related from posts (only if not already stored)
                        if (
                            post.related &&
                            Array.isArray(post.related) &&
                            post.related.length > 0
                        ) {



                            updatedRelated[post.slug] = post.related;
                        }




                        return updatedRelated;
                    });



                    setFeed((prevFeed) => {
                        const exists = prevFeed.some(
                            (item) => item.type === 'posts' && item.id === data.post.id,
                        );

                        let newFeed;
                        if (!exists) {
                            newFeed = [data.post, ...prevFeed];
                        } else {
                            newFeed = prevFeed;
                        }


                        const idx = newFeed.findIndex(
                            (item) => item.type === 'posts' && item.id === data.post.id,
                        );

                        newIndex = idx;

                        return newFeed;
                    });



                    setFeedGallery(data.post);
                    setFeedOpen(true);

                });

                if (newIndex !== -1) {
                    setFeedIndex(newIndex);
                }

            } else {
                setShowInfoMessage(true);
                setInfoMessage('Post Not Found');
            }
        } catch (err) {
            setShowErrorMessage(true);
            setErrorMessage(err.message);
        }
    };

    //  Fetch Single Smartphone Method
    const fetchSingleSmartphone = async (slug) => {
        try {
            if (!isFeedLoaded) {
                return;
            }

            const cookieValue = getCookie('post_preferences');
            let parsed = null;

            if (cookieValue && cookieValue !== 'null' && cookieValue !== 'undefined') {
                try {
                    parsed = JSON.parse(decodeURIComponent(cookieValue));
                } catch (error) {
                    console.warn('⚠️ Invalid post_preferences cookie. Using defaults.', error);
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

            const res = await axios.get(route('website.products.get-single-smartphone', encodeURIComponent(slug)), {
                params: finalPreferences,
            });
            const data = await res.data;

            if (data.status) {
                let newIndex = -1;
                flushSync(() => {



                    //  Extracting and storing all related feeds by slug
                    setRelatedFeed((prevRelated) => {
                        const updatedRelated = { ...prevRelated };
                        const smartphone = data.smartphone;



                        // Extracting related from smartphones (only if not already stored)
                        if (
                            smartphone.related &&
                            Array.isArray(smartphone.related) &&
                            smartphone.related.length > 0
                        ) {
                            updatedRelated[smartphone.slug] = smartphone.related;



                        }

                        return updatedRelated;
                    });


                    setFeed((prevFeed) => {
                        const exists = prevFeed.some(
                            (item) => item.type === 'smartphones' && item.id === data.smartphone.id,
                        );

                        let newFeed;
                        if (!exists) {
                            newFeed = [data.smartphone, ...prevFeed];
                        } else {
                            newFeed = prevFeed;
                        }

                        // Calculate index but DON'T set state here
                        const idx = newFeed.findIndex(
                            (item) => item.type === 'smartphones' && item.id === data.smartphone.id,
                        );

                        newIndex = idx;

                        return newFeed;
                    });

                    setFeedGallery(data.smartphone);
                    setFeedOpen(true);

                });

                if (newIndex !== -1) {
                    setFeedIndex(newIndex);
                }
            } else {
                setShowInfoMessage(true);
                setInfoMessage('Smartphone Not Found');
            }
        } catch (err) {
            setShowErrorMessage(true);
            setErrorMessage(err.message);
        }
    };

    // Fetch More Method
    const fetchMorePostsAndProducts = async () => {
        const currentUrl = nextPageUrlRef.current;
        if (!currentUrl || isfetchingMoreYAxisFeed.current) {
            // console.log('⏸️ Skipping fetch:', { currentUrl, isFetching: isfetchingMoreYAxisFeed.current });
            return;
        }

        // console.log('📥 Fetching Y-axis:', currentUrl);

        try {
            const url = new URL(currentUrl);
            isfetchingMoreYAxisFeed.current = true;

            const res = await axios.get(url);
            const data = await res.data;



            const { posts, products, next_page_url } = data;


            flushSync(() => {
                setFeed((prevFeed) => {
                    const existingIds = new Set(
                        prevFeed.map((item) =>
                            item.type === 'posts' ? `posts-${item.id}` : `smartphones-${item.id}`,
                        ),
                    );

                    const newPosts = posts.filter((post) => !existingIds.has(`posts-${post.id}`));
                    const newSmartphones = products.smartphones.filter(
                        (smartphone) => !existingIds.has(`smartphones-${smartphone.id}`),
                    );

                    if (newPosts.length === 0 && newSmartphones.length === 0) {
                        return prevFeed;
                    }

                    return [...prevFeed, ...newPosts, ...newSmartphones];
                });

                //  Extracting and storing all related feeds by slug
                setRelatedFeed((prevRelated) => {
                    const updatedRelated = { ...prevRelated };

                    // Extracting related from posts (only if not already stored)
                    posts.forEach((post) => {
                        if (
                            post.related &&
                            Array.isArray(post.related) &&
                            post.related.length > 0 &&
                            !prevRelated[post.slug]
                        ) {
                            updatedRelated[post.slug] = post.related;

                        }
                    });

                    // Extracting related from smartphones (only if not already stored)
                    products.smartphones.forEach((smartphone) => {
                        if (
                            smartphone.related &&
                            Array.isArray(smartphone.related) &&
                            smartphone.related.length > 0 &&
                            !prevRelated[smartphone.slug]
                        ) {
                            updatedRelated[smartphone.slug] = smartphone.related;

                        }
                    });

                    return updatedRelated;
                });

                setNextPageUrl(next_page_url);
                nextPageUrlRef.current = next_page_url;
            });

        } catch (err) {
            setShowErrorMessage(true);
            setErrorMessage(err.message);
        } finally {
            isfetchingMoreYAxisFeed.current = false;
        }
    };


    // FETCH RELATED FEED
    const fetchRelatedFeed = async (slug) => {
        const cookieValue = getCookie('post_preferences');
        let parsed = null;

        if (cookieValue && cookieValue !== 'null' && cookieValue !== 'undefined') {
            try {
                parsed = JSON.parse(decodeURIComponent(cookieValue));
            } catch (error) {
                console.warn('⚠️ Invalid post_preferences cookie. Using defaults.', error);
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


        const nextUrl = relatedFeedNextUrlsRef.current[slug] ?? `${route('website.posts.getrelated')}`;

        const existingslugs = relatedFeed[slug]?.map(item => item.slug) || [];


        try {
            const res = await axios.get(nextUrl, {
                params: {
                    slug: encodeURIComponent(slug),
                    ...finalPreferences,
                    excluded_slugs: existingslugs
                },
            });
            const data = res.data;

            if (data.status) {
                const { results, nextUrl, related_slug } = data;



                if (results.length > 0) {
                    setRelatedFeed(prev => {
                        const existing = prev[related_slug] || [];

                        // filter out duplicates by slug
                        const newOnes = results.filter(item =>
                            !existing.some(ex => ex.slug === item.slug)
                        );

                        return {
                            ...prev,
                            [related_slug]: [...existing, ...newOnes],
                        };
                    });
                }


                relatedFeedNextUrlsRef.current[related_slug] = nextUrl ?? null;

            } else if (data.type === 'nothing_found') {

                relatedFeedNextUrlsRef.current[slug] = null
            }
        } catch (err) {
            console.error(`[${slug}] ❌ Error fetching related FEED`, err);

            setShowErrorMessage(true);
            setErrorMessage(err.message);
        }
    };





    // Infinite Scroll Observer
    useEffect(() => {
        if (!loaderRef.current || !nextPageUrl) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !isfetchingMoreYAxisFeed.current) {
                    fetchMorePostsAndProducts();
                }
            },
            { threshold: 1 },
        );

        observer.observe(loaderRef.current);

        return () => {
            if (loaderRef.current) observer.unobserve(loaderRef.current);
        };
    }, [nextPageUrl]);

    // Auto-scroll thumbnails For Mobile Media Navigation
    useEffect(() => {
        if (thumbRefs.current[feedIndex]) {
            thumbRefs.current[feedIndex].scrollIntoView({
                behavior: 'smooth',
                inline: 'center',
                block: 'nearest',
            });
        }
    }, [feedIndex]);

    // Setting Media Items
    useEffect(() => {
        if (feedGallery) {
            const images = Array.isArray(feedGallery.post_image_urls)
                ? feedGallery.post_image_urls.map((url) => ({ type: 'image', url }))
                : [];
            const videos =
                Array.isArray(feedGallery.post_video_urls) && feedGallery.type === 'posts'
                    ? feedGallery.post_video_urls.map((url) => ({ type: 'video', url }))
                    : [];

            const allMedia = [...images, ...videos];
            setMediaItems(allMedia);
            setSelectedMediaIndex(allMedia.length > 0 ? 0 : -1);
        }
    }, [feedGallery]);


    // Setting  Index After Refresh To Start Scrolling From There
    useEffect(() => {
        if (!isFeedLoaded) return;
        if (feedGallery && feed.length > 0) {
            const currentIndex = feed.findIndex(
                (item) => item.id === feedGallery.id && item.type === feedGallery.type,
            );

            if (currentIndex !== -1 && currentIndex !== feedIndex) {
                setFeedIndex(currentIndex);
            }
        }
    }, [feed, isFeedLoaded, feedGallery]);


    // Stopping The Inertia Navigation When Pop STATE TRIGGERS
    // Tracking Sidebar Click
    //(
    const isSidebarClickActive = useSidebarClick();
    const isClosingMobileGalleryRef = useRef(false);
    const previousUrlRef = useRef('');
    const feedOpenCountRef = useRef(0);



    // Resetting counters on component mount
    useEffect(() => {
        previousUrlRef.current = window.location.href;
        feedOpenCountRef.current = 0;
    }, []);

    useEffect(() => {
        const handlePopState = (e) => {
            const currentUrl = new URL(window.location.href);
            const currentParams = new URLSearchParams(currentUrl.search);

            // Check if we're coming FROM a URL with mobile-feed-gallery
            const previousUrl = new URL(previousUrlRef.current);
            const previousParams = new URLSearchParams(previousUrl.search);
            const wasOnMobileGallery = previousParams.has('mobile-feed-gallery');

            // console.log('📍 PopState:', {
            //     from: previousUrlRef.current,
            //     to: window.location.href,
            //     wasOnMobileGallery,
            //     mobileGalleryOpen: MobileFeedGalleryOpenRef.current,
            //     feedOpen: feedGalleryRef.current !== null
            // });

            // Priority 1: Mobile gallery is currently open OR we just came from mobile gallery
            if (MobileFeedGalleryOpenRef.current || wasOnMobileGallery) {
                // console.log('🔙 Closing mobile gallery');
                isClosingMobileGalleryRef.current = true;
                setMobileFeedGalleryOpen(false);

                // Update previous URL
                previousUrlRef.current = window.location.href;

                // Reset flag after delay
                setTimeout(() => {
                    isClosingMobileGalleryRef.current = false;
                }, 500);
                return;
            }

            // Priority 2: Main feed is open, close it completely
            if (feedGalleryRef.current !== null) {
                // console.log('🔙 Closing main feed');
                e.preventDefault();

                feedGalleryRef.current = null;
                setFeedGallery(null);
                setFeedOpen(false);
                setFeedIndex(0);

                const cleanUrl = window.location.pathname;
                window.history.replaceState({}, '', cleanUrl);

                // Update previous URL
                previousUrlRef.current = window.location.href;
                return;
            }

            // Update previous URL
            previousUrlRef.current = window.location.href;
        };

        const preventInertiaNavigation = (event) => {
            const pathname = event.detail?.visit?.url?.pathname || '';

            // console.log('🚦 Inertia check:', {
            //     isClosing: isClosingMobileGalleryRef.current,
            //     mobileGalleryOpen: MobileFeedGalleryOpenRef.current,
            //     feedOpen: feedGalleryRef.current !== null,
            //     pathname
            // });

            // Block if we just closed mobile gallery
            if (isClosingMobileGalleryRef.current && pathname === '/' && !isSidebarClickActive) {
                // console.log('🛑 Blocked - Just closed mobile gallery');
                event.preventDefault();
                return;
            }

            // Block if mobile gallery is open
            if (MobileFeedGalleryOpenRef.current && pathname === '/' && !isSidebarClickActive) {
                // console.log('🛑 Blocked - Mobile gallery open');
                event.preventDefault();
                return;
            }

            // Block if feed is open
            if (feedGalleryRef.current !== null && pathname === '/' && !isSidebarClickActive) {
                // console.log('🛑 Blocked - Feed open');
                event.preventDefault();
                return;
            }

        };

        window.addEventListener('popstate', handlePopState);
        const removeRouterEvent = router.on('before', preventInertiaNavigation);

        return () => {
            window.removeEventListener('popstate', handlePopState);
            if (removeRouterEvent) removeRouterEvent();
        };
    }, [isSidebarClickActive]);


    // Sync MobileFeedGalleryOpen state changes
    useEffect(() => {
        MobileFeedGalleryOpenRef.current = MobileFeedGalleryOpen;

        if (MobileFeedGalleryOpen) {
            const url = new URL(window.location.href);
            url.searchParams.set('mobile-feed-gallery', true);

            // ✅ ALWAYS use pushState for mobile gallery
            // Mobile gallery is a new navigation state that user should be able to go back from
            window.history.pushState({}, '', url.toString());

            // Update previous URL ref
            previousUrlRef.current = url.toString();


        }
    }, [MobileFeedGalleryOpen]);
    //)




    return (
        <MainLayout>
            <Head title="Home" />

            {(showErrorMessage || showInfoMessage) && (
                <Toast
                    flash={{
                        ...(showErrorMessage ? { error: ErrorMessage } : { info: InfoMessage }),
                    }}
                    onClosed={(type) => {
                        if (type === 'info') {
                            setInfoMessage(null);
                            setShowInfoMessage(false);
                        }
                        if (type === 'error') {
                            setErrorMessage(null);
                            setShowErrorMessage(false);
                        }
                    }}
                />
            )}

            {!isFeedLoaded && (
                <div className="flex items-center justify-center gap-2 py-10 text-center text-gray-700 lg:text-[18px] text-[10px] transition-all duration-100 animate-pulse dark:text-white/80">
                    <div className="flex items-center justify-center">
                        <div role="status">
                            <svg
                                aria-hidden="true"
                                className="w-3 h-3 text-gray-200 lg:w-5 lg:h-5 animate-spin fill-indigo-600 dark:text-white/80"
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
                    Please Wait While We Load Data...
                </div>
            )}

            {isFeedLoaded && (
                <>
                    {/* Search Bar */}
                    {windowSize.width > 1024 && (
                        <div className="w-1/2 m-auto mb-3">
                            <GlobalSearch
                                filters={false}
                                additional_filters={false}
                                google_map_api_key={google_map_api_key}
                                OnPostFilterChange={() => {
                                    window.history.replaceState({}, '', window.location.pathname);
                                    setIsFeedLoaded(false);
                                    setPosts(null);
                                    setProducts(null);
                                    setNextPageUrl(null);
                                    fetchPostsAndProducts();
                                }}
                                search_history={search_history}
                                mainPage={true}
                            />
                        </div>
                    )}

                    {/* Masonry Layout */}
                    <div className="pb-20 sm:pb-20">
                        <div className="mx-auto max-w-8xl sm:px-6 lg:px-8">
                            {/* Compact Masonry */}
                            <div className="lg:columns:2 columns-1 gap-1  [column-fill:_balance] min-[300px]:columns-2 md:columns-2 lg:gap-2 xl:columns-4">
                                {feed.map((item, index) => {
                                    return (
                                        <Fragment key={index}>
                                            {item?.type === 'posts' && (
                                                <article
                                                    key={item?.id}
                                                    className="relative mb-1 overflow-hidden transition-all duration-300 rounded-none shadow-md cursor-pointer no-touch-hover group break-inside-avoid hover:-translate-y-1 hover:shadow-xl lg:mb-2"
                                                    style={{ animationDelay: `${index * 100}ms` }}
                                                    onClick={() => {
                                                        feedOpenCountRef.current++;

                                                        setFeedGallery(item);
                                                        setFeedIndex(index);
                                                        setFeedOpen(true);
                                                        const url = generateURL(item);
                                                        if (feedOpenCountRef.current === 1) {
                                                            window.history.replaceState({}, '', url);
                                                            window.history.pushState({}, '', url);
                                                        } else {
                                                            window.history.pushState({}, '', url);
                                                        }

                                                        previousUrlRef.current = window.location.href;
                                                    }}
                                                >
                                                    {item?.images ? (
                                                        <div className="relative">
                                                            <img
                                                                src={item?.images[0]?.url}
                                                                alt={item?.title}
                                                                loading="lazy"
                                                                onError={(e) =>
                                                                    (e.target.src = Placeholder)
                                                                }
                                                                className="w-full object-cover text-[10px] text-gray-700 transition-all duration-500 group-hover:scale-105 dark:text-white/80 dark:opacity-80"
                                                            />

                                                            {/* Title */}
                                                            <div className="absolute left-3 top-3">
                                                                <span className="text-[8px] text-white drop-shadow-md sm:text-[9px] md:text-[10px] lg:text-[17px]">
                                                                    {item?.tag}
                                                                </span>
                                                            </div>

                                                            {/* Title + Meta */}
                                                            <div className="absolute inset-x-0 bottom-0 p-4">
                                                                <div className="mt-1 flex items-center justify-between text-[8px] font-bold text-gray-200 drop-shadow-sm sm:text-[9px] md:text-[10px] lg:text-[17px]">
                                                                    <span className="text-white drop-shadow-md">
                                                                        {item?.title.length > 25
                                                                            ? item?.title.slice(
                                                                                0,
                                                                                25,
                                                                            ) + '...'
                                                                            : item?.title}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ) : !item?.images && item?.videos ? (
                                                        <>
                                                            <div className="relative">
                                                                <VideoThumbnail
                                                                    key={`${index}-${item?.post_video_urls[0]}`}
                                                                    videoUrl={
                                                                        item?.post_video_urls[0]
                                                                    }
                                                                    alt={item?.title}
                                                                    className="w-full object-cover text-[10px] text-gray-700 transition-all duration-500 group-hover:scale-105 dark:text-white/80 dark:opacity-80"
                                                                />

                                                                {/* Title */}
                                                                <div className="absolute left-3 top-3">
                                                                    <span className="text-[8px] text-white drop-shadow-md sm:text-[9px] md:text-[10px] lg:text-[17px]">
                                                                        {item?.tag}
                                                                    </span>
                                                                </div>

                                                                {/* Title + Meta */}
                                                                <div className="absolute inset-x-0 bottom-0 p-4">
                                                                    <div className="mt-1 flex items-center justify-between text-[8px] font-bold text-gray-200 drop-shadow-sm sm:text-[9px] md:text-[10px] lg:text-[17px]">
                                                                        <span className="text-white drop-shadow-md">
                                                                            {item?.title.length > 25
                                                                                ? item?.title.slice(
                                                                                    0,
                                                                                    25,
                                                                                ) + '...'
                                                                                : item?.title}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <>
                                                            {/* /* Text-only */}
                                                            <div className="relative flex flex-col justify-between bg-[#F2F2F2] p-5 text-gray-700 dark:bg-[#485260] dark:text-white/80">
                                                                <div className="flex items-center justify-between">
                                                                    <span className="mb-3 text-[8px] drop-shadow-md sm:text-[9px] md:text-[10px] lg:text-[17px]">
                                                                        {item?.tag}
                                                                    </span>
                                                                </div>

                                                                <div>
                                                                    <p className="line-clamp-5 text-[8px] opacity-90 sm:text-[9px] md:text-[10px] lg:text-[17px]">
                                                                        {item.content.length >
                                                                            400 ? (
                                                                            <span
                                                                                dangerouslySetInnerHTML={{
                                                                                    __html:
                                                                                        item?.content.substring(
                                                                                            0,
                                                                                            400,
                                                                                        ) + '...',
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
                                                                            ? item?.title.slice(
                                                                                0,
                                                                                20,
                                                                            ) + '...'
                                                                            : item?.title}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </>
                                                    )}
                                                </article>
                                            )}

                                            {item?.type === 'smartphones' && (
                                                <article
                                                    key={index}
                                                    className="relative mb-1 overflow-hidden transition-all duration-300 rounded-none shadow-md cursor-pointer no-touch-hover group break-inside-avoid hover:-translate-y-1 hover:shadow-xl"
                                                    onClick={() => {
                                                        feedOpenCountRef.current++;
                                                        setFeedGallery(item);
                                                        setFeedIndex(index);
                                                        setFeedOpen(true);
                                                        const url = new URL(window.location.href);
                                                        url.searchParams.set('m-slug', item.slug);
                                                        if (feedOpenCountRef.current === 1) {
                                                            window.history.replaceState({}, '', url.toString());
                                                            window.history.pushState({}, '', url.toString());
                                                        } else {
                                                            window.history.pushState({}, '', url.toString());
                                                        }


                                                        previousUrlRef.current = url;
                                                    }}
                                                >
                                                    <div className="relative">
                                                        <img
                                                            src={item.images?.[0]}
                                                            alt={item.name}
                                                            loading="lazy"
                                                            onError={(e) =>
                                                                (e.target.src = Placeholder)
                                                            }
                                                            className="object-cover w-full transition-all duration-500 group-hover:scale-105"
                                                        />

                                                        <div className="absolute left-3 top-3">
                                                            <span className="text-[8px] text-white drop-shadow-md sm:text-[9px] md:text-[10px] lg:text-[17px]">
                                                                {item?.tag}
                                                            </span>
                                                        </div>

                                                        {/* Overlay */}
                                                        <div className="absolute inset-x-0 bottom-0 p-3 bg-transparent">
                                                            <div className="mt-2 flex items-center justify-between text-[8px] font-bold text-gray-200 drop-shadow-sm sm:text-[9px] md:text-[10px] lg:text-[17px]">
                                                                <span className="text-white">
                                                                    {item.name.length > 20
                                                                        ? item.name.slice(0, 20) +
                                                                        '...'
                                                                        : item.name}{' '}
                                                                    (
                                                                    {item.capacity.length > 10
                                                                        ? item.capacity.slice(
                                                                            0,
                                                                            10,
                                                                        ) + '...'
                                                                        : item.capacity}
                                                                    )
                                                                </span>

                                                                <span>
                                                                    {item.selling_info?.total_price
                                                                        ? `${currency?.symbol} ${item.selling_info.total_price}`
                                                                        : ''}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </article>
                                            )}
                                        </Fragment>
                                    );
                                })}
                            </div>

                            {isFeedLoaded && feed.length === 0 && (
                                <div className="flex items-center justify-center px-6 py-12 bg-white border border-gray-200 shadow-sm rounded-xl dark:border-gray-700 dark:bg-deepcharcoal">
                                    <div className="flex flex-col items-center gap-4">
                                        {/* Custom No Content SVG */}
                                        <div className="flex items-center justify-center w-20 h-20">
                                            <svg
                                                viewBox="0 0 120 120"
                                                className="w-full h-full text-gray-400 dark:text-gray-500"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                {/* Background Circle */}
                                                <circle
                                                    cx="60"
                                                    cy="60"
                                                    r="50"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeDasharray="8 4"
                                                    opacity="0.3"
                                                />

                                                {/* Document/Post Icon */}
                                                <rect
                                                    x="25"
                                                    y="30"
                                                    width="25"
                                                    height="32"
                                                    rx="3"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    fill="none"
                                                />
                                                <line
                                                    x1="30"
                                                    y1="38"
                                                    x2="45"
                                                    y2="38"
                                                    stroke="currentColor"
                                                    strokeWidth="1.5"
                                                    opacity="0.6"
                                                />
                                                <line
                                                    x1="30"
                                                    y1="43"
                                                    x2="42"
                                                    y2="43"
                                                    stroke="currentColor"
                                                    strokeWidth="1.5"
                                                    opacity="0.6"
                                                />
                                                <line
                                                    x1="30"
                                                    y1="48"
                                                    x2="45"
                                                    y2="48"
                                                    stroke="currentColor"
                                                    strokeWidth="1.5"
                                                    opacity="0.6"
                                                />

                                                {/* Product/Box Icon */}
                                                <rect
                                                    x="70"
                                                    y="35"
                                                    width="22"
                                                    height="22"
                                                    rx="2"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    fill="none"
                                                />
                                                <line
                                                    x1="70"
                                                    y1="42"
                                                    x2="92"
                                                    y2="42"
                                                    stroke="currentColor"
                                                    strokeWidth="1.5"
                                                    opacity="0.6"
                                                />
                                                <line
                                                    x1="81"
                                                    y1="35"
                                                    x2="81"
                                                    y2="57"
                                                    stroke="currentColor"
                                                    strokeWidth="1.5"
                                                    opacity="0.6"
                                                />

                                                {/* Search/Magnifying Glass */}
                                                <circle
                                                    cx="60"
                                                    cy="75"
                                                    r="12"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    fill="none"
                                                />
                                                <line
                                                    x1="68"
                                                    y1="83"
                                                    x2="78"
                                                    y2="93"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                />

                                                {/* X mark inside search */}
                                                <line
                                                    x1="55"
                                                    y1="70"
                                                    x2="65"
                                                    y2="80"
                                                    stroke="currentColor"
                                                    strokeWidth="1.5"
                                                    strokeLinecap="round"
                                                />
                                                <line
                                                    x1="65"
                                                    y1="70"
                                                    x2="55"
                                                    y2="80"
                                                    stroke="currentColor"
                                                    strokeWidth="1.5"
                                                    strokeLinecap="round"
                                                />
                                            </svg>
                                        </div>

                                        {/* Text */}
                                        <div className="text-center">
                                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                                No Content Found
                                            </h3>
                                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                                No posts or products Found
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Loader */}
                            {nextPageUrl && (
                                <div
                                    ref={loaderRef}
                                    className="flex items-center justify-center gap-2 py-10 text-center lg:text-[18px] text-[10px] text-gray-700 transition-all duration-100 animate-pulse dark:text-white/80"
                                >
                                    <div className="flex items-center justify-center">
                                        <div role="status">
                                            <svg
                                                aria-hidden="true"
                                                className="w-3 h-3 text-gray-200 lg:w-5 lg:h-5 animate-spin fill-blue-600 dark:text-gray-600"
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
                                    Loading more...
                                </div>
                            )}
                        </div>
                    </div>

                    {/* PC Feed  */}
                    {windowSize.width > 1024 && feedOpen && feedGallery !== null && (
                        <>
                            {feedGallery?.type === 'posts' && (
                                <PostDesktopModal
                                    setShowQrCode={setShowQrCode}
                                    post={feedGallery}
                                    search_history={search_history}
                                    setShowErrorMessage={setShowErrorMessage}
                                    setLinkCopied={setLinkCopied}
                                    setBookmarkStatusChanged={setBookmarkStatusChanged}
                                    setErrorMessage={setErrorMessage}
                                    setMediaItems={setMediaItems}
                                    mediaItems={mediaItems}
                                    auth={auth}
                                    generateURL={generateURL}
                                    navigateToHashtag={navigateToHashtag}
                                    Placeholder={Placeholder}
                                />
                            )}

                            {feedGallery?.type === 'smartphones' && (
                                <SmartphoneDesktopModal
                                    searchHistory={search_history}
                                    smartphone={feedGallery}
                                    setSmartphone={setFeedGallery}
                                    smartphoneDesktopModal={feedOpen}
                                    setSmartphoneDesktopModal={setFeedOpen}
                                    setShowQrCode={setShowQrCode}
                                    showQrCode={showQrCode}
                                    auth={auth}
                                    cart_items={cart_items}
                                    currency={currency}
                                    navigateToHashtag={navigateToHashtag}
                                    Placeholder={Placeholder}
                                />
                            )}
                        </>
                    )}

                    {/* MOBILE FEED */}
                    {windowSize.width < 1024 && feedOpen && feedGallery !== null && (
                        <MobileFeed
                            feed={feed}
                            feedGallery={feedGallery}
                            setFeedGallery={setFeedGallery}
                            setLinkCopied={setLinkCopied}
                            setShowQrCode={setShowQrCode}
                            setBookmarkStatusChanged={setBookmarkStatusChanged}
                            auth={auth}
                            generateURL={generateURL}
                            navigateToHashtag={navigateToHashtag}
                            feedIndex={feedIndex}
                            setFeedIndex={setFeedIndex}
                            relatedFeed={relatedFeed}
                            fetchMoreYAxis={fetchMorePostsAndProducts}
                            MobileFeedGalleryOpen={MobileFeedGalleryOpen}
                            setMobileFeedGalleryOpen={setMobileFeedGalleryOpen}
                            cart_items={cart_items}
                            currency={currency}
                            placeholderImage={Placeholder}
                            fetchRelatedFeed={fetchRelatedFeed}
                            relatedFeedNextUrlsRef={relatedFeedNextUrlsRef}
                            nextPageUrl={nextPageUrlRef.current}
                            Placeholder={Placeholder}
                            isfetchingMoreYAxisFeed={isfetchingMoreYAxisFeed.current}



                        />
                    )}

                    {/* QR CODE */}
                    {showQrCode &&
                        createPortal(
                            <div className="fixed inset-0 z-[100] flex items-center justify-center">
                                {/* Overlay */}
                                <div
                                    className="fixed inset-0 bg-black/40 backdrop-blur-sm"
                                    onClick={() => setShowQrCode(false)}
                                ></div>

                                {/* Modal */}
                                <div
                                    role="dialog"
                                    aria-modal="true"
                                    aria-labelledby="qrCodeTitle"
                                    className={`relative z-[101] w-full max-w-[200px] rounded-2xl bg-transparent  pt-3 text-gray-900   lg:max-w-[300px] lg:p-6`}
                                >
                                    <div className="text-center">
                                        <div className="flex justify-center">
                                            <QRCode
                                                className={`${windowSize.width > 1024 ? 'size-52' : 'size-48'} border-2`}
                                                {...(feedGallery.type === 'posts' && {
                                                    value: route('home') + generateURL(feedGallery),
                                                })}
                                                {...(feedGallery.type === 'smartphones' && {
                                                    value:
                                                        route('home') +
                                                        '/?m-slug=' +
                                                        feedGallery?.slug,
                                                })}
                                                viewBox="0 0 256 256"
                                                level="H"
                                                includemargin="true"
                                                bgColor="#ffffff"
                                                fgColor="#000000"
                                            />
                                        </div>

                                        <h2
                                            id="qrCodeTitle"
                                            className="my-3 text-base font-semibold text-white dark:text-white/80"
                                        >
                                            Scan QR Code
                                        </h2>
                                    </div>
                                </div>
                            </div>,
                            document.body,
                        )}

                    {/* Link Copied  */}
                    {linkCopied && (
                        <LinkCopiedModal linkCopied={linkCopied} setLinkCopied={setLinkCopied} />
                    )}

                    {/* Bookmark */}
                    {bookmarkStatusChanged && (
                        <BookmarkStatusChangedModal
                            BookmarkStatusChanged={bookmarkStatusChanged}
                            setBookmarkStatusChanged={setBookmarkStatusChanged}
                            viewablePost={feedGallery}
                        />
                    )}
                </>
            )}
        </MainLayout>
    );
}
