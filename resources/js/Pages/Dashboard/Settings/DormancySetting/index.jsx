import Card from '@/Components/Card';
import Input from '@/Components/Input';
import PrimaryButton from '@/Components/PrimaryButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BreadCrumb from '@/Components/BreadCrumb';
import { Head, useForm } from '@inertiajs/react';
import React from 'react';
import LinkButton from '@/Components/LinkButton';
import SelectInput from '@/Components/SelectInput';

export default function index({ dormancy_setting }) {
    // Update Dormancy Setting Form Data
    const { data, setData, put, processing, errors } = useForm({
        dormancy_threshold_type: dormancy_setting?.dormancy_threshold_type || '',
        dormancy_threshold_value: dormancy_setting?.dormancy_threshold_value || '',
    });

    // Update Dormancy Setting Form Request
    const submit = (e) => {
        e.preventDefault();
        put(route('dashboard.settings.dormancy-setting.save'));
    };
    return (
        <>
            <AuthenticatedLayout>
                <Head title="Settings - Dormancy Setting" />

                <BreadCrumb
                    header={'Settings - Dormancy Setting'}
                    parent={'Settings'}
                    parent_link={route('dashboard.settings.index')}
                    child={'Dormancy Setting'}
                />

                <Card
                    Content={
                        <>
                            <div className="flex flex-wrap justify-end my-3">
                                <LinkButton
                                    Text={'Back To Settings'}
                                    URL={route('dashboard.settings.index')}
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
                                <div className="w-full px-6 mb-4 lg:px-4">
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <SelectInput
                                            InputName={'Dormancy Threshold Type'}
                                            Placeholder={'Select Dormancy Type'}
                                            customPlaceHolder={true}
                                            Name={'dormancy_threshold_type'}
                                            Id={'dormancy_threshold_type'}
                                            Required={true}
                                            Action={(value) => setData('dormancy_threshold_type', value)}
                                            Value={data.dormancy_threshold_type}
                                            Error={errors.dormancy_threshold_type}
                                            items={[
                                                { value: 'minutes', name: 'Minutes' },
                                                { value: 'hours', name: 'Hours' },
                                                { value: 'days', name: 'Days' },
                                                { value: 'years', name: 'Years' },
                                            ]}
                                            itemKey={"value"}
                                        />

                                        <Input
                                            InputName={'Dormancy Threshold Value'}
                                            Placeholder={'Enter Dormancy Threshold Value'}
                                            Name={'dormancy_threshold_value'}
                                            Id={'dormancy_threshold_value'}
                                            Type={'number'}
                                            Required={false}
                                            Action={(e) => setData('dormancy_threshold_value', e.target.value)}
                                            Value={data.dormancy_threshold_value}
                                            Error={errors.dormancy_threshold_value}
                                        />
                                    </div>
                                </div>

                                <div className="mx-4 w-60">
                                    <PrimaryButton
                                        Text={'Save Changes'}
                                        Spinner={processing}
                                        Disabled={
                                            processing ||
                                            data?.dormancy_threshold_type?.trim() === '' ||
                                            String(data?.dormancy_setting?.dormancy_threshold_value)?.trim() === ''
                                        }
                                        Type={'submit'}
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
                                </div>
                            </form>
                        </>
                    }
                />
            </AuthenticatedLayout>
        </>
    );
}
