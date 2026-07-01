import Card from '@/Components/Card';
import LinkButton from '@/Components/LinkButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BreadCrumb from '@/Components/BreadCrumb';
import { Head, useForm, usePage } from '@inertiajs/react';
import Table from '@/Components/Table';
import { useEffect, useState } from 'react';
import can from '@/Hooks/useCan';

export default function index({ templates }) {
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

    const [columns, setColumns] = useState([]);

    useEffect(() => {
        const columns = [
            { key: 'title', label: 'Title' },
            {
                label: 'Status',
                render: (item) => (
                    <span
                        className={`rounded-lg p-2 text-sm text-white ${item.status ? 'bg-green-500' : 'bg-red-500'}`}
                    >
                        {item.status ? 'Active' : 'In Active'}
                    </span>
                ),
            },
            {
                label: 'Created At',
                render: (item) =>
                    item?.created_at
                        ? new Date(item.created_at).toLocaleDateString('en-US')
                        : '',
            },
        ];

        setColumns(columns);
    }, []);

    return (
        <>
            <AuthenticatedLayout>
                <Head title="Templates" />

                <BreadCrumb
                    header={'Templates'}
                    parent={'Dashboard'}
                    parent_link={route('dashboard')}
                    child={'Templates'}
                />

                <Card
                    Content={
                        <>
                            {can('Templates Create') && (
                                <div className="flex flex-wrap justify-end my-3">
                                    <LinkButton
                                        Text={'Create Template'}
                                        URL={route('dashboard.templates.create')}
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
                                BulkDeleteRoute={'dashboard.templates.destroybyselection'}
                                SingleDeleteRoute={'dashboard.templates.destroy'}
                                EditRoute={can('Templates Edit') ? 'dashboard.templates.edit' : null}
                                SearchRoute={'dashboard.templates.index'}
                                Search={true}
                                DefaultSearchInput={true}
                                items={templates}
                                props={props}
                                columns={columns}
                                DeleteAction={can('Templates Delete')}
                                canSelect={can('Templates Delete')}
                            />
                        </>
                    }
                />
            </AuthenticatedLayout>
        </>
    );
}
