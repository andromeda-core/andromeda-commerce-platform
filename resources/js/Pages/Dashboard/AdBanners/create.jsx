import Card from '@/Components/Card';
import Input from '@/Components/Input';
import LinkButton from '@/Components/LinkButton';
import PrimaryButton from '@/Components/PrimaryButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BreadCrumb from '@/Components/BreadCrumb';
import { Head, useForm } from '@inertiajs/react';
import React from 'react';
import SelectInput from '@/Components/SelectInput';
import FileUploaderInput from '@/Components/FileUploaderInput';

export default function create() {
    // Create Data Form Data
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        media_type: 'image',
        media: '',
        redirect_url: '',
    });

    // Create Data Form Request
    const submit = (e) => {
        e.preventDefault();
        post(route('dashboard.ad-banners.store'), {
            onSuccess: () => reset(),
        });
    };

    return (
        <>
            <AuthenticatedLayout>
                <Head title="Create Ad Banner" />

                <BreadCrumb
                    header={'Create Ad Banner'}
                    parent={'Ad Banners'}
                    parent_link={route('dashboard.ad-banners.index')}
                    child={'Create Ad Banner'}
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
                                                        InputName={'Ad Banner Video'}
                                                        Id={'media'}
                                                        Label={
                                                            'Drag & Drop your Ad Banner Video or <span class="filepond--label-action">Browse</span>'
                                                        }
                                                        Error={errors.media}
                                                        MaxFileSize={'1000MB'}
                                                        MaxFiles={1}
                                                        Multiple={false}
                                                        Required={true}
                                                        acceptedFileTypes={['video/*']}
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
                                                        InputName={'Ad Banner Image'}
                                                        Id={'media'}
                                                        Label={
                                                            'Drag & Drop your Ad Banner Image or <span class="filepond--label-action">Browse</span>'
                                                        }
                                                        Error={errors.media}
                                                        MaxFileSize={'5MB'}
                                                        MaxFiles={1}
                                                        Multiple={false}
                                                        Required={true}
                                                        acceptedFileTypes={['image/*']}
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
                                                Text={'Create Ad Banner'}
                                                Type={'submit'}
                                                CustomClass={'w-[200px] '}
                                                Disabled={
                                                    processing ||
                                                    data.name.trim() === '' ||
                                                    data.redirect_url.trim() === '' ||
                                                    data.media === ''
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
                                                            d="M12 4.5v15m7.5-7.5h-15"
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
