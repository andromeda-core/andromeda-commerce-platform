import Card from '@/Components/Card';
import LinkButton from '@/Components/LinkButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BreadCrumb from '@/Components/BreadCrumb';
import { Head, useForm, usePage } from '@inertiajs/react';
import Table from '@/Components/Table';
import { useEffect, useState } from 'react';
import can from '@/Hooks/useCan';

const StatusBadge = ({ status }) => {
    const map = {
        active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        paused: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
        revoked: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    return (
        <span
            className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${map[status] ?? map.active}`}
        >
            {status?.charAt(0).toUpperCase() + status?.slice(1)}
        </span>
    );
};

const CopyLinkButton = ({ text }) => {
    const [copied, setCopied] = useState(false);
    return (
        <button
            type="button"
            onClick={() => {
                navigator.clipboard.writeText(text);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-white/5"
        >
            {copied ? (
                <>
                    <svg
                        className="h-3.5 w-3.5 text-green-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                        />
                    </svg>
                    Copied
                </>
            ) : (
                <>
                    <svg
                        className="h-3.5 w-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                    </svg>
                    Copy URL
                </>
            )}
        </button>
    );
};

const ConnectionCell = ({ item }) => (
    <div className="flex items-center gap-2 py-1">
        {/* Product */}
        <div className="flex items-center gap-1.5 rounded-lg border border-blue-100 bg-blue-50 px-2.5 py-1.5 dark:border-blue-800/40 dark:bg-blue-900/20">
            <svg
                className="h-3.5 w-3.5 flex-shrink-0 text-blue-500 dark:text-blue-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 18h.01M8 21l4-4 4 4M3 9l9-9 9 9M12 12v6"
                />
            </svg>
            <span className="max-w-[120px] truncate text-xs font-medium text-blue-700 dark:text-blue-300">
                {item.smartphone?.model_searchable_name ?? 'N/A'}
            </span>
        </div>

        {/* Arrow */}
        <svg
            className="h-4 w-4 flex-shrink-0 text-gray-300 dark:text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
            />
        </svg>

        {/* Partner */}
        <div className="flex items-center gap-1.5 rounded-lg border border-violet-100 bg-violet-50 px-2.5 py-1.5 dark:border-violet-800/40 dark:bg-violet-900/20">
            <svg
                className="h-3.5 w-3.5 flex-shrink-0 text-violet-500 dark:text-violet-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
            </svg>
            <span className="max-w-[100px] truncate text-xs font-medium text-violet-700 dark:text-violet-300">
                {item.user?.name ?? 'N/A'}
            </span>
        </div>

        {item.post && (
            <>
                <svg
                    className="h-4 w-4 flex-shrink-0 text-gray-300 dark:text-gray-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                </svg>
                <div className="flex items-center gap-1.5 rounded-lg border border-emerald-100 bg-emerald-50 px-2.5 py-1.5 dark:border-emerald-800/40 dark:bg-emerald-900/20">
                    <svg
                        className="h-3.5 w-3.5 flex-shrink-0 text-emerald-500 dark:text-emerald-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                    </svg>
                    <span className="max-w-[100px] truncate text-xs font-medium text-emerald-700 dark:text-emerald-300">
                        {item.post?.title}
                    </span>
                </div>
            </>
        )}
    </div>
);

export default function Index({ productLinks }) {
    const { props } = usePage();

    const canEdit = can('Attribution Links Edit');
    const canDelete = can('Attribution Links Delete');
    const canCreate = can('Attribution Links Create');

    const {
        data: BulkselectedIds,
        setData: setBulkSelectedIds,
        delete: BulkDelete,
        reset: resetBulkSelectedIds,
    } = useForm({ ids: [] });

    const {
        data: SingleSelectedId,
        setData: setSingleSelectedId,
        delete: SingleDelete,
        reset: resetSingleSelectedId,
    } = useForm({ id: null });

    const [columns, setColumns] = useState([]);
    const [actions, setActions] = useState([]);

    useEffect(() => {
        setColumns([
            {
                label: 'Connection',
                render: (item) => <ConnectionCell item={item} />,
            },
            {
                label: 'Link ID',
                render: (item) => (
                    <span className="font-mono text-xs text-gray-500 dark:text-gray-400">
                        {item.link_public_id}
                    </span>
                ),
            },
            {
                label: 'Status',
                render: (item) => <StatusBadge status={item.status} />,
            },
            {
                label: 'Shareable URL',
                render: (item) => (
                    <CopyLinkButton
                        text={`${window.location.origin}/link/${item.link_public_id}`}
                    />
                ),
            },
            { key: 'added_at', label: 'Created At' },
        ]);

        setActions([
            ...(canEdit
                ? [
                      {
                          label: 'Edit',
                          type: 'link',
                          href: (item) => route('dashboard.attribution-links.edit', item.id),
                      },
                  ]
                : []),
        ]);
    }, [canEdit]);

    return (
        <AuthenticatedLayout>
            <Head title="Attribution Links" />
            <BreadCrumb
                header="Attribution Links"
                parent="Dashboard"
                parent_link={route('dashboard')}
                child="Attribution Links"
            />
            <Card
                Content={
                    <>
                        {canCreate && (
                            <div className="my-3 flex flex-wrap justify-end">
                                <LinkButton
                                    Text="Create Attribution Link"
                                    URL={route('dashboard.attribution-links.create')}
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
                            BulkDeleteRoute="dashboard.attribution-links.destroybyselection"
                            SingleDeleteRoute="dashboard.attribution-links.destroy"
                            DeleteAction={canDelete}
                            canSelect={canDelete}
                            Search={false}
                            items={productLinks}
                            props={props}
                            columns={columns}
                            customActions={actions}
                        />
                    </>
                }
            />
        </AuthenticatedLayout>
    );
}
