// resources/js/Pages/Dashboard/OrderCourierCompanies/index.jsx

import Card from '@/Components/Card';
import LinkButton from '@/Components/LinkButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BreadCrumb from '@/Components/BreadCrumb';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import Table from '@/Components/Table';
import { useEffect, useState } from 'react';
import can from '@/Hooks/useCan';

export default function index({ orderCourierCompanies, search }) {
    const { props } = usePage();

    // Bulk Delete Form Data
    const {
        data: BulkselectedIds,
        setData: setBulkSelectedIds,
        delete: BulkDelete,
        reset: resetBulkSelectedIds,
    } = useForm({
        ids: [],
    });

    // Single Delete Form Data
    const {
        data: SingleSelectedId,
        setData: setSingleSelectedId,
        delete: SingleDelete,
        reset: resetSingleSelectedId,
    } = useForm({
        id: null,
    });

    const toggleStatus = (id) => {
        router.put(route('dashboard.order-courier-companies.toggle-status', id));
    };

    const [columns, setColumns] = useState([]);

    useEffect(() => {
        const columns = [
            { key: 'name', label: 'Company Name' },
            {
                label: 'Address',
                render: (item) => {
                    return (
                        <span className="w-[200px] text-wrap break-words">
                            {item.address ?? 'N/A'}
                        </span>
                    );
                },
            },
            { key: 'postal_code', label: 'Postal Code' },
            { key: 'phone', label: 'Phone' },
            {
                label: 'Status',
                render: (item) => {
                    if (item.is_active === 1) {
                        return (
                            <>
                                <label className="inline-flex cursor-pointer items-center">
                                    {can('Order Courier Companies Edit') && (
                                        <>
                                            <input
                                                type="checkbox"
                                                value={item.is_active}
                                                onChange={() => toggleStatus(item.id)}
                                                checked={item.is_active === 1}
                                                className="peer sr-only"
                                            />
                                            <div className="peer relative h-6 w-11 rounded-full bg-gray-200 after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-green-500 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:border-gray-600 dark:bg-gray-700 dark:peer-checked:bg-green-500 dark:peer-focus:ring-green-800 rtl:peer-checked:after:-translate-x-full"></div>
                                        </>
                                    )}
                                    <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                                        Active
                                    </span>
                                </label>
                            </>
                        );
                    } else {
                        return (
                            <>
                                <label className="inline-flex cursor-pointer items-center">
                                    {can('Order Courier Companies Edit') && (
                                        <>
                                            <input
                                                type="checkbox"
                                                value={item.is_active}
                                                onChange={() => toggleStatus(item.id)}
                                                checked={false}
                                                className="peer sr-only"
                                            />
                                            <div className="peer relative h-6 w-11 rounded-full bg-red-500 after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-red-500 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 dark:border-gray-600 dark:bg-red-500 dark:peer-checked:bg-red-500 dark:peer-focus:ring-red-800 rtl:peer-checked:after:-translate-x-full"></div>
                                        </>
                                    )}

                                    <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                                        In-Active
                                    </span>
                                </label>
                            </>
                        );
                    }
                },
            },
            { key: 'added_at', label: 'Added At' },
        ];

        setColumns(columns);
    }, []);

    return (
        <>
            <AuthenticatedLayout>
                <Head title="Order Courier Companies" />

                <BreadCrumb
                    header={'Order Courier Companies'}
                    parent={'Dashboard'}
                    parent_link={route('dashboard')}
                    child={'Order Courier Companies'}
                />

                <Card
                    Content={
                        <>
                            {can('Order Courier Companies Create') && (
                                <div className="my-3 flex flex-wrap justify-end">
                                    <LinkButton
                                        Text={'Create Courier Company'}
                                        URL={route('dashboard.order-courier-companies.create')}
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
                                </div>
                            )}
                            <Table
                                setBulkSelectedIds={setBulkSelectedIds}
                                setSingleSelectedId={setSingleSelectedId}
                                SingleSelectedId={SingleSelectedId}
                                resetBulkSelectedIds={resetBulkSelectedIds}
                                resetSingleSelectedId={resetSingleSelectedId}
                                BulkDeleteMethod={BulkDelete}
                                SingleDeleteMethod={SingleDelete}
                                BulkDeleteRoute={
                                    'dashboard.order-courier-companies.destroyBySelection'
                                }
                                SingleDeleteRoute={'dashboard.order-courier-companies.destroy'}
                                EditRoute={
                                    can('Order Courier Companies Edit')
                                        ? 'dashboard.order-courier-companies.edit'
                                        : null
                                }
                                SearchRoute={'dashboard.order-courier-companies.index'}
                                Search={true}
                                DefaultSearchInput={true}
                                items={orderCourierCompanies}
                                props={props}
                                columns={columns}
                                DeleteAction={can('Order Courier Companies Delete')}
                                canSelect={can('Order Courier Companies Delete')}
                            />
                        </>
                    }
                />
            </AuthenticatedLayout>
        </>
    );
}
