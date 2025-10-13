import Card from '@/Components/Card';
import Input from '@/Components/Input';
import LinkButton from '@/Components/LinkButton';
import PrimaryButton from '@/Components/PrimaryButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BreadCrumb from '@/Components/BreadCrumb';
import { Head, useForm } from '@inertiajs/react';
import React, { useState } from 'react';
import SelectInput from '@/Components/SelectInput';

export default function edit({ customer, countries }) {
    // Create Data Form Data
    const { data, setData, put, processing, errors, reset } = useForm({
        name: customer?.user?.name || '',
        email: customer?.user?.email || '',
        phone: customer?.user?.phone || '',
        password: '',
        password_confirmation: '',
        is_active: customer?.user?.is_active ?? 1,
        country_id: customer?.country_id || '',
        state: customer?.state || '',
        city: customer?.city || '',
        postal_code: customer?.postal_code || '',
        address_line1: customer?.address_line1 || '',
        address_line2: customer?.address_line2 || '',
    });

    const [togglePassword, setTogglePassword] = useState(false);
    const [togglePasswordConfirmation, setTogglePasswordConfirmation] = useState(false);

    // Create Data Form Request
    const submit = (e) => {
        e.preventDefault();
        put(route('dashboard.customers.update', customer.id));
    };

    return (
        <>
            <AuthenticatedLayout>
                <Head title="Customers" />

                <BreadCrumb
                    header={'Edit Customer'}
                    parent={'Customers'}
                    parent_link={route('dashboard.customers.index')}
                    child={'Edit Customers'}
                />

                <Card
                    Content={
                        <>
                            <div className="my-3 flex flex-wrap justify-end">
                                <LinkButton
                                    Text={'Back To Customers'}
                                    URL={route('dashboard.customers.index')}
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
                                                    InputName={'Customer Name'}
                                                    Error={errors.name}
                                                    Value={data.name}
                                                    Action={(e) => setData('name', e.target.value)}
                                                    Placeholder={'Enter Customer Name'}
                                                    Id={'name'}
                                                    Name={'name'}
                                                    Type={'text'}
                                                    Required={true}
                                                />

                                                <Input
                                                    InputName={'Customer Email'}
                                                    Error={errors.email}
                                                    Value={data.email}
                                                    Action={(e) => setData('email', e.target.value)}
                                                    Placeholder={'Enter Customer Email'}
                                                    Id={'email'}
                                                    Name={'email'}
                                                    Type={'email'}
                                                    Required={true}
                                                />

                                                <div className="mb-5">
                                                    <Input
                                                        InputName={'Customer Phone'}
                                                        Error={errors.phone}
                                                        Value={data.phone}
                                                        Action={(e) =>
                                                            setData('phone', e.target.value)
                                                        }
                                                        Placeholder={'Enter Customer Phone'}
                                                        Id={'phone'}
                                                        Name={'phone'}
                                                        Type={'text'}
                                                        Required={true}
                                                    />
                                                </div>

                                                <SelectInput
                                                    InputName={'Country'}
                                                    Error={errors.country_id}
                                                    Value={data.country_id}
                                                    Action={(value) => setData('country_id', value)}
                                                    Placeholder={'Enter Country'}
                                                    Id={'country_id'}
                                                    Name={'country_id'}
                                                    items={countries}
                                                    itemKey={'name'}
                                                    Multiple={false}
                                                    Required={true}
                                                />

                                                <Input
                                                    InputName={'City'}
                                                    Error={errors.city}
                                                    Value={data.city}
                                                    Action={(e) => setData('city', e.target.value)}
                                                    Placeholder={'Enter City'}
                                                    Id={'city'}
                                                    Name={'city'}
                                                    Type={'text'}
                                                    Required={true}
                                                />

                                                <Input
                                                    InputName={'State'}
                                                    Error={errors.state}
                                                    Value={data.state}
                                                    Action={(e) => setData('state', e.target.value)}
                                                    Placeholder={'Enter State'}
                                                    Id={'state'}
                                                    Name={'state'}
                                                    Type={'text'}
                                                    Required={true}
                                                />

                                                <Input
                                                    InputName={'Postal Code'}
                                                    Error={errors.postal_code}
                                                    Value={data.postal_code}
                                                    Action={(e) =>
                                                        setData('postal_code', e.target.value)
                                                    }
                                                    Placeholder={'Enter Postal Code'}
                                                    Id={'postal_code'}
                                                    Name={'postal_code'}
                                                    Type={'text'}
                                                    Required={true}
                                                />

                                                <div>
                                                    <label
                                                        htmlFor="address_line1"
                                                        className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
                                                    >
                                                        Address 1{' '}
                                                        <span className="text-red-500 dark:text-white">
                                                            *
                                                        </span>
                                                    </label>
                                                    <textarea
                                                        id="address_line1"
                                                        rows="3"
                                                        className="dark:bg-dark-900 shadow-theme-xs focus:ring-3 focus:outline-hidden mb-2 w-full min-w-0 max-w-full rounded-lg border border-gray-300 bg-transparent py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-blue-300 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-deepcharcoal dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-blue-800"
                                                        placeholder="Enter Address 1 here..."
                                                        value={data.address_line1}
                                                        onChange={(e) =>
                                                            setData('address_line1', e.target.value)
                                                        }
                                                    ></textarea>
                                                    {errors.address_line1 && (
                                                        <span className="ml-2 text-red-500 dark:text-white">
                                                            {errors.address_line1}
                                                        </span>
                                                    )}
                                                </div>

                                                <div>
                                                    <label
                                                        htmlFor="address_line2"
                                                        className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
                                                    >
                                                        Address 2
                                                    </label>
                                                    <textarea
                                                        id="address_line2"
                                                        rows="3"
                                                        className="dark:bg-dark-900 shadow-theme-xs focus:ring-3 focus:outline-hidden mb-2 w-full min-w-0 max-w-full rounded-lg border border-gray-300 bg-transparent py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-blue-300 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-deepcharcoal dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-blue-800"
                                                        placeholder="Enter Address 2 here..."
                                                        value={data.address_line2}
                                                        onChange={(e) =>
                                                            setData('address_line2', e.target.value)
                                                        }
                                                    ></textarea>
                                                    {errors.address_line2 && (
                                                        <span className="ml-2 text-red-500 dark:text-white">
                                                            {errors.address_line2}
                                                        </span>
                                                    )}
                                                </div>

                                                <Input
                                                    InputName={'Customer Password'}
                                                    Error={errors.password}
                                                    Value={data.password}
                                                    Action={(e) =>
                                                        setData('password', e.target.value)
                                                    }
                                                    Placeholder={'Enter Customer Password'}
                                                    Id={'password'}
                                                    Name={'password'}
                                                    Type={'password'}
                                                    Required={data.password_confirmation != ''}
                                                    ShowPasswordToggle={togglePassword}
                                                    setShowPasswordToggle={setTogglePassword}
                                                />

                                                <Input
                                                    InputName={'Customer Password Confirmation'}
                                                    Error={errors.password_confirmation}
                                                    Value={data.password_confirmation}
                                                    Action={(e) =>
                                                        setData(
                                                            'password_confirmation',
                                                            e.target.value,
                                                        )
                                                    }
                                                    Placeholder={
                                                        'Enter Customer Password Confirmation'
                                                    }
                                                    Id={'password_confirmation'}
                                                    Name={'password_confirmation'}
                                                    Type={'password'}
                                                    Required={data.password != ''}
                                                    ShowPasswordToggle={togglePasswordConfirmation}
                                                    setShowPasswordToggle={
                                                        setTogglePasswordConfirmation
                                                    }
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
                                                Text={'Update Customer'}
                                                Type={'submit'}
                                                CustomClass={'w-[200px] '}
                                                Disabled={
                                                    processing ||
                                                    data.name.trim() === '' ||
                                                    data.email.trim() === '' ||
                                                    data.phone.trim() === '' ||
                                                    data.is_active === '' ||
                                                    data.country_id === '' ||
                                                    data.state.trim() === '' ||
                                                    data.city.trim() === '' ||
                                                    data.postal_code.trim() === '' ||
                                                    data.address_line1.trim() === '' ||
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
