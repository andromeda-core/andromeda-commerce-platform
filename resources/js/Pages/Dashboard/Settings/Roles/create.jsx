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
        description: '',
    });

    // Create Data Form Request
    const submit = (e) => {
        e.preventDefault();
        post(route('dashboard.settings.roles.store'));
    };

    return (
        <>
            <AuthenticatedLayout>
                <Head title="Settings - Roles" />

                <BreadCrumb
                    header={'Settings - Create Role'}
                    parent={'Roles'}
                    parent_link={route('dashboard.settings.roles.index')}
                    child={'Create Role'}
                />

                <Card
                    Content={
                        <>
                            <div className="flex flex-wrap justify-end my-3">
                                <LinkButton
                                    Text={'Back To Roles'}
                                    URL={route('dashboard.settings.roles.index')}
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
                                                    InputName={'Role Name'}
                                                    Error={errors.name}
                                                    Value={data.name}
                                                    Action={(e) => setData('name', e.target.value)}
                                                    Placeholder={'Enter Role Name'}
                                                    Id={'name'}
                                                    Name={'name'}
                                                    Type={'text'}
                                                    Required={true}
                                                />

                                                <Input
                                                    InputName={'Role Description'}
                                                    Error={errors.description}
                                                    Value={data.description}
                                                    Action={(e) =>
                                                        setData('description', e.target.value)
                                                    }
                                                    Placeholder={'Enter Role Description'}
                                                    Id={'description'}
                                                    Name={'description'}
                                                    Type={'text'}
                                                    Required={false}
                                                />
                                            </div>

                                            <PrimaryButton
                                                Text={'Create Role'}
                                                Type={'submit'}
                                                CustomClass={'w-[200px] '}
                                                Disabled={processing || data.name.trim() === ''}
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
