import Card from '@/Components/Card';
import Input from '@/Components/Input';
import LinkButton from '@/Components/LinkButton';
import PrimaryButton from '@/Components/PrimaryButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BreadCrumb from '@/Components/BreadCrumb';
import { Head, useForm } from '@inertiajs/react';
import React, { useState } from 'react';
import SelectInput from '@/Components/SelectInput';
import Swal from 'sweetalert2';

export default function create({ smartphones, customers }) {
    // Create Data Form Data
    const { data, setData, post, processing, errors, reset } = useForm({
        customer_id: '',
        smartphones: [],
        referral_code: '',
    });

    const [smartphonesData, setSmartphonesData] = useState([{ id: '', quantity: '' }]);

    const addSmartphone = () => {
        setSmartphonesData([
            ...smartphonesData,
            {
                id: '',
                quantity: '',
            },
        ]);
    };
    const removeSmartphone = (index) => {
        if (smartphonesData.length === 1) {
            Swal.fire({
                icon: 'info',
                title: 'Oops...',
                text: 'First Smartphone  Cannot be deleted',
            });
            return;
        }

        const updatedSmartphones = smartphonesData.filter((_, i) => i !== index);
        setSmartphonesData(updatedSmartphones);
        setData('smartphones', updatedSmartphones);
    };
    const handleSmartphoneChange = (index, field, value) => {
        const updatedSmartphones = [...smartphonesData];
        updatedSmartphones[index][field] = value;
        setData('smartphones', updatedSmartphones);
        setSmartphonesData(updatedSmartphones);
    };

    // Create Data Form Request
    const submit = (e) => {
        e.preventDefault();
        post(route('dashboard.orders.store'));
    };

    return (
        <>
            <AuthenticatedLayout>
                <Head title="Orders" />

                <BreadCrumb
                    header={'Create Order'}
                    parent={'Orders'}
                    parent_link={route('dashboard.orders.index')}
                    child={'Create Order'}
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
                                                <SelectInput
                                                    InputName={'Customer'}
                                                    Error={errors.customer_id}
                                                    Id={'customer_id'}
                                                    Name={'customer_id'}
                                                    Value={data.customer_id}
                                                    Action={(value) =>
                                                        setData('customer_id', value)
                                                    }
                                                    Placeholder={'Select Customer'}
                                                    Required={true}
                                                    items={customers}
                                                    itemKey={'name'}
                                                />

                                                <Input
                                                    InputName={'Referral Code'}
                                                    Id={'referral_code'}
                                                    Name={'referral_code'}
                                                    Error={errors.referral_code}
                                                    Placeholder={'Enter Referral Code'}
                                                    Type={'text'}
                                                    Value={data.referral_code}
                                                    Required={false}
                                                    Action={(e) =>
                                                        setData('referral_code', e.target.value)
                                                    }
                                                />
                                            </div>

                                            <div className="flex w-full items-center justify-end">
                                                <PrimaryButton
                                                    Text={'Add More Smartphones'}
                                                    Type={'button'}
                                                    Id={'add_more_smartphones'}
                                                    CustomClass={'w-[250px] '}
                                                    Action={addSmartphone}
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
                                                                d="m4.5 5.25 7.5 7.5 7.5-7.5m-15 6 7.5 7.5 7.5-7.5"
                                                            />
                                                        </svg>
                                                    }
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 gap-4">
                                                {smartphonesData.map((item, idx) => (
                                                    <Card
                                                        key={idx}
                                                        Content={
                                                            <>
                                                                <div className="flex items-center justify-end">
                                                                    {/* Delete Button */}
                                                                    <PrimaryButton
                                                                        Type="button"
                                                                        Action={() =>
                                                                            removeSmartphone(idx)
                                                                        }
                                                                        CustomClass="w-[50px] bg-red-500 hover:bg-red-600"
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
                                                                                    d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                                                                                />
                                                                            </svg>
                                                                        }
                                                                    />
                                                                </div>

                                                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                                    <SelectInput
                                                                        InputName="Smartphone"
                                                                        Id="smartphone_id"
                                                                        Name="smartphone_id"
                                                                        items={smartphones}
                                                                        Value={item.id}
                                                                        itemKey="name"
                                                                        Required={true}
                                                                        Action={(value) =>
                                                                            handleSmartphoneChange(
                                                                                idx,
                                                                                'id',
                                                                                value,
                                                                            )
                                                                        }
                                                                    />

                                                                    <Input
                                                                        InputName={'Quantity'}
                                                                        Id={'quantity'}
                                                                        Name={'quantity'}
                                                                        Type={'number'}
                                                                        Value={item.quantity}
                                                                        Placeholder={
                                                                            'Enter Quantity'
                                                                        }
                                                                        Required={true}
                                                                        Action={(e) =>
                                                                            handleSmartphoneChange(
                                                                                idx,
                                                                                'quantity',
                                                                                e.target.value,
                                                                            )
                                                                        }
                                                                    />
                                                                </div>
                                                            </>
                                                        }
                                                    />
                                                ))}
                                            </div>

                                            <PrimaryButton
                                                Text={'Create Order'}
                                                Type={'submit'}
                                                CustomClass={'w-[200px] '}
                                                Disabled={
                                                    processing ||
                                                    data.customer_id === '' ||
                                                    smartphonesData.some((smartphone) => {
                                                        return (
                                                            smartphone.id === '' ||
                                                            smartphone.quantity === ''
                                                        );
                                                    })
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
