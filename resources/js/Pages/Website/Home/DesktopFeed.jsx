import React, { useEffect, useMemo, useRef, useState } from 'react';
import { router } from '@inertiajs/react';
import useDarkMode from '@/Hooks/useDarkMode';
import Spinner from '@/Components/Spinner';
import VideoWithThumbnail from '@/Components/VideoWithThumbnail';
import { AnimatePresence, motion } from 'framer-motion';
import SmartphoneDetails from '@/Components/SmartphoneDetails';
import Accordion from '@/Components/Accordian';
import ProductSelectInput from '@/Components/ProductSelectInput';

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
    cart_items,
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
    __,
}) => {
    const isDarkMode = useDarkMode();
    const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
    const [showPostDesktopActionsDropdown, setShowPostDesktopActionsDropdown] = useState(false);
    const mediaThumbRefs = useRef([]);
    const loadedCache = useRef(new Set());
    const [currentFeedIndex, setCurrentFeedIndex] = useState(feedIndex || 0);
    const currentFeedIndexRef = useRef(feedIndex || 0);
    const [feedItems, setFeedItems] = useState(feed || []);
    const relatedFeedRef = useRef(relatedFeed || {});
    const viewableFeedRef = useRef([]);
    const viewableFeedRefIndex = useRef(0);


    const [isTextPost, setIsTextPost] = useState(false);

    useEffect(() => {
        setIsTextPost(mediaItems?.length === 0);
    }, [mediaItems]);

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
            const url = route('home') + '?m-slug=' + currentItem?.slug;
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
            const url = route('home') + '?m-slug=' + currentItem?.slug;
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

        viewableFeedRef.current = [feedItem, ...(relatedFeedRef.current[feedItem.slug] || [])];

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
        if (!mediaEl || !mediaThumbEl || isTextPost) return;

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
    }, [mediaItems.length, isTextPost]);

    // Smartphone Logic
    const [selectedColor, setSelectedColor] = useState('');
    const [selectedAddon, setSelectedAddon] = useState('');
    const [toggleAccordion, setToggleAccordion] = useState(false);
    const [smartphoneTotalPrice, setSmartphoneTotalPrice] = useState({});

    const [cartItemAddons, setCartItemAddons] = useState([]);
    const [cartItemSmartphones, setCartItemSmartphones] = useState([]);

    const smartphoneDesktopViewerActionDropdownRef = useRef(null);
    const [showSmartphoneDesktopActionsDropdown, setShowSmartphoneDesktopActionsDropdown] =
        useState(false);

    const [cartProcessing, setCartProcessing] = useState(false);
    const [buyNowProcessing, setBuyNowProcessing] = useState(false);
    const [canActionOnSmartphone, setCanActionOnSmartphone] = useState(false);

    // Checking Stock
    const [isInStock, setIsInStock] = useState(feedGallery?.inventory_items_count > 0);

    // Checking Cart State
    const [isInCart, setIsInCart] = useState(false);

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

    // Smartphone Handling
    useEffect(() => {
        if (!feedGallery || feedGallery.type !== 'smartphones') return;
        if (!selectedColor) return;
        if (isInCart) {
            setInfoMessage(__('Please Remove Previous Item From Cart To Add New Item'));
            setShowInfoMessage(true);
            setSelectedColor('');
            return;
        }
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
    }, [selectedColor, isInCart]);

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

    const baseTotal = useMemo(() => {
        const smartphoneTotal = cartItemSmartphones
            .filter((item) => item.smartphone_id === feedGallery?.id)
            .reduce((sum, item) => sum + Number(item.price || 0), 0);

        const addonTotal = cartItemAddons
            .filter((item) => item.smartphone_id === feedGallery?.id)
            .reduce((sum, item) => sum + Number(item.price || 0), 0);

        return smartphoneTotal + addonTotal;
    }, [cartItemSmartphones, cartItemAddons, feedGallery?.id]);

    const feeAppliedRef = useRef({});

    // Calculating Smartphone Total Price
    useEffect(() => {
        if (!feedGallery || feedGallery.type !== 'smartphones') return;
        const smartphoneId = feedGallery.id;

        if (baseTotal === 0) {
            setSmartphoneTotalPrice((prev) => ({
                ...prev,
                [smartphoneId]: 0,
            }));
            feeAppliedRef.current[smartphoneId] = false;
            return;
        }

        let shippingAmount = 0;
        let taxAmount = 0;

        if (!feeAppliedRef.current[smartphoneId]) {
            const import_tax = feedGallery.selling_info?.import_tax;

            if (import_tax) {
                taxAmount =
                    import_tax.value_type === 'percentage'
                        ? (baseTotal * Number(import_tax.default_value || 0)) / 100
                        : Number(import_tax.default_value || 0);
            }

            feeAppliedRef.current[smartphoneId] = {
                tax: taxAmount,
            };
        } else {
            taxAmount = feeAppliedRef.current[smartphoneId].tax;
        }

        // Adding Shipping Fee With Each Product
        const shipping_fee = feedGallery.selling_info?.shipping_fee;

        if (shipping_fee) {
            const current_smartphone = cartItemSmartphones?.filter(
                (smartphone) => smartphone.smartphone_id === feedGallery?.id,
            );

            let quantity = null;

            if (current_smartphone.length !== 0) {
                quantity = current_smartphone[0].quantity;
            }

            shippingAmount =
                shipping_fee.value_type === 'percentage'
                    ? (baseTotal * Number(shipping_fee.default_value || 0) * quantity) / 100
                    : Number(shipping_fee.default_value || 0) * quantity;
        }

        const total = (baseTotal + shippingAmount + taxAmount).toFixed(2);

        setSmartphoneTotalPrice((prev) => ({
            ...prev,
            [smartphoneId]: total,
        }));
    }, [baseTotal, feedGallery?.id]);

    // Addon Quantity Increase Handling
    const handleAddonIncrease = (id) => {
        setCartItemAddons((prev) => {
            return prev.map((a) => {
                if (a.id === id) {
                    const addon = feedGallery.addons.find((addon) => addon.id === id);

                    const unitPrice = Number(addon.price || 0);
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

    // Addon Quantity Decrease Handling
    const handleAddonDecrease = (id) => {
        setCartItemAddons((prev) => {
            return prev
                .map((a) => {
                    if (a.id === id) {
                        const addon = feedGallery.addons.find((addon) => addon.id === id);

                        const unitPrice = Number(addon.price || 0);
                        const previousTotal = Number(a.price || 0);

                        const newTotal = previousTotal - unitPrice;
                        const newQty = a.quantity - 1;

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

    // Update Stock When Feed Gallery Changes
    useEffect(() => {
        if (feedGallery?.type === 'smartphones') {
            setIsInStock(feedGallery?.inventory_items_count > 0);
        }
    }, [feedGallery?.inventory_items_count, feedGallery?.type]);

    // Stock Count Badge
    const StockBadge = ({ feedGallery }) => {
        const stock = feedGallery?.inventory_items_count || 0;
        let badgeClass, text;

        if (stock > 10) {
            badgeClass = 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            text = `${__('In Stock')}: ${stock}`;
        } else if (stock > 0) {
            badgeClass = 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
            text = `${__('Low Stock')}: ${stock}`;
        } else {
            badgeClass = 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            text = __('Out of Stock');
        }

        return (
            <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${badgeClass}`}
            >
                {text}
            </span>
        );
    };

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

            if (!isInStock) {
                setInfoMessage(
                    __('Sorry, this item is currently out of stock and cannot be added to your cart'),
                );
                setShowInfoMessage(true);
                setCartProcessing(false);
                return;
            }

            let quantity = 0;
            smartphones.forEach((smartphone) => {
                quantity += smartphone.quantity;
            });

            if (quantity > total_stock) {
                setInfoMessage(
                    `${'Only'} ${total_stock} ${total_stock === 1 ? __('Item') : __('Items')} ${__('Stock available. For This Smartphone Please adjust your quantity')}`,
                );
                setShowInfoMessage(true);
                setCartProcessing(false);
                return;
            }

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
                    onFinish: () => {
                        setCartProcessing(false);
                        setIsInCart(true);
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

                onFinish: () => {
                    setCartProcessing(false);
                    setIsInCart(false);
                },
            });
        } catch (error) {
            setShowErrorMessage(true);
            setErrorMessage(error?.message || __('Something Went Wrong While Removing Cart Item'));
            setCartProcessing(false);
        }
    };

    const handleBuyNow = async (smartphones, addons, item_id, total_stock) => {
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

            if (smartphones.length === 0 && addons.length === 0) {
                setInfoMessage(__('Please select any Item First'));
                setShowInfoMessage(true);
                setBuyNowProcessing(false);
                return;
            }

            if (!isInStock) {
                setInfoMessage(
                    __('Sorry, this item is currently out of stock and cannot be added to your cart'),
                );
                setShowInfoMessage(true);
                setBuyNowProcessing(false);
                return;
            }

            let quantity = 0;
            smartphones.forEach((smartphone) => {
                quantity += smartphone.quantity;
            });

            if (quantity > total_stock) {
                setInfoMessage(
                    `${'Only'} ${total_stock} ${total_stock === 1 ? __('Item') : __('Items')} ${__('Stock available. For This Smartphone Please adjust your quantity')}`,
                );
                setShowInfoMessage(true);
                setBuyNowProcessing(false);
                return;
            }

            let data = {
                smartphones: [],
                addons: [],
            };

            smartphones
                .filter((smartphone) => smartphone.smartphone_id === item_id)
                .forEach((smartphone) => {
                    data = {
                        ...data,
                        smartphones: [...data.smartphones, smartphone],
                    };
                });

            addons
                .filter((smartphone) => smartphone.smartphone_id === item_id)
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
                    onSuccess: (page) => {
                        if (page.props.flash?.success) {
                            setTimeout(() => {
                                router.visit(route('website.checkout.index'));
                            }, 500);
                        }
                    },
                    onFinish: () => setBuyNowProcessing(false),
                    preserveScroll: true,
                    preserveUrl: true,
                    preserveState: true,
                },
            );
        } catch (error) {
            setBuyNowProcessing(false);
            setShowErrorMessage(true);
            setErrorMessage(error.message);
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

    // Watcing The Cart items When FeedChanges From Cart if exists than makes it true
    useEffect(() => {
        if (feedGallery?.type !== 'smartphones' || !feedGallery?.id) return;
        setIsInCart(cart_items.some((item) => item.smartphone_id === feedGallery?.id));
    }, [feedGallery?.id]);

    // CleanUp
    useEffect(() => {
        return () => {
            window.history.replaceState({}, '', window.location.pathname);
            setCartProcessing(false);
            setBuyNowProcessing(false);
            setFeedGallery(null);
            setCanActionOnSmartphone(false);
            setCartItemAddons([]);
            setCartItemSmartphones([]);
            setCurrentFeedIndex(0);
            setFeedItems([]);
            setIsInCart(false);
            setMediaItems([]);
            setSelectedAddon('');
            setSelectedColor('');
            setSelectedMediaIndex(0);
            setFeedGallery(null);
            setFeedOpen(false);
            mediaThumbRefs.current = {};
        };
    }, []);

    // Format Date For POST AND PRODUCTS TAGS
    function formatDate(dateInput) {
        const date = new Date(dateInput);

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        return `${year}. ${month}. ${day}.`;
    }

    // Format Time For POST AND PRODUCTS TAGS
    function formatTime(dateInput) {
        const date = new Date(dateInput);

        let hours = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, '0');

        const period = hours >= 12 ? 'PM' : 'AM';

        hours = hours % 12;
        hours = hours === 0 ? 12 : hours;

        return `${period} ${hours}:${minutes}`;
    }

    // Arrows Destructuring From Arrow State
    const { isLeftDisabled, isRightDisabled, isTopDisabled, isBottomDisabled } = arrowStates;

    // TEXT ONLY POSTS
    if (feedGallery !== null && feedGallery?.type === 'posts' && isTextPost) {
        return (
            <>
                {/* Modal Container */}
                <div className="h-full mt-10 overflow-hidden">
                    <div className="relative mx-auto w-full max-w-[1300px] px-6 lg:px-[96px] xl:px-[120px]">
                        {/* Navigation Arrows */}
                        {/* Left Arrow */}
                        <button
                            onClick={handleLeftPrevious}
                            disabled={isLeftDisabled}
                            className={`absolute left-[clamp(8px,3vw,10px)] top-1/2 z-[60] -translate-y-1/2 rounded-full bg-surface-1-light p-3 transition-all duration-200 hover:scale-110 dark:bg-surface-2-dark dark:hover:bg-surface-3-dark ${isLeftDisabled ? 'cursor-not-allowed opacity-20' : ''}`}
                            aria-label="Previous item"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                className="w-6 h-6 text-main-text-light dark:text-sub-text-dark lg:h-6 lg:w-6"
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
                                setFeedGallery(null);
                                setFeedOpen(false);
                                setMediaItems([]);
                                mediaThumbRefs.current = {};
                                window.history.replaceState({}, '', window.location.pathname);
                            }}
                            className="absolute right-6 top-0 z-[90] rounded-full p-2 text-main-text-light transition dark:text-main-text-dark"
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

                        {/* Right Side Navigation */}
                        <div className="absolute right-[clamp(8px,2vw,32px)] top-1/2 z-[60] flex -translate-y-1/2 flex-col items-center gap-8">
                            {/* Up Arrow */}
                            <button
                                onClick={handleTopPrevious}
                                disabled={isTopDisabled}
                                className={`rounded-full bg-surface-1-light p-3 transition-all duration-200 hover:scale-110 dark:bg-surface-2-dark dark:hover:bg-surface-3-dark ${isTopDisabled ? 'cursor-not-allowed opacity-20' : ''}`}
                                aria-label="Previous Item"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    className="w-6 h-6 text-main-text-light dark:text-sub-text-dark lg:h-6 lg:w-6"
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
                                className={`rounded-full bg-surface-1-light p-3 transition-all duration-200 hover:scale-110 dark:bg-surface-2-dark dark:hover:bg-surface-3-dark ${isRightDisabled ? 'cursor-not-allowed opacity-20' : ''}`}
                                aria-label="Next item"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    className="w-6 h-6 text-main-text-light dark:text-sub-text-dark lg:h-6 lg:w-6"
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
                                className={`rounded-full bg-surface-1-light p-3 transition-all duration-200 hover:scale-110 dark:bg-surface-2-dark dark:hover:bg-surface-3-dark ${isBottomDisabled ? 'cursor-not-allowed opacity-20' : ''}`}
                                aria-label="Next item"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={2}
                                    stroke="currentColor"
                                    className="w-6 h-6 text-main-text-light dark:text-sub-text-dark lg:h-6 lg:w-6"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="m19.5 8.25-7.5 7.5-7.5-7.5"
                                    />
                                </svg>
                            </button>
                        </div>

                        <div className="transition-all duration-300 bg-backgroundLight dark:bg-backgroundDark">
                            {/* Scrollable Content */}
                            <div className="h-full">
                                <div className="flex flex-col gap-7 bg-backgroundLight dark:bg-backgroundDark lg:flex-row lg:items-start">
                                    {/* Content Area - Matches Media Feed Structure */}
                                    <div className="mx-auto flex h-[90vh] w-full flex-col lg:w-[90%] xl:w-[75%]">
                                        {/* Tag and Actions Header */}
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex-1">
                                                {feedGallery?.tag && (
                                                    <button
                                                        onClick={() =>
                                                            navigateToHashtag(feedGallery?.tag)
                                                        }
                                                        className="text-lg font-medium text-main-text-light hover:text-main-text-light/80 dark:text-main-text-dark dark:hover:text-sub-text-dark"
                                                    >
                                                        {feedGallery?.tag}
                                                    </button>
                                                )}
                                            </div>

                                            {/* Three Dot Menu */}
                                            <div className="relative">
                                                <button
                                                    data-post-actions-button
                                                    className="p-2 transition-colors rounded-full hover:bg-surface-1-light dark:hover:bg-surface-1-dark"
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        strokeWidth={1.5}
                                                        stroke="currentColor"
                                                        className="w-6 h-6 dark:text-white"
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
                                                        className="absolute right-0 z-50 w-56 border rounded-md top-full border-surface-3-light bg-backgroundLight dark:border-surface-3-dark dark:bg-surface-1-dark"
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
                                                                                onSuccess: () => {
                                                                                    feedGallery.is_bookmarked =
                                                                                        !feedGallery.is_bookmarked;
                                                                                    setShowPostDesktopActionsDropdown(
                                                                                        false,
                                                                                    );
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
                                                                            ? __('Remove Bookmark')
                                                                            : __('Bookmark')}
                                                                    </span>
                                                                </button>
                                                            )}

                                                            {/* Copy Link */}
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
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Post Content - Scrollable */}
                                        <div className="flex-1 overflow-y-auto scrollbar-none">
                                            <div
                                                className="pr-2 prose-sm prose break-all whitespace-pre-line max-w-none text-main-text-light dark:prose-invert dark:text-main-text-dark"
                                                dangerouslySetInnerHTML={{
                                                    __html: feedGallery?.content,
                                                }}
                                            />

                                            {/* Bottom Metadata */}
                                            <div className="pt-5 shrink-0">
                                                <div className="flex flex-wrap items-center gap-3 text-sm">
                                                    {/* User Info */}
                                                    <div className="flex gap-2 p-2 rounded-full bg-surface-1-light text-sub-text-light dark:bg-surface-2-dark dark:text-sub-text-dark">
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
                                                                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                                                            />
                                                        </svg>
                                                        <span className="font-medium">
                                                            {feedGallery?.user?.name?.length > 15
                                                                ? feedGallery?.user?.name.substring(
                                                                    0,
                                                                    15,
                                                                ) + '...'
                                                                : feedGallery?.user?.name ||
                                                                'Unknown User'}
                                                        </span>
                                                    </div>

                                                    {/* Location */}
                                                    {feedGallery?.location_name && (
                                                        <div className="p-2 rounded-full bg-surface-1-light text-sub-text-light dark:bg-surface-2-dark dark:text-sub-text-dark">
                                                            <span className="font-medium">
                                                                {feedGallery?.location_name
                                                                    ?.length > 15
                                                                    ? feedGallery?.location_name.substring(
                                                                        0,
                                                                        15,
                                                                    ) + '...'
                                                                    : feedGallery?.location_name ||
                                                                    'Unknown Location'}
                                                            </span>
                                                        </div>
                                                    )}

                                                    {/* Date */}
                                                    <div className="p-2 rounded-full bg-surface-1-light text-sub-text-light dark:bg-surface-2-dark dark:text-sub-text-dark">
                                                        <span className="font-medium">
                                                            {formatDate(feedGallery?.created_at)}
                                                        </span>
                                                    </div>

                                                    {/* Time */}
                                                    <div className="p-2 rounded-full bg-surface-1-light text-sub-text-light dark:bg-surface-2-dark dark:text-sub-text-dark">
                                                        <span className="font-medium">
                                                            {formatTime(feedGallery?.created_at)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }
    // Non Text POSTS
    if (feedGallery !== null && feedGallery?.type === 'posts') {
        return (
            <>
                {/* Modal Container */}

                <div className="h-full mt-10 overflow-hidden">
                    <div className="relative mx-auto w-full max-w-[1300px] px-6 lg:px-[96px] xl:px-[120px]">
                        {/* Navigation Arrows */}
                        {/* Left Arrow */}
                        <button
                            onClick={handleLeftPrevious}
                            disabled={isLeftDisabled}
                            className={`absolute left-[clamp(8px,3vw,10px)] top-1/2 z-[60] -translate-y-1/2 rounded-full bg-surface-1-light p-3 transition-all duration-200 hover:scale-110 dark:bg-surface-2-dark dark:hover:bg-surface-3-dark ${isLeftDisabled ? 'cursor-not-allowed opacity-20' : ''}`}
                            aria-label="Previous item"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                className="w-6 h-6 text-main-text-light dark:text-sub-text-dark lg:h-6 lg:w-6"
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
                                setFeedGallery(null);
                                setFeedOpen(false);
                                setMediaItems([]);
                                mediaThumbRefs.current = {};
                                window.history.replaceState({}, '', window.location.pathname);
                            }}
                            className="absolute right-6 top-0 z-[90] rounded-full p-2 text-main-text-light transition dark:text-main-text-dark"
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

                        <div className="absolute right-[clamp(8px,2vw,32px)] top-1/2 z-[60] flex -translate-y-1/2 flex-col items-center gap-8">
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
                                    className="w-6 h-6 text-main-text-light dark:text-sub-text-dark lg:h-6 lg:w-6"
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
                                    className="w-6 h-6 text-main-text-light dark:text-sub-text-dark lg:h-6 lg:w-6"
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
                                    className="w-6 h-6 text-main-text-light dark:text-sub-text-dark lg:h-6 lg:w-6"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="m19.5 8.25-7.5 7.5-7.5-7.5"
                                    />
                                </svg>
                            </button>
                        </div>

                        <div
                            className={`bg-backgroundLight transition-all duration-300 dark:bg-backgroundDark`}
                        >
                            {/* Scrollable Content */}
                            <div className="h-full">
                                <div className="flex flex-col gap-7 bg-backgroundLight dark:bg-backgroundDark lg:flex-row lg:items-start">
                                    {feedGallery && (
                                        <>
                                            {/* Left Side - Image Viewer */}
                                            {((Array.isArray(feedGallery?.post_video_urls) &&
                                                feedGallery.post_video_urls.length > 0) ||
                                                (Array.isArray(feedGallery?.post_image_urls) &&
                                                    feedGallery.post_image_urls.length > 0)) && (
                                                    <div
                                                        className="relative flex w-full justify-center lg:w-[50%] xl:w-[50%]"
                                                        ref={MediaRef}
                                                    >
                                                        <div className="aspect-[3/2] h-[90vh] w-full max-w-[520px] lg:aspect-[2/4]">
                                                            <div className="invisible w-full h-full bg-surface-1 dark:bg-backgroundDark">
                                                                {mediaItems[selectedMediaIndex]
                                                                    ?.type === 'image' ? (
                                                                    <img
                                                                        src={
                                                                            mediaItems[
                                                                                selectedMediaIndex
                                                                            ]?.url || Placeholder
                                                                        }
                                                                        alt={`Media ${selectedMediaIndex}`}
                                                                        className="object-cover object-center w-full h-full rounded-md"
                                                                        loading={'high'}
                                                                        decoding={'async'}
                                                                        fetchpriority={'high'}
                                                                        onError={(e) =>
                                                                            (e.target.src = Placeholder)
                                                                        }
                                                                    />
                                                                ) : (
                                                                    <VideoWithThumbnail
                                                                        type="customized"
                                                                        className={
                                                                            'h-full w-full rounded-md object-cover object-center'
                                                                        }
                                                                        thumbnail={
                                                                            mediaItems[
                                                                                selectedMediaIndex
                                                                            ]?.thumbnail_url ||
                                                                            Placeholder
                                                                        }
                                                                        videoUrl={
                                                                            mediaItems[
                                                                                selectedMediaIndex
                                                                            ]?.url
                                                                        }
                                                                    />
                                                                )}
                                                            </div>
                                                            {/* Animated layers */}
                                                            <AnimatePresence
                                                                initial={false}
                                                                custom={direction}
                                                            >
                                                                <div className="absolute inset-0 flex items-center justify-center w-full h-full">
                                                                    {mediaItems.map((item, idx) => {
                                                                        const isCurrent =
                                                                            idx === selectedMediaIndex;

                                                                        return (
                                                                            <motion.div
                                                                                key={`${idx}-${item.url}`}
                                                                                initial={false}
                                                                                animate={{
                                                                                    opacity: isCurrent
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
                                                                                        onError={(e) =>
                                                                                        (e.target.src =
                                                                                            Placeholder)
                                                                                        }
                                                                                    />
                                                                                ) : (
                                                                                    <VideoWithThumbnail
                                                                                        type="customized"
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
                                            <div className="flex h-[90vh] w-full flex-col lg:w-[40%] xl:w-[45%]">
                                                {/* Image Thumbnails Strip */}
                                                <div className="flex items-center gap-0">
                                                    {/* Prev indicator */}
                                                    {canGoPrev && (
                                                        <button
                                                            className="mr-2 mb-2 flex h-[clamp(66px,5.2vw,66px)] w-[clamp(40px,2.5vw,40px)] flex-shrink-0 items-center justify-center rounded-md bg-surface-2-light dark:bg-surface-2-dark"
                                                            onClick={() => {
                                                                const newPage = thumbPage - 1;
                                                                const firstIndex =
                                                                    newPage * MAX_THUMBS;

                                                                setThumbPage(newPage);
                                                                setSelectedMediaIndex(firstIndex);
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
                                                        feedGallery.post_video_urls.length > 1) ||
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
                                                                                        onError={(e) =>
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
                                                                                        onError={(e) =>
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
                                                                setSelectedMediaIndex(firstIndex);
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
                                                <div className="flex-1 overflow-y-auto scrollbar-none">
                                                    {/* Tag and Actions Header */}
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex-1">
                                                            {feedGallery?.tag && (
                                                                <button
                                                                    onClick={() =>
                                                                        navigateToHashtag(
                                                                            feedGallery?.tag,
                                                                        )
                                                                    }
                                                                    className="text-lg font-medium text-main-text-light hover:text-main-text-light/80 dark:text-main-text-dark dark:hover:text-sub-text-dark"
                                                                >
                                                                    {feedGallery?.tag}
                                                                </button>
                                                            )}
                                                        </div>

                                                        {/* Three Dot Menu */}
                                                        <div className="relative">
                                                            <button
                                                                data-post-actions-button
                                                                className="p-2 transition-colors rounded-full hover:bg-surface-1-light dark:hover:bg-surface-1-dark"
                                                            >
                                                                <svg
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    fill="none"
                                                                    viewBox="0 0 24 24"
                                                                    strokeWidth={1.5}
                                                                    stroke="currentColor"
                                                                    className="w-6 h-6 dark:text-white"
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
                                                                    className="absolute right-0 z-50 w-56 border rounded-md top-full border-surface-3-light bg-backgroundLight dark:border-surface-3-dark dark:bg-surface-1-dark"
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
                                                                                    route('home') +
                                                                                    generateURL(
                                                                                        feedGallery,
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
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Post Content */}
                                                    <div
                                                        className="flex-1 pr-2 overflow-y-auto prose-sm prose break-all whitespace-pre-line max-w-none text-main-text-light dark:prose-invert dark:text-main-text-dark"
                                                        dangerouslySetInnerHTML={{
                                                            __html: feedGallery?.content,
                                                        }}
                                                    />

                                                    <div className="pt-10 shrink-0">
                                                        <div className="flex flex-wrap items-center gap-3 text-sm">
                                                            {/* User Info */}
                                                            <div className="flex gap-2 p-2 rounded-full bg-surface-1-light text-sub-text-light dark:bg-surface-2-dark dark:text-sub-text-dark">
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
                                                                        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                                                                    />
                                                                </svg>
                                                                <span className="font-medium">
                                                                    {feedGallery?.user?.name
                                                                        ?.length > 15
                                                                        ? feedGallery?.user?.name.substring(
                                                                            0,
                                                                            15,
                                                                        ) + '...'
                                                                        : feedGallery?.user?.name ||
                                                                        'Unknown User'}
                                                                </span>
                                                            </div>

                                                            {/* Location */}
                                                            {feedGallery?.location_name && (
                                                                <div className="p-2 rounded-full bg-surface-1-light text-sub-text-light dark:bg-surface-2-dark dark:text-sub-text-dark">
                                                                    <span className="font-medium">
                                                                        {feedGallery?.location_name
                                                                            ?.length > 15
                                                                            ? feedGallery?.location_name.substring(
                                                                                0,
                                                                                15,
                                                                            ) + '...'
                                                                            : feedGallery?.location_name ||
                                                                            'Unknown Location'}
                                                                    </span>
                                                                </div>
                                                            )}

                                                            {/* Date */}
                                                            <div className="p-2 rounded-full bg-surface-1-light text-sub-text-light dark:bg-surface-2-dark dark:text-sub-text-dark">
                                                                <span className="font-medium">
                                                                    {formatDate(
                                                                        feedGallery?.created_at,
                                                                    )}
                                                                </span>
                                                            </div>

                                                            {/* Time */}
                                                            <div className="p-2 rounded-full bg-surface-1-light text-sub-text-light dark:bg-surface-2-dark dark:text-sub-text-dark">
                                                                <span className="font-medium">
                                                                    {formatTime(
                                                                        feedGallery?.created_at,
                                                                    )}
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
            </>
        );
    }

    // Smartphones
    if (feedGallery !== null && feedGallery?.type === 'smartphones') {
        return (
            <>
                {/* Modal Container */}
                <div className="h-full mt-10 overflow-hidden">
                    <div className="relative mx-auto w-full max-w-[1300px] px-6 lg:px-[96px] xl:px-[120px]">
                        {/* Navigation Arrows */}
                        {/* Left Arrow */}
                        <button
                            onClick={handleLeftPrevious}
                            disabled={isLeftDisabled}
                            className={`absolute left-[clamp(8px,3vw,10px)] top-1/2 z-[60] -translate-y-1/2 rounded-full bg-surface-1-light p-3 transition-all duration-200 hover:scale-110 dark:bg-surface-2-dark dark:hover:bg-surface-3-dark ${isLeftDisabled ? 'cursor-not-allowed opacity-20' : ''}`}
                            aria-label="Previous item"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                className="w-6 h-6 text-main-text-light dark:text-sub-text-dark lg:h-6 lg:w-6"
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
                                setFeedGallery(null);
                                setFeedOpen(false);
                                setMediaItems([]);
                                mediaThumbRefs.current = {};
                                window.history.replaceState({}, '', window.location.pathname);
                            }}
                            className="absolute right-6 top-0 z-[90] rounded-full p-2 text-main-text-light transition dark:text-main-text-dark"
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

                        <div className="absolute right-[clamp(8px,2vw,32px)] top-1/2 z-[60] flex -translate-y-1/2 flex-col items-center gap-8">
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
                                    className="w-6 h-6 text-main-text-light dark:text-sub-text-dark lg:h-6 lg:w-6"
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
                                    className="w-6 h-6 text-main-text-light dark:text-sub-text-dark lg:h-6 lg:w-6"
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
                                    className="w-6 h-6 text-main-text-light dark:text-sub-text-dark lg:h-6 lg:w-6"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="m19.5 8.25-7.5 7.5-7.5-7.5"
                                    />
                                </svg>
                            </button>
                        </div>

                        <div
                            className={`bg-backgroundLight transition-all duration-300 dark:bg-backgroundDark`}
                        >
                            {/* Scrollable Content */}
                            <div className="h-full">
                                <div className="flex flex-col gap-7 bg-backgroundLight dark:bg-backgroundDark lg:flex-row lg:items-start">
                                    {feedGallery && (
                                        <>
                                            {/* Left Side - Image Viewer */}
                                            {Array.isArray(feedGallery?.images) &&
                                                feedGallery.images.length > 0 && (
                                                    <div
                                                        className="relative flex w-full justify-center lg:w-[50%] xl:w-[50%]"
                                                        ref={MediaRef}
                                                    >
                                                        <div className="aspect-[3/2] h-[90vh] w-full max-w-[520px] lg:aspect-[2/4]">
                                                            <div className="invisible w-full h-full bg-surface-1 dark:bg-backgroundDark">
                                                                {mediaItems[selectedMediaIndex]
                                                                    ?.type === 'image' ? (
                                                                    <img
                                                                        src={
                                                                            mediaItems[
                                                                                selectedMediaIndex
                                                                            ]?.url || Placeholder
                                                                        }
                                                                        alt={`Media ${selectedMediaIndex}`}
                                                                        className="object-cover object-center w-full h-full rounded-md"
                                                                        loading={'high'}
                                                                        decoding={'async'}
                                                                        fetchpriority={'high'}
                                                                        onError={(e) =>
                                                                        (e.target.src =
                                                                            Placeholder)
                                                                        }
                                                                    />
                                                                ) : (
                                                                    <VideoWithThumbnail
                                                                        type="customized"
                                                                        className={
                                                                            'h-full w-full rounded-md object-cover object-center'
                                                                        }
                                                                        thumbnail={
                                                                            mediaItems[
                                                                                selectedMediaIndex
                                                                            ]?.thumbnail_url ||
                                                                            Placeholder
                                                                        }
                                                                        videoUrl={
                                                                            mediaItems[
                                                                                selectedMediaIndex
                                                                            ]?.url
                                                                        }
                                                                    />
                                                                )}
                                                            </div>
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
                                                                                    <VideoWithThumbnail
                                                                                        type="customized"
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
                                            <div className="flex h-[90vh] w-full flex-col lg:w-[40%] xl:w-[45%]">
                                                {/* Image Thumbnails Strip */}
                                                <div className="flex items-center gap-0 pb-1">
                                                    {/* Prev indicator */}
                                                    {canGoPrev && (
                                                        <button
                                                            className="mx-2 flex h-[clamp(66px,5.2vw,66px)] w-[clamp(40px,2.5vw,40px)] flex-shrink-0 items-center justify-center rounded-md bg-surface-2-light dark:bg-surface-2-dark"
                                                            onClick={() => {
                                                                const newPage = thumbPage - 1;
                                                                const firstIndex =
                                                                    newPage * MAX_THUMBS;

                                                                setThumbPage(newPage);
                                                                setSelectedMediaIndex(firstIndex);
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
                                                    {Array.isArray(feedGallery?.images) &&
                                                        feedGallery.images.length > 1 && (
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
                                                                setSelectedMediaIndex(firstIndex);
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
                                                <div className="flex-1 overflow-y-auto scrollbar-none">
                                                    {/* Tag and Actions Header */}
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex-1">
                                                            {feedGallery?.tag && (
                                                                <button
                                                                    onClick={() =>
                                                                        navigateToHashtag(
                                                                            feedGallery?.tag,
                                                                        )
                                                                    }
                                                                    className="text-lg font-medium text-main-text-light hover:text-main-text-light/80 dark:text-main-text-dark dark:hover:text-sub-text-dark"
                                                                >
                                                                    {feedGallery?.tag}
                                                                </button>
                                                            )}
                                                        </div>

                                                        {/* Three Dot Menu */}
                                                        <div
                                                            className="relative"
                                                            ref={
                                                                smartphoneDesktopViewerActionDropdownRef
                                                            }
                                                        >
                                                            <button
                                                                data-smartphone-actions-button
                                                                className="p-2 transition-colors rounded-full hover:bg-surface-1-light dark:hover:bg-surface-1-dark"
                                                            >
                                                                <svg
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    fill="none"
                                                                    viewBox="0 0 24 24"
                                                                    strokeWidth={1.5}
                                                                    stroke="currentColor"
                                                                    className="w-6 h-6 dark:text-white"
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
                                                                    className="absolute right-0 z-50 w-56 border rounded-md top-full border-surface-3-light bg-backgroundLight dark:border-surface-3-dark dark:bg-surface-1-dark"
                                                                >
                                                                    <div className="py-2">
                                                                        {/* QR Code */}
                                                                        <button
                                                                            onClick={() => {
                                                                                setShowQrCode(true);
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

                                                                        {/* Copy Link */}
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
                                                                    </div>
                                                                </div>
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
                                                                StockBadge={StockBadge({
                                                                    feedGallery,
                                                                })}
                                                                currency={currency}
                                                                product={feedGallery}
                                                            />

                                                            {/* Divider */}
                                                            <div className="mt-1 h-px w-full bg-[#c8c8c8] dark:bg-surface-3-dark" />
                                                            <ProductSelectInput
                                                                Name={'color'}
                                                                Id={'color'}
                                                                items={feedGallery?.colors}
                                                                Value={selectedColor}
                                                                itemKey={'name'}
                                                                Placeholder={__('Color')}
                                                                Action={(value) => {
                                                                    setSelectedColor(value);
                                                                }}
                                                                customPlaceHolder={true}
                                                            />

                                                            {feedGallery?.addons?.length > 0 && (
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
                                                                    .map((smartphone, index) => (
                                                                        <div
                                                                            className="w-full p-4 rounded-sm bg-surface-1-light dark:bg-surface-2-dark"
                                                                            key={index}
                                                                        >
                                                                            <div className="flex items-center justify-between gap-4">
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
                                                                                    <p className="text-xl font-medium text-main-text-light dark:text-main-text-dark">
                                                                                        {
                                                                                            currency?.name
                                                                                        }{' '}
                                                                                        {
                                                                                            currency?.symbol
                                                                                        }{' '}
                                                                                        {
                                                                                            smartphone?.price
                                                                                        }
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    ))}

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
                                                                            className="w-full p-4 rounded-sm bg-surface-1-light dark:bg-surface-2-dark"
                                                                            key={index}
                                                                        >
                                                                            <div className="flex items-center justify-between gap-4">
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
                                                                                    <p className="text-xl font-medium text-main-text-light dark:text-main-text-dark">
                                                                                        {
                                                                                            currency?.name
                                                                                        }{' '}
                                                                                        {
                                                                                            currency?.symbol
                                                                                        }{' '}
                                                                                        {
                                                                                            addon?.price
                                                                                        }
                                                                                    </p>
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
                                                                <span className="ml-auto text-3xl font-semibold text-right text-main-text-light dark:text-main-text-dark">
                                                                    {currency?.symbol}
                                                                    {smartphoneTotalPrice[
                                                                        feedGallery?.id
                                                                    ] || 0}
                                                                </span>
                                                            </div>

                                                            {/* Buttons */}
                                                            <div className="flex w-full gap-x-4">
                                                                {auth?.user && (
                                                                    <>
                                                                        {!isInCart && (
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
                                                                                        !canActionOnSmartphone
                                                                                    }
                                                                                    className={`h-12 flex-1 rounded-md border border-main-text-light bg-white text-center text-lg font-semibold text-main-text-light transition hover:bg-main-text-dark/80 dark:border-main-text-dark dark:bg-main-text-dark dark:bg-main-text-dark/80 ${!canActionOnSmartphone && 'cursor-not-allowed opacity-50'}`}
                                                                                >
                                                                                    <div className="flex items-center justify-center">
                                                                                        {cartProcessing && (
                                                                                            <Spinner />
                                                                                        )}

                                                                                        <span>
                                                                                            {__('Add to cart')}
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
                                                                                        !canActionOnSmartphone
                                                                                    }
                                                                                    className={`h-12 flex-1 rounded-md border border-main-text-dark bg-main-text-light text-lg font-semibold text-main-text-dark transition hover:bg-main-text-light/80 dark:bg-main-text-light dark:hover:bg-main-text-light/80 ${!canActionOnSmartphone && 'cursor-not-allowed opacity-50'}`}
                                                                                >
                                                                                    <div className="flex items-center justify-center">
                                                                                        {buyNowProcessing && (
                                                                                            <Spinner />
                                                                                        )}

                                                                                        <span>
                                                                                            {__('Buy now')}
                                                                                        </span>
                                                                                    </div>
                                                                                </button>
                                                                            </>
                                                                        )}

                                                                        {isInCart && (
                                                                            <>
                                                                                {/* Remove */}
                                                                                <button
                                                                                    onClick={() => {
                                                                                        handleRemoveCartItem(
                                                                                            'smartphone',
                                                                                            feedGallery?.id,
                                                                                        );
                                                                                    }}
                                                                                    className={`h-12 flex-1 rounded-md border border-main-text-light bg-white text-center text-lg font-semibold text-main-text-light transition hover:bg-main-text-dark/80 dark:border-main-text-dark dark:bg-main-text-dark dark:bg-main-text-dark/80`}
                                                                                >
                                                                                    <div className="flex items-center justify-center">
                                                                                        {cartProcessing && (
                                                                                            <Spinner />
                                                                                        )}

                                                                                        <span>
                                                                                            {__('Remove From Cart')}
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
                                                                                    className={`h-12 flex-1 rounded-md border border-main-text-dark bg-main-text-light text-lg font-semibold text-main-text-dark transition hover:bg-main-text-light/80 dark:bg-main-text-light dark:hover:bg-main-text-light/80`}
                                                                                >
                                                                                    <div className="flex items-center justify-center">
                                                                                        {buyNowProcessing && (
                                                                                            <Spinner />
                                                                                        )}

                                                                                        <span>
                                                                                            {__('Buy now')}
                                                                                        </span>
                                                                                    </div>
                                                                                </button>
                                                                            </>
                                                                        )}
                                                                    </>
                                                                )}

                                                                {!auth?.user && (
                                                                    <>
                                                                        {/* Login */}
                                                                        <button
                                                                            onClick={() =>
                                                                                router.get(
                                                                                    route('login'),
                                                                                    {
                                                                                        redirect:
                                                                                            window
                                                                                                .location
                                                                                                .pathname +
                                                                                            window
                                                                                                .location
                                                                                                .search,
                                                                                    },
                                                                                )
                                                                            }
                                                                            className="flex-1 h-12 text-lg font-semibold transition bg-white border rounded-md border-main-text-light text-main-text-light hover:bg-main-text-dark/80 dark:border-main-text-dark dark:bg-main-text-dark dark:bg-main-text-dark/80"
                                                                        >
                                                                            {__('Login')}
                                                                        </button>

                                                                        {/*Register*/}
                                                                        <button
                                                                            onClick={() =>
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
                                                                                )
                                                                            }
                                                                            className="flex-1 h-12 text-lg font-semibold transition border rounded-md border-main-text-dark bg-main-text-light text-main-text-dark hover:bg-main-text-light/80 dark:bg-main-text-light dark:hover:bg-main-text-light/80"
                                                                        >
                                                                            {__('Register')}
                                                                        </button>
                                                                    </>
                                                                )}
                                                            </div>

                                                            {/* Accordian */}
                                                            <div className="!mt-2">
                                                                {/* Product Details */}
                                                                <Accordion
                                                                    content={feedGallery?.content}
                                                                    label={__('About this product')}
                                                                    isHtml={true}
                                                                    onToggle={setToggleAccordion}
                                                                    defaultOpen={toggleAccordion}
                                                                />
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
            </>
        );
    }
    return null;
};

export default DesktopFeed;
