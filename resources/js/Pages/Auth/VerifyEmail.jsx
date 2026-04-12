import PrimaryButton from '@/Components/PrimaryButton';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

export default function VerifyEmail() {
    // Verify Email Form Data
    const { post, processing, errors } = useForm({});

    // Logout Form Data
    const { post: logoutPost, processing: LogoutProcessing } = useForm({});

    // Verification Sent And Timer Managing States
    const [verificationSent, setVerificationSent] = useState(false);
    const [timer, setTimer] = useState(60);

    // Refference
    const timerRef = useRef(null);

    // Verify Email Form Request
    const submit = (e) => {
        e.preventDefault();
        post(route('verification.send'), {
            onSuccess: () => setVerificationSent(true),
        });
    };

    // Start Timer After Mail is Sent
    useEffect(() => {
        if (verificationSent) {
            timerRef.current = setInterval(() => {
                setTimer((t) => t - 1);
            }, 1000);
        }
    }, [verificationSent]);

    // Reset Timer After Timer Completes The Given Time And Enables The Again Mail Sent Button

    useEffect(() => {
        if (timer === 0) {
            clearInterval(timerRef.current);
            setVerificationSent(false);
            setTimer(60);
        }
    }, [timer]);

    // Logout Form Request
    const logout = () => {
        logoutPost(route('logout'));
    };

    return (
        <GuestLayout>
            <Head title="Email Verification" />

            <div className="flex flex-col flex-1 w-full md:my-5 lg:w-1/2">
                <div className="w-full max-w-md pt-10 mx-auto">
                    <PrimaryButton
                        ClassName="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-white dark:hover:text-gray-300"
                        Disabled={LogoutProcessing}
                        Type={'button'}
                        Text={
                            <>
                                <svg
                                    className="stroke-current"
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="20"
                                    height="20"
                                    viewBox="0 0 20 20"
                                    fill="none"
                                >
                                    <path
                                        d="M12.7083 5L7.5 10.2083L12.7083 15.4167"
                                        stroke=""
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                                {__('Logout')}
                            </>
                        }
                        Spinner={LogoutProcessing}
                        Action={logout}
                    />
                </div>
                <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
                    <div>
                        <div className="mb-5 sm:mb-8">
                            <h1 className="mb-2 text-4xl font-bold text-main-text-light sm:text-title-md dark:text-main-text-dark">
                                Verify Email
                            </h1>
                            <p className="text-sm text-main-text-light dark:text-sub-text-dark">
                                Thanks for signing up! Before getting started, could you verify your
                                email address by clicking on the link we just emailed to you? If you
                                didn't receive the email, we will gladly send you another.
                            </p>
                        </div>
                        <div>
                            {verificationSent ? (
                                <>
                                    <PrimaryButton
                                        Text={'Email Verification Link'}
                                        Icon={
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth="1.5"
                                                stroke="currentColor"
                                                className="mx-1 size-6"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                                                />
                                            </svg>
                                        }
                                        Type={'button'}
                                        Action={submit}
                                        Disabled={verificationSent}
                                    />

                                    <p className="mt-3 text-main-text-light dark:text-sub-text-dark">
                                        Retry Will Be Available after{' '}
                                        <span className="text-green-800">{timer}</span> seconds
                                    </p>
                                </>
                            ) : (
                                <PrimaryButton
                                    Text={'Email Verification Link'}
                                    Icon={
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth="1.5"
                                            stroke="currentColor"
                                            className="mx-1 size-6"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                                            />
                                        </svg>
                                    }
                                    Type={'button'}
                                    Action={submit}
                                    Disabled={processing}
                                    Spinner={processing}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
