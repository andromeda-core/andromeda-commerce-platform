import PrimaryButton from '@/Components/PrimaryButton';
import WebInput from '@/Components/WebInput';
import { useTranslation } from '@/Hooks/useTranslation';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

export default function ForgotPassword() {
    // Forgot Password Form Data
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
    });


    // Translation Hook
    const { __ } = useTranslation();

    // Verification Sent And Timer Managing States
    const [verificationSent, setVerificationSent] = useState(false);
    const [timer, setTimer] = useState(90);

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
            <Head title={__("Forgot Password", true)} />

            <div className="flex flex-col flex-1 w-full md:my-5 lg:w-1/2">


                <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
                    <div>
                        <div className="mb-5 sm:mb-8">
                            <h1 className="mb-2 text-[21px] font-semibold text-main-text-light sm:text-title-md dark:text-main-text-dark">
                                {__('Forgot Password')}
                            </h1>
                            <div className="mb-4 text-[12px] font-normal text-sub-text-light dark:text-sub-text-dark">
                                {__('Forgot your password? No problem. Just let us know your email address and we will email you a password reset link that will allow you to choose a new one.')}
                            </div>
                        </div>
                        <div>
                            <form onSubmit={submit}>
                                <div className="space-y-0">
                                    <WebInput
                                        InputName={__('Email')}
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
                                                    Text={__('Email Verification Link')}

                                                    Type={'button'}
                                                    Action={submit}
                                                    Disabled={verificationSent}
                                                />

                                                <p className="mt-3 text-center text-main-text-light dark:text-sub-text-dark sm:text-start">
                                                    {__('Retry Will Be Available after')}{' '}
                                                    <span className="text-green-800">{timer}</span>{' '}
                                                    {__('Seconds')}
                                                </p>
                                            </>
                                        ) : (
                                            <PrimaryButton
                                                Text={__('Email Verification Link')}

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
                                <p className="text-sm font-normal text-center text-main-text-light dark:text-sub-text-dark sm:text-start">
                                    {__('Remembered Your Password')}?{' '}
                                    <Link
                                        href={route('login')}
                                        className="text-sm font-bold text-main-text-light dark:text-main-text-dark dark:hover:text-sub-text-dark hover:text-main-text-light/80"
                                    >
                                        {' '}
                                        {'  '}
                                        {__('Login')}
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
