import PostMediaViewer from '@/Pages/Website/Home/PostMediaViewer';
import PostsGrid from '@/Pages/Website/Home/PostsGrid';
import useDarkMode from '@/Hooks/useDarkMode';
import useWindowSize from '@/Hooks/useWindowSize';
import MainLayout from '@/Layouts/Website/MainLayout';
import { Head, router, usePage } from '@inertiajs/react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import QRCode from 'react-qr-code';
import { createPortal } from 'react-dom';
import axios from 'axios';
import GlobalSearch from '@/Components/GlobalSearch';
import LinkCopiedModal from '@/Components/LinkCopiedModal';
import BookmarkStatusChangedModal from '@/Components/BookmarkStatusChangedModal';
import useSidebarClick from '@/Hooks/useSidebarClick';
import SmartphoneDesktopModal from './SmartphoneDesktopModal';
import getCookie from '@/Hooks/useGetCookie';
import Toast from '@/Components/Toast';
import SmartphoneMobileModal from './SmartphoneMobileModal';
import VideoThumbnail from '@/Components/VideoThumbnail';
import VideoWithThumbnail from '@/Components/VideoWithThumbnail';

export default function index({ google_map_api_key, search_history }) {
    const { currency } = usePage().props;

    const [ErrorMessage, setErrorMessage] = useState(null);
    const [showErrorMessage, setShowErrorMessage] = useState(false);

    const [InfoMessage, setInfoMessage] = useState(null);
    const [showInfoMessage, setShowInfoMessage] = useState(false);

    const [isPostLoaded, setIsPostLoaded] = useState(false);
    const [posts, setPosts] = useState(null);
    const [products, setProducts] = useState(null);

    const [showPostDesktopActionsDropdown, setShowPostDesktopActionsDropdown] = useState(false);
    const [bookmarkStatusChanged, setBookmarkStatusChanged] = useState(false);
    const [linkCopied, setLinkCopied] = useState(false);
    const [relatedPostsMap, setRelatedPostsMap] = useState({});
    const [relatedNextMap, setRelatedNextMap] = useState({});
    const [relatedViewerMap, setRelatedViewerMap] = useState({});
    const [activeViewerMap, setActiveViewerMap] = useState({});
    const [relatedPostSlug, setRelatedPostSlug] = useState(null);
    const [nextPageUrl, setNextPageUrl] = useState(null);

    // Smartphone States
    const [smartphoneDesktopModal, setSmartphoneDesktopModal] = useState(false);
    const [smartphoneMobileModal, setSmartphoneMobileModal] = useState(false);
    const [viewableSmartphone, setViewableSmartphone] = useState(null);
    const [selectedSmartphoneIndex, setSelectedSmartphoneIndex] = useState(null);
    const [hasMoreSmartphones, setHasMoreSmartphones] = useState(false);
    const [smartphoneMobileGallery, setSmartphoneMobileGallery] = useState(false);

    // Smartphone Refs
    const smartphoneMobileGalleryRef = useRef(null);

    useEffect(() => {
        smartphoneMobileGalleryRef.current = smartphoneMobileGallery;
    }, [smartphoneMobileGallery]);

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

            setPosts(res.data.posts);
            setProducts(res.data.products);
            setNextPageUrl(res.data.next_page_url);
            setHasMoreSmartphones(res.data.has_more_smartphones);
            setIsPostLoaded(true);
        } catch (error) {
            console.error('Failed to fetch posts:', error);

            setShowErrorMessage(true);
            setErrorMessage('Failed to fetch posts. Please try again later.');
        }
    };

    useEffect(() => {
        fetchPostsAndProducts();
    }, []);

    // Auto Resetting Error Message States
    useEffect(() => {
        if (showErrorMessage) {
            setTimeout(() => {
                setShowErrorMessage(false);
                setErrorMessage(null);
            }, 1500);
        }
    }, [showErrorMessage]);

    // Auto Resetting Info Message States
    useEffect(() => {
        if (showInfoMessage) {
            setTimeout(() => {
                setShowInfoMessage(false);
                setInfoMessage(null);
            }, 1500);
        }
    }, [showInfoMessage]);

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
    const fetchLock = useRef(false);
    const isFetchingRef = useRef(false);
    const lastFetchedUrlRef = useRef({});
    const postDesktopViewerActionDropdownRef = useRef(null);

    // If Post Already Fetches All Remeaning Related Posts And Dont Have More Pages so it will be marked as completed and wont be fetched
    const completedSlugsRef = useRef({});
    const relatedPostsRef = useRef(relatedPostsMap);
    const relatedViewMap = useRef(relatedViewerMap);
    const relatedNextUrlMap = useRef(relatedNextMap);
    const relatedPostSlugRef = useRef(relatedPostSlug);

    const scrollLock = useRef(false);

    const isLooping = useRef(false);
    const touchStartY = useRef(0);
    const touchStartX = useRef(0);

    const postsRef = useRef(posts);
    const lastFetchTriggerIndex = useRef(-1);
    const gestureLocked = useRef(null);
    const lastTriedRef = useRef({});

    const lastHorizontalIndexRef = useRef({});
    const horizontalCarouselRefs = useRef({});
    const isHorizontalLooping = useRef({});
    const horizontalScrollLock = useRef({});
    const lastDirectionRef = useRef({});

    const isfetchingMorePosts = useRef(false);

    const generateURL = (post) => {
        return (
            `?slug=${encodeURIComponent(post?.slug)}&planet=earth${post?.latitude != null ? '&lat=' + encodeURIComponent(post?.latitude) : ''}` +
            `${post?.longitude != null ? '&lng=' + encodeURIComponent(post?.longitude) : ''}` +
            `${post?.location_name != null ? '&location_name=' + encodeURIComponent(post?.location_name) : ''}` +
            `&timestamp=${encodeURIComponent(post?.created_at)}` +
            `${post?.floor_id != null ? '&floor=' + encodeURIComponent(post?.floor?.name) : ''}`
        );
    };

    const handleStopVideoPlayer = () => {
        document.querySelectorAll('video').forEach((v) => {
            v.pause();
        });
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

            window.history.replaceState({ modal: 'post-viewer' }, '', window.location.href);

            setIsDesktopPostViewer(false);
            setIsMobilePostViewer(true);
        }

        if (windowSize.width > 1024) {
            if (showQrCode) setShowQrCode(false);

            window.history.replaceState({ modal: 'post-viewer' }, '', window.location.href);

            setIsMobilePostViewer(false);
            setIsDesktopPostViewer(true);
        }
    };

    const setSmartphoneViewerBasedOnWidth = (windowSize) => {
        if (windowSize.width < 1024) {
            if (showQrCode) setShowQrCode(false);

            window.history.replaceState({ modal: 'smartphone-viewer' }, '', window.location.href);

            setSmartphoneDesktopModal(false);
            setSmartphoneMobileGallery(false);
            setSmartphoneMobileModal(true);
        }

        if (windowSize.width > 1024) {
            if (showQrCode) setShowQrCode(false);

            window.history.replaceState({ modal: 'smartphone-viewer' }, '', window.location.href);

            setSmartphoneMobileModal(false);
            setSmartphoneDesktopModal(true);
        }
    };

    useEffect(() => {
        if (viewablePost != '' && (isDesktopPostViewer || isMobilePostViewer)) {
            setPostViewerBasedOnWidth(windowSize);
        }

        if (viewableSmartphone != null && (smartphoneDesktopModal || smartphoneMobileModal)) {
            setSmartphoneViewerBasedOnWidth(windowSize);
        }
    }, [windowSize.width]);

    // Checking Post Slug In URL If Found Than Auto Opening Posts Desktop Modal
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

    // Checking Smartphone Slug In URL If Found Than Auto Opening Smartphone Desktop Modal
    useEffect(() => {
        if (!products || !isPostLoaded) return;

        const params = new URLSearchParams(window.location.search);
        const slug = params.get('m-slug');

        if (slug) {
            const smartphone = products.smartphones.find((smartphone) => smartphone.slug === slug);
            const index = products.smartphones.findIndex((smartphone) => smartphone.slug === slug);
            if (smartphone) {
                setViewableSmartphone(smartphone);
                setSmartphoneViewerBasedOnWidth(windowSize);
                setSelectedSmartphoneIndex(index);
            } else {
                fetchSingleSmartphone(slug);
                setSmartphoneViewerBasedOnWidth(windowSize);
            }
        }
    }, [isPostLoaded, posts]);

    // Post Refs
    const viewablePostRef = useRef('');
    const isMobilePostGalleryRef = useRef(false);
    const isDesktopPostViewerRef = useRef(false);
    const isMobilePostViewerRef = useRef(false);

    // Post Effects
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

    // Smartphone Refs
    const viewableSmartphoneRef = useRef(null);
    const smartphoneDesktopModalRef = useRef(null);
    const smartphoneMobileModalRef = useRef(null);

    // Smartphone Effects
    useEffect(() => {
        smartphoneDesktopModalRef.current = smartphoneDesktopModal;
    }, [smartphoneDesktopModal]);

    useEffect(() => {
        viewableSmartphoneRef.current = viewableSmartphone;
    }, [viewableSmartphone]);

    useEffect(() => {
        smartphoneMobileModalRef.current = smartphoneMobileModal;
    }, [smartphoneMobileModal]);

    // Tracking Sidebar Click
    const isSidebarClickActive = useSidebarClick();

    // Stopping Overflow Of Body When Modal is Open Also Preventing Inertia Navigation When Pressing browser Naviagtion buttons for Posts Viewer and gallery

    useEffect(() => {
        if (viewablePost !== '' || viewableSmartphone !== null) {
            document.body.classList.add('overflow-hidden');
        } else {
            document.body.classList.remove('overflow-hidden');
        }

        if (viewablePost !== '') {
            setSelectedMediaIndex(0);
        }

        return () => {
            document.body.classList.remove('overflow-hidden');
        };
    }, [viewablePost, viewableSmartphone]);

    useEffect(() => {
        const handlePopState = (e) => {
            console.log('🔙 POPSTATE EVENT TRIGGERED');
            const currentState = window.history.state;
            console.log('📍 Current state:', currentState);
            console.log('📍 Current URL:', window.location.href);

            if (viewablePostRef.current !== '') {
                if (isMobilePostGalleryRef.current) {
                    setIsMobilePostGallery(false);
                    if (currentState?.modal === 'post-gallery') {
                        window.history.replaceState(
                            { modal: 'post-viewer' },
                            '',
                            window.location.href,
                        );
                    }

                    return;
                }

                viewablePostRef.current = '';

                window.history.replaceState({}, '', window.location.pathname);
                setViewablePost('');
                setIsDesktopPostViewer(false);
                setIsMobilePostViewer(false);
                return;
            }

            if (viewableSmartphoneRef.current !== null) {
                console.log('📱 Handling SMARTPHONE closure');
                console.log(
                    '📱 viewableSmartphoneRef.current BEFORE:',
                    viewableSmartphoneRef.current,
                );

                if (smartphoneMobileGalleryRef.current) {
                    console.log('🖼️ Closing smartphone gallery only');
                    setSmartphoneMobileGallery(false);
                    if (currentState?.modal === 'smartphone-gallery') {
                        window.history.replaceState(
                            { modal: 'smartphone-viewer' },
                            '',
                            window.location.href,
                        );
                    }

                    return;
                }

                viewableSmartphoneRef.current = null;

                setViewableSmartphone(null);
                setSmartphoneDesktopModal(false);
                setSmartphoneMobileModal(false);

                return;
            }

            console.log('ℹ️ No modal to close');
        };

        const preventInertiaNavigation = (event) => {
            const pathname = event.detail?.visit?.url?.pathname || '';

            if (
                (viewablePostRef.current !== '' || viewableSmartphoneRef.current !== null) &&
                !isSidebarClickActive &&
                pathname === '/' &&
                !isMobilePostGalleryRef.current
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
    }, [isSidebarClickActive]);

    const fetchMorePostsAndProducts = async () => {
        if (!nextPageUrl || isfetchingMorePosts.current) return;

        try {
            const url = new URL(nextPageUrl);
            isfetchingMorePosts.current = true;

            const res = await axios.get(url);
            const data = await res.data;

            setPosts((prev) => {
                const ids = new Set(prev.map((p) => p.id));
                const newOnes = data.posts.filter((p) => !ids.has(p.id));
                return [...prev, ...newOnes];
            });

            setProducts((prev) => {
                const updated = { ...prev };
                const newProducts = data.products || {};

                Object.keys(newProducts).forEach((category) => {
                    const existing = prev[category] || [];
                    const existingIds = new Set(existing.map((item) => item.id));
                    const uniqueNewOnes = newProducts[category].filter(
                        (item) => !existingIds.has(item.id),
                    );
                    updated[category] = [...existing, ...uniqueNewOnes];
                });

                return updated;
            });

            setNextPageUrl(data.next_page_url);
        } catch (err) {
            setShowErrorMessage(true);
            setErrorMessage(err.message);
        } finally {
            isfetchingMorePosts.current = false;
        }
    };

    const fetchSinglePost = async (slug) => {
        try {
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

            const res = await axios.get(route('website.posts.getsingle', slug), {
                params: finalPreferences,
            });

            const data = await res.data;

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
                setShowInfoMessage(true);
                setInfoMessage('Post Not Found');
            }
        } catch (err) {
            setShowErrorMessage(true);
            setErrorMessage('Error fetching post');
        }
    };

    const fetchRelatedPosts = async (slug) => {
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

        const nextUrl = relatedNextUrlMap.current[slug] ?? `${route('website.posts.getrelated')}`;

        if (isFetchingRef.current || lastFetchedUrlRef.current[slug] === nextUrl || !slug) return;

        isFetchingRef.current = true;

        try {
            const res = await axios.get(nextUrl, {
                params: {
                    slug: slug,
                    ...finalPreferences,
                },
            });
            const data = res.data;

            if (data.status) {
                const newPosts = data.posts?.data || data.posts || [];
                const nextPage = data.posts?.next_page_url || null;

                setRelatedPostsMap((prev) => {
                    const existing = prev[slug] || [];
                    const filtered = newPosts.filter(
                        (p) => !existing.some((old) => old.id === p.id),
                    );
                    const merged = [...existing, ...filtered];

                    const updated = { ...prev, [slug]: [...merged] };
                    relatedPostsRef.current = updated;
                    return updated;
                });

                setRelatedNextMap((prev) => {
                    const updated = { ...prev, [slug]: nextPage };
                    relatedNextUrlMap.current = updated;
                    return updated;
                });

                lastFetchedUrlRef.current[slug] = nextUrl;

                if (!nextPage) completedSlugsRef.current[slug] = true;

                isFetchingRef.current = false;
            }
        } catch (err) {
            console.error(`[${slug}] ❌ Error fetching related posts`, err);

            setShowErrorMessage(true);
            setErrorMessage('Error fetching related posts');
        }
    };

    //  Fetch Single Smartphone Method
    const fetchSingleSmartphone = async (slug) => {
        try {
            if (!isPostLoaded || products.length < 1) {
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

            const res = await axios.get(route('website.products.get-single-smartphone', slug), {
                params: finalPreferences,
            });
            const data = await res.data;

            if (data.status) {
                setViewableSmartphone(data.smartphone);
                setSmartphoneViewerBasedOnWidth(windowSize);

                setProducts((prev) => {
                    const currentSmartphones = prev?.smartphones || [];

                    const exists = currentSmartphones.some((p) => p.id === data.smartphone.id);

                    let newSmartphones;
                    if (!exists) {
                        newSmartphones = [data.smartphone, ...currentSmartphones];
                    } else {
                        newSmartphones = currentSmartphones;
                    }

                    const idx = newSmartphones.findIndex((p) => p.id === data.smartphone.id);
                    if (idx !== -1) {
                        setSelectedSmartphoneIndex(idx);
                    }

                    return {
                        ...prev,
                        smartphones: newSmartphones,
                    };
                });
            } else {
                setShowInfoMessage(true);
                setInfoMessage('Smartphone Not Found');
            }
        } catch (err) {
            setShowErrorMessage(true);
            setErrorMessage(err.message);
        }
    };

    // Infinite Scroll Observer
    useEffect(() => {
        if (!loaderRef.current || !nextPageUrl) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !isfetchingMorePosts.current) {
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
        const handleResize = () => {
            setElipsisShowDropdown(false);
            setShowPostDesktopActionsDropdown(false);
        };
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

            const clickedDesktopPostActionsButton = e.target.closest('[data-post-actions-button]');
            const clickedDesktopPostActionsDropdown = e.target.closest(
                '[data-post-actions-dropdown]',
            );

            if (clickedDesktopPostActionsButton) {
                setShowPostDesktopActionsDropdown((prev) => !prev);
                return;
            }

            if (clickedDesktopPostActionsDropdown) {
                return;
            }

            setShowPostDesktopActionsDropdown(false);
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

    // Post Viewer Posts Handling Logic
    // Including Mobile And PC Post Mobile Viewer Handling Logic
    // Handle Touch Method's Y axis And HandleScroll and Handlewheel method are for Y axisPosts Scroll
    // handleTouch Method's X Axis  And HandleHorizontalScrollMethod is For X Axis Posts
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

        // Desktop scroll - Wheel Logic With Looping Effect Appending Logic
        // const handleWheel = (e) => {
        //     if (e.ctrlKey || e.metaKey) return;

        //     if (scrollLock.current) {
        //         e.preventDefault();
        //         return;
        //     }

        //     e.preventDefault();
        //     scrollLock.current = true;

        //     const direction = e.deltaY > 0 ? 1 : -1;

        //     const atTop = container.scrollTop <= 0;
        //     const atBottom = checkScrollReachedTarget(false);

        //     if (direction < 0 && atTop) {
        //         isLooping.current = true;

        //         const posts = Array.from(container.children);
        //         const lastPost = posts[posts.length - 1];

        //         container.prepend(lastPost);

        //         container.scrollTo({
        //             top: container.clientHeight,
        //             behavior: 'instant',
        //         });

        //         const postSlug = lastPost.getAttribute('data-post-slug');
        //         const post = postsRef.current.find((p) => p.slug === postSlug);

        //         if (post) {
        //             setSelectedPostIndex(postsRef.current.indexOf(post));
        //             setViewablePost(post);
        //             setRelatedPostSlug(post.slug);
        //             window.history.replaceState({}, '', generateURL(post));
        //         }

        //         requestAnimationFrame(() => {
        //             requestAnimationFrame(() => {
        //                 container.scrollTo({
        //                     top: 0,
        //                     behavior: 'smooth',
        //                 });
        //             });
        //         });

        //         setTimeout(() => {
        //             scrollLock.current = false;
        //             isLooping.current = false;
        //         }, 600);
        //     } else if (direction > 0 && atBottom) {
        //         isLooping.current = true;

        //         const posts = Array.from(container.children);
        //         const firstPost = posts[0];

        //         container.append(firstPost);

        //         container.scrollTo({
        //             top: container.scrollHeight - container.clientHeight * 2,
        //             behavior: 'instant',
        //         });

        //         const postSlug = firstPost.getAttribute('data-post-slug');
        //         const post = postsRef.current.find((p) => p.slug === postSlug);

        //         if (post) {
        //             setSelectedPostIndex(postsRef.current.indexOf(post));
        //             setViewablePost(post);
        //             setRelatedPostSlug(post.slug);
        //             window.history.replaceState({}, '', generateURL(post));
        //         }

        //         requestAnimationFrame(() => {
        //             requestAnimationFrame(() => {
        //                 container.scrollTo({
        //                     top: container.scrollHeight - container.clientHeight,
        //                     behavior: 'smooth',
        //                 });
        //             });
        //         });

        //         setTimeout(() => {
        //             scrollLock.current = false;
        //             isLooping.current = false;
        //         }, 600);
        //     } else {
        //         isLooping.current = false;

        //         const currentScrollTop = container.scrollTop;
        //         const currentDOMIndex = Math.round(currentScrollTop / container.clientHeight);
        //         const targetDOMIndex = currentDOMIndex + direction;

        //         container.scrollTo({
        //             top: targetDOMIndex * container.clientHeight,
        //             behavior: 'smooth',
        //         });

        //         const posts = Array.from(container.children);
        //         const targetPost = posts[targetDOMIndex];

        //         if (targetPost) {
        //             const postSlug = targetPost.getAttribute('data-post-slug');
        //             const post = postsRef.current.find((p) => p.slug === postSlug);

        //             if (post) {
        //                 const slug = post.slug;
        //                 const newPosts = post.related_posts || [];
        //                 const postIndex = postsRef.current.indexOf(post);

        //                 setSelectedPostIndex(postIndex);
        //                 setViewablePost(post);

        //                 setRelatedPostsMap((prev) => ({
        //                     ...prev,
        //                     [slug]: [
        //                         ...(prev[slug] || []),
        //                         ...newPosts.filter(
        //                             (p) => !(prev[slug] || []).some((old) => old.id === p.id),
        //                         ),
        //                     ],
        //                 }));

        //                 setRelatedPostSlug(slug);
        //                 window.history.replaceState({}, '', generateURL(post));

        //                 if (
        //                     postIndex >= postsRef.current.length - 5 &&
        //                     nextPageUrl &&
        //                     !fetchLock.current &&
        //                     lastFetchTriggerIndex.current !== postIndex
        //                 ) {
        //                     fetchLock.current = true;
        //                     lastFetchTriggerIndex.current = postIndex;

        //                     fetchMorePostsAndProducts().finally(() => {
        //                         fetchLock.current = false;
        //                     });
        //                 }
        //             }
        //         }

        //         setTimeout(() => {
        //             scrollLock.current = false;
        //         }, 100);
        //     }
        // };

        // Desktop scroll - Wheel
        const handleWheel = (e) => {
            if (e.ctrlKey || e.metaKey) return;
            e.preventDefault();
            e.stopPropagation();

            if (scrollLock.current) {
                return;
            }

            scrollLock.current = true;

            const direction = e.deltaY > 0 ? 1 : -1;

            const currentScrollTop = container.scrollTop;
            const currentDOMIndex = Math.round(currentScrollTop / container.clientHeight);
            let nextIndex = currentDOMIndex + direction;

            const atTop = container.scrollTop <= 0;
            const atBottom = checkScrollReachedTarget(false);
            handleStopVideoPlayer();
            if (direction < 0 && atTop) {
                nextIndex = postsRef.current.length - 1;
                isLooping.current = true;

                const next_post = postsRef.current[nextIndex];

                const cover = document.createElement('div');
                cover.className = 'absolute inset-0 z-[98] bg-deepcharcoal';
                container.appendChild(cover);

                const dummy = document.createElement('div');
                dummy.className = 'absolute inset-0 z-[99] pointer-events-none';
                dummy.style.background = next_post.post_image_urls?.[0]
                    ? `url(${next_post.post_image_urls[0]}) center/cover no-repeat`
                    : '#0D0E12';
                dummy.style.transform = 'translateY(100%)';
                dummy.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';

                container.appendChild(dummy);

                setTimeout(() => {
                    dummy.style.transform = 'translateY(0)';
                }, 10);

                setTimeout(() => {
                    container.scrollTo({
                        top: nextIndex * container.clientHeight,
                        behavior: 'instant',
                    });

                    const post = postsRef.current[nextIndex];

                    setSelectedPostIndex(nextIndex);
                    setViewablePost(post);
                    setRelatedPostSlug(post.slug);

                    requestAnimationFrame(() => {
                        container.removeChild(cover);
                        container.removeChild(dummy);

                        scrollLock.current = false;
                        isLooping.current = false;
                    });
                    window.history.replaceState({}, '', generateURL(post));
                }, 410);
            } else if (direction > 0 && atBottom) {
                nextIndex = 0;
                isLooping.current = true;

                const next_post = postsRef.current[0];

                const cover = document.createElement('div');
                cover.className = 'absolute inset-0 z-[98] bg-deepcharcoal';
                container.appendChild(cover);

                const dummy = document.createElement('div');
                dummy.className = 'absolute inset-0 z-[99] pointer-events-none';
                dummy.style.background = next_post.post_image_urls?.[0]
                    ? `url(${next_post.post_image_urls[0]}) center/cover no-repeat`
                    : '#0D0E12';
                dummy.style.transform = 'translateY(-100%)';
                dummy.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';

                container.appendChild(dummy);

                setTimeout(() => {
                    dummy.style.transform = 'translateY(0)';
                }, 10);

                setTimeout(() => {
                    container.scrollTo({
                        top: 0,
                        behavior: 'instant',
                    });

                    const post = postsRef.current[0];
                    setSelectedPostIndex(0);
                    setViewablePost(post);
                    setRelatedPostSlug(post.slug);

                    requestAnimationFrame(() => {
                        container.removeChild(cover);
                        container.removeChild(dummy);
                        scrollLock.current = false;
                        isLooping.current = false;
                    });
                    window.history.replaceState({}, '', generateURL(post));
                }, 410);
            } else {
                isLooping.current = false;
                nextIndex = Math.max(0, Math.min(postsRef.current.length - 1, nextIndex));

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

                container.scrollTo({
                    top: nextIndex * container.clientHeight,
                    behavior: 'smooth',
                });

                setTimeout(() => {
                    scrollLock.current = false;
                }, 100);

                if (
                    nextIndex >= postsRef.current.length - 5 &&
                    nextPageUrl &&
                    !fetchLock.current &&
                    lastFetchTriggerIndex.current !== nextIndex
                ) {
                    fetchLock.current = true;
                    lastFetchTriggerIndex.current = nextIndex;

                    fetchMorePostsAndProducts().finally(() => {
                        fetchLock.current = false;
                    });
                }
            }
        };

        // Mobile Touch Scroll
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

                fetchMorePostsAndProducts()
                    .catch(() => {})
                    .finally(() => {
                        fetchLock.current = false;
                    });
            }
        };

        // Mobile Touch Start Scroll + Swipe
        const handleTouchStart = (e) => {
            touchStartY.current = e.touches[0].clientY;
            touchStartX.current = e.touches[0].clientX;
            gestureLocked.current = null;

            handleStopVideoPlayer();
            const slug = relatedPostSlugRef.current;
            if (slug) {
                lastDirectionRef.current[slug] = null;
                isHorizontalLooping.current[slug] = false;
                horizontalScrollLock.current[slug] = false;
                lastHorizontalIndexRef.current[slug] = 0;
            }
        };

        // Mobile Touch Move Scroll + Swipe
        const handleTouchMove = (e) => {
            const slug = relatedPostSlugRef.current;

            if (isLooping.current || (slug && isHorizontalLooping.current[slug])) {
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

            if (gestureLocked.current === 'x') {
                const slug = relatedPostSlugRef.current;

                if (!slug) return;

                const relatedPosts = relatedPostsRef.current[slug] || [];

                const horizontalContainer = horizontalCarouselRefs.current[slug];

                if (!horizontalContainer) return;

                const containerWidth = horizontalContainer.clientWidth;
                const currentScrollLeft = horizontalContainer.scrollLeft;
                const maxScroll = horizontalContainer.scrollWidth - containerWidth;
                const totalItems = 1 + relatedPosts.length;
                const currentIndex = Math.round(currentScrollLeft / containerWidth);
                const nearStart = currentScrollLeft <= 5;
                const nearEnd = Math.abs(currentScrollLeft - maxScroll) <= 5;

                const lastIndex = lastHorizontalIndexRef.current[slug];
                if (lastIndex !== currentIndex) {
                    lastDirectionRef.current[slug] =
                        currentIndex > (lastIndex ?? 0) ? 'right' : 'left';
                    lastHorizontalIndexRef.current[slug] = currentIndex;
                }

                // --- LEFT LOOP: at start, swipe left-to-right ---
                if (
                    nearStart &&
                    currentIndex === 0 &&
                    deltaX > 60 && // real swipe threshold
                    !isHorizontalLooping.current[slug] &&
                    !horizontalScrollLock.current[slug]
                ) {
                    e.preventDefault();
                    isHorizontalLooping.current[slug] = true;
                    horizontalScrollLock.current[slug] = true;

                    horizontalContainer.style.touchAction = 'none';
                    horizontalContainer.style.pointerEvents = 'none';

                    const lastRelatedPost = relatedPosts[relatedPosts.length - 1];

                    const cover = document.createElement('div');
                    cover.className = 'absolute inset-0 z-[98] bg-deepcharcoal';
                    horizontalContainer.appendChild(cover);

                    const dummy = document.createElement('div');
                    dummy.className = 'absolute inset-0 z-[99] pointer-events-none';
                    dummy.style.background = lastRelatedPost?.post_image_urls?.[0]
                        ? `url(${lastRelatedPost.post_image_urls[0]}) center/cover no-repeat`
                        : '#0D0E12';
                    dummy.style.transform = 'translateX(-100%)';
                    dummy.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';

                    horizontalContainer.appendChild(dummy);

                    setTimeout(() => {
                        dummy.style.transform = 'translateX(0)';
                    }, 10);

                    setTimeout(() => {
                        const targetScroll = maxScroll;
                        horizontalContainer.scrollTo({ left: targetScroll, behavior: 'instant' });

                        const relatedPost = relatedPosts[relatedPosts.length - 1];
                        if (relatedPost?.id) {
                            setRelatedViewerMap((p) => ({ ...p, [slug]: relatedPost }));
                            setActiveViewerMap((p) => ({ ...p, [slug]: 'related' }));
                            setViewablePost(relatedPost);
                            window.history.pushState(
                                {},
                                '',
                                `${route('home')}${generateURL(relatedPost)}`,
                            );
                        }

                        horizontalContainer.removeChild(cover);
                        horizontalContainer.removeChild(dummy);

                        requestAnimationFrame(() => {
                            isHorizontalLooping.current[slug] = false;
                            horizontalScrollLock.current[slug] = false;

                            horizontalContainer.style.touchAction = 'auto';
                            horizontalContainer.style.pointerEvents = 'auto';
                        });
                    }, 410);
                    return;
                }

                // --- RIGHT LOOP: at end, swipe right-to-left ---
                if (
                    nearEnd &&
                    currentIndex === totalItems - 1 &&
                    deltaX < -60 &&
                    !isHorizontalLooping.current[slug] &&
                    !horizontalScrollLock.current[slug]
                ) {
                    e.preventDefault();
                    isHorizontalLooping.current[slug] = true;
                    horizontalScrollLock.current[slug] = true;

                    horizontalContainer.style.touchAction = 'none';
                    horizontalContainer.style.pointerEvents = 'none';

                    const cover = document.createElement('div');
                    cover.className = 'absolute inset-0 z-[98] bg-deepcharcoal';
                    container.appendChild(cover);

                    const dummy = document.createElement('div');
                    dummy.className = 'absolute inset-0 z-[99] pointer-events-none';
                    dummy.style.background = viewablePost?.post_image_urls?.[0] // Show MAIN post (destination)
                        ? `url(${viewablePost.post_image_urls[0]}) center/cover no-repeat`
                        : '#0D0E12';
                    dummy.style.transform = 'translateX(100%)'; // Start from RIGHT
                    dummy.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';

                    container.appendChild(dummy);

                    setTimeout(() => {
                        dummy.style.transform = 'translateX(0)'; // Slide to center
                    }, 10);

                    setTimeout(() => {
                        horizontalContainer.scrollTo({ left: 0, behavior: 'instant' });

                        setActiveViewerMap((p) => ({ ...p, [slug]: 'main' }));
                        setRelatedViewerMap((p) => ({ ...p, [slug]: null }));
                        setViewablePost(viewablePost);
                        window.history.replaceState(
                            {},
                            '',
                            `${route('home')}${generateURL(viewablePost)}`,
                        );

                        container.removeChild(cover);
                        container.removeChild(dummy);
                        requestAnimationFrame(() => {
                            isHorizontalLooping.current[slug] = false;
                            horizontalScrollLock.current[slug] = false;

                            horizontalContainer.style.touchAction = 'auto';
                            horizontalContainer.style.pointerEvents = 'auto';
                        });
                    }, 410);
                    return;
                }
            }

            if (gestureLocked.current === 'y') {
                Object.keys(isHorizontalLooping.current).forEach((key) => {
                    isHorizontalLooping.current[key] = false;
                    horizontalScrollLock.current[key] = false;
                });

                const scrollTop = container.scrollTop;
                const atTop = scrollTop <= 0;
                const atBottom =
                    Math.abs(scrollTop + container.clientHeight - container.scrollHeight) < 5;

                const slug = relatedPostSlugRef.current;
                const isInRelated = activeViewerMap[slug] === 'related';

                const parentPostIndex = postsRef.current.findIndex((p) => p.slug === slug);

                if (
                    atTop &&
                    deltaY > 30 &&
                    ((isInRelated && parentPostIndex === 0) ||
                        (!isInRelated && selectedPostIndex === 0))
                ) {
                    e.preventDefault();
                    scrollLock.current = true;
                    isLooping.current = true;

                    container.style.touchAction = 'none';
                    container.style.pointerEvents = 'none';

                    const newIndex = postsRef.current.length - 1;

                    const next_post = postsRef.current[newIndex];

                    const cover = document.createElement('div');
                    cover.className = 'absolute inset-0 z-[98] bg-deepcharcoal';
                    container.appendChild(cover);

                    const dummy = document.createElement('div');
                    dummy.className = 'absolute inset-0 z-[99] pointer-events-none';
                    dummy.style.background = next_post.post_image_urls?.[0]
                        ? `url(${next_post.post_image_urls[0]}) center/cover no-repeat`
                        : '#0D0E12';
                    dummy.style.transform = 'translateY(100%)';
                    dummy.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';

                    container.appendChild(dummy);

                    setTimeout(() => {
                        dummy.style.transform = 'translateY(0)';
                    }, 10);

                    setTimeout(() => {
                        container.scrollTo({
                            top: newIndex * container.clientHeight,
                            behavior: 'instant',
                        });

                        setSelectedPostIndex(newIndex);
                        setViewablePost(postsRef.current[newIndex]);
                        updateRelatedPostsMap(
                            postsRef.current[newIndex]?.slug,
                            postsRef.current[newIndex]?.related_posts,
                        );
                        setRelatedPostSlug(postsRef.current[newIndex].slug);

                        requestAnimationFrame(() => {
                            container.style.touchAction = 'auto';
                            container.style.pointerEvents = 'auto';

                            gestureLocked.current = null;
                            touchStartX.current = 0;
                            touchStartY.current = 0;
                            Object.keys(isHorizontalLooping.current).forEach(
                                (key) => (isHorizontalLooping.current[key] = false),
                            );
                            Object.keys(horizontalScrollLock.current).forEach(
                                (key) => (horizontalScrollLock.current[key] = false),
                            );

                            container.removeChild(cover);
                            container.removeChild(dummy);
                            scrollLock.current = false;
                            isLooping.current = false;
                        });
                    }, 400);

                    return;
                }

                if (
                    atBottom &&
                    deltaY < -30 &&
                    ((isInRelated && parentPostIndex === postsRef.current.length - 1) ||
                        (!isInRelated && selectedPostIndex === postsRef.current.length - 1))
                ) {
                    e.preventDefault();
                    scrollLock.current = true;
                    isLooping.current = true;

                    container.style.touchAction = 'none';
                    container.style.pointerEvents = 'none';

                    const next_post = postsRef.current[0];

                    const cover = document.createElement('div');
                    cover.className = 'absolute inset-0 z-[98] bg-deepcharcoal';
                    container.appendChild(cover);

                    const dummy = document.createElement('div');
                    dummy.className = 'absolute inset-0 z-[99] pointer-events-none';
                    dummy.style.background = next_post.post_image_urls?.[0]
                        ? `url(${next_post.post_image_urls[0]}) center/cover no-repeat`
                        : '#0D0E12';
                    dummy.style.transform = 'translateY(-100%)';
                    dummy.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';

                    container.appendChild(dummy);

                    setTimeout(() => {
                        dummy.style.transform = 'translateY(0)';
                    }, 10);

                    setTimeout(() => {
                        container.scrollTo({ top: 0, behavior: 'instant' });

                        setSelectedPostIndex(0);
                        setViewablePost(postsRef.current[0]);
                        updateRelatedPostsMap(
                            postsRef.current[0]?.slug,
                            postsRef.current[0]?.related_posts,
                        );
                        setRelatedPostSlug(postsRef.current[0].slug);

                        requestAnimationFrame(() => {
                            container.style.touchAction = 'auto';
                            container.style.pointerEvents = 'auto';

                            gestureLocked.current = null;
                            touchStartX.current = 0;
                            touchStartY.current = 0;
                            Object.keys(isHorizontalLooping.current).forEach(
                                (key) => (isHorizontalLooping.current[key] = false),
                            );
                            Object.keys(horizontalScrollLock.current).forEach(
                                (key) => (horizontalScrollLock.current[key] = false),
                            );
                            container.removeChild(cover);
                            container.removeChild(dummy);

                            scrollLock.current = false;
                            isLooping.current = false;
                        });
                    }, 400);

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
        const el = e.currentTarget;
        const slug = mainPost.slug;

        if (isHorizontalLooping.current[slug] || horizontalScrollLock.current[slug]) {
            return;
        }

        const relatedPosts = relatedPostsRef.current[slug] || [];
        const currentViewer = relatedViewMap.current[slug] || null;
        const nextPageUrl = relatedNextUrlMap.current[slug] || null;

        const index = Math.round(el.scrollLeft / el.clientWidth);
        const lastIndex = lastHorizontalIndexRef.current[slug] ?? 0;

        if (index === lastIndex) return;

        handleStopVideoPlayer();

        lastHorizontalIndexRef.current[slug] = index;

        if (index > 0) {
            const relatedPost = relatedPosts[index - 1];

            // GUARD: Check if relatedPost is a valid object
            if (!relatedPost || typeof relatedPost !== 'object' || !relatedPost.id) {
                // console.error(`Invalid related post at index ${index - 1}:`, relatedPost);
                // console.error(`Related posts array:`, relatedPosts);
                return;
            }

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

                fetchRelatedPosts(slug);
                return;
            }

            // Fetch's only ONCE per next page URL when near end
            if (
                remaining <= 5 &&
                nextPageUrl &&
                !isFetchingRef.current &&
                !completedSlugsRef.current[slug] &&
                !isHorizontalLooping.current[slug]
            ) {
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

    // Resetting Related Post Some Refs
    // useEffect(() => {
    //     const slug = relatedPostSlugRef.current;
    //     if (!slug) return;
    //     if (isHorizontalLooping.current[slug]) return;
    //     requestAnimationFrame(() => {
    //         console.log('Reset Related Post Some Refs');
    //         isHorizontalLooping.current[slug] = false;
    //         horizontalScrollLock.current[slug] = false;
    //         lastHorizontalIndexRef.current[slug] = 0;
    //         lastDirectionRef.current[slug] = null;
    //     });
    // }, [relatedPostSlug]);

    const getRelatedPosts = (slug) => relatedPostsMap[slug] || [];
    const getRelatedViewer = (slug) => relatedViewerMap[slug] || null;

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

    const PostGalleryMediaContainerRef = useRef(null);
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

    // Handle scroll/swipe to stop videos On Post Gallery
    const scrollTimeout = useRef(null);

    // Debounced scroll handler to prevent rapid state changes
    const handlePostGalleryMediaScroll = useCallback(
        (e) => {
            const container = e.target;

            // Clear previous timeout
            if (scrollTimeout.current) {
                clearTimeout(scrollTimeout.current);
            }

            requestAnimationFrame(() => {
                scrollTimeout.current = setTimeout(() => {
                    const scrollLeft = container.scrollLeft;
                    const itemWidth = container.offsetWidth;
                    const newIndex = Math.round(scrollLeft / itemWidth);

                    if (newIndex !== currentMediaIndex) {
                        // Stop all videos and reset their state
                        handleStopVideoPlayer();

                        // Update current index
                        setCurrentMediaIndex(newIndex);
                    }
                }, 150);
            });
        },
        [currentMediaIndex],
    );

    return (
        <MainLayout>
            <Head title="Home" />

            {(showErrorMessage || showInfoMessage) && (
                <Toast
                    flash={{
                        ...(showErrorMessage ? { error: ErrorMessage } : { info: InfoMessage }),
                    }}
                />
            )}

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
                    Please Wait While We Load Data...
                </div>
            )}

            {isPostLoaded && (
                <>
                    {/* Search Bar */}
                    {windowSize.width > 1024 && (
                        <div className="m-auto w-1/2">
                            <GlobalSearch
                                filters={false}
                                additional_filters={false}
                                google_map_api_key={google_map_api_key}
                                OnPostFilterChange={() => {
                                    window.history.replaceState({}, '', window.location.pathname);
                                    setViewablePost('');
                                    setIsDesktopPostViewer(false);
                                    setIsMobilePostViewer(false);
                                    setIsPostLoaded(false);
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
                        <div className="max-w-8xl mx-auto sm:px-6 lg:px-8">
                            {/* Compact Masonry */}
                            <div className="lg:columns:2 columns-1 gap-1 [column-fill:_balance] min-[300px]:columns-2 md:columns-2 lg:gap-2 xl:columns-4">
                                {posts.map((post, index) => {
                                    const url = generateURL(post);
                                    return (
                                        <article
                                            key={post?.id}
                                            className="group relative mb-1 cursor-pointer break-inside-avoid overflow-hidden rounded-none shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl lg:mb-2"
                                            style={{ animationDelay: `${index * 100}ms` }}
                                            onClick={() => {
                                                viewablePostRef.current = post;

                                                setViewablePost(post);
                                                updateRelatedPostsMap(
                                                    post?.slug,
                                                    post?.related_posts,
                                                );

                                                setPostViewerBasedOnWidth(windowSize);

                                                setSelectedPostIndex(index ?? 0);
                                                setSelectedMediaIndex(0);
                                                setRelatedPostSlug(post?.slug);
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
                                                        <span className="text-[6px] text-white drop-shadow-md sm:text-[7px] md:text-[8px] lg:text-xs">
                                                            {post?.tag}
                                                        </span>
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
                                                            setLinkCopied(true);
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
                                                                {post?.title.length > 25
                                                                    ? post?.title.slice(0, 25) +
                                                                      '...'
                                                                    : post?.title}
                                                            </span>
                                                            {/* <span className="flex items-center gap-1 text-white drop-shadow-md lg:gap-2">
                                                                {post?.location_name && (
                                                                    <span className="text-xs text-white/80">
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
                                                            </span> */}
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : !post?.images && post?.videos ? (
                                                <>
                                                    <div className="relative">
                                                        <VideoThumbnail
                                                            key={`${index}-${post?.post_video_urls[0]}`}
                                                            videoUrl={post?.post_video_urls[0]}
                                                            alt={post?.title}
                                                            className="w-full object-cover text-[10px] text-gray-700 transition-all duration-500 group-hover:scale-105 dark:text-white/80 dark:opacity-80"
                                                        />

                                                        {/* Title */}
                                                        <div className="absolute left-3 top-3">
                                                            <span className="text-[6px] text-white drop-shadow-md sm:text-[7px] md:text-[8px] lg:text-xs">
                                                                {post?.tag}
                                                            </span>
                                                        </div>

                                                        {/* Share Button */}
                                                        <button
                                                            className="absolute right-3 top-3 text-white opacity-80 drop-shadow-lg hover:opacity-100"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                const url =
                                                                    route('home') +
                                                                    generateURL(post);
                                                                navigator.clipboard.writeText(
                                                                    url.trim(),
                                                                );
                                                                setLinkCopied(true);
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
                                                                    {post?.title.length > 25
                                                                        ? post?.title.slice(0, 25) +
                                                                          '...'
                                                                        : post?.title}
                                                                </span>
                                                                {/* <span className="flex items-center gap-1 text-white drop-shadow-md lg:gap-2">
                                                                {post?.location_name && (
                                                                    <span className="text-xs text-white/80">
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
                                                            </span> */}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    {/* /* Text-only */}
                                                    <div className="relative flex flex-col justify-between bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 p-5 text-white dark:from-gray-500 dark:via-gray-600 dark:to-gray-800">
                                                        <div className="flex items-center justify-between">
                                                            <span className="border-b border-gray-200 text-[6px] text-white drop-shadow-md dark:border-gray-300 sm:text-[7px] md:text-[8px] lg:text-xs">
                                                                {post?.tag}
                                                            </span>
                                                            {/* Share Button */}
                                                            <button
                                                                className="text-white opacity-80 hover:opacity-100"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    const url =
                                                                        route('home') +
                                                                        generateURL(post);
                                                                    navigator.clipboard.writeText(
                                                                        url.trim(),
                                                                    );

                                                                    setLinkCopied(true);
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
                                                        </div>

                                                        <div>
                                                            <div className="mb-2"></div>

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
                                                                {post?.title.length > 20
                                                                    ? post?.title.slice(0, 20) +
                                                                      '...'
                                                                    : post?.title}
                                                            </span>
                                                            {/* <span className="flex items-center gap-1 text-white drop-shadow-md lg:gap-2">
                                                                {post?.location_name && (
                                                                    <span className="text-xs text-white/80">
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
                                                            </span> */}
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </article>
                                    );
                                })}

                                {products.smartphones?.map((smartphone, index) => {
                                    return (
                                        <article
                                            key={index}
                                            className="group relative mb-1 cursor-pointer break-inside-avoid overflow-hidden rounded-none shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                                            onClick={() => {
                                                viewableSmartphoneRef.current = smartphone;

                                                setViewableSmartphone(smartphone);
                                                setSelectedSmartphoneIndex(index);

                                                setSmartphoneViewerBasedOnWidth(windowSize);
                                            }}
                                        >
                                            <div className="relative">
                                                <img
                                                    src={smartphone.images?.[0]}
                                                    alt={smartphone.name}
                                                    loading="lazy"
                                                    className="w-full object-cover transition-all duration-500 group-hover:scale-105"
                                                />

                                                <div className="absolute left-3 top-3">
                                                    <span className="text-[6px] text-white drop-shadow-md sm:text-[7px] md:text-[8px] lg:text-xs">
                                                        {smartphone?.tag}
                                                    </span>
                                                </div>

                                                {/* Overlay */}
                                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                                                    <div className="mt-2 flex items-center justify-between text-[7px] font-bold text-gray-200 drop-shadow-sm sm:text-[7px] md:text-[8px] lg:text-xs">
                                                        <span className="text-white drop-shadow-md">
                                                            {smartphone.name.length > 20
                                                                ? smartphone.name.slice(0, 20) +
                                                                  '...'
                                                                : smartphone.name}{' '}
                                                            (
                                                            {smartphone.capacity.length > 10
                                                                ? smartphone.capacity.slice(0, 10) +
                                                                  '...'
                                                                : smartphone.capacity}
                                                            )
                                                        </span>

                                                        <span>
                                                            {smartphone.selling_info?.total_price
                                                                ? `${currency?.symbol} ${smartphone.selling_info.total_price}`
                                                                : ''}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>

                            {posts?.length === 0 &&
                                (Object.keys(products || {}).length === 0 ||
                                    Object.values(products).every((arr) => arr.length === 0)) && (
                                    <div className="flex items-center justify-center rounded-xl border border-gray-200 bg-white px-6 py-12 shadow-sm dark:border-gray-700 dark:bg-deepcharcoal">
                                        <div className="flex flex-col items-center gap-4">
                                            {/* Custom No Content SVG */}
                                            <div className="flex h-20 w-20 items-center justify-center">
                                                <svg
                                                    viewBox="0 0 120 120"
                                                    className="h-full w-full text-gray-400 dark:text-gray-500"
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
                        </div>
                    </div>

                    {/* Desktop Post View Modal */}
                    {viewablePost != '' &&
                        isDesktopPostViewer &&
                        createPortal(
                            <>
                                <div className="fixed inset-0 left-0 z-50 bg-white dark:bg-zinc-950 lg:left-20">
                                    <div className="mx-auto w-full lg:w-1/2">
                                        <GlobalSearch
                                            mainPage={true}
                                            search_history={search_history}
                                            additional_filters={false}
                                            filters={false}
                                        />
                                    </div>

                                    <div className="relative h-[calc(100vh-60px)] overflow-y-auto pb-24 scrollbar-none">
                                        <div className="flex min-h-full flex-col lg:flex-row">
                                            {((Array.isArray(viewablePost?.post_video_urls) &&
                                                viewablePost.post_video_urls.length > 0) ||
                                                (Array.isArray(viewablePost?.post_image_urls) &&
                                                    viewablePost.post_image_urls.length > 0)) && (
                                                <div className="w-full flex-shrink-0 p-2 lg:w-[45%] lg:p-4">
                                                    <div className="translate-y-3 transform transition-all duration-500 ease-in-out">
                                                        <PostMediaViewer
                                                            viewablePost={viewablePost}
                                                            selectedMediaIndex={selectedMediaIndex}
                                                            onSelectMediaIndex={
                                                                setSelectedMediaIndex
                                                            }
                                                            setMediaItems={setMediaItems}
                                                            mediaThumbRefs={mediaThumbRefs}
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {viewablePost && (
                                                <div
                                                    className={`w-full bg-transparent ${
                                                        (Array.isArray(
                                                            viewablePost?.post_video_urls,
                                                        ) &&
                                                            viewablePost.post_video_urls.length >
                                                                0) ||
                                                        (Array.isArray(
                                                            viewablePost?.post_image_urls,
                                                        ) &&
                                                            viewablePost.post_image_urls.length > 0)
                                                            ? 'lg:w-1/2'
                                                            : 'lg:w-full'
                                                    }`}
                                                >
                                                    {((!viewablePost?.post_video_urls?.length &&
                                                        !viewablePost?.post_image_urls?.length) ||
                                                        windowSize.width > 1024) && (
                                                        <div className="mx-auto w-full space-y-4 p-4 md:px-10 lg:pl-6 lg:pr-10">
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-lg font-medium dark:text-white/80">
                                                                    <div>
                                                                        {viewablePost?.tag && (
                                                                            <button
                                                                                onClick={() => {
                                                                                    navigateToHashtag(
                                                                                        viewablePost?.tag,
                                                                                    );
                                                                                }}
                                                                            >
                                                                                {viewablePost?.tag}
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </span>

                                                                <div
                                                                    className="relative"
                                                                    ref={
                                                                        postDesktopViewerActionDropdownRef
                                                                    }
                                                                >
                                                                    <button
                                                                        data-post-actions-button
                                                                    >
                                                                        <svg
                                                                            xmlns="http://www.w3.org/2000/svg"
                                                                            fill="none"
                                                                            viewBox="0 0 24 24"
                                                                            strokeWidth={1.5}
                                                                            stroke="currentColor"
                                                                            className="size-5 hover:text-black/80 dark:text-white/80 dark:hover:text-white sm:size-4 md:size-5 lg:size-8"
                                                                        >
                                                                            <path
                                                                                strokeLinecap="round"
                                                                                strokeLinejoin="round"
                                                                                d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                                                                            />
                                                                        </svg>
                                                                    </button>
                                                                    {showPostDesktopActionsDropdown && (
                                                                        <div
                                                                            data-post-actions-dropdown
                                                                            className="absolute right-0 top-full z-50 mt-2 w-48 rounded-lg border border-gray-200 bg-white shadow-lg dark:border-zinc-800 dark:bg-deepcharcoal"
                                                                        >
                                                                            <div className="py-1">
                                                                                <button
                                                                                    onClick={() => {
                                                                                        setShowQrCode(
                                                                                            true,
                                                                                        );
                                                                                        setShowPostDesktopActionsDropdown(
                                                                                            false,
                                                                                        );
                                                                                    }}
                                                                                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-zinc-800"
                                                                                >
                                                                                    <svg
                                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                                        fill="none"
                                                                                        viewBox="0 0 24 24"
                                                                                        strokeWidth={
                                                                                            1.5
                                                                                        }
                                                                                        stroke="currentColor"
                                                                                        className="size-5"
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
                                                                                    <span>
                                                                                        QR Code
                                                                                    </span>
                                                                                </button>

                                                                                {auth?.user && (
                                                                                    <button
                                                                                        onClick={(
                                                                                            e,
                                                                                        ) => {
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
                                                                                                            setShowPostDesktopActionsDropdown(
                                                                                                                false,
                                                                                                            );
                                                                                                            setBookmarkStatusChanged(
                                                                                                                true,
                                                                                                            );
                                                                                                        },
                                                                                                    onError:
                                                                                                        (
                                                                                                            e,
                                                                                                        ) => {
                                                                                                            setShowErrorMessage(
                                                                                                                true,
                                                                                                            );
                                                                                                            setErrorMessage(
                                                                                                                e.message,
                                                                                                            );
                                                                                                        },
                                                                                                },
                                                                                            );
                                                                                        }}
                                                                                        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-zinc-800"
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
                                                                                            strokeWidth={
                                                                                                1.5
                                                                                            }
                                                                                            viewBox="0 0 24 24"
                                                                                            className="size-5"
                                                                                        >
                                                                                            <path
                                                                                                strokeLinecap="round"
                                                                                                strokeLinejoin="round"
                                                                                                d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z"
                                                                                            />
                                                                                        </svg>
                                                                                        <span>
                                                                                            {viewablePost?.is_bookmarked
                                                                                                ? 'Remove Bookmark'
                                                                                                : 'Bookmark'}
                                                                                        </span>
                                                                                    </button>
                                                                                )}

                                                                                <button
                                                                                    onClick={(
                                                                                        e,
                                                                                    ) => {
                                                                                        const url =
                                                                                            route(
                                                                                                'home',
                                                                                            ) +
                                                                                            generateURL(
                                                                                                viewablePost,
                                                                                            );
                                                                                        navigator.clipboard.writeText(
                                                                                            url.trim(),
                                                                                        );
                                                                                        setLinkCopied(
                                                                                            true,
                                                                                        );
                                                                                        setShowPostDesktopActionsDropdown(
                                                                                            false,
                                                                                        );
                                                                                    }}
                                                                                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-zinc-800"
                                                                                >
                                                                                    <svg
                                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                                        fill="none"
                                                                                        viewBox="0 0 24 24"
                                                                                        strokeWidth={
                                                                                            1.5
                                                                                        }
                                                                                        stroke="currentColor"
                                                                                        className="size-5"
                                                                                    >
                                                                                        <path
                                                                                            strokeLinecap="round"
                                                                                            strokeLinejoin="round"
                                                                                            d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0 1 18 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3 1.5 1.5 3-3.75"
                                                                                        />
                                                                                    </svg>
                                                                                    <span>
                                                                                        Copy Link
                                                                                    </span>
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <div
                                                                className="prose max-h-none min-h-[400px] max-w-[90vw] break-words text-[15px] text-gray-800 dark:prose-invert dark:text-white/80 sm:text-[16px] md:text-[17px] lg:max-w-none lg:text-[20px]"
                                                                dangerouslySetInnerHTML={{
                                                                    __html: viewablePost?.content,
                                                                }}
                                                            />

                                                            <div className="text-md my-2 flex flex-wrap gap-2 text-gray-700 dark:text-white/80">
                                                                <span className="flex items-center gap-2 rounded-full bg-gray-200 p-2 dark:bg-gray-900">
                                                                    <svg
                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                        fill="none"
                                                                        viewBox="0 0 24 24"
                                                                        strokeWidth={1.5}
                                                                        stroke="currentColor"
                                                                        className="size-5"
                                                                    >
                                                                        <path
                                                                            strokeLinecap="round"
                                                                            strokeLinejoin="round"
                                                                            d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                                                                        />
                                                                    </svg>
                                                                    <span>
                                                                        {viewablePost?.user?.name
                                                                            .length > 15
                                                                            ? viewablePost?.user?.name.substring(
                                                                                  0,
                                                                                  15,
                                                                              ) + '...'
                                                                            : viewablePost?.user
                                                                                  ?.name ||
                                                                              'Unknown User'}
                                                                    </span>
                                                                </span>
                                                            </div>

                                                            <div className="h-32"></div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </>,
                            document.getElementById('modal-root') || document.body,
                        )}

                    {/* Mobile Post View */}
                    {viewablePost !== '' &&
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

                                                                                                                    setBookmarkStatusChanged(
                                                                                                                        true,
                                                                                                                    );
                                                                                                                },
                                                                                                            onError:
                                                                                                                (
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

                                                                                                setLinkCopied(
                                                                                                    true,
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

                                                                                                                        setBookmarkStatusChanged(
                                                                                                                            true,
                                                                                                                        );
                                                                                                                    },
                                                                                                                onError:
                                                                                                                    (
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

                                                                                                    setLinkCopied(
                                                                                                        true,
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
                                                                            videoUrl={
                                                                                post
                                                                                    .post_video_urls[0]
                                                                            }
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
                                                                                className="absolute inset-0 bottom-20 z-10 h-full w-full object-cover"
                                                                            />
                                                                        ) : (
                                                                            Array.isArray(
                                                                                related.post_video_urls,
                                                                            ) &&
                                                                            related.post_video_urls
                                                                                .length > 0 && (
                                                                                <VideoWithThumbnail
                                                                                    videoUrl={
                                                                                        related
                                                                                            .post_video_urls[0]
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
                            document.getElementById('modal-root') || document.body,
                        )}

                    {/* Mobile Post Gallery */}
                    {isMobilePostGallery &&
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
                                                                            post_id:
                                                                                viewablePost?.id,
                                                                        },
                                                                        {
                                                                            onSuccess: () => {
                                                                                viewablePost.is_bookmarked =
                                                                                    !viewablePost.is_bookmarked;

                                                                                setBookmarkStatusChanged(
                                                                                    true,
                                                                                );
                                                                            },
                                                                            onError: (e) => {
                                                                                setShowErrorMessage(
                                                                                    true,
                                                                                );
                                                                                setErrorMessage(
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
                            document.getElementById('modal-root') || document.body,
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
                                                includemargin="true"
                                                bgColor="#ffffff"
                                                fgColor="#000000"
                                            />
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
                            viewablePost={viewablePost}
                        />
                    )}

                    {/* Smartphone Desktop Modal */}
                    {smartphoneDesktopModal && viewableSmartphone != null && (
                        <SmartphoneDesktopModal
                            smartphoneDesktopModal={smartphoneDesktopModal}
                            setSmartphoneDesktopModal={setSmartphoneDesktopModal}
                            smartphone={viewableSmartphone}
                            setSmartphone={setViewableSmartphone}
                            searchHistory={search_history}
                        />
                    )}

                    {smartphoneMobileModal && viewableSmartphone != null && (
                        <SmartphoneMobileModal
                            smartphoneMobileModalOpen={smartphoneMobileModal}
                            setSmartphoneMobileModalOpen={setSmartphoneMobileModal}
                            smartphone={viewableSmartphone}
                            setSmartphone={setViewableSmartphone}
                            selectedSmartphoneIndex={selectedSmartphoneIndex}
                            setSelectedSmartphoneIndex={setSelectedSmartphoneIndex}
                            smartphones={products?.smartphones || []}
                            hasMoreSmartphones={hasMoreSmartphones}
                            fetchMorePostsAndProducts={fetchMorePostsAndProducts}
                            smartphoneMobileGallery={smartphoneMobileGallery}
                            setSmartphoneMobileGallery={setSmartphoneMobileGallery}
                            viewableSmartphoneRef={viewableSmartphoneRef}
                            viewableSmartphoneRefValue={viewableSmartphoneRef.current}
                        />
                    )}
                </>
            )}
        </MainLayout>
    );
}
