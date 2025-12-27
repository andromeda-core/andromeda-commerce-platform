import Input from '@/Components/Input';
import PrimaryButton from '@/Components/PrimaryButton';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function Login({ canResetPassword }) {
    // Toggle Show Password State
    const [ShowPasswordToggle, setShowPasswordToggle] = useState(false);

    // Login User Form Data
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    // Login User Form Request
    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Log in" />

            <div className="flex flex-col flex-1 w-full md:my-5 lg:w-1/2">
                <div className="w-full max-w-md pt-10 mx-auto">
                    <Link
                        href={route('home')}
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
                        Back to Website
                    </Link>
                </div>
                <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
                    <div>
                        <div className="mb-5 sm:mb-8">
                            <h1 className="mb-2 text-4xl font-semibold text-black sm:text-title-md dark:text-main-text-dark">
                                Login
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-sub-text-dark">
                                Enter your email and password to Login Into Dashboard !
                            </p>
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
                                        Required={true}
                                    />

                                    <Input
                                        InputName={'Password'}
                                        Error={errors.password}
                                        Value={data.password}
                                        Action={(e) => setData('password', e.target.value)}
                                        ShowPasswordToggle={ShowPasswordToggle}
                                        setShowPasswordToggle={setShowPasswordToggle}
                                        Placeholder={'Enter Your password'}
                                        Id={'password'}
                                        Name={'password'}
                                        Type={'password'}
                                        Required={true}
                                    />

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <label
                                                htmlFor="remember"
                                                className="flex items-center text-sm font-normal text-black cursor-pointer select-none dark:text-main-text-dark"
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
                                                Keep me logged in
                                            </label>
                                        </div>

                                        {canResetPassword && (
                                            <Link
                                                href={route('password.request')}
                                                className="text-sm text-black dark:text-main-text-dark dark:hover:text-sub-text-dark hover:text-black/80"
                                            >
                                                Forgot password?
                                            </Link>
                                        )}
                                    </div>

                                    <div>
                                        <PrimaryButton
                                            Text={'Login'}
                                            Disabled={
                                                processing ||
                                                data.email === '' ||
                                                data.password === ''
                                            }
                                            Type={'submit'}
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
                                                        d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9"
                                                    />
                                                </svg>
                                            }
                                            Spinner={processing}
                                        />
                                    </div>
                                </div>
                            </form>

                            <div className="mt-5">
                                <p className="text-sm font-normal text-center text-black dark:text-sub-text-dark sm:text-start">
                                    Don't have an account?{' '}
                                    <Link
                                        href={route('register')}
                                        className="text-sm text-black dark:text-main-text-dark dark:hover:text-sub-text-dark hover:text-black/80"
                                    >
                                        {' '}
                                        {'  '}
                                        Register
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
