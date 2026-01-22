import React, { useEffect, useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import MainLayout from '@/Layouts/Website/MainLayout';
import Placeholder from 'asset/assets/images/product/placeholder.jpg';
import Toast from '@/Components/Toast';
import axios from 'axios';
import Spinner from '@/Components/Spinner';
import useWindowSize from '@/Hooks/useWindowSize';
import Confetti from 'react-confetti';
import { createPortal } from 'react-dom';
import WebInput from '@/Components/WebInput';
import PrimaryButton from '@/Components/PrimaryButton';
import { useTranslation } from '@/Hooks/useTranslation';
import { BuildingLibraryIcon } from '@heroicons/react/24/solid';
export default function index({ cart_items, refferalSessionData, addon_items, total_summary }) {
    const [quantities, setQuantities] = useState(
        cart_items.reduce((acc, item) => ({ ...acc, [item.id]: item.quantity }), {}),
    );

    const [smartphoneAddonQuantities, setSmartphoneAddonQuantities] = useState(
        addon_items.reduce((acc, item) => ({ ...acc, [item.id]: item.quantity }), {}),
    );

    const { currency } = usePage().props;
    const windowSize = useWindowSize();

    // Translation Hook
    const { __ } = useTranslation();

    const [infoMessage, setInfoMessage] = useState(null);
    const [showInfoMessage, setShowInfoMessage] = useState(false);

    const [errorMessage, setErrorMessage] = useState(null);
    const [showErrorMessage, setShowErrorMessage] = useState(false);

    const [successMessage, setSuccessMessage] = useState(null);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);

    const [removingProcessing, setRemovingProcessing] = useState(false);
    const [applyingReferalProcessing, setApplyingReferalProcessing] = useState(false);
    const [closingReferalSection, setClosingReferalSection] = useState(false);
    const [removingReferalProcessing, setRemovingReferalProcessing] = useState(false);

    const [summary, setSummary] = useState(total_summary || []);

    // Its For Referal Code Errors
    const [error, setError] = useState(null);

    const [referalData, setReferalData] = useState({
        referal_code: refferalSessionData?.referal_code || '',
        total_points: refferalSessionData?.total_points ?? 0,
    });

    const [showConfetti, setShowConfetti] = useState(false);
    const [confettiFading, setConfettiFading] = useState(false);

    useEffect(() => {
        if (showConfetti) {
            const fadeTimer = setTimeout(() => {
                setConfettiFading(true);
            }, 3000);

            const hideTimer = setTimeout(() => {
                setShowConfetti(false);
                setConfettiFading(false);
            }, 4000);

            return () => {
                clearTimeout(fadeTimer);
                clearTimeout(hideTimer);
            };
        }
    }, [showConfetti]);

    const updateQuantity = (itemId, newQuantity) => {
        if (newQuantity < 1) return;

        const cartItem = cart_items.find((item) => item.id === itemId);

        if (!cartItem) {
            setInfoMessage(__('Item not found in cart'));
            setShowInfoMessage(true);
            return;
        }

        const availableInventory = cartItem.smartphone.inventory_items_count;

        if (newQuantity > availableInventory) {
            setInfoMessage(
                `${__('Only')} ${availableInventory} ${availableInventory === 1 ? __('Item') : __('Items')} ${__('available. Please adjust your quantity')}`,
            );
            setShowInfoMessage(true);
            return;
        }

        setQuantities((prev) => ({ ...prev, [itemId]: newQuantity }));

        axios
            .put(route('website.carts.update-item'), {
                item_id: itemId,
                type: cartItem.type,
                quantity: newQuantity,
            })
            .then((response) => {
                if (response.data.status === false) {
                    setErrorMessage(response.data.message);
                    setShowErrorMessage(true);
                } else {
                    setSummary(response.data.total_summary);
                }
            })
            .catch((error) => {
                setErrorMessage(error.message);
                setShowErrorMessage(true);
            });
    };

    const removeItem = (itemId, type) => {
        setRemovingProcessing(true);
        axios
            .delete(route('website.carts.remove-item'), {
                data: { item_id: itemId, type: type },
            })
            .then((response) => {
                if (response.data.status === false) {
                    setErrorMessage(response.data.message);
                    setShowErrorMessage(true);
                    return;
                }

                if (response.data.status === true) {
                    setSuccessMessage(response.data.message);
                    setShowSuccessMessage(true);
                    setSummary(response.data.total_summary);
                    router.reload(['cart_items']);
                }
            })
            .catch((error) => {
                setErrorMessage(error.message);
                setShowErrorMessage(true);
            })
            .finally(() => {
                setRemovingProcessing(false);
            });
    };

    const updateSmartphoneAddon = (itemId, newQuantity) => {
        if (newQuantity < 1) return;

        const cartItem = addon_items.find((item) => item.id === itemId);

        if (!cartItem) {
            setInfoMessage(__('Item not found in cart'));
            setShowInfoMessage(true);
            return;
        }

        setSmartphoneAddonQuantities((prev) => ({ ...prev, [itemId]: newQuantity }));
        axios
            .put(route('website.carts.update-smartphone-addon-item'), {
                item_id: itemId,
                quantity: newQuantity,
            })
            .then((response) => {
                if (response.data.status === false) {
                    setErrorMessage(response.data.message);
                    setShowErrorMessage(true);
                } else {
                    setSummary(response.data.total_summary);
                }
            })
            .catch((error) => {
                setErrorMessage(error.message);
                setShowErrorMessage(true);
            });
    };

    const removeSmartphoneAddon = (itemId, type) => {
        setRemovingProcessing(true);
        axios
            .delete(route('website.carts.remove-smartphone-addon-item'), {
                data: { item_id: itemId },
            })
            .then((response) => {
                if (response.data.status === false) {
                    setErrorMessage(response.data.message);
                    setShowErrorMessage(true);
                    return;
                }

                if (response.data.status === true) {
                    setSuccessMessage(response.data.message);
                    setShowSuccessMessage(true);
                    setSummary(response.data.total_summary);
                    router.reload(['addon_items']);
                }
            })
            .catch((error) => {
                setErrorMessage(error.message);
                setShowErrorMessage(true);
            })
            .finally(() => {
                setRemovingProcessing(false);
            });
    };
    const applyReferal = async (referalCode) => {
        setError(null);
        setApplyingReferalProcessing(true);
        const request_response = await axios
            .post(route('website.carts.referal-code'), { code: referalCode })
            .then((res) => {
                const response = res.data;

                if (response.status === false) {
                    setError(response.message);
                    return false;
                }

                setReferalData({
                    referal_code: response.referal_code,
                    total_points: response.total_points,
                });

                setShowConfetti(true);
                return true;
            })
            .catch((error) => {
                setErrorMessage(error.message);
                setShowErrorMessage(true);
            })
            .finally(() => {
                setApplyingReferalProcessing(false);
            });

        return request_response;
    };

    const removeReferal = async () => {
        setRemovingReferalProcessing(true);
        const request_response = axios
            .delete(route('website.carts.remove-referal'))
            .then((res) => {
                const data = res.data;

                if (data.status === false) {
                    setErrorMessage(data.message);
                    setShowErrorMessage(true);
                    return false;
                }

                setReferalData({
                    referal_code: '',
                    total_points: 0,
                });
                return true;
            })
            .catch((error) => {
                setErrorMessage(error.message);
                setShowErrorMessage(true);
            })
            .finally(() => {
                setRemovingReferalProcessing(false);
            });

        return request_response;
    };

    const calculateShippingCost = (shipping_fee, product, quantity) => {
        if (!shipping_fee) return 0;

        const { value_type, default_value } = shipping_fee;

        if (!default_value || default_value === 0) return 0;

        if (value_type === 'fixed') {
            return parseFloat(Number(default_value) * Number(quantity)).toFixed(2);
        }

        if (value_type === 'percentage') {
            const shippingCost = (product.selling_info?.total_price * default_value) / 100;
            return parseFloat(Number(shippingCost) * Number(quantity)).toFixed(2);
        }

        return __('Free');
    };

    const calculateImportCost = (import_tax, product) => {
        if (!import_tax) return 0;

        const { value_type, default_value } = import_tax;

        if (!default_value || default_value === 0) return 0;

        if (value_type === 'fixed') {
            return parseFloat(default_value).toFixed(2);
        }

        if (value_type === 'percentage') {
            const shippingCost = (product.selling_info?.total_price * default_value) / 100;
            return parseFloat(shippingCost).toFixed(2);
        }

        return noTaxMessage;
    };

    return (
        <MainLayout>
            <Head title={__("Cart", true)} />

            {(showInfoMessage || showErrorMessage || showSuccessMessage) && (
                <Toast
                    flash={{
                        ...(showInfoMessage
                            ? { info: infoMessage }
                            : showErrorMessage
                                ? { error: errorMessage }
                                : { success: successMessage }),
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

            {showConfetti &&
                createPortal(
                    <div
                        className={`pointer-events-none fixed inset-0 z-[99999] transition-opacity duration-1000 ${confettiFading ? 'opacity-0' : 'opacity-100'
                            }`}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            width: '100vw',
                            height: '100vh',
                            overflow: 'hidden',
                        }}
                    >
                        <Confetti
                            width={windowSize.width}
                            height={windowSize.height}
                            recycle={false}
                            numberOfPieces={1000}
                            gravity={1}
                        />
                    </div>,
                    document.body,
                )}

            <div className="min-h-screen transition-colors duration-200">
                {/* Main Content */}
                <div className={`mx-auto max-w-7xl pt-10 ${windowSize.width <= 1024 && 'mb-20'}`}>
                    {cart_items.length === 0 ? (
                        <EmptyCart __={__} />
                    ) : (
                        <div className="grid grid-cols-1 gap-8 mb-20 lg:grid-cols-3">


                            {/* Order Summary - TOP Side */}
                            {windowSize?.width <= 1024 && (
                                <div className="lg:col-span-1">
                                    <OrderSummary
                                        error={error}
                                        setError={setError}
                                        summary={summary}
                                        onApplyReferal={applyReferal}
                                        applyingReferal={applyingReferalProcessing}
                                        closingReferalSection={closingReferalSection}
                                        referalData={referalData}
                                        onRemoveReferal={removeReferal}
                                        removingReferal={removingReferalProcessing}
                                        currency={currency}
                                        __={__}
                                    />
                                </div>
                            )}

                            {/* Cart Items - Left Side */}
                            <div className="space-y-4 lg:col-span-2">
                                {cart_items.map((item) => (
                                    <CartItem
                                        key={item.id}
                                        item={item}
                                        quantity={quantities[item.id] || item.quantity}
                                        onUpdateQuantity={updateQuantity}
                                        onRemove={removeItem}
                                        currency={currency}
                                        removing={removingProcessing}
                                        addon_items={addon_items}
                                        __={__}
                                        smartphoneAddonQuantities={smartphoneAddonQuantities}
                                        onUpdateSmartphoneAddon={updateSmartphoneAddon}
                                        onRemoveSmartphoneAddon={removeSmartphoneAddon}
                                        calculateShippingCost={calculateShippingCost}
                                        calculateImportCost={calculateImportCost}
                                    />
                                ))}
                            </div>


                            {/* Order Summary - Right Side */}
                            {windowSize?.width > 1024 && (
                                <div className="lg:col-span-1">
                                    <OrderSummary
                                        error={error}
                                        setError={setError}
                                        summary={summary}
                                        onApplyReferal={applyReferal}
                                        applyingReferal={applyingReferalProcessing}
                                        closingReferalSection={closingReferalSection}
                                        referalData={referalData}
                                        onRemoveReferal={removeReferal}
                                        removingReferal={removingReferalProcessing}
                                        currency={currency}
                                        __={__}
                                    />
                                </div>
                            )}


                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
}

// Cart Item Component
function CartItem({
    item,
    quantity,
    onUpdateQuantity,
    onRemove,
    currency,
    removing,
    __,
    addon_items,
    smartphoneAddonQuantities,
    onUpdateSmartphoneAddon,
    onRemoveSmartphoneAddon,
    calculateShippingCost,
    calculateImportCost,
}) {
    const shipping_fee = calculateShippingCost(
        item?.smartphone?.selling_info?.shipping_fee,
        item?.smartphone,
        quantity,
    );
    const import_tax = calculateImportCost(
        item?.smartphone?.selling_info?.import_tax,
        item?.smartphone,
    );

    const relatedAddons = addon_items.filter((addon) => addon.smartphone_id === item.smartphone_id);

    const generateSmartphoneURL = (smartphone, isDirect = false, isSinglePage = false) => {
        return (
            `?m-slug=${smartphone?.slug}${isSinglePage ? '&single_page=true' : ''}${isDirect ? '&direct=true' : ''}`
        );
    }



    return (
        <div className="p-4 transition-all border rounded-md border-surface-3-light bg-surface-1-light dark:border-surface-3-dark dark:bg-surface-1-dark sm:p-6">
            <div className="flex gap-4">
                {/* Product Image */}
                {(item?.smartphone?.smartphone_image_urls.length > 0 || item?.smartphone?.smartphone_video_urls?.length > 0) && (
                    <div className="relative w-24 h-24 overflow-hidden transition-all border-2 rounded-md cursor-pointer border-trasparent bg-surface-1-light group/img aspect-square dark:bg-surface-1-dark dark:hover:border-surface-3-dark"

                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            router.get(route('home') + generateSmartphoneURL(item?.smartphone, true, true));
                        }}
                    >
                        <img
                            src={
                                item?.smartphone?.smartphone_image_urls?.[0] ||
                                item?.smartphone?.smartphone_video_urls[0]?.thumbnail_url ||
                                Placeholder
                            }
                            alt={item?.smartphone?.model_name?.name}
                            className="object-cover w-full h-full transition-transform duration-300 group-hover/img:scale-110"
                            loading="lazy"
                            onError={(e) => (e.target.src = Placeholder)}
                        />
                    </div>
                )}
                {/* Product Details */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                            <h3 className="mb-1 text-base font-semibold text-main-text-light dark:text-main-text-dark sm:text-lg">
                                {item?.smartphone?.model_name?.name || 'N/A'}
                            </h3>
                            <div
                                dangerouslySetInnerHTML={{ __html: item?.smartphone?.content }}
                                className="mb-2 whitespace-pre-wrap text-sm leading-relaxed text-sub-text-light [overflow-wrap:anywhere] dark:text-sub-text-dark"
                            />

                            {item?.smartphone?.capacity && (
                                <div className="flex flex-wrap gap-2 mb-3">
                                    <span
                                        className={`inline-flex items-center rounded-md bg-surface-2-light px-2.5 py-0.5 text-xs font-medium text-sub-text-light dark:bg-surface-3-dark dark:text-sub-text-dark`}
                                    >
                                        {__('Capacity') + ': ' + item?.smartphone?.capacity?.name ||
                                            'N/A'}
                                    </span>
                                </div>
                            )}

                            {/* Variants/Options */}
                            {item?.color && (
                                <div className="flex flex-wrap gap-2 mb-3">
                                    <span
                                        className={`inline-flex items-center rounded-md bg-surface-2-light px-2.5 py-0.5 text-xs font-medium text-sub-text-light dark:bg-surface-3-dark dark:text-sub-text-dark`}
                                    >
                                        {__('Color') + ': ' + item.color?.name || 'N/A'}
                                    </span>
                                </div>
                            )}

                            {/* Price */}
                            <div className="flex items-baseline gap-2">
                                <span className="text-lg font-semibold text-sub-text-light dark:text-sub-text-dark sm:text-xl">
                                    {currency?.symbol}
                                    {item.unit_price ?? 'N/A'}
                                </span>
                                {/* {item.originalPrice && (
                                    <span className="text-sm text-gray-500 line-through dark:text-white/50">
                                        ${item.originalPrice}
                                    </span>
                                )} */}
                            </div>
                        </div>

                        {/* Remove Button */}

                        <button
                            onClick={() => onRemove(item.smartphone_id, item.type)}
                            disabled={removing}
                            className={`p-2 text-gray-400 transition-colors hover:text-red-500 dark:text-white/40 dark:hover:text-red-400 ${removing ? 'cursor-not-allowed' : ''}`}
                            title={__('Remove item')}
                        >
                            {removing ? (
                                <Spinner />
                            ) : (
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
                                        d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                                    />
                                </svg>
                            )}
                        </button>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex flex-wrap items-center justify-between gap-4 mt-4">
                        <div className="flex items-center overflow-hidden border rounded-md border-surface-3-light dark:border-surface-3-dark">
                            <button
                                onClick={() => onUpdateQuantity(item.id, quantity - 1)}
                                className="p-2 transition-colors text-sub-text-light hover:bg-surface-2-light disabled:opacity-50 dark:text-sub-text-dark dark:hover:bg-surface-3-dark"
                                disabled={quantity <= 1}
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
                                        d="M19.5 12h-15"
                                    />
                                </svg>
                            </button>
                            <span className="min-w-[3rem] px-4 py-2 text-center text-sm font-semibold text-sub-text-light dark:text-sub-text-dark">
                                {quantity}
                            </span>
                            <button
                                disabled={item?.smartphone?.inventory_items_count <= quantity}
                                onClick={() => onUpdateQuantity(item.id, quantity + 1)}
                                className="p-2 transition-colors text-sub-text-light hover:bg-surface-2-light dark:text-sub-text-dark dark:hover:bg-surface-3-dark"
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
                                        d="M12 4.5v15m7.5-7.5h-15"
                                    />
                                </svg>
                            </button>
                        </div>

                        <div>
                            {/* Shipping Cost */}
                            {shipping_fee > 0 && (
                                <div className="ml-auto">
                                    <span className="text-sm text-sub-text-light dark:text-sub-text-dark">
                                        {__('Shipping Fee')}:{' '}
                                    </span>
                                    <span className="text-lg font-semibold text-sub-text-light dark:text-sub-text-dark">
                                        {currency?.symbol}
                                        {shipping_fee}
                                    </span>
                                </div>
                            )}

                            {/* Import Cost */}
                            {import_tax > 0 && (
                                <div className="ml-auto">
                                    <span className="text-sm text-sub-text-light dark:text-sub-text-dark">
                                        {__('Import Tax')}:{' '}
                                    </span>
                                    <span className="text-lg font-semibold text-sub-text-light dark:text-sub-text-dark">
                                        {currency?.symbol}
                                        {import_tax}
                                    </span>
                                </div>
                            )}

                            {/* Item Total */}
                            <div className="ml-auto">
                                <span className="text-sm text-sub-text-light dark:text-sub-text-dark">
                                    {__('Product Total')}:{' '}
                                </span>
                                <span className="text-lg font-semibold text-sub-text-light dark:text-sub-text-dark">
                                    {__(currency?.symbol)}
                                    {(
                                        item?.unit_price * quantity +
                                        (Number(import_tax) + Number(shipping_fee))
                                    ).toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Stock Status */}
                    {item?.smartphone?.inventory_items_count !== undefined && (
                        <div className="mt-3">
                            {item.stock > 10 ? (
                                <span className="flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                        className="w-4 h-4"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    {__('In Stock')}
                                </span>
                            ) : item?.smartphone?.inventory_items_count > 0 ? (
                                <span className="flex items-center gap-1 text-xs font-medium text-orange-600 dark:text-orange-400">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                        className="w-4 h-4"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    {__('Only')} {item?.smartphone?.inventory_items_count}{' '}
                                    {__('left in stock')}
                                </span>
                            ) : (
                                <span className="flex items-center gap-1 text-xs font-medium text-red-600 dark:text-red-400">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                        className="w-4 h-4"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    {__('Out of Stock')}
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Add-ons Section */}
            {relatedAddons.length > 0 && (
                <div className="pt-4 mt-4 border-t border-dashed border-surface-3-light dark:border-surface-3-dark">
                    <h4 className="mb-3 text-sm font-semibold text-main-text-light dark:text-main-text-dark">
                        {__('Add-ons')}
                    </h4>

                    <div className="space-y-3">
                        {relatedAddons.map((addon_item) => (
                            <AddonItem
                                key={addon_item.id}
                                item={addon_item}
                                quantity={
                                    smartphoneAddonQuantities[addon_item.id] ?? addon_item.quantity
                                }
                                onUpdateQuantity={onUpdateSmartphoneAddon}
                                onRemove={onRemoveSmartphoneAddon}
                                currency={currency}
                                removing={removing}
                                __={__}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Summary */}
            <div className="flex items-center justify-between px-2 pt-2 mt-5 border-t border-dashed border-surface-3-light dark:border-surface-3-dark">
                <span className="text-sm font-semibold text-main-text-light dark:text-main-text-dark">
                    {__('Total')}:
                </span>

                <span className="text-base font-semibold text-main-text-light dark:text-main-text-dark">
                    {currency?.symbol}
                    {item?.unit_price * quantity +
                        (Number(import_tax) + Number(shipping_fee)) +
                        Number(
                            relatedAddons?.reduce(
                                (total, addon) => total + Number(addon.total_price),
                                0,
                            ),
                        )}
                </span>
            </div>
        </div>
    );
}

// Addon Item
function AddonItem({ item, quantity, onUpdateQuantity, onRemove, currency, removing, __ }) {
    return (
        <div className="flex items-center justify-between gap-4 px-3 py-2 border rounded-md border-surface-3-light bg-surface-2-light dark:border-surface-3-dark dark:bg-surface-2-dark">
            {/* Addon Name */}
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-main-text-light dark:text-main-text-dark">
                    {item?.name || 'N/A'}
                </p>
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-2">
                <button
                    onClick={() => onUpdateQuantity(item.id, quantity - 1)}
                    disabled={quantity <= 1}
                    className="px-2 py-1 text-xs border rounded border-surface-3-light text-main-text-light disabled:opacity-50 dark:border-surface-3-dark dark:text-main-text-dark"
                >
                    −
                </button>

                <span className="min-w-[1.5rem] text-center text-xs font-semibold text-main-text-light dark:text-main-text-dark">
                    {quantity}
                </span>

                <button
                    onClick={() => onUpdateQuantity(item.id, quantity + 1)}
                    className="px-2 py-1 text-xs border rounded border-surface-3-light text-main-text-light dark:border-surface-3-dark dark:text-main-text-dark"
                >
                    +
                </button>
            </div>

            {/* Total Price */}
            <div className="min-w-[4rem] text-right text-sm font-semibold text-main-text-light dark:text-main-text-dark">
                {currency?.symbol}
                {Number(item?.unit_price * quantity).toFixed(2)}
            </div>

            {/* Remove */}
            <button
                onClick={() => onRemove(item.id, item.type)}
                disabled={removing}
                className="text-sub-text-light hover:text-red-500 disabled:opacity-50"
                title={__('Remove addon')}
            >
                {removing ? <Spinner size="sm" /> : '×'}
            </button>
        </div>
    );
}

// Order Summary Component
function OrderSummary({
    summary,
    onApplyReferal,
    applyingReferal,
    closingReferalSection,
    error,
    setError,
    referalData,
    onRemoveReferal,
    removingReferal,
    currency,
    __,
}) {

    const [referalCode, setReferalCode] = useState('');
    const [showReferal, setShowReferal] = useState(closingReferalSection ?? false);

    const handleApplyReferal = async () => {
        if (referalCode === '') {
            setError(__('Referal Code is Required'));

            setTimeout(() => {
                setError(null);
            }, 2000);
            return;
        }

        if (referalCode.trim()) {
            const response = await onApplyReferal(referalCode);

            if (response) {
                setShowReferal(false);
                setReferalCode('');
            }
        }
    };

    const handleRemoveReferal = async () => {
        const response = await onRemoveReferal();

        if (response) {
            setShowReferal(false);
        }
    };

    return (
        <div className="sticky space-y-3 top-8">
            {/* Summary Card */}
            <div className="border rounded-md border-surface-3-light bg-surface-1-light p-7 dark:border-surface-3-dark dark:bg-surface-1-dark">
                <h2 className="flex items-center gap-2 mb-6 text-lg font-semibold text-main-text-light dark:text-main-text-dark">
                    {__('Order Summary')}
                </h2>

                {/* Price Breakdown */}
                <div className="mb-6 space-y-4">
                    <div className="flex justify-between text-sm">
                        <span className="text-sub-text-light dark:text-sub-text-dark">
                            {__('Product SubTotal')}
                        </span>
                        <span className="font-semibold text-sub-text-ight dark:text-sub-text-dark">
                            {currency?.symbol}
                            {parseFloat(Number(summary.cart_subtotal)).toFixed(2) || '0.00'}
                        </span>
                    </div>

                    {summary.addons_subtotal > 0 && (
                        <div className="flex justify-between text-sm">
                            <span className="text-sub-text-light dark:text-sub-text-dark">
                                {__('Addons SubTotal')}
                            </span>
                            <span className="font-semibold text-sub-text-ight dark:text-sub-text-dark">
                                {currency?.symbol}
                                {parseFloat(Number(summary.addons_subtotal)).toFixed(2) || '0.00'}
                            </span>
                        </div>
                    )}

                    {summary?.shipping_fee > 0 && (
                        <div className="flex justify-between text-sm">
                            <span className="text-sub-text-light dark:text-sub-text-dark">
                                {__('Shipping Fee')}
                            </span>
                            <span className="font-semibold text-sub-text-ight dark:text-sub-text-dark">
                                {currency?.symbol}
                                {parseFloat(Number(summary.shipping_fee)).toFixed(2) || '0.00'}
                            </span>
                        </div>
                    )}

                    {summary?.import_tax > 0 && (
                        <div className="flex justify-between text-sm">
                            <span className="text-sub-text-light dark:text-sub-text-dark">
                                {__('Import Tax')}
                            </span>
                            <span className="font-semibold text-sub-text-ight dark:text-sub-text-dark">
                                {currency?.symbol}
                                {parseFloat(Number(summary.import_tax)).toFixed(2) || '0.00'}
                            </span>
                        </div>
                    )}

                    {referalData.total_points > 0 && (
                        <div className="flex justify-between text-sm">
                            <span className="flex items-center gap-1 text-sub-text-light dark:text-sub-text-dark">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="size-4"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"
                                    />
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M6 6h.008v.008H6V6z"
                                    />
                                </svg>
                                <span className="mr-1">{__('Referal Points')}</span>
                                <span className="mr-1">({referalData?.referal_code})</span>
                                {!removingReferal ? (
                                    <button
                                        onClick={() => handleRemoveReferal()}
                                        className="hover:text-red-400"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={1.5}
                                            stroke="currentColor"
                                            className="size-4"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M6 18 18 6M6 6l12 12"
                                            />
                                        </svg>
                                    </button>
                                ) : (
                                    <Spinner customSize={'size-3'} />
                                )}
                            </span>
                            <span className="font-semibold text-green-600 dark:text-green-400">
                                {referalData.total_points ?? '0'}
                            </span>
                        </div>
                    )}

                    <div className="pt-4 border-t border-surface-3-light dark:border-surface-3-dark">
                        <div className="flex items-center justify-between">
                            <span className="text-base font-semibold text-sub-text-light dark:text-sub-text-dark">
                                {__('Total')}
                            </span>
                            <span className="text-2xl font-bold text-sub-text-light dark:text-sub-text-dark">
                                {currency?.symbol}
                                {parseFloat(Number(summary.total)).toFixed(2) || '0.00'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Referal Code */}
                {!referalData.referal_code && (
                    <div className="mb-6">
                        {!showReferal ? (
                            <button
                                onClick={() => setShowReferal(true)}
                                className="flex items-center justify-center w-full gap-2 text-sm font-medium transition-colors text-main-text-light hover:text-sub-text-light dark:text-main-text-dark dark:hover:text-sub-text-dark"
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
                                        d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"
                                    />
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M6 6h.008v.008H6V6z"
                                    />
                                </svg>
                                {__('Wana Earn Points? Add Referal Code')}
                            </button>
                        ) : (
                            <div className="space-y-2">
                                <div className="flex items-start gap-2">
                                    <div className="flex-1">
                                        <WebInput
                                            Value={referalCode}
                                            Action={(e) => setReferalCode(e.target.value)}
                                            Placeholder={__('Enter Refferal Code')}
                                            Error={error}
                                        />

                                        <PrimaryButton
                                            Text={__('Apply')}
                                            Spinner={applyingReferal}
                                            Action={handleApplyReferal}
                                            Type={'button'}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Checkout Button */}
                <Link
                    href={route('website.checkout.index')}
                    className="text-md block w-full rounded-md bg-main-text-light px-6 py-3.5 text-center font-semibold text-main-text-dark shadow-lg transition-all hover:bg-main-text-light/80 dark:bg-main-text-dark dark:text-main-text-light dark:hover:bg-main-text-dark/80"
                >
                    {__('Proceed To Checkout')}
                </Link>
            </div>

            {/* Secure Checkout Badge */}
            <div className="p-4 border rounded-md border-surface-3-light bg-surface-1-light dark:border-surface-3-dark dark:bg-surface-1-dark">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-sub-text-dark">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5 text-green-500"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                        />
                    </svg>
                    <span className="font-medium">{__('Secure Checkout')}</span>
                </div>
            </div>

            {/* Accepted Payments */}
            <div className="p-4 border rounded-md border-surface-3-light bg-surface-1-light dark:border-surface-3-dark dark:bg-surface-1-dark">
                <p className="mb-3 text-xs text-center text-gray-500 dark:text-sub-text-dark">
                    {__('We accept')}
                </p>
                <div className="flex items-center justify-center gap-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-surface-2-light dark:bg-surface-3-dark">
                        <svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 fill-main-text-light dark:fill-main-text-dark">
                            <path d="M128 0C57.3 0 0 57.3 0 128s57.3 128 128 128 128-57.3 128-128S198.7 0 128 0zm62 91h-46v24.3c37.6 1.9 66 10 66 19.7 0 9.7-28.4 17.8-66 19.7V201h-32v-46.3c-37.6-1.9-66-10-66-19.7 0-9.7 28.4-17.8 66-19.7V91H66V63h124v28zm-78 35.2v25.2c-33.6-1.6-58-6.6-58-12.6 0-6 24.4-11 58-12.6zm32 25.2v-25.2c33.6 1.6 58 6.6 58 12.6 0 6-24.4 11-58 12.6z"
                            />
                        </svg>
                    </div>
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-surface-2-light dark:bg-surface-3-dark">
                        <BuildingLibraryIcon className="w-6 h-6 fill-main-text-light dark:fill-main-text-dark" />
                    </div>

                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-surface-2-light dark:bg-surface-3-dark">
                        <svg className="w-6 h-6 fill-main-text-light dark:fill-main-text-dark" viewBox="0 0 24 24">
                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27z" />
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Empty Cart Component
function EmptyCart({ __ }) {
    return (
        <div className="flex min-h-[50vh] items-center justify-center px-6">
            <div className="text-center">
                <h3 className="text-[22px] font-semibold tracking-tight text-main-text-light dark:text-main-text-dark">
                    {__('Your cart is empty')}
                </h3>

                <p className="max-w-md mt-2 mb-8 text-sm leading-relaxed text-sub-text-light dark:text-sub-text-dark">
                    {__("Looks like you haven't added anything to your cart yet")}
                </p>

                <Link
                    href={route('home')}
                    className="text-md dark:text-main-text inline-flex items-center justify-center rounded-md bg-main-text-light px-10 py-2.5 font-semibold text-main-text-dark transition-colors hover:bg-main-text-light/80 dark:bg-main-text-dark dark:text-main-text-light dark:hover:bg-main-text-dark/80"
                >
                    {__('Shop Now')}
                </Link>
            </div>
        </div>
    );
}
