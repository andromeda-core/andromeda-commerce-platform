import Card from '@/Components/Card';
import Input from '@/Components/Input';
import LinkButton from '@/Components/LinkButton';
import PrimaryButton from '@/Components/PrimaryButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BreadCrumb from '@/Components/BreadCrumb';
import { Head, useForm } from '@inertiajs/react';
import React from 'react';

export default function edit({ currency }) {
    // Create Data Form Data
    const { data, setData, put, processing, errors } = useForm({
        name: currency.name || '',
        symbol: currency.symbol || '',
    });

    // Edit Data Form Request
    const submit = (e) => {
        e.preventDefault();
        put(route('dashboard.settings.currencies.update', currency.id));
    };

    return (
        <>
            <AuthenticatedLayout>
                <Head title="Settings - Currencies" />

                <BreadCrumb
                    header={'Settings - Edit Currency'}
                    parent={'Currencies'}
                    parent_link={route('dashboard.settings.currencies.index')}
                    child={'Edit Currency'}
                />

                <Card
                    Content={
                        <>
                            <div className="flex flex-wrap justify-end my-3">
                                <LinkButton
                                    Text={'Back To Currencies'}
                                    URL={route('dashboard.settings.currencies.index')}
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
                                                    InputName={'Currency Name'}
                                                    Error={errors.name}
                                                    Value={data.name}
                                                    Action={(e) => setData('name', e.target.value)}
                                                    Placeholder={'Enter Currency Name'}
                                                    Id={'name'}
                                                    Name={'name'}
                                                    Type={'text'}
                                                    Required={true}
                                                />

                                                <Input
                                                    InputName={'Currency Symbol'}
                                                    Error={errors.symbol}
                                                    Value={data.symbol}
                                                    Action={(e) =>
                                                        setData('symbol', e.target.value)
                                                    }
                                                    Placeholder={'Enter Currency Symbol'}
                                                    Id={'symbol'}
                                                    Name={'symbol'}
                                                    Type={'text'}
                                                    Required={true}
                                                />
                                            </div>

                                            <PrimaryButton
                                                Text={'Update Currency'}
                                                Type={'submit'}
                                                CustomClass={'w-[250px]'}
                                                Disabled={
                                                    processing ||
                                                    data.name.trim() === '' ||
                                                    data.symbol.trim() === ''
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
