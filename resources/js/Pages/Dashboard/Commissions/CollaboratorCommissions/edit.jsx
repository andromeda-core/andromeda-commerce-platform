import Card from '@/Components/Card';
import Input from '@/Components/Input';
import LinkButton from '@/Components/LinkButton';
import PrimaryButton from '@/Components/PrimaryButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BreadCrumb from '@/Components/BreadCrumb';
import { Head, useForm, usePage } from '@inertiajs/react';
import React from 'react';
import SelectInput from '@/Components/SelectInput';

export default function edit({ collaborator_commission }) {
    // Create Data Form Data
    const { data, setData, put, processing, errors, reset } = useForm({
        commission_rate: collaborator_commission?.commission_rate,
        commission_amount: collaborator_commission?.commission_amount,
        status: collaborator_commission?.status,
    });

    const { currency } = usePage().props;
    // Edit Data Form Request
    const submit = (e) => {
        e.preventDefault();
        put(
            route(
                'dashboard.commissions.collaborator-commissions.update',
                collaborator_commission?.id,
            ),
        );
    };

    return (
        <>
            <AuthenticatedLayout>
                <Head title="Collaborator Commissions" />

                <BreadCrumb
                    header={'Edit Collaborator Commission'}
                    parent={'Collaborator Commissions'}
                    parent_link={route('dashboard.commissions.collaborator-commissions.index')}
                    child={'Edit Collaborator Commission'}
                />

                <Card
                    Content={
                        <>
                            <div className="my-3 flex flex-wrap justify-end">
                                <LinkButton
                                    Text={'Back To Collaborator Commissions'}
                                    URL={route(
                                        'dashboard.commissions.collaborator-commissions.index',
                                    )}
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

                                                <div className="flex items-center">
                                                    <Input
                                                        CustomCss={'w-[40px] mt-5'}
                                                        Value={currency?.symbol}
                                                        readOnly={true}
                                                    />

                                                    <Input
                                                        InputName={'Commission Amount'}
                                                        Error={errors.commission_amount}
                                                        Value={data.commission_amount}
                                                        Action={(e) =>
                                                            setData(
                                                                'commission_amount',
                                                                e.target.value,
                                                            )
                                                        }
                                                        Placeholder={'Enter Commission Amount'}
                                                        Id={'commission_amount'}
                                                        Name={'commission_amount'}
                                                        Type={'number'}
                                                        Required={true}
                                                    />
                                                </div>

                                                <SelectInput
                                                    InputName={'Commission Status'}
                                                    Id={'status'}
                                                    Name={'status'}
                                                    Error={errors.status}
                                                    items={[
                                                        { id: 'paid', name: 'Paid' },
                                                        { id: 'unpaid', name: 'Un-Paid' },
                                                    ]}
                                                    itemKey={'name'}
                                                    Value={data.status}
                                                    Required={true}
                                                    Multiple={false}
                                                    Action={(value) => setData('status', value)}
                                                />
                                            </div>

                                            <PrimaryButton
                                                Text={'Update Collaborator Commission'}
                                                Type={'submit'}
                                                CustomClass={'w-[300px]'}
                                                Disabled={
                                                    processing ||
                                                    data.commission_amount === '' ||
                                                    data.commission_rate === '' ||
                                                    data.status === ''
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
