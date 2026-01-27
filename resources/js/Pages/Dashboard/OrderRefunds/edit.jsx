import Card from '@/Components/Card';
import LinkButton from '@/Components/LinkButton';
import PrimaryButton from '@/Components/PrimaryButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BreadCrumb from '@/Components/BreadCrumb';
import { Head, useForm } from '@inertiajs/react';
import React from 'react';
import Input from '@/Components/Input';
import SelectInput from '@/Components/SelectInput';
import Textarea from '@/Components/Textarea';


export default function edit({ order_refund, currency }) {
    // Edit Data Form Data
    const { data, setData, post, processing, errors, reset } = useForm({
        _method: 'PUT',
        refund_status: order_refund?.refund_status || '',
        refund_method: order_refund?.refund_method || '',
        refund_reference: order_refund?.refund_reference || '',
        note: order_refund?.note || ''
    });


    console.log(data);
    // Edit Data Form Request
    const submit = (e) => {
        e.preventDefault();
        post(route('dashboard.order-refunds.update', order_refund?.id));
    };

    return (
        <>
            <AuthenticatedLayout>
                <Head title="Order Refund" />

                <BreadCrumb
                    header={'Edit Order Refund'}
                    parent={'Orders'}
                    parent_link={route('dashboard.order-refunds.index')}
                    child={'Edit Order Refund'}
                />

                <Card
                    Content={
                        <>
                            <div className="flex flex-wrap justify-end my-3">
                                <LinkButton
                                    Text={'Back To Orders'}
                                    URL={route('dashboard.order-refunds.index')}
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
                                                <Input
                                                    InputName={'Customer Name (Non Editable)'}
                                                    Id={'customer_name'}
                                                    Name={'customer_name'}
                                                    Type={'text'}
                                                    readOnly={true}
                                                    Value={order_refund?.customer?.user?.name}
                                                />


                                                <Input
                                                    InputName={'Order No (Non Editable)'}
                                                    Id={'order_no'}
                                                    Name={'order_no'}
                                                    Type={'text'}
                                                    readOnly={true}
                                                    Value={order_refund?.order?.order_no}
                                                />

                                                <div className="flex items-center">
                                                    <Input
                                                        CustomCss={'w-[40px] mt-5'}
                                                        Value={currency?.symbol}
                                                        readOnly={true}
                                                    />
                                                    <Input
                                                        InputName={'Refund Amount (Non Editable)'}
                                                        Id={'refund_amount'}
                                                        Name={'refund_amount'}
                                                        Type={'text'}
                                                        readOnly={true}
                                                        Value={order_refund?.refund_amount}
                                                    />

                                                </div>


                                                <Input
                                                    InputName={'Order Payment Method (Non Editable)'}
                                                    Id={'order_payment_method'}
                                                    Name={'order_payment_method'}
                                                    Type={'text'}
                                                    readOnly={true}
                                                    Value={order_refund?.order?.payment_method?.replace(/_/g, ' ').toUpperCase()}

                                                />


                                                <SelectInput
                                                    InputName={"Refund Status"}
                                                    Name={'refund_status'}
                                                    Id={'refund_status'}
                                                    Error={errors?.refund_status}
                                                    Value={data?.refund_status}
                                                    Placeholder={'Select Refund Status'}
                                                    customPlaceHolder={true}
                                                    items={[
                                                        { id: 'requested', name: "Requested" },
                                                        { id: 'approved', name: "Approved" },
                                                        { id: 'rejected', name: "Rejected" },
                                                        { id: 'completed', name: "Completed" },
                                                    ]}
                                                    itemKey={"name"}
                                                    Action={(value) => setData('refund_status', value)}

                                                />


                                                <SelectInput
                                                    InputName={"Refund Method"}
                                                    Name={'refund_method'}
                                                    Id={'refund_method'}
                                                    Error={errors?.refund_method}
                                                    Value={data?.refund_method}
                                                    Placeholder={'Select Refund Method'}
                                                    customPlaceHolder={true}
                                                    items={[
                                                        { id: 'bank_transfer', name: "bank Transfer" },
                                                        { id: 'points', name: "Points" },
                                                        { id: 'crypto', name: "Crypto" },
                                                    ]}
                                                    itemKey={"name"}
                                                    Action={(value) => setData('refund_method', value)}

                                                />

                                                {data?.refund_method === 'crypto' && (
                                                    <Input
                                                        InputName={'NowPayment Transaction ID'}
                                                        Id={'np_id'}
                                                        Name={'np_id'}
                                                        Type={'text'}
                                                        Disabled={true}
                                                        Value={order_refund?.order?.np_id}
                                                    />

                                                )}

                                                {(data?.refund_method === 'crypto' || data?.refund_method === 'bank_transfer') && (
                                                    <Input
                                                        InputName={'Refund Reference'}
                                                        Id={'refund_reference'}
                                                        Name={'refund_reference'}
                                                        Type={'text'}
                                                        Error={errors?.refund_reference}
                                                        Value={data?.refund_reference}
                                                        Action={(e) => setData('refund_reference', e.target.value)}
                                                        Placeholder={"Enter Refund Reference"}

                                                    />
                                                )}


                                            </div>

                                            <div className="grid grid-cols-1 gap-4 md:grid-cols-1">
                                                <Textarea
                                                    InputName={"Note"}
                                                    Id={'note'}
                                                    Name={'note'}
                                                    Rows={1}
                                                    Error={errors.note}
                                                    Value={data?.note}
                                                    Action={(e) => setData('note', e.target.value)}
                                                    Placeholder='Enter Internal Note'
                                                />
                                            </div>


                                            <div className="grid grid-cols-1 gap-4 md:grid-cols-1">
                                                <Textarea
                                                    InputName={"Customer Refund Reason (Non Editable)"}
                                                    Id={'customer_refund_reason'}
                                                    Name={'customer_refund_reason'}
                                                    Rows={6}
                                                    Value={order_refund?.refund_reason}
                                                    Disabled={true}
                                                />
                                            </div>

                                            <PrimaryButton
                                                Text={'Update Order Refund'}
                                                Type={'submit'}
                                                CustomClass={'w-[250px] '}
                                                Disabled={
                                                    processing ||
                                                    data?.refund_method === '' ||
                                                    data?.refund_status === ''

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
