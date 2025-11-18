import Card from '@/Components/Card';
import LinkButton from '@/Components/LinkButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BreadCrumb from '@/Components/BreadCrumb';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import Table from '@/Components/Table';

import { useEffect, useState } from 'react';
import can from '@/Hooks/useCan';

export default function index({ customers }) {
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

    const [columns, setColumns] = useState([]);
    const [actions, setActions] = useState([]);
    useEffect(() => {
        const columns = [
            {
                label: 'Customer Name',
                render: (item) => {
                    return (
                        <Link
                            href={route('dashboard.customers.show', item?.id)}
                            className="cursor-pointer text-blue-500 underline"
                        >
                            {item.user.name}
                        </Link>
                    );
                },
            },
            { key: 'user.email', label: 'Customer Email' },
            { key: 'user.phone', label: 'Customer Phone' },
            { key: 'country.name', label: 'Country' },
            { key: 'city', label: 'City' },
            { key: 'state', label: 'State' },
            { key: 'postal_code', label: 'Postal Code' },
            {
                label: 'Reward Points',
                render: (item) => {
                    return (
                        <span className="rounded-lg bg-blue-500 p-2 text-white">
                            {item?.user?.reward_points}
                        </span>
                    );
                },
            },

            {
                label: 'Customer Address 1',
                render: (item) => {
                    return (
                        <span className="w-[200px] text-wrap break-words">
                            {item.address_line1 ?? 'N/A'}
                        </span>
                    );
                },
            },

            {
                label: 'Customer Address 2',
                render: (item) => {
                    return (
                        <span className="w-[200px] text-wrap break-words">
                            {item.address_line2 ?? 'N/A'}
                        </span>
                    );
                },
            },

            {
                label: 'Customer Status',
                render: (item) => {
                    if (item.user.is_active != 1) {
                        return (
                            <span className="rounded-lg bg-red-500 p-2 text-white">In-Active</span>
                        );
                    }

                    return <span className="rounded-lg bg-green-500 p-2 text-white">Active</span>;
                },
            },
            { key: 'added_at', label: 'Added At' },
        ];

        const customActions = [
            {
                label: 'View',
                type: 'link',
                href: (item) => route('dashboard.customers.show', item?.id),
            },
        ];

        setActions(customActions);
        setColumns(columns);
    }, []);

    return (
        <>
            <AuthenticatedLayout>
                <Head title="Customers" />

                <BreadCrumb
                    header={'Customers'}
                    parent={'Dashboard'}
                    parent_link={route('dashboard')}
                    child={'Customers'}
                />

                <Card
                    Content={
                        <>
                            {can('Customers Create') && (
                                <div className="my-3 flex flex-wrap justify-end">
                                    <LinkButton
                                        Text={'Create Customer'}
                                        URL={route('dashboard.customers.create')}
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
                                BulkDeleteRoute={'dashboard.customers.destroybyselection'}
                                SingleDeleteRoute={'dashboard.customers.destroy'}
                                EditRoute={
                                    can('Customers Edit') ? 'dashboard.customers.edit' : null
                                }
                                SearchRoute={'dashboard.customers.index'}
                                Search={true}
                                DefaultSearchInput={true}
                                items={customers}
                                props={props}
                                columns={columns}
                                customActions={actions}
                                DeleteAction={can('Customers Delete')}
                                canSelect={can('Customers Delete')}
                            />
                        </>
                    }
                />
            </AuthenticatedLayout>
        </>
    );
}
