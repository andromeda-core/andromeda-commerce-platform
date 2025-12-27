import React, { useEffect, useMemo, useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import MainLayout from '@/Layouts/Website/MainLayout';
import Placeholder from 'asset/assets/images/product/placeholder.jpg';
import getContrastingColor from '@/Hooks/useColorContraster';
import Toast from '@/Components/Toast';
import axios from 'axios';
import Spinner from '@/Components/Spinner';
import useWindowSize from '@/Hooks/useWindowSize';
import Confetti from 'react-confetti';
import { createPortal } from 'react-dom';
import WebInput from '@/Components/WebSelectInput';
import PrimaryButton from '@/Components/PrimaryButton';
export default function index({ cart_items, refferalSessionData }) {
    const [quantities, setQuantities] = useState(
        cart_items.reduce((acc, item) => ({ ...acc, [item.id]: item.quantity }), {}),
    );
    const { currency } = usePage().props;
    const windowSize = useWindowSize();

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
            setInfoMessage('Item not found in cart');
            setShowInfoMessage(true);
            return;
        }

        const availableInventory = cartItem.smartphone.inventory_items_count;

        if (newQuantity > availableInventory) {
            setInfoMessage(
                `Only ${availableInventory} item${availableInventory === 1 ? '' : 's'} available. Please adjust your quantity`,
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

    const calculatedSummary = useMemo(() => {
        const subtotal = cart_items.reduce((total, item) => {
            const quantity = quantities[item.id] || item.quantity;
            const price = parseFloat(item.smartphone?.selling_info?.total_price || 0);
            return total + price * quantity;
        }, 0);

        // Calculate total
        const total = subtotal;

        return {
            subtotal: subtotal.toFixed(2),
            total: total.toFixed(2),
            itemCount: Object.values(quantities).reduce((sum, qty) => sum + qty, 0),
        };
    }, [cart_items, quantities]);

    return (
        <MainLayout>
            <Head title="Cart" />

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
                <div
                    className={`max-w-7xl mx-auto  pt-10  ${windowSize.width <= 1024 && 'mb-20'}`}
                >
                    {cart_items.length === 0 ? (
                        <EmptyCart />
                    ) : (
                        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
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
                                    />
                                ))}
                            </div>

                            {/* Order Summary - Right Side */}
                            <div className="lg:col-span-1">
                                <OrderSummary
                                    error={error}
                                    setError={setError}
                                    summary={calculatedSummary}
                                    onApplyReferal={applyReferal}
                                    applyingReferal={applyingReferalProcessing}
                                    closingReferalSection={closingReferalSection}
                                    referalData={referalData}
                                    onRemoveReferal={removeReferal}
                                    removingReferal={removingReferalProcessing}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
}

// Cart Item Component
function CartItem({ item, quantity, onUpdateQuantity, onRemove, currency, removing }) {

    return (
        <div className="p-4 transition-all border rounded-md border-surface-3-light bg-surface-1-light dark:border-surface-3-dark dark:bg-surface-1-dark sm:p-6">
            <div className="flex gap-4">
                {/* Product Image */}
                <div className="flex-shrink-0">
                    <div className="flex items-center justify-center w-32 h-32 overflow-hidden rounded-md">
                        <img
                            src={item?.smartphone?.smartphone_image_urls?.[0] || Placeholder}
                            alt={item?.smartphone?.model_name?.name || 'N/A'}
                            className="object-cover object-center max-w-full max-h-full"
                            loading="lazy"
                            onError={(e) => (e.target.src = Placeholder)}
                        />
                    </div>
                </div>
                {/* Product Details */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                            <h3 className="mb-1 text-base font-semibold text-main-text-light dark:text-main-text-dark sm:text-lg">
                                {item?.smartphone?.model_name?.name || 'N/A'}
                            </h3>
                            <p
                                dangerouslySetInnerHTML={{ __html: item?.smartphone?.content }}
                                className="mb-2 text-sm text-sub-text-light dark:text-sub-text-dark"
                            ></p>

                            {item?.smartphone?.capacity && (
                                <div className="flex flex-wrap gap-2 mb-3">
                                    <span
                                        className={`inline-flex items-center rounded-md bg-surface-2-light px-2.5 py-0.5 text-xs font-medium text-sub-text-light dark:bg-surface-3-dark dark:text-sub-text-dark`}
                                    >
                                        {'Capacity: ' + item?.smartphone?.capacity?.name || 'N/A'}
                                    </span>
                                </div>
                            )}

                            {/* Variants/Options */}
                            {item?.color && (
                                <div className="flex flex-wrap gap-2 mb-3">
                                    <span
                                        className={`inline-flex items-center rounded-md bg-surface-2-light px-2.5 py-0.5 text-xs font-medium text-sub-text-light dark:bg-surface-3-dark dark:text-sub-text-dark`}

                                    >
                                        {'Color: ' + item.color?.name || 'N/A'}
                                    </span>
                                </div>
                            )}

                            {/* Price */}
                            <div className="flex items-baseline gap-2">
                                <span className="text-lg font-semibold text-sub-text-light dark:text-sub-text-dark sm:text-xl">
                                    {currency?.symbol}
                                    {item.smartphone?.selling_info?.total_price ?? 'N/A'}
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
                            title="Remove item"
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
                    <div className="flex flex-wrap items-center gap-4 mt-4">
                        <div className="flex items-center overflow-hidden border rounded-md border-surface-3-light dark:border-surface-3-dark">
                            <button
                                onClick={() => onUpdateQuantity(item.id, quantity - 1)}
                                className="p-2 transition-colors hover:bg-surface-2-light disabled:opacity-50 text-sub-text-light dark:text-sub-text-dark dark:hover:bg-surface-3-dark"
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
                                onClick={() => onUpdateQuantity(item.id, quantity + 1)}
                                className="p-2 transition-colors text-sub-text-light dark:text-sub-text-dark hover:bg-surface-2-light dark:hover:bg-surface-3-dark"
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

                        {/* Item Total */}
                        <div className="ml-auto">
                            <span className="text-sm text-sub-text-light dark:text-sub-text-dark">
                                Total:{' '}
                            </span>
                            <span className="text-lg font-semibold text-sub-text-light dark:text-sub-text-dark">
                                $
                                {(item?.smartphone?.selling_info?.total_price * quantity).toFixed(
                                    2,
                                )}
                            </span>
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
                                    In Stock
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
                                    Only {item?.smartphone?.inventory_items_count} left in stock
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
                                    Out of Stock
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>
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
}) {
    const [referalCode, setReferalCode] = useState('');
    const [showReferal, setShowReferal] = useState(closingReferalSection ?? false);

    const handleApplyReferal = async () => {
        if (referalCode === '') {
            setError('Referal Code is Required');

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
            <div className="border rounded-md border-surface-3-light p-7 bg-surface-1-light dark:border-surface-3-dark dark:bg-surface-1-dark">
                <h2 className="flex items-center gap-2 mb-6 text-lg font-semibold text-main-text-light dark:text-main-text-dark">

                    Order Summary
                </h2>

                {/* Price Breakdown */}
                <div className="mb-6 space-y-4">
                    <div className="flex justify-between text-sm">
                        <span className="text-sub-text-light dark:text-sub-text-dark">Subtotal</span>
                        <span className="font-semibold text-sub-text-ight dark:text-sub-text-dark">
                            ${summary.subtotal || '0.00'}
                        </span>
                    </div>

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
                                <span className="mr-1">Referal Points</span>
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
                                Total
                            </span>
                            <span className="text-2xl font-bold text-sub-text-light dark:text-sub-text-dark">
                                ${summary.total || '0.00'}
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
                                Wana Earn Points? Add Referal Code
                            </button>
                        ) : (
                            <div className="space-y-2">
                                <div className="flex items-start gap-2">
                                    <div className="flex-1">

                                        <WebInput
                                            Value={referalCode}
                                            Action={(e) => setReferalCode(e.target.value)}
                                            Placeholder={"Enter Refferal Code"}
                                            Error={error}
                                        />



                                        <PrimaryButton
                                            Text={"Apply"}
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
                    className="block w-full rounded-md bg-main-text-light  px-6 py-3.5 text-center text-md font-semibold text-main-text-dark shadow-lg transition-all hover:bg-main-text-light/80 dark:bg-main-text-dark dark:text-main-text-light dark:hover:bg-main-text-dark/80"
                >
                    Proceed to Checkout
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
                    <span className="font-medium">Secure Checkout</span>
                </div>
            </div>

            {/* Accepted Payments */}
            <div className="p-4 border rounded-md border-surface-3-light bg-surface-1-light dark:border-surface-3-dark dark:bg-surface-1-dark">
                <p className="mb-3 text-xs text-center text-gray-500 dark:text-sub-text-dark">
                    We accept
                </p>
                <div className="flex items-center justify-center gap-4">
                    <div className="flex items-center justify-center w-8 h-8 text-xs font-bold text-white bg-orange-500 rounded-full">
                        <svg
                            className="size-10"
                            viewBox="0.004 0 64 64"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                        >
                            <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
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
            </div>
        </div>
    );
}

// Empty Cart Component
function EmptyCart() {
    return (
        <div className="flex min-h-[50vh] items-center justify-center px-6">
            <div className="text-center">
                <h3 className="text-[22px] font-semibold tracking-tight text-main-text-light dark:text-main-text-dark">
                    Your cart is empty
                </h3>

                <p className="max-w-md mt-2 mb-8 text-sm leading-relaxed text-sub-text-light dark:text-sub-text-dark">
                    Looks like you haven't added anything to your cart yet
                </p>

                <Link
                    href={route('home')}
                    className="inline-flex items-center justify-center rounded-md bg-main-text-light px-10 py-2.5 text-md font-semibold dark:text-main-text-light  text-main-text-dark transition-colors hover:bg-main-text-light/80 dark:bg-main-text-dark dark:text-main-text  dark:hover:bg-main-text-dark/80"
                >
                    Shop Now
                </Link>
            </div>
        </div>
    );
}
