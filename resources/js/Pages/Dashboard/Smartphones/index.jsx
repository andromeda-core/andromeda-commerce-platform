import Card from '@/Components/Card';
import LinkButton from '@/Components/LinkButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BreadCrumb from '@/Components/BreadCrumb';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import Table from '@/Components/Table';
import { useEffect, useState } from 'react';
import getContrastingColor from '@/Hooks/useColorContraster';
import can from '@/Hooks/useCan';

export default function index({ smartphones }) {
    // Bulk Delete Form Data
    const { props } = usePage();
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

    const { currency } = usePage().props;

    const toggleSoldOut = (id) => {
        router.put(
            route('dashboard.smartphones.toggle-sold-out', id),
            {},
            { preserveScroll: true },
        );
    };

    const [columns, setColumns] = useState([]);
    const [actions, setActions] = useState([]);
    useEffect(() => {
        const columns = [
            {
                label: 'Model Name',
                render: (item) => {
                    return (
                        <Link
                            href={route('dashboard.smartphones.show', item?.id)}
                            className="text-blue-500 underline cursor-pointer"
                        >
                            {item.model_name.name}
                        </Link>
                    );
                },
            },

            { key: 'location_name', label: 'Location Name' },
            { key: 'floor.name', label: 'Floor' },
            {
                key: 'category.name',
                label: 'Category',
                badge: (value) => 'p-2 bg-blue-500 rounded-lg text-white',
            },
            {
                key: 'capacity.name',
                label: 'Capacity',
                badge: (value) => 'p-2 bg-blue-500 rounded-lg text-white',
            },
            {
                label: 'Colors',
                render: (item) => {
                    return (
                        <div className="flex flex-col items-center gap-2">
                            {item.colors.map((color) => {
                                return (
                                    <span
                                        key={color.id}
                                        className="p-2 text-white rounded-lg"
                                        style={{
                                            backgroundColor: color.code,
                                            color: getContrastingColor(color.code),
                                        }}
                                    >
                                        {color.name}
                                    </span>
                                );
                            })}
                        </div>
                    );
                },
            },
            {
                key: 'upc',
                label: 'UPC/EAN',
                badge: (value) => 'p-2 bg-blue-500 rounded-lg text-white',
            },

            {
                label: 'Price',
                render: (item) => {
                    if (item?.selling_info) {
                        return (
                            <span className="p-2 text-white bg-blue-500 rounded-lg">
                                {currency?.symbol}
                                {Number(item?.selling_info?.total_price).toLocaleString('en-US')}
                            </span>
                        );
                    }

                    return 'N/A';
                },
            },




            {
                label: 'Tag',
                render: (item) => {
                    if (item?.tag) {
                        return item?.tag;
                    }

                    return 'N/A';
                },
            },

            {
                label: 'Sold Out',
                render: (item) => {
                    if (item.is_sold_out) {
                        return (
                            <label className="inline-flex cursor-pointer items-center">
                                {can('Smartphones Edit') && (
                                    <>
                                        <input
                                            type="checkbox"
                                            value={item.is_sold_out}
                                            onChange={() => toggleSoldOut(item.id)}
                                            checked={true}
                                            className="peer sr-only"
                                        />
                                        <div className="peer relative h-6 w-11 rounded-full bg-red-500 after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-red-500 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 dark:border-gray-600 dark:bg-red-500 dark:peer-checked:bg-red-500 dark:peer-focus:ring-red-800 rtl:peer-checked:after:-translate-x-full"></div>
                                    </>
                                )}
                                <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                                    Sold Out
                                </span>
                            </label>
                        );
                    } else {
                        return (
                            <label className="inline-flex cursor-pointer items-center">
                                {can('Smartphones Edit') && (
                                    <>
                                        <input
                                            type="checkbox"
                                            value={item.is_sold_out}
                                            onChange={() => toggleSoldOut(item.id)}
                                            checked={false}
                                            className="peer sr-only"
                                        />
                                        <div className="peer relative h-6 w-11 rounded-full bg-gray-200 after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-green-500 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:border-gray-600 dark:bg-gray-700 dark:peer-checked:bg-green-500 dark:peer-focus:ring-green-800 rtl:peer-checked:after:-translate-x-full"></div>
                                    </>
                                )}
                                <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                                    Available
                                </span>
                            </label>
                        );
                    }
                },
            },

            { key: 'added_at', label: 'Added At' },
        ];

        const customActions = [
            {
                label: 'View',
                type: 'link',
                href: (item) => route('dashboard.smartphones.show', item?.id),
            },
        ];

        setActions(customActions);
        setColumns(columns);
    }, []);

    return (
        <>
            <AuthenticatedLayout>
                <Head title="Smart Phones" />

                <BreadCrumb
                    header={'Smart Phones'}
                    parent={'Dashboard'}
                    parent_link={route('dashboard')}
                    child={'Smart Phones'}
                />

                <Card
                    Content={
                        <>
                            {can('Smartphones Create') && (
                                <div className="flex flex-wrap justify-end my-3">
                                    <LinkButton
                                        Text={'Create Smart Phone'}
                                        URL={route('dashboard.smartphones.create')}
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
                                BulkDeleteRoute={'dashboard.smartphones.destroybyselection'}
                                SingleDeleteRoute={'dashboard.smartphones.destroy'}
                                EditRoute={
                                    can('Smartphones Edit') ? 'dashboard.smartphones.edit' : null
                                }
                                SearchRoute={'dashboard.smartphones.index'}
                                Search={true}
                                DefaultSearchInput={true}
                                items={smartphones}
                                props={props}
                                columns={columns}
                                customActions={actions}
                                DeleteAction={can('Smartphones Delete')}
                                canSelect={can('Smartphones Delete')}
                            />
                        </>
                    }
                />
            </AuthenticatedLayout>
        </>
    );
}
