import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BreadCrumb from '@/Components/BreadCrumb';
import Card from '@/Components/Card';
import LinkButton from '@/Components/LinkButton';
import Spinner from '@/Components/Spinner';
import ConfirmationModal from '@/Components/ConfirmationModal';
import LinkCopiedModal from '@/Components/LinkCopiedModal';
import can from '@/Hooks/useCan';
import { Head, router, usePage } from '@inertiajs/react';
import React, { useEffect, useRef, useState } from 'react';
import debounce from 'lodash.debounce';

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

export default function index({ videos, search, folder, folders }) {
    const { props } = usePage();

    const [searchInput, setSearchInput] = useState(search ?? '');
    const [folderFilter, setFolderFilter] = useState(folder ?? '');

    const [selectedIds, setSelectedIds] = useState([]);
    const [linkCopied, setLinkCopied] = useState(false);

    // Single delete confirmation
    const [deleteSingleOpen, setDeleteSingleOpen] = useState(false);
    const [deleteSingleId, setDeleteSingleId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    // Bulk delete confirmation
    const [deleteBulkOpen, setDeleteBulkOpen] = useState(false);
    const [deleteBulkProcessing, setDeleteBulkProcessing] = useState(false);

    // Auto-refresh when any visible video is still pending
    const hasPending = videos.data.some((video) => video.upload_status === 'pending');
    const pollRef = useRef(null);

    useEffect(() => {
        if (hasPending) {
            pollRef.current = setTimeout(() => {
                router.reload({ only: ['videos'] });
            }, 5000);
        }
        return () => clearTimeout(pollRef.current);
    }, [hasPending, videos.data]);

    const debouncedSearch = useRef(
        debounce((value) => {
            router.get(
                route('dashboard.internal-product-videos.index'),
                { search: value || undefined, folder: folderFilter || undefined },
                { preserveState: true, replace: true },
            );
        }, 600),
    ).current;

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchInput(value);
        debouncedSearch(value);
    };

    const handleFolderFilterChange = (e) => {
        const value = e.target.value;
        setFolderFilter(value);
        router.get(
            route('dashboard.internal-product-videos.index'),
            { search: searchInput || undefined, folder: value || undefined },
            { preserveState: true, replace: true },
        );
    };

    const toggleSelect = (id) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
        );
    };

    // Only completed/failed rows may be selected for deletion. Pending rows are still uploading to
    // S3, so deleting one now would drop the DB row while the queued Job later completes, leaving an
    // orphaned file on S3 with no DB row.
    const selectableIds = videos.data
        .filter((video) => video.upload_status !== 'pending')
        .map((video) => video.id);

    const toggleSelectAll = () => {
        if (selectableIds.length > 0 && selectedIds.length === selectableIds.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(selectableIds);
        }
    };

    const openDeleteSingle = (id) => {
        setDeleteSingleId(id);
        setDeleteSingleOpen(true);
    };

    const confirmDeleteSingle = () => {
        if (!deleteSingleId) return;
        setDeletingId(deleteSingleId);
        router.delete(route('dashboard.internal-product-videos.destroy', deleteSingleId), {
            onSuccess: () => {
                setDeletingId(null);
                setDeleteSingleOpen(false);
                setDeleteSingleId(null);
                setSelectedIds((prev) => prev.filter((x) => x !== deleteSingleId));
            },
            onError: () => setDeletingId(null),
        });
    };

    const confirmDeleteBulk = () => {
        setDeleteBulkProcessing(true);
        // Defensive: never send pending (still-uploading) ids to the backend, to avoid orphaned S3 files.
        const deletableIds = selectedIds.filter((id) => selectableIds.includes(id));
        router.delete(route('dashboard.internal-product-videos.destroybyselection'), {
            data: { ids: deletableIds },
            onSuccess: () => {
                setDeleteBulkProcessing(false);
                setDeleteBulkOpen(false);
                setSelectedIds([]);
            },
            onError: () => setDeleteBulkProcessing(false),
        });
    };

    const handleCopy = (url) => {
        copyToClipboard(url);
        setLinkCopied(true);
    };

    return (
        <>
            <AuthenticatedLayout>
                <Head title="Internal Product Videos" />

                <BreadCrumb
                    header={'Internal Product Videos'}
                    parent={'Dashboard'}
                    parent_link={route('dashboard')}
                    child={'Product Videos'}
                />

                <LinkCopiedModal
                    linkCopied={linkCopied}
                    setLinkCopied={setLinkCopied}
                    message="URL copied!"
                />

                <ConfirmationModal
                    isOpen={deleteSingleOpen}
                    onClose={() => {
                        setDeleteSingleOpen(false);
                        setDeleteSingleId(null);
                    }}
                    title="Delete Video?"
                    message="This video will be removed from the database and scheduled for deletion from S3. This cannot be undone."
                    confirmText={deletingId !== null ? 'Deleting…' : 'Delete'}
                    cancelText="Cancel"
                    promiseResolve={(confirmed) => {
                        if (confirmed) confirmDeleteSingle();
                    }}
                />

                <ConfirmationModal
                    isOpen={deleteBulkOpen}
                    onClose={() => setDeleteBulkOpen(false)}
                    title={`Delete ${selectedIds.length} Video(s)?`}
                    message="All selected videos will be removed. This cannot be undone."
                    confirmText={deleteBulkProcessing ? 'Deleting…' : 'Delete All'}
                    cancelText="Cancel"
                    promiseResolve={(confirmed) => {
                        if (confirmed) confirmDeleteBulk();
                    }}
                />

                <Card
                    Content={
                        <>
                            {/* Toolbar */}
                            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                                <div className="flex flex-wrap items-center gap-2">
                                    {/* Search */}
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={searchInput}
                                            onChange={handleSearchChange}
                                            placeholder="Search by filename…"
                                            className="dark:bg-dark-900 shadow-theme-xs focus:ring-3 focus:outline-hidden rounded-lg border border-gray-300 bg-transparent py-2 pl-9 pr-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-blue-300 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-deepcharcoal dark:text-white/90 dark:placeholder:text-white/30"
                                        />
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={1.5}
                                            stroke="currentColor"
                                            className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-gray-400"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                                            />
                                        </svg>
                                    </div>

                                    {/* Folder filter */}
                                    <select
                                        value={folderFilter}
                                        onChange={handleFolderFilterChange}
                                        className="dark:bg-dark-900 shadow-theme-xs focus:ring-3 focus:outline-hidden rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm text-gray-800 focus:border-blue-300 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-deepcharcoal dark:text-white/90"
                                    >
                                        <option value="">All Folders</option>
                                        {(folders ?? []).map((f) => (
                                            <option key={f} value={f}>
                                                {f}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex flex-wrap items-center justify-end gap-3">
                                    {/* Bulk delete */}
                                    {can('Internal Product Videos Delete') && selectedIds.length > 0 && (
                                        <button
                                            onClick={() => setDeleteBulkOpen(true)}
                                            disabled={deleteBulkProcessing}
                                            className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-70"
                                        >
                                            {deleteBulkProcessing ? (
                                                <Spinner customSize="h-4 w-4" Color="fill-white text-red-300" />
                                            ) : (
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
                                                        d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                                                    />
                                                </svg>
                                            )}
                                            Delete Selected ({selectedIds.length})
                                        </button>
                                    )}

                                    {/* Select all toggle */}
                                    {can('Internal Product Videos Delete') && videos.data.length > 0 && (
                                        <button
                                            onClick={toggleSelectAll}
                                            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                                        >
                                            {selectableIds.length > 0 && selectedIds.length === selectableIds.length
                                                ? 'Deselect All'
                                                : 'Select All'}
                                        </button>
                                    )}

                                    {/* Upload button */}
                                    {can('Internal Product Videos Create') && (
                                        <LinkButton
                                            Text={'Upload Videos'}
                                            URL={route('dashboard.internal-product-videos.create')}
                                            Icon={
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    strokeWidth={1.5}
                                                    stroke="currentColor"
                                                    className="size-5"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
                                                    />
                                                </svg>
                                            }
                                        />
                                    )}
                                </div>
                            </div>

                            {/* Empty state */}
                            {videos.data.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-16 text-center">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={1}
                                        stroke="currentColor"
                                        className="mb-4 size-16 text-gray-300 dark:text-gray-700"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"
                                        />
                                    </svg>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        No videos found.
                                    </p>
                                </div>
                            )}

                            {/* Card grid */}
                            {videos.data.length > 0 && (
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                    {videos.data.map((video) => (
                                        <VideoCard
                                            key={video.id}
                                            video={video}
                                            isSelected={selectedIds.includes(video.id)}
                                            onToggleSelect={() => toggleSelect(video.id)}
                                            onCopy={() => handleCopy(video.file_url)}
                                            onDelete={() => openDeleteSingle(video.id)}
                                            canDelete={can('Internal Product Videos Delete')}
                                            isDeleting={deletingId === video.id}
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Pagination */}
                            {videos.last_page > 1 && (
                                <div className="mt-6 flex flex-wrap items-center justify-center gap-1">
                                    {videos.links.map((link, i) => (
                                        <button
                                            key={i}
                                            disabled={!link.url}
                                            onClick={() => link.url && router.get(link.url)}
                                            className={`min-w-[36px] rounded-md px-3 py-1.5 text-sm font-medium transition-colors
                                                ${link.active
                                                    ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                                                    : link.url
                                                        ? 'border border-gray-300 bg-transparent text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800'
                                                        : 'cursor-not-allowed border border-gray-200 bg-transparent text-gray-400 dark:border-gray-800 dark:text-gray-600'
                                                }`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            )}
                        </>
                    }
                />
            </AuthenticatedLayout>
        </>
    );
}

function VideoCard({ video, isSelected, onToggleSelect, onCopy, onDelete, canDelete, isDeleting }) {
    const isPending = video.upload_status === 'pending';
    const isFailed = video.upload_status === 'failed';
    const isCompleted = video.upload_status === 'completed';

    return (
        <div
            className={`relative flex flex-col overflow-hidden rounded-xl border transition-all
                ${isSelected
                    ? 'border-blue-500 ring-2 ring-blue-500/30 dark:border-blue-400'
                    : 'border-gray-200 dark:border-gray-700'
                }
                bg-white dark:bg-deepcharcoal`}
        >
            {/* Thumbnail */}
            <div className="relative h-44 overflow-hidden bg-gray-100 dark:bg-gray-800">
                {isCompleted && video.file_url ? (
                    <video
                        src={video.file_url}
                        controls
                        muted
                        preload="metadata"
                        className="h-full w-full object-cover"
                    />
                ) : isPending ? (
                    <div className="flex h-full flex-col items-center justify-center gap-2">
                        {/* Use the project's own Spinner component for the pending state so it matches
                            the rest of the app (old inline SVG spinner kept commented below). */}
                        <Spinner
                            customSize="h-8 w-8"
                            Color="fill-blue-500 text-blue-200 dark:fill-blue-400 dark:text-blue-800"
                        />
                        {/* <svg
                            className="size-8 animate-spin text-blue-400"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            />
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8v8H4z"
                            />
                        </svg> */}
                        <span className="text-xs font-medium text-blue-500">Processing…</span>
                    </div>
                ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-2">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="size-8 text-red-400"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                            />
                        </svg>
                        <span className="text-xs font-medium text-red-500">Upload Failed</span>
                    </div>
                )}

                {/* Selection checkbox */}
                {canDelete && (
                    <div className="absolute left-2 top-2">
                        <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={onToggleSelect}
                            disabled={isPending}
                            title={isPending ? 'Cannot select while uploading' : undefined}
                            className={`size-4 rounded border-gray-300 accent-blue-600 ${isPending ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                        />
                    </div>
                )}
            </div>

            {/* Card body */}
            <div className="flex flex-1 flex-col gap-2 p-3">
                {/* Original name */}
                <p
                    className="truncate text-sm font-medium text-gray-900 dark:text-white"
                    title={video.original_name}
                >
                    {video.original_name}
                </p>

                {/* Folder badge */}
                <span className="inline-flex w-fit items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                    {video.folder}
                </span>

                {/* Meta */}
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>{video.human_size ?? '—'}</span>
                    <span>{video.created_at_formatted ?? '—'}</span>
                </div>

                {/* URL row */}
                {isCompleted && video.file_url && (
                    <div className="flex items-center gap-1.5 rounded-md border border-gray-200 bg-gray-50 px-2 py-1.5 dark:border-gray-700 dark:bg-gray-800">
                        <p className="flex-1 truncate text-xs text-gray-600 dark:text-gray-400">
                            {video.file_url}
                        </p>
                        <button
                            type="button"
                            onClick={onCopy}
                            title="Copy URL"
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
                    </div>
                )}

                {/* Delete button */}
                {canDelete && (
                    <button
                        type="button"
                        onClick={onDelete}
                        disabled={isDeleting || isPending}
                        title={isPending ? 'Cannot delete while uploading' : undefined}
                        className="mt-auto inline-flex items-center justify-center gap-1.5 rounded-md border border-red-200 bg-transparent px-2 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-70 disabled:cursor-not-allowed dark:border-red-900 dark:text-red-400 dark:hover:bg-red-900/20"
                    >
                        {isDeleting ? (
                            <Spinner customSize="h-3.5 w-3.5" Color="fill-red-600 text-red-200 dark:fill-red-400 dark:text-red-800" />
                        ) : (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="size-3.5"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                                />
                            </svg>
                        )}
                        {isDeleting ? 'Deleting…' : 'Delete'}
                    </button>
                )}
            </div>
        </div>
    );
}
