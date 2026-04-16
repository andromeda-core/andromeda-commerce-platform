import Card from '@/Components/Card';
import Input from '@/Components/Input';
import LinkButton from '@/Components/LinkButton';
import PrimaryButton from '@/Components/PrimaryButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BreadCrumb from '@/Components/BreadCrumb';
import { Head, useForm } from '@inertiajs/react';
import React from 'react';

export default function edit({ orderCourierCompany }) {
    const { data, setData, put, processing, errors, reset } = useForm({
        name: orderCourierCompany?.name || '',
        address: orderCourierCompany?.address || '',
        postal_code: orderCourierCompany?.postal_code || '',
        phone: orderCourierCompany?.phone || '',
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('dashboard.order-courier-companies.update', orderCourierCompany.id));
    };

    return (
        <>
            <AuthenticatedLayout>
                <Head title="Edit Order Courier Company" />

                <BreadCrumb
                    header={'Edit Order Courier Company'}
                    parent={'Order Courier Companies'}
                    parent_link={route('dashboard.order-courier-companies.index')}
                    child={'Edit'}
                />

                <Card
                    Content={
                        <>
                            <div className="my-3 flex flex-wrap justify-end">
                                <LinkButton
                                    Text={'Back To Courier Companies'}
                                    URL={route('dashboard.order-courier-companies.index')}
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
                                                    InputName={'Company Name'}
                                                    Error={errors.name}
                                                    Value={data.name}
                                                    Action={(e) => setData('name', e.target.value)}
                                                    Placeholder={'Enter Company Name'}
                                                    Id={'name'}
                                                    Name={'name'}
                                                    Type={'text'}
                                                    Required={true}
                                                />

                                                <Input
                                                    InputName={'Postal Code'}
                                                    Error={errors.postal_code}
                                                    Value={data.postal_code}
                                                    Action={(e) =>
                                                        setData('postal_code', e.target.value)
                                                    }
                                                    Placeholder={'Enter Postal Code'}
                                                    Id={'postal_code'}
                                                    Name={'postal_code'}
                                                    Type={'text'}
                                                    Required={true}
                                                />

                                                <Input
                                                    InputName={'Phone'}
                                                    Error={errors.phone}
                                                    Value={data.phone}
                                                    Action={(e) => setData('phone', e.target.value)}
                                                    Placeholder={'Enter Phone'}
                                                    Id={'phone'}
                                                    Name={'phone'}
                                                    Type={'text'}
                                                    Required={true}
                                                />

                                                <div className="md:col-span-2">
                                                    <label
                                                        htmlFor="address"
                                                        className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
                                                    >
                                                        Address{' '}
                                                        <span className="text-red-500 dark:text-white">
                                                            *
                                                        </span>
                                                    </label>
                                                    <textarea
                                                        id="address"
                                                        rows="3"
                                                        className="dark:bg-dark-900 shadow-theme-xs focus:ring-3 focus:outline-hidden mb-2 w-full min-w-0 max-w-full rounded-lg border border-gray-300 bg-transparent py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-blue-300 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-deepcharcoal dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-blue-800"
                                                        placeholder="Enter Address here..."
                                                        value={data.address}
                                                        onChange={(e) =>
                                                            setData('address', e.target.value)
                                                        }
                                                    ></textarea>
                                                    {errors.address && (
                                                        <span className="ml-2 text-red-500 dark:text-white">
                                                            {errors.address}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <PrimaryButton
                                                Text={'Update Courier Company'}
                                                Type={'submit'}
                                                CustomClass={'w-[250px]'}
                                                Disabled={
                                                    processing ||
                                                    data.name.trim() === '' ||
                                                    data.address.trim() === '' ||
                                                    data.postal_code.trim() === '' ||
                                                    data.phone.trim() === ''
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
                                                            d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
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
