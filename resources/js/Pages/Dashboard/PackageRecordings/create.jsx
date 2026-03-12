import Card from '@/Components/Card';
import LinkButton from '@/Components/LinkButton';
import PrimaryButton from '@/Components/PrimaryButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BreadCrumb from '@/Components/BreadCrumb';
import { Head, useForm } from '@inertiajs/react';
import React, { useEffect, useRef, useState } from 'react';
import SelectInput from '@/Components/SelectInput';
import { useVideoRecorder } from '@/Hooks/useVideoRecorder';
import { useScanner } from '@/Hooks/useScanner';
import axios from 'axios';

export default function create({ orders }) {


    const { data, setData, post, processing, errors } = useForm({
        order_id: '',
        package_video: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('dashboard.package-recordings.store'), {
            forceFormData: true,
        });
    };


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

    const getSelectedOrderNo = () => {
        const selected = orders.find((o) => String(o.id) === String(data.order_id));
        return selected?.order_no || selected?.name || '';
    };


    const handleScannedCode = async (scannedValue) => {
        if (isVerifiedRef.current) return;
        const trimmed = scannedValue.trim();
        if (!trimmed) return;


        isVerifiedRef.current = true;
        stopScanning();
        stopRecording();

        const orderNo = getSelectedOrderNo();

        try {
            const { data: resData } = await axios.post(route('dashboard.orders.verify'), {
                order_no: orderNo,
                code: trimmed,
            });


            const isSuccess =
                resData.status === true

            if (isSuccess) {
                setVerificationStatus('success');
                setVerificationMessage(
                    resData?.message ||
                    `Verification successful. CODE ${trimmed} matched and recorded.`
                );

            } else {
                setVerificationStatus('mismatch');
                setVerificationMessage(resData?.message || `CODE does not match: ${trimmed}`);
                _doClose(false);
            }
        } catch (err) {
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
            setData('package_video', recordedFile);
            _doClose(false);
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
        if (recordedUrl && manualStopRef.current) {
            retake();
            manualStopRef.current = false;
        }
    }, [recordedUrl]);


    useEffect(() => {

        if (data.order_id) {

            setData('package_video', '');
            setVerificationStatus(null);
            setVerificationMessage('');
        }

    }, [data.order_id]);

    useEffect(() => {
        if (!data.package_video) {
            setVerificationStatus(null);
            setVerificationMessage('');
        }
    }, [data.package_video]);


    return (
        <>
            <AuthenticatedLayout>
                <Head title="Package Recordings" />

                <BreadCrumb
                    header={'Create Package Recording'}
                    parent={'Package Recordings'}
                    parent_link={route('dashboard.package-recordings.index')}
                    child={'Create Package Recording'}
                />

                <Card
                    Content={
                        <>
                            <div className="flex flex-wrap justify-end my-3">
                                <LinkButton
                                    Text={'Back To Package Recordings'}
                                    URL={route('dashboard.package-recordings.index')}
                                    Icon={
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
                                        </svg>
                                    }
                                />
                            </div>

                            <form onSubmit={submit}>
                                <Card
                                    Content={
                                        <>
                                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                <SelectInput
                                                    InputName={'Order'}
                                                    Error={errors.order_id}
                                                    Value={data.order_id}
                                                    Placeholder={'Select Order'}
                                                    Id={'order_id'}
                                                    Name={'name'}
                                                    Required={true}
                                                    items={orders}
                                                    itemKey={'name'}
                                                    Multiple={false}
                                                    Action={(value) => {
                                                        setData('order_id', value);
                                                        // Clear stale banner when order changes
                                                        setVerificationStatus(null);
                                                        setVerificationMessage('');
                                                    }}
                                                />

                                                {/* Recorded video indicator */}
                                                {data.package_video !== '' && (
                                                    <div className="grid grid-cols-1 gap-4">
                                                        <div className="flex items-center justify-between max-w-lg p-4 bg-white border border-gray-200 rounded-lg shadow-sm dark:border-gray-700 dark:bg-deepcharcoal">
                                                            <div className="flex items-center gap-3">
                                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 dark:text-white/80">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
                                                                </svg>
                                                                <h2 className="dark:text-white/80">Package Video</h2>
                                                            </div>
                                                            <div
                                                                className="flex items-center cursor-pointer"
                                                                onClick={() => setData('package_video', '')}
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 dark:text-white/80">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                                                </svg>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* ── Page-level verification banners ── */}
                                            {verificationStatus === 'success' && (
                                                <div className="flex items-center gap-3 p-4 mt-4 border border-green-200 rounded-xl bg-green-50 dark:bg-green-900/20 dark:border-green-800">
                                                    <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 bg-green-100 rounded-full dark:bg-green-900/40">
                                                        <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    </div>
                                                    <p className="text-sm font-medium text-green-800 dark:text-green-300">{verificationMessage}</p>
                                                </div>
                                            )}
                                            {verificationStatus === 'mismatch' && (
                                                <div className="flex items-center gap-3 p-4 mt-4 border border-red-200 rounded-xl bg-red-50 dark:bg-red-900/20 dark:border-red-800">
                                                    <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 bg-red-100 rounded-full dark:bg-red-900/40">
                                                        <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </div>
                                                    <p className="text-sm font-medium text-red-800 dark:text-red-300">{verificationMessage}</p>
                                                </div>
                                            )}
                                            {verificationStatus === 'failed' && (
                                                <div className="flex items-center gap-3 p-4 mt-4 border border-orange-200 rounded-xl bg-orange-50 dark:bg-orange-900/20 dark:border-orange-800">
                                                    <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full dark:bg-orange-900/40">
                                                        <svg className="w-4 h-4 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                        </svg>
                                                    </div>
                                                    <p className="text-sm font-medium text-orange-800 dark:text-orange-300">{verificationMessage}</p>
                                                </div>
                                            )}

                                            {/* ── Action Buttons ── */}
                                            <div className="flex flex-wrap items-center gap-4 mt-4">
                                                <PrimaryButton
                                                    Text={'Create Package Recording'}
                                                    Type={'submit'}
                                                    CustomClass={'w-[250px]'}
                                                    Disabled={
                                                        processing ||
                                                        data.order_id === '' ||
                                                        data.package_video === ''
                                                    }
                                                    Spinner={processing}
                                                    Icon={
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                                        </svg>
                                                    }
                                                />

                                                {/* Record Video — disabled until order is selected */}
                                                <PrimaryButton
                                                    Text={'Begin Verification'}
                                                    Type={'button'}
                                                    CustomClass={'w-[250px]'}
                                                    Disabled={recordingSaving || data.order_id === ''}
                                                    Action={() => setOpenRecorder(true)}
                                                    Spinner={recordingSaving}
                                                    Icon={
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
                                                        </svg>
                                                    }
                                                />
                                            </div>
                                        </>
                                    }
                                />
                            </form>
                        </>
                    }
                />


                {processing && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="fixed inset-0 backdrop-blur-[32px]" />
                        <div className="relative z-10 w-full max-w-lg p-8 text-center bg-white shadow-xl rounded-2xl dark:bg-deepcharcoal">
                            <h2 className="text-lg font-medium text-gray-800 dark:text-white">
                                Creating package recording, please wait...
                            </h2>
                            <div className="flex items-center justify-center mt-5">
                                <svg aria-hidden="true" className="w-8 h-8 text-gray-200 animate-spin fill-blue-600 dark:text-gray-600" viewBox="0 0 100 101" fill="none">
                                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                                    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                                </svg>
                            </div>
                        </div>
                    </div>
                )}


                {openRecorder && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">

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

                                {cameraError && (
                                    <div className="p-3 mb-4 border border-red-200 rounded-lg bg-red-50 dark:bg-red-900/20 dark:border-red-800">
                                        <p className="mb-2 text-sm text-red-800 dark:text-red-300">{cameraError}</p>
                                        <button onClick={startCamera} className="px-3 py-1 text-sm text-red-800 bg-red-100 rounded-lg hover:bg-red-200">
                                            Retry Camera
                                        </button>
                                    </div>
                                )}

                                {/* Video area */}
                                <div className="relative overflow-hidden bg-black rounded-xl" style={{ aspectRatio: '16/9' }}>

                                    <video
                                        ref={recordingVideoRef}
                                        autoPlay
                                        muted
                                        playsInline
                                        className={`object-cover w-full h-full ${recordedUrl ? 'hidden' : 'block'}`}
                                        onTouchStart={refocus}
                                        onClick={refocus}
                                    />

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
                                            <button
                                                onClick={handleStartRecording}
                                                disabled={!isReady || isRecording}
                                                className="px-5 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isRecording ? 'Recording...' : 'Start Recording'}
                                            </button>

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
                                            <button
                                                onClick={handleSave}
                                                disabled={recordingSaving || !isVerifiedRef.current}
                                                className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                            >
                                                {recordingSaving ? 'Saving...' : 'Use This Video'}
                                            </button>

                                            <button
                                                onClick={handleRetake}
                                                className="px-5 py-2 text-sm font-medium text-white rounded-lg bg-amber-500 hover:bg-amber-600"
                                            >
                                                Retake
                                            </button>
                                        </>
                                    )}

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
