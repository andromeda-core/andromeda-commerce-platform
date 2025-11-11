import Input from '@/Components/Input';
import PrimaryButton from '@/Components/PrimaryButton';
import SelectInput from '@/Components/SelectInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function Register({ countries }) {
    // Toggle Show Password States
    const [showPasswordToggle, setshowPasswordToggle] = useState(false);
    const [showPasswordConfirmationToggle, setShowPasswordConfirmationToggle] = useState(false);

    // Register User Form Data
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        phone: '',
        email: '',
        country_id: '',
        password: '',
        password_confirmation: '',
    });

    // Register User Form Request
    const submit = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Register" />

            <div className="flex w-full flex-1 flex-col px-4 md:my-5 lg:w-1/2">
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
                                Register
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-white">
                                Create Your Account To Login Into The Dashboard !
                            </p>
                        </div>
                        <div>
                            <form onSubmit={submit}>
                                <div className="space-y-0">
                                    <Input
                                        InputName={'Name'}
                                        Error={errors.name}
                                        Value={data.name}
                                        Action={(e) => setData('name', e.target.value)}
                                        Placeholder={'John'}
                                        Id={'name'}
                                        Name={'name'}
                                        Type={'text'}
                                        Required={true}
                                    />

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
                                        InputName={'Phone'}
                                        Error={errors.phone}
                                        Value={data.phone}
                                        Action={(e) => setData('phone', e.target.value)}
                                        Placeholder={'Phone'}
                                        Id={'phone'}
                                        Name={'phone'}
                                        Type={'text'}
                                        Required={true}
                                    />

                                    {errors?.phone && <p className="mt-2">&nbsp;</p>}

                                    <div className="relative bottom-3 z-[50]">
                                        <SelectInput
                                            InputName={'Country'}
                                            Id={'country_id'}
                                            Name={'country_id'}
                                            Error={errors.country_id}
                                            Value={data.country_id}
                                            items={countries}
                                            itemKey={'name'}
                                            Placeholder={'Select Country'}
                                            Required={true}
                                            Action={(value) => setData('country_id', value)}
                                        />
                                    </div>

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
                                            Text={'Register'}
                                            Disabled={
                                                processing ||
                                                data.name == '' ||
                                                data.email == '' ||
                                                data.phone == '' ||
                                                data.password == '' ||
                                                data.password_confirmation == '' ||
                                                data.password != data.password_confirmation
                                            }
                                            Type={'submit'}
                                            Icon={
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    strokeWidth={1.5}
                                                    stroke="currentColor"
                                                    className="size-6"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z"
                                                    />
                                                </svg>
                                            }
                                            Spinner={processing}
                                        />
                                    </div>
                                </div>
                            </form>

                            <div className="mt-5">
                                <p className="text-center text-sm font-normal text-gray-700 dark:text-white sm:text-start">
                                    Already have an account?{' '}
                                    <Link
                                        href={route('login')}
                                        className="text-indigo-500 hover:text-indigo-600"
                                    >
                                        {' '}
                                        {'  '}
                                        Login
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
