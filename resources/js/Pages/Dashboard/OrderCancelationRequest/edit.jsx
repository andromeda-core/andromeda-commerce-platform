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


export default function edit({ orderCancelationRequest }) {
    // Edit Data Form Data
    const { data, setData, post, processing, errors, reset } = useForm({
        _method: 'PUT',
        status: orderCancelationRequest?.status || '',
        note: orderCancelationRequest?.note || '',
        order_no: orderCancelationRequest?.order?.order_no || ''
    });


    // Edit Data Form Request
    const submit = (e) => {
        e.preventDefault();
        post(route('dashboard.order-cancelation-requests.update', orderCancelationRequest?.id));
    };

    return (
        <>
            <AuthenticatedLayout>
                <Head title="Order Cancelations" />

                <BreadCrumb
                    header={'Edit Order Cancelation'}
                    parent={'Orders'}
                    parent_link={route('dashboard.order-cancelation-requests.index')}
                    child={'Edit Order Cancelation'}
                />

                <Card
                    Content={
                        <>
                            <div className="flex flex-wrap justify-end my-3">
                                <LinkButton
                                    Text={'Back To Requests'}
                                    URL={route('dashboard.order-cancelation-requests.index')}
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
                                                    Value={orderCancelationRequest?.customer?.user?.name || 'N/A'}
                                                />


                                                <Input
                                                    InputName={'Order No (Non Editable)'}
                                                    Id={'order_no'}
                                                    Name={'order_no'}
                                                    Type={'text'}
                                                    readOnly={true}
                                                    Value={orderCancelationRequest?.order?.order_no || 'N/A'}
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
                                                    InputName={"Customer Order Cancelation Reason (Non Editable)"}
                                                    Id={'customer_order_cancelation_reason'}
                                                    Name={'customer_order_cancelation_reason'}
                                                    Rows={6}
                                                    Value={orderCancelationRequest?.reason}
                                                    Disabled={true}
                                                />
                                            </div>

                                            <PrimaryButton
                                                Text={'Update Order Cancelation'}
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
