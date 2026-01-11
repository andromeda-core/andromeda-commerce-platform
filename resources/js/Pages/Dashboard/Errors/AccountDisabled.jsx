import PrimaryButton from '@/Components/PrimaryButton';
import { useTranslation } from '@/Hooks/useTranslation';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import React from 'react';

export default function AccountDisabled() {
    const { post, processing } = useForm({});

    const { __ } = useTranslation();

    return (
        <>

            <GuestLayout>
                <Head title="Account Disabled" />

                <div className="flex flex-col flex-1 w-full md:my-5 lg:w-1/2">
                    <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">

                        {/* Warning Icon */}
                        <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 transition-transform duration-300 bg-red-100 rounded-full dark:bg-red-900/20 hover:scale-105">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="text-red-600 size-10 dark:text-red-400"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                                />
                            </svg>
                        </div>

                        {/* Heading Section */}
                        <div className="mb-1 text-center sm:mb-8">
                            <h1 className="mb-2 text-4xl font-semibold text-main-text-light sm:text-title-md dark:text-main-text-dark">
                                {__('Account Disabled')}
                            </h1>
                            <p className="text-sm leading-relaxed text-sub-text-light dark:text-sub-text-dark">
                                {__('Your account has been')} <span className="font-semibold text-sub-text-light dark:text-sub-text-dark">{__('disabled by the administrator')}</span>. {__('Please contact support if you believe this is a mistake.')}
                            </p>
                        </div>

                        {/* Logout Button */}
                        <PrimaryButton
                            Text={__('Logout')}
                            Type="button"
                            Spinner={processing}
                            Disabled={processing}
                            Action={() => post(route('logout'))}
                            Id="logout"
                        />




                    </div>
                </div>
            </GuestLayout>
        </>
    );
}
