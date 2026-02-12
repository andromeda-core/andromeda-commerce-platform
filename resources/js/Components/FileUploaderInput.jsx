
import React, { useEffect, useRef, useState } from 'react';
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
    reOrder = false,
    canMarkMainImage = false
}) {
    const [files, setFiles] = useState(() => {
        if (!DefaultFile || !Array.isArray(DefaultFile)) return [];

        const preloaded = DefaultFile.map((url) => ({
            source: url,
            options: { type: 'remote' },
        }));

        return Multiple ? preloaded : preloaded.slice(0, 1);
    });

    const pondRef = useRef(null);


    function getPond() {
        return pondRef.current?.pond ?? pondRef.current;
    }

    function markMainImage() {
        const pond = getPond();
        const root = pond?._element || pond?.element;
        if (!root) return;

        const files = Array.from(root.querySelectorAll(".filepond--file"));
        if (!files.length) return;

        // remove old badges
        root.querySelectorAll(".main-badge").forEach(b => b.remove());

        // find the visually "first" file (top-most, then left-most)
        const first = files
            .map(el => ({ el, r: el.getBoundingClientRect() }))
            .sort((a, b) => (a.r.top - b.r.top) || (a.r.left - b.r.left))[0]?.el;

        if (!first) return;

        const badge = document.createElement("div");
        badge.className = "main-badge";
        badge.innerText = "Main Image";

        if (getComputedStyle(first).position === "static") first.style.position = "relative";
        first.appendChild(badge);
    }




    useEffect(() => {
        if (!canMarkMainImage) return;

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                markMainImage();
            });
        });
    }, [files, canMarkMainImage]);


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
                {InputName && (
                    <label
                        htmlFor={Id}
                        className="mb-1.5 block text-sm font-medium text-main-text-light dark:text-main-text-dark"
                    >
                        {InputName}{' '}
                        {Required && <span className="font-bold text-main-text-light dark:text-main-text-dark"> *</span>}
                    </label>
                )}
                <div className="relative cursor-pointer">
                    <FilePond
                        ref={pondRef}
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
                        allowReorder={reOrder}
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
