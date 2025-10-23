import Card from '@/Components/Card';
import LinkButton from '@/Components/LinkButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BreadCrumb from '@/Components/BreadCrumb';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import Table from '@/Components/Table';

import { useEffect, useState } from 'react';
import getContrastingColor from '@/Hooks/useColorContraster';
import can from '@/Hooks/can';

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
                            className="cursor-pointer text-blue-500 underline"
                        >
                            {item.model_name.name}
                        </Link>
                    );
                },
            },
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
                                        className="rounded-lg p-2 text-white"
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
                label: 'Selling Price',
                render: (item) => {
                    if (item?.selling_info) {
                        return (
                            <span className="rounded-lg bg-blue-500 p-2 text-white">
                                {currency?.symbol}
                                {item?.selling_info?.total_price}
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
                                <div className="my-3 flex flex-wrap justify-end">
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
