import LinkButton from '@/Components/LinkButton';
import PrimaryButton from '@/Components/PrimaryButton';
import { Head, router, usePage } from '@inertiajs/react';
import html2pdf from 'html2pdf.js';
import React, { useState } from 'react';
import QRCode from 'react-qr-code';

export default function CustomerOrderInvoice({ order }) {
    const { generalSetting, currency, asset, auth } = usePage().props;

    const [processing, setProcessing] = useState(false);
    const handleInvoiceDownload = () => {
        setProcessing(true);

        const opt = {
            margin: 0,
            filename: 'invoice.pdf',
            image: { type: 'jpeg', quality: 1 },
            html2canvas: { scale: 3, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        };

        const element = document.getElementById('invoice');
        html2pdf()
            .set(opt)
            .from(element)
            .save()
            .then(() => {
                setProcessing(false);
            })
            .catch((err) => {
                console.error('PDF generation failed:', err);
                setProcessing(false);
            });
    };

    return (
        <>
            <Head title={`Order - Customer Invoice - ${order.order_no}`} />

            <div className="mx-auto flex lg:flex-nowrap flex-wrap w-auto items-center justify-center gap-4 lg:w-[600px] print:hidden">
                <PrimaryButton
                    Text={'Print'}
                    Action={() => window.print()}
                    Icon={
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
                                d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5Zm-3 0h.008v.008H15V10.5Z"
                            />
                        </svg>
                    }
                />
                <PrimaryButton
                    Text={'Save As PDF'}
                    Action={() => handleInvoiceDownload()}
                    Disabled={processing}
                    Spinner={processing}
                    Icon={
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
                                d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                            />
                        </svg>
                    }
                />
                {auth?.user ? (
                    <>
                        {auth?.user?.role === 'Admin' ? (
                            <PrimaryButton
                                Text={'Back'}
                                Action={() => router.get(route('dashboard.orders.show', order.id))}
                                Icon={
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
                                            d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"
                                        />
                                    </svg>
                                }
                            />
                        ) : (
                            <PrimaryButton
                                Text={'Back'}
                                Action={() => router.get(route('home'))}
                                Icon={
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
                                            d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"
                                        />
                                    </svg>
                                }
                            />
                        )}




                    </>
                ) : (
                    <LinkButton
                        Text={'Back'}
                        URL={route('home')}
                        Icon={
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
                                    d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"
                                />
                            </svg>
                        }
                    />
                )}



            </div>
            <div id="invoice" className="mx-auto min-h-screen max-w-[1100px] bg-white shadow-lg">
                {/* Header */}
                <div className="p-4 text-white bg-gray-800 sm:p-6 lg:p-8">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between lg:gap-4">
                        <div className="flex-1">
                            <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-lg sm:h-14 sm:w-14">
                                <img
                                    crossOrigin="anonymous"
                                    src={
                                        generalSetting?.app_main_logo_dark
                                            ? generalSetting?.app_main_logo_dark
                                            : asset + 'assets/images/Logo/256w.png'
                                    }
                                    loading="eager"
                                    alt="Logo"
                                    width={56}
                                    height={56}
                                    style={{ display: 'block' }}
                                />
                            </div>
                            <h1 className="text-xl font-bold break-words sm:text-2xl">
                                {generalSetting.app_name}
                            </h1>
                            <div className="mt-2 space-y-1">
                                <p className="text-sm text-white break-all sm:text-base">
                                    {order.customer?.user?.email}
                                </p>
                                <p className="text-sm text-white break-words sm:text-base">
                                    {order.customer?.user?.phone}
                                </p>
                            </div>
                        </div>
                        <div className="text-left lg:flex-shrink-0 lg:text-right">
                            <h2 className="text-2xl font-bold sm:text-3xl">INVOICE</h2>
                            <div className="text-left lg:flex-shrink-0 lg:text-right">
                                <div className="mt-4 text-white rounded-lg">
                                    <p className="text-sm">Invoice No:</p>
                                    <p className="text-lg font-bold">#{order.order_no}</p>
                                    <p className="mt-2 text-sm">Date: {order.added_at}</p>
                                </div>
                                <p className="text-sm">
                                    Status: <span className="font-medium">{order.status}</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Customer Info */}
                <div className="p-4 border-b border-gray-200 sm:p-6 lg:p-8">
                    <h3 className="mb-4 text-lg font-semibold text-gray-700">Shipping Details:</h3>
                    <div className="p-4 rounded-lg bg-gray-50 sm:p-5">
                        <div className="space-y-1">
                            <p className="text-sm font-semibold text-gray-900 break-words sm:text-base">
                                {order?.shipping_name || ''}
                            </p>

                            <p className="text-sm text-gray-600 break-words sm:text-base">
                                {order?.shipping_address_line1 || ''}
                                {', '}
                                {order?.shipping_address_line2 || ''}
                            </p>
                            <p className="text-sm text-gray-600 break-words sm:text-base">
                                {order?.shipping_city || ''}
                            </p>

                            <p className="text-sm text-gray-600 break-words sm:text-base">
                                {order?.shipping_state || ''}
                            </p>

                            <p className="text-sm text-gray-600 break-words sm:text-base">
                                {order?.shipping_postal_code || ''}
                            </p>

                            <p className="text-sm text-gray-600 break-words sm:text-base">
                                {order?.shipping_country || ''}
                            </p>

                            <p className="mt-2 text-sm text-gray-600 break-all sm:text-base">
                                {order?.shipping_phone || ''}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Items Table */}
                <div className="p-4 sm:p-6 lg:p-8">
                    {/* Desktop Table View */}
                    <div className="block overflow-x-auto">
                        <table className="w-full min-w-[600px]">
                            <thead>
                                <tr className="border-b-2 border-gray-300">
                                    <th className="px-2 py-3 text-sm font-semibold text-left text-gray-700 lg:text-base">
                                        Product
                                    </th>
                                    <th className="px-2 py-3 text-sm font-semibold text-left text-gray-700 lg:text-base">
                                        Capacity
                                    </th>
                                    <th className="px-2 py-3 text-sm font-semibold text-right text-gray-700 lg:text-base">
                                        Price
                                    </th>
                                    <th className="px-2 py-3 text-sm font-semibold text-center text-gray-700 lg:text-base">
                                        Qty
                                    </th>
                                    <th className="px-2 py-3 text-sm font-semibold text-right text-gray-700 lg:text-base">
                                        Total
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {order?.order_items.map((item, index) => {
                                    const addonsTotal =
                                        item.smartphone_addons?.reduce(
                                            (sum, addon) => sum + Number(addon.total_price),
                                            0
                                        ) || 0;

                                    const itemGrandTotal = Number(item.sub_total) + addonsTotal;

                                    return (
                                        <React.Fragment key={index}>

                                            <tr className="border-b border-gray-200">
                                                <td className="px-2 py-4 text-sm font-medium text-gray-900">
                                                    {item.inventory_item?.smartphone?.model_name?.name}
                                                </td>

                                                <td className="px-2 py-4 text-sm text-gray-600">
                                                    {item.inventory_item?.smartphone?.capacity?.name}
                                                </td>

                                                <td className="px-2 py-4 text-sm text-right text-gray-900">
                                                    {currency?.symbol}
                                                    {item.unit_price}
                                                </td>

                                                <td className="px-2 py-4 text-sm text-center text-gray-900">
                                                    {item.quantity}
                                                </td>

                                                <td className="px-2 py-4 text-sm font-bold text-right text-gray-900">
                                                    {currency?.symbol}
                                                    {itemGrandTotal.toFixed(2)}
                                                </td>
                                            </tr>


                                            <tr className="bg-gray-50">
                                                <td colSpan={5} className="px-4 py-3 text-sm text-gray-600">
                                                    <div className="space-y-1">
                                                        <div className="flex justify-between">
                                                            <span>
                                                                Product ({item.unit_price} × {item.quantity})
                                                            </span>
                                                            <span>
                                                                {currency?.symbol}
                                                                {(item.unit_price * item.quantity).toFixed(2)}
                                                            </span>
                                                        </div>

                                                        <div className="flex justify-between">
                                                            <span>Shipping</span>
                                                            <span>
                                                                {currency?.symbol}
                                                                {Number(item.shipping_cost || 0).toFixed(2)}
                                                            </span>
                                                        </div>

                                                        <div className="flex justify-between">
                                                            <span>Import Tax</span>
                                                            <span>
                                                                {currency?.symbol}
                                                                {Number(item.import_cost || 0).toFixed(2)}
                                                            </span>
                                                        </div>

                                                        {/* ADDONS BREAKDOWN */}
                                                        {item.smartphone_addons?.length > 0 && (
                                                            <>
                                                                <div className="pt-2 mt-2 border-t border-dashed">
                                                                    <p className="text-xs font-semibold text-gray-700">
                                                                        Add-ons
                                                                    </p>

                                                                    {item.smartphone_addons.map((addon) => (
                                                                        <div
                                                                            key={addon.id}
                                                                            className="flex justify-between text-sm"
                                                                        >
                                                                            <span>
                                                                                {addon.name} × {addon.quantity}
                                                                            </span>
                                                                            <span>
                                                                                {currency?.symbol}
                                                                                {Number(addon.total_price).toFixed(2)}
                                                                            </span>
                                                                        </div>
                                                                    ))}

                                                                    <div className="flex justify-between pt-1 font-medium">
                                                                        <span>Add-ons total</span>
                                                                        <span>
                                                                            {currency?.symbol}
                                                                            {addonsTotal.toFixed(2)}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        </React.Fragment>
                                    );
                                })}
                            </tbody>

                        </table>
                    </div>

                    {/* Totals Section */}
                    <div className="flex justify-end mt-6 sm:mt-8">
                        <div className="w-full sm:w-80">
                            <div className="p-4 rounded-lg sm:p-6">
                                <div className="space-y-2">
                                    <div className="flex justify-between py-2">
                                        <span className="text-base font-semibold text-gray-900 sm:text-lg">
                                            Total:
                                        </span>
                                        <span className="text-base font-bold text-blue-600 break-words sm:text-lg">
                                            {currency?.symbol}
                                            {order.full_amount}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 text-center border-t bg-gray-50 page-break sm:p-6 lg:p-8">
                    {/* QR Code Section */}
                    <div className="flex justify-center mt-8 mb-6 sm:mb-8 sm:mt-12">
                        <div className="text-center">
                            <div className="flex items-center justify-center w-24 h-24 mx-auto mb-3 bg-gray-200 border-2 border-gray-400 border-dashed sm:h-32 sm:w-32">
                                <QRCode
                                    className="w-full h-auto"
                                    value={route('orders.customer-order-invoice', order.order_no)}
                                    viewBox="0 0 256 256"
                                />
                            </div>
                            <p className="text-xs text-gray-500 sm:text-sm">
                                Scan To Verify Invoice
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
