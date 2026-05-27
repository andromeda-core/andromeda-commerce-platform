import Card from '@/Components/Card';
import Input from '@/Components/Input';
import SelectInput from '@/Components/SelectInput';
import LinkButton from '@/Components/LinkButton';
import PrimaryButton from '@/Components/PrimaryButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BreadCrumb from '@/Components/BreadCrumb';
import { Head, useForm } from '@inertiajs/react';
import React from 'react';

export default function create({ countries }) {
    // Create Data Form Data
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        symbol: '',
        country_id: '',
        exchange_rate: '',
        rate_source: '',
    });

    // Create Data Form Request
    const submit = (e) => {
        e.preventDefault();
        post(route('dashboard.settings.currencies.store'));
    };

    return (
        <>
            <AuthenticatedLayout>
                <Head title="Settings - Currencies" />

                <BreadCrumb
                    header={'Settings - Create Currency'}
                    parent={'Currencies'}
                    parent_link={route('dashboard.settings.currencies.index')}
                    child={'Create Currency'}
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

                                                <SelectInput
                                                    InputName={'Country'}
                                                    Id={'country_id'}
                                                    Name={'country_id'}
                                                    Value={data.country_id}
                                                    Error={errors.country_id}
                                                    Action={(value) => setData('country_id', value)}
                                                    items={countries}
                                                    itemKey={'name'}
                                                    Placeholder={'Select Country (Optional)'}
                                                    Required={false}
                                                />

                                                <div>
                                                    <Input
                                                        InputName={'Exchange Rate (1 USD =)'}
                                                        Error={errors.exchange_rate}
                                                        Value={data.exchange_rate}
                                                        Action={(e) =>
                                                            setData('exchange_rate', e.target.value)
                                                        }
                                                        Placeholder={'e.g. 3570'}
                                                        Id={'exchange_rate'}
                                                        Name={'exchange_rate'}
                                                        Type={'number'}
                                                        Required={true}
                                                    />
                                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                        Enter how many units of this currency equal 1 USD. For USD itself, enter 1.
                                                    </p>
                                                </div>

                                                <Input
                                                    InputName={'Rate Source'}
                                                    Error={errors.rate_source}
                                                    Value={data.rate_source}
                                                    Action={(e) =>
                                                        setData('rate_source', e.target.value)
                                                    }
                                                    Placeholder={'e.g. Wise, Xe, Manual'}
                                                    Id={'rate_source'}
                                                    Name={'rate_source'}
                                                    Type={'text'}
                                                    Required={false}
                                                />
                                            </div>

                                            <PrimaryButton
                                                Text={'Create Currency'}
                                                Type={'submit'}
                                                CustomClass={'w-[250px]'}
                                                Disabled={
                                                    processing ||
                                                    data.name.trim() === '' ||
                                                    data.symbol.trim() === '' ||
                                                    data.exchange_rate === ''
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
