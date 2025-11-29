import Card from '@/Components/Card';
import LinkButton from '@/Components/LinkButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BreadCrumb from '@/Components/BreadCrumb';
import { Head, useForm, usePage } from '@inertiajs/react';
import Table from '@/Components/Table';
import { useEffect, useState } from 'react';

export default function index({ aws_settings }) {
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
        put(route('dashboard.settings.aws-settings.toggle-status', id));
    };

    const [columns, setColumns] = useState([]);
    useEffect(() => {
        const columns = [
            { key: 'aws_access_key_id', label: 'AWS Access Key ID' },
            { key: 'aws_secret_access_key', label: 'AWS Secret Access Key' },
            { key: 'aws_region', label: 'AWS Region' },
            { key: 'aws_bucket', label: 'AWS Bucket Name' },
            {
                label: 'AWS URL', render: (item) => {
                    if (item?.aws_url !== null) {
                        return (
                            <>
                                <a className='text-indigo-400 hover:text-indigo-300' href={item?.aws_url}>
                                    {item?.aws_url}
                                </a>
                            </>
                        )

                    } else {
                        return "N/A";
                    }
                }
            },

            {
                label: 'AWS Setting Status',
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
                <Head title="Settings - AWS Settings" />

                <BreadCrumb
                    header={'Settings - AWS Settings'}
                    parent={'Settings'}
                    parent_link={route('dashboard.settings.index')}
                    child={'AWS Settings'}
                />

                <Card
                    Content={
                        <>
                            <div className="flex flex-wrap justify-end gap-4 my-3">
                                <LinkButton
                                    Text={'Create AWS Setting'}
                                    URL={route('dashboard.settings.aws-settings.create')}
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
                                    'dashboard.settings.aws-settings.destroybyselection'
                                }
                                SingleDeleteRoute={'dashboard.settings.aws-settings.destroy'}
                                EditRoute={'dashboard.settings.aws-settings.edit'}
                                SearchRoute={'dashboard.settings.aws-settings.index'}
                                Search={false}
                                DefaultSearchInput={false}
                                items={aws_settings}
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
