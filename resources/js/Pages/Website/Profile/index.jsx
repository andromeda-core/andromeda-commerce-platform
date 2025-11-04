import Input from '@/Components/Input';
import PrimaryButton from '@/Components/PrimaryButton';
import SelectInput from '@/Components/SelectInput';
import Spinner from '@/Components/Spinner';
import Textarea from '@/Components/Textarea';
import Toast from '@/Components/Toast';
import useWindowSize from '@/Hooks/useWindowSize';
import MainLayout from '@/Layouts/Website/MainLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import React, { memo, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

const Index = ({ user, countries }) => {
    const [hasCompleteAddress, setHasCompleteAddress] = useState(false);
    useEffect(() => {
        if (
            (user?.customer?.address_line1 || user?.customer?.address_line2) &&
            user?.customer?.city &&
            user?.customer?.state &&
            user?.customer?.postal_code &&
            user?.customer?.country_id
        ) {
            setHasCompleteAddress(true);
        }
    }, [user]);

    const [infoMessage, setInfoMessage] = useState('');
    const [showInfoMessage, setShowInfoMessage] = useState(false);

    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [SuccessMessage, setSuccessMessage] = useState('');

    const [showErrorMessage, setShowErrorMessage] = useState(false);
    const [ErrorMessage, setErrorMessage] = useState('');

    const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

    const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
    const [toggleCurrentPassword, setToggleCurrentPassword] = useState(false);
    const [togglePassword, setTogglePassword] = useState(false);
    const [togglePasswordConfirmation, setTogglePasswordConfirmation] = useState(false);

    // Profile Form Data
    const {
        data: profileData,
        setData: setProfileData,
        put: updateProfile,
        processing: UpdateProfileProcessing,
        errors: UpdateProfileErrors,
    } = useForm({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        address_line1: user?.customer?.address_line1 || '',
        address_line2: user?.customer?.address_line2 || '',
        city: user?.customer?.city || '',
        state: user?.customer?.state || '',
        postal_code: user?.customer?.postal_code || '',
        country_id: user?.customer?.country_id || '',
    });

    // Password Change Form Data
    const {
        data: passwordData,
        setData: setPasswordData,
        put: updatePassword,
        processing: UpdatePasswordProcessing,
        errors: UpdatePasswordErrors,
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    // Profile Update Request
    const handleEditProfileSubmit = (e) => {
        e.preventDefault();
        updateProfile(route('website.profile.update-profile', user?.id), {
            preserveScroll: true,
            preserveState: true,
            onSuccess: (page) => {
                // Check for flash messages
                if (page.props.flash?.success) {
                    setIsEditProfileOpen(false);
                }
            },

            onError: (errors) => {
                // Handle validation errors
                const errorMessages = Object.values(errors).flat();

                if (errorMessages.length > 0) {
                    setShowErrorMessage(true);
                    // Show first error or combine all errors
                    setErrorMessage(errorMessages.join(', '));
                } else {
                    setShowErrorMessage(true);
                    setErrorMessage('Something went wrong. Please check all fields and try again.');
                }
            },
        });
    };

    // Password Change Request
    const handleChangePasswordSubmit = (e) => {
        e.preventDefault();

        if (passwordData.password !== passwordData.password_confirmation) {
            setInfoMessage('New Password and Confirm Password do not match.');
            setShowInfoMessage(true);
            return;
        }

        updatePassword(route('website.profile.change-password', user?.id), {
            preserveScroll: true,
            preserveState: true,
            onSuccess: (page) => {
                if (page.props.flash?.success) {
                    setIsChangePasswordOpen(false);
                    setPasswordData({
                        current_password: '',
                        password: '',
                        password_confirmation: '',
                    });
                }
            },

            onError: (errors) => {
                const errorMessages = Object.values(errors).flat();

                if (errorMessages.length > 0) {
                    setShowErrorMessage(true);
                    setErrorMessage(errorMessages.join(', '));
                } else {
                    setShowErrorMessage(true);
                    setErrorMessage('Something went wrong while changing password.');
                }
            },
        });
    };
    const windowSize = useWindowSize();

    // Auto Opening Modal If Query Exists
    useEffect(() => {
        const url = new URL(window.location.href);
        const param = url.searchParams.get('modal');

        if (param === 'edit-profile') {
            setIsEditProfileOpen(true);
        } else if (param === 'change-password') {
            setIsChangePasswordOpen(true);
        }
    }, []);

    useEffect(() => {
        if (isEditProfileOpen || isChangePasswordOpen) {
            document.body.style.overflow = 'hidden';
            document.body.style.touchAction = 'none';
        } else {
            document.body.style.overflow = '';
            document.body.style.touchAction = '';
        }
        return () => {
            document.body.style.overflow = '';
            document.body.style.touchAction = '';
        };
    }, [isEditProfileOpen, isChangePasswordOpen]);

    // // Appedning modal to URL
    useEffect(() => {
        const url = new URL(window.location.href);
        if (isEditProfileOpen) {
            window.history.pushState({}, '', window.location.pathname);
            url.searchParams.set('modal', 'edit-profile');
        } else if (isChangePasswordOpen) {
            window.history.pushState({}, '', window.location.pathname);
            url.searchParams.set('modal', 'change-password');
        } else {
            url.searchParams.delete('modal');
        }

        window.history.replaceState({}, '', url);
    }, [isEditProfileOpen, isChangePasswordOpen]);

    // // Handle browser/mobile back button to close modals
    useEffect(() => {
        const handlePopState = (e) => {
            if (isEditProfileOpen) {
                setIsEditProfileOpen(false);
                return;
            }

            if (isChangePasswordOpen) {
                setIsChangePasswordOpen(false);
                return;
            }
        };

        const preventInertiaNavigation = (event) => {
            const pathname = event.detail?.visit?.url?.pathname || '';

            if (
                pathname === 'profile/details/update/' + user?.id ||
                pathname === 'profile/change-password'
            ) {
                return;
            }
            if ((isEditProfileOpen || isChangePasswordOpen) && pathname === '/profile') {
                event.preventDefault();
            }
        };
        window.addEventListener('popstate', handlePopState);
        const removeRouterEvent = router.on('before', preventInertiaNavigation);

        // Cleanup
        return () => {
            window.removeEventListener('popstate', handlePopState);
            if (removeRouterEvent) removeRouterEvent();
        };
    }, [isEditProfileOpen, isChangePasswordOpen]);

    // // CleanUp Message States
    useEffect(() => {
        if (showInfoMessage) {
            setTimeout(() => {
                setShowInfoMessage(false);
                setInfoMessage('');
            }, 1500);
        }

        if (showErrorMessage) {
            setTimeout(() => {
                setShowErrorMessage(false);
                setErrorMessage('');
            }, 1500);
        }

        if (showSuccessMessage) {
            setTimeout(() => {
                setShowSuccessMessage(false);
                setSuccessMessage('');
            }, 1500);
        }
    }, [showInfoMessage, showErrorMessage, showSuccessMessage]);

    // // Disable Profile Button State
    const [isProfileUpdateButtonDisabled, setIsProfileButtonDisabled] = useState(true);

    useEffect(() => {
        const isIncomplete =
            !profileData.name ||
            !profileData.email ||
            !profileData.phone ||
            !profileData.address_line1 ||
            !profileData.city ||
            !profileData.state ||
            !profileData.postal_code ||
            !profileData.country_id;

        setIsProfileButtonDisabled(isIncomplete);
    }, [profileData]);

    // // Disable Password Change Button State
    const [isPasswordChangeButtonDisabled, setIsPasswordChangeButtonDisabled] = useState(true);
    useEffect(() => {
        const isIncomplete =
            !passwordData.current_password ||
            !passwordData.password ||
            !passwordData.password_confirmation;

        setIsPasswordChangeButtonDisabled(isIncomplete);
    }, [passwordData]);

    return (
        <MainLayout>
            <Head title="Profile" />

            {(showErrorMessage || showInfoMessage || showSuccessMessage) && (
                <Toast
                    flash={{
                        ...(showErrorMessage && { error: ErrorMessage }),
                        ...(showInfoMessage && { info: infoMessage }),
                        ...(showSuccessMessage && { success: SuccessMessage }),
                    }}
                />
            )}

            <div
                className={`min-h-screen px-4 py-8 sm:px-6 lg:px-8 ${windowSize.width < 1024 ? 'mb-20' : ''}`}
            >
                <div className="mx-auto max-w-7xl">
                    {/* Header Section with Points */}
                    <div className="relative mb-8 overflow-hidden rounded-3xl border border-gray-200 bg-white p-8 shadow-lg dark:border-gray-700 dark:bg-deepcharcoal sm:p-12">
                        <div className="relative z-10 flex flex-col items-center justify-between gap-6 sm:flex-row sm:items-start">
                            <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
                                {/* Avatar */}
                                <div className="relative">
                                    <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 backdrop-blur-sm dark:border-gray-700 dark:bg-deepcharcoal sm:h-32 sm:w-32">
                                        <span className="text-4xl font-bold text-gray-700 dark:text-white/80 sm:text-5xl">
                                            {user?.name ? user.name.charAt(0).toUpperCase() : 'N/A'}
                                        </span>
                                    </div>
                                </div>

                                {/* User Info */}
                                <div className="text-center sm:text-left">
                                    <h1 className="mb-2 text-3xl font-bold text-gray-700 dark:text-white/80 sm:text-4xl">
                                        {user?.name || 'N/A'}
                                    </h1>
                                    <p className="mb-3 text-lg text-gray-700 dark:text-white/80">
                                        Member since {user?.member_since || 'N/A'}
                                    </p>
                                    <div className="flex flex-wrap justify-center gap-3 sm:justify-start">
                                        <span className="rounded-full bg-indigo-600 px-4 py-1.5 text-sm font-bold text-white/80 backdrop-blur-sm dark:text-white/80">
                                            {user?.customer?.orders_count ?? 0} Orders
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Points Card */}
                            <div className="min-w-[160px] rounded-2xl border p-6 text-center backdrop-blur-md dark:border-gray-700 dark:bg-deepcharcoal">
                                <div className="mb-1 text-sm font-medium text-gray-700 dark:text-white/80">
                                    Reward Points
                                </div>
                                <div className="mb-1 text-4xl font-bold text-gray-700 dark:text-white/80">
                                    {user?.reward_points ?? 0}
                                </div>
                                <div className="text-xs text-gray-700 dark:text-white/80">
                                    pts available
                                </div>
                            </div>
                        </div>

                        {/* Decorative Elements */}
                        <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-white/5 blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-white/5 blur-3xl"></div>
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* Personal Information Card */}
                        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-deepcharcoal lg:col-span-2">
                            <div className="border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-700 dark:bg-deepcharcoal dark:from-gray-700">
                                <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-700 dark:text-white/80">
                                    <svg
                                        className="h-5 w-5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                        />
                                    </svg>
                                    Personal Information
                                </h2>
                            </div>
                            <div className="space-y-4 p-6">
                                {/* Email */}
                                <div className="flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-4 transition-colors dark:border-gray-700 dark:bg-deepcharcoal">
                                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                                        <svg
                                            className="h-5 w-5 text-indigo-600 dark:text-indigo-400"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                            />
                                        </svg>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                                            Email Address
                                        </div>
                                        <div className="truncate text-sm font-medium text-gray-700 dark:text-white/80">
                                            {user?.email || 'N/A'}
                                        </div>
                                    </div>
                                </div>

                                {/* Phone */}
                                <div className="flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-4 transition-colors dark:border-gray-700 dark:bg-deepcharcoal">
                                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
                                        <svg
                                            className="h-5 w-5 text-purple-600 dark:text-purple-400"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                            />
                                        </svg>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                                            Phone Number
                                        </div>
                                        <div className="text-sm font-medium text-gray-700 dark:text-white/80">
                                            {user?.phone || 'N/A'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions Card */}
                        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-deepcharcoal">
                            <div className="border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-700 dark:bg-deepcharcoal">
                                <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-700 dark:text-white/80">
                                    <svg
                                        className="h-5 w-5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M13 10V3L4 14h7v7l9-11h-7z"
                                        />
                                    </svg>
                                    Quick Actions
                                </h2>
                            </div>
                            <div className="space-y-3 p-6">
                                <button
                                    onClick={() => setIsChangePasswordOpen(true)}
                                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-100 px-4 py-3 font-medium text-gray-700 transition-all hover:bg-gray-200 dark:bg-gray-800 dark:text-white/80 dark:hover:bg-gray-700"
                                >
                                    <svg
                                        className="h-5 w-5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                        />
                                    </svg>
                                    Change Password
                                </button>
                                <button
                                    onClick={() => setIsEditProfileOpen(true)}
                                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 font-medium text-white shadow-md transition-all hover:bg-indigo-500 hover:shadow-lg"
                                >
                                    <svg
                                        className="h-5 w-5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                        />
                                    </svg>
                                    Edit Profile
                                </button>

                                <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-100 px-4 py-3 font-medium text-gray-700 transition-all hover:bg-gray-200 dark:bg-gray-800 dark:text-white/80 dark:hover:bg-gray-700">
                                    <svg
                                        className="h-5 w-5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                        />
                                    </svg>
                                    Order History
                                </button>
                            </div>
                        </div>

                        {/* Address Information Card */}
                        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-deepcharcoal lg:col-span-3">
                            <div className="border-b border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-deepcharcoal">
                                <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-700 dark:text-white/80">
                                    <svg
                                        className="h-5 w-5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                        />
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                        />
                                    </svg>
                                    Address Information
                                </h2>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {/* Address Line 1 */}
                                    <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-deepcharcoal">
                                        <div className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                            Address Line 1
                                        </div>
                                        <div className="break-words text-sm font-medium text-gray-700 dark:text-white/80">
                                            {user?.customer?.address_line1 || 'N/A'}
                                        </div>
                                    </div>

                                    {/* Address Line 2 */}
                                    <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-deepcharcoal">
                                        <div className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                            Address Line 2
                                        </div>
                                        <div className="break-words text-sm font-medium text-gray-700 dark:text-white/80">
                                            {user?.customer?.address_line2 || 'N/A'}
                                        </div>
                                    </div>

                                    {/* City */}
                                    <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-deepcharcoal">
                                        <div className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                            City
                                        </div>
                                        <div className="break-words text-sm font-medium text-gray-700 dark:text-white/80">
                                            {user?.customer?.city || 'N/A'}
                                        </div>
                                    </div>

                                    {/* State */}
                                    <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-deepcharcoal">
                                        <div className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                            State
                                        </div>
                                        <div className="text-sm font-medium text-gray-700 dark:text-white/80">
                                            {user?.customer?.state || 'N/A'}
                                        </div>
                                    </div>

                                    {/* Postal Code */}
                                    <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-deepcharcoal">
                                        <div className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                            Postal Code
                                        </div>
                                        <div className="break-words text-sm font-medium text-gray-700 dark:text-white/80">
                                            {user?.customer?.postal_code || 'N/A'}
                                        </div>
                                    </div>

                                    {/* Country */}
                                    <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-deepcharcoal">
                                        <div className="mb-2 text-xs font-medium uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
                                            Country
                                        </div>
                                        <div className="flex items-center gap-2 break-words text-sm font-semibold text-gray-700 dark:text-white/80">
                                            <span className="text-lg">
                                                {user?.customer?.country?.iso_code || 'N/A'}
                                            </span>
                                            <span>{user?.customer?.country?.name || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Full Address Display */}
                                {hasCompleteAddress && (
                                    <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-deepcharcoal">
                                        <div className="flex items-start gap-3">
                                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-600">
                                                <svg
                                                    className="h-5 w-5 text-white"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                                                    />
                                                </svg>
                                            </div>
                                            <div>
                                                <div className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                                    Complete Address
                                                </div>
                                                <div className="overflow-hidden whitespace-pre-wrap break-words break-all text-sm leading-relaxed text-gray-700 dark:text-white/80">
                                                    {user?.customer?.address_line1},{' '}
                                                    {user?.customer?.address_line2}
                                                    <br />
                                                    {user?.customer.city}, {user?.customer.state}{' '}
                                                    {user?.customer.postal_code}
                                                    <br />
                                                    {user?.customer.country?.name}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Profile Modal */}
            {isEditProfileOpen && (
                <>
                    {createPortal(
                        windowSize.width > 1024 ? (
                            // PC VERSION
                            <div className="fixed inset-0 z-50 flex items-center justify-center">
                                {/* Backdrop */}
                                <div
                                    className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
                                    onClick={() => setIsEditProfileOpen(false)}
                                />

                                {/* Modal Card */}
                                <div className="relative z-10 w-full max-w-2xl rounded-2xl bg-white/95 p-8 shadow-2xl dark:bg-deepcharcoal dark:text-white/80">
                                    {/* Header */}
                                    <div className="flex items-center justify-between border-b border-gray-200 pb-4 dark:border-gray-700">
                                        <h2 className="text-xl font-semibold tracking-tight text-gray-700 dark:text-white/80">
                                            Edit Profile
                                        </h2>
                                    </div>

                                    {/* Content */}
                                    <div className="mt-6 max-h-[70vh] overflow-y-auto pr-2">
                                        <form
                                            onSubmit={handleEditProfileSubmit}
                                            className="mb-10 space-y-5"
                                        >
                                            {/* Name */}
                                            <div>
                                                <Input
                                                    Id={'name'}
                                                    InputName={'Name'}
                                                    Error={UpdateProfileErrors.name}
                                                    Name={'name'}
                                                    Placeholder={'Enter Full Name'}
                                                    Type={'text'}
                                                    Value={profileData.name}
                                                    Action={(e) =>
                                                        setProfileData('name', e.target.value)
                                                    }
                                                    Required={true}
                                                />
                                            </div>

                                            {/* Email */}
                                            <div>
                                                <Input
                                                    Id={'email'}
                                                    InputName={'Email'}
                                                    Error={UpdateProfileErrors.email}
                                                    Name={'email'}
                                                    Placeholder={'Enter Email'}
                                                    Type={'email'}
                                                    Value={profileData.email}
                                                    Action={(e) =>
                                                        setProfileData('email', e.target.value)
                                                    }
                                                    Required={true}
                                                />
                                            </div>

                                            {/* Phone */}
                                            <div>
                                                <Input
                                                    Id={'phone'}
                                                    InputName={'Phone'}
                                                    Error={UpdateProfileErrors.phone}
                                                    Name={'phone'}
                                                    Placeholder={'Enter Phone'}
                                                    Type={'text'}
                                                    Value={profileData.phone}
                                                    Action={(e) =>
                                                        setProfileData('phone', e.target.value)
                                                    }
                                                    Required={true}
                                                />
                                            </div>

                                            <div>
                                                <SelectInput
                                                    InputName={'Country'}
                                                    Id={'country_id'}
                                                    Name={'country_id'}
                                                    Value={profileData.country_id}
                                                    Required={true}
                                                    Action={(value) =>
                                                        setProfileData('country_id', value)
                                                    }
                                                    items={countries}
                                                    itemKey={'name'}
                                                    Error={UpdateProfileErrors.country_id}
                                                    Placeholder={'Select Country'}
                                                />
                                            </div>

                                            {/* Address Line 1 */}
                                            <div>
                                                <Textarea
                                                    InputName={'Address 1'}
                                                    Id={'address_1'}
                                                    Name={'address_1'}
                                                    Error={UpdateProfileErrors.address_line1}
                                                    Value={profileData.address_line1}
                                                    Required={true}
                                                    Action={(e) =>
                                                        setProfileData(
                                                            'address_line1',
                                                            e.target.value,
                                                        )
                                                    }
                                                    Rows={3}
                                                />
                                            </div>

                                            {/* Address Line 2 */}
                                            <div>
                                                <Textarea
                                                    InputName={'Address 2'}
                                                    Id={'address_2'}
                                                    Name={'address_2'}
                                                    Error={UpdateProfileErrors.address_line2}
                                                    Value={profileData.address_line2}
                                                    Required={false}
                                                    Action={(e) =>
                                                        setProfileData(
                                                            'address_line2',
                                                            e.target.value,
                                                        )
                                                    }
                                                    Rows={3}
                                                />
                                            </div>

                                            {/* City and State */}
                                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                                <div>
                                                    <Input
                                                        Id={'City'}
                                                        InputName={'City'}
                                                        Error={UpdateProfileErrors.city}
                                                        Name={'city'}
                                                        Placeholder={'Enter City'}
                                                        Type={'text'}
                                                        Value={profileData.city}
                                                        Action={(e) =>
                                                            setProfileData('city', e.target.value)
                                                        }
                                                        Required={true}
                                                    />
                                                </div>

                                                <div>
                                                    <Input
                                                        Id={'state'}
                                                        InputName={'State'}
                                                        Error={UpdateProfileErrors.state}
                                                        Name={'state'}
                                                        Placeholder={'Enter State'}
                                                        Type={'text'}
                                                        Value={profileData.state}
                                                        Action={(e) =>
                                                            setProfileData('state', e.target.value)
                                                        }
                                                        Required={true}
                                                    />
                                                </div>
                                            </div>

                                            {/* Postal Code and Country ID */}
                                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                                <div>
                                                    <Input
                                                        Id={'postal_code'}
                                                        InputName={'Postal Code'}
                                                        Error={UpdateProfileErrors.postal_code}
                                                        Name={'postal_code'}
                                                        Placeholder={'Enter Postal Code'}
                                                        Type={'text'}
                                                        Value={profileData.postal_code}
                                                        Action={(e) =>
                                                            setProfileData(
                                                                'postal_code',
                                                                e.target.value,
                                                            )
                                                        }
                                                        Required={true}
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-end gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => setIsEditProfileOpen(false)}
                                                    className="h-[50px] w-[180px] rounded-xl bg-gray-200 font-medium text-gray-700 transition-all hover:bg-gray-200/80 dark:bg-gray-700 dark:text-white/80 dark:hover:bg-gray-600"
                                                >
                                                    Cancel
                                                </button>

                                                <button
                                                    type="submit"
                                                    disabled={
                                                        UpdateProfileProcessing ||
                                                        isProfileUpdateButtonDisabled
                                                    }
                                                    className={`flex h-[50px] w-[180px] items-center justify-center gap-2 rounded-xl bg-indigo-600 font-medium text-white transition-all hover:bg-indigo-500 ${(UpdateProfileProcessing || isProfileUpdateButtonDisabled) && 'cursor-not-allowed opacity-25 dark:opacity-40'}`}
                                                >
                                                    {UpdateProfileProcessing && (
                                                        <Spinner customSize={'size-5'} />
                                                    )}
                                                    Save Changes
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            // MOBILE VERSION
                            <div className="fixed inset-0 z-50 bg-black">
                                {/* Backdrop */}
                                <div className="absolute inset-0 bg-black/70"></div>

                                {/* Fullscreen slide-over */}
                                <div className="relative z-10 flex h-[100dvh] w-full flex-col overflow-y-auto bg-white text-black dark:bg-deepcharcoal dark:text-white/80">
                                    {/* Top Bar */}
                                    <div className="relative flex items-center border-b border-gray-200 px-4 py-3 dark:border-gray-800">
                                        <h2 className="mx-auto text-lg font-semibold tracking-tight text-gray-800 dark:text-white/80">
                                            Edit Profile
                                        </h2>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 space-y-6 p-4">
                                        <form
                                            onSubmit={handleEditProfileSubmit}
                                            className="mb-24 space-y-5"
                                        >
                                            {/* Name */}
                                            <div>
                                                <Input
                                                    Id={'name'}
                                                    InputName={'Name'}
                                                    Error={UpdateProfileErrors.name}
                                                    Name={'name'}
                                                    Placeholder={'Enter Full Name'}
                                                    Type={'text'}
                                                    Value={profileData.name}
                                                    Action={(e) =>
                                                        setProfileData('name', e.target.value)
                                                    }
                                                    Required={true}
                                                />
                                            </div>

                                            {/* Email */}
                                            <div>
                                                <Input
                                                    Id={'email'}
                                                    InputName={'Email'}
                                                    Error={UpdateProfileErrors.email}
                                                    Name={'email'}
                                                    Placeholder={'Enter Email'}
                                                    Type={'email'}
                                                    Value={profileData.email}
                                                    Action={(e) =>
                                                        setProfileData('email', e.target.value)
                                                    }
                                                    Required={true}
                                                />
                                            </div>

                                            {/* Phone */}
                                            <div>
                                                <Input
                                                    Id={'phone'}
                                                    InputName={'Phone'}
                                                    Error={UpdateProfileErrors.phone}
                                                    Name={'phone'}
                                                    Placeholder={'Enter Phone'}
                                                    Type={'text'}
                                                    Value={profileData.phone}
                                                    Action={(e) =>
                                                        setProfileData('phone', e.target.value)
                                                    }
                                                    Required={true}
                                                />
                                            </div>

                                            <div>
                                                <SelectInput
                                                    InputName={'Country'}
                                                    Id={'country_id'}
                                                    Name={'country_id'}
                                                    Value={profileData.country_id}
                                                    Required={true}
                                                    Action={(value) =>
                                                        setProfileData('country_id', value)
                                                    }
                                                    items={countries}
                                                    itemKey={'name'}
                                                    Error={UpdateProfileErrors.country_id}
                                                    Placeholder={'Select Country'}
                                                />
                                            </div>

                                            {/* Address Line 1 */}
                                            <div>
                                                <Textarea
                                                    InputName={'Address 1'}
                                                    Id={'address_1'}
                                                    Name={'address_1'}
                                                    Error={UpdateProfileErrors.address_line1}
                                                    Value={profileData.address_line1}
                                                    Required={true}
                                                    Action={(e) =>
                                                        setProfileData(
                                                            'address_line1',
                                                            e.target.value,
                                                        )
                                                    }
                                                    Rows={3}
                                                />
                                            </div>

                                            {/* Address Line 2 */}
                                            <div>
                                                <Textarea
                                                    InputName={'Address 2'}
                                                    Id={'address_2'}
                                                    Name={'address_2'}
                                                    Error={UpdateProfileErrors.address_line2}
                                                    Value={profileData.address_line2}
                                                    Required={false}
                                                    Action={(e) =>
                                                        setProfileData(
                                                            'address_line2',
                                                            e.target.value,
                                                        )
                                                    }
                                                    Rows={3}
                                                />
                                            </div>

                                            {/* City and State */}
                                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                                <div>
                                                    <Input
                                                        Id={'City'}
                                                        InputName={'City'}
                                                        Error={UpdateProfileErrors.city}
                                                        Name={'city'}
                                                        Placeholder={'Enter City'}
                                                        Type={'text'}
                                                        Value={profileData.city}
                                                        Action={(e) =>
                                                            setProfileData('city', e.target.value)
                                                        }
                                                        Required={true}
                                                    />
                                                </div>

                                                <div>
                                                    <Input
                                                        Id={'state'}
                                                        InputName={'State'}
                                                        Error={UpdateProfileErrors.state}
                                                        Name={'state'}
                                                        Placeholder={'Enter State'}
                                                        Type={'text'}
                                                        Value={profileData.state}
                                                        Action={(e) =>
                                                            setProfileData('state', e.target.value)
                                                        }
                                                        Required={true}
                                                    />
                                                </div>
                                            </div>

                                            {/* Postal Code and Country ID */}
                                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                                <div>
                                                    <Input
                                                        Id={'postal_code'}
                                                        InputName={'Postal Code'}
                                                        Error={UpdateProfileErrors.postal_code}
                                                        Name={'postal_code'}
                                                        Placeholder={'Enter Postal Code'}
                                                        Type={'text'}
                                                        Value={profileData.postal_code}
                                                        Action={(e) =>
                                                            setProfileData(
                                                                'postal_code',
                                                                e.target.value,
                                                            )
                                                        }
                                                        Required={true}
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-end gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => setIsEditProfileOpen(false)}
                                                    className="h-[50px] w-[180px] rounded-xl bg-gray-200 font-medium text-gray-700 transition-all hover:bg-gray-200/80 dark:bg-gray-700 dark:text-white/80 dark:hover:bg-gray-600"
                                                >
                                                    Cancel
                                                </button>

                                                <button
                                                    type="submit"
                                                    disabled={
                                                        UpdateProfileProcessing ||
                                                        isProfileUpdateButtonDisabled
                                                    }
                                                    className={`flex h-[50px] w-[180px] items-center justify-center gap-2 rounded-xl bg-indigo-600 font-medium text-white transition-all hover:bg-indigo-500 ${(UpdateProfileProcessing || isProfileUpdateButtonDisabled) && 'cursor-not-allowed opacity-25 dark:opacity-40'}`}
                                                >
                                                    {UpdateProfileProcessing && (
                                                        <Spinner customSize={'size-5'} />
                                                    )}
                                                    Save Changes
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        ),
                        document.body,
                    )}
                </>
            )}

            {/* Password Change Modal */}
            {isChangePasswordOpen && (
                <>
                    {createPortal(
                        windowSize.width > 1024 ? (
                            // PC VERSION
                            <div className="fixed inset-0 z-50 flex items-center justify-center">
                                {/* Backdrop */}
                                <div
                                    className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
                                    onClick={() => setIsChangePasswordOpen(false)}
                                />

                                {/* Modal Card */}
                                <div className="relative z-10 w-full max-w-2xl rounded-2xl bg-white/95 p-8 shadow-2xl dark:bg-deepcharcoal dark:text-white/80">
                                    {/* Header */}
                                    <div className="flex items-center justify-between border-b border-gray-200 pb-4 dark:border-gray-700">
                                        <h2 className="text-xl font-semibold tracking-tight text-gray-700 dark:text-white/80">
                                            Change Password
                                        </h2>
                                    </div>

                                    {/* Content */}
                                    <div className="mt-6 max-h-[70vh] overflow-y-auto pr-2">
                                        <form
                                            onSubmit={handleChangePasswordSubmit}
                                            className="space-y-5"
                                        >
                                            {/* Current Password */}
                                            <div>
                                                <Input
                                                    Id={'current_password'}
                                                    InputName={'Current Password'}
                                                    Error={UpdatePasswordErrors.current_password}
                                                    Name={'current_password'}
                                                    Placeholder={'Enter Current Password'}
                                                    Type={'password'}
                                                    Value={passwordData.current_password}
                                                    Action={(e) =>
                                                        setPasswordData(
                                                            'current_password',
                                                            e.target.value,
                                                        )
                                                    }
                                                    Required={true}
                                                    ShowPasswordToggle={toggleCurrentPassword}
                                                    setShowPasswordToggle={setToggleCurrentPassword}
                                                />
                                            </div>

                                            {/* Password */}
                                            <div>
                                                <Input
                                                    Id={'password'}
                                                    InputName={'Password'}
                                                    Error={UpdatePasswordErrors.password}
                                                    Name={'password'}
                                                    Placeholder={'Enter Password'}
                                                    Type={'password'}
                                                    Value={passwordData.password}
                                                    Action={(e) =>
                                                        setPasswordData('password', e.target.value)
                                                    }
                                                    Required={true}
                                                    ShowPasswordToggle={togglePassword}
                                                    setShowPasswordToggle={setTogglePassword}
                                                />
                                            </div>

                                            {/* Password Confirmation */}
                                            <div>
                                                <Input
                                                    Id={'password_confirmation'}
                                                    InputName={'Password Confirmation'}
                                                    Error={
                                                        UpdatePasswordErrors.password_confirmation
                                                    }
                                                    Name={'password_confirmation'}
                                                    Placeholder={'Enter Confirmation Password'}
                                                    Type={'password'}
                                                    Value={passwordData.password_confirmation}
                                                    Action={(e) =>
                                                        setPasswordData(
                                                            'password_confirmation',
                                                            e.target.value,
                                                        )
                                                    }
                                                    Required={true}
                                                    ShowPasswordToggle={togglePasswordConfirmation}
                                                    setShowPasswordToggle={
                                                        setTogglePasswordConfirmation
                                                    }
                                                />
                                            </div>

                                            <div className="flex items-center justify-end gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => setIsChangePasswordOpen(false)}
                                                    className="h-[50px] w-[180px] rounded-xl bg-gray-200 font-medium text-gray-700 transition-all hover:bg-gray-200/80 dark:bg-gray-700 dark:text-white/80 dark:hover:bg-gray-600"
                                                >
                                                    Cancel
                                                </button>

                                                <button
                                                    type="submit"
                                                    disabled={
                                                        UpdatePasswordProcessing ||
                                                        isPasswordChangeButtonDisabled
                                                    }
                                                    className={`flex h-[50px] w-[180px] items-center justify-center gap-2 rounded-xl bg-indigo-600 font-medium text-white transition-all hover:bg-indigo-500 ${(UpdatePasswordProcessing || isPasswordChangeButtonDisabled) && 'cursor-not-allowed opacity-25 dark:opacity-40'}`}
                                                >
                                                    {UpdatePasswordProcessing && (
                                                        <Spinner customSize={'size-5'} />
                                                    )}
                                                    Change Password
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            // MOBILE VERSION
                            <div className="fixed inset-0 z-50 bg-black">
                                {/* Backdrop */}
                                <div className="absolute inset-0 bg-black/70"></div>

                                {/* Fullscreen slide-over */}
                                <div className="relative z-10 flex h-[100dvh] w-full flex-col overflow-y-auto bg-white text-black dark:bg-deepcharcoal dark:text-white/80">
                                    {/* Top Bar */}
                                    <div className="relative flex items-center border-b border-gray-200 px-4 py-3 dark:border-gray-800">
                                        <h2 className="mx-auto text-lg font-semibold tracking-tight text-gray-800 dark:text-white/80">
                                            Change Password
                                        </h2>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 space-y-6 p-4">
                                        <form
                                            onSubmit={handleChangePasswordSubmit}
                                            className="mb-24 space-y-5"
                                        >
                                            {/* Current Password */}
                                            <div>
                                                <Input
                                                    Id={'current_password'}
                                                    InputName={'Current Password'}
                                                    Error={UpdatePasswordErrors.current_password}
                                                    Name={'current_password'}
                                                    Placeholder={'Enter Current Password'}
                                                    Type={'password'}
                                                    Value={passwordData.current_password}
                                                    Action={(e) =>
                                                        setPasswordData(
                                                            'current_password',
                                                            e.target.value,
                                                        )
                                                    }
                                                    Required={true}
                                                />
                                            </div>

                                            {/* Password */}
                                            <div>
                                                <Input
                                                    Id={'password'}
                                                    InputName={'Password'}
                                                    Error={UpdatePasswordErrors.password}
                                                    Name={'password'}
                                                    Placeholder={'Enter Password'}
                                                    Type={'password'}
                                                    Value={passwordData.password}
                                                    Action={(e) =>
                                                        setPasswordData('password', e.target.value)
                                                    }
                                                    Required={true}
                                                />
                                            </div>

                                            {/* Password Confirmation */}
                                            <div>
                                                <Input
                                                    Id={'password_confirmation'}
                                                    InputName={'Password Confirmation'}
                                                    Error={
                                                        UpdatePasswordErrors.password_confirmation
                                                    }
                                                    Name={'password_confirmation'}
                                                    Placeholder={'Enter Confirmation Password'}
                                                    Type={'password'}
                                                    Value={passwordData.password_confirmation}
                                                    Action={(e) =>
                                                        setPasswordData(
                                                            'password_confirmation',
                                                            e.target.value,
                                                        )
                                                    }
                                                    Required={true}
                                                />
                                            </div>

                                            <div className="flex items-center justify-end gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => setIsChangePasswordOpen(false)}
                                                    className="h-[50px] w-[180px] rounded-xl bg-gray-200 font-medium text-gray-700 transition-all hover:bg-gray-200/80 dark:bg-gray-700 dark:text-white/80 dark:hover:bg-gray-600"
                                                >
                                                    Cancel
                                                </button>

                                                <button
                                                    type="submit"
                                                    disabled={
                                                        UpdatePasswordProcessing ||
                                                        isPasswordChangeButtonDisabled
                                                    }
                                                    className={`flex h-[50px] w-[180px] items-center justify-center gap-2 rounded-xl bg-indigo-600 font-medium text-white transition-all hover:bg-indigo-500 ${(UpdatePasswordProcessing || isPasswordChangeButtonDisabled) && 'cursor-not-allowed opacity-25 dark:opacity-40'}`}
                                                >
                                                    {UpdatePasswordProcessing && (
                                                        <Spinner customSize={'size-5'} />
                                                    )}
                                                    Change Password
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        ),
                        document.body,
                    )}
                </>
            )}
        </MainLayout>
    );
};

export default Index;
