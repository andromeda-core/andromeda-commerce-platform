import Input from '@/Components/Input';
import PrimaryButton from '@/Components/PrimaryButton';
import WebInput from '@/Components/WebInput';
import { useTranslation } from '@/Hooks/useTranslation';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function Login({ canResetPassword, redirect }) {
    // Toggle Show Password State
    const [ShowPasswordToggle, setShowPasswordToggle] = useState(false);

    // Login User Form Data
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
        redirect: new URLSearchParams(window.location.search).get('redirect') || redirect || '',
    });

    // Translation Hook
    const { __ } = useTranslation();

    // Login User Form Request
    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => {
                reset('password');
            },
        });
    };

    return (
        <GuestLayout>
            <Head title={__("Login", true)} />

            <div className="flex flex-col flex-1 w-full md:my-5 lg:w-1/2">
                <div className="w-full max-w-md pt-10 mx-auto">
                    <Link
                        href={route('home')}
                        className="inline-flex items-center text-sm transition-colors text-main-text-light hover:text-gray-700 dark:text-main-text-dark dark:hover:text-sub-text-dark "
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
                        {__('Back to Website')}
                    </Link>
                </div>
                <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
                    <div>
                        <div className="mb-5 sm:mb-8">
                            <h1 className="mb-2 text-4xl font-semibold text-main-text-light sm:text-title-md dark:text-main-text-dark">
                                {__('Login')}
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-sub-text-dark">
                                {__('Enter your email and password to Login')}!
                            </p>
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
                                        Required={true}
                                    />

                                    <WebInput
                                        InputName={__('Password')}
                                        Error={errors.password}
                                        Value={data.password}
                                        Action={(e) => setData('password', e.target.value)}
                                        ShowPasswordToggle={ShowPasswordToggle}
                                        setShowPasswordToggle={setShowPasswordToggle}
                                        Placeholder={__('Enter Password')}
                                        Id={'password'}
                                        Name={'password'}
                                        Type={'password'}
                                        Required={true}
                                    />

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <label
                                                htmlFor="remember"
                                                className="flex items-center text-sm font-normal cursor-pointer select-none text-main-text-light dark:text-main-text-dark"
                                            >
                                                <div className="relative">
                                                    <input
                                                        type="checkbox"
                                                        id="remember"
                                                        className="sr-only"
                                                        value={data.remember}
                                                        onChange={() =>
                                                            setData('remember', !data.remember)
                                                        }
                                                    />
                                                    <div
                                                        className={
                                                            data.remember === true
                                                                ? 'mr-3 flex h-5 w-5 items-center justify-center rounded-md border-[1.25px] border-black dark:border-surafce-3-dark bg-black dark:bg-surface-1-dark dark:border-gray-700'
                                                                : 'mr-3 flex h-5 w-5 items-center justify-center rounded-md border-[1.25px] border-gray-300 bg-transparent'
                                                        }
                                                    >
                                                        <span
                                                            className={
                                                                data.remember ? '' : 'opacity-0'
                                                            }
                                                        >
                                                            <svg
                                                                width="14"
                                                                height="14"
                                                                viewBox="0 0 14 14"
                                                                fill="none"
                                                                xmlns="http://www.w3.org/2000/svg"
                                                            >
                                                                <path
                                                                    d="M11.6666 3.5L5.24992 9.91667L2.33325 7"
                                                                    stroke="white"
                                                                    strokeWidth="1.94437"
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                />
                                                            </svg>
                                                        </span>
                                                    </div>
                                                </div>
                                                {__('Keep me Logged in')}
                                            </label>
                                        </div>

                                        {canResetPassword && (
                                            <Link
                                                href={route('password.request')}
                                                className="text-sm text-main-text-light dark:text-main-text-dark dark:hover:text-sub-text-dark hover:text-main-text-light/80"
                                            >
                                                {__('Forgot Password')}?
                                            </Link>
                                        )}
                                    </div>

                                    <div>
                                        <PrimaryButton
                                            Text={__('Login')}
                                            Disabled={
                                                processing ||
                                                data.email === '' ||
                                                data.password === ''
                                            }
                                            Type={'submit'}

                                            Spinner={processing}
                                        />
                                    </div>



                                </div>
                            </form>

                            <div className="mt-5">
                                <p className="text-sm font-normal text-center text-main-text-light dark:text-sub-text-dark sm:text-start">
                                    {__("Don't have an account")}?{' '}
                                    <Link Link
                                        href={route('register')}
                                        className="text-sm font-bold text-main-text-light dark:text-main-text-dark dark:hover:text-sub-text-dark hover:text-main-text-light/80"
                                    >
                                        {' '}
                                        {'  '}
                                        {__('Register')}
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </GuestLayout >
    );
}
