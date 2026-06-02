import Card from '@/Components/Card';
import LinkButton from '@/Components/LinkButton';
import PrimaryButton from '@/Components/PrimaryButton';
import SelectInput from '@/Components/SelectInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BreadCrumb from '@/Components/BreadCrumb';
import { Head, useForm, usePage } from '@inertiajs/react';
import React from 'react';

export default function create() {
    const { props } = usePage();
    const currencySymbol = props.currency?.symbol ?? '';

    // Create Data Form Data
    const { data, setData, post, processing, errors } = useForm({
        value: '',
        type: '',
        is_active: 1,
    });

    // Create Data Form Request
    const submit = (e) => {
        e.preventDefault();
        post(route('dashboard.settings.price-ranges.store'));
    };

    return (
        <>
            <AuthenticatedLayout>
                <Head title="Price Ranges" />

                <BreadCrumb
                    header={'Create Price Range'}
                    parent={'Price Ranges'}
                    parent_link={route('dashboard.settings.price-ranges.index')}
                    child={'Create Price Range'}
                />

                <Card
                    Content={
                        <>
                            <div className="flex flex-wrap justify-end my-3">
                                <LinkButton
                                    Text={'Back To Price Ranges'}
                                    URL={route('dashboard.settings.price-ranges.index')}
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
                                                {/* Value with currency symbol prefix */}
                                                <div className="w-full">
                                                    <label
                                                        htmlFor="value"
                                                        className="mb-1.5 block text-sm font-medium text-main-text-light dark:text-main-text-dark"
                                                    >
                                                        Value
                                                        <span className="font-bold text-main-text-light dark:text-main-text-dark">
                                                            {' '}
                                                            *
                                                        </span>
                                                    </label>
                                                    <div className="relative flex">
                                                        <span className="inline-flex h-[42px] items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-100 px-4 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90">
                                                            {currencySymbol}
                                                        </span>
                                                        <input
                                                            type="number"
                                                            id="value"
                                                            name="value"
                                                            min={0}
                                                            step="any"
                                                            className="shadow-theme-xs focus:ring-3 focus:outline-hidden h-[42px] w-full min-w-0 max-w-full rounded-r-md border border-gray-300 bg-transparent py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-blue-300 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-deepcharcoal dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-blue-800"
                                                            placeholder="Enter Value"
                                                            value={data.value}
                                                            onChange={(e) =>
                                                                setData('value', e.target.value)
                                                            }
                                                            required
                                                        />
                                                    </div>
                                                    {errors.value && (
                                                        <p className="mt-1 text-sm text-red-500">
                                                            {errors.value}
                                                        </p>
                                                    )}
                                                </div>

                                                <SelectInput
                                                    InputName={'Type'}
                                                    Id={'type'}
                                                    Name={'type'}
                                                    Value={data.type}
                                                    Error={errors.type}
                                                    Action={(value) => setData('type', value)}
                                                    items={[
                                                        { id: 'less_than', name: 'Less Than (Under)' },
                                                        {
                                                            id: 'greater_than',
                                                            name: 'Greater Than (Over)',
                                                        },
                                                    ]}
                                                    itemKey={'name'}
                                                    Placeholder={'Select Type'}
                                                    Required={true}
                                                />

                                                <SelectInput
                                                    InputName={'Status'}
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
                                                    Placeholder={'Select Status'}
                                                    Required={true}
                                                />
                                            </div>

                                            <PrimaryButton
                                                Text={'Create Price Range'}
                                                Type={'submit'}
                                                CustomClass={'w-[250px] '}
                                                Disabled={
                                                    processing ||
                                                    String(data.value).trim() === '' ||
                                                    data.type === '' ||
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
