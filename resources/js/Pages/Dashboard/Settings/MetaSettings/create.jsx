import Card from '@/Components/Card';
import Input from '@/Components/Input';
import LinkButton from '@/Components/LinkButton';
import PrimaryButton from '@/Components/PrimaryButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BreadCrumb from '@/Components/BreadCrumb';
import { Head, useForm } from '@inertiajs/react';
import React from 'react';

export default function create() {
    // Create Data Form Data
    const { data, setData, post, processing, errors } = useForm({
        meta_app_id: '',
        meta_app_secret: '',
    });

    // Create Data Form Request
    const submit = (e) => {
        e.preventDefault();
        post(route('dashboard.settings.meta-settings.store'));
    };

    return (
        <>
            <AuthenticatedLayout>
                <Head title="Settings - Meta Settings" />

                <BreadCrumb
                    header={'Settings - Create Meta Setting'}
                    parent={'Meta Settings'}
                    parent_link={route('dashboard.settings.meta-settings.index')}
                    child={'Create Meta Setting'}
                />

                <Card
                    Content={
                        <>
                            <div className="flex flex-wrap justify-end my-3">
                                <LinkButton
                                    Text={'Back To Meta Settings'}
                                    URL={route('dashboard.settings.meta-settings.index')}
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
                                                    InputName={'Meta APP ID'}
                                                    Error={errors.meta_app_id}
                                                    Value={data.meta_app_id}
                                                    Action={(e) =>
                                                        setData('meta_app_id', e.target.value)
                                                    }
                                                    Placeholder={'Enter Meta APP ID'}
                                                    Id={'meta_app_id'}
                                                    Name={'meta_app_id'}
                                                    Type={'text'}
                                                    Required={true}
                                                />

                                                <Input
                                                    InputName={'Meta APP Secret'}
                                                    Error={errors.meta_app_secret}
                                                    Value={data.meta_app_secret}
                                                    Action={(e) =>
                                                        setData('meta_app_secret', e.target.value)
                                                    }
                                                    Placeholder={'Enter Meta APP Secret'}
                                                    Id={'meta_app_secret'}
                                                    Name={'meta_app_secret'}
                                                    Type={'text'}
                                                    Required={true}
                                                />
                                            </div>

                                            <PrimaryButton
                                                Text={'Create Meta Setting'}
                                                Type={'submit'}
                                                CustomClass={'w-[250px] '}
                                                Disabled={
                                                    processing ||
                                                    data.meta_app_id == '' ||
                                                    data.meta_app_secret == ''
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
