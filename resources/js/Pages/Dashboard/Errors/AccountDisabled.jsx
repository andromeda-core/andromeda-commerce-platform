import PrimaryButton from '@/Components/PrimaryButton';
import { Head, useForm } from '@inertiajs/react';
import React from 'react';

export default function AccountDisabled() {
    const { post, processing } = useForm({});

    return (
        <>
            <Head title="Account Disabled" />

            <div className="flex items-center justify-center min-h-screen p-4 bg-gray-100">
                <div className="w-full max-w-md p-8 text-center bg-white shadow-lg rounded-2xl">
                    <div className="flex items-center justify-center w-20 h-20 mx-auto bg-red-100 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="text-red-600 size-10">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                        </svg>

                    </div>

                    <h1 className="mt-6 text-2xl font-bold text-gray-800">Account Disabled</h1>

                    <p className="mt-3 leading-relaxed text-gray-600">
                        Your account has been{' '}
                        <span className="font-semibold">disabled by the administrator</span>. Please
                        contact support if you believe this is a mistake.
                    </p>

                    <div className="mt-4">
                        <PrimaryButton
                            Text={'Logout'}
                            Icon={
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                                </svg>

                            }
                            Type={'button'}
                            Spinner={processing}
                            Disabled={processing}
                            Action={() => post(route('logout'))}
                            Id={'logout'}
                        />
                    </div>
                </div>
            </div>
        </>
    );
}
