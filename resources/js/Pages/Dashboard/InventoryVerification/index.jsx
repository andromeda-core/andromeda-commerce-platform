import Card from '@/Components/Card';
import LinkButton from '@/Components/LinkButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BreadCrumb from '@/Components/BreadCrumb';
import { Head, usePage } from '@inertiajs/react';
import Table from '@/Components/Table';
import { useEffect, useState } from 'react';

export default function index({ inventory_verifications }) {
    // Bulk Delete Form Data
    const { props } = usePage();
    const [columns, setColumns] = useState([]);

    useEffect(() => {
        const columns = [
            { key: 'verified_by.name', label: 'Verified By Name' },
            { key: 'verified_by.email', label: 'Verified By Email' },
            { key: 'verified_by.phone', label: 'Verified By Phone' },

            {
                label: 'Barcode Photo',
                render: (item) =>
                    item?.barcode_photo ? (
                        <a
                            href={item.barcode_photo}
                            target="_blank"
                            className="text-sm text-violet-600 hover:underline"
                        >
                            View Photo
                        </a>
                    ) : (
                        <span className="text-sm text-gray-800 dark:text-white/60">N/A</span>
                    ),
            },
            {
                label: 'Screen Recording',
                render: (item) =>
                    item?.screen_recording_video ? (
                        <a
                            href={item.screen_recording_video}
                            target="_blank"
                            className="text-sm text-blue-500 hover:underline"
                        >
                            View Video
                        </a>
                    ) : (
                        <span className="text-sm text-gray-800 dark:text-white/60">N/A</span>
                    ),
            },
            {
                label: 'Scene Video',
                render: (item) =>
                    item?.scene_video ? (
                        <a
                            href={item.scene_video}
                            target="_blank"
                            className="text-sm text-green-600 hover:underline"
                        >
                            View Video
                        </a>
                    ) : (
                        <span className="text-sm text-gray-800 dark:text-white/60">N/A</span>
                    ),
            },

            {
                key: 'scanned_code',
                label: 'Scanned Code',
            },

            {
                key: 'verified_at',
                label: 'Verified At',
            },
        ];

        setColumns(columns);
    }, []);

    return (
        <>
            <AuthenticatedLayout>
                <Head title="Inventory Verifications" />

                <BreadCrumb
                    header={'Inventory Verifications'}
                    parent={'Dashboard'}
                    parent_link={route('dashboard')}
                    child={'Inventory Verifications'}
                />

                <Card
                    Content={
                        <>
                            <div className="my-3 flex flex-wrap justify-end">
                                <LinkButton
                                    Text={'Verify Inventory'}
                                    URL={route('dashboard.inventory-verifications.create')}
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

                            <Table
                                EditRoute={null}
                                // SearchRoute={'dashboard.distributors.index'}
                                Search={false}
                                DefaultSearchInput={false}
                                items={inventory_verifications}
                                props={props}
                                columns={columns}
                                DeleteAction={false}
                                canSelect={false}
                            />
                        </>
                    }
                />
            </AuthenticatedLayout>
        </>
    );
}
