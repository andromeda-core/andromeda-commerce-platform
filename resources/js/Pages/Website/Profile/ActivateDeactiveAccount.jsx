import Spinner from '@/Components/Spinner';
import { useTranslation } from '@/Hooks/useTranslation';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, router } from '@inertiajs/react';
import React, { useState } from 'react';
const ActivateDeactiveAccount = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isError, setIsError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const { __ } = useTranslation();
    const handleActiveDeactivatedAccount = async () => {
        setIsLoading(true);

        try {
            const response = await axios.put(
                route('website.profile.activate-deactive-account.active')
            );

            if (response.data.status === false) {
                setIsError(true);
                setErrorMessage(response.data.message);
                setIsLoading(false);
                return;
            }

            setIsLoading(false);
            setIsSuccess(true);
            setIsError(false);
            setErrorMessage('');

        } catch (error) {
            setIsLoading(false);
            setIsError(true);

            setErrorMessage(
                error.response?.data?.message ||
                __('Something went wrong. Please try again.')
            );
        }

    };

    return (
        <GuestLayout>

            <Head title={__('Activate Account', true)} />

            <div className="flex items-center justify-center min-h-screen p-4 ">
                <div className="w-full max-w-md">
                    {!isSuccess ? (
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
                                {__('Reactivate Your Account')}
                            </h1>

                            <p className="mb-8 leading-relaxed text-center text-sub-text-light dark:text-sub-text-dark">
                                {__('Your account has been marked as Deactivated as Per Your Request. This does not affect your data or account security. To continue using our services, please reactivate your account by clicking the button below.')}
                            </p>

                            {/* Action Button */}
                            <button
                                onClick={handleActiveDeactivatedAccount}
                                disabled={isLoading}
                                className={`text-md flex h-[50px] w-full items-center justify-center gap-2 rounded-md bg-main-text-light font-semibold text-main-text-dark transition-all hover:bg-main-text-light/80 dark:bg-main-text-dark dark:text-main-text-light dark:hover:bg-main-text-dark/80`}
                            >
                                {isLoading ? (
                                    <Spinner />
                                ) : (
                                    __('Activate Account')
                                )}
                            </button>

                            {/* Footer Note */}
                            <p className="mt-6 text-xs text-center text-sub-text-light dark:text-sub-text-dark">
                                {__('By reactivating, you agree to our terms of service and privacy policy.')}
                            </p>


                            {isError && (
                                <p className="mt-3 text-xs text-center text-red-500 break-words dark:text-red-600">
                                    {errorMessage || ''}
                                </p>
                            )}

                        </div>
                    ) : (
                        <div className="p-8 border rounded-md border-surface-1-light dark:border-surface-1-dark bg-backgroundLight dark:bg-backgroundDark">

                            {/* Success Icon */}
                            <div className="flex justify-center mb-6">
                                <div className="p-4 bg-green-100 rounded-full">
                                    <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>

                            {/* Success Title */}
                            <h1 className="mb-3 text-2xl font-semibold text-center text-main-text-light dark:text-main-text-dark">
                                {__('Account Reactivated!')}
                            </h1>

                            {/* Success Message */}
                            <p className="mb-8 leading-relaxed text-center text-sub-text-light dark:text-sub-text-dark">
                                {__('Your account has been successfully reactivated. You can now access all features and services.')}
                            </p>

                            {/* Continue Button */}
                            <button
                                onClick={() => {
                                    setIsLoading(true);
                                    router.visit(route('home'), {
                                        onFinish: () => setIsLoading(false),
                                    });
                                }}
                                className={`text-md flex h-[50px] w-full items-center justify-center gap-2 rounded-md bg-main-text-light font-semibold text-main-text-dark transition-all hover:bg-main-text-light/80 dark:bg-main-text-dark dark:text-main-text-light dark:hover:bg-main-text-dark/80`}

                            >

                                {isLoading ? (
                                    <Spinner />
                                ) : (
                                    __('Visit Site')
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </GuestLayout>
    );
};

export default ActivateDeactiveAccount;
