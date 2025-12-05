import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import PostMediaViewer from './PostMediaViewer';
import { router } from '@inertiajs/react';
import GlobalSearch from '@/Components/GlobalSearch';
import useDarkMode from '@/Hooks/useDarkMode';
import SmartphoneMediaViewer from './SmartphoneMediaViewer';
import SelectInput from '@/Components/SelectInput';
import Spinner from '@/Components/Spinner';


const DesktopFeed = ({
    feedGallery,
    setShowQrCode,
    setShowErrorMessage,
    setLinkCopied,
    setBookmarkStatusChanged,
    setErrorMessage,
    setMediaItems,
    auth,
    generateURL,
    navigateToHashtag,
    Placeholder,
    setFeedGallery,
    setFeedOpen,
    currency,
    cart_items,
    setInfoMessage,
    setShowInfoMessage,
    setSuccessMessage,
    setShowSuccessMessage,
    windowSize,
    feedIndex,
    feed,
    relatedFeed,
    relatedFeedNextUrlsRef,
    nextPageUrl,
    isfetchingMoreYAxisFeed,
    fetchMoreYAxis,
    fetchRelatedFeed

}) => {
    const isDarkMode = useDarkMode();
    const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
    const [showPostDesktopActionsDropdown, setShowPostDesktopActionsDropdown] = useState(false);
    const mediaThumbRefs = useRef([]);


    const [currentFeedIndex, setCurrentFeedIndex] = useState(feedIndex || 0);
    const currentFeedIndexRef = useRef(feedIndex || 0);
    const [feedItems, setFeedItems] = useState(feed || []);
    const relatedFeedRef = useRef(relatedFeed || {});
    const viewableFeedRef = useRef([]);
    const viewableFeedRefIndex = useRef(0);



    const [arrowStates, setArrowStates] = useState({
        isLeftDisabled: true,
        isRightDisabled: false,
        isTopDisabled: true,
        isBottomDisabled: false
    });


    const updateArrowStates = () => {
        setArrowStates({
            isLeftDisabled: viewableFeedRefIndex.current === 0,
            isRightDisabled: viewableFeedRefIndex.current >= viewableFeedRef.current.length - 1,
            isTopDisabled: currentFeedIndex === 0,
            isBottomDisabled: currentFeedIndex >= feedItems.length - 1
        });
    };


    // Navigation functions
    const handleTopPrevious = () => {
        if (currentFeedIndex > 0) {
            const newIndex = currentFeedIndex - 1;
            setCurrentFeedIndex(newIndex);
            setSelectedMediaIndex(0);
        }
    };

    const handleBottomNext = () => {
        if (currentFeedIndex < feedItems.length - 1) {
            const newIndex = currentFeedIndex + 1;
            setCurrentFeedIndex(newIndex);
            setSelectedMediaIndex(0);



            // Fetching More
            const remainingItems = feedItems.length - 1 - newIndex;

            if (remainingItems <= 5 && nextPageUrl && !isfetchingMoreYAxisFeed) {
                fetchMoreYAxis();

            }
        }
    };


    const handleLeftPrevious = () => {
        if (viewableFeedRefIndex.current > 0) {
            viewableFeedRefIndex.current = viewableFeedRefIndex.current - 1;

            const currentItem = viewableFeedRef.current[viewableFeedRefIndex.current];
            setFeedGallery(currentItem);
            setSelectedMediaIndex(0);

            // Update URL
            if (currentItem?.type === 'posts') {
                const url = route('home') + generateURL(currentItem);
                window.history.replaceState({}, '', url);
            } else if (currentItem?.type === 'smartphones') {
                const url = route('home') + '?m-slug=' + currentItem?.slug;
                window.history.replaceState({}, '', url);
            }

            updateArrowStates();
        }
    };

    const handleRightNext = () => {
        if (viewableFeedRefIndex.current < viewableFeedRef.current.length - 1) {
            viewableFeedRefIndex.current = viewableFeedRefIndex.current + 1;

            const currentItem = viewableFeedRef.current[viewableFeedRefIndex.current];
            setFeedGallery(currentItem);
            setSelectedMediaIndex(0);



            // Update URL
            if (currentItem?.type === 'posts') {
                const url = route('home') + generateURL(currentItem);
                window.history.replaceState({}, '', url);
            } else if (currentItem?.type === 'smartphones') {
                const url = route('home') + '?m-slug=' + currentItem?.slug;
                window.history.replaceState({}, '', url);
            }

            const parentItem = viewableFeedRef.current[0];
            const parentSlug = parentItem.slug;

            const remainingItems = viewableFeedRef.current.length - 1 - viewableFeedRefIndex.current;

            if (remainingItems <= 4) {
                const nextUrls = relatedFeedNextUrlsRef.current || {};

                const doesNotExist = !nextUrls.hasOwnProperty(parentSlug);
                const existsButNull = nextUrls.hasOwnProperty(parentSlug) && nextUrls[parentSlug] === null;
                const existsAndNotNull = nextUrls.hasOwnProperty(parentSlug) && nextUrls[parentSlug] !== null;


                if (doesNotExist || existsAndNotNull) {
                    // console.log('Fetching more related items for:', parentSlug);
                    fetchRelatedFeed(parentSlug);
                } else if (existsButNull) {
                    // console.log('No more related items available for:', parentSlug);
                }
            }


            updateArrowStates();
        }
    };


    // Syncing Related Feeds When Related Feed Changes
    useEffect(() => {
        relatedFeedRef.current = relatedFeed;
    }, [relatedFeed]);

    // Keyboard navigation support
    useEffect(() => {
        if (!feedGallery) return;

        const handleKeyDown = (e) => {
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
                    window.history.replaceState({}, '', window.location.pathname);
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [feedGallery, currentFeedIndex, feedItems]);




    // updating the viewable Feed Object when Current Feed Index changes
    useEffect(() => {
        const feedItem = feedItems[currentFeedIndex];

        viewableFeedRef.current = [
            feedItem,
            ...(relatedFeedRef.current[feedItem.slug] || [])
        ];

        viewableFeedRefIndex.current = 0;

        setFeedGallery(feedItem);



        // Update URL based on item type Of Main Feed
        if (feedItem?.type === 'posts') {
            const url = route('home') + generateURL(feedItem);
            window.history.replaceState({}, '', url);
        } else if (feedItem?.type === 'smartphones') {
            const url = route('home') + '?m-slug=' + feedItem?.slug;
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


        viewableFeedRef.current = [
            feedItem,
            ...currentRelatedItems
        ];


        updateArrowStates();
    }, [relatedFeed]);

    // Update feedItems when feed prop changes
    useEffect(() => {
        if (feed && feed.length > 0) {
            setFeedItems(prevItems => {

                const existingSlugs = new Set(prevItems.map(item => item.slug));


                const newItems = feed.filter(item => !existingSlugs.has(item.slug));


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



    // Smartphone Logic
    const [selectedColor, setSelectedColor] = useState('');
    const [quantity, setQuantity] = useState(1);


    const smartphoneDesktopViewerActionDropdownRef = useRef(null);
    const [showSmartphoneDesktopActionsDropdown, setShowSmartphoneDesktopActionsDropdown] =
        useState(false);


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

    const [cartProcessing, setCartProcessing] = useState(false);
    const [buyNowProcessing, setBuyNowProcessing] = useState(false);


    const handleAddCartItem = async (type, item_id, quantity, color, total_stock) => {
        try {
            setCartProcessing(true);
            if (color === '' || !color) {
                setInfoMessage('Please select a color first');
                setShowInfoMessage(true);
                setCartProcessing(false);
                return;
            }

            if (!isInStock) {
                setInfoMessage(
                    'Sorry, this item is currently out of stock and cannot be added to your cart',
                );
                setShowInfoMessage(true);
                setCartProcessing(false);
                return;
            }

            if (quantity > total_stock) {
                setInfoMessage(
                    `Only ${total_stock} item${total_stock === 1 ? '' : 's'} available. Please adjust your quantity`,
                );
                setShowInfoMessage(true);
                setCartProcessing(false);
                return;
            }

            const data = {
                type: type,
                item_id: item_id,
                quantity: quantity,
                color: color,
            };

            router.post(
                route('website.carts.add-item'),
                { ...data },
                {
                    onFinish: () => setCartProcessing(false),
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

    const handleRemoveCartItem = async (type, item_id) => {
        try {
            setCartProcessing(true);

            const data = {
                type: type,
                item_id: item_id,
            };

            router.delete(route('website.carts.remove-item'), {
                data: data,
                preserveScroll: true,
                preserveUrl: true,
                preserveState: true,

                // Not Needed Now Now USing Native Alerts
                // onSuccess: (page) => {
                //     if (page.props.flash.success) {
                //         setShowSuccessMessage(true);
                //         setSuccessMessage(page.props.flash.success || 'Product Removing From Cart');
                //     }

                //     if (page.props.flash.error) {
                //         setShowErrorMessage(true);
                //         setErrorMessage(
                //             page.props.flash.error ||
                //                 'Something Went Wrong While Removing Cart Item',
                //         );
                //     }

                //     if (!page.props.flash.success && !page.props.flash.error) {
                //         setShowSuccessMessage(true);
                //         setSuccessMessage('Product Removed From Cart Successfully');
                //     }
                // },
                // onError: (errors) => {
                //     setShowErrorMessage(true);
                //     setErrorMessage(
                //         errors.message || 'Something Went Wrong While Removing Cart Item',
                //     );
                // },
                onFinish: () => {
                    setCartProcessing(false);
                },
            });
        } catch (error) {
            setShowErrorMessage(true);
            setErrorMessage(error?.message || 'Something Went Wrong While Removing Cart Item');
            setCartProcessing(false);
        }
    };

    const handleBuyNow = async (type, item_id, quantity, color, total_stock) => {
        try {
            setBuyNowProcessing(true);
            const alreadyExists = cart_items.some((item) => item.smartphone_id === item_id);

            if (alreadyExists) {
                router.visit(route('website.checkout.index'), {
                    onFinish: () => {
                        setBuyNowProcessing(false);
                    },
                });
                setBuyNowProcessing(false);
                return;
            }

            if (color === '' || !color) {
                setInfoMessage('Please select a color first');
                setShowInfoMessage(true);
                setBuyNowProcessing(false);
                return;
            }

            if (!isInStock) {
                setInfoMessage(
                    'Sorry, this item is currently out of stock and cannot be added to your cart',
                );
                setShowInfoMessage(true);
                setBuyNowProcessing(false);
                return;
            }

            if (quantity > total_stock) {
                setInfoMessage(
                    `Only ${total_stock} item${total_stock === 1 ? '' : 's'} available. Please adjust your quantity`,
                );
                setShowInfoMessage(true);
                setBuyNowProcessing(false);
                return;
            }

            const data = {
                type: type,
                item_id: item_id,
                quantity: quantity,
                color: color,
            };

            router.post(
                route('website.carts.buy-now'),
                { ...data },
                {
                    onFinish: () => {
                        setBuyNowProcessing(false);
                    },
                },
            );
        } catch (error) {
            setBuyNowProcessing(false);
            setShowErrorMessage(true);
            setErrorMessage(error.message);
        }
    };

    // Checking Stock
    const [isInStock, setIsInStock] = useState(feedGallery?.inventory_items_count > 0);

    // Update Stock When Feed Gallery Changes
    useEffect(() => {
        if (feedGallery?.type === 'smartphones') {
            setIsInStock(feedGallery?.inventory_items_count > 0);
        }
    }, [feedGallery?.inventory_items_count, feedGallery?.type]);

    const StockBadge = ({ feedGallery }) => {
        const stock = feedGallery?.inventory_items_count || 0;

        let badgeClass, text, icon;

        if (stock > 10) {
            badgeClass = 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            text = `In Stock: ${stock}`;
            icon = (
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                    />
                </svg>
            );
        } else if (stock > 0) {
            badgeClass = 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
            text = `Low Stock: ${stock}`;
            icon = (
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                    />
                </svg>
            );
        } else {
            badgeClass = 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            text = 'Out of Stock';
            icon = (
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                    />
                </svg>
            );
        }

        return (
            <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${badgeClass}`}
            >
                {icon}
                {text}
            </span>
        );
    };

    // Auto Selecting Color And Quantity If Available Via Cart Item
    useEffect(() => {

        if (!feedGallery || feedGallery.type !== 'smartphones') return;

        if (cart_items.length > 0) {
            const existingCartItem = cart_items.find(
                (item) => item.smartphone_id === feedGallery.id && item.type === 'smartphone',
            );

            if (existingCartItem) {
                const selectedColorObj = feedGallery?.colors?.find(
                    (color) => color.id === existingCartItem.color_id,
                );

                if (selectedColorObj) {
                    setSelectedColor(selectedColorObj.id);
                }
                setQuantity(existingCartItem.quantity);
            }
        }
    }, [cart_items, feedGallery.id, feedGallery?.colors]);





    // Arrows Destructuring From Arrow State
    const { isLeftDisabled, isRightDisabled, isTopDisabled, isBottomDisabled } = arrowStates;

    if (feedGallery !== null && feedGallery?.type === 'posts') {
        return createPortal(
            <>

                {/* Arrows */}
                {/* Left Arrow */}
                <button
                    onClick={handleLeftPrevious}
                    disabled={isLeftDisabled}
                    className={`
                        fixed left-4 top-1/2 -translate-y-1/2 z-[60]
                        ${isLeftDisabled ? 'opacity-20 cursor-not-allowed' : 'opacity-50 hover:opacity-100'}
                        transition-all duration-200
                        bg-white/80 backdrop-blur-md rounded-full p-3 shadow-lg
                        hover:bg-white hover:scale-110
                        dark:bg-zinc-800/80 dark:hover:bg-zinc-700
                        lg:left-24
                    `}
                    aria-label="Previous item"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={3}
                        stroke="currentColor"
                        className="w-6 h-6 text-gray-700 dark:text-white lg:w-8 lg:h-8"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15.75 19.5L8.25 12l7.5-7.5"
                        />
                    </svg>
                </button>

                {/* Right Arrow */}
                <button
                    onClick={handleRightNext}
                    disabled={isRightDisabled}
                    className={`
                        fixed right-4 top-1/2 -translate-y-1/2 z-[60]
                        ${isRightDisabled ? 'opacity-20 cursor-not-allowed' : 'opacity-50 hover:opacity-100'}
                        transition-all duration-200
                        bg-white/80 backdrop-blur-md rounded-full p-3 shadow-lg
                        hover:bg-white hover:scale-110
                        dark:bg-zinc-800/80 dark:hover:bg-zinc-700
                        lg:right-6
                    `}
                    aria-label="Next item"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={3}
                        stroke="currentColor"
                        className="w-6 h-6 text-gray-700 dark:text-white lg:w-8 lg:h-8"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M8.25 4.5l7.5 7.5-7.5 7.5"
                        />
                    </svg>
                </button>

                {/* Top Arrow */}
                <button
                    onClick={handleTopPrevious}
                    disabled={isTopDisabled}
                    className={`
                        fixed top-20 left-1/2 -translate-x-1/2 z-[60]
                        ${isTopDisabled ? 'opacity-20 cursor-not-allowed' : 'opacity-50 hover:opacity-100'}
                        transition-all duration-200
                        bg-white/80 backdrop-blur-md rounded-full p-3 shadow-lg
                        hover:bg-white hover:scale-110
                        dark:bg-zinc-800/80 dark:hover:bg-zinc-700
                        lg:top-24
                    `}
                    aria-label="Previous item"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={3}
                        stroke="currentColor"
                        className="w-6 h-6 text-gray-700 dark:text-white lg:w-8 lg:h-8"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4.5 15.75l7.5-7.5 7.5 7.5"
                        />
                    </svg>
                </button>

                {/* Bottom Arrow */}
                <button
                    onClick={handleBottomNext}
                    disabled={isBottomDisabled}
                    className={`
                        fixed bottom-6 left-1/2 -translate-x-1/2 z-[60]
                        ${isBottomDisabled ? 'opacity-20 cursor-not-allowed' : 'opacity-50 hover:opacity-100'}
                        transition-all duration-200
                        bg-white/80 backdrop-blur-md rounded-full p-3 shadow-lg
                        hover:bg-white hover:scale-110
                        dark:bg-zinc-800/80 dark:hover:bg-zinc-700
                        lg:bottom-8
                    `}
                    aria-label="Next item"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={3}
                        stroke="currentColor"
                        className="w-6 h-6 text-gray-700 dark:text-white lg:w-8 lg:h-8"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                        />
                    </svg>
                </button>



                <div className="fixed inset-0 left-0 z-50 bg-white overscroll-contain dark:bg-zinc-950 lg:left-20">
                    <div className="w-[46%]  pr-10 m-auto mt-2 mb-3">
                        <GlobalSearch
                            additional_filters={false}

                        />
                    </div>

                    <button
                        onClick={() => {
                            setFeedGallery(null);
                            setFeedOpen(false);
                            window.history.replaceState({}, '', window.location.pathname);
                        }}
                        className="absolute z-50 p-2 text-gray-600 transition-colors rounded-full top-4 right-4 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-zinc-800"
                        aria-label="Close modal"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="w-6 h-6"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                    <div className="relative h-[calc(100vh-60px)] overflow-y-auto pb-24 scrollbar-none">
                        <div className="flex flex-col min-h-full lg:flex-row">
                            {feedGallery && (
                                <>
                                    {((Array.isArray(feedGallery?.post_video_urls) &&
                                        feedGallery.post_video_urls.length > 0) ||
                                        (Array.isArray(feedGallery?.post_image_urls) &&
                                            feedGallery.post_image_urls.length > 0)) && (
                                            <div className="w-full flex-shrink-0 p-2 lg:w-[45%] lg:p-4">
                                                <div className="transition-all duration-500 ease-in-out transform translate-y-3">
                                                    <PostMediaViewer
                                                        viewablePost={feedGallery}
                                                        setMediaItems={setMediaItems}
                                                        mediaThumbRefs={mediaThumbRefs}
                                                        selectedMediaIndex={selectedMediaIndex}
                                                        onSelectMediaIndex={setSelectedMediaIndex}
                                                        Placeholder={Placeholder}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                    <div
                                        className={`w-full bg-transparent ${(Array.isArray(feedGallery?.post_video_urls) &&
                                            feedGallery.post_video_urls.length > 0) ||
                                            (Array.isArray(feedGallery?.post_image_urls) &&
                                                feedGallery.post_image_urls.length > 0)
                                            ? 'lg:w-1/2'
                                            : "w-full mx-auto space-y-4 max-w-[40rem] md:max-w-[60rem] lg:max-w-[70rem] xl:max-w-[100rem] px-4 md:px-10 lg:px-16 xl:px-24 "
                                            }`}
                                    >
                                        {((!feedGallery?.post_video_urls?.length &&
                                            !feedGallery?.post_image_urls?.length) ||
                                            windowSize.width > 1024) && (
                                                <div className="w-full p-4 mx-auto space-y-4 md:px-10 lg:pl-6 lg:pr-10">

                                                    <div className="flex items-center justify-between">
                                                        <span className="font-medium text-md text-[#0090FF]">
                                                            <div>
                                                                {feedGallery?.tag && (
                                                                    <button
                                                                        onClick={() => {
                                                                            navigateToHashtag(feedGallery?.tag);
                                                                        }}
                                                                    >
                                                                        {feedGallery?.tag}
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </span>

                                                        <div className="relative">
                                                            <button data-post-actions-button>
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
                                                                    className="absolute right-0 z-50 w-48 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg top-full dark:border-gray-700 dark:bg-deepcharcoal"
                                                                >
                                                                    <div className="py-1">
                                                                        <button
                                                                            onClick={() => {
                                                                                setShowQrCode(true);
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
                                                                                strokeWidth={1.5}
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
                                                                            <span>QR Code</span>
                                                                        </button>

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
                                                                                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-zinc-800"
                                                                            >
                                                                                <svg
                                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                                    fill={
                                                                                        feedGallery?.is_bookmarked
                                                                                            ? isDarkMode
                                                                                                ? '#fff'
                                                                                                : '#0340D1'
                                                                                            : 'none'
                                                                                    }
                                                                                    stroke={
                                                                                        feedGallery?.is_bookmarked
                                                                                            ? isDarkMode
                                                                                                ? '#fff'
                                                                                                : '#0340D1'
                                                                                            : 'currentColor'
                                                                                    }
                                                                                    strokeWidth={1.5}
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
                                                                                    {feedGallery?.is_bookmarked
                                                                                        ? 'Remove Bookmark'
                                                                                        : 'Bookmark'}
                                                                                </span>
                                                                            </button>
                                                                        )}

                                                                        <button
                                                                            onClick={(e) => {
                                                                                const url =
                                                                                    route('home') +
                                                                                    generateURL(feedGallery);
                                                                                navigator.clipboard.writeText(
                                                                                    url.trim(),
                                                                                );
                                                                                setLinkCopied(true);
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
                                                                                strokeWidth={1.5}
                                                                                stroke="currentColor"
                                                                                className="size-5"
                                                                            >
                                                                                <path
                                                                                    strokeLinecap="round"
                                                                                    strokeLinejoin="round"
                                                                                    d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0 1 18 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3 1.5 1.5 3-3.75"
                                                                                />
                                                                            </svg>
                                                                            <span>Copy Link</span>
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div
                                                        className="prose min-h-[50vh] overflow-auto max-h-[60vh] max-w-[90vw] break-words text-[12px] text-gray-800 dark:prose-invert dark:text-white/80 sm:text-[14px] md:text-[15px] lg:max-w-none lg:text-[18px]"
                                                        dangerouslySetInnerHTML={{
                                                            __html: feedGallery?.content,
                                                        }}
                                                    />

                                                    <div className="flex flex-wrap gap-2 my-2 text-sm text-gray-700 dark:text-white/80">
                                                        <span className="flex items-center gap-2 rounded-full">
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
                                                                {feedGallery?.user?.name.length > 15
                                                                    ? feedGallery?.user?.name.substring(0, 15) +
                                                                    '...'
                                                                    : feedGallery?.user?.name || 'Unknown User'}
                                                            </span>
                                                        </span>
                                                    </div>

                                                    <div className="h-32"></div>
                                                </div>
                                            )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </>,
            document.getElementById('modal-root') || document.body,
        );
    }



    if (feedGallery !== null && feedGallery?.type === 'smartphones') {
        return (
            <>
                {createPortal(
                    <>



                        {/* Arrows */}
                        {/* Left Arrow */}
                        <button
                            onClick={handleLeftPrevious}
                            disabled={isLeftDisabled}
                            className={`
                        fixed left-4 top-1/2 -translate-y-1/2 z-[60]
                        ${isLeftDisabled ? 'opacity-20 cursor-not-allowed' : 'opacity-50 hover:opacity-100'}
                        transition-all duration-200
                        bg-white/80 backdrop-blur-md rounded-full p-3 shadow-lg
                        hover:bg-white hover:scale-110
                        dark:bg-zinc-800/80 dark:hover:bg-zinc-700
                        lg:left-24
                    `}
                            aria-label="Previous item"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={3}
                                stroke="currentColor"
                                className="w-6 h-6 text-gray-700 dark:text-white lg:w-8 lg:h-8"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M15.75 19.5L8.25 12l7.5-7.5"
                                />
                            </svg>
                        </button>

                        {/* Right Arrow */}
                        <button
                            onClick={handleRightNext}
                            disabled={isRightDisabled}
                            className={`
                        fixed right-4 top-1/2 -translate-y-1/2 z-[60]
                        ${isRightDisabled ? 'opacity-20 cursor-not-allowed' : 'opacity-50 hover:opacity-100'}
                        transition-all duration-200
                        bg-white/80 backdrop-blur-md rounded-full p-3 shadow-lg
                        hover:bg-white hover:scale-110
                        dark:bg-zinc-800/80 dark:hover:bg-zinc-700
                        lg:right-6
                    `}
                            aria-label="Next item"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={3}
                                stroke="currentColor"
                                className="w-6 h-6 text-gray-700 dark:text-white lg:w-8 lg:h-8"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M8.25 4.5l7.5 7.5-7.5 7.5"
                                />
                            </svg>
                        </button>

                        {/* Top Arrow */}
                        <button
                            onClick={handleTopPrevious}
                            disabled={isTopDisabled}
                            className={`
                        fixed top-20 left-1/2 -translate-x-1/2 z-[60]
                        ${isTopDisabled ? 'opacity-20 cursor-not-allowed' : 'opacity-50 hover:opacity-100'}
                        transition-all duration-200
                        bg-white/80 backdrop-blur-md rounded-full p-3 shadow-lg
                        hover:bg-white hover:scale-110
                        dark:bg-zinc-800/80 dark:hover:bg-zinc-700
                        lg:top-24
                    `}
                            aria-label="Previous item"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={3}
                                stroke="currentColor"
                                className="w-6 h-6 text-gray-700 dark:text-white lg:w-8 lg:h-8"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M4.5 15.75l7.5-7.5 7.5 7.5"
                                />
                            </svg>
                        </button>

                        {/* Bottom Arrow */}
                        <button
                            onClick={handleBottomNext}
                            disabled={isBottomDisabled}
                            className={`
                        fixed bottom-6 left-1/2 -translate-x-1/2 z-[60]
                        ${isBottomDisabled ? 'opacity-20 cursor-not-allowed' : 'opacity-50 hover:opacity-100'}
                        transition-all duration-200
                        bg-white/80 backdrop-blur-md rounded-full p-3 shadow-lg
                        hover:bg-white hover:scale-110
                        dark:bg-zinc-800/80 dark:hover:bg-zinc-700
                        lg:bottom-8
                    `}
                            aria-label="Next item"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={3}
                                stroke="currentColor"
                                className="w-6 h-6 text-gray-700 dark:text-white lg:w-8 lg:h-8"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                                />
                            </svg>
                        </button>






                        <div className="fixed inset-0 left-0 z-50 bg-white dark:bg-zinc-950 lg:left-20">
                            <div className="w-[46%]  pr-10 m-auto mt-2 mb-3">
                                <GlobalSearch
                                    additional_filters={false}

                                />
                            </div>


                            <button
                                onClick={() => {
                                    setFeedGallery(null);
                                    setFeedOpen(false);
                                    window.history.replaceState({}, '', window.location.pathname);
                                }}
                                className="absolute z-50 p-2 text-gray-600 transition-colors rounded-full top-4 right-4 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-zinc-800"
                                aria-label="Close modal"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={2}
                                    stroke="currentColor"
                                    className="w-6 h-6"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>

                            <div className="relative h-[calc(100vh-60px)] overflow-y-auto pb-24 scrollbar-none">
                                <div className="flex flex-col min-h-full lg:flex-row">
                                    <div className="w-full flex-shrink-0 p-2 lg:w-[45%] lg:p-4">
                                        {feedGallery?.images?.length > 0 && (
                                            <div className="transition-all duration-500 ease-in-out transform translate-y-3">
                                                <SmartphoneMediaViewer
                                                    viewableSmartphone={feedGallery}
                                                    selectedMediaIndex={selectedMediaIndex}
                                                    onSelectMediaIndex={setSelectedMediaIndex}
                                                    mediaThumbRefs={mediaThumbRefs}
                                                    Placeholder={Placeholder}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {feedGallery && (
                                        <div className="w-full bg-transparent lg:w-1/2">
                                            {(!feedGallery?.images?.length ||
                                                windowSize.width > 1024) && (
                                                    <div className="w-full p-4 mx-auto space-y-4 md:px-10 lg:pl-6 lg:pr-10">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-lg font-medium text-[#0090FF]">
                                                                <div>
                                                                    {feedGallery?.tag && (
                                                                        <button
                                                                            onClick={() =>
                                                                                navigateToHashtag(
                                                                                    feedGallery?.tag,
                                                                                )
                                                                            }
                                                                        >
                                                                            {feedGallery?.tag}
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </span>

                                                            <div
                                                                className="relative"
                                                                ref={
                                                                    smartphoneDesktopViewerActionDropdownRef
                                                                }
                                                            >
                                                                <button data-smartphone-actions-button>
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
                                                                {showSmartphoneDesktopActionsDropdown && (
                                                                    <div
                                                                        data-smartphone-actions-dropdown
                                                                        className="absolute right-0 z-50 w-48 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg top-full dark:border-gray-700 dark:bg-deepcharcoal"
                                                                    >
                                                                        <div className="py-1">
                                                                            <button
                                                                                onClick={() => {
                                                                                    setShowQrCode(true);
                                                                                    setShowSmartphoneDesktopActionsDropdown(
                                                                                        false,
                                                                                    );
                                                                                }}
                                                                                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-zinc-800"
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
                                                                                <span>QR Code</span>
                                                                            </button>

                                                                            <button
                                                                                onClick={(e) => {
                                                                                    const url =
                                                                                        route('home') +
                                                                                        '?m-slug=' +
                                                                                        feedGallery?.slug;
                                                                                    navigator.clipboard.writeText(
                                                                                        url.trim(),
                                                                                    );
                                                                                    setLinkCopied(true);
                                                                                    setShowSmartphoneDesktopActionsDropdown(
                                                                                        false,
                                                                                    );
                                                                                }}
                                                                                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-zinc-800"
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
                                                                                <span>Copy Link</span>
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div
                                                            className="prose min-h-[50vh] overflow-auto max-h-[60vh] max-w-[90vw] break-words text-[12px] text-gray-800 dark:prose-invert dark:text-white/80 sm:text-[14px] md:text-[15px] lg:max-w-none lg:text-[18px]"
                                                            dangerouslySetInnerHTML={{
                                                                __html: feedGallery?.content,
                                                            }}
                                                        />

                                                        <div className="space-y-3">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-gray-900 text-md dark:text-white/80">
                                                                    <strong>Payment :</strong>
                                                                </span>
                                                                <div className="flex items-center justify-center w-8 h-8 text-xs font-bold text-white bg-orange-500 rounded-full">
                                                                    <svg
                                                                        className="size-10"
                                                                        viewBox="0.004 0 64 64"
                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                        fill="none"
                                                                    >
                                                                        <g
                                                                            id="SVGRepo_bgCarrier"
                                                                            strokeWidth="0"
                                                                        ></g>
                                                                        <g
                                                                            id="SVGRepo_tracerCarrier"
                                                                            strokeLinecap="round"
                                                                            strokeLinejoin="round"
                                                                        ></g>
                                                                        <g id="SVGRepo_iconCarrier">
                                                                            <path
                                                                                d="M63.04 39.741c-4.274 17.143-21.638 27.575-38.783 23.301C7.12 58.768-3.313 41.404.962 24.262 5.234 7.117 22.597-3.317 39.737.957c17.144 4.274 27.576 21.64 23.302 38.784z"
                                                                                fill="none"
                                                                            ></path>
                                                                            <path
                                                                                d="M46.11 27.441c.636-4.258-2.606-6.547-7.039-8.074l1.438-5.768-3.512-.875-1.4 5.616c-.922-.23-1.87-.447-2.812-.662l1.41-5.653-3.509-.875-1.439 5.766c-.764-.174-1.514-.346-2.242-.527l.004-.018-4.842-1.209-.934 3.75s2.605.597 2.55.634c1.422.355 1.68 1.296 1.636 2.042l-1.638 6.571c.098.025.225.061.365.117l-.37-.092-2.297 9.205c-.174.432-.615 1.08-1.609.834.035.051-2.552-.637-2.552-.637l-1.743 4.02 4.57 1.139c.85.213 1.683.436 2.502.646l-1.453 5.835 3.507.875 1.44-5.772c.957.26 1.887.5 2.797.726L27.504 50.8l3.511.875 1.453-5.823c5.987 1.133 10.49.676 12.383-4.738 1.527-4.36-.075-6.875-3.225-8.516 2.294-.531 4.022-2.04 4.483-5.157zM38.087 38.69c-1.086 4.36-8.426 2.004-10.807 1.412l1.928-7.729c2.38.594 10.011 1.77 8.88 6.317zm1.085-11.312c-.99 3.966-7.1 1.951-9.083 1.457l1.748-7.01c1.983.494 8.367 1.416 7.335 5.553z"
                                                                                fill="#ffffff"
                                                                            ></path>
                                                                        </g>
                                                                    </svg>
                                                                </div>
                                                                <div className="flex items-center justify-center w-8 h-8 text-xs font-bold text-white bg-orange-500 rounded-full">
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
                                                                            d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z"
                                                                        />
                                                                    </svg>
                                                                </div>
                                                            </div>

                                                            <div className="text-gray-900 text-md dark:text-white/80">
                                                                <div>
                                                                    <strong>Shipping :</strong> EUR 24.99
                                                                    (approx. KRW 41,515.74) KGB
                                                                </div>
                                                                <div className="mt-1">
                                                                    International shipments may be subject
                                                                    to customs processing and additional
                                                                    charges.
                                                                </div>
                                                            </div>

                                                            <div className="text-gray-900 text-md dark:text-white/80">
                                                                <strong>Location :</strong> Korea
                                                            </div>

                                                            <div className="text-gray-900 text-md dark:text-white/80">
                                                                <strong>Return & Exchange Policy :</strong>
                                                                <button className="ml-1 font-bold text-black underline hover:text-gray-800 dark:text-gray-400">
                                                                    See details
                                                                </button>
                                                            </div>
                                                        </div>

                                                        <div className="w-full max-w-[300px] space-y-4">
                                                            <div className="flex justify-start my-5">
                                                                <StockBadge feedGallery={feedGallery} />
                                                            </div>

                                                            <div className="relative w-full">
                                                                <SelectInput
                                                                    Name={'color'}
                                                                    Id={'color'}
                                                                    items={feedGallery?.colors}
                                                                    Value={selectedColor}
                                                                    itemKey={'name'}
                                                                    Placeholder={'Color'}
                                                                    Action={(value) => {
                                                                        setSelectedColor(value);
                                                                    }}
                                                                    customPlaceHolder={true}
                                                                />
                                                            </div>

                                                            <div className="flex items-center justify-between w-full">
                                                                <span className="text-sm text-gray-900 dark:text-white">
                                                                    Quantity
                                                                </span>
                                                                <div className="flex items-center">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            setQuantity(
                                                                                Math.max(1, quantity - 1),
                                                                            )
                                                                        }
                                                                        className="flex items-center justify-center w-8 h-8 text-gray-600 bg-white border border-r-0 border-gray-300 rounded-l hover:bg-gray-50 focus:outline-none dark:border-gray-600 dark:bg-deepcharcoal dark:text-white/90 dark:hover:bg-zinc-900"
                                                                    >
                                                                        <svg
                                                                            className="w-3 h-3"
                                                                            fill="none"
                                                                            stroke="currentColor"
                                                                            viewBox="0 0 24 24"
                                                                        >
                                                                            <path
                                                                                strokeLinecap="round"
                                                                                strokeLinejoin="round"
                                                                                strokeWidth={2}
                                                                                d="M20 12H4"
                                                                            />
                                                                        </svg>
                                                                    </button>
                                                                    <input
                                                                        type="text"
                                                                        disabled
                                                                        min="1"
                                                                        value={quantity}
                                                                        onChange={(e) =>
                                                                            setQuantity(
                                                                                Math.max(
                                                                                    1,
                                                                                    parseInt(
                                                                                        e.target.value,
                                                                                    ) || 1,
                                                                                ),
                                                                            )
                                                                        }
                                                                        className="w-12 h-8 px-2 text-sm text-center bg-white border-t border-b border-gray-300 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-deepcharcoal dark:text-white/90"
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            setQuantity(quantity + 1)
                                                                        }
                                                                        className="flex items-center justify-center w-8 h-8 text-gray-600 bg-white border border-l-0 border-gray-300 rounded-r hover:bg-gray-50 focus:outline-none dark:border-gray-600 dark:bg-deepcharcoal dark:text-white/90 dark:hover:bg-zinc-900"
                                                                    >
                                                                        <svg
                                                                            className="w-3 h-3"
                                                                            fill="none"
                                                                            stroke="currentColor"
                                                                            viewBox="0 0 24 24"
                                                                        >
                                                                            <path
                                                                                strokeLinecap="round"
                                                                                strokeLinejoin="round"
                                                                                strokeWidth={2}
                                                                                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                                                            />
                                                                        </svg>
                                                                    </button>
                                                                </div>
                                                            </div>

                                                            <div className="h-32"></div>
                                                        </div>
                                                    </div>
                                                )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="fixed bottom-0 left-0 right-0 z-50 p-32 pb-3 mx-auto text-white bg-black pt-7 max-w-7xl">
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <div className="text-xl font-bold lg:text-2xl">
                                            {feedGallery?.selling_info?.total_price ? (
                                                currency?.symbol + feedGallery?.selling_info?.total_price
                                            ) : (
                                                <>Price on request</>
                                            )}
                                        </div>
                                    </div>

                                    {!auth?.user && (
                                        <div className="flex gap-2 lg:gap-3">
                                            <button
                                                className="flex w-[180px] items-center justify-center gap-2 rounded-lg border border-white px-4 py-3 text-sm text-white transition-colors hover:bg-white hover:text-black lg:w-[230px] lg:px-6 lg:text-base"
                                                onClick={() => {
                                                    router.visit(route('login'));
                                                }}
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    strokeWidth={1.5}
                                                    stroke="currentColor"
                                                    className="w-4 h-4"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                                                    />
                                                </svg>
                                                Login to Purchase
                                            </button>

                                            <button
                                                className="px-4 py-3 text-sm text-black transition-colors bg-white rounded-lg hover:bg-gray-200 lg:px-6 lg:text-base"
                                                onClick={() => {
                                                    router.visit(route('register'));
                                                }}
                                            >
                                                Sign Up
                                            </button>
                                        </div>
                                    )}

                                    {auth?.user && (
                                        <div className="flex gap-2 lg:gap-3">
                                            {cart_items.length > 0 ? (
                                                cart_items.some(
                                                    (item) => item.smartphone_id === feedGallery.id,
                                                ) ? (
                                                    <button
                                                        className={`flex ${cartProcessing ? 'w-[150px] lg:w-[150px]' : 'w-[150px] lg:w-[150px]'} items-center justify-center gap-2 rounded-lg border border-white px-4 py-3 text-sm text-white transition-colors hover:bg-white hover:text-black lg:px-6 lg:text-base`}
                                                        onClick={() => {
                                                            handleRemoveCartItem(
                                                                'smartphone',
                                                                feedGallery.id,
                                                            );
                                                        }}
                                                    >
                                                        {cartProcessing && (
                                                            <Spinner customSize={'size-5'} />
                                                        )}
                                                        Remove
                                                    </button>
                                                ) : (
                                                    <button
                                                        className={`flex w-[150px] ${!isInStock && 'pointer-events-none opacity-50'} items-center justify-center gap-2 rounded-lg border border-white px-4 py-3 text-sm text-white transition-colors hover:bg-white hover:text-black lg:w-[150px] lg:px-6 lg:text-base`}
                                                        disabled={!isInStock}
                                                        onClick={() => {
                                                            handleAddCartItem(
                                                                'smartphone',
                                                                feedGallery.id,
                                                                quantity,
                                                                selectedColor,
                                                                feedGallery.inventory_items_count,
                                                            );
                                                        }}
                                                    >
                                                        {cartProcessing && (
                                                            <Spinner customSize={'size-5'} />
                                                        )}
                                                        Cart
                                                    </button>
                                                )
                                            ) : (
                                                <button
                                                    disabled={!isInStock}
                                                    className={`flex w-[150px] ${!isInStock && 'pointer-events-none opacity-50'} items-center justify-center gap-2 rounded-lg border border-white px-4 py-3 text-sm text-white transition-colors hover:bg-white hover:text-black lg:w-[150px] lg:px-6 lg:text-base`}
                                                    onClick={() => {
                                                        handleAddCartItem(
                                                            'smartphone',
                                                            feedGallery.id,
                                                            quantity,
                                                            selectedColor,
                                                            feedGallery.inventory_items_count,
                                                        );
                                                    }}
                                                >
                                                    {cartProcessing && (
                                                        <Spinner customSize={'size-5'} />
                                                    )}
                                                    Cart
                                                </button>
                                            )}

                                            <button
                                                disabled={!isInStock}
                                                className={`flex gap-2 px-4 py-3 text-sm ${!isInStock && 'pointer-events-none opacity-50'} rounded-lg bg-white text-black transition-colors hover:bg-gray-200 lg:px-6 lg:text-base`}
                                                onClick={() => {
                                                    handleBuyNow(
                                                        'smartphone',
                                                        feedGallery.id,
                                                        quantity,
                                                        selectedColor,
                                                        feedGallery.inventory_items_count,
                                                    );
                                                }}
                                            >
                                                {buyNowProcessing && (
                                                    <Spinner customSize={'size-5 text-black'} />
                                                )}
                                                Buy now
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </>,
                    document.getElementById('modal-root') || document.body,
                )}




            </>
        );
    }



    return null;
};

export default DesktopFeed;
