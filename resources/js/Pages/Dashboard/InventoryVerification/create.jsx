import Card from '@/Components/Card';
import LinkButton from '@/Components/LinkButton';
import PrimaryButton from '@/Components/PrimaryButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BreadCrumb from '@/Components/BreadCrumb';
import { Head, useForm } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import PackageVerificationRecorder from '@/Components/PackageVerificationRecorder';

const STEP = {
    IDLE: 'idle',
    RECORDING: 'recording',
    PREVIEW: 'preview',
    DONE: 'done',
};

function StepIndicator({ step }) {
    const steps = [
        { key: STEP.RECORDING, label: 'Scan & Record' },
        { key: STEP.PREVIEW, label: 'Review' },
        { key: STEP.DONE, label: 'Submit' },
    ];
    const order = [STEP.RECORDING, STEP.PREVIEW, STEP.DONE];
    const currentIndex = order.indexOf(step);

    return (
        <div className="flex items-center justify-center mb-6">
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
                <p className="text-xs font-semibold tracking-wide text-green-700 uppercase dark:text-green-400">Device Verified</p>
                <p className="text-sm font-medium text-green-800 truncate dark:text-green-300">{item.name}</p>
                {item.code && (
                    <p className="font-mono text-xs text-green-600 dark:text-green-500">{item.code}</p>
                )}
            </div>
        </div>
    );
}

export default function create() {

    const { data, setData, post, processing, errors, reset } = useForm({
        inventory_id: '',
        scanned_code: '',
        verification_video: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('dashboard.inventory-verifications.store'), {
            forceFormData: true,
            onSuccess: (page) => {
                if (page.props.flash.success) handleFullReset();
            },
        });
    };


    const [step, setStep] = useState(STEP.IDLE);
    const [verifiedItem, setVerifiedItem] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    useEffect(() => {
        return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); };
    }, [previewUrl]);

    const handleRecordingVerify = async (scannedText) => {
        const code = scannedText?.trim();
        if (!code) return { success: false, message: 'Could not read barcode. Try again.' };

        try {
            const response = await axios.post(
                route('dashboard.inventory-verifications.verify'),
                { code },
            );

            const item = response.data?.data;
            if (!item) return { success: false, message: 'Item not found in inventory.' };

            setVerifiedItem({ ...item, code });
            setData((prev) => ({ ...prev, inventory_id: item.id, scanned_code: code }));

            return { success: true, message: `Code verified: ${code}` };

        } catch (err) {
            const msg = err?.response?.data?.message
                || 'Code not found. This device may not be registered in inventory.';
            return { success: false, message: msg };
        }
    };

    const handleRecorderSave = (file) => {
        // Revoke previous preview URL if any
        if (previewUrl) URL.revokeObjectURL(previewUrl);

        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        setData('verification_video', file);
        setStep(STEP.PREVIEW);
    };
    const handleReRecord = () => {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
        setData('verification_video', '');
        setVerifiedItem(null);
        setStep(STEP.RECORDING);
    };

    const handlePreviewConfirm = () => {
        setStep(STEP.DONE);
    };

    const handleFullReset = () => {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
        setVerifiedItem(null);
        setStep(STEP.IDLE);
        reset();
    };

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
                                        {/* ── STEP: IDLE ── */}
                                        {step === STEP.IDLE && (
                                            <div className="flex flex-col items-center justify-center text-center py-14">
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
                                                    Start recording, then use <span className="font-semibold text-violet-600 dark:text-violet-400">Snapshot &amp; Scan</span> to verify the device barcode. Review before submitting.
                                                </p>

                                                <div className="flex items-center gap-4 mt-2 mb-10">
                                                    {[
                                                        { step: '1', label: 'Record & Scan', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
                                                        { step: '2', label: 'Review', color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400' },
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
                                                    Action={() => setStep(STEP.RECORDING)}
                                                    Icon={
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
                                                        </svg>
                                                    }
                                                />
                                            </div>
                                        )}

                                        {/* ── STEP: PREVIEW ──────────────────────────────────────────
                                            Shows after recorder closes successfully.
                                            User sees: verified device info + actual video playback
                                            Actions: Confirm (→ DONE) | Re-record (→ RECORDING)
                                        ── */}
                                        {step === STEP.PREVIEW && (
                                            <div className="max-w-2xl mx-auto">
                                                <StepIndicator step={step} />

                                                <div className="space-y-4">
                                                    {/* Verified Device Badge */}
                                                    <VerifiedBadge item={verifiedItem} />

                                                    {/* Code Row */}
                                                    <div className="flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-xl dark:border-white/10">
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="text-gray-400 size-5 shrink-0">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 8.25h3m-3 3h3m-3 3h3" />
                                                        </svg>
                                                        <div>
                                                            <p className="text-xs tracking-wider text-gray-400 uppercase dark:text-white/40">Verified Code</p>
                                                            <p className="font-mono text-sm font-semibold text-gray-800 dark:text-white">{data.scanned_code}</p>
                                                        </div>
                                                    </div>

                                                    {/* Video Playback */}
                                                    {previewUrl && (
                                                        <div>
                                                            <p className="mb-2 text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-white/40">
                                                                Recorded Video
                                                            </p>
                                                            <div className="overflow-hidden rounded-xl bg-gray-950" style={{ aspectRatio: '16/9' }}>
                                                                <video
                                                                    key={previewUrl}
                                                                    src={previewUrl}
                                                                    controls
                                                                    autoPlay
                                                                    className="object-cover w-full h-full"
                                                                />
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Actions */}
                                                    <div className="flex flex-wrap items-center gap-3 pt-2">
                                                        {/* Confirm → STEP.DONE */}
                                                        <PrimaryButton
                                                            Text={'Confirm & Continue'}
                                                            Type={'button'}
                                                            CustomClass={'flex-1 min-w-[180px]'}
                                                            Action={handlePreviewConfirm}
                                                            Icon={
                                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                                                </svg>
                                                            }
                                                        />

                                                        {/* Re-record → STEP.RECORDING */}
                                                        <button
                                                            type="button"
                                                            onClick={handleReRecord}
                                                            className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white rounded-lg bg-amber-500 hover:bg-amber-600 transition-all"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                                                            </svg>
                                                            Re-record
                                                        </button>

                                                        {/* Cancel → IDLE */}
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
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* ── STEP: DONE ── */}
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
                                                            onClick={() => setStep(STEP.PREVIEW)}
                                                            className="flex items-center gap-1 text-xs font-medium text-amber-600 hover:text-amber-700 dark:text-amber-400"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                                                            </svg>
                                                            Review
                                                        </button>
                                                    </div>

                                                    {/* Code Row */}
                                                    <div className="flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-xl dark:border-white/10">
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="text-gray-400 size-5 shrink-0">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 8.25h3m-3 3h3m-3 3h3" />
                                                        </svg>
                                                        <div>
                                                            <p className="text-xs tracking-wider text-gray-400 uppercase dark:text-white/40">Verified Code</p>
                                                            <p className="font-mono text-sm font-semibold text-gray-800 dark:text-white">{data.scanned_code}</p>
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
                <PackageVerificationRecorder
                    isOpen={step === STEP.RECORDING}
                    orderNo=""
                    onVerify={handleRecordingVerify}
                    onSave={handleRecorderSave}
                    onClose={handleFullReset}
                    onVerified={() => { }}
                />

            </AuthenticatedLayout>
        </>
    );
}
