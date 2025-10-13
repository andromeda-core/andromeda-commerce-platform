import Card from '@/Components/Card';
import Input from '@/Components/Input';
import LinkButton from '@/Components/LinkButton';
import PrimaryButton from '@/Components/PrimaryButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BreadCrumb from '@/Components/BreadCrumb';
import { Head, useForm } from '@inertiajs/react';
import React, { useState } from 'react';
import SelectInput from '@/Components/SelectInput';

export default function create({ roles }) {
    // Create Data Form Data
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: '',
        role_id: '',
        is_active: 1,
        company_name: '',
        type: '',
        address: '',
        bank_account_no: '',
    });

    const [togglePassword, setTogglePassword] = useState(false);
    const [togglePasswordConfirmation, setTogglePasswordConfirmation] = useState(false);

    // Create Data Form Request
    const submit = (e) => {
        e.preventDefault();
        post(route('dashboard.users.store'));
    };

    return (
        <>
            <AuthenticatedLayout>
                <Head title="Users" />

                <BreadCrumb
                    header={'Create User'}
                    parent={'Users'}
                    parent_link={route('dashboard.users.index')}
                    child={'Create User'}
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
                                                    Required={true}
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
                                                    Required={true}
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
                                                        setData('company_name', '');
                                                        setData('type', '');
                                                        setData('address', '');
                                                        setData('bank_account_no', '');
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
                                                Text={'Create User'}
                                                Type={'submit'}
                                                CustomClass={'w-[200px] '}
                                                Disabled={
                                                    processing ||
                                                    data.name.trim() === '' ||
                                                    data.email.trim() === '' ||
                                                    data.phone.trim() === '' ||
                                                    data.password.trim() === '' ||
                                                    data.password_confirmation.trim() === '' ||
                                                    data.role_id === '' ||
                                                    data.is_active === '' ||
                                                    data.password.trim() !==
                                                        data.password_confirmation.trim() ||
                                                    (data.role_id === 4 &&
                                                        data.company_name.trim() === '') ||
                                                    (data.role_id === 3 &&
                                                        data.type.trim() === '' &&
                                                        data.address.trim() === '' &&
                                                        data.bank_account_no.trim() === '') ||
                                                    (data.role_id === 5 &&
                                                        data.address.trim() === '' &&
                                                        data.bank_account_no.trim() === '')
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
