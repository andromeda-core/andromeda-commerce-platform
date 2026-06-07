import SmartphoneContentAccordion from '@/Components/SmartphoneContentAccordion';
import ProductSelectInput from '@/Components/ProductSelectInput';
import SmartphoneDetails from '@/Components/SmartphoneDetails';
import Spinner from '@/Components/Spinner';
import Toast from '@/Components/Toast';
import { router } from '@inertiajs/react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import SmartphoneDetailsAccordion from '@/Components/SmartphoneDetailsAccordion';
import SpatiotemporalInfoModal from '@/Components/SpatiotemporalInfoModal';
import InstagramStyledVideoPlayer from '@/Components/InstagramStyledVideoPlayer';
import DisplayPrice from '@/Components/DisplayPrice';

const SmartphoneMobileGalleryModal = ({
    smartphone,
    setShowQrCode,
    setLinkCopied,
    currency,
    auth,
    navigateToHashtag,
    placeholderImage,
    __,
    showErrorMessage,
    showInfoMessage,
    ErrorMessage,
    InfoMessage,
    setInfoMessage,
    setShowInfoMessage,
    setErrorMessage,
    setShowErrorMessage,
    setMobileFeedGalleryOpen,
    generateSmartphoneURL,
    shouldCleanupBrowserHistoryRef,
    setSpatiotemporalInfoModal,
    spatiotemporalInfoModal,
    previous_url,
}) => {
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
    const [actionDropdownOpen, setActionDropdownOpen] = useState(null);
    const actionDropdownRef = useRef(null);
    const thumbnailContainerRef = useRef(null);
    const scrollContainerRef = useRef(null);
    const ThumbScrollContainerRef = useRef(null);

    // Handle Media scroll Smartphone Media
    const handleScroll = (e) => {
        const container = e.target;
        const scrollLeft = container.scrollLeft;
        const itemWidth = container.offsetWidth;
        const newIndex = Math.round(scrollLeft / itemWidth);

        if (newIndex !== currentMediaIndex) {
            setCurrentMediaIndex(newIndex);

            const activeThumb = thumbnailContainerRef.current?.children[newIndex];
            activeThumb?.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'center',
            });
        }
    };

    const handleThumbnailClick = (index) => {
        setCurrentMediaIndex(index);
        const targetMainItem = ThumbScrollContainerRef.current?.children[index];
        targetMainItem?.scrollIntoView({
            behavior: 'instant',
            block: 'nearest',
            inline: 'start',
        });
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (actionDropdownRef.current && !actionDropdownRef.current.contains(event.target)) {
                setActionDropdownOpen(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const [selectedColor, setSelectedColor] = useState('');
    const [selectedAddon, setSelectedAddon] = useState('');
    const [toggleAccordion, setToggleAccordion] = useState(false);
    const [smartphoneTotalPrice, setSmartphoneTotalPrice] = useState({});

    // Its Just For Initial Check When Smartphone Feed Loads
    const smartphoneCartItemsRef = useRef([]);
    const [cartItemAddons, setCartItemAddons] = useState([]);
    const [cartItemSmartphones, setCartItemSmartphones] = useState([]);

    const [cartProcessing, setCartProcessing] = useState(false);
    const [buyNowProcessing, setBuyNowProcessing] = useState(false);
    const [canActionOnSmartphone, setCanActionOnSmartphone] = useState(false);

    // Checking Stock // (Not Needed RN)
    // const [isInStock, setIsInStock] = useState(smartphone?.inventory_items_count > 0);

    const mediaItems = useMemo(() => {
        const images =
            smartphone?.images?.map((img) => ({
                type: 'image',
                url: img.url,
            })) || [];

        const videos =
            smartphone?.videos?.map((vid) => ({
                type: 'video',
                url: vid.url,
                thumbnail_url: vid?.thumbnail_url,
            })) || [];

        return [...images, ...videos];
    }, [smartphone]);

    // on fEED Open selecting Color For Smartphone
    useEffect(() => {
        if (!smartphone || smartphone.type !== 'smartphones') return;
        const timer = setTimeout(() => {
            if (
                smartphoneCartItemsRef.current.filter((a) => a.smartphone_id === smartphone.id)
                    .length === 0
            ) {
                setSelectedColor(smartphone.colors[0].id);
            }
        }, 0);

        return () => {
            clearTimeout(timer);
        };
    }, [smartphone]);

    // Cart Item Create Logic Of Frontend

    // Specifically For Already Added Smartphone in Cart Calcualtion
    const calculateAddonPrice = (qty, unitPrice) => parseFloat(qty * unitPrice).toFixed(2);

    // Smartphone Handling
    useEffect(() => {
        if (!smartphone || smartphone.type !== 'smartphones') return;
        if (!selectedColor) return;

        const color = smartphone.colors?.find((c) => c.id === selectedColor);

        if (!color) return;

        setCartItemSmartphones((prev) => {
            const existingIndex = prev.findIndex(
                (item) => item.smartphone_id === smartphone.id && item.color_id === color.id,
            );

            if (existingIndex !== -1) {
                const updated = [...prev];

                const unitPrice = Number(smartphone.selling_info?.total_price || 0);
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
                    smartphone_id: smartphone.id,
                    name: smartphone.name,
                    color_id: color.id,
                    color_name: color.name,
                    capacity: smartphone.capacity || null,
                    price: parseFloat(Number(smartphone.selling_info?.total_price || 0)).toFixed(2),
                    unit_price: Number(smartphone.selling_info?.total_price || 0),
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
        if (!smartphone || smartphone.type !== 'smartphones') return;
        if (!selectedAddon) return;

        if (cartItemSmartphones?.length === 0) {
            setSelectedAddon('');
            setInfoMessage(__('Please select any Product First'));
            setShowInfoMessage(true);
            return;
        }

        const addon = smartphone.addons.find((a) => a.id === selectedAddon);

        if (!addon) return;

        setCartItemAddons((prev) => {
            const existingIndex = prev.findIndex(
                (a) => a.id === selectedAddon && a.smartphone_id === smartphone.id,
            );

            if (existingIndex !== -1) {
                const updated = [...prev];

                const unitPrice = Number(addon.price || 0);

                const newQty = updated[existingIndex].quantity + 1;

                updated[existingIndex] = {
                    ...updated[existingIndex],
                    quantity: newQty,
                    price: calculateAddonPrice(newQty, unitPrice),
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
                    smartphone_id: smartphone.id,
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
        return cartItemSmartphones.reduce((sum, item) => sum + Number(item.price || 0), 0);
    }, [cartItemSmartphones, smartphone?.id]);

    const addonSubtotal = useMemo(() => {
        return cartItemAddons.reduce((sum, item) => sum + Number(item.price || 0), 0);
    }, [cartItemAddons, smartphone?.id]);

    const baseTotal = smartphoneSubtotal + addonSubtotal;

    const feeAppliedRef = useRef({});

    // Calculating Smartphone Total Price
    useEffect(() => {
        if (!smartphone || smartphone.type !== 'smartphones') return;
        const smartphoneId = smartphone.id;

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
            const import_tax = smartphone.selling_info?.import_tax;

            if (import_tax) {
                const smartphoneUnitPrice =
                    cartItemSmartphones.find((s) => s.smartphone_id === smartphone?.id)
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

        const shipping_fee = smartphone.selling_info?.shipping_fee;
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
    }, [smartphoneSubtotal, addonSubtotal, smartphone?.id]);

    // Addon Quantity Increase Handling
    const handleAddonIncrease = (id) => {
        setCartItemAddons((prev) => {
            return prev.map((a) => {
                if (a.id === id) {
                    const addon = smartphone.addons.find((addon) => addon.id === id);

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
            return prev.map((a) => {
                if (a.id === id) {
                    const addon = smartphone.addons.find((addon) => addon.id === id);

                    if (a.quantity === 1) {
                        return a;
                    }

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
            });
        });
    };

    // Smartphone Quantity Increase Handling
    const handleSmartphoneIncrease = (id) => {
        setCartItemSmartphones((prev) => {
            return prev.map((a) => {
                if (a.color_id === id) {
                    const unitPrice = Number(smartphone.selling_info?.total_price || 0);
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

                        const unitPrice = Number(smartphone.selling_info?.total_price || 0);
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

    // Update Stock When Feed Gallery Changes // (Not Needed RN)
    // useEffect(() => {
    //     if (smartphone?.type === 'smartphones') {
    //         setIsInStock(smartphone?.inventory_items_count > 0);
    //     }
    // }, [smartphone?.inventory_items_count, smartphone?.type]);

    // Stock Count Badge
    // const StockBadge = ({ smartphone }) => {
    //     const stock = smartphone?.inventory_items_count || 0;
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

            // (Not Needed RN)
            // let quantity = 0;
            // smartphones.forEach((smartphone) => {
            //     quantity += smartphone.quantity;
            // });

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

            smartphones.forEach((smartphone) => {
                data = {
                    ...data,
                    smartphones: [...data.smartphones, smartphone],
                };
            });

            addons.forEach((addon) => {
                data = {
                    ...data,
                    addons: [...data.addons, addon],
                };
            });

            router.post(
                route('website.carts.add-item'),
                { ...data },
                {
                    // onSuccess: (page) => {
                    //     setCartProcessing(false);
                    //     const flash = page.props.flash;
                    //     if (flash?.success) {
                    //         setInfoMessage(flash.success);
                    //         setShowInfoMessage(true);
                    //     } else {
                    //         // Backend se direct message lo jo HTML link bhi contain karta hai
                    //         setInfoMessage(
                    //             __('Added Succesfully To Cart') +
                    //                 ' <a href="' +
                    //                 route('website.carts.index') +
                    //                 '" class="font-semibold underline">' +
                    //                 __('Go To Cart') +
                    //                 '</a>',
                    //         );
                    //         setShowInfoMessage(true);
                    //     }
                    // },
                    // onError: (errors) => {
                    //     setCartProcessing(false);
                    //     setErrorMessage(Object.values(errors)[0] || 'Something went wrong');
                    //     setShowErrorMessage(true);
                    // },
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

            // (Not Needed RN)
            // let quantity = 0;
            // smartphones.forEach((smartphone) => {
            //     quantity += smartphone.quantity;
            // });

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

    const handleAddonRemove = (id) => {
        setCartItemAddons((prev) => {
            return prev.filter((a) => a.id !== id);
        });
    };

    // Watching The Smartphone Cart Item If Smarpthone added Than enable Action Buttons
    useEffect(() => {
        if (cartItemSmartphones?.length > 0 && cartItemSmartphones) {
            setCanActionOnSmartphone(true);
        } else {
            setCanActionOnSmartphone(false);
        }
    }, [cartItemSmartphones, smartphone?.id]);

    // LOCKING BODY WHEN MOUNT TO PREVENT SCROLLS BENEATH MODAL
    // And Cleanup when unmounts
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        document.body.style.touchAction = 'none';

        return () => {
            document.body.style.overflow = '';
            document.body.style.touchAction = '';

            setCartItemAddons([]);
            setCartItemSmartphones([]);
            setBuyNowProcessing(false);
            setCartProcessing(false);
            smartphoneCartItemsRef.current = [];
        };
    }, []);

    return (
        <>
            {(showErrorMessage || showInfoMessage) && (
                <Toast
                    flash={{
                        ...(showErrorMessage && { error: ErrorMessage }),
                        ...(showInfoMessage && { info: InfoMessage }),
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

            {createPortal(
                <div className="fixed inset-0 z-[70] flex flex-col overscroll-contain bg-backgroundLight dark:bg-backgroundDark">
                    <div className="flex shrink-0 items-center justify-between px-4 pb-2 pt-[1.4rem]">
                        <button
                            onClick={() => {
                                if (previous_url) {
                                    shouldCleanupBrowserHistoryRef.current = false;
                                    router.visit(previous_url);
                                } else {
                                    setMobileFeedGalleryOpen(false);
                                }
                            }}
                            className="text-[18px] font-semibold"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2}
                                stroke="currentColor"
                                className="size-6 text-main-text-light dark:text-main-text-dark"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M15.75 19.5 8.25 12l7.5-7.5"
                                />
                            </svg>
                        </button>

                        <button
                            onClick={() => {
                                shouldCleanupBrowserHistoryRef.current = false;
                                navigateToHashtag(smartphone?.tag);
                            }}
                            className="text-[18px] font-semibold text-main-text-light dark:text-main-text-dark"
                        >
                            {smartphone.tag_display ?? smartphone.tag}
                        </button>
                    </div>

                    <div
                        className="flex-1 overflow-y-auto px-8 scrollbar-none"
                        ref={scrollContainerRef}
                    >
                        {mediaItems?.length > 0 && (
                            <div className="relative">
                                {/* Horizontal Scroll Container - Swipeable */}
                                <div
                                    ref={ThumbScrollContainerRef}
                                    onScroll={handleScroll}
                                    className="flex snap-x snap-mandatory overflow-x-auto scrollbar-none"
                                    style={{
                                        scrollbarWidth: 'none',
                                        msOverflowStyle: 'none',
                                        WebkitOverflowScrolling: 'touch',
                                        scrollSnapType: 'x mandatory',
                                        height: 'calc(100vh - 180px)',
                                    }}
                                >
                                    {mediaItems.map((item, index) => (
                                        <div
                                            key={index}
                                            className="flex h-full w-full shrink-0 snap-center snap-always items-center justify-center"
                                        >
                                            {item.type === 'image' ? (
                                                <img
                                                    src={item.url || placeholderImage}
                                                    alt={`Media ${index}`}
                                                    className="h-full max-h-full w-full max-w-full rounded-md object-cover"
                                                    loading="eager"
                                                    fetchpriority="high"
                                                    decoding="async"
                                                    onError={(e) =>
                                                        (e.target.src = placeholderImage)
                                                    }
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center">
                                                    <InstagramStyledVideoPlayer
                                                        thumbnail={
                                                            item?.thumbnail_url || placeholderImage
                                                        }
                                                        className="h-full w-full object-cover"
                                                        videoUrl={item.url}
                                                        Preload="metadata"
                                                        slug={item?.slug}
                                                        timelinePadding={2}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Thumbnail Refs */}

                        <div className="flex items-center justify-start gap-0 pt-4">
                            {/* Thumbnails */}
                            {((Array.isArray(smartphone?.smartphone_video_urls) &&
                                smartphone.smartphone_video_urls.length > 1) ||
                                (Array.isArray(smartphone?.smartphone_image_urls) &&
                                    smartphone.smartphone_image_urls.length > 1)) && (
                                <div
                                    ref={thumbnailContainerRef}
                                    className="flex items-center gap-3 overflow-x-auto scrollbar-none"
                                    style={{ scrollBehavior: 'smooth' }}
                                >
                                    {/* Render thumbnails */}
                                    {mediaItems.map((mediaItem, index) => {
                                        return (
                                            <button
                                                key={index}
                                                onClick={() => handleThumbnailClick(index)}
                                                className={`aspect-square ${currentMediaIndex === index ? 'border-[3px] border-main-text-light dark:border-main-text-dark' : ''} w-[clamp(70px,5vw,70px)] flex-shrink-0 overflow-hidden rounded-md transition-all`}
                                            >
                                                {mediaItem?.type === 'image' ? (
                                                    <img
                                                        src={mediaItem?.url || placeholderImage}
                                                        alt={`Thumbnail ${index + 1}`}
                                                        className="h-full w-full object-cover"
                                                        loading={
                                                            currentMediaIndex === index
                                                                ? 'eager'
                                                                : 'lazy'
                                                        }
                                                        decoding="async"
                                                        fetchpriority={
                                                            currentMediaIndex === index
                                                                ? 'high'
                                                                : 'low'
                                                        }
                                                        onError={(e) =>
                                                            (e.target.src = placeholderImage)
                                                        }
                                                    />
                                                ) : (
                                                    <img
                                                        src={
                                                            mediaItem?.thumbnail_url ||
                                                            placeholderImage
                                                        }
                                                        alt={`Thumbnail ${index + 1}`}
                                                        className="h-full w-full object-cover"
                                                        loading={
                                                            currentMediaIndex === index
                                                                ? 'eager'
                                                                : 'lazy'
                                                        }
                                                        decoding="async"
                                                        fetchpriority={
                                                            currentMediaIndex === index
                                                                ? 'high'
                                                                : 'low'
                                                        }
                                                        onError={(e) =>
                                                            (e.target.src = placeholderImage)
                                                        }
                                                    />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Full Content - Scrollable, No Truncation */}
                        <div className="mb-10 mt-2">
                            {mediaItems?.length === 0 && (
                                <div className="mb-4">
                                    {smartphone?.content && (
                                        <div
                                            // className="prose break-words text-[16px] font-medium leading-[22px] text-main-text-light dark:text-main-text-dark"
                                            className="prose prose-sm max-w-none flex-1 overflow-y-auto whitespace-pre-line break-all pr-2 text-[14px] font-normal text-main-text-light dark:prose-invert dark:text-main-text-dark"
                                            dangerouslySetInnerHTML={{
                                                __html: smartphone?.content,
                                            }}
                                        />
                                    )}
                                </div>
                            )}

                            <div className="mb-4 flex items-center justify-end">
                                <div className="relative" ref={actionDropdownRef}>
                                    <button
                                        className="text-main-text-light dark:text-main-text-dark"
                                        onClick={() => setActionDropdownOpen(!actionDropdownOpen)}
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={2.5}
                                            stroke="currentColor"
                                            className="h-7 w-7"
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

                                    {actionDropdownOpen && (
                                        <div className="absolute right-0 top-full z-50 w-56 rounded-md border border-surface-3-light bg-backgroundLight dark:border-surface-3-dark dark:bg-surface-1-dark">
                                            <div className="py-1">
                                                <button
                                                    onClick={() => {
                                                        setShowQrCode(true);
                                                        setActionDropdownOpen(null);
                                                    }}
                                                    className="flex w-full items-center gap-3 rounded-md px-4 py-3 text-sm text-main-text-light transition-colors dark:text-main-text-dark"
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        strokeWidth={1.5}
                                                        stroke="currentColor"
                                                        className="h-5 w-5"
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
                                                    <span>{__('QR Code')}</span>
                                                </button>

                                                <button
                                                    onClick={() => {
                                                        const url =
                                                            route('home') +
                                                            generateSmartphoneURL(
                                                                smartphone,
                                                                true,
                                                                true,
                                                            );
                                                        navigator.clipboard.writeText(url.trim());
                                                        setLinkCopied(true);
                                                        setActionDropdownOpen(null);
                                                    }}
                                                    className="flex w-full items-center gap-3 rounded-md px-4 py-3 text-sm text-main-text-light transition-colors dark:text-main-text-dark"
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        strokeWidth={1.5}
                                                        stroke="currentColor"
                                                        className="h-5 w-5"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0 1 18 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3 1.5 1.5 3-3.75"
                                                        />
                                                    </svg>
                                                    <span>{__('Copy Link')}</span>
                                                </button>

                                                {/* Spatiotemporal Information */}
                                                {smartphone?.latitude != null &&
                                                    smartphone?.longitude != null && (
                                                        <button
                                                            onClick={(e) => {
                                                                setSpatiotemporalInfoModal(true);
                                                                setActionDropdownOpen(null);
                                                            }}
                                                            className="flex w-full items-center gap-3 rounded-md px-4 py-3 text-sm text-main-text-light transition-colors dark:text-main-text-dark"
                                                        >
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                strokeWidth={1.5}
                                                                stroke="currentColor"
                                                                className="h-5 w-5"
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
                                                                {__('Spatiotemporal Info')}
                                                            </span>
                                                        </button>
                                                    )}

                                                <span className="flex w-full items-center gap-3 rounded-md px-4 py-3 text-xs text-main-text-light transition-colors dark:text-main-text-dark">
                                                    <span>
                                                        {__('Post Created')}:
                                                        <p>
                                                            {smartphone?.added_at}{' '}
                                                            {smartphone?.created_at_time}
                                                        </p>
                                                    </span>
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div key={smartphone?.slug} className="max-w-lg">
                                <div className="flex flex-col items-start gap-4">
                                    <SmartphoneDetails
                                        key={smartphone?.slug}
                                        // StockBadge={StockBadge({ smartphone })}
                                        currency={currency}
                                        product={smartphone}
                                    />

                                    {/* Divider */}
                                    {smartphone?.addons?.length > 0 && (
                                        <div className="mt-1 h-px w-full bg-[#c8c8c8] dark:bg-surface-3-dark" />
                                    )}

                                    {smartphone?.addons?.length > 0 && (
                                        <ProductSelectInput
                                            InputName={__('Add-ons')}
                                            Name={'addons'}
                                            Id={'addons'}
                                            items={smartphone?.addons}
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
                                    {(cartItemAddons?.length > 0 ||
                                        cartItemSmartphones?.length > 0) && (
                                        <div className="mt-5 h-px w-full bg-[#c8c8c8] dark:bg-surface-3-dark" />
                                    )}

                                    {/* Smartphone Items */}
                                    {cartItemSmartphones?.length > 0 &&
                                        cartItemSmartphones?.map((smartphone, index) => (
                                            <div
                                                className="w-full rounded-sm bg-surface-1-light p-4 dark:bg-surface-2-dark"
                                                key={index}
                                            >
                                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                                    <div className="flex flex-col items-start gap-3">
                                                        {/* Product Name */}
                                                        <div className="w-full min-w-0">
                                                            <p className="w-full break-all text-sm text-main-text-light dark:text-main-text-dark">
                                                                {smartphone?.name} /{' '}
                                                                {smartphone?.capacity} /{' '}
                                                                {smartphone?.color_name}
                                                            </p>
                                                        </div>

                                                        {/* Price */}
                                                        <div className="flex-shrink-0">
                                                            <DisplayPrice
                                                                usdAmount={smartphone?.price}
                                                                showCode
                                                                showEstimatedLabel={false}
                                                                className="text-md font-medium text-main-text-light dark:text-main-text-dark"
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Quantity Selector */}
                                                    <div className="inline-flex items-center self-start overflow-hidden rounded-md border border-[#c8c8c8] dark:border-surface-3-dark">
                                                        {/* DECREASE */}
                                                        <button
                                                            onClick={() =>
                                                                handleSmartphoneDecrease(
                                                                    smartphone?.color_id,
                                                                )
                                                            }
                                                            className="flex h-6 w-6 items-center justify-center bg-white text-main-text-light transition-colors hover:bg-surface-2-light disabled:opacity-50 dark:bg-surface-2-dark dark:text-main-text-dark dark:hover:bg-surface-3-dark"
                                                        >
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                viewBox="0 0 24 24"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                strokeWidth={1.5}
                                                                className="h-3 w-3"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    d="M19.5 12h-15"
                                                                />
                                                            </svg>
                                                        </button>

                                                        {/* QUANTITY */}
                                                        <span className="flex h-6 min-w-[2rem] items-center justify-center border-l border-r border-[#c8c8c8] bg-white text-sm font-semibold text-sub-text-light dark:border-surface-3-dark dark:bg-surface-2-dark dark:text-sub-text-dark">
                                                            {smartphone?.quantity}
                                                        </span>

                                                        {/* INCREASE */}
                                                        <button
                                                            onClick={() =>
                                                                handleSmartphoneIncrease(
                                                                    smartphone?.color_id,
                                                                )
                                                            }
                                                            className="flex h-6 w-6 items-center justify-center bg-white text-main-text-light transition-colors hover:bg-surface-2-light dark:bg-surface-2-dark dark:text-main-text-dark dark:hover:bg-surface-3-dark"
                                                        >
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                viewBox="0 0 24 24"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                strokeWidth={1.5}
                                                                className="h-3 w-3"
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
                                            </div>
                                        ))}

                                    {/* Addon Items */}
                                    {cartItemAddons?.length > 0 &&
                                        cartItemAddons?.map((addon, index) => (
                                            <div
                                                className="relative w-full rounded-sm bg-surface-1-light p-4 dark:bg-surface-2-dark"
                                                key={index}
                                            >
                                                {/* Remove Addon */}
                                                <button
                                                    onClick={() => {
                                                        handleAddonRemove(addon?.id);
                                                    }}
                                                    className="absolute bottom-0 right-2 z-[90] rounded-full p-2 text-main-text-light transition dark:text-main-text-dark"
                                                    aria-label="Close modal"
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        strokeWidth={2}
                                                        stroke="currentColor"
                                                        className="h-6 w-6"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M6 18L18 6M6 6l12 12"
                                                        />
                                                    </svg>
                                                </button>

                                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                                    <div className="flex flex-col items-start gap-3">
                                                        {/* Product Name */}
                                                        <div className="w-full min-w-0">
                                                            <p className="w-full break-all text-sm text-main-text-light dark:text-main-text-dark">
                                                                {addon?.name}
                                                            </p>
                                                        </div>

                                                        {/* Price */}
                                                        <div className="flex-shrink-0">
                                                            <DisplayPrice
                                                                usdAmount={addon?.price}
                                                                showCode
                                                                showEstimatedLabel={false}
                                                                className="text-md font-medium text-main-text-light dark:text-main-text-dark"
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Quantity Selector */}
                                                    <div className="inline-flex items-center self-start overflow-hidden rounded-md border border-[#c8c8c8] dark:border-surface-3-dark">
                                                        {/* DECREASE */}
                                                        <button
                                                            onClick={() =>
                                                                handleAddonDecrease(addon?.id)
                                                            }
                                                            className="flex h-6 w-6 items-center justify-center bg-white text-main-text-light transition-colors hover:bg-surface-2-light disabled:opacity-50 dark:bg-surface-2-dark dark:text-main-text-dark dark:hover:bg-surface-3-dark"
                                                        >
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                viewBox="0 0 24 24"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                strokeWidth={1.5}
                                                                className="h-3 w-3"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    d="M19.5 12h-15"
                                                                />
                                                            </svg>
                                                        </button>

                                                        {/* QUANTITY */}
                                                        <span className="flex h-6 min-w-[2rem] items-center justify-center border-l border-r border-[#c8c8c8] bg-white text-sm font-semibold text-sub-text-light dark:border-surface-3-dark dark:bg-surface-2-dark dark:text-sub-text-dark">
                                                            {addon?.quantity}
                                                        </span>

                                                        {/* INCREASE */}
                                                        <button
                                                            onClick={() =>
                                                                handleAddonIncrease(addon?.id)
                                                            }
                                                            className="flex h-6 w-6 items-center justify-center bg-white text-main-text-light transition-colors hover:bg-surface-2-light dark:bg-surface-2-dark dark:text-main-text-dark dark:hover:bg-surface-3-dark"
                                                        >
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                viewBox="0 0 24 24"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                strokeWidth={1.5}
                                                                className="h-3 w-3"
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
                                            </div>
                                        ))}

                                    {/* Divider */}
                                    <div className="mt-5 h-px w-full bg-[#c8c8c8] dark:bg-surface-3-dark" />

                                    {/* Product Price */}
                                    <div className="flex w-full items-center">
                                        <span className="text-left font-medium text-main-text-light dark:text-main-text-dark">
                                            {__('Total Price')}
                                        </span>
                                        <div className="ml-auto flex items-center gap-2">
                                            {smartphone?.is_sold_out && (
                                                <span className="inline-block rounded bg-red-600 px-2 py-0.5 text-[11px] font-semibold text-white">
                                                    {__('Sold Out')}
                                                </span>
                                            )}
                                            <DisplayPrice
                                                usdAmount={smartphoneTotalPrice[smartphone?.id]}
                                                showEstimatedLabel={false}
                                                className={`text-right text-[18px] font-semibold text-main-text-light dark:text-main-text-dark ${smartphone?.is_sold_out ? 'line-through' : ''}`}
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
                                                            cartItemSmartphones,
                                                            cartItemAddons,
                                                            smartphone?.inventory_items_count,
                                                        );
                                                    }}
                                                    disabled={
                                                        !canActionOnSmartphone ||
                                                        smartphone?.is_sold_out
                                                    }
                                                    className={`h-12 flex-1 rounded-md border border-main-text-light bg-white text-center text-sm font-semibold text-main-text-light transition hover:bg-main-text-dark/80 dark:border-main-text-dark dark:bg-main-text-dark dark:bg-main-text-dark/80 ${(!canActionOnSmartphone || smartphone?.is_sold_out) && 'cursor-not-allowed opacity-50'}`}
                                                >
                                                    <div className="flex items-center justify-center">
                                                        {cartProcessing && <Spinner />}

                                                        <span>
                                                            {smartphone?.is_sold_out
                                                                ? __('Sold Out')
                                                                : __('Add to cart')}
                                                        </span>
                                                    </div>
                                                </button>

                                                {/* Buy now */}
                                                <button
                                                    onClick={() =>
                                                        handleBuyNow(
                                                            cartItemSmartphones,
                                                            cartItemAddons,
                                                            smartphone?.id,
                                                            smartphone?.inventory_items_count,
                                                        )
                                                    }
                                                    disabled={
                                                        !canActionOnSmartphone ||
                                                        smartphone?.is_sold_out
                                                    }
                                                    className={`h-12 flex-1 rounded-md border border-main-text-dark bg-main-text-light text-sm font-semibold text-main-text-dark transition hover:bg-main-text-light/80 dark:bg-main-text-light dark:hover:bg-main-text-light/80 ${(!canActionOnSmartphone || smartphone?.is_sold_out) && 'cursor-not-allowed opacity-50'}`}
                                                >
                                                    <div className="flex items-center justify-center">
                                                        {buyNowProcessing && <Spinner />}

                                                        <span>
                                                            {smartphone?.is_sold_out
                                                                ? __('Sold Out')
                                                                : __('Buy now')}
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
                                                        const redirectUrl =
                                                            window.location.pathname +
                                                            window.location.search;
                                                        router.get(route('login'), {
                                                            redirect: redirectUrl,
                                                        });
                                                    }}
                                                    className="h-12 flex-1 rounded-md border border-main-text-light bg-white text-sm font-semibold text-main-text-light transition hover:bg-main-text-dark/80 dark:border-main-text-dark dark:bg-main-text-dark dark:bg-main-text-dark/80"
                                                >
                                                    {__('Login')}
                                                </button>

                                                {/*Register*/}
                                                <button
                                                    onClick={() => {
                                                        shouldCleanupBrowserHistoryRef.current = false;
                                                        const redirectUrl =
                                                            window.location.pathname +
                                                            window.location.search;
                                                        router.get(route('register'), {
                                                            redirect: redirectUrl,
                                                        });
                                                    }}
                                                    className="h-12 flex-1 rounded-md border border-main-text-dark bg-main-text-light text-sm font-semibold text-main-text-dark transition hover:bg-main-text-light/80 dark:bg-main-text-light dark:hover:bg-main-text-light/80"
                                                >
                                                    {__('Register')}
                                                </button>
                                            </>
                                        )}
                                    </div>

                                    {/* Accordian */}
                                    {/* Product Content */}
                                    {mediaItems?.length > 0 && (
                                        <SmartphoneContentAccordion
                                            content={smartphone?.content}
                                            label={__('About this product')}
                                            isHtml={true}
                                            onToggle={setToggleAccordion}
                                            defaultOpen={toggleAccordion}
                                            scrollContainerRef={scrollContainerRef}
                                        />
                                    )}

                                    {smartphone?.product_details && (
                                        <>
                                            {/* Product Details */}
                                            <SmartphoneDetailsAccordion
                                                productDetails={smartphone?.product_details}
                                                label={__('Product Details')}
                                                onToggle={setToggleAccordion}
                                                defaultOpen={toggleAccordion}
                                                scrollContainerRef={scrollContainerRef}
                                            />
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>,
                document.getElementById('modal-root') || document.body,
            )}

            {spatiotemporalInfoModal && (
                <SpatiotemporalInfoModal
                    onClose={() => {
                        setSpatiotemporalInfoModal(false);
                    }}
                    post={smartphone}
                />
            )}
        </>
    );
};

export default SmartphoneMobileGalleryModal;
