import Card from '@/Components/Card';
import LinkButton from '@/Components/LinkButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BreadCrumb from '@/Components/BreadCrumb';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import Table from '@/Components/Table';
import { useEffect, useState } from 'react';
import can from '@/Hooks/useCan';

export default function index({ priceRanges, can_create_more_price_range }) {
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
        router.put(route('dashboard.settings.price-ranges.toggle-status', id));
    };

    const [columns, setColumns] = useState([]);

    useEffect(() => {
        const columns = [
            {
                label: 'Value',
                render: (item) => {
                    return (
                        <span>
                            {props.currency?.symbol}
                            {item.value}
                        </span>
                    );
                },
            },
            {
                label: 'Type',
                render: (item) => {
                    return <span>{item.type_label}</span>;
                },
            },
            {
                label: 'Status',
                render: (item) => {
                    if (item.is_active === true || item.is_active === 1) {
                        return (
                            <>
                                <label className="inline-flex cursor-pointer items-center">
                                    {can('Price Ranges Edit') && (
                                        <>
                                            <input
                                                type="checkbox"
                                                value={item.is_active}
                                                onChange={() => toggleStatus(item.id)}
                                                checked={true}
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
                                    {can('Price Ranges Edit') && (
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
                <Head title="Price Ranges" />

                <BreadCrumb
                    header={'Price Ranges'}
                    parent={'Dashboard'}
                    parent_link={route('dashboard')}
                    child={'Price Ranges'}
                />

                <Card
                    Content={
                        <>
                            {can('Price Ranges Create') && can_create_more_price_range && (
                                <div className="my-3 flex flex-wrap justify-end">
                                    <LinkButton
                                        Text={'Create Price Range'}
                                        URL={route('dashboard.settings.price-ranges.create')}
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
                                    'dashboard.settings.price-ranges.destroybyselection'
                                }
                                SingleDeleteRoute={'dashboard.settings.price-ranges.destroy'}
                                EditRoute={
                                    can('Price Ranges Edit')
                                        ? 'dashboard.settings.price-ranges.edit'
                                        : null
                                }
                                SearchRoute={'dashboard.settings.price-ranges.index'}
                                Search={true}
                                DefaultSearchInput={true}
                                items={priceRanges}
                                props={props}
                                columns={columns}
                                DeleteAction={can('Price Ranges Delete')}
                                canSelect={can('Price Ranges Delete')}
                            />
                        </>
                    }
                />
            </AuthenticatedLayout>
        </>
    );
}
