import Spinner from '@/Components/Spinner';
import { useTranslation } from '@/Hooks/useTranslation';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, router } from '@inertiajs/react';
import React, { useState } from 'react';
const SuspendAccount = () => {
    const [isLoading, setIsLoading] = useState(false);
    const { __ } = useTranslation();


    const handleLogout = () => {
        setIsLoading(true);
        router.post(route('logout'), {
            onFinish: () => {
                setIsLoading(false);
            },
        });
    }
    return (
        <GuestLayout>

            <Head title={__('Account Suspended', true)} />

            <div className="flex items-center justify-center min-h-screen p-4 ">
                <div className="w-full max-w-md">
                    <div className="p-8 border rounded-md border-surface-1-light dark:border-surface-1-dark bg-backgroundLight dark:bg-backgroundDark">
                        {/* Icon */}
                        <div className="flex justify-center mb-6">
                            <div className="p-4 rounded-full bg-amber-100">
                                <svg className="w-12 h-12 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>

                        {/* Title */}
                        <h1 className="mb-3 text-[24px] font-semibold text-center text-main-text-light dark:text-main-text-dark">
                            {__('Account Suspended')}
                        </h1>

                        {/* Description */}
                        <p className="mb-8 leading-relaxed text-center text-sub-text-light dark:text-sub-text-dark">

                            {__(
                                'Your account has been suspended. As a result, access to your account and its features is currently restricted. If you believe this action was taken in error or need further information, please contact our support team.'
                            )}

                        </p>

                        {/* Action Button */}
                        <button
                            disabled={isLoading}
                            onClick={handleLogout}
                            className={`text-md flex h-[50px] w-full items-center justify-center gap-2 rounded-md bg-main-text-light font-semibold text-main-text-dark transition-all hover:bg-main-text-light/80 dark:bg-main-text-dark dark:text-main-text-light dark:hover:bg-main-text-dark/80`}
                        >
                            {isLoading ? (
                                <Spinner />
                            ) : (
                                __('Logout')
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
};

export default SuspendAccount;
