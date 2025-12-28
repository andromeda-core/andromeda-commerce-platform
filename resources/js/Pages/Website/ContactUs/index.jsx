import WebInput from '@/Components/WebInput';
import Spinner from '@/Components/Spinner';
import WebTextArea from '@/Components/WebTextArea';
import useWindowSize from '@/Hooks/useWindowSize';
import MainLayout from '@/Layouts/Website/MainLayout';
import { Head, useForm } from '@inertiajs/react';
import React from 'react';

const Index = () => {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
    });

    const windowSize = useWindowSize();

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
            <Head title="Contact Us" />

            <div className="pt-0 sm:px-6 lg:px-8 lg:pt-10">




                {/* Hero Section */}

                <div className="relative overflow-hidden text-white dark:text-black ">
                    <div className="absolute inset-0" />

                    <div className="relative px-6 py-10 mx-auto lg:max-w-6xl sm:max-w-3xl lg:pt-14">


                        <h1 className="mb-6 text-5xl font-semibold text-main-text-light dark:text-main-text-dark lg:text-4xl">
                            Contact Us
                        </h1>

                        <p className="max-w-3xl mb-0 text-xl text-sub-text-light dark:text-sub-text-dark">
                            Have a question or feedback? We'd love to hear from you.
                            Fill out the form below and we'll get back to you as soon as possible.
                        </p>


                    </div>
                </div>




                {/* Contact Form Section */}
                <div className={`px-6 mx-auto ${windowSize.width > 1024 ? 'pb-0' : 'pb-24'} lg:max-w-6xl sm:max-w-3xl`}>

                    {/* Contact Info Cards */}
                    <div className="grid grid-cols-1 gap-4 mb-5 lg:grid-cols-2">
                        <div className="px-4 py-3 min-h-[100px] break-words rounded-md bg-surface-1-light dark:bg-surface-1-dark">
                            <p className="text-lg font-semibold text-main-text-light dark:text-main-text-dark">Contact Us</p>
                            <p className="mt-1 text-sm text-sub-text-light dark:text-sub-text-dark">
                                contact@andromeda.blue <br />
                                +1 (516) 518 3469
                            </p>
                        </div>

                        <div className="px-4 py-3 min-h-[100px] break-words rounded-md bg-surface-1-light dark:bg-surface-1-dark">
                            <p className="text-lg font-semibold text-main-text-light dark:text-main-text-dark">Visit Us</p>
                            <p className="mt-1 text-sm text-sub-text-light dark:text-sub-text-dark">
                                447 BROADWAY 2ND FL 2144 NEW YORK, <br />
                                NY 10013
                            </p>
                        </div>
                    </div>


                    <div className="grid grid-cols-1 gap-8 my-14">
                        {/* Contact Form */}
                        <div className="lg:col-span-2">

                            <h2 className="mb-6 text-xl font-semibold text-main-text-light dark:text-main-text-dark">
                                Send us a Message
                            </h2>



                            <form onSubmit={handleSubmit} className="space-y-2">
                                {/* Name */}
                                <div>
                                    <WebInput
                                        Id={'name'}
                                        Name={'name'}
                                        Type={'text'}
                                        Placeholder={'Enter Your Name'}
                                        Value={data.name}
                                        Error={errors.name}
                                        Required={true}
                                        InputName={'Full Name'}
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
                                            Placeholder={'Enter Your Email'}
                                            Value={data.email}
                                            Error={errors.email}
                                            Required={true}
                                            InputName={'Email'}
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
                                            Placeholder={'Enter Your Phone Number'}
                                            Value={data.phone}
                                            Error={errors.phone}
                                            Required={true}
                                            InputName={'Phone Number'}
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
                                        Placeholder={'Enter Your Subject'}
                                        Value={data.subject}
                                        Error={errors.subject}
                                        Required={true}
                                        InputName={'Subject'}
                                        Action={(e) => {
                                            setData('subject', e.target.value);
                                        }}
                                        ClassName={'dark:bg-surface-1-dark'}
                                    />
                                </div>

                                {/* Message */}
                                <div>
                                    <WebTextArea
                                        InputName={'Message'}
                                        Name={'message'}
                                        Id={'message'}
                                        Error={errors.message}
                                        Rows={6}
                                        Required={true}
                                        Value={data.message}
                                        Placeholder={'Tell us more about your inquiry...'}
                                        Action={(e) => {
                                            setData('message', e.target.value);
                                        }}
                                        ClassName={'dark:bg-surface-1-dark'}
                                    />
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={
                                        processing
                                    }
                                    className={`flex h-[50px] w-[200px] m-auto text-md  items-center justify-center gap-2  font-semibold rounded-md bg-main-text-light  text-main-text-dark transition-all hover:bg-main-text-light/80 dark:bg-main-text-dark dark:text-main-text-light  dark:hover:bg-main-text-dark/80 ${processing && 'cursor-not-allowed opacity-25 dark:opacity-40'}`}
                                >
                                    {processing && (
                                        <Spinner customSize={'size-5'} />
                                    )}
                                    Send Message
                                </button>
                            </form>

                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default Index;
