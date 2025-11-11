import Input from '@/Components/Input';
import PrimaryButton from '@/Components/PrimaryButton';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function ResetPassword({ token, email }) {
    // Show Password States
    const [showPasswordToggle, setshowPasswordToggle] = useState(false);
    const [showPasswordConfirmationToggle, setShowPasswordConfirmationToggle] = useState(false);

    // Reset Password Form Data
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    // Reset Password Form Request
    const submit = (e) => {
        e.preventDefault();

        post(route('password.store'), {
            onSuccess: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Reset Password" />

            <div className="flex w-full flex-1 flex-col md:my-5 lg:w-1/2">
                <div className="mx-auto w-full max-w-md pt-10">
                    <Link
                        href={route('home')}
                        className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-white dark:hover:text-gray-300"
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
                <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
                    <div>
                        <div className="mb-5 sm:mb-8">
                            <h1 className="sm:text-title-md mb-2 text-4xl font-bold text-gray-800 dark:text-white">
                                Reset Password
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-white">
                                Set New Password For Your Account
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
                                        ShowPasswordToggle={showPasswordToggle}
                                        setShowPasswordToggle={setshowPasswordToggle}
                                        Placeholder={'Enter Your password'}
                                        Id={'password'}
                                        Name={'password'}
                                        Type={'password'}
                                        Required={true}
                                    />

                                    <Input
                                        InputName={'Confirm Password'}
                                        Error={errors.password_confirmation}
                                        Value={data.password_confirmation}
                                        Action={(e) =>
                                            setData('password_confirmation', e.target.value)
                                        }
                                        ShowPasswordToggle={showPasswordConfirmationToggle}
                                        setShowPasswordToggle={setShowPasswordConfirmationToggle}
                                        Placeholder={'Enter  Confirm Password'}
                                        Id={'password_confirmation'}
                                        Name={'password_confirmation'}
                                        Type={'password'}
                                        Required={true}
                                    />

                                    <div>
                                        <PrimaryButton
                                            Text={'Reset Password '}
                                            Disabled={
                                                processing ||
                                                data.password === '' ||
                                                data.password_confirmation === '' ||
                                                data.email === '' ||
                                                data.password !== data.password_confirmation
                                            }
                                            Type={'submit'}
                                            Icon={
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    strokeWidth="1.5"
                                                    stroke="currentColor"
                                                    className="size-5"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M13.5 10.5V6.75a4.5 4.5 0 1 1 9 0v3.75M3.75 21.75h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H3.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
                                                    />
                                                </svg>
                                            }
                                            Spinner={processing}
                                        />
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
