import Card from '@/Components/Card';
import Input from '@/Components/Input';
import LinkButton from '@/Components/LinkButton';
import PrimaryButton from '@/Components/PrimaryButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BreadCrumb from '@/Components/BreadCrumb';
import { Head, useForm } from '@inertiajs/react';
import React from 'react';
import Textarea from '@/Components/Textarea';

export default function edit({ translation_key }) {
    // Create Data Form Data
    const { data, setData, put, processing, errors } = useForm({
        key: translation_key?.key || '',
    });

    // Create Data Form Request
    const submit = (e) => {
        e.preventDefault();
        put(route('dashboard.translation-system.translation-keys.update', translation_key?.id));
    };

    return (
        <>
            <AuthenticatedLayout>
                <Head title="Translation System - Translation Keys" />

                <BreadCrumb
                    header={'Translation Keys - Edit Translation Key'}
                    parent={'Translation Keys'}
                    parent_link={route('dashboard.translation-system.translation-keys.index')}
                    child={'Edit Translation Key'}
                />

                <Card
                    Content={
                        <>
                            <div className="flex flex-wrap justify-end my-3">
                                <LinkButton
                                    Text={'Back To Translation Keys'}
                                    URL={route('dashboard.translation-system.translation-keys.index')}
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
                                            <div className="grid grid-cols-1 gap-4 md:grid-cols-1">
                                                <Textarea
                                                    InputName={'Translation Key'}
                                                    Error={errors.key}
                                                    Value={data.key}
                                                    Action={(e) => setData('key', e.target.value)}
                                                    Placeholder={'Enter Translation Key'}
                                                    Id={'key'}
                                                    Name={'key'}
                                                    Rows={1}
                                                    Required={true}
                                                />

                                            </div>

                                            <PrimaryButton
                                                Text={'Update Translation Key'}
                                                Type={'submit'}
                                                CustomClass={'w-[250px] '}
                                                Disabled={
                                                    processing ||
                                                    data.key.trim() === ''

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
