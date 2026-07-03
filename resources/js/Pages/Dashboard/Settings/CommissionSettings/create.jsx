import Card from '@/Components/Card';
import Input from '@/Components/Input';
import LinkButton from '@/Components/LinkButton';
import PrimaryButton from '@/Components/PrimaryButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BreadCrumb from '@/Components/BreadCrumb';
import { Head, useForm } from '@inertiajs/react';
import React from 'react';
import SelectInput from '@/Components/SelectInput';

export default function create() {
    // Create Data Form Data
    const { data, setData, post, processing, errors } = useForm({
        type: '',
        commission_rate: '',
    });

    // Create Data Form Request
    const submit = (e) => {
        e.preventDefault();
        post(route('dashboard.settings.commission-settings.store'));
    };

    return (
        <>
            <AuthenticatedLayout>
                <Head title="Settings - Commission Settings" />

                <BreadCrumb
                    header={'Settings - Create Commission Setting'}
                    parent={'Commission Settings'}
                    parent_link={route('dashboard.settings.commission-settings.index')}
                    child={'Create Commission Setting'}
                />

                <Card
                    Content={
                        <>
                            <div className="flex flex-wrap justify-end my-3">
                                <LinkButton
                                    Text={'Back To  Commission Settings'}
                                    URL={route('dashboard.settings.commission-settings.index')}
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
                                                    InputName={'Type'}
                                                    Id={'type'}
                                                    Name={'type'}
                                                    Value={data.type}
                                                    Error={errors.type}
                                                    Action={(value) => setData('type', value)}
                                                    items={[
                                                        { name: 'collaborator' },
                                                        { name: 'distributor' },
                                                        { name: 'supplier' },
                                                        { name: 'platform' },
                                                        { id: 'accommodation_distributor', name: 'Accommodation Distributor' },
                                                        { id: 'accommodation_collaborator', name: 'Accommodation Collaborator' },
                                                        { id: 'accommodation_platform', name: 'Accommodation Platform' },
                                                    ]}
                                                    itemKey={'name'}
                                                    Placeholder={'Select  Type'}
                                                    Required={true}
                                                />

                                                <div className="flex items-center">
                                                    <Input
                                                        CustomCss={'w-[40px] mt-5'}
                                                        Value={'%'}
                                                        readOnly={true}
                                                    />

                                                    <Input
                                                        InputName={'Commission Rate'}
                                                        Error={errors.commission_rate}
                                                        Value={data.commission_rate}
                                                        Action={(e) =>
                                                            setData(
                                                                'commission_rate',
                                                                e.target.value,
                                                            )
                                                        }
                                                        Placeholder={'Enter Commission Rate'}
                                                        Id={'commission_rate'}
                                                        Name={'commission_rate'}
                                                        Type={'number'}
                                                        Required={true}
                                                    />
                                                </div>
                                            </div>

                                            <PrimaryButton
                                                Text={'Create Commission Setting'}
                                                Type={'submit'}
                                                CustomClass={'w-[300px] '}
                                                Disabled={
                                                    processing ||
                                                    data.type == '' ||
                                                    data.commission_rate == ''
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
