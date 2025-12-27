
import WebInput from '@/Components/WebInput';
import Textarea from '@/Components/Textarea';
import { useConfirm } from '@/Hooks/useConfirm';
import useWindowSize from '@/Hooks/useWindowSize';
import MainLayout from '@/Layouts/Website/MainLayout';
import { Head, useForm } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';


const DataDeletion = () => {

    const { confirm, ConfirmDialog } = useConfirm();
    const { data, setData, post, processing, errors } = useForm({
        password: '',
        reason: '',
        consent: false,
    });

    const [showPassword, setShowPassword] = useState(false);
    const [isDisabled, setIsDisabled] = useState(false);
    const windowSize = useWindowSize();
    useEffect(() => {
        setIsDisabled(data.password === '' || data.reason === '' || data.consent === false);
    }, [data]);

    const submit = async (e) => {
        e.preventDefault();

        if (isDisabled) {
            return;
        }


        const result = await confirm({
            title: 'Are You Sure You Want To Delete Your Data?',
            text: "You Won't Be Able To Revert This!",
            icon: 'danger',
            showCancelButton: true,
            confirmButtonText: 'Yes, Delete it!',
            cancelButtonText: 'Cancel'
        });

        if (result.isConfirmed) {
            post(route('website.data-deletion.store'), {
                preserveScroll: true,
                preserveState: true,
            });
        }


    };

    return (
        <MainLayout>
            <Head title="Data Deletion" />
            <ConfirmDialog />


            <div className="pt-0 sm:px-6 lg:px-8 lg:pt-10">

                {/* Hero Section */}
                <div className="relative overflow-hidden ">
                    <div className="absolute inset-0" />

                    <div className="relative px-6 py-10 mx-auto lg:max-w-6xl sm:max-w-3xl lg:py-14">


                        <h1 className="mb-6 text-5xl font-semibold text-main-text-light dark:text-main-text-dark lg:text-4xl">
                            Data Deletion
                        </h1>

                        <p className="max-w-3xl mb-8 text-xl text-sub-text-light dark:text-sub-text-dark">
                            We respect your right to privacy. Submit a request to permanently
                            delete your account and all associated data.
                        </p>

                        <div className="flex flex-wrap gap-4">
                            <div className="flex items-center gap-2 rounded-full  bg-surface-1-light dark:bg-surface-1-dark px-3 py-1.5">
                                <svg
                                    className="w-4 h-4 text-sub-text-light dark:text-sub-text-dark"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                                    />
                                </svg>
                                <span className="text-sm font-medium text-sub-text-light dark:text-sub-text-dark">
                                    This action is permanent
                                </span>
                            </div>
                            <div className="flex items-center gap-2 rounded-full  bg-surface-1-light dark:bg-surface-1-dark px-3 py-1.5">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="w-4 h-4 text-sub-text-light dark:text-sub-text-dark"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"
                                    />
                                </svg>
                                <span className="text-sm font-medium text-sub-text-light dark:text-sub-text-dark">
                                    Instant Deletion
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className={`px-6  mx-auto ${windowSize.width > 1024 ? 'pb-0' : 'pb-24'} lg:max-w-6xl sm:max-w-3xl`}>
                    <div className="grid gap-8 lg:grid-cols-3">

                        {/* Form */}
                        <div className="lg:col-span-2">
                            <form
                                onSubmit={submit}
                                className="p-2"
                            >
                                <h2 className="mb-6 text-xl font-semibold text-main-text-light dark:text-main-text-dark ">
                                    Submit Deletion
                                </h2>

                                <div className="space-y-1">
                                    {/* Password Field */}
                                    <div>
                                        <WebInput
                                            InputName={'Password'}
                                            Name={'password'}
                                            Id={'password'}
                                            Error={errors.password}
                                            Placeholder={'Enter Your Password To Confirm'}
                                            Type={'password'}
                                            Value={data.password}
                                            Action={(e) => setData('password', e.target.value)}
                                            Required={true}
                                            ShowPasswordToggle={showPassword}
                                            setShowPasswordToggle={setShowPassword}
                                            ClassName={'dark:bg-surface-1-dark'}
                                        />
                                    </div>

                                    {/* Reason Field */}
                                    <div>
                                        <Textarea
                                            InputName={'Reason For Deletion'}
                                            Id={'reason'}
                                            Name={'reason'}
                                            Error={errors.reason}
                                            Value={data.reason}
                                            Action={(e) => setData('reason', e.target.value)}
                                            Required={true}
                                            Rows={7}
                                            Placeholder={'Enter Your Reason For Deletion'}
                                            ClassName={'dark:bg-surface-1-dark'}
                                        />
                                    </div>

                                    {/* Confirmation Checkbox */}
                                    <div className="p-4 bg-red-100 border border-red-200 rounded-md dark:border-red-500/30 dark:bg-red-500/10">
                                        <label className="flex items-start gap-3">
                                            <input
                                                type="checkbox"
                                                required
                                                onChange={(e) =>
                                                    setData('consent', e.target.checked)
                                                }
                                                className="w-6 h-6 mt-1 text-red-600 border-gray-300 rounded shrink-0 focus:ring-0 dark:border-gray-600 focus:ring-offset-0"
                                            />
                                            <span className="text-sm text-black dark:text-sub-text-dark">
                                                I understand that this action is{' '}
                                                <strong className="font-bold">
                                                    permanent and irreversible
                                                </strong>
                                                . All my data will be permanently deleted and
                                                cannot be recovered.
                                            </span>
                                        </label>
                                    </div>

                                    {/* Submit Button */}
                                    <div className="flex gap-4 pt-3">
                                        <button
                                            disabled={processing || isDisabled}
                                            type="submit"
                                            className={`flex-1 ${isDisabled && 'pointer-events-none cursor-not-allowed opacity-25 dark:opacity-40'} rounded-md bg-red-600  px-6 py-4 font-semibold text-white shadow-lg transition-all text-md  hover:bg-red-600/80  dark:bg-red-600 dark:hover:bg-red-600/80`}
                                        >
                                            <div className="flex items-center justify-center gap-2">
                                                {processing && (
                                                    <div role="status">
                                                        <svg
                                                            aria-hidden="true"
                                                            className={`size-5 animate-spin fill-red-500 text-white/80`}
                                                            viewBox="0 0 100 101"
                                                            fill="none"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                        >
                                                            <path
                                                                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                                                fill="currentColor"
                                                            />
                                                            <path
                                                                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                                                fill="currentFill"
                                                            />
                                                        </svg>
                                                        <span className="sr-only"></span>
                                                    </div>
                                                )}
                                                <span>Delete Account</span>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* Info Sidebar */}
                        <div className="xl:mt-[26%] lg:mt-[42%] mt-0 space-y-10 lg:col-span-1">
                            <div className="p-6  rounded-md bg-surface-1-light  dark:bg-surface-1-dark  xl:w-[330px] w-auto">
                                <h3 className="mb-4 text-lg font-semibold text-main-text-light dark:text-main-text-dark ">What Gets Deleted?</h3>
                                <ul className="space-y-1 text-sm text-sub-text-light dark:text-sub-text-dark ">
                                    <li className="flex items-start gap-2">
                                        -
                                        <span>Your account credentials</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        -
                                        <span>Personal information</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        -
                                        <span>Order history</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        -
                                        <span>Delivery addresses</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        -
                                        <span>Facebook Login data</span>
                                    </li>
                                </ul>
                            </div>


                            <div className="p-6 rounded-md bg-surface-1-light  dark:bg-surface-1-dark xl:w-[330px] w-auto">



                                <div className="flex items-center gap-2 mb-3">

                                    <h3 className="font-semibold text-main-text-light dark:text-main-text-dark">
                                        Need Help?
                                    </h3>
                                </div>


                                <p className="mb-5 text-sm text-sub-text-light dark:text-sub-text-dark ">
                                    Contact our support team if you have questions about data
                                    deletion.
                                </p>


                                <a
                                    href="mailto:privacy@windoublespace.com"
                                    className="text-sm font-semibold break-words text-sub-text-light dark:text-sub-text-dark hover:text-sub-text-light/80 dark:hover:text-sub-text-dark/80"
                                >
                                    privacy@andromeda.blue
                                </a>

                            </div>


                        </div>


                    </div>
                </div>

            </div>
        </MainLayout >
    );
};

export default DataDeletion;
