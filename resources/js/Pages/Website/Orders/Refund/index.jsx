import WebTextArea from '@/Components/WebTextArea';
import { useConfirm } from '@/Hooks/useConfirm';
import { useTranslation } from '@/Hooks/useTranslation';
import useWindowSize from '@/Hooks/useWindowSize';
import MainLayout from '@/Layouts/Website/MainLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ChevronLeft } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useScanner } from '@/Hooks/useScanner';
import axios from 'axios';
import { useVideoRecorder } from '@/Hooks/useVideoRecorder';

const index = ({ order_no, order }) => {

    const { confirm, ConfirmDialog } = useConfirm();
    const { data, setData, post, processing, errors } = useForm({
        refund_reason: '',
        scanned_code: '',
        return_Packaging_video: '',
        defect_evidence_video: ''
    });


    const [activeRecorder, setActiveRecorder] = useState(null);
    // Translation Hook
    const { __ } = useTranslation();

    const [isDisabled, setIsDisabled] = useState(false);


    const [imeiVerified, setImeiVerified] = useState(false);
    const [showIMEIModal, setShowIMEIModal] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [scanCooldown, setScanCooldown] = useState(false);
    const [scanError, setScanError] = useState(null);
    const cooldownRef = useRef(null);

    const { videoRef: scannerVideoRef } = useScanner({
        active: showIMEIModal && !scanCooldown && !isVerifying,
        onScan: (text) => handleIMEIScan(text),
    });

    const windowSize = useWindowSize();
    useEffect(() => {
        setIsDisabled(data.refund_reason === '');
    }, [data]);

    const handleIMEIScan = async (scannedValue) => {
        if (scanCooldown || isVerifying) return;

        const lines = scannedValue.trim().split(/[\n\r\s,;|]+/);
        const code = lines[0]?.trim();


        if (!code) {
            setScanError('Could not read a valid CODE. Please try again.');
            setScanCooldown(true);
            cooldownRef.current = setTimeout(() => { setScanCooldown(false); setScanError(null); }, 2500);
            return;
        }

        setScanCooldown(true);
        setIsVerifying(true);
        setScanError(null);



        try {
            await axios.post(
                route('website.orders.verify'),
                { code: code, order_no: order_no },
            ).then((res) => {
                if (res.data.status) {
                    setData('scanned_code', code);
                    setImeiVerified(true);
                    setShowIMEIModal(false);
                }

                const msg = res?.data?.message || __('CODE not found. Device not registered in inventory.');
                setScanError(msg);
                cooldownRef.current = setTimeout(() => { setScanCooldown(false); setScanError(null); }, 3000);
            });

        } catch (err) {
            const msg = err?.response?.data?.message || __('CODE not found. Device not registered in inventory.');
            setScanError(msg);
            cooldownRef.current = setTimeout(() => { setScanCooldown(false); setScanError(null); }, 3000);
        } finally {
            setIsVerifying(false);
        }
    };


    const submit = async (e) => {
        e.preventDefault();

        if (isDisabled) {
            return;
        }


        const result = await confirm({
            title: __('Confirm Refund Request'),
            text: __('Are you sure you want to submit this refund request? Our team will review it before taking any action.'),
            icon: 'info',
            showCancelButton: true,
            confirmButtonText: __('Submit Request'),
            cancelButtonText: __('Cancel'),
        });

        if (result.isConfirmed) {
            post(route('website.orders.refund.request.store', order_no), {
                preserveScroll: true,
                preserveState: true,
            });
        }


    };


    useEffect(() => {
        if (order?.status === 'delivered' && !imeiVerified) {
            setShowIMEIModal(true);
        }
        return () => clearTimeout(cooldownRef.current);
    }, []);

    return (
        <MainLayout>
            <Head title={__("Refund Request", true)} />
            <ConfirmDialog />


            <div className="sm:px-6 lg:px-8">
                <div className={`mx-auto lg:mt-6 ${windowSize.width > 1024 ? 'pb-0' : 'pb-24'} lg:max-w-6xl sm:max-w-3xl`}>


                    {/* Hero Section */}
                    <div className="relative overflow-hidden">
                        <div className="absolute inset-0" />

                        <div className="relative px-6 mx-auto my-2 lg:max-w-6xl sm:max-w-3xl">

                            <Link
                                href={route('website.orders.index')}
                                className="inline-flex items-center gap-2 mb-4 text-sm font-medium transition-colors lg:hidden text-main-text-light lg:hover:text-main-text-light/80 dark:text-main-text-dark dark:lg:hover:text-main-text-dark/80"
                            >
                                <ChevronLeft />
                            </Link>

                            <h1 className="text-[24px] font-semibold text-main-text-light dark:text-main-text-dark">
                                {__('Request a Refund')}
                            </h1>

                            <p className="max-w-3xl mt-1 text-sm text-sub-text-light dark:sub-text-dark">
                                {__(
                                    'You can submit a refund request for this order. All refund requests are carefully reviewed by our team before being approved or rejected.'
                                )}
                            </p>

                            <div className="flex flex-wrap gap-4 mt-5">
                                {/* Review Badge */}
                                <div className="flex items-center gap-2 rounded-full bg-surface-1-light dark:bg-surface-1-dark px-3 py-1.5">

                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-sub-text-light dark:text-sub-text-dark">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                    </svg>

                                    <span className="text-sm font-medium text-sub-text-light dark:text-sub-text-dark">
                                        {__('Admin Review Required')}
                                    </span>
                                </div>

                                {/* Processing Badge */}
                                <div className="flex items-center gap-2 rounded-full bg-surface-1-light dark:bg-surface-1-dark px-3 py-1.5">

                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-sub-text-light dark:text-sub-text-dark">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 0 0-3.7-3.7 48.678 48.678 0 0 0-7.324 0 4.006 4.006 0 0 0-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 0 0 3.7 3.7 48.656 48.656 0 0 0 7.324 0 4.006 4.006 0 0 0 3.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3-3 3" />
                                    </svg>

                                    <span className="text-sm font-medium text-sub-text-light dark:text-sub-text-dark">
                                        {__('Processed After Approval')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>


                    {/* Main Content */}
                    <div className={`mx-auto  mt-10 px-6 sm:max-w-3xl lg:max-w-6xl`}>
                        <div className="grid gap-8 lg:grid-cols-1">
                            {/* Form */}
                            <form onSubmit={submit}>
                                <h2 className="mb-6 text-xl font-semibold text-main-text-light dark:text-main-text-dark">
                                    {__('Submit Refund Request')}
                                </h2>

                                <div className="space-y-3">

                                    {/* Reason Field */}
                                    <div>
                                        <WebTextArea
                                            InputName={__('Reason for Refund')}
                                            Id={'reason'}
                                            Name={'reason'}
                                            Error={errors.refund_reason}
                                            Value={data.refund_reason}
                                            Action={(e) => setData('refund_reason', e.target.value)}
                                            Required={true}
                                            Rows={6}
                                            Placeholder={__('Please briefly explain why you are requesting a refund')}
                                            ClassName={'dark:bg-surface-1-dark'}
                                        />


                                        {order?.status === 'delivered' && (
                                            <>
                                                <VideoRecorderPanel
                                                    label={__('Defect Evidence Video')}
                                                    onFileSaved={(file) => setData('defect_evidence_video', file)}
                                                    isActive={activeRecorder === 'defect'}
                                                    onOpen={() => setActiveRecorder('defect')}
                                                    onClose={() => setActiveRecorder(null)}
                                                    __={__}
                                                />

                                                <VideoRecorderPanel
                                                    label={__('Return Packaging Video')}
                                                    onFileSaved={(file) => setData('return_Packaging_video', file)}
                                                    isActive={activeRecorder === 'packaging'}
                                                    onOpen={() => setActiveRecorder('packaging')}
                                                    onClose={() => setActiveRecorder(null)}
                                                    __={__}
                                                />
                                            </>
                                        )}
                                    </div>

                                    {/* Info Box */}
                                    <div className="p-4 border rounded-md border-surface-3-light bg-surface-1-light dark:bg-surface-1-dark dark:border-surface-3-dark">
                                        <p className="text-sm text-sub-text-light dark:text-sub-text-dark">
                                            {__(
                                                'Your refund request will be reviewed by our team. Once reviewed, you will be notified about the approval or rejection.'
                                            )}
                                        </p>
                                    </div>

                                    {/* Submit Button */}
                                    <div className="flex justify-end py-4">
                                        <button
                                            disabled={processing || isDisabled || (!imeiVerified && order?.status === 'delivered')}
                                            type="submit"
                                            className={`text-md flex h-[50px] w-[180px] items-center justify-center gap-2 rounded-md bg-black font-semibold text-white transition-all hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/80 ${(processing || isDisabled || (!imeiVerified && order?.status === 'delivered')) && 'cursor-not-allowed opacity-25 dark:opacity-40'}`}
                                        >
                                            <div className="flex items-center justify-center gap-2">
                                                {processing && (
                                                    <div role="status">
                                                        <svg
                                                            aria-hidden="true"
                                                            className={`size-5 animate-spin fill-red-500 text-white/80`}
                                                            viewBox="0 0 100 101"
                                                            fill="none"
                                                            xmlns="http://www.w3.org/2000/svg"
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
                                                        <span className="sr-only"></span>
                                                    </div>
                                                )}
                                                <span>{__('Request Refund')}</span>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            </form>


                        </div>
                    </div>

                </div>
            </div>


            {showIMEIModal && (
                <div className="absolute inset-0 z-40 flex items-start overflow-y-auto lg:items-center scrollbar-none">
                    <div className="absolute inset-0 bg-backgroundLight/80 dark:bg-backgroundDark/90 backdrop-blur-sm" />

                    {/* Panel */}
                    <div className="relative z-10 flex flex-col w-full max-w-2xl gap-0 mx-auto mb-20 overflow-hidden border rounded-md shadow-xl sm:mb-8 border-surface-3-light dark:border-surface-3-dark bg-backgroundLight dark:bg-surface-1-dark">

                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-3-light dark:border-surface-3-dark">
                            <div className="flex items-center gap-2.5">
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                                <h3 className="text-sm font-semibold text-main-text-light dark:text-main-text-dark">
                                    {__('Step Required Before Submitting')}
                                </h3>
                            </div>
                        </div>

                        <div className="grid gap-6 p-6 lg:grid-cols-2">

                            {/* LEFT: Explanation */}
                            <div className="flex flex-col justify-between gap-5">

                                {/* What is this */}
                                <div>
                                    <h2 className="text-lg font-semibold text-main-text-light dark:text-main-text-dark">
                                        {__('Verify Your Device First')}
                                    </h2>
                                    <p className="mt-1.5 text-sm leading-relaxed text-sub-text-light dark:text-sub-text-dark">
                                        {__('Before you can submit a refund request, we need to verify the IMEI of the device included in this order. This helps us confirm the device condition and process your refund accurately.')}
                                    </p>
                                </div>

                                {/* Steps */}
                                <div className="space-y-3">
                                    {[
                                        {
                                            num: '1',
                                            title: __('Scan Device Barcode'),
                                            desc: __('Point your camera at the barcode printed on the device or its box.'),
                                        },
                                        {
                                            num: '2',
                                            title: __('Auto Verification'),
                                            desc: __('Scanned Code is extracted and matched against your order automatically.'),
                                        },
                                        {
                                            num: '3',
                                            title: __('Submit Your Request'),
                                            desc: __('Once verified, you can fill in the reason and submit your refund.'),
                                        },
                                    ].map((s) => (
                                        <div key={s.num} className="flex items-start gap-3">
                                            <div className={`flex items-center justify-center w-7 h-7 rounded-md text-xs font-semibold shrink-0 text-main-text-light dark:text-main-text-dark`}>
                                                {s.num}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-main-text-light dark:text-main-text-dark">{s.title}</p>
                                                <p className="mt-0.5 text-xs text-sub-text-light dark:text-sub-text-dark">{s.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Info note */}
                                <div className="flex items-start gap-2 p-3 border rounded-md border-surface-3-light bg-surface-1-light dark:bg-surface-1-dark dark:border-surface-3-dark">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="mt-0.5 size-4 shrink-0 text-sub-text-light dark:text-sub-text-dark">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                                    </svg>
                                    <p className="text-xs leading-relaxed text-sub-text-light dark:text-sub-text-dark">
                                        {__('IMEI 1, IMEI 2, SERIAL NO., EID Codes Are used for verification. Make sure the barcode is clean and well-lit for best results')}
                                    </p>
                                </div>
                            </div>

                            {/* RIGHT: Scanner */}
                            <div className="flex flex-col gap-3">
                                <p className="text-xs font-medium tracking-wide uppercase text-sub-text-light dark:text-sub-text-dark">
                                    {__('Scanner')}
                                </p>

                                {/* Viewport */}
                                <div className="relative overflow-y-auto rounded-md bg-gray-950" style={{ aspectRatio: '4/3' }}>

                                    <video
                                        ref={scannerVideoRef}
                                        className="object-cover w-full h-full"
                                        muted
                                        playsInline
                                    />
                                    {/* Scan guide corners */}
                                    {!isVerifying && !scanCooldown && (
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            <div className="relative h-24 w-44">
                                                <span className="absolute w-5 h-5 border-t-2 border-l-2 rounded-tl border-white/60 -top-px -left-px" />
                                                <span className="absolute w-5 h-5 border-t-2 border-r-2 rounded-tr border-white/60 -top-px -right-px" />
                                                <span className="absolute w-5 h-5 border-b-2 border-l-2 rounded-bl border-white/60 -bottom-px -left-px" />
                                                <span className="absolute w-5 h-5 border-b-2 border-r-2 rounded-br border-white/60 -bottom-px -right-px" />
                                                <div className="absolute h-px left-2 right-2 bg-white/30 top-1/2 animate-pulse" />
                                            </div>
                                        </div>
                                    )}

                                    {/* Verifying overlay */}
                                    {isVerifying && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gray-950">
                                            <svg className="w-9 h-9 text-white/60 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                                                <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                            </svg>
                                            <p className="text-sm font-medium text-white/80">{__('Verifying IMEI...')}</p>
                                            <p className="text-xs text-white/30">{__('Checking order records')}</p>
                                        </div>
                                    )}

                                    {/* Error cooldown overlay */}
                                    {scanCooldown && !isVerifying && scanError && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-5 bg-gray-950/95">
                                            <div className="flex items-center justify-center border border-red-800 rounded-full w-11 h-11 bg-red-900/30">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="text-red-400 size-5">
                                                    <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-sm font-semibold text-red-300">{__('Verification Failed')}</p>
                                                <p className="mt-1 text-xs text-center text-white/40 max-w-[180px]">{scanError}</p>
                                            </div>
                                            <p className="text-xs animate-pulse text-white/25">{__('Scanner restarting...')}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Active indicator */}
                                {!isVerifying && !scanCooldown && (
                                    <div className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                        <span className="text-xs text-sub-text-light dark:text-sub-text-dark">{__('Scanner active - align barcode within the frame')}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </MainLayout >
    );
};

export default index;


function formatTime(secs) {
    const m = String(Math.floor(secs / 60)).padStart(2, '0');
    const s = String(secs % 60).padStart(2, '0');
    return `${m}:${s}`;
}

function VideoRecorderPanel({ label, onFileSaved, isActive, onOpen, onClose, __ }) {
    const {
        recordingVideoRef, isReady, isRecording, recordedFile,
        recordedUrl, cameraError, elapsed,
        startCamera, stopCamera, startRecording, stopRecording, retake,
    } = useVideoRecorder();

    const [saved, setSaved] = useState(false);

    useEffect(() => {
        if (!isActive && isReady) {
            stopCamera();
        }
    }, [isActive]);

    const handleOpenCamera = () => {
        onOpen();
        startCamera();
    };

    const handleSave = () => {
        onFileSaved(recordedFile);
        setSaved(true);
        stopCamera();
        onClose();
    };

    const handleCancel = () => {
        stopCamera();
        onFileSaved(null);
        onClose();
    };

    const handleRetake = () => {
        setSaved(false);
        onFileSaved(null);
        retake();
        if (!isReady) {
            onOpen();
            startCamera();
        }
    };

    return (
        <div className="p-4 mt-3 border rounded-md border-surface-3-light dark:border-surface-3-dark bg-surface-1-light dark:bg-surface-1-dark">

            {/* Label + status */}
            <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-main-text-light dark:text-main-text-dark">
                    {label}
                </p>
                {saved && recordedFile && (
                    <span className="flex items-center gap-1.5 text-xs font-medium text-green-600 dark:text-green-400">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-4">
                            <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                        </svg>
                        {__('Video saved')}
                    </span>
                )}
            </div>

            {/* Saved state - compact */}
            {saved && recordedFile ? (
                <div className="flex items-center justify-between p-3 border rounded-md border-surface-3-light dark:border-surface-3-dark">
                    <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="text-sub-text-light dark:text-sub-text-dark size-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
                        </svg>
                        <p className="font-mono text-xs text-sub-text-light dark:text-sub-text-dark truncate max-w-[180px]">
                            {recordedFile.name}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={handleRetake}
                        className="text-xs font-medium text-amber-600 dark:text-amber-400 hover:underline"
                    >
                        {__('Re-record')}
                    </button>
                </div>
            ) : (
                <>
                    {!isReady && !cameraError ? (
                        /* ── Open Camera button ── */
                        <button
                            type="button"
                            onClick={handleOpenCamera}
                            className="flex items-center justify-center w-full gap-2 py-8 text-sm font-medium transition-colors border-2 border-dashed rounded-md border-surface-3-light dark:border-surface-3-dark text-sub-text-light dark:text-sub-text-dark hover:border-main-text-light dark:hover:border-main-text-dark"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
                            </svg>
                            {__('Open Camera')}
                        </button>
                    ) : cameraError ? (
                        <div className="p-3 border border-red-200 rounded-md bg-red-50 dark:bg-red-900/20 dark:border-red-800">
                            <p className="text-sm text-red-700 dark:text-red-400">{cameraError}</p>
                            <button
                                type="button"
                                onClick={handleOpenCamera}
                                className="mt-1 text-xs font-medium text-red-600 underline dark:text-red-400"
                            >
                                {__('Retry')}
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {/* Video viewport */}
                            <div className="relative overflow-hidden rounded-md bg-gray-950" style={{ aspectRatio: '16/9' }}>

                                {isReady && (
                                    <video
                                        ref={recordingVideoRef}
                                        className={`object-cover w-full h-full ${recordedUrl ? 'hidden' : 'block'}`}
                                        muted
                                        playsInline
                                        autoPlay
                                    />
                                )}

                                {recordedUrl && (
                                    <video
                                        key={recordedUrl}
                                        src={recordedUrl}
                                        controls
                                        autoPlay
                                        playsInline
                                        className="object-cover w-full h-full"
                                        onLoadedMetadata={(e) => e.currentTarget.play().catch(() => { })}
                                    />
                                )}

                                {isRecording && (
                                    <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2.5 py-1 bg-red-600 rounded-full shadow">
                                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" style={{ animationDuration: '1s' }} />
                                        <span className="text-xs font-bold tracking-widest text-white uppercase">REC</span>
                                        <span className="font-mono text-xs text-white/80">{formatTime(elapsed)}</span>
                                    </div>
                                )}

                                {isRecording && elapsed >= 270 && (
                                    <div className="absolute flex items-center justify-center bottom-2 left-2 right-2">
                                        <span className="px-2 py-1 text-xs font-medium text-white rounded-full bg-amber-600/90">
                                            {__('Max 5 min')} — {formatTime(300 - elapsed)} {__('remaining')}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Controls */}
                            <div className="flex flex-wrap gap-2">
                                {!recordedUrl ? (
                                    <>
                                        {!isRecording ? (
                                            <button
                                                type="button"
                                                onClick={startRecording}
                                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors bg-red-600 rounded-md hover:bg-red-700"
                                            >
                                                <span className="w-2 h-2 bg-white rounded-full" />
                                                {__('Start Recording')}
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={stopRecording}
                                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors bg-gray-700 rounded-md hover:bg-gray-800"
                                            >
                                                <span className="w-2 h-2 bg-white rounded-sm" />
                                                {__('Stop Recording')}
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            onClick={handleCancel}
                                            className="px-4 py-2 text-sm font-medium transition-colors border rounded-md border-surface-3-light dark:border-surface-3-dark text-sub-text-light dark:text-sub-text-dark hover:bg-surface-1-light dark:hover:bg-surface-3-dark"
                                        >
                                            {__('Cancel')}
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            type="button"
                                            onClick={handleSave}
                                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors bg-black rounded-md dark:bg-white dark:text-black hover:bg-black/80 dark:hover:bg-white/80"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-4">
                                                <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                                            </svg>
                                            {__('Save Video')}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleRetake}
                                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors rounded-md bg-amber-500 hover:bg-amber-600"
                                        >
                                            {__('Retake')}
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
