import Card from '@/Components/Card';
import LinkButton from '@/Components/LinkButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BreadCrumb from '@/Components/BreadCrumb';
import LinkCopiedModal from '@/Components/LinkCopiedModal';
import { Head, useForm, usePage } from '@inertiajs/react';
import Table from '@/Components/Table';
import { useEffect, useState } from 'react';
import can from '@/Hooks/useCan';

// Mirrors InternalProductVideos/InternalProductImages index pages' copy-to-clipboard helper
// exactly (same fallback for browsers/contexts without navigator.clipboard).
function copyToClipboard(text) {
    if (navigator.clipboard) {
        return navigator.clipboard.writeText(text).catch(() => {
            legacyCopy(text);
        });
    }
    legacyCopy(text);
}

function legacyCopy(text) {
    const el = document.createElement('textarea');
    el.value = text;
    el.style.position = 'fixed';
    el.style.opacity = '0';
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
}

// Shared copy-icon button used by the Public ID / Media URL columns below.
function CopyButton({ onCopy }) {
    return (
        <button
            type="button"
            onClick={onCopy}
            title="Copy"
            className="shrink-0 rounded p-0.5 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-100"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-4"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75"
                />
            </svg>
        </button>
    );
}

export default function index({ adBanners }) {
    const { props } = usePage();

    const [linkCopied, setLinkCopied] = useState(false);
    const handleCopy = (text) => {
        if (!text) return;
        copyToClipboard(text);
        setLinkCopied(true);
    };

    // Bulk Delete Form Data
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
            { key: 'name', label: 'Name' },
            {
                label: 'Public ID',
                render: (item) => (
                    <div className="flex max-w-[220px] items-center gap-1.5">
                        <span className="truncate font-mono text-xs text-gray-600 dark:text-gray-400">
                            {item.public_id}
                        </span>
                        <CopyButton onCopy={() => handleCopy(item.public_id)} />
                    </div>
                ),
            },
            {
                label: 'Media Type',
                render: (item) => (
                    <span
                        className={`rounded-lg p-2 text-sm text-white ${item.media_type === 'video' ? 'bg-purple-500' : 'bg-blue-500'}`}
                    >
                        {item.media_type === 'video' ? 'Video' : 'Image'}
                    </span>
                ),
            },
            {
                label: 'Upload Status',
                render: (item) => (
                    <span
                        className={`rounded-lg p-2 text-sm text-white ${
                            item.upload_status === 'completed'
                                ? 'bg-green-500'
                                : item.upload_status === 'failed'
                                  ? 'bg-red-500'
                                  : 'bg-yellow-500'
                        }`}
                    >
                        {item.upload_status}
                    </span>
                ),
            },
            {
                label: 'Redirect URL',
                render: (item) => (
                    <a
                        href={item.redirect_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 underline break-all"
                    >
                        {item.redirect_url}
                    </a>
                ),
            },
            {
                label: 'Media URL',
                render: (item) =>
                    item.file_url ? (
                        <div className="flex max-w-[220px] items-center gap-1.5">
                            <span className="truncate text-xs text-gray-600 dark:text-gray-400">
                                {item.file_url}
                            </span>
                            <CopyButton onCopy={() => handleCopy(item.file_url)} />
                        </div>
                    ) : (
                        <span className="text-xs text-gray-400">—</span>
                    ),
            },
            {
                label: 'Created At',
                render: (item) =>
                    item?.created_at
                        ? new Date(item.created_at).toLocaleDateString('en-US')
                        : '',
            },
        ];

        setColumns(columns);
    }, []);

    return (
        <>
            <AuthenticatedLayout>
                <Head title="Ad Banners" />

                <BreadCrumb
                    header={'Ad Banners'}
                    parent={'Dashboard'}
                    parent_link={route('dashboard')}
                    child={'Ad Banners'}
                />

                <LinkCopiedModal
                    linkCopied={linkCopied}
                    setLinkCopied={setLinkCopied}
                    message="Copied!"
                />

                <Card
                    Content={
                        <>
                            {can('Ad Banners Create') && (
                                <div className="flex flex-wrap justify-end my-3">
                                    <LinkButton
                                        Text={'Create Ad Banner'}
                                        URL={route('dashboard.ad-banners.create')}
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
                                BulkDeleteRoute={'dashboard.ad-banners.destroybyselection'}
                                SingleDeleteRoute={'dashboard.ad-banners.destroy'}
                                EditRoute={can('Ad Banners Edit') ? 'dashboard.ad-banners.edit' : null}
                                SearchRoute={'dashboard.ad-banners.index'}
                                Search={true}
                                DefaultSearchInput={true}
                                items={adBanners}
                                props={props}
                                columns={columns}
                                DeleteAction={can('Ad Banners Delete')}
                                canSelect={can('Ad Banners Delete')}
                            />
                        </>
                    }
                />
            </AuthenticatedLayout>
        </>
    );
}
