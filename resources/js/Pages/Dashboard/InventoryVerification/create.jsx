import Card from '@/Components/Card';
import LinkButton from '@/Components/LinkButton';
import PrimaryButton from '@/Components/PrimaryButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BreadCrumb from '@/Components/BreadCrumb';
import { Head, useForm } from '@inertiajs/react';
import React, { useEffect, useRef, useState } from 'react';
import BarcodeScannerComponent from 'react-qr-barcode-scanner';
import Swal from 'sweetalert2';
import axios from 'axios';

// ─── Step Constants ─────────────────────────────────────────────────────────
const STEP = {
    IDLE: 'idle',
    SCANNING: 'scanning',
    RECORDING: 'recording',
    DONE: 'done',
};

// ─── Step Indicator ──────────────────────────────────────────────────────────
function StepIndicator({ step }) {
    const steps = [
        { key: STEP.SCANNING, label: 'Scan IMEI' },
        { key: STEP.RECORDING, label: 'Record Video' },
        { key: STEP.DONE, label: 'Submit' },
    ];
    const order = [STEP.SCANNING, STEP.RECORDING, STEP.DONE];
    const currentIndex = order.indexOf(step);

    return (
        <div className="flex items-center justify-center mb-8">
            {steps.map((s, i) => {
                const idx = order.indexOf(s.key);
                const isActive = step === s.key;
                const isDone = currentIndex > idx;

                return (
                    <React.Fragment key={s.key}>
                        <div className="flex flex-col items-center gap-1.5">
                            <div className={`flex items-center justify-center w-9 h-9 rounded-full border-2 font-bold text-sm transition-all duration-300
                                ${isActive
                                    ? 'border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/40'
                                    : isDone
                                        ? 'border-green-500 bg-green-500 text-white'
                                        : 'border-gray-200 bg-white text-gray-400 dark:border-white/10 dark:bg-white/5 dark:text-white/30'
                                }`}
                            >
                                {isDone ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-4">
                                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                                    </svg>
                                ) : (
                                    <span>{i + 1}</span>
                                )}
                            </div>
                            <span className={`text-xs font-medium whitespace-nowrap transition-colors
                                ${isActive ? 'text-blue-600 dark:text-blue-400' : isDone ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-white/30'}`}
                            >
                                {s.label}
                            </span>
                        </div>
                        {i < steps.length - 1 && (
                            <div className={`mx-3 mb-5 h-0.5 w-16 sm:w-24 transition-colors duration-300
                                ${currentIndex > i ? 'bg-green-500' : 'bg-gray-200 dark:bg-white/10'}`}
                            />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
}

// ─── Verified Item Badge ──────────────────────────────────────────────────────
function VerifiedBadge({ item }) {
    if (!item) return null;
    return (
        <div className="flex items-center gap-3 p-3 border border-green-200 rounded-xl bg-green-50 dark:bg-green-900/20 dark:border-green-800">
            <div className="flex items-center justify-center bg-green-100 rounded-full shrink-0 size-8 dark:bg-green-900/40">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="text-green-600 size-4 dark:text-green-400">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                </svg>
            </div>
            <div className="min-w-0">
                <p className="text-xs font-semibold tracking-wide text-green-700 uppercase dark:text-green-400">IMEI Verified</p>
                <p className="text-sm font-medium text-green-800 truncate dark:text-green-300">{item.name}</p>
                {item.imei_1 && (
                    <p className="font-mono text-xs text-green-600 dark:text-green-500">{item.imei_1}</p>
                )}
            </div>
        </div>
    );
}

export default function create() {

    const { data, setData, post, processing, errors, reset } = useForm({
        inventory_id: '',
        imei: '',
        verification_video: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('dashboard.inventory-verifications.store'), {
            forceFormData: true,
            onSuccess: (page) => {
                if (page.props.flash.success) {
                    handleFullReset();
                }
            },
        });
    };


    const [step, setStep] = useState(STEP.IDLE);
    const [verifiedItem, setVerifiedItem] = useState(null);
    const [scanError, setScanError] = useState(null);
    const [isVerifying, setIsVerifying] = useState(false);
    const [scanCooldown, setScanCooldown] = useState(false);

    const [stream, setStream] = useState(null);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [recordedVideoUrl, setRecordedVideoUrl] = useState(null);
    const [recordingSaving, setRecordingSaving] = useState(false);
    const [cameraError, setCameraError] = useState(null);
    const [useFrontCamera, setUseFrontCamera] = useState(false);
    const [availableDevices, setAvailableDevices] = useState({ video: [], audio: [] });

    const videoRef = useRef(null);
    const cooldownRef = useRef(null);
    const handleIMEIScan = async (scannedValue) => {
        if (scanCooldown || isVerifying) return;

        // IMEI 1 is always the first value in multi-line barcode formats
        const lines = scannedValue.trim().split(/[\n\r\s,;|]+/);
        const imei = lines[0]?.trim();



        if (!imei) {
            setScanError('Could not read a valid IMEI from the barcode. Please try again.');
            setScanCooldown(true);
            cooldownRef.current = setTimeout(() => { setScanCooldown(false); setScanError(null); }, 2500);
            return;
        }

        setScanCooldown(true);
        setIsVerifying(true);
        setScanError(null);

        try {
            const response = await axios.post(
                route('dashboard.inventory-verifications.verify'),
                { imei },
            );

            const item = response.data?.data;
            if (!item) throw new Error('Item not found.');

            setVerifiedItem({ ...item, imei_1: imei });
            setData((prev) => ({ ...prev, inventory_id: item?.id, imei }));
            setStep(STEP.RECORDING);

        } catch (err) {
            const msg = err?.response?.data?.message || 'IMEI not found. This device may not be registered in inventory.';
            setScanError(msg);
            cooldownRef.current = setTimeout(() => { setScanCooldown(false); setScanError(null); }, 3000);
        } finally {
            setIsVerifying(false);
        }
    };

    const getAvailableDevices = async () => {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            setAvailableDevices({
                video: devices.filter((d) => d.kind === 'videoinput'),
                audio: devices.filter((d) => d.kind === 'audioinput'),
            });
        } catch { /* silent */ }
    };

    const startCameraWithFallback = async () => {
        setCameraError(null);
        if (stream) { stream.getTracks().forEach((t) => t.stop()); setStream(null); }

        const strategies = [
            { video: { facingMode: useFrontCamera ? 'user' : 'environment' }, audio: true },
            { video: { facingMode: useFrontCamera ? 'user' : 'environment' }, audio: false },
            { video: { facingMode: useFrontCamera ? 'user' : 'environment', width: { min: 320, ideal: 640, max: 1920 }, height: { min: 240, ideal: 480, max: 1080 } }, audio: true },
            { video: { facingMode: useFrontCamera ? 'user' : 'environment', width: { ideal: 640 }, height: { ideal: 480 } }, audio: true },
        ];

        const errMap = {
            NotFoundError: 'No camera device found.',
            DevicesNotFoundError: 'No camera device found.',
            NotAllowedError: 'Camera permission denied. Please allow access in browser settings.',
            PermissionDeniedError: 'Camera permission denied.',
            NotReadableError: 'Camera is in use by another application.',
            TrackStartError: 'Camera is in use by another application.',
        };

        for (let i = 0; i < strategies.length; i++) {
            try {
                const mediaStream = await navigator.mediaDevices.getUserMedia(strategies[i]);
                setStream(mediaStream);
                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream;
                    try { await videoRef.current.play(); } catch { /* autoplay policy */ }
                }

                const supportedTypes = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm', 'video/mp4'];
                let mimeType = 'video/webm';
                for (const type of supportedTypes) {
                    if (MediaRecorder.isTypeSupported(type)) { mimeType = type; break; }
                }

                const recorder = new MediaRecorder(mediaStream, { mimeType });
                const chunks = [];
                recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
                recorder.onstop = () => {
                    const blob = new Blob(chunks, { type: mimeType });
                    setRecordedVideoUrl(URL.createObjectURL(blob));
                    setIsRecording(false);
                    chunks.length = 0;
                };
                recorder.onerror = (e) => setCameraError('Recording error: ' + e.error.message);
                setMediaRecorder(recorder);
                return;
            } catch (err) {
                if (i === strategies.length - 1) {
                    setCameraError(errMap[err.name] || `Camera error: ${err.message}`);
                }
            }
        }
    };

    const handleStartRecording = () => {
        if (mediaRecorder?.state === 'inactive') {
            try { mediaRecorder.start(1000); setIsRecording(true); setRecordedVideoUrl(null); }
            catch (err) { Swal.fire({ icon: 'error', title: 'Error', text: err.message }); }
        }
    };

    const handleStopRecording = () => {
        if (mediaRecorder?.state === 'recording') mediaRecorder.stop();
    };

    const handleSaveVideo = async () => {
        if (!recordedVideoUrl) return;
        setRecordingSaving(true);
        try {
            const blob = await (await fetch(recordedVideoUrl)).blob();
            const file = new File([blob], `verification-${Date.now()}.webm`, { type: blob.type });
            setData('verification_video', file);
            setStep(STEP.DONE);
            stopCameraStream();
        } catch (err) {
            setCameraError(`Save error: ${err.message}`);
        } finally {
            setRecordingSaving(false);
        }
    };

    const handleRetake = () => {
        if (recordedVideoUrl) URL.revokeObjectURL(recordedVideoUrl);
        setRecordedVideoUrl(null);
        startCameraWithFallback();
    };

    const stopCameraStream = () => {
        stream?.getTracks().forEach((t) => t.stop());
        setStream(null);
        if (mediaRecorder?.state !== 'inactive') mediaRecorder?.stop();
        setMediaRecorder(null);
    };

    const handleFullReset = () => {
        clearTimeout(cooldownRef.current);
        stopCameraStream();
        if (recordedVideoUrl) URL.revokeObjectURL(recordedVideoUrl);
        setRecordedVideoUrl(null);
        setIsRecording(false);
        setCameraError(null);
        setScanError(null);
        setVerifiedItem(null);
        setScanCooldown(false);
        setIsVerifying(false);
        setStep(STEP.IDLE);
        reset();
    };

    useEffect(() => {
        if (step === STEP.RECORDING) {
            getAvailableDevices().then(() => {
                if (!recordedVideoUrl) startCameraWithFallback();
            });
        }
        return () => { if (step !== STEP.RECORDING) stopCameraStream(); };
    }, [step, useFrontCamera]);

    useEffect(() => () => clearTimeout(cooldownRef.current), []);

    return (
        <>
            <AuthenticatedLayout>
                <Head title="Inventory Verifications" />

                <BreadCrumb
                    header={'Create Inventory Verification'}
                    parent={'Inventory Verifications'}
                    parent_link={route('dashboard.inventory-verifications.index')}
                    child={'Create Verification'}
                />

                <Card
                    Content={
                        <>
                            <div className="flex flex-wrap justify-end my-3">
                                <LinkButton
                                    Text={'Back To Verifications'}
                                    URL={route('dashboard.inventory-verifications.index')}
                                    Icon={
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
                                        </svg>
                                    }
                                />
                            </div>

                            <Card
                                Content={
                                    <>
                                        {step === STEP.IDLE && (
                                            <div className="flex flex-col items-center justify-center text-center py-14">
                                                {/* Animated Icon */}
                                                <div className="relative mb-8">
                                                    <div className="flex items-center justify-center w-24 h-24 rounded-2xl bg-blue-50 dark:bg-blue-900/20">
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.3} stroke="currentColor" className="text-blue-600 size-12 dark:text-blue-400">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75ZM6.75 16.5h.75v.75h-.75v-.75ZM16.5 6.75h.75v.75h-.75v-.75ZM13.5 13.5h.75v.75h-.75v-.75ZM13.5 19.5h.75v.75h-.75v-.75ZM19.5 13.5h.75v.75h-.75v-.75ZM19.5 19.5h.75v.75h-.75v-.75ZM16.5 16.5h.75v.75h-.75v-.75Z" />
                                                        </svg>
                                                    </div>
                                                    <span className="absolute inset-0 rounded-2xl ring-2 ring-blue-300/40 dark:ring-blue-700/40 animate-ping" style={{ animationDuration: '2.5s' }} />
                                                </div>

                                                <h2 className="mb-2 text-2xl font-bold text-gray-800 dark:text-white">
                                                    Inventory Verification
                                                </h2>
                                                <p className="max-w-md mb-3 text-sm leading-relaxed text-gray-500 dark:text-white/50">
                                                    Scan the device barcode to match <span className="font-semibold text-blue-600 dark:text-blue-400">IMEI 1</span>, confirm the item is valid, then record a verification video as proof of condition.
                                                </p>

                                                {/* Process Preview */}
                                                <div className="flex items-center gap-6 mt-2 mb-10">
                                                    {[
                                                        { step: '1', label: 'Scan IMEI', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
                                                        { step: '2', label: 'Record Video', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
                                                        { step: '3', label: 'Submit', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
                                                    ].map((s, i) => (
                                                        <React.Fragment key={i}>
                                                            <div className="flex flex-col items-center gap-1.5">
                                                                <div className={`flex items-center justify-center w-8 h-8 rounded-lg text-xs font-bold ${s.color}`}>
                                                                    {s.step}
                                                                </div>
                                                                <span className="text-xs text-gray-500 dark:text-white/40">{s.label}</span>
                                                            </div>
                                                            {i < 2 && <div className="w-8 h-px mb-4 bg-gray-200 dark:bg-white/10" />}
                                                        </React.Fragment>
                                                    ))}
                                                </div>

                                                <PrimaryButton
                                                    Text={'Begin Verification'}
                                                    Type={'button'}
                                                    CustomClass={'w-[220px]'}
                                                    Action={() => setStep(STEP.SCANNING)}
                                                    Icon={
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
                                                        </svg>
                                                    }
                                                />
                                            </div>
                                        )}

                                        {step === STEP.DONE && (
                                            <form onSubmit={submit}>
                                                <StepIndicator step={step} />

                                                <div className="max-w-lg mx-auto space-y-4">
                                                    <VerifiedBadge item={verifiedItem} />

                                                    {/* Video Card */}
                                                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl bg-gray-50 dark:bg-white/5 dark:border-white/10">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg dark:bg-blue-900/30 shrink-0">
                                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="text-blue-600 size-5 dark:text-blue-400">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
                                                                </svg>
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-semibold text-gray-800 dark:text-white">Verification Video</p>
                                                                <p className="font-mono text-xs text-gray-400 dark:text-white/40">
                                                                    {data.verification_video?.name || 'recording saved'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setData('verification_video', '');
                                                                if (recordedVideoUrl) URL.revokeObjectURL(recordedVideoUrl);
                                                                setRecordedVideoUrl(null);
                                                                setStep(STEP.RECORDING);
                                                            }}
                                                            className="flex items-center gap-1 text-xs font-medium text-amber-600 hover:text-amber-700 dark:text-amber-400"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                                                            </svg>
                                                            Re-record
                                                        </button>
                                                    </div>

                                                    {/* IMEI Row */}
                                                    <div className="flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-xl dark:border-white/10">
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="text-gray-400 size-5 shrink-0">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 8.25h3m-3 3h3m-3 3h3" />
                                                        </svg>
                                                        <div>
                                                            <p className="text-xs tracking-wider text-gray-400 uppercase dark:text-white/40">IMEI 1</p>
                                                            <p className="font-mono text-sm font-semibold text-gray-800 dark:text-white">{data.imei}</p>
                                                        </div>
                                                    </div>

                                                    {/* Errors */}
                                                    {(errors.inventory_id || errors.verification_video || errors.imei) && (
                                                        <div className="p-3 space-y-1 border border-red-200 rounded-xl bg-red-50 dark:bg-red-900/20 dark:border-red-800">
                                                            {[errors.inventory_id, errors.verification_video, errors.imei].filter(Boolean).map((e, i) => (
                                                                <p key={i} className="text-sm text-red-700 dark:text-red-400">{e}</p>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {/* Actions */}
                                                    <div className="flex flex-wrap items-center gap-3 pt-2">
                                                        <PrimaryButton
                                                            Text={'Submit Verification'}
                                                            Type={'submit'}
                                                            CustomClass={'flex-1 min-w-[180px]'}
                                                            Disabled={processing}
                                                            Spinner={processing}
                                                            Icon={
                                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                                                </svg>
                                                            }
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={handleFullReset}
                                                            className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 dark:text-white/60 dark:border-white/10 dark:hover:bg-white/5"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                                                            </svg>
                                                            Start Over
                                                        </button>
                                                    </div>
                                                </div>
                                            </form>
                                        )}
                                    </>
                                }
                            />
                        </>
                    }
                />

                {step === STEP.SCANNING && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto sm:p-6">
                        <div className="fixed inset-0 backdrop-blur-[28px] bg-black/50" />

                        <div className="relative z-10 w-full max-w-md overflow-hidden bg-white shadow-2xl rounded-2xl dark:bg-deepcharcoal">
                            {/* Modal Header */}
                            <div className="flex items-center justify-between px-6 py-4 border-b dark:border-white/10">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                                    <h3 className="text-sm font-semibold text-gray-800 dark:text-white">IMEI Scanner Active</h3>
                                </div>
                                <button
                                    onClick={handleFullReset}
                                    className="flex items-center justify-center text-gray-400 rounded-lg w-7 h-7 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-white/10"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="p-6">
                                <StepIndicator step={step} />

                                <div className="mb-5 text-center">
                                    <h3 className="text-base font-semibold text-gray-800 dark:text-white">
                                        Scan Device Barcode
                                    </h3>
                                    <p className="mt-1 text-xs text-gray-500 dark:text-white/50">
                                        Point at the barcode on the device. <span className="font-semibold text-blue-600 dark:text-blue-400">IMEI 1</span> will be extracted automatically.
                                    </p>
                                </div>

                                {/* Scanner Viewport */}
                                <div className="relative overflow-hidden bg-gray-900 rounded-2xl" style={{ aspectRatio: '4/3' }}>
                                    {!scanCooldown && !isVerifying && (
                                        <BarcodeScannerComponent
                                            width={400}
                                            height={300}
                                            onUpdate={(err, result) => {
                                                if (result && !scanCooldown && !isVerifying) {
                                                    handleIMEIScan(result.text);
                                                }
                                            }}
                                        />
                                    )}

                                    {/* Scan Guide Corners */}
                                    {!isVerifying && !scanCooldown && (
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            <div className="relative w-48 h-28">
                                                <span className="absolute w-5 h-5 border-t-2 border-l-2 border-blue-400 -top-px -left-px rounded-tl-md" />
                                                <span className="absolute w-5 h-5 border-t-2 border-r-2 border-blue-400 -top-px -right-px rounded-tr-md" />
                                                <span className="absolute w-5 h-5 border-b-2 border-l-2 border-blue-400 -bottom-px -left-px rounded-bl-md" />
                                                <span className="absolute w-5 h-5 border-b-2 border-r-2 border-blue-400 -bottom-px -right-px rounded-br-md" />
                                                <div className="absolute h-px left-2 right-2 bg-blue-400/50 top-1/2 animate-pulse" />
                                            </div>
                                        </div>
                                    )}

                                    {/* Verifying Overlay */}
                                    {isVerifying && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gray-900">
                                            <svg className="w-10 h-10 text-blue-400 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                                                <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                            </svg>
                                            <div className="text-center">
                                                <p className="text-sm font-semibold text-white">Verifying IMEI...</p>
                                                <p className="text-xs text-white/50 mt-0.5">Checking inventory database</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Error Cooldown Overlay */}
                                    {scanCooldown && !isVerifying && scanError && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4 bg-gray-900/95">
                                            <div className="flex items-center justify-center w-12 h-12 border border-red-700 rounded-full bg-red-900/40">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="text-red-400 size-6">
                                                    <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-sm font-semibold text-red-300">Verification Failed</p>
                                                <p className="text-xs text-white/50 mt-1 max-w-[200px]">{scanError}</p>
                                            </div>
                                            <p className="text-xs text-white/30 animate-pulse">Scanner restarting...</p>
                                        </div>
                                    )}
                                </div>

                                {/* Info Hint */}
                                <div className="flex items-start gap-2 p-3 mt-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="text-blue-500 size-4 mt-0.5 shrink-0">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                                    </svg>
                                    <p className="text-xs leading-relaxed text-blue-700 dark:text-blue-300">
                                        The device barcode contains IMEI 1 and IMEI 2. Only <strong>IMEI 1 And IMEI 2</strong> (value) is used for matching.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {step === STEP.RECORDING && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto sm:p-6">
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />

                        <div className="relative z-10 w-full max-w-3xl overflow-hidden bg-white shadow-2xl rounded-2xl dark:bg-deepcharcoal">
                            {/* Modal Header */}
                            <div className="flex items-center justify-between px-6 py-4 border-b dark:border-white/10">
                                <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full transition-colors ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                                            {isRecording ? 'Recording in progress...' : 'Video Recorder'}
                                        </h3>
                                        {verifiedItem && (
                                            <p className="font-mono text-xs text-green-600 dark:text-green-400">{verifiedItem.imei_1}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {availableDevices.video.length > 0 && (
                                        <span className="hidden px-2 py-1 text-xs text-gray-400 bg-gray-100 rounded-md sm:block dark:text-white/30 dark:bg-white/5">
                                            {availableDevices.video.length} cam(s)
                                        </span>
                                    )}
                                    {!isRecording && (
                                        <button
                                            onClick={handleFullReset}
                                            className="flex items-center justify-center text-gray-400 rounded-lg w-7 h-7 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-white/10"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-4">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="p-6">
                                <StepIndicator step={step} />

                                {/* Verified Strip */}
                                {verifiedItem && (
                                    <div className="mb-4">
                                        <VerifiedBadge item={verifiedItem} />
                                    </div>
                                )}

                                {/* Camera Error */}
                                {cameraError && (
                                    <div className="flex items-start gap-3 p-3 mb-4 border border-red-200 rounded-xl bg-red-50 dark:bg-red-900/20 dark:border-red-800">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="text-red-500 size-5 shrink-0 mt-0.5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                                        </svg>
                                        <div>
                                            <p className="text-sm text-red-800 dark:text-red-400">{cameraError}</p>
                                            <button onClick={startCameraWithFallback} className="mt-1.5 text-xs font-medium text-red-600 underline dark:text-red-400">
                                                Retry Camera
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Video Viewport */}
                                <div className="relative mb-4 overflow-hidden bg-gray-950 rounded-xl" style={{ aspectRatio: '16/9' }}>
                                    {!recordedVideoUrl ? (
                                        <video ref={videoRef} autoPlay muted playsInline className="object-cover w-full h-full" />
                                    ) : (
                                        <video
                                            key={recordedVideoUrl}
                                            src={recordedVideoUrl}
                                            controls
                                            className="object-cover w-full h-full"
                                            onLoadedMetadata={(e) => { try { e.currentTarget.play(); } catch { } }}
                                        />
                                    )}

                                    {/* REC Badge */}
                                    {isRecording && (
                                        <div className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1.5 bg-red-600 rounded-full shadow-lg">
                                            <span className="w-2 h-2 bg-white rounded-full animate-ping" style={{ animationDuration: '1s' }} />
                                            <span className="text-xs font-bold tracking-widest text-white uppercase">REC</span>
                                        </div>
                                    )}

                                    {/* Flip Camera */}
                                    {!isRecording && !recordedVideoUrl && (
                                        <button
                                            type="button"
                                            onClick={() => setUseFrontCamera(!useFrontCamera)}
                                            className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 text-white bg-black/40 backdrop-blur-md border border-white/20 rounded-full hover:bg-black/60 transition-all"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 0 0-3.7-3.7 48.678 48.678 0 0 0-7.324 0 4.006 4.006 0 0 0-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 0 0 3.7 3.7 48.656 48.656 0 0 0 7.324 0 4.006 4.006 0 0 0 3.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3-3 3" />
                                            </svg>
                                            <span className="text-xs font-medium">{useFrontCamera ? 'Back Cam' : 'Front Cam'}</span>
                                        </button>
                                    )}

                                    {/* Connecting Overlay */}
                                    {!stream && !recordedVideoUrl && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gray-950">
                                            <svg className="w-8 h-8 text-white/50 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                                                <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                            </svg>
                                            <div className="text-center">
                                                <p className="text-sm font-medium text-white/80">Connecting to camera...</p>
                                                <p className="mt-1 text-xs text-white/30">Allow camera access if prompted</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Controls */}
                                <div className="flex flex-wrap justify-center gap-3">
                                    {!recordedVideoUrl ? (
                                        <>
                                            <button
                                                type="button"
                                                onClick={handleStartRecording}
                                                disabled={!stream || isRecording}
                                                className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-40 transition-all"
                                            >
                                                <span className={`w-2 h-2 rounded-full ${isRecording ? 'bg-white animate-pulse' : 'bg-white/70'}`} />
                                                {isRecording ? 'Recording...' : 'Start Recording'}
                                            </button>

                                            <button
                                                type="button"
                                                onClick={handleStopRecording}
                                                disabled={!isRecording}
                                                className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40 transition-all"
                                            >
                                                <span className="w-2 h-2 bg-white rounded-sm" />
                                                Stop Recording
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                type="button"
                                                onClick={handleSaveVideo}
                                                disabled={recordingSaving}
                                                className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all"
                                            >
                                                {recordingSaving ? (
                                                    <>
                                                        <svg className="size-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                        </svg>
                                                        Saving...
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-4">
                                                            <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z" />
                                                            <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
                                                        </svg>
                                                        Save & Continue
                                                    </>
                                                )}
                                            </button>

                                            <button
                                                type="button"
                                                onClick={handleRetake}
                                                className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white rounded-lg bg-amber-500 hover:bg-amber-600 transition-all"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                                                </svg>
                                                Retake
                                            </button>
                                        </>
                                    )}

                                    {!isRecording && (
                                        <button
                                            type="button"
                                            onClick={handleFullReset}
                                            className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-gray-500 rounded-lg hover:bg-gray-600 transition-all"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                            </svg>
                                            Cancel
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
