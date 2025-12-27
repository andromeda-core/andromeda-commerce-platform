import Input from '@/Components/Input';
import PrimaryButton from '@/Components/PrimaryButton';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

export default function ForgotPassword() {
    // Forgot Password Form Data
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
    });

    // Verification Sent And Timer Managing States
    const [verificationSent, setVerificationSent] = useState(false);
    const [timer, setTimer] = useState(60);

    // Refferences
    const timerRef = useRef(null);
    const email_input = useRef(null);

    // Focusing Email Input Logic
    useEffect(() => {
        email_input.current.focus();
    }, []);

    // Forgot Password Form Request
    const submit = (e) => {
        e.preventDefault();

        if (data.email === '') {
            email_input.current.required = true;
            email_input.current.reportValidity();
            return;
        }

        post(route('password.email'), {
            onSuccess: () => {
                reset('email');
                setVerificationSent(true);
            },
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
            setVerificationSent(false);
            clearInterval(timerRef.current);
            setTimer(60);
        }
    }, [timer]);

    return (
        <GuestLayout>
            <Head title="Forgot Password" />

            <div className="flex flex-col flex-1 w-full md:my-5 lg:w-1/2">
                <div className="w-full max-w-md pt-10 mx-auto">
                    <Link
                        href={route('login')}
                        className="inline-flex items-center text-sm text-black transition-colors hover:text-gray-700 dark:text-main-text-dark dark:hover:text-sub-text-dark "
                    >
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
                        Back to Login
                    </Link>
                </div>

                <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
                    <div>
                        <div className="mb-5 sm:mb-8">
                            <h1 className="mb-2 text-4xl font-semibold text-black sm:text-title-md dark:text-main-text-dark">
                                Forgot Password
                            </h1>
                            <div className="mb-4 text-sm text-black dark:text-sub-text-dark">
                                Forgot your password? No problem. Just let us know your email
                                address and we will email you a password reset link that will allow
                                you to choose a new one.
                            </div>
                        </div>
                        <div>
                            <form onSubmit={submit}>
                                <div className="space-y-0">
                                    <Input
                                        InputName={'Email'}
                                        Error={errors.email}
                                        Value={data.email}
                                        Action={(e) => setData('email', e.target.value)}
                                        Placeholder={'info@gmail.com'}
                                        Id={'email'}
                                        Name={'email'}
                                        Type={'email'}
                                        InputRef={email_input}
                                    />

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

                                                <p className="mt-3 text-black dark:text-sub-text-dark">
                                                    Retry Will Be Available after{' '}
                                                    <span className="text-green-800">{timer}</span>{' '}
                                                    seconds
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
                                                        className="size-6"
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
                                                Disabled={processing || data.email === ''}
                                                Spinner={processing}
                                            />
                                        )}
                                    </div>
                                </div>
                            </form>

                            <div className="mt-5">
                                <p className="text-sm font-normal text-center text-black dark:text-sub-text-dark sm:text-start">
                                    Remembered Your Password?{' '}
                                    <Link
                                        href={route('login')}
                                        className="text-sm text-black dark:text-main-text-dark dark:hover:text-sub-text-dark hover:text-black/80"
                                    >
                                        {' '}
                                        {'  '}
                                        Back To Login
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
