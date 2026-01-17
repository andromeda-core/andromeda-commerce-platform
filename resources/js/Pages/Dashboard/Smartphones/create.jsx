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
import TipTapEditor from '@/Components/TipTapEditor';

export default function create({ colors, model_names, capacities, categories, conditions, countries, return_policies, courier_companies, addons }) {
    // Create Data Form Data
    const { data, setData, post, processing, errors } = useForm({
        model_name_id: '',
        capacity_id: '',
        color_ids: [],
        category_id: '',
        country_id: '',
        delivery_days: '',
        condition_id: '',
        courier_company_id: '',
        return_policy_id: '',
        addon_ids: [],
        upc: '',
        images: [],
        tag: '',
        content: '',
        product_details: [],
    });


    const [file_error, setFileError] = useState(null);

    // Product Details Data Handling
    const [productDetails, setProductDetails] = useState([]);

    const addProductDetails = () => {
        setProductDetails([...productDetails, { title: '', value: '' }]);
    };

    const removeProductDetails = (index) => {
        const updatedDetail = productDetails.filter((_, i) => i !== index);
        setProductDetails(updatedDetail);
        setData('product_details', updatedDetail);
    };
    const handleChangeProductDetails = (index, field, value) => {
        const updatedDetail = [...productDetails];
        updatedDetail[index][field] = value;
        setData('product_details', updatedDetail);
        setProductDetails(updatedDetail);
    };

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
                            <div className="flex flex-wrap justify-end my-3">
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
                                                    Multiple={false}
                                                    Action={(value) => {
                                                        setData('color_ids', [value]);
                                                    }}
                                                />

                                                <div className="flex items-center">
                                                    <PrimaryButton
                                                        Type={'button'}
                                                        Id={'scan_upc'}
                                                        ClassName={
                                                            'dark:bg-deepcharcoal dark:text-white p-2 mt-6  rounded-lg text-center dark:hover:bg-gray-700 transition duration-200 ease-in-out hover:bg-blue-700 hover:text-white bg-slate-100'
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

                                                <Input
                                                    InputName={'Tag'}
                                                    Error={errors.tag}
                                                    Value={data.tag}
                                                    Action={(e) => setData('tag', e.target.value)}
                                                    Placeholder={'Enter Tag'}
                                                    Id={'tag'}
                                                    Name={'tag'}
                                                    Type={'text'}
                                                    Required={false}
                                                />



                                                <Input
                                                    InputName={'Approx Max Delivery Days (In No.s Like 1, 2, 3, 4, 5)'}
                                                    Error={errors.delivery_days}
                                                    Value={data.delivery_days}
                                                    Action={(e) => setData('delivery_days', e.target.value)}
                                                    Placeholder={'Enter Delivery Days'}
                                                    Id={'delivery_days'}
                                                    Name={'delivery_days'}
                                                    Type={'number'}
                                                    Required={true}
                                                />




                                                <SelectInput
                                                    InputName={'Country/Region'}
                                                    Id={'country_id'}
                                                    Name={'country_id'}
                                                    Error={errors.country_id}
                                                    Value={data.country_id}
                                                    items={countries}
                                                    itemKey={'name'}
                                                    Placeholder={'Select Country'}
                                                    customPlaceHolder={true}
                                                    Required={true}
                                                    Multiple={false}
                                                    Action={(value) => {
                                                        setData('country_id', value);
                                                    }}
                                                />



                                                <SelectInput
                                                    InputName={'Condition'}
                                                    Id={'condition_id'}
                                                    Name={'condition_id'}
                                                    Error={errors.condition_id}
                                                    Value={data.condition_id}
                                                    items={conditions}
                                                    itemKey={'name'}
                                                    Placeholder={'Select Condition'}
                                                    customPlaceHolder={true}
                                                    Required={true}
                                                    Multiple={false}
                                                    Action={(value) => {
                                                        setData('condition_id', value);
                                                    }}
                                                />





                                                <SelectInput
                                                    InputName={'Return Policy'}
                                                    Id={'return_policy_id'}
                                                    Name={'return_policy_id'}
                                                    Error={errors.return_policy_id}
                                                    Value={data.return_policy_id}
                                                    items={return_policies}
                                                    itemKey={'name'}
                                                    Placeholder={'Select Return Policy'}
                                                    customPlaceHolder={true}
                                                    Required={true}
                                                    Multiple={false}
                                                    Action={(value) => {
                                                        setData('return_policy_id', value);
                                                    }}
                                                />


                                                <SelectInput
                                                    InputName={'Courier Company'}
                                                    Id={'courier_company_id'}
                                                    Name={'courier_company_id'}
                                                    Error={errors.courier_company_id}
                                                    Value={data.courier_company_id}
                                                    items={courier_companies}
                                                    itemKey={'courier_name'}
                                                    Placeholder={'Select Courier Company'}
                                                    customPlaceHolder={true}
                                                    Required={true}
                                                    Multiple={false}
                                                    Action={(value) => {
                                                        setData('courier_company_id', value);
                                                    }}
                                                />


                                                <SelectInput
                                                    InputName={'Addons'}
                                                    Id={'addon_ids'}
                                                    Name={'addon_ids'}
                                                    Error={errors.addon_ids}
                                                    Value={data.addon_ids}
                                                    items={addons}
                                                    itemKey={'name'}
                                                    Placeholder={'Select Addons'}
                                                    customPlaceHolder={true}
                                                    Required={false}
                                                    Multiple={true}
                                                    Action={(value) => {
                                                        setData('addon_ids', value);
                                                    }}
                                                />



                                            </div>

                                            <div className="grid grid-cols-1 col-span-2 gap-4 mt-10 md:grid-cols-1">
                                                <FileUploaderInput
                                                    InputName={'Smart Phone Images'}
                                                    Id={'images'}
                                                    Error={errors.file_error}
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

                                            <div className="grid grid-cols-1 gap-4">
                                                <TipTapEditor
                                                    Label={'Content'}
                                                    Id={'content'}
                                                    Required={true}
                                                    Value={data.content}
                                                    Error={errors.content}
                                                    Action={(value) => {
                                                        if (value == '<p></p>')
                                                            setData('content', '');
                                                        else setData('content', value);
                                                    }}
                                                />
                                            </div>


                                            <div className="flex items-center justify-end w-full">
                                                <PrimaryButton
                                                    Text={'Add Product Details'}
                                                    Type={'button'}
                                                    Id={'add_product_details'}
                                                    CustomClass={'w-[250px] '}
                                                    Action={addProductDetails}
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
                                                                d="m4.5 5.25 7.5 7.5 7.5-7.5m-15 6 7.5 7.5 7.5-7.5"
                                                            />
                                                        </svg>
                                                    }
                                                />
                                            </div>

                                            <div className="grid grid-cols-1">
                                                {productDetails.length > 0 && (
                                                    <div className="grid grid-cols-1 col-span-1 gap-5 overflow-x-auto scrollbar-thin dark:scrollbar-track-slate-900 dark:scrollbar-thumb-slate-700">
                                                        <table className="w-full border-collapse">
                                                            <thead>
                                                                <tr>
                                                                    <th className="p-2 text-left text-gray-700 border dark:border-gray-700 dark:text-gray-400">
                                                                        Title
                                                                    </th>
                                                                    <th className="p-2 text-left text-gray-700 border dark:border-gray-700 dark:text-gray-400">
                                                                        Value
                                                                    </th>
                                                                    <th className="p-2 text-center text-gray-700 border dark:border-gray-700 dark:text-gray-400">
                                                                        Action
                                                                    </th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {productDetails.map((item, idx) => (
                                                                    <tr key={idx}>
                                                                        <td className="p-2 border dark:border-gray-700">
                                                                            <Input
                                                                                InputName={'Title'}
                                                                                Id={'title'}
                                                                                Name={'title'}
                                                                                Error={
                                                                                    errors[
                                                                                    `product_details.${idx}.title`
                                                                                    ]
                                                                                }
                                                                                Value={item.title}
                                                                                Required={true}
                                                                                Type={'text'}
                                                                                Placeholder={
                                                                                    'Enter Title'
                                                                                }
                                                                                Action={(e) =>
                                                                                    handleChangeProductDetails(
                                                                                        idx,
                                                                                        'title',
                                                                                        e.target.value,
                                                                                    )
                                                                                }
                                                                            />
                                                                        </td>
                                                                        <td className="p-2 border dark:border-gray-700">
                                                                            <Input
                                                                                InputName={'Value'}
                                                                                Id={'value'}
                                                                                Name={'value'}
                                                                                Error={
                                                                                    errors[
                                                                                    `product_details.${idx}.value`
                                                                                    ]
                                                                                }
                                                                                Value={item.value}
                                                                                Required={true}
                                                                                Type={'text'}
                                                                                Placeholder={
                                                                                    'Enter Value'
                                                                                }
                                                                                Action={(e) =>
                                                                                    handleChangeProductDetails(
                                                                                        idx,
                                                                                        'value',
                                                                                        e.target.value,
                                                                                    )
                                                                                }
                                                                            />
                                                                        </td>

                                                                        <td className="p-2 border dark:border-gray-700">
                                                                            <div className="flex items-center justify-center">
                                                                                <PrimaryButton
                                                                                    Type={'button'}
                                                                                    Id={
                                                                                        'delete_product_detail'
                                                                                    }
                                                                                    Action={() =>
                                                                                        removeProductDetails(
                                                                                            idx,
                                                                                        )
                                                                                    }
                                                                                    CustomClass={
                                                                                        'w-[50px] bg-red-500 hover:bg-red-600'
                                                                                    }
                                                                                    Icon={
                                                                                        <svg
                                                                                            xmlns="http://www.w3.org/2000/svg"
                                                                                            fill="none"
                                                                                            viewBox="0 0 24 24"
                                                                                            strokeWidth={
                                                                                                1.5
                                                                                            }
                                                                                            stroke="currentColor"
                                                                                            className="size-6"
                                                                                        >
                                                                                            <path
                                                                                                strokeLinecap="round"
                                                                                                strokeLinejoin="round"
                                                                                                d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                                                                                            />
                                                                                        </svg>
                                                                                    }
                                                                                />
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                )}
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
                                                    data.category_id === '' ||
                                                    data.content.trim() === '' ||
                                                    data.country_id === '' ||
                                                    data.condition_id === '' ||
                                                    data.courier_company_id === '' ||
                                                    data.return_policy_id === '' ||
                                                    data.delivery_days === '' ||
                                                    (productDetails.length > 0 &&
                                                        productDetails.some(
                                                            (detail) =>
                                                                detail.title === '' ||
                                                                detail.value === ''
                                                        ))
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
                                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto sm:p-6">
                                        <div className="fixed inset-0 backdrop-blur-[32px]"></div>

                                        {/* Modal content */}
                                        <div className="relative z-10 w-full max-w-lg max-h-screen p-6 overflow-y-auto bg-white shadow-xl rounded-2xl dark:bg-deepcharcoal sm:p-8">
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
