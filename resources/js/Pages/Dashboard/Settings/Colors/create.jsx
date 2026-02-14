import Card from '@/Components/Card';
import Input from '@/Components/Input';
import LinkButton from '@/Components/LinkButton';
import PrimaryButton from '@/Components/PrimaryButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BreadCrumb from '@/Components/BreadCrumb';
import { Head, useForm } from '@inertiajs/react';
import React, { useState } from 'react';
import SelectInput from '@/Components/SelectInput';
import { HexColorPicker } from 'react-colorful';
export default function create() {
    // Create Data Form Data
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        code: '',
        is_active: 1,
    });

    // Create Data Form Request
    const submit = (e) => {
        e.preventDefault();
        post(route('dashboard.settings.colors.store'));
    };

    const [color, setColor] = useState('#aabbcc');

    return (
        <>
            <AuthenticatedLayout>
                <Head title="Colors" />

                <BreadCrumb
                    header={'Create Color'}
                    parent={'Colors'}
                    parent_link={route('dashboard.settings.colors.index')}
                    child={'Create Color'}
                />

                <Card
                    Content={
                        <>
                            <div className="flex flex-wrap justify-end my-3">
                                <LinkButton
                                    Text={'Back To Colors'}
                                    URL={route('dashboard.settings.colors.index')}
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
                                                    InputName={'Color Name'}
                                                    Error={errors.name}
                                                    Value={data.name}
                                                    Action={(e) => setData('name', e.target.value)}
                                                    Placeholder={'Enter Color Name'}
                                                    Id={'name'}
                                                    Name={'name'}
                                                    Type={'text'}
                                                    Required={true}
                                                />

                                                <Input
                                                    InputName={'Color Code'}
                                                    Error={errors.code}
                                                    Value={data.code}
                                                    Action={(e) => setData('code', e.target.value)}
                                                    Placeholder={'Enter Color Code'}
                                                    Id={'code'}
                                                    Name={'code'}
                                                    Type={'text'}
                                                    Required={true}
                                                />

                                                <SelectInput
                                                    InputName={'Color Status'}
                                                    Id={'is_active'}
                                                    Name={'is_active'}
                                                    Value={data.is_active}
                                                    Error={errors.is_active}
                                                    Action={(value) => setData('is_active', value)}
                                                    items={[
                                                        { id: 1, name: 'Active' },
                                                        { id: 0, name: 'In-Active' },
                                                    ]}
                                                    itemKey={'name'}
                                                    Placeholder={'Select Color Status'}
                                                    Required={true}
                                                />

                                                <HexColorPicker
                                                    color={color}
                                                    onChange={(code) => setData('code', code)}
                                                />
                                            </div>

                                            <PrimaryButton
                                                Text={'Create Color'}
                                                Type={'submit'}
                                                CustomClass={'w-[200px] '}
                                                Disabled={
                                                    processing ||
                                                    data.name.trim() === '' ||
                                                    data.code.trim() === '' ||
                                                    data.is_active === ''
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
