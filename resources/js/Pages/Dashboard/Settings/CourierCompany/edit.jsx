import Card from '@/Components/Card';
import Input from '@/Components/Input';
import LinkButton from '@/Components/LinkButton';
import PrimaryButton from '@/Components/PrimaryButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BreadCrumb from '@/Components/BreadCrumb';
import { Head, useForm } from '@inertiajs/react';
import React from 'react';

export default function edit({ courier_company }) {
    // Edit Data Form Data
    const { data, setData, put, processing, errors } = useForm({
        courier_name: courier_company?.courier_name || '',
        courier_code: courier_company?.courier_code || '',
        tracking_url: courier_company?.tracking_url || '',
        is_international: courier_company?.is_international || false,
    });

    // Update Data Form Request
    const submit = (e) => {
        e.preventDefault();
        put(route('dashboard.settings.courier-company-settings.update', courier_company?.id));
    };
    return (
        <>
            <AuthenticatedLayout>
                <Head title="Settings - Courier Company Settings" />

                <BreadCrumb
                    header={'Settings - Edit Courier Company'}
                    parent={'Courier Company Settings'}
                    parent_link={route('dashboard.settings.courier-company-settings.index')}
                    child={'Courier Company Settings'}
                />

                <Card
                    Content={
                        <>
                            <div className="flex flex-wrap justify-end my-3">
                                <LinkButton
                                    Text={'Back To Courier Company'}
                                    URL={route('dashboard.settings.courier-company-settings.index')}
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
                                            <div className="grid grid-cols-1 gap-4 mb-10 md:grid-cols-2">
                                                <Input
                                                    InputName={'Courier Name'}
                                                    Error={errors.courier_name}
                                                    Value={data.courier_name}
                                                    Action={(e) =>
                                                        setData(
                                                            'courier_name',
                                                            e.target.value,
                                                        )
                                                    }
                                                    Placeholder={'Enter Courier Name'}
                                                    Id={'courier_name'}
                                                    Name={'courier_name'}
                                                    Type={'text'}
                                                    Required={true}
                                                />


                                                <Input
                                                    InputName={'Courier Code'}
                                                    Error={errors.courier_code}
                                                    Value={data.courier_code}
                                                    Action={(e) =>
                                                        setData(
                                                            'courier_code',
                                                            e.target.value,
                                                        )
                                                    }
                                                    Placeholder={'Enter Courier Code'}
                                                    Id={'courier_code'}
                                                    Name={'courier_code'}
                                                    Type={'text'}
                                                    Required={true}
                                                />


                                                <Input
                                                    InputName={'Tracking URL'}
                                                    Error={errors.tracking_url}
                                                    Value={data.tracking_url}
                                                    Action={(e) =>
                                                        setData(
                                                            'tracking_url',
                                                            e.target.value,
                                                        )
                                                    }
                                                    Placeholder={'Enter Tracking URL'}
                                                    Id={'tracking_url'}
                                                    Name={'tracking_url'}
                                                    Type={'url'}
                                                    Required={true}
                                                />


                                                <Input
                                                    InputName={'Is International'}
                                                    Error={errors.is_international}
                                                    Value={data.is_international}
                                                    Action={(e) =>
                                                        setData(
                                                            'is_international',
                                                            e.target.checked,
                                                        )
                                                    }
                                                    Placeholder={'Enter Is International'}
                                                    Id={'is_international'}
                                                    Name={'is_international'}
                                                    Type={'checkbox'}

                                                    ClassName="!w-10  !text-blue-600  !rounded dark:!text-gray-800 !focus-ring-0 !ring-offset-0"
                                                />

                                            </div>



                                            <PrimaryButton
                                                Text={'Update Courier Company'}
                                                Type={'submit'}
                                                CustomClass={'w-[300px] '}
                                                Disabled={
                                                    processing ||
                                                    data.courier_name.trim() === '' ||
                                                    data.courier_code.trim() === '' ||
                                                    data.tracking_url.trim() === ''
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
