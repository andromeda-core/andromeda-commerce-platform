import Card from '@/Components/Card';
import LinkButton from '@/Components/LinkButton';
import PrimaryButton from '@/Components/PrimaryButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BreadCrumb from '@/Components/BreadCrumb';
import { Head } from '@inertiajs/react';
import React, { useState } from 'react';
import axios from 'axios';
import PackageVerificationRecorder from '@/Components/PackageVerificationRecorder';

export default function create() {
    const [openRecorder, setOpenRecorder] = useState(false);
    const [verifiedItem, setVerifiedItem] = useState(null);
    const [verificationStatus, setVerificationStatus] = useState(null);
    const [verificationMessage, setVerificationMessage] = useState('');
    const [inventoryId, setInventoryId] = useState(null);
    const [scannedCode, setScannedCode] = useState('');

    // ── Custom verify function — inventory check ──
    const handleRecordingVerify = async (scannedText) => {
        const code = scannedText?.trim();
        if (!code) return { success: false, message: 'Could not read barcode. Try again.' };

        try {
            const response = await axios.post(route('dashboard.inventory-verifications.verify'), {
                code,
            });

            const item = response.data?.data;
            if (!item) return { success: false, message: 'Item not found in inventory.' };

            setVerifiedItem({ ...item, code });
            setInventoryId(item.id);
            setScannedCode(code);

            return { success: true, message: `Code verified: ${code}` };
        } catch (err) {
            const msg =
                err?.response?.data?.message ||
                'Code not found. This device may not be registered in inventory.';
            return { success: false, message: msg };
        }
    };

    const handleSaved = () => {
        // Reset everything after successful upload
        setOpenRecorder(false);
        setVerifiedItem(null);
        setInventoryId(null);
        setScannedCode('');
        setVerificationStatus('success');
        setVerificationMessage('Inventory verification submitted successfully.');
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
                            <div className="my-3 flex flex-wrap justify-end">
                                <LinkButton
                                    Text={'Back To Verifications'}
                                    URL={route('dashboard.inventory-verifications.index')}
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

                            <Card
                                Content={
                                    <div className="flex flex-col items-center justify-center py-14 text-center">
                                        {/* ── Success banner ── */}
                                        {verificationStatus === 'success' && (
                                            <div className="mb-6 flex w-full max-w-md items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
                                                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40">
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        viewBox="0 0 20 20"
                                                        fill="currentColor"
                                                        className="size-4 text-green-600 dark:text-green-400"
                                                    >
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                </div>
                                                <p className="text-sm font-medium text-green-800 dark:text-green-300">
                                                    {verificationMessage}
                                                </p>
                                            </div>
                                        )}

                                        {/* ── Idle state ── */}
                                        <div className="relative mb-8">
                                            <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-900/20">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    strokeWidth={1.3}
                                                    stroke="currentColor"
                                                    className="size-12 text-blue-600 dark:text-blue-400"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z"
                                                    />
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M6.75 6.75h.75v.75h-.75v-.75ZM6.75 16.5h.75v.75h-.75v-.75ZM16.5 6.75h.75v.75h-.75v-.75ZM13.5 13.5h.75v.75h-.75v-.75ZM13.5 19.5h.75v.75h-.75v-.75ZM19.5 13.5h.75v.75h-.75v-.75ZM19.5 19.5h.75v.75h-.75v-.75ZM16.5 16.5h.75v.75h-.75v-.75Z"
                                                    />
                                                </svg>
                                            </div>
                                            <span
                                                className="absolute inset-0 animate-ping rounded-2xl ring-2 ring-blue-300/40 dark:ring-blue-700/40"
                                                style={{ animationDuration: '2.5s' }}
                                            />
                                        </div>

                                        <h2 className="mb-2 text-2xl font-bold text-gray-800 dark:text-white">
                                            Inventory Verification
                                        </h2>
                                        <p className="mb-3 max-w-md text-sm leading-relaxed text-gray-500 dark:text-white/50">
                                            Scan the device barcode to verify it, then upload your
                                            screen recording and scene video as evidence.
                                        </p>

                                        <div className="mb-10 mt-2 flex items-center gap-4">
                                            {[
                                                {
                                                    step: '1',
                                                    label: 'Scan Barcode',
                                                    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
                                                },
                                                {
                                                    step: '2',
                                                    label: 'Upload Videos',
                                                    color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
                                                },
                                                {
                                                    step: '3',
                                                    label: 'Done',
                                                    color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
                                                },
                                            ].map((s, i) => (
                                                <React.Fragment key={i}>
                                                    <div className="flex flex-col items-center gap-1.5">
                                                        <div
                                                            className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold ${s.color}`}
                                                        >
                                                            {s.step}
                                                        </div>
                                                        <span className="text-xs text-gray-500 dark:text-white/40">
                                                            {s.label}
                                                        </span>
                                                    </div>
                                                    {i < 2 && (
                                                        <div className="mb-4 h-px w-8 bg-gray-200 dark:bg-white/10" />
                                                    )}
                                                </React.Fragment>
                                            ))}
                                        </div>

                                        <PrimaryButton
                                            Text={'Begin Verification'}
                                            Type={'button'}
                                            CustomClass={'w-[220px]'}
                                            Action={() => setOpenRecorder(true)}
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
                                                        d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z"
                                                    />
                                                </svg>
                                            }
                                        />
                                    </div>
                                }
                            />
                        </>
                    }
                />

                <PackageVerificationRecorder
                    isOpen={openRecorder}
                    orderNo={null}
                    inventoryId={inventoryId}
                    uploadRoute={route('dashboard.inventory-verifications.store')}
                    onVerify={handleRecordingVerify}
                    onSave={handleSaved}
                    onClose={() => setOpenRecorder(false)}
                    scannedCode={scannedCode}
                    onVerified={(status, message) => {
                        setVerificationStatus(status);
                        setVerificationMessage(message);
                    }}
                    heading={'Inventory Verification'}
                />
            </AuthenticatedLayout>
        </>
    );
}
