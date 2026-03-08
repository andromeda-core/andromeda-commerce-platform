import Card from '@/Components/Card';
import Input from '@/Components/Input';
import LinkButton from '@/Components/LinkButton';
import PrimaryButton from '@/Components/PrimaryButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BreadCrumb from '@/Components/BreadCrumb';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import React, { useEffect, useMemo, useState } from 'react';
import SelectInput from '@/Components/SelectInput';
import Toast from '@/Components/Toast';

import FileUploaderInput from '@/Components/FileUploaderInput';
import { useScanner } from '@/Hooks/useScanner';



export default function fulFillOrder({
    assignment,
    order,
    required_items,
    smartphones,
    storage_locations,
}) {


    const [draftSaving, setDraftSaving] = useState(false);
    const [draftSaved, setDraftSaved] = useState(false);
    const [draftError, setDraftError] = useState(false);


    // Create Data Form Data
    const { data, setData, post, processing, errors, reset } = useForm({

        batch_name: '',
        base_purchase_unit_price: '',
        supplier_id: assignment?.supplier_id || '',
        vat: '',
        extra_costs: [],
        inventory_items: [],
        invoices: [],

        supplier_assigned_order_id: assignment?.id || null,
        order_id: order?.id || null,
    });

    const { currency } = usePage().props;
    const [file_error, setFileError] = useState(null);

    const smartphonesForSelect = useMemo(() => {
        return (smartphones || []).map((s) => ({
            ...s,
            name: s?.model_name?.name ?? s?.name ?? `#${s?.id}`,
        }));
    }, [smartphones]);


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
    // const addInventoryItems = () => {
    //     setInventoryItems([
    //         ...inventoryItems,
    //         {
    //             smartphone_id: '',
    //             storage_location_id: '',
    //             imei1: '',
    //             imei2: '',
    //             eid: '',
    //             serial_no: '',
    //         },
    //     ]);
    // };
    // const removeInventoryItem = (index) => {
    //     if (inventoryItems.length === 1) {
    //         Swal.fire({
    //             icon: 'info',
    //             title: 'Oops...',
    //             text: 'First Inventory Item Cannot be deleted',
    //         });
    //         return;
    //     }

    //     const updatedInventoryItems = inventoryItems.filter((_, i) => i !== index);
    //     setInventoryItems(updatedInventoryItems);
    //     setData('inventory_items', updatedInventoryItems);
    // };
    const handleInventoryChange = (index, field, value) => {
        const updatedInventoryItems = [...inventoryItems];
        updatedInventoryItems[index][field] = value;
        setData('inventory_items', updatedInventoryItems);
        setInventoryItems(updatedInventoryItems);
    };


    //  Auto-generate items based on required_items (1 entry = 1 stock)
    useEffect(() => {
        const req = required_items || [];

        if (!assignment?.id || !order?.id) return;

        // build rows
        const rows = [];
        req.forEach((r) => {
            const missing = Number(r?.missing_qty || 0);
            if (missing > 0) {
                for (let i = 0; i < missing; i++) {
                    rows.push({
                        smartphone_id: r?.smartphone_id || '',
                        storage_location_id: '',
                        imei1: '',
                        imei2: '',
                        eid: '',
                        serial_no: '',
                    });
                }
            }
        });

        // if nothing required, keep one empty row
        const finalRows = rows.length > 0 ? rows : [
            {
                smartphone_id: '',
                storage_location_id: '',
                imei1: '',
                imei2: '',
                eid: '',
                serial_no: '',
            },
        ];

        setInventoryItems(finalRows);
        setData('inventory_items', finalRows);

        // set supplier_id if present
        if (assignment?.supplier_id) setData('supplier_id', assignment.supplier_id);
    }, [assignment?.id, order?.id, JSON.stringify(required_items)]);


    // Draft Restoring
    useEffect(() => {
        if (assignment?.draft_data) return;

        const req = required_items || [];
        if (!assignment?.id || !order?.id) return;

        const rows = [];
        req.forEach((r) => {
            const missing = Number(r?.missing_qty || 0);
            if (missing > 0) {
                for (let i = 0; i < missing; i++) {
                    rows.push({
                        smartphone_id: r?.smartphone_id || '',
                        storage_location_id: '',
                        imei1: '', imei2: '', eid: '', serial_no: '',
                    });
                }
            }
        });

        const finalRows = rows.length > 0 ? rows : [{
            smartphone_id: '', storage_location_id: '',
            imei1: '', imei2: '', eid: '', serial_no: '',
        }];

        setInventoryItems(finalRows);
        setData('inventory_items', finalRows);
        if (assignment?.supplier_id) setData('supplier_id', assignment.supplier_id);

    }, [assignment?.id, order?.id, JSON.stringify(required_items)]);

    useEffect(() => {
        if (!assignment?.draft_data) return;

        try {
            const draft = typeof assignment.draft_data === 'string'
                ? JSON.parse(assignment.draft_data)
                : assignment.draft_data;

            if (!draft) return;

            if (draft.batch_name) setData('batch_name', draft.batch_name);
            if (draft.vat) setData('vat', draft.vat);
            if (draft.base_purchase_unit_price) setData('base_purchase_unit_price', draft.base_purchase_unit_price);

            if (Array.isArray(draft.extra_costs) && draft.extra_costs.length > 0) {
                setExtraCosts(draft.extra_costs);
                setData('extra_costs', draft.extra_costs);
            }

            if (Array.isArray(draft.inventory_items) && draft.inventory_items.length > 0) {
                const normalized = draft.inventory_items.map(item => ({
                    smartphone_id: item.smartphone_id || '',
                    storage_location_id: item.storage_location_id || '',
                    imei1: item.imei1 || '',
                    imei2: item.imei2 || '',
                    eid: item.eid || '',
                    serial_no: item.serial_no || '',
                }));
                setInventoryItems(normalized);
                setData('inventory_items', normalized);
            }

        } catch (e) {

        }
    }, [assignment?.id]);

    const handleSaveDraft = () => {
        setDraftSaving(true);
        setDraftSaved(false);
        setDraftError(false);

        router.post(
            route('dashboard.supplier-assigned-orders.fulfill.save-draft', assignment?.id),
            {
                batch_name: data.batch_name,
                vat: data.vat,
                base_purchase_unit_price: data.base_purchase_unit_price,
                extra_costs: extraCosts,
                inventory_items: inventoryItems,
            },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    setDraftSaved(true);
                    setTimeout(() => setDraftSaved(false), 3000);
                },
                onError: () => {
                    setDraftError(true);
                    setTimeout(() => setDraftError(false), 3000);
                },
                onFinish: () => {
                    setDraftSaving(false);
                },
            }
        );
    };


    const [showProgressModal, setShowProgressModal] = useState(false);

    const [activeScanner, setActiveScanner] = useState(null);


    const openScanner = (field, index) => {
        setActiveScanner({ field, index });
    };

    const closeScanner = () => {
        setActiveScanner(null);
    };



    const { videoRef: scannerVideoRef } = useScanner({
        active: !!activeScanner,
        onScan: (text) => handleScanResult(text),
    });


    const handleScanResult = async (text) => {
        if (!activeScanner) return;
        const { field, index } = activeScanner;

        handleInventoryChange(index, field, text);

        closeScanner();
    };

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
        post(route('dashboard.supplier-assigned-orders.fulfill.store', assignment?.id));
    };


    return (
        <>
            <AuthenticatedLayout>
                <Head title="FulFill Order" />

                <BreadCrumb
                    header={'FulFill Order'}
                    parent={'Assigned Orders'}
                    parent_link={route('dashboard.supplier-assigned-orders.index')}
                    child={'FulFill Order'}
                />


                {/* Required Stock Summary */}
                {(order || required_items?.length > 0) && (
                    <div className="p-5 mb-6 bg-white border border-gray-200 rounded-lg dark:bg-zinc-900 dark:border-zinc-700">

                        {/* Header Row */}
                        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                            <div>
                                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                                    Order Requirements Summary
                                </h3>
                                <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                                    Review the required stock before fulfilling
                                </p>
                            </div>

                            {/* Destination Country */}
                            {order?.destination_country && (
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800/40">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-violet-600 dark:text-violet-400">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                                    </svg>
                                    <span className="text-xs font-semibold text-violet-700 dark:text-violet-300">
                                        {order.destination_country}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Stats Row */}
                        <div className="grid grid-cols-2 gap-3 mb-5 md:grid-cols-3">
                            {[
                                {
                                    label: 'Total Items Required',
                                    value: required_items?.reduce((sum, r) => sum + Number(r?.missing_qty || 0), 0) ?? 0,
                                    suffix: 'units',
                                    color: 'text-gray-900 dark:text-white',
                                    bg: 'bg-gray-50 dark:bg-zinc-800',
                                },
                                {
                                    label: 'Order Total',
                                    value: order?.total_amount ? `${currency?.symbol ?? ''}${Number(order.total_amount).toLocaleString('en-US')}` : 'N/A',
                                    color: 'text-green-600 dark:text-green-400',
                                    bg: 'bg-green-50 dark:bg-green-900/10',
                                },

                                {
                                    label: 'Distinct Models',
                                    value: required_items?.length ?? 0,
                                    suffix: 'models',
                                    color: 'text-violet-600 dark:text-violet-400',
                                    bg: 'bg-violet-50 dark:bg-violet-900/10',
                                },
                            ].map(({ label, value, suffix, color, bg }) => (
                                <div key={label} className={`rounded-lg p-3 ${bg}`}>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                                    <p className={`mt-1 text-lg font-bold ${color}`}>
                                        {value}
                                        {suffix && <span className="ml-1 text-xs font-normal text-gray-400">{suffix}</span>}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Admin Memo */}
                        {assignment?.note && (
                            <div className="flex gap-3 p-4 mb-5 border rounded-lg border-amber-200 bg-amber-50 dark:bg-amber-900/10 dark:border-amber-800/40">
                                <div className="mt-0.5 shrink-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-amber-600 dark:text-amber-400">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
                                    </svg>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="mb-1 text-xs font-semibold text-amber-700 dark:text-amber-400">
                                        Note from Administrator
                                    </p>
                                    <p className="text-sm break-words text-amber-800 dark:text-amber-300">
                                        {assignment.note}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Per Item Breakdown Table */}
                        {required_items?.length > 0 && (
                            <div className="overflow-hidden border border-gray-200 rounded-lg dark:border-zinc-700">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-100 dark:bg-zinc-800">
                                        <tr>
                                            <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">#</th>
                                            <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Model</th>
                                            <th className="px-4 py-2.5 text-center text-xs font-semibold text-gray-600 dark:text-gray-400">Ordered</th>

                                            <th className="px-4 py-2.5 text-center text-xs font-semibold text-gray-600 dark:text-gray-400">Missing</th>
                                            <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-600 dark:text-gray-400">Unit Price</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-zinc-700">
                                        {required_items.map((item, idx) => {
                                            const missing = Number(item?.missing_qty || 0);
                                            return (
                                                <tr key={idx} className="transition-colors bg-white dark:bg-zinc-900 hover:bg-gray-50 dark:hover:bg-zinc-800">
                                                    <td className="px-4 py-2.5 text-xs text-gray-500 dark:text-gray-400">
                                                        {idx + 1}
                                                    </td>
                                                    <td className="px-4 py-2.5">
                                                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                            {item?.model_name ?? item?.name ?? `Item #${idx + 1}`}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-2.5 text-center">
                                                        <span className="text-sm text-gray-700 dark:text-gray-300">
                                                            {item?.ordered_qty ?? 'N/A'}
                                                        </span>
                                                    </td>

                                                    <td className="px-4 py-2.5 text-center">
                                                        <div className="flex flex-col items-center gap-1">
                                                            <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-semibold ${missing > 0
                                                                ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                                : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                                }`}>
                                                                {missing > 0 ? `${missing} still needed` : 'Fully Covered'}
                                                            </span>

                                                            {item?.fulfilled_qty > 0 && missing > 0 && (
                                                                <span className="text-[10px] text-gray-400 dark:text-gray-500">
                                                                    {item.fulfilled_qty} of {item.ordered_qty} assigned
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-2.5 text-right">
                                                        <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                                            {item?.unit_price
                                                                ? `${currency?.symbol ?? ''}${Number(item.unit_price).toLocaleString("en-US")}`
                                                                : 'N/A'
                                                            }
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}



                {file_error != null && <Toast flash={{ info: file_error }} />}
                <Card
                    Content={
                        <>
                            <div className="flex flex-wrap justify-end my-3">
                                <LinkButton
                                    Text={'Back To Orders'}
                                    URL={route('dashboard.supplier-assigned-orders.index')}
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

                                                <Input
                                                    InputName={'Supplier'}
                                                    Id={'supplier_id'}
                                                    Name={'supplier_id'}
                                                    Value={assignment.supplier?.user?.name}
                                                    readOnly={true}
                                                    Required={true}
                                                    Type={'text'}
                                                    Placeholder={'Supplier'}
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

                                            {/* <div className="flex items-center justify-end w-full">
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
                                            </div> */}

                                            <div className="grid grid-cols-1 gap-4">
                                                {inventoryItems.map((item, idx) => (
                                                    <Card
                                                        key={idx}
                                                        Content={
                                                            <>
                                                                {/* <div className="flex items-center justify-end">
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
                                                                </div> */}

                                                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                                    <div className="flex items-center">


                                                                        {/* Smartphone */}
                                                                        <SelectInput
                                                                            key={idx}
                                                                            InputName="Smartphone"
                                                                            Id="smartphone_id"
                                                                            Name="smartphone_id"
                                                                            items={smartphonesForSelect}
                                                                            Value={
                                                                                item.smartphone_id
                                                                            }
                                                                            isDisabled={true}
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
                                                                            Action={() => openScanner('imei1', idx)}
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
                                                                            Action={() => openScanner('imei2', idx)}
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
                                                                            Action={() => openScanner('eid', idx)}
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
                                                                            Action={() => openScanner('serial_no', idx)}
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

                                            {assignment?.draft_data && (
                                                <div className="flex items-center gap-2 px-3 py-2 mb-3 text-xs text-blue-700 border border-blue-200 rounded-lg bg-blue-50 dark:bg-blue-900/10 dark:border-blue-800/40 dark:text-blue-400">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 shrink-0">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                                                    </svg>
                                                    A previously saved draft has been restored. You can continue from where you left off.
                                                </div>
                                            )}

                                            <div className="flex flex-wrap items-center gap-3 mt-2">
                                                <PrimaryButton
                                                    Text={'FulFill Stock'}
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


                                                <PrimaryButton
                                                    Text={'Save Progress'}
                                                    Type={'button'}
                                                    CustomClass={'w-[250px] '}
                                                    Disabled={draftSaving}
                                                    Spinner={draftSaving}
                                                    Action={handleSaveDraft}
                                                    Icon={
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
                                                        </svg>
                                                    }
                                                />



                                                {/* Error feedback */}
                                                {draftError && (
                                                    <span className="text-xs text-red-500 dark:text-red-400">
                                                        Failed to save. Please try again.
                                                    </span>
                                                )}
                                            </div>

                                        </>
                                    }
                                />
                            </form>
                        </>
                    }
                />

                {activeScanner && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto sm:p-6">
                        <div className="fixed inset-0 backdrop-blur-[32px]" />

                        <div className="relative z-10 w-full max-w-md overflow-hidden bg-white shadow-2xl rounded-2xl dark:bg-deepcharcoal">
                            {/* Header */}
                            <div className="flex items-center justify-between px-6 py-4 border-b dark:border-white/10">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                                    <h3 className="text-sm font-semibold text-gray-800 dark:text-white">
                                        Scanning: <span className="text-blue-600 capitalize dark:text-blue-400">
                                            {activeScanner.field === 'imei1' ? 'IMEI 1'
                                                : activeScanner.field === 'imei2' ? 'IMEI 2'
                                                    : activeScanner.field === 'eid' ? 'EID'
                                                        : 'Serial No'} — Item #{activeScanner.index + 1}
                                        </span>
                                    </h3>
                                </div>
                                <button
                                    onClick={closeScanner}
                                    className="flex items-center justify-center text-gray-400 rounded-lg w-7 h-7 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-white/10"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="p-6">
                                <p className="mb-4 text-xs text-center text-gray-500 dark:text-white/50">
                                    Point the camera at the barcode. It will be captured automatically.
                                </p>

                                {/* Viewport */}
                                <div className="relative overflow-hidden bg-gray-950 rounded-xl" style={{ aspectRatio: '4/3' }}>
                                    <video
                                        ref={scannerVideoRef}
                                        className="object-cover w-full h-full"
                                        muted
                                        playsInline
                                    />

                                    {/* Scan corners */}
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <div className="relative w-48 h-28">
                                            <span className="absolute w-5 h-5 border-t-2 border-l-2 border-blue-400 -top-px -left-px rounded-tl-md" />
                                            <span className="absolute w-5 h-5 border-t-2 border-r-2 border-blue-400 -top-px -right-px rounded-tr-md" />
                                            <span className="absolute w-5 h-5 border-b-2 border-l-2 border-blue-400 -bottom-px -left-px rounded-bl-md" />
                                            <span className="absolute w-5 h-5 border-b-2 border-r-2 border-blue-400 -bottom-px -right-px rounded-br-md" />
                                            <div className="absolute h-px left-2 right-2 bg-blue-400/50 top-1/2 animate-pulse" />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-center mt-4">
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
                    </div>
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
