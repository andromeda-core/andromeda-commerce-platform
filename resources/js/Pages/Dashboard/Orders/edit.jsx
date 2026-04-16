import Card from '@/Components/Card';
import Input from '@/Components/Input';
import LinkButton from '@/Components/LinkButton';
import PrimaryButton from '@/Components/PrimaryButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BreadCrumb from '@/Components/BreadCrumb';
import { Head, useForm } from '@inertiajs/react';
import React, { useEffect, useRef, useState } from 'react';
import SelectInput from '@/Components/SelectInput';
import FileUploaderInput from '@/Components/FileUploaderInput';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';

export default function edit({ order, orderCourierCompanies }) {
    // Edit Data Form Data
    const { data, setData, post, processing, errors, reset } = useForm({
        _method: 'PUT',
        status: order.status || '',
        ...(order.status === 'pending' ? { payment_proof: '' } : {}),
        ...(order.status === 'paid'
            ? {
                  courier_company: '',
                  courier_company_address: '',
                  courier_company_postal_code: '',
                  courier_company_phone: '',
                  shipping_date: '',
                  tracking_no: '',
                  courier_invoice: '',
              }
            : {}),

        ...(order.status === 'arrived_locally'
            ? {
                  final_attachments: [],
              }
            : {}),

        ...(order.status !== 'pending' ? { is_cash_collected: order.is_cash_collected ?? '' } : {}),
    });

    const flatpickerForShippingDate = useRef(null);

    const [selectedCourierId, setSelectedCourierId] = useState('');

    // flatpicker init useEffect
    useEffect(() => {
        if (order.status === 'paid') {
            setTimeout(() => {
                if (flatpickerForShippingDate.current) {
                    flatpickr(flatpickerForShippingDate.current, {
                        dateFormat: 'Y-m-d',
                        disableMobile: true,
                        onChange: function (selectedDates, dateStr) {
                            if (selectedDates[0]) {
                                setData('shipping_date', dateStr);
                            }
                        },
                    });
                }
            }, 500);
        }
    }, []);

    // Edit Data Form Request
    const submit = (e) => {
        e.preventDefault();
        post(route('dashboard.orders.update', order.id));
    };
    const handleCourierCompanyChange = (selectedId) => {
        setSelectedCourierId(selectedId);

        const selectedCompany = orderCourierCompanies.find((c) => c.id == selectedId);

        if (selectedCompany) {
            setData({
                ...data,
                courier_company: selectedCompany.name,
                courier_company_address: selectedCompany.address,
                courier_company_postal_code: selectedCompany.postal_code,
                courier_company_phone: selectedCompany.phone,
            });
        }
    };

    return (
        <>
            <AuthenticatedLayout>
                <Head title="Orders" />

                <BreadCrumb
                    header={'Edit Order'}
                    parent={'Orders'}
                    parent_link={route('dashboard.orders.index')}
                    child={'Edit Order'}
                />

                <Card
                    Content={
                        <>
                            <div className="my-3 flex flex-wrap justify-end">
                                <LinkButton
                                    Text={'Back To Orders'}
                                    URL={route('dashboard.orders.index')}
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
                                                d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"
                                            />
                                        </svg>
                                    }
                                />
                            </div>

                            <form onSubmit={submit}>
                                <Card
                                    Content={
                                        <>
                                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                {order.status === 'pending' && (
                                                    <>
                                                        <SelectInput
                                                            InputName={'Status'}
                                                            Error={errors.status}
                                                            Id={'status'}
                                                            Name={'status'}
                                                            Value={data.status}
                                                            Action={(value) =>
                                                                setData('status', value)
                                                            }
                                                            Placeholder={'Select Status'}
                                                            Required={true}
                                                            items={[
                                                                { id: 'pending', name: 'Pending' },
                                                                { id: 'paid', name: 'Paid' },
                                                            ]}
                                                            itemKey={'name'}
                                                        />

                                                        <FileUploaderInput
                                                            InputName={'Payment Proof'}
                                                            Id={'payment_proof'}
                                                            Error={errors.payment_proof}
                                                            Label={
                                                                'Drag & Drop your Payment Proof or <span class="filepond--label-action">Browse</span>'
                                                            }
                                                            MaxFileSize={'5MB'}
                                                            MaxFiles={1}
                                                            Multiple={false}
                                                            Required={true}
                                                            acceptedFileTypes={['image/*']}
                                                            DefaultFile={
                                                                order.payment_proof && [
                                                                    order.payment_proof,
                                                                ]
                                                            }
                                                            onUpdate={(file) => {
                                                                if (file.length > 0) {
                                                                    setData(
                                                                        'payment_proof',
                                                                        file[0].file,
                                                                    );
                                                                } else {
                                                                    setData('payment_proof', '');
                                                                }
                                                            }}
                                                        />
                                                    </>
                                                )}

                                                {order.status === 'paid' && (
                                                    <>
                                                        <SelectInput
                                                            InputName={'Status'}
                                                            Error={errors.status}
                                                            Id={'status'}
                                                            Name={'status'}
                                                            Value={data.status}
                                                            Action={(value) =>
                                                                setData('status', value)
                                                            }
                                                            Placeholder={'Select Status'}
                                                            Required={true}
                                                            items={[
                                                                { id: 'paid', name: 'Paid' },
                                                                { id: 'shipped', name: 'Shipped' },
                                                            ]}
                                                            itemKey={'name'}
                                                        />

                                                        <SelectInput
                                                            InputName={'Select Courier Company'}
                                                            Id={'courier_company_selector'}
                                                            Name={'courier_company_selector'}
                                                            Value={selectedCourierId}
                                                            Action={(value) =>
                                                                handleCourierCompanyChange(value)
                                                            }
                                                            Placeholder={
                                                                'Select Courier Company to Auto-Fill'
                                                            }
                                                            Required={false}
                                                            items={orderCourierCompanies}
                                                            itemKey={'name'}
                                                        />

                                                        {/* ✅ Auto-filled - Read Only */}
                                                        <Input
                                                            InputName={'Courier Company Name'}
                                                            Id={'courier_company'}
                                                            Name={'courier_company'}
                                                            Type={'text'}
                                                            Value={data.courier_company}
                                                            Error={errors.courier_company}
                                                            Placeholder={
                                                                'Auto-filled from selection'
                                                            }
                                                            Required={true}
                                                            Disabled={true}
                                                            Action={() => {}}
                                                        />

                                                        <Input
                                                            InputName={'Courier Company Phone'}
                                                            Id={'courier_company_phone'}
                                                            Name={'courier_company_phone'}
                                                            Type={'text'}
                                                            Value={data.courier_company_phone}
                                                            Error={errors.courier_company_phone}
                                                            Placeholder={
                                                                'Auto-filled from selection'
                                                            }
                                                            Required={true}
                                                            Disabled={true}
                                                            Action={() => {}}
                                                        />

                                                        <Input
                                                            InputName={
                                                                'Courier Company Postal Code'
                                                            }
                                                            Id={'courier_company_postal_code'}
                                                            Name={'courier_company_postal_code'}
                                                            Type={'text'}
                                                            Value={data.courier_company_postal_code}
                                                            Error={
                                                                errors.courier_company_postal_code
                                                            }
                                                            Placeholder={
                                                                'Auto-filled from selection'
                                                            }
                                                            Required={true}
                                                            Disabled={true}
                                                            Action={() => {}}
                                                        />

                                                        <div>
                                                            <label
                                                                htmlFor="courier_company_address"
                                                                className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
                                                            >
                                                                Courier Company Address{' '}
                                                                <span className="font-bold text-black dark:text-white">
                                                                    *
                                                                </span>
                                                            </label>
                                                            <textarea
                                                                id="courier_company_address"
                                                                required
                                                                disabled
                                                                rows="3"
                                                                className="dark:bg-dark-900 shadow-theme-xs focus:ring-3 focus:outline-hidden mb-2 w-full min-w-0 max-w-full rounded-lg border border-gray-300 bg-gray-100 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90"
                                                                placeholder="Auto-filled from selection"
                                                                value={data.courier_company_address}
                                                                readOnly
                                                            ></textarea>
                                                            {errors.courier_company_address && (
                                                                <span className="ml-2 text-red-500 dark:text-white">
                                                                    {errors.courier_company_address}
                                                                </span>
                                                            )}
                                                        </div>

                                                        <Input
                                                            InputName={'Tracking No.'}
                                                            Id={'tracking_no'}
                                                            Name={'tracking_no'}
                                                            Type={'text'}
                                                            Value={data.tracking_no}
                                                            Error={errors.tracking_no}
                                                            Placeholder={'Enter Tracking No.'}
                                                            Required={true}
                                                            Action={(e) =>
                                                                setData(
                                                                    'tracking_no',
                                                                    e.target.value,
                                                                )
                                                            }
                                                        />

                                                        <Input
                                                            InputName={'Shipping Date'}
                                                            Id={'shipping_date'}
                                                            Name={'shipping_date'}
                                                            Type={'text'}
                                                            Value={data.shipping_date}
                                                            Error={errors.shipping_date}
                                                            Placeholder={'Enter Shipping Date.'}
                                                            InputRef={flatpickerForShippingDate}
                                                            Required={true}
                                                            Action={(e) =>
                                                                setData(
                                                                    'shipping_date',
                                                                    e.target.value,
                                                                )
                                                            }
                                                        />
                                                    </>
                                                )}

                                                {order.status === 'shipped' && (
                                                    <>
                                                        <SelectInput
                                                            InputName={'Status'}
                                                            Error={errors.status}
                                                            Id={'status'}
                                                            Name={'status'}
                                                            Value={data.status}
                                                            Action={(value) =>
                                                                setData('status', value)
                                                            }
                                                            Placeholder={'Select Status'}
                                                            Required={true}
                                                            items={[
                                                                { id: 'shipped', name: 'Shipped' },
                                                                {
                                                                    id: 'arrived_locally',
                                                                    name: 'Arrived Locally',
                                                                },
                                                            ]}
                                                            itemKey={'name'}
                                                        />
                                                    </>
                                                )}

                                                {order.status === 'arrived_locally' && (
                                                    <>
                                                        <SelectInput
                                                            InputName={'Status'}
                                                            Error={errors.status}
                                                            Id={'status'}
                                                            Name={'status'}
                                                            Value={data.status}
                                                            Action={(value) =>
                                                                setData('status', value)
                                                            }
                                                            Placeholder={'Select Status'}
                                                            Required={true}
                                                            items={[
                                                                {
                                                                    id: 'arrived_locally',
                                                                    name: 'Arrived Locally',
                                                                },
                                                                {
                                                                    id: 'delivered',
                                                                    name: 'Delivered',
                                                                },
                                                            ]}
                                                            itemKey={'name'}
                                                        />
                                                    </>
                                                )}

                                                {order.status !== 'pending' && (
                                                    <SelectInput
                                                        InputName={'Cash Collected Status'}
                                                        Error={errors.is_cash_collected}
                                                        Id={'is_cash_collected'}
                                                        Name={'is_cash_collected'}
                                                        Value={data.is_cash_collected}
                                                        Action={(value) =>
                                                            setData('is_cash_collected', value)
                                                        }
                                                        Placeholder={'Select Cash Collected Status'}
                                                        Required={true}
                                                        items={[
                                                            { id: 1, name: 'Yes' },
                                                            {
                                                                id: 0,
                                                                name: 'No',
                                                            },
                                                        ]}
                                                        itemKey={'name'}
                                                    />
                                                )}
                                            </div>

                                            {order.status === 'paid' && (
                                                <div className="col-span-1 my-4 grid">
                                                    <FileUploaderInput
                                                        InputName={'Courier Invoice'}
                                                        Id={'courier_invoice'}
                                                        Error={errors.courier_invoice}
                                                        Label={
                                                            'Drag & Drop your Courier invoice or <span class="filepond--label-action">Browse</span>'
                                                        }
                                                        MaxFileSize={'5MB'}
                                                        MaxFiles={1}
                                                        Multiple={false}
                                                        Required={true}
                                                        acceptedFileTypes={['application/pdf']}
                                                        DefaultFile={
                                                            order.courier_invoice && [
                                                                order.courier_invoice,
                                                            ]
                                                        }
                                                        onUpdate={(file) => {
                                                            if (file.length > 0) {
                                                                setData(
                                                                    'courier_invoice',
                                                                    file[0].file,
                                                                );
                                                            } else {
                                                                setData('courier_invoice', '');
                                                            }
                                                        }}
                                                    />
                                                </div>
                                            )}

                                            {order.status === 'arrived_locally' && (
                                                <div className="col-span-1 my-4 grid">
                                                    <FileUploaderInput
                                                        InputName={'Final Attachments'}
                                                        Id={'final_attachments'}
                                                        Error={errors.final_attachments}
                                                        Label={
                                                            'Drag & Drop your Final Attachments or <span class="filepond--label-action">Browse</span>'
                                                        }
                                                        MaxFileSize={'5MB'}
                                                        MaxFiles={10}
                                                        Multiple={true}
                                                        Required={false}
                                                        DefaultFile={
                                                            order.final_attachments && [
                                                                order.final_attachments,
                                                            ]
                                                        }
                                                        onUpdate={(files) => {
                                                            if (files.length > 0) {
                                                                const newFiles = files
                                                                    .filter((f) => f.isNew)
                                                                    .map((f) => f.file);

                                                                setData(
                                                                    'final_attachments',
                                                                    newFiles,
                                                                );
                                                            } else {
                                                                setData('final_attachments', null);
                                                            }
                                                        }}
                                                    />
                                                </div>
                                            )}
                                            <PrimaryButton
                                                Text={'Update Order'}
                                                Type={'submit'}
                                                CustomClass={'w-[200px] '}
                                                Disabled={
                                                    processing ||
                                                    data.status === '' ||
                                                    (order.status === 'pending' &&
                                                        data.payment_proof === '') ||
                                                    (order.status === 'paid' &&
                                                        data?.courier_company.trim() === '') ||
                                                    (order.status === 'paid' &&
                                                        data?.tracking_no.trim() === '') ||
                                                    data.courier_invoice === '' ||
                                                    data.shipping_date === '' ||
                                                    (order.status !== 'pending' &&
                                                        data.is_cash_collected === '')
                                                }
                                                Spinner={processing}
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
                                                            d="M12 4.5v15m7.5-7.5h-15"
                                                        />
                                                    </svg>
                                                }
                                            />
                                        </>
                                    }
                                />
                            </form>
                        </>
                    }
                />
            </AuthenticatedLayout>
        </>
    );
}
