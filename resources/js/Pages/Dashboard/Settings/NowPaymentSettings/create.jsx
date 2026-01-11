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
        now_payment_api_key: '',
        now_payment_public_key: '',
        now_payment_baseurl: '',
    });

    // Create Data Form Request
    const submit = (e) => {
        e.preventDefault();
        post(route('dashboard.settings.now-payment-settings.store'));
    };

    return (
        <>
            <AuthenticatedLayout>
                <Head title="Settings - NOWPayment Settings" />

                <BreadCrumb
                    header={'Settings - Create NOWPayment Setting'}
                    parent={'NOWPayment Settings'}
                    parent_link={route('dashboard.settings.now-payment-settings.index')}
                    child={'NowPayment Settings'}
                />

                <Card
                    Content={
                        <>
                            <div className="flex flex-wrap justify-end my-3">
                                <LinkButton
                                    Text={'Back To Now Payment Settings'}
                                    URL={route('dashboard.settings.now-payment-settings.index')}
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
                                                    InputName={'NOWPayment API Key'}
                                                    Error={errors.now_payment_api_key}
                                                    Value={data.now_payment_api_key}
                                                    Action={(e) =>
                                                        setData(
                                                            'now_payment_api_key',
                                                            e.target.value,
                                                        )
                                                    }
                                                    Placeholder={'Enter NOWPayment API Key'}
                                                    Id={'now_payment_api_key'}
                                                    Name={'now_payment_api_key'}
                                                    Type={'text'}
                                                    Required={true}
                                                />

                                                <Input
                                                    InputName={'NOWPayment Public Key'}
                                                    Error={errors.now_payment_public_key}
                                                    Value={data.now_payment_public_key}
                                                    Action={(e) =>
                                                        setData(
                                                            'now_payment_public_key',
                                                            e.target.value,
                                                        )
                                                    }
                                                    Placeholder={'Enter NOWPayment Public Key'}
                                                    Id={'now_payment_public_key'}
                                                    Name={'now_payment_public_key'}
                                                    Type={'text'}
                                                    Required={true}
                                                />

                                                <Input
                                                    InputName={'NOWPayment Base URL'}
                                                    Error={errors.now_payment_baseurl}
                                                    Value={data.now_payment_baseurl}
                                                    Action={(e) =>
                                                        setData(
                                                            'now_payment_baseurl',
                                                            e.target.value,
                                                        )
                                                    }
                                                    Placeholder={'Enter NOWPayment Base URL'}
                                                    Id={'now_payment_baseurl'}
                                                    Name={'now_payment_baseurl'}
                                                    Type={'url'}
                                                    Required={true}
                                                />
                                            </div>

                                            <PrimaryButton
                                                Text={'Create NOWPayment Setting'}
                                                Type={'submit'}
                                                CustomClass={'w-[300px] '}
                                                Disabled={
                                                    processing ||
                                                    data.now_payment_api_key.trim() === '' ||
                                                    data.now_payment_public_key.trim() === '' ||
                                                    data.now_payment_baseurl.trim() === ''
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
