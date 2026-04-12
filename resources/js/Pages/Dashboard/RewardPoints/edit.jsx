import Card from '@/Components/Card';
import Input from '@/Components/Input';
import LinkButton from '@/Components/LinkButton';
import PrimaryButton from '@/Components/PrimaryButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BreadCrumb from '@/Components/BreadCrumb';
import { Head, useForm } from '@inertiajs/react';
import React from 'react';
import SelectInput from '@/Components/SelectInput';

export default function edit({ reward_point, users }) {
    // Create Data Form Data
    const { data, setData, put, processing, errors, reset } = useForm({
        user_id: reward_point.user_id || '',
        points: reward_point.points || '',
    });

    // Edit Data Form Request
    const submit = (e) => {
        e.preventDefault();
        put(route('dashboard.reward-points.update', reward_point.id));
    };

    return (
        <>
            <AuthenticatedLayout>
                <Head title="Reward Points" />

                <BreadCrumb
                    header={'Edit Reward Point'}
                    parent={'Reward Points'}
                    parent_link={route('dashboard.reward-points.index')}
                    child={'Edit Reward Point'}
                />

                <Card
                    Content={
                        <>
                            <div className="my-3 flex flex-wrap justify-end">
                                <LinkButton
                                    Text={'Back To Reward Points'}
                                    URL={route('dashboard.reward-points.index')}
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
                                                    InputName={'User'}
                                                    Id={'user_id'}
                                                    Name={'user_id'}
                                                    Error={errors.user_id}
                                                    items={users}
                                                    itemKey={'name'}
                                                    Value={data.user_id}
                                                    Required={true}
                                                    Action={(value) => setData('user_id', value)}
                                                />

                                                <Input
                                                    InputName={'Points'}
                                                    Error={errors.points}
                                                    Value={data.points}
                                                    Action={(e) =>
                                                        setData('points', e.target.value)
                                                    }
                                                    Placeholder={'Enter Points'}
                                                    Id={'points'}
                                                    Name={'points'}
                                                    Type={'number'}
                                                    Required={true}
                                                />
                                            </div>

                                            <PrimaryButton
                                                Text={'Update Reward Point'}
                                                Type={'submit'}
                                                CustomClass={'w-[250px] '}
                                                Disabled={
                                                    processing ||
                                                    data.user_id === '' ||
                                                    data.points === ''
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
