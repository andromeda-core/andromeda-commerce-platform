import Card from '@/Components/Card';
import Input from '@/Components/Input';
import LinkButton from '@/Components/LinkButton';
import PrimaryButton from '@/Components/PrimaryButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BreadCrumb from '@/Components/BreadCrumb';
import { Head, useForm } from '@inertiajs/react';
import React from 'react';
import SelectInput from '@/Components/SelectInput';

export default function edit({ storage_location }) {
    // Create Data Form Data
    const { data, setData, put, processing, errors } = useForm({
        name: storage_location.name || '',
        address: storage_location.address || '',
        is_active: storage_location.is_active ?? 1,
    });

    // Edit Data Form Request
    const submit = (e) => {
        e.preventDefault();
        put(route('dashboard.settings.storage_locations.update', storage_location.id));
    };

    return (
        <>
            <AuthenticatedLayout>
                <Head title="Settings - Storage Locations" />

                <BreadCrumb
                    header={'Settings - Edit Storage Location'}
                    parent={'Storage Locations'}
                    parent_link={route('dashboard.settings.storage_locations.index')}
                    child={'Edit Storage Location'}
                />

                <Card
                    Content={
                        <>
                            <div className="flex flex-wrap justify-end my-3">
                                <LinkButton
                                    Text={'Back To Storage Locations'}
                                    URL={route('dashboard.settings.storage_locations.index')}
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
                                                    InputName={'Storage Location Name'}
                                                    Error={errors.name}
                                                    Value={data.name}
                                                    Action={(e) => setData('name', e.target.value)}
                                                    Placeholder={'Enter Storage Location Name'}
                                                    Id={'name'}
                                                    Name={'name'}
                                                    Type={'text'}
                                                    Required={true}
                                                />

                                                <div>
                                                    <label
                                                        htmlFor="address"
                                                        className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
                                                    >
                                                        Storage Location Address
                                                    </label>
                                                    <textarea
                                                        id="address"
                                                        rows="1"
                                                        className="dark:bg-dark-900 shadow-theme-xs focus:ring-3 focus:outline-hidden h-[42px] w-full min-w-0 max-w-full rounded-lg border border-gray-300 bg-transparent py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-blue-300 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-deepcharcoal dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-blue-800"
                                                        placeholder="Enter Storage Location Address"
                                                        value={data.address}
                                                        onChange={(e) =>
                                                            setData('address', e.target.value)
                                                        }
                                                    ></textarea>
                                                </div>

                                                <SelectInput
                                                    InputName={'Storage Location Status'}
                                                    Id={'is_active'}
                                                    Name={'is_active'}
                                                    Value={data.is_active}
                                                    Error={errors.is_active}
                                                    Action={(value) => setData('is_active', value)}
                                                    items={[
                                                        { id: 1, name: 'Active' },
                                                        { id: 0, name: 'In-Active' },
                                                    ]}
                                                    itemKey={'name'}
                                                    Placeholder={'Select Storage Location Status'}
                                                    Required={true}
                                                />
                                            </div>

                                            <PrimaryButton
                                                Text={'Update Storage Location'}
                                                Type={'submit'}
                                                CustomClass={'w-[250px]'}
                                                Disabled={
                                                    processing ||
                                                    data.name.trim() === '' ||
                                                    data.is_active === ''
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
