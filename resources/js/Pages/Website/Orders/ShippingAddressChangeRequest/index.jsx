
import WebInput from '@/Components/WebInput';
import WebTextArea from '@/Components/WebTextArea';
import { useConfirm } from '@/Hooks/useConfirm';
import { useTranslation } from '@/Hooks/useTranslation';
import useWindowSize from '@/Hooks/useWindowSize';
import MainLayout from '@/Layouts/Website/MainLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';


const index = ({ order_no }) => {

    const { confirm, ConfirmDialog } = useConfirm();
    const { data, setData, post, processing, errors } = useForm({
        reason: '',
        shipping_name: '',
        shipping_phone: '',
        shipping_address_line1: '',
        shipping_address_line2: '',
        shipping_city: '',
        shipping_country: '',
        shipping_state: '',
        shipping_postal_code: '',
    });


    // Translation Hook
    const { __ } = useTranslation();

    const [isDisabled, setIsDisabled] = useState(false);
    const windowSize = useWindowSize();

    useEffect(() => {
        const fieldsToValidate = Object.entries(data)
            .filter(([key]) => key !== 'shipping_address_line2')
            .map(([, value]) => value);

        const hasEmpty = fieldsToValidate.some(
            (value) => !value || value.trim() === ''
        );

        setIsDisabled(hasEmpty);
    }, [data]);


    const submit = async (e) => {
        e.preventDefault();

        if (isDisabled) {
            return;
        }


        const result = await confirm({
            title: __('Confirm Change Request'),
            text: __('Are you sure you want to submit this address change request? Our team will review it before taking any action.'),
            icon: 'info',
            showCancelButton: true,
            confirmButtonText: __('Submit Request'),
            cancelButtonText: __('Cancel'),
        });

        if (result.isConfirmed) {
            post(route('website.orders.address-change-request.store', order_no), {
                preserveScroll: true,
                preserveState: true,
            });
        }


    };

    return (
        <MainLayout>
            <Head title={__("Address Change Request", true)} />
            <ConfirmDialog />


            <div className="sm:px-6 lg:px-8">
                <div className={`mx-auto ${windowSize.width > 1024 ? 'pb-0' : 'pb-24'} lg:max-w-6xl sm:max-w-3xl`}>


                    {/* Hero Section */}
                    <div className="relative overflow-hidden">
                        <div className="absolute inset-0" />

                        <div className="relative px-6 mx-auto my-10 lg:max-w-6xl sm:max-w-3xl">

                            <h1 className="text-2xl font-semibold text-main-text-light dark:text-main-text-dark">
                                {__('Request a Address Change')}
                            </h1>

                            <p className="max-w-3xl mt-1 text-sm text-sub-text-light dark:sub-text-dark">
                                {__(
                                    'You can submit a address change request for this order. All address change requests are carefully reviewed by our team before being approved or rejected.'
                                )}
                            </p>

                            <div className="flex flex-wrap gap-4 mt-5">
                                {/* Review Badge */}
                                <div className="flex items-center gap-2 rounded-full bg-surface-1-light dark:bg-surface-1-dark px-3 py-1.5">

                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-sub-text-light dark:text-sub-text-dark">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                    </svg>

                                    <span className="text-sm font-medium text-sub-text-light dark:text-sub-text-dark">
                                        {__('Admin Review Required')}
                                    </span>
                                </div>

                                {/* Processing Badge */}
                                <div className="flex items-center gap-2 rounded-full bg-surface-1-light dark:bg-surface-1-dark px-3 py-1.5">

                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-sub-text-light dark:text-sub-text-dark">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 0 0-3.7-3.7 48.678 48.678 0 0 0-7.324 0 4.006 4.006 0 0 0-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 0 0 3.7 3.7 48.656 48.656 0 0 0 7.324 0 4.006 4.006 0 0 0 3.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3-3 3" />
                                    </svg>

                                    <span className="text-sm font-medium text-sub-text-light dark:text-sub-text-dark">
                                        {__('Processed After Approval')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>


                    {/* Main Content */}
                    <div className={`mx-auto  my-10 px-6 sm:max-w-3xl lg:max-w-6xl`}>
                        <div className="grid gap-8 lg:grid-cols-1">
                            {/* Form */}
                            <form onSubmit={submit}>
                                <h2 className="mb-6 text-xl font-semibold text-main-text-light dark:text-main-text-dark">
                                    {__('Submit Address Change Request')}
                                </h2>

                                <div className="space-y-3">

                                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

                                        {/* Shipping Name */}
                                        <div>
                                            <WebInput
                                                InputName={__('Shipping Name')}
                                                Id={'shipping_name'}
                                                Name={'shipping_name'}
                                                Error={errors.shipping_name}
                                                Value={data.shipping_name}
                                                Action={(e) => setData('shipping_name', e.target.value)}
                                                Required={true}
                                                Placeholder={__('Shipping Name')}
                                                ClassName={'dark:bg-surface-1-dark'}
                                            />
                                        </div>


                                        {/* Shipping Phone */}
                                        <div>
                                            <WebInput
                                                InputName={__('Shipping Phone')}
                                                Id={'shipping_phone'}
                                                Name={'shipping_phone'}
                                                Error={errors.shipping_phone}
                                                Value={data.shipping_phone}
                                                Action={(e) => setData('shipping_phone', e.target.value)}
                                                Required={true}
                                                Placeholder={__('Shipping Phone')}
                                                ClassName={'dark:bg-surface-1-dark'}
                                            />
                                        </div>


                                        {/* Shipping Country */}
                                        <div>
                                            <WebInput
                                                InputName={__('Shipping Country')}
                                                Id={'shipping_country'}
                                                Name={'shipping_country'}
                                                Error={errors.shipping_country}
                                                Value={data.shipping_country}
                                                Action={(e) => setData('shipping_country', e.target.value)}
                                                Required={true}
                                                Placeholder={__('Shipping Country')}
                                                ClassName={'dark:bg-surface-1-dark'}
                                            />
                                        </div>


                                        {/* Shipping City */}
                                        <div>
                                            <WebInput
                                                InputName={__('Shipping City')}
                                                Id={'shipping_city'}
                                                Name={'shipping_city'}
                                                Error={errors.shipping_city}
                                                Value={data.shipping_city}
                                                Action={(e) => setData('shipping_city', e.target.value)}
                                                Required={true}
                                                Placeholder={__('Shipping City')}
                                                ClassName={'dark:bg-surface-1-dark'}
                                            />
                                        </div>



                                        {/* Shipping State */}
                                        <div>
                                            <WebInput
                                                InputName={__('Shipping State')}
                                                Id={'shipping_state'}
                                                Name={'shipping_state'}
                                                Error={errors.shipping_state}
                                                Value={data.shipping_state}
                                                Action={(e) => setData('shipping_state', e.target.value)}
                                                Required={true}
                                                Placeholder={__('Shipping State')}
                                                ClassName={'dark:bg-surface-1-dark'}
                                            />
                                        </div>


                                        {/* Shipping Postal Code */}
                                        <div>
                                            <WebInput
                                                InputName={__('Shipping Postal Code')}
                                                Id={'shipping_postal_code'}
                                                Name={'shipping_postal_code'}
                                                Error={errors.shipping_postal_code}
                                                Value={data.shipping_postal_code}
                                                Action={(e) => setData('shipping_postal_code', e.target.value)}
                                                Required={true}
                                                Placeholder={__('Shipping Postal Code')}
                                                ClassName={'dark:bg-surface-1-dark'}
                                            />
                                        </div>



                                        <div>
                                            <WebTextArea
                                                InputName={__('Shipping Address Line 1')}
                                                Id={'address_line1'}
                                                Name={'address_line1'}
                                                Error={errors.shipping_address_line1}
                                                Value={data.shipping_address_line1}
                                                Action={(e) => setData('shipping_address_line1', e.target.value)}
                                                Required={true}
                                                Rows={6}
                                                Placeholder={__('Shipping Address Line 1')}
                                                ClassName={'dark:bg-surface-1-dark'}
                                            />
                                        </div>



                                        <div>
                                            <WebTextArea
                                                InputName={__('Shipping Address Line 2')}
                                                Id={'address_line2'}
                                                Name={'address_line2'}
                                                Error={errors.shipping_address_line2}
                                                Value={data.shipping_address_line2}
                                                Action={(e) => setData('shipping_address_line2', e.target.value)}
                                                Required={false}
                                                Rows={6}
                                                Placeholder={__('Shipping Address Line 2')}
                                                ClassName={'dark:bg-surface-1-dark'}
                                            />
                                        </div>


                                    </div>
                                    {/* Reason Field */}
                                    <div>
                                        <WebTextArea
                                            InputName={__('Reason for Change')}
                                            Id={'reason'}
                                            Name={'reason'}
                                            Error={errors.reason}
                                            Value={data.reason}
                                            Action={(e) => setData('reason', e.target.value)}
                                            Required={true}
                                            Rows={6}
                                            Placeholder={__('Please briefly explain why you are requesting a change')}
                                            ClassName={'dark:bg-surface-1-dark'}
                                        />
                                    </div>

                                    {/* Info Box */}
                                    <div className="p-4 border rounded-md border-surface-3-light bg-surface-1-light dark:bg-surface-1-dark dark:border-surface-3-dark">
                                        <p className="text-sm text-sub-text-light dark:text-sub-text-dark">
                                            {__(
                                                'Your address change request will be reviewed by our team. Once reviewed, you will be notified about the approval or rejection.'
                                            )}
                                        </p>
                                    </div>

                                    {/* Submit Button */}
                                    <div className="flex justify-end pt-4">
                                        <button
                                            disabled={processing || isDisabled}
                                            type="submit"
                                            className={`text-md flex h-[50px] w-[180px] items-center justify-center gap-2 rounded-md bg-black font-semibold text-white transition-all hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/80 ${(processing || isDisabled) && 'cursor-not-allowed opacity-25 dark:opacity-40'}`}
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
                                                <span>{__('Request Change')}</span>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            </form>


                        </div>
                    </div>

                </div>
            </div>
        </MainLayout >
    );
};

export default index;
