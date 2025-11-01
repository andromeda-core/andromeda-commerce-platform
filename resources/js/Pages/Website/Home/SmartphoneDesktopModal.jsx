import GlobalSearch from '@/Components/GlobalSearch';
import LinkCopiedModal from '@/Components/LinkCopiedModal';
import useWindowSize from '@/Hooks/useWindowSize';
import { router, usePage } from '@inertiajs/react';
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import QRCode from 'react-qr-code';
import SmartphoneMediaViewer from './SmartphoneMediaViewer';
import SelectInput from '@/Components/SelectInput';
import Toast from '@/Components/Toast';
import Spinner from '@/Components/Spinner';

const SmartphoneDesktopModal = ({
    smartphoneDesktopModal,
    setSmartphoneDesktopModal,
    smartphone,
    setSmartphone,
    searchHistory,
}) => {
    if (!smartphoneDesktopModal) return null;

    const { currency, cart_items, auth } = usePage().props;
    const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
    const mediaThumbRefs = useRef([]);

    const [selectedColor, setSelectedColor] = useState('');
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        if (!smartphoneDesktopModal) return;
        const url = new URL(window.location);

        if (!url.searchParams.get('m-slug')) {
            if (smartphone?.slug) {
                url.searchParams.set('m-slug', smartphone.slug);
            }

            window.history.pushState({ modal: 'smartphone-viewer' }, '', url.toString() || '');
        }

        return () => {
            if (!smartphoneDesktopModal) {
                setSmartphoneDesktopModal(false);
                setSmartphone(null);
                setQuantity(1);
                setSelectedColor('');
                mediaThumbRefs.current([]);
                window.history.replaceState({}, '', window.location.pathname);
            }
        };
    }, [smartphoneDesktopModal, smartphone?.slug, setSmartphoneDesktopModal, setSmartphone]);

    const windowSize = useWindowSize();

    const smartphoneDesktopViewerActionDropdownRef = useRef(null);
    const [showSmartphoneDesktopActionsDropdown, setShowSmartphoneDesktopActionsDropdown] =
        useState(false);

    const [showQrCode, setShowQrCode] = useState(false);
    const [linkCopied, setLinkCopied] = useState(false);

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

    useEffect(() => {
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
    }, []);

    const [cartProcessing, setCartProcessing] = useState(false);
    const [showErrorMessage, setShowErrorMessage] = useState(false);
    const [ErrorMessage, setErrorMessage] = useState('');

    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [SuccessMessage, setSuccessMessage] = useState('');

    const [showInfoMessage, setShowInfoMessage] = useState(false);
    const [InfoMessage, setInfoMessage] = useState('');

    // Auto Closing The Message Alerts
    useEffect(() => {
        if (showErrorMessage) {
            const timer = setTimeout(() => {
                setShowErrorMessage(false);
                setErrorMessage('');
            }, 1500);
            return () => clearTimeout(timer);
        }

        if (showInfoMessage) {
            const timer = setTimeout(() => {
                setShowInfoMessage(false);
                setInfoMessage('');
            }, 1500);
            return () => clearTimeout(timer);
        }

        if (showSuccessMessage) {
            const timer = setTimeout(() => {
                setShowSuccessMessage(false);
                setSuccessMessage('');
            }, 700);
            return () => clearTimeout(timer);
        }
    }, [showErrorMessage, showInfoMessage, showSuccessMessage]);

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
                    onSuccess: (page) => {
                        if (page.props.flash.success) {
                            setShowSuccessMessage(true);
                            setSuccessMessage(page.props.flash.success);
                        }

                        if (page.props.flash.error) {
                            setShowErrorMessage(true);
                            setErrorMessage(page.props.flash.error);
                        }

                        if (!page.props.flash.success && !page.props.flash.error) {
                            setShowSuccessMessage(true);
                            setSuccessMessage('Product Added To Cart Successfully');
                        }
                    },
                    onError: (errors) => {
                        setShowErrorMessage(true);
                        setErrorMessage(
                            errors.message || 'Something Went Wrong While Removing Cart Item',
                        );
                    },
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
                onSuccess: (page) => {
                    if (page.props.flash.success) {
                        setShowSuccessMessage(true);
                        setSuccessMessage(page.props.flash.success || 'Product Removing From Cart');
                    }

                    if (page.props.flash.error) {
                        setShowErrorMessage(true);
                        setErrorMessage(
                            page.props.flash.error ||
                                'Something Went Wrong While Removing Cart Item',
                        );
                    }

                    if (!page.props.flash.success && !page.props.flash.error) {
                        setShowSuccessMessage(true);
                        setSuccessMessage('Product Removed From Cart Successfully');
                    }
                },
                onError: (errors) => {
                    setShowErrorMessage(true);
                    setErrorMessage(
                        errors.message || 'Something Went Wrong While Removing Cart Item',
                    );
                },
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

    // Checking Stock
    const [isInStock, setIsInStock] = useState(smartphone?.inventory_items_count > 0);
    const StockBadge = ({ smartphone }) => {
        const stock = smartphone?.inventory_items_count || 0;

        let badgeClass, text, icon;

        if (stock > 10) {
            badgeClass = 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            text = `In Stock: ${stock}`;
            icon = (
                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
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
                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
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
                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
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
        if (cart_items.length > 0) {
            const existingCartItem = cart_items.find(
                (item) => item.smartphone_id === smartphone.id && item.type === 'smartphone',
            );

            if (existingCartItem) {
                const selectedColorObj = smartphone?.colors?.find(
                    (color) => color.id === existingCartItem.color_id,
                );

                if (selectedColorObj) {
                    setSelectedColor(selectedColorObj.id);
                }
                setQuantity(existingCartItem.quantity);
            }
        }
    }, [cart_items, smartphone.id, smartphone?.colors]);

    return (
        <>
            {(showErrorMessage || showInfoMessage || showSuccessMessage) && (
                <Toast
                    flash={{
                        ...(showErrorMessage && { error: ErrorMessage }),
                        ...(showInfoMessage && { info: InfoMessage }),
                        ...(showSuccessMessage && { success: SuccessMessage }),
                    }}
                />
            )}

            {createPortal(
                <>
                    <div className="fixed inset-0 left-0 z-50 bg-white dark:bg-zinc-950 lg:left-20">
                        <div className="mx-auto w-full lg:w-1/2">
                            <GlobalSearch
                                mainPage={true}
                                search_history={searchHistory}
                                additional_filters={false}
                                filters={false}
                            />
                        </div>

                        <div className="relative h-[calc(100vh-60px)] overflow-y-auto pb-24 scrollbar-none">
                            <div className="flex min-h-full flex-col lg:flex-row">
                                <div className="w-full flex-shrink-0 p-2 lg:w-[45%] lg:p-4">
                                    {smartphone?.images?.length > 0 && (
                                        <div className="translate-y-3 transform transition-all duration-500 ease-in-out">
                                            <SmartphoneMediaViewer
                                                viewableSmartphone={smartphone}
                                                selectedMediaIndex={selectedMediaIndex}
                                                onSelectMediaIndex={setSelectedMediaIndex}
                                                mediaThumbRefs={mediaThumbRefs}
                                            />
                                        </div>
                                    )}
                                </div>

                                {smartphone && (
                                    <div className="w-full bg-transparent lg:w-1/2">
                                        {(!smartphone?.images?.length ||
                                            windowSize.width > 1024) && (
                                            <div className="mx-auto w-full space-y-4 p-4 md:px-10 lg:pl-6 lg:pr-10">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-lg font-medium dark:text-white/80">
                                                        <div>
                                                            {smartphone?.tag && (
                                                                <button
                                                                    onClick={() =>
                                                                        navigateToHashtag(
                                                                            smartphone?.tag,
                                                                        )
                                                                    }
                                                                >
                                                                    {smartphone?.tag}
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
                                                                className="absolute right-0 top-full z-50 mt-2 w-48 rounded-lg border border-gray-200 bg-white shadow-lg dark:border-zinc-800 dark:bg-deepcharcoal"
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
                                                                        <span>QR Code</span>
                                                                    </button>

                                                                    <button
                                                                        onClick={(e) => {
                                                                            const url =
                                                                                route('home') +
                                                                                '?m-slug=' +
                                                                                smartphone?.slug;
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
                                                                            className="h-5 w-5"
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
                                                    className="prose max-h-none min-h-[200px] max-w-[90vw] break-words text-[15px] text-gray-800 dark:prose-invert dark:text-white/80 sm:text-[16px] md:text-[17px] lg:max-w-none lg:text-[20px]"
                                                    dangerouslySetInnerHTML={{
                                                        __html: smartphone?.content,
                                                    }}
                                                />

                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-md text-gray-900 dark:text-white/80">
                                                            <strong>Payment :</strong>
                                                        </span>
                                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white">
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
                                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white">
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
                                                                    d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                                                                />
                                                            </svg>
                                                        </div>
                                                    </div>

                                                    <div className="text-md text-gray-900 dark:text-white/80">
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

                                                    <div className="text-md text-gray-900 dark:text-white/80">
                                                        <strong>Location :</strong> Korea
                                                    </div>

                                                    <div className="text-md text-gray-900 dark:text-white/80">
                                                        <strong>Return & Exchange Policy :</strong>
                                                        <button className="ml-1 font-bold text-black underline hover:text-gray-800 dark:text-gray-400">
                                                            See details
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="w-full max-w-[300px] space-y-4">
                                                    <div className="my-5 flex justify-start">
                                                        <StockBadge smartphone={smartphone} />
                                                    </div>

                                                    <div className="relative w-full">
                                                        <SelectInput
                                                            Name={'color'}
                                                            Id={'color'}
                                                            items={smartphone?.colors}
                                                            Value={selectedColor}
                                                            itemKey={'name'}
                                                            Placeholder={'Color'}
                                                            Action={(value) => {
                                                                setSelectedColor(value);
                                                            }}
                                                            customPlaceHolder={true}
                                                        />
                                                    </div>

                                                    <div className="flex w-full items-center justify-between">
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
                                                                className="flex h-8 w-8 items-center justify-center rounded-l border border-r-0 border-gray-300 bg-white text-gray-600 hover:bg-gray-50 focus:outline-none dark:border-gray-600 dark:bg-deepcharcoal dark:text-white/90 dark:hover:bg-zinc-900"
                                                            >
                                                                <svg
                                                                    className="h-3 w-3"
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
                                                                className="h-8 w-12 border-b border-t border-gray-300 bg-white px-2 text-center text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-deepcharcoal dark:text-white/90"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    setQuantity(quantity + 1)
                                                                }
                                                                className="flex h-8 w-8 items-center justify-center rounded-r border border-l-0 border-gray-300 bg-white text-gray-600 hover:bg-gray-50 focus:outline-none dark:border-gray-600 dark:bg-deepcharcoal dark:text-white/90 dark:hover:bg-zinc-900"
                                                            >
                                                                <svg
                                                                    className="h-3 w-3"
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

                        <div className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-7xl bg-black p-20 py-4 text-white">
                            <div className="flex items-center justify-between">
                                <div className="flex flex-col">
                                    <div className="text-xl font-bold lg:text-2xl">
                                        {smartphone?.selling_info?.total_price ? (
                                            currency.symbol + smartphone?.selling_info?.total_price
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
                                                className="h-4 w-4"
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
                                            className="rounded-lg bg-white px-4 py-3 text-sm text-black transition-colors hover:bg-gray-200 lg:px-6 lg:text-base"
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
                                                (item) => item.smartphone_id === smartphone.id,
                                            ) ? (
                                                <button
                                                    className={`flex ${cartProcessing ? 'w-[150px] lg:w-[150px]' : 'w-[150px] lg:w-[150px]'} items-center justify-center gap-2 rounded-lg border border-white px-4 py-3 text-sm text-white transition-colors hover:bg-white hover:text-black lg:px-6 lg:text-base`}
                                                    onClick={() => {
                                                        handleRemoveCartItem(
                                                            'smartphone',
                                                            smartphone.id,
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
                                                            smartphone.id,
                                                            quantity,
                                                            selectedColor,
                                                            smartphone.inventory_items_count,
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
                                                        smartphone.id,
                                                        quantity,
                                                        selectedColor,
                                                        smartphone.inventory_items_count,
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
                                            className={`px-4 py-3 text-sm ${!isInStock && 'pointer-events-none opacity-50'} rounded-lg bg-white text-black transition-colors hover:bg-gray-200 lg:px-6 lg:text-base`}
                                            onClick={() => {
                                                console.log('Buy now:', {
                                                    smartphone,
                                                    selectedColor,
                                                    quantity,
                                                });
                                            }}
                                        >
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

            {showQrCode &&
                createPortal(
                    <div className="fixed inset-0 z-[100] flex items-center justify-center">
                        <div
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
                            onClick={() => setShowQrCode(false)}
                        ></div>

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
                                <h2 id="qrCodeTitle" className="mb-3 text-base font-semibold">
                                    Scan QR Code
                                </h2>
                                <div className="flex justify-center">
                                    <QRCode
                                        className="size-48 sm:size-52 md:size-60"
                                        value={route('home') + '/?m-slug=' + smartphone?.slug}
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

            {linkCopied && (
                <LinkCopiedModal linkCopied={linkCopied} setLinkCopied={setLinkCopied} />
            )}
        </>
    );
};

export default SmartphoneDesktopModal;
