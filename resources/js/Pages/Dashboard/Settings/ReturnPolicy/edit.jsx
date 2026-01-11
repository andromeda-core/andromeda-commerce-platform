import Card from '@/Components/Card';
import Input from '@/Components/Input';
import LinkButton from '@/Components/LinkButton';
import PrimaryButton from '@/Components/PrimaryButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BreadCrumb from '@/Components/BreadCrumb';
import { Head, useForm } from '@inertiajs/react';
import React from 'react';
import TipTapEditor from '@/Components/TipTapEditor';
import SelectInput from '@/Components/SelectInput';

export default function edit({ return_policy, languages }) {
    // Edit Data Form Data
    const { data, setData, put, processing, errors } = useForm({
        name: return_policy?.name || '',
        content: return_policy?.content ?? [
            { title: '', content: '' }
        ],
        language_id: return_policy?.language_id || '',
    });

    // Add new section
    const addSection = () => {
        setData('content', [
            ...data.content,
            { title: '', content: '' }
        ]);
    };

    // Update section
    const updateSection = (index, field, value) => {
        const updatedSections = [...data.content];
        updatedSections[index][field] = value;
        setData('content', updatedSections);
    };

    // Remove section
    const removeSection = (index) => {
        if (index === 0) return;
        const updatedSections = data.content.filter((_, i) => i !== index);
        setData('content', updatedSections);
    };

    // Update Data Form Request
    const submit = (e) => {
        e.preventDefault();
        put(route('dashboard.settings.return-policy-settings.update', return_policy?.id));
    };

    return (
        <>
            <AuthenticatedLayout>
                <Head title="Settings - Return Policy Settings" />

                <BreadCrumb
                    header={'Settings - Edit Return Policy'}
                    parent={'Return Policy Settings'}
                    parent_link={route('dashboard.settings.return-policy-settings.index')}
                    child={'Return Policy Settings'}
                />

                <Card
                    Content={
                        <>
                            <div className="flex flex-wrap justify-end my-3">
                                <LinkButton
                                    Text={'Back To Return Policy'}
                                    URL={route('dashboard.settings.return-policy-settings.index')}
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
                                            <div className="grid grid-cols-1 gap-4 mb-10 md:grid-cols-2">
                                                <Input
                                                    InputName={'Return Policy Name'}
                                                    Error={errors.name}
                                                    Value={data.name}
                                                    Action={(e) =>
                                                        setData(
                                                            'name',
                                                            e.target.value,
                                                        )
                                                    }
                                                    Placeholder={'Enter Return Policy Name'}
                                                    Id={'name'}
                                                    Name={'name'}
                                                    Type={'text'}
                                                    Required={true}
                                                />


                                                <SelectInput
                                                    InputName={'Return Policy Language'}
                                                    Error={errors.language_id}
                                                    Value={data.language_id}
                                                    Action={(e) =>
                                                        setData(
                                                            'language_id',
                                                            e,
                                                        )
                                                    }
                                                    Placeholder={'Select Return Policy Language'}
                                                    customPlaceHolder={true}
                                                    Id={'language_id'}
                                                    Name={'language_id'}
                                                    items={languages}
                                                    itemKey={'name'}
                                                    Required={true}
                                                />
                                            </div>
                                            <div className="mb-6">
                                                <div className="flex items-center justify-between mb-4">
                                                    <h3 className="text-lg font-semibold">Sections</h3>


                                                    <PrimaryButton
                                                        CustomClass={"w-auto"}
                                                        Type={"button"}
                                                        Icon={
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                strokeWidth={1.5}
                                                                stroke="currentColor"
                                                                className="size-5"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    d="M12 4.5v15m7.5-7.5h-15"
                                                                />
                                                            </svg>
                                                        }
                                                        Text={"Add Section"}
                                                        Action={addSection}
                                                    />
                                                </div>



                                                {data.content.map((section, index) => (
                                                    <Card key={index}
                                                        CustomCss={"relative"}

                                                        Content={
                                                            <>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeSection(index)}
                                                                    className={`absolute text-red-600 transition-colors top-10 right-4 hover:text-red-800 ${index === 0 ? 'hidden' : 'visible'}`}
                                                                >
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
                                                                            d="M6 18 18 6M6 6l12 12"
                                                                        />
                                                                    </svg>
                                                                </button>

                                                                <div className="pr-10 mb-4">
                                                                    <Input
                                                                        InputName={`Section ${index + 1} Title`}
                                                                        Error={errors[`content.${index}.title`]}
                                                                        Value={section.title}
                                                                        Action={(e) => updateSection(index, 'title', e.target.value)}
                                                                        Placeholder={'Enter Section Title'}
                                                                        Id={`section_title_${index}`}
                                                                        Name={`sections[${index}][title]`}
                                                                        Type={'text'}
                                                                        Required={false}
                                                                    />
                                                                </div>

                                                                <div>
                                                                    <TipTapEditor
                                                                        Label={`Section ${index + 1} Content`}
                                                                        Error={errors[`content.${index}.content`]}
                                                                        Id={`section_content_${index}`}
                                                                        Value={section.content}
                                                                        Required={false}
                                                                        Action={(value) => updateSection(index, 'content', value)}
                                                                    />
                                                                </div>
                                                            </>
                                                        } />


                                                ))}
                                            </div>

                                            <PrimaryButton
                                                Text={'Update Return Policy'}
                                                Type={'submit'}
                                                CustomClass={'w-[300px] '}
                                                Disabled={
                                                    processing ||
                                                    data.name.trim() === ''
                                                    ||
                                                    data.content.some((section) =>
                                                        section.title.trim() === '' ||
                                                        (section.content.trim() === '' || section.content === '<p><br></p>' || section.content === '<p></p>')
                                                    ) ||
                                                    data.language_id === ''
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
