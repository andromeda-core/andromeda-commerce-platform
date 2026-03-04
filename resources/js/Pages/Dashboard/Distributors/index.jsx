import Card from '@/Components/Card';
import LinkButton from '@/Components/LinkButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BreadCrumb from '@/Components/BreadCrumb';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import Table from '@/Components/Table';

import { useEffect, useState } from 'react';
import can from '@/Hooks/useCan';

export default function index({ distributors }) {
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
                label: 'Distributor Name',
                render: (item) => {
                    return (
                        <Link
                            href={route('dashboard.distributors.show', item?.id)}
                            className="text-blue-500 underline cursor-pointer"
                        >
                            {item.user.name}
                        </Link>
                    );
                },
            },
            { key: 'user.email', label: 'Distributor Email' },
            { key: 'user.phone', label: 'Distributor Phone' },


            {
                label: 'Can Verify Inventory',
                render: (item) => {
                    if (item.can_verify_inventory) {
                        return (
                            <span className="p-2 text-white bg-green-500 rounded-lg">
                                Yes
                            </span>
                        );
                    } else {
                        return (
                            <span className="p-2 text-white bg-red-500 rounded-lg">
                                No
                            </span>
                        );
                    }
                },
            },

            {
                label: 'Distributor Address',
                render: (item) => {
                    return (
                        <span className="w-[200px] text-wrap break-words">
                            {item.address ?? 'N/A'}
                        </span>
                    );
                },
            },

            {
                label: 'Commission Rate',
                render: (item) => {
                    if (item.commission_rate) {
                        return (
                            <span className="p-2 text-white bg-blue-500 rounded-lg">
                                {item.commission_rate}%
                            </span>
                        );
                    } else {
                        return 'Default';
                    }
                },
            },

            {
                key: 'bank_name',
                label: 'Distributor Bank Name',
            },

            {
                key: 'bank_account_name',
                label: 'Distributor Bank Account Name',
            },

            {
                key: 'bank_account_no',
                label: 'Distributor Bank Account No',
            },

            {
                key: 'iban',
                label: 'Distributor Bank IBAN',
            },

            {
                key: 'swift_code',
                label: 'Distributor Bank SWIFT Code',
            },


            { key: 'added_at', label: 'Added At' },
        ];

        const customActions = [
            {
                label: 'View',
                type: 'link',
                href: (item) => route('dashboard.distributors.show', item?.id),
            },
        ];

        setActions(customActions);
        setColumns(columns);
    }, []);

    return (
        <>
            <AuthenticatedLayout>
                <Head title="Distributors" />

                <BreadCrumb
                    header={'Distributors'}
                    parent={'Dashboard'}
                    parent_link={route('dashboard')}
                    child={'Distributors'}
                />

                <Card
                    Content={
                        <>
                            {can('Distributors Create') && (
                                <div className="flex flex-wrap justify-end my-3">
                                    <LinkButton
                                        Text={'Create Distributor'}
                                        URL={route('dashboard.distributors.create')}
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
                                BulkDeleteRoute={'dashboard.distributors.destroybyselection'}
                                SingleDeleteRoute={'dashboard.distributors.destroy'}
                                EditRoute={
                                    can('Distributors Edit') ? 'dashboard.distributors.edit' : null
                                }
                                SearchRoute={'dashboard.distributors.index'}
                                Search={true}
                                DefaultSearchInput={true}
                                items={distributors}
                                props={props}
                                columns={columns}
                                customActions={actions}
                                DeleteAction={can('Distributors Delete')}
                                canSelect={can('Distributors Delete')}
                            />
                        </>
                    }
                />
            </AuthenticatedLayout>
        </>
    );
}
