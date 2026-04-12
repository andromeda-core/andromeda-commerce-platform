import Card from '@/Components/Card';
import Input from '@/Components/Input';
import LinkButton from '@/Components/LinkButton';
import PrimaryButton from '@/Components/PrimaryButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BreadCrumb from '@/Components/BreadCrumb';
import { Head, useForm } from '@inertiajs/react';
import React from 'react';
import SelectInput from '@/Components/SelectInput';

export default function create({ users }) {
    // Create Data Form Data
    const { data, setData, post, processing, errors, reset } = useForm({
        user_id: '',
        points: '',
    });

    // Create Data Form Request
    const submit = (e) => {
        e.preventDefault();
        post(route('dashboard.reward-points.store'));
    };

    return (
        <>
            <AuthenticatedLayout>
                <Head title="Reward Points" />

                <BreadCrumb
                    header={'Create Reward Point'}
                    parent={'Reward Points'}
                    parent_link={route('dashboard.reward-points.index')}
                    child={'Create Reward Point'}
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
                                                Text={'Create Reward Point'}
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
