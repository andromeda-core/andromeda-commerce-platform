import { useTranslation } from '@/Hooks/useTranslation';
import { BuildingLibraryIcon } from '@heroicons/react/24/solid';
import { Link, usePage } from '@inertiajs/react';

const SmartphoneDetails = ({ currency, product, StockBadge }) => {

    const { generalSetting } = usePage().props;

    const { __ } = useTranslation();

    const calculateShippingCost = () => {
        if (!product?.selling_info?.shipping_fee) return __('Free');

        const { value_type, default_value } = product?.selling_info?.shipping_fee;

        if (!default_value || default_value === 0) return __('Free');


        if (value_type === 'fixed') {
            return `${currency?.symbol}${parseFloat(default_value).toFixed(2)}`;
        }


        if (value_type === 'percentage') {
            const shippingCost = (product.selling_info?.total_price * default_value) / 100;
            return `${currency?.symbol}${shippingCost.toFixed(2)} (${default_value}%)`;
        }

        return __('Free');
    };


    const calculateImportCost = () => {
        const noTaxMessage = __("Import fees may apply on delivery");

        if (!product?.selling_info?.import_tax) return noTaxMessage;

        const { value_type, default_value } = product?.selling_info?.import_tax;

        if (!default_value || default_value === 0) return noTaxMessage;


        if (value_type === 'fixed') {
            return `${currency?.symbol}${parseFloat(default_value).toFixed(2)}`;
        }


        if (value_type === 'percentage') {
            const shippingCost = (product.selling_info?.total_price * default_value) / 100;
            return `${currency?.symbol}${shippingCost.toFixed(2)} (${default_value}%)`;
        }

        return noTaxMessage;
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
            <h2 className="mb-6 xl:text-3xl text-[18px] font-semibold text-main-text-light dark:text-main-text-dark">
                {currency?.name} {currency?.symbol}{product.selling_info?.total_price || "N/A"}
            </h2>

            <div className="space-y-4">
                {/* Country/Region */}
                <DetailRow label={__("Mode/Product")} value={product?.name || "N/A"} />
                <DetailRow label={__("Color")} value={product?.colors?.[0]?.name || "N/A"} />
                <DetailRow label={__("Storage Size")} value={product?.capacity || "N/A"} />
                <DetailRow label={__("Country/Region")} value={product?.country?.name || "N/A"} />

                {/* Condition */}
                <DetailRow label={__("Condition")} value={product?.condition?.name || "N/A"} />

                {/* Shipping */}
                <DetailRow label={__("Shipping")} value={calculateShippingCost()} />

                {/* Import fees */}
                <DetailRow label={__("Import fees") + ":"} value={calculateImportCost()} />

                {/* Delivery */}
                <DetailRow label={__("Delivery Time")} value={__('Within') + ' ' + product?.delivery_days + " " + __('Days')} isDelivery={true} deliveryInfo={generalSetting?.app_product_delivery_info} />

                {/* Courier */}
                <DetailRow label={__("Courier")} value={product?.courier_company?.courier_name || "N/A"} />


                {/* Stock */}
                <DetailRow label={__("Stock")} value={StockBadge || "N/A"} />

                {/* Returns */}
                {product?.return_policy && <DetailRow label={__("Returns")} value={__("View Return Policy") + " >"} isLink={true} policy_slug={product?.return_policy?.slug} />}

                {/* Payments */}
                <DetailRow label={__("Payments")} value={
                    <>
                        <div className="grid grid-cols-1 gap-2 lg:grid-cols-1">
                            <div className="flex flex-wrap items-center gap-4">
                                {/* Bitcoin */}
                                <div className="flex items-center gap-1.5">
                                    <div className="flex items-center justify-center w-7 h-7 bg-[#EE7B1A] rounded-full ">
                                        <span className="text-lg font-bold text-white">₿</span>
                                    </div>
                                    <span className="text-xs font-normal text-sub-text-light dark:text-sub-text-dark">{__('Bitcoin')}</span>
                                </div>

                                {/* Bank Transfer */}
                                <div className="flex items-center gap-1.5">
                                    <div className="flex items-center justify-center bg-blue-600 rounded-full w-7 h-7 ">
                                        <BuildingLibraryIcon className="text-white size-5" />
                                    </div>
                                    <span className="text-xs font-normal text-sub-text-light dark:text-sub-text-dark">{__('Bank Transfer')}</span>
                                </div>
                            </div>
                            {/* Points */}
                            <div className="flex items-center gap-1.5 mt-2">
                                <div className="flex items-center justify-center w-7 h-7 bg-[#C79F62] rounded-full ">
                                    <svg className="text-white fill-current size-5" viewBox="0 0 24 24">
                                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27z" />
                                    </svg>
                                </div>
                                <span className="text-xs font-normal text-sub-text-light dark:text-sub-text-dark">{__('Points')}</span>
                            </div>
                        </div>
                    </>
                } />

            </div>
        </div>
    );
};


const DetailRow = ({ label, value, isLink = false, policy_slug, isDelivery, deliveryInfo }) => (
    <div className="flex items-start gap-10 xl:gap-12 sm:gap-10 md:gap-10">
        <span className="flex-shrink-0 w-20 text-sm font-normal sm:w-24 md:w-28 text-main-text-light dark:text-main-text-dark">
            {label}
        </span>
        <div className="flex-1 min-w-0">
            {isLink ? (
                <Link
                    href={route('website.return-policy.index', encodeURIComponent(policy_slug))}
                    className="block overflow-hidden text-sm text-sub-text-light dark:text-sub-text-dark hover:underline"
                >
                    {value}
                </Link>
            ) : (
                (isDelivery ?
                    (
                        <>
                            <span className="block overflow-hidden text-sm text-sub-text-light dark:text-sub-text-dark">
                                {value}
                            </span>

                            <span className="block overflow-hidden text-sm text-sub-text-light dark:text-sub-text-dark">
                                {deliveryInfo}
                            </span>
                        </>
                    )
                    : (
                        <span className="block overflow-hidden text-sm text-sub-text-light dark:text-sub-text-dark">
                            {value}
                        </span>
                    ))
            )}
        </div>
    </div>
);


export default SmartphoneDetails;
