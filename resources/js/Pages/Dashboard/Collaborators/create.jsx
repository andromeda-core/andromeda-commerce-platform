import Card from '@/Components/Card';
import Input from '@/Components/Input';
import LinkButton from '@/Components/LinkButton';
import PrimaryButton from '@/Components/PrimaryButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BreadCrumb from '@/Components/BreadCrumb';
import { Head, useForm } from '@inertiajs/react';
import React, { useState } from 'react';
import SelectInput from '@/Components/SelectInput';

export default function create() {
    // Create Data Form Data
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: '',
        type: '',
        address: '',
        bank_name: '',
        bank_account_name: '',
        bank_account_no: '',
        iban: '',
        swift_code: '',
        point_accumulation_rate: '',
        commission_rate: '',
        accommodation_commission_rate: '',
    });

    const [togglePassword, setTogglePassword] = useState(false);
    const [togglePasswordConfirmation, setTogglePasswordConfirmation] = useState(false);

    // Create Data Form Request
    const submit = (e) => {
        e.preventDefault();
        post(route('dashboard.collaborators.store'));
    };

    return (
        <>
            <AuthenticatedLayout>
                <Head title="Collaborators" />

                <BreadCrumb
                    header={'Create Collaborator'}
                    parent={'Collaborators'}
                    parent_link={route('dashboard.collaborators.index')}
                    child={'Create Collaborator'}
                />

                <Card
                    Content={
                        <>
                            <div className="my-3 flex flex-wrap justify-end">
                                <LinkButton
                                    Text={'Back To Collaborators'}
                                    URL={route('dashboard.collaborators.index')}
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
                                                    InputName={'Collaborator Name'}
                                                    Error={errors.name}
                                                    Value={data.name}
                                                    Action={(e) => setData('name', e.target.value)}
                                                    Placeholder={'Enter Collaborator Name'}
                                                    Id={'name'}
                                                    Name={'name'}
                                                    Type={'text'}
                                                    Required={true}
                                                />

                                                <Input
                                                    InputName={'Collaborator Email'}
                                                    Error={errors.email}
                                                    Value={data.email}
                                                    Action={(e) => setData('email', e.target.value)}
                                                    Placeholder={'Enter Collaborator Email'}
                                                    Id={'email'}
                                                    Name={'email'}
                                                    Type={'email'}
                                                    Required={true}
                                                />

                                                <div className="mb-5">
                                                    <Input
                                                        InputName={'Collaborator Phone'}
                                                        Error={errors.phone}
                                                        Value={data.phone}
                                                        Action={(e) =>
                                                            setData('phone', e.target.value)
                                                        }
                                                        Placeholder={'Enter Collaborator Phone'}
                                                        Id={'phone'}
                                                        Name={'phone'}
                                                        Type={'text'}
                                                        Required={true}
                                                    />
                                                </div>

                                                <SelectInput
                                                    InputName={'Collaborator Type'}
                                                    Error={errors.type}
                                                    Id={'type'}
                                                    Name={'type'}
                                                    Value={data.type}
                                                    Action={(value) => setData('type', value)}
                                                    Placeholder={'Select Collaborator Type'}
                                                    Required={true}
                                                    items={[
                                                        { name: 'Company' },
                                                        { name: 'Indivisual' },
                                                    ]}
                                                    itemKey={'name'}
                                                />

                                                <Input
                                                    InputName={'Collaborator Bank Name'}
                                                    Error={errors.bank_name}
                                                    Value={data.bank_name}
                                                    Action={(e) =>
                                                        setData('bank_name', e.target.value)
                                                    }
                                                    Placeholder={'Enter Collaborator Bank Name'}
                                                    Id={'bank_name'}
                                                    Name={'bank_name'}
                                                    Type={'text'}
                                                    Required={true}
                                                />

                                                <Input
                                                    InputName={'Collaborator Bank Account Name'}
                                                    Error={errors.bank_account_name}
                                                    Value={data.bank_account_name}
                                                    Action={(e) =>
                                                        setData('bank_account_name', e.target.value)
                                                    }
                                                    Placeholder={
                                                        'Enter Collaborator Bank Account Name'
                                                    }
                                                    Id={'bank_account_name'}
                                                    Name={'bank_account_name'}
                                                    Type={'text'}
                                                    Required={true}
                                                />

                                                <Input
                                                    InputName={'Collaborator Bank Account No'}
                                                    Error={errors.bank_account_no}
                                                    Value={data.bank_account_no}
                                                    Action={(e) =>
                                                        setData('bank_account_no', e.target.value)
                                                    }
                                                    Placeholder={
                                                        'Enter Collaborator Bank Account No'
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
                                                    InputName={'Collaborator Password'}
                                                    Error={errors.password}
                                                    Value={data.password}
                                                    Action={(e) =>
                                                        setData('password', e.target.value)
                                                    }
                                                    Placeholder={'Enter Collaborator Password'}
                                                    Id={'password'}
                                                    Name={'password'}
                                                    Type={'password'}
                                                    Required={true}
                                                    ShowPasswordToggle={togglePassword}
                                                    setShowPasswordToggle={setTogglePassword}
                                                />

                                                <Input
                                                    InputName={'Collaborator Password Confirmation'}
                                                    Error={errors.password_confirmation}
                                                    Value={data.password_confirmation}
                                                    Action={(e) =>
                                                        setData(
                                                            'password_confirmation',
                                                            e.target.value,
                                                        )
                                                    }
                                                    Placeholder={
                                                        'Enter Collaborator Password Confirmation'
                                                    }
                                                    Id={'password_confirmation'}
                                                    Name={'password_confirmation'}
                                                    Type={'password'}
                                                    Required={true}
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
                                                        InputName={'Point Accumulation Rate'}
                                                        Error={errors.point_accumulation_rate}
                                                        Id={'point_accumulation_rate'}
                                                        Name={'point_accumulation_rate'}
                                                        Value={data.point_accumulation_rate}
                                                        Action={(e) =>
                                                            setData(
                                                                'point_accumulation_rate',
                                                                e.target.value,
                                                            )
                                                        }
                                                        Placeholder={
                                                            'Enter Point Accumulation Rate'
                                                        }
                                                        Required={false}
                                                        Type={'number'}
                                                    />
                                                </div>

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

                                                <div className="flex items-center">
                                                    <Input
                                                        CustomCss={'w-[40px] mt-5'}
                                                        Value={'%'}
                                                        readOnly={true}
                                                    />

                                                    <div className="flex-1">
                                                        <Input
                                                            InputName={
                                                                'Accommodation Commission Rate'
                                                            }
                                                            Error={
                                                                errors.accommodation_commission_rate
                                                            }
                                                            Id={'accommodation_commission_rate'}
                                                            Name={'accommodation_commission_rate'}
                                                            Value={
                                                                data.accommodation_commission_rate
                                                            }
                                                            Action={(e) =>
                                                                setData(
                                                                    'accommodation_commission_rate',
                                                                    e.target.value,
                                                                )
                                                            }
                                                            Placeholder={
                                                                'Enter Accommodation Commission Rate'
                                                            }
                                                            Required={false}
                                                            Type={'number'}
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <label
                                                        htmlFor="address"
                                                        className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
                                                    >
                                                        Collaborator Address{' '}
                                                        <span className="text-red-500 dark:text-white">
                                                            *
                                                        </span>
                                                    </label>
                                                    <textarea
                                                        id="address"
                                                        rows="3"
                                                        className="dark:bg-dark-900 shadow-theme-xs focus:ring-3 focus:outline-hidden mb-2 w-full min-w-0 max-w-full rounded-lg border border-gray-300 bg-transparent py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-blue-300 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-deepcharcoal dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-blue-800"
                                                        placeholder="Enter Collaborator Address here..."
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
                                            </div>

                                            <PrimaryButton
                                                Text={'Create Collaborator'}
                                                Type={'submit'}
                                                CustomClass={'w-[250px] '}
                                                Disabled={
                                                    processing ||
                                                    data.name.trim() === '' ||
                                                    data.email.trim() === '' ||
                                                    data.phone.trim() === '' ||
                                                    data.bank_account_no.trim() === '' ||
                                                    data.bank_name.trim() === '' ||
                                                    data.bank_account_name.trim() === '' ||
                                                    data.iban.trim() === '' ||
                                                    data.swift_code.trim() === '' ||
                                                    data.password.trim() === '' ||
                                                    data.password_confirmation.trim() === '' ||
                                                    data.password.trim() !==
                                                        data.password_confirmation.trim() ||
                                                    data.type.trim() === '' ||
                                                    data.address.trim() === ''
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
