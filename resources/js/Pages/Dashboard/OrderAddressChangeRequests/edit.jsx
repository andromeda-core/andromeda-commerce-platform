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


export default function edit({ order_address_change_request }) {
    // Edit Data Form Data
    const { data, setData, post, processing, errors, reset } = useForm({
        _method: 'PUT',
        status: order_address_change_request?.status || '',
        note: order_address_change_request?.note || ''
    });


    // Edit Data Form Request
    const submit = (e) => {
        e.preventDefault();
        post(route('dashboard.order-address-change-requests.update', order_address_change_request?.id));
    };

    return (
        <>
            <AuthenticatedLayout>
                <Head title="Order Address Changes" />

                <BreadCrumb
                    header={'Edit Order Address Changes'}
                    parent={'Orders'}
                    parent_link={route('dashboard.order-address-change-requests.index')}
                    child={'Edit Order Address Changes'}
                />

                <Card
                    Content={
                        <>
                            <div className="flex flex-wrap justify-end my-3">
                                <LinkButton
                                    Text={'Back To Orders'}
                                    URL={route('dashboard.order-address-change-requests.index')}
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
                                                    Value={order_address_change_request?.customer?.user?.name || 'N/A'}
                                                />


                                                <Input
                                                    InputName={'Order No (Non Editable)'}
                                                    Id={'order_no'}
                                                    Name={'order_no'}
                                                    Type={'text'}
                                                    readOnly={true}
                                                    Value={order_address_change_request?.order?.order_no || 'N/A'}
                                                />


                                                <Input
                                                    InputName={'Shipping Name (Non Editable)'}
                                                    Id={'shipping_name'}
                                                    Name={'shipping_name'}
                                                    Type={'text'}
                                                    readOnly={true}
                                                    Value={order_address_change_request?.shipping_name || 'N/A'}
                                                />

                                                <Input
                                                    InputName={'Shipping Phone (Non Editable)'}
                                                    Id={'shipping_phone'}
                                                    Name={'shipping_phone'}
                                                    Type={'text'}
                                                    readOnly={true}
                                                    Value={order_address_change_request?.shipping_phone || 'N/A'}
                                                />



                                                <Input
                                                    InputName={'Shipping Country (Non Editable)'}
                                                    Id={'shipping_country'}
                                                    Name={'shipping_country'}
                                                    Type={'text'}
                                                    readOnly={true}
                                                    Value={order_address_change_request?.shipping_country || 'N/A'}
                                                />


                                                <Input
                                                    InputName={'Shipping City (Non Editable)'}
                                                    Id={'shipping_city'}
                                                    Name={'shipping_city'}
                                                    Type={'text'}
                                                    readOnly={true}
                                                    Value={order_address_change_request?.shipping_city || 'N/A'}
                                                />


                                                <Input
                                                    InputName={'Shipping State (Non Editable)'}
                                                    Id={'shipping_state'}
                                                    Name={'shipping_state'}
                                                    Type={'text'}
                                                    readOnly={true}
                                                    Value={order_address_change_request?.shipping_state || 'N/A'}
                                                />


                                                <Input
                                                    InputName={'Shipping Postal Code (Non Editable)'}
                                                    Id={'shipping_postal_code'}
                                                    Name={'shipping_postal_code'}
                                                    Type={'text'}
                                                    readOnly={true}
                                                    Value={order_address_change_request?.shipping_postal_code || 'N/A'}
                                                />


                                                <Textarea
                                                    InputName={"Shipping Address Line 1"}
                                                    Id={'shipping_address_line1'}
                                                    Name={'shipping_address_line1'}
                                                    Rows={6}
                                                    Disabled={true}
                                                    Value={order_address_change_request?.shipping_address_line1 || 'N/A'}
                                                />


                                                <Textarea
                                                    InputName={"Shipping Address Line 2"}
                                                    Id={'shipping_address_line2'}
                                                    Name={'shipping_address_line2'}
                                                    Rows={6}
                                                    Disabled={true}
                                                    Value={order_address_change_request?.shipping_address_line2 || "N/A"}
                                                />




                                                <SelectInput
                                                    InputName={"Status"}
                                                    Name={'status'}
                                                    Id={'status'}
                                                    Error={errors?.status}
                                                    Value={data?.status}
                                                    Placeholder={'Select Status'}
                                                    customPlaceHolder={true}
                                                    items={[
                                                        { id: 'requested', name: "Requested" },
                                                        { id: 'approved', name: "Approved" },
                                                        { id: 'rejected', name: "Rejected" },
                                                    ]}
                                                    itemKey={"name"}
                                                    Action={(value) => setData('status', value)}

                                                />

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
                                                    InputName={"Customer Address Change Reason (Non Editable)"}
                                                    Id={'customer_refund_reason'}
                                                    Name={'customer_refund_reason'}
                                                    Rows={6}
                                                    Value={order_address_change_request?.reason}
                                                    Disabled={true}
                                                />
                                            </div>

                                            <PrimaryButton
                                                Text={'Update Order Address Change'}
                                                Type={'submit'}
                                                CustomClass={'w-[300px] '}
                                                Disabled={
                                                    processing ||
                                                    data?.status === ''

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
