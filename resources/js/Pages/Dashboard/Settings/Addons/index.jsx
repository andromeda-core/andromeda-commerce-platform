import Card from '@/Components/Card';
import LinkButton from '@/Components/LinkButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BreadCrumb from '@/Components/BreadCrumb';
import { Head, useForm, usePage } from '@inertiajs/react';
import Table from '@/Components/Table';
import { useEffect, useState } from 'react';
import can from '@/Hooks/useCan';

export default function index({ addons }) {
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

    const { put } = useForm({});

    const toggleStatus = (id) => {
        put(route('dashboard.settings.addon-settings.toggle-status', id));
    };

    const [columns, setColumns] = useState([]);
    useEffect(() => {
        const columns = [
            { key: 'name', label: 'Addon Name' },
            {
                label: 'Addon Price', render: (item) => {
                    return (
                        <>
                            <span className="text-sm font-medium text-gray-900 ms-3 dark:text-gray-300">
                                {props?.currency?.symbol}{Number(item.price).toLocaleString('en-US')}
                            </span>
                        </>
                    );
                }
            },

            ,
            {
                label: 'Addon Status',
                render: (item) => {
                    if (item.is_active === 1) {
                        return (
                            <>
                                <label className="inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        value={item.is_active}
                                        onChange={() => toggleStatus(item.id)}
                                        checked={item.is_active === 1}
                                        className="sr-only peer"
                                    />
                                    <div className="peer relative h-6 w-11 rounded-full bg-gray-200 after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-green-500 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:border-gray-600 dark:bg-gray-700 dark:peer-checked:bg-green-500 dark:peer-focus:ring-green-800 rtl:peer-checked:after:-translate-x-full"></div>
                                    <span className="text-sm font-medium text-gray-900 ms-3 dark:text-gray-300">
                                        Active
                                    </span>
                                </label>
                            </>
                        );
                    } else {
                        return (
                            <>
                                <label className="inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        value={item.is_active}
                                        onChange={() => toggleStatus(item.id)}
                                        checked={false}
                                        className="sr-only peer"
                                    />
                                    <div className="peer relative h-6 w-11 rounded-full bg-red-500 after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-red-500 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 dark:border-gray-600 dark:bg-red-500 dark:peer-checked:bg-red-500 dark:peer-focus:ring-red-800 rtl:peer-checked:after:-translate-x-full"></div>
                                    <span className="text-sm font-medium text-gray-900 ms-3 dark:text-gray-300">
                                        In-Active
                                    </span>
                                </label>
                            </>
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
                <Head title="Addons" />

                <BreadCrumb
                    header={'Addons'}
                    parent={'Dashboard'}
                    parent_link={route('dashboard')}
                    child={'Addons'}
                />

                <Card
                    Content={
                        <>
                            <div className="flex flex-wrap justify-end gap-4 my-3">
                                {can("Addon Items Create") && (
                                    <LinkButton
                                        Text={'Create Addon'}
                                        URL={route('dashboard.settings.addon-settings.create')}
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
                                BulkDeleteRoute={
                                    'dashboard.settings.addon-settings.destroybyselection'
                                }
                                SingleDeleteRoute={
                                    'dashboard.settings.addon-settings.destroy'
                                }
                                EditRoute={can("Addon Items Edit") ? 'dashboard.settings.addon-settings.edit' : null}
                                SearchRoute={'dashboard.settings.addon-settings.index'}
                                Search={false}
                                DefaultSearchInput={false}
                                DeleteAction={can('Addon Items Delete')}
                                items={addons}
                                props={props}
                                columns={columns}
                                canSelect={can('Addon Items Delete')}
                            />
                        </>
                    }
                />
            </AuthenticatedLayout>
        </>
    );
}
