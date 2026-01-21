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
import Textarea from '@/Components/Textarea';

export default function create({ languages }) {
    // Create Data Form Data
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        content: [
            { title: '', content: '' }
        ],
        language_id: '',
        company_name: '',
        country: '',
        state: '',

        dpo_name: '',
        dpo_email: '',
        dpo_phone: '',
        dpo_address: '',
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

    // Create Data Form Request
    const submit = (e) => {
        e.preventDefault();
        post(route('dashboard.settings.terms-of-service-settings.store'));
    };

    return (
        <>
            <AuthenticatedLayout>
                <Head title="Settings - Terms Of Service Settings" />

                <BreadCrumb
                    header={'Settings - Create Terms Of Service'}
                    parent={'Terms Of Service Settings'}
                    parent_link={route('dashboard.settings.terms-of-service-settings.index')}
                    child={'Terms Of Service Settings'}
                />

                <Card
                    Content={
                        <>
                            <div className="flex flex-wrap justify-end my-3">
                                <LinkButton
                                    Text={'Back To Terms Of Service'}
                                    URL={route('dashboard.settings.terms-of-service-settings.index')}
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
                                                    InputName={'Terms Of Service Name'}
                                                    Error={errors.name}
                                                    Value={data.name}
                                                    Action={(e) =>
                                                        setData(
                                                            'name',
                                                            e.target.value,
                                                        )
                                                    }
                                                    Placeholder={'Enter Terms Of Service Name'}
                                                    Id={'name'}
                                                    Name={'name'}
                                                    Type={'text'}
                                                    Required={true}
                                                />


                                                <SelectInput
                                                    InputName={'Terms Of Service Language'}
                                                    Error={errors.language_id}
                                                    Value={data.language_id}
                                                    Action={(e) =>
                                                        setData(
                                                            'language_id',
                                                            e,
                                                        )
                                                    }
                                                    Placeholder={'Select Terms Of Service Language'}
                                                    customPlaceHolder={true}
                                                    Id={'language_id'}
                                                    Name={'language_id'}
                                                    items={languages}
                                                    itemKey={'name'}
                                                    Required={true}
                                                />


                                                <Input
                                                    InputName={'Company Name'}
                                                    Error={errors.company_name}
                                                    Value={data.company_name}
                                                    Action={(e) =>
                                                        setData(
                                                            'company_name',
                                                            e.target.value,
                                                        )
                                                    }
                                                    Placeholder={'Enter Company Name'}
                                                    Id={'company_name'}
                                                    Name={'company_name'}
                                                    Type={'text'}
                                                    Required={true}
                                                />


                                                <Input
                                                    InputName={'Country Name'}
                                                    Error={errors.country}
                                                    Value={data.country}
                                                    Action={(e) =>
                                                        setData(
                                                            'country',
                                                            e.target.value,
                                                        )
                                                    }
                                                    Placeholder={'Enter Country Name'}
                                                    Id={'country'}
                                                    Name={'country'}
                                                    Type={'text'}
                                                    Required={true}
                                                />



                                                <Input
                                                    InputName={'State Name'}
                                                    Error={errors.state}
                                                    Value={data.state}
                                                    Action={(e) =>
                                                        setData(
                                                            'state',
                                                            e.target.value,
                                                        )
                                                    }
                                                    Placeholder={'Enter State Name'}
                                                    Id={'state'}
                                                    Name={'state'}
                                                    Type={'text'}
                                                    Required={true}
                                                />



                                                <Input
                                                    InputName={'DOP Name'}
                                                    Error={errors.dpo_name}
                                                    Value={data.dpo_name}
                                                    Action={(e) =>
                                                        setData(
                                                            'dpo_name',
                                                            e.target.value,
                                                        )
                                                    }
                                                    Placeholder={'Enter DOP Name'}
                                                    Id={'dpo_name'}
                                                    Name={'dpo_name'}
                                                    Type={'text'}
                                                    Required={true}
                                                />


                                                <Input
                                                    InputName={'DOP Email'}
                                                    Error={errors.dpo_email}
                                                    Value={data.dpo_email}
                                                    Action={(e) =>
                                                        setData(
                                                            'dpo_email',
                                                            e.target.value,
                                                        )
                                                    }
                                                    Placeholder={'Enter DOP Email'}
                                                    Id={'dpo_email'}
                                                    Name={'dpo_email'}
                                                    Type={'email'}
                                                    Required={true}
                                                />



                                                <Input
                                                    InputName={'DOP Phone'}
                                                    Error={errors.dpo_phone}
                                                    Value={data.dpo_phone}
                                                    Action={(e) =>
                                                        setData(
                                                            'dpo_phone',
                                                            e.target.value,
                                                        )
                                                    }
                                                    Placeholder={'Enter DOP Phone'}
                                                    Id={'dpo_phone'}
                                                    Name={'dpo_phone'}
                                                    Type={'text'}
                                                    Required={true}
                                                />


                                                <Textarea
                                                    InputName={'DOP Address'}
                                                    Error={errors.dpo_address}
                                                    Value={data.dpo_address}
                                                    Action={(e) =>
                                                        setData(
                                                            'dpo_address',
                                                            e.target.value,
                                                        )
                                                    }
                                                    Placeholder={'Enter DOP Address'}
                                                    Id={'dpo_address'}
                                                    Name={'dpo_address'}
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
                                                Text={'Create Terms Of Service'}
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
                                                    data.language_id === '' ||
                                                    data.state.trim() === '' ||
                                                    data.country.trim() === '' ||
                                                    data.company_name.trim() === '' ||
                                                    data.dpo_name.trim() === '' ||
                                                    data.dpo_email.trim() === '' ||
                                                    data.dpo_phone.trim() === '' ||
                                                    data.dpo_address.trim() === ''
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
