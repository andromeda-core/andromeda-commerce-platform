import Card from '@/Components/Card';
import Input from '@/Components/Input';
import LinkButton from '@/Components/LinkButton';
import PrimaryButton from '@/Components/PrimaryButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BreadCrumb from '@/Components/BreadCrumb';
import { Head, useForm } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import SelectInput from '@/Components/SelectInput';
import FileUploaderInput from '@/Components/FileUploaderInput';
import BarcodeScannerComponent from 'react-qr-barcode-scanner';
import Toast from '@/Components/Toast';

export default function create({ colors, model_names, capacities, categories }) {
    // Create Data Form Data
    const { data, setData, post, processing, errors, reset } = useForm({
        model_name_id: '',
        capacity_id: '',
        color_ids: [],
        category_id: '',
        upc: '',
        images: [],
    });

    const [file_error, setFileError] = useState(null);

    useEffect(() => {
        if (file_error != null) {
            setFileError(null);
        }
    }, [data?.images]);

    useEffect(() => {
        if (errors?.file_error) {
            setFileError(errors.file_error);
        }
    }, [errors]);
    // Create Data Form Request
    const submit = (e) => {
        e.preventDefault();
        post(route('dashboard.smartphones.store'));
    };

    const [scannerOpen, setScannerOpen] = useState(false);

    return (
        <>
            <AuthenticatedLayout>
                <Head title="Smart Phones" />

                <BreadCrumb
                    header={'Create Smart Phone'}
                    parent={'Smart Phones'}
                    parent_link={route('dashboard.smartphones.index')}
                    child={'Create Smart Phone'}
                />

                {file_error != null && <Toast flash={{ info: file_error }} />}
                <Card
                    Content={
                        <>
                            <div className="my-3 flex flex-wrap justify-end">
                                <LinkButton
                                    Text={'Back To Smart Phones'}
                                    URL={route('dashboard.smartphones.index')}
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
                                                <SelectInput
                                                    InputName={'Model Name'}
                                                    Id={'model_name_id'}
                                                    Name={'model_name_id'}
                                                    items={model_names}
                                                    itemKey={'name'}
                                                    Value={data.model_name_id}
                                                    Error={errors.model_name_id}
                                                    Required={true}
                                                    Placeholder={'Select Model Name'}
                                                    Action={(value) => {
                                                        setData('model_name_id', value);
                                                    }}
                                                />

                                                <SelectInput
                                                    InputName={'Capacity'}
                                                    Id={'capacity_id'}
                                                    Name={'capacity_id'}
                                                    items={capacities}
                                                    itemKey={'name'}
                                                    Value={data.capacity_id}
                                                    Error={errors.capacity_id}
                                                    Required={true}
                                                    Placeholder={'Select Capacity'}
                                                    Action={(value) => {
                                                        setData('capacity_id', value);
                                                    }}
                                                />

                                                <SelectInput
                                                    InputName={'Category'}
                                                    Id={'category_id'}
                                                    Name={'category_id'}
                                                    items={categories}
                                                    itemKey={'name'}
                                                    Value={data.category_id}
                                                    Error={errors.category_id}
                                                    Required={true}
                                                    Placeholder={'Select Category'}
                                                    Action={(value) => {
                                                        setData('category_id', value);
                                                    }}
                                                />

                                                <SelectInput
                                                    InputName={'Colors'}
                                                    Id={'color_ids'}
                                                    Name={'color_ids'}
                                                    Error={errors.color_ids}
                                                    Value={data.color_ids}
                                                    items={colors}
                                                    itemKey={'name'}
                                                    Placeholder={'Select Colors'}
                                                    Required={true}
                                                    Multiple={true}
                                                    Action={(value) => {
                                                        setData('color_ids', value);
                                                    }}
                                                />

                                                <div className="flex items-center">
                                                    <PrimaryButton
                                                        Type={'button'}
                                                        Id={'scan_upc'}
                                                        ClassName={
                                                            'dark:bg-deepcharcoal dark:text-white p-2  rounded-lg text-center dark:hover:bg-gray-700 transition duration-200 ease-in-out hover:bg-blue-700 hover:text-white bg-slate-100'
                                                        }
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
                                                                    d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z"
                                                                />
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    d="M6.75 6.75h.75v.75h-.75v-.75ZM6.75 16.5h.75v.75h-.75v-.75ZM16.5 6.75h.75v.75h-.75v-.75ZM13.5 13.5h.75v.75h-.75v-.75ZM13.5 19.5h.75v.75h-.75v-.75ZM19.5 13.5h.75v.75h-.75v-.75ZM19.5 19.5h.75v.75h-.75v-.75ZM16.5 16.5h.75v.75h-.75v-.75Z"
                                                                />
                                                            </svg>
                                                        }
                                                        Action={() => setScannerOpen(true)}
                                                    />
                                                    <Input
                                                        InputName={'UPC/EAN'}
                                                        Error={errors.upc}
                                                        Value={data.upc}
                                                        Action={(e) =>
                                                            setData('upc', e.target.value)
                                                        }
                                                        Placeholder={'Enter UPC/EAN'}
                                                        Id={'upc'}
                                                        Name={'upc'}
                                                        Type={'text'}
                                                        Required={true}
                                                    />
                                                </div>
                                            </div>

                                            <div className="col-span-2 grid grid-cols-1 gap-4 md:grid-cols-1">
                                                <FileUploaderInput
                                                    InputName={'Smart Phone Images'}
                                                    Id={'images'}
                                                    Error={errors.images}
                                                    Label={
                                                        'Drag & Drop your Smart Phone Images or <span class="filepond--label-action">Browse</span>'
                                                    }
                                                    Required={true}
                                                    Multiple={true}
                                                    acceptedFileTypes={['image/*']}
                                                    MaxFiles={5}
                                                    MaxFileSize={'5MB'}
                                                    onUpdate={(files) => {
                                                        if (files.length > 0) {
                                                            const newFiles = files
                                                                .filter((f) => f.isNew)
                                                                .map((f) => f.file);

                                                            setData('images', newFiles);
                                                        } else {
                                                            setData('images', null);
                                                        }
                                                    }}
                                                />
                                            </div>

                                            <PrimaryButton
                                                Text={'Create Smart Phone'}
                                                Type={'submit'}
                                                CustomClass={'w-[250px] '}
                                                Disabled={
                                                    processing ||
                                                    data.model_name_id === '' ||
                                                    data.capacity_id === '' ||
                                                    data.color_ids.length === 0 ||
                                                    data.upc.trim() === '' ||
                                                    data.images?.length === 0 ||
                                                    data.category_id === ''
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

                            {/* Cam */}
                            {scannerOpen && (
                                <>
                                    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 sm:p-6">
                                        <div className="fixed inset-0 backdrop-blur-[32px]"></div>

                                        {/* Modal content */}
                                        <div className="relative z-10 max-h-screen w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl dark:bg-deepcharcoal sm:p-8">
                                            <div className="text-center">
                                                <h2 className="text-lg font-medium text-gray-800 dark:text-white">
                                                    Place The Camera On The UPC Barcode
                                                </h2>

                                                {scannerOpen && (
                                                    <div className="flex items-center justify-center">
                                                        <div
                                                            className="rounded-2xl"
                                                            style={{ marginTop: 20 }}
                                                        >
                                                            <BarcodeScannerComponent
                                                                width={400}
                                                                height={400}
                                                                onUpdate={(err, result) => {
                                                                    if (result) {
                                                                        setData('upc', result.text);
                                                                        setScannerOpen(false);
                                                                    }
                                                                }}
                                                            />

                                                            <div className="flex items-center justify-center">
                                                                <PrimaryButton
                                                                    Action={() =>
                                                                        setScannerOpen(false)
                                                                    }
                                                                    Text={'Close Scanner'}
                                                                    Type={'button'}
                                                                    CustomClass={'mt-4'}
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
                                                                                d="M6 18 18 6M6 6l12 12"
                                                                            />
                                                                        </svg>
                                                                    }
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </>
                    }
                />
            </AuthenticatedLayout>
        </>
    );
}
