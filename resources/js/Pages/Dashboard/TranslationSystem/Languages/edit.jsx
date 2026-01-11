import Card from '@/Components/Card';
import Input from '@/Components/Input';
import LinkButton from '@/Components/LinkButton';
import PrimaryButton from '@/Components/PrimaryButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BreadCrumb from '@/Components/BreadCrumb';
import { Head, useForm } from '@inertiajs/react';
import React from 'react';

export default function edit({ language }) {


    // Edit Data Form Data
    const { data, setData, put, processing, errors } = useForm({
        name: language?.name || '',
        code: language?.code || '',
    });

    // Update Data Form Request
    const submit = (e) => {
        e.preventDefault();
        put(route('dashboard.translation-system.languages.update', language?.id));
    };

    return (
        <>
            <AuthenticatedLayout>
                <Head title="Translation System - Languages" />

                <BreadCrumb
                    header={'Languages - Edit Language'}
                    parent={'Languages'}
                    parent_link={route('dashboard.translation-system.languages.index')}
                    child={'Edit Language'}
                />

                <Card
                    Content={
                        <>
                            <div className="flex flex-wrap justify-end my-3">
                                <LinkButton
                                    Text={'Back To Language'}
                                    URL={route('dashboard.translation-system.languages.index')}
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
                                                    InputName={'Language Name'}
                                                    Error={errors.name}
                                                    Value={data.name}
                                                    Action={(e) => setData('name', e.target.value)}
                                                    Placeholder={'Enter Language Name'}
                                                    Id={'name'}
                                                    Name={'name'}
                                                    Type={'text'}
                                                    Required={true}
                                                />

                                                <Input
                                                    InputName={'Language Code'}
                                                    Error={errors.code}
                                                    Value={data.code}
                                                    Action={(e) =>
                                                        setData('code', e.target.value)
                                                    }
                                                    Placeholder={'Enter Language Code'}
                                                    Id={'code'}
                                                    Name={'code'}
                                                    Type={'text'}
                                                    Required={true}
                                                />


                                            </div>

                                            <PrimaryButton
                                                Text={'Update Language'}
                                                Type={'submit'}
                                                CustomClass={'w-[200px] '}
                                                Disabled={
                                                    processing ||
                                                    data.name.trim() === '' ||
                                                    data.code.trim() === ''

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
