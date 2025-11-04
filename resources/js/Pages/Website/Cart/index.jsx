import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import MainLayout from '@/Layouts/Website/MainLayout';
import Input from '@/Components/Input';

// Sample Cart Items Data
const sampleCartItems = [
    {
        id: 1,
        name: 'Premium Wireless Headphones',
        description: 'High-quality audio with active noise cancellation and 30-hour battery life',
        price: 299.99,
        originalPrice: 399.99,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop',
        variant: 'Black, Bluetooth 5.0',
        stock: 15,
    },
    {
        id: 2,
        name: 'Smart Watch Pro',
        description: 'Fitness tracking, heart rate monitor, and smartphone notifications',
        price: 199.99,
        originalPrice: null,
        quantity: 2,
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop',
        variant: 'Silver, 44mm',
        stock: 5,
    },
    {
        id: 3,
        name: 'Mechanical Gaming Keyboard',
        description: 'RGB backlit with Cherry MX switches and programmable keys',
        price: 149.99,
        originalPrice: 179.99,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&h=500&fit=crop',
        variant: 'RGB, Cherry MX Red',
        stock: 25,
    },
    {
        id: 4,
        name: '4K Ultra HD Monitor',
        description: '27-inch display with HDR support and 144Hz refresh rate',
        price: 449.99,
        originalPrice: 599.99,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&h=500&fit=crop',
        variant: '27", 4K, 144Hz',
        stock: 3,
    },
    {
        id: 5,
        name: 'Wireless Mouse',
        description: 'Ergonomic design with precision tracking and long battery life',
        price: 49.99,
        originalPrice: null,
        quantity: 3,
        image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=500&h=500&fit=crop',
        variant: 'Black, Wireless',
        stock: 0,
    },
];

// Sample Cart Summary Data
const sampleCartSummary = {
    subtotal: 1299.92,
    shipping: 0,
    tax: 104.0,
    discount: 50.0,
    total: 1353.92,
    freeShippingThreshold: 500,
};

