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
        email: '',
        password: '',
        password_confirmation: '',
        redirect: new URLSearchParams(window.location.search).get('redirect') || redirect || '',
        is_agreed_to_terms: false,
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

                <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">

                    <div className="w-full mb-10">
                        <Link
                            href={route('home')}
                            className="inline-flex items-center text-[12px] gap-1 transition-colors text-main-text-light hover:text-gray-700 dark:text-main-text-dark dark:hover:text-sub-text-dark "
                        >
                            <svg
                                className="stroke-current"
                                xmlns="http://www.w3.org/2000/svg"
                                width="15"
                                height="15"
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

                    <div>
                        <div className="mb-5 sm:mb-8">
                            <h1 className="mb-2 text-[21px] font-semibold text-main-text-light sm:text-title-md dark:text-main-text-dark">
                                {__('Register')}
                            </h1>
                            <p className="text-[12px] font-normal text-sub-text-light dark:text-sub-text-dark">
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

                                    <div className="flex items-start">
                                        <div>
                                            <label
                                                htmlFor="is_agreed_to_terms"
                                                className="flex items-center text-[13px] font-normal cursor-pointer select-none text-main-text-light dark:text-main-text-dark"
                                            >
                                                <div className="relative">
                                                    <input
                                                        type="checkbox"
                                                        id="is_agreed_to_terms"
                                                        className="sr-only"
                                                        value={data.is_agreed_to_terms}
                                                        onChange={() =>
                                                            setData('is_agreed_to_terms', !data.is_agreed_to_terms)
                                                        }
                                                    />
                                                    <div
                                                        className={
                                                            data.is_agreed_to_terms === true
                                                                ? 'mr-3 flex h-4 w-4 items-center justify-center rounded-sm border-[1.25px] border-black dark:border-surafce-3-dark bg-black dark:bg-surface-1-dark dark:border-gray-700'
                                                                : 'mr-3 flex h-4 w-4 items-center justify-center rounded-sm border-[1.25px] border-gray-300 bg-transparent'
                                                        }
                                                    >
                                                        <span
                                                            className={
                                                                data.is_agreed_to_terms ? '' : 'opacity-0'
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
                                                <span className="text-[13px] text-main-text-light leading-5 dark:text-main-text-dark">
                                                    {__('I agree to the')}{' '}
                                                    <Link
                                                        href={route('website.terms-of-service.index')}
                                                        className="text-[13px] font-medium text-[#003aa5] underline underline-offset-[3px] decoration-[#003aa5]"
                                                    >
                                                        {__('Terms of Service')}
                                                    </Link>{' '}
                                                    {__('and related policies and acknowledge the')}{' '}
                                                    <Link
                                                        href={route('website.privacy-policy.index')}
                                                        className="text-[13px] font-medium text-[#003aa5] underline underline-offset-[3px] decoration-[#003aa5]"
                                                    >
                                                        {__('Privacy Notice')}
                                                    </Link>.
                                                </span>
                                            </label>
                                        </div>


                                    </div>
                                    <p className="text-sm text-red-500">
                                        {errors.is_agreed_to_terms}
                                    </p>

                                    <div>
                                        <PrimaryButton
                                            Text={__('Register')}
                                            Disabled={
                                                processing ||
                                                data.name == '' ||
                                                data.email == '' ||
                                                data.password == '' ||
                                                data.password_confirmation == '' ||
                                                data.password != data.password_confirmation ||
                                                !data.is_agreed_to_terms
                                            }
                                            Type={'submit'}

                                            Spinner={processing}
                                        />
                                    </div>
                                </div>
                            </form>

                            <div className="mt-5">
                                <p className="text-sm font-normal text-center text-main-text-light dark:text-main-text-dark sm:text-start">
                                    {__('Already have an account')}?{' '}
                                    <Link
                                        href={route('login')}
                                        className="text-sm font-bold text-main-text-light dark:text-main-text-dark dark:hover:text-main-text-dark hover:text-main-text-light/80"
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
