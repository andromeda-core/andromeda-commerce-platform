import Card from '@/Components/Card';
import Input from '@/Components/Input';
import LinkButton from '@/Components/LinkButton';
import PrimaryButton from '@/Components/PrimaryButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BreadCrumb from '@/Components/BreadCrumb';
import { Head, useForm } from '@inertiajs/react';
import React, { useState } from 'react';

export default function edit({ accommodation_distributor }) {
    // Edit Data Form Data
    const { data, setData, put, processing, errors, reset } = useForm({
        name: accommodation_distributor?.user?.name || '',
        email: accommodation_distributor?.user?.email || '',
        phone: accommodation_distributor?.user?.phone || '',
        password: '',
        password_confirmation: '',
        address: accommodation_distributor?.address || '',
        commission_rate: accommodation_distributor?.commission_rate ?? '',
        bank_name: accommodation_distributor?.bank_name || '',
        postal_code: accommodation_distributor?.postal_code || '',
        bank_account_name: accommodation_distributor?.bank_account_name || '',
        bank_account_no: accommodation_distributor?.bank_account_no || '',
        iban: accommodation_distributor?.iban || '',
        swift_code: accommodation_distributor?.swift_code || '',
    });

    const [togglePassword, setTogglePassword] = useState(false);
    const [togglePasswordConfirmation, setTogglePasswordConfirmation] = useState(false);

    // Edit Data Form Request
    const submit = (e) => {
        e.preventDefault();
        put(route('dashboard.accommodation-distributors.update', accommodation_distributor.id));
    };

    return (
        <>
            <AuthenticatedLayout>
                <Head title="Accommodation Distributors" />

                <BreadCrumb
                    header={'Edit Accommodation Distributor'}
                    parent={'Accommodation Distributors'}
                    parent_link={route('dashboard.accommodation-distributors.index')}
                    child={'Edit Accommodation Distributor'}
                />

                <Card
                    Content={
                        <>
                            <div className="my-3 flex flex-wrap justify-end">
                                <LinkButton
                                    Text={'Back To Accommodation Distributors'}
                                    URL={route('dashboard.accommodation-distributors.index')}
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
                                                    InputName={'Distributor Name'}
                                                    Error={errors.name}
                                                    Value={data.name}
                                                    Action={(e) => setData('name', e.target.value)}
                                                    Placeholder={'Enter Distributor Name'}
                                                    Id={'name'}
                                                    Name={'name'}
                                                    Type={'text'}
                                                    Required={true}
                                                />

                                                <Input
                                                    InputName={'Distributor Email'}
                                                    Error={errors.email}
                                                    Value={data.email}
                                                    Action={(e) => setData('email', e.target.value)}
                                                    Placeholder={'Enter Distributor Email'}
                                                    Id={'email'}
                                                    Name={'email'}
                                                    Type={'email'}
                                                    Required={true}
                                                />

                                                <div className="mb-5">
                                                    <Input
                                                        InputName={'Distributor Phone'}
                                                        Error={errors.phone}
                                                        Value={data.phone}
                                                        Action={(e) =>
                                                            setData('phone', e.target.value)
                                                        }
                                                        Placeholder={'Enter Distributor Phone'}
                                                        Id={'phone'}
                                                        Name={'phone'}
                                                        Type={'text'}
                                                        Required={true}
                                                    />
                                                </div>

                                                <Input
                                                    InputName={'Distributor Bank Name'}
                                                    Error={errors.bank_name}
                                                    Value={data.bank_name}
                                                    Action={(e) =>
                                                        setData('bank_name', e.target.value)
                                                    }
                                                    Placeholder={'Enter Distributor Bank Name'}
                                                    Id={'bank_name'}
                                                    Name={'bank_name'}
                                                    Type={'text'}
                                                    Required={true}
                                                />

                                                <Input
                                                    InputName={'Distributor Bank Account Name'}
                                                    Error={errors.bank_account_name}
                                                    Value={data.bank_account_name}
                                                    Action={(e) =>
                                                        setData('bank_account_name', e.target.value)
                                                    }
                                                    Placeholder={
                                                        'Enter Distributor Bank Account Name'
                                                    }
                                                    Id={'bank_account_name'}
                                                    Name={'bank_account_name'}
                                                    Type={'text'}
                                                    Required={true}
                                                />

                                                <Input
                                                    InputName={'Distributor Bank Account No'}
                                                    Error={errors.bank_account_no}
                                                    Value={data.bank_account_no}
                                                    Action={(e) =>
                                                        setData('bank_account_no', e.target.value)
                                                    }
                                                    Placeholder={
                                                        'Enter Distributor Bank Account No'
                                                    }
                                                    Id={'bank_account_no'}
                                                    Name={'bank_account_no'}
                                                    Type={'text'}
                                                    Required={true}
                                                />

                                                <Input
                                                    InputName={'IBAN'}
                                                    Error={errors.iban}
                                                    Value={data.iban}
                                                    Action={(e) => setData('iban', e.target.value)}
                                                    Placeholder={'Enter IBAN'}
                                                    Id={'iban'}
                                                    Name={'iban'}
                                                    Type={'text'}
                                                    Required={true}
                                                />

                                                <Input
                                                    InputName={'SWIFT CODE'}
                                                    Error={errors.swift_code}
                                                    Value={data.swift_code}
                                                    Action={(e) =>
                                                        setData('swift_code', e.target.value)
                                                    }
                                                    Placeholder={'Enter SWIFT CODE'}
                                                    Id={'swift_code'}
                                                    Name={'swift_code'}
                                                    Type={'text'}
                                                    Required={true}
                                                />

                                                <Input
                                                    InputName={'Distributor Password'}
                                                    Error={errors.password}
                                                    Value={data.password}
                                                    Action={(e) =>
                                                        setData('password', e.target.value)
                                                    }
                                                    Placeholder={'Enter Distributor Password'}
                                                    Id={'password'}
                                                    Name={'password'}
                                                    Type={'password'}
                                                    Required={data.password_confirmation !== ''}
                                                    ShowPasswordToggle={togglePassword}
                                                    setShowPasswordToggle={setTogglePassword}
                                                />

                                                <Input
                                                    InputName={'Distributor Password Confirmation'}
                                                    Error={errors.password_confirmation}
                                                    Value={data.password_confirmation}
                                                    Action={(e) =>
                                                        setData(
                                                            'password_confirmation',
                                                            e.target.value,
                                                        )
                                                    }
                                                    Placeholder={
                                                        'Enter Distributor Password Confirmation'
                                                    }
                                                    Id={'password_confirmation'}
                                                    Name={'password_confirmation'}
                                                    Type={'password'}
                                                    Required={data.password !== ''}
                                                    ShowPasswordToggle={togglePasswordConfirmation}
                                                    setShowPasswordToggle={
                                                        setTogglePasswordConfirmation
                                                    }
                                                />

                                                <div className="flex items-center">
                                                    <Input
                                                        CustomCss={'w-[40px] mt-5'}
                                                        Value={'%'}
                                                        readOnly={true}
                                                    />

                                                    <Input
                                                        InputName={'Commission Rate'}
                                                        Error={errors.commission_rate}
                                                        Id={'commission_rate'}
                                                        Name={'commission_rate'}
                                                        Value={data.commission_rate}
                                                        Action={(e) =>
                                                            setData(
                                                                'commission_rate',
                                                                e.target.value,
                                                            )
                                                        }
                                                        Placeholder={'Enter Commission Rate'}
                                                        Required={false}
                                                        Type={'number'}
                                                    />
                                                </div>

                                                <div>
                                                    <label
                                                        htmlFor="address"
                                                        className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
                                                    >
                                                        Distributor Address{' '}
                                                        <span className="text-red-500 dark:text-white">
                                                            *
                                                        </span>
                                                    </label>
                                                    <textarea
                                                        id="address"
                                                        rows="3"
                                                        className="dark:bg-dark-900 shadow-theme-xs focus:ring-3 focus:outline-hidden mb-2 w-full min-w-0 max-w-full rounded-lg border border-gray-300 bg-transparent py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-blue-300 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-deepcharcoal dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-blue-800"
                                                        placeholder="Enter Distributor Address here..."
                                                        value={data.address}
                                                        onChange={(e) =>
                                                            setData('address', e.target.value)
                                                        }
                                                    ></textarea>
                                                    {errors.address && (
                                                        <span className="ml-2 text-red-500 dark:text-white">
                                                            {errors.address}
                                                        </span>
                                                    )}
                                                </div>

                                                <Input
                                                    InputName={'Distributor Postal Code'}
                                                    Error={errors.postal_code}
                                                    Value={data.postal_code}
                                                    Action={(e) =>
                                                        setData('postal_code', e.target.value)
                                                    }
                                                    Placeholder={'Enter Distributor Postal Code'}
                                                    Id={'postal_code'}
                                                    Name={'postal_code'}
                                                    Type={'text'}
                                                    Required={true}
                                                />
                                            </div>

                                            <PrimaryButton
                                                Text={'Update Accommodation Distributor'}
                                                Type={'submit'}
                                                CustomClass={'w-[300px] '}
                                                Disabled={
                                                    processing ||
                                                    data.name.trim() === '' ||
                                                    data.email.trim() === '' ||
                                                    data.phone.trim() === '' ||
                                                    data.address.trim() === '' ||
                                                    data.bank_account_no.trim() === '' ||
                                                    data.bank_name.trim() === '' ||
                                                    data.bank_account_name.trim() === '' ||
                                                    data.postal_code.trim() === '' ||
                                                    data.iban.trim() === '' ||
                                                    data.swift_code.trim() === '' ||
                                                    (data.password.trim() !== '' &&
                                                        data.password_confirmation.trim() === '') ||
                                                    (data.password.trim() === '' &&
                                                        data.password_confirmation.trim() !== '') ||
                                                    (data.password.trim() !== '' &&
                                                        data.password_confirmation.trim() !== '' &&
                                                        data.password.trim() !==
                                                            data.password_confirmation.trim())
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
