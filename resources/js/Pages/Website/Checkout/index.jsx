import React, { useState, useEffect } from 'react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import MainLayout from '@/Layouts/Website/MainLayout';
import Placeholder from 'asset/assets/images/product/placeholder.jpg';
import Toast from '@/Components/Toast';
import axios from 'axios';
import Spinner from '@/Components/Spinner';
import useWindowSize from '@/Hooks/useWindowSize';
import { useTranslation } from '@/Hooks/useTranslation';
import { Bitcoin, ChevronLeft, Landmark, Pencil, Star, Trash2, X } from 'lucide-react';
import SocialMediaHelpIcon from '@/Components/SocialMediaHelpIcon';
import PrimaryButton from '@/Components/PrimaryButton';
import WebInput from '@/Components/WebInput';
import WebSelectInput from '@/Components/WebSelectInput';
import { createPortal } from 'react-dom';
import WebTextArea from '@/Components/WebTextArea';

export default function Checkout({
    cart_items,
    refferalSessionData,
    shipping_address,
    addon_items,
    total_summary,
    meta_usernames,
    buy_now,
    is_eligible_for_social_message,
    countries,
    shipping_addresses,
}) {
    const { currency, auth } = usePage().props;
    const windowSize = useWindowSize();


    const getItemKey = (item) => {
        return buy_now ? item.temp_id : item.id
    }

    // Translation Hook
    const { __ } = useTranslation();

    const [infoMessage, setInfoMessage] = useState(null);
    const [showInfoMessage, setShowInfoMessage] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    const [showErrorMessage, setShowErrorMessage] = useState(false);
    const [successMessage, setSuccessMessage] = useState(null);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);

    const [processingOrder, setProcessingOrder] = useState(false);
    const [applyingReferalProcessing, setApplyingReferalProcessing] = useState(false);
    const [removingReferalProcessing, setRemovingReferalProcessing] = useState(false);

    const [error, setError] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
    const [secondaryPaymentMethod, setSecondaryPaymentMethod] = useState('');
    const [showReferalInput, setShowReferalInput] = useState(false);

    const [referalData, setReferalData] = useState({
        referal_code: refferalSessionData?.referal_code || '',
        total_points: refferalSessionData?.total_points ?? 0,
    });

    const [referalCode, setReferalCode] = useState('');

    const [shippingInfo, setShippingInfo] = useState({
        name: shipping_address?.name || '',
        phone: shipping_address?.phone || '',
        address_line1: shipping_address?.address_line1 || '',
        address_line2: shipping_address?.address_line2 || '',
        city: shipping_address?.city || '',
        state: shipping_address?.state || '',
        postal_code: shipping_address?.postal_code || '',
        country_id: shipping_address?.country_id || '',
    });

    const [summary, setSummary] = useState(total_summary || []);
    const [removingProcessing, setRemovingProcessing] = useState(false);

    const [quantities, setQuantities] = useState(
        cart_items.reduce((acc, item) => ({ ...acc, [getItemKey(item)]: item.quantity }), {}),
    );

    const [smartphoneAddonQuantities, setSmartphoneAddonQuantities] = useState(
        addon_items.reduce((acc, item) => ({ ...acc, [getItemKey(item)]: item.quantity }), {}),
    );
    const [pointsToUse, setPointsToUse] = useState('');
    const [pointsError, setPointsError] = useState('');

    const [shippingAddressModal, setShippingAddressModal] = useState(false);
    const [secondaryPaymentOptionModal, setSecondaryPaymentOptionModal] = useState(false);

    const handleUseAllPoints = () => {
        if (paymentMethod === 'points') {
            setErrorMessage(
                __('Points payment is already selected. Manual point usage is not available.'),
            );
            setShowErrorMessage(true);
            return;
        }

        if (parseFloat(auth?.user?.points) === 0) {
            setErrorMessage(__('You have no points to use'));
            setShowErrorMessage(true);
            return;
        }

        const total = parseFloat(total_summary.total);
        const points = parseFloat(auth?.user?.points);

        if (total > points && points < total) {
            setPointsToUse(points);
            setPointsError('');
            return;
        }



        setPointsToUse(total);
        setPointsError('');
    };

    const handlePointsChange = (value) => {
        if (paymentMethod === 'points') {
            setErrorMessage(
                __('Points payment is already selected. Manual point usage is not available.'),
            );
            setShowErrorMessage(true);
            return;
        }


        if (parseFloat(auth?.user?.points) === 0) {
            setErrorMessage(__('You have no points to use'));
            setShowErrorMessage(true);
            return;
        }
        const numValue = parseInt(value);


        if (numValue > parseFloat(auth?.user?.points)) {
            setPointsError(`${__('You can only use up to')} ${auth?.user?.points} ${__('points')}`);
        } else if (numValue > parseFloat(total_summary.total)) {
            setPointsError(`${__('You can only use up to')} ${total_summary.total} ${__('points')}`);
        } else {
            setPointsError('');
        }

        setPointsToUse(value);
    };

    const applyReferal = async (referalCode, buy_now) => {
        setError(null);
        setApplyingReferalProcessing(true);

        const payload = {
            code: referalCode,
        };

        if (buy_now) {
            payload.buy_now = true;
        }

        const request_response = await axios
            .post(route('website.carts.referal-code'), { ...payload })
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

    const handleApplyReferal = async () => {
        if (referalCode === '') {
            setError(__('Referal Code is Required'));
            setTimeout(() => {
                setError(null);
            }, 2000);
            return;
        }

        if (referalCode.trim()) {
            const response = await applyReferal(referalCode, buy_now);
            if (response) {
                setShowReferalInput(false);
                setReferalCode('');
            }
        }
    };

    const handleRemoveReferal = async () => {
        const response = await removeReferal();
        if (response) {
            setShowReferalInput(false);
        }
    };



    const handlePlaceOrder = async () => {



        if (pointsError !== '') {
            setErrorMessage(__('Please Adjust Your Points Before Placing An Order'));
            setShowErrorMessage(true);
            return;
        }

        if (paymentMethod === 'points' && parseFloat(auth?.user?.points) === 0) {
            router.reload({
                only: ['auth'],
                preserveScroll: true,
                preserveState: true,
                preserveUrl: true
            });
        }

        if (paymentMethod === 'points' && parseFloat(auth?.user?.points) > 0 && parseFloat(auth?.user?.points) < parseFloat(total_summary.total) && !secondaryPaymentOptionModal) {
            setSecondaryPaymentOptionModal(true);
            return;
        }


        // Validate shipping info
        const requiredFields = [
            'name',
            'phone',
            'address_line1',
            'city',
            'country_id',
            'state',
            'postal_code',
        ];
        const emptyFields = requiredFields.filter((field) => !shippingInfo[field]);

        if (emptyFields.length > 0) {
            setInfoMessage(__('Please Complete Your Profile Before Placing An Order'));
            setShowInfoMessage(true);
            return;
        }

        // router.post(route('website.checkout.store'), {
        //     shipping_info: shippingInfo,
        //     payment_method: paymentMethod,
        //     referal_code: referalData.referal_code,
        // });
        setProcessingOrder(true);

        const payload = {
            shipping_info: shippingInfo,
            payment_method: paymentMethod,
            referal_code: referalData.referal_code,
            points_to_use: pointsToUse,
            secondary_payment_method: secondaryPaymentMethod,
        };

        if (buy_now) {
            payload.buy_now = true;
        }

        if (pointsToUse) {
            payload.points_to_use = pointsToUse;
        }

        // Your order processing logic here
        await axios
            .post(route('website.checkout.store'), {
                ...payload,
            })
            .then((res) => {
                const response = res.data;
                if (response.status === true) {
                    setSuccessMessage(response.message);
                    setShowSuccessMessage(true);

                    setTimeout(() => {
                        window.location.href = response.redirect_uri;
                    }, 2000);
                } else {
                    setErrorMessage(response.message);
                    setShowErrorMessage(true);
                }
            })
            .catch((error) => {
                setErrorMessage(error.response.data.message || error.message);
                setShowErrorMessage(true);
            })
            .finally(() => {
                setProcessingOrder(false);
            });
    };

    const getTotalQtyOfSmartphone = (smartphoneId) => {
        return cart_items
            .filter((i) => i.smartphone_id === smartphoneId)
            .reduce((sum, i) => sum + (quantities[getItemKey(i)] ?? i.quantity), 0);
    };

    const updateQuantity = (itemId, newQuantity, temp_id) => {
        if (newQuantity < 1) return;

        const cartItem = cart_items.find((item) => temp_id ? item.temp_id === temp_id : item.id === itemId);

        if (!cartItem) {
            setInfoMessage(__('Item not found in cart'));
            setShowInfoMessage(true);
            return;
        }

        const totalUsedQty = getTotalQtyOfSmartphone(cartItem.smartphone_id);
        const otherItemsQty = totalUsedQty - (quantities[getItemKey(cartItem)] ?? cartItem.quantity);
        const maxAllowed = cartItem.smartphone.inventory_items_count - otherItemsQty;

        if (newQuantity > maxAllowed) {
            setInfoMessage(__('Adding more quantity exceeds available stock for this product'));
            setShowInfoMessage(true);
            return;
        }

        setQuantities((prev) => ({ ...prev, [getItemKey(cartItem)]: newQuantity }));

        axios
            .put(route('website.carts.update-item'), {
                item_id: itemId,
                type: cartItem.type,
                temp_id: temp_id,
                quantity: newQuantity,
                page: buy_now ? 'buy_now' : 'cart',
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

    const onProductRemove = (itemId, type, temp_id) => {

        setRemovingProcessing(true);
        axios
            .delete(route('website.carts.remove-item'), {
                data: { item_id: itemId, type: type, page: buy_now ? 'buy_now' : 'cart', temp_id: temp_id },
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

    const updateSmartphoneAddon = (itemId, newQuantity, temp_id) => {
        if (newQuantity < 1) return;

        let cartItem = null;
        if (buy_now) {
            cartItem = addon_items.find((item) => item.temp_id === temp_id);
        } else {
            cartItem = addon_items.find((item) => item.id === itemId);
        }

        if (!cartItem) {
            setInfoMessage(__('Item not found in cart'));
            setShowInfoMessage(true);
            return;
        }

        setSmartphoneAddonQuantities((prev) => ({ ...prev, [getItemKey(cartItem)]: newQuantity }));
        axios
            .put(route('website.carts.update-smartphone-addon-item'), {
                item_id: itemId,
                quantity: newQuantity,
                page: buy_now ? 'buy_now' : 'cart',
                temp_id: temp_id
            })
            .then((response) => {
                if (response.data.status === false) {
                    setErrorMessage(response.data.message);
                    setShowErrorMessage(true);
                } else {
                    setSummary(response.data.total_summary);
                    router.reload(['addon_items']);
                }
            })
            .catch((error) => {
                setErrorMessage(error.message);
                setShowErrorMessage(true);
            });
    };

    const removeSmartphoneAddon = (itemId, temp_id) => {
        setRemovingProcessing(true);
        axios
            .delete(route('website.carts.remove-smartphone-addon-item'), {
                data: { item_id: itemId, page: buy_now ? 'buy_now' : 'cart', temp_id: temp_id },
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

    // Watching When payment method changes

    useEffect(() => {
        if (paymentMethod === 'points') {
            setPointsToUse('');
        }
    }, [paymentMethod]);

    const socialLinks = {
        facebook: `https://m.me/${meta_usernames?.fb_page_username}?ref=user_id=${auth?.user?.id}`,
        instagram: `https://ig.me/m/${meta_usernames?.ig_username}?ref=user_id=${auth?.user?.id}`,
    };

    return (
        <MainLayout>
            <Head title={__('Checkout', true)} />

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

            <div className="min-h-screen transition-colors duration-200">
                <div
                    className={`max-w-8xl lg:my-7 mx-auto px-6 lg:px-8 ${windowSize.width <= 1024 && 'mb-20'}`}
                >
                    {/* Header */}
                    <div className="my-2">
                        <Link
                            href={route('website.carts.index')}
                            className="inline-flex items-center gap-2 mb-2 text-sm font-medium transition-colors lg:hidden text-main-text-light lg:hover:text-main-text-light/80 dark:text-main-text-dark dark:lg:hover:text-main-text-dark/80"
                        >
                            <ChevronLeft />
                        </Link>
                        <h1 className="text-[24px] font-semibold text-main-text-light dark:text-main-text-dark">
                            {__('Order Form')}
                        </h1>
                    </div>

                    <div className="grid grid-cols-1 gap-8 mb-20 lg:grid-cols-3">
                        {/* Left Section: Shipping & Payment */}
                        <div className="space-y-6 lg:col-span-2">
                            {/* Shipping Information */}
                            <ShippingInfoCard
                                shippingInfo={shippingInfo}
                                countries={countries}
                                shipping_addresses={shipping_addresses}
                                windowSize={windowSize}
                                shippingAddressModal={shippingAddressModal}
                                setShippingAddressModal={setShippingAddressModal}
                                setInfoMessage={setInfoMessage}
                                setShowInfoMessage={setShowInfoMessage}
                                setErrorMessage={setErrorMessage}
                                setShowErrorMessage={setShowErrorMessage}
                                setShippingInfo={setShippingInfo}
                                user={auth?.user}
                                __={__}
                            />

                            {/* Payment Method */}
                            <PaymentMethod
                                paymentMethod={paymentMethod}
                                setPaymentMethod={setPaymentMethod}
                                points={auth.user?.points}
                                __={__}
                            />

                            {/* Use Points */}
                            <UsePoints
                                points={auth.user?.points}
                                pointsToUse={pointsToUse}
                                setPointsToUse={handlePointsChange}
                                onUseAllPoints={handleUseAllPoints}
                                error={pointsError}
                                __={__}
                            />

                            {/* Order Items */}
                            <Items
                                cart_items={cart_items}
                                quantities={quantities}
                                onUpdateQuantity={updateQuantity}
                                onProductRemove={onProductRemove}
                                currency={currency}
                                removing={removingProcessing}
                                __={__}
                                smartphoneAddonQuantities={smartphoneAddonQuantities}
                                onUpdateSmartphoneAddon={updateSmartphoneAddon}
                                onRemoveSmartphoneAddon={removeSmartphoneAddon}
                                getTotalQtyOfSmartphone={getTotalQtyOfSmartphone}
                                buy_now={buy_now}
                                getItemKey={getItemKey}
                            />
                        </div>

                        {/* Right Section: Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="sticky space-y-4 top-8">
                                {/* Order Summary Card */}
                                <OrderSummaryCard
                                    summary={summary}
                                    currency={currency}
                                    referalData={referalData}
                                    showReferalInput={showReferalInput}
                                    setShowReferalInput={setShowReferalInput}
                                    referalCode={referalCode}
                                    setReferalCode={setReferalCode}
                                    error={error}
                                    handleApplyReferal={handleApplyReferal}
                                    applyingReferalProcessing={applyingReferalProcessing}
                                    handleRemoveReferal={handleRemoveReferal}
                                    removingReferalProcessing={removingReferalProcessing}
                                    handlePlaceOrder={handlePlaceOrder}
                                    processingOrder={processingOrder}
                                    __={__}
                                />

                                {is_eligible_for_social_message && (
                                    <SocialMediaHelpIcon
                                        __={__}
                                        socialLinks={socialLinks}
                                        width={windowSize.width}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {secondaryPaymentOptionModal && (
                    <SecondaryPaymentModal
                        isOpen={secondaryPaymentOptionModal}
                        onClose={() => {
                            setSecondaryPaymentOptionModal(false);
                            setSecondaryPaymentMethod("");
                        }}
                        availablePoints={parseFloat(auth?.user?.points)}
                        totalAmount={summary.total}
                        remainingAmount={parseFloat(summary.total) - parseFloat(auth?.user?.points)}
                        onSelectPayment={setSecondaryPaymentMethod}
                        currency={currency}
                        handlePlace={handlePlaceOrder}
                        selectedPayment={secondaryPaymentMethod}
                        windowSize={windowSize}
                        processingOrder={processingOrder}
                        __={__}

                    />
                )}
            </div>
        </MainLayout>
    );
}

// Shipping Form Component
function ShippingInfoCard({
    shippingInfo,
    countries,
    shipping_addresses,
    shippingAddressModal,
    setShippingAddressModal,
    setInfoMessage,
    setShowInfoMessage,
    setErrorMessage,
    setShowErrorMessage,
    setShippingInfo,
    windowSize,
    user,
    __,
}) {
    // Get country name from ID
    const countryName =
        countries?.find((country) => country.id === Number(shippingInfo.country_id))?.name ||
        shippingInfo.country ||
        '';

    // Format full address
    const formatAddress = () => {
        const parts = [
            shippingInfo.address_line1,
            shippingInfo.address_line2,
            shippingInfo.city,
            shippingInfo.state,
            shippingInfo.postal_code,
            countryName,
        ].filter(Boolean);

        return parts.join(', ');
    };

    return (
        <div className="p-8 bg-white border rounded-md border-surface-3-light dark:border-surface-3-dark dark:bg-surface-1-dark">
            {/* Header with Edit Button */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-[18px] font-semibold text-main-text-light dark:text-main-text-dark">
                    {__('Shipping Information')}
                </h2>

                <button
                    onClick={() => setShippingAddressModal(true)}
                    className="flex cursor-pointer items-center gap-1.5 text-[13px] font-medium text-main-text-light transition-colors hover:text-main-text-light/80 dark:text-main-text-dark dark:hover:text-main-text-dark/80"
                >
                    <Pencil className="w-4 h-4" />
                    <span className='hidden lg:block'>{__('Edit address')}</span>
                </button>
            </div>

            {/* Address Information */}
            <div className="space-y-1 break-words">
                {/* Line 1: Name + Phone */}
                <p className="text-[14px] font-semibold text-main-text-light dark:text-main-text-dark">
                    {shippingInfo.name}
                    {shippingInfo.phone && (
                        <span className="font-medium"> {shippingInfo.phone}</span>
                    )}
                </p>

                {/* Line 2: Country, City, State */}
                <p className="text-[14px] text-main-text-light dark:text-main-text-dark">
                    {[countryName, shippingInfo.city, shippingInfo.state]
                        .filter(Boolean)
                        .join(', ')}
                </p>

                {/* Line 3: Address + Postal Code */}
                <p className="text-[14px] text-main-text-light dark:text-main-text-dark">
                    {formatAddress()}
                </p>
            </div>

            {shippingAddressModal && (
                <ShippingAddressModal
                    countries={countries}
                    shipping_addresses={shipping_addresses}
                    windowSize={windowSize}
                    isOpen={shippingAddressModal}
                    onClose={() => setShippingAddressModal(false)}
                    setInfoMessage={setInfoMessage}
                    setShowInfoMessage={setShowInfoMessage}
                    setErrorMessage={setErrorMessage}
                    setShowErrorMessage={setShowErrorMessage}
                    setShippingInfo={setShippingInfo}
                    user={user}
                    __={__}
                />
            )}
        </div>
    );
}

// Payment methods
function PaymentMethod({ paymentMethod, setPaymentMethod, __, points }) {
    return (
        <div className="p-8 bg-white border rounded-md border-surface-3-light dark:border-surface-3-dark dark:bg-surface-1-dark">
            <h2 className="mb-4 text-[18px] font-semibold text-main-text-light dark:text-main-text-dark">
                {__('Payment Method')}
            </h2>

            <div className="space-y-2">
                {/* Crypto */}
                <label
                    className={`flex cursor-pointer items-center gap-3 rounded-md px-4 py-3 transition ${paymentMethod === 'crypto'
                        ? 'bg-[#eaeaea] dark:bg-surface-2-dark'
                        : 'dark:hover:bg-surface-2-dark lg:hover:bg-[#eaeaea]'
                        }`}
                >
                    <input
                        type="radio"
                        name="payment_method"
                        value="crypto"
                        checked={paymentMethod === 'crypto'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="sr-only peer"
                    />

                    {/* outer circle */}
                    <span className="flex items-center justify-center w-5 h-5 border border-black rounded-full">
                        {/* inner white space */}
                        <span className="flex items-center justify-center w-4 h-4 bg-white rounded-full">
                            {/* black dot */}
                            {paymentMethod === 'crypto' && (
                                <span className="w-3 h-3 bg-black rounded-full" />
                            )}
                        </span>
                    </span>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center p-2 text-center text-gray-700 bg-gray-200 rounded-full">
                            <Bitcoin className="w-6 h-6" />
                        </div>

                        <div>
                            <p className="text-[14px] font-semibold text-main-text-light dark:text-main-text-dark">
                                {__('Crypto Payment')}{' '}
                                <span className="text-[14px] font-normal">
                                    ({__('Network fees may apply')})
                                </span>
                            </p>
                        </div>
                    </div>
                </label>

                {/* Bank Transfer */}
                <label
                    className={`flex cursor-pointer items-center gap-3 rounded-md px-4 py-3 transition ${paymentMethod === 'bank_transfer'
                        ? 'bg-[#eaeaea] dark:bg-surface-2-dark'
                        : 'dark:hover:bg-surface-2-dark lg:hover:bg-[#eaeaea]'
                        }`}
                >
                    <input
                        type="radio"
                        name="payment_method"
                        value="bank_transfer"
                        checked={paymentMethod === 'bank_transfer'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="sr-only peer"
                    />

                    {/* outer circle */}
                    <span className="flex items-center justify-center w-5 h-5 border border-black rounded-full">
                        {/* inner white space */}
                        <span className="flex items-center justify-center w-4 h-4 bg-white rounded-full">
                            {/* black dot */}
                            {paymentMethod === 'bank_transfer' && (
                                <span className="w-3 h-3 bg-black rounded-full" />
                            )}
                        </span>
                    </span>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center p-2 text-center text-gray-700 bg-gray-200 rounded-full">
                            <Landmark className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[14px] font-semibold text-main-text-light dark:text-main-text-dark">
                                {__('Direct Bank Transfer')}
                            </p>
                        </div>
                    </div>
                </label>

                {/* Points */}
                <label
                    className={`flex cursor-pointer items-center gap-3 rounded-md px-4 py-3 transition ${!points || points === 0 ? 'pointer-events-none opacity-50' : ''} ${paymentMethod === 'points'
                        ? 'bg-[#eaeaea] dark:bg-surface-2-dark'
                        : 'dark:hover:bg-surface-2-dark lg:hover:bg-[#eaeaea]'
                        }`}
                >
                    <input
                        type="radio"
                        name="payment_method"
                        value="points"
                        checked={paymentMethod === 'points'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="sr-only peer"
                    />

                    {/* outer circle */}
                    <span className="flex items-center justify-center w-5 h-5 border border-black rounded-full">
                        {/* inner white space */}
                        <span className="flex items-center justify-center w-4 h-4 bg-white rounded-full">
                            {/* black dot */}
                            {paymentMethod === 'points' && (
                                <span className="w-3 h-3 bg-black rounded-full" />
                            )}
                        </span>
                    </span>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center p-2 text-center text-gray-700 bg-gray-200 rounded-full">
                            <Star className="w-6 h-6" />
                        </div>

                        <div>
                            <p className="text-[14px] font-semibold text-main-text-light dark:text-main-text-dark">
                                {__('Points')}
                            </p>
                        </div>
                    </div>
                </label>
            </div>
        </div>
    );
}

// UsePoints
function UsePoints({ points, pointsToUse, setPointsToUse, onUseAllPoints, error, __ }) {
    return (
        <div className="p-8 bg-white border rounded-md border-surface-3-light dark:border-surface-3-dark dark:bg-surface-1-dark">
            {/* Header */}
            <h2 className="mb-5 text-[18px] font-semibold text-main-text-light dark:text-main-text-dark">
                {__('Use Points')}
            </h2>

            {/* Points Input Row */}
            <div className="flex flex-wrap items-center gap-10">
                {/* Label */}
                <span className="whitespace-nowrap text-[14px] font-semibold text-main-text-light dark:text-main-text-dark">
                    {__('Points to use')}
                </span>

                <div className="flex flex-wrap items-center gap-5">
                    {/* Input Field */}
                    <input
                        type="number"
                        value={pointsToUse}
                        onChange={(e) => setPointsToUse(e.target.value)}
                        placeholder={__('Enter points amount')}
                        min="0"
                        max={points}
                        className="focus:outline-hidden h-[40px] w-full lg:w-[300px] rounded-md border border-surface-3-light px-4 py-2.5 text-sm placeholder:text-[14px] placeholder:font-medium placeholder:text-[#b4b4b4] focus:border-surface-3-light focus:outline-none focus:ring-0 focus:ring-main-text-light dark:border-surface-3-dark dark:bg-surface-2-dark dark:text-main-text-dark dark:placeholder:text-sub-text-dark dark:focus:border-surface-3-dark"
                    />

                    {/* Use All Button */}
                    <button
                        type="button"
                        onClick={onUseAllPoints}
                        disabled={!points || points === 0}
                        className="h-[40px] rounded-md border border-[#c7c7c7] bg-backgroundLight px-6 text-[14px] font-semibold text-main-text-light transition-colors lg:hover:bg-[#ebebeb] disabled:cursor-not-allowed disabled:opacity-50 dark:border-surface-3-dark dark:bg-surface-3-dark dark:text-main-text-dark dark:lg:hover:bg-surface-3-dark/80"
                    >
                        {__('Use all')}
                    </button>
                </div>

                {/* Available Points */}
                <span className="ml-auto whitespace-nowrap text-[14px] font-normal text-main-text-light dark:text-main-text-dark">
                    {__('Available')}{' '}
                    <span className="text-[14px] font-semibold">
                        {Number(points || 0).toLocaleString('en-US')}
                    </span>{' '}
                    {__('points')}
                </span>
            </div>

            {/* Error Message */}
            {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
        </div>
    );
}

// Items
function Items({
    cart_items,
    quantities,
    onUpdateQuantity,
    onProductRemove,
    currency,
    removing,
    __,
    smartphoneAddonQuantities,
    onUpdateSmartphoneAddon,
    onRemoveSmartphoneAddon,
    getTotalQtyOfSmartphone,
    buy_now,
    getItemKey,
}) {
    const generateSmartphoneURL = (smartphone, isDirect = false, isSinglePage = false) => {
        return `?m-slug=${smartphone?.slug}${isSinglePage ? '&single_page=true' : ''}${isDirect ? '&direct=true' : ''}`;
    };

    return (
        <div className="p-8 transition-all bg-white border rounded-md border-surface-3-light dark:border-surface-3-dark dark:bg-surface-1-dark">
            <div className="flex items-start justify-start mb-4">
                <h2 className="text-[18px] font-semibold text-main-text-light dark:text-main-text-dark">
                    {__('Order Items')} ({cart_items?.length})
                </h2>
            </div>

            {cart_items?.map((item, index) => {
                const quantity = quantities[getItemKey(item)] || item.quantity;
                const relatedAddons = item?.smartphone_addon_items || [];
                const currentQty = quantity;
                const totalUsedQty = getTotalQtyOfSmartphone(item.smartphone_id);
                const otherItemsQty = totalUsedQty - currentQty;
                const maxAllowedForThisItem = item.smartphone.inventory_items_count - otherItemsQty;

                return (
                    <div
                        key={getItemKey(item)}
                        className={`border-t border-surface-3-light py-8 dark:border-surface-3-dark`}
                    >
                        <div className="flex flex-col gap-6 border-t lg:flex-row border-surface-3-light first:border-t-0 dark:border-surface-3-dark">
                            {/* Product Image */}
                            {(item?.smartphone?.smartphone_image_urls.length > 0 ||
                                item?.smartphone?.smartphone_video_urls?.length > 0) && (
                                    <div
                                        className="relative overflow-hidden transition-all rounded-md cursor-pointer group/img aspect-square h-28 w-28 shrink-0 bg-surface-2-light dark:bg-surface-2-dark"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            router.get(
                                                route('home') +
                                                generateSmartphoneURL(item?.smartphone, true, true),
                                            );
                                        }}
                                    >
                                        <img
                                            src={
                                                item?.smartphone?.smartphone_image_urls?.[0] ||
                                                item?.smartphone?.smartphone_video_urls[0]
                                                    ?.thumbnail_url ||
                                                Placeholder
                                            }
                                            alt={item?.smartphone?.model_name?.name}
                                            className="object-cover w-full h-full transition-transform duration-300 lg:group-hover/img:scale-110"
                                            loading="lazy"
                                            onError={(e) => (e.target.src = Placeholder)}
                                        />
                                    </div>
                                )}

                            {/* Product Details */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-4 mb-3">
                                    <div className="flex-1">
                                        <h3 className="mb-1 text-[16px] font-semibold text-main-text-light dark:text-main-text-dark">
                                            {item?.smartphone?.model_name?.name || 'N/A'}
                                        </h3>

                                        {/* Capacity and Color in one line */}
                                        <p className="text-[14px] font-medium text-sub-text-light dark:text-sub-text-dark">
                                            {item?.smartphone?.capacity?.name && item?.color?.name
                                                ? `${item?.smartphone?.capacity?.name}, ${item?.color?.name}`
                                                : item?.smartphone?.capacity?.name ||
                                                item?.color?.name ||
                                                ''}
                                        </p>
                                    </div>

                                    {/* Remove Button */}
                                    <button
                                        onClick={() => onProductRemove(item.id, item.type, item?.temp_id)}
                                        disabled={removing}
                                        className={`p-1.5 text-main-text-light transition-colors hover:text-main-text-light/80 dark:text-main-text-dark dark:hover:text-main-text-dark/80 ${removing ? 'cursor-not-allowed' : ''}`}
                                        title={__('Remove item')}
                                    >
                                        {removing ? <Spinner /> : <Trash2 className="w-5 h-5" />}
                                    </button>
                                </div>

                                {/* Price */}
                                <div className="mb-4">
                                    <span className="text-[16px] font-semibold text-main-text-light dark:text-main-text-dark">
                                        {currency?.symbol}
                                        {Number(item.unit_price).toLocaleString('en-US')}
                                    </span>
                                </div>

                                {/* Quantity and Stock */}
                                <div className="flex items-center gap-4">
                                    {/* Quantity Controls */}
                                    <div className="flex items-center border rounded-md border-surface-3-light bg-backgroundLight dark:border-surface-3-dark dark:bg-transparent">
                                        <button
                                            onClick={() => onUpdateQuantity(item.id, quantity - 1, item?.temp_id)}
                                            className="px-1 py-1 transition-colors text-main-text-light hover:bg-surface-1-light disabled:opacity-50 dark:text-main-text-dark dark:hover:bg-surface-2-dark"
                                            disabled={quantity <= 1}
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth={3}
                                                stroke="currentColor"
                                                className="h-4 w-[0.8rem]"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M19.5 12h-15"
                                                />
                                            </svg>
                                        </button>

                                        <span className="text-md min-w-[3rem] px-2 py-1 text-center font-semibold text-main-text-light dark:text-main-text-dark">
                                            {quantity}
                                        </span>

                                        <button
                                            disabled={quantity >= maxAllowedForThisItem}
                                            onClick={() => onUpdateQuantity(item.id, quantity + 1, item?.temp_id)}
                                            className="px-1 py-1 transition-colors text-main-text-light hover:bg-surface-1-light disabled:opacity-50 dark:text-main-text-dark dark:hover:bg-surface-2-dark"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth={3}
                                                stroke="currentColor"
                                                className="h-4 w-[0.8rem]"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M12 4.5v15m7.5-7.5h-15"
                                                />
                                            </svg>
                                        </button>
                                    </div>

                                    {/* Stock Status */}
                                    {maxAllowedForThisItem !== undefined &&
                                        maxAllowedForThisItem <= 10 &&
                                        maxAllowedForThisItem > 0 && (
                                            <span className="text-[13px] font-semibold text-[#ff0000]">
                                                {__('Only')} {maxAllowedForThisItem}{' '}
                                                {__('left in stock')}
                                            </span>
                                        )}
                                </div>
                            </div>
                        </div>

                        {/* Add-ons Section */}
                        {relatedAddons.length > 0 && (
                            <div className="pt-6 mt-6 border-t border-surface-3-light dark:border-surface-3-dark">
                                <h4 className="mb-4 text-[14px] font-semibold text-main-text-light dark:text-main-text-dark">
                                    {__('Add-ons')}
                                </h4>

                                <div className="space-y-3 border-t border-surface-3-light dark:border-surface-3-dark">
                                    {relatedAddons.map((addon_item) => (
                                        <AddonItem
                                            key={addon_item.id}
                                            buy_now={buy_now}
                                            item={addon_item}
                                            quantity={
                                                smartphoneAddonQuantities[getItemKey(addon_item)] ??
                                                addon_item.quantity
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

                        {/* Total Section */}
                        <div className="flex items-center justify-between pt-3 mt-3">
                            <span className="text-[14px] font-semibold text-main-text-light dark:text-main-text-dark">
                                {__('Total')}
                            </span>
                            <span className="text-[20px] font-semibold text-main-text-light dark:text-main-text-dark">
                                {currency?.symbol}
                                {Number(
                                    item?.unit_price * quantity +
                                    Number(
                                        relatedAddons?.reduce(
                                            (total, addon) => total + Number(addon.total_price),
                                            0,
                                        ),
                                    ),
                                ).toLocaleString('en-US')}
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// Addon Items
function AddonItem({ item, quantity, onUpdateQuantity, onRemove, currency, removing, __, buy_now }) {

    return (
        <div className="flex items-center justify-center gap-2 py-4 border-b lg:px-5 lg:gap-4 border-surface-3-light dark:border-surface-3-dark">
            {/* Addon Name - Truncated after certain chars */}
            <div className="min-w-0 max-w-[70px] flex-1">
                <p className="truncate text-[14px] font-normal dark:text-main-text-dark">
                    {item?.name || 'Option title'}
                </p>
            </div>

            {/* Remove Button */}
            <button
                onClick={() => onRemove(buy_now ? item.addon_id : item.id, item?.temp_id)}
                disabled={removing}
                className={`p-1.5 text-main-text-light transition-colors hover:text-main-text-light/80 dark:text-main-text-dark dark:hover:text-main-text-dark/80`}
                title={__('Remove addon')}
            >
                {removing ? <Spinner size="sm" /> : <Trash2 className="w-5 h-5" />}
            </button>

            {/* Spacer to push quantity controls to the right */}
            <div className="lg:flex-1"></div>

            {/* Quantity Controls - Screenshot style with rounded square buttons */}
            <div className="flex items-center flex-shrink-0 gap-2">
                <button
                    onClick={() => onUpdateQuantity((buy_now ? item?.addon_id : item?.id), quantity - 1, item?.temp_id)}
                    disabled={quantity <= 1}
                    className="flex h-[27px] w-[27px] items-center justify-center rounded-md border border-main-text-light bg-backgroundLight text-main-text-light transition-colors hover:bg-surface-2-light disabled:cursor-not-allowed disabled:border-surface-3-light dark:border-surface-3-dark dark:bg-surface-1-dark dark:text-main-text-dark dark:hover:bg-surface-2-dark"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={3}
                        stroke="currentColor"
                        className="w-4 h-4 font-semibold text-main-text-light dark:text-main-text-dark"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
                    </svg>
                </button>

                <span className="w-8 font-semibold text-center text-md text-main-text-light dark:text-main-text-dark">
                    {quantity}
                </span>

                <button
                    onClick={() => onUpdateQuantity((buy_now ? item?.addon_id : item?.id), quantity + 1, item?.temp_id)}
                    className="flex h-[27px] w-[27px] items-center justify-center rounded-md border border-main-text-light bg-backgroundLight text-main-text-light transition-colors hover:bg-surface-2-light disabled:cursor-not-allowed disabled:opacity-60 dark:border-surface-3-dark dark:bg-surface-1-dark dark:text-main-text-dark dark:hover:bg-surface-2-dark"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={3}
                        stroke="currentColor"
                        className="w-4 h-4 font-semibold text-main-text-light dark:text-main-text-dark"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 4.5v15m7.5-7.5h-15"
                        />
                    </svg>
                </button>
            </div>

            {/* Total Price */}
            <div className="lg:flex-shrink-0 w-16 lg:w-24 text-[14px] font-semibold text-right text-main-text-light dark:text-main-text-dark">
                {currency?.symbol}
                {Number(item?.unit_price * quantity).toLocaleString('en-US')}
            </div>
        </div>
    );
}

// Order Summary
function OrderSummaryCard({
    summary,
    currency,
    referalData,
    showReferalInput,
    setShowReferalInput,
    referalCode,
    setReferalCode,
    error,
    handleApplyReferal,
    applyingReferalProcessing,
    handleRemoveReferal,
    removingReferalProcessing,
    handlePlaceOrder,
    processingOrder,
    __,
}) {
    return (
        <div className="sticky space-y-3 top-24">
            {/* Summary Card */}
            <div className="p-8 bg-white border rounded-md border-surface-3-light dark:border-surface-3-dark dark:bg-surface-1-dark">
                <h2 className="mb-6 text-[18px] font-semibold text-main-text-light dark:text-main-text-dark">
                    {__('Order Summary')}
                </h2>

                {/* Price Breakdown */}
                <div className="pb-5 mb-5 space-y-3">
                    {/* Items Total */}
                    <div className="flex items-center justify-between">
                        <span className="text-[14px] font-semibold text-main-text-light dark:text-main-text-dark">
                            {__('Items total')}
                        </span>
                        <span className="text-[20px] font-semibold text-main-text-light dark:text-main-text-dark">
                            {currency?.symbol}
                            {Number(summary.items_total).toLocaleString('en-US')}
                        </span>
                    </div>

                    {/* Shipping */}
                    <div className="flex items-center justify-between">
                        <span className="text-[14px] font-semibold text-main-text-light dark:text-main-text-dark">
                            {__('Shipping')}
                        </span>
                        <span className="text-[20px] font-semibold text-main-text-light dark:text-main-text-dark">
                            {summary?.shipping_fee == 0
                                ? __('Free')
                                : `${currency?.symbol}${Number(summary.shipping_fee).toLocaleString('en-US')}`}
                        </span>
                    </div>

                    {/* Import Tax */}
                    <div className="flex items-center justify-between">
                        <span className="text-[14px] font-semibold text-main-text-light dark:text-main-text-dark">
                            {__('Import Tax')}
                        </span>
                        <span className="text-[20px] font-semibold text-main-text-light dark:text-main-text-dark">
                            {currency?.symbol}
                            {Number(summary.import_tax).toLocaleString('en-US')}
                        </span>
                    </div>
                </div>

                {/* Promo Code Card */}
                <div className="mb-10">
                    <PromoCodeCard
                        showInput={showReferalInput}
                        setShowInput={setShowReferalInput}
                        promoCode={referalCode}
                        setPromoCode={setReferalCode}
                        onApply={handleApplyReferal}
                        onRemove={handleRemoveReferal}
                        appliedPromo={referalData?.referal_code ? referalData : null}
                        isApplying={applyingReferalProcessing}
                        isRemoving={removingReferalProcessing}
                        error={error}
                        __={__}
                    />
                </div>

                {/* Total Due */}
                <div className="flex items-center justify-between">
                    <span className="text-[14px] font-semibold text-main-text-light dark:text-main-text-dark">
                        {__('Total due')}
                    </span>
                    <span className="text-[30px] font-semibold text-[#ff4400]">
                        {currency?.symbol}
                        {Number(summary.total).toLocaleString('en-US')}
                    </span>
                </div>

                {/* Confirm & Pay Button */}
                <button
                    onClick={handlePlaceOrder}
                    disabled={processingOrder}
                    className="mt-7 block w-full rounded-md bg-[#282828] px-6 py-4 text-center text-base font-semibold text-white transition-all lg:hover:bg-[#282828]/80 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-backgroundLight dark:text-main-text-light dark:lg:hover:bg-backgroundLight/80"
                >
                    {processingOrder ? (
                        <div className="flex items-center justify-center gap-2">
                            <Spinner customSize={'size-5'} />
                            <span>{__('Processing...')}</span>
                        </div>
                    ) : (
                        __('Confirm & Pay')
                    )}
                </button>

                {/* Secure Checkout Badge */}
                <div className="mt-10">
                    <div className="flex items-center justify-center gap-2 text-[13px] font-semibold text-main-text-light dark:text-main-text-dark">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="w-5 h-5 text-green-600"
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
            </div>
        </div>
    );
}

// Promot Code Card
function PromoCodeCard({
    showInput,
    setShowInput,
    promoCode,
    setPromoCode,
    onApply,
    onRemove,
    appliedPromo,
    isApplying,
    isRemoving,
    error,
    __,
}) {
    return (
        <div className="p-3 mb-5 border border-surface-3-light dark:border-surface-3-dark">
            {!appliedPromo ? (
                <>
                    {/* Collapsed State - Toggle Button */}
                    <button
                        onClick={() => setShowInput(!showInput)}
                        className={`flex w-full items-center justify-between ${showInput ? 'mb-5' : ''} text-[14px] font-semibold text-main-text-light transition-colors lg:hover:text-main-text-light/80 dark:text-main-text-dark dark:lg:hover:text-main-text-dark/80`}
                    >
                        <span className="flex items-center gap-0.5">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={3}
                                stroke="currentColor"
                                className="w-3 h-3"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 4.5v15m7.5-7.5h-15"
                                />
                            </svg>
                            {__('Apply a promo code')}
                        </span>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={3}
                            stroke="currentColor"
                            className={`h-3 w-3 transition-transform duration-200 ${showInput ? 'rotate-180' : ''}`}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                            />
                        </svg>
                    </button>

                    {/* Expanded State - Input Field + Apply Button */}
                    {showInput && (
                        <div className="mt-3 mb-5 space-y-2">
                            <div className="flex flex-wrap items-center justify-center gap-2">
                                <div className="relative flex flex-wrap items-center flex-1 gap-2 rounded-md">
                                    <input
                                        type="text"
                                        value={promoCode}
                                        onChange={(e) => setPromoCode(e.target.value)}
                                        placeholder={__('Enter promo code')}
                                        className="focus:outline-hidden h-[40px] w-full  flex-1 rounded-md border border-surface-3-light px-4 py-2.5  text-sm placeholder:text-[14px] placeholder:font-medium placeholder:text-[#b4b4b4] focus:border-surface-3-light focus:outline-none focus:ring-0 focus:ring-main-text-light dark:border-surface-3-dark dark:bg-surface-2-dark dark:text-main-text-dark dark:placeholder:text-sub-text-dark dark:focus:border-surface-3-dark"
                                    />
                                    {error && (
                                        <p className="absolute text-xs text-red-500 xl:-bottom-5 lg:-bottom-7 left-1 dark:text-red-400">
                                            {error}
                                        </p>
                                    )}
                                </div>
                                <button
                                    onClick={onApply}
                                    disabled={isApplying}
                                    className="h-[40px] rounded-md  border border-[#c7c7c7] bg-backgroundLight px-6 text-[14px] text-sm font-semibold text-main-text-light transition-colors lg:hover:bg-[#ebebeb] disabled:cursor-not-allowed disabled:opacity-50 dark:border-surface-3-dark dark:bg-surface-3-dark dark:text-main-text-dark dark:lg:hover:bg-surface-3-dark/80"
                                >
                                    {isApplying ? <Spinner customSize={'size-4'} /> : __('Apply')}
                                </button>
                            </div>
                        </div>
                    )}
                </>
            ) : (
                /* Applied Promo State - Success Box */
                <div className="flex items-center justify-between p-3 border border-green-200 rounded-md bg-green-50 dark:border-green-800 dark:bg-green-900/20">
                    <div className="flex items-center gap-2">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            className="w-5 h-5 text-green-600 dark:text-green-400"
                        >
                            <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                                clipRule="evenodd"
                            />
                        </svg>
                        <div>
                            <p className="text-sm font-medium text-green-900 dark:text-green-400">
                                {appliedPromo?.referal_code || appliedPromo?.code}
                            </p>
                            <p className="text-xs text-green-700 dark:text-green-500">
                                {appliedPromo?.total_points
                                    ? `${appliedPromo.total_points} ${__('points you will earn')}`
                                    : __('Promo code applied')}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onRemove}
                        disabled={isRemoving}
                        className="text-green-600 transition-colors hover:text-green-800 disabled:opacity-50 dark:text-green-400 dark:hover:text-green-300"
                        title={__('Remove promo code')}
                    >
                        {isRemoving ? (
                            <Spinner customSize={'size-4'} />
                        ) : (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2}
                                stroke="currentColor"
                                className="w-5 h-5"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
}

// Shipping Address View Modal
function ShippingAddressModal({
    shipping_addresses,
    countries,
    __,
    windowSize,
    isOpen,
    onClose,
    setInfoMessage,
    setShowInfoMessage,
    setErrorMessage,
    setShowErrorMessage,
    setShippingInfo,
    user,
}) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(null);

    const [toggleProcessing, setToggleProcessing] = useState(false);
    const [deleteProcessing, setDeleteProcessing] = useState(false);
    const [useProfileProcessing, setUseProfileProcessing] = useState(false);

    const { data, setData, post, put, processing, errors } = useForm({
        country_id: '',
        name: '',
        phone: '',
        state: '',
        city: '',
        postal_code: '',
        address_line1: '',
        address_line2: '',
    });

    const [isCreateShippingAddressModalOpen, setIsCreateShippingAddressModalOpen] = useState(false);
    const [isEditShippingAddressModalOpen, setIsEditShippingAddressModalOpen] = useState(false);

    // Auto Opening Modal If Query Exists
    useEffect(() => {
        const url = new URL(window.location.href);
        const param = url.searchParams.get('modal');

        if (param === 'create-shipping-address') {
            setIsCreateShippingAddressModalOpen(true);
        }
    }, []);

    useEffect(() => {
        if (isCreateShippingAddressModalOpen) {
            document.body.style.overflow = 'hidden';
            document.body.style.touchAction = 'none';
        } else {
            document.body.style.overflow = '';
            document.body.style.touchAction = '';
        }
        return () => {
            document.body.style.overflow = '';
            document.body.style.touchAction = '';
        };
    }, [isCreateShippingAddressModalOpen]);

    // // Appedning modal to URL
    useEffect(() => {
        const url = new URL(window.location.href);
        if (isCreateShippingAddressModalOpen) {
            window.history.pushState({}, '', window.location.pathname);
            url.searchParams.set('modal', 'create-shipping-address');
        } else if (isEditShippingAddressModalOpen) {
            window.history.pushState({}, '', window.location.pathname);
            url.searchParams.set('modal', 'edit-shipping-address');
        } else {
            url.searchParams.delete('modal');
        }

        window.history.replaceState({}, '', url);
    }, [isCreateShippingAddressModalOpen, isEditShippingAddressModalOpen]);

    // // Handle browser/mobile back button to close modals
    useEffect(() => {
        const handlePopState = (e) => {
            if (isCreateShippingAddressModalOpen) {
                setIsCreateShippingAddressModalOpen(false);
                return;
            }

            if (isEditShippingAddressModalOpen) {
                setIsEditShippingAddressModalOpen(false);
                return;
            }

            if (isOpen) {
                onClose();
                return;
            }
        };

        const preventInertiaNavigation = (event) => {
            const pathname = event.detail?.visit?.url?.pathname || '';
            if (pathname.includes("/shipping-addresses") || pathname.includes('/shipping-address-status-toggle')) {
                return;
            }
            if (isCreateShippingAddressModalOpen && pathname === '/shipping-address') {
                event.preventDefault();
            }


            const mainRoutes = ['/', '/global-search', '/shop', '/profile', '/cart', '/orders', '/bookmarks', '/privacy-policy', '/terms-of-service', 'contact'];
            const isNavigatingToMainRoute = mainRoutes.some(route => pathname === route || pathname.startsWith(route));

            if (isOpen && !isNavigatingToMainRoute) {
                event.preventDefault();
            }
        };
        window.addEventListener('popstate', handlePopState);
        const removeRouterEvent = router.on('before', preventInertiaNavigation);

        // Cleanup
        return () => {
            window.removeEventListener('popstate', handlePopState);
            if (removeRouterEvent) removeRouterEvent();
        };
    }, [isCreateShippingAddressModalOpen, isEditShippingAddressModalOpen, isOpen]);

    // // Disable Shipping Create and Update Modal
    //  Button State
    const [isCreateShippingAddressButtonDisabled, setIsCreateShippingAddressButtonDisabled] =
        useState(true);
    const [isUpdateShippingAddressButtonDisabled, setIsUpdateShippingAddressButtonDisabled] =
        useState(true);

    useEffect(() => {
        const isIncomplete =
            !data.name ||
            !data.phone ||
            !data.address_line1 ||
            !data.city ||
            !data.state ||
            !data.postal_code ||
            !data.country_id;

        setIsCreateShippingAddressButtonDisabled(isIncomplete);
        setIsUpdateShippingAddressButtonDisabled(isIncomplete);
    }, [data]);

    // Store Shipping Address
    const handleCreateShippingAddress = (e) => {
        e.preventDefault();
        post(route('website.shipping-addresses.store'), {
            onSuccess: (response) => {
                if (response.props.flash.success) {
                    setIsCreateShippingAddressModalOpen(false);
                    setData({
                        country_id: '',
                        name: '',
                        phone: '',
                        state: '',
                        city: '',
                        postal_code: '',
                        address_line1: '',
                        address_line2: '',
                    });
                }
            },
        });
    };

    // Destroy Shipping Address

    const handleRemoveShippingAddress = (id) => {
        setDeleteProcessing(true);
        router.delete(route('website.shipping-addresses.destroy', id), {
            preserveScroll: true,
            preserveUrl: true,

            onFinish: () => {
                setDeleteProcessing(false);
                setIsDropdownOpen(null);
            },
        });
    };

    // Edit Shipping Address
    const handleEditShippingAddress = (address) => {
        setData({
            id: address.id,
            country_id: address.country_id,
            name: address.name,
            phone: address.phone,
            state: address.state,
            city: address.city,
            postal_code: address.postal_code,
            address_line1: address.address_line1,
            address_line2: address.address_line2,
        });

        setIsEditShippingAddressModalOpen(true);
    };


    // Update Shipping Address
    const handleUpdateShippingAddress = (e) => {
        e.preventDefault();
        put(route('website.shipping-addresses.update', data.id), {
            onSuccess: (response) => {
                if (response.props.flash.success) {
                    setIsEditShippingAddressModalOpen(false);
                    setData({
                        country_id: '',
                        name: '',
                        phone: '',
                        state: '',
                        city: '',
                        postal_code: '',
                        address_line1: '',
                        address_line2: '',
                    });
                }
            },
        });
    };

    // Toggle Shipping Address
    const handleToggleShippingAddressStatus = (id) => {
        setToggleProcessing(true);

        router.put(
            route('website.shipping-addresses.toggle-status', id),
            {},
            {
                preserveScroll: true,
                preserveUrl: true,

                onFinish: () => {
                    setToggleProcessing(false);
                    setIsDropdownOpen(null);
                },
            },
        );
    };

    // Using Profile Address Info When No Shipping Address Exists
    const useProfileAddress = () => {
        setUseProfileProcessing(true);

        if (shipping_addresses.length > 0 || useProfileProcessing) {
            setUseProfileProcessing(false);
            return;
        }

        const customer = user.customer;
        if (!user) {
            setShowErrorMessage(true);
            setErrorMessage(__('Something went wrong. Please try again.'));
            setUseProfileProcessing(false);
            return;
        } else if (!customer) {
            setShowErrorMessage(true);
            setErrorMessage(__('Only customers can use this feature.'));
            setUseProfileProcessing(false);
            return;
        }

        if (
            !customer.country_id ||
            !user.name ||
            !user.phone ||
            !customer.state ||
            !customer.city ||
            !customer.postal_code ||
            (!customer.address_line1 && !customer.address_line2)
        ) {
            setShowInfoMessage(true);
            setInfoMessage(
                <>
                    {__('Please complete your profile first.')} <br />
                    <Link
                        href={route('website.profile.index') + '?modal=edit-profile'}
                        className="underline text-main-text-light dark:text-main-text-dark"
                    >
                        {__('Go to Profile Page')}
                    </Link>
                </>,
            );
            setUseProfileProcessing(false);

            return;
        }

        const formPayload = {
            country_id: customer.country_id,
            name: user.name,
            phone: user.phone,
            state: customer.state,
            city: customer.city,
            postal_code: customer.postal_code,
            address_line1: customer.address_line1,
            address_line2: customer.address_line2,
        };

        router.post(
            route('website.shipping-addresses.store.from-profile'),
            {
                ...formPayload,
            },
            {
                preserveScroll: true,
                onFinish: () => {
                    setUseProfileProcessing(false);
                },
                onError: (errors) => {
                    const errMessages = Object.values(errors).flat();
                    setShowErrorMessage(true);
                    setErrorMessage(errMessages.join(' '));
                },
            },
        );
    };



    const EmptyShippingAddress = ({ onClick, processing, __ }) => {
        return (
            <div className="w-full p-8 border rounded-md border-surface-3-light bg-surface-2-light dark:border-surface-3-dark dark:bg-surface-2-dark">
                {/* Message Text */}
                <p className="mb-4 text-sm text-center text-main-text-light dark:text-main-text-dark">
                    {__('No shipping address yet. Add one to use at checkout.')}
                </p>

                {/* Button */}
                <div className="flex justify-center">
                    <button
                        onClick={onClick}
                        type="button"
                        disabled={processing}
                        className={`f rounded-md border border-main-text-light bg-main-text-dark px-6 py-2 text-sm font-medium text-main-text-light transition-colors hover:bg-main-text-dark/80 focus:outline-none focus:ring-0 focus:ring-offset-0 dark:border-main-text-dark dark:bg-main-text-light dark:text-main-text-dark dark:hover:bg-main-text-light/80 ${processing && 'cursor-not-allowed opacity-25 dark:opacity-40'}`}
                    >
                        {processing ? <Spinner /> : __('Use Profile Address')}
                    </button>
                </div>
            </div>
        );
    };

    const ShippingAddressItem = ({
        item,
        onEdit,
        onToggle,
        onRemove,
        toggleProcessing,
        isDropdownOpen,
        setIsDropdownOpen,
        deleteProcessing,


        __,
    }) => {
        // If this is the active/default address
        if (item.is_active) {
            return (
                <>
                    <div className="relative w-full p-5 transition-colors bg-white border rounded-md border-main-text-light dark:bg-surface-2-dark dark:border-main-text-dark">

                        {/* Top Right: Default Badge + Edit Button  For Mobile*/}
                        <div className="flex items-center justify-between gap-2 lg:hidden lg:left-auto lg:justify-end">


                            <span className="px-4 py-1 text-sm font-medium text-white bg-green-600 rounded-full">
                                {__('default')}
                            </span>

                            <button
                                type="button"
                                onClick={() => onEdit(item)}
                                className="flex items-center gap-1.5 rounded-md  px-3 py-1.5 text-sm font-medium text-main-text-light transition-colors hover:text-main-text-light/80  dark:text-main-text-dark dark:hover:text-main-text-dark/80"
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
                                        d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
                                    />
                                </svg>
                            </button>
                        </div>

                        {/* Top Right: Default Badge + Edit Button  For Desktop*/}
                        <div className="absolute items-center hidden gap-2 lg:flex top-4 right-4">


                            <span className="px-4 py-1 text-sm font-medium text-white bg-green-600 rounded-full">
                                {__('default')}
                            </span>

                            <button
                                type="button"
                                onClick={() => onEdit(item)}
                                className="flex items-center gap-1.5 rounded-md  px-3 py-1.5 text-sm font-medium text-main-text-light transition-colors hover:text-main-text-light/80  dark:text-main-text-dark dark:hover:text-main-text-dark/80"
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
                                        d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
                                    />
                                </svg>
                                {__('Edit')}
                            </button>
                        </div>

                        {/* Address Details */}
                        <div className="pr-32 mt-3 text-sm leading-relaxed text-main-text-light dark:text-main-text-dark">
                            <p className="font-semibold">{item.name}</p>
                            <p>{item.address_line1}</p>
                            {item.address_line2 && <p>{item.address_line2}</p>}
                            <p>
                                {item.city}, {item.state} {item.postal_code}
                            </p>
                            {item.phone && (
                                <p className="text-main-text-light dark:text-main-text-dark">{item.phone}</p>
                            )}
                            <p>{item.country?.name || item.country}</p>
                        </div>

                    </div>
                </>
            );
        }

        // If this is an inactive/other address
        return (
            <>

                <div className="relative w-full p-5 transition-colors bg-white border rounded-md border-surface-3-light hover:border-main-text-light/20 dark:bg-surface-1-dark dark:border-surface-3-dark dark:hover:border-main-text-dark/20">

                    {/* Top Right: Dropdown Menu */}
                    <div className="absolute top-4 right-4">
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setIsDropdownOpen(item.id)}
                                className="rounded-md p-1.5 text-main-text-light transition-colors lg:hover:bg-surface-2-light focus:outline-none focus:ring-0 focus:ring-offset-0 dark:text-main-text-dark dark:lg:hover:bg-surface-2-dark"
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
                                        d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                                    />
                                </svg>
                            </button>


                            {/* Dropdown Menu */}
                            {isDropdownOpen === item.id && (
                                <>
                                    {/* Backdrop */}
                                    <div
                                        className="fixed inset-0 z-10"
                                        onClick={() => setIsDropdownOpen(null)}
                                    />

                                    {/* Menu */}
                                    <div className="absolute right-0 z-20 w-48 bg-white border rounded-md shadow-lg top-6 border-surface-3-light dark:border-surface-3-dark dark:bg-surface-1-dark">
                                        <div className="py-3">
                                            {/* Set as Default */}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    onToggle(item.id);
                                                }}
                                                className="flex items-center w-full gap-2 px-4 py-1 text-sm text-left transition-colors text-main-text-light lg:hover:bg-surface-2-light dark:text-main-text-dark dark:lg:hover:bg-surface-2-dark"
                                            >
                                                {toggleProcessing ? (
                                                    <Spinner />
                                                ) : (
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        strokeWidth={2}
                                                        stroke="currentColor"
                                                        className="w-4 h-4"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                                                        />
                                                    </svg>
                                                )}
                                                {__('Set as default')}
                                            </button>

                                            {/* Edit */}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setIsDropdownOpen(null);
                                                    onEdit(item);
                                                }}
                                                className="flex items-center w-full gap-2 px-4 py-2 text-sm text-left transition-colors text-main-text-light lg:hover:bg-surface-2-light dark:text-main-text-dark dark:lg:hover:bg-surface-2-dark"
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
                                                        d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
                                                    />
                                                </svg>

                                                {__('Edit')}
                                            </button>

                                            {/* Delete */}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    onRemove(item.id);
                                                }}
                                                className="flex items-center w-full gap-2 px-4 py-1 text-sm text-left text-red-600 transition-colors lg:hover:bg-red-50 dark:text-red-400 dark:lg:hover:bg-red-900/20"
                                            >
                                                {deleteProcessing ? (
                                                    <Spinner />
                                                ) : (
                                                    <Trash2 className="w-4 h-4" />
                                                )}
                                                {__('Delete')}
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Address Details */}
                    <div className="pr-32 text-sm leading-relaxed text-main-text-light dark:text-main-text-dark">
                        <p className="font-semibold">{item.name}</p>
                        <p>{item.address_line1}</p>
                        {item.address_line2 && <p>{item.address_line2}</p>}
                        <p>
                            {item.city}, {item.state} {item.postal_code}
                        </p>
                        {item.phone && (
                            <p className="text-main-text-light dark:text-main-text-dark">{item.phone}</p>
                        )}
                        <p>{item.country?.name || item.country}</p>
                    </div>

                </div>


            </>
        );
    };

    useEffect(() => {
        if (isOpen) {
            if (shipping_addresses.length > 0) {
                if (shipping_addresses.filter((addr) => addr.is_active).length > 0) {
                    const activeAddress = shipping_addresses.filter((addr) => addr.is_active)[0];
                    setShippingInfo({
                        country_id: activeAddress.country_id,
                        name: activeAddress.name,
                        phone: activeAddress.phone,
                        state: activeAddress.state,
                        city: activeAddress.city,
                        postal_code: activeAddress.postal_code,
                        address_line1: activeAddress.address_line1,
                        address_line2: activeAddress.address_line2,
                    });
                }
            }
        }
    }, [shipping_addresses, isOpen]);


    useEffect(() => {
        if (isOpen) {
            const url = new URL(window.location.href);
            url.searchParams.set('shipping-address', 'true');
            window.history.pushState({}, '', url.toString());
        }


        return () => {
            if (!isOpen) {
                window.history.pushState(
                    { fromModal: true },
                    '',
                    route('website.carts.index')
                );
            }

            window.history.replaceState(
                { fromModal: true },
                '',
                route('website.checkout.index')
            );
        }
    }, [isOpen]);

    if (!isOpen) {
        return null;
    }
    return (
        <>
            {windowSize.width > 1024 ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop/Overlay */}
                    <div
                        className="fixed inset-0 transition-opacity duration-300 bg-black/30"
                        onClick={() => onClose()}
                    />

                    {/* Modal Container */}
                    <div className="relative z-10 w-full max-w-5xl p-6 pb-1 bg-white border rounded-md border-surface-1-light text-main-text-light dark:border-surface-3-dark dark:bg-surface-1-dark dark:text-main-text-dark">
                        <div className="p-6">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6">
                                <h1 className="text-[20px] font-semibold text-main-text-light dark:text-main-text-dark">
                                    {__('Shipping Address')}
                                </h1>

                                <button
                                    onClick={onClose}
                                    className="p-2 transition-colors text-main-text-light dark:text-main-text-dark hover:text-main-text-light/80 dark:hover:text-main-text-dark/80"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="flex flex-wrap items-center justify-start gap-4 mb-4">
                                <p className="text-sm text-main-text-light dark:text-main-text-dark">
                                    <span className="font-semibold">
                                        {__('Default Shipping Address')}
                                    </span>
                                    <span className="mx-1 font-normal">
                                        {' '}
                                        ({__('Used for delivery at checkout.')})
                                    </span>
                                </p>
                            </div>

                            {/* Content */}
                            <div className="mt-6 max-h-[80vh] overflow-y-auto pr-2">
                                {shipping_addresses.length === 0 ? (
                                    <EmptyShippingAddress
                                        onClick={useProfileAddress}
                                        processing={useProfileProcessing}
                                        __={__}
                                    />
                                ) : (
                                    <>
                                        {/* Active Addresses */}
                                        {shipping_addresses
                                            .filter((addr) => addr.is_active)
                                            .map((item, index) => (
                                                <ShippingAddressItem
                                                    key={item.id || index}
                                                    item={item}
                                                    onRemove={handleRemoveShippingAddress}
                                                    onEdit={handleEditShippingAddress}
                                                    onToggle={handleToggleShippingAddressStatus}
                                                    toggleProcessing={toggleProcessing}
                                                    isDropdownOpen={isDropdownOpen}
                                                    setIsDropdownOpen={setIsDropdownOpen}
                                                    deleteProcessing={deleteProcessing}
                                                    __={__}
                                                />
                                            ))}

                                        {/* Inactive Addresses */}
                                        {shipping_addresses.filter((addr) => !addr.is_active)
                                            .length > 0 && (
                                                <div className="mt-8">
                                                    <p className="mb-3 font-semibold text-main-text-light dark:text-main-text-dark">
                                                        {__('Other Shipping Addresses')}
                                                    </p>
                                                    <div className="space-y-3">
                                                        {shipping_addresses
                                                            .filter((addr) => !addr.is_active)
                                                            .map((item, index) => (
                                                                <ShippingAddressItem
                                                                    key={item.id || index}
                                                                    item={item}
                                                                    onRemove={
                                                                        handleRemoveShippingAddress
                                                                    }
                                                                    onEdit={handleEditShippingAddress}
                                                                    onToggle={
                                                                        handleToggleShippingAddressStatus
                                                                    }
                                                                    toggleProcessing={toggleProcessing}
                                                                    isDropdownOpen={isDropdownOpen}
                                                                    setIsDropdownOpen={
                                                                        setIsDropdownOpen
                                                                    }
                                                                    deleteProcessing={deleteProcessing}
                                                                    __={__}
                                                                />
                                                            ))}
                                                    </div>
                                                </div>
                                            )}
                                    </>
                                )}
                            </div>

                            {/* Action Bar */}
                            <div className="flex flex-wrap items-center justify-end gap-4 mt-10">
                                <PrimaryButton
                                    Text={__('Add Address')}
                                    Type={'button'}
                                    Action={() => setIsCreateShippingAddressModalOpen(true)}
                                    CustomClass={'w-[200px] !text-center'}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="fixed inset-0 z-50 bg-black">
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/70"></div>

                    {/* Fullscreen slide-over */}
                    <div className="relative z-10 flex h-[100dvh]  w-full flex-col overflow-y-auto border border-surface-1-light bg-backgroundLight text-main-text-light dark:border-surface-3-dark dark:bg-backgroundDark dark:text-main-text-dark">
                        {/* Top Bar */}
                        <div className="flex items-center justify-center px-4 py-3">
                            <button
                                onClick={() => onClose()}
                                className="absolute p-1 text-black rounded-full left-4 dark:text-main-text-dark"
                            >
                                <ChevronLeft />
                            </button>

                            <h2 className="mx-10 text-xl font-semibold tracking-tight text-main-text-light dark:text-main-text-dark">
                                {__('Shipping Address')}
                            </h2>
                        </div>

                        {/* Content */}
                        <div className="flex-1 p-4 mb-20 space-y-6">
                            {shipping_addresses.length === 0 ? (
                                <EmptyShippingAddress
                                    onClick={useProfileAddress}
                                    processing={useProfileProcessing}
                                    __={__}
                                />
                            ) : (
                                <>
                                    {/* Active Addresses */}
                                    {shipping_addresses
                                        .filter((addr) => addr.is_active)
                                        .map((item, index) => (
                                            <ShippingAddressItem
                                                key={item.id || index}
                                                item={item}
                                                onRemove={handleRemoveShippingAddress}
                                                onEdit={handleEditShippingAddress}
                                                onToggle={handleToggleShippingAddressStatus}
                                                toggleProcessing={toggleProcessing}
                                                isDropdownOpen={isDropdownOpen}
                                                setIsDropdownOpen={setIsDropdownOpen}
                                                deleteProcessing={deleteProcessing}
                                                __={__}
                                            />
                                        ))}

                                    {/* Inactive Addresses */}
                                    {shipping_addresses.filter((addr) => !addr.is_active).length >
                                        0 && (
                                            <div className="mt-8">
                                                <p className="mb-3 font-semibold text-main-text-light dark:text-main-text-dark">
                                                    {__('Other Shipping Addresses')}
                                                </p>
                                                <div className="space-y-3">
                                                    {shipping_addresses
                                                        .filter((addr) => !addr.is_active)
                                                        .map((item, index) => (
                                                            <ShippingAddressItem
                                                                key={item.id || index}
                                                                item={item}
                                                                onRemove={handleRemoveShippingAddress}
                                                                onEdit={handleEditShippingAddress}
                                                                onToggle={
                                                                    handleToggleShippingAddressStatus
                                                                }
                                                                toggleProcessing={toggleProcessing}
                                                                isDropdownOpen={isDropdownOpen}
                                                                setIsDropdownOpen={setIsDropdownOpen}
                                                                deleteProcessing={deleteProcessing}
                                                                __={__}
                                                            />
                                                        ))}
                                                </div>
                                            </div>
                                        )}
                                </>
                            )}
                        </div>

                        {/* Action Bar */}
                        <div className="flex flex-wrap items-center justify-end gap-4 px-4 mb-[4rem]">
                            <PrimaryButton
                                Text={__('Add Address')}
                                Type={'button'}
                                Action={() => setIsCreateShippingAddressModalOpen(true)}
                                CustomClass={'w-full h-[40px] !text-center'}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Create Shipping Address Modal */}
            {isCreateShippingAddressModalOpen && (
                <>
                    {createPortal(
                        windowSize.width > 1024 ? (
                            // PC VERSION
                            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                                {/* Backdrop */}
                                <div
                                    className="fixed inset-0 transition-opacity duration-300 bg-black/30"
                                    onClick={() => setIsCreateShippingAddressModalOpen(false)}
                                />

                                {/* Modal Card */}
                                <div className="relative z-10 w-full max-w-5xl p-6 pb-1 bg-white border rounded-md border-surface-1-light text-main-text-light dark:border-surface-3-dark dark:bg-surface-1-dark dark:text-main-text-dark">

                                    <div className="p-6">


                                        {/* Header */}
                                        <div className="flex items-center justify-between pb-4">
                                            <h2 className="text-xl font-semibold tracking-tight text-main-text-light dark:text-main-text-dark">
                                                {__('Add Shipping Address')}
                                            </h2>
                                        </div>

                                        {/* Content */}
                                        <div className="mt-6 max-h-[80vh] overflow-y-auto pr-2">
                                            <form
                                                onSubmit={handleCreateShippingAddress}
                                                className="mb-10 space-y-5"
                                            >
                                                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                                                    {/* Name */}
                                                    <div>
                                                        <WebInput
                                                            Id={'name'}
                                                            InputName={__('Name')}
                                                            Error={errors.name}
                                                            Name={'name'}
                                                            Placeholder={__('Enter Full Name')}
                                                            Type={'text'}
                                                            Value={data.name}
                                                            Action={(e) =>
                                                                setData('name', e.target.value)
                                                            }
                                                            Required={true}
                                                        />
                                                    </div>

                                                    {/* Phone */}
                                                    <div>
                                                        <WebInput
                                                            Id={'phone'}
                                                            InputName={__('Phone')}
                                                            Error={errors.phone}
                                                            Name={'phone'}
                                                            Placeholder={__('Enter Phone')}
                                                            Type={'text'}
                                                            Value={data.phone}
                                                            Action={(e) =>
                                                                setData('phone', e.target.value)
                                                            }
                                                            Required={true}
                                                        />
                                                    </div>
                                                    {/* Country */}
                                                    <div>
                                                        <WebSelectInput
                                                            InputName={__('Country')}
                                                            Id={'country_id'}
                                                            Name={'country_id'}
                                                            Value={data.country_id}
                                                            Required={true}
                                                            Action={(value) =>
                                                                setData('country_id', value)
                                                            }
                                                            items={countries}
                                                            itemKey={'name'}
                                                            Error={errors.country_id}
                                                            Placeholder={__('Select Country')}
                                                            customPlaceHolder={true}
                                                        />
                                                    </div>

                                                    {/* Address Line 1 */}
                                                    <div className="col-span-2">
                                                        <WebTextArea
                                                            InputName={__('Address 1')}
                                                            Id={'address_1'}
                                                            Name={'address_1'}
                                                            Error={errors.address_line1}
                                                            Value={data.address_line1}
                                                            Required={true}
                                                            Placeholder={__('Enter Address 1')}
                                                            Action={(e) =>
                                                                setData('address_line1', e.target.value)
                                                            }
                                                            Rows={1}
                                                        />
                                                    </div>

                                                    {/* Address Line 2 */}
                                                    <div className="col-span-2">
                                                        <WebTextArea
                                                            InputName={__('Address 2')}
                                                            Id={'address_2'}
                                                            Name={'address_2'}
                                                            Error={errors.address_line2}
                                                            Placeholder={__('Enter Address 2')}
                                                            Value={data.address_line2}
                                                            Required={false}
                                                            Action={(e) =>
                                                                setData('address_line2', e.target.value)
                                                            }
                                                            Rows={1}
                                                        />
                                                    </div>

                                                    {/* City and State */}
                                                    <div>
                                                        <WebInput
                                                            Id={'City'}
                                                            InputName={__('City')}
                                                            Error={errors.city}
                                                            Name={'city'}
                                                            Placeholder={__('Enter City')}
                                                            Type={'text'}
                                                            Value={data.city}
                                                            Action={(e) =>
                                                                setData('city', e.target.value)
                                                            }
                                                            Required={true}
                                                        />
                                                    </div>

                                                    <div>
                                                        <WebInput
                                                            Id={'state'}
                                                            InputName={__('State')}
                                                            Error={errors.state}
                                                            Name={'state'}
                                                            Placeholder={__('Enter State')}
                                                            Type={'text'}
                                                            Value={data.state}
                                                            Action={(e) =>
                                                                setData('state', e.target.value)
                                                            }
                                                            Required={true}
                                                        />
                                                    </div>

                                                    {/* Postal Code and Country ID */}
                                                    <div>
                                                        <WebInput
                                                            Id={'postal_code'}
                                                            InputName={__('Postal Code')}
                                                            Error={errors.postal_code}
                                                            Name={'postal_code'}
                                                            Placeholder={__('Enter Postal Code')}
                                                            Type={'text'}
                                                            Value={data.postal_code}
                                                            Action={(e) =>
                                                                setData('postal_code', e.target.value)
                                                            }
                                                            Required={true}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-end gap-3">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setIsCreateShippingAddressModalOpen(false)
                                                        }
                                                        className="h-[50px] w-[180px] rounded-md bg-surface-2-light text-main-text-light transition-all hover:bg-surface-3-light dark:bg-surface-3-dark dark:text-sub-text-dark dark:hover:bg-surface-3-dark/80"
                                                    >
                                                        {__('Cancel')}
                                                    </button>

                                                    <button
                                                        type="submit"
                                                        disabled={
                                                            processing ||
                                                            isCreateShippingAddressButtonDisabled
                                                        }
                                                        className={`text-md flex h-[50px] w-[180px] items-center justify-center gap-2 rounded-md bg-main-text-light font-semibold text-main-text-dark transition-all hover:bg-main-text-light/80 dark:bg-main-text-dark dark:text-main-text-light dark:hover:bg-main-text-dark/80 ${(processing || isCreateShippingAddressButtonDisabled) && 'cursor-not-allowed opacity-25 dark:opacity-40'}`}
                                                    >
                                                        {processing && (
                                                            <Spinner customSize={'size-5'} />
                                                        )}
                                                        {__('Save Changes')}
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            // MOBILE VERSION
                            <div className="fixed inset-0 z-50 bg-black">
                                {/* Backdrop */}
                                <div className="absolute inset-0 bg-black/70"></div>

                                {/* Fullscreen slide-over */}
                                <div className="relative z-10 flex h-[100dvh] w-full flex-col overflow-y-auto border border-surface-1-light bg-backgroundLight text-main-text-light dark:border-surface-3-dark dark:bg-backgroundDark dark:text-main-text-dark">
                                    {/* Top Bar */}
                                    <div className="flex items-center justify-center px-4 py-3">
                                        <button
                                            onClick={() =>
                                                setIsCreateShippingAddressModalOpen(false)
                                            }
                                            className="absolute p-1 text-black rounded-full left-4 dark:text-main-text-dark"
                                        >
                                            <ChevronLeft />
                                        </button>

                                        <h2 className="mx-10 text-xl font-semibold tracking-tight text-main-text-light dark:text-main-text-dark">
                                            {__('Add Shipping Address')}
                                        </h2>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 p-4 space-y-6">
                                        <form
                                            onSubmit={handleCreateShippingAddress}
                                            className="mb-24 space-y-5"
                                        >
                                            {/* Name */}
                                            <div>
                                                <WebInput
                                                    Id={'name'}
                                                    InputName={__('Name')}
                                                    Error={errors.name}
                                                    Name={'name'}
                                                    Placeholder={__('Enter Full Name')}
                                                    Type={'text'}
                                                    Value={data.name}
                                                    Action={(e) => setData('name', e.target.value)}
                                                    Required={true}
                                                />
                                            </div>

                                            {/* Phone */}
                                            <div>
                                                <WebInput
                                                    Id={'phone'}
                                                    InputName={__('Phone')}
                                                    Error={errors.phone}
                                                    Name={'phone'}
                                                    Placeholder={__('Enter Phone')}
                                                    Type={'text'}
                                                    Value={data.phone}
                                                    Action={(e) => setData('phone', e.target.value)}
                                                    Required={true}
                                                />
                                            </div>

                                            <div>
                                                <WebSelectInput
                                                    InputName={__('Country')}
                                                    Id={'country_id'}
                                                    Name={'country_id'}
                                                    Value={data.country_id}
                                                    Required={true}
                                                    Action={(value) => setData('country_id', value)}
                                                    items={countries}
                                                    itemKey={'name'}
                                                    Error={errors.country_id}
                                                    Placeholder={__('Select Country')}
                                                    customPlaceHolder={true}
                                                />
                                            </div>

                                            {/* Address Line 1 */}
                                            <div>
                                                <WebTextArea
                                                    InputName={__('Address 1')}
                                                    Id={'address_1'}
                                                    Name={'address_1'}
                                                    Error={errors.address_line1}
                                                    Value={data.address_line1}
                                                    Placeholder={__('Enter Address 1')}
                                                    Required={true}
                                                    Action={(e) =>
                                                        setData('address_line1', e.target.value)
                                                    }
                                                    Rows={1}
                                                />
                                            </div>

                                            {/* Address Line 2 */}
                                            <div>
                                                <WebTextArea
                                                    InputName={__('Address 2')}
                                                    Id={'address_2'}
                                                    Name={'address_2'}
                                                    Error={errors.address_line2}
                                                    Value={data.address_line2}
                                                    Placeholder={__('Enter Address 2')}
                                                    Required={false}
                                                    Action={(e) =>
                                                        setData('address_line2', e.target.value)
                                                    }
                                                    Rows={1}
                                                />
                                            </div>

                                            {/* City and State */}
                                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                                <div>
                                                    <WebInput
                                                        Id={'City'}
                                                        InputName={__('City')}
                                                        Error={errors.city}
                                                        Name={'city'}
                                                        Placeholder={__('Enter City')}
                                                        Type={'text'}
                                                        Value={data.city}
                                                        Action={(e) =>
                                                            setData('city', e.target.value)
                                                        }
                                                        Required={true}
                                                    />
                                                </div>

                                                <div>
                                                    <WebInput
                                                        Id={'state'}
                                                        InputName={__('State')}
                                                        Error={errors.state}
                                                        Name={'state'}
                                                        Placeholder={__('Enter State')}
                                                        Type={'text'}
                                                        Value={data.state}
                                                        Action={(e) =>
                                                            setData('state', e.target.value)
                                                        }
                                                        Required={true}
                                                    />
                                                </div>
                                            </div>

                                            {/* Postal Code and Country ID */}
                                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                                <div>
                                                    <WebInput
                                                        Id={'postal_code'}
                                                        InputName={__('Postal Code')}
                                                        Error={errors.postal_code}
                                                        Name={'postal_code'}
                                                        Placeholder={__('Enter Postal Code')}
                                                        Type={'text'}
                                                        Value={data.postal_code}
                                                        Action={(e) =>
                                                            setData('postal_code', e.target.value)
                                                        }
                                                        Required={true}
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-end gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setIsCreateShippingAddressModalOpen(false)
                                                    }
                                                    className="h-[50px] w-[180px] rounded-md bg-surface-2-light text-main-text-light transition-all hover:bg-surface-3-light dark:bg-surface-3-dark dark:text-sub-text-dark dark:hover:bg-surface-3-dark/80"
                                                >
                                                    {__('Cancel')}
                                                </button>

                                                <button
                                                    type="submit"
                                                    disabled={
                                                        processing ||
                                                        isCreateShippingAddressButtonDisabled
                                                    }
                                                    className={`tetx-md flex h-[50px] w-[180px] items-center justify-center gap-2 rounded-md bg-black font-semibold text-white transition-all hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/80 ${(processing || isCreateShippingAddressButtonDisabled) && 'cursor-not-allowed opacity-25 dark:opacity-40'}`}
                                                >
                                                    {processing && (
                                                        <Spinner customSize={'size-5'} />
                                                    )}
                                                    {__('Save Changes')}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        ),
                        document.body,
                    )}
                </>
            )}

            {/* Edit Shipping Address Modal */}
            {isEditShippingAddressModalOpen && (
                <>
                    {createPortal(
                        windowSize.width > 1024 ? (
                            // PC VERSION
                            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                                {/* Backdrop */}
                                <div
                                    className="fixed inset-0 transition-opacity duration-300 bg-black/30"
                                    onClick={() => {
                                        setIsEditShippingAddressModalOpen(false);
                                        setData({
                                            country_id: '',
                                            name: '',
                                            phone: '',
                                            state: '',
                                            city: '',
                                            postal_code: '',
                                            address_line1: '',
                                            address_line2: '',
                                        });
                                    }}
                                />

                                {/* Modal Card */}
                                <div className="relative z-10 w-full max-w-5xl p-6 pb-1 bg-white border rounded-md border-surface-1-light text-main-text-light dark:border-surface-3-dark dark:bg-surface-1-dark dark:text-main-text-dark">

                                    <div className='p-6'>
                                        {/* Header */}
                                        <div className="flex items-center justify-between pb-4">
                                            <h2 className="text-xl font-semibold tracking-tight text-main-text-light dark:text-main-text-dark">
                                                {__(' Edit Shipping Address')}
                                            </h2>
                                        </div>

                                        {/* Content */}
                                        <div className="mt-6 max-h-[80vh] overflow-y-auto pr-2">
                                            <form
                                                onSubmit={handleUpdateShippingAddress}
                                                className="mb-10 space-y-5"
                                            >
                                                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                                                    {/* Name */}
                                                    <div>
                                                        <WebInput
                                                            Id={'name'}
                                                            InputName={__('Name')}
                                                            Error={errors.name}
                                                            Name={'name'}
                                                            Placeholder={__('Enter Full Name')}
                                                            Type={'text'}
                                                            Value={data.name}
                                                            Action={(e) =>
                                                                setData('name', e.target.value)
                                                            }
                                                            Required={true}
                                                        />
                                                    </div>

                                                    {/* Phone */}
                                                    <div>
                                                        <WebInput
                                                            Id={'phone'}
                                                            InputName={__('Phone')}
                                                            Error={errors.phone}
                                                            Name={'phone'}
                                                            Placeholder={__('Enter Phone')}
                                                            Type={'text'}
                                                            Value={data.phone}
                                                            Action={(e) =>
                                                                setData('phone', e.target.value)
                                                            }
                                                            Required={true}
                                                        />
                                                    </div>
                                                    {/* Country */}
                                                    <div>
                                                        <WebSelectInput
                                                            InputName={__('Country')}
                                                            Id={'country_id'}
                                                            Name={'country_id'}
                                                            Value={data.country_id}
                                                            Required={true}
                                                            Action={(value) =>
                                                                setData('country_id', value)
                                                            }
                                                            items={countries}
                                                            itemKey={'name'}
                                                            Error={errors.country_id}
                                                            Placeholder={__('Select Country')}
                                                            customPlaceHolder={true}
                                                        />
                                                    </div>

                                                    {/* Address Line 1 */}
                                                    <div className="col-span-2">
                                                        <WebTextArea
                                                            InputName={__('Address 1')}
                                                            Id={'address_1'}
                                                            Name={'address_1'}
                                                            Error={errors.address_line1}
                                                            Value={data.address_line1}
                                                            Required={true}
                                                            Placeholder={__('Enter Address 1')}
                                                            Action={(e) =>
                                                                setData('address_line1', e.target.value)
                                                            }
                                                            Rows={1}
                                                        />
                                                    </div>

                                                    {/* Address Line 2 */}
                                                    <div className="col-span-2">
                                                        <WebTextArea
                                                            InputName={__('Address 2')}
                                                            Id={'address_2'}
                                                            Name={'address_2'}
                                                            Error={errors.address_line2}
                                                            Placeholder={__('Enter Address 2')}
                                                            Value={data.address_line2}
                                                            Required={false}
                                                            Action={(e) =>
                                                                setData('address_line2', e.target.value)
                                                            }
                                                            Rows={1}
                                                        />
                                                    </div>

                                                    {/* City and State */}
                                                    <div>
                                                        <WebInput
                                                            Id={'City'}
                                                            InputName={__('City')}
                                                            Error={errors.city}
                                                            Name={'city'}
                                                            Placeholder={__('Enter City')}
                                                            Type={'text'}
                                                            Value={data.city}
                                                            Action={(e) =>
                                                                setData('city', e.target.value)
                                                            }
                                                            Required={true}
                                                        />
                                                    </div>

                                                    <div>
                                                        <WebInput
                                                            Id={'state'}
                                                            InputName={__('State')}
                                                            Error={errors.state}
                                                            Name={'state'}
                                                            Placeholder={__('Enter State')}
                                                            Type={'text'}
                                                            Value={data.state}
                                                            Action={(e) =>
                                                                setData('state', e.target.value)
                                                            }
                                                            Required={true}
                                                        />
                                                    </div>

                                                    {/* Postal Code and Country ID */}
                                                    <div>
                                                        <WebInput
                                                            Id={'postal_code'}
                                                            InputName={__('Postal Code')}
                                                            Error={errors.postal_code}
                                                            Name={'postal_code'}
                                                            Placeholder={__('Enter Postal Code')}
                                                            Type={'text'}
                                                            Value={data.postal_code}
                                                            Action={(e) =>
                                                                setData('postal_code', e.target.value)
                                                            }
                                                            Required={true}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-end gap-3">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setIsEditShippingAddressModalOpen(false);
                                                            setData({
                                                                country_id: '',
                                                                name: '',
                                                                phone: '',
                                                                state: '',
                                                                city: '',
                                                                postal_code: '',
                                                                address_line1: '',
                                                                address_line2: '',
                                                            });
                                                        }}
                                                        className="h-[50px] w-[180px] rounded-md bg-surface-2-light text-main-text-light transition-all hover:bg-surface-3-light dark:bg-surface-3-dark dark:text-sub-text-dark dark:hover:bg-surface-3-dark/80"
                                                    >
                                                        {__('Cancel')}
                                                    </button>

                                                    <button
                                                        type="submit"
                                                        disabled={
                                                            processing ||
                                                            isUpdateShippingAddressButtonDisabled
                                                        }
                                                        className={`text-md flex h-[50px] w-[180px] items-center justify-center gap-2 rounded-md bg-main-text-light font-semibold text-main-text-dark transition-all hover:bg-main-text-light/80 dark:bg-main-text-dark dark:text-main-text-light dark:hover:bg-main-text-dark/80 ${(processing || isUpdateShippingAddressButtonDisabled) && 'cursor-not-allowed opacity-25 dark:opacity-40'}`}
                                                    >
                                                        {processing && (
                                                            <Spinner customSize={'size-5'} />
                                                        )}
                                                        {__('Save Changes')}
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            // MOBILE VERSION
                            <div className="fixed inset-0 z-50 bg-black">
                                {/* Backdrop */}
                                <div className="absolute inset-0 bg-black/70"></div>

                                {/* Fullscreen slide-over */}
                                <div className="relative z-10 flex h-[100dvh] w-full flex-col overflow-y-auto border border-surface-1-light bg-backgroundLight text-main-text-light dark:border-surface-3-dark dark:bg-backgroundDark dark:text-main-text-dark">
                                    {/* Top Bar */}
                                    <div className="flex items-center justify-center px-4 py-3">
                                        <button
                                            onClick={() => {
                                                setIsEditShippingAddressModalOpen(false);
                                                setData({
                                                    country_id: '',
                                                    name: '',
                                                    phone: '',
                                                    state: '',
                                                    city: '',
                                                    postal_code: '',
                                                    address_line1: '',
                                                    address_line2: '',
                                                });
                                            }}
                                            className="absolute p-1 text-black rounded-full left-4 dark:text-main-text-dark"
                                        >
                                            <ChevronLeft />
                                        </button>

                                        <h2 className="mx-10 text-xl font-semibold tracking-tight text-main-text-light dark:text-main-text-dark">
                                            {__('Edit Shipping Address')}
                                        </h2>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 p-4 space-y-6">
                                        <form
                                            onSubmit={handleUpdateShippingAddress}
                                            className="mb-24 space-y-5"
                                        >
                                            {/* Name */}
                                            <div>
                                                <WebInput
                                                    Id={'name'}
                                                    InputName={__('Name')}
                                                    Error={errors.name}
                                                    Name={'name'}
                                                    Placeholder={__('Enter Full Name')}
                                                    Type={'text'}
                                                    Value={data.name}
                                                    Action={(e) => setData('name', e.target.value)}
                                                    Required={true}
                                                />
                                            </div>

                                            {/* Phone */}
                                            <div>
                                                <WebInput
                                                    Id={'phone'}
                                                    InputName={__('Phone')}
                                                    Error={errors.phone}
                                                    Name={'phone'}
                                                    Placeholder={__('Enter Phone')}
                                                    Type={'text'}
                                                    Value={data.phone}
                                                    Action={(e) => setData('phone', e.target.value)}
                                                    Required={true}
                                                />
                                            </div>

                                            <div>
                                                <WebSelectInput
                                                    InputName={__('Country')}
                                                    Id={'country_id'}
                                                    Name={'country_id'}
                                                    Value={data.country_id}
                                                    Required={true}
                                                    Action={(value) => setData('country_id', value)}
                                                    items={countries}
                                                    itemKey={'name'}
                                                    Error={errors.country_id}
                                                    Placeholder={__('Select Country')}
                                                    customPlaceHolder={true}
                                                />
                                            </div>

                                            {/* Address Line 1 */}
                                            <div>
                                                <WebTextArea
                                                    InputName={__('Address 1')}
                                                    Id={'address_1'}
                                                    Name={'address_1'}
                                                    Error={errors.address_line1}
                                                    Placeholder={__('Enter Address 1')}
                                                    Value={data.address_line1}
                                                    Required={true}
                                                    Action={(e) =>
                                                        setData('address_line1', e.target.value)
                                                    }
                                                    Rows={1}
                                                />
                                            </div>

                                            {/* Address Line 2 */}
                                            <div>
                                                <WebTextArea
                                                    InputName={__('Address 2')}
                                                    Id={'address_2'}
                                                    Name={'address_2'}
                                                    Error={errors.address_line2}
                                                    Value={data.address_line2}
                                                    Placeholder={__('Enter Address 2')}
                                                    Required={false}
                                                    Action={(e) =>
                                                        setData('address_line2', e.target.value)
                                                    }
                                                    Rows={1}
                                                />
                                            </div>

                                            {/* City and State */}
                                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                                <div>
                                                    <WebInput
                                                        Id={'City'}
                                                        InputName={__('City')}
                                                        Error={errors.city}
                                                        Name={'city'}
                                                        Placeholder={__('Enter City')}
                                                        Type={'text'}
                                                        Value={data.city}
                                                        Action={(e) =>
                                                            setData('city', e.target.value)
                                                        }
                                                        Required={true}
                                                    />
                                                </div>

                                                <div>
                                                    <WebInput
                                                        Id={'state'}
                                                        InputName={__('State')}
                                                        Error={errors.state}
                                                        Name={'state'}
                                                        Placeholder={__('Enter State')}
                                                        Type={'text'}
                                                        Value={data.state}
                                                        Action={(e) =>
                                                            setData('state', e.target.value)
                                                        }
                                                        Required={true}
                                                    />
                                                </div>
                                            </div>

                                            {/* Postal Code and Country ID */}
                                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                                <div>
                                                    <WebInput
                                                        Id={'postal_code'}
                                                        InputName={__('Postal Code')}
                                                        Error={errors.postal_code}
                                                        Name={'postal_code'}
                                                        Placeholder={__('Enter Postal Code')}
                                                        Type={'text'}
                                                        Value={data.postal_code}
                                                        Action={(e) =>
                                                            setData('postal_code', e.target.value)
                                                        }
                                                        Required={true}
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-end gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setIsEditShippingAddressModalOpen(false);
                                                        setData({
                                                            country_id: '',
                                                            name: '',
                                                            phone: '',
                                                            state: '',
                                                            city: '',
                                                            postal_code: '',
                                                            address_line1: '',
                                                            address_line2: '',
                                                        });
                                                    }}
                                                    className="h-[50px] w-[180px] rounded-md bg-surface-2-light text-main-text-light transition-all hover:bg-surface-3-light dark:bg-surface-3-dark dark:text-sub-text-dark dark:hover:bg-surface-3-dark/80"
                                                >
                                                    {__('Cancel')}
                                                </button>

                                                <button
                                                    type="submit"
                                                    disabled={
                                                        processing ||
                                                        isUpdateShippingAddressButtonDisabled
                                                    }
                                                    className={`tetx-md flex h-[50px] w-[180px] items-center justify-center gap-2 rounded-md bg-black font-semibold text-white transition-all hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/80 ${(processing || isUpdateShippingAddressButtonDisabled) && 'cursor-not-allowed opacity-25 dark:opacity-40'}`}
                                                >
                                                    {processing && (
                                                        <Spinner customSize={'size-5'} />
                                                    )}
                                                    {__('Save Changes')}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        ),
                        document.body,
                    )}
                </>
            )}
        </>
    );
}



// Secondary Payment Option Select modal
function SecondaryPaymentModal({
    isOpen,
    onClose,
    availablePoints,
    totalAmount,
    remainingAmount,
    onSelectPayment,
    selectedPayment,
    currency,
    handlePlace,
    windowSize,
    processingOrder,
    __
}) {
    if (!isOpen) return null;

    const paymentOptions = [
        {
            id: 'crypto',
            name: __('Crypto Payment'),
            icon: <Bitcoin />,
            iconBg: 'bg-[#EE7B1A]',
            description: __('Network fees may apply'),
        },
        {
            id: 'bank_transfer',
            name: __('Direct Bank Transfer'),
            icon: <Landmark />,
            iconBg: 'bg-[#00469B]',
            description: __('Manual verification required'),
        },
    ];


    // // Handle browser/mobile back button to close modals
    useEffect(() => {
        const handlePopState = (e) => {
            if (isOpen) {
                onClose();
                return;
            }
        };

        const preventInertiaNavigation = (event) => {
            const pathname = event.detail?.visit?.url?.pathname || '';
            if (pathname.includes("/shipping-addresses") || pathname.includes('/shipping-address-status-toggle')) {
                return;
            }

            if (isOpen) {
                event.preventDefault();
            }
        };
        window.addEventListener('popstate', handlePopState);
        const removeRouterEvent = router.on('before', preventInertiaNavigation);

        // Cleanup
        return () => {
            window.removeEventListener('popstate', handlePopState);
            if (removeRouterEvent) removeRouterEvent();
        };
    }, [isOpen]);


    useEffect(() => {
        if (isOpen) {
            const url = new URL(window.location.href);
            url.searchParams.set('secondary-payment', 'true');
            window.history.pushState({}, '', url.toString());
        }


        return () => {
            if (!isOpen) {
                window.history.pushState(
                    { fromModal: true },
                    '',
                    route('website.carts.index')
                );
            }

            window.history.replaceState(
                { fromModal: true },
                '',
                route('website.checkout.index')
            );
        }
    }, [isOpen]);

    return (
        <>
            {createPortal(
                windowSize.width > 1024 ? (
                    // PC VERSION
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 transition-opacity duration-300 bg-black/30"
                            onClick={onClose}
                        />

                        {/* Modal Card */}
                        <div className="relative z-10 w-full max-w-5xl p-6 pb-1 bg-white border rounded-md border-surface-3-light text-main-text-light dark:border-surface-3-dark dark:bg-surface-1-dark dark:text-main-text-dark">
                            {/* Header */}
                            <div className='p-6'>
                                <div className="flex items-center justify-between">
                                    <h2 className="mb-4 text-[20px] font-semibold text-main-text-light dark:text-main-text-dark">
                                        {__('Select Secondary Payment')}
                                    </h2>

                                    <button
                                        onClick={onClose}
                                        className="p-2 transition-colors text-main-text-light dark:text-main-text-dark hover:text-main-text-light/80 dark:hover:text-main-text-dark/80"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Content */}
                                <div className="mt-6 max-h-[80vh] overflow-y-auto pr-2">
                                    <div className="mb-10 space-y-6">
                                        {/* Points Usage Info */}
                                        <div className="p-4 border rounded-md border-surface-3-light bg-backgroundLight dark:bg-surface-3-dark dark:border-surface-3-dark">
                                            <div className="flex items-start gap-3">
                                                <div className="flex-shrink-0 mt-0.5">
                                                    <span className="text-xl">
                                                        <Star />
                                                    </span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-sm font-medium text-main-text-light dark:text-main-text-dark">
                                                        {__('Your Points Will Be Applied')}
                                                    </h3>
                                                    <p className="mt-1 text-sm text-main-text-light dark:text-main-text-dark">
                                                        <span className="font-medium text-blue-600 dark:text-blue-400">
                                                            {availablePoints} {__('points')}
                                                        </span>{' '}
                                                        {__('will be deducted from your account. You need to pay the remaining amount using a secondary payment method.')}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Payment Breakdown */}
                                        <div className="p-4 space-y-3 border rounded-md border-surface-3-light bg-backgroundLight dark:bg-surface-3-dark dark:border-surface-3-dark">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-sm font-semibold text-main-text-light dark:text-main-text-dark">
                                                    {__('Total Amount')}
                                                </span>
                                                <span className="font-semibold text-[18px] text-main-text-light dark:text-main-text-dark">
                                                    {currency?.symbol}{totalAmount}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-sm font-semibold text-main-text-light dark:text-main-text-dark">
                                                    {__('Points Discount')}
                                                </span>
                                                <span className="font-semibold text-[18px] text-main-text-light dark:text-main-text-dark">
                                                    -{currency?.symbol}{(totalAmount - remainingAmount).toFixed(2)}
                                                </span>
                                            </div>
                                            <div className="pt-3 border-t border-surface-2-light dark:border-surface-3-dark">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-semibold text-main-text-light dark:text-main-text-dark">
                                                        {__('Remaining to Pay')}
                                                    </span>
                                                    <span className="font-semibold text-[18px] text-main-text-light dark:text-main-text-dark">
                                                        {currency?.symbol}{remainingAmount}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Payment Options */}
                                        <div className="space-y-4">
                                            <label className="block text-sm font-semibold text-main-text-light dark:text-main-text-dark">
                                                {__('Choose Payment Method')}
                                            </label>

                                            <div className="space-y-3">
                                                {paymentOptions.map((option) => (
                                                    <label
                                                        key={option.id}
                                                        className={`flex cursor-pointer items-center gap-3 rounded-md px-4 py-3 transition ${selectedPayment === option.id
                                                            ? 'bg-[#eaeaea] dark:bg-surface-2-dark'
                                                            : 'dark:hover:bg-surface-2-dark lg:hover:bg-[#eaeaea]'
                                                            }`}
                                                    >
                                                        <input
                                                            type="radio"
                                                            name="payment_method"
                                                            value="crypto"
                                                            checked={selectedPayment === option.id}
                                                            onChange={(e) => onSelectPayment(option.id)}
                                                            className="sr-only peer"
                                                        />

                                                        {/* outer circle */}
                                                        <span className="flex items-center justify-center w-5 h-5 border border-black rounded-full">
                                                            {/* inner white space */}
                                                            <span className="flex items-center justify-center w-4 h-4 bg-white rounded-full">
                                                                {/* black dot */}
                                                                {selectedPayment === option.id && (
                                                                    <span className="w-3 h-3 bg-black rounded-full" />
                                                                )}
                                                            </span>
                                                        </span>

                                                        <div className="flex items-center gap-3">
                                                            <div className={`flex items-center justify-center p-2 text-center text-gray-700 bg-gray-200 rounded-full`}>
                                                                <span className="w-6 h-6">{option.icon}</span>
                                                            </div>

                                                            <div>
                                                                <p className="text-[14px] font-semibold text-main-text-light dark:text-main-text-dark">
                                                                    {__(option.name)}{' '}
                                                                    <span className="text-[14px] font-normal">
                                                                        ({__(option.description)})
                                                                    </span>
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-end gap-3">
                                            <button
                                                type="button"
                                                onClick={onClose}
                                                className="h-[50px] w-[180px] rounded-md bg-surface-2-light text-main-text-light transition-all hover:bg-surface-3-light dark:bg-surface-3-dark dark:text-sub-text-dark dark:hover:bg-surface-3-dark/80"
                                            >
                                                {__('Cancel')}
                                            </button>

                                            {selectedPayment && (
                                                <button
                                                    type="button"
                                                    onClick={handlePlace}
                                                    className="text-md flex h-[50px] w-[180px] items-center justify-center gap-2 rounded-md  font-semibold text-main-text-dark transition-all bg-[#282828] lg:hover:bg-[#282828]/80 dark:bg-main-text-dark dark:text-main-text-light dark:lg:hover:bg-main-text-dark/80"
                                                >
                                                    {processingOrder ? (
                                                        <div className="flex items-center justify-center gap-2">
                                                            <Spinner customSize={'size-5'} />
                                                            <span>{__('Processing...')}</span>
                                                        </div>
                                                    ) : (
                                                        __('Confirm & Pay')
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                ) : (
                    // MOBILE VERSION
                    <div className="fixed inset-0 z-50 bg-black">
                        {/* Backdrop */}
                        <div className="absolute inset-0 bg-black/70"></div>

                        {/* Fullscreen slide-over */}
                        <div className="relative z-10 flex h-[100dvh] w-full flex-col overflow-y-auto bg-white border rounded-md border-surface-3-light text-main-text-light dark:border-surface-3-dark dark:bg-surface-1-dark dark:text-main-text-dark">
                            {/* Top Bar */}
                            <div className="flex items-center justify-center px-4 py-3">
                                <button
                                    onClick={onClose}
                                    className="absolute p-1 rounded-full left-4 text-main-text-light dark:text-main-text-dark"
                                >
                                    <ChevronLeft />
                                </button>

                                <h2 className="mx-10 text-xl font-semibold tracking-tight text-main-text-light dark:text-main-text-dark">
                                    {__('Select Secondary Payment')}
                                </h2>
                            </div>

                            {/* Content */}
                            <div className="flex-1 p-4 space-y-6">
                                <div className="mb-24 space-y-6">
                                    {/* Points Usage Info */}
                                    <div className="p-4 border rounded-md border-surface-3-light bg-backgroundLight dark:bg-surface-3-dark dark:border-surface-3-dark">
                                        <div className="flex items-start gap-3">
                                            <div className="flex-shrink-0 mt-0.5">
                                                <span className="text-xl">
                                                    <Star />
                                                </span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-sm font-medium text-main-text-light dark:text-main-text-dark">
                                                    {__('Your Points Will Be Applied')}
                                                </h3>
                                                <p className="mt-1 text-sm text-main-text-light dark:text-main-text-dark">
                                                    <span className="font-medium text-blue-600 dark:text-blue-400">
                                                        {availablePoints} {__('points')}
                                                    </span>{' '}
                                                    {__('will be deducted from your account. You need to pay the remaining amount using a secondary payment method.')}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Payment Breakdown */}
                                    <div className="p-4 space-y-3 border rounded-md border-surface-3-light bg-backgroundLight dark:bg-surface-3-dark dark:border-surface-3-dark">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-sm font-semibold text-main-text-light dark:text-main-text-dark">
                                                {__('Total Amount')}
                                            </span>
                                            <span className="font-semibold text-[18px] text-main-text-light dark:text-main-text-dark">
                                                {currency?.symbol}{totalAmount}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-sm font-semibold text-main-text-light dark:text-main-text-dark">
                                                {__('Points Discount')}
                                            </span>
                                            <span className="font-semibold text-[18px] text-main-text-light dark:text-main-text-dark">
                                                -{currency?.symbol}{(totalAmount - remainingAmount).toFixed(2)}
                                            </span>
                                        </div>
                                        <div className="pt-3 border-t border-surface-2-light dark:border-surface-3-dark">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-semibold text-main-text-light dark:text-main-text-dark">
                                                    {__('Remaining to Pay')}
                                                </span>
                                                <span className="font-semibold text-[18px] text-main-text-light dark:text-main-text-dark">
                                                    {currency?.symbol}{remainingAmount}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Payment Options */}
                                    <div className="space-y-4">
                                        <label className="block text-sm font-semibold text-main-text-light dark:text-main-text-dark">
                                            {__('Choose Payment Method')}
                                        </label>

                                        <div className="space-y-3">
                                            {paymentOptions.map((option) => (
                                                <label
                                                    key={option.id}
                                                    className={`flex cursor-pointer items-center gap-3 rounded-md px-4 py-3 transition ${selectedPayment === option.id
                                                        ? 'bg-[#eaeaea] dark:bg-surface-2-dark'
                                                        : ''
                                                        }`}
                                                >
                                                    <input
                                                        type="radio"
                                                        name="payment_method"
                                                        value="crypto"
                                                        checked={selectedPayment === option.id}
                                                        onChange={(e) => onSelectPayment(option.id)}
                                                        className="sr-only peer"
                                                    />

                                                    {/* outer circle */}
                                                    <span className="flex items-center justify-center w-5 h-5 border border-black rounded-full">
                                                        {/* inner white space */}
                                                        <span className="flex items-center justify-center w-4 h-4 bg-white rounded-full">
                                                            {/* black dot */}
                                                            {selectedPayment === option.id && (
                                                                <span className="w-3 h-3 bg-black rounded-full" />
                                                            )}
                                                        </span>
                                                    </span>

                                                    <div className="flex items-center gap-3">
                                                        <div className={`flex items-center justify-center p-2 text-center text-gray-700 bg-gray-200 rounded-full`}>
                                                            <span className="w-6 h-6">{option.icon}</span>
                                                        </div>

                                                        <div>
                                                            <p className="text-[14px] font-semibold text-main-text-light dark:text-main-text-dark">
                                                                {__(option.name)}{' '}
                                                                <span className="text-[14px] font-normal">
                                                                    ({__(option.description)})
                                                                </span>
                                                            </p>
                                                        </div>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-end gap-3">
                                        <button
                                            type="button"
                                            onClick={onClose}
                                            className="h-[50px] w-[180px] rounded-md bg-surface-2-light text-main-text-light transition-all hover:bg-surface-3-light dark:bg-surface-3-dark dark:text-sub-text-dark dark:hover:bg-surface-3-dark/80"
                                        >
                                            {__('Cancel')}
                                        </button>

                                        {selectedPayment && (
                                            <button
                                                type="button"
                                                onClick={handlePlace}
                                                className="text-md flex h-[50px] w-[180px] items-center justify-center gap-2 rounded-md  font-semibold text-main-text-dark transition-all bg-[#282828] lg:hover:bg-[#282828]/80 dark:bg-main-text-dark dark:text-main-text-light dark:lg:hover:bg-main-text-dark/80"
                                            >
                                                {processingOrder ? (
                                                    <div className="flex items-center justify-center gap-2">
                                                        <Spinner customSize={'size-5'} />
                                                        <span>{__('Processing...')}</span>
                                                    </div>
                                                ) : (
                                                    __('Confirm & Pay')
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ),
                document.body,
            )}
        </>
    );
}



