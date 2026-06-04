import { useTranslation } from '@/Hooks/useTranslation';
import { BuildingLibraryIcon } from '@heroicons/react/24/solid';
import { Link, usePage } from '@inertiajs/react';
import DisplayPrice from './DisplayPrice';
import { useFeedCleanupStore } from '@/Hooks/useFeedCleanupStore';

const SmartphoneDetails = ({ currency, product, StockBadge }) => {
    const { generalSetting } = usePage().props;

    const { __ } = useTranslation();

    const calculateShippingCost = () => {

        return __("Shipping cost may apply at checkout");

        // if (!product?.selling_info?.shipping_fee) return __('Free');

        // const { value_type, default_value } = product?.selling_info?.shipping_fee;

        // if (!default_value || default_value === 0) return __('Free');

        // if (value_type === 'fixed') {
        //     return `${currency?.symbol}${Number(default_value).toLocaleString('en-US')}`;
        // }

        // if (value_type === 'percentage') {
        //     const shippingCost = (product.selling_info?.total_price * default_value) / 100;
        //     return `${currency?.symbol}${Number(shippingCost).toLocaleString('en-US')} (${default_value}%)`;
        // }

        // return __('Free');
    };

    const calculateImportCost = () => {
        const noTaxMessage = __('Import fees may apply on delivery');
        return noTaxMessage;

        // if (!product?.selling_info?.import_tax) return noTaxMessage;

        // const { value_type, default_value } = product?.selling_info?.import_tax;

        // if (!default_value || default_value === 0) return noTaxMessage;

        // if (value_type === 'fixed') {
        //     return `${currency?.symbol}${Number(default_value).toLocaleString('en-US')}`;
        // }

        // if (value_type === 'percentage') {
        //     const shippingCost = (product.selling_info?.total_price * default_value) / 100;
        //     return `${currency?.symbol}${Number(shippingCost).toLocaleString('en-US')} (${default_value}%)`;
        // }

        // return noTaxMessage;
    };

    // const calculateDeliveryEstimate = (deliveryDays) => {
    //     if (!deliveryDays) return 'Dec 27 – Jan 2';

    //     const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    //     const formatDate = (date) => {
    //         return `${months[date.getMonth()]} ${date.getDate()}`;
    //     };

    //     const fromDate = new Date();

    //     const toDate = new Date();
    //     toDate.setDate(fromDate.getDate() + deliveryDays);

    //     return `${formatDate(fromDate)} – ${formatDate(toDate)}`;
    // };

    return (
        <div className="relative max-w-lg">
            {/* Price */}
            <DisplayPrice
                usdAmount={product.selling_info?.total_price}
                showCode
                showEstimatedLabel={false}
                className={`mb-6 text-[18px] font-semibold text-main-text-light dark:text-main-text-dark xl:text-3xl ${product?.is_sold_out ? 'line-through' : ''}`}
            />

            {product?.is_sold_out && (
                <div className="mb-6 -mt-3">
                    <span className="inline-block rounded bg-red-600 px-2.5 py-1 text-xs font-semibold text-white">
                        {__('Sold Out')}
                    </span>
                </div>
            )}

            <div className="space-y-4">
                {/* Country/Region */}
                <DetailRow label={__('Mode/Product')} value={product?.name || 'N/A'} />
                <DetailRow label={__('Color')} value={product?.colors?.[0]?.name || 'N/A'} />
                <DetailRow label={__('Storage Size')} value={product?.capacity || 'N/A'} />
                <DetailRow label={__('Country/Region')} value={product?.country?.name || 'N/A'} />

                {/* Condition */}
                <DetailRow label={__('Condition')} value={product?.condition?.name || 'N/A'} />

                {/* Shipping */}
                <DetailRow
                    label={__('Shipping')}
                    value={calculateShippingCost()}
                    shipping_policy={!!product?.shipping_policy}
                    LinkText={__('View Shipping Policy') + ' >'}
                    isLink={true}
                    smartphone_slug={product?.slug}
                    policy_slug={product?.shipping_policy?.slug}
                />

                {/* Import fees */}
                <DetailRow label={__('Import fees') + ':'} value={calculateImportCost()} />

                {/* Delivery */}
                <DetailRow
                    label={__('Delivery Time')}
                    value={__('Within') + ' ' + product?.delivery_days + ' ' + __('Days')}
                    isDelivery={true}
                    deliveryInfo={generalSetting?.app_product_delivery_info}
                />

                {/* Courier */}
                {/*<DetailRow
                    label={__('Courier')}
                    value={product?.courier_company?.courier_name || 'N/A'}
                />*/}

                {/* Stock */}
                {/* <DetailRow label={__("Stock")} value={StockBadge || "N/A"} /> */}

                {/* Returns */}
                {product?.return_policy && (
                    <DetailRow
                        label={__('Returns')}
                        value={__('View Return Policy') + ' >'}
                        isLink={true}
                        smartphone_slug={product?.slug}
                        policy_slug={product?.return_policy?.slug}
                        return_policy={!!product?.return_policy}
                        onClick={() =>
                            useFeedCleanupStore.getState().setShouldCleanupBrowserHistory(false)
                        }
                    />
                )}

                {/* Payments */}
                <DetailRow
                    label={__('Payments')}
                    value={
                        <>
                            <div className="grid grid-cols-1 gap-2 lg:grid-cols-1">
                                <div className="flex flex-wrap items-center gap-4">
                                    {/* Crypto */}
                                    <div className="flex items-center gap-1.5">
                                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-surface-2-light dark:bg-surface-3-dark">
                                            <svg
                                                viewBox="0 0 256 256"
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="w-5 h-5 fill-main-text-light dark:fill-main-text-dark"
                                            >
                                                <path d="M128 0C57.3 0 0 57.3 0 128s57.3 128 128 128 128-57.3 128-128S198.7 0 128 0zm62 91h-46v24.3c37.6 1.9 66 10 66 19.7 0 9.7-28.4 17.8-66 19.7V201h-32v-46.3c-37.6-1.9-66-10-66-19.7 0-9.7 28.4-17.8 66-19.7V91H66V63h124v28zm-78 35.2v25.2c-33.6-1.6-58-6.6-58-12.6 0-6 24.4-11 58-12.6zm32 25.2v-25.2c33.6 1.6 58 6.6 58 12.6 0 6-24.4 11-58 12.6z" />
                                            </svg>
                                        </div>
                                        <span className="text-xs font-normal text-sub-text-light dark:text-sub-text-dark">
                                            {__('Crypto')}
                                        </span>
                                    </div>

                                    {/* Bank Transfer */}
                                    <div className="flex items-center gap-1.5">
                                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-surface-2-light dark:bg-surface-3-dark">
                                            <BuildingLibraryIcon className="w-6 h-6 fill-main-text-light dark:fill-main-text-dark" />
                                        </div>
                                        <span className="text-xs font-normal text-sub-text-light dark:text-sub-text-dark">
                                            {__('Bank Transfer')}
                                        </span>
                                    </div>
                                </div>
                                {/* Points */}
                                <div className="mt-2 flex items-center gap-1.5">
                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-surface-2-light dark:bg-surface-3-dark">
                                        <svg
                                            className="w-6 h-6 fill-main-text-light dark:fill-main-text-dark"
                                            viewBox="0 0 24 24"
                                        >
                                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27z" />
                                        </svg>
                                    </div>
                                    <span className="text-xs font-normal text-sub-text-light dark:text-sub-text-dark">
                                        {__('Points')}
                                    </span>
                                </div>
                            </div>
                        </>
                    }
                />
            </div>
        </div>
    );
};

