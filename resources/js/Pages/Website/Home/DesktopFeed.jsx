import React, { useEffect, useMemo, useRef, useState } from 'react';
import { router } from '@inertiajs/react';
import useDarkMode from '@/Hooks/useDarkMode';
import Spinner from '@/Components/Spinner';
import { AnimatePresence, motion } from 'framer-motion';
import SmartphoneDetails from '@/Components/SmartphoneDetails';
import SmartphoneContentAccordion from '@/Components/SmartphoneContentAccordion';
import ProductSelectInput from '@/Components/ProductSelectInput';
import { useVideoStore } from '@/Hooks/useVideoStore';
import { useFeedCleanupStore } from '@/Hooks/useFeedCleanupStore';
import CustomizedVideoPlayer from '@/Components/CustomizedVideoPlayer';
import SpatiotemporalInfoModal from '@/Components/SpatiotemporalInfoModal';
import SmartphoneDetailsAccordion from '@/Components/SmartphoneDetailsAccordion';
import axios from 'axios';
import DisplayPrice from '@/Components/DisplayPrice';
import useProductCardHydration from '@/Hooks/useProductCardHydration';

const DesktopFeed = ({
    feedGallery,
    setShowQrCode,
    setShowErrorMessage,
    setLinkCopied,
    setBookmarkStatusChanged,
    setErrorMessage,
    mediaItems,
    setMediaItems,
    auth,
    generateURL,
    navigateToHashtag,
    Placeholder,
    setFeedGallery,
    setFeedOpen,
    currency,
    setInfoMessage,
    setShowInfoMessage,
    feedIndex,
    feed,
    relatedFeed,
    relatedFeedNextUrlsRef,
    nextPageUrl,
    isfetchingMoreYAxisFeed,
    fetchMoreYAxis,
    fetchRelatedFeed,
    generateSmartphoneURL,
    isSinglePageRef,
    setSpatiotemporalInfoModal,
    spatiotemporalInfoModal,
    previous_url,
    __,
}) => {
    const isDarkMode = useDarkMode();
    const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
    const [showPostDesktopActionsDropdown, setShowPostDesktopActionsDropdown] = useState(false);

    const [currentFeedIndex, setCurrentFeedIndex] = useState(feedIndex || 0);

    const mediaThumbRefs = useRef([]);
    const loadedCache = useRef(new Set());
    const currentFeedIndexRef = useRef(feedIndex || 0);
    const [feedItems, setFeedItems] = useState(feed || []);
    const relatedFeedRef = useRef(relatedFeed || {});
    const viewableFeedRef = useRef([]);
    const viewableFeedRefIndex = useRef(0);
    const productRightPanelScrollRef = useRef(null);
    const shouldCleanupBrowserHistoryRef = useRef(true);

    // Declared here (before postContentRef hooks) so isText is available for the hydration key
    const [isText, setIsText] = useState(false);
    useEffect(() => {
        setIsText(mediaItems?.length === 0);
    }, [mediaItems]);

    const postContentRef1 = useRef(null);
    const postContentRef2 = useRef(null);
    const postContentRef3 = useRef(null);
    // isText in key ensures re-hydration after the text-only rendering branch switches
    const _postHydrationKey = `${feedGallery?.id || feedGallery?.slug}-${isText ? 't' : 'f'}`;
    const productCardPortals1 = useProductCardHydration(postContentRef1, _postHydrationKey);
    const productCardPortals2 = useProductCardHydration(postContentRef2, _postHydrationKey);
    const productCardPortals3 = useProductCardHydration(postContentRef3, _postHydrationKey);

    // Zutsand Video AutoPlay State
    const videoAutoplay = useVideoStore((state) => state.autoplay);
    const initAutoplay = useVideoStore((state) => state.initAutoplay);
    const setActiveVideo = useVideoStore((state) => state.setActiveVideo);

    useEffect(() => {
        // only trigger after feedGallery is stable
        const timeoutId = setTimeout(() => {
            if (!feedGallery) {
                setActiveVideo(null);
                return;
            }

            // Only set active if current item is a video post
            if (feedGallery.type === 'posts' && feedGallery.post_video_urls?.length > 0) {
                setActiveVideo(feedGallery.slug);
            } else {
                setActiveVideo(null);
            }
        }, 200);

        // Cleanup timeout if feedGallery changes again quickly
        return () => clearTimeout(timeoutId);
    }, [feedGallery, setActiveVideo]);

    useEffect(() => {
        initAutoplay();
    }, []);

    const [arrowStates, setArrowStates] = useState({
        isLeftDisabled: true,
        isRightDisabled: false,
        isTopDisabled: true,
        isBottomDisabled: false,
    });

    const updateArrowStates = () => {
        setArrowStates({
            isLeftDisabled: viewableFeedRef.current.length === 1,
            isRightDisabled: viewableFeedRef.current.length === 1,
            isTopDisabled: feedItems.length === 1,
            isBottomDisabled: feedItems.length === 1,
        });
    };

    // Navigation functions
    const handleTopPrevious = () => {
        if (currentFeedIndex > 0) {
            const newIndex = currentFeedIndex - 1;
            setCurrentFeedIndex(newIndex);
            setSelectedMediaIndex(0);
        } else {
            const newIndex = feedItems.length - 1;
            setCurrentFeedIndex(newIndex);
            setSelectedMediaIndex(0);
        }
    };

    const handleBottomNext = () => {
        const totalItems = feedItems.length;

        if (totalItems === 0) return;

        let newIndex;

        if (currentFeedIndex < totalItems - 1) {
            newIndex = currentFeedIndex + 1;
        } else {
            newIndex = 0;
        }

        setCurrentFeedIndex(newIndex);
        setSelectedMediaIndex(0);

        // Fetching More
        const remainingItems = feedItems.length - 1 - newIndex;
        if (remainingItems <= 5 && nextPageUrl && !isfetchingMoreYAxisFeed) {
            fetchMoreYAxis();
        }
    };

    const handleLeftPrevious = () => {
        const totalItems = viewableFeedRef.current.length;

        if (totalItems === 0) return;

        if (viewableFeedRefIndex.current > 0) {
            viewableFeedRefIndex.current -= 1;
        } else {
            viewableFeedRefIndex.current = totalItems - 1;
        }

        const currentItem = viewableFeedRef.current[viewableFeedRefIndex.current];
        setFeedGallery(currentItem);
        setSelectedMediaIndex(0);

        // Update URL
        if (currentItem?.type === 'posts') {
            const url = route('home') + generateURL(currentItem);
            window.history.replaceState({}, '', url);
        } else if (currentItem?.type === 'smartphones') {
            const url = route('home') + generateSmartphoneURL(currentItem);
            window.history.replaceState({}, '', url);
        }

        updateArrowStates();
    };

    const handleRightNext = () => {
        const totalItems = viewableFeedRef.current.length;

        if (totalItems === 0) return;

        // Increment index, circular logic
        if (viewableFeedRefIndex.current < totalItems - 1) {
            viewableFeedRefIndex.current += 1;
        } else {
            viewableFeedRefIndex.current = 0;
        }
        const currentItem = viewableFeedRef.current[viewableFeedRefIndex.current];
        setFeedGallery(currentItem);
        setSelectedMediaIndex(0);

        // Update URL
        if (currentItem?.type === 'posts') {
            const url = route('home') + generateURL(currentItem);
            window.history.replaceState({}, '', url);
        } else if (currentItem?.type === 'smartphones') {
            const url = route('home') + generateSmartphoneURL(currentItem);
            window.history.replaceState({}, '', url);
        }

        const parentItem = viewableFeedRef.current[0];
        const parentSlug = parentItem.slug;

        const remainingItems = viewableFeedRef.current.length - 1 - viewableFeedRefIndex.current;

        if (remainingItems <= 4) {
            const nextUrls = relatedFeedNextUrlsRef.current || {};

            const doesNotExist = !nextUrls.hasOwnProperty(parentSlug);
            const existsButNull =
                nextUrls.hasOwnProperty(parentSlug) && nextUrls[parentSlug] === null;
            const existsAndNotNull =
                nextUrls.hasOwnProperty(parentSlug) && nextUrls[parentSlug] !== null;

            if (doesNotExist || existsAndNotNull) {
                // console.log('Fetching more related items for:', parentSlug);
                fetchRelatedFeed(parentSlug);
            } else if (existsButNull) {
                // console.log('No more related items available for:', parentSlug);
            }
        }
        updateArrowStates();
    };

    // Syncing Related Feeds When Related Feed Changes
    useEffect(() => {
        relatedFeedRef.current = relatedFeed;
    }, [relatedFeed]);

    // Keyboard navigation support
    useEffect(() => {
        if (!feedGallery) return;

        const handleKeyDown = (e) => {
            if (spatiotemporalInfoModal) return;
            switch (e.key) {
                case 'ArrowUp':
                    e.preventDefault();
                    handleTopPrevious();
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    handleBottomNext();
                    break;

                case 'ArrowLeft':
                    e.preventDefault();
                    handleLeftPrevious();
                    break;

                case 'ArrowRight':
                    e.preventDefault();
                    handleRightNext();
                    break;
                case 'Escape':
                    setFeedGallery(null);
                    setFeedOpen(false);
                    window.history.replaceState({}, '', '/');
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [feedGallery, currentFeedIndex, feedItems, spatiotemporalInfoModal]);

    // updating the viewable Feed Object when Current Feed Index changes
    useEffect(() => {
        const feedItem = feedItems[currentFeedIndex];

        viewableFeedRef.current = [feedItem, ...(relatedFeedRef.current[feedItem.slug] || [])];

        viewableFeedRefIndex.current = 0;

        setFeedGallery(feedItem);

        // Update URL based on item type Of Main Feed
        if (feedItem?.type === 'posts') {
            const url = route('home') + generateURL(feedItem);
            window.history.replaceState({}, '', url);
        } else if (feedItem?.type === 'smartphones') {
            const url = route('home') + generateSmartphoneURL(feedItem);
            window.history.replaceState({}, '', url);
        }

        updateArrowStates();

        // Update The CurrentFeedIndexRef When CurrentFeedIndex State Changes
        currentFeedIndexRef.current = currentFeedIndex;
    }, [currentFeedIndex]);

    //  update viewableFeedRef when relatedFeed changes (X-axis fetch)
    useEffect(() => {
        const feedItem = feedItems[currentFeedIndexRef.current || 0];

        if (!feedItem) return;

        const currentRelatedItems = relatedFeedRef.current[feedItem.slug] || [];

        viewableFeedRef.current = [feedItem, ...currentRelatedItems];

        updateArrowStates();
    }, [relatedFeed]);

    // Update feedItems when feed prop changes
    useEffect(() => {
        if (feed && feed.length > 0) {
            setFeedItems((prevItems) => {
                const existingSlugs = new Set(prevItems.map((item) => item.slug));

                const newItems = feed.filter((item) => !existingSlugs.has(item.slug));

                if (newItems.length === 0) {
                    return prevItems;
                }

                return [...prevItems, ...newItems];
            });
        }
    }, [feed]);

    // Checking Outside Click Of Elipsis Dropdown
    useEffect(() => {
        const handleResize = () => {
            setShowPostDesktopActionsDropdown(false);
        };
        const handleClickOutside = (e) => {
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

    const [direction, setDirection] = useState(0);

    useEffect(() => {
        setDirection(1);

        document.querySelectorAll('video').forEach((v) => {
            v.pause();
        });
    }, [selectedMediaIndex]);

    const MediaRef = useRef(null);
    const MediaThumbRef = useRef(null);

    const getDesktopThumbCount = () => {
        const w = window.innerWidth;

        if (w >= 1600) return 6;
        if (w >= 1400) return 5;
        if (w >= 1200) return 4;
        if (w >= 1024) return 3;

        return 3;
    };

    const [MAX_THUMBS, setMaxThumbs] = useState(getDesktopThumbCount());
    const [thumbPage, setThumbPage] = useState(0);
    useEffect(() => {
        const onResize = () => {
            setMaxThumbs(getDesktopThumbCount());
        };

        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    useEffect(() => {
        setThumbPage(0);
    }, [MAX_THUMBS]);

    useEffect(() => {
        const newPage = Math.floor(selectedMediaIndex / MAX_THUMBS);

        if (newPage !== thumbPage) {
            setThumbPage(newPage);
        }
    }, [selectedMediaIndex, MAX_THUMBS]);

    const startIndex = thumbPage * MAX_THUMBS;
    const endIndex = startIndex + MAX_THUMBS;

    const visibleThumbs = mediaItems.slice(startIndex, endIndex);

    const canGoNext = endIndex < mediaItems.length;
    const canGoPrev = thumbPage > 0;

    // Mouse wheel navigation For Media
    useEffect(() => {
        const mediaEl = MediaRef.current;
        const mediaThumbEl = MediaThumbRef.current;
        if (!mediaEl || !mediaThumbEl || isText) return;

        const handleWheel = (event) => {
            if (event.ctrlKey || event.metaKey || !event.cancelable) return;
            event.preventDefault();
            if (event.deltaY < 0) {
                setSelectedMediaIndex((prev) => (prev === 0 ? 0 : prev - 1));
            } else {
                setSelectedMediaIndex((prev) => (prev === mediaItems.length - 1 ? prev : prev + 1));
            }
        };

        mediaEl.addEventListener('wheel', handleWheel, { passive: false });
        mediaThumbEl.addEventListener('wheel', handleWheel, { passive: false });

        return () => {
            mediaEl.removeEventListener('wheel', handleWheel);
            mediaThumbEl.removeEventListener('wheel', handleWheel);
        };
    }, [mediaItems.length, isText]);

    //  (--------------------------------------------------------------------------------------)
    // Smartphone Logic
    const [selectedColor, setSelectedColor] = useState('');
    const [selectedAddon, setSelectedAddon] = useState('');
    const [toggleAccordion, setToggleAccordion] = useState(false);
    const [smartphoneTotalPrice, setSmartphoneTotalPrice] = useState({});

    // Its Just For Initial Check When Smartphone Feed Loads
    const smartphoneCartItemsRef = useRef([]);
    const [cartItemAddons, setCartItemAddons] = useState([]);
    const [cartItemSmartphones, setCartItemSmartphones] = useState([]);

    const smartphoneDesktopViewerActionDropdownRef = useRef(null);
    const [showSmartphoneDesktopActionsDropdown, setShowSmartphoneDesktopActionsDropdown] =
        useState(false);

    const [cartProcessing, setCartProcessing] = useState(false);
    const [buyNowProcessing, setBuyNowProcessing] = useState(false);
    const [canActionOnSmartphone, setCanActionOnSmartphone] = useState(false);

    // Checking Stock (Not Needed RN)
    // const [isInStock, setIsInStock] = useState(feedGallery?.inventory_items_count > 0);

    useEffect(() => {
        if (!feedGallery || feedGallery.type !== 'smartphones') return;

        const handleResize = () => {
            setShowSmartphoneDesktopActionsDropdown(false);
        };
        const handleClickOutside = (e) => {
            const clickedDesktopSmartphoneActionsButton = e.target.closest(
                '[data-smartphone-actions-button]',
            );
            const clickedDesktopSmartphoneActionsDropdown = e.target.closest(
                '[data-smartphone-actions-dropdown]',
            );

            if (clickedDesktopSmartphoneActionsButton) {
                setShowSmartphoneDesktopActionsDropdown((prev) => !prev);
                return;
            }

            if (clickedDesktopSmartphoneActionsDropdown) {
                return;
            }

            setShowSmartphoneDesktopActionsDropdown(false);
        };
        window.addEventListener('resize', handleResize);
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            window.removeEventListener('resize', handleResize);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [feedGallery]);

    // Cart Item Create Logic Of Frontend

    // on feedGallery Change selecting Color For Smartphone
    useEffect(() => {
        if (!feedGallery || feedGallery.type !== 'smartphones') return;
        const timer = setTimeout(() => {
            if (
                smartphoneCartItemsRef.current.filter((a) => a.smartphone_id === feedGallery.id)
                    .length === 0 &&
                cartItemSmartphones.filter((a) => a.smartphone_id === feedGallery.id).length === 0
            ) {
                setSelectedColor(feedGallery.colors[0].id);
            }
        }, 0);

        return () => {
            clearTimeout(timer);
        };
    }, [feedGallery]);

    // Smartphone Handling
    useEffect(() => {
        if (!feedGallery || feedGallery.type !== 'smartphones') return;
        if (!selectedColor) return;

        const color = feedGallery.colors?.find((c) => c.id === selectedColor);

        if (!color) return;

        setCartItemSmartphones((prev) => {
            const existingIndex = prev.findIndex(
                (item) => item.smartphone_id === feedGallery.id && item.color_id === color.id,
            );

            if (existingIndex !== -1) {
                const updated = [...prev];

                const unitPrice = Number(feedGallery.selling_info?.total_price || 0);
                const previousTotal = Number(updated[existingIndex].price || 0);

                const newTotal = previousTotal + unitPrice;

                updated[existingIndex] = {
                    ...updated[existingIndex],
                    quantity: updated[existingIndex].quantity + 1,
                    price: parseFloat(Number(newTotal)).toFixed(2),
                };

                return updated;
            }

            return [
                ...prev,
                {
                    smartphone_id: feedGallery.id,
                    name: feedGallery.name,
                    color_id: color.id,
                    color_name: color.name,
                    capacity: feedGallery.capacity || null,
                    price: parseFloat(Number(feedGallery.selling_info?.total_price || 0)).toFixed(
                        2,
                    ),
                    unit_price: Number(feedGallery.selling_info?.total_price || 0),
                    quantity: 1,
                },
            ];
        });

        const timer = setTimeout(() => {
            setSelectedColor('');
        }, 100);

        return () => clearTimeout(timer);
    }, [selectedColor]);

    // Addon handling
    useEffect(() => {
        if (!feedGallery || feedGallery.type !== 'smartphones') return;
        if (!selectedAddon) return;

        if (
            cartItemSmartphones?.filter((item) => item.smartphone_id === feedGallery.id).length ===
            0
        ) {
            setSelectedAddon('');
            setInfoMessage(__('Please select any Product First'));
            setShowInfoMessage(true);
            return;
        }

        const addon = feedGallery.addons.find((a) => a.id === selectedAddon);

        if (!addon) return;

        setCartItemAddons((prev) => {
            const existingIndex = prev.findIndex(
                (a) => a.id === selectedAddon && a.smartphone_id === feedGallery.id,
            );

            if (existingIndex !== -1) {
                const updated = [...prev];

                const unitPrice = Number(addon.price || 0);
                const previousTotal = Number(updated[existingIndex].price || 0);

                const newQty = updated[existingIndex].quantity + 1;

                updated[existingIndex] = {
                    ...updated[existingIndex],
                    quantity: newQty,
                    price: parseFloat(Number(updated[existingIndex].price) + unitPrice).toFixed(2),
                };

                return updated;
            }

            return [
                ...prev,
                {
                    id: addon.id,
                    name: addon.name,
                    price: parseFloat(Number(addon.price || 0)).toFixed(2),
                    unit_price: Number(addon.price || 0),
                    quantity: 1,
                    smartphone_id: feedGallery.id,
                },
            ];
        });

        const timer = setTimeout(() => {
            setSelectedAddon('');
        }, 100);

        return () => clearTimeout(timer);
    }, [selectedAddon]);

    // Calculating BASE Smartphone Total Price

    const smartphoneSubtotal = useMemo(() => {
        return cartItemSmartphones
            .filter((item) => item.smartphone_id === feedGallery?.id)
            .reduce((sum, item) => sum + Number(item.price || 0), 0);
    }, [cartItemSmartphones, feedGallery?.id]);

    const addonSubtotal = useMemo(() => {
        return cartItemAddons
            .filter((item) => item.smartphone_id === feedGallery?.id)
            .reduce((sum, item) => sum + Number(item.price || 0), 0);
    }, [cartItemAddons, feedGallery?.id]);

    const baseTotal = smartphoneSubtotal + addonSubtotal;

    const feeAppliedRef = useRef({});

    // Calculating Smartphone Total Price (With Manual Tax Calculation)
    useEffect(() => {
        if (!feedGallery || feedGallery.type !== 'smartphones') return;
        const smartphoneId = feedGallery.id;

        if (baseTotal === 0) {
            setSmartphoneTotalPrice((prev) => ({
                ...prev,
                [smartphoneId]: 0,
            }));
            delete feeAppliedRef.current[smartphoneId];
            return;
        }

        let shippingAmount = 0;
        let taxAmount = 0;

        if (!feeAppliedRef.current[smartphoneId]?.tax) {
            const import_tax = feedGallery.selling_info?.import_tax;

            if (import_tax) {
                const smartphoneUnitPrice =
                    cartItemSmartphones.find((s) => s.smartphone_id === feedGallery?.id)
                        ?.unit_price || 0;

                taxAmount =
                    import_tax.value_type === 'percentage'
                        ? (smartphoneUnitPrice * Number(import_tax.default_value || 0)) / 100
                        : Number(import_tax.default_value || 0);
            }

            feeAppliedRef.current[smartphoneId] = { tax: taxAmount };
        } else {
            taxAmount = feeAppliedRef.current[smartphoneId].tax;
        }

        // Adding Shipping Fee With Each Product

        const shipping_fee = feedGallery.selling_info?.shipping_fee;
        if (shipping_fee) {
            const qty =
                cartItemSmartphones.find((s) => s.smartphone_id === smartphoneId)?.quantity || 0;

            shippingAmount =
                shipping_fee.value_type === 'percentage'
                    ? (smartphoneSubtotal * Number(shipping_fee.default_value || 0) * qty) / 100
                    : Number(shipping_fee.default_value || 0) * qty;
        }

        const total = (smartphoneSubtotal + addonSubtotal + shippingAmount + taxAmount).toFixed(2);

        setSmartphoneTotalPrice((prev) => ({
            ...prev,
            [smartphoneId]: total,
        }));
    }, [smartphoneSubtotal, addonSubtotal, feedGallery?.id]);

    // Addon Quantity Increase Handling
    const handleAddonIncrease = (id) => {
        setCartItemAddons((prev) => {
            return prev.map((a) => {
                if (a.id === id) {
                    const addon = feedGallery.addons.find((addon) => addon.id === id);

                    const unitPrice = Number(addon.price || 0);
                    const newQty = a.quantity + 1;
                    return {
                        ...a,
                        quantity: newQty,
                        price: parseFloat(Number(a.price) + unitPrice).toFixed(2),
                    };
                }
                return a;
            });
        });
    };

    // Addon Quantity Decrease Handling
    const handleAddonDecrease = (id) => {
        setCartItemAddons((prev) => {
            return prev.map((a) => {
                if (a.id === id) {
                    const addon = feedGallery.addons.find((addon) => addon.id === id);

                    const unitPrice = Number(addon.price || 0);

                    if (a.quantity === 1) {
                        return a;
                    }

                    const newQty = a.quantity - 1;

                    return {
                        ...a,
                        quantity: newQty,
                        price: parseFloat(Number(a.price) - unitPrice).toFixed(2),
                    };
                }
                return a;
            });
        });
    };

    const handleAddonRemove = (addonId) => {
        setCartItemAddons((prev) => {
            return prev.filter((a) => {
                if (a.id === addonId && a.smartphone_id === feedGallery?.id) {
                    return false;
                }
                return true;
            });
        });
    };
    // Smartphone Quantity Increase Handling
    const handleSmartphoneIncrease = (id) => {
        setCartItemSmartphones((prev) => {
            return prev.map((a) => {
                if (a.color_id === id) {
                    const unitPrice = Number(feedGallery.selling_info?.total_price || 0);
                    const previousTotal = Number(a.price || 0);

                    const newTotal = previousTotal + unitPrice;
                    return {
                        ...a,
                        quantity: a.quantity + 1,
                        price: parseFloat(Number(newTotal)).toFixed(2),
                    };
                }
                return a;
            });
        });
    };

    // Smartphone Quantity Decrease Handling
    const handleSmartphoneDecrease = (id) => {
        setCartItemSmartphones((prev) => {
            return prev
                .map((a) => {
                    if (a.color_id === id) {
                        const newQty = a.quantity - 1;

                        if (newQty === 0) {
                            return a;
                        }

                        const unitPrice = Number(feedGallery.selling_info?.total_price || 0);
                        const previousTotal = Number(a.price || 0);

                        const newTotal = previousTotal - unitPrice;

                        return {
                            ...a,
                            quantity: newQty,
                            price: parseFloat(Number(newTotal)).toFixed(2),
                        };
                    }
                    return a;
                })
                .filter((a) => a.quantity > 0);
        });
    };

    // Update Stock When Feed Gallery Changes (Not Needed RN)
    // useEffect(() => {
    //     if (feedGallery?.type === 'smartphones') {
    //         setIsInStock(feedGallery?.inventory_items_count > 0);
    //     }
    // }, [feedGallery?.inventory_items_count, feedGallery?.type]);

    // Stock Count Badge
    // const StockBadge = ({ feedGallery }) => {
    //     const stock = feedGallery?.inventory_items_count || 0;
    //     let badgeClass, text;

    //     if (stock > 10) {
    //         badgeClass = 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    //         text = `${__('In Stock')}: ${stock}`;
    //     } else if (stock > 0) {
    //         badgeClass = 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
    //         text = `${__('Low Stock')}: ${stock}`;
    //     } else {
    //         badgeClass = 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    //         text = __('Out of Stock');
    //     }

    //     return (
    //         <span
    //             className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${badgeClass}`}
    //         >
    //             {text}
    //         </span>
    //     );
    // };

    // Handle Create Cart Item
    const handleAddCartItem = async (smartphones, addons, total_stock) => {
        try {
            setCartProcessing(true);

            if (smartphones.length === 0 && addons.length === 0) {
                setInfoMessage(__('Please select any Item First'));
                setShowInfoMessage(true);
                setCartProcessing(false);
                return;
            }

            // (Not Needed RN)
            // if (!isInStock) {
            //     setInfoMessage(
            //         __('Sorry, this item is currently out of stock and cannot be added to your cart'),
            //     );
            //     setShowInfoMessage(true);
            //     setCartProcessing(false);
            //     return;
            // }

            // let quantity = 0;
            // smartphones.forEach((smartphone) => {
            //     quantity += smartphone.quantity;
            // });

            // (Not Needed RN)
            // if (quantity > total_stock) {
            //     setInfoMessage(
            //         `${'Only'} ${total_stock} ${total_stock === 1 ? __('Item') : __('Items')} ${__('Stock available. For This Smartphone Please adjust your quantity')}`,
            //     );
            //     setShowInfoMessage(true);
            //     setCartProcessing(false);
            //     return;
            // }

            let data = {
                smartphones: [],
                addons: [],
            };

            smartphones
                .filter((smartphone) => smartphone.smartphone_id === feedGallery?.id)
                .forEach((smartphone) => {
                    data = {
                        ...data,
                        smartphones: [...data.smartphones, smartphone],
                    };
                });

            addons
                .filter((smartphone) => smartphone.smartphone_id === feedGallery?.id)
                .forEach((addon) => {
                    data = {
                        ...data,
                        addons: [...data.addons, addon],
                    };
                });

            router.post(
                route('website.carts.add-item'),
                { ...data },
                {
                    //     onSuccess: (page) => {
                    //         setCartProcessing(false);
                    //         const flash = page.props.flash;
                    //         if (flash?.success) {
                    //             setInfoMessage(flash.success);
                    //             setShowInfoMessage(true);
                    //         } else {
                    //             // Backend se direct message lo jo HTML link bhi contain karta hai
                    //             setInfoMessage(
                    //                 __('Added Succesfully To Cart') +
                    //                     ' <a href="' +
                    //                     route('website.carts.index') +
                    //                     '" class="font-semibold underline">' +
                    //                     __('Go To Cart') +
                    //                     '</a>',
                    //             );
                    //             setShowInfoMessage(true);
                    //         }
                    //     },
                    //     onError: (errors) => {
                    //         setCartProcessing(false);
                    //         setErrorMessage(Object.values(errors)[0] || 'Something went wrong');
                    //         setShowErrorMessage(true);
                    //     },
                    onFinish: () => {
                        setCartProcessing(false);
                    },
                    preserveScroll: true,
                    preserveUrl: true,
                    preserveState: true,
                },
            );
        } catch (error) {
            setCartProcessing(false);
            setShowErrorMessage(true);
            setErrorMessage(error.message);
        }
    };

    const handleBuyNow = async (smartphones, addons, item_id, total_stock) => {
        try {
            setBuyNowProcessing(true);

            if (smartphones.length === 0 && addons.length === 0) {
                setInfoMessage(__('Please select any Item First'));
                setShowInfoMessage(true);
                setBuyNowProcessing(false);
                return;
            }

            // (Not Needed RN)
            // if (!isInStock) {
            //     setInfoMessage(
            //         __('Sorry, this item is currently out of stock and cannot be added to your cart'),
            //     );
            //     setShowInfoMessage(true);
            //     setBuyNowProcessing(false);
            //     return;
            // }

            // let quantity = 0;
            // smartphones.forEach((smartphone) => {
            //     quantity += smartphone.quantity;
            // });

            // (Not Needed RN)
            // if (quantity > total_stock) {
            //     setInfoMessage(
            //         `${'Only'} ${total_stock} ${total_stock === 1 ? __('Item') : __('Items')} ${__('Stock available. For This Smartphone Please adjust your quantity')}`,
            //     );
            //     setShowInfoMessage(true);
            //     setBuyNowProcessing(false);
            //     return;
            // }

            const smartphoneFragments = smartphones.filter((s) => s.smartphone_id === item_id);

            const addonFragments = addons.filter((s) => s.smartphone_id === item_id);

            const smartphone = smartphoneFragments.reduce(
                (acc, curr) => ({
                    ...acc,
                    ...curr,
                }),
                {},
            );

            const structuredAddons = addonFragments.map((addon) => ({
                id: addon.id,
                name: addon.name,
                quantity: addon.quantity,
                unit_price: addon.unit_price,
                price: addon.price,
                smartphone_id: addon.smartphone_id,
            }));
            const payload = {
                smartphone: {
                    ...smartphone,
                    addons: JSON.stringify(structuredAddons),
                },
                buy_now: true,
            };

            const res = await axios.post(
                route('website.checkout.single-product-checkout-session_store'),
                { ...payload },
            );
            if (res.data.status === true) {
                shouldCleanupBrowserHistoryRef.current = false;
                router.get(route('website.checkout.index', { buy_now: true }));
            } else {
                setBuyNowProcessing(false);
                setErrorMessage(res.data.message);
                setShowErrorMessage(true);
            }
        } catch (error) {
            setBuyNowProcessing(false);
            setShowErrorMessage(true);
            setErrorMessage(error?.response?.data?.message || error);
        }
    };

    // Watching The Smartphone Cart Item If Smarpthone added Than enable Action Buttons
    useEffect(() => {
        if (
            cartItemSmartphones?.filter((item) => item.smartphone_id === feedGallery?.id).length >
                0 &&
            cartItemSmartphones.filter((item) => item.smartphone_id === feedGallery?.id)
        ) {
            setCanActionOnSmartphone(true);
        } else {
            setCanActionOnSmartphone(false);
        }
    }, [cartItemSmartphones, feedGallery?.id]);

    // CleanUp
    useEffect(() => {
        return () => {
            const refAllowsCleanup = shouldCleanupBrowserHistoryRef.current;
            const storeAllowsCleanup = useFeedCleanupStore
                .getState()
                .shouldCleanupBrowserHistory;

            if (refAllowsCleanup && storeAllowsCleanup) {
                window.history.replaceState({}, '', '/');
            }

            // Reset store flag for the next feed mount (defensive reset)
            useFeedCleanupStore
                .getState()
                .setShouldCleanupBrowserHistory(true);

            setShowQrCode(false);
            setCartProcessing(false);
            setSpatiotemporalInfoModal(false);
            setBuyNowProcessing(false);
            setFeedGallery(null);
            setCanActionOnSmartphone(false);
            setCartItemAddons([]);
            setCartItemSmartphones([]);
            setCurrentFeedIndex(0);
            setFeedItems([]);
            setMediaItems([]);
            setSelectedAddon('');
            setSelectedColor('');
            setSelectedMediaIndex(0);
            setFeedGallery(null);
            setFeedOpen(false);
            smartphoneCartItemsRef.current = [];
            mediaThumbRefs.current = {};
            isSinglePageRef.current = false;
        };
    }, []);

    // Arrows Destructuring From Arrow State
    const { isLeftDisabled, isRightDisabled, isTopDisabled, isBottomDisabled } = arrowStates;

    // TEXT ONLY POSTS
    if (feedGallery !== null && feedGallery?.type === 'posts' && isText) {
        return (
            <>
                <div className="absolute inset-y-0 left-[var(--sidebar-w)] right-0 z-[60] bg-backgroundLight dark:bg-backgroundDark">
                    {/* Modal Container */}

                    <div className="flex items-center justify-center w-full h-full overflow-hidden">
                        <div className="relative mx-auto w-full max-w-[1300px] px-6 lg:px-[96px] xl:px-[120px]">
                            {/* Navigation Arrows + Close Button Starts */}
                            {/* Left Arrow */}
                            <button
                                onClick={handleLeftPrevious}
                                disabled={isLeftDisabled}
                                className={`absolute left-[clamp(0px,2vw,0px)] top-1/2 z-[60] -translate-y-1/2 rounded-full bg-surface-1-light p-3 transition-all duration-200 hover:scale-110 dark:bg-surface-2-dark dark:hover:bg-surface-3-dark ${isLeftDisabled ? 'cursor-not-allowed opacity-20' : ''}`}
                                aria-label="Previous item"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    className="w-5 h-5 text-main-text-light dark:text-main-text-dark"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeWidth={2}
                                        strokeLinejoin="round"
                                        d="M15.75 19.5 8.25 12l7.5-7.5"
                                    />
                                </svg>
                            </button>

                            {/* Close Button */}
                            <button
                                onClick={() => {
                                    if (previous_url) {
                                        shouldCleanupBrowserHistoryRef.current = false;
                                        router.visit(previous_url);
                                    } else {
                                        setFeedGallery(null);
                                        setFeedOpen(false);
                                        setMediaItems([]);
                                        mediaThumbRefs.current = {};
                                        window.history.replaceState(
                                            {},
                                            '',
                                            window.location.pathname,
                                        );
                                    }
                                }}
                                className="absolute right-[clamp(35px,2vw,20px)] top-0 z-[90] flex h-[32px] w-[32px] items-center justify-center rounded-full transition-all duration-200 hover:bg-surface-1-light dark:hover:bg-surface-2-dark"
                                aria-label="Close modal"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={2}
                                    stroke="currentColor"
                                    className="w-5 h-5 text-main-text-light dark:text-main-text-dark"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>

                            <div className="absolute right-[clamp(30px,2vw,20px)] top-1/2 z-[60] flex -translate-y-1/2 flex-col items-center gap-8">
                                {/* Up Arrow */}
                                <button
                                    onClick={handleTopPrevious}
                                    disabled={isTopDisabled}
                                    className={`rounded-full bg-surface-1-light p-3 transition-all duration-200 hover:scale-110 dark:bg-surface-2-dark dark:hover:bg-surface-3-dark ${isTopDisabled ? 'opacity-20' : ''}`}
                                    aria-label="Previous Item"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        className="w-5 h-5 text-main-text-light dark:text-main-text-dark"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeWidth={2}
                                            strokeLinejoin="round"
                                            d="m4.5 15.75 7.5-7.5 7.5 7.5"
                                        />
                                    </svg>
                                </button>

                                {/* Right Arrow */}
                                <button
                                    onClick={handleRightNext}
                                    disabled={isRightDisabled}
                                    className={`rounded-full bg-surface-1-light p-3 transition-all duration-200 hover:scale-110 dark:bg-surface-2-dark dark:hover:bg-surface-3-dark ${isRightDisabled ? 'opacity-20' : ''}`}
                                    aria-label="Next item"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        className="w-5 h-5 text-main-text-light dark:text-main-text-dark"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeWidth={2}
                                            strokeLinejoin="round"
                                            d="m8.25 4.5 7.5 7.5-7.5 7.5"
                                        />
                                    </svg>
                                </button>

                                {/* Down Arrow */}
                                <button
                                    onClick={handleBottomNext}
                                    disabled={isBottomDisabled}
                                    className={`rounded-full bg-surface-1-light p-3 transition-all duration-200 hover:scale-110 dark:bg-surface-2-dark dark:hover:bg-surface-3-dark ${isBottomDisabled ? 'opacity-20' : ''}`}
                                    aria-label="Next item"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={2}
                                        stroke="currentColor"
                                        className="w-5 h-5 text-main-text-light dark:text-main-text-dark"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="m19.5 8.25-7.5 7.5-7.5-7.5"
                                        />
                                    </svg>
                                </button>
                            </div>
                            {/* Navigation Arrows + Close Button Ends */}

                            <div
                                className={`bg-backgroundLight transition-all duration-300 dark:bg-backgroundDark`}
                            >
                                {/* Scrollable Content */}
                                <div className="h-full">
                                    <div className="flex h-[83vh] min-h-0 flex-col gap-[40px] bg-backgroundLight dark:bg-backgroundDark lg:flex-row lg:items-start">
                                        {/* Content Area - Matches Media Feed Structure */}
                                        <div className="flex flex-col w-full h-full min-h-0">
                                            {/* Tag and Actions Header */}
                                            <div className="flex items-center justify-between mb-2">
                                                {/* Three Dot Menu */}
                                                <div className="relative flex-1">
                                                    <button
                                                        data-post-actions-button
                                                        className="flex h-[36px] w-[36px] items-center justify-center rounded-full transition-all duration-200 hover:bg-surface-1-light dark:hover:bg-surface-2-dark"
                                                    >
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            strokeWidth={2.5}
                                                            stroke="currentColor"
                                                            className="w-5 h-5 text-main-text-light dark:text-main-text-dark"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                d="
      M3.5 12a.75.75 0 1 1-1.5 0a.75.75 0 0 1 1.5 0
      M12 12a.75.75 0 1 1-1.5 0a.75.75 0 0 1 1.5 0
      M20.5 12a.75.75 0 1 1-1.5 0a.75.75 0 0 1 1.5 0
    "
                                                            />
                                                        </svg>
                                                    </button>

                                                    {showPostDesktopActionsDropdown && (
                                                        <div
                                                            data-post-actions-dropdown
                                                            className="absolute left-0 z-50 w-56 border rounded-md top-full border-surface-3-light bg-backgroundLight dark:border-surface-3-dark dark:bg-surface-1-dark"
                                                        >
                                                            <div className="py-2">
                                                                {/* QR Code */}
                                                                <button
                                                                    onClick={() => {
                                                                        setShowQrCode(true);
                                                                        setShowPostDesktopActionsDropdown(
                                                                            false,
                                                                        );
                                                                    }}
                                                                    className="flex items-center w-full gap-3 px-4 py-3 text-sm transition-colors rounded-md text-main-text-light hover:bg-surface-2-light dark:text-main-text-dark dark:hover:bg-surface-3-dark"
                                                                >
                                                                    <svg
                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                        fill="none"
                                                                        viewBox="0 0 24 24"
                                                                        strokeWidth={1.5}
                                                                        stroke="currentColor"
                                                                        className="w-5 h-5"
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
                                                                    <span className="font-normal">
                                                                        {__('QR Code')}
                                                                    </span>
                                                                </button>

                                                                {/* Bookmark */}
                                                                {auth?.user && (
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            router.put(
                                                                                route(
                                                                                    'website.posts.bookmark',
                                                                                    feedGallery?.id,
                                                                                ),
                                                                                {
                                                                                    post_id:
                                                                                        feedGallery?.id,
                                                                                },
                                                                                {
                                                                                    preserveScroll: true,
                                                                                    preserveUrl: true,
                                                                                    onSuccess:
                                                                                        () => {
                                                                                            feedGallery.is_bookmarked =
                                                                                                !feedGallery.is_bookmarked;
                                                                                            setShowPostDesktopActionsDropdown(
                                                                                                false,
                                                                                            );
                                                                                            setBookmarkStatusChanged(
                                                                                                true,
                                                                                            );
                                                                                        },
                                                                                    onError: (
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
                                                                        className="flex items-center w-full gap-3 px-4 py-3 text-sm transition-colors rounded-md text-main-text-light hover:bg-surface-2-light dark:text-main-text-dark dark:hover:bg-surface-3-dark"
                                                                    >
                                                                        <svg
                                                                            xmlns="http://www.w3.org/2000/svg"
                                                                            fill={
                                                                                feedGallery?.is_bookmarked
                                                                                    ? isDarkMode
                                                                                        ? '#fff'
                                                                                        : '#222'
                                                                                    : 'none'
                                                                            }
                                                                            stroke={
                                                                                feedGallery?.is_bookmarked
                                                                                    ? isDarkMode
                                                                                        ? '#fff'
                                                                                        : '#222'
                                                                                    : 'currentColor'
                                                                            }
                                                                            strokeWidth={1.5}
                                                                            viewBox="0 0 24 24"
                                                                            className="w-5 h-5"
                                                                        >
                                                                            <path
                                                                                strokeLinecap="round"
                                                                                strokeLinejoin="round"
                                                                                d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z"
                                                                            />
                                                                        </svg>
                                                                        <span className="font-normal">
                                                                            {feedGallery?.is_bookmarked
                                                                                ? __(
                                                                                      'Remove Bookmarker',
                                                                                  )
                                                                                : __('Bookmarker')}
                                                                        </span>
                                                                    </button>
                                                                )}

                                                                {/* Copy Link */}
                                                                <button
                                                                    onClick={(e) => {
                                                                        const url =
                                                                            route('home') +
                                                                            generateURL(
                                                                                feedGallery,
                                                                                true,
                                                                                true,
                                                                            );
                                                                        navigator.clipboard.writeText(
                                                                            url.trim(),
                                                                        );
                                                                        setLinkCopied(true);
                                                                        setShowPostDesktopActionsDropdown(
                                                                            false,
                                                                        );
                                                                    }}
                                                                    className="flex items-center w-full gap-3 px-4 py-3 text-sm transition-colors rounded-md text-main-text-light hover:bg-surface-2-light dark:text-main-text-dark dark:hover:bg-surface-3-dark"
                                                                >
                                                                    <svg
                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                        fill="none"
                                                                        viewBox="0 0 24 24"
                                                                        strokeWidth={1.5}
                                                                        stroke="currentColor"
                                                                        className="w-5 h-5"
                                                                    >
                                                                        <path
                                                                            strokeLinecap="round"
                                                                            strokeLinejoin="round"
                                                                            d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0 1 18 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3 1.5 1.5 3-3.75"
                                                                        />
                                                                    </svg>
                                                                    <span className="font-normal">
                                                                        {__('Copy Link')}
                                                                    </span>
                                                                </button>

                                                                {/* Spatiotemporal Information */}
                                                                {feedGallery?.latitude != null &&
                                                                    feedGallery?.longitude !=
                                                                        null && (
                                                                        <button
                                                                            onClick={(e) => {
                                                                                setSpatiotemporalInfoModal(
                                                                                    true,
                                                                                );
                                                                                setShowPostDesktopActionsDropdown(
                                                                                    false,
                                                                                );
                                                                            }}
                                                                            className="flex items-center w-full gap-3 px-4 py-3 text-sm transition-colors rounded-md text-main-text-light hover:bg-surface-2-light dark:text-main-text-dark dark:hover:bg-surface-3-dark"
                                                                        >
                                                                            <svg
                                                                                xmlns="http://www.w3.org/2000/svg"
                                                                                fill="none"
                                                                                viewBox="0 0 24 24"
                                                                                strokeWidth={1.5}
                                                                                stroke="currentColor"
                                                                                className="w-5 h-5"
                                                                            >
                                                                                <path
                                                                                    strokeLinecap="round"
                                                                                    strokeLinejoin="round"
                                                                                    d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                                                                                />
                                                                                <path
                                                                                    strokeLinecap="round"
                                                                                    strokeLinejoin="round"
                                                                                    d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                                                                                />
                                                                            </svg>

                                                                            <span className="font-normal">
                                                                                {__(
                                                                                    'Spatiotemporal Info',
                                                                                )}
                                                                            </span>
                                                                        </button>
                                                                    )}

                                                                <span className="flex items-center w-full gap-3 px-4 py-3 text-xs transition-colors rounded-md text-main-text-light dark:text-main-text-dark">
                                                                    <span>
                                                                        {__('Post Created')}:
                                                                        <p>
                                                                            {feedGallery?.added_at}{' '}
                                                                            {
                                                                                feedGallery?.created_at_time
                                                                            }
                                                                        </p>
                                                                    </span>
                                                                </span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                <div>
                                                    {feedGallery?.tag && (
                                                        <button
                                                            onClick={() => {
                                                                shouldCleanupBrowserHistoryRef.current = false;
                                                                navigateToHashtag(feedGallery?.tag);
                                                            }}
                                                            className="z-[90] flex items-center justify-center rounded-full p-2 text-[14px] font-medium text-main-text-light transition-all duration-200 hover:bg-surface-1-light dark:text-main-text-dark dark:hover:bg-surface-2-dark"
                                                        >
                                                            {feedGallery?.tag}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Post Content - Scrollable */}
                                            <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin scrollbar-none">
                                                <div
                                                    ref={postContentRef1}
                                                    className="prose prose-sm max-w-none whitespace-pre-line break-words pr-2 text-[14px] leading-relaxed text-main-text-light dark:prose-invert dark:text-main-text-dark"
                                                    dangerouslySetInnerHTML={{
                                                        __html: feedGallery?.content,
                                                    }}
                                                />
                                                {productCardPortals1}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {spatiotemporalInfoModal && (
                    <SpatiotemporalInfoModal
                        onClose={() => {
                            setSpatiotemporalInfoModal(false);
                        }}
                        post={feedGallery}
                    />
                )}
            </>
        );
    }

    // TEXT ONLY Smartphones
    if (feedGallery !== null && feedGallery?.type === 'smartphones' && isText) {
        return (
            <>
                <div className="absolute inset-y-0 left-[var(--sidebar-w)] right-0 z-[60] bg-backgroundLight dark:bg-backgroundDark">
                    <div className="flex items-center justify-center w-full h-full overflow-hidden">
                        <div className="relative mx-auto w-full max-w-[1300px] px-6 lg:px-[96px] xl:px-[120px]">
                            {/* Navigation Arrows + Close Button Starts */}
                            {/* Left Arrow */}
                            <button
                                onClick={handleLeftPrevious}
                                disabled={isLeftDisabled}
                                className={`absolute left-[clamp(0px,2vw,0px)] top-1/2 z-[60] -translate-y-1/2 rounded-full bg-surface-1-light p-3 transition-all duration-200 hover:scale-110 dark:bg-surface-2-dark dark:hover:bg-surface-3-dark ${isLeftDisabled ? 'cursor-not-allowed opacity-20' : ''}`}
                                aria-label="Previous item"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    className="w-5 h-5 text-main-text-light dark:text-main-text-dark"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeWidth={2}
                                        strokeLinejoin="round"
                                        d="M15.75 19.5 8.25 12l7.5-7.5"
                                    />
                                </svg>
                            </button>

                            {/* Close Button */}
                            <button
                                onClick={() => {
                                    if (previous_url) {
                                        shouldCleanupBrowserHistoryRef.current = false;
                                        router.visit(previous_url);
                                    } else {
                                        setFeedGallery(null);
                                        setFeedOpen(false);
                                        setMediaItems([]);
                                        mediaThumbRefs.current = {};
                                        window.history.replaceState(
                                            {},
                                            '',
                                            window.location.pathname,
                                        );
                                    }
                                }}
                                className="absolute right-[clamp(35px,2vw,20px)] top-0 z-[90] flex h-[32px] w-[32px] items-center justify-center rounded-full transition-all duration-200 hover:bg-surface-1-light dark:hover:bg-surface-2-dark"
                                aria-label="Close modal"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={2}
                                    stroke="currentColor"
                                    className="w-5 h-5 text-main-text-light dark:text-main-text-dark"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>

                            <div className="absolute right-[clamp(30px,2vw,20px)] top-1/2 z-[60] flex -translate-y-1/2 flex-col items-center gap-8">
                                {/* Up Arrow */}
                                <button
                                    onClick={handleTopPrevious}
                                    disabled={isTopDisabled}
                                    className={`rounded-full bg-surface-1-light p-3 transition-all duration-200 hover:scale-110 dark:bg-surface-2-dark dark:hover:bg-surface-3-dark ${isTopDisabled ? 'opacity-20' : ''}`}
                                    aria-label="Previous Item"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        className="w-5 h-5 text-main-text-light dark:text-main-text-dark"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeWidth={2}
                                            strokeLinejoin="round"
                                            d="m4.5 15.75 7.5-7.5 7.5 7.5"
                                        />
                                    </svg>
                                </button>

                                {/* Right Arrow */}
                                <button
                                    onClick={handleRightNext}
                                    disabled={isRightDisabled}
                                    className={`rounded-full bg-surface-1-light p-3 transition-all duration-200 hover:scale-110 dark:bg-surface-2-dark dark:hover:bg-surface-3-dark ${isRightDisabled ? 'opacity-20' : ''}`}
                                    aria-label="Next item"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        className="w-5 h-5 text-main-text-light dark:text-main-text-dark"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeWidth={2}
                                            strokeLinejoin="round"
                                            d="m8.25 4.5 7.5 7.5-7.5 7.5"
                                        />
                                    </svg>
                                </button>

                                {/* Down Arrow */}
                                <button
                                    onClick={handleBottomNext}
                                    disabled={isBottomDisabled}
                                    className={`rounded-full bg-surface-1-light p-3 transition-all duration-200 hover:scale-110 dark:bg-surface-2-dark dark:hover:bg-surface-3-dark ${isBottomDisabled ? 'opacity-20' : ''}`}
                                    aria-label="Next item"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={2}
                                        stroke="currentColor"
                                        className="w-5 h-5 text-main-text-light dark:text-main-text-dark"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="m19.5 8.25-7.5 7.5-7.5-7.5"
                                        />
                                    </svg>
                                </button>
                            </div>
                            {/* Navigation Arrows + Close Button Ends */}

                            <div
                                className={`bg-backgroundLight transition-all duration-300 dark:bg-backgroundDark`}
                            >
                                {/* Scrollable Content */}
                                <div className="h-full">
                                    <div className="flex h-[83vh] min-h-0 flex-col gap-[40px] bg-backgroundLight dark:bg-backgroundDark lg:flex-row lg:items-start">
                                        {feedGallery && (
                                            <>
                                                <div className="relative flex h-full w-full justify-center lg:w-[50%] xl:w-[50%]">
                                                    <div className="flex h-full w-full max-w-[520px] flex-col">
                                                        <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin scrollbar-none">
                                                            <div
                                                                ref={postContentRef2}
                                                                className="prose prose-sm max-w-none whitespace-pre-line break-words pr-2 text-[14px] leading-relaxed text-main-text-light dark:prose-invert dark:text-main-text-dark"
                                                                dangerouslySetInnerHTML={{
                                                                    __html: feedGallery?.content,
                                                                }}
                                                            />
                                                            {productCardPortals2}
                                                        </div>
                                                    </div>
                                                </div>
                                                {/* Right Side - Content & Details */}
                                                <div className="flex h-full w-full flex-col lg:w-[40%] xl:w-[45%]">
                                                    {/* Image Thumbnails Strip */}
                                                    <div className={`flex items-center gap-0`}>
                                                        {/* Prev indicator */}
                                                        {canGoPrev && (
                                                            <button
                                                                className="mx-2 flex h-[clamp(66px,5.2vw,66px)] w-[clamp(40px,2.5vw,40px)] flex-shrink-0 items-center justify-center rounded-md bg-surface-2-light dark:bg-surface-2-dark"
                                                                onClick={() => {
                                                                    const newPage = thumbPage - 1;
                                                                    const firstIndex =
                                                                        newPage * MAX_THUMBS;

                                                                    setThumbPage(newPage);
                                                                    setSelectedMediaIndex(
                                                                        firstIndex,
                                                                    );
                                                                }}
                                                            >
                                                                <svg
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    viewBox="0 0 24 24"
                                                                    fill="currentColor"
                                                                    className="size-4 text-sub-text-light dark:text-main-text-dark"
                                                                >
                                                                    <path
                                                                        fillRule="evenodd"
                                                                        d="M19.5 18.347c0 1.427-1.529 2.33-2.779 1.643L5.181 13.643c-1.295-.712-1.295-2.573 0-3.286L16.721 4.01c1.25-.687 2.779.217 2.779 1.643v12.694Z"
                                                                        clipRule="evenodd"
                                                                    />
                                                                </svg>
                                                            </button>
                                                        )}
                                                        {/* Thumbnails */}
                                                        {((Array.isArray(
                                                            feedGallery?.smartphone_video_urls,
                                                        ) &&
                                                            feedGallery.smartphone_video_urls
                                                                .length > 1) ||
                                                            (Array.isArray(
                                                                feedGallery?.smartphone_image_urls,
                                                            ) &&
                                                                feedGallery.smartphone_image_urls
                                                                    .length > 1)) && (
                                                            <div
                                                                ref={MediaThumbRef}
                                                                className="flex items-center gap-2 mb-3 overflow-x-auto scrollbar-none scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700"
                                                            >
                                                                {/* Render thumbnails */}
                                                                {visibleThumbs.map(
                                                                    (mediaItem, index) => {
                                                                        const realIndex =
                                                                            startIndex + index;
                                                                        return (
                                                                            <button
                                                                                key={realIndex}
                                                                                ref={(el) => {
                                                                                    mediaThumbRefs.current[
                                                                                        realIndex
                                                                                    ] = el;
                                                                                }}
                                                                                onClick={() =>
                                                                                    setSelectedMediaIndex(
                                                                                        realIndex,
                                                                                    )
                                                                                }
                                                                                // className={`aspect-square w-[clamp(48px,5vw,64px)] flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all ${selectedMediaIndex ===
                                                                                //     realIndex
                                                                                //     ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800'
                                                                                //     : 'border-gray-300 hover:border-gray-400 dark:border-gray-700'
                                                                                //     }`}

                                                                                className={`aspect-square ${selectedMediaIndex === realIndex ? 'border-[3px] border-main-text-light dark:border-main-text-dark' : ''} w-[clamp(48px,5vw,64px)] flex-shrink-0 overflow-hidden rounded-md transition-all`}
                                                                            >
                                                                                {mediaItem?.type ===
                                                                                'image' ? (
                                                                                    <img
                                                                                        src={
                                                                                            mediaItem?.url ||
                                                                                            Placeholder
                                                                                        }
                                                                                        alt={`Thumbnail ${realIndex + 1}`}
                                                                                        className="object-cover w-full h-full"
                                                                                        loading={
                                                                                            selectedMediaIndex ===
                                                                                            realIndex
                                                                                                ? 'eager'
                                                                                                : 'lazy'
                                                                                        }
                                                                                        decoding="async"
                                                                                        fetchpriority={
                                                                                            selectedMediaIndex ===
                                                                                            realIndex
                                                                                                ? 'high'
                                                                                                : 'low'
                                                                                        }
                                                                                        onError={(
                                                                                            e,
                                                                                        ) =>
                                                                                            (e.target.src =
                                                                                                Placeholder)
                                                                                        }
                                                                                    />
                                                                                ) : (
                                                                                    <img
                                                                                        src={
                                                                                            mediaItem?.thumbnail_url ||
                                                                                            Placeholder
                                                                                        }
                                                                                        alt={`Thumbnail ${index + 1}`}
                                                                                        className="object-cover w-full h-full"
                                                                                        loading={
                                                                                            selectedMediaIndex ===
                                                                                            realIndex
                                                                                                ? 'eager'
                                                                                                : 'lazy'
                                                                                        }
                                                                                        decoding="async"
                                                                                        fetchpriority={
                                                                                            selectedMediaIndex ===
                                                                                            realIndex
                                                                                                ? 'high'
                                                                                                : 'low'
                                                                                        }
                                                                                        onError={(
                                                                                            e,
                                                                                        ) =>
                                                                                            (e.target.src =
                                                                                                Placeholder)
                                                                                        }
                                                                                    />
                                                                                )}
                                                                            </button>
                                                                        );
                                                                    },
                                                                )}
                                                            </div>
                                                        )}

                                                        {/* Next indicator */}
                                                        {canGoNext && (
                                                            <button
                                                                className="mx-2 flex h-[clamp(66px,5.2vw,66px)] w-[clamp(40px,2.5vw,40px)] flex-shrink-0 items-center justify-center rounded-md bg-surface-2-light dark:bg-surface-2-dark"
                                                                onClick={() => {
                                                                    const newPage = thumbPage + 1;
                                                                    const firstIndex =
                                                                        newPage * MAX_THUMBS;

                                                                    setThumbPage(newPage);
                                                                    setSelectedMediaIndex(
                                                                        firstIndex,
                                                                    );
                                                                }}
                                                            >
                                                                <svg
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    viewBox="0 0 24 24"
                                                                    fill="currentColor"
                                                                    className="size-4 text-sub-text-light dark:text-main-text-dark"
                                                                >
                                                                    <path
                                                                        fillRule="evenodd"
                                                                        d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z"
                                                                        clipRule="evenodd"
                                                                    />
                                                                </svg>
                                                            </button>
                                                        )}
                                                    </div>

                                                    {/* Content Area */}

                                                    <div
                                                        className="flex-1 min-h-0 overflow-y-auto scrollbar-none"
                                                        ref={productRightPanelScrollRef}
                                                    >
                                                        {/* Tag and Actions Header */}
                                                        <div className="flex justify-between mb-2 align-start">
                                                            {/* Three Dot Menu */}
                                                            <div
                                                                className="relative flex-1"
                                                                ref={
                                                                    smartphoneDesktopViewerActionDropdownRef
                                                                }
                                                            >
                                                                <button
                                                                    data-smartphone-actions-button
                                                                    className="flex h-[36px] w-[36px] items-center justify-center rounded-full transition-all duration-200 hover:bg-surface-1-light dark:hover:bg-surface-2-dark"
                                                                >
                                                                    <svg
                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                        fill="none"
                                                                        viewBox="0 0 24 24"
                                                                        strokeWidth={2.5}
                                                                        stroke="currentColor"
                                                                        className="w-5 h-5 text-main-text-light dark:text-main-text-dark"
                                                                    >
                                                                        <path
                                                                            strokeLinecap="round"
                                                                            strokeLinejoin="round"
                                                                            d="
      M3.5 12a.75.75 0 1 1-1.5 0a.75.75 0 0 1 1.5 0
      M12 12a.75.75 0 1 1-1.5 0a.75.75 0 0 1 1.5 0
      M20.5 12a.75.75 0 1 1-1.5 0a.75.75 0 0 1 1.5 0
    "
                                                                        />
                                                                    </svg>
                                                                </button>

                                                                {showSmartphoneDesktopActionsDropdown && (
                                                                    <div
                                                                        data-smartphone-actions-dropdown
                                                                        className="absolute left-0 z-50 w-56 border rounded-md top-full border-surface-3-light bg-backgroundLight dark:border-surface-3-dark dark:bg-surface-1-dark"
                                                                    >
                                                                        <div className="py-2">
                                                                            {/* QR Code */}
                                                                            <button
                                                                                onClick={() => {
                                                                                    setShowQrCode(
                                                                                        true,
                                                                                    );
                                                                                    setShowSmartphoneDesktopActionsDropdown(
                                                                                        false,
                                                                                    );
                                                                                }}
                                                                                className="flex items-center w-full gap-3 px-4 py-3 text-sm transition-colors rounded-md text-main-text-light hover:bg-surface-2-light dark:text-main-text-dark dark:hover:bg-surface-3-dark"
                                                                            >
                                                                                <svg
                                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                                    fill="none"
                                                                                    viewBox="0 0 24 24"
                                                                                    strokeWidth={
                                                                                        1.5
                                                                                    }
                                                                                    stroke="currentColor"
                                                                                    className="w-5 h-5"
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
                                                                                <span className="font-normal">
                                                                                    {__('QR Code')}
                                                                                </span>
                                                                            </button>

                                                                            {/* Copy Link */}
                                                                            <button
                                                                                onClick={(e) => {
                                                                                    const url =
                                                                                        route(
                                                                                            'home',
                                                                                        ) +
                                                                                        generateSmartphoneURL(
                                                                                            feedGallery,
                                                                                            true,
                                                                                            true,
                                                                                        );
                                                                                    navigator.clipboard.writeText(
                                                                                        url.trim(),
                                                                                    );
                                                                                    setLinkCopied(
                                                                                        true,
                                                                                    );
                                                                                    setShowSmartphoneDesktopActionsDropdown(
                                                                                        false,
                                                                                    );
                                                                                }}
                                                                                className="flex items-center w-full gap-3 px-4 py-3 text-sm transition-colors rounded-md text-main-text-light hover:bg-surface-2-light dark:text-main-text-dark dark:hover:bg-surface-3-dark"
                                                                            >
                                                                                <svg
                                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                                    fill="none"
                                                                                    viewBox="0 0 24 24"
                                                                                    strokeWidth={
                                                                                        1.5
                                                                                    }
                                                                                    stroke="currentColor"
                                                                                    className="w-5 h-5"
                                                                                >
                                                                                    <path
                                                                                        strokeLinecap="round"
                                                                                        strokeLinejoin="round"
                                                                                        d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0 1 18 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3 1.5 1.5 3-3.75"
                                                                                    />
                                                                                </svg>
                                                                                <span className="font-normal">
                                                                                    {__(
                                                                                        'Copy Link',
                                                                                    )}
                                                                                </span>
                                                                            </button>

                                                                            {/* Spatiotemporal Information */}
                                                                            {feedGallery?.latitude !=
                                                                                null &&
                                                                                feedGallery?.longitude !=
                                                                                    null && (
                                                                                    <button
                                                                                        onClick={(
                                                                                            e,
                                                                                        ) => {
                                                                                            setSpatiotemporalInfoModal(
                                                                                                true,
                                                                                            );
                                                                                            setShowPostDesktopActionsDropdown(
                                                                                                false,
                                                                                            );
                                                                                        }}
                                                                                        className="flex items-center w-full gap-3 px-4 py-3 text-sm transition-colors rounded-md text-main-text-light hover:bg-surface-2-light dark:text-main-text-dark dark:hover:bg-surface-3-dark"
                                                                                    >
                                                                                        <svg
                                                                                            xmlns="http://www.w3.org/2000/svg"
                                                                                            fill="none"
                                                                                            viewBox="0 0 24 24"
                                                                                            strokeWidth={
                                                                                                1.5
                                                                                            }
                                                                                            stroke="currentColor"
                                                                                            className="w-5 h-5"
                                                                                        >
                                                                                            <path
                                                                                                strokeLinecap="round"
                                                                                                strokeLinejoin="round"
                                                                                                d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                                                                                            />
                                                                                            <path
                                                                                                strokeLinecap="round"
                                                                                                strokeLinejoin="round"
                                                                                                d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                                                                                            />
                                                                                        </svg>

                                                                                        <span className="font-normal">
                                                                                            {__(
                                                                                                'Spatiotemporal Info',
                                                                                            )}
                                                                                        </span>
                                                                                    </button>
                                                                                )}

                                                                            <span className="flex items-center w-full gap-3 px-4 py-3 text-xs transition-colors rounded-md text-main-text-light dark:text-main-text-dark">
                                                                                <span>
                                                                                    {__(
                                                                                        'Post Created',
                                                                                    )}
                                                                                    :
                                                                                    <p>
                                                                                        {
                                                                                            feedGallery?.added_at
                                                                                        }{' '}
                                                                                        {
                                                                                            feedGallery?.created_at_time
                                                                                        }
                                                                                    </p>
                                                                                </span>
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <div>
                                                                {feedGallery?.tag && (
                                                                    <button
                                                                        onClick={() => {
                                                                            shouldCleanupBrowserHistoryRef.current = false;
                                                                            navigateToHashtag(
                                                                                feedGallery?.tag,
                                                                            );
                                                                        }}
                                                                        className="z-[90] flex items-center justify-center rounded-full p-2 text-[14px] font-medium text-main-text-light transition-all duration-200 hover:bg-surface-1-light dark:text-main-text-dark dark:hover:bg-surface-2-dark"
                                                                    >
                                                                        {feedGallery?.tag}
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Product Details */}
                                                        <div
                                                            key={feedGallery?.slug}
                                                            className="max-w-lg"
                                                        >
                                                            <div className="flex flex-col items-start gap-4">
                                                                <SmartphoneDetails
                                                                    key={feedGallery?.slug}
                                                                    // StockBadge={StockBadge({
                                                                    //     feedGallery,
                                                                    // })}
                                                                    currency={currency}
                                                                    product={feedGallery}
                                                                />

                                                                {/* Divider */}
                                                                {feedGallery?.addons?.length >
                                                                    0 && (
                                                                    <div className="mt-1 h-px w-full bg-[#c8c8c8] dark:bg-surface-3-dark" />
                                                                )}

                                                                {feedGallery?.addons?.length >
                                                                    0 && (
                                                                    <ProductSelectInput
                                                                        InputName={__('Add-ons')}
                                                                        Name={'addons'}
                                                                        Id={'addons'}
                                                                        items={feedGallery?.addons}
                                                                        Value={selectedAddon}
                                                                        itemKey={'name'}
                                                                        Placeholder={__('Addons')}
                                                                        Action={(value) => {
                                                                            setSelectedAddon(value);
                                                                        }}
                                                                        customPlaceHolder={true}
                                                                    />
                                                                )}

                                                                {/* Divider */}
                                                                {(cartItemAddons?.filter(
                                                                    (addon) =>
                                                                        addon.smartphone_id ===
                                                                        feedGallery?.id,
                                                                )?.length > 0 ||
                                                                    cartItemSmartphones?.filter(
                                                                        (smartphone) =>
                                                                            smartphone.smartphone_id ===
                                                                            feedGallery?.id,
                                                                    )?.length > 0) && (
                                                                    <div className="mt-5 h-px w-full bg-[#c8c8c8] dark:bg-surface-3-dark" />
                                                                )}

                                                                {/* Smartphone Items */}
                                                                {cartItemSmartphones?.length > 0 &&
                                                                    cartItemSmartphones
                                                                        ?.filter(
                                                                            (smartphone) =>
                                                                                smartphone.smartphone_id ===
                                                                                feedGallery?.id,
                                                                        )
                                                                        .map(
                                                                            (smartphone, index) => (
                                                                                <div
                                                                                    className="w-full p-4 rounded-sm bg-surface-1-light dark:bg-surface-2-dark"
                                                                                    key={index}
                                                                                >
                                                                                    <div className="flex flex-wrap items-center justify-between gap-4">
                                                                                        <div className="flex flex-col items-start gap-3">
                                                                                            {/* Product Name */}
                                                                                            <div className="flex-1 min-w-0">
                                                                                                <p className="text-sm truncate text-main-text-light dark:text-main-text-dark">
                                                                                                    {
                                                                                                        smartphone?.name
                                                                                                    }{' '}
                                                                                                    /{' '}
                                                                                                    {
                                                                                                        smartphone?.capacity
                                                                                                    }{' '}
                                                                                                    /{' '}
                                                                                                    {
                                                                                                        smartphone?.color_name
                                                                                                    }
                                                                                                </p>
                                                                                            </div>

                                                                                            {/* Quantity Selector */}
                                                                                            <div className="inline-flex items-center overflow-hidden rounded-md border border-[#c8c8c8] dark:border-surface-3-dark">
                                                                                                {/* DECREASE */}
                                                                                                <button
                                                                                                    onClick={() =>
                                                                                                        handleSmartphoneDecrease(
                                                                                                            smartphone?.color_id,
                                                                                                        )
                                                                                                    }
                                                                                                    className="flex items-center justify-center transition-colors bg-white h-9 w-9 text-main-text-light hover:bg-surface-2-light disabled:opacity-50 dark:bg-surface-2-dark dark:text-main-text-dark dark:hover:bg-surface-3-dark"
                                                                                                >
                                                                                                    <svg
                                                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                                                        viewBox="0 0 24 24"
                                                                                                        fill="none"
                                                                                                        stroke="currentColor"
                                                                                                        strokeWidth={
                                                                                                            1.5
                                                                                                        }
                                                                                                        className="w-4 h-4"
                                                                                                    >
                                                                                                        <path
                                                                                                            strokeLinecap="round"
                                                                                                            strokeLinejoin="round"
                                                                                                            d="M19.5 12h-15"
                                                                                                        />
                                                                                                    </svg>
                                                                                                </button>

                                                                                                {/* QUANTITY */}
                                                                                                <span className="flex h-9 min-w-[3rem] items-center justify-center border-l border-r border-[#c8c8c8] bg-white text-sm font-semibold text-sub-text-light dark:border-surface-3-dark dark:bg-surface-2-dark dark:text-sub-text-dark">
                                                                                                    {
                                                                                                        smartphone?.quantity
                                                                                                    }
                                                                                                </span>

                                                                                                {/* INCREASE */}
                                                                                                <button
                                                                                                    onClick={() =>
                                                                                                        handleSmartphoneIncrease(
                                                                                                            smartphone?.color_id,
                                                                                                        )
                                                                                                    }
                                                                                                    className="flex items-center justify-center transition-colors bg-white h-9 w-9 text-main-text-light hover:bg-surface-2-light dark:bg-surface-2-dark dark:text-main-text-dark dark:hover:bg-surface-3-dark"
                                                                                                >
                                                                                                    <svg
                                                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                                                        viewBox="0 0 24 24"
                                                                                                        fill="none"
                                                                                                        stroke="currentColor"
                                                                                                        strokeWidth={
                                                                                                            1.5
                                                                                                        }
                                                                                                        className="w-4 h-4"
                                                                                                    >
                                                                                                        <path
                                                                                                            strokeLinecap="round"
                                                                                                            strokeLinejoin="round"
                                                                                                            d="M12 4.5v15m7.5-7.5h-15"
                                                                                                        />
                                                                                                    </svg>
                                                                                                </button>
                                                                                            </div>
                                                                                        </div>

                                                                                        {/* Price */}
                                                                                        <div className="flex-shrink-0">
                                                                                            <DisplayPrice
                                                                                                usdAmount={
                                                                                                    smartphone?.price
                                                                                                }
                                                                                                showCode
                                                                                                showEstimatedLabel={
                                                                                                    false
                                                                                                }
                                                                                                className="text-xl font-medium text-main-text-light dark:text-main-text-dark"
                                                                                            />
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            ),
                                                                        )}

                                                                {/* Addon Items */}
                                                                {cartItemAddons?.length > 0 &&
                                                                    cartItemAddons
                                                                        ?.filter(
                                                                            (addon) =>
                                                                                addon.smartphone_id ===
                                                                                feedGallery?.id,
                                                                        )
                                                                        .map((addon, index) => (
                                                                            <div
                                                                                className="relative w-full p-4 rounded-sm bg-surface-1-light dark:bg-surface-2-dark"
                                                                                key={index}
                                                                            >
                                                                                {/* Remove Addon */}
                                                                                <button
                                                                                    onClick={() => {
                                                                                        handleAddonRemove(
                                                                                            addon?.id,
                                                                                        );
                                                                                    }}
                                                                                    className="absolute right-2 top-0 z-[90] rounded-full p-2 text-main-text-light transition dark:text-main-text-dark"
                                                                                    aria-label="Close modal"
                                                                                >
                                                                                    <svg
                                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                                        fill="none"
                                                                                        viewBox="0 0 24 24"
                                                                                        strokeWidth={
                                                                                            2
                                                                                        }
                                                                                        stroke="currentColor"
                                                                                        className="w-4 h-4"
                                                                                    >
                                                                                        <path
                                                                                            strokeLinecap="round"
                                                                                            strokeLinejoin="round"
                                                                                            d="M6 18L18 6M6 6l12 12"
                                                                                        />
                                                                                    </svg>
                                                                                </button>

                                                                                <div className="flex flex-wrap items-center justify-between gap-4">
                                                                                    <div className="flex flex-col items-start gap-3">
                                                                                        {/* Addon Name */}
                                                                                        <div className="flex-1 min-w-0">
                                                                                            <p className="text-sm truncate text-main-text-light dark:text-main-text-dark">
                                                                                                {
                                                                                                    addon?.name
                                                                                                }
                                                                                            </p>
                                                                                        </div>

                                                                                        {/* Quantity Selector */}
                                                                                        <div className="inline-flex items-center overflow-hidden rounded-md border border-[#c8c8c8] dark:border-surface-3-dark">
                                                                                            {/* DECREASE */}
                                                                                            <button
                                                                                                onClick={() =>
                                                                                                    handleAddonDecrease(
                                                                                                        addon?.id,
                                                                                                    )
                                                                                                }
                                                                                                className="flex items-center justify-center transition-colors bg-white h-9 w-9 text-main-text-light hover:bg-surface-2-light disabled:opacity-50 dark:bg-surface-2-dark dark:text-main-text-dark dark:hover:bg-surface-3-dark"
                                                                                            >
                                                                                                <svg
                                                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                                                    viewBox="0 0 24 24"
                                                                                                    fill="none"
                                                                                                    stroke="currentColor"
                                                                                                    strokeWidth={
                                                                                                        1.5
                                                                                                    }
                                                                                                    className="w-4 h-4"
                                                                                                >
                                                                                                    <path
                                                                                                        strokeLinecap="round"
                                                                                                        strokeLinejoin="round"
                                                                                                        d="M19.5 12h-15"
                                                                                                    />
                                                                                                </svg>
                                                                                            </button>

                                                                                            {/* QUANTITY */}
                                                                                            <span className="flex h-9 min-w-[3rem] items-center justify-center border-l border-r border-[#c8c8c8] bg-white text-sm font-semibold text-sub-text-light dark:border-surface-3-dark dark:bg-surface-2-dark dark:text-sub-text-dark">
                                                                                                {
                                                                                                    addon?.quantity
                                                                                                }
                                                                                            </span>

                                                                                            {/* INCREASE */}
                                                                                            <button
                                                                                                onClick={() =>
                                                                                                    handleAddonIncrease(
                                                                                                        addon?.id,
                                                                                                    )
                                                                                                }
                                                                                                className="flex items-center justify-center transition-colors bg-white h-9 w-9 text-main-text-light hover:bg-surface-2-light dark:bg-surface-2-dark dark:text-main-text-dark dark:hover:bg-surface-3-dark"
                                                                                            >
                                                                                                <svg
                                                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                                                    viewBox="0 0 24 24"
                                                                                                    fill="none"
                                                                                                    stroke="currentColor"
                                                                                                    strokeWidth={
                                                                                                        1.5
                                                                                                    }
                                                                                                    className="w-4 h-4"
                                                                                                >
                                                                                                    <path
                                                                                                        strokeLinecap="round"
                                                                                                        strokeLinejoin="round"
                                                                                                        d="M12 4.5v15m7.5-7.5h-15"
                                                                                                    />
                                                                                                </svg>
                                                                                            </button>
                                                                                        </div>
                                                                                    </div>

                                                                                    {/* Price */}
                                                                                    <div className="flex-shrink-0">
                                                                                        <DisplayPrice
                                                                                            usdAmount={
                                                                                                addon?.price
                                                                                            }
                                                                                            showCode
                                                                                            showEstimatedLabel={
                                                                                                false
                                                                                            }
                                                                                            className="text-xl font-medium text-main-text-light dark:text-main-text-dark"
                                                                                        />
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        ))}

                                                                {/* Divider */}
                                                                <div className="mt-5 h-px w-full bg-[#c8c8c8] dark:bg-surface-3-dark" />

                                                                {/* Product Price */}
                                                                <div className="flex items-center w-full">
                                                                    <span className="font-medium text-left text-main-text-light dark:text-main-text-dark">
                                                                        {__('Total Price')}
                                                                    </span>
                                                                    <div className="ml-auto flex items-center gap-2">
                                                                        {feedGallery?.is_sold_out && (
                                                                            <span className="inline-block rounded bg-red-600 px-2 py-0.5 text-[11px] font-semibold text-white">
                                                                                {__('Sold Out')}
                                                                            </span>
                                                                        )}
                                                                        <DisplayPrice
                                                                            usdAmount={
                                                                                smartphoneTotalPrice[
                                                                                    feedGallery?.id
                                                                                ]
                                                                            }
                                                                            showEstimatedLabel={false}
                                                                            className={`text-3xl font-semibold text-right text-main-text-light dark:text-main-text-dark ${feedGallery?.is_sold_out ? 'line-through' : ''}`}
                                                                        />
                                                                    </div>
                                                                </div>

                                                                {/* Buttons */}
                                                                <div className="flex w-full gap-x-4">
                                                                    {auth?.user && (
                                                                        <>
                                                                            {/* Add to cart */}
                                                                            <button
                                                                                onClick={() => {
                                                                                    handleAddCartItem(
                                                                                        cartItemSmartphones?.filter(
                                                                                            (
                                                                                                item,
                                                                                            ) =>
                                                                                                item.smartphone_id ===
                                                                                                feedGallery?.id,
                                                                                        ),
                                                                                        cartItemAddons?.filter(
                                                                                            (
                                                                                                item,
                                                                                            ) =>
                                                                                                item.smartphone_id ===
                                                                                                feedGallery?.id,
                                                                                        ),
                                                                                        feedGallery?.inventory_items_count,
                                                                                    );
                                                                                }}
                                                                                disabled={
                                                                                    !canActionOnSmartphone ||
                                                                                    feedGallery?.is_sold_out
                                                                                }
                                                                                className={`text-md h-12 flex-1 rounded-md border border-main-text-light bg-white text-center font-semibold text-main-text-light transition hover:bg-main-text-dark/80 dark:border-main-text-dark dark:bg-main-text-dark dark:bg-main-text-dark/80 ${(!canActionOnSmartphone || feedGallery?.is_sold_out) && 'cursor-not-allowed opacity-50'}`}
                                                                            >
                                                                                <div className="flex items-center justify-center">
                                                                                    {cartProcessing && (
                                                                                        <Spinner />
                                                                                    )}

                                                                                    <span>
                                                                                        {feedGallery?.is_sold_out ? __('Sold Out') : __('Add to cart')}
                                                                                    </span>
                                                                                </div>
                                                                            </button>

                                                                            {/* Buy now */}
                                                                            <button
                                                                                onClick={() =>
                                                                                    handleBuyNow(
                                                                                        cartItemSmartphones?.filter(
                                                                                            (
                                                                                                item,
                                                                                            ) =>
                                                                                                item.smartphone_id ===
                                                                                                feedGallery?.id,
                                                                                        ),
                                                                                        cartItemAddons?.filter(
                                                                                            (
                                                                                                item,
                                                                                            ) =>
                                                                                                item.smartphone_id ===
                                                                                                feedGallery?.id,
                                                                                        ),
                                                                                        feedGallery?.id,
                                                                                        feedGallery?.inventory_items_count,
                                                                                    )
                                                                                }
                                                                                disabled={
                                                                                    !canActionOnSmartphone ||
                                                                                    feedGallery?.is_sold_out
                                                                                }
                                                                                className={`text-md h-12 flex-1 rounded-md border border-main-text-dark bg-main-text-light font-semibold text-main-text-dark transition hover:bg-main-text-light/80 dark:bg-main-text-light dark:hover:bg-main-text-light/80 ${(!canActionOnSmartphone || feedGallery?.is_sold_out) && 'cursor-not-allowed opacity-50'}`}
                                                                            >
                                                                                <div className="flex items-center justify-center">
                                                                                    {buyNowProcessing && (
                                                                                        <Spinner />
                                                                                    )}

                                                                                    <span>
                                                                                        {feedGallery?.is_sold_out ? __('Sold Out') : __('Buy now')}
                                                                                    </span>
                                                                                </div>
                                                                            </button>
                                                                        </>
                                                                    )}

                                                                    {!auth?.user && (
                                                                        <>
                                                                            {/* Login */}
                                                                            <button
                                                                                onClick={() => {
                                                                                    shouldCleanupBrowserHistoryRef.current = false;
                                                                                    router.get(
                                                                                        route(
                                                                                            'login',
                                                                                        ),
                                                                                        {
                                                                                            redirect:
                                                                                                window
                                                                                                    .location
                                                                                                    .pathname +
                                                                                                window
                                                                                                    .location
                                                                                                    .search,
                                                                                        },
                                                                                    );
                                                                                }}
                                                                                className="flex-1 h-12 font-semibold transition bg-white border rounded-md text-md border-main-text-light text-main-text-light hover:bg-main-text-dark/80 dark:border-main-text-dark dark:bg-main-text-dark dark:bg-main-text-dark/80"
                                                                            >
                                                                                {__('Login')}
                                                                            </button>

                                                                            {/*Register*/}
                                                                            <button
                                                                                onClick={() => {
                                                                                    shouldCleanupBrowserHistoryRef.current = false;
                                                                                    router.get(
                                                                                        route(
                                                                                            'register',
                                                                                        ),
                                                                                        {
                                                                                            redirect:
                                                                                                window
                                                                                                    .location
                                                                                                    .pathname +
                                                                                                window
                                                                                                    .location
                                                                                                    .search,
                                                                                        },
                                                                                    );
                                                                                }}
                                                                                className="flex-1 h-12 font-semibold transition border rounded-md text-md border-main-text-dark bg-main-text-light text-main-text-dark hover:bg-main-text-light/80 dark:bg-main-text-light dark:hover:bg-main-text-light/80"
                                                                            >
                                                                                {__('Register')}
                                                                            </button>
                                                                        </>
                                                                    )}
                                                                </div>

                                                                {feedGallery?.product_details && (
                                                                    <>
                                                                        {/* Product Details */}
                                                                        <SmartphoneDetailsAccordion
                                                                            productDetails={
                                                                                feedGallery?.product_details
                                                                            }
                                                                            label={__(
                                                                                'Product Details',
                                                                            )}
                                                                            onToggle={
                                                                                setToggleAccordion
                                                                            }
                                                                            defaultOpen={
                                                                                toggleAccordion
                                                                            }
                                                                            scrollContainerRef={
                                                                                productRightPanelScrollRef
                                                                            }
                                                                        />
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {spatiotemporalInfoModal && (
                    <SpatiotemporalInfoModal
                        onClose={() => {
                            setSpatiotemporalInfoModal(false);
                        }}
                        post={feedGallery}
                    />
                )}
            </>
        );
    }

    // Non Text POSTS
    if (feedGallery !== null && feedGallery?.type === 'posts') {
        return (
            <>
                <div className="absolute inset-y-0 left-[var(--sidebar-w)] right-0 z-[60] bg-backgroundLight dark:bg-backgroundDark">
                    {/* Modal Container */}

                    <div className="flex items-center justify-center w-full h-full overflow-hidden">
                        <div className="relative mx-auto w-full max-w-[1300px] px-6 lg:px-[96px] xl:px-[120px]">
                            {/* Navigation Arrows + Close Button Starts */}
                            {/* Left Arrow */}
                            <button
                                onClick={handleLeftPrevious}
                                disabled={isLeftDisabled}
                                className={`absolute left-[clamp(0px,2vw,0px)] top-1/2 z-[60] -translate-y-1/2 rounded-full bg-surface-1-light p-3 transition-all duration-200 hover:scale-110 dark:bg-surface-2-dark dark:hover:bg-surface-3-dark ${isLeftDisabled ? 'cursor-not-allowed opacity-20' : ''}`}
                                aria-label="Previous item"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    className="w-5 h-5 text-main-text-light dark:text-main-text-dark"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeWidth={2}
                                        strokeLinejoin="round"
                                        d="M15.75 19.5 8.25 12l7.5-7.5"
                                    />
                                </svg>
                            </button>

                            {/* Close Button */}
                            <button
                                onClick={() => {
                                    if (previous_url) {
                                        shouldCleanupBrowserHistoryRef.current = false;
                                        router.visit(previous_url);
                                    } else {
                                        setFeedGallery(null);
                                        setFeedOpen(false);
                                        setMediaItems([]);
                                        mediaThumbRefs.current = {};
                                        window.history.replaceState(
                                            {},
                                            '',
                                            window.location.pathname,
                                        );
                                    }
                                }}
                                className="absolute right-[clamp(35px,2vw,20px)] top-0 z-[90] flex h-[32px] w-[32px] items-center justify-center rounded-full transition-all duration-200 hover:bg-surface-1-light dark:hover:bg-surface-2-dark"
                                aria-label="Close modal"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={2}
                                    stroke="currentColor"
                                    className="w-5 h-5 text-main-text-light dark:text-main-text-dark"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>

                            <div className="absolute right-[clamp(30px,2vw,20px)] top-1/2 z-[60] flex -translate-y-1/2 flex-col items-center gap-8">
                                {/* Up Arrow */}
                                <button
                                    onClick={handleTopPrevious}
                                    disabled={isTopDisabled}
                                    className={`rounded-full bg-surface-1-light p-3 transition-all duration-200 hover:scale-110 dark:bg-surface-2-dark dark:hover:bg-surface-3-dark ${isTopDisabled ? 'opacity-20' : ''}`}
                                    aria-label="Previous Item"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        className="w-5 h-5 text-main-text-light dark:text-main-text-dark"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeWidth={2}
                                            strokeLinejoin="round"
                                            d="m4.5 15.75 7.5-7.5 7.5 7.5"
                                        />
                                    </svg>
                                </button>

                                {/* Right Arrow */}
                                <button
                                    onClick={handleRightNext}
                                    disabled={isRightDisabled}
                                    className={`rounded-full bg-surface-1-light p-3 transition-all duration-200 hover:scale-110 dark:bg-surface-2-dark dark:hover:bg-surface-3-dark ${isRightDisabled ? 'opacity-20' : ''}`}
                                    aria-label="Next item"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        className="w-5 h-5 text-main-text-light dark:text-main-text-dark"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeWidth={2}
                                            strokeLinejoin="round"
                                            d="m8.25 4.5 7.5 7.5-7.5 7.5"
                                        />
                                    </svg>
                                </button>

                                {/* Down Arrow */}
                                <button
                                    onClick={handleBottomNext}
                                    disabled={isBottomDisabled}
                                    className={`rounded-full bg-surface-1-light p-3 transition-all duration-200 hover:scale-110 dark:bg-surface-2-dark dark:hover:bg-surface-3-dark ${isBottomDisabled ? 'opacity-20' : ''}`}
                                    aria-label="Next item"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={2}
                                        stroke="currentColor"
                                        className="w-5 h-5 text-main-text-light dark:text-main-text-dark"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="m19.5 8.25-7.5 7.5-7.5-7.5"
                                        />
                                    </svg>
                                </button>
                            </div>
                            {/* Navigation Arrows + Close Button Ends */}

                            <div
                                className={`bg-backgroundLight transition-all duration-300 dark:bg-backgroundDark`}
                            >
                                {/* Scrollable Content */}
                                <div className="h-full">
                                    <div className="flex h-[83vh] min-h-0 flex-col gap-[40px] bg-backgroundLight dark:bg-backgroundDark lg:flex-row lg:items-start">
                                        {feedGallery && (
                                            <>
                                                {/* Left Side - Image Viewer */}
                                                {((Array.isArray(feedGallery?.post_video_urls) &&
                                                    feedGallery.post_video_urls.length > 0) ||
                                                    (Array.isArray(feedGallery?.post_image_urls) &&
                                                        feedGallery.post_image_urls.length >
                                                            0)) && (
                                                    <div
                                                        className="relative flex h-full w-full justify-center lg:w-[50%] xl:w-[50%]"
                                                        ref={MediaRef}
                                                    >
                                                        <div className="aspect-[3/2] h-full w-full max-w-[520px] lg:aspect-[2/4]">
                                                            {/* Animated layers */}
                                                            <AnimatePresence
                                                                initial={false}
                                                                custom={direction}
                                                            >
                                                                <div className="absolute inset-0 flex items-center justify-center w-full h-full">
                                                                    {mediaItems.map((item, idx) => {
                                                                        const isCurrent =
                                                                            idx ===
                                                                            selectedMediaIndex;

                                                                        return (
                                                                            <motion.div
                                                                                key={`${idx}-${item.url}`}
                                                                                initial={false}
                                                                                animate={{
                                                                                    opacity:
                                                                                        isCurrent
                                                                                            ? 1
                                                                                            : 0,
                                                                                    zIndex: isCurrent
                                                                                        ? 1
                                                                                        : 0,
                                                                                }}
                                                                                transition={{
                                                                                    duration: 0.4,
                                                                                    ease: 'easeInOut',
                                                                                }}
                                                                                className="absolute inset-0 flex items-center justify-center w-full h-full"
                                                                            >
                                                                                {item.type ===
                                                                                'image' ? (
                                                                                    <img
                                                                                        src={
                                                                                            item.url ||
                                                                                            Placeholder
                                                                                        }
                                                                                        alt={`Media ${idx}`}
                                                                                        className="object-cover object-center w-full h-full rounded-md"
                                                                                        loading={
                                                                                            isCurrent
                                                                                                ? 'eager'
                                                                                                : 'lazy'
                                                                                        }
                                                                                        decoding="async"
                                                                                        fetchpriority={
                                                                                            isCurrent
                                                                                                ? 'high'
                                                                                                : 'low'
                                                                                        }
                                                                                        onLoad={() =>
                                                                                            loadedCache.current.add(
                                                                                                item.url,
                                                                                            )
                                                                                        }
                                                                                        onError={(
                                                                                            e,
                                                                                        ) =>
                                                                                            (e.target.src =
                                                                                                Placeholder)
                                                                                        }
                                                                                    />
                                                                                ) : (
                                                                                    <CustomizedVideoPlayer
                                                                                        autoPlay={
                                                                                            videoAutoplay
                                                                                        }
                                                                                        className="object-cover object-center w-full h-full rounded-md"
                                                                                        videoUrl={
                                                                                            item.url
                                                                                        }
                                                                                        Preload="metadata"
                                                                                        thumbnail={
                                                                                            item?.thumbnail_url ||
                                                                                            Placeholder
                                                                                        }
                                                                                        OnLoadedMetaData={() =>
                                                                                            loadedCache.current.add(
                                                                                                item.url,
                                                                                            )
                                                                                        }
                                                                                        slug={
                                                                                            feedGallery?.slug
                                                                                        }
                                                                                    />
                                                                                )}
                                                                            </motion.div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </AnimatePresence>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Right Side - Content & Details */}
                                                <div className="flex h-full w-full flex-col lg:w-[40%] xl:w-[45%]">
                                                    {/* Image Thumbnails Strip */}
                                                    <div className={`flex items-center gap-0`}>
                                                        {/* Prev indicator */}
                                                        {canGoPrev && (
                                                            <button
                                                                className="mb-2 mr-2 flex h-[clamp(66px,5.2vw,66px)] w-[clamp(40px,2.5vw,40px)] flex-shrink-0 items-center justify-center rounded-md bg-surface-2-light dark:bg-surface-2-dark"
                                                                onClick={() => {
                                                                    const newPage = thumbPage - 1;
                                                                    const firstIndex =
                                                                        newPage * MAX_THUMBS;

                                                                    setThumbPage(newPage);
                                                                    setSelectedMediaIndex(
                                                                        firstIndex,
                                                                    );
                                                                }}
                                                            >
                                                                <svg
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    viewBox="0 0 24 24"
                                                                    fill="currentColor"
                                                                    className="size-4 text-sub-text-light dark:text-main-text-dark"
                                                                >
                                                                    <path
                                                                        fillRule="evenodd"
                                                                        d="M19.5 18.347c0 1.427-1.529 2.33-2.779 1.643L5.181 13.643c-1.295-.712-1.295-2.573 0-3.286L16.721 4.01c1.25-.687 2.779.217 2.779 1.643v12.694Z"
                                                                        clipRule="evenodd"
                                                                    />
                                                                </svg>
                                                            </button>
                                                        )}

                                                        {/* Thumbnails */}
                                                        {((Array.isArray(
                                                            feedGallery?.post_video_urls,
                                                        ) &&
                                                            feedGallery.post_video_urls.length >
                                                                1) ||
                                                            (Array.isArray(
                                                                feedGallery?.post_image_urls,
                                                            ) &&
                                                                feedGallery.post_image_urls.length >
                                                                    1)) && (
                                                            <div
                                                                ref={MediaThumbRef}
                                                                className="flex items-center gap-2 mb-3 overflow-x-auto scrollbar-none scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700"
                                                            >
                                                                {/* Render thumbnails */}
                                                                {visibleThumbs.map(
                                                                    (mediaItem, index) => {
                                                                        const realIndex =
                                                                            startIndex + index;
                                                                        return (
                                                                            <button
                                                                                key={realIndex}
                                                                                ref={(el) => {
                                                                                    mediaThumbRefs.current[
                                                                                        realIndex
                                                                                    ] = el;
                                                                                }}
                                                                                onClick={() =>
                                                                                    setSelectedMediaIndex(
                                                                                        realIndex,
                                                                                    )
                                                                                }
                                                                                // className={`aspect-square w-[clamp(48px,5vw,64px)] flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all ${selectedMediaIndex ===
                                                                                //     realIndex
                                                                                //     ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800'
                                                                                //     : 'border-gray-300 hover:border-gray-400 dark:border-gray-700'
                                                                                //     }`}

                                                                                className={`aspect-square ${selectedMediaIndex === realIndex ? 'border-[3px] border-main-text-light dark:border-main-text-dark' : ''} w-[clamp(48px,5vw,64px)] flex-shrink-0 overflow-hidden rounded-md transition-all`}
                                                                            >
                                                                                {mediaItem?.type ===
                                                                                'image' ? (
                                                                                    <img
                                                                                        src={
                                                                                            mediaItem?.url ||
                                                                                            Placeholder
                                                                                        }
                                                                                        alt={`Thumbnail ${realIndex + 1}`}
                                                                                        className="object-cover w-full h-full"
                                                                                        loading={
                                                                                            selectedMediaIndex ===
                                                                                            realIndex
                                                                                                ? 'eager'
                                                                                                : 'lazy'
                                                                                        }
                                                                                        decoding="async"
                                                                                        fetchpriority={
                                                                                            selectedMediaIndex ===
                                                                                            realIndex
                                                                                                ? 'high'
                                                                                                : 'low'
                                                                                        }
                                                                                        onError={(
                                                                                            e,
                                                                                        ) =>
                                                                                            (e.target.src =
                                                                                                Placeholder)
                                                                                        }
                                                                                    />
                                                                                ) : (
                                                                                    <img
                                                                                        src={
                                                                                            mediaItem?.thumbnail_url ||
                                                                                            Placeholder
                                                                                        }
                                                                                        alt={`Thumbnail ${index + 1}`}
                                                                                        className="object-cover w-full h-full"
                                                                                        loading={
                                                                                            selectedMediaIndex ===
                                                                                            realIndex
                                                                                                ? 'eager'
                                                                                                : 'lazy'
                                                                                        }
                                                                                        decoding="async"
                                                                                        fetchpriority={
                                                                                            selectedMediaIndex ===
                                                                                            realIndex
                                                                                                ? 'high'
                                                                                                : 'low'
                                                                                        }
                                                                                        onError={(
                                                                                            e,
                                                                                        ) =>
                                                                                            (e.target.src =
                                                                                                Placeholder)
                                                                                        }
                                                                                    />
                                                                                )}
                                                                            </button>
                                                                        );
                                                                    },
                                                                )}
                                                            </div>
                                                        )}

                                                        {/* Next indicator */}
                                                        {canGoNext && (
                                                            <button
                                                                className="mx-2 mb-2 flex h-[clamp(66px,5.2vw,66px)] w-[clamp(40px,2.5vw,40px)] flex-shrink-0 items-center justify-center rounded-md bg-surface-2-light dark:bg-surface-2-dark"
                                                                onClick={() => {
                                                                    const newPage = thumbPage + 1;
                                                                    const firstIndex =
                                                                        newPage * MAX_THUMBS;

                                                                    setThumbPage(newPage);
                                                                    setSelectedMediaIndex(
                                                                        firstIndex,
                                                                    );
                                                                }}
                                                            >
                                                                <svg
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    viewBox="0 0 24 24"
                                                                    fill="currentColor"
                                                                    className="size-4 text-sub-text-light dark:text-main-text-dark"
                                                                >
                                                                    <path
                                                                        fillRule="evenodd"
                                                                        d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z"
                                                                        clipRule="evenodd"
                                                                    />
                                                                </svg>
                                                            </button>
                                                        )}
                                                    </div>

                                                    {/* Content Area */}
                                                    <div className="flex-1 min-h-0 overflow-y-auto scrollbar-none">
                                                        {/* Tag and Actions Header */}
                                                        <div className="flex justify-between mb-2 align-start">
                                                            {/* Three Dot Menu */}
                                                            <div className="relative flex-1">
                                                                <button
                                                                    data-post-actions-button
                                                                    className="flex h-[36px] w-[36px] items-center justify-center rounded-full transition-all duration-200 hover:bg-surface-1-light dark:hover:bg-surface-2-dark"
                                                                >
                                                                    <svg
                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                        fill="none"
                                                                        viewBox="0 0 24 24"
                                                                        strokeWidth={2.5}
                                                                        stroke="currentColor"
                                                                        className="w-5 h-5 text-main-text-light dark:text-main-text-dark"
                                                                    >
                                                                        <path
                                                                            strokeLinecap="round"
                                                                            strokeLinejoin="round"
                                                                            d="
      M3.5 12a.75.75 0 1 1-1.5 0a.75.75 0 0 1 1.5 0
      M12 12a.75.75 0 1 1-1.5 0a.75.75 0 0 1 1.5 0
      M20.5 12a.75.75 0 1 1-1.5 0a.75.75 0 0 1 1.5 0
    "
                                                                        />
                                                                    </svg>
                                                                </button>

                                                                {showPostDesktopActionsDropdown && (
                                                                    <div
                                                                        data-post-actions-dropdown
                                                                        className="absolute left-0 z-50 w-56 border rounded-md top-full border-surface-3-light bg-backgroundLight dark:border-surface-3-dark dark:bg-surface-1-dark"
                                                                    >
                                                                        <div className="py-2">
                                                                            {/* QR Code */}
                                                                            <button
                                                                                onClick={() => {
                                                                                    setShowQrCode(
                                                                                        true,
                                                                                    );
                                                                                    setShowPostDesktopActionsDropdown(
                                                                                        false,
                                                                                    );
                                                                                }}
                                                                                className="flex items-center w-full gap-3 px-4 py-3 text-sm transition-colors rounded-md text-main-text-light hover:bg-surface-2-light dark:text-main-text-dark dark:hover:bg-surface-3-dark"
                                                                            >
                                                                                <svg
                                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                                    fill="none"
                                                                                    viewBox="0 0 24 24"
                                                                                    strokeWidth={
                                                                                        1.5
                                                                                    }
                                                                                    stroke="currentColor"
                                                                                    className="w-5 h-5"
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
                                                                                <span className="font-normal">
                                                                                    {__('QR Code')}
                                                                                </span>
                                                                            </button>

                                                                            {/* Bookmark */}
                                                                            {auth?.user && (
                                                                                <button
                                                                                    onClick={(
                                                                                        e,
                                                                                    ) => {
                                                                                        e.stopPropagation();
                                                                                        router.put(
                                                                                            route(
                                                                                                'website.posts.bookmark',
                                                                                                feedGallery?.id,
                                                                                            ),
                                                                                            {
                                                                                                post_id:
                                                                                                    feedGallery?.id,
                                                                                            },
                                                                                            {
                                                                                                preserveScroll: true,
                                                                                                preserveUrl: true,
                                                                                                onSuccess:
                                                                                                    () => {
                                                                                                        feedGallery.is_bookmarked =
                                                                                                            !feedGallery.is_bookmarked;
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
                                                                                    className="flex items-center w-full gap-3 px-4 py-3 text-sm transition-colors rounded-md text-main-text-light hover:bg-surface-2-light dark:text-main-text-dark dark:hover:bg-surface-3-dark"
                                                                                >
                                                                                    <svg
                                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                                        fill={
                                                                                            feedGallery?.is_bookmarked
                                                                                                ? isDarkMode
                                                                                                    ? '#fff'
                                                                                                    : '#222'
                                                                                                : 'none'
                                                                                        }
                                                                                        stroke={
                                                                                            feedGallery?.is_bookmarked
                                                                                                ? isDarkMode
                                                                                                    ? '#fff'
                                                                                                    : '#222'
                                                                                                : 'currentColor'
                                                                                        }
                                                                                        strokeWidth={
                                                                                            1.5
                                                                                        }
                                                                                        viewBox="0 0 24 24"
                                                                                        className="w-5 h-5"
                                                                                    >
                                                                                        <path
                                                                                            strokeLinecap="round"
                                                                                            strokeLinejoin="round"
                                                                                            d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z"
                                                                                        />
                                                                                    </svg>
                                                                                    <span className="font-normal">
                                                                                        {feedGallery?.is_bookmarked
                                                                                            ? __(
                                                                                                  'Remove Bookmarker',
                                                                                              )
                                                                                            : __(
                                                                                                  'Bookmarker',
                                                                                              )}
                                                                                    </span>
                                                                                </button>
                                                                            )}

                                                                            {/* Copy Link */}
                                                                            <button
                                                                                onClick={(e) => {
                                                                                    const url =
                                                                                        route(
                                                                                            'home',
                                                                                        ) +
                                                                                        generateURL(
                                                                                            feedGallery,
                                                                                            true,
                                                                                            true,
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
                                                                                className="flex items-center w-full gap-3 px-4 py-3 text-sm transition-colors rounded-md text-main-text-light hover:bg-surface-2-light dark:text-main-text-dark dark:hover:bg-surface-3-dark"
                                                                            >
                                                                                <svg
                                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                                    fill="none"
                                                                                    viewBox="0 0 24 24"
                                                                                    strokeWidth={
                                                                                        1.5
                                                                                    }
                                                                                    stroke="currentColor"
                                                                                    className="w-5 h-5"
                                                                                >
                                                                                    <path
                                                                                        strokeLinecap="round"
                                                                                        strokeLinejoin="round"
                                                                                        d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0 1 18 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3 1.5 1.5 3-3.75"
                                                                                    />
                                                                                </svg>
                                                                                <span className="font-normal">
                                                                                    {__(
                                                                                        'Copy Link',
                                                                                    )}
                                                                                </span>
                                                                            </button>

                                                                            {/* Spatiotemporal Information */}
                                                                            {feedGallery?.latitude !=
                                                                                null &&
                                                                                feedGallery?.longitude !=
                                                                                    null && (
                                                                                    <button
                                                                                        onClick={(
                                                                                            e,
                                                                                        ) => {
                                                                                            setSpatiotemporalInfoModal(
                                                                                                true,
                                                                                            );
                                                                                            setShowPostDesktopActionsDropdown(
                                                                                                false,
                                                                                            );
                                                                                        }}
                                                                                        className="flex items-center w-full gap-3 px-4 py-3 text-sm transition-colors rounded-md text-main-text-light hover:bg-surface-2-light dark:text-main-text-dark dark:hover:bg-surface-3-dark"
                                                                                    >
                                                                                        <svg
                                                                                            xmlns="http://www.w3.org/2000/svg"
                                                                                            fill="none"
                                                                                            viewBox="0 0 24 24"
                                                                                            strokeWidth={
                                                                                                1.5
                                                                                            }
                                                                                            stroke="currentColor"
                                                                                            className="w-5 h-5"
                                                                                        >
                                                                                            <path
                                                                                                strokeLinecap="round"
                                                                                                strokeLinejoin="round"
                                                                                                d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                                                                                            />
                                                                                            <path
                                                                                                strokeLinecap="round"
                                                                                                strokeLinejoin="round"
                                                                                                d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                                                                                            />
                                                                                        </svg>

                                                                                        <span className="font-normal">
                                                                                            {__(
                                                                                                'Spatiotemporal Info',
                                                                                            )}
                                                                                        </span>
                                                                                    </button>
                                                                                )}

                                                                            <span className="flex items-center w-full gap-3 px-4 py-3 text-xs transition-colors rounded-md text-main-text-light dark:text-main-text-dark">
                                                                                <span>
                                                                                    {__(
                                                                                        'Post Created',
                                                                                    )}
                                                                                    :
                                                                                    <p>
                                                                                        {
                                                                                            feedGallery?.added_at
                                                                                        }{' '}
                                                                                        {
                                                                                            feedGallery?.created_at_time
                                                                                        }
                                                                                    </p>
                                                                                </span>
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <div>
                                                                {feedGallery?.tag && (
                                                                    <button
                                                                        onClick={() => {
                                                                            shouldCleanupBrowserHistoryRef.current = false;
                                                                            navigateToHashtag(
                                                                                feedGallery?.tag,
                                                                            );
                                                                        }}
                                                                        className="z-[90] flex items-center justify-center rounded-full p-2 text-[14px] font-medium text-main-text-light transition-all duration-200 hover:bg-surface-1-light dark:text-main-text-dark dark:hover:bg-surface-2-dark"
                                                                    >
                                                                        {feedGallery?.tag}
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Post Content */}
                                                        <div
                                                            ref={postContentRef3}
                                                            className="prose prose-sm max-w-none flex-1 overflow-y-auto whitespace-pre-line break-all pr-2 text-[14px] font-normal text-main-text-light dark:prose-invert dark:text-main-text-dark"
                                                            dangerouslySetInnerHTML={{
                                                                __html: feedGallery?.content,
                                                            }}
                                                        />
                                                        {productCardPortals3}

                                                        <div className="z-[90] my-4 flex items-center justify-start">
                                                            <div className="rounded-full bg-[#efefef] text-[#595959] transition-all duration-200 hover:scale-[1.02] hover:bg-[#e6e6e6] dark:bg-surface-2-dark dark:text-main-text-dark dark:hover:bg-surface-3-dark">
                                                                <div className="flex items-center gap-2 p-2">
                                                                    <svg
                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                        viewBox="0 0 24 24"
                                                                        fill="currentColor"
                                                                        className="size-4 text-[#595959] dark:text-main-text-dark"
                                                                    >
                                                                        <path
                                                                            fillRule="evenodd"
                                                                            d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z"
                                                                            clipRule="evenodd"
                                                                        />
                                                                    </svg>

                                                                    <span className="line-clamp-1 truncate text-[13px] font-medium">
                                                                        {feedGallery?.user?.name}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {spatiotemporalInfoModal && (
                    <SpatiotemporalInfoModal
                        onClose={() => {
                            setSpatiotemporalInfoModal(false);
                        }}
                        post={feedGallery}
                    />
                )}
            </>
        );
    }

    // Non Text Smartphones
    if (feedGallery !== null && feedGallery?.type === 'smartphones') {
        return (
            <>
                <div className="absolute inset-y-0 left-[var(--sidebar-w)] right-0 z-[60] bg-backgroundLight dark:bg-backgroundDark">
                    <div className="flex items-center justify-center w-full h-full overflow-hidden">
                        <div className="relative mx-auto w-full max-w-[1300px] px-6 lg:px-[96px] xl:px-[120px]">
                            {/* Navigation Arrows + Close Button Starts */}
                            {/* Left Arrow */}
                            <button
                                onClick={handleLeftPrevious}
                                disabled={isLeftDisabled}
                                className={`absolute left-[clamp(0px,2vw,0px)] top-1/2 z-[60] -translate-y-1/2 rounded-full bg-surface-1-light p-3 transition-all duration-200 hover:scale-110 dark:bg-surface-2-dark dark:hover:bg-surface-3-dark ${isLeftDisabled ? 'cursor-not-allowed opacity-20' : ''}`}
                                aria-label="Previous item"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    className="w-5 h-5 text-main-text-light dark:text-main-text-dark"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeWidth={2}
                                        strokeLinejoin="round"
                                        d="M15.75 19.5 8.25 12l7.5-7.5"
                                    />
                                </svg>
                            </button>

                            {/* Close Button */}
                            <button
                                onClick={() => {
                                    if (previous_url) {
                                        shouldCleanupBrowserHistoryRef.current = false;
                                        router.visit(previous_url);
                                    } else {
                                        setFeedGallery(null);
                                        setFeedOpen(false);
                                        setMediaItems([]);
                                        mediaThumbRefs.current = {};
                                        window.history.replaceState(
                                            {},
                                            '',
                                            window.location.pathname,
                                        );
                                    }
                                }}
                                className="absolute right-[clamp(35px,2vw,20px)] top-0 z-[90] flex h-[32px] w-[32px] items-center justify-center rounded-full transition-all duration-200 hover:bg-surface-1-light dark:hover:bg-surface-2-dark"
                                aria-label="Close modal"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={2}
                                    stroke="currentColor"
                                    className="w-5 h-5 text-main-text-light dark:text-main-text-dark"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>

                            <div className="absolute right-[clamp(30px,2vw,20px)] top-1/2 z-[60] flex -translate-y-1/2 flex-col items-center gap-8">
                                {/* Up Arrow */}
                                <button
                                    onClick={handleTopPrevious}
                                    disabled={isTopDisabled}
                                    className={`rounded-full bg-surface-1-light p-3 transition-all duration-200 hover:scale-110 dark:bg-surface-2-dark dark:hover:bg-surface-3-dark ${isTopDisabled ? 'opacity-20' : ''}`}
                                    aria-label="Previous Item"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        className="w-5 h-5 text-main-text-light dark:text-main-text-dark"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeWidth={2}
                                            strokeLinejoin="round"
                                            d="m4.5 15.75 7.5-7.5 7.5 7.5"
                                        />
                                    </svg>
                                </button>

                                {/* Right Arrow */}
                                <button
                                    onClick={handleRightNext}
                                    disabled={isRightDisabled}
                                    className={`rounded-full bg-surface-1-light p-3 transition-all duration-200 hover:scale-110 dark:bg-surface-2-dark dark:hover:bg-surface-3-dark ${isRightDisabled ? 'opacity-20' : ''}`}
                                    aria-label="Next item"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        className="w-5 h-5 text-main-text-light dark:text-main-text-dark"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeWidth={2}
                                            strokeLinejoin="round"
                                            d="m8.25 4.5 7.5 7.5-7.5 7.5"
                                        />
                                    </svg>
                                </button>

                                {/* Down Arrow */}
                                <button
                                    onClick={handleBottomNext}
                                    disabled={isBottomDisabled}
                                    className={`rounded-full bg-surface-1-light p-3 transition-all duration-200 hover:scale-110 dark:bg-surface-2-dark dark:hover:bg-surface-3-dark ${isBottomDisabled ? 'opacity-20' : ''}`}
                                    aria-label="Next item"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={2}
                                        stroke="currentColor"
                                        className="w-5 h-5 text-main-text-light dark:text-main-text-dark"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="m19.5 8.25-7.5 7.5-7.5-7.5"
                                        />
                                    </svg>
                                </button>
                            </div>
                            {/* Navigation Arrows + Close Button Ends */}

                            <div
                                className={`bg-backgroundLight transition-all duration-300 dark:bg-backgroundDark`}
                            >
                                {/* Scrollable Content */}
                                <div className="h-full">
                                    <div className="flex h-[83vh] min-h-0 flex-col gap-[40px] bg-backgroundLight dark:bg-backgroundDark lg:flex-row lg:items-start">
                                        {feedGallery && (
                                            <>
                                                {/* Left Side - Image Viewer */}
                                                {((Array.isArray(
                                                    feedGallery?.smartphone_video_urls,
                                                ) &&
                                                    feedGallery.smartphone_video_urls.length > 0) ||
                                                    (Array.isArray(
                                                        feedGallery?.smartphone_image_urls,
                                                    ) &&
                                                        feedGallery.smartphone_image_urls.length >
                                                            0)) && (
                                                    <div
                                                        className="relative flex h-full w-full justify-center lg:w-[50%] xl:w-[50%]"
                                                        ref={MediaRef}
                                                    >
                                                        <div className="aspect-[3/2] h-full w-full max-w-[520px] lg:aspect-[2/4]">
                                                            {/* Animated layers */}
                                                            <AnimatePresence
                                                                initial={false}
                                                                custom={direction}
                                                            >
                                                                <div className="absolute inset-0 flex items-center justify-center w-full h-full">
                                                                    {mediaItems.map((item, idx) => {
                                                                        const isCurrent =
                                                                            idx ===
                                                                            selectedMediaIndex;

                                                                        return (
                                                                            <motion.div
                                                                                key={`${idx}-${item.url}`}
                                                                                initial={false}
                                                                                animate={{
                                                                                    opacity:
                                                                                        isCurrent
                                                                                            ? 1
                                                                                            : 0,
                                                                                    zIndex: isCurrent
                                                                                        ? 1
                                                                                        : 0,
                                                                                }}
                                                                                transition={{
                                                                                    duration: 0.4,
                                                                                    ease: 'easeInOut',
                                                                                }}
                                                                                className="absolute inset-0 flex items-center justify-center w-full h-full"
                                                                            >
                                                                                {item.type ===
                                                                                'image' ? (
                                                                                    <img
                                                                                        src={
                                                                                            item.url ||
                                                                                            Placeholder
                                                                                        }
                                                                                        alt={`Media ${idx}`}
                                                                                        className="object-cover object-center w-full h-full rounded-md"
                                                                                        loading={
                                                                                            isCurrent
                                                                                                ? 'eager'
                                                                                                : 'lazy'
                                                                                        }
                                                                                        decoding="async"
                                                                                        fetchpriority={
                                                                                            isCurrent
                                                                                                ? 'high'
                                                                                                : 'low'
                                                                                        }
                                                                                        onLoad={() =>
                                                                                            loadedCache.current.add(
                                                                                                item.url,
                                                                                            )
                                                                                        }
                                                                                        onError={(
                                                                                            e,
                                                                                        ) =>
                                                                                            (e.target.src =
                                                                                                Placeholder)
                                                                                        }
                                                                                    />
                                                                                ) : (
                                                                                    <CustomizedVideoPlayer
                                                                                        autoPlay={
                                                                                            videoAutoplay
                                                                                        }
                                                                                        className="object-cover object-center w-full h-full rounded-md"
                                                                                        videoUrl={
                                                                                            item.url
                                                                                        }
                                                                                        Preload="metadata"
                                                                                        thumbnail={
                                                                                            item?.thumbnail_url ||
                                                                                            Placeholder
                                                                                        }
                                                                                        OnLoadedMetaData={() =>
                                                                                            loadedCache.current.add(
                                                                                                item.url,
                                                                                            )
                                                                                        }
                                                                                        slug={
                                                                                            feedGallery?.slug
                                                                                        }
                                                                                    />
                                                                                )}
                                                                            </motion.div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </AnimatePresence>
                                                        </div>
                                                    </div>
                                                )}
                                                {/* Right Side - Content & Details */}
                                                <div className="flex h-full w-full flex-col lg:w-[40%] xl:w-[45%]">
                                                    {/* Image Thumbnails Strip */}
                                                    <div className={`flex items-center gap-0`}>
                                                        {/* Prev indicator */}
                                                        {canGoPrev && (
                                                            <button
                                                                className="mx-2 flex h-[clamp(66px,5.2vw,66px)] w-[clamp(40px,2.5vw,40px)] flex-shrink-0 items-center justify-center rounded-md bg-surface-2-light dark:bg-surface-2-dark"
                                                                onClick={() => {
                                                                    const newPage = thumbPage - 1;
                                                                    const firstIndex =
                                                                        newPage * MAX_THUMBS;

                                                                    setThumbPage(newPage);
                                                                    setSelectedMediaIndex(
                                                                        firstIndex,
                                                                    );
                                                                }}
                                                            >
                                                                <svg
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    viewBox="0 0 24 24"
                                                                    fill="currentColor"
                                                                    className="size-4 text-sub-text-light dark:text-main-text-dark"
                                                                >
                                                                    <path
                                                                        fillRule="evenodd"
                                                                        d="M19.5 18.347c0 1.427-1.529 2.33-2.779 1.643L5.181 13.643c-1.295-.712-1.295-2.573 0-3.286L16.721 4.01c1.25-.687 2.779.217 2.779 1.643v12.694Z"
                                                                        clipRule="evenodd"
                                                                    />
                                                                </svg>
                                                            </button>
                                                        )}
                                                        {/* Thumbnails */}
                                                        {((Array.isArray(
                                                            feedGallery?.smartphone_video_urls,
                                                        ) &&
                                                            feedGallery.smartphone_video_urls
                                                                .length > 1) ||
                                                            (Array.isArray(
                                                                feedGallery?.smartphone_image_urls,
                                                            ) &&
                                                                feedGallery.smartphone_image_urls
                                                                    .length > 1)) && (
                                                            <div
                                                                ref={MediaThumbRef}
                                                                className="flex items-center gap-2 mb-3 overflow-x-auto scrollbar-none scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700"
                                                            >
                                                                {/* Render thumbnails */}
                                                                {visibleThumbs.map(
                                                                    (mediaItem, index) => {
                                                                        const realIndex =
                                                                            startIndex + index;
                                                                        return (
                                                                            <button
                                                                                key={realIndex}
                                                                                ref={(el) => {
                                                                                    mediaThumbRefs.current[
                                                                                        realIndex
                                                                                    ] = el;
                                                                                }}
                                                                                onClick={() =>
                                                                                    setSelectedMediaIndex(
                                                                                        realIndex,
                                                                                    )
                                                                                }
                                                                                // className={`aspect-square w-[clamp(48px,5vw,64px)] flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all ${selectedMediaIndex ===
                                                                                //     realIndex
                                                                                //     ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800'
                                                                                //     : 'border-gray-300 hover:border-gray-400 dark:border-gray-700'
                                                                                //     }`}

                                                                                className={`aspect-square ${selectedMediaIndex === realIndex ? 'border-[3px] border-main-text-light dark:border-main-text-dark' : ''} w-[clamp(48px,5vw,64px)] flex-shrink-0 overflow-hidden rounded-md transition-all`}
                                                                            >
                                                                                {mediaItem?.type ===
                                                                                'image' ? (
                                                                                    <img
                                                                                        src={
                                                                                            mediaItem?.url ||
                                                                                            Placeholder
                                                                                        }
                                                                                        alt={`Thumbnail ${realIndex + 1}`}
                                                                                        className="object-cover w-full h-full"
                                                                                        loading={
                                                                                            selectedMediaIndex ===
                                                                                            realIndex
                                                                                                ? 'eager'
                                                                                                : 'lazy'
                                                                                        }
                                                                                        decoding="async"
                                                                                        fetchpriority={
                                                                                            selectedMediaIndex ===
                                                                                            realIndex
                                                                                                ? 'high'
                                                                                                : 'low'
                                                                                        }
                                                                                        onError={(
                                                                                            e,
                                                                                        ) =>
                                                                                            (e.target.src =
                                                                                                Placeholder)
                                                                                        }
                                                                                    />
                                                                                ) : (
                                                                                    <img
                                                                                        src={
                                                                                            mediaItem?.thumbnail_url ||
                                                                                            Placeholder
                                                                                        }
                                                                                        alt={`Thumbnail ${index + 1}`}
                                                                                        className="object-cover w-full h-full"
                                                                                        loading={
                                                                                            selectedMediaIndex ===
                                                                                            realIndex
                                                                                                ? 'eager'
                                                                                                : 'lazy'
                                                                                        }
                                                                                        decoding="async"
                                                                                        fetchpriority={
                                                                                            selectedMediaIndex ===
                                                                                            realIndex
                                                                                                ? 'high'
                                                                                                : 'low'
                                                                                        }
                                                                                        onError={(
                                                                                            e,
                                                                                        ) =>
                                                                                            (e.target.src =
                                                                                                Placeholder)
                                                                                        }
                                                                                    />
                                                                                )}
                                                                            </button>
                                                                        );
                                                                    },
                                                                )}
                                                            </div>
                                                        )}

                                                        {/* Next indicator */}
                                                        {canGoNext && (
                                                            <button
                                                                className="mx-2 flex h-[clamp(66px,5.2vw,66px)] w-[clamp(40px,2.5vw,40px)] flex-shrink-0 items-center justify-center rounded-md bg-surface-2-light dark:bg-surface-2-dark"
                                                                onClick={() => {
                                                                    const newPage = thumbPage + 1;
                                                                    const firstIndex =
                                                                        newPage * MAX_THUMBS;

                                                                    setThumbPage(newPage);
                                                                    setSelectedMediaIndex(
                                                                        firstIndex,
                                                                    );
                                                                }}
                                                            >
                                                                <svg
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    viewBox="0 0 24 24"
                                                                    fill="currentColor"
                                                                    className="size-4 text-sub-text-light dark:text-main-text-dark"
                                                                >
                                                                    <path
                                                                        fillRule="evenodd"
                                                                        d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z"
                                                                        clipRule="evenodd"
                                                                    />
                                                                </svg>
                                                            </button>
                                                        )}
                                                    </div>

                                                    {/* Content Area */}

                                                    <div
                                                        className="flex-1 min-h-0 overflow-y-auto scrollbar-none"
                                                        ref={productRightPanelScrollRef}
                                                    >
                                                        {/* Tag and Actions Header */}
                                                        <div className="flex justify-between mb-2 align-start">
                                                            {/* Three Dot Menu */}
                                                            <div
                                                                className="relative flex-1"
                                                                ref={
                                                                    smartphoneDesktopViewerActionDropdownRef
                                                                }
                                                            >
                                                                <button
                                                                    data-smartphone-actions-button
                                                                    className="flex h-[36px] w-[36px] items-center justify-center rounded-full transition-all duration-200 hover:bg-surface-1-light dark:hover:bg-surface-2-dark"
                                                                >
                                                                    <svg
                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                        fill="none"
                                                                        viewBox="0 0 24 24"
                                                                        strokeWidth={2.5}
                                                                        stroke="currentColor"
                                                                        className="w-5 h-5 text-main-text-light dark:text-main-text-dark"
                                                                    >
                                                                        <path
                                                                            strokeLinecap="round"
                                                                            strokeLinejoin="round"
                                                                            d="
      M3.5 12a.75.75 0 1 1-1.5 0a.75.75 0 0 1 1.5 0
      M12 12a.75.75 0 1 1-1.5 0a.75.75 0 0 1 1.5 0
      M20.5 12a.75.75 0 1 1-1.5 0a.75.75 0 0 1 1.5 0
    "
                                                                        />
                                                                    </svg>
                                                                </button>

                                                                {showSmartphoneDesktopActionsDropdown && (
                                                                    <div
                                                                        data-smartphone-actions-dropdown
                                                                        className="absolute left-0 z-50 w-56 border rounded-md top-full border-surface-3-light bg-backgroundLight dark:border-surface-3-dark dark:bg-surface-1-dark"
                                                                    >
                                                                        <div className="py-2">
                                                                            {/* QR Code */}
                                                                            <button
                                                                                onClick={() => {
                                                                                    setShowQrCode(
                                                                                        true,
                                                                                    );
                                                                                    setShowSmartphoneDesktopActionsDropdown(
                                                                                        false,
                                                                                    );
                                                                                }}
                                                                                className="flex items-center w-full gap-3 px-4 py-3 text-sm transition-colors rounded-md text-main-text-light hover:bg-surface-2-light dark:text-main-text-dark dark:hover:bg-surface-3-dark"
                                                                            >
                                                                                <svg
                                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                                    fill="none"
                                                                                    viewBox="0 0 24 24"
                                                                                    strokeWidth={
                                                                                        1.5
                                                                                    }
                                                                                    stroke="currentColor"
                                                                                    className="w-5 h-5"
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
                                                                                <span className="font-normal">
                                                                                    {__('QR Code')}
                                                                                </span>
                                                                            </button>

                                                                            {/* Copy Link */}
                                                                            <button
                                                                                onClick={(e) => {
                                                                                    const url =
                                                                                        route(
                                                                                            'home',
                                                                                        ) +
                                                                                        generateSmartphoneURL(
                                                                                            feedGallery,
                                                                                            true,
                                                                                            true,
                                                                                        );
                                                                                    navigator.clipboard.writeText(
                                                                                        url.trim(),
                                                                                    );
                                                                                    setLinkCopied(
                                                                                        true,
                                                                                    );
                                                                                    setShowSmartphoneDesktopActionsDropdown(
                                                                                        false,
                                                                                    );
                                                                                }}
                                                                                className="flex items-center w-full gap-3 px-4 py-3 text-sm transition-colors rounded-md text-main-text-light hover:bg-surface-2-light dark:text-main-text-dark dark:hover:bg-surface-3-dark"
                                                                            >
                                                                                <svg
                                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                                    fill="none"
                                                                                    viewBox="0 0 24 24"
                                                                                    strokeWidth={
                                                                                        1.5
                                                                                    }
                                                                                    stroke="currentColor"
                                                                                    className="w-5 h-5"
                                                                                >
                                                                                    <path
                                                                                        strokeLinecap="round"
                                                                                        strokeLinejoin="round"
                                                                                        d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0 1 18 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3 1.5 1.5 3-3.75"
                                                                                    />
                                                                                </svg>
                                                                                <span className="font-normal">
                                                                                    {__(
                                                                                        'Copy Link',
                                                                                    )}
                                                                                </span>
                                                                            </button>

                                                                            {/* Spatiotemporal Information */}
                                                                            {feedGallery?.latitude !=
                                                                                null &&
                                                                                feedGallery?.longitude !=
                                                                                    null && (
                                                                                    <button
                                                                                        onClick={(
                                                                                            e,
                                                                                        ) => {
                                                                                            setSpatiotemporalInfoModal(
                                                                                                true,
                                                                                            );
                                                                                            setShowPostDesktopActionsDropdown(
                                                                                                false,
                                                                                            );
                                                                                        }}
                                                                                        className="flex items-center w-full gap-3 px-4 py-3 text-sm transition-colors rounded-md text-main-text-light hover:bg-surface-2-light dark:text-main-text-dark dark:hover:bg-surface-3-dark"
                                                                                    >
                                                                                        <svg
                                                                                            xmlns="http://www.w3.org/2000/svg"
                                                                                            fill="none"
                                                                                            viewBox="0 0 24 24"
                                                                                            strokeWidth={
                                                                                                1.5
                                                                                            }
                                                                                            stroke="currentColor"
                                                                                            className="w-5 h-5"
                                                                                        >
                                                                                            <path
                                                                                                strokeLinecap="round"
                                                                                                strokeLinejoin="round"
                                                                                                d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                                                                                            />
                                                                                            <path
                                                                                                strokeLinecap="round"
                                                                                                strokeLinejoin="round"
                                                                                                d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                                                                                            />
                                                                                        </svg>

                                                                                        <span className="font-normal">
                                                                                            {__(
                                                                                                'Spatiotemporal Info',
                                                                                            )}
                                                                                        </span>
                                                                                    </button>
                                                                                )}

                                                                            <span className="flex items-center w-full gap-3 px-4 py-3 text-xs transition-colors rounded-md text-main-text-light dark:text-main-text-dark">
                                                                                <span>
                                                                                    {__(
                                                                                        'Post Created',
                                                                                    )}
                                                                                    :
                                                                                    <p>
                                                                                        {
                                                                                            feedGallery?.added_at
                                                                                        }{' '}
                                                                                        {
                                                                                            feedGallery?.created_at_time
                                                                                        }
                                                                                    </p>
                                                                                </span>
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <div>
                                                                {feedGallery?.tag && (
                                                                    <button
                                                                        onClick={() => {
                                                                            shouldCleanupBrowserHistoryRef.current = false;
                                                                            navigateToHashtag(
                                                                                feedGallery?.tag,
                                                                            );
                                                                        }}
                                                                        className="z-[90] flex items-center justify-center rounded-full p-2 text-[14px] font-medium text-main-text-light transition-all duration-200 hover:bg-surface-1-light dark:text-main-text-dark dark:hover:bg-surface-2-dark"
                                                                    >
                                                                        {feedGallery?.tag}
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Product Details */}
                                                        <div
                                                            key={feedGallery?.slug}
                                                            className="max-w-lg"
                                                        >
                                                            <div className="flex flex-col items-start gap-4">
                                                                <SmartphoneDetails
                                                                    key={feedGallery?.slug}
                                                                    // StockBadge={StockBadge({
                                                                    //     feedGallery,
                                                                    // })}
                                                                    currency={currency}
                                                                    product={feedGallery}
                                                                />

                                                                {/* Divider */}
                                                                {feedGallery?.addons?.length >
                                                                    0 && (
                                                                    <div className="mt-1 h-px w-full bg-[#c8c8c8] dark:bg-surface-3-dark" />
                                                                )}

                                                                {feedGallery?.addons?.length >
                                                                    0 && (
                                                                    <ProductSelectInput
                                                                        InputName={__('Add-ons')}
                                                                        Name={'addons'}
                                                                        Id={'addons'}
                                                                        items={feedGallery?.addons}
                                                                        Value={selectedAddon}
                                                                        itemKey={'name'}
                                                                        Placeholder={__('Addons')}
                                                                        Action={(value) => {
                                                                            setSelectedAddon(value);
                                                                        }}
                                                                        customPlaceHolder={true}
                                                                    />
                                                                )}

                                                                {/* Divider */}
                                                                {(cartItemAddons?.filter(
                                                                    (addon) =>
                                                                        addon.smartphone_id ===
                                                                        feedGallery?.id,
                                                                )?.length > 0 ||
                                                                    cartItemSmartphones?.filter(
                                                                        (smartphone) =>
                                                                            smartphone.smartphone_id ===
                                                                            feedGallery?.id,
                                                                    )?.length > 0) && (
                                                                    <div className="mt-5 h-px w-full bg-[#c8c8c8] dark:bg-surface-3-dark" />
                                                                )}

                                                                {/* Smartphone Items */}
                                                                {cartItemSmartphones?.length > 0 &&
                                                                    cartItemSmartphones
                                                                        ?.filter(
                                                                            (smartphone) =>
                                                                                smartphone.smartphone_id ===
                                                                                feedGallery?.id,
                                                                        )
                                                                        .map(
                                                                            (smartphone, index) => (
                                                                                <div
                                                                                    className="w-full p-4 rounded-sm bg-surface-1-light dark:bg-surface-2-dark"
                                                                                    key={index}
                                                                                >
                                                                                    <div className="flex flex-wrap items-center justify-between gap-4">
                                                                                        <div className="flex flex-col items-start gap-3">
                                                                                            {/* Product Name */}
                                                                                            <div className="flex-1 min-w-0">
                                                                                                <p className="text-sm truncate text-main-text-light dark:text-main-text-dark">
                                                                                                    {
                                                                                                        smartphone?.name
                                                                                                    }{' '}
                                                                                                    /{' '}
                                                                                                    {
                                                                                                        smartphone?.capacity
                                                                                                    }{' '}
                                                                                                    /{' '}
                                                                                                    {
                                                                                                        smartphone?.color_name
                                                                                                    }
                                                                                                </p>
                                                                                            </div>

                                                                                            {/* Quantity Selector */}
                                                                                            <div className="inline-flex items-center overflow-hidden rounded-md border border-[#c8c8c8] dark:border-surface-3-dark">
                                                                                                {/* DECREASE */}
                                                                                                <button
                                                                                                    onClick={() =>
                                                                                                        handleSmartphoneDecrease(
                                                                                                            smartphone?.color_id,
                                                                                                        )
                                                                                                    }
                                                                                                    className="flex items-center justify-center transition-colors bg-white h-9 w-9 text-main-text-light hover:bg-surface-2-light disabled:opacity-50 dark:bg-surface-2-dark dark:text-main-text-dark dark:hover:bg-surface-3-dark"
                                                                                                >
                                                                                                    <svg
                                                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                                                        viewBox="0 0 24 24"
                                                                                                        fill="none"
                                                                                                        stroke="currentColor"
                                                                                                        strokeWidth={
                                                                                                            1.5
                                                                                                        }
                                                                                                        className="w-4 h-4"
                                                                                                    >
                                                                                                        <path
                                                                                                            strokeLinecap="round"
                                                                                                            strokeLinejoin="round"
                                                                                                            d="M19.5 12h-15"
                                                                                                        />
                                                                                                    </svg>
                                                                                                </button>

                                                                                                {/* QUANTITY */}
                                                                                                <span className="flex h-9 min-w-[3rem] items-center justify-center border-l border-r border-[#c8c8c8] bg-white text-sm font-semibold text-sub-text-light dark:border-surface-3-dark dark:bg-surface-2-dark dark:text-sub-text-dark">
                                                                                                    {
                                                                                                        smartphone?.quantity
                                                                                                    }
                                                                                                </span>

                                                                                                {/* INCREASE */}
                                                                                                <button
                                                                                                    onClick={() =>
                                                                                                        handleSmartphoneIncrease(
                                                                                                            smartphone?.color_id,
                                                                                                        )
                                                                                                    }
                                                                                                    className="flex items-center justify-center transition-colors bg-white h-9 w-9 text-main-text-light hover:bg-surface-2-light dark:bg-surface-2-dark dark:text-main-text-dark dark:hover:bg-surface-3-dark"
                                                                                                >
                                                                                                    <svg
                                                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                                                        viewBox="0 0 24 24"
                                                                                                        fill="none"
                                                                                                        stroke="currentColor"
                                                                                                        strokeWidth={
                                                                                                            1.5
                                                                                                        }
                                                                                                        className="w-4 h-4"
                                                                                                    >
                                                                                                        <path
                                                                                                            strokeLinecap="round"
                                                                                                            strokeLinejoin="round"
                                                                                                            d="M12 4.5v15m7.5-7.5h-15"
                                                                                                        />
                                                                                                    </svg>
                                                                                                </button>
                                                                                            </div>
                                                                                        </div>

                                                                                        {/* Price */}
                                                                                        <div className="flex-shrink-0">
                                                                                            <DisplayPrice
                                                                                                usdAmount={
                                                                                                    smartphone?.price
                                                                                                }
                                                                                                showCode
                                                                                                showEstimatedLabel={
                                                                                                    false
                                                                                                }
                                                                                                className="text-xl font-medium text-main-text-light dark:text-main-text-dark"
                                                                                            />
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            ),
                                                                        )}

                                                                {/* Addon Items */}
                                                                {cartItemAddons?.length > 0 &&
                                                                    cartItemAddons
                                                                        ?.filter(
                                                                            (addon) =>
                                                                                addon.smartphone_id ===
                                                                                feedGallery?.id,
                                                                        )
                                                                        .map((addon, index) => (
                                                                            <div
                                                                                className="relative w-full p-4 rounded-sm bg-surface-1-light dark:bg-surface-2-dark"
                                                                                key={index}
                                                                            >
                                                                                {/* Remove Addon */}
                                                                                <button
                                                                                    onClick={() => {
                                                                                        handleAddonRemove(
                                                                                            addon?.id,
                                                                                        );
                                                                                    }}
                                                                                    className="absolute right-2 top-0 z-[90] rounded-full p-2 text-main-text-light transition dark:text-main-text-dark"
                                                                                    aria-label="Close modal"
                                                                                >
                                                                                    <svg
                                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                                        fill="none"
                                                                                        viewBox="0 0 24 24"
                                                                                        strokeWidth={
                                                                                            2
                                                                                        }
                                                                                        stroke="currentColor"
                                                                                        className="w-4 h-4"
                                                                                    >
                                                                                        <path
                                                                                            strokeLinecap="round"
                                                                                            strokeLinejoin="round"
                                                                                            d="M6 18L18 6M6 6l12 12"
                                                                                        />
                                                                                    </svg>
                                                                                </button>

                                                                                <div className="flex flex-wrap items-center justify-between gap-4">
                                                                                    <div className="flex flex-col items-start gap-3">
                                                                                        {/* Addon Name */}
                                                                                        <div className="flex-1 min-w-0">
                                                                                            <p className="text-sm truncate text-main-text-light dark:text-main-text-dark">
                                                                                                {
                                                                                                    addon?.name
                                                                                                }
                                                                                            </p>
                                                                                        </div>

                                                                                        {/* Quantity Selector */}
                                                                                        <div className="inline-flex items-center overflow-hidden rounded-md border border-[#c8c8c8] dark:border-surface-3-dark">
                                                                                            {/* DECREASE */}
                                                                                            <button
                                                                                                onClick={() =>
                                                                                                    handleAddonDecrease(
                                                                                                        addon?.id,
                                                                                                    )
                                                                                                }
                                                                                                className="flex items-center justify-center transition-colors bg-white h-9 w-9 text-main-text-light hover:bg-surface-2-light disabled:opacity-50 dark:bg-surface-2-dark dark:text-main-text-dark dark:hover:bg-surface-3-dark"
                                                                                            >
                                                                                                <svg
                                                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                                                    viewBox="0 0 24 24"
                                                                                                    fill="none"
                                                                                                    stroke="currentColor"
                                                                                                    strokeWidth={
                                                                                                        1.5
                                                                                                    }
                                                                                                    className="w-4 h-4"
                                                                                                >
                                                                                                    <path
                                                                                                        strokeLinecap="round"
                                                                                                        strokeLinejoin="round"
                                                                                                        d="M19.5 12h-15"
                                                                                                    />
                                                                                                </svg>
                                                                                            </button>

                                                                                            {/* QUANTITY */}
                                                                                            <span className="flex h-9 min-w-[3rem] items-center justify-center border-l border-r border-[#c8c8c8] bg-white text-sm font-semibold text-sub-text-light dark:border-surface-3-dark dark:bg-surface-2-dark dark:text-sub-text-dark">
                                                                                                {
                                                                                                    addon?.quantity
                                                                                                }
                                                                                            </span>

                                                                                            {/* INCREASE */}
                                                                                            <button
                                                                                                onClick={() =>
                                                                                                    handleAddonIncrease(
                                                                                                        addon?.id,
                                                                                                    )
                                                                                                }
                                                                                                className="flex items-center justify-center transition-colors bg-white h-9 w-9 text-main-text-light hover:bg-surface-2-light dark:bg-surface-2-dark dark:text-main-text-dark dark:hover:bg-surface-3-dark"
                                                                                            >
                                                                                                <svg
                                                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                                                    viewBox="0 0 24 24"
                                                                                                    fill="none"
                                                                                                    stroke="currentColor"
                                                                                                    strokeWidth={
                                                                                                        1.5
                                                                                                    }
                                                                                                    className="w-4 h-4"
                                                                                                >
                                                                                                    <path
                                                                                                        strokeLinecap="round"
                                                                                                        strokeLinejoin="round"
                                                                                                        d="M12 4.5v15m7.5-7.5h-15"
                                                                                                    />
                                                                                                </svg>
                                                                                            </button>
                                                                                        </div>
                                                                                    </div>

                                                                                    {/* Price */}
                                                                                    <div className="flex-shrink-0">
                                                                                        <DisplayPrice
                                                                                            usdAmount={
                                                                                                addon?.price
                                                                                            }
                                                                                            showCode
                                                                                            showEstimatedLabel={
                                                                                                false
                                                                                            }
                                                                                            className="text-xl font-medium text-main-text-light dark:text-main-text-dark"
                                                                                        />
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        ))}

                                                                {/* Divider */}
                                                                <div className="mt-5 h-px w-full bg-[#c8c8c8] dark:bg-surface-3-dark" />

                                                                {/* Product Price */}
                                                                <div className="flex items-center w-full">
                                                                    <span className="font-medium text-left text-main-text-light dark:text-main-text-dark">
                                                                        {__('Total Price')}
                                                                    </span>
                                                                    <div className="ml-auto flex items-center gap-2">
                                                                        {feedGallery?.is_sold_out && (
                                                                            <span className="inline-block rounded bg-red-600 px-2 py-0.5 text-[11px] font-semibold text-white">
                                                                                {__('Sold Out')}
                                                                            </span>
                                                                        )}
                                                                        <DisplayPrice
                                                                            usdAmount={
                                                                                smartphoneTotalPrice[
                                                                                    feedGallery?.id
                                                                                ]
                                                                            }
                                                                            showEstimatedLabel={false}
                                                                            className={`text-3xl font-semibold text-right text-main-text-light dark:text-main-text-dark ${feedGallery?.is_sold_out ? 'line-through' : ''}`}
                                                                        />
                                                                    </div>
                                                                </div>

                                                                {/* Buttons */}
                                                                <div className="flex w-full gap-x-4">
                                                                    {auth?.user && (
                                                                        <>
                                                                            {/* Add to cart */}
                                                                            <button
                                                                                onClick={() => {
                                                                                    handleAddCartItem(
                                                                                        cartItemSmartphones?.filter(
                                                                                            (
                                                                                                item,
                                                                                            ) =>
                                                                                                item.smartphone_id ===
                                                                                                feedGallery?.id,
                                                                                        ),
                                                                                        cartItemAddons?.filter(
                                                                                            (
                                                                                                item,
                                                                                            ) =>
                                                                                                item.smartphone_id ===
                                                                                                feedGallery?.id,
                                                                                        ),
                                                                                        feedGallery?.inventory_items_count,
                                                                                    );
                                                                                }}
                                                                                disabled={
                                                                                    !canActionOnSmartphone ||
                                                                                    feedGallery?.is_sold_out
                                                                                }
                                                                                className={`text-md h-12 flex-1 rounded-md border border-main-text-light bg-white text-center font-semibold text-main-text-light transition hover:bg-main-text-dark/80 dark:border-main-text-dark dark:bg-main-text-dark dark:bg-main-text-dark/80 ${(!canActionOnSmartphone || feedGallery?.is_sold_out) && 'cursor-not-allowed opacity-50'}`}
                                                                            >
                                                                                <div className="flex items-center justify-center">
                                                                                    {cartProcessing && (
                                                                                        <Spinner />
                                                                                    )}

                                                                                    <span>
                                                                                        {feedGallery?.is_sold_out ? __('Sold Out') : __('Add to cart')}
                                                                                    </span>
                                                                                </div>
                                                                            </button>

                                                                            {/* Buy now */}
                                                                            <button
                                                                                onClick={() =>
                                                                                    handleBuyNow(
                                                                                        cartItemSmartphones?.filter(
                                                                                            (
                                                                                                item,
                                                                                            ) =>
                                                                                                item.smartphone_id ===
                                                                                                feedGallery?.id,
                                                                                        ),
                                                                                        cartItemAddons?.filter(
                                                                                            (
                                                                                                item,
                                                                                            ) =>
                                                                                                item.smartphone_id ===
                                                                                                feedGallery?.id,
                                                                                        ),
                                                                                        feedGallery?.id,
                                                                                        feedGallery?.inventory_items_count,
                                                                                    )
                                                                                }
                                                                                disabled={
                                                                                    !canActionOnSmartphone ||
                                                                                    feedGallery?.is_sold_out
                                                                                }
                                                                                className={`text-md h-12 flex-1 rounded-md border border-main-text-dark bg-main-text-light font-semibold text-main-text-dark transition hover:bg-main-text-light/80 dark:bg-main-text-light dark:hover:bg-main-text-light/80 ${(!canActionOnSmartphone || feedGallery?.is_sold_out) && 'cursor-not-allowed opacity-50'}`}
                                                                            >
                                                                                <div className="flex items-center justify-center">
                                                                                    {buyNowProcessing && (
                                                                                        <Spinner />
                                                                                    )}

                                                                                    <span>
                                                                                        {feedGallery?.is_sold_out ? __('Sold Out') : __('Buy now')}
                                                                                    </span>
                                                                                </div>
                                                                            </button>
                                                                        </>
                                                                    )}

                                                                    {!auth?.user && (
                                                                        <>
                                                                            {/* Login */}
                                                                            <button
                                                                                onClick={() => {
                                                                                    shouldCleanupBrowserHistoryRef.current = false;
                                                                                    router.get(
                                                                                        route(
                                                                                            'login',
                                                                                        ),
                                                                                        {
                                                                                            redirect:
                                                                                                window
                                                                                                    .location
                                                                                                    .pathname +
                                                                                                window
                                                                                                    .location
                                                                                                    .search,
                                                                                        },
                                                                                    );
                                                                                }}
                                                                                className="flex-1 h-12 font-semibold transition bg-white border rounded-md text-md border-main-text-light text-main-text-light hover:bg-main-text-dark/80 dark:border-main-text-dark dark:bg-main-text-dark dark:bg-main-text-dark/80"
                                                                            >
                                                                                {__('Login')}
                                                                            </button>

                                                                            {/*Register*/}
                                                                            <button
                                                                                onClick={() => {
                                                                                    shouldCleanupBrowserHistoryRef.current = false;
                                                                                    router.get(
                                                                                        route(
                                                                                            'register',
                                                                                        ),
                                                                                        {
                                                                                            redirect:
                                                                                                window
                                                                                                    .location
                                                                                                    .pathname +
                                                                                                window
                                                                                                    .location
                                                                                                    .search,
                                                                                        },
                                                                                    );
                                                                                }}
                                                                                className="flex-1 h-12 font-semibold transition border rounded-md text-md border-main-text-dark bg-main-text-light text-main-text-dark hover:bg-main-text-light/80 dark:bg-main-text-light dark:hover:bg-main-text-light/80"
                                                                            >
                                                                                {__('Register')}
                                                                            </button>
                                                                        </>
                                                                    )}
                                                                </div>

                                                                {/* Accordion */}
                                                                {/* Product Content */}
                                                                <SmartphoneContentAccordion
                                                                    content={feedGallery?.content}
                                                                    label={__('About this product')}
                                                                    isHtml={true}
                                                                    onToggle={setToggleAccordion}
                                                                    defaultOpen={toggleAccordion}
                                                                    scrollContainerRef={
                                                                        productRightPanelScrollRef
                                                                    }
                                                                />

                                                                {feedGallery?.product_details && (
                                                                    <>
                                                                        {/* Product Details */}
                                                                        <SmartphoneDetailsAccordion
                                                                            productDetails={
                                                                                feedGallery?.product_details
                                                                            }
                                                                            label={__(
                                                                                'Product Details',
                                                                            )}
                                                                            onToggle={
                                                                                setToggleAccordion
                                                                            }
                                                                            defaultOpen={
                                                                                toggleAccordion
                                                                            }
                                                                            scrollContainerRef={
                                                                                productRightPanelScrollRef
                                                                            }
                                                                        />
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {spatiotemporalInfoModal && (
                    <SpatiotemporalInfoModal
                        onClose={() => {
                            setSpatiotemporalInfoModal(false);
                        }}
                        post={feedGallery}
                    />
                )}
            </>
        );
    }
    return null;
};

export default DesktopFeed;
