import Card from '@/Components/Card';
import Input from '@/Components/Input';
import LinkButton from '@/Components/LinkButton';
import PrimaryButton from '@/Components/PrimaryButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BreadCrumb from '@/Components/BreadCrumb';
import { Head, router, useForm } from '@inertiajs/react';
import React, { useEffect, useRef, useState } from 'react';
import SelectInput from '@/Components/SelectInput';
import FileUploaderInput from '@/Components/FileUploaderInput';
import TipTapEditor from '@/Components/TipTapEditor';
import Toast from '@/Components/Toast';

export default function edit({ post, floors }) {
    // Create Data Form Data
    const { data, setData, reset } = useForm({
        _method: 'PUT',
        title: post?.title || '',
        content: post?.content || '',
        images: [],
        videos: [],
        floor_id: post?.floor_id || '',
        tag: post?.tag || '',
        post_type: post?.post_type || '',
        status: post?.status ?? 1,
        deleted_images: [],
        deleted_videos: [],
        new_images: [],
        new_videos: [],
    });

    // Submit Processing
    const [processing, setProcessing] = useState(false);

    // Submit Errors
    const [errors, setErrors] = useState({});
    const [fileChanged, setFileChanged] = useState(false);

    // Tracking Deleted Files
    const getDeletedFiles = (original, current) => {
        if (!Array.isArray(original) || !Array.isArray(current)) return [];

        const currentSources = current.filter((f) => !f.isNew).map((f) => f.source);

        return original.filter((file) => !currentSources.includes(file.url));
    };

    // Update Data Form Request

    const submit = (e) => {
        e.preventDefault();

        const deletedImages = getDeletedFiles(post.images, data.images || []);
        const deletedVideos = getDeletedFiles(post.videos, data.videos || []);

        const newImages = (data.images || []).filter((f) => f.isNew).map((f) => f.file);
        const newVideos = (data.videos || []).filter((f) => f.isNew).map((f) => f.file);

        const formData = {
            ...data,
            deleted_images: deletedImages,
            deleted_videos: deletedVideos,
            new_images: newImages,
            new_videos: newVideos,
        };

        setProcessing(true);
        router.post(route('dashboard.posts.update', encodeURIComponent(post?.slug)), formData, {
            forceFormData: true,
            onSuccess: () => {
                setProcessing(false);
                setShowProgressModal(false);
                reset();
            },
            onError: (errors) => {
                setErrors(errors);
                setProcessing(false);
                setShowProgressModal(false);
            },
            onFinish: () => {
                setProcessing(false);
                setShowProgressModal(false);
            },
        });
    };

    const [file_error, setFileError] = useState(null);
    const [showProgressModal, setShowProgressModal] = useState(false);

    useEffect(() => {
        if (file_error != null) {
            setFileError(null);
        }
    }, [data?.images, data?.videos]);

    useEffect(() => {
        if ((data?.images?.length > 0 || data?.videos?.length > 0) && processing) {
            setShowProgressModal(true);
        } else {
            setShowProgressModal(false);
        }
    }, [processing, data?.images, data?.videos]);

    useEffect(() => {
        if (errors?.file_error) {
            setFileError(errors.file_error);
        }
    }, [errors]);

    return (
        <>
            <AuthenticatedLayout>
                <Head title="Posts" />

                <BreadCrumb
                    header={'Edit Post'}
                    parent={'Posts'}
                    parent_link={route('dashboard.posts.index')}
                    child={'Edit Post'}
                />

                {file_error != null && <Toast flash={{ info: file_error }} />}

                <Card
                    Content={
                        <>
                            <div className="flex flex-wrap justify-end my-3">
                                <LinkButton
                                    Text={'Back To Posts'}
                                    URL={route('dashboard.posts.index')}
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

                            <form onSubmit={submit}>
                                <Card
                                    Content={
                                        <>
                                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                <Input
                                                    InputName={'Post Title'}
                                                    Error={errors.title}
                                                    Value={data.title}
                                                    Action={(e) => setData('title', e.target.value)}
                                                    Placeholder={'Enter Post Title'}
                                                    Id={'title'}
                                                    Name={'title'}
                                                    Type={'text'}
                                                    Required={true}
                                                />

                                                <SelectInput
                                                    InputName={'Post Type'}
                                                    Id={'post_type'}
                                                    Name={'post_type'}
                                                    Error={errors.post_type}
                                                    Value={data.post_type}
                                                    Required={true}
                                                    Action={(value) => setData('post_type', value)}
                                                    items={[
                                                        { name: 'Review' },
                                                        { name: 'Inquiry' },
                                                    ]}
                                                    itemKey={'name'}
                                                />

                                                <FileUploaderInput
                                                    Label={
                                                        'Drag & Drop your Post Image or <span class="filepond--label-action">Browse</span>'
                                                    }
                                                    Error={errors.images}
                                                    Id={'images'}
                                                    InputName={'Post Images'}
                                                    acceptedFileTypes={['image/*']}
                                                    MaxFileSize={'10MB'}
                                                    onUpdate={(files) => {
                                                        if (files.length > 0) {
                                                            setData('images', files);
                                                        } else {
                                                            setData('images', null);
                                                        }
                                                        setFileChanged(true);
                                                    }}
                                                    MaxFiles={35}
                                                    Multiple={true}
                                                    DefaultFile={post.post_image_urls}
                                                />

                                                <FileUploaderInput
                                                    Label={
                                                        'Drag & Drop your Post Video or <span class="filepond--label-action">Browse</span>'
                                                    }
                                                    Error={errors.videos}
                                                    Id={'videos'}
                                                    InputName={'Post Videos'}
                                                    acceptedFileTypes={['video/*']}
                                                    MaxFileSize={'1000MB'}
                                                    onUpdate={(files) => {
                                                        if (files.length > 0) {
                                                            setData('videos', files);
                                                        } else {
                                                            setData('videos', null);
                                                        }
                                                        setFileChanged(true);
                                                    }}
                                                    MaxFiles={5}
                                                    Multiple={true}
                                                    DefaultFile={post.post_video_urls}
                                                />

                                                <Input
                                                    InputName={'Tag'}
                                                    Error={errors.tag}
                                                    Value={data.tag}
                                                    Action={(e) => setData('tag', e.target.value)}
                                                    Placeholder={'Enter Tag'}
                                                    Id={'tag'}
                                                    Name={'tag'}
                                                    Type={'text'}
                                                    Required={false}
                                                />

                                                {/* <SelectInput
                                                    InputName={'Floor'}
                                                    Id={'floor_id'}
                                                    Name={'floor_id'}
                                                    Error={errors.floor_id}
                                                    Value={data.floor_id}
                                                    Required={false}
                                                    Action={(value) => setData('floor_id', value)}
                                                    items={floors}
                                                    itemKey={'name'}
                                                /> */}
                                                <SelectInput
                                                    InputName={'Post Status'}
                                                    Id={'status'}
                                                    Name={'status'}
                                                    Error={errors.status}
                                                    Value={data.status}
                                                    Required={true}
                                                    Action={(value) => setData('status', value)}
                                                    items={[
                                                        { id: 1, name: 'Active' },
                                                        { id: 0, name: 'In Active' },
                                                    ]}
                                                    itemKey={'name'}
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 gap-4">
                                                <TipTapEditor
                                                    Label={'Content'}
                                                    Id={'content'}
                                                    Required={true}
                                                    Error={errors?.content}
                                                    Value={data.content}
                                                    Action={(value) => {
                                                        if (value == '<p></p>')
                                                            setData('content', '');
                                                        else setData('content', value);
                                                    }}
                                                />
                                            </div>

                                            <PrimaryButton
                                                Text={'Update Post'}
                                                Type={'submit'}
                                                CustomClass={'w-[200px] '}
                                                Disabled={
                                                    processing ||
                                                    data.title.trim() === '' ||
                                                    data.content.trim() === '' ||
                                                    data.post_type.trim() === '' ||
                                                    data.status === ''
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
                                                            d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
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

                {showProgressModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto sm:p-6">
                        <div className="fixed inset-0 backdrop-blur-[32px]"></div>

                        {/* Modal content */}
                        <div className="relative z-10 w-full max-w-lg max-h-screen p-6 overflow-y-auto bg-white shadow-xl rounded-2xl dark:bg-deepcharcoal sm:p-8">
                            <div className="text-center">
                                <h2 className="text-lg font-medium text-gray-800 dark:text-white">
                                    Please Wait While We Are Uploading Your Files
                                </h2>

                                <div className="flex items-center justify-center mt-5">
                                    <div role="status">
                                        <svg
                                            aria-hidden="true"
                                            className="w-8 h-8 text-gray-200 animate-spin fill-blue-600 dark:text-gray-600"
                                            viewBox="0 0 100 101"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                                fill="currentColor"
                                            />
                                            <path
                                                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                                fill="currentFill"
                                            />
                                        </svg>
                                        <span className="sr-only">Loading...</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </AuthenticatedLayout>
        </>
    );
}
