import React, { useEffect, useState } from 'react';
import { FilePond, registerPlugin } from 'react-filepond';

import 'filepond/dist/filepond.min.css';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';

import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
import FilePondPluginImageExifOrientation from 'filepond-plugin-image-exif-orientation';
import FilePondPluginFileValidateSize from 'filepond-plugin-file-validate-size';

registerPlugin(
    FilePondPluginImagePreview,
    FilePondPluginFileValidateType,
    FilePondPluginImageExifOrientation,
    FilePondPluginFileValidateSize,
);
export default function FileUploaderInput({
    Multiple = false,
    InputName,
    CustomCss,
    Id,
    Required = false,
    Label,
    Error,
    onUpdate,
    DefaultFile,
    acceptedFileTypes,
    MaxFileSize,
    MaxFiles,
}) {
    const [files, setFiles] = useState(() => {
        if (!DefaultFile || !Array.isArray(DefaultFile)) return [];

        const preloaded = DefaultFile.map((url) => ({
            source: url,
            options: { type: 'remote' },
        }));

        return Multiple ? preloaded : preloaded.slice(0, 1);
    });




    // CLeanup
    useEffect(() => {
        return () => {
            setFiles([]);

            document.querySelectorAll('.filepond--root').forEach(p => {
                if (p._pond) p._pond.destroy();
            });
        }
    }, []);

    return (
        <>
            <div className={CustomCss || 'w-full'}>
                <label
                    htmlFor={Id}
                    className="mb-1.5 block mx-4 text-sm font-medium text-gray-700 dark:text-gray-400"
                >
                    {InputName}
                    {Required && <span className="text-red-500 dark:text-white"> *</span>}
                </label>

                <div className="relative cursor-pointer">
                    <FilePond
                        allowMultiple={Multiple}
                        credits={false}
                        acceptedFileTypes={acceptedFileTypes ?? ['image/*']}
                        labelIdle={Label ?? 'Drag & Drop Your Files or <strong>Click</strong>'}
                        onupdatefiles={(fileItems) => {
                            setFiles(fileItems);

                            const updatedFiles = fileItems.map((item) => {
                                if (item.file instanceof File) {
                                    return {
                                        file: item.file,
                                        isNew: true,
                                    };
                                } else {
                                    return {
                                        source: item.source,
                                        isNew: false,
                                    };
                                }
                            });

                            // Send full list to parent
                            onUpdate(updatedFiles);
                        }}
                        files={files}
                        dropOnElement={true}
                        dropOnPage={true}
                        className="filepond--root"
                        maxFileSize={MaxFileSize ?? '2MB'}
                        onreorderfiles={(fileItems) => {
                            setFiles(fileItems);

                            const updatedFiles = fileItems.map((item) => {
                                if (item.file instanceof File) {
                                    return {
                                        file: item.file,
                                        isNew: true,
                                    };
                                } else {
                                    return {
                                        source: item.source,
                                        isNew: false,
                                    };
                                }
                            });

                            // Send full list to parent
                            onUpdate(updatedFiles);
                        }}
                        {...(MaxFiles ? { maxFiles: MaxFiles } : {})}
                    />
                </div>

                <div className="h-5">
                    {Error && <p className="mt-1.5 text-red-500 dark:text-white">{Error}</p>}
                </div>
            </div>
        </>
    );
}
