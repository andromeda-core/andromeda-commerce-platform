import Card from '@/Components/Card';
import LinkButton from '@/Components/LinkButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BreadCrumb from '@/Components/BreadCrumb';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import Table from '@/Components/Table';
import { useEffect, useState } from 'react';
import can from '@/Hooks/useCan';

export default function index({ users }) {
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
                label: 'User Name',
                render: (item) => {
                    return (
                        <Link
                            href={route('dashboard.users.show', item?.id)}
                            className="text-blue-500 underline cursor-pointer"
                        >
                            {item.name}
                        </Link>
                    );
                },
            },
            { key: 'email', label: 'User Email' },
            { key: 'phone', label: 'User Phone' },
            {
                label: 'User Role',
                render: (item) => {
                    return (
                        <span className="p-2 text-white bg-blue-500 rounded-lg">
                            {item?.roles[0]?.name ?? 'No Role'}
                        </span>
                    );
                },
            },


            {
                label: 'Status',
                render: (item) => {
                    if (item.is_active != 1) {
                        return (
                            <span className="p-2 text-white bg-red-500 rounded-lg">In-Active</span>
                        );
                    }

                    return <span className="p-2 text-white bg-green-500 rounded-lg">Active</span>;
                },
            },
            { key: 'added_at', label: 'Added At' },
        ];

        const customActions = [
            {
                label: 'View',
                type: 'link',
                href: (item) => route('dashboard.users.show', item?.id),
            },
        ];

        setActions(customActions);

        setColumns(columns);
    }, []);

    return (
        <>
            <AuthenticatedLayout>
                <Head title="Users" />

                <BreadCrumb
                    header={'Users'}
                    parent={'Dashboard'}
                    parent_link={route('dashboard')}
                    child={'Users'}
                />

                <Card
                    Content={
                        <>
                            {can('Users Create') && (
                                <div className="flex flex-wrap justify-end my-3">
                                    <LinkButton
                                        Text={'Create User'}
                                        URL={route('dashboard.users.create')}
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
                                BulkDeleteRoute={'dashboard.users.destroybyselection'}
                                SingleDeleteRoute={'dashboard.users.destroy'}
                                EditRoute={can('Users Edit') ? 'dashboard.users.edit' : null}
                                DeleteAction={can('Users Delete')}
                                canSelect={can('Users Delete')}
                                SearchRoute={'dashboard.users.index'}
                                Search={true}
                                DefaultSearchInput={true}
                                items={users}
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
