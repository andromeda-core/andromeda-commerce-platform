import WebInput from '@/Components/WebInput';
import Spinner from '@/Components/Spinner';
import WebTextArea from '@/Components/WebTextArea';
import Toast from '@/Components/Toast';
import WebSelectInput from '@/Components/WebSelectInput';
import useDarkMode from '@/Hooks/useDarkMode';
import useWindowSize from '@/Hooks/useWindowSize';
import MainLayout from '@/Layouts/Website/MainLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Cropper from 'react-easy-crop';
import { useTranslation } from '@/Hooks/useTranslation';

const Index = ({ user, countries }) => {
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

    const [isProfileUploading, setIsProfileUploading] = useState(false);
    const [profileImage, setProfileImage] = useState(null);
    const [showCropper, setShowCropper] = useState(false);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const isDarkMode = useDarkMode();
    const fileInputRef = useRef(null);



    const { __ } = useTranslation();

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
                    setErrorMessage(__('Something went wrong. Please check all fields and try again.'));
                }
            },
        });
    };

    // Password Change Request
    const handleChangePasswordSubmit = (e) => {
        e.preventDefault();

        if (passwordData.password !== passwordData.password_confirmation) {
            setInfoMessage(__('New Password and Confirm Password do not match.'));
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
                    setErrorMessage(__('Something went wrong while changing password.'));
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
        } else if (showCropper) {
            window.history.pushState({}, '', window.location.pathname);
            url.searchParams.set('modal', 'crop-image');
        } else {
            url.searchParams.delete('modal');
        }

        window.history.replaceState({}, '', url);
    }, [isEditProfileOpen, isChangePasswordOpen, showCropper]);

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

            if (showCropper) {
                setShowCropper(false);
                setProfileImage(null);
                setCroppedAreaPixels(null);
                setCrop({ x: 0, y: 0 });
                setZoom(1);
                return;
            }
        };

        const preventInertiaNavigation = (event) => {
            const pathname = event.detail?.visit?.url?.pathname || '';

            if (
                pathname === 'profile/details/update/' + user?.id ||
                pathname === 'profile/change-password' ||
                pathname === 'profile/upload-profile'
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
    }, [isEditProfileOpen, isChangePasswordOpen, showCropper]);

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

    function InfoBox({ label, value }) {
        return (
            <div className="px-4 py-3 break-words rounded-md bg-surface-1-light dark:bg-surface-1-dark">
                <p className="text-xs font-medium text-main-text-light dark:text-main-text-dark">{label}</p>
                <p className="mt-1 text-sm font-normal text-sub-text-light dark:text-sub-text-dark">{value}</p>
            </div>
        );
    }

    // Zoom Handling For react Easy Crop
    const handleZoomChange = (value) => {
        const min = 1;
        const max = 3;
        const step = 0.1;

        const clamped = Math.min(max, Math.max(min, value));
        setZoom(Math.round(clamped / step) * step);
    };

    // Get Cropped Image
    const getCroppedImage = async (imageSrc, cropPixels) => {
        const image = new Image();
        image.src = imageSrc;
        await new Promise((resolve) => (image.onload = resolve));

        const canvas = document.createElement('canvas');
        canvas.width = cropPixels.width;
        canvas.height = cropPixels.height;

        const ctx = canvas.getContext('2d');

        ctx.drawImage(
            image,
            cropPixels.x,
            cropPixels.y,
            cropPixels.width,
            cropPixels.height,
            0,
            0,
            cropPixels.width,
            cropPixels.height,
        );

        return new Promise((resolve) => {
            canvas.toBlob((blob) => resolve(blob), 'image/jpeg');
        });
    };

    const handleCropSaveAndUpload = async () => {
        const croppedBlob = await getCroppedImage(profileImage, croppedAreaPixels);

        const previewUrl = URL.createObjectURL(croppedBlob);

        // show preview in avatar
        setProfileImage(previewUrl);
        setIsProfileUploading(true);

        setShowCropper(false);

        setCroppedAreaPixels(null);
        setCrop({ x: 0, y: 0 });
        setZoom(1);

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }

        const formData = new FormData();
        formData.append('profile', croppedBlob);

        try {
            await axios
                .put(route('website.profile.upload-profile-picture'), formData)
                .then((response) => {
                    const data = response.data;

                    if (data.status === true) {
                        setSuccessMessage(data.message);
                        setProfileImage(data.profile);
                        setShowSuccessMessage(true);
                    } else {
                        setErrorMessage(data.message);
                        setShowErrorMessage(true);
                    }
                })
                .finally(() => {
                    setIsProfileUploading(false);
                });
        } catch (error) {
            console.error('Upload error:', error);
        }
    };

    return (
        <MainLayout>
            <Head title={__("Personal Information", true)} />

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


            <div className="sm:px-6 lg:px-8">
                <div className={`px-6  mx-auto ${windowSize.width > 1024 ? 'pb-0' : 'pb-24'} lg:max-w-6xl sm:max-w-3xl`}>

                    <div className="my-10">
                        <h1 className="text-2xl font-semibold text-main-text-light dark:text-main-text-dark">
                            {__('Account Settings')}
                        </h1>
                        <p className="mt-1 text-sm text-sub-text-light dark:sub-text-dark">
                            {__('Manage your profile, contact details, and security in one place.')}
                        </p>
                    </div>

                    {/* Avatar */}
                    <div className="flex items-start gap-6 ">
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="relative flex items-center justify-center w-20 h-20 text-center rounded-full cursor-pointer bg-surface-2-light dark:bg-surface-2-dark"
                        >
                            {!user?.profile && !profileImage && (
                                <span className="text-2xl font-semibold text-main-text-light dark:text-main-text-dark">
                                    {user?.avatar}
                                </span>
                            )}

                            {(user?.profile || profileImage) && (
                                <img
                                    src={profileImage || user?.profile}
                                    alt="Profile"
                                    className="object-cover object-center w-full h-full rounded-full"
                                />
                            )}

                            {/* Uploading Overlay */}
                            {isProfileUploading && (
                                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/80">
                                    <Spinner />
                                </div>
                            )}

                            {/* Hidden file input */}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        const imageUrl = URL.createObjectURL(file);
                                        setProfileImage(imageUrl);
                                        setShowCropper(true);
                                    }
                                }}
                            />
                        </div>
                    </div>
                    {/* Profile Row */}
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-12">

                        <div className="flex flex-col items-start mt-4">
                            <h3 className="text-lg font-semibold text-main-text-light dark:text-main-text-dark">
                                {user?.name || 'User'}
                            </h3>
                            <div >
                                <div className="flex flex-wrap items-center justify-between gap-1 mt-3 font-medium">
                                    <p className="px-2 py-1 mt-1 text-xs rounded-full bg-surface-1-light dark:bg-surface-1-dark text-main-text-light dark:text-main-text-dark">

                                        {user?.customer?.orders_count || 0} {__('Orders')}
                                    </p>

                                    <p className="px-2 py-1 mt-1 text-xs rounded-full bg-surface-1-light dark:bg-surface-1-dark text-main-text-light dark:text-main-text-dark">

                                        {user?.points || 0} {__('Points')}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => setIsChangePasswordOpen(true)}
                                className="px-2 py-2 text-sm font-semibold rounded-md lg:px-10 lg:text-md text-main-text-dark dark:text-main-text-light bg-main-text-light hover:bg-main-text-light/80 dark:bg-main-text-dark dark:hover:bg-main-text-dark/80"
                            >
                                {__('Change Password')}
                            </button>
                            <button
                                onClick={() => {
                                    setIsEditProfileOpen(true);

                                }}
                                className="px-2 py-2 text-sm font-semibold rounded-md lg:px-10 lg:text-md text-main-text-dark dark:text-main-text-light bg-main-text-light hover:bg-main-text-light/80 dark:bg-main-text-dark dark:hover:bg-main-text-dark/80"
                            >
                                {__('Edit Profile')}
                            </button>
                        </div>
                    </div>

                    {/* Personal Information */}
                    <div className="mb-10">
                        <h3 className="mb-4 font-semibold text-md text-main-text-light dark:text-main-text-dark">
                            {__('Personal Information')}
                        </h3>

                        <div className="grid grid-cols-2 gap-4">
                            <InfoBox label={__("Email Address")} value={user?.email || 'N/A'} />
                            <InfoBox label={("Phone Number")} value={user?.phone || 'N/A'} />
                        </div>
                    </div>

                    {/* Address Information */}
                    <div>
                        <h3 className="mb-4 text-sm font-semibold text-black dark:text-white">
                            {__('Address Information')}
                        </h3>

                        <div className="grid grid-cols-2 gap-4">
                            <InfoBox
                                label={__("Address Line 1")}
                                value={user?.customer?.address_line1 || 'N/A'}
                            />
                            <InfoBox
                                label={__("Address Line 2")}
                                value={user?.customer?.address_line2 || 'N/A'}
                            />
                            <InfoBox label="State" value={user?.customer?.state || 'N/A'} />
                            <InfoBox
                                label={__("Postal Code")}
                                value={user?.customer?.postal_code || 'N/A'}
                            />
                            <InfoBox label={__("City")} value={user?.customer?.city || 'N/A'} />
                            <InfoBox
                                label={__("Country")}
                                value={user?.customer?.country?.name || 'N/A'}
                            />
                        </div>
                    </div>


                    {/* Manage Shipping Address */}
                    <div className='my-4'>
                        <div className="flex items-center gap-1">
                            <Link href={route('website.shipping-addresses.index')} className='text-sm font-semibold lg:text-md'>
                                {__('Manage Shipping Address')}
                            </Link>

                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3 mt-1">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                            </svg>
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
                                    className="fixed inset-0 transition-opacity duration-300 bg-black/30 backdrop-blur-sm"
                                    onClick={() => setIsEditProfileOpen(false)}
                                />

                                {/* Modal Card */}
                                <div className="relative z-10 w-full max-w-4xl p-12 pb-1 border rounded-md border-surface-1-light dark:border-surface-3-dark bg-backgroundLight dark:bg-surface-1-dark dark:text-main-text-dark text-main-text-light">
                                    {/* Header */}
                                    <div className="flex items-center justify-between pb-4">
                                        <h2 className="text-xl font-semibold tracking-tight text-main-text-light dark:text-main-text-dark">
                                            {__('Edit Profile')}
                                        </h2>
                                    </div>

                                    {/* Content */}
                                    <div className="mt-6 max-h-[80vh] overflow-y-auto pr-2">
                                        <form
                                            onSubmit={handleEditProfileSubmit}
                                            className="mb-10 space-y-5"
                                        >

                                            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

                                                {/* Name */}
                                                <div>
                                                    <WebInput
                                                        Id={'name'}
                                                        InputName={__('Name')}
                                                        Error={UpdateProfileErrors.name}
                                                        Name={'name'}
                                                        Placeholder={__('Enter Full Name')}
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
                                                    <WebInput
                                                        Id={'email'}
                                                        InputName={__('Email')}
                                                        Error={UpdateProfileErrors.email}
                                                        Name={'email'}
                                                        Placeholder={__('Enter Email')}
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
                                                    <WebInput
                                                        Id={'phone'}
                                                        InputName={__('Phone')}
                                                        Error={UpdateProfileErrors.phone}
                                                        Name={'phone'}
                                                        Placeholder={__('Enter Phone')}
                                                        Type={'text'}
                                                        Value={profileData.phone}
                                                        Action={(e) =>
                                                            setProfileData('phone', e.target.value)
                                                        }
                                                        Required={true}
                                                    />
                                                </div>
                                                {/* Country */}
                                                <div>
                                                    <WebSelectInput
                                                        InputName={__('Country')}
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
                                                        Placeholder={__('Select Country')}
                                                        customPlaceHolder={true}
                                                    />
                                                </div>

                                                {/* Address Line 1 */}
                                                <div className='col-span-2'>
                                                    <WebTextArea
                                                        InputName={__('Address 1')}
                                                        Id={'address_1'}
                                                        Name={'address_1'}
                                                        Error={UpdateProfileErrors.address_line1}
                                                        Value={profileData.address_line1}
                                                        Required={true}
                                                        Placeholder={__('Enter Address 1')}
                                                        Action={(e) =>
                                                            setProfileData(
                                                                'address_line1',
                                                                e.target.value,
                                                            )
                                                        }
                                                        Rows={1}
                                                    />
                                                </div>

                                                {/* Address Line 2 */}
                                                <div className='col-span-2'>
                                                    <WebTextArea
                                                        InputName={__('Address 2')}
                                                        Id={'address_2'}
                                                        Name={'address_2'}
                                                        Error={UpdateProfileErrors.address_line2}
                                                        Placeholder={__('Enter Address 2')}
                                                        Value={profileData.address_line2}
                                                        Required={false}
                                                        Action={(e) =>
                                                            setProfileData(
                                                                'address_line2',
                                                                e.target.value,
                                                            )
                                                        }
                                                        Rows={1}
                                                    />
                                                </div>

                                                {/* City and State */}
                                                <div>
                                                    <WebInput
                                                        Id={'City'}
                                                        InputName={__('City')}
                                                        Error={UpdateProfileErrors.city}
                                                        Name={'city'}
                                                        Placeholder={__('Enter City')}
                                                        Type={'text'}
                                                        Value={profileData.city}
                                                        Action={(e) =>
                                                            setProfileData('city', e.target.value)
                                                        }
                                                        Required={true}
                                                    />
                                                </div>

                                                <div>
                                                    <WebInput
                                                        Id={'state'}
                                                        InputName={__('State')}
                                                        Error={UpdateProfileErrors.state}
                                                        Name={'state'}
                                                        Placeholder={__('Enter State')}
                                                        Type={'text'}
                                                        Value={profileData.state}
                                                        Action={(e) =>
                                                            setProfileData('state', e.target.value)
                                                        }
                                                        Required={true}
                                                    />
                                                </div>

                                                {/* Postal Code and Country ID */}
                                                <div>
                                                    <WebInput
                                                        Id={'postal_code'}
                                                        InputName={__('Postal Code')}
                                                        Error={UpdateProfileErrors.postal_code}
                                                        Name={'postal_code'}
                                                        Placeholder={__('Enter Postal Code')}
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
                                                    className="h-[50px] w-[180px] rounded-md bg-surface-2-light  text-main-text-light transition-all hover:bg-surface-3-light dark:hover:bg-surface-3-dark/80 dark:text-sub-text-dark dark:bg-surface-3-dark"
                                                >
                                                    {__('Cancel')}
                                                </button>

                                                <button
                                                    type="submit"
                                                    disabled={
                                                        UpdateProfileProcessing ||
                                                        isProfileUpdateButtonDisabled
                                                    }
                                                    className={`flex h-[50px] w-[180px] font-semibold text-md  items-center justify-center gap-2 rounded-md bg-main-text-light  text-main-text-dark transition-all hover:bg-main-text-light/80 dark:bg-main-text-dark dark:text-main-text-light dark:hover:bg-main-text-dark/80 ${(UpdateProfileProcessing || isProfileUpdateButtonDisabled) && 'cursor-not-allowed opacity-25 dark:opacity-40'}`}
                                                >
                                                    {UpdateProfileProcessing && (
                                                        <Spinner customSize={'size-5'} />
                                                    )}
                                                    {__('Save Changes')}
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
                                <div className="relative z-10 flex h-[100dvh] w-full flex-col overflow-y-auto bg-backgroundLight text-main-text-light dark:bg-backgroundDark border border-surface-1-light dark:border-surface-3-dark  dark:text-main-text-dark">
                                    {/* Top Bar */}
                                    <div className="flex items-center justify-center px-4 py-3">
                                        <button
                                            onClick={() => setIsEditProfileOpen(false)}
                                            className="absolute p-1 text-black rounded-full left-4 dark:text-main-text-dark"
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

                                        <h2 className="mx-10 text-xl font-semibold tracking-tight text-main-text-light dark:text-main-text-dark">
                                            {__('Edit Profile')}
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
                                                <WebInput
                                                    Id={'name'}
                                                    InputName={__('Name')}
                                                    Error={UpdateProfileErrors.name}
                                                    Name={'name'}
                                                    Placeholder={__('Enter Full Name')}
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
                                                <WebInput
                                                    Id={'email'}
                                                    InputName={__('Email')}
                                                    Error={UpdateProfileErrors.email}
                                                    Name={'email'}
                                                    Placeholder={__('Enter Email')}
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
                                                <WebInput
                                                    Id={'phone'}
                                                    InputName={__('Phone')}
                                                    Error={UpdateProfileErrors.phone}
                                                    Name={'phone'}
                                                    Placeholder={__('Enter Phone')}
                                                    Type={'text'}
                                                    Value={profileData.phone}
                                                    Action={(e) =>
                                                        setProfileData('phone', e.target.value)
                                                    }
                                                    Required={true}
                                                />
                                            </div>

                                            <div>
                                                <WebSelectInput
                                                    InputName={__('Country')}
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
                                                    Placeholder={__('Select Country')}
                                                    customPlaceHolder={true}
                                                />
                                            </div>

                                            {/* Address Line 1 */}
                                            <div>
                                                <WebTextArea
                                                    InputName={__('Address 1')}
                                                    Id={'address_1'}
                                                    Name={'address_1'}
                                                    Error={UpdateProfileErrors.address_line1}
                                                    Value={profileData.address_line1}
                                                    Placeholder={__('Enter Address 1')}
                                                    Required={true}
                                                    Action={(e) =>
                                                        setProfileData(
                                                            'address_line1',
                                                            e.target.value,
                                                        )
                                                    }
                                                    Rows={1}
                                                />
                                            </div>

                                            {/* Address Line 2 */}
                                            <div>
                                                <WebTextArea
                                                    InputName={__('Address 2')}
                                                    Id={'address_2'}
                                                    Name={'address_2'}
                                                    Error={UpdateProfileErrors.address_line2}
                                                    Value={profileData.address_line2}
                                                    Required={false}
                                                    Placeholder={__('Enter Address 2')}
                                                    Action={(e) =>
                                                        setProfileData(
                                                            'address_line2',
                                                            e.target.value,
                                                        )
                                                    }
                                                    Rows={1}
                                                />
                                            </div>

                                            {/* City and State */}
                                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                                <div>
                                                    <WebInput
                                                        Id={'City'}
                                                        InputName={__('City')}
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
                                                    <WebInput
                                                        Id={'state'}
                                                        InputName={__('State')}
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
                                                    <WebInput
                                                        Id={'postal_code'}
                                                        InputName={__('Postal Code')}
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
                                                    className="h-[50px] w-[180px] rounded-md bg-surface-2-light  text-main-text-light transition-all hover:bg-surface-3-light dark:hover:bg-surface-3-dark/80 dark:text-sub-text-dark dark:bg-surface-3-dark"
                                                >
                                                    {__('Cancel')}
                                                </button>

                                                <button
                                                    type="submit"
                                                    disabled={
                                                        UpdateProfileProcessing ||
                                                        isProfileUpdateButtonDisabled
                                                    }
                                                    className={`flex h-[50px] w-[180px] tetx-md font-semibold  items-center justify-center gap-2 rounded-md bg-black  text-white transition-all hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/80 ${(UpdateProfileProcessing || isProfileUpdateButtonDisabled) && 'cursor-not-allowed opacity-25 dark:opacity-40'}`}
                                                >
                                                    {UpdateProfileProcessing && (
                                                        <Spinner customSize={'size-5'} />
                                                    )}
                                                    {__('Save Changes')}
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
                                    className="fixed inset-0 transition-opacity duration-300 bg-black/30 backdrop-blur-sm"
                                    onClick={() => setIsChangePasswordOpen(false)}
                                />

                                {/* Modal Card */}
                                <div className="relative z-10 w-full max-w-2xl p-10 py-12 border rounded-md border-surface-1-light dark:border-surface-3-dark bg-backgroundLight dark:bg-surface-1-dark dark:text-main-text-dark">
                                    {/* Header */}
                                    <div className="flex items-center justify-between pb-4">
                                        <h2 className="text-xl font-semibold tracking-tight text-main-text-light dark:text-main-text-dark">
                                            {__('Change Password')}
                                        </h2>


                                    </div>

                                    {/* Content */}
                                    <div className="mt-6 max-h-[70vh] overflow-y-auto pr-2">
                                        <form
                                            onSubmit={handleChangePasswordSubmit}
                                            className="space-y-1"
                                        >
                                            {/* Current Password */}
                                            <div>
                                                <WebInput
                                                    Id={'current_password'}
                                                    InputName={__('Current Password')}
                                                    Error={UpdatePasswordErrors.current_password}
                                                    Name={'current_password'}
                                                    Placeholder={__('Enter Your Current Password')}
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
                                                <WebInput
                                                    Id={'password'}
                                                    InputName={__('Password')}
                                                    Error={UpdatePasswordErrors.password}
                                                    Name={'password'}
                                                    Placeholder={__('Enter Password')}
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
                                                <WebInput
                                                    Id={'password_confirmation'}
                                                    InputName={__('Password Confirmation')}
                                                    Error={
                                                        UpdatePasswordErrors.password_confirmation
                                                    }
                                                    Name={'password_confirmation'}
                                                    Placeholder={__('Re-Enter The New Password')}
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

                                            <div className="flex items-center justify-end gap-3 pt-5">
                                                <button
                                                    type="button"
                                                    onClick={() => setIsChangePasswordOpen(false)}
                                                    className="h-[50px] w-[180px] rounded-md bg-surface-2-light  text-main-text-light transition-all hover:bg-surface-3-light dark:hover:bg-surface-3-dark/80 dark:text-sub-text-dark dark:bg-surface-3-dark"
                                                >
                                                    {__('Cancel')}
                                                </button>

                                                <button
                                                    type="submit"
                                                    disabled={
                                                        UpdatePasswordProcessing ||
                                                        isPasswordChangeButtonDisabled
                                                    }
                                                    className={`flex h-[50px] w-[180px] items-center justify-center gap-2 rounded-md bg-main-text-light  text-white transition-all hover:bg-black/80 dark:bg-white dark:text-main-text-light  text-md font-semibold dark:hover:bg-white/80 ${(UpdatePasswordProcessing || isPasswordChangeButtonDisabled) && 'cursor-not-allowed opacity-25 dark:opacity-40'}`}
                                                >
                                                    {UpdatePasswordProcessing && (
                                                        <Spinner customSize={'size-5'} />
                                                    )}
                                                    {__('Change Password')}
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
                                <div className="relative z-10 flex h-[100dvh] w-full flex-col overflow-y-auto bg-backgroundLight text-main-text-light dark:bg-backgroundDark border border-surface-1-light dark:border-surface-3-dark  dark:text-main-text-dark">
                                    {/* Top Bar */}
                                    <div className="flex items-center justify-center px-4 py-3 ">
                                        <button
                                            onClick={() => setIsChangePasswordOpen(false)}
                                            className="absolute p-1 text-black rounded-full left-4 dark:text-main-text-dark"
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

                                        <h2 className="mx-10 text-xl font-semibold tracking-tight text-main-text-light dark:text-main-text-dark">
                                            {__('Change Password')}
                                        </h2>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 p-4 space-y-6">
                                        <form
                                            onSubmit={handleChangePasswordSubmit}
                                            className="mb-24 space-y-1"
                                        >
                                            {/* Current Password */}
                                            <div>
                                                <WebInput
                                                    Id={'current_password'}
                                                    InputName={__('Current Password')}
                                                    Error={UpdatePasswordErrors.current_password}
                                                    Name={'current_password'}
                                                    Placeholder={__('Enter Current Password')}
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
                                                <WebInput
                                                    Id={'password'}
                                                    InputName={__('Password')}
                                                    Error={UpdatePasswordErrors.password}
                                                    Name={'password'}
                                                    Placeholder={__('Enter Password')}
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
                                                <WebInput
                                                    Id={'password_confirmation'}
                                                    InputName={__('Password Confirmation')}
                                                    Error={
                                                        UpdatePasswordErrors.password_confirmation
                                                    }
                                                    Name={'password_confirmation'}
                                                    Placeholder={__('Re-Enter The New Password')}
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


                                            {/* Actions */}
                                            <div className="flex items-center justify-end gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => setIsChangePasswordOpen(false)}
                                                    className="h-[50px] w-[180px] rounded-md bg-surface-2-light  text-main-text-light transition-all hover:bg-surface-3-light dark:hover:bg-surface-3-dark/80 dark:text-sub-text-dark dark:bg-surface-3-dark"
                                                >
                                                    {__('Cancel')}
                                                </button>

                                                <button
                                                    type="submit"
                                                    disabled={
                                                        UpdatePasswordProcessing ||
                                                        isPasswordChangeButtonDisabled
                                                    }
                                                    className={`flex h-[50px] w-[180px] text-md font-semibold items-center justify-center gap-2 rounded-md bg-main-text-light  text-main-text-dark transition-all hover:bg-main-text-light/80 dark:bg-main-text-dark dark:text-main-text-light dark:hover:bg-main-text-dark/80 ${(UpdatePasswordProcessing || isPasswordChangeButtonDisabled) && 'cursor-not-allowed opacity-25 dark:opacity-40'}`}
                                                >
                                                    {UpdatePasswordProcessing && (
                                                        <Spinner customSize={'size-5'} />
                                                    )}
                                                    {__('Change Password')}
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

            {showCropper && (
                <>
                    {createPortal(
                        windowSize.width > 1024 ? (
                            // PC VERSION
                            <div className="fixed inset-0 z-50 flex items-center justify-center">
                                {/* Backdrop */}
                                <div
                                    className="fixed inset-0 transition-opacity duration-300 bg-black/30 backdrop-blur-sm"
                                    onClick={() => {
                                        setShowCropper(false);
                                        setProfileImage(null);
                                        setCroppedAreaPixels(null);
                                        setCrop({ x: 0, y: 0 });
                                        setZoom(1);

                                        if (fileInputRef.current) {
                                            fileInputRef.current.value = '';
                                        }
                                    }}
                                />
                                <div className="border border-surface-1-light dark:border-surface-3-dark relative z-10 max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-md bg-backgroundLight p-8  dark:bg-surface-1-dark dark:text-main-text-dark">
                                    {/* Header */}
                                    <div className="flex items-center justify-between pb-4">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-base font-semibold truncate text-main-text-light dark:text-main-text-dark sm:text-lg">
                                                {__('Crop Profile Picture')}
                                            </h3>
                                            <p className="mt-0.5 truncate text-xs text-sub-text-light dark:text-sub-text-dark sm:text-sm">
                                                {__('Adjust and position your image')}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="mt-6">
                                        {/* Crop Area */}
                                        <div className="relative w-full h-64 bg-surface-1-light xs:h-72 dark:bg-deepcharcoal sm:h-80 md:h-96">
                                            <Cropper
                                                image={profileImage}
                                                crop={crop}
                                                zoom={zoom}
                                                aspect={1}
                                                cropShape="round"
                                                showGrid={false}
                                                onCropChange={setCrop}
                                                onZoomChange={handleZoomChange}
                                                onCropComplete={(_, areaPixels) => {
                                                    setCroppedAreaPixels(areaPixels);
                                                }}
                                            />
                                        </div>

                                        {/* Controls */}
                                        <div className="py-4 space-y-3 sm:space-y-4 sm:py-5">
                                            {/* Zoom Control */}
                                            <div>
                                                <div className="flex items-center justify-between mb-2">
                                                    <label className="text-xs font-medium text-main-text-light dark:text-main-text-dark sm:text-sm">
                                                        {__('Zoom Level')}
                                                    </label>
                                                    <span className="font-mono text-xs text-main-text-light tabular-nums dark:text-main-text-dark sm:text-sm">
                                                        {Math.round(zoom * 100)}%
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-2 sm:gap-3">
                                                    {/* Zoom Out Icon */}
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        strokeWidth={1.5}
                                                        stroke="currentColor"
                                                        className="flex-shrink-0 w-4 h-4 text-black cursor-pointer accent-black dark:text-white dark:accent-white sm:h-5 sm:w-5"
                                                        onClick={() => {
                                                            if (zoom > 1) {
                                                                setZoom(zoom - 0.1);
                                                            }
                                                        }}
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607ZM13.5 10.5h-6"
                                                        />
                                                    </svg>

                                                    <input
                                                        type="range"
                                                        min={1}
                                                        max={3}
                                                        step={0.1}
                                                        value={zoom}
                                                        onChange={(e) => {
                                                            const value = parseFloat(
                                                                e.target.value,
                                                            );
                                                            setZoom(
                                                                Math.min(3, Math.max(1, value)),
                                                            );
                                                        }}
                                                        className="flex-1 h-2 rounded-lg appearance-none cursor-pointer accent-black dark:accent-white"
                                                        style={{
                                                            background: isDarkMode
                                                                ? `linear-gradient(
                                                                        to right,
                                                                        #ffffff 0%,
                                                                        #ffffff ${Math.min(100, Math.max(0, ((zoom - 1) / 2) * 100))}%,
                                                                        #404040 ${Math.min(100, Math.max(0, ((zoom - 1) / 2) * 100))}%,
                                                                        #404040 100%
                                                                    )`
                                                                : `linear-gradient(
                                                                        to right,
                                                                        #000000 0%,
                                                                        #000000 ${Math.min(100, Math.max(0, ((zoom - 1) / 2) * 100))}%,
                                                                        #e1e1e1 ${Math.min(100, Math.max(0, ((zoom - 1) / 2) * 100))}%,
                                                                        #e1e1e1 100%
                                                                    )`,
                                                        }}
                                                    />

                                                    {/* Zoom In Icon */}
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        strokeWidth={1.5}
                                                        stroke="currentColor"
                                                        className="flex-shrink-0 w-4 h-4 text-black cursor-pointer dark:text-white sm:h-5 sm:w-5"
                                                        onClick={() => {
                                                            if (zoom < 3) {
                                                                setZoom(zoom + 0.1);
                                                            }
                                                        }}
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607ZM10.5 7.5v6m3-3h-6"
                                                        />
                                                    </svg>
                                                </div>
                                            </div>

                                            {/* Helpful Tip */}
                                            <div className="flex items-center gap-2 rounded-md bg-surface-2-light dark:bg-surface-3-dark p-2.5 sm:p-3">
                                                <div className="flex-shrink-0 ">
                                                    <svg
                                                        className="h-3.5 w-3.5 text-main-text-light dark:text-main-text-dark sm:h-4 sm:w-4"
                                                        fill="currentColor"
                                                        viewBox="0 0 20 20"
                                                    >
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                </div>
                                                <p className="text-[11px] leading-relaxed text-main-text-light dark:text-main-text-dark min-[]:sm:text-xs">
                                                    {__('Drag to reposition, pinch or use slider to zoom')}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center justify-end gap-3">
                                            <button
                                                onClick={() => {
                                                    setShowCropper(false);
                                                    setProfileImage(null);
                                                    setCroppedAreaPixels(null);
                                                    setCrop({ x: 0, y: 0 });
                                                    setZoom(1);

                                                    if (fileInputRef.current) {
                                                        fileInputRef.current.value = '';
                                                    }
                                                }}
                                                className="h-[50px] w-[180px] rounded-md bg-surface-2-light  text-main-text-light transition-all hover:bg-surface-3-light dark:hover:bg-surface-3-dark/80 dark:text-sub-text-dark dark:bg-surface-3-dark"
                                            >
                                                {__('Cancel')}
                                            </button>

                                            <button
                                                onClick={handleCropSaveAndUpload}
                                                className={`flex h-[50px] w-[180px] items-center text-md font-semibold justify-center gap-2 rounded-md bg-main-text-light  text-main-text-dark transition-all hover:bg-main-text-light/80 dark:bg-main-text-dark dark:text-main-text-light  dark:hover:bg-main-text-dark/80`}
                                            >
                                                {__('Save & Upload')}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        ) : (
                            // MOBILE VERSION
                            <div className="fixed inset-0 z-50 bg-black">
                                {/* Backdrop */}
                                <div className="absolute inset-0 bg-black/70"></div>

                                {/* Fullscreen slide-over */}
                                <div className="relative z-10 flex h-[100dvh] w-full flex-col overflow-y-auto bg-backgroundLight text-main-text-light dark:bg-surface-1-dark border border-surface-1-light dark:border-surface-3-dark  dark:text-main-text-dark">
                                    {/* Top Bar */}
                                    <div className="flex items-center justify-center px-4 py-3">
                                        <button
                                            onClick={() => {
                                                setShowCropper(false);
                                                setProfileImage(null);
                                                setCroppedAreaPixels(null);
                                                setCrop({ x: 0, y: 0 });
                                                setZoom(1);

                                                if (fileInputRef.current) {
                                                    fileInputRef.current.value = '';
                                                }
                                            }}
                                            className="absolute p-1 rounded-full left-4"
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

                                        <h3 className="text-base font-semibold truncate text-main-text-light dark:text-main-text-dark sm:text-lg">
                                            {__('Crop Profile Picture')}
                                        </h3>
                                    </div>

                                    {/* Content */}
                                    <div className="pr-2 my-6 mb-820">
                                        {/* Crop Area */}
                                        <div className="relative w-full h-64 bg-gray-900 xs:h-72 dark:bg-deepcharcoal sm:h-80 md:h-96">
                                            <Cropper
                                                image={profileImage}
                                                crop={crop}
                                                zoom={zoom}
                                                aspect={1}
                                                cropShape="round"
                                                showGrid={false}
                                                onCropChange={setCrop}
                                                onZoomChange={handleZoomChange}
                                                onCropComplete={(_, areaPixels) => {
                                                    setCroppedAreaPixels(areaPixels);
                                                }}
                                            />
                                        </div>

                                        {/* Controls */}
                                        <div className="px-2 py-4 space-y-3 sm:space-y-4 sm:px-2 sm:py-5">
                                            {/* Zoom Control */}
                                            <div>
                                                <div className="flex items-center justify-between mb-2">
                                                    <label className="text-xs font-medium text-black dark:text-white sm:text-sm">
                                                        {__('Zoom Level')}
                                                    </label>
                                                    <span className="font-mono text-xs text-black tabular-nums dark:text-white sm:text-sm">
                                                        {Math.round(zoom * 100)}%
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-2 sm:gap-3">
                                                    {/* Zoom Out Icon */}
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        strokeWidth={1.5}
                                                        stroke="currentColor"
                                                        className="flex-shrink-0 w-4 h-4 text-black cursor-pointer accent-black dark:text-white dark:accent-white sm:h-5 sm:w-5"
                                                        onClick={() => {
                                                            if (zoom > 1) {
                                                                setZoom(zoom - 0.1);
                                                            }
                                                        }}
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607ZM13.5 10.5h-6"
                                                        />
                                                    </svg>

                                                    <input
                                                        type="range"
                                                        min={1}
                                                        max={3}
                                                        step={0.1}
                                                        value={zoom}
                                                        onChange={(e) => {
                                                            const value = parseFloat(
                                                                e.target.value,
                                                            );
                                                            setZoom(
                                                                Math.min(3, Math.max(1, value)),
                                                            );
                                                        }}
                                                        className="flex-1 h-2 rounded-lg appearance-none cursor-pointer accent-black dark:accent-white"
                                                        style={{
                                                            background: isDarkMode
                                                                ? `linear-gradient(
                                                                        to right,
                                                                        #ffffff 0%,
                                                                        #ffffff ${Math.min(100, Math.max(0, ((zoom - 1) / 2) * 100))}%,
                                                                        #404040 ${Math.min(100, Math.max(0, ((zoom - 1) / 2) * 100))}%,
                                                                        #404040 100%
                                                                    )`
                                                                : `linear-gradient(
                                                                        to right,
                                                                        #000000 0%,
                                                                        #000000 ${Math.min(100, Math.max(0, ((zoom - 1) / 2) * 100))}%,
                                                                        #e1e1e1 ${Math.min(100, Math.max(0, ((zoom - 1) / 2) * 100))}%,
                                                                        #e1e1e1 100%
                                                                    )`,
                                                        }}
                                                    />

                                                    {/* Zoom In Icon */}
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        strokeWidth={1.5}
                                                        stroke="currentColor"
                                                        className="flex-shrink-0 w-4 h-4 text-black cursor-pointer dark:text-white sm:h-5 sm:w-5"
                                                        onClick={() => {
                                                            if (zoom < 3) {
                                                                setZoom(zoom + 0.1);
                                                            }
                                                        }}
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607ZM10.5 7.5v6m3-3h-6"
                                                        />
                                                    </svg>
                                                </div>
                                            </div>

                                            {/* Helpful Tip */}
                                            <div className="flex items-center gap-2 rounded-md bg-surface-2-light dark:bg-surface-3-dark p-2.5 sm:p-3">
                                                <div className="flex-shrink-0">
                                                    <svg
                                                        className="h-3.5 w-3.5 text-main-text-light dark:text-main-text-dark sm:h-4 sm:w-4"
                                                        fill="currentColor"
                                                        viewBox="0 0 20 20"
                                                    >
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                </div>
                                                <p className="text-[11px] leading-relaxed text-main-text-light dark:text-main-text-dark sm:text-xs">
                                                    {__('Drag to reposition, pinch or use slider to zoom')}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Actions*/}
                                        <div className="flex items-center justify-end gap-3">
                                            <button
                                                onClick={() => {
                                                    setShowCropper(false);
                                                    setProfileImage(null);
                                                    setCroppedAreaPixels(null);
                                                    setCrop({ x: 0, y: 0 });
                                                    setZoom(1);

                                                    if (fileInputRef.current) {
                                                        fileInputRef.current.value = '';
                                                    }
                                                }}
                                                className="h-[50px] w-[180px] rounded-md bg-surface-2-light  text-main-text-light transition-all hover:bg-surface-3-light dark:hover:bg-surface-3-dark/80 dark:text-sub-text-dark dark:bg-surface-3-dark"
                                            >
                                                {__('Cancel')}
                                            </button>

                                            <button
                                                onClick={handleCropSaveAndUpload}
                                                className={`flex h-[50px] w-[180px] items-center text-md font-semibold justify-center gap-2 rounded-md bg-main-text-light  text-main-text-dark transition-all hover:bg-main-text-light/80 dark:bg-main-text-dark dark:text-main-text-light  dark:hover:bg-main-text-dark/80`}
                                            >
                                                {__("Save & Upload")}
                                            </button>
                                        </div>
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
