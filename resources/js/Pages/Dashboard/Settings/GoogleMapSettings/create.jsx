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
        google_map_api_key: '',
        google_map_id: '',
    });

    // Create Data Form Request
    const submit = (e) => {
        e.preventDefault();
        post(route('dashboard.settings.google-map-settings.store'));
    };

    return (
        <>
            <AuthenticatedLayout>
                <Head title="Settings - Google Map Settings" />

                <BreadCrumb
                    header={'Settings - Create Google Map Setting'}
                    parent={'Google Map Settings'}
                    parent_link={route('dashboard.settings.google-map-settings.index')}
                    child={'Create Google Map Setting'}
                />

                <Card
                    Content={
                        <>
                            <div className="flex flex-wrap justify-end my-3">
                                <LinkButton
                                    Text={'Back To Google Map Settings'}
                                    URL={route('dashboard.settings.google-map-settings.index')}
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
                                                    InputName={'Google Map API Key'}
                                                    Error={errors.google_map_api_key}
                                                    Value={data.google_map_api_key}
                                                    Action={(e) =>
                                                        setData(
                                                            'google_map_api_key',
                                                            e.target.value,
                                                        )
                                                    }
                                                    Placeholder={'Enter Google Map API Key'}
                                                    Id={'google_map_api_key'}
                                                    Name={'google_map_api_key'}
                                                    Type={'text'}
                                                    Required={true}
                                                />

                                                <Input
                                                    InputName={'Google Map ID'}
                                                    Error={errors.google_map_id}
                                                    Value={data.google_map_id}
                                                    Action={(e) =>
                                                        setData('google_map_id', e.target.value)
                                                    }
                                                    Placeholder={'Enter Google Map ID'}
                                                    Id={'google_map_id'}
                                                    Name={'google_map_id'}
                                                    Type={'text'}
                                                    Required={true}
                                                />
                                            </div>

                                            <PrimaryButton
                                                Text={'Create Google Map Setting'}
                                                Type={'submit'}
                                                CustomClass={'w-[250px] '}
                                                Disabled={
                                                    processing ||
                                                    data.google_map_api_key == '' ||
                                                    data.google_map_id == ''
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
