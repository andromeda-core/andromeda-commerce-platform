import Card from '@/Components/Card';
import Input from '@/Components/Input';
import LinkButton from '@/Components/LinkButton';
import PrimaryButton from '@/Components/PrimaryButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BreadCrumb from '@/Components/BreadCrumb';
import { Head, useForm } from '@inertiajs/react';
import React from 'react';
import Textarea from '@/Components/Textarea';

export default function edit({ meta_setting }) {
    // Edit Data Form Data
    const { data, setData, put, processing, errors } = useForm({
        meta_fb_app_name: meta_setting?.meta_fb_app_name || '',
        meta_fb_app_id: meta_setting?.meta_fb_app_id || '',
        meta_fb_app_secret: meta_setting?.meta_fb_app_secret || '',
        meta_fb_page_access_token: meta_setting?.meta_fb_page_access_token || '',
        meta_verify_token: meta_setting?.meta_verify_token || '',
        meta_fb_page_username: meta_setting?.meta_fb_page_username || '',
        meta_ig_app_name: meta_setting?.meta_ig_app_name || '',
        meta_ig_app_id: meta_setting?.meta_ig_app_id || '',
        meta_ig_app_secret: meta_setting?.meta_ig_app_secret || '',
        meta_ig_username: meta_setting?.meta_ig_username || '',
        meta_ig_access_token: meta_setting?.meta_ig_access_token || '',

    });

    // Edit Data Form Request
    const submit = (e) => {
        e.preventDefault();
        put(route('dashboard.settings.meta-settings.update', meta_setting.id));
    };

    return (
        <>
            <AuthenticatedLayout>
                <Head title="Settings - Meta Settings" />

                <BreadCrumb
                    header={'Settings - Edit Meta Setting'}
                    parent={'Meta Settings'}
                    parent_link={route('dashboard.settings.meta-settings.index')}
                    child={'Edit Meta Setting'}
                />

                <Card
                    Content={
                        <>
                            <div className="flex flex-wrap justify-end my-3">
                                <LinkButton
                                    Text={'Back To Meta Settings'}
                                    URL={route('dashboard.settings.meta-settings.index')}
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
                                                    InputName={'Meta FB APP Name'}
                                                    Error={errors.meta_fb_app_name}
                                                    Value={data.meta_fb_app_name}
                                                    Action={(e) =>
                                                        setData('meta_fb_app_name', e.target.value)
                                                    }
                                                    Placeholder={'Enter Meta FB APP NAME'}
                                                    Id={'meta_fb_app_name'}
                                                    Name={'meta_fb_app_name'}
                                                    Type={'text'}
                                                    Required={true}
                                                />

                                                <Input
                                                    InputName={'Meta FB APP ID'}
                                                    Error={errors.meta_fb_app_id}
                                                    Value={data.meta_fb_app_id}
                                                    Action={(e) =>
                                                        setData('meta_fb_app_id', e.target.value)
                                                    }
                                                    Placeholder={'Enter Meta FB APP ID'}
                                                    Id={'meta_fb_app_id'}
                                                    Name={'meta_fb_app_id'}
                                                    Type={'text'}
                                                    Required={true}
                                                />

                                                <Input
                                                    InputName={'Meta FB APP Secret'}
                                                    Error={errors.meta_fb_app_secret}
                                                    Value={data.meta_fb_app_secret}
                                                    Action={(e) =>
                                                        setData('meta_fb_app_secret', e.target.value)
                                                    }
                                                    Placeholder={'Enter Meta FB APP Secret'}
                                                    Id={'meta_fb_app_secret'}
                                                    Name={'meta_fb_app_secret'}
                                                    Type={'text'}
                                                    Required={true}
                                                />


                                                <Input
                                                    InputName={'Meta FB Page Username'}
                                                    Error={errors.meta_fb_page_username}
                                                    Value={data.meta_fb_page_username}
                                                    Action={(e) =>
                                                        setData('meta_fb_page_username', e.target.value)
                                                    }
                                                    Placeholder={'Enter Meta FB Page Username'}
                                                    Id={'meta_fb_page_username'}
                                                    Name={'meta_fb_page_username'}
                                                    Type={'text'}
                                                    Required={true}
                                                />


                                                <Textarea
                                                    InputName={'Meta FB Page Access Token'}
                                                    Error={errors.meta_fb_page_access_token}
                                                    Value={data.meta_fb_page_access_token}
                                                    Action={(e) =>
                                                        setData('meta_fb_page_access_token', e.target.value)
                                                    }
                                                    Placeholder={'Enter Meta FB Page Access Token'}
                                                    Id={'meta_fb_page_access_token'}
                                                    Name={'meta_fb_page_access_token'}

                                                    Required={true}
                                                />




                                                <Input
                                                    InputName={'Meta IG APP Name'}
                                                    Error={errors.meta_ig_app_name}
                                                    Value={data.meta_ig_app_name}
                                                    Action={(e) =>
                                                        setData('meta_ig_app_name', e.target.value)
                                                    }
                                                    Placeholder={'Enter Meta IG APP NAME'}
                                                    Id={'meta_ig_app_name'}
                                                    Name={'meta_ig_app_name'}
                                                    Type={'text'}
                                                    Required={true}
                                                />


                                                <Input
                                                    InputName={'Meta IG APP ID'}
                                                    Error={errors.meta_ig_app_id}
                                                    Value={data.meta_ig_app_id}
                                                    Action={(e) =>
                                                        setData('meta_ig_app_id', e.target.value)
                                                    }
                                                    Placeholder={'Enter Meta IG APP ID'}
                                                    Id={'meta_ig_app_id'}
                                                    Name={'meta_ig_app_id'}
                                                    Type={'text'}
                                                    Required={true}
                                                />

                                                <Input
                                                    InputName={'Meta IG APP Secret'}
                                                    Error={errors.meta_ig_app_secret}
                                                    Value={data.meta_ig_app_secret}
                                                    Action={(e) =>
                                                        setData('meta_ig_app_secret', e.target.value)
                                                    }
                                                    Placeholder={'Enter Meta IG APP Secret'}
                                                    Id={'meta_ig_app_secret'}
                                                    Name={'meta_ig_app_secret'}
                                                    Type={'text'}
                                                    Required={true}
                                                />




                                                <Input
                                                    InputName={'Meta IG Username'}
                                                    Error={errors.meta_ig_username}
                                                    Value={data.meta_ig_username}
                                                    Action={(e) =>
                                                        setData('meta_ig_username', e.target.value)
                                                    }
                                                    Placeholder={'Enter Meta IG Username'}
                                                    Id={'meta_ig_username'}
                                                    Name={'meta_ig_username'}
                                                    Type={'text'}
                                                    Required={true}
                                                />


                                                <Textarea
                                                    InputName={'Meta IG Access Token'}
                                                    Error={errors.meta_ig_access_token}
                                                    Value={data.meta_ig_access_token}
                                                    Action={(e) =>
                                                        setData('meta_ig_access_token', e.target.value)
                                                    }
                                                    Placeholder={'Enter Meta IG Access Token'}
                                                    Id={'meta_ig_access_token'}
                                                    Name={'meta_ig_access_token'}

                                                    Required={true}
                                                />


                                                <Input
                                                    InputName={'Meta Verify Token'}
                                                    Error={errors.meta_verify_token}
                                                    Value={data.meta_verify_token}
                                                    Action={(e) =>
                                                        setData('meta_verify_token', e.target.value)
                                                    }
                                                    Placeholder={'Enter Meta Verify Token'}
                                                    Id={'meta_verify_token'}
                                                    Name={'meta_verify_token'}
                                                    Type={'text'}
                                                    Required={true}
                                                />
                                            </div>

                                            <PrimaryButton
                                                Text={'Update Meta Setting'}
                                                Type={'submit'}
                                                CustomClass={'w-[250px] '}
                                                Disabled={
                                                    processing ||
                                                    data.meta_fb_app_name == '' ||
                                                    data.meta_fb_app_id == '' ||
                                                    data.meta_fb_app_secret == '' ||
                                                    data.meta_fb_page_access_token == '' ||
                                                    data.meta_verify_token == '' ||
                                                    data.meta_ig_username == '' ||
                                                    data.meta_fb_page_username == '' ||
                                                    data.meta_ig_access_token == '' ||
                                                    data.meta_ig_app_id == '' ||
                                                    data.meta_ig_app_secret == '' ||
                                                    data.meta_ig_app_name == ''
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
