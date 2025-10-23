import Card from '@/Components/Card';
import FileUploaderInput from '@/Components/FileUploaderInput';
import Input from '@/Components/Input';
import PrimaryButton from '@/Components/PrimaryButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BreadCrumb from '@/Components/BreadCrumb';
import { Head, useForm } from '@inertiajs/react';
import React from 'react';
import Swal from 'sweetalert2';
import LinkButton from '@/Components/LinkButton';
import Textarea from '@/Components/Textarea';

export default function index({ general_setting }) {
    // Update General Setting Form Data
    const { data, setData, post, processing, errors, progress, reset } = useForm({
        _method: 'PUT',
        app_name: general_setting?.app_name || '',
        contact_email: general_setting?.contact_email || '',
        contact_number: general_setting?.contact_number || '',
        app_main_logo_dark: null,
        is_removed_app_main_logo_dark: false,
        app_main_logo_light: null,
        is_removed_app_main_logo_light: false,
        app_favicon: null,
        is_removed_app_favicon: false,
        app_description: general_setting?.app_description || '',
    });

    // Optional for Tracking File Upload Status
    // useEffect(() => {
    //     // console.log(progress);
    // }, [progress]);

    // Update General Setting Form Request
    const submit = (e) => {
        e.preventDefault();
        post(route('dashboard.settings.general.setting.update'), {
            forceFormData: true,
            preserveScroll: true,

            onSuccess: () => {
                reset('app_favicon', 'app_main_logo_dark', 'app_main_logo_light');
                Swal.fire({
                    icon: 'success',
                    title: 'Settings Updated',
                    text: 'Your changes were saved successfully. Would you like to reload the page to see them in effect?',
                    showConfirmButton: true,
                    showCancelButton: true,
                    confirmButtonText: 'Yes, Reload Now',
                    cancelButtonText: 'Later',
                }).then((result) => {
                    if (result.isConfirmed) {
                        window.location.reload();
                    }
                });
            },
        });
    };

    return (
        <>
            <AuthenticatedLayout>
                <Head title="Settings - General Setting" />

                <BreadCrumb
                    header={'Settings - General Setting'}
                    parent={'Settings'}
                    parent_link={route('dashboard.settings.index')}
                    child={'General Setting'}
                />

                <Card
                    Content={
                        <>
                            <div className="flex flex-wrap justify-end my-3">
                                <LinkButton
                                    Text={'Back To Settings'}
                                    URL={route('dashboard.settings.index')}
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
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <Input
                                        InputName={'Application Name'}
                                        Placeholder={'Enter Application Name'}
                                        Name={'app_name'}
                                        Id={'app_name'}
                                        Type={'text'}
                                        Required={true}
                                        Action={(e) => setData('app_name', e.target.value)}
                                        Value={data.app_name}
                                        Error={errors.app_name}
                                    />

                                    <Input
                                        InputName={'Contact Email'}
                                        Placeholder={'Enter Contact Email'}
                                        Name={'contact_email'}
                                        Id={'contact_email'}
                                        Type={'email'}
                                        Required={true}
                                        Action={(e) => setData('contact_email', e.target.value)}
                                        Value={data.contact_email}
                                        Error={errors.contact_email}
                                    />

                                    <Input
                                        InputName={'Contact Number'}
                                        Placeholder={'Enter Contact Number'}
                                        Name={'contact_number'}
                                        Id={'contact_number'}
                                        Type={'text'}
                                        Required={true}
                                        Value={data.contact_number}
                                        Action={(e) => setData('contact_number', e.target.value)}
                                        Error={errors.contact_number}
                                    />

                                    <Textarea
                                        Action={(e) => setData('app_description', e.target.value)}
                                        Id={'app_description'}
                                        Name={'app_description'}
                                        InputName={'Application Description'}
                                        Required={false}
                                        Value={data.app_description}
                                        Error={errors.app_description}
                                        Placeholder="Please Enter Your Appliation Description For Breif"
                                    />
                                </div>

                                <div className="grid grid-cols-1 gap-4 mt-20 md:grid-cols-2">
                                    <FileUploaderInput
                                        Label={
                                            'Drag & Drop your Application Logo For Dark Mode or <span class="filepond--label-action">Browse</span>'
                                        }
                                        Error={errors.app_main_logo_dark}
                                        Id={'app_main_logo_dark'}
                                        InputName={'App Main Logo For Dark Mode'}
                                        onUpdate={(file) => {
                                            if (file.length > 0) {
                                                if (file[0].isNew) {
                                                    setData('app_main_logo_dark', file[0].file);
                                                    setData('is_removed_app_main_logo_dark', false);
                                                }
                                            } else {
                                                general_setting?.app_main_logo_dark &&
                                                    setData('is_removed_app_main_logo_dark', true);
                                                setData('app_main_logo_dark', null);
                                            }
                                        }}
                                        Multiple={false}
                                        DefaultFile={
                                            general_setting?.app_main_logo_dark && [
                                                general_setting?.app_main_logo_dark,
                                            ]
                                        }
                                    />

                                    <FileUploaderInput
                                        Label={
                                            'Drag & Drop your Application Logo For Light Mode or <span class="filepond--label-action">Browse</span>'
                                        }
                                        Error={errors.app_main_logo_light}
                                        Id={'app_main_logo_light'}
                                        InputName={'App Main Logo For Light Mode'}
                                        onUpdate={(file) => {
                                            if (file.length > 0) {
                                                if (file[0].isNew) {
                                                    setData('app_main_logo_light', file[0].file);
                                                    setData(
                                                        'is_removed_app_main_logo_light',
                                                        false,
                                                    );
                                                }
                                            } else {
                                                general_setting?.app_main_logo_light &&
                                                    setData('is_removed_app_main_logo_light', true);
                                                setData('app_main_logo_light', null);
                                            }
                                        }}
                                        Multiple={false}
                                        DefaultFile={
                                            general_setting?.app_main_logo_light && [
                                                general_setting?.app_main_logo_light,
                                            ]
                                        }
                                    />
                                </div>

                                <div className="grid gap-4 grid-col-1">
                                    <FileUploaderInput
                                        Label={
                                            'Drag & Drop your favicon or <span class="filepond--label-action">Browse</span>'
                                        }
                                        Error={errors.app_favicon}
                                        Id={'app_favicon'}
                                        InputName={'App Favicon'}
                                        onUpdate={(file) => {
                                            if (file.length > 0) {
                                                if (file[0].isNew) {
                                                    setData('app_favicon', file[0].file);
                                                    setData('is_removed_app_favicon', false);
                                                }
                                            } else {
                                                general_setting?.app_favicon &&
                                                    setData('is_removed_app_favicon', true);
                                                setData('app_favicon', null);
                                            }
                                        }}
                                        Multiple={false}
                                        DefaultFile={
                                            general_setting?.app_favicon && [
                                                general_setting?.app_favicon,
                                            ]
                                        }
                                    />
                                </div>

                                <div className="mx-4 w-60">
                                    <PrimaryButton
                                        Text={'Save Changes'}
                                        Spinner={processing}
                                        Disabled={
                                            processing ||
                                            data.app_name.trim() === '' ||
                                            data.contact_email.trim() === '' ||
                                            data.contact_number.trim() === ''
                                        }
                                        Type={'submit'}
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
                                </div>
                            </form>
                        </>
                    }
                />
            </AuthenticatedLayout>
        </>
    );
}
