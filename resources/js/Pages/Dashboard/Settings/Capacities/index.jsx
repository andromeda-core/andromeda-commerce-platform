import Card from '@/Components/Card';
import LinkButton from '@/Components/LinkButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BreadCrumb from '@/Components/BreadCrumb';
import { Head, useForm, usePage } from '@inertiajs/react';
import Table from '@/Components/Table';
import { useEffect, useState } from 'react';
import can from '@/Hooks/useCan';

export default function index({ capacities }) {
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
            { key: 'name', label: 'Capacity' },
            {
                label: 'Capacity Status',
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
                <Head title="Capacities" />

                <BreadCrumb
                    header={'Capacities'}
                    parent={'Dashboard'}
                    parent_link={route('dashboard')}
                    child={'Capacities'}
                />

                <Card
                    Content={
                        <>
                            <div className="flex flex-wrap justify-end gap-4 my-3">
                                {can("Capacity Create") && (
                                    <LinkButton
                                        Text={'Create Capacity'}
                                        URL={route('dashboard.settings.capacities.create')}
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
                                )}

                                {/* <LinkButton
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
                                /> */}
                            </div>

                            <Table
                                setBulkSelectedIds={setBulkSelectedIds}
                                setSingleSelectedId={setSingleSelectedId}
                                SingleSelectedId={SingleSelectedId}
                                resetBulkSelectedIds={resetBulkSelectedIds}
                                resetSingleSelectedId={resetSingleSelectedId}
                                BulkDeleteMethod={BulkDelete}
                                SingleDeleteMethod={SingleDelete}
                                BulkDeleteRoute={'dashboard.settings.capacities.destroybyselection'}
                                SingleDeleteRoute={'dashboard.settings.capacities.destroy'}
                                EditRoute={can("Capacity Edit") ? 'dashboard.settings.capacities.edit' : null}
                                DeleteAction={can('Capacity Delete')}
                                canSelect={can('Capacity Delete')}
                                SearchRoute={'dashboard.settings.capacities.index'}
                                Search={false}
                                DefaultSearchInput={false}
                                items={capacities}
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
