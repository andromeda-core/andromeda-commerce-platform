import Card from '@/Components/Card';
import Input from '@/Components/Input';
import LinkButton from '@/Components/LinkButton';
import PrimaryButton from '@/Components/PrimaryButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BreadCrumb from '@/Components/BreadCrumb';
import { Head, useForm } from '@inertiajs/react';
import React, { useState } from 'react';
import SelectInput from '@/Components/SelectInput';
import BarcodeScannerComponent from 'react-qr-barcode-scanner';
import axios from 'axios';
import Swal from 'sweetalert2';

export default function create({ batches, smartphones, storage_locations }) {
    // Create Data Form Data
    const { data, setData, post, processing, errors, reset } = useForm({
        smartphone_id: '',
        batch_id: '',
        storage_location_id: '',
        imei1: '',
        imei2: '',
        eid: '',
        serial_no: '',
    });

    const [smartphoneScannerOpen, setSmartphoneScannerOpen] = useState(false);
    const [imei1ScannerOpen, setImei1ScannerOpen] = useState(false);
    const [imei2ScannerOpen, setImei2ScannerOpen] = useState(false);
    const [eidScannerOpen, setEidScannerOpen] = useState(false);
    const [serialScannerOpen, setSerialScannerOpen] = useState(false);

    // Create Data Form Request
    const submit = (e) => {
        e.preventDefault();
        post(route('dashboard.inventories.store'));
    };

    return (
        <>
            <AuthenticatedLayout>
                <Head title="Inventories" />

                <BreadCrumb
                    header={'Create Inventory'}
                    parent={'Inventories'}
                    parent_link={route('dashboard.inventories.index')}
                    child={'Create Inventory'}
                />

                <Card
                    Content={
                        <>
                            <div className="my-3 flex flex-wrap justify-end">
                                <LinkButton
                                    Text={'Back To Inventories'}
                                    URL={route('dashboard.inventories.index')}
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
                                                    InputName={'Batch'}
                                                    Error={errors.batch_id}
                                                    Value={data.batch_id}
                                                    Action={(value) => setData('batch_id', value)}
                                                    Placeholder={'Select Batch'}
                                                    Id={'batch_id'}
                                                    Name={'batch_id'}
                                                    Required={true}
                                                    items={batches}
                                                    itemKey={'batch_name'}
                                                />

                                                <div className="flex items-center">
                                                    <PrimaryButton
                                                        Type={'button'}
                                                        Id={'scan_smartphone'}
                                                        ClassName={
                                                            'dark:bg-deepcharcoal mt-2 dark:text-white p-2  rounded-lg text-center dark:hover:bg-gray-700 transition duration-200 ease-in-out hover:bg-blue-700 hover:text-white bg-slate-100'
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
                                                        Action={() =>
                                                            setSmartphoneScannerOpen(true)
                                                        }
                                                    />

                                                    <SelectInput
                                                        InputName={'Smartphone'}
                                                        Error={errors.smartphone_id}
                                                        Value={data.smartphone_id}
                                                        Action={(value) =>
                                                            setData('smartphone_id', value)
                                                        }
                                                        Placeholder={'Select Smartphone'}
                                                        Id={'smartphone_id'}
                                                        Name={'smartphone_id'}
                                                        Required={true}
                                                        items={smartphones}
                                                        itemKey={'name'}
                                                    />
                                                </div>
                                                <SelectInput
                                                    InputName={'Storage Location'}
                                                    Error={errors.storage_location_id}
                                                    Value={data.storage_location_id}
                                                    Action={(value) =>
                                                        setData('storage_location_id', value)
                                                    }
                                                    Placeholder={'Select Storage Location'}
                                                    Id={'storage_location_id'}
                                                    Name={'storage_location_id'}
                                                    Required={true}
                                                    items={storage_locations}
                                                    itemKey={'name'}
                                                />

                                                <div className="flex items-center">
                                                    <PrimaryButton
                                                        Type={'button'}
                                                        Id={'scan_imei1'}
                                                        ClassName={
                                                            'dark:bg-deepcharcoal  dark:text-white p-2  rounded-lg text-center dark:hover:bg-gray-700 transition duration-200 ease-in-out hover:bg-blue-700 hover:text-white bg-slate-100'
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
                                                        Action={() => setImei1ScannerOpen(true)}
                                                    />

                                                    <Input
                                                        InputName={'IMEI 1'}
                                                        Id={'imei1'}
                                                        Name={'imei1'}
                                                        Placeholder={'Enter IMEI 1'}
                                                        Error={errors.imei1}
                                                        Value={data.imei1}
                                                        Type={'text'}
                                                        Required={true}
                                                        Action={(e) =>
                                                            setData('imei1', e.target.value)
                                                        }
                                                    />
                                                </div>

                                                <div className="flex items-center">
                                                    <PrimaryButton
                                                        Type={'button'}
                                                        Id={'scan_imei2'}
                                                        ClassName={
                                                            'dark:bg-deepcharcoal  dark:text-white p-2  rounded-lg text-center dark:hover:bg-gray-700 transition duration-200 ease-in-out hover:bg-blue-700 hover:text-white bg-slate-100'
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
                                                        Action={() => setImei2ScannerOpen(true)}
                                                    />

                                                    <Input
                                                        InputName={'IMEI 2'}
                                                        Id={'imei2'}
                                                        Name={'imei2'}
                                                        Placeholder={'Enter IMEI 2'}
                                                        Error={errors.imei2}
                                                        Value={data.imei2}
                                                        Type={'text'}
                                                        Required={false}
                                                        Action={(e) =>
                                                            setData('imei2', e.target.value)
                                                        }
                                                    />
                                                </div>

                                                <div className="flex items-center">
                                                    <PrimaryButton
                                                        Type={'button'}
                                                        Id={'scan_eid'}
                                                        ClassName={
                                                            'dark:bg-deepcharcoal  dark:text-white p-2  rounded-lg text-center dark:hover:bg-gray-700 transition duration-200 ease-in-out hover:bg-blue-700 hover:text-white bg-slate-100'
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
                                                        Action={() => setEidScannerOpen(true)}
                                                    />

                                                    <Input
                                                        InputName={'EID'}
                                                        Id={'eid'}
                                                        Name={'eid'}
                                                        Placeholder={'Enter EID'}
                                                        Error={errors.eid}
                                                        Value={data.eid}
                                                        Type={'text'}
                                                        Required={false}
                                                        Action={(e) =>
                                                            setData('eid', e.target.value)
                                                        }
                                                    />
                                                </div>

                                                <div className="flex items-center">
                                                    <PrimaryButton
                                                        Type={'button'}
                                                        Id={'scan_serial_no'}
                                                        ClassName={
                                                            'dark:bg-deepcharcoal  dark:text-white p-2  rounded-lg text-center dark:hover:bg-gray-700 transition duration-200 ease-in-out hover:bg-blue-700 hover:text-white bg-slate-100'
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
                                                        Action={() => setSerialScannerOpen(true)}
                                                    />

                                                    <Input
                                                        InputName={'Serial No'}
                                                        Id={'serial_no'}
                                                        Name={'serial_no'}
                                                        Placeholder={'Enter Serial No'}
                                                        Error={errors.serial_no}
                                                        Value={data.serial_no}
                                                        Type={'text'}
                                                        Required={false}
                                                        Action={(e) =>
                                                            setData('serial_no', e.target.value)
                                                        }
                                                    />
                                                </div>
                                            </div>

                                            <PrimaryButton
                                                Text={'Create Inventory'}
                                                CustomClass={'w-[200px] '}
                                                Disabled={
                                                    processing ||
                                                    data.batch_id === '' ||
                                                    data.smartphone_id === '' ||
                                                    data.storage_location_id === '' ||
                                                    data.imei1 === ''
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
                        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 sm:p-6">
                            <div className="fixed inset-0 backdrop-blur-[32px]"></div>

                            {/* Modal content */}
                            <div className="relative z-10 max-h-screen w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl dark:bg-deepcharcoal sm:p-8">
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
                                                            setData('smartphone_id', result.text);
                                                            setSmartphoneScannerOpen(false);

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
                                                                        setData(
                                                                            'smartphone_id',
                                                                            response.data.smartphone
                                                                                .id,
                                                                        );
                                                                    }
                                                                })
                                                                .catch((error) => {
                                                                    Swal.fire({
                                                                        icon: 'info',
                                                                        title: 'Oops...',
                                                                        text: error,
                                                                    });
                                                                });
                                                        }
                                                    }}
                                                />

                                                <div className="flex items-center justify-center">
                                                    <PrimaryButton
                                                        Action={() =>
                                                            setSmartphoneScannerOpen(false)
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

                {imei1ScannerOpen && (
                    <>
                        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 sm:p-6">
                            <div className="fixed inset-0 backdrop-blur-[32px]"></div>

                            {/* Modal content */}
                            <div className="relative z-10 max-h-screen w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl dark:bg-deepcharcoal sm:p-8">
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
                                                            setData('imei1', result.text);
                                                            setImei1ScannerOpen(false);
                                                        }
                                                    }}
                                                />

                                                <div className="flex items-center justify-center">
                                                    <PrimaryButton
                                                        Action={() => setImei1ScannerOpen(false)}
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
                        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 sm:p-6">
                            <div className="fixed inset-0 backdrop-blur-[32px]"></div>

                            {/* Modal content */}
                            <div className="relative z-10 max-h-screen w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl dark:bg-deepcharcoal sm:p-8">
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
                                                            setData('imei2', result.text);
                                                            setImei2ScannerOpen(false);
                                                        }
                                                    }}
                                                />

                                                <div className="flex items-center justify-center">
                                                    <PrimaryButton
                                                        Action={() => setImei2ScannerOpen(false)}
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
                        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 sm:p-6">
                            <div className="fixed inset-0 backdrop-blur-[32px]"></div>

                            {/* Modal content */}
                            <div className="relative z-10 max-h-screen w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl dark:bg-deepcharcoal sm:p-8">
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
                                                            setData('eid', result.text);
                                                            setEidScannerOpen(false);
                                                        }
                                                    }}
                                                />

                                                <div className="flex items-center justify-center">
                                                    <PrimaryButton
                                                        Action={() => setEidScannerOpen(false)}
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
                        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 sm:p-6">
                            <div className="fixed inset-0 backdrop-blur-[32px]"></div>

                            {/* Modal content */}
                            <div className="relative z-10 max-h-screen w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl dark:bg-deepcharcoal sm:p-8">
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
                                                            setData('serial_no', result.text);
                                                            setSerialScannerOpen(false);
                                                        }
                                                    }}
                                                />

                                                <div className="flex items-center justify-center">
                                                    <PrimaryButton
                                                        Action={() => setSerialScannerOpen(false)}
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
            </AuthenticatedLayout>
        </>
    );
}
