import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import MainLayout from '@/Layouts/Website/MainLayout';
import Placeholder from 'asset/assets/images/product/placeholder.jpg';
import Toast from '@/Components/Toast';
import axios from 'axios';
import Spinner from '@/Components/Spinner';
import useWindowSize from '@/Hooks/useWindowSize';
import { useTranslation } from '@/Hooks/useTranslation';
import { Trash2 } from 'lucide-react';
export default function index({ cart_items, addon_items, total_summary }) {
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

    const [summary, setSummary] = useState(total_summary || []);



    const getTotalQtyOfSmartphone = (smartphoneId) => {
        return cart_items
            .filter(i => i.smartphone_id === smartphoneId)
            .reduce((sum, i) => sum + (quantities[i.id] ?? i.quantity), 0);
    };


    const updateQuantity = (itemId, newQuantity) => {
        if (newQuantity < 1) return;

        const cartItem = cart_items.find((item) => item.id === itemId);

        if (!cartItem) {
            setInfoMessage(__('Item not found in cart'));
            setShowInfoMessage(true);
            return;
        }

        const totalUsedQty = getTotalQtyOfSmartphone(cartItem.smartphone_id);
        const otherItemsQty = totalUsedQty - (quantities[itemId] ?? cartItem.quantity);
        const maxAllowed = cartItem.smartphone.inventory_items_count - otherItemsQty;

        if (newQuantity > maxAllowed) {
            setInfoMessage(
                __('Adding more quantity exceeds available stock for this product')
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
                page: 'cart',
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

    const onProductRemove = (itemId, type) => {
        setRemovingProcessing(true);
        axios
            .delete(route('website.carts.remove-item'), {
                data: { item_id: itemId, type: type, page: 'cart', },
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
                page: 'cart',
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

    const removeSmartphoneAddon = (itemId) => {
        setRemovingProcessing(true);
        axios
            .delete(route('website.carts.remove-smartphone-addon-item'), {
                data: { item_id: itemId, page: 'cart', },
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
    // const calculateShippingCost = (shipping_fee, product, quantity) => {
    //     if (!shipping_fee) return 0;

    //     const { value_type, default_value } = shipping_fee;

    //     if (!default_value || default_value === 0) return 0;

    //     if (value_type === 'fixed') {
    //         return parseFloat(Number(default_value) * Number(quantity)).toFixed(2);
    //     }

    //     if (value_type === 'percentage') {
    //         const shippingCost = (product.selling_info?.total_price * default_value) / 100;
    //         return parseFloat(Number(shippingCost) * Number(quantity)).toFixed(2);
    //     }

    //     return __('Free');
    // };

    // const calculateImportCost = (import_tax, product) => {
    //     if (!import_tax) return 0;

    //     const { value_type, default_value } = import_tax;

    //     if (!default_value || default_value === 0) return 0;

    //     if (value_type === 'fixed') {
    //         return parseFloat(default_value).toFixed(2);
    //     }

    //     if (value_type === 'percentage') {
    //         const shippingCost = (product.selling_info?.total_price * default_value) / 100;
    //         return parseFloat(shippingCost).toFixed(2);
    //     }

    //     return noTaxMessage;
    // };

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

            <div className="min-h-screen transition-colors duration-200">
                {/* Main Content */}
                <div className={`mx-auto max-w-8xl px-4 sm:px-6 lg:px-8 pt-8 ${windowSize.width <= 1024 && 'mb-20'}`}>
                    {cart_items.length === 0 ? (
                        <EmptyCart __={__} />
                    ) : (
                        <>
                            {/* Cart Heading */}
                            <h1 className='mb-5 text-[24px] font-semibold text-main-text-light dark:text-main-text-dark'>
                                {__('Cart')} ({cart_items.length})
                            </h1>

                            {/* Grid Layout */}
                            <div className="grid grid-cols-1 gap-6 mb-10 lg:gap-8 lg:grid-cols-3">
                                {/* Cart Items - Left Side */}
                                <div className="space-y-4 lg:col-span-2">
                                    {cart_items.map((item) => {
                                        return (
                                            <CartItem
                                                key={item.id}
                                                item={item}
                                                quantity={quantities[item.id] || item.quantity}
                                                onUpdateQuantity={updateQuantity}
                                                onProductRemove={onProductRemove}
                                                currency={currency}
                                                removing={removingProcessing}
                                                addon_items={item?.smartphone_addon_items}
                                                __={__}
                                                smartphoneAddonQuantities={smartphoneAddonQuantities}
                                                onUpdateSmartphoneAddon={updateSmartphoneAddon}
                                                onRemoveSmartphoneAddon={removeSmartphoneAddon}
                                                getTotalQtyOfSmartphone={getTotalQtyOfSmartphone}
                                            />
                                        )
                                    })}
                                </div>

                                {/* Order Summary - Right Side */}
                                <div className="lg:col-span-1">
                                    <OrderSummary
                                        summary={summary}
                                        currency={currency}
                                        cart_items={cart_items}
                                        __={__}
                                    />
                                </div>
                            </div>
                        </>
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
    onProductRemove,
    currency,
    removing,
    __,
    addon_items,
    smartphoneAddonQuantities,
    onUpdateSmartphoneAddon,
    onRemoveSmartphoneAddon,
    // calculateShippingCost,
    // calculateImportCost,
    getTotalQtyOfSmartphone,
}) {
    // const shipping_fee = calculateShippingCost(
    //     item?.smartphone?.selling_info?.shipping_fee,
    //     item?.smartphone,
    //     quantity,
    // );
    // const import_tax = calculateImportCost(
    //     item?.smartphone?.selling_info?.import_tax,
    //     item?.smartphone,
    // );

    const relatedAddons = addon_items || [];

    const currentQty = quantity;
    const totalUsedQty = getTotalQtyOfSmartphone(item.smartphone_id);
    const otherItemsQty = totalUsedQty - currentQty;
    const maxAllowedForThisItem =
        item.smartphone.inventory_items_count - otherItemsQty;

    const generateSmartphoneURL = (smartphone, isDirect = false, isSinglePage = false) => {
        return (
            `?m-slug=${smartphone?.slug}${isSinglePage ? '&single_page=true' : ''}${isDirect ? '&direct=true' : ''}`
        );
    };

    return (
        <div className="p-6 transition-all bg-white border rounded-md border-surface-3-light dark:border-surface-3-dark dark:bg-surface-1-dark">
            <div className="flex gap-6">
                {/* Product Image */}
                {(item?.smartphone?.smartphone_image_urls.length > 0 || item?.smartphone?.smartphone_video_urls?.length > 0) && (
                    <div
                        className="relative overflow-hidden transition-all rounded-md cursor-pointer bg-surface-2-light w-28 h-28 group/img aspect-square dark:bg-surface-2-dark shrink-0"
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
                    <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex-1">
                            <h3 className="mb-1 text-[16px] font-semibold text-main-text-light dark:text-main-text-dark">
                                {item?.smartphone?.model_name?.name || 'N/A'}
                            </h3>

                            {/* Capacity and Color in one line */}
                            <p className="text-[14px] font-medium text-sub-text-light dark:text-sub-text-dark">
                                {item?.smartphone?.capacity?.name && item?.color?.name
                                    ? `${item?.smartphone?.capacity?.name}, ${item?.color?.name}`
                                    : item?.smartphone?.capacity?.name || item?.color?.name || ''}
                            </p>
                        </div>

                        {/* Remove Button */}
                        <button
                            onClick={() => onProductRemove(item.id, item.type)}
                            disabled={removing}
                            className={`p-1.5 text-main-text-light transition-colors hover:text-main-text-light/80 dark:text-main-text-dark dark:hover:text-main-text-dark/80 ${removing ? 'cursor-not-allowed' : ''}`}
                            title={__('Remove item')}
                        >
                            {removing ? (
                                <Spinner />
                            ) : (


                                <Trash2 className='w-5 h-5' />
                            )}
                        </button>
                    </div>

                    {/* Price */}
                    <div className="mb-4">
                        <span className="text-[16px] font-semibold text-main-text-light dark:text-main-text-dark">
                            {currency?.symbol}{Number(item.unit_price).toLocaleString('en-US')}
                        </span>
                    </div>

                    {/* Quantity and Stock */}
                    <div className="flex items-center gap-4">
                        {/* Quantity Controls */}
                        <div className="flex items-center border rounded-md border-surface-3-light bg-backgroundLight dark:bg-transparent dark:border-surface-3-dark">
                            <button
                                onClick={() => onUpdateQuantity(item.id, quantity - 1)}
                                className="px-1 py-1 transition-colors text-main-text-light hover:bg-surface-1-light disabled:opacity-50 dark:text-main-text-dark dark:hover:bg-surface-2-dark"
                                disabled={quantity <= 1}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={3}
                                    stroke="currentColor"
                                    className="w-[0.8rem] h-4"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M19.5 12h-15"
                                    />
                                </svg>
                            </button>

                            <span className="min-w-[3rem] px-2 py-1 text-center text-md font-semibold text-main-text-light dark:text-main-text-dark">
                                {quantity}
                            </span>

                            <button
                                disabled={quantity >= maxAllowedForThisItem}
                                onClick={() => onUpdateQuantity(item.id, quantity + 1)}
                                className="px-1 py-1 transition-colors text-main-text-light hover:bg-surface-1-light disabled:opacity-50 dark:text-main-text-dark dark:hover:bg-surface-2-dark"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={3}
                                    stroke="currentColor"
                                    className="w-[0.8rem] h-4"
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
                        {maxAllowedForThisItem !== undefined && maxAllowedForThisItem <= 10 && maxAllowedForThisItem > 0 && (
                            <span className="text-[13px]  font-semibold text-[#ff0000]">
                                {__('Only')} {maxAllowedForThisItem} {__('left in stock')}
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

            {/* Total Section */}
            <div className="flex items-center justify-between pt-3 mt-3">
                <span className="text-[14px] font-semibold text-main-text-light dark:text-main-text-dark">
                    {__('Total')}
                </span>
                <span className="text-[20px] font-semibold text-main-text-light dark:text-main-text-dark">
                    {currency?.symbol}{Number(
                        item?.unit_price * quantity +
                        Number(
                            relatedAddons?.reduce(
                                (total, addon) => total + Number(addon.total_price),
                                0,
                            ),
                        )
                    ).toLocaleString('en-US')}
                </span>
            </div>
        </div>
    );
}

// Addon Item Component
function AddonItem({ item, quantity, onUpdateQuantity, onRemove, currency, removing, __ }) {
    return (
        <div className="flex items-center gap-4 px-5 py-4 border-b border-surface-3-light dark:border-surface-3-dark">
            {/* Addon Name - Truncated after certain chars */}
            <div className="flex-1 min-w-0 max-w-[70px]">
                <p className="text-[14px] font-normal truncate dark:text-main-text-dark">
                    {item?.name || 'Option title'}
                </p>
            </div>

            {/* Remove Button */}
            <button
                onClick={() => onRemove(item.id)}
                disabled={removing}
                className={`p-1.5 text-main-text-light transition-colors hover:text-main-text-light/80 dark:text-main-text-dark dark:hover:text-main-text-dark/80`}
                title={__('Remove addon')}
            >
                {removing ? (
                    <Spinner size="sm" />
                ) : (
                    <Trash2 className='w-5 h-5' />
                )}
            </button>

            {/* Spacer to push quantity controls to the right */}
            <div className="flex-1"></div>

            {/* Quantity Controls - Screenshot style with rounded square buttons */}
            <div className="flex items-center flex-shrink-0 gap-2">
                <button
                    onClick={() => onUpdateQuantity(item.id, quantity - 1)}
                    disabled={quantity <= 1}
                    className="flex items-center justify-center w-[27px] h-[27px] transition-colors border rounded-md text-main-text-light dark:text-main-text-dark border-main-text-light bg-backgroundLight dark:bg-surface-1-dark hover:bg-surface-2-light  disabled:border-surface-3-light disabled:cursor-not-allowed dark:border-surface-3-dark dark:hover:bg-surface-2-dark"
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
                            d="M19.5 12h-15"
                        />
                    </svg>
                </button>

                <span className="w-8 font-semibold text-center text-md text-main-text-light dark:text-main-text-dark ">
                    {quantity}
                </span>

                <button
                    onClick={() => onUpdateQuantity(item.id, quantity + 1)}
                    className="flex items-center justify-center w-[27px] h-[27px] transition-colors border rounded-md text-main-text-light dark:text-main-text-dark border-main-text-light bg-backgroundLight dark:bg-surface-1-dark hover:bg-surface-2-light disabled:opacity-60 disabled:cursor-not-allowed dark:border-surface-3-dark dark:hover:bg-surface-2-dark"
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
            <div className="flex-shrink-0 w-24 text-[14px] font-semibold text-right text-main-text-light dark:text-main-text-dark">
                {currency?.symbol}{Number(item?.unit_price * quantity).toLocaleString('en-US')}
            </div>
        </div>
    );
}

// Order Summary Component
function OrderSummary({
    summary,
    currency,
    cart_items,
    __,
}) {


    return (
        <div className="sticky space-y-3 ">
            {/* Summary Card */}
            <div className="p-8 bg-white border rounded-md border-surface-3-light dark:border-surface-3-dark dark:bg-surface-1-dark">
                <h2 className="mb-6 text-[18px] font-semibold text-main-text-light dark:text-main-text-dark">
                    {__('Order Summary')}
                </h2>

                {/* Price Breakdown */}
                <div className="mb-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-main-text-light text-[14px] font-semibold dark:text-main-text-dark">
                            {__('Items total')}
                        </span>
                        <span className="text-[20px] font-semibold text-main-text-light dark:text-main-text-dark">
                            {currency?.symbol}{parseFloat(Number(summary.items_total)).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        </span>
                    </div>

                    <p className="text-[14px] font-semibold text-main-text-light dark:text-main-text-dark">
                        {__('Shipping will be calculated at checkout.')}
                    </p>
                </div>

                {/* Divider */}
                <div className="my-6 border-t border-surface-3-light dark:border-surface-3-dark"></div>

                {/* Estimated Total */}
                <div className="flex items-center justify-between mb-6">
                    <span className="text-[14px] font-semibold text-main-text-light dark:text-main-text-dark">
                        {__('Estimated total')}
                    </span>
                    <span className="text-[28px] font-semibold text-main-text-light dark:text-main-text-dark">
                        {currency?.symbol}{parseFloat(Number(summary.items_total)).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    </span>
                </div>

                {/* Checkout Button */}
                <Link
                    href={route('website.checkout.index')}
                    className="block w-full px-6 py-4 text-base font-semibold text-center text-white transition-all rounded-md mt-14 dark:text-main-text-light bg-[#282828] hover:bg-backgroundDark/80 dark:bg-backgroundLight dark:hover:bg-backgroundLight/80"
                >
                    {__('Checkout')} ({cart_items?.length})
                </Link>

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
