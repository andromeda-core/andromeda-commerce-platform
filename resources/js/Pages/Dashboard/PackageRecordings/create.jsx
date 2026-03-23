import Card from '@/Components/Card';
import LinkButton from '@/Components/LinkButton';
import PrimaryButton from '@/Components/PrimaryButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BreadCrumb from '@/Components/BreadCrumb';
import { Head, useForm } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import SelectInput from '@/Components/SelectInput';
import PackageVerificationRecorder from '@/Components/PackageVerificationRecorder';

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

    const [openRecorder, setOpenRecorder] = useState(false);
    const [verificationStatus, setVerificationStatus] = useState(null);
    const [verificationMessage, setVerificationMessage] = useState('');

    const selectedOrderNo = orders.find(
        (o) => String(o.id) === String(data.order_id)
    )?.order_no || '';

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
                                            {verificationStatus === 'scan_error' && (
                                                <div className="flex items-center gap-3 p-4 mt-4 border border-orange-200 rounded-xl bg-orange-50 dark:bg-orange-900/20 dark:border-orange-800">
                                                    <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full dark:bg-orange-900/40">
                                                        <svg className="w-4 h-4 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                        </svg>
                                                    </div>
                                                    <p className="text-sm font-medium text-orange-800 dark:text-orange-300">{verificationMessage}</p>
                                                </div>
                                            )}

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

                                                <PrimaryButton
                                                    Text={'Begin Verification'}
                                                    Type={'button'}
                                                    CustomClass={'w-[250px]'}
                                                    Disabled={data.order_id === ''}
                                                    Action={() => setOpenRecorder(true)}
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

                <PackageVerificationRecorder
                    isOpen={openRecorder}
                    onClose={() => setOpenRecorder(false)}
                    onSave={(file) => {
                        setData('package_video', file);
                        setOpenRecorder(false);
                    }}
                    orderNo={selectedOrderNo}
                    onVerified={(status, message) => {
                        setVerificationStatus(status);
                        setVerificationMessage(message);
                    }}
                />

            </AuthenticatedLayout>
        </>
    );
}
