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
        name: '',
        icon: '',
        alias: '',
        parent_name: '',
    });

    // Create Data Form Request
    const submit = (e) => {
        e.preventDefault();
        post(route('dashboard.settings.permissions.store'));
    };

    return (
        <>
            <AuthenticatedLayout>
                <Head title="Settings - Permissions" />

                <BreadCrumb
                    header={'Settings - Create Permission'}
                    parent={'Permissions'}
                    parent_link={route('dashboard.settings.permissions.index')}
                    child={'Create Permission'}
                />

                <Card
                    Content={
                        <>
                            <div className="flex flex-wrap justify-end my-3">
                                <LinkButton
                                    Text={'Back To Permissions'}
                                    URL={route('dashboard.settings.permissions.index')}
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
                                                    InputName={'Permission Name'}
                                                    Error={errors.name}
                                                    Value={data.name}
                                                    Action={(e) => setData('name', e.target.value)}
                                                    Placeholder={'Enter Permission Name'}
                                                    Id={'name'}
                                                    Name={'name'}
                                                    Type={'text'}
                                                    Required={true}
                                                />


                                                <Input
                                                    InputName={'Permission Name Alias'}
                                                    Error={errors.alias}
                                                    Value={data.alias}
                                                    Action={(e) =>
                                                        setData('alias', e.target.value)
                                                    }
                                                    Placeholder={'Enter Permission Name Alias'}
                                                    Id={'alias'}
                                                    Name={'alias'}
                                                    Type={'text'}
                                                    Required={false}
                                                />

                                                <Input
                                                    InputName={'Permission Parent Name'}
                                                    Error={errors.parent_name}
                                                    Value={data.parent_name}
                                                    Action={(e) =>
                                                        setData('parent_name', e.target.value)
                                                    }
                                                    Placeholder={'Enter Permission Parent Name'}
                                                    Id={'parent_name'}
                                                    Name={'parent_name'}
                                                    Type={'text'}
                                                    Required={true}
                                                />

                                                <Input
                                                    InputName={'Permission ICON'}
                                                    Error={errors.icon}
                                                    Value={data.icon}
                                                    Action={(e) => setData('icon', e.target.value)}
                                                    Placeholder={'Enter Permission ICON'}
                                                    Id={'icon'}
                                                    Name={'icon'}
                                                    Type={'text'}
                                                    Required={true}
                                                />
                                            </div>

                                            <PrimaryButton
                                                Text={'Create Permission'}
                                                Type={'submit'}
                                                CustomClass={'w-[200px] '}
                                                Disabled={
                                                    processing ||
                                                    data.name.trim() === '' ||
                                                    data.icon.trim() === '' ||
                                                    data.parent_name.trim() === ''
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
