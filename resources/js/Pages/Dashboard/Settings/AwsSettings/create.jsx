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
        aws_access_key_id: '',
        aws_secret_access_key: '',
        aws_region: '',
        aws_bucket: '',
        aws_url: '',
    });

    // Create Data Form Request
    const submit = (e) => {
        e.preventDefault();
        post(route('dashboard.settings.aws-settings.store'));
    };

    return (
        <>
            <AuthenticatedLayout>
                <Head title="Settings - AWS Settings" />

                <BreadCrumb
                    header={'Settings - Create AWS Setting'}
                    parent={'AWS Settings'}
                    parent_link={route('dashboard.settings.aws-settings.index')}
                    child={'Create AWS Setting'}
                />

                <Card
                    Content={
                        <>
                            <div className="flex flex-wrap justify-end my-3">
                                <LinkButton
                                    Text={'Back To AWS Settings'}
                                    URL={route('dashboard.settings.aws-settings.index')}
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
                                                    InputName={'AWS Access Key ID'}
                                                    Error={errors.aws_access_key_id}
                                                    Value={data.aws_access_key_id}
                                                    Action={(e) =>
                                                        setData('aws_access_key_id', e.target.value)
                                                    }
                                                    Placeholder={'Enter AWS Access Key ID'}
                                                    Id={'aws_access_key_id'}
                                                    Name={'aws_access_key_id'}
                                                    Type={'text'}
                                                    Required={true}
                                                />

                                                <Input
                                                    InputName={'AWS Secret Access Key'}
                                                    Error={errors.aws_secret_access_key}
                                                    Value={data.aws_secret_access_key}
                                                    Action={(e) =>
                                                        setData(
                                                            'aws_secret_access_key',
                                                            e.target.value,
                                                        )
                                                    }
                                                    Placeholder={'Enter AWS Secret Access Key'}
                                                    Id={'aws_secret_access_key'}
                                                    Name={'aws_secret_access_key'}
                                                    Type={'text'}
                                                    Required={true}
                                                />

                                                <Input
                                                    InputName={'AWS Region'}
                                                    Error={errors.aws_region}
                                                    Value={data.aws_region}
                                                    Action={(e) =>
                                                        setData('aws_region', e.target.value)
                                                    }
                                                    Placeholder={'Enter AWS Region'}
                                                    Id={'aws_region'}
                                                    Name={'aws_region'}
                                                    Type={'text'}
                                                    Required={true}
                                                />

                                                <Input
                                                    InputName={'AWS Bucket'}
                                                    Error={errors.aws_bucket}
                                                    Value={data.aws_bucket}
                                                    Action={(e) =>
                                                        setData('aws_bucket', e.target.value)
                                                    }
                                                    Placeholder={'Enter AWS Bucket'}
                                                    Id={'aws_bucket'}
                                                    Name={'aws_bucket'}
                                                    Type={'text'}
                                                    Required={true}
                                                />

                                                <Input
                                                    InputName={'AWS URL'}
                                                    Error={errors.aws_url}
                                                    Value={data.aws_url}
                                                    Action={(e) =>
                                                        setData('aws_url', e.target.value)
                                                    }
                                                    Placeholder={'Enter AWS URL'}
                                                    Id={'aws_url'}
                                                    Name={'aws_url'}
                                                    Type={'url'}
                                                    Required={false}
                                                />
                                            </div>

                                            <PrimaryButton
                                                Text={'Create AWS Setting'}
                                                Type={'submit'}
                                                CustomClass={'w-[200px] '}
                                                Disabled={
                                                    processing ||
                                                    data.aws_access_key_id === '' ||
                                                    data.aws_secret_access_key === '' ||
                                                    data.aws_region === '' ||
                                                    data.aws_bucket === ''
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
