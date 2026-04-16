import PrimaryButton from '@/Components/PrimaryButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import html2pdf from 'html2pdf.js';
import React, { useState } from 'react';

export default function ShippingLabels({ order }) {
    const [processing, setProcessing] = useState(false);

    const distributor = order?.order_items[0]?.smartphone?.category?.distributor;

    const handlePrintLabels = () => {
        window.print();
    };

    const handleDownloadPDF = () => {
        setProcessing(true);

        const opt = {
            margin: 0.2,
            filename: `shipping-labels-${order.order_no}.pdf`,
            image: { type: 'jpeg', quality: 1 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: {
                unit: 'in',
                format: [3.5, 12],
                orientation: 'portrait',
            },
        };

        const element = document.getElementById('shipping-labels');
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
        <AuthenticatedLayout allHidden={true}>
            <Head title={`Shipping Labels - ${order.order_no}`} />

            {/* Action Buttons */}
            <div className="mx-auto mb-4 flex w-auto flex-wrap items-center justify-center gap-4 lg:w-[600px] lg:flex-nowrap print:hidden">
                <PrimaryButton
                    Text={'Print Labels'}
                    Action={handlePrintLabels}
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
                    Action={handleDownloadPDF}
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
            </div>

            {/* Labels Container */}
            <div id="shipping-labels" className="mx-auto w-full max-w-[3.5in] bg-white">
                {/* LABEL 1 */}
                <div className="label-container w-full px-3 py-3">
                    <div className="mb-3 rounded border-2 border-black bg-gray-100 p-2 text-center">
                        <div className="text-sm font-bold">Order #{order.order_no}</div>
                        <div className="text-xs text-gray-600">
                            {new Date(order.created_at).toLocaleDateString()}
                        </div>
                    </div>

                    <div className="mb-3 rounded border-2 border-black p-2.5">
                        <h3 className="mb-2 border-b-2 border-black pb-1 text-xs font-bold">
                            FROM
                        </h3>
                        <div className="space-y-1 text-xs">
                            <div>
                                <span className="font-semibold">Name: </span>
                                <span className="break-words">
                                    {distributor?.user?.name || 'N/A'}
                                </span>
                            </div>
                            <div>
                                <span className="font-semibold">Address:</span>
                                <div className="mt-0.5 break-words">
                                    {distributor?.address || 'N/A'}
                                </div>
                            </div>
                            <div>
                                <span className="font-semibold">Postal Code: </span>
                                <span>{distributor?.postal_code || 'N/A'}</span>
                            </div>
                            <div>
                                <span className="font-semibold">Phone: </span>
                                <span>{distributor?.user?.phone || 'N/A'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="mb-2 rounded border-2 border-black p-2.5">
                        <h3 className="mb-2 border-b-2 border-black pb-1 text-xs font-bold">TO</h3>
                        <div className="space-y-1 text-xs">
                            <div>
                                <span className="font-semibold">Name: </span>
                                <span className="break-words">
                                    {order?.courier_company || 'N/A'}
                                </span>
                            </div>
                            <div>
                                <span className="font-semibold">Address:</span>
                                <div className="mt-0.5 break-words">
                                    {order?.courier_company_address || 'N/A'}
                                </div>
                            </div>
                            <div>
                                <span className="font-semibold">Postal Code: </span>
                                <span>{order?.courier_company_postal_code || 'N/A'}</span>
                            </div>
                            <div>
                                <span className="font-semibold">Phone: </span>
                                <span>{order?.courier_company_phone || 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="my-5 border-t-2 border-dashed border-gray-400"></div>

                {/* LABEL 2 */}
                <div className="label-container w-full px-3 py-3">
                    <div className="mb-3 rounded border-2 border-black bg-gray-100 p-2 text-center">
                        <div className="text-sm font-bold">Order #{order.order_no}</div>
                        <div className="text-xs text-gray-600">
                            {new Date(order.created_at).toLocaleDateString()}
                        </div>
                    </div>

                    <div className="mb-3 rounded border-2 border-black p-2.5">
                        <h3 className="mb-2 border-b-2 border-black pb-1 text-xs font-bold">
                            FROM
                        </h3>
                        <div className="space-y-1 text-xs">
                            <div>
                                <span className="font-semibold">Name: </span>
                                <span className="break-words">
                                    {distributor?.user?.name || 'N/A'}
                                </span>
                            </div>
                            <div>
                                <span className="font-semibold">Address:</span>
                                <div className="mt-0.5 break-words">
                                    {distributor?.address || 'N/A'}
                                </div>
                            </div>
                            <div>
                                <span className="font-semibold">Postal Code: </span>
                                <span>{distributor?.postal_code || 'N/A'}</span>
                            </div>
                            <div>
                                <span className="font-semibold">Phone: </span>
                                <span>{distributor?.user?.phone || 'N/A'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="mb-2 rounded border-2 border-black p-2.5">
                        <h3 className="mb-2 border-b-2 border-black pb-1 text-xs font-bold">TO</h3>
                        <div className="space-y-1 text-xs">
                            <div>
                                <span className="font-semibold">Name: </span>
                                <span className="break-words">
                                    {order?.courier_company || 'N/A'}
                                </span>
                            </div>
                            <div>
                                <span className="font-semibold">Address:</span>
                                <div className="mt-0.5 break-words">
                                    {order?.courier_company_address || 'N/A'}
                                </div>
                            </div>
                            <div>
                                <span className="font-semibold">Postal Code: </span>
                                <span>{order?.courier_company_postal_code || 'N/A'}</span>
                            </div>
                            <div>
                                <span className="font-semibold">Phone: </span>
                                <span>{order?.courier_company_phone || 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                @media print {
                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }

                    @page {
                        size: 4in auto;
                        margin: 0.25in; /*  Equal margins all sides */
                    }

                    html,
                    body {
                        width: 100%;
                        margin: 0;
                        padding: 0;
                    }

                    #shipping-labels {
                        width: 3.5in !important;
                        max-width: 3.5in !important;
                        margin: 0 auto !important; /* ✅ Auto margins = centered */
                        padding: 0 !important;
                    }

                    .label-container {
                        width: 100% !important;
                        padding: 0.2in 0.15in !important;
                        page-break-inside: avoid;
                    }
                }
            `}</style>
        </AuthenticatedLayout>
    );
}
