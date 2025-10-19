import PostMediaViewer from '@/Components/PostMediaViewer';
import PostsGrid from '@/Components/PostsGrid';
import useDarkMode from '@/Hooks/useDarkMode';
import useWindowSize from '@/Hooks/useWindowSize';
import MainLayout from '@/Layouts/Website/MainLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import QRCode from 'react-qr-code';
import { toast } from 'react-toastify';
import videoThumbnail from '../../../../../public/assets/images/video-thumb/general-video.png';

import VideoPlayer from '@/Components/VideoPlayer';
import { createPortal } from 'react-dom';
import axios from 'axios';
import GlobalSearch from '@/Components/GlobalSearch';

const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
};

export default function index({ google_map_api_key, search_history }) {
    const [isPostLoaded, setIsPostLoaded] = useState(false);
    const [posts, setPosts] = useState(null);

    const [relatedPostsMap, setRelatedPostsMap] = useState({});
    const [relatedNextMap, setRelatedNextMap] = useState({});
    const [relatedViewerMap, setRelatedViewerMap] = useState({});
    const [activeViewerMap, setActiveViewerMap] = useState({});

    const [relatedPostSlug, setRelatedPostSlug] = useState(null);

    const [nextPageUrl, setNextPageUrl] = useState(null);

    const fetchPosts = async () => {
        const cookieValue = getCookie('post_preferences');
        let parsed = null;

        // ✅ Safe JSON parsing with fallback
        if (cookieValue && cookieValue !== 'null' && cookieValue !== 'undefined') {
            try {
                parsed = JSON.parse(decodeURIComponent(cookieValue));
            } catch (error) {
                console.warn('⚠️ Invalid post_preferences cookie. Using defaults.', error);
                toast.warning('Your saved preferences were invalid — defaults applied.');
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

            setPosts(res.data.posts);
            setNextPageUrl(res.data.next_page_url);
        } catch (error) {
            console.error('Failed to fetch posts:', error);
            toast.error('Failed to fetch posts. Please try again later.');
        } finally {
            setIsPostLoaded(true);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const [viewablePost, setViewablePost] = useState('');

    const [selectedPostIndex, setSelectedPostIndex] = useState(0);
    const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);

    const loaderRef = useRef(null);

    const { auth } = usePage().props;
    const [showQrCode, setShowQrCode] = useState(false);

    // Checking Dark Mode
    const isDarkMode = useDarkMode();

    const windowSize = useWindowSize();

    const [showDetailsPostIds, setShowDetailsPostIds] = useState([]);

    // Set Media items For Media Viewer In the bottom bar
    const [mediaItems, setMediaItems] = useState([]);

    // Tracking Post Viewer Width

    // Desktop Post Viewer
    const [isDesktopPostViewer, setIsDesktopPostViewer] = useState(false);

    // Mobile Post Viewer
    const [isMobilePostViewer, setIsMobilePostViewer] = useState(false);

    // Mobile Post Gallery
    const [isMobilePostGallery, setIsMobilePostGallery] = useState(false);

    // All Refs
    const thumbRefs = useRef([]);
    const mediaThumbRefs = useRef([]);
    const mediaMobileref = useRef(null);
    const mobilePostContainerRef = useRef(null);
    const elipsisDropDownRef = useRef(null);
    const elipsisButtonRef = useRef(null);
    const postsRefs = useRef([]);

    const generateURL = (post) => {
        return (
            `?slug=${post?.slug}&planet=earth${post?.latitude != null ? '&lat=' + post?.latitude : ''}` +
            `${post?.longitude != null ? '&lng=' + post?.longitude : ''}` +
            `${post?.location_name != null ? '&location_name=' + post?.location_name : ''}` +
            `&timestamp=${post?.created_at}` +
            `${post?.floor_id != null ? '&floor=' + post?.floor?.name : ''}`
        );
    };

    // Auto Select Post From Mobile Post Container Logic

    const scrollToPost = (post) => {
        const index = posts.findIndex((p) => p.id === post.id);
        if (index !== -1 && postsRefs.current[index]) {
            postsRefs.current[index].scrollIntoView({ block: 'start', behavior: 'instant' });
        }
    };

    // When mobile viewer opens
    useEffect(() => {
        if (isMobilePostViewer && viewablePost) {
            scrollToPost(viewablePost);
        }
    }, [isMobilePostViewer]);

    const setPostViewerBasedOnWidth = (windowSize) => {
        if (windowSize.width < 1024) {
            if (showQrCode) setShowQrCode(false);

            setIsDesktopPostViewer(false);
            setIsMobilePostViewer(true);
        }

        if (windowSize.width > 1024) {
            if (showQrCode) setShowQrCode(false);

            setIsMobilePostViewer(false);
            setIsDesktopPostViewer(true);
        }
    };

    useEffect(() => {
        if (viewablePost != '') setPostViewerBasedOnWidth(windowSize);
    }, [windowSize.width]);

    useEffect(() => {
        if (!posts || !isPostLoaded) return;

        const params = new URLSearchParams(window.location.search);
        const slug = params.get('slug');

        if (slug) {
            const post = posts.find((post) => post.slug === slug);

            if (post) {
                setViewablePost(post);
                setRelatedPostsMap((prev) => ({
                    ...prev,
                    [post.slug]: post.related_posts || [],
                }));
                setPostViewerBasedOnWidth(windowSize);
            } else {
                fetchSinglePost(slug);
                setPostViewerBasedOnWidth(windowSize);
            }
        }
    }, [isPostLoaded, posts]);

    const viewablePostRef = useRef('');
    const isMobilePostGalleryRef = useRef(false);
    const isDesktopPostViewerRef = useRef(false);
    const isMobilePostViewerRef = useRef(false);

    // Update refs whenever state changes
    useEffect(() => {
        viewablePostRef.current = viewablePost;
    }, [viewablePost]);

    useEffect(() => {
        isMobilePostGalleryRef.current = isMobilePostGallery;
    }, [isMobilePostGallery]);

    useEffect(() => {
        isDesktopPostViewerRef.current = isDesktopPostViewer;
    }, [isDesktopPostViewer]);

    useEffect(() => {
        isMobilePostViewerRef.current = isMobilePostViewer;
    }, [isMobilePostViewer]);

    // Stopping Overflow Of Body When Modal is Open Also Preventing Inertia Navigation When Pressing browser Naviagtion buttons for Posts Viewer and gallery
    useEffect(() => {
        if (viewablePost !== '') {
            setSelectedMediaIndex(0);
            document.body.classList.add('overflow-hidden');
        } else {
            document.body.classList.remove('overflow-hidden');
            // if (document.fullscreenElement) closeFullscreen();
        }

        const handlePopState = (e) => {
            const currentState = window.history.state;
            if (viewablePostRef.current !== '') {
                if (isMobilePostGalleryRef.current) {
                    setIsMobilePostGallery(false);
                    if (currentState?.modal === 'post-gallery') {
                        window.history.replaceState({ modal: 'post-viewer' }, '');
                    }

                    return;
                }

                window.history.replaceState({}, '', window.location.pathname);

                setViewablePost('');
                setIsDesktopPostViewer(false);
                setIsMobilePostViewer(false);
                return;
            }
        };

        const preventInertiaNavigation = (event) => {
            const allowedRoutes = ['/hashtag/', '/posts-bookmark'];

            const pathname = event.detail?.visit?.url?.pathname || '';
            const isAllowedRoute = allowedRoutes.some((route) => pathname.includes(route));

            if (
                (viewablePostRef.current !== '' || isMobilePostGalleryRef.current) &&
                !isAllowedRoute
            ) {
                event.preventDefault();
            }
        };

        window.addEventListener('popstate', handlePopState);
        const removeRouterEvent = router.on('before', preventInertiaNavigation);
        // document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => {
            document.body.classList.remove('overflow-hidden');
            window.removeEventListener('popstate', handlePopState);
            if (removeRouterEvent) removeRouterEvent();
            // document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, [viewablePost, isMobilePostGallery, isMobilePostViewer, isDesktopPostViewer]);

    // Fetch more posts
    const fetchMorePosts = async () => {
        if (!nextPageUrl) return;

        try {
            const url = new URL(nextPageUrl);
            const params = new URLSearchParams(url.search);

            const cookieValue = getCookie('post_preferences');

            if (cookieValue && cookieValue.trim() !== '') {
                try {
                    const parsed = JSON.parse(decodeURIComponent(cookieValue));
                    if (parsed && typeof parsed === 'object') {
                        Object.entries(parsed).forEach(([key, value]) => {
                            params.set(key, value ? 'true' : 'false');
                        });
                    }
                } catch (err) {
                    toast.warn('Invalid cookie JSON');
                }
            } else {
                const page = params.get('page');

                const cleanParams = new URLSearchParams();
                if (page) cleanParams.set('page', page);
                params.delete('images');
                params.delete('text');
                params.delete('videos');

                // replace params object
                for (const [key, value] of cleanParams.entries()) {
                    params.set(key, value);
                }
            }

            const finalUrl = `${route('website.posts.getmore')}?${params.toString()}`;

            const res = await fetch(finalUrl);
            const data = await res.json();

            setPosts((prev) => {
                const ids = new Set(prev.map((p) => p.id));
                const newOnes = data.posts.filter((p) => !ids.has(p.id));
                return [...prev, ...newOnes];
            });

            setNextPageUrl(data.next_page_url);
        } catch (err) {
            toast.error('Error fetching post');
        }
    };

    const fetchSinglePost = async (slug) => {
        try {
            const cookieValue = getCookie('post_preferences');

            const parsed = await JSON.parse(decodeURIComponent(cookieValue));

            const queryString = new URLSearchParams(parsed).toString();

            const res = await fetch(route('website.posts.getsingle', slug) + `?${queryString}`);
            const data = await res.json();

            if (data.status) {
                setViewablePost(data.post);
                setRelatedPostsMap((prev) => ({
                    ...prev,
                    [data.post.slug]: data.post?.related_posts || [],
                }));

                setPosts((prev) => {
                    let newPosts = prev;
                    const exists = prev.some((p) => p.id === data.post.id);

                    if (!exists) {
                        newPosts = [data.post, ...prev];
                    }

                    const idx = newPosts.findIndex((p) => p.id === data.post.id);
                    if (idx !== -1) {
                        setSelectedPostIndex(idx);
                    }

                    return newPosts;
                });
            } else {
                toast.info('Post Not Found');
            }
        } catch (err) {
            toast.error('Error fetching post');
        }
    };

    const isFetchingRef = useRef(false);
    const [isFetchingRelated, setIsFetchingRelated] = useState(false);
    const lastFetchedUrlRef = useRef({});

    // If Post Already Fetches All Remeaning Related Posts And Dont Have More Pages so it will be marked as completed and wont be fetched
    const completedSlugsRef = useRef({});
    const fetchRelatedPosts = async (slug) => {
        const currentUrl =
            relatedNextMap[slug] ??
            `${route('website.posts.getrelated')}?${new URLSearchParams(
                JSON.parse(decodeURIComponent(getCookie('post_preferences'))),
            )}`;

        if (isFetchingRef.current || lastFetchedUrlRef.current[slug] === currentUrl || !slug)
            return;

        isFetchingRef.current = true;
        lastFetchedUrlRef.current[slug] = currentUrl;

        try {
            const res = await axios.get(currentUrl, {
                params: {
                    slug: slug,
                },
            });
            const data = res.data;

            if (data.status) {
                const newPosts = data.posts?.data || data.posts || [];
                setRelatedPostsMap((prev) => ({
                    ...prev,
                    [slug]: [
                        ...(prev[slug] || []),
                        ...newPosts.filter(
                            (p) => !(prev[slug] || []).some((old) => old.id === p.id),
                        ),
                    ],
                }));
                setRelatedNextMap((prev) => ({
                    ...prev,
                    [slug]: data.posts.next_page_url,
                }));

                if (!data.posts.next_page_url) {
                    completedSlugsRef.current[slug] = true;
                }
            }
        } catch (err) {
            toast.error('Error fetching related posts');
        } finally {
            isFetchingRef.current = false;
            setIsFetchingRelated(false);
        }
    };

    // Infinite Scroll Observer
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

    // Mouse wheel navigation For Mobile Media Navigation
    useEffect(() => {
        if (!mediaMobileref.current) return;

        if (viewablePost != '' && mediaItems.length > 0) {
            const mediaEl = mediaMobileref.current;

            const handleWheel = (event) => {
                if (event.ctrlKey || event.metaKey) return;
                event.preventDefault();

                if (event.deltaY < 0) {
                    setSelectedMediaIndex((prev) => (prev === 0 ? 0 : prev - 1));
                } else {
                    setSelectedMediaIndex((prev) =>
                        prev === mediaItems.length - 1 ? prev : prev + 1,
                    );
                }
            };

            mediaEl.addEventListener('wheel', handleWheel, { passive: false });
            return () => {
                mediaEl.removeEventListener('wheel', handleWheel, { passive: false });
            };
        }
    }, [mediaItems.length, viewablePost]);

    // Auto-scroll thumbnails For Mobile Media Navigation
    useEffect(() => {
        if (thumbRefs.current[selectedPostIndex]) {
            thumbRefs.current[selectedPostIndex].scrollIntoView({
                behavior: 'smooth',
                inline: 'center',
                block: 'nearest',
            });
        }
    }, [selectedPostIndex]);

    useEffect(() => {
        if (viewablePost) {
            const images = Array.isArray(viewablePost.post_image_urls)
                ? viewablePost.post_image_urls.map((url) => ({ type: 'image', url }))
                : [];
            const videos = Array.isArray(viewablePost.post_video_urls)
                ? viewablePost.post_video_urls.map((url) => ({ type: 'video', url }))
                : [];

            const allMedia = [...images, ...videos];
            setMediaItems(allMedia);
            setSelectedMediaIndex(allMedia.length > 0 ? 0 : -1);
        }
    }, [viewablePost]);

    // Mobile Post Elipsis Dropdown
    const [showElipsisDropdown, setElipsisShowDropdown] = useState(false);

    // Checking Outside Click Of Elipsis Dropdown
    useEffect(() => {
        const handleResize = () => setElipsisShowDropdown(false);
        const handleClickOutside = (e) => {
            const clickedButton = e.target.closest('[data-elipsis-button]');
            const clickedDropdown = e.target.closest('[data-elipsis-dropdown]');

            if (clickedButton) {
                setElipsisShowDropdown((prev) => !prev);
                return;
            }

            if (clickedDropdown) {
                return;
            }

            setElipsisShowDropdown(false);
        };
        window.addEventListener('resize', handleResize);
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            window.removeEventListener('resize', handleResize);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Setting Post Index After Refresh To Start Scrolling From There
    useEffect(() => {
        if (!isPostLoaded) return;
        if (viewablePost && isMobilePostViewer && posts.length > 0) {
            const currentIndex = posts.findIndex((p) => p.id === viewablePost.id);

            if (currentIndex !== -1 && currentIndex !== selectedPostIndex) {
                setSelectedPostIndex(currentIndex);
            }

            // Setting Post Viewer Main Post Slug
            if (relatedPostSlug == null) {
                setRelatedPostSlug(viewablePost?.slug);
            }
        }
    }, [posts, isPostLoaded, viewablePost]);

    const relatedPostsRef = useRef(relatedPostsMap);
    const relatedViewMap = useRef(relatedViewerMap);
    const relatedNextUrlMap = useRef(relatedNextMap);
    const relatedPostSlugRef = useRef(relatedPostSlug);

    const scrollLock = useRef(false);
    const fetchLock = useRef(false);
    const isLooping = useRef(false);
    const touchStartY = useRef(0);
    const touchStartX = useRef(0);

    const postsRef = useRef(posts);
    const lastFetchTriggerIndex = useRef(-1);
    const gestureLocked = useRef(null);
    const lastTriedRef = useRef(0);

    const horizontalCarouselRefs = useRef({});

    useEffect(() => {
        postsRef.current = posts;
    }, [posts]);

    useEffect(() => {
        relatedPostsRef.current = relatedPostsMap;
    }, [relatedPostsMap]);

    useEffect(() => {
        relatedViewMap.current = relatedViewerMap;
    }, [relatedViewerMap]);

    useEffect(() => {
        relatedNextUrlMap.current = relatedNextMap;
    }, [relatedNextMap]);

    useEffect(() => {
        relatedPostSlugRef.current = relatedPostSlug;
    }, [relatedPostSlug]);

    console.log(horizontalCarouselRefs.current);

    useEffect(() => {
        if (!isMobilePostViewer || viewablePost === '' || isMobilePostGallery) return;
        const container = mobilePostContainerRef.current;
        if (!container) return;

        scrollLock.current = false;
        isLooping.current = false;
        fetchLock.current = false;
        lastFetchTriggerIndex.current = -1;

        if (container) {
            container.style.touchAction = 'auto';
            container.style.pointerEvents = 'auto';
        }

        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

        const checkScrollReachedTarget = (isTop) => {
            if (isTop) {
                return container.scrollTop <= 2;
            }
            return (
                Math.abs(container.scrollTop + container.clientHeight - container.scrollHeight) < 8
            );
        };

        const waitForScrollSettle = (isTop, callback) => {
            let lastScrollTop = container.scrollTop;
            let stableCount = 0;
            const requiredStable = 2;

            const checkSettle = () => {
                const currentScrollTop = container.scrollTop;
                const atTarget = checkScrollReachedTarget(isTop);

                if (currentScrollTop === lastScrollTop && atTarget) {
                    stableCount++;
                    if (stableCount >= requiredStable) {
                        callback();
                        return;
                    }
                } else {
                    stableCount = 0;
                }

                lastScrollTop = currentScrollTop;
                setTimeout(checkSettle, 50);
            };

            checkSettle();
        };

        // Desktop scroll - Wheel
        const handleWheel = (e) => {
            if (e.ctrlKey || e.metaKey) return;

            if (scrollLock.current) {
                e.preventDefault();
                return;
            }

            e.preventDefault();
            scrollLock.current = true;

            const direction = e.deltaY > 0 ? 1 : -1;
            let nextIndex = selectedPostIndex + direction;

            const atTop = container.scrollTop <= 0;
            const atBottom = checkScrollReachedTarget(false);

            if (direction < 0 && atTop) {
                // Loop TOP → BOTTOM
                nextIndex = postsRef.current.length - 1;
                isLooping.current = true;

                container.scrollTo({
                    top: nextIndex * container.clientHeight,
                    behavior: 'smooth',
                });

                waitForScrollSettle(false, () => {
                    setSelectedPostIndex(nextIndex);
                    setViewablePost(postsRef.current[nextIndex]);
                    setRelatedPostSlug(postsRef.current[nextIndex].slug);

                    scrollLock.current = false;
                    isLooping.current = false;
                });
            } else if (direction > 0 && atBottom) {
                nextIndex = 0;
                isLooping.current = true;

                container.scrollTo({
                    top: 0,
                    behavior: 'smooth',
                });

                waitForScrollSettle(true, () => {
                    setSelectedPostIndex(0);
                    setViewablePost(postsRef.current[0]);
                    setRelatedPostSlug(postsRef.current[0].slug);

                    scrollLock.current = false;
                    isLooping.current = false;
                });
            } else {
                isLooping.current = false;
                nextIndex = Math.max(0, Math.min(postsRef.current.length - 1, nextIndex));

                container.scrollTo({
                    top: nextIndex * container.clientHeight,
                    behavior: 'smooth',
                });

                setTimeout(() => {
                    scrollLock.current = false;
                }, 100);
            }

            if (!(direction < 0 && atTop) && !(direction > 0 && atBottom)) {
                const post = postsRef.current[nextIndex];
                const slug = post.slug;
                const newPosts = post.related_posts || [];

                setSelectedPostIndex(nextIndex);
                setViewablePost(post);

                setRelatedPostsMap((prev) => ({
                    ...prev,
                    [slug]: [
                        ...(prev[slug] || []),
                        ...newPosts.filter(
                            (p) => !(prev[slug] || []).some((old) => old.id === p.id),
                        ),
                    ],
                }));

                setRelatedPostSlug(slug);
                window.history.replaceState({}, '', generateURL(post));

                if (
                    nextIndex >= postsRef.current.length - 5 &&
                    nextPageUrl &&
                    !fetchLock.current &&
                    lastFetchTriggerIndex.current !== nextIndex
                ) {
                    fetchLock.current = true;
                    lastFetchTriggerIndex.current = nextIndex;

                    fetchMorePosts().finally(() => {
                        fetchLock.current = false;
                    });
                }
            }
        };

        const handleScroll = () => {
            if (scrollLock.current || isLooping.current) return;

            const scrollTop = container.scrollTop;
            const containerHeight = container.clientHeight;
            const newIndex = Math.round(scrollTop / containerHeight);

            if (newIndex === selectedPostIndex || !postsRef.current[newIndex]) return;

            const post = postsRef.current[newIndex];
            const slug = post.slug;
            const newPosts = post.related_posts || [];

            setSelectedPostIndex(newIndex);
            setViewablePost(post);

            setRelatedPostsMap((prev) => ({
                ...prev,
                [slug]: [
                    ...(prev[slug] || []),
                    ...newPosts.filter((p) => !(prev[slug] || []).some((old) => old.id === p.id)),
                ],
            }));

            setRelatedPostSlug(slug);
            window.history.replaceState({}, '', generateURL(post));

            const isScrollingDown = newIndex > (selectedPostIndex || 0);

            if (
                isScrollingDown &&
                newIndex >= postsRef.current.length - 5 &&
                nextPageUrl &&
                !fetchLock.current &&
                lastFetchTriggerIndex.current !== newIndex
            ) {
                fetchLock.current = true;
                lastFetchTriggerIndex.current = newIndex;

                fetchMorePosts()
                    .catch(() => {})
                    .finally(() => {
                        fetchLock.current = false;
                    });
            }
        };

        const handleTouchStart = (e) => {
            touchStartY.current = e.touches[0].clientY;
            touchStartX.current = e.touches[0].clientX;
            gestureLocked.current = null;
        };

        const handleTouchMove = (e) => {
            if (scrollLock.current || isLooping.current) {
                e.preventDefault();
                return;
            }

            const currentY = e.touches[0].clientY;
            const currentX = e.touches[0].clientX;
            const deltaY = currentY - (touchStartY.current || currentY);
            const deltaX = currentX - (touchStartX.current || currentX);

            if (!gestureLocked.current) {
                if (Math.abs(deltaY) > Math.abs(deltaX) + 10) {
                    gestureLocked.current = 'y';
                } else if (Math.abs(deltaX) > Math.abs(deltaY) + 10) {
                    gestureLocked.current = 'x';
                }
            }

            // if (gestureLocked.current === 'x') {
            //     const slug = relatedPostSlug
            //     const relatedPosts = relatedPostsRef.current[slug];
            //     const currentRelatedPost = relatedViewMap.current[slug];

            //     setTimeout(() => {
            //         alert('Scroolled');
            //     }, 1000);
            // }

            // if (gestureLocked.current === 'x') {
            //     const slug = relatedPostSlugRef.current;
            //     const relatedPosts = relatedPostsRef.current[slug] || [];

            //     // Get the horizontal scroll container (you'll need a ref for this)
            //     const horizontalContainer = horizontalCarouselRefs.current[slug];

            //     if (!horizontalContainer) return;

            //     const containerWidth = horizontalContainer.clientWidth;
            //     const currentScrollLeft = horizontalContainer.scrollLeft;
            //     const maxScroll = horizontalContainer.scrollWidth - containerWidth;

            //     // Total carousel items: 1 main + related posts
            //     const totalItems = 1 + relatedPosts.length;
            //     const currentIndex = Math.round(currentScrollLeft / containerWidth);

            //     const minDeltaX = -100; // threshold for swipe left (negative)
            //     const maxDeltaX = 100; // threshold for swipe right (positive)

            //     // LOOP LEFT: At first item (index 0), swiping left (deltaX < -100)
            //     if (
            //         currentIndex === 0 &&
            //         deltaX < minDeltaX &&
            //         !isHorizontalLooping.current[slug]
            //     ) {
            //         toast.info(`[${slug}] LOOP LEFT: Jumping to last item`);
            //         isHorizontalLooping.current[slug] = true;
            //         horizontalScrollLock.current[slug] = true;

            //         const lastItemIndex = totalItems - 1;
            //         const targetScroll = lastItemIndex * containerWidth;

            //         horizontalContainer.scrollTo({
            //             left: targetScroll,
            //             behavior: 'smooth',
            //         });

            //         // Clear timeout
            //         if (horizontalTimeoutRef.current[slug]) {
            //             clearTimeout(horizontalTimeoutRef.current[slug]);
            //         }

            //         horizontalTimeoutRef.current[slug] = setTimeout(() => {
            //             isHorizontalLooping.current[slug] = false;
            //             horizontalScrollLock.current[slug] = false;
            //             toast.info(`[${slug}] Loop LEFT complete`);
            //         }, 700);

            //         e.preventDefault();
            //         return;
            //     }

            //     // LOOP RIGHT: At last item, swiping right (deltaX > 100)
            //     if (
            //         currentIndex === totalItems - 1 &&
            //         deltaX > maxDeltaX &&
            //         !isHorizontalLooping.current[slug]
            //     ) {
            //         toast.info(`[${slug}] LOOP RIGHT: Jumping to first item`);
            //         isHorizontalLooping.current[slug] = true;
            //         horizontalScrollLock.current[slug] = true;

            //         horizontalContainer.scrollTo({
            //             left: 0,
            //             behavior: 'smooth',
            //         });

            //         // Clear timeout
            //         if (horizontalTimeoutRef.current[slug]) {
            //             clearTimeout(horizontalTimeoutRef.current[slug]);
            //         }

            //         horizontalTimeoutRef.current[slug] = setTimeout(() => {
            //             // Reset to main post view
            //             setActiveViewerMap((prev) => ({
            //                 ...prev,
            //                 [slug]: 'main',
            //             }));
            //             setRelatedViewerMap((prev) => ({
            //                 ...prev,
            //                 [slug]: null,
            //             }));
            //             setViewablePost(viewablePost); // Keep current viewable post

            //             isHorizontalLooping.current[slug] = false;
            //             horizontalScrollLock.current[slug] = false;
            //             toast.info(`[${slug}] Loop RIGHT complete`);
            //         }, 700);

            //         e.preventDefault();
            //         return;
            //     }
            // }

            if (gestureLocked.current === 'y') {
                const scrollTop = container.scrollTop;
                const atTop = scrollTop <= 0;
                const atBottom =
                    Math.abs(scrollTop + container.clientHeight - container.scrollHeight) < 5;

                if (atTop && deltaY > 30 && selectedPostIndex === 0) {
                    e.preventDefault();
                    scrollLock.current = true;
                    isLooping.current = true;

                    container.style.touchAction = 'none';
                    container.style.pointerEvents = 'none';

                    const newIndex = postsRef.current.length - 1;

                    container.scrollTo({
                        top: newIndex * container.clientHeight,
                        behavior: 'smooth',
                    });

                    waitForScrollSettle(false, () => {
                        setSelectedPostIndex(newIndex);
                        setViewablePost(postsRef.current[newIndex]);
                        setRelatedPostSlug(postsRef.current[newIndex].slug);

                        scrollLock.current = false;
                        isLooping.current = false;
                        container.style.touchAction = 'auto';
                        container.style.pointerEvents = 'auto';
                    });

                    return;
                }

                if (atBottom && deltaY < -30 && selectedPostIndex === postsRef.current.length - 1) {
                    e.preventDefault();
                    scrollLock.current = true;
                    isLooping.current = true;

                    container.style.touchAction = 'none';
                    container.style.pointerEvents = 'none';

                    container.scrollTo({ top: 0, behavior: 'smooth' });

                    waitForScrollSettle(true, () => {
                        setSelectedPostIndex(0);
                        setViewablePost(postsRef.current[0]);
                        setRelatedPostSlug(postsRef.current[0].slug);

                        scrollLock.current = false;
                        isLooping.current = false;
                        container.style.touchAction = 'auto';
                        container.style.pointerEvents = 'auto';
                    });

                    return;
                }
            }
        };

        if (isTouchDevice) {
            container.addEventListener('scroll', handleScroll, { passive: false });
            container.addEventListener('touchstart', handleTouchStart, { passive: false });
            container.addEventListener('touchmove', handleTouchMove, { passive: false });
        } else {
            window.addEventListener('wheel', handleWheel, { passive: false });
        }

        return () => {
            if (isTouchDevice) {
                container.removeEventListener('scroll', handleScroll);
                container.removeEventListener('touchstart', handleTouchStart);
                container.removeEventListener('touchmove', handleTouchMove);
            } else {
                window.removeEventListener('wheel', handleWheel);
            }
        };
    }, [isMobilePostViewer, viewablePost, selectedPostIndex, nextPageUrl, isMobilePostGallery]);

    // Original Horizontal Scroll Logic
    const handleHorizontalScroll = useCallback((mainPost, e) => {
        alert('in Handle');
        const el = e.currentTarget;
        alert('After El');

        const slug = mainPost.slug;
        alert('After Slug');
        const relatedPosts = relatedPostsRef.current[slug] || [];
        alert('After Related Posts');
        const currentViewer = relatedViewMap.current[slug] || null;
        alert('After Related Viewer');
        const nextPageUrl = relatedNextUrlMap.current[slug] || null;
        alert('After Related PAGE URL');

        const index = Math.round(el.scrollLeft / el.clientWidth);
        const lastIndex = lastHorizontalIndexRef.current[slug] ?? 0;

        alert('before Confition');
        alert(index);
        if (index === lastIndex) return;
        alert('After Confition');
        lastHorizontalIndexRef.current[slug] = index;

        if (index > lastIndex) lastDirectionRef.current = 'right';
        else if (index < lastIndex) lastDirectionRef.current = 'left';

        if (index > 0) {
            alert('psot changing');
            const relatedPost = relatedPosts[index - 1];
            if (activeViewerMap[slug] !== 'related' || currentViewer?.id !== relatedPost.id) {
                setRelatedViewerMap((prev) => ({
                    ...prev,
                    [slug]: relatedPost,
                }));

                setActiveViewerMap((prev) => ({
                    ...prev,
                    [slug]: 'related',
                }));

                setViewablePost(relatedPost);

                window.history.pushState({}, '', `${route('home')}${generateURL(relatedPost)}`);
            }

            const remaining = relatedPosts?.length - index;

            // Instant fetch on first swipe (if no pagination yet)
            if (!nextPageUrl && !isFetchingRef.current) {
                if (completedSlugsRef.current[slug]) return;

                const now = Date.now();
                const lastTried = lastTriedRef.current[slug] || 0;

                if (now - lastTried < 10000) return;
                lastTriedRef.current[slug] = now;

                setIsFetchingRelated(true);
                fetchRelatedPosts(slug);
                return;
            }

            // Fetch's only ONCE per next page URL when near end
            if (
                remaining <= 5 &&
                nextPageUrl &&
                !isFetchingRef.current &&
                lastFetchedUrlRef.current[slug] !== nextPageUrl &&
                !completedSlugsRef.current[slug]
            ) {
                setIsFetchingRelated(true);
                fetchRelatedPosts(slug);
            }
        } else if (index === 0 && currentViewer) {
            setActiveViewerMap((prev) => ({
                ...prev,
                [slug]: 'main',
            }));

            setRelatedViewerMap((prev) => ({
                ...prev,
                [slug]: null,
            }));

            setViewablePost(mainPost);
            window.history.replaceState({}, '', `${route('home')}${generateURL(mainPost)}`);
        }
    }, []);

    const updateRelatedPostsMap = (slug, newPosts = []) => {
        if (!slug || !Array.isArray(newPosts)) return;

        setRelatedPostsMap((prev) => {
            const existing = prev[slug] || [];

            // Only merge unique posts
            const merged = [
                ...existing,
                ...newPosts.filter((p) => !existing.some((old) => old.id === p.id)),
            ];

            // Only update if there’s actually something new
            if (merged.length !== existing.length) {
                return { ...prev, [slug]: merged };
            }

            return prev;
        });
    };

    const getRelatedPosts = (slug) => relatedPostsMap[slug] || [];
    const getRelatedViewer = (slug) => relatedViewerMap[slug] || null;

    const navigateToHashtag = async (hashtag) => {
        const tag = encodeURIComponent(hashtag);

        const cookieValue = getCookie('post_preferences');
        let postPreferences = null;

        if (cookieValue && cookieValue !== 'null' && cookieValue !== 'undefined') {
            try {
                postPreferences = JSON.parse(decodeURIComponent(cookieValue));
            } catch (error) {
                console.warn('⚠️ Invalid post_preferences cookie, skipping preferences.', error);
                toast.warn('Your saved preferences were invalid — using site defaults.');
                postPreferences = null;
            }
        }

        try {
            const response = await axios.post(
                route('website.posts.hashtag-posts', tag),
                { post_preferences: postPreferences },
                {
                    headers: { 'X-Inertia': true },
                },
            );

            router.replace(response.data);
        } catch (error) {
            console.error('Hashtag navigation failed:', error);
            toast.error('Failed to load hashtag posts.');
        }
    };

    return (
        <MainLayout>
            <Head title="Home" />

            {!isPostLoaded && (
                <div className="flex animate-pulse items-center justify-center gap-2 py-10 text-center text-gray-700 transition-all duration-100 dark:text-white/80">
                    <div className="flex items-center justify-center">
                        <div role="status">
                            <svg
                                aria-hidden="true"
                                className="h-5 w-5 animate-spin fill-indigo-600 text-gray-200 dark:text-white/80"
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
                    Please Wait While We Load Posts...
                </div>
            )}

            {isPostLoaded && (
                <>
                    {/* Search Bar */}
                    <GlobalSearch
                        additional_filters={false}
                        google_map_api_key={google_map_api_key}
                        OnPostFilterChange={() => {
                            window.history.replaceState({}, '', window.location.pathname);
                            setViewablePost('');
                            setIsDesktopPostViewer(false);
                            setIsMobilePostViewer(false);
                            setIsPostLoaded(false);
                            setPosts(null);
                            setNextPageUrl(null);
                            fetchPosts();
                        }}
                        search_history={search_history}
                    />

                    {/* Masonry Layout */}
                    <div className="pb-20 sm:pb-20">
                        <div className="max-w-8xl mx-auto sm:px-6 lg:px-8">
                            {/* Compact Masonry */}
                            <div className="columns-1 gap-1 [column-fill:_balance] min-[300px]:columns-2 lg:columns-4">
                                {posts.map((post, index) => {
                                    const url = generateURL(post);
                                    return (
                                        <article
                                            key={post?.id}
                                            className="group relative mb-1 cursor-pointer break-inside-avoid overflow-hidden rounded-none shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                                            style={{ animationDelay: `${index * 100}ms` }}
                                            onClick={() => {
                                                setViewablePost(post);
                                                updateRelatedPostsMap(
                                                    post?.slug,
                                                    post?.related_posts,
                                                );

                                                if (windowSize.width > 1024) {
                                                    setIsDesktopPostViewer(true);
                                                } else {
                                                    setIsMobilePostViewer(true);
                                                    // openFullscreen();
                                                }

                                                setSelectedPostIndex(index ?? 0);
                                                setSelectedMediaIndex(0);
                                                window.history.pushState({}, '', url);
                                            }}
                                        >
                                            {post?.images ? (
                                                <div className="relative">
                                                    <img
                                                        src={post?.images[0]?.url}
                                                        alt={post?.title}
                                                        loading="lazy"
                                                        className="w-full object-cover text-[10px] text-gray-700 transition-all duration-500 group-hover:scale-105 dark:text-white/80 dark:opacity-80"
                                                    />

                                                    {/* Title */}
                                                    <div className="absolute left-3 top-3">
                                                        <h2 className="line-clamp-2 text-[8px] font-semibold text-white drop-shadow-lg sm:text-[9px] md:text-[10px] lg:text-lg">
                                                            {post?.title.length > 20
                                                                ? post?.title.slice(0, 20) + '...'
                                                                : post?.title}
                                                        </h2>
                                                    </div>

                                                    {/* Share Button */}
                                                    <button
                                                        className="absolute right-3 top-3 text-white opacity-80 drop-shadow-lg hover:opacity-100"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            const url =
                                                                route('home') + generateURL(post);
                                                            navigator.clipboard.writeText(
                                                                url.trim(),
                                                            );

                                                            toast.success(
                                                                'Shareable Link Copied To Clipboard',
                                                            );
                                                        }}
                                                    >
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            strokeWidth={1.5}
                                                            stroke="currentColor"
                                                            className="size-3 lg:size-5"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z"
                                                            />
                                                        </svg>
                                                    </button>

                                                    {/* Title + Meta */}
                                                    <div className="absolute inset-x-0 bottom-0 p-4">
                                                        <div className="mt-1 flex items-center justify-between text-[6px] font-bold text-gray-200 drop-shadow-sm sm:text-[7px] md:text-[8px] lg:text-xs">
                                                            <span className="text-white drop-shadow-md">
                                                                {post?.tag}
                                                            </span>
                                                            <span className="flex items-center gap-1 text-white drop-shadow-md lg:gap-2">
                                                                <svg
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    fill="none"
                                                                    viewBox="0 0 24 24"
                                                                    strokeWidth={1.5}
                                                                    stroke="currentColor"
                                                                    className="size-2 md:size-3 lg:size-4"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                                                                    />
                                                                </svg>
                                                                {post?.added_at}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                /* Text-only */
                                                <div className="relative flex flex-col justify-between bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 p-5 text-white dark:from-gray-500 dark:via-gray-600 dark:to-gray-800">
                                                    {/* Share Button */}
                                                    <button
                                                        className="absolute right-3 top-3 text-white opacity-80 hover:opacity-100"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            const url =
                                                                route('home') + generateURL(post);
                                                            navigator.clipboard.writeText(
                                                                url.trim(),
                                                            );

                                                            toast.success(
                                                                'Shareable Link Copied To Clipboard',
                                                            );
                                                        }}
                                                    >
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            strokeWidth={1.5}
                                                            stroke="currentColor"
                                                            className="size-3 lg:size-5"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z"
                                                            />
                                                        </svg>
                                                    </button>

                                                    <div>
                                                        <h2 className="mb-2 line-clamp-2 text-[10px] font-semibold text-white drop-shadow-lg sm:text-[9px] md:text-[10px] lg:text-lg">
                                                            {post?.title}
                                                        </h2>
                                                        <p className="line-clamp-4 text-[10px] opacity-90 lg:text-sm">
                                                            {post.content.length > 200 ? (
                                                                <span
                                                                    dangerouslySetInnerHTML={{
                                                                        __html:
                                                                            post?.content.substring(
                                                                                0,
                                                                                200,
                                                                            ) + '...',
                                                                    }}
                                                                ></span>
                                                            ) : (
                                                                <span
                                                                    dangerouslySetInnerHTML={{
                                                                        __html: post?.content,
                                                                    }}
                                                                ></span>
                                                            )}
                                                        </p>
                                                    </div>
                                                    <div className="mt-2 flex items-center justify-between text-[7px] font-bold text-gray-200 drop-shadow-sm sm:text-[7px] md:text-[8px] lg:text-xs">
                                                        <span className="text-white drop-shadow-md">
                                                            {post?.tag}
                                                        </span>
                                                        <span className="flex items-center gap-1 text-white drop-shadow-md lg:gap-2">
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                strokeWidth={1.5}
                                                                stroke="currentColor"
                                                                className="size-2 md:size-3 lg:size-4"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                                                                />
                                                            </svg>
                                                            {post?.added_at}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </article>
                                    );
                                })}
                            </div>

                            {posts?.length === 0 && (
                                <div className="flex items-center justify-center rounded-lg bg-gradient-to-r from-purple-400 via-blue-400 to-indigo-600 py-5 text-center text-white dark:from-gray-500 dark:via-gray-600 dark:to-gray-800 dark:text-white/80">
                                    <h1 className="text-md font-bold">No Posts Found</h1>
                                </div>
                            )}

                            {/* Loader */}
                            {posts?.length > 0 && (
                                <>
                                    {nextPageUrl && (
                                        <div
                                            ref={loaderRef}
                                            className="flex animate-pulse items-center justify-center gap-2 py-10 text-center text-gray-700 transition-all duration-100 dark:text-white/80"
                                        >
                                            <div className="flex items-center justify-center">
                                                <div role="status">
                                                    <svg
                                                        aria-hidden="true"
                                                        className="h-5 w-5 animate-spin fill-blue-600 text-gray-200 dark:text-gray-600"
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
                                </>
                            )}
                        </div>
                    </div>

                    {/* Desktop Post View Modal */}
                    {viewablePost != '' &&
                        isDesktopPostViewer &&
                        createPortal(
                            <div className="fixed inset-0 z-50 bg-white dark:bg-deepcharcoal">
                                <div
                                    className="fixed inset-0 backdrop-blur-[32px]"
                                    onClick={() => {
                                        setViewablePost('');
                                        window.history.replaceState(
                                            {},
                                            '',
                                            window.location.pathname,
                                        );
                                    }}
                                ></div>

                                {/* Modal content */}
                                <div className="relative z-10 h-screen overflow-hidden p-6 shadow-xl scrollbar-none sm:p-8 lg:overflow-y-auto">
                                    {windowSize.width > 1024 && viewablePost != '' && (
                                        <>
                                            {/* Close Button */}
                                            <div className="flex items-center justify-end">
                                                <button
                                                    onClick={() => {
                                                        setViewablePost('');

                                                        window.history.replaceState(
                                                            {},
                                                            '',
                                                            window.location.pathname,
                                                        );

                                                        setIsDesktopPostViewer(false);
                                                        setIsMobilePostViewer(false);
                                                    }}
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        strokeWidth={1.5}
                                                        stroke="currentColor"
                                                        className="size-6 hover:text-black/80 dark:text-white/80 dark:hover:text-white"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M6 18 18 6M6 6l12 12"
                                                        />
                                                    </svg>
                                                </button>
                                            </div>
                                        </>
                                    )}

                                    {/* Scrollable Posts  */}

                                    {/* Post Content */}
                                    <div className="flex flex-col justify-center lg:flex-row">
                                        {/* Media Section - Shows on top for mobile, left for desktop */}
                                        <div
                                            className={`translate-y-3 transform transition-all duration-500 ease-in-out`}
                                        >
                                            {((Array.isArray(viewablePost?.post_video_urls) &&
                                                viewablePost.post_video_urls.length > 0) ||
                                                (Array.isArray(viewablePost?.post_image_urls) &&
                                                    viewablePost.post_image_urls.length > 0)) && (
                                                <PostMediaViewer
                                                    viewablePost={viewablePost}
                                                    selectedMediaIndex={selectedMediaIndex}
                                                    onSelectMediaIndex={setSelectedMediaIndex}
                                                    setMediaItems={setMediaItems}
                                                    mediaThumbRefs={mediaThumbRefs}
                                                />
                                            )}
                                        </div>

                                        {/* Content Section */}
                                        {viewablePost && (
                                            <div
                                                className={`w-full bg-transparent ${
                                                    (Array.isArray(viewablePost?.post_video_urls) &&
                                                        viewablePost.post_video_urls.length > 0) ||
                                                    (Array.isArray(viewablePost?.post_image_urls) &&
                                                        viewablePost.post_image_urls.length > 0)
                                                        ? 'lg:w-1/2' // when media exists, take half width on desktop
                                                        : 'lg:w-[80%]' // when no media, take full width
                                                }`}
                                            >
                                                {((!viewablePost?.post_video_urls?.length &&
                                                    !viewablePost?.post_image_urls?.length) ||
                                                    windowSize.width > 1024) && (
                                                    <div className="mx-auto w-full space-y-4 p-2 md:px-10">
                                                        {/* Author Header */}
                                                        <div className="flex flex-wrap items-center justify-between space-x-3 space-y-4">
                                                            <div className="flex items-center">
                                                                <span className="text-[13px] font-semibold dark:text-white/80 sm:text-[16px] md:text-[17px] lg:text-[20px]">
                                                                    {viewablePost?.user?.name
                                                                        .length > 30
                                                                        ? viewablePost?.user?.name.substring(
                                                                              0,
                                                                              30,
                                                                          ) + '...'
                                                                        : viewablePost?.user?.name}

                                                                    {!viewablePost?.user?.name &&
                                                                        'User'}
                                                                </span>
                                                            </div>

                                                            <div className="flex cursor-pointer items-center gap-2">
                                                                {/* QR Button */}
                                                                <button
                                                                    onClick={() =>
                                                                        setShowQrCode(true)
                                                                    }
                                                                >
                                                                    <svg
                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                        fill="none"
                                                                        viewBox="0 0 24 24"
                                                                        strokeWidth={1.5}
                                                                        stroke="currentColor"
                                                                        className="size-5 hover:text-black/80 dark:text-white/80 dark:hover:text-white sm:size-4 md:size-5 lg:size-6"
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
                                                                </button>

                                                                {/* Bookmark Button */}
                                                                {auth?.user && (
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            router.put(
                                                                                route(
                                                                                    'website.posts.bookmark',
                                                                                    viewablePost?.id,
                                                                                ),
                                                                                {
                                                                                    post_id:
                                                                                        viewablePost?.id,
                                                                                },
                                                                                {
                                                                                    onSuccess:
                                                                                        () => {
                                                                                            viewablePost.is_bookmarked =
                                                                                                !viewablePost.is_bookmarked;
                                                                                        },
                                                                                    onError: (e) =>
                                                                                        toast.error(
                                                                                            e.message,
                                                                                        ),
                                                                                },
                                                                            );
                                                                        }}
                                                                    >
                                                                        <svg
                                                                            xmlns="http://www.w3.org/2000/svg"
                                                                            fill={
                                                                                viewablePost?.is_bookmarked
                                                                                    ? isDarkMode
                                                                                        ? '#fff'
                                                                                        : '#0340D1'
                                                                                    : 'none'
                                                                            }
                                                                            stroke={
                                                                                viewablePost?.is_bookmarked
                                                                                    ? isDarkMode
                                                                                        ? '#fff'
                                                                                        : '#0340D1'
                                                                                    : 'currentColor'
                                                                            }
                                                                            strokeWidth={1.5}
                                                                            viewBox="0 0 24 24"
                                                                            className="size-5 hover:text-black/80 dark:text-white/80 dark:hover:text-white sm:size-4 md:size-5 lg:size-6"
                                                                        >
                                                                            <path
                                                                                strokeLinecap="round"
                                                                                strokeLinejoin="round"
                                                                                d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z"
                                                                            />
                                                                        </svg>
                                                                    </button>
                                                                )}

                                                                {/* Copy Link Button */}
                                                                <button
                                                                    onClick={(e) => {
                                                                        const url =
                                                                            route('home') +
                                                                            generateURL(
                                                                                viewablePost,
                                                                            );
                                                                        navigator.clipboard.writeText(
                                                                            url.trim(),
                                                                        );
                                                                        toast.success(
                                                                            'Copied to clipboard',
                                                                        );
                                                                    }}
                                                                >
                                                                    <svg
                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                        fill="none"
                                                                        viewBox="0 0 24 24"
                                                                        strokeWidth={1.5}
                                                                        stroke="currentColor"
                                                                        className="size-5 hover:text-black/80 dark:text-white/80 dark:hover:text-white sm:size-4 md:size-5 lg:size-6"
                                                                    >
                                                                        <path
                                                                            strokeLinecap="round"
                                                                            strokeLinejoin="round"
                                                                            d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0 1 18 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3 1.5 1.5 3-3.75"
                                                                        />
                                                                    </svg>
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {/* Post Content */}
                                                        <p className="mt-2 whitespace-normal break-words text-[15px] font-semibold text-gray-800 dark:text-white/80 sm:text-[16px] md:text-[17px] lg:text-[20px]">
                                                            {viewablePost?.title}
                                                        </p>

                                                        <div
                                                            className="prose max-h-[400px] max-w-[70vw] overflow-auto break-words text-[15px] text-gray-800 dark:prose-invert dark:text-white/80 sm:text-[16px] md:text-[17px] lg:text-[20px]"
                                                            dangerouslySetInnerHTML={{
                                                                __html: viewablePost?.content,
                                                            }}
                                                        />

                                                        {/* Tag */}
                                                        <div>
                                                            {viewablePost?.tag && (
                                                                <button
                                                                    onClick={() => {
                                                                        navigateToHashtag(
                                                                            viewablePost?.tag,
                                                                        );
                                                                    }}
                                                                    className="text-[10px] font-semibold text-indigo-600 dark:text-white/80 sm:text-[11px] md:text-[12px] lg:text-[15px]"
                                                                >
                                                                    {viewablePost?.tag}
                                                                </button>
                                                            )}
                                                        </div>

                                                        <hr className="border-gray-200 dark:border-gray-700" />

                                                        {/* Post Meta Info */}
                                                        <div className="my-2 flex flex-wrap gap-2 text-[10px] text-gray-700 dark:text-white/80 sm:text-[11px] md:text-[12px] lg:text-[15px]">
                                                            <span className="rounded-full bg-gray-100 p-2 dark:bg-gray-800/70">
                                                                {viewablePost?.added_at}{' '}
                                                                {viewablePost?.created_at_time}
                                                            </span>

                                                            {viewablePost?.location_name && (
                                                                <span className="rounded-full bg-gray-100 p-2 dark:bg-gray-800/70">
                                                                    {viewablePost?.location_name}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Scrollable Posts  */}
                                        {windowSize.width > 1024 && (
                                            <PostsGrid
                                                posts={posts}
                                                onSelect={(post) => {
                                                    setViewablePost(post);
                                                    window.history.replaceState(
                                                        {},
                                                        '',
                                                        generateURL(post),
                                                    );
                                                }}
                                                selectedPostIndex={selectedPostIndex}
                                                onSelectIndex={setSelectedPostIndex}
                                                nextPageUrl={nextPageUrl}
                                                fetchMorePosts={fetchMorePosts}
                                                fetchSinglePost={fetchSinglePost}
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>,
                            document.body,
                        )}

                    {/* Mobile Post View */}
                    {viewablePost !== '' &&
                        isMobilePostViewer &&
                        createPortal(
                            <>
                                <div className="fixed inset-0 z-50 bg-deepcharcoal">
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

                                                    {(activeViewerType === 'main' ||
                                                        !activeViewerType) && (
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
                                                                            navigateToHashtag(
                                                                                post?.tag,
                                                                            );
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
                                                                {showElipsisDropdown &&
                                                                    isMobilePostViewer && (
                                                                        <>
                                                                            <div
                                                                                ref={
                                                                                    elipsisDropDownRef
                                                                                }
                                                                                data-elipsis-dropdown
                                                                                onClick={(e) =>
                                                                                    e.stopPropagation()
                                                                                }
                                                                                className="absolute right-0 top-full z-[99999] mt-2 w-36 rounded-lg border border-gray-900 bg-deepcharcoal shadow-xl sm:w-48"
                                                                            >
                                                                                <ul
                                                                                    className="overflow-y-scroll py-1 text-sm text-gray-200 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white"
                                                                                    style={{
                                                                                        maxHeight:
                                                                                            '180px',
                                                                                    }}
                                                                                >
                                                                                    <li>
                                                                                        <button
                                                                                            onClick={(
                                                                                                e,
                                                                                            ) => {
                                                                                                setShowQrCode(
                                                                                                    true,
                                                                                                );
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
                                                                                                strokeWidth={
                                                                                                    1.5
                                                                                                }
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
                                                                                                onClick={(
                                                                                                    e,
                                                                                                ) => {
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
                                                                                                                },
                                                                                                            onError:
                                                                                                                (
                                                                                                                    e,
                                                                                                                ) => {
                                                                                                                    toast.error(
                                                                                                                        e.message,
                                                                                                                    );
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
                                                                                                    strokeWidth={
                                                                                                        1.5
                                                                                                    }
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
                                                                                            onClick={(
                                                                                                e,
                                                                                            ) => {
                                                                                                const url =
                                                                                                    route(
                                                                                                        'home',
                                                                                                    ) +
                                                                                                    generateURL(
                                                                                                        post,
                                                                                                    );
                                                                                                navigator.clipboard.writeText(
                                                                                                    url.trim(),
                                                                                                );

                                                                                                toast.success(
                                                                                                    'Copied to clipboard',
                                                                                                );

                                                                                                setElipsisShowDropdown(
                                                                                                    false,
                                                                                                );
                                                                                            }}
                                                                                        >
                                                                                            <svg
                                                                                                xmlns="http://www.w3.org/2000/svg"
                                                                                                fill="none"
                                                                                                viewBox="0 0 24 24"
                                                                                                strokeWidth={
                                                                                                    1.5
                                                                                                }
                                                                                                stroke="currentColor"
                                                                                                className="size-6"
                                                                                            >
                                                                                                <path
                                                                                                    strokeLinecap="round"
                                                                                                    strokeLinejoin="round"
                                                                                                    d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0 1 18 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3 1.5 1.5 3-3.75"
                                                                                                />
                                                                                            </svg>
                                                                                            Copy
                                                                                            Link
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

                                                    {activeViewerType === 'related' &&
                                                        relatedViewer && (
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
                                                                                navigateToHashtag(
                                                                                    relatedViewer?.tag,
                                                                                );
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
                                                                    {showElipsisDropdown &&
                                                                        isMobilePostViewer && (
                                                                            <>
                                                                                <div
                                                                                    ref={
                                                                                        elipsisDropDownRef
                                                                                    }
                                                                                    data-elipsis-dropdown
                                                                                    onClick={(e) =>
                                                                                        e.stopPropagation()
                                                                                    }
                                                                                    className="absolute right-0 top-full z-[99999] mt-2 w-36 rounded-lg border border-gray-900 bg-deepcharcoal shadow-xl sm:w-48"
                                                                                >
                                                                                    <ul
                                                                                        className="overflow-y-scroll py-1 text-sm text-gray-200 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white"
                                                                                        style={{
                                                                                            maxHeight:
                                                                                                '180px',
                                                                                        }}
                                                                                    >
                                                                                        <li>
                                                                                            <button
                                                                                                onClick={(
                                                                                                    e,
                                                                                                ) => {
                                                                                                    setShowQrCode(
                                                                                                        true,
                                                                                                    );
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
                                                                                                    strokeWidth={
                                                                                                        1.5
                                                                                                    }
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
                                                                                                QR
                                                                                                Code
                                                                                            </button>
                                                                                        </li>

                                                                                        {auth?.user && (
                                                                                            <li>
                                                                                                <button
                                                                                                    className="flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-gray-950 hover:text-white"
                                                                                                    onClick={(
                                                                                                        e,
                                                                                                    ) => {
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
                                                                                                                    },
                                                                                                                onError:
                                                                                                                    (
                                                                                                                        e,
                                                                                                                    ) => {
                                                                                                                        toast.error(
                                                                                                                            e.message,
                                                                                                                        );
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
                                                                                                        strokeWidth={
                                                                                                            1.5
                                                                                                        }
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
                                                                                                onClick={(
                                                                                                    e,
                                                                                                ) => {
                                                                                                    const url =
                                                                                                        route(
                                                                                                            'home',
                                                                                                        ) +
                                                                                                        generateURL(
                                                                                                            relatedViewer,
                                                                                                        );
                                                                                                    navigator.clipboard.writeText(
                                                                                                        url.trim(),
                                                                                                    );

                                                                                                    toast.success(
                                                                                                        'Copied to clipboard',
                                                                                                    );

                                                                                                    setElipsisShowDropdown(
                                                                                                        false,
                                                                                                    );
                                                                                                }}
                                                                                            >
                                                                                                <svg
                                                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                                                    fill="none"
                                                                                                    viewBox="0 0 24 24"
                                                                                                    strokeWidth={
                                                                                                        1.5
                                                                                                    }
                                                                                                    stroke="currentColor"
                                                                                                    className="size-6"
                                                                                                >
                                                                                                    <path
                                                                                                        strokeLinecap="round"
                                                                                                        strokeLinejoin="round"
                                                                                                        d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0 1 18 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3 1.5 1.5 3-3.75"
                                                                                                    />
                                                                                                </svg>
                                                                                                Copy
                                                                                                Link
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
                                                            if (el)
                                                                horizontalCarouselRefs.current[
                                                                    post.slug
                                                                ] = el;
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
                                                                {Array.isArray(
                                                                    post.post_image_urls,
                                                                ) &&
                                                                post.post_image_urls.length > 0 ? (
                                                                    <img
                                                                        src={
                                                                            post.post_image_urls[0]
                                                                        }
                                                                        alt="Main Post"
                                                                        className="absolute inset-0 z-10 h-full w-full object-cover"
                                                                    />
                                                                ) : (
                                                                    Array.isArray(
                                                                        post.post_video_urls,
                                                                    ) &&
                                                                    post.post_video_urls.length >
                                                                        0 && (
                                                                        <VideoPlayer
                                                                            videoUrl={
                                                                                post
                                                                                    .post_video_urls[0]
                                                                            }
                                                                            thumbnail={
                                                                                videoThumbnail
                                                                            }
                                                                            className="relative z-10 max-h-full max-w-full object-contain"
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
                                                                        {Array.isArray(
                                                                            related.post_image_urls,
                                                                        ) &&
                                                                        related.post_image_urls
                                                                            .length > 0 ? (
                                                                            <img
                                                                                src={
                                                                                    related
                                                                                        .post_image_urls[0]
                                                                                }
                                                                                alt="Related Post"
                                                                                className="absolute inset-0 z-10 h-full w-full object-cover"
                                                                            />
                                                                        ) : (
                                                                            Array.isArray(
                                                                                related.post_video_urls,
                                                                            ) &&
                                                                            related.post_video_urls
                                                                                .length > 0 && (
                                                                                <VideoPlayer
                                                                                    videoUrl={
                                                                                        related
                                                                                            .post_video_urls[0]
                                                                                    }
                                                                                    thumbnail={
                                                                                        videoThumbnail
                                                                                    }
                                                                                    className="relative z-10 max-h-full max-w-full object-contain"
                                                                                />
                                                                            )
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ))}

                                                        {isFetchingRelated && (
                                                            <div className="fixed inset-0 flex h-full min-w-full flex-shrink-0 snap-start snap-always flex-col items-center justify-center bg-deepcharcoal text-white">
                                                                <div className="absolute left-4 top-4 h-4 w-16 animate-pulse rounded bg-gray-700"></div>
                                                                <div className="h-[70vh] w-[90%] animate-pulse rounded-2xl bg-gray-800/60"></div>
                                                                <div className="absolute bottom-16 w-full space-y-2 px-6 text-center">
                                                                    <div className="mx-auto h-4 w-2/3 animate-pulse rounded bg-gray-700"></div>
                                                                    <div className="mx-auto h-4 w-1/2 animate-pulse rounded bg-gray-700/70"></div>
                                                                    <div className="mx-auto h-4 w-1/3 animate-pulse rounded bg-gray-700/60"></div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Bottom Overlay */}
                                                    {(activeViewerType === 'main' ||
                                                        !activeViewerType) && (
                                                        <div
                                                            className={`absolute ${
                                                                (Array.isArray(
                                                                    post.post_image_urls,
                                                                ) &&
                                                                    post.post_image_urls.length >
                                                                        0) ||
                                                                (Array.isArray(
                                                                    post.post_video_urls,
                                                                ) &&
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
                                                                            ? prev.filter(
                                                                                  (id) =>
                                                                                      id !==
                                                                                      post.id,
                                                                              )
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
                                                                            ? post.location_name
                                                                                  .length > 7
                                                                                ? post.location_name.slice(
                                                                                      0,
                                                                                      7,
                                                                                  )
                                                                                : post.location_name
                                                                            : ''}
                                                                        {post?.location_name
                                                                            ? ' '
                                                                            : ''}
                                                                        {post?.added_at
                                                                            ? post.added_at + ' '
                                                                            : ''}
                                                                        {post?.created_at_time ||
                                                                            ''}
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
                                                                        showDetailsPostIds.includes(
                                                                            post.id,
                                                                        )
                                                                            ? '[-webkit-line-clamp:5]'
                                                                            : '[-webkit-line-clamp:3]'
                                                                    }`}
                                                                    onClick={() => {
                                                                        setShowDetailsPostIds(
                                                                            (prev) =>
                                                                                prev.includes(
                                                                                    post.id,
                                                                                )
                                                                                    ? prev.filter(
                                                                                          (id) =>
                                                                                              id !==
                                                                                              post.id,
                                                                                      )
                                                                                    : [
                                                                                          ...prev,
                                                                                          post.id,
                                                                                      ],
                                                                        );
                                                                    }}
                                                                    style={{
                                                                        maxHeight:
                                                                            showDetailsPostIds.includes(
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
                                                            {showDetailsPostIds.includes(
                                                                post.id,
                                                            ) && (
                                                                <div className="mb-0 mt-3 flex items-center justify-between">
                                                                    {/* Username */}
                                                                    <div className="mb-0 flex items-center space-x-2">
                                                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm text-gray-900">
                                                                            {post.user?.avatar ||
                                                                                'U'}
                                                                        </div>
                                                                        <span className="text-xs font-medium text-white/80">
                                                                            {post.user?.name
                                                                                .length > 6
                                                                                ? post.user?.name.substring(
                                                                                      0,
                                                                                      6,
                                                                                  ) + '...'
                                                                                : post.user?.name}

                                                                            {!post?.user?.name &&
                                                                                'User'}
                                                                        </span>
                                                                    </div>

                                                                    <button
                                                                        className="rounded-md bg-indigo-600 p-1 text-sm font-semibold hover:bg-indigo-400/80"
                                                                        onClick={() => {
                                                                            setIsMobilePostGallery(
                                                                                true,
                                                                            );
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

                                                            {!showDetailsPostIds.includes(
                                                                post.id,
                                                            ) &&
                                                                Array.isArray(
                                                                    post.post_image_urls,
                                                                ) &&
                                                                post.post_image_urls.length < 1 &&
                                                                Array.isArray(
                                                                    post.post_video_urls,
                                                                ) &&
                                                                post.post_video_urls.length < 1 && (
                                                                    <div className="mt-3 flex items-center justify-between">
                                                                        <div className="mb-0 flex items-center space-x-2">
                                                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm text-gray-900">
                                                                                {post.user
                                                                                    ?.avatar || 'U'}
                                                                            </div>
                                                                            <span className="text-xs font-medium text-white/80">
                                                                                {post.user?.name
                                                                                    .length > 6
                                                                                    ? post.user?.name.substring(
                                                                                          0,
                                                                                          6,
                                                                                      ) + '...'
                                                                                    : post.user
                                                                                          ?.name}
                                                                                {!post?.user
                                                                                    ?.name &&
                                                                                    'User'}
                                                                            </span>
                                                                        </div>

                                                                        <button
                                                                            className="rounded-md bg-indigo-600 p-1 text-sm font-semibold hover:bg-indigo-400/80"
                                                                            onClick={() => {
                                                                                setIsMobilePostGallery(
                                                                                    true,
                                                                                );
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

                                                    {activeViewerType === 'related' &&
                                                        relatedViewer && (
                                                            <div
                                                                className={`absolute ${
                                                                    (Array.isArray(
                                                                        relatedViewer.post_image_urls,
                                                                    ) &&
                                                                        relatedViewer
                                                                            .post_image_urls
                                                                            .length > 0) ||
                                                                    (Array.isArray(
                                                                        relatedViewer.post_video_urls,
                                                                    ) &&
                                                                        relatedViewer
                                                                            .post_video_urls
                                                                            .length > 0)
                                                                        ? 'bottom-0 right-0'
                                                                        : 'right-10 top-10'
                                                                } left-0 z-[10] p-4 font-bold text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]`}
                                                            >
                                                                {/* Hashtag */}
                                                                <div
                                                                    className="mb-2 flex items-center justify-end space-x-2"
                                                                    onClick={() => {
                                                                        setShowDetailsPostIds(
                                                                            (prev) =>
                                                                                prev.includes(
                                                                                    relatedViewer.id,
                                                                                )
                                                                                    ? prev.filter(
                                                                                          (id) =>
                                                                                              id !==
                                                                                              relatedViewer.id,
                                                                                      )
                                                                                    : [
                                                                                          ...prev,
                                                                                          relatedViewer.id,
                                                                                      ],
                                                                        );
                                                                    }}
                                                                >
                                                                    {/* <span className="text-sm text-white/80">
                                                            {relatedViewer?.tag}
                                                        </span> */}

                                                                    {relatedViewer?.location_name && (
                                                                        <span className="text-sm text-white/80">
                                                                            {relatedViewer?.location_name
                                                                                ? relatedViewer
                                                                                      .location_name
                                                                                      .length > 7
                                                                                    ? relatedViewer.location_name.slice(
                                                                                          0,
                                                                                          7,
                                                                                      )
                                                                                    : relatedViewer.location_name
                                                                                : ''}
                                                                            {relatedViewer?.location_name
                                                                                ? ' '
                                                                                : ''}
                                                                            {relatedViewer?.added_at
                                                                                ? relatedViewer.added_at +
                                                                                  ' '
                                                                                : ''}
                                                                            {relatedViewer?.created_at_time ||
                                                                                ''}
                                                                        </span>
                                                                    )}
                                                                </div>

                                                                {/* Content */}
                                                                {(Array.isArray(
                                                                    relatedViewer.post_image_urls,
                                                                ) &&
                                                                    relatedViewer.post_image_urls
                                                                        .length > 0) ||
                                                                (Array.isArray(
                                                                    relatedViewer.post_video_urls,
                                                                ) &&
                                                                    relatedViewer.post_video_urls
                                                                        .length > 0) ? (
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
                                                                            setShowDetailsPostIds(
                                                                                (prev) =>
                                                                                    prev.includes(
                                                                                        relatedViewer.id,
                                                                                    )
                                                                                        ? prev.filter(
                                                                                              (
                                                                                                  id,
                                                                                              ) =>
                                                                                                  id !==
                                                                                                  relatedViewer.id,
                                                                                          )
                                                                                        : [
                                                                                              ...prev,
                                                                                              relatedViewer.id,
                                                                                          ],
                                                                            );
                                                                        }}
                                                                        style={{
                                                                            maxHeight:
                                                                                showDetailsPostIds.includes(
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
                                                                {showDetailsPostIds.includes(
                                                                    relatedViewer.id,
                                                                ) && (
                                                                    <div className="mb-0 mt-3 flex items-center justify-between">
                                                                        {/* Username */}
                                                                        <div className="mb-0 flex items-center space-x-2">
                                                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm text-gray-900">
                                                                                {relatedViewer.user
                                                                                    ?.avatar || 'U'}
                                                                            </div>
                                                                            <span className="text-xs font-medium text-white/80">
                                                                                {relatedViewer?.user &&
                                                                                relatedViewer.user
                                                                                    ?.name.length >
                                                                                    6
                                                                                    ? relatedViewer.user?.name.substring(
                                                                                          0,
                                                                                          6,
                                                                                      ) + '...'
                                                                                    : relatedViewer
                                                                                          .user
                                                                                          ?.name}

                                                                                {!relatedViewer?.user &&
                                                                                    'User'}
                                                                            </span>
                                                                        </div>

                                                                        <button
                                                                            className="rounded-md bg-indigo-600 p-1 text-sm font-semibold hover:bg-indigo-400/80"
                                                                            onClick={() => {
                                                                                setIsMobilePostGallery(
                                                                                    true,
                                                                                );
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

                                                                {!showDetailsPostIds.includes(
                                                                    relatedViewer.id,
                                                                ) &&
                                                                    Array.isArray(
                                                                        relatedViewer.post_image_urls,
                                                                    ) &&
                                                                    relatedViewer.post_image_urls
                                                                        .length < 1 &&
                                                                    Array.isArray(
                                                                        relatedViewer.post_video_urls,
                                                                    ) &&
                                                                    relatedViewer.post_video_urls
                                                                        .length < 1 && (
                                                                        <div className="mt-3 flex items-center justify-between">
                                                                            <div className="mb-0 flex items-center space-x-2">
                                                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm text-gray-900">
                                                                                    {relatedViewer
                                                                                        .user
                                                                                        ?.avatar ||
                                                                                        'U'}
                                                                                </div>
                                                                                <span className="text-xs font-medium text-white/80">
                                                                                    {relatedViewer
                                                                                        .user?.name
                                                                                        .length > 6
                                                                                        ? relatedViewer.user?.name.substring(
                                                                                              0,
                                                                                              6,
                                                                                          ) + '...'
                                                                                        : relatedViewer
                                                                                              .user
                                                                                              ?.name}

                                                                                    {!relatedViewer?.user &&
                                                                                        'User'}
                                                                                </span>
                                                                            </div>

                                                                            <button
                                                                                className="rounded-md bg-indigo-600 p-1 text-sm font-semibold hover:bg-indigo-400/80"
                                                                                onClick={() => {
                                                                                    setIsMobilePostGallery(
                                                                                        true,
                                                                                    );
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
                            document.body,
                        )}

                    {/* Mobile Post Gallery */}
                    {isMobilePostGallery &&
                        isMobilePostViewer &&
                        createPortal(
                            <>
                                <div className="fixed inset-0 z-50 bg-black">
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
                                                                            post_id:
                                                                                viewablePost?.id,
                                                                        },
                                                                        {
                                                                            onSuccess: () => {
                                                                                viewablePost.is_bookmarked =
                                                                                    !viewablePost.is_bookmarked;
                                                                            },
                                                                            onError: (e) => {
                                                                                toast.error(
                                                                                    e.message,
                                                                                );
                                                                            },

                                                                            onFinish: () => {
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
                                                                    route('home') +
                                                                    generateURL(viewablePost);
                                                                navigator.clipboard.writeText(
                                                                    url.trim(),
                                                                );

                                                                toast.success(
                                                                    'Copied to clipboard',
                                                                );

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
                                            <div className="relative h-[60vh] w-full snap-x snap-mandatory overflow-x-auto overflow-y-hidden scrollbar-none">
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
                                                                    <VideoPlayer
                                                                        key={idx}
                                                                        videoUrl={item.url}
                                                                        thumbnail={videoThumbnail}
                                                                        className="relative z-10 max-h-full max-w-full rounded-xl object-contain"
                                                                        fullscreen={true}
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
                                                                ? viewablePost.location_name.slice(
                                                                      0,
                                                                      7,
                                                                  )
                                                                : viewablePost.location_name
                                                            : ''}
                                                        {viewablePost?.location_name ? ' ' : ''}
                                                        {viewablePost?.added_at
                                                            ? viewablePost.added_at + ' '
                                                            : ''}
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
                                                            ? viewablePost.user?.name.substring(
                                                                  0,
                                                                  6,
                                                              ) + '...'
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
                            document.body,
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
                                    className={`relative z-[101] w-full max-w-sm rounded-2xl bg-white/50 p-6 text-gray-900 shadow-xl sm:max-w-md`}
                                >
                                    <div className="flex justify-end">
                                        <button onClick={() => setShowQrCode(false)}>✕</button>
                                    </div>
                                    <div className="text-center">
                                        <h2
                                            id="qrCodeTitle"
                                            className="mb-3 text-base font-semibold"
                                        >
                                            Scan QR Code
                                        </h2>
                                        <div className="flex justify-center">
                                            <QRCode
                                                className="size-48 sm:size-52 md:size-60"
                                                value={route('home') + generateURL(viewablePost)}
                                                viewBox="0 0 256 256"
                                                level="H"
                                                includeMargin
                                                bgColor="#ffffff"
                                                fgColor="#000000"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>,
                            document.body,
                        )}
                </>
            )}
        </MainLayout>
    );
}

// Remeaning Checking And Implemeting Proper X Scroll Logic
// setting related post in first time posts fecthing and in get more and in single fetch done
// Just relatedfetchmore logic implementation also remeaning

// Post changing in x axis But Appening its URL in the Search Params and adding it to viewable post state remeaning
