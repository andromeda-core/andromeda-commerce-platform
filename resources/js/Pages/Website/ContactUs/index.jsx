import WebInput from '@/Components/WebInput';
import Spinner from '@/Components/Spinner';
import WebTextArea from '@/Components/WebTextArea';
import useWindowSize from '@/Hooks/useWindowSize';
import MainLayout from '@/Layouts/Website/MainLayout';
import { Head, useForm } from '@inertiajs/react';
import React from 'react';
import { useTranslation } from '@/Hooks/useTranslation';

const Index = () => {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
    });

    const windowSize = useWindowSize();


    // Translation Hook
    const { __ } = useTranslation();

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('website.contact.store'), {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                reset();
            },
        });
    };

    return (
        <MainLayout>
            <Head title={__("Contact Us", true)} />

            <div className="sm:px-6 lg:px-8">
                <div className={` mx-auto ${windowSize.width > 1024 ? 'pb-12' : 'pb-24'} lg:max-w-6xl sm:max-w-3xl`}>


                    {/* Hero Section */}
                    <div className="relative overflow-hidden text-white dark:text-black ">
                        <div className="absolute inset-0" />

                        <div className="relative px-6 mx-auto my-10 lg:max-w-6xl sm:max-w-3xl">


                            <h1 className="text-2xl font-semibold text-main-text-light dark:text-main-text-dark">
                                {__('Contact Us')}
                            </h1>

                            <p className="max-w-3xl mt-1 text-sm text-sub-text-light dark:sub-text-dark">
                                {__("Have a question or feedback? We'd love to hear from you. Fill out the form below and we'll get back to you as soon as possible.")}
                            </p>


                        </div>
                    </div>



                    {/* Contact Form Section */}
                    <div className={` px-6  mx-auto lg:max-w-6xl sm:max-w-3xl`}>

                        {/* Contact Info Cards */}
                        <div className="grid grid-cols-1 gap-4 mb-5 lg:grid-cols-2">
                            <div className="px-4 py-3 min-h-[100px] break-words rounded-md bg-surface-1-light dark:bg-surface-1-dark">
                                <p className="text-lg font-semibold text-main-text-light dark:text-main-text-dark">{__('Contact Us')}</p>
                                <p className="mt-1 text-sm text-sub-text-light dark:text-sub-text-dark">
                                    contact@andromeda.blue <br />
                                    +1 (516) 518 3469
                                </p>
                            </div>

                            <div className="px-4 py-3 min-h-[100px] break-words rounded-md bg-surface-1-light dark:bg-surface-1-dark">
                                <p className="text-lg font-semibold text-main-text-light dark:text-main-text-dark">{__('Visit Us')}</p>
                                <p className="mt-1 text-sm text-sub-text-light dark:text-sub-text-dark">
                                    447 BROADWAY 2ND FL 2144 NEW YORK, <br />
                                    NY 10013
                                </p>
                            </div>
                        </div>


                        <div className="grid grid-cols-1 gap-8 mt-10 ">
                            {/* Contact Form */}
                            <div className="lg:col-span-2">

                                <h2 className="mb-6 text-xl font-semibold text-main-text-light dark:text-main-text-dark">
                                    {__('Send us a Message')}
                                </h2>



                                <form onSubmit={handleSubmit} className="space-y-2">
                                    {/* Name */}
                                    <div>
                                        <WebInput
                                            Id={'name'}
                                            Name={'name'}
                                            Type={'text'}
                                            Placeholder={__('Enter Your Name')}
                                            Value={data.name}
                                            Error={errors.name}
                                            Required={true}
                                            InputName={__('Full Name')}
                                            Action={(e) => {
                                                setData('name', e.target.value);
                                            }}
                                            ClassName={'dark:bg-surface-1-dark'}
                                        />
                                    </div>

                                    {/* Email and Phone */}
                                    <div className="grid gap-5 sm:grid-cols-2">
                                        <div>
                                            <WebInput
                                                Id={'email'}
                                                Name={'email'}
                                                Type={'email'}
                                                Placeholder={__('Enter Your Email')}
                                                Value={data.email}
                                                Error={errors.email}
                                                Required={true}
                                                InputName={__('Email')}
                                                Action={(e) => {
                                                    setData('email', e.target.value);
                                                }}
                                                ClassName={'dark:bg-surface-1-dark'}

                                            />
                                        </div>

                                        <div>
                                            <WebInput
                                                Id={'phone'}
                                                Name={'phone'}
                                                Type={'tel'}
                                                Placeholder={__('Enter Your Phone Number')}
                                                Value={data.phone}
                                                Error={errors.phone}
                                                Required={true}
                                                InputName={__('Phone Number')}
                                                Action={(e) => {
                                                    setData('phone', e.target.value);
                                                }}
                                                ClassName={'dark:bg-surface-1-dark'}
                                            />
                                        </div>
                                    </div>

                                    {/* Subject */}
                                    <div>
                                        <WebInput
                                            Id={'subject'}
                                            Name={'subject'}
                                            Type={'text'}
                                            Placeholder={__('Enter Your Subject')}
                                            Value={data.subject}
                                            Error={errors.subject}
                                            Required={true}
                                            InputName={__('Subject')}
                                            Action={(e) => {
                                                setData('subject', e.target.value);
                                            }}
                                            ClassName={'dark:bg-surface-1-dark'}
                                        />
                                    </div>

                                    {/* Message */}
                                    <div>
                                        <WebTextArea
                                            InputName={__('Message')}
                                            Name={'message'}
                                            Id={'message'}
                                            Error={errors.message}
                                            Rows={6}
                                            Required={true}
                                            Value={data.message}
                                            Placeholder={__('Tell us more about your inquiry') + "..."}
                                            Action={(e) => {
                                                setData('message', e.target.value);
                                            }}
                                            ClassName={'dark:bg-surface-1-dark'}
                                        />
                                    </div>

                                    {/* Submit Button */}
                                    <div className="flex items-center justify-end w-full">
                                        <button
                                            type="submit"
                                            disabled={
                                                processing
                                            }
                                            className={`flex h-[50px] w-[200px]  text-md  items-center justify-center gap-2  font-semibold rounded-md bg-main-text-light  text-main-text-dark transition-all hover:bg-main-text-light/80 dark:bg-main-text-dark dark:text-main-text-light  dark:hover:bg-main-text-dark/80 ${processing && 'cursor-not-allowed opacity-25 dark:opacity-40'}`}
                                        >
                                            {processing && (
                                                <Spinner customSize={'size-5'} />
                                            )}
                                            {__('Send Message')}
                                        </button>
                                    </div>
                                </form>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default Index;
