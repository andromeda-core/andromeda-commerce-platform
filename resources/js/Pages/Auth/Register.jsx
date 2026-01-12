import PrimaryButton from '@/Components/PrimaryButton';
import WebInput from '@/Components/WebInput';
import WebSelectInput from '@/Components/WebSelectInput';
import { useTranslation } from '@/Hooks/useTranslation';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function Register({ countries, redirect }) {
    // Toggle Show Password States
    const [showPasswordToggle, setshowPasswordToggle] = useState(false);
    const [showPasswordConfirmationToggle, setShowPasswordConfirmationToggle] = useState(false);

    // Translation Hook
    const { __ } = useTranslation();
    // Register User Form Data
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        phone: '',
        email: '',
        country_id: '',
        password: '',
        password_confirmation: '',
        redirect: new URLSearchParams(window.location.search).get('redirect') || redirect || '',
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
            <Head title={__("Register", true)} />

            <div className="flex flex-col flex-1 w-full px-4 md:my-5 lg:w-1/2">
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
                                {__('Register')}
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-sub-text-dark">
                                {__('Create Your Account To Login From Your Account')}
                            </p>
                        </div>
                        <div>
                            <form onSubmit={submit}>
                                <div className="space-y-0">
                                    <WebInput
                                        InputName={__('Name')}
                                        Error={errors.name}
                                        Value={data.name}
                                        Action={(e) => setData('name', e.target.value)}
                                        Placeholder={'John'}
                                        Id={'name'}
                                        Name={'name'}
                                        Type={'text'}
                                        Required={true}
                                    />

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
                                        InputName={__('Phone Number')}
                                        Error={errors.phone}
                                        Value={data.phone}
                                        Action={(e) => setData('phone', e.target.value)}
                                        Placeholder={__('Phone Number')}
                                        Id={'phone'}
                                        Name={'phone'}
                                        Type={'text'}
                                        Required={true}
                                    />

                                    {errors?.phone && <p className="mt-2">&nbsp;</p>}

                                    <div className="relative bottom-3 z-[50]">
                                        <WebSelectInput
                                            InputName={__('Country')}
                                            Id={'country_id'}
                                            Name={'country_id'}
                                            Error={errors.country_id}
                                            Value={data.country_id}
                                            items={countries}
                                            itemKey={'name'}
                                            Placeholder={__('Select Country')}
                                            customPlaceHolder={true}
                                            Required={true}
                                            Action={(value) => setData('country_id', value)}
                                        />
                                    </div>

                                    <WebInput
                                        InputName={__('Password')}
                                        Error={errors.password}
                                        Value={data.password}
                                        Action={(e) => setData('password', e.target.value)}
                                        ShowPasswordToggle={showPasswordToggle}
                                        setShowPasswordToggle={setshowPasswordToggle}
                                        Placeholder={__('Enter Password')}
                                        Id={'password'}
                                        Name={'password'}
                                        Type={'password'}
                                        Required={true}
                                    />

                                    <WebInput
                                        InputName={__('Password Confirmation')}
                                        Error={errors.password_confirmation}
                                        Value={data.password_confirmation}
                                        Action={(e) =>
                                            setData('password_confirmation', e.target.value)
                                        }
                                        ShowPasswordToggle={showPasswordConfirmationToggle}
                                        setShowPasswordToggle={setShowPasswordConfirmationToggle}
                                        Placeholder={__('Re-Enter The New Password')}
                                        Id={'password_confirmation'}
                                        Name={'password_confirmation'}
                                        Type={'password'}
                                        Required={true}
                                    />

                                    <div>
                                        <PrimaryButton
                                            Text={__('Register')}
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

                                            Spinner={processing}
                                        />
                                    </div>
                                </div>
                            </form>

                            <div className="mt-5">
                                <p className="text-sm font-normal text-center text-main-text-light dark:text-sub-text-dark sm:text-start">
                                    {__('Already have an account')}?{' '}
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
