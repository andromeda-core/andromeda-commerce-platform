import React, { useState, useRef } from 'react';

export default function CustomFileUploader({
    onFileSelect,
    onFileRemove,
    accept = 'image/*',
    maxSize = 5 * 1024 * 1024, // 5MB default
    preview = null,
    fileName = null,
    fileSize = null,
    isUploading = false,
    uploadButtonText = 'Upload File',
    className = '',
    disabled = false,
}) {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);
    const dropZoneRef = useRef(null);

    // Get file type name for display
    const getFileTypeName = () => {
        if (accept === 'image/*') return 'PNG, JPG or JPEG';
        if (accept === 'application/pdf') return 'PDF';
        if (accept === 'video/*') return 'MP4, AVI or MOV';
        return 'Any file';
    };

    // Validate and process file
    const processFile = (file) => {
        if (!file) return false;

        // Validate file type
        const acceptedTypes = accept.split(',').map((type) => type.trim());
        const isValidType = acceptedTypes.some((type) => {
            if (type.endsWith('/*')) {
                const category = type.split('/')[0];
                return file.type.startsWith(category + '/');
            }
            return file.type === type;
        });

        if (!isValidType) {
            alert(`Please select a valid file type: ${getFileTypeName()}`);
            return false;
        }

        // Validate file size
        if (file.size > maxSize) {
            const maxSizeMB = (maxSize / 1024 / 1024).toFixed(2);
            alert(`File size must be less than ${maxSizeMB}MB`);
            return false;
        }

        // Call parent callback
        if (onFileSelect) {
            onFileSelect(file);
        }

        return true;
    };

    // Handle file selection
    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            processFile(file);
        }
    };

    // Handle drag events
    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled) {
            setIsDragging(true);
        }
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();

        // Only set dragging to false if we're leaving the drop zone entirely
        if (dropZoneRef.current && !dropZoneRef.current.contains(e.relatedTarget) && !disabled) {
            setIsDragging(false);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled) {
            setIsDragging(true);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (disabled) return;

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            processFile(files[0]);
        }
    };

    // Handle remove file
    const handleRemove = () => {
        if (onFileRemove) {
            onFileRemove();
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Format file size
    const formatFileSize = (bytes) => {
        if (!bytes) return '0 MB';
        return (bytes / 1024 / 1024).toFixed(2) + ' MB';
    };

    return (
        <div className={className}>
            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept={accept}
                onChange={handleFileSelect}
                disabled={disabled}
                className="hidden"
            />

            {/* Preview or Upload Area */}
            {preview ? (
                <div className="space-y-4">
                    {/* File Preview */}
                    <div className="relative overflow-hidden rounded-xl border-2 border-indigo-200 bg-gray-50 dark:border-indigo-800 dark:bg-gray-900/50">
                        {accept.startsWith('image') ? (
                            <img
                                src={preview}
                                alt="File Preview"
                                className="h-64 w-full object-contain"
                            />
                        ) : accept.startsWith('video') ? (
                            <video src={preview} controls className="h-64 w-full object-contain" />
                        ) : (
                            <div className="flex h-64 items-center justify-center">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="h-20 w-20 text-gray-400"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                                    />
                                </svg>
                            </div>
                        )}

                        {!disabled && (
                            <button
                                onClick={handleRemove}
                                className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white transition-all hover:bg-red-600"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={2}
                                    stroke="currentColor"
                                    className="h-5 w-5"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        )}
                    </div>

                    {/* File Info */}
                    {fileName && (
                        <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4 dark:bg-gray-900/50">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={2}
                                        stroke="currentColor"
                                        className="h-5 w-5 text-indigo-600 dark:text-indigo-400"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                                        />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                        {fileName}
                                    </p>
                                    <p className="text-xs text-gray-600 dark:text-white/60">
                                        {formatFileSize(fileSize)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                /* Upload Drop Zone */
                <div
                    ref={dropZoneRef}
                    onClick={() => !disabled && fileInputRef.current?.click()}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-all ${
                        disabled
                            ? 'cursor-not-allowed opacity-50'
                            : isDragging
                              ? 'border-indigo-500 bg-indigo-50 dark:border-indigo-400 dark:bg-indigo-900/20'
                              : 'border-red-300 bg-red-50/50 hover:border-red-400 hover:bg-red-50 dark:border-red-800 dark:bg-red-900/10 dark:hover:border-red-700 dark:hover:bg-red-900/20'
                    }`}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className={`mx-auto mb-4 h-16 w-16 transition-colors ${
                            isDragging ? 'text-indigo-500 dark:text-indigo-400' : 'text-red-400'
                        }`}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                        />
                    </svg>
                    <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                        {isDragging ? 'Drop your file here' : uploadButtonText}
                    </h3>
                    <p className="mb-4 text-sm text-gray-600 dark:text-white/60">
                        {isDragging
                            ? 'Release to upload'
                            : 'Click to select or drag and drop your file'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-white/40">
                        {getFileTypeName()} (max. {(maxSize / 1024 / 1024).toFixed(0)}MB)
                    </p>
                </div>
            )}
        </div>
    );
}
