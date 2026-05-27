import Card from '@/Components/Card';
import LinkButton from '@/Components/LinkButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BreadCrumb from '@/Components/BreadCrumb';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import PrimaryButton from '@/Components/PrimaryButton';
import Swal from 'sweetalert2';
import Toast from '@/Components/Toast';
import Placeholder from 'asset/assets/images/product/placeholder.jpg';
import { useTranslation } from '@/Hooks/useTranslation';
import PackageVerificationRecorder from '@/Components/PackageVerificationRecorder';
import { useConfirm } from '@/Hooks/useConfirm';
import Spinner from '@/Components/Spinner';
import can from '@/Hooks/useCan';

export default function show({ order, auth }) {
    const { currency } = usePage().props;
    const [downloading, setDownloading] = useState(false);
    const { __ } = useTranslation();
    const [ValidationErrors, setValidationErrors] = useState({});

    const { confirm, ConfirmDialog } = useConfirm();

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-500 text-white',
            paid: 'bg-blue-500 text-white',
            shipped: 'bg-pink-500 text-white',
            arrived_locally: 'bg-stone-500 text-white',
            delivered: 'bg-green-500 text-white',
            awaiting_payment: 'bg-indigo-500 text-white',
            failed: 'bg-red-500 text-white',
            expired: 'bg-gray-500 text-white',
        };
        return colors[status] || colors.pending;
    };

    const handleFileDownload = async (fileName, fileUrl) => {
        try {
            setDownloading(true);
            const response = await fetch(fileUrl, { mode: 'cors' });
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Download failed',
                text: error?.message || 'Unknown error',
            }).then((result) => {
                if (result.isConfirmed) window.open(fileUrl, '_blank');
            });
        } finally {
            setDownloading(false);
        }
    };

    const {
        data: package_video,
        setData: setPackageVideo,
        processing: packageVideoProcessing,
        post: postPackageVideo,
    } = useForm({ package_video: '', order_id: order.id });

    const [openRecorder, setOpenRecorder] = useState(false);
    const [videoIsntBeignUploadedYetOnAWS, setVideoIsntBeignUploadedYetOnAWS] = useState(false);
    const [verificationStatus, setVerificationStatus] = useState(null);
    const [verificationMessage, setVerificationMessage] = useState('');
    const [deleteingVideo, setDeletingVideo] = useState(null);
    const [togglingVideo, setTogglingVideo] = useState(null);

    useEffect(() => {
        if (package_video?.package_video) {
            postPackageVideo(route('dashboard.orders.packagerecordingstore'), {
                forceFormData: true,
                onError: (error) => {
                    setValidationErrors(error);
                    setTimeout(() => setValidationErrors({}), 5000);
                },
                onFinish: () => setPackageVideo('package_video', null),
            });
        }
    }, [package_video]);

    useEffect(() => {
        if (videoIsntBeignUploadedYetOnAWS) {
            const timer = setTimeout(() => setVideoIsntBeignUploadedYetOnAWS(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [videoIsntBeignUploadedYetOnAWS]);

    const deletePackageVideo = async (packageID) => {
        const result = await confirm({
            title: 'Confirm Delettion',
            text: 'Are you sure you want to Delete This Package Video?',
            icon: 'info',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'No',
        });

        if (result.isConfirmed) {
            setDeletingVideo(packageID);
            router.delete(route('dashboard.package-recordings.destroy', packageID), {
                onFinish: () => setDeletingVideo(null),
            });
        }
    };

    const togglePackageVideoVisibility = (packageID) => {
        setTogglingVideo(packageID);
        router.put(
            route('dashboard.package-recordings.toggle', packageID),
            {},
            {
                preserveScroll: true,
                onFinish: () => setTogglingVideo(null),
            },
        );
    };

    useEffect(() => {
        if (!auth?.user?.id) return;

        const channel = window.Echo.private(`user.${auth?.user?.id}`);

        channel.listen('.order-verification-success', (e) => {
            const mySocketId = window.Echo?.socketId();
            if (mySocketId && e.socket_id && e.socket_id === mySocketId) return;
            setVerificationMessage(e.message);
            setVerificationStatus('success');
        });

        return () => {
            window.Echo.leaveChannel(`user.${auth?.user?.id}`);
        };
    }, [auth?.user?.id]);

    return (
        <>
            <AuthenticatedLayout>
                <Head title="Orders" />

                <BreadCrumb
                    header={'View Order'}
                    parent={'Orders'}
                    parent_link={route('dashboard.orders.index')}
                    child={'View Order'}
                />

                <ConfirmDialog />
                {Object.keys(ValidationErrors).length > 0 && (
                    <Toast flash={{ error: Object.values(ValidationErrors)[0] }} />
                )}

                <div className="space-y-6">
                    {/* ── Order Header ── */}
                    <Card
                        Content={
                            <div className="p-6">
                                <div className="mb-6 flex flex-col lg:flex-row lg:items-center lg:justify-between">
                                    <div className="mb-4 lg:mb-0">
                                        <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white/90">
                                            Order: {order.order_no}
                                        </h1>
                                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-white/90">
                                            <span>Placed on {order.added_at}</span>
                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(order.status)}`}
                                            >
                                                {order.status.replace(/_/g, ' ').toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-4 lg:flex-nowrap">
                                        {order.status !== 'pending' && (
                                            <>
                                                <LinkButton
                                                    CustomClass={'w-[250px]'}
                                                    Text={'Customer Invoice'}
                                                    URL={route(
                                                        'orders.customer-order-invoice',
                                                        order.order_no,
                                                    )}
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
                                                                d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                                                            />
                                                        </svg>
                                                    }
                                                />

                                                <LinkButton
                                                    CustomClass={'w-[250px]'}
                                                    Text={'Shipping Label'}
                                                    URL={route(
                                                        'dashboard.orders.shipping-label',
                                                        order.id,
                                                    )}
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
                                                                d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z"
                                                            />
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                d="M6 6h.008v.008H6V6Z"
                                                            />
                                                        </svg>
                                                    }
                                                />

                                                <LinkButton
                                                    CustomClass={'w-[250px]'}
                                                    Text={'Shipping Invoice'}
                                                    URL={route(
                                                        'orders.shipping-invoice',
                                                        order.order_no,
                                                    )}
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
                                                                d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                                                            />
                                                        </svg>
                                                    }
                                                />
                                            </>
                                        )}
                                        <LinkButton
                                            Text={'Back To Orders'}
                                            URL={route('dashboard.orders.index')}
                                            Icon={
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    strokeWidth={1.5}
                                                    stroke="currentColor"
                                                    className="size-4"
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
                                </div>
                            </div>
                        }
                    />

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* ── Main Content ── */}
                        <div className="space-y-6 lg:col-span-2">
                            {/* Order Items */}
                            <Card
                                Content={
                                    <div className="p-6">
                                        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white/90">
                                            Order Items
                                        </h2>
                                        <div className="space-y-4">
                                            {order.order_items?.map((item) => {
                                                const addonsTotal =
                                                    item.smartphone_addons?.reduce(
                                                        (t, a) => t + Number(a.total_price),
                                                        0,
                                                    ) || 0;
                                                const finalItemTotal =
                                                    Number(item.sub_total) + addonsTotal;

                                                return (
                                                    <Card
                                                        key={item.id}
                                                        Content={
                                                            <div className="flex flex-col gap-4 rounded-md p-4 sm:flex-row sm:items-start">
                                                                {(item?.smartphone
                                                                    ?.smartphone_image_urls
                                                                    ?.length > 0 ||
                                                                    item?.smartphone
                                                                        ?.smartphone_video_urls
                                                                        ?.length > 0) && (
                                                                    <div className="relative h-24 w-24 cursor-pointer overflow-hidden rounded-md border-2 border-transparent bg-surface-1-light text-main-text-light dark:bg-surface-1-dark dark:text-main-text-dark">
                                                                        <img
                                                                            src={
                                                                                item?.smartphone
                                                                                    ?.smartphone_image_urls?.[0] ||
                                                                                item?.smartphone
                                                                                    ?.smartphone_video_urls[0]
                                                                                    ?.thumbnail_url ||
                                                                                Placeholder
                                                                            }
                                                                            alt={
                                                                                item?.smartphone
                                                                                    ?.model_name
                                                                                    ?.name
                                                                            }
                                                                            className="h-full w-full object-cover"
                                                                            loading="lazy"
                                                                            onError={(e) =>
                                                                                (e.target.src =
                                                                                    Placeholder)
                                                                            }
                                                                        />
                                                                    </div>
                                                                )}
                                                                <div className="flex-1 space-y-3">
                                                                    <div>
                                                                        <h3 className="text-base font-semibold text-main-text-light dark:text-main-text-dark">
                                                                            {item?.smartphone
                                                                                ?.model_name
                                                                                ?.name || 'N/A'}
                                                                        </h3>
                                                                        <div className="mt-1 flex flex-wrap gap-2 text-xs">
                                                                            {item?.smartphone
                                                                                ?.capacity
                                                                                ?.name && (
                                                                                <span className="rounded-md bg-surface-3-light px-2 py-0.5 text-sub-text-light dark:bg-surface-3-dark dark:text-sub-text-dark">
                                                                                    {
                                                                                        item
                                                                                            .smartphone
                                                                                            .capacity
                                                                                            .name
                                                                                    }
                                                                                </span>
                                                                            )}
                                                                            {item?.color?.name && (
                                                                                <span className="rounded-md bg-surface-3-light px-2 py-0.5 text-sub-text-light dark:bg-surface-3-dark dark:text-sub-text-dark">
                                                                                    {
                                                                                        item.color
                                                                                            .name
                                                                                    }
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                                                        <div className="flex justify-between">
                                                                            <span className="text-sub-text-light dark:text-sub-text-dark">
                                                                                UPC / EAN
                                                                            </span>
                                                                            <span className="font-medium text-main-text-light dark:text-main-text-dark">
                                                                                {item?.smartphone
                                                                                    ?.upc || 'N/A'}
                                                                            </span>
                                                                        </div>
                                                                        <div className="flex justify-between">
                                                                            <span className="text-sub-text-light dark:text-sub-text-dark">
                                                                                Quantity
                                                                            </span>
                                                                            <span className="font-medium text-main-text-light dark:text-main-text-dark">
                                                                                {item.quantity}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    <div className="space-y-1 border-t border-dashed border-surface-3-light pt-3 text-sm text-main-text-light dark:border-surface-3-dark dark:text-main-text-dark">
                                                                        <div className="flex justify-between">
                                                                            <span className="text-sub-text-light dark:text-sub-text-dark">
                                                                                Unit Price
                                                                            </span>
                                                                            <span>
                                                                                {currency?.symbol}
                                                                                {Number(
                                                                                    item.unit_price,
                                                                                ).toLocaleString(
                                                                                    'en-US',
                                                                                )}
                                                                            </span>
                                                                        </div>
                                                                        <div className="flex justify-between">
                                                                            <span className="text-sub-text-light dark:text-sub-text-dark">
                                                                                Product Total
                                                                            </span>
                                                                            <span>
                                                                                {currency?.symbol}
                                                                                {(
                                                                                    item.unit_price *
                                                                                    item.quantity
                                                                                ).toLocaleString(
                                                                                    'en-US',
                                                                                )}
                                                                            </span>
                                                                        </div>
                                                                        <div className="flex justify-between">
                                                                            <span className="text-sub-text-light dark:text-sub-text-dark">
                                                                                Shipping
                                                                            </span>
                                                                            <span>
                                                                                {currency?.symbol}
                                                                                {Number(
                                                                                    item.shipping_cost ||
                                                                                        0,
                                                                                ).toLocaleString(
                                                                                    'en-US',
                                                                                )}
                                                                            </span>
                                                                        </div>
                                                                        <div className="flex justify-between">
                                                                            <span className="text-sub-text-light dark:text-sub-text-dark">
                                                                                Import Tax
                                                                            </span>
                                                                            <span>
                                                                                {currency?.symbol}
                                                                                {Number(
                                                                                    item.import_cost ||
                                                                                        0,
                                                                                ).toLocaleString(
                                                                                    'en-US',
                                                                                )}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    {item.smartphone_addons
                                                                        ?.length > 0 && (
                                                                        <div className="border-t border-dashed border-surface-3-light pt-3 dark:border-surface-3-dark">
                                                                            <p className="mb-2 text-xs font-semibold text-sub-text-light dark:text-sub-text-dark">
                                                                                Add-ons
                                                                            </p>
                                                                            <div className="space-y-1 text-sm">
                                                                                {item.smartphone_addons.map(
                                                                                    (addon) => (
                                                                                        <div
                                                                                            key={
                                                                                                addon.id
                                                                                            }
                                                                                            className="flex justify-between"
                                                                                        >
                                                                                            <span className="text-sub-text-light dark:text-sub-text-dark">
                                                                                                {
                                                                                                    addon.name
                                                                                                }{' '}
                                                                                                ×{' '}
                                                                                                {
                                                                                                    addon.quantity
                                                                                                }
                                                                                            </span>
                                                                                            <span>
                                                                                                {
                                                                                                    currency?.symbol
                                                                                                }
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
                                                                                    <span className="text-sub-text-light dark:text-sub-text-dark">
                                                                                        Add-ons
                                                                                        Total
                                                                                    </span>
                                                                                    <span>
                                                                                        {
                                                                                            currency?.symbol
                                                                                        }
                                                                                        {Number(
                                                                                            addonsTotal,
                                                                                        ).toLocaleString(
                                                                                            'en-US',
                                                                                        )}
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                    <div className="mt-3 flex justify-between border-t border-surface-3-light pt-3 dark:border-surface-3-dark">
                                                                        <span className="text-sm font-semibold text-main-text-light dark:text-main-text-dark">
                                                                            Final Item Total
                                                                        </span>
                                                                        <span className="text-base font-bold text-main-text-light dark:text-main-text-dark">
                                                                            {currency?.symbol}
                                                                            {Number(
                                                                                finalItemTotal,
                                                                            ).toLocaleString(
                                                                                'en-US',
                                                                            )}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        }
                                                    />
                                                );
                                            })}
                                        </div>
                                    </div>
                                }
                            />

                            {/* Payment Proof & Courier Invoice */}
                            <Card
                                Content={
                                    <div className="p-6">
                                        <h2 className="mb-6 text-lg font-semibold text-gray-900 dark:text-white/90">
                                            Payment Proof & Courier Invoice
                                        </h2>
                                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                            {/* Payment Proof */}
                                            <div className="space-y-3">
                                                <h3 className="flex items-center text-sm font-medium text-gray-700 dark:text-white/80">
                                                    <div className="mr-2 h-2 w-2 rounded-full bg-green-500"></div>
                                                    Payment Proof
                                                </h3>
                                                {order.payment_proof ? (
                                                    <div className="group relative rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md dark:border-gray-700 dark:bg-deepcharcoal">
                                                        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
                                                            <svg
                                                                className="h-8 w-8 text-green-600 dark:text-green-400"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth="2"
                                                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                                />
                                                            </svg>
                                                        </div>
                                                        <p className="mb-4 truncate text-center text-sm font-medium text-gray-900 dark:text-white/90">
                                                            Payment Screenshot
                                                        </p>
                                                        <div className="flex justify-center space-x-2">
                                                            <a
                                                                href={order.payment_proof}
                                                                target="_blank"
                                                                className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-blue-600 transition-colors hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400"
                                                            >
                                                                <svg
                                                                    className="h-4 w-4"
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    viewBox="0 0 24 24"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        strokeWidth="2"
                                                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                                    />
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        strokeWidth="2"
                                                                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                                    />
                                                                </svg>
                                                            </a>
                                                            <button
                                                                onClick={() =>
                                                                    handleFileDownload(
                                                                        'Payment Proof',
                                                                        order.payment_proof,
                                                                    )
                                                                }
                                                                className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-50 text-gray-600 transition-colors hover:bg-gray-100 dark:bg-zinc-900/80 dark:text-gray-400"
                                                            >
                                                                <svg
                                                                    className="h-4 w-4"
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    viewBox="0 0 24 24"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        strokeWidth="2"
                                                                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                                    />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-6 text-center dark:border-gray-700 dark:bg-deepcharcoal">
                                                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 dark:bg-deepcharcoal">
                                                            <svg
                                                                className="h-6 w-6 text-gray-400"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth="2"
                                                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                                />
                                                            </svg>
                                                        </div>
                                                        {Number(order?.points_used) ===
                                                        Number(order?.full_amount) ? (
                                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                Paid with Points no proof required
                                                            </p>
                                                        ) : (
                                                            <>
                                                                <p className="text-sm font-medium text-gray-500 dark:text-white/60">
                                                                    No payment proof
                                                                </p>
                                                                <p className="mt-1 text-xs text-gray-400 dark:text-white/50">
                                                                    Upload pending
                                                                </p>
                                                            </>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Courier Invoice */}
                                            <div className="space-y-3">
                                                <h3 className="flex items-center text-sm font-medium text-gray-700 dark:text-white/80">
                                                    <div className="mr-2 h-2 w-2 rounded-full bg-blue-500"></div>
                                                    Courier Invoice
                                                </h3>
                                                {order.courier_invoice ? (
                                                    <div className="group relative rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md dark:border-gray-700 dark:bg-deepcharcoal">
                                                        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
                                                            <svg
                                                                className="h-8 w-8 text-blue-600 dark:text-blue-400"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth="2"
                                                                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                                                                />
                                                            </svg>
                                                        </div>
                                                        <p className="mb-4 truncate text-center text-sm font-medium text-gray-900 dark:text-white/90">
                                                            Courier Invoice
                                                        </p>
                                                        <div className="flex justify-center space-x-2">
                                                            <a
                                                                href={order.courier_invoice}
                                                                target="_blank"
                                                                className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-blue-600 transition-colors hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400"
                                                            >
                                                                <svg
                                                                    className="h-4 w-4"
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    viewBox="0 0 24 24"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        strokeWidth="2"
                                                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                                    />
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        strokeWidth="2"
                                                                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                                    />
                                                                </svg>
                                                            </a>
                                                            <button
                                                                onClick={() =>
                                                                    handleFileDownload(
                                                                        'Courier Invoice',
                                                                        order.courier_invoice,
                                                                    )
                                                                }
                                                                className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-50 text-gray-600 transition-colors hover:bg-gray-100 dark:bg-zinc-900/80 dark:text-gray-400"
                                                            >
                                                                <svg
                                                                    className="h-4 w-4"
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    viewBox="0 0 24 24"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        strokeWidth="2"
                                                                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                                    />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-6 text-center dark:border-gray-700 dark:bg-deepcharcoal">
                                                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 dark:bg-deepcharcoal">
                                                            <svg
                                                                className="h-6 w-6 text-gray-400"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth="2"
                                                                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                                                                />
                                                            </svg>
                                                        </div>
                                                        <p className="text-sm font-medium text-gray-500 dark:text-white/60">
                                                            No invoice available
                                                        </p>
                                                        <p className="mt-1 text-xs text-gray-400 dark:text-white/50">
                                                            Upload pending
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                }
                            />

                            {/* Final Attachments */}
                            {order?.final_attachments?.length > 0 && (
                                <Card
                                    Content={
                                        <div className="p-6">
                                            <div className="mb-6 flex items-center justify-between">
                                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white/90">
                                                    Final Attachments
                                                </h2>
                                                <span className="text-xs font-medium text-gray-500 dark:text-white/60">
                                                    {order.final_attachments.length} files
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                                {order.final_attachments.map(
                                                    (attachment, index) => (
                                                        <div
                                                            key={index}
                                                            className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-gray-700 dark:bg-deepcharcoal"
                                                        >
                                                            <div className="relative w-full p-4">
                                                                <div className="relative flex h-40 items-center justify-center overflow-hidden rounded-xl border bg-gray-50 dark:border-gray-700 dark:bg-zinc-900/40">
                                                                    <img
                                                                        src={attachment.url}
                                                                        alt={attachment.name}
                                                                        className="h-full w-full object-contain"
                                                                    />
                                                                    <div className="absolute inset-0 hidden items-center justify-center gap-2 bg-black/35 opacity-0 group-hover:opacity-100 lg:flex">
                                                                        <a
                                                                            href={attachment.url}
                                                                            target="_blank"
                                                                            rel="noreferrer"
                                                                            className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-3 py-2 text-sm font-medium text-white backdrop-blur hover:bg-white/25"
                                                                        >
                                                                            <svg
                                                                                className="h-4 w-4"
                                                                                fill="none"
                                                                                stroke="currentColor"
                                                                                viewBox="0 0 24 24"
                                                                            >
                                                                                <path
                                                                                    strokeLinecap="round"
                                                                                    strokeLinejoin="round"
                                                                                    strokeWidth="2"
                                                                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                                                />
                                                                                <path
                                                                                    strokeLinecap="round"
                                                                                    strokeLinejoin="round"
                                                                                    strokeWidth="2"
                                                                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                                                />
                                                                            </svg>
                                                                            View
                                                                        </a>
                                                                        <button
                                                                            onClick={() =>
                                                                                handleFileDownload(
                                                                                    attachment.name,
                                                                                    attachment.url,
                                                                                )
                                                                            }
                                                                            className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-3 py-2 text-sm font-medium text-white backdrop-blur hover:bg-white/25"
                                                                        >
                                                                            <svg
                                                                                className="h-4 w-4"
                                                                                fill="none"
                                                                                stroke="currentColor"
                                                                                viewBox="0 0 24 24"
                                                                            >
                                                                                <path
                                                                                    strokeLinecap="round"
                                                                                    strokeLinejoin="round"
                                                                                    strokeWidth="2"
                                                                                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                                                />
                                                                            </svg>
                                                                            Download
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="px-4 pb-4">
                                                                <p className="truncate text-sm font-semibold text-gray-900 dark:text-white/90">
                                                                    {attachment.name}
                                                                </p>
                                                                <p className="mt-1 text-xs text-gray-500 dark:text-white/60">
                                                                    Attachment
                                                                </p>
                                                                <div className="mt-4 flex gap-2 lg:hidden">
                                                                    <a
                                                                        href={attachment.url}
                                                                        target="_blank"
                                                                        rel="noreferrer"
                                                                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-50 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300"
                                                                    >
                                                                        View
                                                                    </a>
                                                                    <button
                                                                        onClick={() =>
                                                                            handleFileDownload(
                                                                                attachment.name,
                                                                                attachment.url,
                                                                            )
                                                                        }
                                                                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:bg-zinc-900/70 dark:text-white/70"
                                                                    >
                                                                        Download
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                        </div>
                                    }
                                />
                            )}

                            {/* ── Packaging Videos ── */}
                            <Card
                                Content={
                                    <div className="p-6">
                                        <h2 className="mb-6 text-lg font-semibold text-gray-900 dark:text-white/90">
                                            Packaging Videos
                                        </h2>

                                        <div className="space-y-3">
                                            {/* Header */}
                                            <div className="flex flex-wrap items-center justify-between text-sm font-medium text-gray-700 dark:text-white/80">
                                                <div className="flex items-center">
                                                    <div className="mr-2 h-2 w-2 rounded-full bg-red-500"></div>
                                                    <h3>Packaging Videos</h3>
                                                </div>
                                                <div className="w-auto lg:w-[200px]">
                                                    <PrimaryButton
                                                        Text={'Begin Verification'}
                                                        Icon={
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                strokeWidth={1.5}
                                                                stroke="currentColor"
                                                                className="size-5"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z"
                                                                />
                                                            </svg>
                                                        }
                                                        Type={'button'}
                                                        Action={() => setOpenRecorder(true)}
                                                    />
                                                </div>
                                            </div>

                                            {/* Page-level verification banners — populated via onVerified callback */}
                                            {verificationStatus === 'success' && (
                                                <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
                                                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40">
                                                        <svg
                                                            className="h-4 w-4 text-green-600 dark:text-green-400"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth="2"
                                                                d="M5 13l4 4L19 7"
                                                            />
                                                        </svg>
                                                    </div>
                                                    <p className="text-sm font-medium text-green-800 dark:text-green-300">
                                                        {verificationMessage}
                                                    </p>
                                                </div>
                                            )}
                                            {verificationStatus === 'mismatch' && (
                                                <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
                                                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/40">
                                                        <svg
                                                            className="h-4 w-4 text-red-600 dark:text-red-400"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth="2"
                                                                d="M6 18L18 6M6 6l12 12"
                                                            />
                                                        </svg>
                                                    </div>
                                                    <p className="text-sm font-medium text-red-800 dark:text-red-300">
                                                        {verificationMessage}
                                                    </p>
                                                </div>
                                            )}
                                            {verificationStatus === 'scan_error' && (
                                                <div className="flex items-center gap-3 rounded-xl border border-orange-200 bg-orange-50 p-4 dark:border-orange-800 dark:bg-orange-900/20">
                                                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/40">
                                                        <svg
                                                            className="h-4 w-4 text-orange-600 dark:text-orange-400"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth="2"
                                                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                                            />
                                                        </svg>
                                                    </div>
                                                    <p className="text-sm font-medium text-orange-800 dark:text-orange-300">
                                                        {verificationMessage}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Video list */}
                                            {order?.order_package_recordings?.length > 0 ? (
                                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                                    {order.order_package_recordings.map(
                                                        (item, index) => (
                                                            <div
                                                                key={index}
                                                                className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-deepcharcoal"
                                                            >
                                                                {/* Header */}
                                                                <p className="mb-3 text-center text-sm font-semibold text-gray-900 dark:text-white/90">
                                                                    Recording {index + 1}
                                                                </p>

                                                                {/* Barcode Photo */}
                                                                <div className="mb-3">
                                                                    <p className="mb-1 text-xs font-medium text-gray-500 dark:text-white/50">
                                                                        Barcode Photo
                                                                    </p>
                                                                    {item.barcode_photo ? (
                                                                        <div className="flex gap-2">
                                                                            <a
                                                                                href={
                                                                                    item.barcode_photo
                                                                                }
                                                                                target="_blank"
                                                                                className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400"
                                                                            >
                                                                                <svg
                                                                                    className="h-3.5 w-3.5"
                                                                                    fill="none"
                                                                                    stroke="currentColor"
                                                                                    viewBox="0 0 24 24"
                                                                                >
                                                                                    <path
                                                                                        strokeLinecap="round"
                                                                                        strokeLinejoin="round"
                                                                                        strokeWidth="2"
                                                                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                                                    />
                                                                                    <path
                                                                                        strokeLinecap="round"
                                                                                        strokeLinejoin="round"
                                                                                        strokeWidth="2"
                                                                                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                                                    />
                                                                                </svg>
                                                                            </a>
                                                                            <button
                                                                                onClick={() =>
                                                                                    handleFileDownload(
                                                                                        'Barcode Photo',
                                                                                        item.barcode_photo,
                                                                                    )
                                                                                }
                                                                                className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-zinc-900/80 dark:text-gray-400"
                                                                            >
                                                                                <svg
                                                                                    className="h-3.5 w-3.5"
                                                                                    fill="none"
                                                                                    stroke="currentColor"
                                                                                    viewBox="0 0 24 24"
                                                                                >
                                                                                    <path
                                                                                        strokeLinecap="round"
                                                                                        strokeLinejoin="round"
                                                                                        strokeWidth="2"
                                                                                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                                                    />
                                                                                </svg>
                                                                            </button>
                                                                        </div>
                                                                    ) : (
                                                                        <span className="text-xs text-amber-500">
                                                                            Processing...
                                                                        </span>
                                                                    )}
                                                                </div>

                                                                {/* Screen Recording */}
                                                                <div className="mb-3">
                                                                    <p className="mb-1 text-xs font-medium text-gray-500 dark:text-white/50">
                                                                        Screen Recording
                                                                    </p>
                                                                    {item.screen_recording_video ? (
                                                                        <div className="flex gap-2">
                                                                            <a
                                                                                href={
                                                                                    item.screen_recording_video
                                                                                }
                                                                                target="_blank"
                                                                                className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400"
                                                                            >
                                                                                <svg
                                                                                    className="h-3.5 w-3.5"
                                                                                    fill="none"
                                                                                    stroke="currentColor"
                                                                                    viewBox="0 0 24 24"
                                                                                >
                                                                                    <path
                                                                                        strokeLinecap="round"
                                                                                        strokeLinejoin="round"
                                                                                        strokeWidth="2"
                                                                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                                                    />
                                                                                    <path
                                                                                        strokeLinecap="round"
                                                                                        strokeLinejoin="round"
                                                                                        strokeWidth="2"
                                                                                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                                                    />
                                                                                </svg>
                                                                            </a>
                                                                            <button
                                                                                onClick={() =>
                                                                                    handleFileDownload(
                                                                                        'Screen Recording',
                                                                                        item.screen_recording_video,
                                                                                    )
                                                                                }
                                                                                className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-zinc-900/80 dark:text-gray-400"
                                                                            >
                                                                                <svg
                                                                                    className="h-3.5 w-3.5"
                                                                                    fill="none"
                                                                                    stroke="currentColor"
                                                                                    viewBox="0 0 24 24"
                                                                                >
                                                                                    <path
                                                                                        strokeLinecap="round"
                                                                                        strokeLinejoin="round"
                                                                                        strokeWidth="2"
                                                                                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                                                    />
                                                                                </svg>
                                                                            </button>
                                                                        </div>
                                                                    ) : (
                                                                        <button
                                                                            onClick={() =>
                                                                                setVideoIsntBeignUploadedYetOnAWS(
                                                                                    true,
                                                                                )
                                                                            }
                                                                            className="text-xs text-amber-500 hover:underline"
                                                                        >
                                                                            Processing... (tap to
                                                                            see status)
                                                                        </button>
                                                                    )}
                                                                </div>

                                                                {/* Scene Video */}
                                                                <div className="mb-4">
                                                                    <p className="mb-1 text-xs font-medium text-gray-500 dark:text-white/50">
                                                                        Scene Video
                                                                    </p>
                                                                    {item.scene_video ? (
                                                                        <div className="flex gap-2">
                                                                            <a
                                                                                href={
                                                                                    item.scene_video
                                                                                }
                                                                                target="_blank"
                                                                                className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400"
                                                                            >
                                                                                <svg
                                                                                    className="h-3.5 w-3.5"
                                                                                    fill="none"
                                                                                    stroke="currentColor"
                                                                                    viewBox="0 0 24 24"
                                                                                >
                                                                                    <path
                                                                                        strokeLinecap="round"
                                                                                        strokeLinejoin="round"
                                                                                        strokeWidth="2"
                                                                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                                                    />
                                                                                    <path
                                                                                        strokeLinecap="round"
                                                                                        strokeLinejoin="round"
                                                                                        strokeWidth="2"
                                                                                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                                                    />
                                                                                </svg>
                                                                            </a>
                                                                            <button
                                                                                onClick={() =>
                                                                                    handleFileDownload(
                                                                                        'Scene Video',
                                                                                        item.scene_video,
                                                                                    )
                                                                                }
                                                                                className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-zinc-900/80 dark:text-gray-400"
                                                                            >
                                                                                <svg
                                                                                    className="h-3.5 w-3.5"
                                                                                    fill="none"
                                                                                    stroke="currentColor"
                                                                                    viewBox="0 0 24 24"
                                                                                >
                                                                                    <path
                                                                                        strokeLinecap="round"
                                                                                        strokeLinejoin="round"
                                                                                        strokeWidth="2"
                                                                                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                                                    />
                                                                                </svg>
                                                                            </button>
                                                                        </div>
                                                                    ) : (
                                                                        <button
                                                                            onClick={() =>
                                                                                setVideoIsntBeignUploadedYetOnAWS(
                                                                                    true,
                                                                                )
                                                                            }
                                                                            className="text-xs text-amber-500 hover:underline"
                                                                        >
                                                                            Processing... (tap to
                                                                            see status)
                                                                        </button>
                                                                    )}
                                                                </div>

                                                                {/* Actions: Toggle Visibility + Delete */}
                                                                <div className="flex justify-center gap-2 border-t border-gray-100 pt-3 dark:border-white/10">
                                                                    <button
                                                                        onClick={() =>
                                                                            togglePackageVideoVisibility(
                                                                                item.id,
                                                                            )
                                                                        }
                                                                        title={
                                                                            item.is_visible
                                                                                ? 'Visible to customer'
                                                                                : 'Hidden from customer'
                                                                        }
                                                                        className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                                                                            item.is_visible
                                                                                ? 'bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400'
                                                                                : 'bg-gray-50 text-gray-400 hover:bg-gray-100 dark:bg-zinc-900/80 dark:text-gray-500'
                                                                        }`}
                                                                    >
                                                                        {togglingVideo ===
                                                                        item.id ? (
                                                                            <Spinner customSize="size-3" />
                                                                        ) : item.is_visible ? (
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
                                                                                    d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253M3.284 14.253A8.959 8.959 0 0 1 3 12c0-.778.099-1.533.284-2.253"
                                                                                />
                                                                            </svg>
                                                                        ) : (
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
                                                                                    d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
                                                                                />
                                                                            </svg>
                                                                        )}
                                                                    </button>

                                                                    {can(
                                                                        'Package Recordings Delete',
                                                                    ) && (
                                                                        <button
                                                                            onClick={() =>
                                                                                deletePackageVideo(
                                                                                    item.id,
                                                                                )
                                                                            }
                                                                            className="flex h-8 w-8 items-center justify-center rounded-full bg-red-50 text-red-600 hover:bg-red-100 dark:bg-zinc-900/80 dark:text-red-400"
                                                                        >
                                                                            {deleteingVideo ===
                                                                            item.id ? (
                                                                                <Spinner customSize="size-3" />
                                                                            ) : (
                                                                                <svg
                                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                                    fill="none"
                                                                                    viewBox="0 0 24 24"
                                                                                    strokeWidth={
                                                                                        1.5
                                                                                    }
                                                                                    stroke="currentColor"
                                                                                    className="h-4 w-4"
                                                                                >
                                                                                    <path
                                                                                        strokeLinecap="round"
                                                                                        strokeLinejoin="round"
                                                                                        d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                                                                                    />
                                                                                </svg>
                                                                            )}
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ),
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-6 text-center dark:border-gray-700 dark:bg-deepcharcoal">
                                                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 dark:bg-deepcharcoal">
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            strokeWidth={1.5}
                                                            stroke="currentColor"
                                                            className="size-6 text-gray-400"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"
                                                            />
                                                        </svg>
                                                    </div>
                                                    <p className="text-sm font-medium text-gray-500 dark:text-white/60">
                                                        No Videos Found
                                                    </p>
                                                    <p className="mt-1 text-xs text-gray-400 dark:text-white/50">
                                                        Packaging videos upload pending
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                }
                            />

                            {/* Customer Information */}
                            <Card
                                Content={
                                    <div className="p-6">
                                        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white/90">
                                            Customer Information
                                        </h2>
                                        <div className="flex items-start space-x-4">
                                            <div className="flex-shrink-0">
                                                {order?.customer?.user?.profile ? (
                                                    <img
                                                        src={order.customer.user.profile}
                                                        alt="Profile"
                                                        className="h-20 w-20 rounded-full object-cover object-center"
                                                    />
                                                ) : (
                                                    <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-blue-500 bg-blue-100 text-3xl font-bold text-blue-800 dark:border-white dark:bg-white/10 dark:text-white">
                                                        {order?.customer?.user?.avatar}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 space-y-1">
                                                <p className="flex items-center text-sm text-gray-600 dark:text-white/90">
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        strokeWidth={1.5}
                                                        stroke="currentColor"
                                                        className="mr-2 h-4 w-4 flex-shrink-0"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                                                        />
                                                    </svg>
                                                    <span className="break-all">
                                                        {order.customer?.user?.name || 'N/A'}
                                                    </span>
                                                </p>
                                                <p className="flex items-center text-sm text-gray-600 dark:text-white/90">
                                                    <svg
                                                        className="mr-2 h-4 w-4 flex-shrink-0"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth="2"
                                                            d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                                        />
                                                    </svg>
                                                    <span className="break-all">
                                                        {order.customer?.user?.email || 'N/A'}
                                                    </span>
                                                </p>
                                                {order.customer?.user?.phone && (
                                                    <p className="flex items-center text-sm text-gray-600 dark:text-white/90">
                                                        <svg
                                                            className="mr-2 h-4 w-4 flex-shrink-0"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth="2"
                                                                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                                            />
                                                        </svg>
                                                        {order.customer.user.phone}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                }
                            />

                            {/* Currency Snapshot (Audit) */}
                            {order?.currency_snapshot && (
                                <Card
                                    Content={
                                        <div className="p-6">
                                            <div className="mb-4 flex items-center justify-between">
                                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white/90">
                                                    Currency Snapshot (Audit)
                                                </h2>
                                                <span className="text-xs text-gray-500 dark:text-white/60">
                                                    Internal record — not visible to customer
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
                                                <div className="flex justify-between">
                                                    <span className="text-sub-text-light dark:text-sub-text-dark">
                                                        Base Settlement
                                                    </span>
                                                    <span className="font-medium text-main-text-light dark:text-main-text-dark">
                                                        {order.currency_snapshot.base_currency}{' '}
                                                        {Number(order.currency_snapshot.base_amount).toLocaleString('en-US', {
                                                            minimumFractionDigits: 2,
                                                            maximumFractionDigits: 2,
                                                        })}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-sub-text-light dark:text-sub-text-dark">
                                                        Customer Saw
                                                    </span>
                                                    <span className="font-medium text-main-text-light dark:text-main-text-dark">
                                                        {order.currency_snapshot.display_currency}{' '}
                                                        {Number(order.currency_snapshot.display_amount).toLocaleString('en-US', {
                                                            minimumFractionDigits: 2,
                                                            maximumFractionDigits: 2,
                                                        })}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-sub-text-light dark:text-sub-text-dark">
                                                        Exchange Rate
                                                    </span>
                                                    <span className="font-medium text-main-text-light dark:text-main-text-dark">
                                                        1 {order.currency_snapshot.base_currency} ={' '}
                                                        {Number(order.currency_snapshot.exchange_rate).toLocaleString('en-US', {
                                                            minimumFractionDigits: 2,
                                                            maximumFractionDigits: 4,
                                                        })}{' '}
                                                        {order.currency_snapshot.display_currency}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-sub-text-light dark:text-sub-text-dark">
                                                        Rate Source
                                                    </span>
                                                    <span className="font-medium text-main-text-light dark:text-main-text-dark">
                                                        {order.currency_snapshot.rate_source || 'N/A'}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-sub-text-light dark:text-sub-text-dark">
                                                        Rate Timestamp
                                                    </span>
                                                    <span className="font-medium text-main-text-light dark:text-main-text-dark">
                                                        {order.currency_snapshot.rate_timestamp_display}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-sub-text-light dark:text-sub-text-dark">
                                                        Paid In
                                                    </span>
                                                    <span className="font-medium text-main-text-light dark:text-main-text-dark">
                                                        {order.currency_snapshot.selected_pay_currency_display}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    }
                                />
                            )}

                            {/* Addresses */}
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                {order?.shipping_address_line1 && (
                                    <Card
                                        Content={
                                            <div className="p-6">
                                                <h3 className="text-md mb-3 flex items-center font-semibold text-gray-900 dark:text-white/90">
                                                    <svg
                                                        className="mr-2 h-5 w-5"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth="2"
                                                            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                                                        />
                                                    </svg>
                                                    Shipping Address 1
                                                </h3>
                                                <address className="break-all text-sm not-italic text-gray-600 dark:text-white/90">
                                                    {order?.shipping_state || 'N/A'},{' '}
                                                    {order?.shipping_city || 'N/A'}
                                                    <br />
                                                    {order?.shipping_address_line1},{' '}
                                                    {order?.shipping_postal_code || ''}
                                                    <br />
                                                    {order?.shipping_country || ''}
                                                </address>
                                            </div>
                                        }
                                    />
                                )}
                                {order?.shipping_address_line2 && (
                                    <Card
                                        Content={
                                            <div className="p-6">
                                                <h3 className="text-md mb-3 flex items-center font-semibold text-gray-900 dark:text-white/90">
                                                    <svg
                                                        className="mr-2 h-5 w-5"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth="2"
                                                            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                                                        />
                                                    </svg>
                                                    Shipping Address 2
                                                </h3>
                                                <address className="break-all text-sm not-italic text-gray-600 dark:text-white/90">
                                                    {order?.shipping_state || 'N/A'},{' '}
                                                    {order?.shipping_city || 'N/A'}
                                                    <br />
                                                    {order?.shipping_address_line2},{' '}
                                                    {order?.shipping_postal_code || ''}
                                                    <br />
                                                    {order?.shipping_country || ''}
                                                </address>
                                            </div>
                                        }
                                    />
                                )}
                            </div>
                        </div>

                        {/* ── Sidebar ── */}
                        <div className="space-y-6">
                            {/* Order Summary */}
                            <Card
                                Content={
                                    <div className="p-6">
                                        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white/90">
                                            Order Summary
                                        </h3>
                                        <div className="space-y-3">
                                            {[
                                                [__('Product SubTotal'), order.sub_total],
                                                [__('Addons SubTotal'), order.addons_sub_total],
                                                [__('Shipping Fee'), order.shipping_fee],
                                                [__('Import Tax'), order.import_tax],
                                            ].map(([label, value]) => (
                                                <div
                                                    key={label}
                                                    className="flex justify-between text-sm text-main-text-light dark:text-main-text-dark"
                                                >
                                                    <span className="text-sub-text-light dark:text-sub-text-dark">
                                                        {label}
                                                    </span>
                                                    <span className="font-semibold">
                                                        {currency?.symbol}
                                                        {Number(value || 0).toLocaleString('en-US')}
                                                    </span>
                                                </div>
                                            ))}
                                            {order?.discount > 0 && (
                                                <div className="flex justify-between text-sm text-main-text-light dark:text-main-text-dark">
                                                    <span className="text-sub-text-light dark:text-sub-text-dark">
                                                        {__('Discount')}
                                                    </span>
                                                    <span className="font-semibold text-green-600 dark:text-green-400">
                                                        -{currency?.symbol}
                                                        {Number(order.discount).toLocaleString(
                                                            'en-US',
                                                        )}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="space-y-1 border-t border-surface-3-light pt-3 dark:border-surface-3-dark">
                                                {[
                                                    [__('Remaining Amount'), order.amount],
                                                    [__('Used Points Discount'), order.points_used],
                                                    [__('Total'), order.full_amount],
                                                ].map(([label, value]) => (
                                                    <div
                                                        key={label}
                                                        className="flex items-center justify-between text-main-text-light dark:text-main-text-dark"
                                                    >
                                                        <span className="text-base font-semibold text-sub-text-light dark:text-sub-text-dark">
                                                            {label}
                                                        </span>
                                                        <span className="text-xl font-semibold">
                                                            {currency?.symbol}
                                                            {Number(value || 0).toLocaleString(
                                                                'en-US',
                                                            )}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                }
                            />

                            {/* Distributor & Payment */}
                            <Card
                                Content={
                                    <div className="p-6">
                                        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white/90">
                                            Distributor & Payment
                                        </h3>
                                        <div className="mb-6">
                                            <h4 className="mb-3 flex items-center text-sm font-medium text-gray-900 dark:text-white/90">
                                                <svg
                                                    className="mr-2 h-4 w-4"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h1a1 1 0 011 1v5m-4 0h4"
                                                    />
                                                </svg>
                                                Distributor
                                            </h4>
                                            <div className="space-y-2 text-sm text-gray-600 dark:text-white/90">
                                                <p className="flex items-center gap-2">
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        strokeWidth={1.5}
                                                        stroke="currentColor"
                                                        className="h-4 w-4 flex-shrink-0"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                                                        />
                                                    </svg>
                                                    <span className="break-all">
                                                        {order?.order_items[0]?.smartphone?.category
                                                            ?.distributor?.user?.name || 'N/A'}
                                                    </span>
                                                </p>
                                                <p className="flex items-center gap-2">
                                                    <svg
                                                        className="h-4 w-4 flex-shrink-0"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth="2"
                                                            d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                                        />
                                                    </svg>
                                                    <span className="break-all">
                                                        {order?.order_items[0]?.smartphone?.category
                                                            ?.distributor?.user?.email || 'N/A'}
                                                    </span>
                                                </p>
                                                <p className="flex items-center gap-2">
                                                    <svg
                                                        className="h-4 w-4 flex-shrink-0"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth="2"
                                                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                                        />
                                                    </svg>
                                                    {order?.order_items[0]?.smartphone?.category
                                                        ?.distributor?.user?.phone || 'N/A'}
                                                </p>

                                                <p className="flex items-center gap-2">
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        strokeWidth={1.5}
                                                        stroke="currentColor"
                                                        className="size-4"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="m6.115 5.19.319 1.913A6 6 0 0 0 8.11 10.36L9.75 12l-.387.775c-.217.433-.132.956.21 1.298l1.348 1.348c.21.21.329.497.329.795v1.089c0 .426.24.815.622 1.006l.153.076c.433.217.956.132 1.298-.21l.723-.723a8.7 8.7 0 0 0 2.288-4.042 1.087 1.087 0 0 0-.358-1.099l-1.33-1.108c-.251-.21-.582-.299-.905-.245l-1.17.195a1.125 1.125 0 0 1-.98-.314l-.295-.295a1.125 1.125 0 0 1 0-1.591l.13-.132a1.125 1.125 0 0 1 1.3-.21l.603.302a.809.809 0 0 0 1.086-1.086L14.25 7.5l1.256-.837a4.5 4.5 0 0 0 1.528-1.732l.146-.292M6.115 5.19A9 9 0 1 0 17.18 4.64M6.115 5.19A8.965 8.965 0 0 1 12 3c1.929 0 3.716.607 5.18 1.64"
                                                        />
                                                    </svg>

                                                    {order?.order_items[0]?.smartphone?.category
                                                        ?.distributor?.postal_code || 'N/A'}
                                                </p>

                                                <div className="flex items-center gap-2">
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        strokeWidth={1.5}
                                                        stroke="currentColor"
                                                        className="size-4"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                                                        />
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                                                        />
                                                    </svg>

                                                    <p className={'break-all'}>
                                                        {order?.order_items[0]?.smartphone?.category
                                                            ?.distributor?.address || 'N/A'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mb-6 rounded-lg border bg-gray-50 p-4 dark:bg-deepcharcoal">
                                            <h4 className="mb-3 flex items-center text-sm font-medium text-gray-900 dark:text-white/90">
                                                <svg
                                                    className="mr-2 h-4 w-4"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                                                    />
                                                </svg>
                                                Bank Account Details
                                            </h4>
                                            <div className="grid grid-cols-1 gap-3 text-sm">
                                                {[
                                                    [
                                                        'Bank Name',
                                                        order?.order_items[0]?.smartphone?.category
                                                            ?.distributor?.bank_name,
                                                    ],
                                                    [
                                                        'Account Name',
                                                        order?.order_items[0]?.smartphone?.category
                                                            ?.distributor?.bank_account_name,
                                                    ],
                                                    [
                                                        'Account No',
                                                        order?.order_items[0]?.smartphone?.category
                                                            ?.distributor?.bank_account_no,
                                                    ],
                                                    [
                                                        'IBAN',
                                                        order?.order_items[0]?.smartphone?.category
                                                            ?.distributor?.iban,
                                                    ],
                                                    [
                                                        'SWIFT CODE',
                                                        order?.order_items[0]?.smartphone?.category
                                                            ?.distributor?.swift_code,
                                                    ],
                                                ].map(([label, value]) => (
                                                    <div
                                                        key={label}
                                                        className="flex justify-between"
                                                    >
                                                        <span className="text-gray-600 dark:text-white/90">
                                                            {label}:
                                                        </span>
                                                        <span className="break-all font-medium text-gray-900 dark:text-white/90">
                                                            {value || 'N/A'}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="my-4 flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-deepcharcoal">
                                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                Payment Method
                                            </span>
                                            <div className="flex items-center space-x-2">
                                                {order.payment_method === 'bank_transfer' && (
                                                    <>
                                                        <svg
                                                            className="h-5 w-5 text-blue-600 dark:text-blue-400"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                                                            />
                                                        </svg>
                                                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                                            Bank Transfer
                                                        </span>
                                                    </>
                                                )}
                                                {order.payment_method === 'crypto' && (
                                                    <>
                                                        <svg
                                                            className="h-5 w-5 text-orange-600 dark:text-orange-400"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                            />
                                                        </svg>
                                                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                                            Crypto
                                                        </span>
                                                    </>
                                                )}
                                                {order.payment_method === 'points' && (
                                                    <>
                                                        <svg
                                                            className="h-5 w-5 text-green-600 dark:text-green-400"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                                                            />
                                                        </svg>
                                                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                                            Reward Points
                                                        </span>
                                                    </>
                                                )}
                                                {!['bank_transfer', 'crypto', 'points'].includes(
                                                    order.payment_method,
                                                ) && (
                                                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                                        N/A
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {order.is_cash_collected == 1 && (
                                            <div className="my-3 flex items-center space-x-3">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                                                    <svg
                                                        className="h-4 w-4 text-green-600"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth="2"
                                                            d="M5 13l4 4L19 7"
                                                        />
                                                    </svg>
                                                </div>
                                                <p className="text-sm font-medium text-gray-900 dark:text-white/90">
                                                    Cash Collected
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                }
                            />
                        </div>
                    </div>
                </div>

                {/* ── Downloading Modal ── */}
                {downloading && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="fixed inset-0 backdrop-blur-[32px]" />
                        <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white p-8 text-center shadow-xl dark:bg-deepcharcoal">
                            <h2 className="text-lg font-medium text-gray-800 dark:text-white">
                                Downloading file, please wait...
                            </h2>
                            <div className="mt-5 flex items-center justify-center">
                                <svg
                                    aria-hidden="true"
                                    className="h-8 w-8 animate-spin fill-blue-600 text-gray-200 dark:text-gray-600"
                                    viewBox="0 0 100 101"
                                    fill="none"
                                >
                                    <path
                                        d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                        fill="currentColor"
                                    />
                                    <path
                                        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                        fill="currentFill"
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Package Video Upload Modal ── */}
                {packageVideoProcessing && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="fixed inset-0 backdrop-blur-[32px]" />
                        <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white p-8 text-center shadow-xl dark:bg-deepcharcoal">
                            <h2 className="text-lg font-medium text-gray-800 dark:text-white">
                                Uploading package video, please wait...
                            </h2>
                            <div className="mt-5 flex items-center justify-center">
                                <svg
                                    aria-hidden="true"
                                    className="h-8 w-8 animate-spin fill-blue-600 text-gray-200 dark:text-gray-600"
                                    viewBox="0 0 100 101"
                                    fill="none"
                                >
                                    <path
                                        d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                        fill="currentColor"
                                    />
                                    <path
                                        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                        fill="currentFill"
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── AWS Processing Warning ── */}
                {videoIsntBeignUploadedYetOnAWS && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div
                            className="fixed inset-0 backdrop-blur-[32px]"
                            onClick={() => setVideoIsntBeignUploadedYetOnAWS(false)}
                        />
                        <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white p-8 text-center shadow-xl dark:bg-deepcharcoal">
                            <h2 className="text-lg font-medium text-gray-800 dark:text-white">
                                Package recording is processing in the background. Refresh the page
                                in 2-3 minutes.
                            </h2>
                            <div className="mt-5 flex items-center justify-center">
                                <svg
                                    aria-hidden="true"
                                    className="h-8 w-8 animate-spin fill-blue-600 text-gray-200 dark:text-gray-600"
                                    viewBox="0 0 100 101"
                                    fill="none"
                                >
                                    <path
                                        d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                        fill="currentColor"
                                    />
                                    <path
                                        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                        fill="currentFill"
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Package Verification Recorder Component ── */}
                <PackageVerificationRecorder
                    isOpen={openRecorder}
                    onClose={() => setOpenRecorder(false)}
                    onSave={(file) => {
                        setPackageVideo('package_video', file);
                        setOpenRecorder(false);
                        router.reload({ only: ['order'] });
                    }}
                    orderNo={order.order_no}
                    onVerified={(status, message) => {
                        setVerificationStatus(status);
                        setVerificationMessage(message);
                    }}
                />
            </AuthenticatedLayout>
        </>
    );
}
