import Card from '@/Components/Card';
import LinkButton from '@/Components/LinkButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BreadCrumb from '@/Components/BreadCrumb';
import { Head, useForm, usePage } from '@inertiajs/react';
import React, { useEffect, useRef, useState } from 'react';
import PrimaryButton from '@/Components/PrimaryButton';
import Swal from 'sweetalert2';
import Toast from '@/Components/Toast';
import Placeholder from 'asset/assets/images/product/placeholder.jpg';
import { useVideoRecorder } from '@/Hooks/useVideoRecorder';
import { useScanner } from '@/Hooks/useScanner';
import { useTranslation } from '@/Hooks/useTranslation';
import axios from 'axios';

export default function show({ order }) {
    const { currency } = usePage().props;
    const [downloading, setDownloading] = useState(false);
    const { __ } = useTranslation();
    const [ValidationErrors, setValidationErrors] = useState({});

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



    const isVerifiedRef = useRef(false);
    const pendingCloseRef = useRef(false);
    const manualStopRef = useRef(false);


    const {
        recordingVideoRef,
        isReady,
        isRecording,
        recordedFile,
        recordedUrl,
        cameraError,
        elapsed,
        startCamera,
        stopCamera,
        startRecording,
        stopRecording,
        retake,
    } = useVideoRecorder();

    const [openRecorder, setOpenRecorder] = useState(false);
    const [recordingSaving, setRecordingSaving] = useState(false);
    const [videoIsntBeignUploadedYetOnAWS, setVideoIsntBeignUploadedYetOnAWS] = useState(false);
    const [verificationStatus, setVerificationStatus] = useState(null);
    const [verificationMessage, setVerificationMessage] = useState('');
    const [scanActive, setScanActive] = useState(false);



    const { refocus } = useScanner({
        active: scanActive,
        sourceVideoRef: recordingVideoRef,
        onScan: (text) => {
            if (!isVerifiedRef.current) handleScannedCode(text);
        },
    });


    const stopScanning = () => setScanActive(false);
    const startScanning = () => {
        isVerifiedRef.current = false;
        setScanActive(true);
    };

    const handleScannedCode = async (scannedValue) => {
        if (isVerifiedRef.current) return;
        const trimmed = scannedValue.trim();
        if (!trimmed) return;



        isVerifiedRef.current = true;
        stopScanning();
        stopRecording();

        try {
            const { data } = await axios.post(route('dashboard.orders.verify'), {
                order_no: order.order_no,
                code: trimmed,
            });

            const isSuccess =
                data.status === true ||
                data.status === 1 ||
                data.status === 'success';

            if (isSuccess) {
                setVerificationStatus('success');
                setVerificationMessage(
                    data?.message ||
                    `Verification successful. CODE ${trimmed} matched and recorded.`
                );
            } else {
                setVerificationStatus('mismatch');
                setVerificationMessage(data?.message || `CODE does not match: ${trimmed}`);
                _doClose(false);
            }
        } catch (err) {
            console.error('[Verify] Request failed:', err);
            setVerificationStatus('failed');
            setVerificationMessage('Verification request failed. Please try again.');
            _doClose(false);
        }
    };

    const handleStartRecording = () => {
        if (!isReady) return;
        setVerificationStatus(null);
        setVerificationMessage('');
        isVerifiedRef.current = false;
        manualStopRef.current = false;
        startRecording();
        startScanning();
    };

    const handleStopRecording = () => {
        manualStopRef.current = true;
        stopScanning();
        stopRecording();
    };


    const handleSave = () => {
        if (!recordedFile) return;
        setRecordingSaving(true);
        try {
            setPackageVideo('package_video', recordedFile);
            _doClose();
        } catch (err) {
            console.error('[Save] Error:', err);
            setRecordingSaving(false);
        }
    };


    const handleRetake = () => {
        isVerifiedRef.current = false;
        manualStopRef.current = false;
        setVerificationStatus(null);
        setVerificationMessage('');
        stopScanning();
        retake();
    };


    const _doClose = (canClearBanner = true) => {
        stopScanning();
        stopCamera();
        isVerifiedRef.current = false;
        manualStopRef.current = false;
        pendingCloseRef.current = false;
        setOpenRecorder(false);
        setRecordingSaving(false);
        if (canClearBanner) {
            setVerificationStatus(null);
            setVerificationMessage('');
        }
    };

    const handleClose = () => {
        if (isRecording) {
            pendingCloseRef.current = true;
            manualStopRef.current = true;
            stopScanning();
            stopRecording();
            return;
        }
        _doClose();
    };


    useEffect(() => {
        if (!isRecording && pendingCloseRef.current) {
            _doClose();
        }
    }, [isRecording]);


    useEffect(() => {
        if (openRecorder) {
            startCamera();
        } else {
            stopScanning();
        }
    }, [openRecorder]);


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
        if (recordedUrl && manualStopRef.current) {
            retake();
            manualStopRef.current = false;
        }
    }, [recordedUrl]);


    useEffect(() => {
        if (videoIsntBeignUploadedYetOnAWS) {
            const timer = setTimeout(() => setVideoIsntBeignUploadedYetOnAWS(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [videoIsntBeignUploadedYetOnAWS]);



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

                {Object.keys(ValidationErrors).length > 0 && (
                    <Toast flash={{ error: Object.values(ValidationErrors)[0] }} />
                )}

                <div className="space-y-6">

                    {/* ── Order Header ── */}
                    <Card
                        Content={
                            <div className="p-6">
                                <div className="flex flex-col mb-6 lg:flex-row lg:items-center lg:justify-between">
                                    <div className="mb-4 lg:mb-0">
                                        <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white/90">
                                            Order: {order.order_no}
                                        </h1>
                                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-white/90">
                                            <span>Placed on {order.added_at}</span>
                                            <span className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(order.status)}`}>
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
                                                    URL={route('orders.customer-order-invoice', order.order_no)}
                                                    Icon={
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                                                        </svg>
                                                    }
                                                />
                                                <LinkButton
                                                    CustomClass={'w-[250px]'}
                                                    Text={'Shipping Invoice'}
                                                    URL={route('orders.shipping-invoice', order.order_no)}
                                                    Icon={
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                                                        </svg>
                                                    }
                                                />
                                            </>
                                        )}
                                        <LinkButton
                                            Text={'Back To Orders'}
                                            URL={route('dashboard.orders.index')}
                                            Icon={
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
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
                                        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white/90">Order Items</h2>
                                        <div className="space-y-4">
                                            {order.order_items?.map((item) => {
                                                const addonsTotal = item.smartphone_addons?.reduce((t, a) => t + Number(a.total_price), 0) || 0;
                                                const finalItemTotal = Number(item.sub_total) + addonsTotal;

                                                return (
                                                    <Card
                                                        key={item.id}
                                                        Content={
                                                            <div className="flex flex-col gap-4 p-4 rounded-md sm:flex-row sm:items-start">
                                                                {(item?.smartphone?.smartphone_image_urls?.length > 0 || item?.smartphone?.smartphone_video_urls?.length > 0) && (
                                                                    <div className="relative w-24 h-24 overflow-hidden border-2 border-transparent rounded-md cursor-pointer bg-surface-1-light dark:bg-surface-1-dark text-main-text-light dark:text-main-text-dark">
                                                                        <img
                                                                            src={
                                                                                item?.smartphone?.smartphone_image_urls?.[0] ||
                                                                                item?.smartphone?.smartphone_video_urls[0]?.thumbnail_url ||
                                                                                Placeholder
                                                                            }
                                                                            alt={item?.smartphone?.model_name?.name}
                                                                            className="object-cover w-full h-full"
                                                                            loading="lazy"
                                                                            onError={(e) => (e.target.src = Placeholder)}
                                                                        />
                                                                    </div>
                                                                )}
                                                                <div className="flex-1 space-y-3">
                                                                    <div>
                                                                        <h3 className="text-base font-semibold text-main-text-light dark:text-main-text-dark">
                                                                            {item?.smartphone?.model_name?.name || 'N/A'}
                                                                        </h3>
                                                                        <div className="flex flex-wrap gap-2 mt-1 text-xs">
                                                                            {item?.smartphone?.capacity?.name && (
                                                                                <span className="px-2 py-0.5 rounded-md bg-surface-3-light dark:bg-surface-3-dark text-sub-text-light dark:text-sub-text-dark">
                                                                                    {item.smartphone.capacity.name}
                                                                                </span>
                                                                            )}
                                                                            {item?.color?.name && (
                                                                                <span className="px-2 py-0.5 rounded-md bg-surface-3-light dark:bg-surface-3-dark text-sub-text-light dark:text-sub-text-dark">
                                                                                    {item.color.name}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                                                        <div className="flex justify-between">
                                                                            <span className="text-sub-text-light dark:text-sub-text-dark">UPC / EAN</span>
                                                                            <span className="font-medium text-main-text-light dark:text-main-text-dark">{item?.smartphone?.upc || 'N/A'}</span>
                                                                        </div>
                                                                        <div className="flex justify-between">
                                                                            <span className="text-sub-text-light dark:text-sub-text-dark">Quantity</span>
                                                                            <span className="font-medium text-main-text-light dark:text-main-text-dark">{item.quantity}</span>
                                                                        </div>
                                                                    </div>
                                                                    <div className="pt-3 space-y-1 text-sm border-t border-dashed border-surface-3-light dark:border-surface-3-dark text-main-text-light dark:text-main-text-dark">
                                                                        <div className="flex justify-between">
                                                                            <span className="text-sub-text-light dark:text-sub-text-dark">Unit Price</span>
                                                                            <span>{currency?.symbol}{Number(item.unit_price).toLocaleString('en-US')}</span>
                                                                        </div>
                                                                        <div className="flex justify-between">
                                                                            <span className="text-sub-text-light dark:text-sub-text-dark">Product Total</span>
                                                                            <span>{currency?.symbol}{(item.unit_price * item.quantity).toLocaleString('en-US')}</span>
                                                                        </div>
                                                                        <div className="flex justify-between">
                                                                            <span className="text-sub-text-light dark:text-sub-text-dark">Shipping</span>
                                                                            <span>{currency?.symbol}{Number(item.shipping_cost || 0).toLocaleString('en-US')}</span>
                                                                        </div>
                                                                        <div className="flex justify-between">
                                                                            <span className="text-sub-text-light dark:text-sub-text-dark">Import Tax</span>
                                                                            <span>{currency?.symbol}{Number(item.import_cost || 0).toLocaleString('en-US')}</span>
                                                                        </div>
                                                                    </div>
                                                                    {item.smartphone_addons?.length > 0 && (
                                                                        <div className="pt-3 border-t border-dashed border-surface-3-light dark:border-surface-3-dark">
                                                                            <p className="mb-2 text-xs font-semibold text-sub-text-light dark:text-sub-text-dark">Add-ons</p>
                                                                            <div className="space-y-1 text-sm">
                                                                                {item.smartphone_addons.map((addon) => (
                                                                                    <div key={addon.id} className="flex justify-between">
                                                                                        <span className="text-sub-text-light dark:text-sub-text-dark">{addon.name} × {addon.quantity}</span>
                                                                                        <span>{currency?.symbol}{Number(addon.total_price).toLocaleString('en-US')}</span>
                                                                                    </div>
                                                                                ))}
                                                                                <div className="flex justify-between pt-1 font-medium">
                                                                                    <span className="text-sub-text-light dark:text-sub-text-dark">Add-ons Total</span>
                                                                                    <span>{currency?.symbol}{Number(addonsTotal).toLocaleString('en-US')}</span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                    <div className="flex justify-between pt-3 mt-3 border-t border-surface-3-light dark:border-surface-3-dark">
                                                                        <span className="text-sm font-semibold text-main-text-light dark:text-main-text-dark">Final Item Total</span>
                                                                        <span className="text-base font-bold text-main-text-light dark:text-main-text-dark">{currency?.symbol}{Number(finalItemTotal).toLocaleString('en-US')}</span>
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
                                        <h2 className="mb-6 text-lg font-semibold text-gray-900 dark:text-white/90">Payment Proof & Courier Invoice</h2>
                                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                            {/* Payment Proof */}
                                            <div className="space-y-3">
                                                <h3 className="flex items-center text-sm font-medium text-gray-700 dark:text-white/80">
                                                    <div className="w-2 h-2 mr-2 bg-green-500 rounded-full"></div>Payment Proof
                                                </h3>
                                                {order.payment_proof ? (
                                                    <div className="relative p-4 transition-all bg-white border border-gray-200 shadow-sm group rounded-xl hover:shadow-md dark:border-gray-700 dark:bg-deepcharcoal">
                                                        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-3 rounded-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
                                                            <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                        </div>
                                                        <p className="mb-4 text-sm font-medium text-center text-gray-900 truncate dark:text-white/90">Payment Screenshot</p>
                                                        <div className="flex justify-center space-x-2">
                                                            <a href={order.payment_proof} target="_blank" className="flex items-center justify-center text-blue-600 transition-colors rounded-full h-9 w-9 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400">
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                            </a>
                                                            <button onClick={() => handleFileDownload('Payment Proof', order.payment_proof)} className="flex items-center justify-center text-gray-600 transition-colors rounded-full h-9 w-9 bg-gray-50 hover:bg-gray-100 dark:bg-zinc-900/80 dark:text-gray-400">
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="p-6 text-center border-2 border-gray-200 border-dashed rounded-xl bg-gray-50/50 dark:border-gray-700 dark:bg-deepcharcoal">
                                                        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-lg dark:bg-deepcharcoal">
                                                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                        </div>
                                                        {Number(order?.points_used) === Number(order?.full_amount) ? (
                                                            <p className="text-sm text-gray-600 dark:text-gray-400">Paid with Points — no proof required</p>
                                                        ) : (
                                                            <>
                                                                <p className="text-sm font-medium text-gray-500 dark:text-white/60">No payment proof</p>
                                                                <p className="mt-1 text-xs text-gray-400 dark:text-white/50">Upload pending</p>
                                                            </>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Courier Invoice */}
                                            <div className="space-y-3">
                                                <h3 className="flex items-center text-sm font-medium text-gray-700 dark:text-white/80">
                                                    <div className="w-2 h-2 mr-2 bg-blue-500 rounded-full"></div>Courier Invoice
                                                </h3>
                                                {order.courier_invoice ? (
                                                    <div className="relative p-4 transition-all bg-white border border-gray-200 shadow-sm group rounded-xl hover:shadow-md dark:border-gray-700 dark:bg-deepcharcoal">
                                                        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-3 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
                                                            <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                                                        </div>
                                                        <p className="mb-4 text-sm font-medium text-center text-gray-900 truncate dark:text-white/90">Courier Invoice</p>
                                                        <div className="flex justify-center space-x-2">
                                                            <a href={order.courier_invoice} target="_blank" className="flex items-center justify-center text-blue-600 transition-colors rounded-full h-9 w-9 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400">
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                            </a>
                                                            <button onClick={() => handleFileDownload('Courier Invoice', order.courier_invoice)} className="flex items-center justify-center text-gray-600 transition-colors rounded-full h-9 w-9 bg-gray-50 hover:bg-gray-100 dark:bg-zinc-900/80 dark:text-gray-400">
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="p-6 text-center border-2 border-gray-200 border-dashed rounded-xl bg-gray-50/50 dark:border-gray-700 dark:bg-deepcharcoal">
                                                        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-lg dark:bg-deepcharcoal">
                                                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                                                        </div>
                                                        <p className="text-sm font-medium text-gray-500 dark:text-white/60">No invoice available</p>
                                                        <p className="mt-1 text-xs text-gray-400 dark:text-white/50">Upload pending</p>
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
                                            <div className="flex items-center justify-between mb-6">
                                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white/90">Final Attachments</h2>
                                                <span className="text-xs font-medium text-gray-500 dark:text-white/60">{order.final_attachments.length} files</span>
                                            </div>
                                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                                {order.final_attachments.map((attachment, index) => (
                                                    <div key={index} className="relative overflow-hidden transition-all bg-white border border-gray-200 shadow-sm group rounded-2xl hover:shadow-md dark:bg-deepcharcoal dark:border-gray-700">
                                                        <div className="relative w-full p-4">
                                                            <div className="relative flex items-center justify-center h-40 overflow-hidden border rounded-xl bg-gray-50 dark:bg-zinc-900/40 dark:border-gray-700">
                                                                <img src={attachment.url} alt={attachment.name} className="object-contain w-full h-full" />
                                                                <div className="absolute inset-0 items-center justify-center hidden gap-2 opacity-0 lg:flex bg-black/35 group-hover:opacity-100">
                                                                    <a href={attachment.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur">
                                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>View
                                                                    </a>
                                                                    <button onClick={() => handleFileDownload(attachment.name, attachment.url)} className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur">
                                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>Download
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="px-4 pb-4">
                                                            <p className="text-sm font-semibold text-gray-900 truncate dark:text-white/90">{attachment.name}</p>
                                                            <p className="mt-1 text-xs text-gray-500 dark:text-white/60">Attachment</p>
                                                            <div className="flex gap-2 mt-4 lg:hidden">
                                                                <a href={attachment.url} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center flex-1 gap-2 px-3 py-2 text-sm font-medium text-blue-600 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300">View</a>
                                                                <button onClick={() => handleFileDownload(attachment.name, attachment.url)} className="inline-flex items-center justify-center flex-1 gap-2 px-3 py-2 text-sm font-medium text-gray-700 rounded-xl bg-gray-50 hover:bg-gray-100 dark:bg-zinc-900/70 dark:text-white/70">Download</button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    }
                                />
                            )}

                            {/* ── Packaging Videos ── */}
                            <Card
                                Content={
                                    <div className="p-6">
                                        <h2 className="mb-6 text-lg font-semibold text-gray-900 dark:text-white/90">Packaging Videos</h2>

                                        <div className="space-y-3">
                                            {/* Header */}
                                            <div className="flex flex-wrap items-center justify-between text-sm font-medium text-gray-700 dark:text-white/80">
                                                <div className="flex items-center">
                                                    <div className="w-2 h-2 mr-2 bg-red-500 rounded-full"></div>
                                                    <h3>Packaging Videos</h3>
                                                </div>
                                                <div className="w-auto lg:w-[200px]">
                                                    <PrimaryButton
                                                        Text={'Begin Verification'}
                                                        Icon={
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
                                                            </svg>
                                                        }
                                                        Type={'button'}
                                                        Action={() => setOpenRecorder(true)}
                                                    />
                                                </div>
                                            </div>

                                            {/* Page-level verification banners */}
                                            {verificationStatus === 'success' && (
                                                <div className="flex items-center gap-3 p-4 border border-green-200 rounded-xl bg-green-50 dark:bg-green-900/20 dark:border-green-800">
                                                    <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 bg-green-100 rounded-full dark:bg-green-900/40">
                                                        <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                                    </div>
                                                    <p className="text-sm font-medium text-green-800 dark:text-green-300">{verificationMessage}</p>
                                                </div>
                                            )}
                                            {verificationStatus === 'mismatch' && (
                                                <div className="flex items-center gap-3 p-4 border border-red-200 rounded-xl bg-red-50 dark:bg-red-900/20 dark:border-red-800">
                                                    <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 bg-red-100 rounded-full dark:bg-red-900/40">
                                                        <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                                    </div>
                                                    <p className="text-sm font-medium text-red-800 dark:text-red-300">{verificationMessage}</p>
                                                </div>
                                            )}
                                            {verificationStatus === 'failed' && (
                                                <div className="flex items-center gap-3 p-4 border border-orange-200 rounded-xl bg-orange-50 dark:bg-orange-900/20 dark:border-orange-800">
                                                    <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full dark:bg-orange-900/40">
                                                        <svg className="w-4 h-4 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                                    </div>
                                                    <p className="text-sm font-medium text-orange-800 dark:text-orange-300">{verificationMessage}</p>
                                                </div>
                                            )}

                                            {/* Video list */}
                                            {order?.order_package_recordings?.length > 0 ? (
                                                order.order_package_recordings.map((item, index) => (
                                                    <div key={index} className="relative p-4 transition-all bg-white border border-gray-200 shadow-sm group rounded-xl hover:shadow-md dark:border-gray-700 dark:bg-deepcharcoal">
                                                        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-3 rounded-lg bg-gradient-to-br from-red-50 to-red-100 dark:from-green-900/20 dark:to-red-800/20">
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-red-600 dark:text-red-400">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
                                                            </svg>
                                                        </div>
                                                        <p className="mb-4 text-sm font-medium text-center text-gray-900 truncate dark:text-white/90">Packaging Video {index + 1}</p>
                                                        <div className="flex justify-center space-x-2">
                                                            <a
                                                                onClick={(e) => { if (!item?.package_video) { e.preventDefault(); setVideoIsntBeignUploadedYetOnAWS(true); } }}
                                                                href={item?.package_video || '#'}
                                                                target="_blank"
                                                                className="flex items-center justify-center text-blue-600 transition-colors rounded-full h-9 w-9 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                            </a>
                                                            <button
                                                                onClick={() => {
                                                                    if (!item?.package_video) setVideoIsntBeignUploadedYetOnAWS(true);
                                                                    else handleFileDownload('Packaging Video', item.package_video);
                                                                }}
                                                                className="flex items-center justify-center text-gray-600 transition-colors rounded-full h-9 w-9 bg-gray-50 hover:bg-gray-100 dark:bg-zinc-900/80 dark:text-gray-400"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="p-6 text-center border-2 border-gray-200 border-dashed rounded-xl bg-gray-50/50 dark:border-gray-700 dark:bg-deepcharcoal">
                                                    <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-lg dark:bg-deepcharcoal">
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="text-gray-400 size-6">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
                                                        </svg>
                                                    </div>
                                                    <p className="text-sm font-medium text-gray-500 dark:text-white/60">No Videos Found</p>
                                                    <p className="mt-1 text-xs text-gray-400 dark:text-white/50">Packaging videos upload pending</p>
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
                                        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white/90">Customer Information</h2>
                                        <div className="flex items-start space-x-4">
                                            <div className="flex-shrink-0">
                                                {order?.customer?.user?.profile ? (
                                                    <img src={order.customer.user.profile} alt="Profile" className="object-cover object-center w-20 h-20 rounded-full" />
                                                ) : (
                                                    <div className="flex items-center justify-center w-20 h-20 text-3xl font-bold text-blue-800 bg-blue-100 border-4 border-blue-500 rounded-full dark:border-white dark:bg-white/10 dark:text-white">
                                                        {order?.customer?.user?.avatar}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 space-y-1">
                                                <p className="flex items-center text-sm text-gray-600 dark:text-white/90">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="flex-shrink-0 w-4 h-4 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" /></svg>
                                                    <span className="break-all">{order.customer?.user?.name || 'N/A'}</span>
                                                </p>
                                                <p className="flex items-center text-sm text-gray-600 dark:text-white/90">
                                                    <svg className="flex-shrink-0 w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                                    <span className="break-all">{order.customer?.user?.email || 'N/A'}</span>
                                                </p>
                                                {order.customer?.user?.phone && (
                                                    <p className="flex items-center text-sm text-gray-600 dark:text-white/90">
                                                        <svg className="flex-shrink-0 w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                                        {order.customer.user.phone}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                }
                            />

                            {/* Addresses */}
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                {order?.shipping_address_line1 && (
                                    <Card Content={
                                        <div className="p-6">
                                            <h3 className="flex items-center mb-3 font-semibold text-gray-900 text-md dark:text-white/90">
                                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                                                Shipping Address 1
                                            </h3>
                                            <address className="text-sm not-italic text-gray-600 break-all dark:text-white/90">
                                                {order?.shipping_state || 'N/A'}, {order?.shipping_city || 'N/A'}<br />
                                                {order?.shipping_address_line1}, {order?.shipping_postal_code || ''}<br />
                                                {order?.shipping_country || ''}
                                            </address>
                                        </div>
                                    } />
                                )}
                                {order?.shipping_address_line2 && (
                                    <Card Content={
                                        <div className="p-6">
                                            <h3 className="flex items-center mb-3 font-semibold text-gray-900 text-md dark:text-white/90">
                                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                                                Shipping Address 2
                                            </h3>
                                            <address className="text-sm not-italic text-gray-600 break-all dark:text-white/90">
                                                {order?.shipping_state || 'N/A'}, {order?.shipping_city || 'N/A'}<br />
                                                {order?.shipping_address_line2}, {order?.shipping_postal_code || ''}<br />
                                                {order?.shipping_country || ''}
                                            </address>
                                        </div>
                                    } />
                                )}
                            </div>
                        </div>

                        {/* ── Sidebar ── */}
                        <div className="space-y-6">

                            {/* Order Summary */}
                            <Card
                                Content={
                                    <div className="p-6">
                                        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white/90">Order Summary</h3>
                                        <div className="space-y-3">
                                            {[
                                                [__('Product SubTotal'), order.sub_total],
                                                [__('Addons SubTotal'), order.addons_sub_total],
                                                [__('Shipping Fee'), order.shipping_fee],
                                                [__('Import Tax'), order.import_tax],
                                            ].map(([label, value]) => (
                                                <div key={label} className="flex justify-between text-sm text-main-text-light dark:text-main-text-dark">
                                                    <span className="text-sub-text-light dark:text-sub-text-dark">{label}</span>
                                                    <span className="font-semibold">{currency?.symbol}{Number(value || 0).toLocaleString('en-US')}</span>
                                                </div>
                                            ))}
                                            {order?.discount > 0 && (
                                                <div className="flex justify-between text-sm text-main-text-light dark:text-main-text-dark">
                                                    <span className="text-sub-text-light dark:text-sub-text-dark">{__('Discount')}</span>
                                                    <span className="font-semibold text-green-600 dark:text-green-400">-{currency?.symbol}{Number(order.discount).toLocaleString('en-US')}</span>
                                                </div>
                                            )}
                                            <div className="pt-3 space-y-1 border-t border-surface-3-light dark:border-surface-3-dark">
                                                {[
                                                    [__('Remaining Amount'), order.amount],
                                                    [__('Used Points Discount'), order.points_used],
                                                    [__('Total'), order.full_amount],
                                                ].map(([label, value]) => (
                                                    <div key={label} className="flex items-center justify-between text-main-text-light dark:text-main-text-dark">
                                                        <span className="text-base font-semibold text-sub-text-light dark:text-sub-text-dark">{label}</span>
                                                        <span className="text-xl font-semibold">{currency?.symbol}{Number(value || 0).toLocaleString('en-US')}</span>
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
                                        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white/90">Distributor & Payment</h3>
                                        <div className="mb-6">
                                            <h4 className="flex items-center mb-3 text-sm font-medium text-gray-900 dark:text-white/90">
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h1a1 1 0 011 1v5m-4 0h4" /></svg>
                                                Distributor
                                            </h4>
                                            <div className="space-y-2 text-sm text-gray-600 dark:text-white/90">
                                                <p className="flex items-center gap-2">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="flex-shrink-0 w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" /></svg>
                                                    <span className="break-all">{order?.order_items[0]?.smartphone?.category?.distributor?.user?.name || 'N/A'}</span>
                                                </p>
                                                <p className="flex items-center gap-2">
                                                    <svg className="flex-shrink-0 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                                    <span className="break-all">{order?.order_items[0]?.smartphone?.category?.distributor?.user?.email || 'N/A'}</span>
                                                </p>
                                                <p className="flex items-center gap-2">
                                                    <svg className="flex-shrink-0 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                                    {order?.order_items[0]?.smartphone?.category?.distributor?.user?.phone || 'N/A'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="p-4 mb-6 border rounded-lg bg-gray-50 dark:bg-deepcharcoal">
                                            <h4 className="flex items-center mb-3 text-sm font-medium text-gray-900 dark:text-white/90">
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                                                Bank Account Details
                                            </h4>
                                            <div className="grid grid-cols-1 gap-3 text-sm">
                                                {[
                                                    ['Bank Name', order?.order_items[0]?.smartphone?.category?.distributor?.bank_name],
                                                    ['Account Name', order?.order_items[0]?.smartphone?.category?.distributor?.bank_account_name],
                                                    ['Account No', order?.order_items[0]?.smartphone?.category?.distributor?.bank_account_no],
                                                    ['IBAN', order?.order_items[0]?.smartphone?.category?.distributor?.iban],
                                                    ['SWIFT CODE', order?.order_items[0]?.smartphone?.category?.distributor?.swift_code],
                                                ].map(([label, value]) => (
                                                    <div key={label} className="flex justify-between">
                                                        <span className="text-gray-600 dark:text-white/90">{label}:</span>
                                                        <span className="font-medium text-gray-900 break-all dark:text-white/90">{value || 'N/A'}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between p-4 my-4 border border-gray-200 rounded-lg bg-gray-50 dark:border-gray-700 dark:bg-deepcharcoal">
                                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Payment Method</span>
                                            <div className="flex items-center space-x-2">
                                                {order.payment_method === 'bank_transfer' && (<><svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg><span className="text-sm font-semibold text-gray-900 dark:text-white">Bank Transfer</span></>)}
                                                {order.payment_method === 'crypto' && (<><svg className="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg><span className="text-sm font-semibold text-gray-900 dark:text-white">Crypto</span></>)}
                                                {order.payment_method === 'points' && (<><svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg><span className="text-sm font-semibold text-gray-900 dark:text-white">Reward Points</span></>)}
                                                {!['bank_transfer', 'crypto', 'points'].includes(order.payment_method) && <span className="text-sm font-medium text-gray-500 dark:text-gray-400">N/A</span>}
                                            </div>
                                        </div>

                                        {order.is_cash_collected == 1 && (
                                            <div className="flex items-center my-3 space-x-3">
                                                <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                                                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                                </div>
                                                <p className="text-sm font-medium text-gray-900 dark:text-white/90">Cash Collected</p>
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
                        <div className="relative z-10 w-full max-w-lg p-8 text-center bg-white shadow-xl rounded-2xl dark:bg-deepcharcoal">
                            <h2 className="text-lg font-medium text-gray-800 dark:text-white">Downloading file, please wait...</h2>
                            <div className="flex items-center justify-center mt-5">
                                <svg aria-hidden="true" className="w-8 h-8 text-gray-200 animate-spin fill-blue-600 dark:text-gray-600" viewBox="0 0 100 101" fill="none"><path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" /><path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" /></svg>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Package Video Upload Modal ── */}
                {packageVideoProcessing && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="fixed inset-0 backdrop-blur-[32px]" />
                        <div className="relative z-10 w-full max-w-lg p-8 text-center bg-white shadow-xl rounded-2xl dark:bg-deepcharcoal">
                            <h2 className="text-lg font-medium text-gray-800 dark:text-white">Uploading package video, please wait...</h2>
                            <div className="flex items-center justify-center mt-5">
                                <svg aria-hidden="true" className="w-8 h-8 text-gray-200 animate-spin fill-blue-600 dark:text-gray-600" viewBox="0 0 100 101" fill="none"><path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" /><path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" /></svg>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── AWS Processing Warning ── */}
                {videoIsntBeignUploadedYetOnAWS && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="fixed inset-0 backdrop-blur-[32px]" onClick={() => setVideoIsntBeignUploadedYetOnAWS(false)} />
                        <div className="relative z-10 w-full max-w-lg p-8 text-center bg-white shadow-xl rounded-2xl dark:bg-deepcharcoal">
                            <h2 className="text-lg font-medium text-gray-800 dark:text-white">
                                Package recording is processing in the background. Refresh the page in 2-3 minutes.
                            </h2>
                            <div className="flex items-center justify-center mt-5">
                                <svg aria-hidden="true" className="w-8 h-8 text-gray-200 animate-spin fill-blue-600 dark:text-gray-600" viewBox="0 0 100 101" fill="none"><path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" /><path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" /></svg>
                            </div>
                        </div>
                    </div>
                )}

                {/* ────────────────────────────────────────────────────────────────
                    Recorder / Verification Modal
                    ──────────────────────────────────────────────────────────────── */}
                {openRecorder && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">

                        {/* Backdrop — blocked while recording */}
                        <div
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={isRecording ? undefined : handleClose}
                            style={isRecording ? { cursor: 'not-allowed' } : {}}
                        />

                        <div className="relative z-10 w-full max-w-2xl text-gray-900 bg-white shadow-2xl rounded-2xl dark:bg-deepcharcoal dark:text-white/80">

                            {/* Header */}
                            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b dark:border-white/10">
                                <h3 className="text-base font-semibold">Package Verification Recorder</h3>
                                {!isRecording && (
                                    <button
                                        onClick={handleClose}
                                        className="flex items-center justify-center w-8 h-8 text-gray-400 rounded-full hover:bg-gray-100 dark:hover:bg-white/10"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                )}
                            </div>

                            <div className="p-5">

                                {/* Camera error */}
                                {cameraError && (
                                    <div className="p-3 mb-4 border border-red-200 rounded-lg bg-red-50 dark:bg-red-900/20 dark:border-red-800">
                                        <p className="mb-2 text-sm text-red-800 dark:text-red-300">{cameraError}</p>
                                        <button onClick={startCamera} className="px-3 py-1 text-sm text-red-800 bg-red-100 rounded-lg hover:bg-red-200">
                                            Retry Camera
                                        </button>
                                    </div>
                                )}

                                {/* Inline success banner — only shows in modal on success */}
                                {verificationStatus === 'success' && (
                                    <div className="flex items-center gap-3 p-3 mb-4 border border-green-200 rounded-lg bg-green-50 dark:bg-green-900/20 dark:border-green-800">
                                        <svg className="flex-shrink-0 w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                        <p className="text-sm font-medium text-green-800 dark:text-green-300">
                                            CODE verified successfully. Save or retake the video below.
                                        </p>
                                    </div>
                                )}

                                {/* Video area */}
                                <div className="relative overflow-hidden bg-black rounded-xl" style={{ aspectRatio: '16/9' }}>

                                    {/* Live feed — always mounted, hidden when playback is active */}
                                    <video
                                        ref={recordingVideoRef}
                                        autoPlay
                                        muted
                                        playsInline
                                        className={`object-cover w-full h-full ${recordedUrl ? 'hidden' : 'block'}`}
                                        onTouchStart={refocus}
                                        onClick={refocus}
                                    />

                                    {/* Playback after recording completes */}
                                    {recordedUrl && (
                                        <video
                                            key={recordedUrl}
                                            src={recordedUrl}
                                            controls
                                            autoPlay
                                            className="object-cover w-full h-full"
                                        />
                                    )}

                                    {/* REC badge */}
                                    {isRecording && (
                                        <div className="absolute flex items-center gap-2 px-3 py-1 text-sm font-semibold text-white bg-red-600 rounded-full top-3 left-3">
                                            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                                            REC {elapsed > 0 && `${Math.floor(elapsed / 60)}:${String(elapsed % 60).padStart(2, '0')}`}
                                        </div>
                                    )}

                                    {/* Scanning indicator */}
                                    {isRecording && scanActive && (
                                        <div className="absolute flex items-center gap-2 px-3 py-1 text-xs text-white -translate-x-1/2 rounded-full bottom-3 left-1/2 bg-black/60">
                                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                            Scanning for CODE...
                                        </div>
                                    )}

                                    {/* Camera initializing */}
                                    {!isReady && !recordedUrl && !cameraError && (
                                        <div className="absolute inset-0 flex items-center justify-center text-white">
                                            <div className="text-center">
                                                <svg className="w-8 h-8 mx-auto mb-2 animate-spin" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                                </svg>
                                                <p className="text-sm">Starting camera...</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Controls */}
                                <div className="flex flex-wrap justify-center gap-3 mt-4">

                                    {!recordedUrl ? (
                                        <>
                                            {/* Start Recording */}
                                            <button
                                                onClick={handleStartRecording}
                                                disabled={!isReady || isRecording}
                                                className="px-5 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isRecording ? 'Recording...' : 'Start Recording'}
                                            </button>

                                            {/* Manual Stop — only while recording */}
                                            {isRecording && (
                                                <button
                                                    onClick={handleStopRecording}
                                                    className="px-5 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                                                >
                                                    Stop
                                                </button>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            {/* Upload Video */}
                                            <button
                                                onClick={handleSave}
                                                disabled={recordingSaving}
                                                className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                            >
                                                {recordingSaving ? 'Uploading...' : 'Upload Video'}
                                            </button>

                                            {/* Retake */}
                                            <button
                                                onClick={handleRetake}
                                                className="px-5 py-2 text-sm font-medium text-white rounded-lg bg-amber-500 hover:bg-amber-600"
                                            >
                                                Retake
                                            </button>
                                        </>
                                    )}

                                    {/* Close — always visible when not recording */}
                                    {!isRecording && (
                                        <button
                                            onClick={handleClose}
                                            className="px-5 py-2 text-sm font-medium text-white bg-gray-500 rounded-lg hover:bg-gray-600"
                                        >
                                            Close
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </AuthenticatedLayout>
        </>
    );
}
