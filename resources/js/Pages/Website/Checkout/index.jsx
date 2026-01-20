import React, { useState, useEffect } from 'react';
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
import WebTextArea from '@/Components/WebTextArea';
import PrimaryButton from '@/Components/PrimaryButton';
import { useTranslation } from '@/Hooks/useTranslation';
import WebSelectInput from '@/Components/WebSelectInput';


export default function Checkout({ cart_items, refferalSessionData, shipping_address, total_summary, meta_usernames, is_eligible_for_social_message, addon_items, countries }) {
    const { currency, auth } = usePage().props;
    const windowSize = useWindowSize();



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
    const [addingShippingAddress, setAddingShippingAddress] = useState(false);

    const [error, setError] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
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



    const hasSavedShippingAddress = !!shipping_address;

    const isShippingFormComplete = () => {
        return (
            shippingInfo.name.trim() !== '' &&
            shippingInfo.phone.trim() !== '' &&
            shippingInfo.address_line1.trim() !== '' &&
            shippingInfo.city.trim() !== '' &&
            shippingInfo.postal_code.trim() !== '' &&
            shippingInfo.country_id !== '' &&
            shippingInfo.state.trim() !== ''
        );
    };


    const handleShippingInfoChange = (e) => {
        if (hasSavedShippingAddress) return;

        const { name, value } = e.target;
        setShippingInfo((prev) => ({
            ...prev,
            [name]: value,
        }));
    };


    const handleAddShippingAddress = (e) => {
        e.preventDefault();
        setAddingShippingAddress(true);
        router.post(route('website.shipping-addresses.store'), shippingInfo, {
            preserveScroll: true,
            preserveState: true,
            onFinish: () => {
                setAddingShippingAddress(false);
            },

        });
    };



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

    const handleApplyReferal = async () => {
        if (referalCode === '') {
            setError(__('Referal Code is Required'));
            setTimeout(() => {
                setError(null);
            }, 2000);
            return;
        }

        if (referalCode.trim()) {
            const response = await applyReferal(referalCode);
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


    const [summary, setSummary] = useState(total_summary || [])

    const handlePlaceOrder = async () => {
        // Validate shipping info
        const requiredFields = ['name', 'phone', 'address_line1', 'city', 'country_id', 'state', 'postal_code'];
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

        // Your order processing logic here
        await axios
            .post(route('website.checkout.store'), {
                shipping_info: shippingInfo,
                payment_method: paymentMethod,
                referal_code: referalData.referal_code,
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


    const calculateShippingCost = (shipping_fee, product, quantity) => {
        if (!shipping_fee) return 0;

        const { value_type, default_value } = shipping_fee;

        if (!default_value || default_value === 0) return 0;


        if (value_type === 'fixed') {
            return parseFloat((Number(default_value) * Number(quantity))).toFixed(2);
        }


        if (value_type === 'percentage') {
            const shippingCost = (product.selling_info?.total_price * default_value) / 100;
            return parseFloat(Number(shippingCost) * Number(quantity)).toFixed(2)

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
            <Head title={__("Checkout", true)} />

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
                <div
                    className={`max-w-8xl mx-auto sm:px-6 lg:px-8 ${windowSize.width <= 1024 && 'mb-20'}`}
                >
                    <Link
                        href={route('website.carts.index')}
                        className="inline-flex items-center gap-2 my-4 text-sm font-medium transition-colors text-main-text-light hover:text-sub-text-light dark:text-main-text-dark dark:hover:text-sub-text-dark"
                    >
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
                                d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                            />
                        </svg>
                        {__('Back to Cart')}
                    </Link>

                    {/* Header */}
                    <div className="px-4 mb-6 sm:px-0">
                        <h1 className="text-xl font-semibold text-main-text-light dark:text-main-text-dark sm:text-3xl">
                            {__('Checkout')}
                        </h1>
                        <p className="mt-1 text-sm text-sub-text-light dark:text-sub-text-dark">
                            {__('Complete your order by providing your shipping information')}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                        {/* Left Section: Shipping & Payment */}
                        <div className="space-y-6 lg:col-span-2">
                            {/* Shipping Information */}
                            <ShippingForm
                                isShippingFormComplete={isShippingFormComplete}
                                setShippingInfo={setShippingInfo}
                                shippingInfo={shippingInfo}
                                hasSavedShippingAddress={hasSavedShippingAddress}
                                handleShippingInfoChange={handleShippingInfoChange}
                                countries={countries}
                                handleAddShippingAddress={handleAddShippingAddress}
                                addingShippingAddress={addingShippingAddress}

                                __={__}
                            />

                            {/* Payment Method */}
                            <PaymentMethod
                                paymentMethod={paymentMethod}
                                setPaymentMethod={setPaymentMethod}
                                __={__}
                            />

                            {/* Order Items Summary (Mobile Only) */}
                            {windowSize.width <= 1024 && (
                                <OrderItemsSummary
                                    cart_items={cart_items}
                                    currency={currency}
                                    __={__}
                                    addon_items={addon_items}
                                    calculateImportCost={calculateImportCost}
                                    calculateShippingCost={calculateShippingCost}

                                />
                            )}
                        </div>

                        {/* Right Section: Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="sticky space-y-4 top-8">
                                {/* Order Items (Desktop Only) */}
                                {windowSize.width > 1024 && (
                                    <OrderItemsSummary
                                        cart_items={cart_items}
                                        currency={currency}
                                        addon_items={addon_items}
                                        __={__}
                                        calculateImportCost={calculateImportCost}
                                        calculateShippingCost={calculateShippingCost}
                                    />
                                )}

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


                                {/* Social Message Buttons */}
                                {is_eligible_for_social_message && (
                                    <SocialMessageButtons user={auth?.user} meta_usernames={meta_usernames} __={__} />

                                )}

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}

// Shipping Form Component
function ShippingForm(
    { setShippingInfo,
        shippingInfo,
        __,
        isShippingFormComplete,
        hasSavedShippingAddress,
        handleShippingInfoChange,
        countries,
        handleAddShippingAddress,
        addingShippingAddress

    }
) {
    return (
        <div className="p-6 border rounded-md bg-main-text-dark border-surface-3-light dark:border-surface-3-dark dark:bg-surface-1-dark">
            <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 mb-6 text-lg font-semibold text-main-text-light dark:text-main-text-dark">

                    {__('Shipping Information')}
                </h2>

                <Link
                    href={route('website.shipping-addresses.index')}
                    className="font-medium text-main-text-light hover:text-sub-text-light text-md dark:hover:text-sub-text-dark dark:text-main-text-dark"
                >
                    {__('Edit Information')}
                </Link>
            </div>

            <form onSubmit={handleAddShippingAddress} className="space-y-4">

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>

                        <WebInput
                            InputName={__('Full Name')}
                            Id={'full_name'}
                            Name={'name'}
                            Disabled={hasSavedShippingAddress}
                            Action={handleShippingInfoChange}
                            Placeholder={"John Doe"}
                            Value={shippingInfo.name}
                            Required={true}
                            Type={'text'}
                            ClassName={"dark:bg-surface-2-dark dark:border-surface-3-dark"}

                        />
                    </div>

                    <div>
                        <WebInput
                            InputName={__("Phone Number")}
                            Id={'phone'}
                            Name={'phone'}
                            Disabled={hasSavedShippingAddress}
                            Placeholder={"+1 (555) 000-0000"}
                            Action={handleShippingInfoChange}
                            Type={"tel"}
                            Value={shippingInfo.phone}
                            Required={true}
                            ClassName={"dark:bg-surface-2-dark dark:border-surface-3-dark"}
                        />
                    </div>
                </div>


                <div>
                    <WebTextArea
                        InputName={__("Address 1")}
                        Id={'address_line1'}
                        Name={'address_line1'}
                        Disabled={hasSavedShippingAddress}
                        Action={handleShippingInfoChange}
                        Placeholder={"123 Main Street, Apt 4B"}
                        Value={shippingInfo.address_line1}
                        Required={true}
                        Rows={1}
                        ClassName={"dark:bg-surface-2-dark dark:border-surface-3-dark"}

                    />
                </div>


                <div>
                    <WebTextArea
                        InputName={__("Address 2")}
                        Id={'address_line2'}
                        Name={'address_line2'}
                        Disabled={hasSavedShippingAddress}
                        Action={handleShippingInfoChange}
                        Placeholder={"123 Main Street, Apt 4B"}
                        Value={shippingInfo.address_line2}
                        Required={false}
                        Rows={1}
                        ClassName={"dark:bg-surface-2-dark dark:border-surface-3-dark"}

                    />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <WebInput
                            InputName={__("City")}
                            Id={'city'}
                            Name={'city'}
                            Disabled={hasSavedShippingAddress}
                            Action={handleShippingInfoChange}
                            Placeholder={"New York"}
                            Type={"text"}
                            Value={shippingInfo.city}
                            Required={true}
                            ClassName={"dark:bg-surface-2-dark dark:border-surface-3-dark"}
                        />
                    </div>

                    <div>

                        <WebInput
                            InputName={__("Postal Code")}
                            Id={'postal_code'}
                            Name={'postal_code'}
                            Disabled={hasSavedShippingAddress}
                            Action={handleShippingInfoChange}
                            Placeholder={"10001"}
                            Type={"text"}
                            Value={shippingInfo.postal_code}
                            Required={true}
                            ClassName={"dark:bg-surface-2-dark dark:border-surface-3-dark"}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>

                        <WebInput
                            InputName={__("State")}
                            Id={'state'}
                            Name={'state'}
                            Disabled={hasSavedShippingAddress}
                            Action={handleShippingInfoChange}
                            Placeholder={"New York"}
                            Type={"text"}
                            Value={shippingInfo.state}
                            Required={true}
                            ClassName={"dark:bg-surface-2-dark dark:border-surface-3-dark"}
                        />
                    </div>

                    {hasSavedShippingAddress ? (
                        <div>
                            <WebInput
                                InputName={__("Country")}
                                Id={'country'}
                                Name={'country'}
                                Disabled={hasSavedShippingAddress}
                                Placeholder={"United States"}
                                Type={"text"}
                                Value={
                                    countries.find(
                                        (country) => country.id === Number(shippingInfo.country_id)
                                    )?.name || ''
                                }
                                Required={true}
                                ClassName={"dark:bg-surface-2-dark dark:border-surface-3-dark"}
                            />
                        </div>
                    ) : (
                        <div>
                            <WebSelectInput
                                InputName={__('Country')}
                                Id={'country_id'}
                                Name={'country_id'}
                                Value={shippingInfo.country_id}
                                isDisabled={hasSavedShippingAddress}
                                Required={true}
                                Action={(value) =>
                                    setShippingInfo((prevInfo) => ({
                                        ...prevInfo,
                                        country_id: value,
                                    }))
                                }
                                items={countries}
                                itemKey={'name'}
                                Placeholder={__('Select Country')}
                                customPlaceHolder={true}
                            />
                        </div>
                    )}


                </div>

                {!hasSavedShippingAddress && isShippingFormComplete() && (
                    <div className="flex items-center justify-end gap-3">


                        <button
                            type="submit"
                            disabled={
                                (hasSavedShippingAddress && isShippingFormComplete) || (addingShippingAddress)
                            }
                            className={`text-md flex h-[50px] w-[180px] items-center justify-center gap-2 rounded-md bg-main-text-light font-semibold text-main-text-dark transition-all hover:bg-main-text-light/80 dark:bg-main-text-dark dark:text-main-text-light dark:hover:bg-main-text-dark/80 ${(hasSavedShippingAddress && isShippingFormComplete) || (addingShippingAddress) && 'cursor-not-allowed opacity-25 dark:opacity-40'}`}
                        >
                            {addingShippingAddress && (
                                <Spinner customSize={'size-5'} />
                            )}
                            {__('Save Changes')}
                        </button>
                    </div>
                )}

            </form>
        </div>
    );
}

// Payment Method Component
function PaymentMethod({ paymentMethod, setPaymentMethod, __ }) {
    return (
        <div className="p-6 border rounded-md bg-surface-1-light border-surface-3-light dark:border-surface-3-dark dark:bg-surface-1-dark">
            <h2 className="flex items-center gap-2 mb-6 text-lg font-semibold text-main-text-light dark:text-main-text-dark">

                {__('Payment Method')}
            </h2>

            <div className="space-y-3">
                {/* Bank Transfer Option */}
                <label
                    className={`flex cursor-pointer items-center gap-4 rounded-md border p-4 transition-all ${paymentMethod === 'bank_transfer'
                        ? 'border-surface-3-light dark:border-surface-3-dark bg-surface-2-light dark:bg-surface-2-dark'
                        : 'border-surface-3-light bg-surface-1-light hover:bg-surface-2-light hover:border-surface-3-light  dark:border-surface-3-dark dark:bg-surface-1-dark dark:hover:bg-surface-2-dark dark:hover:border-surface-3-dark'
                        }`}
                >
                    <input
                        type="radio"
                        name="payment_method"
                        value="bank_transfer"
                        checked={paymentMethod === 'bank_transfer'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-5 h-5 text-surface-3-light dark:text-surface-3-dark focus:ring-0 focus:ring-offset-0"
                    />
                    <div className="flex items-center justify-between flex-1">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-surface-2-light dark:bg-surface-3-dark">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="w-5 h-5 main-text-light dark:text-main-text-dark"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z"
                                    />
                                </svg>
                            </div>
                            <div>
                                <p className="font-semibold text-main-text-light dark:text-main-text-dark">
                                    {__('Direct Bank Transfer')}
                                </p>
                                <p className="text-sm text-sub-text-light dark:text-sub-text-dark">
                                    {__('Pay directly to our bank account')}
                                </p>
                            </div>
                        </div>
                    </div>
                </label>

                {/* Crypto Option */}
                <label
                    className={`flex cursor-pointer items-center gap-4 rounded-md border p-4 transition-all ${paymentMethod === 'crypto'
                        ? 'border-surface-3-light dark:border-surface-3-dark bg-surface-2-light dark:bg-surface-2-dark'
                        : 'border-surface-3-light bg-surface-1-light hover:bg-surface-2-light hover:border-surface-3-light  dark:border-surface-3-dark dark:bg-surface-1-dark dark:hover:bg-surface-2-dark dark:hover:border-surface-3-dark'
                        }`}
                >
                    <input
                        type="radio"
                        name="payment_method"
                        value="crypto"
                        checked={paymentMethod === 'crypto'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-5 h-5 text-surface-3-light dark:text-surface-3-dark focus:ring-0 focus:ring-offset-0"
                    />
                    <div className="flex items-center justify-between flex-1">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-surface-2-light dark:bg-surface-3-dark">
                                <svg
                                    className="fill-main-text-light w-7 h-7 dark:fill-main-text-dark"
                                    viewBox="0.004 0 64 64"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                >
                                    <path
                                        d="M46.11 27.441c.636-4.258-2.606-6.547-7.039-8.074l1.438-5.768-3.512-.875-1.4 5.616c-.922-.23-1.87-.447-2.812-.662l1.41-5.653-3.509-.875-1.439 5.766c-.764-.174-1.514-.346-2.242-.527l.004-.018-4.842-1.209-.934 3.75s2.605.597 2.55.634c1.422.355 1.68 1.296 1.636 2.042l-1.638 6.571c.098.025.225.061.365.117l-.37-.092-2.297 9.205c-.174.432-.615 1.08-1.609.834.035.051-2.552-.637-2.552-.637l-1.743 4.02 4.57 1.139c.85.213 1.683.436 2.502.646l-1.453 5.835 3.507.875 1.44-5.772c.957.26 1.887.5 2.797.726L27.504 50.8l3.511.875 1.453-5.823c5.987 1.133 10.49.676 12.383-4.738 1.527-4.36-.075-6.875-3.225-8.516 2.294-.531 4.022-2.04 4.483-5.157zM38.087 38.69c-1.086 4.36-8.426 2.004-10.807 1.412l1.928-7.729c2.38.594 10.011 1.77 8.88 6.317zm1.085-11.312c-.99 3.966-7.1 1.951-9.083 1.457l1.748-7.01c1.983.494 8.367 1.416 7.335 5.553z"

                                    />
                                </svg>
                            </div>
                            <div>
                                <p className="font-semibold text-main-text-light dark:text-main-text-dark">
                                    {__('Crypto Payment')}
                                </p>
                                <p className="text-sm text-sub-text-light dark:text-sub-text-dark">
                                    {__('Pay with crypto currency')}
                                </p>
                            </div>
                        </div>
                    </div>
                </label>

                {/* Points option */}
                <label
                    className={`flex cursor-pointer items-center gap-4 rounded-md border p-4 transition-all ${paymentMethod === 'points'
                        ? 'border-surface-3-light dark:border-surface-3-dark bg-surface-2-light dark:bg-surface-2-dark'
                        : 'border-surface-3-light bg-surface-1-light hover:bg-surface-2-light hover:border-surface-3-light  dark:border-surface-3-dark dark:bg-surface-1-dark dark:hover:bg-surface-2-dark dark:hover:border-surface-3-dark'
                        }`}
                >
                    <input
                        type="radio"
                        name="payment_method"
                        value="points"
                        checked={paymentMethod === 'points'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-5 h-5 text-surface-3-light dark:text-surface-3-dark focus:ring-0 focus:ring-offset-0"
                    />
                    <div className="flex items-center justify-between flex-1">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-surface-2-light dark:bg-surface-3-dark">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="w-5 h-5 text-main-text-light dark:text-main-text-dark"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M21 11.25v8.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1 0 9.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1 1 14.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z"
                                    />
                                </svg>
                            </div>
                            <div>
                                <p className="font-semibold text-main-text-light dark:text-main-text-dark">
                                    {__('Points')}
                                </p>
                                <p className="text-sm text-sub-text-light dark:text-sub-text-dark">
                                    {__('Pay directly with your points')}
                                </p>
                            </div>
                        </div>
                    </div>
                </label>
            </div>
        </div>
    );
}

// Order Items Summary Component
function OrderItemsSummary({ cart_items, currency, __, addon_items, calculateImportCost, calculateShippingCost }) {

    const generateSmartphoneURL = (smartphone, isDirect = false, isSinglePage = false) => {
        return (
            `?m-slug=${smartphone?.slug}${isSinglePage ? '&single_page=true' : ''}${isDirect ? '&direct=true' : ''}`
        );
    }

    return (
        <div className="p-6 border rounded-md bg-surface-1-light border-surface-3-light dark:border-surface-3-dark dark:bg-surface-1-dark">
            <h2 className="flex items-center gap-2 mb-4 text-lg font-semibold text-main-text-light dark:text-main-text-dark">
                {__('Order Items')} ({cart_items.length})
            </h2>

            <div className="pr-2 space-y-4 overflow-y-auto max-h-96">
                {cart_items.map((item) => {
                    const shipping_fee = calculateShippingCost(item?.smartphone?.selling_info?.shipping_fee, item?.smartphone, item?.quantity);
                    const import_tax = calculateImportCost(item?.smartphone?.selling_info?.import_tax, item?.smartphone);
                    const relatedAddons = addon_items.filter(
                        addon => addon.smartphone_id === item.smartphone_id
                    );
                    return (
                        <div
                            key={item.id}
                            className="flex gap-3 p-3 border rounded-md border-surface-3-light bg-surface-2-light dark:border-surface-3-dark dark:bg-surface-2-dark"
                        >
                            {/* IMAGE */}
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
                            <div className="flex-1">
                                <h3 className="mb-1 text-sm font-semibold text-main-text-light dark:text-main-text-dark">
                                    {item?.smartphone?.model_name?.name || 'N/A'}
                                </h3>

                                {item?.smartphone?.capacity && (
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        <span
                                            className={`inline-flex items-center rounded-md bg-surface-2-light py-0.5 text-xs font-medium text-sub-text-light dark:bg-surface-3-dark dark:text-sub-text-dark`}
                                        >
                                            {__('Capacity') + ': ' + item?.smartphone?.capacity?.name || 'N/A'}
                                        </span>
                                    </div>
                                )}

                                {item?.color && (
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        <span
                                            className={`inline-flex items-center rounded-md py-0.5 px-2 text-xs font-medium bg-surface-3-light text-sub-text-light dark:bg-surface-3-dark dark:text-sub-text-dark`}

                                        >
                                            {__('Color') + ': ' + item.color?.name || 'N/A'}
                                        </span>
                                    </div>
                                )}

                                <div className="mx-2 mt-2 space-y-1 text-xs text-sub-text-light dark:text-sub-text-dark">

                                    <div className="flex justify-between">
                                        <span>
                                            {__('Product')} ({currency.symbol}{item.unit_price} × {item.quantity})
                                        </span>
                                        <span>
                                            {currency.symbol}
                                            {(item.unit_price * item.quantity).toFixed(2)}
                                        </span>
                                    </div>

                                    <div className="flex justify-between">
                                        <span>{__('Shipping')}</span>
                                        <span>
                                            {currency.symbol}
                                            {Number(shipping_fee).toFixed(2)}
                                        </span>
                                    </div>

                                    <div className="flex justify-between">
                                        <span>{__('Import / Customs Tax')}</span>
                                        <span>
                                            {currency.symbol}
                                            {Number(import_tax).toFixed(2)}
                                        </span>
                                    </div>

                                    {relatedAddons.length > 0 && (
                                        <>
                                            <div className="pt-1 mt-1 border-t border-dashed border-surface-3-light">
                                                <p className="text-xs font-semibold">{__('Add-ons')}</p>

                                                {relatedAddons.map(addon => (
                                                    <div key={addon.id} className="flex justify-between">
                                                        <span>{addon.name} × {addon.quantity}</span>
                                                        <span>
                                                            {currency.symbol}
                                                            {Number(addon.total_price).toFixed(2)}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>

                                <div className="flex justify-between mx-2 mt-2 text-sm font-bold text-main-text-light dark:text-main-text-dark">
                                    <span>{__('Item Total')}</span>
                                    <span>
                                        {currency.symbol}
                                        {(
                                            (item.unit_price * item.quantity) +
                                            Number(shipping_fee) +
                                            Number(import_tax) +
                                            relatedAddons.reduce((t, a) => t + Number(a.total_price), 0)
                                        ).toFixed(2)}
                                    </span>
                                </div>

                            </div>

                        </div>


                    )
                })}

            </div>
        </div>
    );
}

// Order Summary Card Component
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
        <div className="p-6 border rounded-md bg-surface-1-light border-surface-3-light dark:border-surface-3-dark dark:bg-surface-1-dark">
            <h2 className="flex items-center gap-2 mb-6 text-lg font-semibold text-main-text-light dark:text-main-text-dark">

                {__('Order Summary')}
            </h2>

            <div className="mb-6 space-y-4">
                <div className="flex justify-between text-sm">
                    <span className="text-sub-text-light dark:text-sub-text-dark">{__('Product SubTotal')}</span>
                    <span className="font-semibold text-sub-text-ight dark:text-sub-text-dark">
                        {currency?.symbol}{parseFloat(Number(summary.cart_subtotal)).toFixed(2) || '0.00'}
                    </span>
                </div>


                <div className="flex justify-between text-sm">
                    <span className="text-sub-text-light dark:text-sub-text-dark">{__('Addons SubTotal')}</span>
                    <span className="font-semibold text-sub-text-ight dark:text-sub-text-dark">
                        {currency?.symbol}{parseFloat(Number(summary.addons_subtotal)).toFixed(2) || '0.00'}
                    </span>
                </div>


                <div className="flex justify-between text-sm">
                    <span className="text-sub-text-light dark:text-sub-text-dark">{__('Shipping Fee')} </span>
                    <span className="font-semibold text-sub-text-ight dark:text-sub-text-dark">
                        {currency?.symbol}{parseFloat(Number(summary.shipping_fee)).toFixed(2) || '0.00'}
                    </span>
                </div>

                <div className="flex justify-between text-sm">
                    <span className="text-sub-text-light dark:text-sub-text-dark">{__('Import Tax')}</span>
                    <span className="font-semibold text-sub-text-ight dark:text-sub-text-dark">
                        {currency?.symbol}{parseFloat(Number(summary.import_tax)).toFixed(2) || '0.00'}
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
                            <span className="mr-1">{__('Referal Points')}</span>
                            <span className="mr-1">({referalData?.referal_code})</span>
                            {!removingReferalProcessing ? (
                                <button
                                    onClick={handleRemoveReferal}
                                    className="hover:text-red-400"
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
                        <span className="font-semibold text-md text-sub-text-light dark:text-sub-text-dark">
                            {__('Total')}
                        </span>
                        <span className="text-2xl font-semibold text-sub-text-light dark:text-sub-text-dark">
                            {currency?.symbol}
                            {summary.total}
                        </span>
                    </div>
                </div>
            </div>

            {/* Referal Code Section */}


            {!referalData.referal_code && (
                <div className="mb-6">
                    {!showReferalInput ? (
                        <button
                            onClick={() => setShowReferalInput(true)}
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
                                        Placeholder={__("Enter Refferal Code")}
                                        Error={error}
                                    />

                                    <PrimaryButton
                                        Text={__("Apply")}
                                        Spinner={applyingReferalProcessing}
                                        Action={handleApplyReferal}
                                        Type={'button'}
                                    />

                                </div>


                            </div>
                        </div>
                    )}
                </div>
            )}


            {/* Place Order Button */}
            <button
                onClick={handlePlaceOrder}
                disabled={processingOrder}
                className="flex w-full justify-center items-center rounded-md bg-main-text-light  px-6 py-3.5 text-center text-md font-semibold text-main-text-dark shadow-lg transition-all hover:bg-main-text-light/80 dark:bg-main-text-dark dark:text-main-text-light dark:hover:bg-main-text-dark/80"
            >
                {processingOrder && (

                    <Spinner />

                )}
                <span>{__('Place Order')}</span>
            </button>

            {/* Secure Checkout Badge */}
            <div className="flex items-center justify-center gap-2 mt-10 text-sm text-sub-text-light dark:text-sub-text-dark">
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
    );
}

// Social Message Buttons
function SocialMessageButtons({ user, meta_usernames, __ }) {
    return (
        <div className="p-4 bg-white border border-gray-200 rounded-md dark:border-surface-3-dark dark:bg-surface-1-dark">
            <div className="flex flex-col w-full gap-3">
                {/* Instagram Button */}
                <a
                    href={`https://ig.me/m/${meta_usernames?.ig_username}?ref=user_id=${user?.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative flex items-center justify-center gap-2
                            px-5 py-3 min-h-[44px]
                            text-sm font-semibold text-white
                            rounded-md
                            bg-gradient-to-r
                            from-[#405DE6]
                            via-[#C13584]
                            to-[#F56040]
                            transition-all duration-300
                            hover:scale-[1.03]
                            active:scale-[0.97]
                            focus:outline-none"
                >


                    {/* Icon */}
                    <svg
                        className="relative flex-shrink-0 w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                    >
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                    </svg>

                    {/* Text - Responsive */}
                    <span className="relative text-xs sm:text-sm">
                        {__('Message us on Instagram')}
                    </span>
                </a>

                {/* Facebook Button */}
                <a
                    href={`https://m.me/${meta_usernames?.fb_page_username}?ref=user_id=${user?.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-blue-600 rounded-md overflow-hidden transition-all duration-300 hover:shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98] min-h-[44px]"
                >

                    {/* Icon */}
                    <svg
                        className="relative flex-shrink-0 w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                    >
                        <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047v-2.66c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.971h-1.513c-1.491 0-1.956.93-1.956 1.886v2.264h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
                    </svg>

                    {/* Text - Responsive */}
                    <span className="relative text-xs sm:text-sm">
                        {__('Message us on Facebook')}
                    </span>
                </a>
            </div>
        </div>
    );
}
