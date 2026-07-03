import Card from '@/Components/Card';
import LinkButton from '@/Components/LinkButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BreadCrumb from '@/Components/BreadCrumb';
import { Head, useForm, usePage } from '@inertiajs/react';
import Table from '@/Components/Table';

import { useEffect, useState } from 'react';
import can from '@/Hooks/useCan';

export default function index({ accommodation_distributors }) {
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
    useEffect(() => {
        const columns = [
            { key: 'user.name', label: 'Distributor Name' },
            { key: 'user.email', label: 'Distributor Email' },
            { key: 'user.phone', label: 'Distributor Phone' },

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
                key: 'postal_code',
                label: 'Distributor Postal Code',
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

        setColumns(columns);
    }, []);

    return (
        <>
            <AuthenticatedLayout>
                <Head title="Accommodation Distributors" />

                <BreadCrumb
                    header={'Accommodation Distributors'}
                    parent={'Dashboard'}
                    parent_link={route('dashboard')}
                    child={'Accommodation Distributors'}
                />

                <Card
                    Content={
                        <>
                            {can('Accommodation Distributors Create') && (
                                <div className="my-3 flex flex-wrap justify-end">
                                    <LinkButton
                                        Text={'Create Accommodation Distributor'}
                                        URL={route('dashboard.accommodation-distributors.create')}
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
                                BulkDeleteRoute={'dashboard.accommodation-distributors.destroybyselection'}
                                SingleDeleteRoute={'dashboard.accommodation-distributors.destroy'}
                                EditRoute={
                                    can('Accommodation Distributors Edit')
                                        ? 'dashboard.accommodation-distributors.edit'
                                        : null
                                }
                                SearchRoute={'dashboard.accommodation-distributors.index'}
                                Search={true}
                                DefaultSearchInput={true}
                                items={accommodation_distributors}
                                props={props}
                                columns={columns}
                                DeleteAction={can('Accommodation Distributors Delete')}
                                canSelect={can('Accommodation Distributors Delete')}
                            />
                        </>
                    }
                />
            </AuthenticatedLayout>
        </>
    );
}
