import Card from '@/Components/Card';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BreadCrumb from '@/Components/BreadCrumb';
import { Head, Link, usePage } from '@inertiajs/react';
import Table from '@/Components/Table';
import { useEffect, useState } from 'react';

export default function Index({ system_logs }) {

    const { props } = usePage();
    const [columns, setColumns] = useState([]);
    const [previewMessage, setPreviewMessage] = useState(null);

    const truncate = (text, limit = 90) => {
        if (!text) return '';
        return text.length > limit ? text.slice(0, limit) + '...' : text;
    };

    useEffect(() => {
        setColumns([
            { key: 'user.name', label: 'Customer Name' },
            { key: 'user.email', label: 'Customer Email' },
            { key: 'user.phone', label: 'Customer Phone' },

            {
                key: 'order',
                label: 'Order(s)',
                render: (row) => {
                    // Case 1: Single order via relation
                    if (row?.unsettled_account?.order_id && row?.unsettled_account?.order?.order_no) {
                        return (
                            <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded
                    bg-indigo-100 text-indigo-700
                    dark:bg-indigo-900/30 dark:text-indigo-300">
                                <Link className='hover:underline' href={route('dashboard.orders.show.by_order_no', row?.unsettled_account?.order?.order_no)}>
                                    {row?.unsettled_account?.order?.order_no}
                                </Link>
                            </span>
                        );
                    }

                    // Case 2: Multiple orders via meta
                    if (
                        !row?.unsettled_account?.order_id &&
                        row?.unsettled_account?.meta?.order_nos &&
                        Array.isArray(row?.unsettled_account?.meta?.order_nos)
                    ) {
                        return (
                            <div className="flex flex-wrap gap-1 max-w-[260px]">
                                {row?.unsettled_account?.meta?.order_nos.map((orderNo, index) => (
                                    <span
                                        key={index}
                                        className="inline-flex px-2 py-0.5 text-xs font-medium rounded
                                bg-gray-100 text-gray-700
                                dark:bg-gray-800 dark:text-gray-300"
                                    >
                                        <Link className='hover:underline' href={route('dashboard.orders.show.by_order_no', orderNo)}>
                                            {orderNo}
                                        </Link>
                                    </span>
                                ))}
                            </div>
                        );
                    }

                    // Fallback
                    return (
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                            —
                        </span>
                    );
                },
            },

            {
                label: 'Reason',
                render: (row) => (
                    <span className="text-xs font-semibold text-gray-700 uppercase dark:text-gray-300">
                        {row?.unsettled_account.reason?.replace(/_/g, ' ')}
                    </span>
                ),
            },

            {
                key: 'channel',
                label: 'Channel',
                render: (row) => (
                    <span className="text-xs font-semibold text-gray-700 uppercase dark:text-gray-300">
                        {row.channel.replace('_', ' ')}
                    </span>
                ),
            },

            {
                key: 'message',
                label: 'Message',
                render: (row) => (
                    <div className="flex items-start gap-2 max-w-[420px]">
                        <span className="text-sm leading-relaxed text-gray-800 dark:text-gray-200">
                            {truncate(row.message)}

                            {row.message?.length > 90 && (
                                <button
                                    onClick={() => setPreviewMessage(row.message)}
                                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline whitespace-nowrap"
                                >
                                    View More
                                </button>
                            )}
                        </span>


                    </div>
                ),
            },

            {
                key: 'is_system_sent',
                label: 'Sent By',
                render: (row) => (
                    row.is_system_sent ? (
                        <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full
                            bg-blue-100 text-blue-700
                            dark:bg-blue-900/30 dark:text-blue-300">
                            System
                        </span>
                    ) : (
                        <span className="inline-flex px-2 py-0.5 text-xs truncate break-all  font-medium rounded-full
                            bg-green-100 text-green-700
                            dark:bg-green-900/30 dark:text-green-300 ">
                            {row?.sent_by?.name} <br />
                            {row?.sent_by?.email}
                        </span>
                    )
                ),
            },

            {
                key: 'sent_at',
                label: 'Sent At',
            },
        ]);
    }, []);

    return (
        <AuthenticatedLayout>
            <Head title="Unsettled Account Notification Logs" />

            <BreadCrumb
                header={'Unsettled Account Notification Logs'}
                parent={'System Logs'}
                parent_link={route('dashboard.system-logs.index')}
                child={'Notification Logs'}
            />

            <Card
                Content={
                    <>
                        <Table
                            DeleteAction={false}
                            SearchRoute={'dashboard.system-logs.unsettled-account-notification-logs.index'}
                            Search={true}
                            DefaultSearchInput={true}
                            items={system_logs}
                            props={props}
                            columns={columns}
                            canSelect={false}
                        />

                        {/* MESSAGE PREVIEW MODAL */}
                        {previewMessage && (
                            <div
                                className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
                                onClick={() => setPreviewMessage(null)} // overlay click
                            >
                                <div
                                    className="w-full max-w-2xl p-5 bg-white rounded-lg shadow-xl max-h-[70vh] overflow-auto dark:bg-zinc-900"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <h3 className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-200">
                                        Notification Message
                                    </h3>

                                    <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                                        {previewMessage}
                                    </p>

                                    <div className="flex justify-end mt-4">
                                        <button
                                            onClick={() => setPreviewMessage(null)}
                                            className="px-4 py-2 text-sm text-white bg-indigo-600 rounded hover:bg-indigo-700"
                                        >
                                            Close
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                }
            />
        </AuthenticatedLayout>
    );
}
