import Card from '@/Components/Card';
import LinkButton from '@/Components/LinkButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BreadCrumb from '@/Components/BreadCrumb';
import { Head } from '@inertiajs/react';
import React from 'react';

export default function edit({ supplier }) {
    return (
        <>
            <AuthenticatedLayout>
                <Head title="Suppliers" />

                <BreadCrumb
                    header={'View Supplier'}
                    parent={'Suppliers'}
                    parent_link={route('dashboard.suppliers.index')}
                    child={'View Supplier'}
                />

                <Card
                    Content={
                        <>
                            <div className="flex flex-wrap justify-end gap-4 my-3">
                                <LinkButton
                                    Text={'Edit Supplier'}
                                    URL={route('dashboard.suppliers.edit', supplier.id)}
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
                                                d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
                                            />
                                        </svg>
                                    }
                                />

                                <LinkButton
                                    Text={'Back To Suppliers'}
                                    URL={route('dashboard.suppliers.index')}
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

                            <div className="max-w-3xl px-4 mx-auto mt-10">
                                <div className="p-8 bg-white shadow-xl rounded-2xl dark:bg-deepcharcoal dark:text-white/80">
                                    <div className="flex flex-col items-center justify-center md:flex-row md:items-start md:space-x-8">
                                        {/* Avatar */}
                                        <div className="flex-shrink-0 mb-6 text-center md:mb-0">
                                            <div className="flex items-center justify-center text-5xl font-bold text-blue-800 bg-blue-100 border-4 border-blue-500 rounded-full h-36 w-36 dark:border-white dark:bg-white/10 dark:text-white">
                                                {supplier?.user?.avatar}
                                            </div>
                                        </div>

                                        {/* Details */}
                                        <div className="w-full space-y-4">
                                            {/* Name */}
                                            <div>
                                                <label className="block mb-1 text-sm font-medium text-gray-600 dark:text-white/70">
                                                    Full Name
                                                </label>
                                                <input
                                                    type="text"
                                                    value={supplier?.user?.name}
                                                    readOnly
                                                    disabled
                                                    className="w-full px-4 py-2 text-gray-800 border border-gray-300 rounded-md shadow-sm bg-gray-50 dark:border-gray-700 dark:bg-deepcharcoal dark:text-white"
                                                />
                                            </div>

                                            {/* Email */}
                                            <div>
                                                <label className="block mb-1 text-sm font-medium text-gray-600 dark:text-white/70">
                                                    Email Address
                                                </label>
                                                <input
                                                    type="email"
                                                    value={supplier?.user?.email}
                                                    readOnly
                                                    disabled
                                                    className="w-full px-4 py-2 text-gray-800 border border-gray-300 rounded-md shadow-sm bg-gray-50 dark:border-gray-700 dark:bg-deepcharcoal dark:text-white"
                                                />
                                            </div>

                                            {/* Phone */}
                                            <div>
                                                <label className="block mb-1 text-sm font-medium text-gray-600 dark:text-white/70">
                                                    Phone Number
                                                </label>
                                                <input
                                                    type="text"
                                                    value={supplier?.user?.phone}
                                                    readOnly
                                                    disabled
                                                    className="w-full px-4 py-2 text-gray-800 border border-gray-300 rounded-md shadow-sm bg-gray-50 dark:border-gray-700 dark:bg-deepcharcoal dark:text-white"
                                                />
                                            </div>

                                            {/* Company */}
                                            <div>
                                                <label className="block mb-1 text-sm font-medium text-gray-600 dark:text-white/70">
                                                    Company Name
                                                </label>
                                                <input
                                                    type="text"
                                                    value={supplier?.company_name}
                                                    readOnly
                                                    disabled
                                                    className="w-full px-4 py-2 text-gray-800 border border-gray-300 rounded-md shadow-sm bg-gray-50 dark:border-gray-700 dark:bg-deepcharcoal dark:text-white"
                                                />
                                            </div>

                                            <div className="flex gap-4">
                                                {/* Roles */}
                                                <div>
                                                    <label className="block mb-1 text-sm font-medium text-gray-600 dark:text-white/70">
                                                        Role(s)
                                                    </label>
                                                    <div className="flex flex-wrap gap-2">
                                                        {supplier?.user?.roles &&
                                                            supplier?.user?.roles.length > 0 ? (
                                                            supplier?.user?.roles.map(
                                                                (role, index) => (
                                                                    <span
                                                                        key={index}
                                                                        className="px-3 py-1 text-sm font-medium text-blue-800 bg-blue-100 rounded-full dark:bg-blue-900 dark:text-white"
                                                                    >
                                                                        {role.name}
                                                                    </span>
                                                                ),
                                                            )
                                                        ) : (
                                                            <span className="text-sm text-red-500">
                                                                No role assigned
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>


                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    }
                />
            </AuthenticatedLayout>
        </>
    );
}