export default function index({ cartItems = sampleCartItems, cartSummary = sampleCartSummary }) {
    // Initialize quantities from the actual cart items
    const [quantities, setQuantities] = useState(
        cartItems.reduce((acc, item) => ({ ...acc, [item.id]: item.quantity }), {}),
    );

    const updateQuantity = (itemId, newQuantity) => {
        if (newQuantity < 1) return;
        setQuantities((prev) => ({ ...prev, [itemId]: newQuantity }));
        // Call your Laravel backend to update quantity
        // router.post('/cart/update', { item_id: itemId, quantity: newQuantity });
    };

    const removeItem = (itemId) => {
        // Call your Laravel backend to remove item
        // router.delete(`/cart/${itemId}`);
    };

    const applyCoupon = (couponCode) => {
        // Call your Laravel backend to apply coupon
        // router.post('/cart/coupon', { code: couponCode });
    };

    return (
        <MainLayout>
            <Head title="Shopping Cart" />

            <div className="min-h-screen transition-colors duration-200">
                {/* Header */}
                <div className="border-b border-gray-200 dark:border-white/10">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Link
                                    href={route('home')}
                                    className="flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-900 dark:text-white/60 dark:hover:text-white"
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
                                            d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                                        />
                                    </svg>
                                    <span className="text-sm font-medium">Continue Shopping</span>
                                </Link>
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Shopping Cart ( {cartItems.length} )
                            </h1>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    {cartItems.length === 0 ? (
                        <EmptyCart />
                    ) : (
                        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                            {/* Cart Items - Left Side */}
                            <div className="space-y-4 lg:col-span-2">
                                {cartItems.map((item) => (
                                    <CartItem
                                        key={item.id}
                                        item={item}
                                        quantity={quantities[item.id] || item.quantity}
                                        onUpdateQuantity={updateQuantity}
                                        onRemove={removeItem}
                                    />
                                ))}
                            </div>

                            {/* Order Summary - Right Side */}
                            <div className="lg:col-span-1">
                                <OrderSummary summary={cartSummary} onApplyCoupon={applyCoupon} />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
}

// Cart Item Component
function CartItem({ item, quantity, onUpdateQuantity, onRemove }) {
    return (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 transition-all hover:shadow-md dark:border-white/10 dark:bg-deepcharcoal sm:p-6">
            <div className="flex gap-4">
                {/* Product Image */}
                <div className="flex-shrink-0">
                    <div className="h-24 w-24 overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-700 sm:h-32 sm:w-32">
                        <img
                            src={item.image || '/placeholder-product.png'}
                            alt={item.name}
                            className="h-full w-full object-cover"
                        />
                    </div>
                </div>

                {/* Product Details */}
                <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                            <h3 className="mb-1 text-base font-semibold text-gray-900 dark:text-white sm:text-lg">
                                {item.name}
                            </h3>
                            <p className="mb-2 text-sm text-gray-600 dark:text-white/60">
                                {item.description}
                            </p>

                            {/* Variants/Options */}
                            {item.variant && (
                                <div className="mb-3 flex flex-wrap gap-2">
                                    <span className="inline-flex items-center rounded-md bg-gray-200 px-2.5 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-white/70">
                                        {item.variant}
                                    </span>
                                </div>
                            )}

                            {/* Price */}
                            <div className="flex items-baseline gap-2">
                                <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400 sm:text-xl">
                                    ${item.price}
                                </span>
                                {item.originalPrice && (
                                    <span className="text-sm text-gray-500 line-through dark:text-white/50">
                                        ${item.originalPrice}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Remove Button */}
                        <button
                            onClick={() => onRemove(item.id)}
                            className="p-2 text-gray-400 transition-colors hover:text-red-500 dark:text-white/40 dark:hover:text-red-400"
                            aria-label="Remove item"
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
                                    d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                                />
                            </svg>
                        </button>
                    </div>

                    {/* Quantity Controls */}
                    <div className="mt-4 flex items-center gap-4">
                        <div className="flex items-center overflow-hidden rounded-lg border border-gray-300 dark:border-white/20">
                            <button
                                onClick={() => onUpdateQuantity(item.id, quantity - 1)}
                                className="p-2 text-gray-700 transition-colors hover:bg-gray-100 disabled:opacity-50 dark:text-white/70 dark:hover:bg-gray-700"
                                disabled={quantity <= 1}
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
                                        d="M19.5 12h-15"
                                    />
                                </svg>
                            </button>
                            <span className="min-w-[3rem] px-4 py-2 text-center text-sm font-semibold text-gray-900 dark:text-white">
                                {quantity}
                            </span>
                            <button
                                onClick={() => onUpdateQuantity(item.id, quantity + 1)}
                                className="p-2 text-gray-700 transition-colors hover:bg-gray-100 dark:text-white/70 dark:hover:bg-gray-700"
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
                                        d="M12 4.5v15m7.5-7.5h-15"
                                    />
                                </svg>
                            </button>
                        </div>

                        {/* Item Total */}
                        <div className="ml-auto">
                            <span className="text-sm text-gray-600 dark:text-white/60">
                                Total:{' '}
                            </span>
                            <span className="text-lg font-bold text-gray-900 dark:text-white">
                                ${(item.price * quantity).toFixed(2)}
                            </span>
                        </div>
                    </div>

                    {/* Stock Status */}
                    {item.stock !== undefined && (
                        <div className="mt-3">
                            {item.stock > 10 ? (
                                <span className="flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                        className="h-4 w-4"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    In Stock
                                </span>
                            ) : item.stock > 0 ? (
                                <span className="flex items-center gap-1 text-xs font-medium text-orange-600 dark:text-orange-400">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                        className="h-4 w-4"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    Only {item.stock} left in stock
                                </span>
                            ) : (
                                <span className="flex items-center gap-1 text-xs font-medium text-red-600 dark:text-red-400">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                        className="h-4 w-4"
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
function OrderSummary({ summary, onApplyCoupon }) {
    const [couponCode, setCouponCode] = useState('');
    const [showCoupon, setShowCoupon] = useState(false);

    const handleApplyCoupon = () => {
        if (couponCode.trim()) {
            onApplyCoupon(couponCode);
        }
    };

    return (
        <div className="sticky top-8 space-y-6">
            {/* Summary Card */}
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 dark:border-white/10 dark:bg-deepcharcoal">
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
                            d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                        />
                    </svg>
                    Order Summary
                </h2>

                {/* Price Breakdown */}
                <div className="mb-6 space-y-4">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-white/60">Subtotal</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                            ${summary.subtotal || '0.00'}
                        </span>
                    </div>

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
                                    d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"
                                />
                            </svg>
                            Shipping
                        </span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                            {summary.shipping === 0 ? (
                                <span className="text-green-600 dark:text-green-400">FREE</span>
                            ) : (
                                `$${summary.shipping || '0.00'}`
                            )}
                        </span>
                    </div>

                    {summary.discount > 0 && (
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
                                Discount
                            </span>
                            <span className="font-semibold text-green-600 dark:text-green-400">
                                -${summary.discount}
                            </span>
                        </div>
                    )}

                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-white/60">Tax</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                            ${summary.tax || '0.00'}
                        </span>
                    </div>

                    <div className="border-t border-gray-200 pt-4 dark:border-white/10">
                        <div className="flex items-center justify-between">
                            <span className="text-base font-semibold text-gray-900 dark:text-white">
                                Total
                            </span>
                            <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                                ${summary.total || '0.00'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Coupon Code */}
                <div className="mb-6">
                    {!showCoupon ? (
                        <button
                            onClick={() => setShowCoupon(true)}
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
                            Have a coupon code?
                        </button>
                    ) : (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between gap-2">
                                <Input
                                    Id={'coupon_code'}
                                    Name={'coupon_code'}
                                    Placeholder={'Enter Coupon Code'}
                                    Type={'text'}
                                    Value={couponCode}
                                    Action={(e) => setCouponCode(e.target.value)}
                                />
                                <button
                                    onClick={handleApplyCoupon}
                                    className="mb-5 rounded-lg bg-indigo-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                                >
                                    Apply
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Checkout Button */}
                <Link
                    href="/checkout"
                    className="block w-full transform rounded-xl bg-indigo-600 px-6 py-3.5 text-center text-base font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all hover:scale-[1.02] hover:bg-indigo-700 active:scale-[0.98] dark:bg-indigo-500 dark:hover:bg-indigo-600"
                >
                    Proceed to Checkout
                </Link>

                {/* Free Shipping Notice */}
                {summary.freeShippingThreshold &&
                    summary.subtotal < summary.freeShippingThreshold && (
                        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-500/30 dark:bg-amber-900/20">
                            <div className="flex items-start gap-2">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600 dark:text-amber-400"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"
                                    />
                                </svg>
                                <p className="text-xs text-amber-700 dark:text-amber-300">
                                    Add{' '}
                                    <strong>
                                        $
                                        {(summary.freeShippingThreshold - summary.subtotal).toFixed(
                                            2,
                                        )}
                                    </strong>{' '}
                                    more to get FREE shipping!
                                </p>
                            </div>
                        </div>
                    )}
            </div>

            {/* Secure Checkout Badge */}
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-white/10 dark:bg-deepcharcoal">
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

            {/* Accepted Payments */}
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-white/10 dark:bg-deepcharcoal">
                <p className="mb-3 text-center text-xs text-gray-500 dark:text-white/50">
                    We accept
                </p>
                <div className="flex items-center justify-center gap-4">
                    <svg
                        viewBox="0.004 0 64 64"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        className="h-8 w-8 text-gray-400 dark:text-white/40"
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

                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="h-8 w-8 text-gray-400 dark:text-white/40"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z"
                        />
                    </svg>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="h-8 w-8 text-gray-400 dark:text-white/40"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z"
                        />
                    </svg>
                </div>
            </div>
        </div>
    );
}

// Empty Cart Component
function EmptyCart() {
    return (
        <div className="py-16 text-center">
            <div className="mb-6 inline-flex h-24 w-24 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-12 w-12 text-gray-400 dark:text-white/40"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                    />
                </svg>
            </div>
            <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
                Your cart is empty
            </h2>
            <p className="mb-8 text-gray-600 dark:text-white/60">
                Looks like you haven't added anything to your cart yet
            </p>
            <Link
                href="/shop"
                className="inline-flex transform items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-base font-semibold text-white transition-all hover:scale-105 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
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
                        d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                    />
                </svg>
                Start Shopping
            </Link>
        </div>
    );
}
