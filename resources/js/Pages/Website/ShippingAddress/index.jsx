import WebInput from '@/Components/WebInput';
import Spinner from '@/Components/Spinner';
import WebTextArea from '@/Components/WebTextArea';
import Toast from '@/Components/Toast';
import WebSelectInput from '@/Components/WebSelectInput';
import useWindowSize from '@/Hooks/useWindowSize';
import MainLayout from '@/Layouts/Website/MainLayout';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import PrimaryButton from '@/Components/PrimaryButton';
import { useTranslation } from '@/Hooks/useTranslation';
import { ChevronLeft, Trash2 } from 'lucide-react';
import { useConfirm } from '@/Hooks/useConfirm';

const index = ({ shipping_addresses, countries, show_continue_checkout = false, continue_checkout_buy_now = false }) => {

    const { auth } = usePage().props;

    const { confirm, ConfirmDialog } = useConfirm();

    const [infoMessage, setInfoMessage] = useState('');
    const [showInfoMessage, setShowInfoMessage] = useState(false);

    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [SuccessMessage, setSuccessMessage] = useState('');

    const [showErrorMessage, setShowErrorMessage] = useState(false);
    const [ErrorMessage, setErrorMessage] = useState('');

    const [isDropdownOpen, setIsDropdownOpen] = useState(null);

    const [toggleProcessing, setToggleProcessing] = useState(false);
    const [deleteProcessing, setDeleteProcessing] = useState(false);
    const [useProfileProcessing, setUseProfileProcessing] = useState(false);

    const { __ } = useTranslation();

    const {
        data,
        setData,
        post,
        put,
        processing,
        errors,
    } = useForm({
        country_id: '',
        name: '',
        phone: '',
        state: '',
        city: '',
        postal_code: '',
        address_line1: '',
        address_line2: '',
    })
    const [isCreateShippingAddressModalOpen, setIsCreateShippingAddressModalOpen] = useState(false);
    const [isEditShippingAddressModalOpen, setIsEditShippingAddressModalOpen] = useState(false);

    const windowSize = useWindowSize();

    // Guided checkout flow: after the address is saved (and only when the customer
    // arrived from checkout), offer to continue checkout. This one-shot signal is
    // sent by the controller via a prop, so direct/profile visits never trigger it.
    useEffect(() => {
        if (!show_continue_checkout) return;

        setIsCreateShippingAddressModalOpen(false);

        (async () => {
            const res = await confirm({
                title: __('Shipping address added'),
                text: __('Your shipping address has been saved and set as default.'),
                confirmButtonText: __('Continue checkout'),
                cancelButtonText: __('Stay here'),
                icon: 'success',
            });

            if (res?.isConfirmed) {
                router.visit(
                    route(
                        'website.checkout.index',
                        continue_checkout_buy_now ? { buy_now: 1 } : {},
                    ),
                );
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [show_continue_checkout]);

    // Auto Opening Modal If Query Exists
    useEffect(() => {
        const url = new URL(window.location.href);
        const param = url.searchParams.get('modal');

        if (param === 'create-shipping-address') {
            setIsCreateShippingAddressModalOpen(true);
        }
    }, []);

    useEffect(() => {
        if (isCreateShippingAddressModalOpen) {
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
    }, [isCreateShippingAddressModalOpen]);

    // // Appedning modal to URL
    useEffect(() => {
        const url = new URL(window.location.href);
        if (isCreateShippingAddressModalOpen) {
            window.history.pushState({}, '', window.location.pathname);
            url.searchParams.set('modal', 'create-shipping-address');
        } else if (isEditShippingAddressModalOpen) {
            window.history.pushState({}, '', window.location.pathname);
            url.searchParams.set('modal', 'edit-shipping-address');
        } else {
            url.searchParams.delete('modal');
        }

        window.history.replaceState({}, '', url);
    }, [isCreateShippingAddressModalOpen, isEditShippingAddressModalOpen]);

    // // Handle browser/mobile back button to close modals
    useEffect(() => {
        const handlePopState = (e) => {
            if (isCreateShippingAddressModalOpen) {
                setIsCreateShippingAddressModalOpen(false);
                return;
            }


            if (isEditShippingAddressModalOpen) {
                setIsEditShippingAddressModalOpen(false);
                return;
            }

        };

        const preventInertiaNavigation = (event) => {
            const pathname = event.detail?.visit?.url?.pathname || '';

            if (

                pathname === '/shipping-address-store' ||
                pathname === '/shipping-address-update'
            ) {
                return;
            }
            if (isCreateShippingAddressModalOpen && pathname === '/shipping-address') {
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
    }, [isCreateShippingAddressModalOpen, isEditShippingAddressModalOpen]);

    // // Disable Shipping Create and Update Modal
    //  Button State
    const [isCreateShippingAddressButtonDisabled, setIsCreateShippingAddressButtonDisabled] = useState(true);
    const [isUpdateShippingAddressButtonDisabled, setIsUpdateShippingAddressButtonDisabled] = useState(true);

    useEffect(() => {
        const isIncomplete =
            !data.name ||
            !data.phone ||
            !data.address_line1 ||
            !data.city ||
            !data.state ||
            !data.postal_code ||
            !data.country_id;

        setIsCreateShippingAddressButtonDisabled(isIncomplete);
        setIsUpdateShippingAddressButtonDisabled(isIncomplete);
    }, [data]);


    // Store Shipping Address
    const handleCreateShippingAddress = (e) => {
        e.preventDefault();
        post(route('website.shipping-addresses.store'), {
            onSuccess: (response) => {

                if (response.props.flash.success) {
                    setIsCreateShippingAddressModalOpen(false);
                    setData({
                        country_id: '',
                        name: '',
                        phone: '',
                        state: '',
                        city: '',
                        postal_code: '',
                        address_line1: '',
                        address_line2: '',
                    });
                }
            }
        });
    }



    // Destroy Shipping Address

    const handleRemoveShippingAddress = (id) => {
        setDeleteProcessing(true);
        router.delete(route('website.shipping-addresses.destroy', id), {
            preserveScroll: true,
            preserveUrl: true,

            onFinish: () => {
                setDeleteProcessing(false);
                setIsDropdownOpen(null);
            }
        });
    }


    // Edit Shipping Address
    const handleEditShippingAddress = (address) => {
        setData({
            id: address.id,
            country_id: address.country_id,
            name: address.name,
            phone: address.phone,
            state: address.state,
            city: address.city,
            postal_code: address.postal_code,
            address_line1: address.address_line1,
            address_line2: address.address_line2,
        });

        setIsEditShippingAddressModalOpen(true);
    }


    // Update Shipping Address
    const handleUpdateShippingAddress = (e) => {
        e.preventDefault();
        put(route('website.shipping-addresses.update', data.id), {
            onSuccess: (response) => {

                if (response.props.flash.success) {
                    setIsEditShippingAddressModalOpen(false);
                    setData({
                        country_id: '',
                        name: '',
                        phone: '',
                        state: '',
                        city: '',
                        postal_code: '',
                        address_line1: '',
                        address_line2: '',
                    });
                }
            }
        });
    }



    // Toggle Shipping Address
    const handleToggleShippingAddressStatus = (id) => {
        setToggleProcessing(true);
        router.put(route('website.shipping-addresses.toggle-status', id), {}, {
            preserveScroll: true,
            preserveUrl: true,

            onFinish: () => {
                setToggleProcessing(false);
                setIsDropdownOpen(null);
            }
        });

    }


    // Using Profile Address Info When No Shipping Address Exists
    const useProfileAddress = () => {
        setUseProfileProcessing(true);

        if (shipping_addresses.length > 0 || useProfileProcessing) {
            setUseProfileProcessing(false);
            return;
        }


        const user = auth?.user;
        const customer = user.customer;
        if (!user) {
            setShowErrorMessage(true);
            setErrorMessage(__('Something went wrong. Please try again.'));
            setUseProfileProcessing(false);
            return;
        } else if (!customer) {
            setShowErrorMessage(true);
            setErrorMessage(__('Only customers can use this feature.'));
            setUseProfileProcessing(false);
            return;
        }

        if (
            !customer.country_id ||
            !user.name ||
            !user.phone ||
            !customer.state ||
            !customer.city ||
            !customer.postal_code ||
            (!customer.address_line1 && !customer.address_line2)

        ) {
            setShowInfoMessage(true);
            setInfoMessage(
                <>
                    {__('Please complete your profile first.')}{' '}
                    <br />
                    <Link
                        href={route('website.profile.index') + '?modal=edit-profile'}
                        className="underline text-main-text-light dark:text-main-text-dark"
                    >
                        {__('Go to Profile Page')}
                    </Link>
                </>
            );
            setUseProfileProcessing(false);

            return;
        }



        const formPayload = {
            country_id: customer.country_id,
            name: user.name,
            phone: user.phone,
            state: customer.state,
            city: customer.city,
            postal_code: customer.postal_code,
            address_line1: customer.address_line1,
            address_line2: customer.address_line2,
        };



        router.post(route('website.shipping-addresses.store.from-profile'), {
            ...formPayload
        }, {
            preserveScroll: true,
            onFinish: () => {
                setUseProfileProcessing(false);
            },
            onError: (errors) => {
                const errMessages = Object.values(errors).flat();
                setShowErrorMessage(true);
                setErrorMessage(errMessages.join(' '));
            }
        });



    }
    return (
        <MainLayout>
            <Head title={__('Shipping Addresses', true)} />

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

            <ConfirmDialog />


            <div className="sm:px-6 lg:px-8">
                <div className={`px-6 lg:my-8 mx-auto ${windowSize.width > 1024 ? 'pb-0 mb-10' : 'pb-32'} lg:max-w-6xl sm:max-w-3xl `}>

                    <div className="my-2 ">
                        <Link
                            href={route('website.profile.index')}
                            className="inline-flex items-center gap-2 mb-4 text-sm font-medium transition-colors lg:hidden text-main-text-light lg:hover:text-main-text-light/80 dark:text-main-text-dark dark:lg:hover:text-main-text-dark/80"
                        >
                            <ChevronLeft />
                        </Link>
                        <h1 className="text-[24px] font-semibold text-main-text-light dark:text-main-text-dark">
                            {__('Shipping Address')}
                        </h1>
                        <p className="mt-1 text-sm text-sub-text-light dark:sub-text-dark">
                            {__('Add, edit, and manage your saved shipping addresses.')}
                        </p>
                    </div>



                    <div className="flex flex-wrap items-center justify-start gap-4 mb-2 lg:justify-between">
                        <p className='text-main-text-light dark:text-main-text-dark'> <span className='font-semibold'>{__('Default Shipping Address')}</span> </p>

                        <PrimaryButton
                            Text={__("Add Address")}
                            Type={"button"}
                            Action={() => setIsCreateShippingAddressModalOpen(true)}
                            CustomClass={"w-full lg:w-[280px] h-[40px] !text-center"}
                        />
                    </div>


                    {shipping_addresses.length === 0 ? (
                        <EmptyShippingAddress onClick={useProfileAddress} processing={useProfileProcessing} __={__} />
                    ) : (
                        <>
                            {shipping_addresses.filter(addr => addr.is_active).map((item, index) => (
                                <ShippingAddressItem
                                    key={item.id || index}
                                    item={item}
                                    onRemove={handleRemoveShippingAddress}
                                    onEdit={handleEditShippingAddress}
                                    onToggle={handleToggleShippingAddressStatus}
                                    toggleProcessing={toggleProcessing}
                                    isDropdownOpen={isDropdownOpen}
                                    setIsDropdownOpen={setIsDropdownOpen}
                                    deleteProcessing={deleteProcessing}
                                    __={__}

                                />
                            ))}

                            {/* Other Shipping Addresses Section */}
                            {shipping_addresses.filter(addr => !addr.is_active).length > 0 && (
                                <div className="mt-8">
                                    <p className="mb-3 font-semibold text-main-text-light dark:text-main-text-dark">
                                        Other Shipping Addresses
                                    </p>
                                    <div className="space-y-3">
                                        {shipping_addresses.filter(addr => !addr.is_active).map((item, index) => (
                                            <ShippingAddressItem
                                                key={item.id || index}
                                                item={item}
                                                onRemove={handleRemoveShippingAddress}
                                                onEdit={handleEditShippingAddress}
                                                onToggle={handleToggleShippingAddressStatus}
                                                toggleProcessing={toggleProcessing}
                                                isDropdownOpen={isDropdownOpen}
                                                setIsDropdownOpen={setIsDropdownOpen}
                                                deleteProcessing={deleteProcessing}
                                                __={__}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Create Shipping Address Modal */}
            {isCreateShippingAddressModalOpen && (
                <>
                    {createPortal(
                        windowSize.width > 1024 ? (
                            // PC VERSION
                            <div className="fixed inset-0 z-50 flex items-center justify-center">
                                {/* Backdrop */}
                                <div
                                    className="fixed inset-0 transition-opacity duration-300 bg-black/30 backdrop-blur-sm"
                                    onClick={() => setIsCreateShippingAddressModalOpen(false)}
                                />

                                {/* Modal Card */}
                                <div className="relative z-10 w-full max-w-4xl p-12 pb-1 border rounded-md border-surface-1-light dark:border-surface-3-dark bg-backgroundLight dark:bg-surface-1-dark dark:text-main-text-dark text-main-text-light">
                                    {/* Header */}
                                    <div className="flex items-center justify-between pb-4">
                                        <h2 className="text-xl font-semibold tracking-tight text-main-text-light dark:text-main-text-dark">
                                            {__('Add Shipping Address')}
                                        </h2>
                                    </div>

                                    {/* Content */}
                                    <div className="mt-6 max-h-[80vh] overflow-y-auto pr-2">
                                        <form
                                            onSubmit={handleCreateShippingAddress}
                                            className="mb-10 space-y-5"
                                        >

                                            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

                                                {/* Name */}
                                                <div>
                                                    <WebInput
                                                        Id={'name'}
                                                        InputName={__('Name')}
                                                        Error={errors.name}
                                                        Name={'name'}
                                                        Placeholder={__('Enter Full Name')}
                                                        Type={'text'}
                                                        Value={data.name}
                                                        Action={(e) =>
                                                            setData('name', e.target.value)
                                                        }
                                                        Required={true}
                                                    />
                                                </div>



                                                {/* Phone */}
                                                <div>
                                                    <WebInput
                                                        Id={'phone'}
                                                        InputName={__('Phone')}
                                                        Error={errors.phone}
                                                        Name={'phone'}
                                                        Placeholder={__('Enter Phone')}
                                                        Type={'text'}
                                                        Value={data.phone}
                                                        Action={(e) =>
                                                            setData('phone', e.target.value)
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
                                                        Value={data.country_id}
                                                        Required={true}
                                                        Action={(value) =>
                                                            setData('country_id', value)
                                                        }
                                                        items={countries}
                                                        itemKey={'name'}
                                                        Error={errors.country_id}
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
                                                        Error={errors.address_line1}
                                                        Value={data.address_line1}
                                                        Required={true}
                                                        Placeholder={__('Enter Address 1')}
                                                        Action={(e) =>
                                                            setData(
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
                                                        Error={errors.address_line2}
                                                        Placeholder={__('Enter Address 2')}
                                                        Value={data.address_line2}
                                                        Required={false}
                                                        Action={(e) =>
                                                            setData(
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
                                                        Error={errors.city}
                                                        Name={'city'}
                                                        Placeholder={__('Enter City')}
                                                        Type={'text'}
                                                        Value={data.city}
                                                        Action={(e) =>
                                                            setData('city', e.target.value)
                                                        }
                                                        Required={true}
                                                    />
                                                </div>

                                                <div>
                                                    <WebInput
                                                        Id={'state'}
                                                        InputName={__('State')}
                                                        Error={errors.state}
                                                        Name={'state'}
                                                        Placeholder={__('Enter State')}
                                                        Type={'text'}
                                                        Value={data.state}
                                                        Action={(e) =>
                                                            setData('state', e.target.value)
                                                        }
                                                        Required={true}
                                                    />
                                                </div>

                                                {/* Postal Code and Country ID */}
                                                <div>
                                                    <WebInput
                                                        Id={'postal_code'}
                                                        InputName={__('Postal Code')}
                                                        Error={errors.postal_code}
                                                        Name={'postal_code'}
                                                        Placeholder={__('Enter Postal Code')}
                                                        Type={'text'}
                                                        Value={data.postal_code}
                                                        Action={(e) =>
                                                            setData(
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
                                                    onClick={() => setIsCreateShippingAddressModalOpen(false)}
                                                    className="h-[50px] w-[180px] rounded-md bg-surface-2-light  text-main-text-light transition-all hover:bg-surface-3-light dark:hover:bg-surface-3-dark/80 dark:text-sub-text-dark dark:bg-surface-3-dark"
                                                >
                                                    {__('Cancel')}
                                                </button>

                                                <button
                                                    type="submit"
                                                    disabled={
                                                        processing ||
                                                        isCreateShippingAddressButtonDisabled
                                                    }
                                                    className={`flex h-[50px] w-[180px] font-semibold text-md  items-center justify-center gap-2 rounded-md bg-main-text-light  text-main-text-dark transition-all hover:bg-main-text-light/80 dark:bg-main-text-dark dark:text-main-text-light dark:hover:bg-main-text-dark/80 ${(processing || isCreateShippingAddressButtonDisabled) && 'cursor-not-allowed opacity-25 dark:opacity-40'}`}
                                                >
                                                    {processing && (
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
                                            onClick={() => setIsCreateShippingAddressModalOpen(false)}
                                            className="absolute p-1 text-black rounded-full left-4 dark:text-main-text-dark"
                                        >
                                            <ChevronLeft />
                                        </button>

                                        <h2 className="mx-10 text-xl font-semibold tracking-tight text-main-text-light dark:text-main-text-dark">
                                            {__('Add Shipping Address')}
                                        </h2>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 p-4 space-y-6">
                                        <form
                                            // onSubmit={handleEditProfileSubmit}
                                            className="mb-24 space-y-5"
                                        >
                                            {/* Name */}
                                            <div>
                                                <WebInput
                                                    Id={'name'}
                                                    InputName={__('Name')}
                                                    Error={errors.name}
                                                    Name={'name'}
                                                    Placeholder={__('Enter Full Name')}
                                                    Type={'text'}
                                                    Value={data.name}
                                                    Action={(e) =>
                                                        setData('name', e.target.value)
                                                    }
                                                    Required={true}
                                                />
                                            </div>



                                            {/* Phone */}
                                            <div>
                                                <WebInput
                                                    Id={'phone'}
                                                    InputName={__('Phone')}
                                                    Error={errors.phone}
                                                    Name={'phone'}
                                                    Placeholder={__('Enter Phone')}
                                                    Type={'text'}
                                                    Value={data.phone}
                                                    Action={(e) =>
                                                        setData('phone', e.target.value)
                                                    }
                                                    Required={true}
                                                />
                                            </div>

                                            <div>
                                                <WebSelectInput
                                                    InputName={__('Country')}
                                                    Id={'country_id'}
                                                    Name={'country_id'}
                                                    Value={data.country_id}
                                                    Required={true}
                                                    Action={(value) =>
                                                        setData('country_id', value)
                                                    }
                                                    items={countries}
                                                    itemKey={'name'}
                                                    Error={errors.country_id}
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
                                                    Error={errors.address_line1}
                                                    Value={data.address_line1}
                                                    Placeholder={__('Enter Address 1')}
                                                    Required={true}
                                                    Action={(e) =>
                                                        setData(
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
                                                    Error={errors.address_line2}
                                                    Value={data.address_line2}
                                                    Placeholder={__('Enter Address 2')}
                                                    Required={false}
                                                    Action={(e) =>
                                                        setData(
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
                                                        Error={errors.city}
                                                        Name={'city'}
                                                        Placeholder={__('Enter City')}
                                                        Type={'text'}
                                                        Value={data.city}
                                                        Action={(e) =>
                                                            setData('city', e.target.value)
                                                        }
                                                        Required={true}
                                                    />
                                                </div>

                                                <div>
                                                    <WebInput
                                                        Id={'state'}
                                                        InputName={__('State')}
                                                        Error={errors.state}
                                                        Name={'state'}
                                                        Placeholder={__('Enter State')}
                                                        Type={'text'}
                                                        Value={data.state}
                                                        Action={(e) =>
                                                            setData('state', e.target.value)
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
                                                        Error={errors.postal_code}
                                                        Name={'postal_code'}
                                                        Placeholder={__('Enter Postal Code')}
                                                        Type={'text'}
                                                        Value={data.postal_code}
                                                        Action={(e) =>
                                                            setData(
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
                                                    onClick={() => setIsCreateShippingAddressModalOpen(false)}
                                                    className="h-[50px] w-[180px] rounded-md bg-surface-2-light  text-main-text-light transition-all hover:bg-surface-3-light dark:hover:bg-surface-3-dark/80 dark:text-sub-text-dark dark:bg-surface-3-dark"
                                                >
                                                    {__('Cancel')}
                                                </button>

                                                <button
                                                    type="submit"
                                                    disabled={
                                                        processing ||
                                                        isCreateShippingAddressButtonDisabled
                                                    }
                                                    className={`flex h-[50px] w-[180px] tetx-md font-semibold  items-center justify-center gap-2 rounded-md bg-black  text-white transition-all hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/80 ${(processing || isCreateShippingAddressButtonDisabled) && 'cursor-not-allowed opacity-25 dark:opacity-40'}`}
                                                >
                                                    {processing && (
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




            {/* Edit Shipping Address Modal */}
            {isEditShippingAddressModalOpen && (
                <>
                    {createPortal(
                        windowSize.width > 1024 ? (
                            // PC VERSION
                            <div className="fixed inset-0 z-50 flex items-center justify-center">
                                {/* Backdrop */}
                                <div
                                    className="fixed inset-0 transition-opacity duration-300 bg-black/30 backdrop-blur-sm"
                                    onClick={() => {

                                        setIsEditShippingAddressModalOpen(false);
                                        setData({
                                            country_id: '',
                                            name: '',
                                            phone: '',
                                            state: '',
                                            city: '',
                                            postal_code: '',
                                            address_line1: '',
                                            address_line2: '',
                                        });

                                    }}
                                />

                                {/* Modal Card */}
                                <div className="relative z-10 w-full max-w-4xl p-12 pb-1 border rounded-md border-surface-1-light dark:border-surface-3-dark bg-backgroundLight dark:bg-surface-1-dark dark:text-main-text-dark text-main-text-light">
                                    {/* Header */}
                                    <div className="flex items-center justify-between pb-4">
                                        <h2 className="text-xl font-semibold tracking-tight text-main-text-light dark:text-main-text-dark">
                                            {__(' Edit Shipping Address')}
                                        </h2>
                                    </div>

                                    {/* Content */}
                                    <div className="mt-6 max-h-[80vh] overflow-y-auto pr-2">
                                        <form
                                            onSubmit={handleUpdateShippingAddress}
                                            className="mb-10 space-y-5"
                                        >

                                            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

                                                {/* Name */}
                                                <div>
                                                    <WebInput
                                                        Id={'name'}
                                                        InputName={__('Name')}
                                                        Error={errors.name}
                                                        Name={'name'}
                                                        Placeholder={__('Enter Full Name')}
                                                        Type={'text'}
                                                        Value={data.name}
                                                        Action={(e) =>
                                                            setData('name', e.target.value)
                                                        }
                                                        Required={true}
                                                    />
                                                </div>



                                                {/* Phone */}
                                                <div>
                                                    <WebInput
                                                        Id={'phone'}
                                                        InputName={__('Phone')}
                                                        Error={errors.phone}
                                                        Name={'phone'}
                                                        Placeholder={__('Enter Phone')}
                                                        Type={'text'}
                                                        Value={data.phone}
                                                        Action={(e) =>
                                                            setData('phone', e.target.value)
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
                                                        Value={data.country_id}
                                                        Required={true}
                                                        Action={(value) =>
                                                            setData('country_id', value)
                                                        }
                                                        items={countries}
                                                        itemKey={'name'}
                                                        Error={errors.country_id}
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
                                                        Error={errors.address_line1}
                                                        Value={data.address_line1}
                                                        Required={true}
                                                        Placeholder={__('Enter Address 1')}
                                                        Action={(e) =>
                                                            setData(
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
                                                        Error={errors.address_line2}
                                                        Placeholder={__('Enter Address 2')}
                                                        Value={data.address_line2}
                                                        Required={false}
                                                        Action={(e) =>
                                                            setData(
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
                                                        Error={errors.city}
                                                        Name={'city'}
                                                        Placeholder={__('Enter City')}
                                                        Type={'text'}
                                                        Value={data.city}
                                                        Action={(e) =>
                                                            setData('city', e.target.value)
                                                        }
                                                        Required={true}
                                                    />
                                                </div>

                                                <div>
                                                    <WebInput
                                                        Id={'state'}
                                                        InputName={__('State')}
                                                        Error={errors.state}
                                                        Name={'state'}
                                                        Placeholder={__('Enter State')}
                                                        Type={'text'}
                                                        Value={data.state}
                                                        Action={(e) =>
                                                            setData('state', e.target.value)
                                                        }
                                                        Required={true}
                                                    />
                                                </div>

                                                {/* Postal Code and Country ID */}
                                                <div>
                                                    <WebInput
                                                        Id={'postal_code'}
                                                        InputName={__('Postal Code')}
                                                        Error={errors.postal_code}
                                                        Name={'postal_code'}
                                                        Placeholder={__('Enter Postal Code')}
                                                        Type={'text'}
                                                        Value={data.postal_code}
                                                        Action={(e) =>
                                                            setData(
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
                                                    onClick={() => {

                                                        setIsEditShippingAddressModalOpen(false);
                                                        setData({
                                                            country_id: '',
                                                            name: '',
                                                            phone: '',
                                                            state: '',
                                                            city: '',
                                                            postal_code: '',
                                                            address_line1: '',
                                                            address_line2: '',
                                                        });

                                                    }}
                                                    className="h-[50px] w-[180px] rounded-md bg-surface-2-light  text-main-text-light transition-all hover:bg-surface-3-light dark:hover:bg-surface-3-dark/80 dark:text-sub-text-dark dark:bg-surface-3-dark"
                                                >
                                                    {__('Cancel')}
                                                </button>

                                                <button
                                                    type="submit"
                                                    disabled={
                                                        processing ||
                                                        isUpdateShippingAddressButtonDisabled
                                                    }
                                                    className={`flex h-[50px] w-[180px] font-semibold text-md  items-center justify-center gap-2 rounded-md bg-main-text-light  text-main-text-dark transition-all hover:bg-main-text-light/80 dark:bg-main-text-dark dark:text-main-text-light dark:hover:bg-main-text-dark/80 ${(processing || isUpdateShippingAddressButtonDisabled) && 'cursor-not-allowed opacity-25 dark:opacity-40'}`}
                                                >
                                                    {processing && (
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
                                            onClick={() => {

                                                setIsEditShippingAddressModalOpen(false);
                                                setData({
                                                    country_id: '',
                                                    name: '',
                                                    phone: '',
                                                    state: '',
                                                    city: '',
                                                    postal_code: '',
                                                    address_line1: '',
                                                    address_line2: '',
                                                });

                                            }}
                                            className="absolute p-1 text-black rounded-full left-4 dark:text-main-text-dark"
                                        >
                                            <ChevronLeft />
                                        </button>

                                        <h2 className="mx-10 text-xl font-semibold tracking-tight text-main-text-light dark:text-main-text-dark">
                                            {__('Edit Shipping Address')}
                                        </h2>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 p-4 space-y-6">
                                        <form
                                            onSubmit={handleUpdateShippingAddress}
                                            className="mb-24 space-y-5"
                                        >
                                            {/* Name */}
                                            <div>
                                                <WebInput
                                                    Id={'name'}
                                                    InputName={__('Name')}
                                                    Error={errors.name}
                                                    Name={'name'}
                                                    Placeholder={__('Enter Full Name')}
                                                    Type={'text'}
                                                    Value={data.name}
                                                    Action={(e) =>
                                                        setData('name', e.target.value)
                                                    }
                                                    Required={true}
                                                />
                                            </div>



                                            {/* Phone */}
                                            <div>
                                                <WebInput
                                                    Id={'phone'}
                                                    InputName={__('Phone')}
                                                    Error={errors.phone}
                                                    Name={'phone'}
                                                    Placeholder={__('Enter Phone')}
                                                    Type={'text'}
                                                    Value={data.phone}
                                                    Action={(e) =>
                                                        setData('phone', e.target.value)
                                                    }
                                                    Required={true}
                                                />
                                            </div>

                                            <div>
                                                <WebSelectInput
                                                    InputName={__('Country')}
                                                    Id={'country_id'}
                                                    Name={'country_id'}
                                                    Value={data.country_id}
                                                    Required={true}
                                                    Action={(value) =>
                                                        setData('country_id', value)
                                                    }
                                                    items={countries}
                                                    itemKey={'name'}
                                                    Error={errors.country_id}
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
                                                    Error={errors.address_line1}
                                                    Placeholder={__('Enter Address 1')}
                                                    Value={data.address_line1}
                                                    Required={true}
                                                    Action={(e) =>
                                                        setData(
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
                                                    Error={errors.address_line2}
                                                    Value={data.address_line2}
                                                    Placeholder={__('Enter Address 2')}
                                                    Required={false}
                                                    Action={(e) =>
                                                        setData(
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
                                                        Error={errors.city}
                                                        Name={'city'}
                                                        Placeholder={__('Enter City')}
                                                        Type={'text'}
                                                        Value={data.city}
                                                        Action={(e) =>
                                                            setData('city', e.target.value)
                                                        }
                                                        Required={true}
                                                    />
                                                </div>

                                                <div>
                                                    <WebInput
                                                        Id={'state'}
                                                        InputName={__('State')}
                                                        Error={errors.state}
                                                        Name={'state'}
                                                        Placeholder={__('Enter State')}
                                                        Type={'text'}
                                                        Value={data.state}
                                                        Action={(e) =>
                                                            setData('state', e.target.value)
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
                                                        Error={errors.postal_code}
                                                        Name={'postal_code'}
                                                        Placeholder={__('Enter Postal Code')}
                                                        Type={'text'}
                                                        Value={data.postal_code}
                                                        Action={(e) =>
                                                            setData(
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
                                                    onClick={() => {

                                                        setIsEditShippingAddressModalOpen(false);
                                                        setData({
                                                            country_id: '',
                                                            name: '',
                                                            phone: '',
                                                            state: '',
                                                            city: '',
                                                            postal_code: '',
                                                            address_line1: '',
                                                            address_line2: '',
                                                        });

                                                    }}
                                                    className="h-[50px] w-[180px] rounded-md bg-surface-2-light  text-main-text-light transition-all hover:bg-surface-3-light dark:hover:bg-surface-3-dark/80 dark:text-sub-text-dark dark:bg-surface-3-dark"
                                                >
                                                    {__('Cancel')}
                                                </button>

                                                <button
                                                    type="submit"
                                                    disabled={
                                                        processing ||
                                                        isUpdateShippingAddressButtonDisabled
                                                    }
                                                    className={`flex h-[50px] w-[180px] tetx-md font-semibold  items-center justify-center gap-2 rounded-md bg-black  text-white transition-all hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/80 ${(processing || isUpdateShippingAddressButtonDisabled) && 'cursor-not-allowed opacity-25 dark:opacity-40'}`}
                                                >
                                                    {processing && (
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
        </MainLayout>
    );
};


const EmptyShippingAddress = ({ onClick, processing, __ }) => {
    return (
        <div className="w-full p-8 border rounded-md border-surface-3-light bg-surface-2-light dark:bg-surface-2-dark dark:border-surface-3-dark">
            {/* Message Text */}
            <p className="mb-4 text-sm text-center text-main-text-light dark:text-main-text-dark">
                {__('No shipping address yet. Add one to use at checkout.')}
            </p>

            {/* Button */}
            <div className="flex justify-center">
                <button
                    onClick={onClick}
                    type="button"
                    disabled={processing}
                    className={`px-6 py-2 text-sm font-medium transition-colors border rounded-md bg-main-text-dark border-main-text-light text-main-text-light hover:bg-main-text-dark/80 focus:outline-none focus:ring-0 focus:ring-offset-0 f dark:bg-main-text-light dark:text-main-text-dark dark:border-main-text-dark dark:hover:bg-main-text-light/80 ${processing && 'cursor-not-allowed opacity-25 dark:opacity-40'}`}
                >
                    {processing ?
                        <Spinner />
                        : (
                            __('Use Profile Address')
                        )}
                </button>
            </div>
        </div>
    );
}

const ShippingAddressItem = ({ item, onEdit, onToggle, onRemove, toggleProcessing, isDropdownOpen, setIsDropdownOpen, deleteProcessing, __ }) => {

    // If this is the active/default address
    if (item.is_active) {
        return (
            <div className="relative w-full p-5 transition-colors bg-white border rounded-md border-main-text-light dark:bg-surface-2-dark dark:border-main-text-dark">

                {/* Top Right: Default Badge + Edit Button  For Mobile*/}
                <div className="flex items-center justify-between gap-2 lg:hidden lg:left-auto lg:justify-end">


                    <span className="px-4 py-1 text-sm font-medium text-white bg-green-600 rounded-full">
                        {__('default')}
                    </span>

                    <button
                        type="button"
                        onClick={() => onEdit(item)}
                        className="flex items-center gap-1.5 rounded-md  px-3 py-1.5 text-sm font-medium text-main-text-light transition-colors hover:text-main-text-light/80  dark:text-main-text-dark dark:hover:text-main-text-dark/80"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-4 h-4"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
                            />
                        </svg>
                    </button>
                </div>

                {/* Top Right: Default Badge + Edit Button  For Desktop*/}
                <div className="absolute items-center hidden gap-2 lg:flex top-4 right-4">


                    <span className="px-4 py-1 text-sm font-medium text-white bg-green-600 rounded-full">
                        {__('default')}
                    </span>

                    <button
                        type="button"
                        onClick={() => onEdit(item)}
                        className="flex items-center gap-1.5 rounded-md  px-3 py-1.5 text-sm font-medium text-main-text-light transition-colors hover:text-main-text-light/80  dark:text-main-text-dark dark:hover:text-main-text-dark/80"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-4 h-4"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
                            />
                        </svg>
                        {__('Edit')}
                    </button>
                </div>

                {/* Address Details */}
                <div className="pr-32 mt-3 text-sm leading-relaxed text-main-text-light dark:text-main-text-dark">
                    <p className="font-semibold">{item.name}</p>
                    <p>{item.address_line1}</p>
                    {item.address_line2 && <p>{item.address_line2}</p>}
                    <p>
                        {item.city}, {item.state} {item.postal_code}
                    </p>
                    {item.phone && (
                        <p className="text-main-text-light dark:text-main-text-dark">{item.phone}</p>
                    )}
                    <p>{item.country?.name || item.country}</p>
                </div>

            </div>
        );
    }

    // If this is an inactive/other address
    return (
        <div className="relative w-full p-5 transition-colors bg-white border rounded-md border-surface-3-light hover:border-main-text-light/20 dark:bg-surface-1-dark dark:border-surface-3-dark dark:hover:border-main-text-dark/20">

            {/* Top Right: Dropdown Menu */}
            <div className="absolute top-4 right-4">
                <div className="relative">
                    <button
                        type="button"
                        onClick={() => setIsDropdownOpen(item.id)}
                        className="rounded-md p-1.5 text-main-text-light transition-colors lg:hover:bg-surface-2-light focus:outline-none focus:ring-0 focus:ring-offset-0 dark:text-main-text-dark dark:lg:hover:bg-surface-2-dark"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-5 h-5"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                            />
                        </svg>
                    </button>


                    {/* Dropdown Menu */}
                    {isDropdownOpen === item.id && (
                        <>
                            {/* Backdrop */}
                            <div
                                className="fixed inset-0 z-10"
                                onClick={() => setIsDropdownOpen(null)}
                            />

                            {/* Menu */}
                            <div className="absolute right-0 z-20 w-48 bg-white border rounded-md shadow-lg top-6 border-surface-3-light dark:border-surface-3-dark dark:bg-surface-1-dark">
                                <div className="py-3">
                                    {/* Set as Default */}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            onToggle(item.id);
                                        }}
                                        className="flex items-center w-full gap-2 px-4 py-1 text-sm text-left transition-colors text-main-text-light lg:hover:bg-surface-2-light dark:text-main-text-dark dark:lg:hover:bg-surface-2-dark"
                                    >
                                        {toggleProcessing ? (
                                            <Spinner />
                                        ) : (
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth={2}
                                                stroke="currentColor"
                                                className="w-4 h-4"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                                                />
                                            </svg>
                                        )}
                                        {__('Set as default')}
                                    </button>

                                    {/* Edit */}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsDropdownOpen(null);
                                            onEdit(item);
                                        }}
                                        className="flex items-center w-full gap-2 px-4 py-2 text-sm text-left transition-colors text-main-text-light lg:hover:bg-surface-2-light dark:text-main-text-dark dark:lg:hover:bg-surface-2-dark"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={1.5}
                                            stroke="currentColor"
                                            className="w-4 h-4"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
                                            />
                                        </svg>

                                        {__('Edit')}
                                    </button>

                                    {/* Delete */}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            onRemove(item.id);
                                        }}
                                        className="flex items-center w-full gap-2 px-4 py-1 text-sm text-left text-red-600 transition-colors lg:hover:bg-red-50 dark:text-red-400 dark:lg:hover:bg-red-900/20"
                                    >
                                        {deleteProcessing ? (
                                            <Spinner />
                                        ) : (
                                            <Trash2 className="w-4 h-4" />
                                        )}
                                        {__('Delete')}
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Address Details */}
            <div className="pr-32 text-sm leading-relaxed text-main-text-light dark:text-main-text-dark">
                <p className="font-semibold">{item.name}</p>
                <p>{item.address_line1}</p>
                {item.address_line2 && <p>{item.address_line2}</p>}
                <p>
                    {item.city}, {item.state} {item.postal_code}
                </p>
                {item.phone && (
                    <p className="text-main-text-light dark:text-main-text-dark">{item.phone}</p>
                )}
                <p>{item.country?.name || item.country}</p>
            </div>

        </div>
    );
};

export default index;
