import Card from '@/Components/Card';
import LinkButton from '@/Components/LinkButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BreadCrumb from '@/Components/BreadCrumb';
import { Head } from '@inertiajs/react';
import React from 'react';

export default function index() {
    return (
        <AuthenticatedLayout>
            <Head title="System Logs" />

            <BreadCrumb
                header={'System Logs'}
                parent={'Dashboard'}
                parent_link={route('dashboard')}
                child={'System Logs'}
            />

            <Card
                Content={
                    <>
                        <div className="flex flex-wrap justify-end gap-4 my-3">
                            <LinkButton
                                Text={'Back To Dashboard'}
                                URL={route('dashboard')}
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

                        <div className="grid grid-cols-1 gap-5 my-10 sm:grid-cols-2">
                            <Card
                                CustomCss={
                                    'flex justify-center items-center flex-col max-w-lg mx-auto min-h-[400px]'
                                }
                                Content={
                                    <>
                                        <div className="flex items-center justify-center w-20 h-20 mb-3 bg-gray-100 rounded-full">


                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`size-10 dark:border-white`}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
                                            </svg>

                                        </div>

                                        <h2 className="mb-2 text-xl font-semibold text-center text-gray-800 dark:text-white">
                                            Customer Email Address Change Logs
                                        </h2>

                                        <p className="mb-6 leading-relaxed text-center text-gray-600 dark:text-white">
                                            View your application Customer Email Address Change Logs and All Email Logs from
                                            one place.
                                        </p>

                                        <LinkButton
                                            URL={route('dashboard.system-logs.email-change-logs.index')}
                                            Text={'View Logs'}
                                            CustomClass="w-full md:w-[280px] "
                                            Icon={
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
                                                </svg>

                                            }
                                        />
                                    </>
                                }
                            />

                            <Card
                                CustomCss={
                                    'flex justify-center items-center flex-col max-w-lg mx-auto min-h-[400px]'
                                }
                                Content={
                                    <>
                                        <div className="flex items-center justify-center w-20 h-20 mb-3 bg-gray-100 rounded-full">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`size-10 dark:border-white`}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
                                            </svg>

                                        </div>

                                        <h2 className="mb-2 text-xl font-semibold text-center text-gray-800 dark:text-white">
                                            Customer Shipping Address Change Logs
                                        </h2>

                                        <p className="mb-6 leading-relaxed text-center text-gray-600 dark:text-white">
                                            View your application Customer Shipping Address Change Logs and All Address Changes Logs from
                                            one place.
                                        </p>

                                        <LinkButton
                                            URL={route('dashboard.system-logs.shipping-address-change-logs.index')}
                                            Text={'View Logs'}
                                            CustomClass="w-full md:w-[280px] mt-10 "
                                            Icon={
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
                                                </svg>
                                            }
                                        />
                                    </>
                                }
                            />




                            <Card
                                CustomCss={
                                    'flex justify-center items-center flex-col max-w-lg mx-auto min-h-[400px]'
                                }
                                Content={
                                    <>
                                        <div className="flex items-center justify-center w-20 h-20 mb-3 bg-gray-100 rounded-full">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`size-10 dark:border-white`}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
                                            </svg>

                                        </div>

                                        <h2 className="mb-2 text-xl font-semibold text-center text-gray-800 dark:text-white">
                                            Unsettled Account Notification Logs
                                        </h2>

                                        <p className="mb-6 leading-relaxed text-center text-gray-600 dark:text-white">
                                            View your application Unsettled Account Notification Logs Logs and All Notification  Logs from
                                            one place.
                                        </p>

                                        <LinkButton
                                            URL={route('dashboard.system-logs.unsettled-account-notification-logs.index')}
                                            Text={'View Logs'}
                                            CustomClass="w-full md:w-[280px] mt-10 "
                                            Icon={
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
                                                </svg>
                                            }
                                        />
                                    </>
                                }
                            />


                        </div>
                    </>
                }
            />
        </AuthenticatedLayout>
    );
}
