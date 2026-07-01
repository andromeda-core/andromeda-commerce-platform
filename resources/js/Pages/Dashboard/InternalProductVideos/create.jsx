import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BreadCrumb from '@/Components/BreadCrumb';
import Card from '@/Components/Card';
import LinkButton from '@/Components/LinkButton';
import PrimaryButton from '@/Components/PrimaryButton';
import CustomFileUploader from '@/Components/CustomFileUploader';
import { Head, router } from '@inertiajs/react';
import axios from 'axios';
import React, { useState } from 'react';

export default function create({ folders: initialFolders = [] }) {
    const [folders, setFolders] = useState(initialFolders);

    const [selectedFolder, setSelectedFolder] = useState(initialFolders[0] ?? '');
    const [newFolderName, setNewFolderName] = useState('');
    const [showNewFolderInput, setShowNewFolderInput] = useState(false);
    const [creatingFolder, setCreatingFolder] = useState(false);
    const [folderError, setFolderError] = useState('');

    // Each slot: { id, file, preview }
    const [videoSlots, setVideoSlots] = useState([{ id: 0, file: null, preview: null }]);
    const [submitting, setSubmitting] = useState(false);
    const [submitErrors, setSubmitErrors] = useState({});

    const handleFileSelect = (index, file) => {
        const updated = [...videoSlots];
        updated[index] = { ...updated[index], file, preview: URL.createObjectURL(file) };
        setVideoSlots(updated);
    };

    const handleFileRemove = (index) => {
        const updated = videoSlots.filter((_, i) => i !== index);
        setVideoSlots(updated.length > 0 ? updated : [{ id: Date.now(), file: null, preview: null }]);
    };

    const addSlot = () => {
        setVideoSlots([...videoSlots, { id: Date.now(), file: null, preview: null }]);
    };

    const allSlotsFilled = videoSlots.length > 0 && videoSlots.every((s) => s.file !== null);

    const handleCreateFolder = async (e) => {
        e.preventDefault();
        setFolderError('');

        if (!/^[a-zA-Z0-9-]+$/.test(newFolderName)) {
            setFolderError('Folder name may only contain letters, numbers, and hyphens.');
            return;
        }

        setCreatingFolder(true);
        try {
            const res = await axios.post(route('dashboard.internal-product-videos.store-folder'), {
                folder_name: newFolderName,
            });
            const data = res.data;
            if (data.status) {
                setFolders(data.folders ?? []);
                setSelectedFolder(data.new_folder ?? '');
                setShowNewFolderInput(false);
                setNewFolderName('');
            } else {
                setFolderError(data.message ?? 'Failed to create folder.');
            }
        } catch (err) {
            const validationErrors = err.response?.data?.errors;
            setFolderError(
                validationErrors?.folder_name?.[0] ??
                err.response?.data?.message ??
                'Failed to create folder.',
            );
        } finally {
            setCreatingFolder(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitErrors({});

        const files = videoSlots.map((s) => s.file).filter(Boolean);

        if (!selectedFolder) {
            setSubmitErrors({ folder: 'Please select a folder.' });
            return;
        }

        if (files.length === 0) {
            setSubmitErrors({ videos: 'Please select at least one video.' });
            return;
        }

        setSubmitting(true);
        router.post(
            route('dashboard.internal-product-videos.store'),
            { folder: selectedFolder, videos: files },
            {
                forceFormData: true,
                onSuccess: () => setSubmitting(false),
                onError: (errors) => {
                    setSubmitting(false);
                    setSubmitErrors(errors);
                },
            },
        );
    };

    return (
        <>
            <AuthenticatedLayout>
                <Head title="Upload Product Videos" />

                <BreadCrumb
                    header={'Upload Product Videos'}
                    parent={'Product Videos'}
                    parent_link={route('dashboard.internal-product-videos.index')}
                    child={'Upload'}
                />

                <Card
                    Content={
                        <>
                            <div className="my-3 flex flex-wrap justify-end">
                                <LinkButton
                                    Text={'Back To Product Videos'}
                                    URL={route('dashboard.internal-product-videos.index')}
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

                            <form onSubmit={handleSubmit}>
                                <Card
                                    Content={
                                        <>
                                            {/* Folder Selector */}
                                            <div className="mb-6">
                                                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                                                    Destination Folder{' '}
                                                    <span className="text-red-500">*</span>
                                                </label>

                                                <div className="flex flex-wrap items-center gap-3">
                                                    <select
                                                        value={selectedFolder}
                                                        onChange={(e) => setSelectedFolder(e.target.value)}
                                                        className="dark:bg-dark-900 shadow-theme-xs focus:ring-3 focus:outline-hidden min-w-[200px] rounded-lg border border-gray-300 bg-transparent px-3 py-2.5 text-sm text-gray-800 focus:border-blue-300 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-deepcharcoal dark:text-white/90"
                                                    >
                                                        {folders.length === 0 && (
                                                            <option value="">No folders — create one below</option>
                                                        )}
                                                        {folders.map((f) => (
                                                            <option key={f} value={f}>
                                                                {f}
                                                            </option>
                                                        ))}
                                                    </select>

                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setShowNewFolderInput(!showNewFolderInput);
                                                            setFolderError('');
                                                            setNewFolderName('');
                                                        }}
                                                        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-transparent px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
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
                                                                d="M12 4.5v15m7.5-7.5h-15"
                                                            />
                                                        </svg>
                                                        New Folder
                                                    </button>
                                                </div>

                                                {submitErrors.folder && (
                                                    <span className="ml-1 mt-1 block text-sm text-red-500">
                                                        {submitErrors.folder}
                                                    </span>
                                                )}

                                                {/* New folder inline form */}
                                                {showNewFolderInput && (
                                                    <div className="mt-3 flex flex-wrap items-center gap-2">
                                                        <input
                                                            type="text"
                                                            value={newFolderName}
                                                            onChange={(e) => setNewFolderName(e.target.value)}
                                                            placeholder="e.g. samsung-galaxy"
                                                            className="dark:bg-dark-900 shadow-theme-xs focus:ring-3 focus:outline-hidden rounded-lg border border-gray-300 bg-transparent px-3 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-blue-300 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-deepcharcoal dark:text-white/90 dark:placeholder:text-white/30"
                                                        />
                                                        <button
                                                            type="button"
                                                            disabled={creatingFolder || newFolderName.trim() === ''}
                                                            onClick={handleCreateFolder}
                                                            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                                                        >
                                                            {creatingFolder ? 'Creating…' : 'Create Folder'}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setShowNewFolderInput(false);
                                                                setFolderError('');
                                                            }}
                                                            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                                        >
                                                            Cancel
                                                        </button>
                                                        {folderError && (
                                                            <span className="w-full text-sm text-red-500">
                                                                {folderError}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Video Uploaders */}
                                            <div className="mb-4">
                                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-400">
                                                    Videos{' '}
                                                    <span className="text-red-500">*</span>
                                                </label>

                                                <div className={`grid grid-cols-1 gap-4${videoSlots.length > 1 ? ' sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : ''}`}>
                                                    {videoSlots.map((slot, index) => (
                                                        <CustomFileUploader
                                                            key={slot.id}
                                                            accept="video/*"
                                                            maxSize={1024 * 1024 * 1024}
                                                            preview={slot.preview}
                                                            fileName={slot.file?.name ?? null}
                                                            fileSize={slot.file?.size ?? null}
                                                            uploadButtonText="Click to select a video"
                                                            onFileSelect={(file) => handleFileSelect(index, file)}
                                                            onFileRemove={() => handleFileRemove(index)}
                                                        />
                                                    ))}
                                                </div>

                                                {submitErrors.videos && (
                                                    <span className="mt-1 block text-sm text-red-500">
                                                        {submitErrors.videos}
                                                    </span>
                                                )}
                                                {submitErrors['videos.0'] && (
                                                    <span className="mt-1 block text-sm text-red-500">
                                                        {submitErrors['videos.0']}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Add More + Submit */}
                                            <div className="flex flex-wrap items-center gap-3">
                                                {allSlotsFilled && videoSlots.length < 20 && (
                                                    <button
                                                        type="button"
                                                        onClick={addSlot}
                                                        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-transparent px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
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
                                                                d="M12 4.5v15m7.5-7.5h-15"
                                                            />
                                                        </svg>
                                                        Add More Videos
                                                    </button>
                                                )}

                                                <PrimaryButton
                                                    Text={`Upload ${videoSlots.filter((s) => s.file).length > 0 ? videoSlots.filter((s) => s.file).length + ' Video(s)' : 'Videos'}`}
                                                    Type={'submit'}
                                                    CustomClass={'w-[220px]'}
                                                    Disabled={
                                                        submitting ||
                                                        !selectedFolder ||
                                                        videoSlots.every((s) => s.file === null)
                                                    }
                                                    Spinner={submitting}
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
                                                                d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
                                                            />
                                                        </svg>
                                                    }
                                                />
                                            </div>
                                        </>
                                    }
                                />
                            </form>
                        </>
                    }
                />
            </AuthenticatedLayout>
        </>
    );
}
