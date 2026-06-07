import Card from '@/Components/Card';
import Input from '@/Components/Input';
import LinkButton from '@/Components/LinkButton';
import PrimaryButton from '@/Components/PrimaryButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BreadCrumb from '@/Components/BreadCrumb';
import { Head, useForm } from '@inertiajs/react';
import React from 'react';
import SelectInput from '@/Components/SelectInput';
import TranslationsRepeater from '@/Components/TranslationsRepeater';
import { areTranslationsComplete } from '@/Hooks/useTranslationsComplete';
export default function create({ languages }) {
    // Create Data Form Data
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        is_active: 1,
        translations: [],
    });

    // Create Data Form Request
    const submit = (e) => {
        e.preventDefault();
        post(route('dashboard.settings.model_names.store'));
    };

    // Frontend guard: disable submit while any open translation block is incomplete.
    const translationsOk = areTranslationsComplete(data.translations, ['name']);

    return (
        <>
            <AuthenticatedLayout>
                <Head title="Model Names" />

                <BreadCrumb
                    header={'Create Model Name'}
                    parent={'Model Names'}
                    parent_link={route('dashboard.settings.model_names.index')}
                    child={'Create Model Name'}
                />

                <Card
                    Content={
                        <>
                            <div className="flex flex-wrap justify-end my-3">
                                <LinkButton
                                    Text={'Back To Model Names'}
                                    URL={route('dashboard.settings.model_names.index')}
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
                                                    InputName={'Model Name'}
                                                    Error={errors.name}
                                                    Value={data.name}
                                                    Action={(e) => setData('name', e.target.value)}
                                                    Placeholder={'Enter Model Name'}
                                                    Id={'name'}
                                                    Name={'name'}
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
                                            </div>

                                            <TranslationsRepeater
                                                languages={languages}
                                                value={data.translations}
                                                onChange={(next) => setData('translations', next)}
                                                fields={[
                                                    { key: 'name', label: 'Name', type: 'text' },
                                                ]}
                                            />

                                            <PrimaryButton
                                                Text={'Create Model Name'}
                                                Type={'submit'}
                                                CustomClass={'w-[250px] '}
                                                Disabled={
                                                    processing ||
                                                    data.name.trim() === '' ||
                                                    data.is_active === '' ||
                                                    !translationsOk
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
