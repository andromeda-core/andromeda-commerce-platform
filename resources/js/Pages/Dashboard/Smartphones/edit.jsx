import Card from '@/Components/Card';
import Input from '@/Components/Input';
import LinkButton from '@/Components/LinkButton';
import PrimaryButton from '@/Components/PrimaryButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BreadCrumb from '@/Components/BreadCrumb';
import { Head, router, useForm } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import SelectInput from '@/Components/SelectInput';
import FileUploaderInput from '@/Components/FileUploaderInput';
import BarcodeScannerComponent from 'react-qr-barcode-scanner';
import Toast from '@/Components/Toast';

export default function edit({ smartphone, colors, model_names, capacities, categories }) {
    // Create Data Form Data
    const { data, setData, post, reset } = useForm({
        _method: 'PUT',
        model_name_id: smartphone.model_name_id || '',
        capacity_id: smartphone.capacity_id || '',
        category_id: smartphone.category_id || '',
        color_ids: smartphone.color_ids || [],
        upc: smartphone.upc || '',
        images: [],
    });

    // Submit Processing
    const [processing, setProcessing] = useState(false);

    // File Change State Tracker
    const [fileChanged, setFileChanged] = useState(false);

    // Submit Errors
    const [errors, setErrors] = useState({});

    // Tracking Deleted Files
    const getDeletedFiles = (original, current) => {
        if (!Array.isArray(original) || !Array.isArray(current)) return [];

        const currentSources = current.filter((f) => !f.isNew).map((f) => f.source);

        return original.filter((file) => !currentSources.includes(file.url));
    };

    // Update Data Form Request

    const submit = (e) => {
        e.preventDefault();

        const deletedImages = getDeletedFiles(smartphone.images, data.images || []);
        const newImages = (data.images || []).filter((f) => f.isNew).map((f) => f.file);

        const formData = {
            ...data,
            deleted_images: deletedImages,
            new_images: newImages,
        };

        setProcessing(true);
        router.post(route('dashboard.smartphones.update', smartphone.id), formData, {
            forceFormData: true,
            onSuccess: () => {
                setProcessing(false);
                setShowProgressModal(false);
                reset();
            },
            onError: (errors) => {
                setErrors(errors);
                setProcessing(false);
                setShowProgressModal(false);
            },
            onFinish: () => {
                setProcessing(false);
                setShowProgressModal(false);
            },
        });
    };

    const [file_error, setFileError] = useState(null);
    const [showProgressModal, setShowProgressModal] = useState(false);

    useEffect(() => {
        if (file_error != null) {
            setFileError(null);
        }
    }, [data?.images]);

    useEffect(() => {
        if (data?.images?.length > 0 && processing) {
            setShowProgressModal(true);
        } else {
            setShowProgressModal(false);
        }
    }, [processing, data?.images]);

    useEffect(() => {
        if (errors?.file_error) {
            setFileError(errors.file_error);
        }
    }, [errors]);

    const [scannerOpen, setScannerOpen] = useState(false);

    return (
        <>
            <AuthenticatedLayout>
                <Head title="Smart Phones" />

                <BreadCrumb
                    header={'Edit Smart Phone'}
                    parent={'Smart Phones'}
                    parent_link={route('dashboard.smartphones.index')}
                    child={'Edit Smart Phone'}
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
                                                            'dark:bg-deepcharcoal dark:text-white p-2 mt-1 rounded-lg text-center dark:hover:bg-gray-700 transition duration-200 ease-in-out hover:bg-blue-700 hover:text-white bg-slate-100'
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
                                                            setFileChanged(true);

                                                            setData('images', files);
                                                        } else {
                                                            setData('images', null);
                                                            setFileChanged(false);
                                                        }
                                                    }}
                                                    DefaultFile={smartphone.smartphone_image_urls}
                                                />
                                            </div>

                                            <PrimaryButton
                                                Text={'Update Smart Phone'}
                                                Type={'submit'}
                                                CustomClass={'w-[250px] '}
                                                Disabled={
                                                    processing ||
                                                    data.model_name_id === '' ||
                                                    data.capacity_id === '' ||
                                                    data.color_ids.length === 0 ||
                                                    data.upc.trim() === '' ||
                                                    data?.images?.length === 0 ||
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
                                                            d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
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

                            {showProgressModal && (
                                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 sm:p-6">
                                    <div className="fixed inset-0 backdrop-blur-[32px]"></div>

                                    {/* Modal content */}
                                    <div className="relative z-10 max-h-screen w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl dark:bg-deepcharcoal sm:p-8">
                                        <div className="text-center">
                                            <h2 className="text-lg font-medium text-gray-800 dark:text-white">
                                                Please Wait While We Are Uploading Smart Phone
                                                Images
                                            </h2>

                                            <div className="mt-5 flex items-center justify-center">
                                                <div role="status">
                                                    <svg
                                                        aria-hidden="true"
                                                        className="h-8 w-8 animate-spin fill-blue-600 text-gray-200 dark:text-gray-600"
                                                        viewBox="0 0 100 101"
                                                        fill="none"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                    >
                                                        <path
                                                            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                                            fill="currentColor"
                                                        />
                                                        <path
                                                            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                                            fill="currentFill"
                                                        />
                                                    </svg>
                                                    <span className="sr-only">Loading...</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    }
                />
            </AuthenticatedLayout>
        </>
    );
}
