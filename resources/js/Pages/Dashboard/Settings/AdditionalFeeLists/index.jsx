import Card from '@/Components/Card';
import LinkButton from '@/Components/LinkButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BreadCrumb from '@/Components/BreadCrumb';
import { Head, useForm, usePage } from '@inertiajs/react';
import Table from '@/Components/Table';
import { useEffect, useState } from 'react';

export default function index({ additional_fee_lists }) {
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
            { key: 'name', label: 'Additional Fee List Name' },
            {
                label: 'Additional Fee List Category', render: (item) => {
                    if (item?.category) {
                        return item?.category.replace(/_/g, ' ');
                    } else {
                        return "N/A";
                    }
                }
            },
            { key: 'value_type', label: 'Additional Fee List Type' },
            {
                label: 'Additional Fee List Value', render: (item) => {
                    if (item?.default_value) {
                        return (
                            <span className="p-3 text-white bg-green-500 rounded-lg">
                                {item?.value_type === 'fixed' && props?.currency?.symbol}{item?.default_value}{item?.value_type === 'percentage' && '%'}
                            </span>
                        );
                    } else {
                        return "N/A";
                    }
                }
            },
            {
                label: 'Additional Fee List Status',
                render: (item) => {
                    if (item.is_active === 1) {
                        return (
                            <span className="p-3 text-white bg-green-500 rounded-lg">Active</span>
                        );
                    } else {
                        return (
                            <span className="p-2 text-white bg-red-500 rounded-lg">In Active</span>
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
                <Head title="Settings - Additional Fee Lists" />

                <BreadCrumb
                    header={'Settings - Additional Fee Lists'}
                    parent={'Settings'}
                    parent_link={route('dashboard.settings.index')}
                    child={'Additional Fee Lists'}
                />

                <Card
                    Content={
                        <>
                            <div className="flex flex-wrap justify-end gap-4 my-3">
                                <LinkButton
                                    Text={'Create Additional Fee List'}
                                    URL={route('dashboard.settings.additional_fee_lists.create')}
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
                                    'dashboard.settings.additional_fee_lists.destroybyselection'
                                }
                                SingleDeleteRoute={
                                    'dashboard.settings.additional_fee_lists.destroy'
                                }
                                EditRoute={'dashboard.settings.additional_fee_lists.edit'}
                                SearchRoute={'dashboard.settings.additional_fee_lists.index'}
                                Search={false}
                                DefaultSearchInput={false}
                                items={additional_fee_lists}
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
