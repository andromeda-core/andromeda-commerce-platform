import Card from '@/Components/Card';
import Input from '@/Components/Input';
import PrimaryButton from '@/Components/PrimaryButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BreadCrumb from '@/Components/BreadCrumb';
import { Head, useForm } from '@inertiajs/react';

import React, { useState } from 'react';

export default function index({ user }) {
    // Update Profile Form Data
    const {
        data: updateProfileData,
        setData: setUpdateProfileData,
        put: updateProfile,
        processing: UpdateProfileProcessing,
        errors: UpdateProfileErrors,
    } = useForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
    });

    // update Password Form Data
    const {
        data: updatePasswordData,
        setData: setUpdatePasswordData,
        put: updatePassword,
        processing: UpdatePasswordProcessing,
        errors: UpdatePasswordErrors,
        reset: updatePasswordResetFields,
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    // Delete Account Form Dat
    const {
        data: deleteAccountPasswordConmfirmation,
        setData: setDeleteAccountPasswordConmfirmation,
        delete: deleteAccount,
        processing: DeleteAccountProcessing,
        errors: DeleteAccountErrors,
    } = useForm({
        current_password: '',
    });

    // Tracking Personal Info Changed or not To maintain Submit Button State
    const [personalInfoChanged, setPersonalInfoChanged] = useState(false);

    // Password Fields Toggle States
    const [ShowCurrentPasswordToggle, setShowCurrentPasswordToggle] = useState(false);
    const [ShowPasswordToggle, setShowPasswordToggle] = useState(false);
    const [ShowPasswordConfirmationToggle, setShowPasswordConfirmationToggle] = useState(false);
    const [showAccountDeleteConfirmationPassword, setShowAccountDeleteConfirmationPassword] =
        useState(false);

    // Delete Account Password Confirmation State
    const [DeleteAccountEnable, setDeleteAccountEnable] = useState(false);

    // Update Profile Data Form Request
    const updateProfileMethod = (e) => {
        e.preventDefault();
        updateProfile(route('dashboard.profile.update'), {
            onSuccess: () => {
                setPersonalInfoChanged(false);
            },
        });
    };

    // Update Password Data Form Request
    const updatePasswordMethod = (e) => {
        e.preventDefault();
        updatePassword(route('dashboard.profile.password.update'), {
            onSuccess: () =>
                updatePasswordResetFields('current_password', 'password', 'password_confirmation'),
        });
    };

    // Delete Account Form Request
    const DeleteAccountMethod = (e) => {
        e.preventDefault();
        deleteAccount(route('dashboard.profile.account.destroy'), {
            onSuccess: () => {
                setDeleteAccountEnable(false);
            },
        });
    };

    const checkIfProfileChanged = (newData) => {
        const normalize = (val) => val.trim();

        return (
            normalize(newData.name) !== normalize(user.name) ||
            normalize(newData.email) !== normalize(user.email) ||
            normalize(newData.phone) !== normalize(user.phone)
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title="Profile" />

            <BreadCrumb
                header={'Profile'}
                parent={'Dashboard'}
                parent_link={route('dashboard')}
                child={'Profile'}
            />

            <Card
                Content={
                    <>
                        <Card
                            CustomCss={'my-5'}
                            Content={
                                <>
                                    <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                                        <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
                                            <div className="flex items-center justify-center w-20 h-20 overflow-hidden text-2xl border border-gray-200 rounded-full dark:border-white dark:text-white">
                                                {user.avatar}
                                            </div>
                                            <div className="order-3 xl:order-2">
                                                <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
                                                    {user.name}
                                                </h4>
                                                <p className="text-sm text-center text-gray-600 dark:text-gray-400 xl:text-left">
                                                    {user.email}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            }
                        />

                        {/* Personal Info Update Card */}
                        <Card
                            CustomCss={'my-5'}
                            Content={
                                <>
                                    <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
                                        Update Personal Information
                                    </h4>

                                    <form onSubmit={updateProfileMethod}>
                                        <div className="w-full px-4 mb-4 sm:px-6">
                                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                <Input
                                                    InputName={'Name'}
                                                    Error={UpdateProfileErrors.name}
                                                    Value={updateProfileData.name}
                                                    Action={(e) => {
                                                        const newName = e.target.value;
                                                        const newData = {
                                                            ...updateProfileData,
                                                            name: newName,
                                                        };
                                                        setUpdateProfileData('name', newName);
                                                        setPersonalInfoChanged(
                                                            checkIfProfileChanged(newData),
                                                        );
                                                    }}
                                                    Placeholder={'Enter Name'}
                                                    Id={'name'}
                                                    Name={'name'}
                                                    Type={'text'}
                                                />

                                                <Input
                                                    InputName={'Email'}
                                                    Error={UpdateProfileErrors.email}
                                                    Value={updateProfileData.email}
                                                    Action={(e) => {
                                                        const newEmail = e.target.value;
                                                        const newData = {
                                                            ...updateProfileData,
                                                            email: newEmail,
                                                        };

                                                        setUpdateProfileData('email', newEmail);
                                                        setPersonalInfoChanged(
                                                            checkIfProfileChanged(newData),
                                                        );
                                                    }}
                                                    Placeholder={'Enter Email'}
                                                    Id={'email'}
                                                    Name={'email'}
                                                    Type={'email'}
                                                />

                                                <Input
                                                    InputName={'Phone'}
                                                    Error={UpdateProfileErrors.phone}
                                                    Value={updateProfileData.phone}
                                                    Action={(e) => {
                                                        const newPhone = e.target.value;
                                                        const newData = {
                                                            ...updateProfileData,
                                                            phone: newPhone,
                                                        };

                                                        setUpdateProfileData('phone', newPhone);
                                                        setPersonalInfoChanged(
                                                            checkIfProfileChanged(newData),
                                                        );
                                                    }}
                                                    Placeholder={'Enter Phone'}
                                                    Id={'phone'}
                                                    Name={'phone'}
                                                    Type={'text'}
                                                />
                                            </div>
                                        </div>

                                        <PrimaryButton
                                            Text={'Update profile'}
                                            Type={'submit'}
                                            CustomClass={'w-[200px] mx-5  mt-10'}
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
                                                        d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
                                                    />
                                                </svg>
                                            }
                                            Disabled={
                                                UpdateProfileProcessing ||
                                                !personalInfoChanged ||
                                                updateProfileData.name.trim() === '' ||
                                                updateProfileData.email.trim() === '' ||
                                                updateProfileData.phone.trim() === ''
                                            }
                                            Spinner={UpdateProfileProcessing}
                                        />
                                    </form>
                                </>
                            }
                        />

                        {/* update Password Card */}
                        <Card
                            CustomCss={'my-5'}
                            Content={
                                <>
                                    <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
                                        Update Password
                                    </h4>

                                    <form onSubmit={updatePasswordMethod}>
                                        <div className="w-full px-4 mb-4 sm:px-6">
                                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                <Input
                                                    InputName={'Current Password'}
                                                    Error={UpdatePasswordErrors.current_password}
                                                    Value={updatePasswordData.current_password}
                                                    Action={(e) =>
                                                        setUpdatePasswordData(
                                                            'current_password',
                                                            e.target.value,
                                                        )
                                                    }
                                                    Placeholder={'Enter Current Password'}
                                                    Id={'current_password'}
                                                    Name={'current_password'}
                                                    Type={'password'}
                                                    ShowPasswordToggle={ShowCurrentPasswordToggle}
                                                    setShowPasswordToggle={
                                                        setShowCurrentPasswordToggle
                                                    }
                                                />

                                                <Input
                                                    InputName={'New Password'}
                                                    Error={UpdatePasswordErrors.password}
                                                    Value={updatePasswordData.password}
                                                    Action={(e) =>
                                                        setUpdatePasswordData(
                                                            'password',
                                                            e.target.value,
                                                        )
                                                    }
                                                    Placeholder={'Enter New Password'}
                                                    Id={'password'}
                                                    Name={'password'}
                                                    Type={'password'}
                                                    ShowPasswordToggle={ShowPasswordToggle}
                                                    setShowPasswordToggle={setShowPasswordToggle}
                                                />

                                                <Input
                                                    InputName={'Confirm Password'}
                                                    Error={
                                                        UpdatePasswordErrors.password_confirmation
                                                    }
                                                    Value={updatePasswordData.password_confirmation}
                                                    Action={(e) =>
                                                        setUpdatePasswordData(
                                                            'password_confirmation',
                                                            e.target.value,
                                                        )
                                                    }
                                                    Placeholder={'Enter Confirm Password'}
                                                    Id={'password_confirmation'}
                                                    Name={'password_confirmation'}
                                                    Type={'password'}
                                                    ShowPasswordToggle={
                                                        ShowPasswordConfirmationToggle
                                                    }
                                                    setShowPasswordToggle={
                                                        setShowPasswordConfirmationToggle
                                                    }
                                                />
                                            </div>
                                        </div>

                                        <PrimaryButton
                                            Text={'Update Password'}
                                            Type={'submit'}
                                            CustomClass={'w-[200px] mx-5  mt-10'}
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
                                                        d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
                                                    />
                                                </svg>
                                            }
                                            Disabled={
                                                UpdatePasswordProcessing ||
                                                updatePasswordData.current_password.trim() === '' ||
                                                updatePasswordData.password.trim() === '' ||
                                                updatePasswordData.password_confirmation.trim() ===
                                                '' ||
                                                updatePasswordData.password.trim() !=
                                                updatePasswordData.password_confirmation.trim()
                                            }
                                            Spinner={UpdatePasswordProcessing}
                                        />
                                    </form>
                                </>
                            }
                        />

                        {/* For Now Not Needed */}
                        {/* <Card
                            CustomCss={'my-5'}
                            Content={
                                <>
                                    <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
                                        Delete Account
                                    </h4>

                                    <p className="text-gray-500 dark:text-white">
                                        Once you delete your account, all of its resources and data
                                        will be permanently deleted. After deleting your account,
                                        all of its resources and data will be permanently deleted.
                                        Please enter your password to confirm you would like to
                                        permanently delete your account.
                                    </p>

                                    <form className="mt-3" onSubmit={DeleteAccountMethod}>
                                        {DeleteAccountEnable && (
                                            <Input
                                                InputName={'Current Password'}
                                                Type={'password'}
                                                Action={(e) => {
                                                    setDeleteAccountPasswordConmfirmation(
                                                        'current_password',
                                                        e.target.value,
                                                    );
                                                }}
                                                ShowPasswordToggle={
                                                    showAccountDeleteConfirmationPassword
                                                }
                                                setShowPasswordToggle={
                                                    setShowAccountDeleteConfirmationPassword
                                                }
                                                Error={DeleteAccountErrors.current_password}
                                                Id={'current_password'}
                                                Name={'current_password'}
                                                Placeholder={'Enter Your Current Password '}
                                                Value={
                                                    deleteAccountPasswordConmfirmation.current_password
                                                }
                                                Required={true}
                                            />
                                        )}

                                        {DeleteAccountEnable ? (
                                            <>
                                                <PrimaryButton
                                                    CustomClass={
                                                        'w-[250px]  mt-10 bg-red-600 hover:bg-red-300'
                                                    }
                                                    Text={'Delete Account permanently'}
                                                    Type={'submit'}
                                                    Disabled={DeleteAccountProcessing}
                                                    Spinner={DeleteAccountProcessing}
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
                                                                d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                                                            />
                                                        </svg>
                                                    }
                                                />
                                            </>
                                        ) : (
                                            <>
                                                <PrimaryButton
                                                    CustomClass={
                                                        'w-[250px]  mt-10 bg-red-600 hover:bg-red-300'
                                                    }
                                                    Text={'Delete Account permanently'}
                                                    Type={'button'}
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
                                                                d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                                                            />
                                                        </svg>
                                                    }
                                                    Action={() => {
                                                        !DeleteAccountEnable &&
                                                            setDeleteAccountEnable(true);
                                                    }}
                                                />
                                            </>
                                        )}
                                    </form>
                                </>
                            }
                        /> */}
                    </>
                }
            />
        </AuthenticatedLayout>
    );
}
