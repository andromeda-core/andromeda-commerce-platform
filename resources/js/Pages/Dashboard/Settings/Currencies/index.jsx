import Card from '@/Components/Card';
import LinkButton from '@/Components/LinkButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BreadCrumb from '@/Components/BreadCrumb';
import { Head, useForm, usePage } from '@inertiajs/react';
import Table from '@/Components/Table';
import { useEffect, useState } from 'react';

export default function index({ currencies }) {
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

    // Toggle Currency Status
    const { put } = useForm({});
    const toggleStatus = (id) => {
        put(route('dashboard.settings.currencies.toggle', id));
    };

    const [columns, setColumns] = useState([]);
    useEffect(() => {
        const columns = [
            { key: 'name', label: 'Currency Name' },
            {
                key: 'symbol',
                label: 'Currency Symbol',
                badge: (value) => 'p-2 bg-blue-500 rounded-lg text-white',
            },
            {
                label: 'Currency Status',
                render: (item) => {
                    if (item.is_active === 1) {
                        return (
                            <>
                                <label className="inline-flex cursor-pointer items-center">
                                    <input
                                        type="checkbox"
                                        value={item.is_active}
                                        onChange={() => toggleStatus(item.id)}
                                        checked={item.is_active === 1}
                                        className="peer sr-only"
                                    />
                                    <div className="peer relative h-6 w-11 rounded-full bg-gray-200 after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-green-500 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:border-gray-600 dark:bg-gray-700 dark:peer-checked:bg-green-500 dark:peer-focus:ring-green-800 rtl:peer-checked:after:-translate-x-full"></div>
                                    <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                                        Active
                                    </span>
                                </label>
                            </>
                        );
                    } else {
                        return (
                            <>
                                <label className="inline-flex cursor-pointer items-center">
                                    <input
                                        type="checkbox"
                                        value={item.is_active}
                                        onChange={() => toggleStatus(item.id)}
                                        checked={false}
                                        className="peer sr-only"
                                    />
                                    <div className="peer relative h-6 w-11 rounded-full bg-red-500 after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-red-500 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 dark:border-gray-600 dark:bg-red-500 dark:peer-checked:bg-red-500 dark:peer-focus:ring-red-800 rtl:peer-checked:after:-translate-x-full"></div>
                                    <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
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
                <Head title="Settings - Currencies" />

                <BreadCrumb
                    header={'Settings - Currencies'}
                    parent={'Settings'}
                    parent_link={route('dashboard.settings.index')}
                    child={'Currencies'}
                />

                <Card
                    Content={
                        <>
                            <div className="my-3 flex flex-wrap justify-end gap-4">
                                <LinkButton
                                    Text={'Create Currency'}
                                    URL={route('dashboard.settings.currencies.create')}
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
                                BulkDeleteRoute={'dashboard.settings.currencies.destroybyselection'}
                                SingleDeleteRoute={'dashboard.settings.currencies.destroy'}
                                EditRoute={'dashboard.settings.currencies.edit'}
                                SearchRoute={'dashboard.settings.currencies.index'}
                                Search={false}
                                DefaultSearchInput={false}
                                items={currencies}
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
