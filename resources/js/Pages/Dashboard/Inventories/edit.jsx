import Card from '@/Components/Card';
import Input from '@/Components/Input';
import LinkButton from '@/Components/LinkButton';
import PrimaryButton from '@/Components/PrimaryButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BreadCrumb from '@/Components/BreadCrumb';
import { Head, useForm } from '@inertiajs/react';
import React, { useEffect, useRef, useState } from 'react';
import SelectInput from '@/Components/SelectInput';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useScanner } from '@/Hooks/useScanner';
import NativeScannerPreview from '@/Components/NativeScannerPreview';

export default function edit({ batches, smartphones, storage_locations, inventory }) {
    // Edit Data Form Data
    const { data, setData, put, processing, errors, reset } = useForm({
        smartphone_id: inventory.smartphone_id || '',
        batch_id: inventory.batch_id || '',
        storage_location_id: inventory.storage_location_id || '',
        imei1: inventory.imei1 || '',
        imei2: inventory.imei2 || '',
        eid: inventory.eid || '',
        serial_no: inventory.serial_no || '',
        status: inventory.status || '',
    });


    const scanOverlayRef = useRef(null);
    const [scanRegion, setScanRegion] = useState(null);
    const [torchOn, setTorchOn] = useState(false);

    const [activeScanner, setActiveScanner] = useState(null);

    const [nativeScan, setNativeScan] = useState(null);

    const isMobileDevice = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
        || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    const getFieldLabel = (field) => {
        const map = { smartphone_id: 'UPC/EAN', imei1: 'IMEI 1', imei2: 'IMEI 2', eid: 'EID', serial_no: 'Serial No' };
        return map[field] || field;
    };

    const openScannerOrNative = (field) => {
        if (isMobileDevice) {
            setNativeScan({ field });
        } else {
            openScanner(field);
        }
    };

    const openScanner = (field, index) => {
        setActiveScanner({ field, index });
    };

    const closeScanner = () => {
        setActiveScanner(null);
        setTorchOn(false);
    };


    const { videoRef: scannerVideoRef, refocus, toggleTorch } = useScanner({
        active: !!activeScanner,
        onScan: (text) => handleScanResult(text),
        scanRegion,
    });


    const handleTorchToggle = async () => {
        const result = await toggleTorch();
        if (result !== null) setTorchOn(result);
    };

    useEffect(() => {
        if (!activeScanner) {
            setScanRegion(null);
            return;
        }

        const calculate = () => {
            const videoEl = scannerVideoRef.current;
            const overlayEl = scanOverlayRef.current;
            if (!videoEl || !overlayEl) return;

            const vRect = videoEl.getBoundingClientRect();
            if (vRect.width === 0 || vRect.height === 0) return;

            // Need actual video dimensions — wait if not loaded yet
            const videoW = videoEl.videoWidth;
            const videoH = videoEl.videoHeight;
            if (!videoW || !videoH) return;

            // object-fit: cover scale factor
            // The video is scaled so BOTH dimensions >= element dimensions
            const scaleX = vRect.width / videoW;
            const scaleY = vRect.height / videoH;
            const scale = Math.max(scaleX, scaleY);

            // Actual rendered video size (always >= element size)
            const renderedW = videoW * scale;
            const renderedH = videoH * scale;

            // Offset — how much video extends beyond element edge (negative = cropped)
            const offsetX = (vRect.width - renderedW) / 2;
            const offsetY = (vRect.height - renderedH) / 2;


            const oRect = overlayEl.getBoundingClientRect();
            const relLeft = oRect.left - vRect.left;
            const relTop = oRect.top - vRect.top;

            const x = (relLeft - offsetX) / renderedW;
            const y = (relTop - offsetY) / renderedH;
            const w = oRect.width / renderedW;
            const h = oRect.height / renderedH;

            setScanRegion({
                x: Math.max(0, Math.min(1, x)),
                y: Math.max(0, Math.min(1, y)),
                width: Math.max(0.05, Math.min(1, w)),
                height: Math.max(0.05, Math.min(1, h)),
            });
        };

        let retryCount = 0;
        const tryCalculate = () => {
            const videoEl = scannerVideoRef.current;
            if (videoEl?.videoWidth > 0) {
                calculate();
            } else if (retryCount < 20) {
                retryCount++;
                setTimeout(tryCalculate, 100);
            }
        };

        const t = setTimeout(tryCalculate, 200);
        window.addEventListener('resize', calculate);

        return () => {
            clearTimeout(t);
            window.removeEventListener('resize', calculate);
        };
    }, [activeScanner]);


    const handleScanResult = async (text) => {
        if (!activeScanner) return;
        const { field } = activeScanner;

        if (field === 'smartphone_id') {
            try {
                const response = await axios.get(
                    route('dashboard.inventories.getsmartphonebyupc', text)
                );
                if (response.data.status === false) {
                    Swal.fire({ icon: 'info', title: 'Oops...', text: response.data.message });
                } else {
                    setData('smartphone_id', response.data.smartphone.id);
                }
            } catch (err) {
                Swal.fire({ icon: 'error', title: 'Error', text: 'Could not find smartphone.' });
            }
        } else {
            // imei1, imei2, eid, serial_no - direct fill
            setData(field, text);
        }

        closeScanner();
    };



    // Edit Data Form Request
    const submit = (e) => {
        e.preventDefault();
        put(route('dashboard.inventories.update', inventory.id));
    };

    return (
        <>
            <AuthenticatedLayout>
                <Head title="Inventories" />

                <BreadCrumb
                    header={'Edit Inventory'}
                    parent={'Inventories'}
                    parent_link={route('dashboard.inventories.index')}
                    child={'Edit Inventory'}
                />

                <Card
                    Content={
                        <>
                            <div className="flex flex-wrap justify-end my-3">
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
                                                            'dark:bg-deepcharcoal mt-6 dark:text-white p-2  rounded-lg text-center dark:hover:bg-gray-700 transition duration-200 ease-in-out hover:bg-blue-700 hover:text-white bg-slate-100'
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
                                                        Action={() => openScannerOrNative('smartphone_id')}
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
                                                            'dark:bg-deepcharcoal mt-6 dark:text-white p-2  rounded-lg text-center dark:hover:bg-gray-700 transition duration-200 ease-in-out hover:bg-blue-700 hover:text-white bg-slate-100'
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
                                                        Action={() => openScannerOrNative('imei1')}
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
                                                            'dark:bg-deepcharcoal mt-6 dark:text-white p-2  rounded-lg text-center dark:hover:bg-gray-700 transition duration-200 ease-in-out hover:bg-blue-700 hover:text-white bg-slate-100'
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
                                                        Action={() => openScannerOrNative('imei2')}
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
                                                            'dark:bg-deepcharcoal mt-6 dark:text-white p-2  rounded-lg text-center dark:hover:bg-gray-700 transition duration-200 ease-in-out hover:bg-blue-700 hover:text-white bg-slate-100'
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
                                                        Action={() => openScannerOrNative('eid')}
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
                                                            'dark:bg-deepcharcoal mt-6 dark:text-white p-2  rounded-lg text-center dark:hover:bg-gray-700 transition duration-200 ease-in-out hover:bg-blue-700 hover:text-white bg-slate-100'
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
                                                        Action={() => openScannerOrNative('serial_no')}
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

                                                <SelectInput
                                                    InputName={'Status'}
                                                    Name={'status'}
                                                    Id={'status'}
                                                    items={[
                                                        { id: 'in_stock', name: "IN STOCK" },
                                                        { id: 'sold', name: "SOLD" },
                                                        { id: 'returned', name: "RETURNED" },
                                                        { id: 'on_hold', name: "ON HOLD" },
                                                    ]}
                                                    itemKey={'name'}
                                                    Required={true}
                                                    Value={data.status}
                                                    Placeholder={'Select Status'}
                                                    Error={errors.status}
                                                    Action={(value) => setData('status', value)}
                                                />
                                            </div>

                                            <PrimaryButton
                                                Text={'Update Inventory'}
                                                CustomClass={'w-[200px] '}
                                                Disabled={
                                                    processing ||
                                                    data.batch_id === '' ||
                                                    data.smartphone_id === '' ||
                                                    data.storage_location_id === '' ||
                                                    data.imei1 === '' ||
                                                    data.status.trim() === '' ||
                                                    (data.batch_id === inventory.batch_id &&
                                                        data.smartphone_id ===
                                                        inventory.smartphone_id &&
                                                        data.storage_location_id ===
                                                        inventory.storage_location_id &&
                                                        data.imei1 === inventory.imei1 &&
                                                        data.imei2 === inventory.imei2 &&
                                                        data.eid === inventory.eid &&
                                                        data.serial_no === inventory.serial_no &&
                                                        data.status.trim() === inventory.status)
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

                {activeScanner && (
                    <>
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto sm:p-6">
                            <div className="fixed inset-0 backdrop-blur-[32px]" />
                            <div className="relative z-10 w-full max-w-md overflow-hidden bg-white shadow-2xl rounded-2xl dark:bg-deepcharcoal">
                                <div className="flex items-center justify-between px-6 py-4 border-b dark:border-white/10">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                                        <h3 className="text-sm font-semibold text-gray-800 dark:text-white">
                                            Scanning: <span className="text-blue-600 capitalize dark:text-blue-400">
                                                {activeScanner.field === 'smartphone_id' ? 'UPC/EAN'
                                                    : activeScanner.field === 'imei1' ? 'IMEI 1'
                                                        : activeScanner.field === 'imei2' ? 'IMEI 2'
                                                            : activeScanner.field === 'eid' ? 'EID'
                                                                : 'Serial No'}
                                            </span>
                                        </h3>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {/* Torch / Flashlight toggle */}
                                        <button
                                            onClick={handleTorchToggle}
                                            title={torchOn ? 'Turn off flashlight' : 'Turn on flashlight'}
                                            className={`flex items-center justify-center rounded-lg w-8 h-8 transition-colors
                                                ${torchOn
                                                    ? 'bg-yellow-400 text-gray-900 hover:bg-yellow-300'
                                                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-white/10'
                                                }`}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                                strokeWidth={1.8} stroke="currentColor" className="size-5">
                                                <path strokeLinecap="round" strokeLinejoin="round"
                                                    d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                                            </svg>
                                        </button>

                                        {/* Close button */}
                                        <button
                                            onClick={closeScanner}
                                            className="flex items-center justify-center text-gray-400 rounded-lg w-7 h-7 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-white/10"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                                strokeWidth={2} stroke="currentColor" className="size-4">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <div
                                        className="relative overflow-hidden bg-gray-950 rounded-xl"
                                        style={{ aspectRatio: '4/3' }}
                                    >
                                        <video
                                            ref={scannerVideoRef}
                                            className="object-cover w-full h-full"
                                            muted
                                            playsInline
                                            onClick={refocus}
                                            onTouchStart={refocus}
                                        />
                                        {/* Dark vignette with bright scan hole — desktop */}
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            <div
                                                ref={scanOverlayRef}
                                                className="relative h-32 w-72"
                                                style={{
                                                    boxShadow: '0 0 0 9999px rgba(0,0,0,0.6)',
                                                    borderRadius: '4px',
                                                }}
                                            >
                                                <span className="absolute w-5 h-5 border-t-[3px] border-l-[3px] border-blue-400 -top-px -left-px rounded-tl-sm" />
                                                <span className="absolute w-5 h-5 border-t-[3px] border-r-[3px] border-blue-400 -top-px -right-px rounded-tr-sm" />
                                                <span className="absolute w-5 h-5 border-b-[3px] border-l-[3px] border-blue-400 -bottom-px -left-px rounded-bl-sm" />
                                                <span className="absolute w-5 h-5 border-b-[3px] border-r-[3px] border-blue-400 -bottom-px -right-px rounded-br-sm" />
                                                <div
                                                    className="absolute left-1 right-1 h-0.5 bg-blue-400"
                                                    style={{ animation: 'scanLine 1.8s ease-in-out infinite', top: '10%' }}
                                                />
                                            </div>
                                        </div>

                                        {/* Torch active indicator */}
                                        {torchOn && (
                                            <div className="absolute flex items-center gap-1 px-2 py-1 text-xs font-semibold text-gray-900 rounded-full pointer-events-none top-2 right-2 bg-yellow-400/90">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                                    strokeWidth={2} stroke="currentColor" className="size-3">
                                                    <path strokeLinecap="round" strokeLinejoin="round"
                                                        d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                                                </svg>
                                                Flash ON
                                            </div>
                                        )}
                                    </div>
                                    <p className="mt-3 text-xs text-center text-gray-400 dark:text-white/40">
                                        Align barcode within the frame
                                    </p>
                                    <div className="flex justify-center mt-3">
                                        <PrimaryButton
                                            Action={closeScanner}
                                            Text={'Close Scanner'}
                                            Type={'button'}
                                            Icon={
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                                </svg>
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                            <style>{`
                                                    @keyframes scanLine {
                                                        0%   { top: 10%; opacity: 1; }
                                                        45%  { top: 85%; opacity: 1; }
                                                        50%  { top: 85%; opacity: 0; }
                                                        51%  { top: 10%; opacity: 0; }
                                                        55%  { top: 10%; opacity: 1; }
                                                        100% { top: 10%; opacity: 1; }
                                                    }
                                                `}</style>
                        </div>
                    </>
                )}


                <NativeScannerPreview
                    isOpen={!!nativeScan}
                    fieldLabel={nativeScan ? getFieldLabel(nativeScan.field) : ''}
                    itemNumber={null}
                    onResult={async (text) => {
                        if (!nativeScan) return;
                        const { field } = nativeScan;
                        if (field === 'smartphone_id') {
                            try {
                                const response = await axios.get(
                                    route('dashboard.inventories.getsmartphonebyupc', text)
                                );
                                if (response.data.status === false) {
                                    Swal.fire({ icon: 'info', title: 'Oops...', text: response.data.message });
                                } else {
                                    setData('smartphone_id', response.data.smartphone.id);
                                }
                            } catch (err) {
                                Swal.fire({ icon: 'error', title: 'Error', text: 'Could not find smartphone.' });
                            }
                        } else {
                            setData(field, text);
                        }
                    }}
                    onClose={() => setNativeScan(null)}
                />
            </AuthenticatedLayout>
        </>
    );
}
