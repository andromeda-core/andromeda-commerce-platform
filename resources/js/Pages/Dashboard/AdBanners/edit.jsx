import Card from '@/Components/Card';
import Input from '@/Components/Input';
import LinkButton from '@/Components/LinkButton';
import PrimaryButton from '@/Components/PrimaryButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BreadCrumb from '@/Components/BreadCrumb';
import LinkCopiedModal from '@/Components/LinkCopiedModal';
import { Head, useForm } from '@inertiajs/react';
import React, { useState } from 'react';
import SelectInput from '@/Components/SelectInput';
import FileUploaderInput from '@/Components/FileUploaderInput';

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

// Read-only reference row: label + value + copy button. Purely informational — never
// part of the editable form data, never submitted.
function ReferenceField({ label, value, onCopy }) {
    if (!value) return null;

    return (
        <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-main-text-light dark:text-main-text-dark">
                {label}
            </span>
            <div className="flex items-center gap-1.5 rounded-md border border-gray-200 bg-gray-50 px-2 py-1.5 dark:border-gray-700 dark:bg-gray-800">
                <p className="flex-1 truncate text-xs text-gray-600 dark:text-gray-400">{value}</p>
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
            </div>
        </div>
    );
}

export default function edit({ adBanner }) {
    const [linkCopied, setLinkCopied] = useState(false);
    const handleCopy = (text) => {
        if (!text) return;
        copyToClipboard(text);
        setLinkCopied(true);
    };
    // Edit Data Form Data. Mirrors Categories/edit.jsx's `_method: 'PUT'` spoof — Inertia's
    // `put()` cannot carry multipart file data, so the update route is reached via `post()`.
    const { data, setData, post, processing, errors } = useForm({
        _method: 'PUT',
        name: adBanner.name || '',
        media_type: adBanner.media_type || 'image',
        media: '',
        redirect_url: adBanner.redirect_url || '',
    });

    // Edit Data Form Request
    const submit = (e) => {
        e.preventDefault();
        post(route('dashboard.ad-banners.update', adBanner.id));
    };

    return (
        <>
            <AuthenticatedLayout>
                <Head title="Edit Ad Banner" />

                <BreadCrumb
                    header={'Edit Ad Banner'}
                    parent={'Ad Banners'}
                    parent_link={route('dashboard.ad-banners.index')}
                    child={'Edit Ad Banner'}
                />

                <LinkCopiedModal
                    linkCopied={linkCopied}
                    setLinkCopied={setLinkCopied}
                    message="Copied!"
                />

                <Card
                    Content={
                        <>
                            <div className="my-3 flex flex-wrap justify-end">
                                <LinkButton
                                    Text={'Back To Ad Banners'}
                                    URL={route('dashboard.ad-banners.index')}
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

                            {/* Read-only reference block — never part of the editable form data. */}
                            <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                                <ReferenceField
                                    label={'Public ID'}
                                    value={adBanner.public_id}
                                    onCopy={() => handleCopy(adBanner.public_id)}
                                />
                                <ReferenceField
                                    label={'Media URL'}
                                    value={adBanner.file_url}
                                    onCopy={() => handleCopy(adBanner.file_url)}
                                />
                            </div>

                            <form onSubmit={submit}>
                                <Card
                                    Content={
                                        <>
                                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                <Input
                                                    InputName={'Ad Banner Name'}
                                                    Error={errors.name}
                                                    Value={data.name}
                                                    Action={(e) => setData('name', e.target.value)}
                                                    Placeholder={'Enter Ad Banner Name'}
                                                    Id={'name'}
                                                    Name={'name'}
                                                    Type={'text'}
                                                    Required={true}
                                                />

                                                <SelectInput
                                                    InputName={'Media Type'}
                                                    Id={'media_type'}
                                                    Name={'media_type'}
                                                    Error={errors.media_type}
                                                    Value={data.media_type}
                                                    Required={true}
                                                    Action={(value) => {
                                                        setData('media_type', value);
                                                        setData('media', '');
                                                    }}
                                                    items={[
                                                        { id: 'image', name: 'Image' },
                                                        { id: 'video', name: 'Video' },
                                                    ]}
                                                    itemKey={'name'}
                                                />

                                                <Input
                                                    InputName={'Redirect URL'}
                                                    Error={errors.redirect_url}
                                                    Value={data.redirect_url}
                                                    Action={(e) => setData('redirect_url', e.target.value)}
                                                    Placeholder={'Where the banner should link (opens in a new tab)'}
                                                    Id={'redirect_url'}
                                                    Name={'redirect_url'}
                                                    Type={'url'}
                                                    Required={true}
                                                />
                                            </div>

                                            <div className="col-span-1 grid gap-4">
                                                {data.media_type === 'video' ? (
                                                    <FileUploaderInput
                                                        InputName={'Ad Banner Video (leave empty to keep current)'}
                                                        Id={'media'}
                                                        Label={
                                                            'Drag & Drop your Ad Banner Video or <span class="filepond--label-action">Browse</span>'
                                                        }
                                                        Error={errors.media}
                                                        MaxFileSize={'1000MB'}
                                                        MaxFiles={1}
                                                        Multiple={false}
                                                        Required={false}
                                                        acceptedFileTypes={['video/*']}
                                                        DefaultFile={
                                                            adBanner.media_type === 'video' &&
                                                            adBanner.file_url && [adBanner.file_url]
                                                        }
                                                        onUpdate={(file) => {
                                                            if (file.length > 0) {
                                                                if (file[0].isNew) {
                                                                    setData('media', file[0].file);
                                                                }
                                                            } else {
                                                                setData('media', '');
                                                            }
                                                        }}
                                                    />
                                                ) : (
                                                    <FileUploaderInput
                                                        InputName={'Ad Banner Image (leave empty to keep current)'}
                                                        Id={'media'}
                                                        Label={
                                                            'Drag & Drop your Ad Banner Image or <span class="filepond--label-action">Browse</span>'
                                                        }
                                                        Error={errors.media}
                                                        MaxFileSize={'5MB'}
                                                        MaxFiles={1}
                                                        Multiple={false}
                                                        Required={false}
                                                        acceptedFileTypes={['image/*']}
                                                        DefaultFile={
                                                            adBanner.media_type === 'image' &&
                                                            adBanner.file_url && [adBanner.file_url]
                                                        }
                                                        onUpdate={(file) => {
                                                            if (file.length > 0) {
                                                                if (file[0].isNew) {
                                                                    setData('media', file[0].file);
                                                                }
                                                            } else {
                                                                setData('media', '');
                                                            }
                                                        }}
                                                    />
                                                )}
                                            </div>

                                            <PrimaryButton
                                                Text={'Update Ad Banner'}
                                                Type={'submit'}
                                                CustomClass={'w-[200px] '}
                                                Disabled={
                                                    processing ||
                                                    data.name.trim() === '' ||
                                                    data.redirect_url.trim() === ''
                                                }
                                                Spinner={processing}
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
                                                            d="M4.5 12.75l6 6 9-13.5"
                                                        />
                                                    </svg>
                                                }
                                            />
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
