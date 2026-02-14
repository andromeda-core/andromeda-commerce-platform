import PrimaryButton from '@/Components/PrimaryButton';
import WebInput from '@/Components/WebInput';
import { useTranslation } from '@/Hooks/useTranslation';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function ResetPassword({ token, email }) {
    // Show Password States
    const [showPasswordToggle, setshowPasswordToggle] = useState(false);
    const [showPasswordConfirmationToggle, setShowPasswordConfirmationToggle] = useState(false);

    // Translation Hook
    const { __ } = useTranslation();

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
            <Head title={__("Reset Password", true)} />

            <div className="flex flex-col flex-1 w-full md:my-5 lg:w-1/2">

                <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
                    {/* <div className="w-full mb-10">
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
                    </div> */}
                    <div>
                        <div className="mb-5 sm:mb-8">
                            <h1 className="mb-2 text-[21px] font-semibold text-main-text-light sm:text-title-md dark:text-main-text-dark">
                                {__('Reset Password')}
                            </h1>
                            <p className="text-[12px] font-normal text-sub-text-light dark:text-sub-text-dark">
                                {__('Set New Password For Your Account')}
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
                                            Text={__('Reset Password')}
                                            Disabled={
                                                processing ||
                                                data.password === '' ||
                                                data.password_confirmation === '' ||
                                                data.email === '' ||
                                                data.password !== data.password_confirmation
                                            }
                                            Type={'submit'}

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
