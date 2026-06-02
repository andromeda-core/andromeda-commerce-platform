import LinkButton from '@/Components/LinkButton';
import PrimaryButton from '@/Components/PrimaryButton';
import { Head, usePage } from '@inertiajs/react';
import html2pdf from 'html2pdf.js';
import React, { useState } from 'react';
import QRCode from 'react-qr-code';

export default function ShippingInvoice({ order }) {
    const { generalSetting, currency, asset } = usePage().props;
    const [processing, setProcessing] = useState(false);
    const handleInvoiceDownload = () => {
        setProcessing(true);

        const opt = {
            margin: 0,
            filename: 'shipping-invoice.pdf',
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
            <Head title="Shipping Invoice" />

            <div className="mx-auto flex w-auto flex-wrap items-center justify-center gap-4 lg:w-[600px] lg:flex-nowrap print:hidden">
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

                <LinkButton
                    Text={'Back'}
                    URL={route('dashboard.orders.show', order.id)}
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
            </div>

            <div id="invoice" className="mx-auto min-h-screen max-w-[1100px] bg-white shadow-lg">
                {/* Header */}
                <div className="bg-emerald-600 p-4 text-white sm:p-6 lg:p-8">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex-1">
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg sm:h-14 sm:w-14">
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
                            <h1 className="text-xl font-bold sm:text-2xl">
                                {generalSetting?.app_name}
                            </h1>

                            <div className="mt-3 space-y-1 text-sm">
                                <p className="break-all text-sm text-white sm:text-base">
                                    {order.customer?.user?.email}
                                </p>
                                <p className="break-words text-sm text-white sm:text-base">
                                    {order.customer?.user?.phone}
                                </p>
                            </div>
                        </div>

                        <div className="lg:flex-shrink-0 lg:text-right">
                            <h2 className="text-2xl font-bold sm:text-3xl">SHIPPING INVOICE</h2>
                            <div className="mt-4 rounded-lg bg-white bg-opacity-20 p-3 text-white">
                                <p className="text-sm">Invoice No:</p>
                                <p className="text-lg font-bold">#{order.order_no}</p>
                                <p className="mt-2 text-sm">Date: {order.added_at}</p>
                                <p className="text-sm">
                                    Status:{' '}
                                    <span className="font-medium">
                                        {order.status.replace(/_/g, ' ').toUpperCase()}
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Receiver Info */}
                <div className="grid grid-cols-1 gap-6 border-b border-gray-200 p-4 sm:p-6 lg:grid-cols-1 lg:p-8">
                    {/* Receiver */}
                    <div className="rounded-lg border-2 border-gray-300 p-4">
                        <h3 className="mb-4 border-b pb-2 text-lg font-bold text-gray-800">
                            📥 RECEIVER DETAILS
                        </h3>

                        {/* Name */}
                        <p className="text-sm font-medium">{order?.shipping_name || ''}</p>

                        {/* Address */}
                        <p className="text-sm">
                            {order?.shipping_address_line1 || ''}
                            {', '}
                            {order?.shipping_address_line2 || ''}
                        </p>

                        {/* City / State / Postal */}
                        <p className="text-sm">
                            {order?.shipping_city || ''}
                            {', '}
                            {order?.shipping_state || ''} {order?.shipping_postal_code || ''}{' '}
                            {order?.shipping_country || ''}
                        </p>

                        {/* Phone */}
                        <div className="mt-2 grid grid-cols-2 gap-4">
                            <p className="text-sm">📞 {order?.shipping_phone || ''}</p>
                        </div>
                    </div>
                </div>

                {/* Shipment Info */}
                <div className="grid grid-cols-1 items-center gap-6 border-b border-gray-200 p-4 sm:p-6 md:grid-cols-3 lg:p-8">
                    {/* Tracking */}
                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-center">
                        <p className="text-xs font-semibold uppercase text-blue-600">Tracking No</p>
                        <p className="whitespace-normal break-words text-lg font-bold text-blue-800">
                            {order?.tracking_no || 'N/A'}
                        </p>
                    </div>

                    {/* Ship Date */}
                    <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-center">
                        <p className="text-xs font-semibold uppercase text-green-600">Ship Date</p>
                        <p className="whitespace-normal break-words text-lg font-bold text-green-800">
                            {order?.shipping_date || 'N/A'}
                        </p>
                    </div>

                    {/* Courier */}
                    <div className="rounded-lg border border-purple-200 bg-purple-50 p-4 text-center">
                        <p className="text-xs font-semibold uppercase text-purple-600">
                            Courier Company
                        </p>
                        <p className="whitespace-normal break-words text-lg font-bold text-purple-800">
                            {order?.courier_company || 'N/A'}
                        </p>
                    </div>
                </div>

                {/* Package Contents */}
                <div className="border-b border-gray-200 p-4 sm:p-6 lg:p-8">
                    <h3 className="mb-4 text-lg font-bold text-gray-800">📦 PACKAGE CONTENTS</h3>

                    {/* Desktop Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full table-fixed border border-gray-300">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="border px-4 py-2 text-left text-gray-700">
                                        Item
                                    </th>
                                    <th className="border px-4 py-2 text-center text-gray-700">
                                        Qty
                                    </th>
                                    <th className="border px-4 py-2 text-right text-gray-700">
                                        Unit Value
                                    </th>
                                    <th className="border px-4 py-2 text-right text-gray-700">
                                        Total
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {order.order_items?.map((item, i) => {
                                    const addonsTotal =
                                        item.smartphone_addons?.reduce(
                                            (sum, addon) => sum + Number(addon.total_price),
                                            0,
                                        ) || 0;

                                    const declaredValue = Number(item.sub_total) + addonsTotal;

                                    return (
                                        <React.Fragment key={i}>
                                            {/* MAIN ITEM ROW */}
                                            <tr className="hover:bg-gray-50">
                                                <td className="border px-4 py-3 align-top text-gray-900">
                                                    <p className="font-medium">
                                                        {item?.smartphone?.model_name?.name}
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        {item?.smartphone?.capacity?.name ||
                                                            'Standard'}
                                                    </p>
                                                </td>

                                                <td className="border px-4 py-3 text-center text-gray-900">
                                                    {item.quantity}
                                                </td>

                                                <td className="border px-4 py-3 text-right text-gray-900">
                                                    {currency?.symbol}
                                                    {Number(item.unit_price).toLocaleString(
                                                        'en-US',
                                                    )}
                                                </td>

                                                <td className="border px-4 py-3 text-right font-semibold text-gray-900">
                                                    {currency?.symbol}
                                                    {Number(declaredValue).toLocaleString('en-US')}
                                                </td>
                                            </tr>

                                            {/* BREAKDOWN ROW */}
                                            <tr className="bg-gray-50">
                                                <td
                                                    colSpan={4}
                                                    className="border px-4 py-2 text-sm text-gray-600"
                                                >
                                                    <div className="space-y-1">
                                                        {/* Product total */}
                                                        <div className="flex justify-between">
                                                            <span>Product Value</span>
                                                            <span>
                                                                {currency?.symbol}
                                                                {Number(
                                                                    item.unit_price * item.quantity,
                                                                ).toLocaleString('en-US')}
                                                            </span>
                                                        </div>

                                                        {/* Shipping */}
                                                        {Number(item.shipping_cost) > 0 && (
                                                            <div className="flex justify-between">
                                                                <span>Shipping Cost</span>
                                                                <span>
                                                                    {currency?.symbol}
                                                                    {Number(
                                                                        item.shipping_cost,
                                                                    ).toLocaleString('en-US')}
                                                                </span>
                                                            </div>
                                                        )}

                                                        {/* Import tax */}
                                                        {Number(item.import_cost) > 0 && (
                                                            <div className="flex justify-between">
                                                                <span>Import / Customs Tax</span>
                                                                <span>
                                                                    {currency?.symbol}
                                                                    {Number(
                                                                        item.import_cost,
                                                                    ).toLocaleString('en-US')}
                                                                </span>
                                                            </div>
                                                        )}

                                                        {/* Add-ons */}
                                                        {item.smartphone_addons?.length > 0 && (
                                                            <div className="mt-2 border-t border-dashed pt-2">
                                                                <p className="text-xs font-semibold text-gray-700">
                                                                    Add-ons
                                                                </p>

                                                                {item.smartphone_addons.map(
                                                                    (addon) => (
                                                                        <div
                                                                            key={addon.id}
                                                                            className="flex justify-between text-sm"
                                                                        >
                                                                            <span>
                                                                                {addon.name} ×{' '}
                                                                                {addon.quantity}
                                                                            </span>
                                                                            <span>
                                                                                {currency?.symbol}
                                                                                {Number(
                                                                                    addon.total_price,
                                                                                ).toLocaleString(
                                                                                    'en-US',
                                                                                )}
                                                                            </span>
                                                                        </div>
                                                                    ),
                                                                )}

                                                                <div className="flex justify-between pt-1 font-medium">
                                                                    <span>Add-ons Total</span>
                                                                    <span>
                                                                        {currency?.symbol}
                                                                        {Number(
                                                                            addonsTotal,
                                                                        ).toLocaleString('en-US')}
                                                                    </span>
                                                                </div>
                                                            </div>
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
                </div>

                {/* Footer */}
                <div className="border-t bg-gray-100 p-4 text-center page-break sm:p-6">
                    <div className="flex flex-col items-center gap-4 lg:flex-row lg:justify-center">
                        <div className="flex flex-col items-center">
                            <QRCode
                                value={route('orders.shipping-invoice', order.order_no)}
                                size={130}
                                viewBox="0 0 256 256"
                            />
                            <p className="text-md mt-1 text-gray-500">
                                Scan to Verify Shipping Invoice
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
