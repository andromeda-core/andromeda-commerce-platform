import Card from '@/Components/Card';
import LinkButton from '@/Components/LinkButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BreadCrumb from '@/Components/BreadCrumb';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import Table from '@/Components/Table';

import { useEffect, useState } from 'react';
import can from '@/Hooks/useCan';

export default function index({ collaborators }) {
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
                label: 'Collaborator Name',
                render: (item) => {
                    return (
                        <Link
                            href={route('dashboard.collaborators.show', item?.id)}
                            className="cursor-pointer text-blue-500 underline"
                        >
                            {item.user.name}
                        </Link>
                    );
                },
            },
            { key: 'user.email', label: 'Collaborator Email' },
            { key: 'user.phone', label: 'Collaborator Phone' },
            {
                label: 'Point Accumulation Rate',
                render: (item) => {
                    if (item.point_accumulation_rate) {
                        return (
                            <span className="rounded-lg bg-blue-500 p-2 text-white">
                                {item.point_accumulation_rate}%
                            </span>
                        );
                    } else {
                        return 'Default';
                    }
                },
            },

            {
                label: 'Commission Rate',
                render: (item) => {
                    if (item.commission_rate) {
                        return (
                            <span className="rounded-lg bg-blue-500 p-2 text-white">
                                {item.commission_rate}%
                            </span>
                        );
                    } else {
                        return 'Default';
                    }
                },
            },

            {
                key: 'type',
                label: 'Collaborator Type',
                badge: (value) => 'rounded-lg bg-blue-500 p-2 text-white',
            },
            {
                key: 'referral_code',
                label: 'Collaborator Referral Code',
                badge: (value) => 'rounded-lg bg-blue-500 p-2 text-white',
            },
            {
                label: 'Collaborator Address',
                render: (item) => {
                    return (
                        <span className="w-[200px] text-wrap break-words">
                            {item.address ?? 'N/A'}
                        </span>
                    );
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

            {
                label: 'Collaborator Status',
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
                href: (item) => route('dashboard.collaborators.show', item?.id),
            },
        ];

        setActions(customActions);
        setColumns(columns);
    }, []);

    return (
        <>
            <AuthenticatedLayout>
                <Head title="Collaborators" />

                <BreadCrumb
                    header={'Collaborators'}
                    parent={'Dashboard'}
                    parent_link={route('dashboard')}
                    child={'Collaborators'}
                />

                <Card
                    Content={
                        <>
                            {can('Collaborators Create') && (
                                <div className="my-3 flex flex-wrap justify-end">
                                    <LinkButton
                                        Text={'Create Collaborator'}
                                        URL={route('dashboard.collaborators.create')}
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
                                BulkDeleteRoute={'dashboard.collaborators.destroybyselection'}
                                SingleDeleteRoute={'dashboard.collaborators.destroy'}
                                EditRoute={
                                    can('Collaborators Edit')
                                        ? 'dashboard.collaborators.edit'
                                        : null
                                }
                                SearchRoute={'dashboard.collaborators.index'}
                                DeleteAction={can('Collaborators Delete')}
                                canSelect={can('Collaborators Delete')}
                                Search={true}
                                DefaultSearchInput={true}
                                items={collaborators}
                                props={props}
                                columns={columns}
                                customActions={actions}
                            />
                        </>
                    }
                />
            </AuthenticatedLayout>
        </>
    );
}
