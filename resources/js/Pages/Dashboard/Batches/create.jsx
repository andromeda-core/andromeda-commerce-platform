import Card from '@/Components/Card';
import Input from '@/Components/Input';
import LinkButton from '@/Components/LinkButton';
import PrimaryButton from '@/Components/PrimaryButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BreadCrumb from '@/Components/BreadCrumb';
import { Head, useForm, usePage } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import SelectInput from '@/Components/SelectInput';
import Toast from '@/Components/Toast';
import Swal from 'sweetalert2';
import BarcodeScannerComponent from 'react-qr-barcode-scanner';
import FileUploaderInput from '@/Components/FileUploaderInput';
export default function create({ suppliers, smartphones, storage_locations }) {
    // Create Data Form Data
    const { data, setData, post, processing, errors, reset } = useForm({
        batch_name: '',
        base_purchase_unit_price: '',
        supplier_id: '',
        vat: '',
        extra_costs: [],
        inventory_items: [],
        invoices: [],
    });

    const { currency } = usePage().props;
    const [file_error, setFileError] = useState(null);

    // Extra Cost Data Handling
    const [extraCosts, setExtraCosts] = useState([]);
    const addExtraCost = () => {
        setExtraCosts([...extraCosts, { cost_type: '', amount: '' }]);
    };
    const removeExtraCost = (index) => {
        const updatedCosts = extraCosts.filter((_, i) => i !== index);
        setExtraCosts(updatedCosts);
        setData('extra_costs', updatedCosts);
    };
    const handleChange = (index, field, value) => {
        const updatedCosts = [...extraCosts];
        updatedCosts[index][field] = value;
        setData('extra_costs', updatedCosts);
        setExtraCosts(updatedCosts);
    };

    // Inventory Items
    const [inventoryItems, setInventoryItems] = useState([
        {
            smartphone_id: '',
            storage_location_id: '',
            imei1: '',
            imei2: '',
            eid: '',
            serial_no: '',
        },
    ]);
    const addInventoryItems = () => {
        setInventoryItems([
            ...inventoryItems,
            {
                smartphone_id: '',
                storage_location_id: '',
                imei1: '',
                imei2: '',
                eid: '',
                serial_no: '',
            },
        ]);
    };
    const removeInventoryItem = (index) => {
        if (inventoryItems.length === 1) {
            Swal.fire({
                icon: 'info',
                title: 'Oops...',
                text: 'First Inventory Item Cannot be deleted',
            });
            return;
        }

        const updatedInventoryItems = inventoryItems.filter((_, i) => i !== index);
        setInventoryItems(updatedInventoryItems);
        setData('inventory_items', updatedInventoryItems);
    };
    const handleInventoryChange = (index, field, value) => {
        const updatedInventoryItems = [...inventoryItems];
        updatedInventoryItems[index][field] = value;
        setData('inventory_items', updatedInventoryItems);
        setInventoryItems(updatedInventoryItems);
    };

    // Scanners
    const [smartphoneScannerOpen, setSmartphoneScannerOpen] = useState(false);
    const [imei1ScannerOpen, setImei1ScannerOpen] = useState(false);
    const [imei2ScannerOpen, setImei2ScannerOpen] = useState(false);
    const [eidScannerOpen, setEidScannerOpen] = useState(false);
    const [serialScannerOpen, setSerialScannerOpen] = useState(false);

    // Storing IDS For Scannners
    const [openedSmartphoneScannerId, setOpenedSmartphoneScannerId] = useState(null);
    const [openedImei1ScannerId, setOpenedImei1ScannerId] = useState(null);
    const [openedImei2ScannerId, setOpenedImei2ScannerId] = useState(null);
    const [openedEidScannerId, setOpenedEidScannerId] = useState(null);
    const [openedSerialScannerId, setOpenedSerialScannerId] = useState(null);

    const [showProgressModal, setShowProgressModal] = useState(false);

    useEffect(() => {
        if (data?.invoices?.length > 0 && processing) {
            setShowProgressModal(true);
        } else {
            setShowProgressModal(false);
        }
    }, [processing, data?.invoices]);

    useEffect(() => {
        if (errors?.file_error) {
            setFileError(errors.file_error);
        }
        const timeout = setTimeout(() => {
            setFileError(null);
        }, 3000);

        return () => {
            clearTimeout(timeout);
        };
    }, [errors]);
    // Create Data Form Request
    const submit = (e) => {
        e.preventDefault();
        post(route('dashboard.batches.store'));
    };

    return (
        <>
            <AuthenticatedLayout>
                <Head title="Batches" />

                <BreadCrumb
                    header={'Create Batch'}
                    parent={'Batches'}
                    parent_link={route('dashboard.batches.index')}
                    child={'Create Batch'}
                />

                {file_error != null && <Toast flash={{ info: file_error }} />}
                <Card
                    Content={
                        <>
                            <div className="flex flex-wrap justify-end my-3">
                                <LinkButton
                                    Text={'Back To Batches'}
                                    URL={route('dashboard.batches.index')}
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
                                                    InputName={'Batch Name'}
                                                    Id={'batch_name'}
                                                    Name={'batch_name'}
                                                    Value={data.batch_name}
                                                    Error={errors.batch_name}
                                                    Required={true}
                                                    Type={'text'}
                                                    Placeholder={'Enter Batch Name'}
                                                    Action={(e) => {
                                                        setData('batch_name', e.target.value);
                                                    }}
                                                />

                                                <Input
                                                    InputName={'Vat'}
                                                    Id={'vat'}
                                                    Name={'vat'}
                                                    Value={data.vat}
                                                    Error={errors.vat}
                                                    Required={true}
                                                    Placeholder={'Enter Vat number'}
                                                    Type={'text'}
                                                    Action={(e) => {
                                                        setData('vat', e.target.value);
                                                    }}
                                                />

                                                <div className="flex items-center">
                                                    <Input
                                                        CustomCss={'w-[40px] mt-5'}
                                                        Value={currency?.symbol}
                                                        readOnly={true}
                                                    />
                                                    <Input
                                                        InputName={'Base Purchase Unit Price'}
                                                        Error={errors.base_purchase_unit_price}
                                                        Value={data.base_purchase_unit_price}
                                                        Action={(e) =>
                                                            setData(
                                                                'base_purchase_unit_price',
                                                                e.target.value,
                                                            )
                                                        }
                                                        Placeholder={
                                                            'Enter Base Purchase Unit Price'
                                                        }
                                                        Id={'base_purchase_unit_price'}
                                                        Name={'base_purchase_unit_price'}
                                                        Type={'number'}
                                                        Decimal={true}
                                                        Required={true}
                                                    />
                                                </div>

                                                <SelectInput
                                                    InputName={'Supplier'}
                                                    Name={'supplier_id'}
                                                    Id={'supplier_id'}
                                                    Error={errors.supplier_id}
                                                    Value={data.supplier_id}
                                                    items={suppliers}
                                                    itemKey={'name'}
                                                    Placeholder={'Select Supplier'}
                                                    Required={true}
                                                    Action={(value) =>
                                                        setData('supplier_id', value)
                                                    }
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 gap-4">
                                                <FileUploaderInput
                                                    Label={
                                                        'Drag & Drop your Batch Invoice or <span class="filepond--label-action">Browse</span>'
                                                    }
                                                    Error={errors.invoices}
                                                    Id={'invoices'}
                                                    InputName={'Batch Invoices'}
                                                    acceptedFileTypes={[
                                                        'image/*',
                                                        'application/pdf',
                                                    ]}
                                                    MaxFileSize={'5MB'}
                                                    onUpdate={(files) => {
                                                        if (files.length > 0) {
                                                            const newFiles = files
                                                                .filter((f) => f.isNew)
                                                                .map((f) => f.file);

                                                            setData('invoices', newFiles);
                                                        } else {
                                                            setData('invoices', []);
                                                        }
                                                    }}
                                                    MaxFiles={30}
                                                    Multiple={true}
                                                />
                                            </div>

                                            <div className="flex items-center justify-end w-full">
                                                <PrimaryButton
                                                    Text={'Add More Items'}
                                                    Type={'button'}
                                                    Id={'add_more_items'}
                                                    CustomClass={'w-[200px] '}
                                                    Action={addInventoryItems}
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

                                            <div className="grid grid-cols-1 gap-4">
                                                {inventoryItems.map((item, idx) => (
                                                    <Card
                                                        key={idx}
                                                        Content={
                                                            <>
                                                                <div className="flex items-center justify-end">
                                                                    {/* Delete Button */}
                                                                    <PrimaryButton
                                                                        Type="button"
                                                                        Action={() =>
                                                                            removeInventoryItem(idx)
                                                                        }
                                                                        CustomClass="w-[50px] bg-red-500 hover:bg-red-600"
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
                                                                                    d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                                                                                />
                                                                            </svg>
                                                                        }
                                                                    />
                                                                </div>

                                                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                                    <div className="flex items-center">
                                                                        <PrimaryButton
                                                                            Type={'button'}
                                                                            Id={'scan_smartphone'}
                                                                            ClassName={
                                                                                'dark:bg-deepcharcoal mt-6 dark:text-white p-2  rounded-lg text-center dark:hover:bg-gray-700 transition duration-200 ease-in-out hover:bg-blue-700 hover:text-white bg-slate-100'
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
                                                                                        d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z"
                                                                                    />
                                                                                    <path
                                                                                        strokeLinecap="round"
                                                                                        strokeLinejoin="round"
                                                                                        d="M6.75 6.75h.75v.75h-.75v-.75ZM6.75 16.5h.75v.75h-.75v-.75ZM16.5 6.75h.75v.75h-.75v-.75ZM13.5 13.5h.75v.75h-.75v-.75ZM13.5 19.5h.75v.75h-.75v-.75ZM19.5 13.5h.75v.75h-.75v-.75ZM19.5 19.5h.75v.75h-.75v-.75ZM16.5 16.5h.75v.75h-.75v-.75Z"
                                                                                    />
                                                                                </svg>
                                                                            }
                                                                            Action={() => {
                                                                                setOpenedSmartphoneScannerId(
                                                                                    idx,
                                                                                );
                                                                                setSmartphoneScannerOpen(
                                                                                    true,
                                                                                );
                                                                            }}
                                                                        />

                                                                        {/* Smartphone */}
                                                                        <SelectInput
                                                                            key={idx}
                                                                            InputName="Smartphone"
                                                                            Id="smartphone_id"
                                                                            Name="smartphone_id"
                                                                            items={smartphones}
                                                                            Value={
                                                                                item.smartphone_id
                                                                            }
                                                                            itemKey={'name'}
                                                                            Required={true}
                                                                            Action={(value) => {
                                                                                handleInventoryChange(
                                                                                    idx,
                                                                                    'smartphone_id',
                                                                                    value,
                                                                                );
                                                                            }}
                                                                        />
                                                                    </div>

                                                                    {/* Storage Location */}
                                                                    <SelectInput
                                                                        InputName="Storage Location"
                                                                        Id="storage_location_id"
                                                                        Name="storage_location_id"
                                                                        items={storage_locations}
                                                                        Value={
                                                                            item.storage_location_id
                                                                        }
                                                                        itemKey="name"
                                                                        Required={true}
                                                                        Action={(value) =>
                                                                            handleInventoryChange(
                                                                                idx,
                                                                                'storage_location_id',
                                                                                value,
                                                                            )
                                                                        }
                                                                    />

                                                                    <div className="flex items-center">
                                                                        <PrimaryButton
                                                                            Type={'button'}
                                                                            Id={'scan_smartphone'}
                                                                            ClassName={
                                                                                'dark:bg-deepcharcoal dark:text-white p-2  mt-6 rounded-lg text-center dark:hover:bg-gray-700 transition duration-200 ease-in-out hover:bg-blue-700 hover:text-white bg-slate-100'
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
                                                                                        d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z"
                                                                                    />
                                                                                    <path
                                                                                        strokeLinecap="round"
                                                                                        strokeLinejoin="round"
                                                                                        d="M6.75 6.75h.75v.75h-.75v-.75ZM6.75 16.5h.75v.75h-.75v-.75ZM16.5 6.75h.75v.75h-.75v-.75ZM13.5 13.5h.75v.75h-.75v-.75ZM13.5 19.5h.75v.75h-.75v-.75ZM19.5 13.5h.75v.75h-.75v-.75ZM19.5 19.5h.75v.75h-.75v-.75ZM16.5 16.5h.75v.75h-.75v-.75Z"
                                                                                    />
                                                                                </svg>
                                                                            }
                                                                            Action={() => {
                                                                                setOpenedImei1ScannerId(
                                                                                    idx,
                                                                                );
                                                                                setImei1ScannerOpen(
                                                                                    true,
                                                                                );
                                                                            }}
                                                                        />

                                                                        {/* IMEI 1 */}
                                                                        <Input
                                                                            InputName="IMEI 1"
                                                                            Id="imei1"
                                                                            Name="imei1"
                                                                            Value={item.imei1}
                                                                            Required={true}
                                                                            Placeholder="Enter IMEI 1"
                                                                            Action={(e) =>
                                                                                handleInventoryChange(
                                                                                    idx,
                                                                                    'imei1',
                                                                                    e.target.value,
                                                                                )
                                                                            }
                                                                        />
                                                                    </div>

                                                                    <div className="flex items-center">
                                                                        <PrimaryButton
                                                                            Type={'button'}
                                                                            Id={'scan_smartphone'}
                                                                            ClassName={
                                                                                'dark:bg-deepcharcoal dark:text-white p-2  mt-6 rounded-lg text-center dark:hover:bg-gray-700 transition duration-200 ease-in-out hover:bg-blue-700 hover:text-white bg-slate-100'
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
                                                                                        d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z"
                                                                                    />
                                                                                    <path
                                                                                        strokeLinecap="round"
                                                                                        strokeLinejoin="round"
                                                                                        d="M6.75 6.75h.75v.75h-.75v-.75ZM6.75 16.5h.75v.75h-.75v-.75ZM16.5 6.75h.75v.75h-.75v-.75ZM13.5 13.5h.75v.75h-.75v-.75ZM13.5 19.5h.75v.75h-.75v-.75ZM19.5 13.5h.75v.75h-.75v-.75ZM19.5 19.5h.75v.75h-.75v-.75ZM16.5 16.5h.75v.75h-.75v-.75Z"
                                                                                    />
                                                                                </svg>
                                                                            }
                                                                            Action={() => {
                                                                                setOpenedImei2ScannerId(
                                                                                    idx,
                                                                                );
                                                                                setImei2ScannerOpen(
                                                                                    true,
                                                                                );
                                                                            }}
                                                                        />

                                                                        {/* IMEI 2 */}
                                                                        <Input
                                                                            InputName="IMEI 2"
                                                                            Id="imei2"
                                                                            Name="imei2"
                                                                            Value={item.imei2}
                                                                            Required={false}
                                                                            Placeholder="Enter IMEI 2"
                                                                            Action={(e) =>
                                                                                handleInventoryChange(
                                                                                    idx,
                                                                                    'imei2',
                                                                                    e.target.value,
                                                                                )
                                                                            }
                                                                        />
                                                                    </div>

                                                                    <div className="flex items-center">
                                                                        <PrimaryButton
                                                                            Type={'button'}
                                                                            Id={'scan_smartphone'}
                                                                            ClassName={
                                                                                'dark:bg-deepcharcoal dark:text-white p-2 mt-6  rounded-lg text-center dark:hover:bg-gray-700 transition duration-200 ease-in-out hover:bg-blue-700 hover:text-white bg-slate-100'
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
                                                                                        d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z"
                                                                                    />
                                                                                    <path
                                                                                        strokeLinecap="round"
                                                                                        strokeLinejoin="round"
                                                                                        d="M6.75 6.75h.75v.75h-.75v-.75ZM6.75 16.5h.75v.75h-.75v-.75ZM16.5 6.75h.75v.75h-.75v-.75ZM13.5 13.5h.75v.75h-.75v-.75ZM13.5 19.5h.75v.75h-.75v-.75ZM19.5 13.5h.75v.75h-.75v-.75ZM19.5 19.5h.75v.75h-.75v-.75ZM16.5 16.5h.75v.75h-.75v-.75Z"
                                                                                    />
                                                                                </svg>
                                                                            }
                                                                            Action={() => {
                                                                                setOpenedEidScannerId(
                                                                                    idx,
                                                                                );
                                                                                setEidScannerOpen(
                                                                                    true,
                                                                                );
                                                                            }}
                                                                        />

                                                                        {/* EID */}
                                                                        <Input
                                                                            InputName="EID"
                                                                            Id="eid"
                                                                            Name="eid"
                                                                            Value={item.eid}
                                                                            Required={false}
                                                                            Placeholder="Enter EID"
                                                                            Action={(e) =>
                                                                                handleInventoryChange(
                                                                                    idx,
                                                                                    'eid',
                                                                                    e.target.value,
                                                                                )
                                                                            }
                                                                        />
                                                                    </div>

                                                                    <div className="flex items-center">
                                                                        <PrimaryButton
                                                                            Type={'button'}
                                                                            Id={'scan_smartphone'}
                                                                            ClassName={
                                                                                'dark:bg-deepcharcoal dark:text-white p-2  mt-6 rounded-lg text-center dark:hover:bg-gray-700 transition duration-200 ease-in-out hover:bg-blue-700 hover:text-white bg-slate-100'
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
                                                                                        d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z"
                                                                                    />
                                                                                    <path
                                                                                        strokeLinecap="round"
                                                                                        strokeLinejoin="round"
                                                                                        d="M6.75 6.75h.75v.75h-.75v-.75ZM6.75 16.5h.75v.75h-.75v-.75ZM16.5 6.75h.75v.75h-.75v-.75ZM13.5 13.5h.75v.75h-.75v-.75ZM13.5 19.5h.75v.75h-.75v-.75ZM19.5 13.5h.75v.75h-.75v-.75ZM19.5 19.5h.75v.75h-.75v-.75ZM16.5 16.5h.75v.75h-.75v-.75Z"
                                                                                    />
                                                                                </svg>
                                                                            }
                                                                            Action={() => {
                                                                                setOpenedSerialScannerId(
                                                                                    idx,
                                                                                );
                                                                                setSerialScannerOpen(
                                                                                    true,
                                                                                );
                                                                            }}
                                                                        />

                                                                        {/* Serial No */}
                                                                        <Input
                                                                            InputName="Serial No"
                                                                            Id="serial_no"
                                                                            Name="serial_no"
                                                                            Value={item.serial_no}
                                                                            Required={false}
                                                                            Placeholder="Enter Serial No"
                                                                            Action={(e) =>
                                                                                handleInventoryChange(
                                                                                    idx,
                                                                                    'serial_no',
                                                                                    e.target.value,
                                                                                )
                                                                            }
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </>
                                                        }
                                                    />
                                                ))}
                                            </div>

                                            <div className="flex items-center justify-end w-full">
                                                <PrimaryButton
                                                    Text={'Add Extra Cost'}
                                                    Type={'button'}
                                                    Id={'add_extra_cost'}
                                                    CustomClass={'w-[200px] '}
                                                    Action={addExtraCost}
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

                                            {extraCosts.length > 0 && (
                                                <div className="grid grid-cols-1 col-span-1 gap-5 overflow-x-auto scrollbar-thin dark:scrollbar-track-slate-900 dark:scrollbar-thumb-slate-700">
                                                    <table className="w-full border-collapse">
                                                        <thead>
                                                            <tr>
                                                                <th className="p-2 text-left text-gray-700 border dark:border-gray-700 dark:text-gray-400">
                                                                    Cost Type
                                                                </th>
                                                                <th className="p-2 text-left text-gray-700 border dark:border-gray-700 dark:text-gray-400">
                                                                    Amount
                                                                </th>
                                                                <th className="p-2 text-center text-gray-700 border dark:border-gray-700 dark:text-gray-400">
                                                                    Action
                                                                </th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {extraCosts.map((item, idx) => (
                                                                <tr key={idx}>
                                                                    <td className="p-2 border dark:border-gray-700">
                                                                        <Input
                                                                            InputName={'Cost Type'}
                                                                            Id={'cost_type'}
                                                                            Name={'cost_type'}
                                                                            Error={
                                                                                errors[
                                                                                `extra_costs.${idx}.cost_type`
                                                                                ]
                                                                            }
                                                                            Value={item.cost_type}
                                                                            Required={true}
                                                                            Type={'text'}
                                                                            Placeholder={
                                                                                'Enter Cost Type'
                                                                            }
                                                                            Action={(e) =>
                                                                                handleChange(
                                                                                    idx,
                                                                                    'cost_type',
                                                                                    e.target.value,
                                                                                )
                                                                            }
                                                                        />
                                                                    </td>
                                                                    <td className="p-2 border dark:border-gray-700">
                                                                        <Input
                                                                            InputName={'Amount'}
                                                                            Id={'amount'}
                                                                            Name={'amount'}
                                                                            Error={
                                                                                errors[
                                                                                `extra_costs.${idx}.amount`
                                                                                ]
                                                                            }
                                                                            Value={item.amount}
                                                                            Required={true}
                                                                            Type={'number'}
                                                                            Placeholder={
                                                                                'Enter Amount'
                                                                            }
                                                                            Action={(e) =>
                                                                                handleChange(
                                                                                    idx,
                                                                                    'amount',
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
                                                                                    'delete_extra_cost'
                                                                                }
                                                                                Action={() =>
                                                                                    removeExtraCost(
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

                                            <PrimaryButton
                                                Text={'Create Batch'}
                                                Type={'submit'}
                                                CustomClass={'w-[250px] '}
                                                Disabled={
                                                    processing ||
                                                    data.batch_name.trim() === '' ||
                                                    data.vat === '' ||
                                                    data.base_purchase_unit_price === '' ||
                                                    data.base_purchase_unit_price == 0 ||
                                                    data.supplier_id === '' ||
                                                    (extraCosts.length > 0 &&
                                                        extraCosts.some(
                                                            (cost) =>
                                                                cost.cost_type === '' ||
                                                                cost.amount == 0 ||
                                                                cost.amount === '',
                                                        )) ||
                                                    inventoryItems.some(
                                                        (item) =>
                                                            item.smartphone_id === '' ||
                                                            item.storage_location_id === '' ||
                                                            item.imei1 === '',
                                                    )
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

                {smartphoneScannerOpen && (
                    <>
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto sm:p-6">
                            <div className="fixed inset-0 backdrop-blur-[32px]"></div>

                            {/* Modal content */}
                            <div className="relative z-10 w-full max-w-lg max-h-screen p-6 overflow-y-auto bg-white shadow-xl rounded-2xl dark:bg-deepcharcoal sm:p-8">
                                <div className="text-center">
                                    <h2 className="text-lg font-medium text-gray-800 dark:text-white">
                                        Place The Camera On The Barcode
                                    </h2>

                                    {smartphoneScannerOpen && (
                                        <div className="flex items-center justify-center">
                                            <div className="rounded-2xl" style={{ marginTop: 20 }}>
                                                <BarcodeScannerComponent
                                                    width={400}
                                                    height={400}
                                                    onUpdate={(err, result) => {
                                                        if (result) {
                                                            axios
                                                                .get(
                                                                    route(
                                                                        'dashboard.inventories.getsmartphonebyupc',
                                                                        result.text,
                                                                    ),
                                                                )
                                                                .then((response) => {
                                                                    if (
                                                                        response.data.status ==
                                                                        false
                                                                    ) {
                                                                        Swal.fire({
                                                                            icon: 'info',
                                                                            title: 'Oops...',
                                                                            text: response.data
                                                                                .message,
                                                                        });
                                                                    } else {
                                                                        handleInventoryChange(
                                                                            openedSmartphoneScannerId,
                                                                            'smartphone_id',
                                                                            response.data.smartphone
                                                                                .id,
                                                                        );
                                                                    }
                                                                    setOpenedSmartphoneScannerId(
                                                                        null,
                                                                    );
                                                                })
                                                                .catch((error) => {
                                                                    Swal.fire({
                                                                        icon: 'info',
                                                                        title: 'Oops...',
                                                                        text: error,
                                                                    });
                                                                });

                                                            setOpenedSmartphoneScannerId(null);
                                                            setSmartphoneScannerOpen(false);
                                                        }
                                                    }}
                                                />

                                                <div className="flex items-center justify-center">
                                                    <PrimaryButton
                                                        Action={() => {
                                                            setOpenedSmartphoneScannerId(null);
                                                            setSmartphoneScannerOpen(false);
                                                        }}
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

                {imei1ScannerOpen && (
                    <>
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto sm:p-6">
                            <div className="fixed inset-0 backdrop-blur-[32px]"></div>

                            {/* Modal content */}
                            <div className="relative z-10 w-full max-w-lg max-h-screen p-6 overflow-y-auto bg-white shadow-xl rounded-2xl dark:bg-deepcharcoal sm:p-8">
                                <div className="text-center">
                                    <h2 className="text-lg font-medium text-gray-800 dark:text-white">
                                        Place The Camera On The Barcode
                                    </h2>

                                    {imei1ScannerOpen && (
                                        <div className="flex items-center justify-center">
                                            <div className="rounded-2xl" style={{ marginTop: 20 }}>
                                                <BarcodeScannerComponent
                                                    width={400}
                                                    height={400}
                                                    onUpdate={(err, result) => {
                                                        if (result) {
                                                            handleInventoryChange(
                                                                openedImei1ScannerId,
                                                                'imei1',
                                                                result.text,
                                                            );
                                                            setOpenedImei1ScannerId(null);
                                                            setImei1ScannerOpen(false);
                                                        }
                                                    }}
                                                />

                                                <div className="flex items-center justify-center">
                                                    <PrimaryButton
                                                        Action={() => {
                                                            setImei1ScannerOpen(false);
                                                            setOpenedImei1ScannerId(null);
                                                        }}
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

                {imei2ScannerOpen && (
                    <>
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto sm:p-6">
                            <div className="fixed inset-0 backdrop-blur-[32px]"></div>

                            {/* Modal content */}
                            <div className="relative z-10 w-full max-w-lg max-h-screen p-6 overflow-y-auto bg-white shadow-xl rounded-2xl dark:bg-deepcharcoal sm:p-8">
                                <div className="text-center">
                                    <h2 className="text-lg font-medium text-gray-800 dark:text-white">
                                        Place The Camera On The Barcode
                                    </h2>

                                    {imei2ScannerOpen && (
                                        <div className="flex items-center justify-center">
                                            <div className="rounded-2xl" style={{ marginTop: 20 }}>
                                                <BarcodeScannerComponent
                                                    width={400}
                                                    height={400}
                                                    onUpdate={(err, result) => {
                                                        if (result) {
                                                            handleInventoryChange(
                                                                openedImei2ScannerId,
                                                                'imei2',
                                                                result.text,
                                                            );

                                                            setOpenedImei2ScannerId(null);
                                                            setImei2ScannerOpen(false);
                                                        }
                                                    }}
                                                />

                                                <div className="flex items-center justify-center">
                                                    <PrimaryButton
                                                        Action={() => {
                                                            setOpenedImei2ScannerId(null);
                                                            setImei2ScannerOpen(false);
                                                        }}
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

                {eidScannerOpen && (
                    <>
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto sm:p-6">
                            <div className="fixed inset-0 backdrop-blur-[32px]"></div>

                            {/* Modal content */}
                            <div className="relative z-10 w-full max-w-lg max-h-screen p-6 overflow-y-auto bg-white shadow-xl rounded-2xl dark:bg-deepcharcoal sm:p-8">
                                <div className="text-center">
                                    <h2 className="text-lg font-medium text-gray-800 dark:text-white">
                                        Place The Camera On The Barcode
                                    </h2>

                                    {eidScannerOpen && (
                                        <div className="flex items-center justify-center">
                                            <div className="rounded-2xl" style={{ marginTop: 20 }}>
                                                <BarcodeScannerComponent
                                                    width={400}
                                                    height={400}
                                                    onUpdate={(err, result) => {
                                                        if (result) {
                                                            handleInventoryChange(
                                                                openedEidScannerId,
                                                                'eid',
                                                                result.text,
                                                            );
                                                            setOpenedEidScannerId(null);
                                                            setEidScannerOpen(false);
                                                        }
                                                    }}
                                                />

                                                <div className="flex items-center justify-center">
                                                    <PrimaryButton
                                                        Action={() => {
                                                            setOpenedEidScannerId(null);
                                                            setEidScannerOpen(false);
                                                        }}
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

                {serialScannerOpen && (
                    <>
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto sm:p-6">
                            <div className="fixed inset-0 backdrop-blur-[32px]"></div>

                            {/* Modal content */}
                            <div className="relative z-10 w-full max-w-lg max-h-screen p-6 overflow-y-auto bg-white shadow-xl rounded-2xl dark:bg-deepcharcoal sm:p-8">
                                <div className="text-center">
                                    <h2 className="text-lg font-medium text-gray-800 dark:text-white">
                                        Place The Camera On The Barcode
                                    </h2>

                                    {serialScannerOpen && (
                                        <div className="flex items-center justify-center">
                                            <div className="rounded-2xl" style={{ marginTop: 20 }}>
                                                <BarcodeScannerComponent
                                                    width={400}
                                                    height={400}
                                                    onUpdate={(err, result) => {
                                                        if (result) {
                                                            handleInventoryChange(
                                                                openedSerialScannerId,
                                                                'serial_no',
                                                                result.text,
                                                            );
                                                            setOpenedSerialScannerId(null);
                                                            setSerialScannerOpen(false);
                                                        }
                                                    }}
                                                />

                                                <div className="flex items-center justify-center">
                                                    <PrimaryButton
                                                        Action={() => {
                                                            setOpenedSerialScannerId(null);
                                                            setSerialScannerOpen(false);
                                                        }}
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
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto sm:p-6">
                        <div className="fixed inset-0 backdrop-blur-[32px]"></div>

                        {/* Modal content */}
                        <div className="relative z-10 w-full max-w-lg max-h-screen p-6 overflow-y-auto bg-white shadow-xl rounded-2xl dark:bg-deepcharcoal sm:p-8">
                            <div className="text-center">
                                <h2 className="text-lg font-medium text-gray-800 dark:text-white">
                                    Please Wait While We Are Uploading Your Files
                                </h2>

                                <div className="flex items-center justify-center mt-5">
                                    <div role="status">
                                        <svg
                                            aria-hidden="true"
                                            className="w-8 h-8 text-gray-200 animate-spin fill-blue-600 dark:text-gray-600"
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
            </AuthenticatedLayout>
        </>
    );
}
