import { useEffect } from 'react';
import FileUploaderInput from '@/Components/FileUploaderInput';

// Module-scope (not defined inside render) so cards don't needlessly remount.
function ExistingMediaCard({ media, isImage, isMain, pendingRemoval, onToggleDelete, onMakeMain }) {
    const preview = media.type === 'video' ? media.thumbnail_url : media.file_url;

    return (
        <div
            className={`overflow-hidden rounded-lg border dark:border-gray-700 ${pendingRemoval ? 'opacity-40 ring-2 ring-red-500' : 'border-gray-200'}`}
        >
            <div className="flex gap-3 p-3">
                <div className="relative h-20 w-28 shrink-0">
                    {preview ? (
                        <img src={preview} alt={'media'} className="h-20 w-28 rounded object-cover" />
                    ) : (
                        <div className="flex h-20 w-28 items-center justify-center rounded bg-gray-100 text-xs text-gray-500 dark:bg-white/5">
                            {media.type === 'video' ? 'Video' : 'Image'}
                        </div>
                    )}
                    {isMain && (
                        <span className="absolute left-1 top-1 rounded bg-blue-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                            Main Image
                        </span>
                    )}
                </div>
                <div className="flex flex-1 flex-col items-start justify-between gap-2">
                    <span className="text-xs capitalize text-gray-500">
                        {media.type} · {media.upload_status}
                    </span>
                    <div className="flex items-center gap-3">
                        {isImage && !pendingRemoval && !isMain && (
                            <button
                                type="button"
                                onClick={onMakeMain}
                                className="text-xs font-medium text-blue-600 dark:text-blue-400"
                            >
                                Make Main
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={onToggleDelete}
                            className={`text-xs font-medium ${pendingRemoval ? 'text-blue-500' : 'text-red-500'}`}
                        >
                            {pendingRemoval ? 'Undo' : 'Remove'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function MediaSection({ mode, data, setData, errors, existingMedia = [] }) {
    const isEdit = mode === 'edit';
    const imageKey = isEdit ? 'new_images' : 'images';
    const videoKey = isEdit ? 'new_videos' : 'videos';

    const deletedIds = data.deleted_media_ids ?? [];
    const toggleDelete = (id) => {
        setData(
            'deleted_media_ids',
            deletedIds.includes(id) ? deletedIds.filter((x) => x !== id) : [...deletedIds, id],
        );
    };

    // New uploads: keep only the freshly added File objects, in pond order. The first image
    // is the main image (matches the smartphone uploader + the repository sort_order logic).
    const onNewFiles = (fileKey) => (files) => {
        if (files.length > 0) {
            const newFiles = files.filter((f) => f.isNew).map((f) => f.file);
            setData(fileKey, newFiles);
        } else {
            setData(fileKey, []);
        }
    };

    const existingImages = existingMedia.filter((m) => m.type === 'image');
    const existingVideos = existingMedia.filter((m) => m.type !== 'image');

    // Seed the editable image order once (edit mode) from the order the images arrive in
    // (already sort_order from the backend). Persists on submit as `existing_image_order`.
    useEffect(() => {
        if (isEdit && data.existing_image_order === undefined) {
            setData(
                'existing_image_order',
                existingImages.map((m) => m.id),
            );
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const imageOrder = data.existing_image_order ?? existingImages.map((m) => m.id);
    const orderedImages = imageOrder
        .map((id) => existingImages.find((m) => m.id === id))
        .filter(Boolean);

    // The first still-kept image is the main image.
    const firstKeptImageId = orderedImages.find((m) => !deletedIds.includes(m.id))?.id;

    const makeMain = (id) => {
        const current = data.existing_image_order ?? existingImages.map((m) => m.id);
        setData('existing_image_order', [id, ...current.filter((x) => x !== id)]);
    };

    return (
        <div className="mt-8">
            <h3 className="mb-3 text-lg font-semibold text-main-text-light dark:text-main-text-dark">
                Media
            </h3>

            {isEdit && existingImages.length > 0 && (
                <div className="mb-6">
                    <p className="mb-2 text-sm font-medium text-main-text-light dark:text-main-text-dark">
                        Existing Images{' '}
                        <span className="text-xs font-normal text-gray-400">
                            (the first image is the main image — use “Make Main” to change it)
                        </span>
                    </p>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {orderedImages.map((media) => (
                            <ExistingMediaCard
                                key={media.id}
                                media={media}
                                isImage={true}
                                isMain={media.id === firstKeptImageId}
                                pendingRemoval={deletedIds.includes(media.id)}
                                onToggleDelete={() => toggleDelete(media.id)}
                                onMakeMain={() => makeMain(media.id)}
                            />
                        ))}
                    </div>
                </div>
            )}

            {isEdit && existingVideos.length > 0 && (
                <div className="mb-6">
                    <p className="mb-2 text-sm font-medium text-main-text-light dark:text-main-text-dark">
                        Existing Videos
                    </p>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {existingVideos.map((media) => (
                            <ExistingMediaCard
                                key={media.id}
                                media={media}
                                isImage={false}
                                isMain={false}
                                pendingRemoval={deletedIds.includes(media.id)}
                                onToggleDelete={() => toggleDelete(media.id)}
                            />
                        ))}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 gap-6">
                <FileUploaderInput
                    InputName={isEdit ? 'Add Images' : 'Images'}
                    Id={imageKey}
                    Error={errors.file_error}
                    Label={'Drag & Drop your images or <span class="filepond--label-action">Browse</span>'}
                    Multiple={true}
                    reOrder={true}
                    canMarkMainImage={!isEdit || existingImages.length === 0}
                    acceptedFileTypes={['image/*']}
                    MaxFiles={20}
                    MaxFileSize={'10MB'}
                    onUpdate={onNewFiles(imageKey)}
                />

                <FileUploaderInput
                    InputName={isEdit ? 'Add Videos' : 'Videos'}
                    Id={videoKey}
                    Error={errors.video_error}
                    Label={'Drag & Drop your videos or <span class="filepond--label-action">Browse</span>'}
                    Multiple={true}
                    reOrder={true}
                    acceptedFileTypes={['video/*']}
                    MaxFiles={10}
                    MaxFileSize={'1000MB'}
                    onUpdate={onNewFiles(videoKey)}
                />
            </div>
        </div>
    );
}
