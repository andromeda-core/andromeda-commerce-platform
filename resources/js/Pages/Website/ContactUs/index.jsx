import Input from '@/Components/Input';
import PrimaryButton from '@/Components/PrimaryButton';
import Textarea from '@/Components/Textarea';
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

            {/* Hero Section */}
            <div className="py-16 bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-deepcharcoal dark:to-gray-900">
                <div className="container px-4 mx-auto">
                    <div className="max-w-3xl mx-auto text-center">
                        <div className="flex justify-center mb-6">
                            <div className="flex items-center justify-center w-20 h-20 bg-indigo-600 shadow-lg rounded-2xl dark:bg-indigo-500">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={2}
                                    stroke="currentColor"
                                    className="w-10 h-10 text-white"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                                    />
                                </svg>
                            </div>
                        </div>
                        <h1 className="mb-4 text-4xl font-extrabold text-gray-900 dark:text-white md:text-5xl">
                            Get in Touch
                        </h1>
                        <p className="text-lg text-gray-600 dark:text-white/70">
                            Have a question or feedback? We'd love to hear from you. Fill out the
                            form below and we'll get back to you as soon as possible.
                        </p>
                    </div>
                </div>
            </div>

            {/* Contact Form Section */}
            <div className="container px-4 py-16 mx-auto">
                <div className="max-w-4xl mx-auto">
                    <div className="grid gap-8 lg:grid-cols-3">
                        {/* Contact Info Cards */}
                        <div className="space-y-6 lg:col-span-1">
                            {/* Email Card */}
                            <div className="p-6 transition-all bg-white border border-gray-200 group rounded-2xl dark:border-white/10 dark:bg-deepcharcoal">
                                <div className="flex items-center justify-center w-12 h-12 mb-4 bg-blue-100 rounded-xl dark:bg-blue-900/30">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={2}
                                        stroke="currentColor"
                                        className="w-6 h-6 text-blue-600 dark:text-blue-400"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                                        />
                                    </svg>
                                </div>
                                <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
                                    Email Us
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-white/70">
                                    privacy@windoublespace.com
                                </p>
                            </div>

                            {/* Phone Card */}
                            <div className="p-6 transition-all bg-white border border-gray-200 group rounded-2xl dark:border-white/10 dark:bg-deepcharcoal">
                                <div className="flex items-center justify-center w-12 h-12 mb-4 bg-green-100 rounded-xl dark:bg-green-900/30">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={2}
                                        stroke="currentColor"
                                        className="w-6 h-6 text-green-600 dark:text-green-400"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
                                        />
                                    </svg>
                                </div>
                                <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
                                    Call Us
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-white/70">
                                    +82-10-5788-7778
                                </p>
                            </div>

                            {/* Location Card */}
                            <div className="p-6 transition-all bg-white border border-gray-200 group rounded-2xl dark:border-white/10 dark:bg-deepcharcoal">
                                <div className="flex items-center justify-center w-12 h-12 mb-4 bg-purple-100 rounded-xl dark:bg-purple-900/30">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={2}
                                        stroke="currentColor"
                                        className="w-6 h-6 text-purple-600 dark:text-purple-400"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                                        />
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                                        />
                                    </svg>
                                </div>
                                <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
                                    Visit Us
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-white/70">
                                    Rm 1108, 320 Gangnam-daero, Gangnam-gu, Seoul, Republic of Korea
                                </p>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="lg:col-span-2">
                            <div className="p-8 bg-white border border-gray-200 shadow-lg rounded-2xl dark:border-white/10 dark:bg-deepcharcoal">
                                <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
                                    Send us a Message
                                </h2>

                                {/* {submitted && (
                                    <div className="p-4 mb-6 border-l-4 border-green-500 rounded-xl bg-green-50 dark:bg-green-900/20">
                                        <div className="flex items-center gap-3">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth={2}
                                                stroke="currentColor"
                                                className="w-6 h-6 text-green-600 dark:text-green-400"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                />
                                            </svg>
                                            <p className="text-sm font-semibold text-green-900 dark:text-green-100">
                                                Thank you! Your message has been sent successfully.
                                                We'll get back to you soon.
                                            </p>
                                        </div>
                                    </div>
                                )} */}

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Name */}
                                    <div>
                                        <Input
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
                                        />
                                    </div>

                                    {/* Email and Phone */}
                                    <div className="grid gap-2 sm:grid-cols-2">
                                        <div>
                                            <Input
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
                                            />
                                        </div>

                                        <div>
                                            <Input
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
                                            />
                                        </div>
                                    </div>

                                    {/* Subject */}
                                    <div>
                                        <Input
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
                                        />
                                    </div>

                                    {/* Message */}
                                    <div>
                                        <Textarea
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
                                        />
                                    </div>

                                    {/* Submit Button */}
                                    <PrimaryButton
                                        Text={'Send Message'}
                                        Type={'submit'}
                                        Icon={
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth={2}
                                                stroke="currentColor"
                                                className="w-5 h-5"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                                                />
                                            </svg>
                                        }
                                        Disabled={processing}
                                        Spinner={processing}
                                        CustomClass={'w-full'}
                                    />
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
