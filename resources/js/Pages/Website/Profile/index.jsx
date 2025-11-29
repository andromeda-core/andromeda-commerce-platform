import Input from '@/Components/Input';
import SelectInput from '@/Components/SelectInput';
import Spinner from '@/Components/Spinner';
import Textarea from '@/Components/Textarea';
import Toast from '@/Components/Toast';
import useWindowSize from '@/Hooks/useWindowSize';
import MainLayout from '@/Layouts/Website/MainLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
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
                    onClosed={(type) => {
                        if (type === 'info') {
                            setInfoMessage(null);
                            setShowInfoMessage(false);
                        }
                        if (type === 'error') {
                            setErrorMessage(null);
                            setShowErrorMessage(false);
                        }
                        if (type === 'success') {
                            setSuccessMessage(null);
                            setShowSuccessMessage(false);
                        }
                    }}
                />
            )}

            <div className={`min-h-screen ${windowSize.width < 1024 ? 'mb-20' : ''}`}>
                <div className="mx-auto max-w-8xl sm:px-6 lg:px-8">
                    {/* Header Section with Points */}
                    <div className="relative p-8 mb-8 overflow-hidden bg-white border border-gray-200 shadow-lg rounded-3xl dark:border-gray-700 dark:bg-deepcharcoal sm:p-12">
                        <div className="relative z-10 flex flex-col items-center justify-between gap-6 sm:flex-row sm:items-start">
                            <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
                                {/* Avatar */}
                                <div className="relative">
                                    <div className="flex items-center justify-center w-24 h-24 overflow-hidden border-2 rounded-full backdrop-blur-sm dark:border-gray-700 dark:bg-deepcharcoal sm:h-32 sm:w-32">
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
                                    {user?.points ?? 0}
                                </div>
                                <div className="text-xs text-gray-700 dark:text-white/80">
                                    pts available
                                </div>
                            </div>
                        </div>

                        {/* Decorative Elements */}
                        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 rounded-full h-96 w-96 bg-white/5 blur-3xl"></div>
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* Personal Information Card */}
                        <div className="overflow-hidden bg-white border border-gray-200 shadow-lg rounded-2xl dark:border-gray-700 dark:bg-deepcharcoal lg:col-span-2">
                            <div className="px-6 py-4 bg-white border-b border-gray-200 dark:border-gray-700 dark:bg-deepcharcoal dark:from-gray-700">
                                <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-700 dark:text-white/80">
                                    <svg
                                        className="w-5 h-5"
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
                            <div className="p-6 space-y-4">
                                {/* Email */}
                                <div className="flex items-start gap-4 p-4 transition-colors bg-white border border-gray-200 rounded-xl dark:border-gray-700 dark:bg-deepcharcoal">
                                    <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-lg dark:bg-indigo-900/30">
                                        <svg
                                            className="w-5 h-5 text-indigo-600 dark:text-indigo-400"
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
                                    <div className="flex-1 min-w-0">
                                        <div className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                                            Email Address
                                        </div>
                                        <div className="text-sm font-medium text-gray-700 truncate dark:text-white/80">
                                            {user?.email || 'N/A'}
                                        </div>
                                    </div>
                                </div>

                                {/* Phone */}
                                <div className="flex items-start gap-4 p-4 transition-colors bg-white border border-gray-200 rounded-xl dark:border-gray-700 dark:bg-deepcharcoal">
                                    <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 bg-purple-100 rounded-lg dark:bg-purple-900/30">
                                        <svg
                                            className="w-5 h-5 text-purple-600 dark:text-purple-400"
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
                                    <div className="flex-1 min-w-0">
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
                        <div className="overflow-hidden bg-white border border-gray-200 shadow-lg rounded-2xl dark:border-gray-700 dark:bg-deepcharcoal">
                            <div className="px-6 py-4 bg-white border-b border-gray-200 dark:border-gray-700 dark:bg-deepcharcoal">
                                <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-700 dark:text-white/80">
                                    <svg
                                        className="w-5 h-5"
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
                            <div className="p-6 space-y-3">
                                <button
                                    onClick={() => setIsEditProfileOpen(true)}
                                    className="flex items-center justify-center w-full gap-2 px-4 py-3 font-medium text-white transition-all bg-indigo-600 shadow-md rounded-xl hover:bg-indigo-500 hover:shadow-lg"
                                >
                                    <svg
                                        className="w-5 h-5"
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

                                <button
                                    onClick={() => setIsChangePasswordOpen(true)}
                                    className="flex items-center justify-center w-full gap-2 px-4 py-3 font-medium text-gray-700 transition-all bg-gray-100 rounded-xl hover:bg-gray-200 dark:bg-gray-800 dark:text-white/80 dark:hover:bg-gray-700"
                                >
                                    <svg
                                        className="w-5 h-5"
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

                                <Link
                                    href={route('website.orders.index')}
                                    className="flex items-center justify-center w-full gap-2 px-4 py-3 font-medium text-gray-700 transition-all bg-gray-100 rounded-xl hover:bg-gray-200 dark:bg-gray-800 dark:text-white/80 dark:hover:bg-gray-700"
                                >
                                    <svg
                                        className="w-5 h-5"
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
                                </Link>
                            </div>
                        </div>

                        {/* Address Information Card */}
                        <div className="overflow-hidden bg-white border border-gray-200 shadow-lg rounded-2xl dark:border-gray-700 dark:bg-deepcharcoal lg:col-span-3">
                            <div className="p-4 bg-white border-b border-gray-200 dark:border-gray-700 dark:bg-deepcharcoal">
                                <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-700 dark:text-white/80">
                                    <svg
                                        className="w-5 h-5"
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
                                    <div className="p-4 bg-white border border-gray-200 rounded-xl dark:border-gray-700 dark:bg-deepcharcoal">
                                        <div className="mb-2 text-xs font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400">
                                            Address Line 1
                                        </div>
                                        <div className="text-sm font-medium text-gray-700 break-words dark:text-white/80">
                                            {user?.customer?.address_line1 || 'N/A'}
                                        </div>
                                    </div>

                                    {/* Address Line 2 */}
                                    <div className="p-4 bg-white border border-gray-200 rounded-xl dark:border-gray-700 dark:bg-deepcharcoal">
                                        <div className="mb-2 text-xs font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400">
                                            Address Line 2
                                        </div>
                                        <div className="text-sm font-medium text-gray-700 break-words dark:text-white/80">
                                            {user?.customer?.address_line2 || 'N/A'}
                                        </div>
                                    </div>

                                    {/* City */}
                                    <div className="p-4 bg-white border border-gray-200 rounded-xl dark:border-gray-700 dark:bg-deepcharcoal">
                                        <div className="mb-2 text-xs font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400">
                                            City
                                        </div>
                                        <div className="text-sm font-medium text-gray-700 break-words dark:text-white/80">
                                            {user?.customer?.city || 'N/A'}
                                        </div>
                                    </div>

                                    {/* State */}
                                    <div className="p-4 bg-white border border-gray-200 rounded-xl dark:border-gray-700 dark:bg-deepcharcoal">
                                        <div className="mb-2 text-xs font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400">
                                            State
                                        </div>
                                        <div className="text-sm font-medium text-gray-700 dark:text-white/80">
                                            {user?.customer?.state || 'N/A'}
                                        </div>
                                    </div>

                                    {/* Postal Code */}
                                    <div className="p-4 bg-white border border-gray-200 rounded-xl dark:border-gray-700 dark:bg-deepcharcoal">
                                        <div className="mb-2 text-xs font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400">
                                            Postal Code
                                        </div>
                                        <div className="text-sm font-medium text-gray-700 break-words dark:text-white/80">
                                            {user?.customer?.postal_code || 'N/A'}
                                        </div>
                                    </div>

                                    {/* Country */}
                                    <div className="p-4 bg-white border border-gray-200 rounded-xl dark:border-gray-700 dark:bg-deepcharcoal">
                                        <div className="mb-2 text-xs font-medium tracking-wide text-indigo-600 uppercase dark:text-indigo-400">
                                            Country
                                        </div>
                                        <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 break-words dark:text-white/80">
                                            <span className="text-lg">
                                                {user?.customer?.country?.iso_code || 'N/A'}
                                            </span>
                                            <span>{user?.customer?.country?.name || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Full Address Display */}
                                {hasCompleteAddress && (
                                    <div className="p-6 mt-6 bg-white border border-gray-200 rounded-xl dark:border-gray-700 dark:bg-deepcharcoal">
                                        <div className="flex items-start gap-3">
                                            <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 bg-indigo-600 rounded-lg">
                                                <svg
                                                    className="w-5 h-5 text-white"
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
                                                <div className="mb-2 text-xs font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400">
                                                    Complete Address
                                                </div>
                                                <div className="overflow-hidden text-sm leading-relaxed text-gray-700 break-words break-all whitespace-pre-wrap dark:text-white/80">
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
                                    className="fixed inset-0 transition-opacity duration-300 bg-black/60 backdrop-blur-sm"
                                    onClick={() => setIsEditProfileOpen(false)}
                                />

                                {/* Modal Card */}
                                <div className="relative z-10 w-full max-w-2xl p-8 shadow-2xl rounded-2xl bg-white/95 dark:bg-deepcharcoal dark:text-white/80">
                                    {/* Header */}
                                    <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
                                        <h2 className="text-xl font-semibold tracking-tight text-gray-700 dark:text-white/80">
                                            Edit Profile
                                        </h2>


                                        <button
                                            onClick={() => {
                                                setIsEditProfileOpen(false)
                                            }}
                                            className="absolute z-50 p-2 text-gray-600 transition-colors rounded-full top-6 right-4 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-zinc-800"
                                            aria-label="Close modal"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth={2}
                                                stroke="currentColor"
                                                className="w-6 h-6"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M6 18L18 6M6 6l12 12"
                                                />
                                            </svg>
                                        </button>
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
                                    <div className="flex items-center justify-center px-4 py-3 border-b border-gray-200 dark:border-gray-800">
                                        <button
                                            onClick={() => setIsEditProfileOpen(false)}
                                            className="absolute p-1 rounded-full left-4 hover:bg-gray-100 dark:hover:bg-gray-800"
                                        >
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
                                                    d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
                                                />
                                            </svg>
                                        </button>

                                        <h2 className="mx-10 text-xl font-semibold tracking-tight text-gray-800 dark:text-gray-100">
                                            Edit Profile
                                        </h2>
                                    </div>


                                    {/* Content */}
                                    <div className="flex-1 p-4 space-y-6">
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
                                    className="fixed inset-0 transition-opacity duration-300 bg-black/60 backdrop-blur-sm"
                                    onClick={() => setIsChangePasswordOpen(false)}
                                />

                                {/* Modal Card */}
                                <div className="relative z-10 w-full max-w-2xl p-8 shadow-2xl rounded-2xl bg-white/95 dark:bg-deepcharcoal dark:text-white/80">
                                    {/* Header */}
                                    <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
                                        <h2 className="text-xl font-semibold tracking-tight text-gray-700 dark:text-white/80">
                                            Change Password
                                        </h2>



                                        <button
                                            onClick={() => {
                                                setIsChangePasswordOpen(false)
                                            }}
                                            className="absolute z-50 p-2 text-gray-600 transition-colors rounded-full top-6 right-4 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-zinc-800"
                                            aria-label="Close modal"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth={2}
                                                stroke="currentColor"
                                                className="w-6 h-6"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M6 18L18 6M6 6l12 12"
                                                />
                                            </svg>
                                        </button>
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
                                    <div className="flex items-center justify-center px-4 py-3 border-b border-gray-200 dark:border-gray-800">
                                        <button
                                            onClick={() => setIsChangePasswordOpen(false)}
                                            className="absolute p-1 rounded-full left-4 hover:bg-gray-100 dark:hover:bg-gray-800"
                                        >
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
                                                    d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
                                                />
                                            </svg>
                                        </button>

                                        <h2 className="mx-10 text-xl font-semibold tracking-tight text-gray-800 dark:text-gray-100">
                                            Change Password
                                        </h2>
                                    </div>


                                    {/* Content */}
                                    <div className="flex-1 p-4 space-y-6">
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