const DetailRow = ({
    label,
    value,
    isLink = false,
    policy_slug,
    isDelivery,
    return_policy,
    LinkText,
    deliveryInfo,
    smartphone_slug,
    shipping_policy,
}) => (
    <div className="flex items-start gap-10 sm:gap-10 md:gap-10 xl:gap-12">
        <span className="flex-shrink-0 w-20 text-sm font-normal text-main-text-light dark:text-main-text-dark sm:w-24 md:w-28">
            {label}
        </span>
        <div className="flex-1 min-w-0">
            {isLink ? (
                return_policy ? (
                    <Link
                        onClick={() =>
                            useFeedCleanupStore.getState().setShouldCleanupBrowserHistory(false)
                        }
                        href={route('website.return-policy.index', {
                            slug: policy_slug,
                            smartphone_slug: smartphone_slug,
                        })}
                        className="block overflow-hidden text-sm text-sub-text-light hover:underline dark:text-sub-text-dark"
                    >
                        {value}
                    </Link>
                ) : shipping_policy ? (
                    <div className="flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:gap-2">
                       <span className="block overflow-hidden text-sm text-sub-text-light dark:text-sub-text-dark">
                            {value}

                             <Link
                            onClick={() =>
                                useFeedCleanupStore.getState().setShouldCleanupBrowserHistory(false)
                            }
                            href={route('website.shipping-policy.index', {
                                slug: policy_slug,
                                smartphone_slug: smartphone_slug,
                            })}
                            className="block overflow-hidden text-sm text-sub-text-light hover:underline dark:text-sub-text-dark"
                        >
                            {LinkText}
                        </Link>
                        </span>

                    </div>
                ) : (
                    <span className="block overflow-hidden text-sm text-sub-text-light dark:text-sub-text-dark">
                        {value}
                    </span>
                )
            ) : isDelivery ? (
                <>
                    <span className="block overflow-hidden text-sm text-sub-text-light dark:text-sub-text-dark">
                        {value}
                    </span>

                    <span className="block overflow-hidden text-sm text-sub-text-light dark:text-sub-text-dark">
                        {deliveryInfo}
                    </span>
                </>
            ) : (
                <span className="block overflow-hidden text-sm text-sub-text-light dark:text-sub-text-dark">
                    {value}
                </span>
            )}
        </div>
    </div>
);

export default SmartphoneDetails;
