import Card from '@/Components/Card';
import Input from '@/Components/Input';
import LinkButton from '@/Components/LinkButton';
import PrimaryButton from '@/Components/PrimaryButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BreadCrumb from '@/Components/BreadCrumb';
import { Head, useForm, usePage } from '@inertiajs/react';
import React from 'react';
import SelectInput from '@/Components/SelectInput';

export default function edit({ additional_fee_list }) {
    // Edit Data Form Data
    const { data, setData, put, processing, errors } = useForm({
        name: additional_fee_list.name || '',
        category: additional_fee_list?.category || '',
        value_type: additional_fee_list?.value_type || '',
        default_value: additional_fee_list?.default_value || '',
        is_active: additional_fee_list.is_active ?? 1,
    });


    const { currency } = usePage().props;
    // Update Data Form Request
    const submit = (e) => {
        e.preventDefault();
        put(route('dashboard.settings.additional_fee_lists.update', additional_fee_list.id));
    };

    return (
        <>
            <AuthenticatedLayout>
                <Head title="Settings - Additional Fee List" />

                <BreadCrumb
                    header={'Settings - Edit Additional Fee List'}
                    parent={'Additional Fee Lists'}
                    parent_link={route('dashboard.settings.additional_fee_lists.index')}
                    child={'Edit Additional Fee List'}
                />

                <Card
                    Content={
                        <>
                            <div className="flex flex-wrap justify-end my-3">
                                <LinkButton
                                    Text={'Back To Additional Fee Lists'}
                                    URL={route('dashboard.settings.additional_fee_lists.index')}
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
                                            <div className="grid grid-cols-1 gap-4 mb-10 md:grid-cols-2">
                                                <Input
                                                    InputName={'Additional Fee List Name'}
                                                    Error={errors.name}
                                                    Value={data.name}
                                                    Action={(e) => setData('name', e.target.value)}
                                                    Placeholder={'Enter Additional Fee List Name'}
                                                    Id={'name'}
                                                    Name={'name'}
                                                    Type={'text'}
                                                    Required={true}
                                                />


                                                <SelectInput
                                                    InputName={'Aditional Fee list Category'}
                                                    Id={'category'}
                                                    Name={'category'}
                                                    Value={data.category}
                                                    Error={errors.category}
                                                    Action={(value) => setData('category', value)}
                                                    items={[
                                                        { id: 'shipping_fee', name: "Shipping Fee" },
                                                        { id: 'import_tax', name: "Import Tax" },
                                                    ]}
                                                    itemKey={'name'}
                                                    Placeholder={'Select Aditional Fee list Category'}
                                                    Required={true}
                                                />



                                                <SelectInput
                                                    InputName={'Aditional Fee list Type'}
                                                    Id={'value_type'}
                                                    Name={'value_type'}
                                                    Value={data.value_type}
                                                    Error={errors.value_type}
                                                    Action={(value) => setData('value_type', value)}
                                                    items={[
                                                        { id: 'fixed', name: "Fixed" },
                                                        { id: 'percentage', name: "Percentage" },
                                                    ]}
                                                    itemKey={'name'}
                                                    Placeholder={'Select Aditional Fee list Type'}
                                                    Required={true}
                                                />


                                                <div className="flex items-center">
                                                    <Input
                                                        CustomCss={`w-[40px] ${!errors.default_value ? ' mt-5' : 'mt-0'}`}
                                                        Value={currency?.symbol}
                                                        readOnly={true}
                                                    />


                                                    <Input
                                                        InputName={'Additional Fee List Value'}
                                                        Error={errors.default_value}
                                                        Value={data.default_value}
                                                        Action={(e) => setData('default_value', e.target.value)}
                                                        Placeholder={'Enter Additional Fee List Value'}
                                                        Id={'default_value'}
                                                        Name={'default_value'}
                                                        Type={'number'}
                                                        Required={true}
                                                    />

                                                </div>


                                                <SelectInput
                                                    InputName={'Aditional Fee list Status'}
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
                                                    Placeholder={'Select Aditional Fee list Status'}
                                                    Required={true}
                                                />
                                            </div>

                                            <PrimaryButton
                                                Text={'Update Additional Fee List'}
                                                Type={'submit'}
                                                CustomClass={'w-[250px] '}
                                                Disabled={
                                                    processing ||
                                                    data.name.trim() === '' ||
                                                    data.category.trim() === '' ||
                                                    data.value_type.trim() === '' ||
                                                    data.default_value.trim() === '' ||
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
