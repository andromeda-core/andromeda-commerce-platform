import Card from '@/Components/Card';
import Input from '@/Components/Input';
import PrimaryButton from '@/Components/PrimaryButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BreadCrumb from '@/Components/BreadCrumb';
import { Head, useForm } from '@inertiajs/react';
import React, { useState } from 'react';
import LinkButton from '@/Components/LinkButton';

export default function index({ smtp_setting }) {
    // Update SMTP Setting Form Data
    const { data, setData, put, processing, errors } = useForm({
        smtp_mailer: smtp_setting?.smtp_mailer || '',
        smtp_scheme: smtp_setting?.smtp_scheme || '',
        smtp_host: smtp_setting?.smtp_host || '',
        smtp_port: smtp_setting?.smtp_port || '',
        smtp_username: smtp_setting?.smtp_username || '',
        smtp_password: smtp_setting?.smtp_password || '',
        smtp_mail_from_address: smtp_setting?.smtp_mail_from_address || '',
    });

    // Show Password Toggle State
    const [smtpPasswordToggle, setSmtpPasswordToggle] = useState(false);

    // Update SMTP Setting Form Request
    const submit = (e) => {
        e.preventDefault();
        put(route('dashboard.settings.smtp.setting.update'));
    };
    return (
        <>
            <AuthenticatedLayout>
                <Head title="Settings - SMTP Setting" />

                <BreadCrumb
                    header={'Settings - SMTP Setting'}
                    parent={'Settings'}
                    parent_link={route('dashboard.settings.index')}
                    child={'SMTP Setting'}
                />

                <Card
                    Content={
                        <>
                            <div className="my-3 flex flex-wrap justify-end">
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
                                <div className="mb-4 w-full px-4 sm:px-6">
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <Input
                                            InputName={'SMTP Mailer'}
                                            Placeholder={'Enter SMTP Mailer'}
                                            Name={'smtp_mailer'}
                                            Id={'smtp_mailer'}
                                            Type={'text'}
                                            Required={true}
                                            Action={(e) => setData('smtp_mailer', e.target.value)}
                                            Value={data.smtp_mailer}
                                            Error={errors.smtp_mailer}
                                        />

                                        <Input
                                            InputName={'SMTP Scheme'}
                                            Placeholder={'Enter SMTP Scheme'}
                                            Name={'smtp_scheme'}
                                            Id={'smtp_scheme'}
                                            Type={'text'}
                                            Required={false}
                                            Action={(e) => setData('smtp_scheme', e.target.value)}
                                            Value={data.smtp_scheme}
                                            Error={errors.smtp_scheme}
                                        />

                                        <Input
                                            InputName={'SMTP Host'}
                                            Placeholder={'Enter SMTP Host'}
                                            Name={'smtp_host'}
                                            Id={'smtp_host'}
                                            Type={'text'}
                                            Required={false}
                                            Action={(e) => setData('smtp_host', e.target.value)}
                                            Value={data.smtp_host}
                                            Error={errors.smtp_host}
                                        />

                                        <Input
                                            InputName={'SMTP Port'}
                                            Placeholder={'Enter SMTP Port'}
                                            Name={'smtp_port'}
                                            Id={'smtp_port'}
                                            Type={'text'}
                                            Required={false}
                                            Action={(e) => setData('smtp_port', e.target.value)}
                                            Value={data.smtp_port}
                                            Error={errors.smtp_port}
                                        />

                                        <Input
                                            InputName={'SMTP Username'}
                                            Placeholder={'Enter SMTP Username'}
                                            Name={'smtp_username'}
                                            Id={'smtp_username'}
                                            Type={'text'}
                                            Required={false}
                                            Action={(e) => setData('smtp_username', e.target.value)}
                                            Value={data.smtp_username}
                                            Error={errors.smtp_username}
                                        />

                                        <Input
                                            InputName={'SMTP Password'}
                                            Placeholder={'Enter SMTP Password'}
                                            Name={'smtp_password'}
                                            Id={'smtp_password'}
                                            Type={'password'}
                                            Required={false}
                                            Action={(e) => setData('smtp_password', e.target.value)}
                                            Value={data.smtp_password}
                                            Error={errors.smtp_password}
                                            ShowPasswordToggle={smtpPasswordToggle}
                                            setShowPasswordToggle={setSmtpPasswordToggle}
                                        />

                                        <Input
                                            InputName={'SMTP Mail From Address'}
                                            Placeholder={'Enter SMTP Mail From Address'}
                                            Name={'smtp_mail_from_address'}
                                            Id={'smtp_mail_from_address'}
                                            Type={'email'}
                                            Required={true}
                                            Action={(e) =>
                                                setData('smtp_mail_from_address', e.target.value)
                                            }
                                            Value={data.smtp_mail_from_address}
                                            Error={errors.smtp_mail_from_address}
                                        />
                                    </div>
                                </div>

                                <div className="mx-4 w-60">
                                    <PrimaryButton
                                        Text={'Save Changes'}
                                        Spinner={processing}
                                        Disabled={
                                            processing ||
                                            data.smtp_mailer.trim() === '' ||
                                            // data.smtp_scheme.trim() === '' ||
                                            // data.smtp_host.trim() === '' ||
                                            // data.smtp_port.trim() === '' ||
                                            // data.smtp_username.trim() === '' ||
                                            // data.smtp_password.trim() === '' ||
                                            data.smtp_mail_from_address.trim() === ''
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
