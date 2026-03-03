import Card from '@/Components/Card';
import Input from '@/Components/Input';
import LinkButton from '@/Components/LinkButton';
import PrimaryButton from '@/Components/PrimaryButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BreadCrumb from '@/Components/BreadCrumb';
import { Head, useForm } from '@inertiajs/react';
import React from 'react';
import SelectInput from '@/Components/SelectInput';

export default function assignSupplier({ suppliers, order_id }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        supplier_id: '',
        order_id: order_id || '',
        note: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('dashboard.orders.assignsupplier'));
    };

    return (
        <>
            <AuthenticatedLayout>
                <Head title="Assign Supplier" />

                <BreadCrumb
                    header={'Assign Supplier'}
                    parent={'Orders'}
                    parent_link={route('dashboard.orders.index')}
                    child={'Assign Supplier'}
                />

                <Card
                    Content={
                        <>
                            <div className="flex flex-wrap justify-end my-3">
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
                                                    InputName={'Supplier'}
                                                    Error={errors.supplier_id}
                                                    Value={data.supplier_id}
                                                    items={suppliers}
                                                    itemKey={'name'}
                                                    Action={(value) => setData('supplier_id', value)}
                                                    Placeholder={'Select Supplier'}
                                                    Id={'supplier_id'}
                                                    Name={'supplier_id'}
                                                    Required={true}
                                                />

                                                <Input
                                                    InputName={'Note For Supplier'}
                                                    Error={errors.note}
                                                    Value={data.note}
                                                    Action={(e) => setData('note', e.target.value)}
                                                    Placeholder={'Add Note'}
                                                    Id={'note'}
                                                    Name={'note'}
                                                    Required={false}
                                                />
                                            </div>

                                            <PrimaryButton
                                                Text={'Assign To Supplier'}
                                                Type={'submit'}
                                                CustomClass={'w-[200px] '}
                                                Disabled={processing || data.supplier_id === ''}
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
