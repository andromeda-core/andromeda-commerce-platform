import Card from '@/Components/Card';
import Input from '@/Components/Input';
import LinkButton from '@/Components/LinkButton';
import PrimaryButton from '@/Components/PrimaryButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BreadCrumb from '@/Components/BreadCrumb';
import { Head, useForm } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import SelectInput from '@/Components/SelectInput';

export default function edit({ user, roles }) {
    // Edit Data Form Data
    const { data, setData, put, processing, errors, reset } = useForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        password: '',
        password_confirmation: '',
        role_id: user?.roles[0]?.id ?? '',
        is_active: user.is_active ?? 1,
        company_name: user.supplier?.company_name || '',
        type: user?.collaborator?.type || '',
        address:
            (user?.collaborator && user?.collaborator?.address) ||
            (user?.distributor && user?.distributor?.address) ||
            '',
        bank_account_no:
            (user?.collaborator && user?.collaborator?.bank_account_no) ||
            (user?.distributor && user?.distributor?.bank_account_no) ||
            '',
    });

    const [togglePassword, setTogglePassword] = useState(false);
    const [togglePasswordConfirmation, setTogglePasswordConfirmation] = useState(false);

    // Edit Data Form Request
    const submit = (e) => {
        e.preventDefault();
        put(route('dashboard.users.update', user.id));
    };

    useEffect(() => {
        if (data.role_id != user.roles[0]?.id) {
            setData('company_name', '');
            setData('type', '');
            setData('address', '');
            setData('bank_account_no', '');
        }
    }, [data.role_id]);

    return (
        <>
            <AuthenticatedLayout>
                <Head title="Users" />

                <BreadCrumb
                    header={'Edit User'}
                    parent={'Users'}
                    parent_link={route('dashboard.users.index')}
                    child={'Edit User'}
                />

                <Card
                    Content={
                        <>
                            <div className="my-3 flex flex-wrap justify-end">
                                <LinkButton
                                    Text={'Back To Users'}
                                    URL={route('dashboard.users.index')}
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
                                                    InputName={'User Name'}
                                                    Error={errors.name}
                                                    Value={data.name}
                                                    Action={(e) => setData('name', e.target.value)}
                                                    Placeholder={'Enter User Name'}
                                                    Id={'name'}
                                                    Name={'name'}
                                                    Type={'text'}
                                                    Required={true}
                                                />

                                                <Input
                                                    InputName={'User Email'}
                                                    Error={errors.email}
                                                    Value={data.email}
                                                    Action={(e) => setData('email', e.target.value)}
                                                    Placeholder={'Enter User Email'}
                                                    Id={'email'}
                                                    Name={'email'}
                                                    Type={'email'}
                                                    Required={true}
                                                />

                                                <div className="mb-5">
                                                    <Input
                                                        InputName={'User Phone'}
                                                        Error={errors.phone}
                                                        Value={data.phone}
                                                        Action={(e) =>
                                                            setData('phone', e.target.value)
                                                        }
                                                        Placeholder={'Enter User Phone'}
                                                        Id={'phone'}
                                                        Name={'phone'}
                                                        Type={'text'}
                                                        Required={true}
                                                    />
                                                </div>
                                                <Input
                                                    InputName={'User Password'}
                                                    Error={errors.password}
                                                    Value={data.password}
                                                    Action={(e) =>
                                                        setData('password', e.target.value)
                                                    }
                                                    Placeholder={'Enter User Password'}
                                                    Id={'password'}
                                                    Name={'password'}
                                                    Type={'password'}
                                                    Required={data.password_confirmation !== ''}
                                                    ShowPasswordToggle={togglePassword}
                                                    setShowPasswordToggle={setTogglePassword}
                                                />

                                                <Input
                                                    InputName={'User Password Confirmation'}
                                                    Error={errors.password_confirmation}
                                                    Value={data.password_confirmation}
                                                    Action={(e) =>
                                                        setData(
                                                            'password_confirmation',
                                                            e.target.value,
                                                        )
                                                    }
                                                    Placeholder={'Enter User Password Confirmation'}
                                                    Id={'password_confirmation'}
                                                    Name={'password_confirmation'}
                                                    Type={'password'}
                                                    Required={data.password !== ''}
                                                    ShowPasswordToggle={togglePasswordConfirmation}
                                                    setShowPasswordToggle={
                                                        setTogglePasswordConfirmation
                                                    }
                                                />

                                                {data.role_id === 4 && (
                                                    <Input
                                                        InputName={'Company Name'}
                                                        Error={errors.company_name}
                                                        Value={data.company_name}
                                                        Action={(e) =>
                                                            setData('company_name', e.target.value)
                                                        }
                                                        Placeholder={'Enter Company Name'}
                                                        Id={'company_name'}
                                                        Name={'company_name'}
                                                        Type={'text'}
                                                        Required={data.role_id === 4}
                                                    />
                                                )}

                                                {data.role_id === 3 && (
                                                    <>
                                                        <SelectInput
                                                            InputName={'Collaborator Type'}
                                                            Id={'type'}
                                                            Name={'type'}
                                                            Value={data.type}
                                                            items={[
                                                                { name: 'Company' },
                                                                { name: 'Indivisual' },
                                                            ]}
                                                            Error={errors.type}
                                                            Placeholder={'Select Collaborator Type'}
                                                            Required={data.role_id === 3}
                                                            itemKey={'name'}
                                                            Action={(value) =>
                                                                setData('type', value)
                                                            }
                                                        />

                                                        <div>
                                                            <label className="mb-1 block text-sm font-medium text-gray-600 dark:text-white/70">
                                                                Address{' '}
                                                                <span className="text-red-500 dark:text-white">
                                                                    *
                                                                </span>
                                                            </label>
                                                            <textarea
                                                                rows={3}
                                                                value={data?.address}
                                                                placeholder="Enter Address"
                                                                className={`dark:bg-dark-900 shadow-theme-xs focus:ring-3 focus:outline-hidden $ mb-2 w-full min-w-0 max-w-full rounded-lg border border-gray-300 bg-transparent py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-blue-300 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-deepcharcoal dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-blue-800`}
                                                                onChange={(e) =>
                                                                    setData(
                                                                        'address',
                                                                        e.target.value,
                                                                    )
                                                                }
                                                            />
                                                        </div>

                                                        <Input
                                                            InputName={'Bank Account Number'}
                                                            Id={'bank_account_number'}
                                                            Error={errors.bank_account_no}
                                                            Name={'bank_account_no'}
                                                            Type={'text'}
                                                            Value={data.bank_account_no}
                                                            Placeholder={
                                                                'Enter Bank Account Number'
                                                            }
                                                            Required={data.role_id === 3}
                                                            Action={(e) =>
                                                                setData(
                                                                    'bank_account_no',
                                                                    e.target.value,
                                                                )
                                                            }
                                                        />
                                                    </>
                                                )}

                                                {data.role_id === 5 && (
                                                    <>
                                                        <div>
                                                            <label className="mb-1 block text-sm font-medium text-gray-600 dark:text-white/70">
                                                                Address{' '}
                                                                <span className="text-red-500 dark:text-white">
                                                                    *
                                                                </span>
                                                            </label>
                                                            <textarea
                                                                rows={3}
                                                                value={data?.address}
                                                                placeholder="Enter Address"
                                                                className={`dark:bg-dark-900 shadow-theme-xs focus:ring-3 focus:outline-hidden $ mb-2 w-full min-w-0 max-w-full rounded-lg border border-gray-300 bg-transparent py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-blue-300 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-deepcharcoal dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-blue-800`}
                                                                onChange={(e) =>
                                                                    setData(
                                                                        'address',
                                                                        e.target.value,
                                                                    )
                                                                }
                                                            />
                                                        </div>

                                                        <Input
                                                            InputName={'Bank Account Number'}
                                                            Id={'bank_account_number'}
                                                            Error={errors.bank_account_no}
                                                            Name={'bank_account_no'}
                                                            Type={'text'}
                                                            Value={data.bank_account_no}
                                                            Placeholder={
                                                                'Enter Bank Account Number'
                                                            }
                                                            Required={data.role_id === 5}
                                                            Action={(e) =>
                                                                setData(
                                                                    'bank_account_no',
                                                                    e.target.value,
                                                                )
                                                            }
                                                        />
                                                    </>
                                                )}

                                                <SelectInput
                                                    InputName={'User Role'}
                                                    Id={'role_id'}
                                                    Name={'role_id'}
                                                    Value={data.role_id}
                                                    items={roles}
                                                    Error={errors.role_id}
                                                    Placeholder={'Select User Role'}
                                                    Required={true}
                                                    itemKey={'name'}
                                                    Action={(value) => {
                                                        setData('role_id', value);
                                                    }}
                                                />

                                                <SelectInput
                                                    InputName={'Active Status'}
                                                    Id={'is_active'}
                                                    Name={'is_active'}
                                                    Value={data.is_active}
                                                    items={[
                                                        {
                                                            id: 1,
                                                            name: 'Active',
                                                        },
                                                        {
                                                            id: 0,
                                                            name: 'In-Active',
                                                        },
                                                    ]}
                                                    Error={errors.is_active}
                                                    Placeholder={'Select Active Status'}
                                                    Required={true}
                                                    itemKey={'name'}
                                                    Action={(value) => setData('is_active', value)}
                                                />
                                            </div>

                                            <PrimaryButton
                                                Text={'Update User'}
                                                Type={'submit'}
                                                CustomClass={'w-[200px] '}
                                                Disabled={
                                                    processing ||
                                                    data.name.trim() === '' ||
                                                    data.email.trim() === '' ||
                                                    data.phone.trim() === '' ||
                                                    data.role_id === '' ||
                                                    data.is_active === '' ||
                                                    (data.role_id === 4 &&
                                                        data.company_name.trim() === '') ||
                                                    (data.role_id === 3 &&
                                                        data.type.trim() === '') ||
                                                    (data.role_id === 3 &&
                                                        data.address.trim() === '') ||
                                                    (data.role_id === 3 &&
                                                        data.bank_account_no.trim() === '') ||
                                                    (data.role_id === 5 &&
                                                        data.address.trim() === '') ||
                                                    (data.role_id === 5 &&
                                                        data.bank_account_no.trim() === '') ||
                                                    (data.role_id === 5 &&
                                                        data.address.trim() === '' &&
                                                        data.bank_account_no.trim() === '') ||
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
