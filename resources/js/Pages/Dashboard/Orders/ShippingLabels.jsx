import PrimaryButton from '@/Components/PrimaryButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import React, { useState } from 'react';

export default function ShippingLabels({ order }) {
    const [processing, setProcessing] = useState(false);
    const [pdfDownloading, setPdfDownloading] = useState(false);

    const distributor = order?.order_items?.[0]?.smartphone?.category?.distributor;

    const generateLabelsPdf = async () => {
        const jsPDFModule = await import('jspdf');
        const html2canvasModule = await import('html2canvas');

        const jsPDF = jsPDFModule.default;
        const html2canvas = html2canvasModule.default;

        const labelPages = Array.from(document.querySelectorAll('.label-page'));

        if (!labelPages.length) {
            throw new Error('No label pages found.');
        }

        const pdf = new jsPDF({
            unit: 'mm',
            format: [80, 60],
            orientation: 'landscape',
            compress: true,
        });

        for (let i = 0; i < labelPages.length; i++) {
            const label = labelPages[i];

            const canvas = await html2canvas(label, {
                scale: 3,
                useCORS: true,
                backgroundColor: '#ffffff',
                logging: false,
            });

            const imgData = canvas.toDataURL('image/jpeg', 1.0);

            if (i > 0) {
                pdf.addPage([80, 60], 'landscape');
            }

            pdf.addImage(imgData, 'JPEG', 0, 0, 80, 60);
        }

        return pdf;
    };

    const handlePrintLabels = async () => {
        const printWindow = window.open('', '_blank');

        if (!printWindow) {
            alert('Please allow popups to print the labels.');
            return;
        }

        printWindow.document.write(`
        <html>
            <head>
                <title>Generating Labels PDF...</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        height: 100vh;
                        margin: 0;
                        background: #ffffff;
                        color: #111827;
                    }
                </style>
            </head>
            <body>
                <div>Generating labels PDF For Print, please wait...</div>
            </body>
        </html>
    `);
        printWindow.document.close();

        setProcessing(true);

        try {
            const pdf = await generateLabelsPdf();
            const blob = pdf.output('blob');
            const blobUrl = URL.createObjectURL(blob);

            const cleanup = () => {
                setTimeout(() => {
                    URL.revokeObjectURL(blobUrl);
                }, 60000);
            };

            printWindow.location.href = blobUrl;

            const tryPrint = () => {
                try {
                    printWindow.focus();
                    printWindow.print();
                } catch (error) {
                    console.error('Auto print failed:', error);
                } finally {
                    cleanup();
                }
            };

            printWindow.onload = () => {
                setTimeout(tryPrint, 800);
            };

            setTimeout(tryPrint, 1500);
        } catch (err) {
            console.error('Print PDF generation failed:', err);

            try {
                printWindow.document.body.innerHTML = `
                <div style="font-family: Arial, sans-serif; padding: 24px;">
                    Failed to generate the labels PDF.
                </div>
            `;
            } catch (_) {}
        } finally {
            setProcessing(false);
        }
    };

    const handleDownloadPDF = async () => {
        setPdfDownloading(true);

        try {
            const pdf = await generateLabelsPdf();
            pdf.save(`shipping-labels-${order.order_no}.pdf`);
        } catch (err) {
            console.error('PDF generation failed:', err);
        } finally {
            setPdfDownloading(false);
        }
    };

    return (
        <AuthenticatedLayout allHidden={true}>
            <Head title={`Shipping Labels - ${order.order_no}`} />

            <div className="mx-auto mb-4 flex w-auto flex-wrap items-center justify-center gap-4 lg:w-[600px] lg:flex-nowrap print:hidden">
                <PrimaryButton
                    Text={'Print Labels'}
                    Action={handlePrintLabels}
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
                                d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5Zm-3 0h.008v.008H15V10.5Z"
                            />
                        </svg>
                    }
                />

                <PrimaryButton
                    Text={'Save As PDF'}
                    Action={handleDownloadPDF}
                    Disabled={pdfDownloading}
                    Spinner={pdfDownloading}
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

            <div id="shipping-labels" className="mx-auto bg-white">
                {/* PAGE 1 - FROM ONLY (Distributor) */}
                <div className="label-page label-container px-3 py-3">
                    <div className="label-card rounded border-2 border-black p-3">
                        <h3 className="label-title mb-2 border-b-2 border-black pb-1.5 text-sm font-bold">
                            FROM
                        </h3>

                        <div className="label-content space-y-1.5 text-sm">
                            <div>
                                <span className="font-semibold">Name: </span>
                                <span className="break-words">
                                    {distributor?.user?.name || 'N/A'}
                                </span>
                            </div>

                            <div>
                                <span className="font-semibold">Address:</span>
                                <div className="label-address mt-0.5 break-words">
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
                </div>

                <div className="my-5 border-t-2 border-dashed border-gray-400 print:hidden"></div>

                {/* PAGE 2 - TO ONLY (Courier) */}
                <div className="label-page label-container px-3 py-3">
                    <div className="label-card rounded border-2 border-black p-3">
                        <h3 className="label-title mb-2 border-b-2 border-black pb-1.5 text-sm font-bold">
                            TO
                        </h3>

                        <div className="label-content space-y-1.5 text-sm">
                            <div>
                                <span className="font-semibold">Name: </span>
                                <span className="break-words">
                                    {order?.courier_company || 'N/A'}
                                </span>
                            </div>

                            <div>
                                <span className="font-semibold">Address:</span>
                                <div className="label-address mt-0.5 break-words">
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
                * {
                    box-sizing: border-box;
                }

                html,
                body {
                    margin: 0;
                    padding: 0;
                    background: #ffffff;
                }

                #shipping-labels {
                    width: 80mm;
                    max-width: 80mm;
                }

                .label-page {
                    width: 80mm;
                    height: 60mm;
                    padding: 3mm;
                    margin: 0 auto;
                    background: #ffffff;
                    overflow: hidden;
                    box-sizing: border-box;
                    display: block;
                    page-break-after: always;
                    page-break-inside: avoid;
                    break-after: page;
                    break-inside: avoid;
                }

                .label-page:last-child {
                    page-break-after: auto;
                    break-after: auto;
                }

                .label-card {
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                }

                .label-title {
                    flex-shrink: 0;
                }

                .label-content {
                    flex: 1;
                    min-height: 0;
                    overflow: hidden;
                }

                .label-address,
                .label-content,
                .label-content * {
                    overflow-wrap: anywhere;
                    word-break: break-word;
                }

                @page {
                    size: 80mm 60mm;
                    margin: 0;
                }

                @media print {
                    html,
                    body {
                        width: 80mm !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        background: #ffffff !important;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }

                    body * {
                        visibility: hidden;
                    }

                    #shipping-labels,
                    #shipping-labels * {
                        visibility: visible;
                    }

                    #shipping-labels {
                        width: 80mm !important;
                        max-width: 80mm !important;
                        margin: 0 !important;
                        padding: 0 !important;
                    }

                    .label-page {
                        width: 80mm !important;
                        height: 60mm !important;
                        min-width: 80mm !important;
                        max-width: 80mm !important;
                        min-height: 60mm !important;
                        max-height: 60mm !important;
                        padding: 3mm !important;
                        margin: 0 !important;
                        overflow: hidden !important;
                        box-sizing: border-box !important;
                        page-break-after: always !important;
                        page-break-inside: avoid !important;
                        break-after: page !important;
                        break-inside: avoid !important;
                    }

                    .label-page:last-child {
                        page-break-after: auto !important;
                        break-after: auto !important;
                    }

                    .label-page .rounded {
                        border-radius: 2mm !important;
                    }

                    .label-page .border-2 {
                        border-width: 0.5mm !important;
                    }

                    .label-page .p-3 {
                        padding: 2mm !important;
                    }

                    .label-page .px-3 {
                        padding-left: 3mm !important;
                        padding-right: 3mm !important;
                    }

                    .label-page .py-3 {
                        padding-top: 3mm !important;
                        padding-bottom: 3mm !important;
                    }

                    .label-page .pb-1\\.5 {
                        padding-bottom: 1mm !important;
                    }

                    .label-page .mb-2 {
                        margin-bottom: 1mm !important;
                    }

                    .label-page .space-y-1\\.5 > * + * {
                        margin-top: 0.8mm !important;
                    }

                    .label-page .mt-0\\.5 {
                        margin-top: 0.5mm !important;
                    }

                    .label-page .text-sm {
                        font-size: 7px !important;
                        line-height: 1.15 !important;
                    }

                    .label-page .font-bold {
                        font-weight: 700 !important;
                    }

                    .label-page .font-semibold {
                        font-weight: 600 !important;
                    }
                }
            `}</style>
        </AuthenticatedLayout>
    );
}
