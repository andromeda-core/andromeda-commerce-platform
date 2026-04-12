import Card from '@/Components/Card';
import LinkButton from '@/Components/LinkButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BreadCrumb from '@/Components/BreadCrumb';
import { Head, useForm, usePage } from '@inertiajs/react';
import Table from '@/Components/Table';
import { useEffect, useState } from 'react';

export default function index({ storage_locations }) {
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
            { key: 'name', label: 'Storage Location Name' },
            { key: 'address', label: 'Storage Location Address' },
            {
                label: 'Storage Location Status',
                render: (item) => {
                    if (item.is_active === 1) {
                        return (
                            <span className="rounded-lg bg-green-500 p-3 text-white">Active</span>
                        );
                    } else {
                        return (
                            <span className="rounded-lg bg-red-500 p-2 text-white">In Active</span>
                        );
                    }
                },
            },

            { key: 'added_at', label: 'Added At' },
        ];

        setColumns(columns);
    }, []);

    return (
        <>
            <AuthenticatedLayout>
                <Head title="Settings - Storage Locations" />

                <BreadCrumb
                    header={'Settings - Storage Locations'}
                    parent={'Settings'}
                    parent_link={route('dashboard.settings.index')}
                    child={'Storage Locations'}
                />

                <Card
                    Content={
                        <>
                            <div className="my-3 flex flex-wrap justify-end gap-4">
                                <LinkButton
                                    Text={'Create Storage Location'}
                                    URL={route('dashboard.settings.storage_locations.create')}
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

                                <LinkButton
                                    Text={'Back To Settings'}
                                    URL={route('dashboard.settings.index')}
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
                                                d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"
                                            />
                                        </svg>
                                    }
                                />
                            </div>

                            <Table
                                setBulkSelectedIds={setBulkSelectedIds}
                                setSingleSelectedId={setSingleSelectedId}
                                SingleSelectedId={SingleSelectedId}
                                resetBulkSelectedIds={resetBulkSelectedIds}
                                resetSingleSelectedId={resetSingleSelectedId}
                                BulkDeleteMethod={BulkDelete}
                                SingleDeleteMethod={SingleDelete}
                                BulkDeleteRoute={
                                    'dashboard.settings.storage_locations.destroybyselection'
                                }
                                SingleDeleteRoute={'dashboard.settings.storage_locations.destroy'}
                                EditRoute={'dashboard.settings.storage_locations.edit'}
                                SearchRoute={'dashboard.settings.storage_locations.index'}
                                Search={false}
                                DefaultSearchInput={false}
                                items={storage_locations}
                                props={props}
                                columns={columns}
                            />
                        </>
                    }
                />
            </AuthenticatedLayout>
        </>
    );
}
