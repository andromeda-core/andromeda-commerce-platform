import Card from '@/Components/Card';
import LinkButton from '@/Components/LinkButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BreadCrumb from '@/Components/BreadCrumb';
import { Head, useForm, usePage } from '@inertiajs/react';
import Table from '@/Components/Table';
import { useEffect, useState } from 'react';

export default function index({ meta_settings }) {
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
        put(route('dashboard.settings.meta-settings.toggle-status', id));
    };

    const [columns, setColumns] = useState([]);
    useEffect(() => {
        const columns = [

            { key: 'meta_fb_app_name', label: 'Meta FB APP NAME' },
            { key: 'meta_ig_app_name', label: 'Meta IG APP NAME' },

            { key: 'meta_fb_app_id', label: 'Meta FB APP ID' },
            { key: 'meta_fb_app_secret', label: 'Meta FB APP Secret' },


            { key: 'meta_ig_app_id', label: 'Meta IG APP ID' },
            { key: 'meta_ig_app_secret', label: 'Meta IG APP Secret' },


            { key: 'meta_fb_token_expires_at', label: 'Meta FB Token Expiry' },
            { key: 'meta_ig_token_expires_at', label: 'Meta IG Token Expiry' },

            {
                label: 'Meta Setting Status',
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
                <Head title="Settings - Meta Settings" />

                <BreadCrumb
                    header={'Settings - Meta Settings'}
                    parent={'Settings'}
                    parent_link={route('dashboard.settings.index')}
                    child={'Meta Settings'}
                />

                <Card
                    Content={
                        <>
                            <div className="flex flex-wrap justify-end gap-4 my-3">
                                <LinkButton
                                    Text={'Create Meta Setting'}
                                    URL={route('dashboard.settings.meta-settings.create')}
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
                                    'dashboard.settings.meta-settings.destroybyselection'
                                }
                                SingleDeleteRoute={'dashboard.settings.meta-settings.destroy'}
                                EditRoute={'dashboard.settings.meta-settings.edit'}
                                SearchRoute={'dashboard.settings.meta-settings.index'}
                                Search={false}
                                DefaultSearchInput={false}
                                items={meta_settings}
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
