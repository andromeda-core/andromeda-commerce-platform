import Card from '@/Components/Card';
import LinkButton from '@/Components/LinkButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BreadCrumb from '@/Components/BreadCrumb';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import Table from '@/Components/Table';

import { useEffect, useState } from 'react';
import can from '@/Hooks/useCan';

export default function index({ suppliers }) {
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
                label: 'Supplier Name',
                render: (item) => {
                    return (
                        <Link
                            href={route('dashboard.suppliers.show', item?.id)}
                            className="text-blue-500 underline cursor-pointer"
                        >
                            {item.user.name}
                        </Link>
                    );
                },
            },
            { key: 'user.email', label: 'Supplier Email' },
            { key: 'user.phone', label: 'Supplier Phone' },
            { key: 'company_name', label: 'Supplier Company' },


            { key: 'added_at', label: 'Added At' },
        ];

        const customActions = [
            {
                label: 'View',
                type: 'link',
                href: (item) => route('dashboard.suppliers.show', item?.id),
            },
        ];

        setActions(customActions);
        setColumns(columns);
    }, []);

    return (
        <>
            <AuthenticatedLayout>
                <Head title="Suppliers" />

                <BreadCrumb
                    header={'Suppliers'}
                    parent={'Dashboard'}
                    parent_link={route('dashboard')}
                    child={'Suppliers'}
                />

                <Card
                    Content={
                        <>
                            {can('Suppliers Create') && (
                                <div className="flex flex-wrap justify-end my-3">
                                    <LinkButton
                                        Text={'Create Supplier'}
                                        URL={route('dashboard.suppliers.create')}
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
                                BulkDeleteRoute={'dashboard.suppliers.destroybyselection'}
                                SingleDeleteRoute={'dashboard.suppliers.destroy'}
                                EditRoute={
                                    can('Suppliers Edit') ? 'dashboard.suppliers.edit' : null
                                }
                                DeleteAction={can('Suppliers Delete')}
                                canSelect={can('Suppliers Delete')}
                                SearchRoute={'dashboard.suppliers.index'}
                                Search={true}
                                DefaultSearchInput={true}
                                items={suppliers}
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
