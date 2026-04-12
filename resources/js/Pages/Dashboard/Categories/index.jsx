import Card from '@/Components/Card';
import LinkButton from '@/Components/LinkButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BreadCrumb from '@/Components/BreadCrumb';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import Table from '@/Components/Table';

import { useEffect, useState } from 'react';
import can from '@/Hooks/useCan';

export default function index({ categories }) {
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
                label: 'Category Name',
                render: (item) => {
                    return (
                        <Link
                            className="text-blue-500 underline"
                            href={route('dashboard.categories.show', item.id)}
                        >
                            {item.name}
                        </Link>
                    );
                },
            },
            {
                label: 'Category Short Description',
                render: (item) => {
                    return <span className="w-[200px] break-words">{item.short_description}</span>;
                },
            },
            {
                key: 'distributor.user.name',
                label: 'Distributor Name',
                badge: (value) => 'p-2 bg-blue-500 rounded-lg text-white',
            },
            {
                label: 'Category Status',
                render: (item) => {
                    return (
                        <span
                            className={`${item.is_active == 1 ? 'bg-green-500' : 'bg-red-500'} rounded-lg p-2 text-white`}
                        >
                            {item.is_active == 1 ? 'Active' : 'In-Active'}
                        </span>
                    );
                },
            },
            { key: 'added_at', label: 'Added At' },
        ];

        const customActions = [
            {
                label: 'View',
                type: 'link',
                href: (item) => route('dashboard.categories.show', item?.id),
            },
        ];

        setActions(customActions);
        setColumns(columns);
    }, []);

    return (
        <>
            <AuthenticatedLayout>
                <Head title="Categories" />

                <BreadCrumb
                    header={'Categories'}
                    parent={'Dashboard'}
                    parent_link={route('dashboard')}
                    child={'Categories'}
                />

                <Card
                    Content={
                        <>
                            {can('Categories Create') && (
                                <div className="my-3 flex flex-wrap justify-end">
                                    <LinkButton
                                        Text={'Create Category'}
                                        URL={route('dashboard.categories.create')}
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
                                BulkDeleteRoute={'dashboard.categories.destroybyselection'}
                                SingleDeleteRoute={'dashboard.categories.destroy'}
                                EditRoute={
                                    can('Categories Edit') ? 'dashboard.categories.edit' : null
                                }
                                SearchRoute={'dashboard.categories.index'}
                                Search={true}
                                DefaultSearchInput={true}
                                items={categories}
                                props={props}
                                customActions={actions}
                                columns={columns}
                                DeleteAction={can('Categories Delete')}
                                canSelect={can('Categories Delete')}
                            />
                        </>
                    }
                />
            </AuthenticatedLayout>
        </>
    );
}
