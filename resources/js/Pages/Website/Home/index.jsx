import useWindowSize from '@/Hooks/useWindowSize';
import MainLayout from '@/Layouts/Website/MainLayout';
import { Head, router, usePage } from '@inertiajs/react';
import React, { memo, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import QRCode from 'react-qr-code';
import { createPortal, flushSync } from 'react-dom';
import axios from 'axios';
import LinkCopiedModal from '@/Components/LinkCopiedModal';
import BookmarkStatusChangedModal from '@/Components/BookmarkStatusChangedModal';
import useSidebarClick from '@/Hooks/useSidebarClick';
import getCookie from '@/Hooks/useGetCookie';
import Toast from '@/Components/Toast';
import Placeholder from 'asset/assets/images/product/placeholder.jpg';
import MobileFeed from './MobileFeed';
import Spinner from '@/Components/Spinner';
import MasonryFeedItem from './MasonryFeedItem';
import DesktopFeed from './DesktopFeed';
import { useTranslation } from '@/Hooks/useTranslation';
import MobileFeedSinglePage from './MobileFeedSinglePage';
import LodgingReservationPanel from './LodgingReservationPanel';
import DesktopFeedSkeleton from '@/Components/DesktopFeedSkeleton';
import MobileFeedSkeleton from '@/Components/MobileFeedSkeleton';

// Interleaves posts and smartphones in a zig-zag order (post, smartphone, post, smartphone, ...).
// Leftover items from the longer list are appended at the end.
// Used only when appending newly-fetched items to the feed, so the feed renders mixed instead of blocky.
const interleaveFeedItems = (posts = [], smartphones = [], lodging_properties = []) => {
    const mixed = [];
    const max = Math.max(posts.length, smartphones.length, lodging_properties.length);

    for (let i = 0; i < max; i++) {
        if (i < posts.length) mixed.push(posts[i]);
        if (i < smartphones.length) mixed.push(smartphones[i]);
        if (i < lodging_properties.length) mixed.push(lodging_properties[i]);
    }

    return mixed;
};

const index = ({ previous_url, direct_post = [], direct_smartphone = [], direct_lodging = null }) => {
    // Translation Hook
    const { __, loading: translationLoading } = useTranslation();
    const t = (key) => (translationLoading ? key : __(key));

    // show Skeleton when directly opening Any Feed
    const [showFeedSkeleton, setShowFeedSkeleton] = useState(() => {
        if (typeof window === 'undefined') return false;

        const pathname = window.location.pathname;
        const params = new URLSearchParams(window.location.search);
        const isCanonicalPath =
            pathname.startsWith('/post/') ||
            pathname.startsWith('/product/') ||
            pathname.startsWith('/lodging/');
        const isDirect =
            params.get('direct') === 'true' &&
            (params.has('slug') ||
                params.has('m-slug') ||
                params.has('public_id') ||
                params.has('m-public_id'));

        if (isDirect) {
            return true;
        } else if (isCanonicalPath) {
            return true;
        }
        return false;
    });

    const { currency, auth, smartphone_addon_items } = usePage().props;

    const resolveInitialPreviousUrl = () => {
        // Priority 1: backend prop
        if (previous_url) return previous_url;

        // Priority 2: client-side stored origin
        if (typeof window === 'undefined') return null;

        try {
            const stored = sessionStorage.getItem('andromeda_prev_url');

            if (stored && (stored.includes('/shop') || stored.includes('/bookmarks'))) {
                return stored;
            }
        } catch (e) {}

        return null;
    };

    const redirectedPreviousUrl = useRef(resolveInitialPreviousUrl());
    // console.log(redirectedPreviousUrl.current);

    useLayoutEffect(() => {
        if (!showFeedSkeleton) return;

        // Force browser to paint skeleton BEFORE heavy JS
        requestAnimationFrame(() => {});
    }, []);

    const [ErrorMessage, setErrorMessage] = useState(null);
    const [showErrorMessage, setShowErrorMessage] = useState(false);

    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [successMessage, setSuccessMessage] = useState(null);

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
    const [spatiotemporalInfoModal, setSpatiotemporalInfoModal] = useState(false);
    const isSpatiotemporalModalOpenRef = useRef(false);

    // Stage 3.3 — rate-plan reservation slide-in. Holds { lodging, room, ratePlan } or null.
    // History wiring mirrors the spatiotemporal modal (own ref + own `?reserve` param + a
    // first-priority popstate check) so the Back button closes the panel without touching the feed.
    const [reservationPanel, setReservationPanel] = useState(null);
    const reservationPanelOpenRef = useRef(false);

    // This State is For Tracking If The FEED ITEM Is Opening After refresh or FROM URL DIRECTLY
    const [isFeedOpeningDirectly, setIsFeedOpeningDirectly] = useState(false);

    const [bookmarkStatusChanged, setBookmarkStatusChanged] = useState(false);
    const [linkCopied, setLinkCopied] = useState(false);
    const [nextPageUrl, setNextPageUrl] = useState(null);

    const nextPageUrlRef = useRef(null);

    // Preventing Un-nesseary NetWork Erros So Adding The Ref That Only Allows On Fecthing at a Time And Re-try Mechanism
    const mainFeedInFlightRef = useRef(false);
    const mainFeedRetryRef = useRef(0);

    // Initialize with first load
    useEffect(() => {
        nextPageUrlRef.current = nextPageUrl;
    }, [nextPageUrl]);

    const fetchPostsAndProducts = async () => {
        if (mainFeedInFlightRef.current) return;

        mainFeedInFlightRef.current = true;

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

        try {
            const res = await axios.get(route('website.posts.index'), {
                params: finalPreferences,
            });

            const { posts, products } = res.data;

            flushSync(() => {
                setFeed((prevFeed) => {
                    const existingIds = new Set(
                        prevFeed.map((item) =>
                            item.type === 'posts'
                                ? `posts-${item.id}`
                                : item.type === 'lodging'
                                  ? `lodging-${item.id}`
                                  : `smartphones-${item.id}`,
                        ),
                    );

                    const newPosts = posts.filter((post) => !existingIds.has(`posts-${post.id}`));

                    const newSmartphones = products.smartphones.filter(
                        (smartphone) => !existingIds.has(`smartphones-${smartphone.id}`),
                    );

                    const newLodging = (products.lodging_properties || []).filter(
                        (lodging) => !existingIds.has(`lodging-${lodging.id}`),
                    );

                    // return [...prevFeed, ...newPosts, ...newSmartphones];
                    return [
                        ...prevFeed,
                        ...interleaveFeedItems(newPosts, newSmartphones,newLodging),
                    ];
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

                    // Extracting related from lodging properties (only if not already stored)
                    (products.lodging_properties || []).forEach((lodging) => {
                        if (
                            lodging.related &&
                            Array.isArray(lodging.related) &&
                            lodging.related.length > 0 &&
                            !prevRelated[lodging.slug]
                        ) {
                            updatedRelated[lodging.slug] = lodging.related;
                        }
                    });

                    return updatedRelated;
                });

                setNextPageUrl(res.data.next_page_url);
                setIsFeedLoaded(true);
            });
        } catch (error) {
            if (error?.message === 'Network Error' && mainFeedRetryRef.current < 1) {
                mainFeedRetryRef.current++;
                mainFeedInFlightRef.current = false;

                setTimeout(() => {
                    fetchPostsAndProducts();
                }, 300);

                return;
            }

            setIsFeedLoaded(true);
            setShowErrorMessage(true);
            setErrorMessage(__('Failed to Fetch Feed Please try again later.'));
        } finally {
            mainFeedInFlightRef.current = false;
        }
    };

    useEffect(() => {

         const addBackBuffer = () => {
        if (!redirectedPreviousUrl.current) {
            window.history.pushState({}, '', window.location.href);
        }
    };

        if (showFeedSkeleton) {
            // Let skeleton paint first
            requestAnimationFrame(() => {
                setTimeout(() => {
                    fetchPostsAndProducts();
                    addBackBuffer();
                }, 0);
            });
        } else {
            fetchPostsAndProducts();
            addBackBuffer();
        }
    }, []);

    // POST UNIQUE URL GENERATION
    const generateURL = (post, isDirect = false, isSinglePage = false) => {
        return `/post/${encodeURIComponent(post?.public_id)}/${encodeURIComponent(post?.slug)}`;
    };

    // Smartphone URL Generation
    const generateSmartphoneURL = (smartphone, isDirect = false, isSinglePage = false) => {
        return `/product/${encodeURIComponent(smartphone?.public_id)}/${smartphone?.slug}`; //${isSinglePage ? '&single_page=true' : ''}${isDirect ? '&direct=true' : ''}`;
    };

    // Lodging Property URL Generation (Stage 3.2)
    const generateLodgingURL = (lodging, isDirect = false, isSinglePage = false) => {
        return `/lodging/${encodeURIComponent(lodging?.public_id)}/${lodging?.slug}`;
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
            console.error(__('Hashtag navigation failed') + ':', error);
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

    // Checking Slug In URL If Found Than Auto Opening  FEED AND PC Modal
    const hasOpenedSlugRef = useRef(false);

    // Single Page For Mobile FEED GALLERY
    const isSinglePageRef = useRef(false);

    useEffect(() => {
        if (!isFeedLoaded || hasOpenedSlugRef.current) return;

        const params = new URLSearchParams(window.location.search);

        let post_slug = params.get('slug');
        let post_public_id = params.get('public_id');
        let smartphone_slug = params.get('m-slug');
        let smartphone_public_id = params.get('m-public_id');
        let lodging_slug = null;
        let lodging_public_id = null;
        let isSinglePage = params.get('single_page') === 'true';

        if (direct_post?.public_id) {
            post_public_id = direct_post.public_id;
            post_slug = direct_post.slug;
            isSinglePage = true;
        }

        if (direct_smartphone?.public_id) {
            smartphone_public_id = direct_smartphone.public_id;
            smartphone_slug = direct_smartphone.slug;
            isSinglePage = true;
        }

        // Lodging deep-link (Stage 3.2 Fix L): open in single-page mode like post/smartphone,
        // so a mobile refresh routes to MobileFeedSinglePage -> MobileFeedGallery (lodging branch).
        if (direct_lodging?.public_id) {
            lodging_public_id = direct_lodging.public_id;
            lodging_slug = direct_lodging.slug;
            isSinglePage = true;
        }

        if (
            !post_slug &&
            !smartphone_slug &&
            !post_public_id &&
            !smartphone_public_id &&
            !lodging_slug &&
            !lodging_public_id &&
            !isSinglePage
        )
            return;

        isSinglePageRef.current = isSinglePage;

        if (isSinglePage && windowSize.width < 1024) {
            setMobileFeedGalleryOpen(true);
        }

        setIsFeedOpeningDirectly(true);
        let feedItem = null;

        if (post_slug || post_public_id) {
            feedItem = feed.find(
                (item) =>
                    item.type === 'posts' &&
                    (item.slug === post_slug || item.public_id === post_public_id),
            );
        } else if (smartphone_slug || smartphone_public_id) {
            feedItem = feed.find(
                (item) =>
                    item.type === 'smartphones' &&
                    (item.slug === smartphone_slug || item.public_id === smartphone_public_id),
            );
        } else if (lodging_slug || lodging_public_id) {
            feedItem = feed.find(
                (item) =>
                    item.type === 'lodging' &&
                    (item.slug === lodging_slug || item.public_id === lodging_public_id),
            );
        }

        if (feedItem) {
            hasOpenedSlugRef.current = true;
            const index = feed.findIndex((i) => i.slug === feedItem.slug);
            if (index !== -1) {
                setFeedGallery(feedItem);
                setFeedOpen(true);
                setFeedIndex(index);
            }

            window.history.replaceState({}, '', window.location.href);
        } else {
            hasOpenedSlugRef.current = true;

            if (post_slug || post_public_id)
                fetchSinglePost(post_slug || null, post_public_id || null);
            else if (smartphone_slug || smartphone_public_id)
                fetchSingleSmartphone(smartphone_slug || null, smartphone_public_id || null);
            else if (lodging_slug || lodging_public_id)
                fetchSingleLodging(lodging_slug || null, lodging_public_id || null);

            window.history.replaceState({}, '', window.location.href);
        }
    }, [isFeedLoaded, feed, windowSize.width, direct_post, direct_smartphone, direct_lodging]);

    // Fetch Single Post Method
    const fetchSinglePost = async (slug, public_id = null) => {
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
                    console.warn(
                        '⚠️ ' + t('Invalid post_preferences cookie. Using defaults.'),
                        error,
                    );
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

            const routeParams = {};
            if (public_id) routeParams.public_id = public_id;
            if (slug) routeParams.slug = encodeURIComponent(slug);

            const res = await axios.get(route('website.posts.getsingle', routeParams), {
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
                isSinglePageRef.current = false;
                setShowFeedSkeleton(false);
                setShowInfoMessage(true);
                setInfoMessage(t('Post Not Found', true));
                window.history.replaceState({}, '', window.location.pathname);
            }
        } catch (err) {
            isSinglePageRef.current = false;
            setShowFeedSkeleton(false);
            setShowErrorMessage(true);
            const msg = err.response?.data?.message;
            setErrorMessage(msg || t('Something went wrong'));

            window.history.replaceState({}, '', window.location.pathname);
        }
    };

    //  Fetch Single Smartphone Method
    const fetchSingleSmartphone = async (slug, public_id = null) => {
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
                    console.warn(
                        '⚠️ ' + t('Invalid post_preferences cookie. Using defaults.'),
                        error,
                    );
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

            const routeParams = {};
            if (public_id) routeParams.public_id = public_id;
            if (slug) routeParams.slug = encodeURIComponent(slug);
            const res = await axios.get(
                route('website.products.get-single-smartphone', routeParams),
                {
                    params: finalPreferences,
                },
            );
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
                isSinglePageRef.current = false;
                setShowFeedSkeleton(false);
                setShowInfoMessage(true);
                setInfoMessage(t('Smartphone Not Found'));
                window.history.replaceState({}, '', window.location.pathname);
            }
        } catch (err) {
            isSinglePageRef.current = false;
            setShowFeedSkeleton(false);
            setShowErrorMessage(true);
            const msg = err.response?.data?.message;
            setErrorMessage(msg || t('Something went wrong'));
            window.history.replaceState({}, '', window.location.pathname);
        }
    };

    //  Fetch Single Lodging Method (Stage 3.2)
    const fetchSingleLodging = async (slug, public_id = null) => {
        try {
            if (!isFeedLoaded) {
                return;
            }

            const routeParams = {};
            if (public_id) routeParams.public_id = public_id;
            if (slug) routeParams.slug = encodeURIComponent(slug);

            const res = await axios.get(
                route('website.products.get-single-lodging', routeParams),
            );
            const data = await res.data;

            if (data.status) {
                let newIndex = -1;
                flushSync(() => {
                    //  Extracting and storing all related feeds by slug
                    setRelatedFeed((prevRelated) => {
                        const updatedRelated = { ...prevRelated };
                        const lodging = data.lodging;

                        // Extracting related from lodging (only if not already stored)
                        if (
                            lodging.related &&
                            Array.isArray(lodging.related) &&
                            lodging.related.length > 0
                        ) {
                            updatedRelated[lodging.slug] = lodging.related;
                        }

                        return updatedRelated;
                    });

                    setFeed((prevFeed) => {
                        const exists = prevFeed.some(
                            (item) => item.type === 'lodging' && item.id === data.lodging.id,
                        );

                        let newFeed;
                        if (!exists) {
                            newFeed = [data.lodging, ...prevFeed];
                        } else {
                            newFeed = prevFeed;
                        }

                        const idx = newFeed.findIndex(
                            (item) => item.type === 'lodging' && item.id === data.lodging.id,
                        );

                        newIndex = idx;

                        return newFeed;
                    });

                    setFeedGallery(data.lodging);
                    setFeedOpen(true);
                });

                if (newIndex !== -1) {
                    setFeedIndex(newIndex);
                }
            } else {
                isSinglePageRef.current = false;
                setShowFeedSkeleton(false);
                setShowInfoMessage(true);
                setInfoMessage(t('Property Not Found'));
                window.history.replaceState({}, '', window.location.pathname);
            }
        } catch (err) {
            isSinglePageRef.current = false;
            setShowFeedSkeleton(false);
            setShowErrorMessage(true);
            const msg = err.response?.data?.message;
            setErrorMessage(msg || t('Something went wrong'));
            window.history.replaceState({}, '', window.location.pathname);
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
                            item.type === 'posts'
                                ? `posts-${item.id}`
                                : item.type === 'lodging'
                                  ? `lodging-${item.id}`
                                  : `smartphones-${item.id}`,
                        ),
                    );

                    const newPosts = posts.filter((post) => !existingIds.has(`posts-${post.id}`));
                    const newSmartphones = products.smartphones.filter(
                        (smartphone) => !existingIds.has(`smartphones-${smartphone.id}`),
                    );

                    const newLodging = (products.lodging_properties || []).filter(
                        (lodging) => !existingIds.has(`lodging-${lodging.id}`),
                    );

                    if (
                        newPosts.length === 0 &&
                        newSmartphones.length === 0 &&
                        newLodging.length === 0
                    ) {
                        return prevFeed;
                    }
                    // return [...prevFeed, ...newPosts, ...newSmartphones];
                    return [
                        ...prevFeed,
                        ...interleaveFeedItems(newPosts, newSmartphones,newLodging),
                    ];
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

                    // Extracting related from lodging properties (only if not already stored)
                    (products.lodging_properties || []).forEach((lodging) => {
                        if (
                            lodging.related &&
                            Array.isArray(lodging.related) &&
                            lodging.related.length > 0 &&
                            !prevRelated[lodging.slug]
                        ) {
                            updatedRelated[lodging.slug] = lodging.related;
                        }
                    });

                    return updatedRelated;
                });

                setNextPageUrl(next_page_url);
                nextPageUrlRef.current = next_page_url;
            });

            isfetchingMoreYAxisFeed.current = false;
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
                console.warn('⚠️ ' + t('Invalid post_preferences cookie. Using defaults.'), error);
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

        const nextUrl =
            relatedFeedNextUrlsRef.current[slug] ?? `${route('website.posts.getrelated')}`;

        const existingslugs = relatedFeed[slug]?.map((item) => item.slug) || [];

        try {
            const res = await axios.get(nextUrl, {
                params: {
                    slug: encodeURIComponent(slug),
                    ...finalPreferences,
                    excluded_slugs: existingslugs,
                },
            });
            const data = res.data;

            if (data.status) {
                const { results, nextUrl, related_slug } = data;

                if (results.length > 0) {
                    setRelatedFeed((prev) => {
                        const existing = prev[related_slug] || [];

                        // filter out duplicates by slug
                        const newOnes = results.filter(
                            (item) => !existing.some((ex) => ex.slug === item.slug),
                        );

                        return {
                            ...prev,
                            [related_slug]: [...existing, ...newOnes],
                        };
                    });
                }

                relatedFeedNextUrlsRef.current[related_slug] = nextUrl ?? null;
            } else if (data.type === 'nothing_found') {
                relatedFeedNextUrlsRef.current[slug] = null;
            }
        } catch (err) {
            console.error(`[${slug}] ❌ ${t('Error fetching related FEED')}`, err);

            setShowErrorMessage(true);
            setErrorMessage(err.message);
        }
    };

    // QR CODE DOWNLOAD STATE AND DOWNLOAD METHOD AND STATE
    const [isQrDownloading, setIsQrDownloading] = useState(false);
    const handleDownloadQRCode = () => {
        setIsQrDownloading(true);
        setTimeout(() => {
            const svg = document.querySelector('#qr-code-canvas');

            if (!svg) {
                console.error('SVG element not found');
                setIsQrDownloading(false);
                return;
            }

            try {
                const svgClone = svg.cloneNode(true);
                svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

                const svgData = new XMLSerializer().serializeToString(svgClone);

                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                const padding = 40;
                const qrSize = 800;
                const totalSize = qrSize + padding * 2;

                canvas.width = totalSize;
                canvas.height = totalSize;

                const img = new Image();
                const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
                const url = URL.createObjectURL(svgBlob);

                img.onload = () => {
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(0, 0, totalSize, totalSize);

                    ctx.drawImage(img, padding, padding, qrSize, qrSize);

                    ctx.strokeStyle = '#000000';
                    ctx.lineWidth = 2;
                    ctx.strokeRect(padding - 1, padding - 1, qrSize + 2, qrSize + 2);

                    canvas.toBlob(
                        (blob) => {
                            if (!blob) {
                                console.error('Failed to create blob');
                                URL.revokeObjectURL(url);
                                setIsQrDownloading(false);
                                return;
                            }

                            const downloadUrl = URL.createObjectURL(blob);
                            const link = document.createElement('a');

                            const filename =
                                feedGallery.type === 'posts'
                                    ? `qr-code-post-${feedGallery.id || 'download'}.png`
                                    : `qr-code-${feedGallery.slug || 'download'}.png`;

                            link.href = downloadUrl;
                            link.download = filename;

                            document.body.appendChild(link);
                            link.click();

                            // Cleanup
                            setTimeout(() => {
                                document.body.removeChild(link);
                                URL.revokeObjectURL(downloadUrl);
                                URL.revokeObjectURL(url);
                                setIsQrDownloading(false);
                            }, 100);
                        },
                        'image/png',
                        1.0,
                    );
                };

                img.onerror = () => {
                    console.error(__('Failed to load SVG image'));
                    URL.revokeObjectURL(url);
                    setIsQrDownloading(false);
                };

                img.src = url;
            } catch (error) {
                console.error(__('Error downloading QR code' + ':'), error);
                setIsQrDownloading(false);
            }
        }, 100);
    };

    // Wathcing Spatiotemporal Info Modal
    useEffect(() => {
        const url = new URL(window.location.href);

        if (spatiotemporalInfoModal) {
            isSpatiotemporalModalOpenRef.current = true;
            url.searchParams.set('modal', 'spatiotempotal-info');
            window.history.pushState({}, '', url.toString());
            document.body.style.overflow = 'hidden';
        } else {
            isSpatiotemporalModalOpenRef.current = false;
            url.searchParams.delete('modal');
            window.history.replaceState({}, '', url.toString());
            document.body.style.overflow = 'unset';
        }
    }, [spatiotemporalInfoModal]);

    // Infinite Scroll Observer
    useEffect(() => {
        if (!loaderRef.current || !nextPageUrl) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !isfetchingMoreYAxisFeed.current) {
                    fetchMorePostsAndProducts();
                }
            },
            { rootMargin: '200px 0px', threshold: 0 },
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
            const images =
                Array.isArray(feedGallery.post_image_urls) && feedGallery.type === 'posts'
                    ? feedGallery.post_image_urls.map((url) => ({ type: 'image', url }))
                    : Array.isArray(feedGallery.smartphone_image_urls) &&
                        feedGallery.type === 'smartphones'
                      ? feedGallery.smartphone_image_urls.map((url) => ({ type: 'image', url }))
                      : Array.isArray(feedGallery.lodging_image_urls) &&
                          feedGallery.type === 'lodging'
                        ? feedGallery.lodging_image_urls.map((url) => ({ type: 'image', url }))
                        : [];
            const videos =
                Array.isArray(feedGallery.post_video_urls) && feedGallery.type === 'posts'
                    ? feedGallery.post_video_urls.map((url) => ({
                          type: 'video',
                          url: url.url,
                          thumbnail_url: url.thumbnail_url,
                      }))
                    : Array.isArray(feedGallery.smartphone_video_urls) &&
                        feedGallery.type === 'smartphones'
                      ? feedGallery.smartphone_video_urls.map((url) => ({
                            type: 'video',
                            url: url.url,
                            thumbnail_url: url.thumbnail_url,
                        }))
                      : Array.isArray(feedGallery.lodging_video_urls) &&
                          feedGallery.type === 'lodging'
                        ? feedGallery.lodging_video_urls.map((url) => ({
                              type: 'video',
                              url: url.url,
                              thumbnail_url: url.thumbnail_url,
                          }))
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

    // POP STATE HANDLING
    useEffect(() => {
        const handlePopState = (e) => {
            const currentUrl = new URL(window.location.href);
            // const currentParams = new URLSearchParams(currentUrl.search);

            // Check if we're coming FROM a URL with mobile-feed-gallery
            const previousUrl = new URL(previousUrlRef.current);
            const previousParams = new URLSearchParams(previousUrl.search);
            const wasOnMobileGallery = previousParams.has('mobile-feed-gallery');

            // Stage 3.3 — reservation slide-in is the TOPMOST overlay: Back closes it first and
            // leaves the feed/viewer open (additive; does not alter the branches below).
            if (reservationPanelOpenRef.current) {
                reservationPanelOpenRef.current = false;
                setReservationPanel(null);
                return;
            }

            // SpatiotemporalInfo Modal Open
            if (isSpatiotemporalModalOpenRef.current) {
                setSpatiotemporalInfoModal(false);
                isSpatiotemporalModalOpenRef.current = false;
                return;
            }

            //  Mobile gallery is currently open OR we just came from mobile gallery
            if (MobileFeedGalleryOpenRef.current || wasOnMobileGallery) {
                // console.log('🔙 Closing mobile gallery');

                if (redirectedPreviousUrl.current) {
                    router.visit(redirectedPreviousUrl.current);
                } else {
                    isClosingMobileGalleryRef.current = true;
                    setMobileFeedGalleryOpen(false);

                    // Update previous URL
                    previousUrlRef.current = window.location.href;

                    // Reset flag after delay
                    setTimeout(() => {
                        isClosingMobileGalleryRef.current = false;
                    }, 500);
                }

                return;
            }

            //  Main feed is open, close it completely
            if (feedGalleryRef.current !== null) {
                // console.log('🔙 Closing main feed');
                e.preventDefault();

                if (redirectedPreviousUrl.current) {
                    router.visit(redirectedPreviousUrl.current);
                } else {
                    feedGalleryRef.current = null;
                    setFeedGallery(null);
                    setFeedOpen(false);
                    setFeedIndex(0);

                    if (isSinglePageRef.current) {
                        isSinglePageRef.current = false;
                    }

                    // const cleanUrl = window.location.pathname;
                    window.history.replaceState({}, '', '/');

                    // Update previous URL
                    previousUrlRef.current = window.location.href;
                }

                return;
            }

            // Update previous URL
            previousUrlRef.current = window.location.href;
        };

        const preventInertiaNavigation = (event) => {
            const pathname = event.detail?.visit?.url?.pathname || '';
            const url = new URL(window.location.href);
            const modalValue = url.searchParams.get('modal');

            if (
                modalValue === 'global-filters' ||
                modalValue === 'currency-switcher' ||
                modalValue === 'language-filters'
            ) {
                window.history.replaceState({}, '', window.location.pathname);
                return true;
            }

            const isHomePath =
                pathname === '/' ||
                pathname.startsWith('/post/') ||
                pathname.startsWith('/product/') ||
                pathname.startsWith('/lodging/');

            // Block if we just closed mobile gallery
            if (isSpatiotemporalModalOpenRef.current && isHomePath && !isSidebarClickActive) {
                event.preventDefault();
                return;
            }

            if (isClosingMobileGalleryRef.current && isHomePath && !isSidebarClickActive) {
                event.preventDefault();
                return;
            }

            // Block if mobile gallery is open
            if (MobileFeedGalleryOpenRef.current && isHomePath && !isSidebarClickActive) {
                event.preventDefault();
                return;
            }

            // Block if feed is open
            if (feedGalleryRef.current !== null && isHomePath && !isSidebarClickActive) {
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

            //  ALWAYS use pushState for mobile gallery
            // Mobile gallery is a new navigation state that user should be able to go back from
            window.history.pushState({}, '', url.toString());

            // Update previous URL ref
            previousUrlRef.current = url.toString();
        } else {
            const url = new URL(window.location.href);
            url.searchParams.delete('mobile-feed-gallery');

            window.history.replaceState({}, '', url.toString());

            // Update previous URL ref
            previousUrlRef.current = url.toString();
        }
    }, [MobileFeedGalleryOpen]);
    //)

    // Opening Feed Item
    const handleItemClick = useCallback(
        (item, index) => {
            feedOpenCountRef.current++;
            redirectedPreviousUrl.current = null;
            setIsFeedOpeningDirectly(true);
            setFeedGallery(item);
            setFeedIndex(index);
            setFeedOpen(true);

            if (item.type === 'posts') {
                const url = generateURL(item);
                if (feedOpenCountRef.current === 1) {
                    window.history.replaceState({}, '', url);
                    window.history.pushState({}, '', url);
                } else {
                    window.history.pushState({}, '', url);
                }
            } else if (item.type === 'smartphones') {
                const url = generateSmartphoneURL(item);
                if (feedOpenCountRef.current === 1) {
                    window.history.replaceState({}, '', url);
                    window.history.pushState({}, '', url);
                } else {
                    window.history.pushState({}, '', url);
                }
            } else if (item.type === 'lodging') {
                const url = generateLodgingURL(item);
                if (feedOpenCountRef.current === 1) {
                    window.history.replaceState({}, '', url);
                    window.history.pushState({}, '', url);
                } else {
                    window.history.pushState({}, '', url);
                }
            }

            previousUrlRef.current = window.location.href;
        },
        [generateURL, generateSmartphoneURL, generateLodgingURL],
    );

    // Stage 3.3 — open the rate-plan reservation slide-in (history-safe; mirrors the
    // SpatiotemporalInfoModal pattern). Guests are routed to login with a return redirect;
    // logged-in non-customers see a local message without leaving the feed.
    const openReservationPanel = useCallback(
        ({ lodging, room, ratePlan }) => {
            if (!auth?.user) {
                router.get(route('login'), {
                    redirect: window.location.pathname + window.location.search,
                });
                return;
            }

            if (auth?.user?.role !== 'Customer') {
                setInfoMessage(__('Only customers can make a reservation'));
                setShowInfoMessage(true);
                return;
            }

            reservationPanelOpenRef.current = true;
            setReservationPanel({ lodging, room, ratePlan });

            // Push a `?reserve=<rate plan id>` history entry so Back closes the panel first.
            const sp = new URLSearchParams(window.location.search);
            sp.set('reserve', String(ratePlan?.id ?? ''));
            window.history.pushState({}, '', window.location.pathname + '?' + sp.toString());
        },
        [__, auth],
    );

    // Close the panel and strip `?reserve` (replaceState — no extra history entry).
    const closeReservationPanel = useCallback(() => {
        reservationPanelOpenRef.current = false;
        setReservationPanel(null);
        const sp = new URLSearchParams(window.location.search);
        sp.delete('reserve');
        const qs = sp.toString();
        window.history.replaceState({}, '', window.location.pathname + (qs ? '?' + qs : ''));
    }, []);

    useEffect(() => {
        if (feedOpen && showFeedSkeleton) {
            requestAnimationFrame(() => {
                setShowFeedSkeleton(false);
            });
        }
    }, [feedOpen]);

    // Device Recognizer
    const isSafariMac =
        typeof window !== 'undefined' &&
        /Macintosh/i.test(navigator.userAgent) &&
        navigator.maxTouchPoints === 0 &&
        /Safari/i.test(navigator.userAgent) &&
        !/Chrome|Chromium|CriOS/i.test(navigator.userAgent);

    return (
        <MainLayout>
            <Head title={__('Home', true)} />

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
                        if (type === 'success') {
                            setSuccessMessage(null);
                            setShowSuccessMessage(false);
                        }
                    }}
                />
            )}

            {!isFeedLoaded && !showFeedSkeleton && (
                <div className="flex animate-pulse items-center justify-center gap-2 py-10 text-center text-[10px] text-gray-700 transition-all duration-100 dark:text-white/80 lg:text-[18px]">
                    <Spinner />
                    {__('Please Wait While We Load Data')}...
                </div>
            )}

            {showFeedSkeleton && (
                <>
                    {windowSize.width > 1024 && <DesktopFeedSkeleton />}
                    {windowSize.width <= 1024 && <MobileFeedSkeleton />}
                </>
            )}

            {isFeedLoaded && (
                <>
                    {/* Masonry Layout */}
                    <div
                        className={`pb-20 pt-3 sm:pb-20 lg:pt-[75px]`}
                        style={{
                            opacity: feedOpen ? 0 : 1,
                            pointerEvents: feedOpen ? 'none' : 'auto',
                            position: 'relative',
                            zIndex: feedOpen ? 0 : 1,
                        }}
                    >
                        <div className="max-w-8xl mx-auto !overflow-hidden sm:px-6 lg:px-8">
                            <div
                                className={`columns-2 gap-2 sm:columns-2 md:columns-3 ${feed.length <= 2 ? 'lg:columns-2 xl:columns-2' : isSafariMac ? 'lg:columns-3 xl:columns-4' : 'lg:columns-4 xl:columns-5'}`}
                            >
                                {feed.map((item, index) => (
                                    <MasonryFeedItem
                                        key={`${item.type}-${item.id}`}
                                        item={item}
                                        index={index}
                                        onClick={() => handleItemClick(item, index)}
                                        Placeholder={Placeholder}
                                        Index={index}
                                        windowSize={windowSize}
                                    />
                                ))}
                            </div>

                            {isFeedLoaded && feed.length === 0 && (
                                <div className="flex items-center justify-center px-6 py-12 rounded-md bg-backgroundLight dark:bg-backgroundDark">
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
                                                {__('No Content Found')}
                                            </h3>
                                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                                {__('No posts or products Found')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Loader */}
                            {nextPageUrl && (
                                <div
                                    key={nextPageUrl}
                                    ref={loaderRef}
                                    className="flex animate-pulse items-center justify-center gap-2 py-10 text-center text-[10px] text-gray-700 transition-all duration-100 dark:text-white/80 lg:text-[18px]"
                                >
                                    <Spinner />
                                    {__('Loading More')}...
                                </div>
                            )}
                        </div>
                    </div>

                    {/* PC Feed  */}
                    {windowSize.width > 1024 && feedOpen && feedGallery !== null && (
                        <>
                            {feedGallery && (
                                <DesktopFeed
                                    setShowQrCode={setShowQrCode}
                                    feedGallery={feedGallery}
                                    setFeedOpen={setFeedOpen}
                                    setFeedGallery={setFeedGallery}
                                    setErrorMessage={setErrorMessage}
                                    setShowErrorMessage={setShowErrorMessage}
                                    setLinkCopied={setLinkCopied}
                                    setBookmarkStatusChanged={setBookmarkStatusChanged}
                                    setMediaItems={setMediaItems}
                                    mediaItems={mediaItems}
                                    auth={auth}
                                    generateURL={generateURL}
                                    generateSmartphoneURL={generateSmartphoneURL}
                                    generateLodgingURL={generateLodgingURL}
                                    navigateToHashtag={navigateToHashtag}
                                    Placeholder={Placeholder}
                                    showQrCode={showQrCode}
                                    currency={currency}
                                    setInfoMessage={setInfoMessage}
                                    setShowInfoMessage={setShowInfoMessage}
                                    feedIndex={feedIndex}
                                    relatedFeed={relatedFeed}
                                    relatedFeedNextUrlsRef={relatedFeedNextUrlsRef}
                                    feed={feed}
                                    fetchMoreYAxis={fetchMorePostsAndProducts}
                                    nextPageUrl={nextPageUrlRef.current}
                                    fetchRelatedFeed={fetchRelatedFeed}
                                    smartphone_addon_items={smartphone_addon_items}
                                    isSinglePageRef={isSinglePageRef}
                                    spatiotemporalInfoModal={spatiotemporalInfoModal}
                                    setSpatiotemporalInfoModal={setSpatiotemporalInfoModal}
                                    previous_url={redirectedPreviousUrl.current}
                                    openReservationPanel={openReservationPanel}
                                    reservationPanelOpenRef={reservationPanelOpenRef}
                                    closeReservationPanel={closeReservationPanel}
                                    __={__}
                                />
                            )}
                        </>
                    )}

                    {/* MOBILE FEED */}
                    {windowSize.width <= 1024 &&
                        feedOpen &&
                        feedGallery !== null &&
                        !isSinglePageRef.current && (
                            <MobileFeed
                                feed={feed}
                                feedGallery={feedGallery}
                                setFeedGallery={setFeedGallery}
                                setFeedOpen={setFeedOpen}
                                setLinkCopied={setLinkCopied}
                                setShowQrCode={setShowQrCode}
                                setBookmarkStatusChanged={setBookmarkStatusChanged}
                                auth={auth}
                                generateURL={generateURL}
                                generateSmartphoneURL={generateSmartphoneURL}
                                generateLodgingURL={generateLodgingURL}
                                navigateToHashtag={navigateToHashtag}
                                feedIndex={feedIndex}
                                setFeedIndex={setFeedIndex}
                                relatedFeed={relatedFeed}
                                fetchMoreYAxis={fetchMorePostsAndProducts}
                                MobileFeedGalleryOpen={MobileFeedGalleryOpen}
                                setMobileFeedGalleryOpen={setMobileFeedGalleryOpen}
                                currency={currency}
                                placeholderImage={Placeholder}
                                fetchRelatedFeed={fetchRelatedFeed}
                                relatedFeedNextUrlsRef={relatedFeedNextUrlsRef}
                                nextPageUrl={nextPageUrlRef.current}
                                Placeholder={Placeholder}
                                isfetchingMoreYAxisFeed={isfetchingMoreYAxisFeed.current}
                                isFeedOpeningDirectly={isFeedOpeningDirectly}
                                showErrorMessage={showErrorMessage}
                                showInfoMessage={showInfoMessage}
                                ErrorMessage={ErrorMessage}
                                InfoMessage={InfoMessage}
                                setInfoMessage={setInfoMessage}
                                setShowInfoMessage={setShowInfoMessage}
                                setErrorMessage={setErrorMessage}
                                windowSize={windowSize}
                                setShowErrorMessage={setShowErrorMessage}
                                isSinglePageRef={isSinglePageRef}
                                spatiotemporalInfoModal={spatiotemporalInfoModal}
                                setSpatiotemporalInfoModal={setSpatiotemporalInfoModal}
                                openReservationPanel={openReservationPanel}
                                __={__}
                            />
                        )}

                    {/*Mobile Feed Single Page */}
                    {windowSize.width <= 1024 &&
                        feedOpen &&
                        feedGallery !== null &&
                        isSinglePageRef.current && (
                            <MobileFeedSinglePage
                                feedGallery={feedGallery}
                                setFeedGallery={setFeedGallery}
                                setLinkCopied={setLinkCopied}
                                setShowQrCode={setShowQrCode}
                                isSinglePageRef={isSinglePageRef}
                                auth={auth}
                                generateURL={generateURL}
                                generateSmartphoneURL={generateSmartphoneURL}
                                generateLodgingURL={generateLodgingURL}
                                navigateToHashtag={navigateToHashtag}
                                setFeedIndex={setFeedIndex}
                                MobileFeedGalleryOpen={MobileFeedGalleryOpen}
                                setMobileFeedGalleryOpen={setMobileFeedGalleryOpen}
                                currency={currency}
                                placeholderImage={Placeholder}
                                showErrorMessage={showErrorMessage}
                                showInfoMessage={showInfoMessage}
                                ErrorMessage={ErrorMessage}
                                InfoMessage={InfoMessage}
                                setInfoMessage={setInfoMessage}
                                setBookmarkStatusChanged={setBookmarkStatusChanged}
                                setShowInfoMessage={setShowInfoMessage}
                                setErrorMessage={setErrorMessage}
                                setShowErrorMessage={setShowErrorMessage}
                                setFeedOpen={setFeedOpen}
                                setMediaItems={setMediaItems}
                                spatiotemporalInfoModal={spatiotemporalInfoModal}
                                setSpatiotemporalInfoModal={setSpatiotemporalInfoModal}
                                previous_url={redirectedPreviousUrl.current}
                                openReservationPanel={openReservationPanel}
                                __={__}
                            />
                        )}
                    {/* QR CODE */}
                    {showQrCode &&
                        createPortal(
                            <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                                {/* Overlay */}
                                <div
                                    className="fixed inset-0 bg-black/30 backdrop-blur-sm"
                                    onClick={() => setShowQrCode(false)}
                                />

                                {/* Modal */}
                                <div
                                    role="dialog"
                                    aria-modal="true"
                                    className="relative z-[101] w-full max-w-[280px] rounded-md border border-surface-3-light bg-backgroundLight px-0 py-0 dark:border-surface-3-dark dark:bg-surface-1-dark sm:max-w-[340px] lg:max-w-[500px] lg:px-4 lg:py-5"
                                >
                                    <div className="flex flex-col items-center justify-center">
                                        {/* QR + Copy Wrapper (KEY PART) */}
                                        <div className="mx-auto my-5 w-fit">
                                            {/* QR */}
                                            <div className="p-3 rounded-md bg-main-text-dark dark:bg-surface-1-dark dark:text-main-text-light sm:p-2">
                                                <QRCode
                                                    id="qr-code-canvas"
                                                    className="size-40 sm:size-44 lg:size-60"
                                                    {...(feedGallery?.type === 'posts' && {
                                                        value:
                                                            window.location.origin +
                                                            generateURL(feedGallery, true, true),
                                                    })}
                                                    {...(feedGallery?.type === 'smartphones' && {
                                                        value:
                                                            window.location.origin +
                                                            generateSmartphoneURL(
                                                                feedGallery,
                                                                true,
                                                                true,
                                                            ),
                                                    })}
                                                    {...(feedGallery?.type === 'lodging' && {
                                                        value:
                                                            window.location.origin +
                                                            generateLodgingURL(
                                                                feedGallery,
                                                                true,
                                                                true,
                                                            ),
                                                    })}
                                                    level="H"
                                                    includemargin="true"
                                                    bgColor="#ffffff"
                                                    fgColor="#000000"
                                                />
                                            </div>

                                            {/* Copy Button */}
                                            <button
                                                className="mt-3 w-full rounded-md bg-main-text-light py-2.5 text-lg font-medium text-main-text-dark transition hover:bg-main-text-light/80 dark:bg-main-text-dark dark:text-main-text-light dark:hover:bg-main-text-dark/80"
                                                onClick={() => {
                                                    let url = null;

                                                    if (feedGallery?.type === 'posts') {
                                                        url =
                                                            window.location.origin +
                                                            generateURL(feedGallery, true, true);
                                                    } else if (
                                                        feedGallery?.type === 'smartphones'
                                                    ) {
                                                        url =
                                                            window.location.origin +
                                                            generateSmartphoneURL(
                                                                feedGallery,
                                                                true,
                                                                true,
                                                            );
                                                    } else if (
                                                        feedGallery?.type === 'lodging'
                                                    ) {
                                                        url =
                                                            window.location.origin +
                                                            generateLodgingURL(
                                                                feedGallery,
                                                                true,
                                                                true,
                                                            );
                                                    }

                                                    navigator.clipboard.writeText(url);
                                                    setLinkCopied(true);
                                                }}
                                            >
                                                {__('Copy')}
                                            </button>

                                            {/* Download Button */}
                                            <div className="w-full mt-4">
                                                <button
                                                    onClick={handleDownloadQRCode}
                                                    disabled={isQrDownloading}
                                                    className={`flex w-full items-center justify-center gap-2 rounded-md py-2.5 text-lg font-medium text-main-text-light transition dark:text-main-text-dark lg:text-xl`}
                                                >
                                                    {isQrDownloading ? (
                                                        <Spinner customSize={'size-4 lg:size-6'} />
                                                    ) : (
                                                        <>
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                className="w-6 h-6"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                stroke="currentColor"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={2}
                                                                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                                                />
                                                            </svg>
                                                            {__('Download')}
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
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

                    {/* Stage 3.3 — rate-plan reservation slide-in (rendered over the viewer) */}
                    {reservationPanel && (
                        <LodgingReservationPanel
                            open={!!reservationPanel}
                            onClose={closeReservationPanel}
                            lodging={reservationPanel.lodging}
                            selectedRoom={reservationPanel.room}
                            selectedRatePlan={reservationPanel.ratePlan}
                            auth={auth}
                            __={__}
                        />
                    )}
                </>
            )}
        </MainLayout>
    );
};

export default memo(index);
