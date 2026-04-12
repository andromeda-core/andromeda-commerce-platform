import Card from '@/Components/Card';
import Input from '@/Components/Input';
import LinkButton from '@/Components/LinkButton';
import PrimaryButton from '@/Components/PrimaryButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BreadCrumb from '@/Components/BreadCrumb';
import { Head, useForm, usePage } from '@inertiajs/react';
import React from 'react';
import SelectInput from '@/Components/SelectInput';

export default function Edit({ platform_commission, currencies }) {
    const { currency } = usePage().props;

    const { data, setData, put, processing, errors } = useForm({
        // READ-ONLY snapshot fields (show only)
        commission_rate: platform_commission?.commission_rate ?? 0,
        commission_amount: platform_commission?.commission_amount ?? 0,
        payout_method: platform_commission?.payout_method ?? '',

        // Editable fields (admin records)
        received_amount: platform_commission?.received_amount ?? '',
        received_method: platform_commission?.received_method ?? '',
        currency_id: platform_commission?.currency_id ?? '',
        note: platform_commission?.note ?? '',
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('dashboard.commissions.platform-commissions.update', platform_commission?.id));
    };

    const isRecorded = !!platform_commission?.recorded_at;

    const selectedCurrency = currencies?.find(
        (c) => c.id === data.currency_id
    );
    return (
        <AuthenticatedLayout>
            <Head title="Platform Commissions" />

            <BreadCrumb
                header={'Record Platform Commission'}
                parent={'Platform Commissions'}
                parent_link={route('dashboard.commissions.platform-commissions.index')}
                child={'Record Platform Commission'}
            />

            <Card
                Content={
                    <>
                        <div className="flex flex-wrap justify-end my-3">
                            <LinkButton
                                Text={'Back To Platform Commissions'}
                                URL={route('dashboard.commissions.platform-commissions.index')}
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
                            {/* Snapshot section (read-only) */}
                            <Card
                                Content={
                                    <>
                                        <h2 className="mb-3 text-lg font-semibold text-main-text-light dark:text-main-text-dark">
                                            Commission Snapshot (Auto)
                                        </h2>

                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <div className="flex items-center">
                                                <Input
                                                    CustomCss={'w-[40px] mt-5'}
                                                    Value={'%'}
                                                    readOnly={true}
                                                    Disabled={true}
                                                />
                                                <Input
                                                    InputName={'Commission Rate'}
                                                    Value={data.commission_rate}
                                                    readOnly={true}
                                                    Id={'commission_rate'}
                                                    Name={'commission_rate'}
                                                    Type={'number'}
                                                    Disabled={true}
                                                />
                                            </div>

                                            <div className="flex items-center">
                                                <Input
                                                    CustomCss={'w-[40px] mt-5'}
                                                    Value={currency?.symbol}
                                                    readOnly={true}
                                                    Disabled={true}
                                                />
                                                <Input
                                                    InputName={'Commission Amount'}
                                                    Value={data.commission_amount}
                                                    readOnly={true}
                                                    Id={'commission_amount'}
                                                    Name={'commission_amount'}
                                                    Type={'number'}
                                                    Disabled={true}
                                                />
                                            </div>

                                            <SelectInput
                                                InputName={'Payout Method (Auto)'}
                                                Id={'payout_method'}
                                                Name={'payout_method'}
                                                items={[
                                                    { id: 'crypto', name: 'Cryptocurrency' },
                                                    { id: 'bank_transfer', name: 'Bank Transfer' },
                                                    { id: 'points', name: 'Points' },
                                                ]}
                                                itemKey={'name'}
                                                Value={data.payout_method}
                                                Required={false}
                                                Multiple={false}
                                                isDisabled={true}
                                                Action={() => { }}
                                            />
                                        </div>
                                    </>
                                }
                            />

                            {/* Admin Recording section */}
                            <div className="mt-4">
                                <Card
                                    Content={
                                        <>
                                            <h2 className="mb-3 text-lg font-semibold text-main-text-light dark:text-main-text-dark">
                                                Record Received (Manual)
                                            </h2>

                                            {/* Optional info */}
                                            {isRecorded ? (
                                                <div className="p-3 mb-4 text-green-800 bg-green-100 rounded-lg">
                                                    This commission is already recorded at:{' '}
                                                    <b>{platform_commission?.recorded_at}</b>
                                                </div>
                                            ) : (
                                                <div className="p-3 mb-4 text-yellow-800 bg-yellow-100 rounded-lg">
                                                    Record the actual amount received, method, and currency.
                                                </div>
                                            )}

                                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                <SelectInput
                                                    InputName={'Currency'}
                                                    Id={'currency_id'}
                                                    Name={'currency_id'}
                                                    Error={errors.currency_id}
                                                    items={currencies ?? []}
                                                    itemKey={'name'} // if your currency object uses name
                                                    // If your currency object uses "code" instead, change itemKey to "code"
                                                    Value={data.currency_id}
                                                    Required={true}
                                                    Multiple={false}
                                                    Disabled={isRecorded}
                                                    Action={(value) => setData('currency_id', value)}
                                                />
                                                <div className="flex items-center">

                                                    <Input
                                                        CustomCss={'w-[40px] mt-5'}
                                                        Value={selectedCurrency?.symbol ?? ''}
                                                        readOnly={true}
                                                    />
                                                    <Input
                                                        InputName={'Received Amount'}
                                                        Error={errors.received_amount}
                                                        Value={data.received_amount}
                                                        Action={(e) => setData('received_amount', e.target.value)}
                                                        Placeholder={'Enter Received Amount'}
                                                        Id={'received_amount'}
                                                        Name={'received_amount'}
                                                        Type={'number'}
                                                        Required={true}
                                                        readOnly={isRecorded}
                                                    />
                                                </div>

                                                <SelectInput
                                                    InputName={'Received Method'}
                                                    Id={'received_method'}
                                                    Name={'received_method'}
                                                    Error={errors.received_method}
                                                    items={[
                                                        { id: 'crypto', name: 'Cryptocurrency' },
                                                        { id: 'bank_transfer', name: 'Bank Transfer' },
                                                        { id: 'points', name: 'Points' },
                                                    ]}
                                                    itemKey={'name'}
                                                    Value={data.received_method}
                                                    Required={true}
                                                    Multiple={false}
                                                    Disabled={isRecorded}
                                                    Action={(value) => setData('received_method', value)}
                                                />



                                                <Input
                                                    InputName={'Note (Optional)'}
                                                    Error={errors.note}
                                                    Value={data.note}
                                                    Action={(e) => setData('note', e.target.value)}
                                                    Placeholder={'Bank ref / tx hash / under-received reason...'}
                                                    Id={'note'}
                                                    Name={'note'}
                                                    Type={'text'}
                                                    Required={false}
                                                    readOnly={isRecorded}
                                                />
                                            </div>

                                            <PrimaryButton
                                                Text={isRecorded ? 'Already Recorded' : 'Record Platform Commission'}
                                                Type={'submit'}
                                                CustomClass={'w-[320px]'}
                                                Disabled={
                                                    processing ||
                                                    isRecorded ||
                                                    data.received_amount === '' ||
                                                    data.received_method === '' ||
                                                    data.currency_id === ''
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
                            </div>
                        </form>
                    </>
                }
            />
        </AuthenticatedLayout>
    );
}
