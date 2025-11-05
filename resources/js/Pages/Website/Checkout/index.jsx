import React, { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import MainLayout from '@/Layouts/Website/MainLayout';
import Input from '@/Components/Input';
import Placeholder from 'asset/assets/images/product/placeholder.jpg';
import getContrastingColor from '@/Hooks/useColorContraster';
import Toast from '@/Components/Toast';
import axios from 'axios';
import Spinner from '@/Components/Spinner';
import useWindowSize from '@/Hooks/useWindowSize';
import Confetti from 'react-confetti';

export default function Checkout({ cart_items, refferalSessionData }) {
    const { currency, auth } = usePage().props;
    const windowSize = useWindowSize();

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
    const [showReferalInput, setShowReferalInput] = useState(false);

    const [referalData, setReferalData] = useState({
        referal_code: refferalSessionData?.referal_code || '',
        total_points: refferalSessionData?.total_points ?? 0,
    });

    const [referalCode, setReferalCode] = useState('');

    const [shippingInfo, setShippingInfo] = useState({
        full_name: auth?.user?.name || '',
        email: auth?.user?.email || '',
        phone: '',
        address: '',
        city: '',
        postal_code: '',
        country: '',
    });

    const [showConfetti, setShowConfetti] = useState(false);
    const [confettiFading, setConfettiFading] = useState(false);

    useEffect(() => {
        if (showInfoMessage) {
            const timer = setTimeout(() => {
                setShowInfoMessage(false);
                setInfoMessage(null);
            }, 1500);
            return () => clearTimeout(timer);
        }

        if (showErrorMessage) {
            const timer = setTimeout(() => {
                setShowErrorMessage(false);
                setErrorMessage(null);
            }, 1500);
            return () => clearTimeout(timer);
        }

        if (showSuccessMessage) {
            const timer = setTimeout(() => {
                setShowSuccessMessage(false);
                setSuccessMessage(null);
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [showInfoMessage, showErrorMessage, showSuccessMessage]);

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
            setError('Referal Code is Required');
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
            setShowReferalInput(true);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setShippingInfo((prev) => ({ ...prev, [name]: value }));
    };

    const calculateSummary = () => {
        const subtotal = cart_items.reduce((total, item) => {
            const price = parseFloat(item.smartphone?.selling_info?.total_price || 0);
            return total + price * item.quantity;
        }, 0);

        const total = subtotal;

        return {
            subtotal: subtotal.toFixed(2),

            total: total.toFixed(2),
            itemCount: cart_items.reduce((sum, item) => sum + item.quantity, 0),
        };
    };

    const summary = calculateSummary();

    const handlePlaceOrder = async () => {
        // Validate shipping info
        const requiredFields = ['full_name', 'email', 'phone', 'address', 'city', 'country'];
        const emptyFields = requiredFields.filter((field) => !shippingInfo[field]);

        if (emptyFields.length > 0) {
            setErrorMessage('Please fill in all required fields');
            setShowErrorMessage(true);
            return;
        }

        setProcessingOrder(true);
        setTimeout(() => {
            alert('currently in Development');
            setProcessingOrder(false);
        }, 1000);
        // Your order processing logic here
        // await axios
        //     .post(route('website.orders.store'), {
        //         shipping_info: shippingInfo,
        //         payment_method: paymentMethod,
        //         referal_code: referalData.referal_code,
        //     })
        //     .then((res) => {
        //         const response = res.data;
        //         if (response.status === true) {
        //             setSuccessMessage('Order placed successfully!');
        //             setShowSuccessMessage(true);
        //             // Redirect to order confirmation page
        //             setTimeout(() => {
        //                 router.visit(route('website.orders.show', response.order_id));
        //             }, 1500);
        //         }
        //     })
        //     .catch((error) => {
        //         setErrorMessage(error.message);
        //         setShowErrorMessage(true);
        //     })
        //     .finally(() => {
        //         setProcessingOrder(false);
        //     });
    };

    return (
        <MainLayout>
            <Head title="Checkout" />

            {(showInfoMessage || showErrorMessage || showSuccessMessage) && (
                <Toast
                    flash={{
                        ...(showInfoMessage
                            ? { info: infoMessage }
                            : showErrorMessage
                              ? { error: errorMessage }
                              : { success: successMessage }),
                    }}
                />
            )}

            <div className="min-h-screen transition-colors duration-200">
                {showConfetti && (
                    <div
                        className={`pointer-events-none fixed inset-0 z-50 overflow-hidden transition-opacity duration-1000 ${
                            confettiFading ? 'opacity-0' : 'opacity-100'
                        }`}
                    >
                        <Confetti
                            width={windowSize.width}
                            height={windowSize.height}
                            recycle={false}
                            numberOfPieces={1000}
                            gravity={1}
                        />
                    </div>
                )}

                <div
                    className={`max-w-8xl mx-auto sm:px-6 lg:px-8 ${windowSize.width < 1024 && 'mb-20'}`}
                >
                    {/* Header */}
                    <div className="mb-6 px-4 sm:px-0">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
                            Checkout
                        </h1>
                        <p className="mt-1 text-sm text-gray-600 dark:text-white/60">
                            Complete your order by providing your shipping information
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                        {/* Left Section: Shipping & Payment */}
                        <div className="space-y-6 lg:col-span-2">
                            {/* Shipping Information */}
                            <ShippingForm
                                shippingInfo={shippingInfo}
                                handleInputChange={handleInputChange}
                            />

                            {/* Payment Method */}
                            <PaymentMethod
                                paymentMethod={paymentMethod}
                                setPaymentMethod={setPaymentMethod}
                            />

                            {/* Order Items Summary (Mobile Only) */}
                            {windowSize.width < 1024 && (
                                <OrderItemsSummary cart_items={cart_items} currency={currency} />
                            )}
                        </div>

                        {/* Right Section: Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-8 space-y-4">
                                {/* Order Items (Desktop Only) */}
                                {windowSize.width >= 1024 && (
                                    <OrderItemsSummary
                                        cart_items={cart_items}
                                        currency={currency}
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
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}

// Shipping Form Component
function ShippingForm({ shippingInfo, handleInputChange }) {
    return (
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-deepcharcoal">
            <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white">
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
                        d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                    />
                </svg>
                Shipping Information
            </h2>

            <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-white/80">
                            Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="full_name"
                            value={shippingInfo.full_name}
                            onChange={handleInputChange}
                            placeholder="John Doe"
                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-white/20 dark:bg-deepcharcoal dark:text-white dark:placeholder-white/40"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-white/80">
                            Email Address <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={shippingInfo.email}
                            onChange={handleInputChange}
                            placeholder="john@example.com"
                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-white/20 dark:bg-deepcharcoal dark:text-white dark:placeholder-white/40"
                        />
                    </div>
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-white/80">
                        Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="tel"
                        name="phone"
                        value={shippingInfo.phone}
                        onChange={handleInputChange}
                        placeholder="+1 (555) 000-0000"
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-white/20 dark:bg-deepcharcoal dark:text-white dark:placeholder-white/40"
                    />
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-white/80">
                        Street Address <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="address"
                        value={shippingInfo.address}
                        onChange={handleInputChange}
                        placeholder="123 Main Street, Apt 4B"
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-white/20 dark:bg-deepcharcoal dark:text-white dark:placeholder-white/40"
                    />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-white/80">
                            City <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="city"
                            value={shippingInfo.city}
                            onChange={handleInputChange}
                            placeholder="New York"
                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-white/20 dark:bg-deepcharcoal dark:text-white dark:placeholder-white/40"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-white/80">
                            Postal Code
                        </label>
                        <input
                            type="text"
                            name="postal_code"
                            value={shippingInfo.postal_code}
                            onChange={handleInputChange}
                            placeholder="10001"
                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-white/20 dark:bg-deepcharcoal dark:text-white dark:placeholder-white/40"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-white/80">
                            Country <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="country"
                            value={shippingInfo.country}
                            onChange={handleInputChange}
                            placeholder="United States"
                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-white/20 dark:bg-deepcharcoal dark:text-white dark:placeholder-white/40"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

// Payment Method Component
function PaymentMethod({ paymentMethod, setPaymentMethod }) {
    return (
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-deepcharcoal">
            <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white">
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
                        d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
                    />
                </svg>
                Payment Method
            </h2>

            <div className="space-y-3">
                {/* Bank Transfer Option */}
                <label
                    className={`flex cursor-pointer items-center gap-4 rounded-lg border-2 p-4 transition-all ${
                        paymentMethod === 'bank_transfer'
                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                            : 'border-gray-200 bg-gray-50 hover:border-gray-300 dark:border-white/10 dark:bg-gray-900/20 dark:hover:border-white/20'
                    }`}
                >
                    <input
                        type="radio"
                        name="payment_method"
                        value="bank_transfer"
                        checked={paymentMethod === 'bank_transfer'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="h-5 w-5 text-indigo-600 focus:ring-2 focus:ring-indigo-500"
                    />
                    <div className="flex flex-1 items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="h-5 w-5 text-gray-700 dark:text-white"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z"
                                    />
                                </svg>
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900 dark:text-white">
                                    Direct Bank Transfer
                                </p>
                                <p className="text-sm text-gray-600 dark:text-white/60">
                                    Pay directly to our bank account
                                </p>
                            </div>
                        </div>
                    </div>
                </label>

                {/* Bitcoin Option */}
                <label
                    className={`flex cursor-pointer items-center gap-4 rounded-lg border-2 p-4 transition-all ${
                        paymentMethod === 'bitcoin'
                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                            : 'border-gray-200 bg-gray-50 hover:border-gray-300 dark:border-white/10 dark:bg-gray-900/20 dark:hover:border-white/20'
                    }`}
                >
                    <input
                        type="radio"
                        name="payment_method"
                        value="bitcoin"
                        checked={paymentMethod === 'bitcoin'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="h-5 w-5 text-indigo-600 focus:ring-2 focus:ring-indigo-500"
                    />
                    <div className="flex flex-1 items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500">
                                <svg
                                    className="h-6 w-6"
                                    viewBox="0.004 0 64 64"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                >
                                    <path
                                        d="M46.11 27.441c.636-4.258-2.606-6.547-7.039-8.074l1.438-5.768-3.512-.875-1.4 5.616c-.922-.23-1.87-.447-2.812-.662l1.41-5.653-3.509-.875-1.439 5.766c-.764-.174-1.514-.346-2.242-.527l.004-.018-4.842-1.209-.934 3.75s2.605.597 2.55.634c1.422.355 1.68 1.296 1.636 2.042l-1.638 6.571c.098.025.225.061.365.117l-.37-.092-2.297 9.205c-.174.432-.615 1.08-1.609.834.035.051-2.552-.637-2.552-.637l-1.743 4.02 4.57 1.139c.85.213 1.683.436 2.502.646l-1.453 5.835 3.507.875 1.44-5.772c.957.26 1.887.5 2.797.726L27.504 50.8l3.511.875 1.453-5.823c5.987 1.133 10.49.676 12.383-4.738 1.527-4.36-.075-6.875-3.225-8.516 2.294-.531 4.022-2.04 4.483-5.157zM38.087 38.69c-1.086 4.36-8.426 2.004-10.807 1.412l1.928-7.729c2.38.594 10.011 1.77 8.88 6.317zm1.085-11.312c-.99 3.966-7.1 1.951-9.083 1.457l1.748-7.01c1.983.494 8.367 1.416 7.335 5.553z"
                                        fill="#ffffff"
                                    />
                                </svg>
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900 dark:text-white">
                                    Bitcoin Payment
                                </p>
                                <p className="text-sm text-gray-600 dark:text-white/60">
                                    Pay with Bitcoin cryptocurrency
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
function OrderItemsSummary({ cart_items, currency }) {
    return (
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-deepcharcoal">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white">
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
                        d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                    />
                </svg>
                Order Items ({cart_items.length})
            </h2>

            <div className="max-h-96 space-y-4 overflow-y-auto pr-2">
                {cart_items.map((item) => (
                    <div
                        key={item.id}
                        className="flex gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-white/10 dark:bg-gray-900/20"
                    >
                        <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white dark:bg-deepcharcoal">
                            <img
                                src={item?.smartphone?.smartphone_image_urls?.[0] || Placeholder}
                                alt={item?.smartphone?.model_name?.name || 'Product'}
                                className="max-h-full max-w-full object-contain"
                                loading="lazy"
                                onError={(e) => (e.target.src = Placeholder)}
                            />
                        </div>
                        <div className="flex-1">
                            <h3 className="mb-1 text-sm font-semibold text-gray-900 dark:text-white">
                                {item?.smartphone?.model_name?.name || 'N/A'}
                            </h3>
                            {item?.color && (
                                <span
                                    className="mb-2 inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium"
                                    style={{
                                        backgroundColor: item?.color?.code,
                                        color: getContrastingColor(item?.color?.code),
                                    }}
                                >
                                    {item.color?.name}
                                </span>
                            )}
                            <div className="mt-2 flex items-center justify-between">
                                <span className="text-xs text-gray-600 dark:text-white/60">
                                    Qty: {item.quantity}
                                </span>
                                <span className="text-sm font-bold text-gray-900 dark:text-white">
                                    {currency?.symbol}
                                    {(
                                        item.smartphone?.selling_info?.total_price * item.quantity
                                    ).toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
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
}) {
    return (
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-deepcharcoal">
            <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white">
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
                        d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                    />
                </svg>
                Order Summary
            </h2>

            <div className="mb-6 space-y-4">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-white/60">Subtotal</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                        {currency?.symbol}
                        {summary.subtotal}
                    </span>
                </div>

                {referalData.total_points > 0 && (
                    <div className="flex justify-between text-sm">
                        <span className="flex items-center gap-1 text-gray-600 dark:text-white/60">
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
                                    d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"
                                />
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M6 6h.008v.008H6V6z"
                                />
                            </svg>
                            <span className="mr-1">Referal Points</span>
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
                                        className="h-4 w-4"
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

                <div className="border-t border-gray-200 pt-4 dark:border-white/10">
                    <div className="flex items-center justify-between">
                        <span className="text-base font-semibold text-gray-900 dark:text-white">
                            Total
                        </span>
                        <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
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
                            className="flex w-full items-center justify-center gap-2 text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
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
                                    <input
                                        type="text"
                                        value={referalCode}
                                        onChange={(e) => setReferalCode(e.target.value)}
                                        placeholder="Enter Referal Code To Earn Points"
                                        className={`w-full rounded-lg border ${
                                            error
                                                ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                                                : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500/20'
                                        } bg-white px-4 py-3 text-gray-900 placeholder-gray-400 transition-colors focus:outline-none focus:ring-2 dark:border-white/20 dark:bg-deepcharcoal dark:text-white dark:placeholder-white/40`}
                                    />
                                    {error && (
                                        <p className="mt-1 text-xs text-red-500 dark:text-red-400">
                                            {error}
                                        </p>
                                    )}
                                </div>
                                <button
                                    onClick={handleApplyReferal}
                                    disabled={applyingReferalProcessing}
                                    className="flex h-12 items-center justify-center rounded-lg bg-indigo-600 px-6 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {applyingReferalProcessing ? <Spinner /> : 'Apply'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Place Order Button */}
            <button
                onClick={handlePlaceOrder}
                disabled={processingOrder}
                className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-base font-semibold text-white shadow-lg transition-all hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
                {processingOrder ? (
                    <>
                        <Spinner />
                        <span>Processing...</span>
                    </>
                ) : (
                    <>
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
                                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        <span>Place Order</span>
                    </>
                )}
            </button>

            {/* Secure Checkout Badge */}
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-white/60">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-5 w-5 text-green-500"
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
    );
}
