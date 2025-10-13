import Card from '@/Components/Card';
import LinkButton from '@/Components/LinkButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BreadCrumb from '@/Components/BreadCrumb';
import { Head } from '@inertiajs/react';
import React from 'react';

export default function edit({ collaborator }) {
    return (
        <>
            <AuthenticatedLayout>
                <Head title="Collaborators" />

                <BreadCrumb
                    header={'View Collaborator'}
                    parent={'Collaborators'}
                    parent_link={route('dashboard.collaborators.index')}
                    child={'View Collaborator'}
                />

                <Card
                    Content={
                        <>
                            <div className="my-3 flex flex-wrap justify-end gap-4">
                                <LinkButton
                                    Text={'Edit Collaborator'}
                                    URL={route('dashboard.collaborators.edit', collaborator.id)}
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
                                    Text={'Back To Collaborators'}
                                    URL={route('dashboard.collaborators.index')}
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

                            <div className="mx-auto mt-10 max-w-3xl px-4">
                                <div className="rounded-2xl bg-white p-8 shadow-xl dark:bg-deepcharcoal dark:text-white/80">
                                    <div className="flex flex-col items-center justify-center md:flex-row md:items-start md:space-x-8">
                                        {/* Avatar */}
                                        <div className="mb-6 flex-shrink-0 text-center md:mb-0">
                                            <div className="flex h-36 w-36 items-center justify-center rounded-full border-4 border-blue-500 bg-blue-100 text-5xl font-bold text-blue-800 dark:border-white dark:bg-white/10 dark:text-white">
                                                {collaborator?.user?.avatar}
                                            </div>
                                        </div>

                                        {/* Details */}
                                        <div className="w-full space-y-4">
                                            {/* Name */}
                                            <div>
                                                <label className="mb-1 block text-sm font-medium text-gray-600 dark:text-white/70">
                                                    Full Name
                                                </label>
                                                <input
                                                    type="text"
                                                    value={collaborator?.user?.name}
                                                    readOnly
                                                    className="w-full rounded-md border border-gray-300 bg-gray-50 px-4 py-2 text-gray-800 shadow-sm dark:border-gray-700 dark:bg-deepcharcoal dark:text-white"
                                                />
                                            </div>

                                            {/* Email */}
                                            <div>
                                                <label className="mb-1 block text-sm font-medium text-gray-600 dark:text-white/70">
                                                    Email Address
                                                </label>
                                                <input
                                                    type="email"
                                                    value={collaborator?.user?.email}
                                                    readOnly
                                                    className="w-full rounded-md border border-gray-300 bg-gray-50 px-4 py-2 text-gray-800 shadow-sm dark:border-gray-700 dark:bg-deepcharcoal dark:text-white"
                                                />
                                            </div>

                                            {/* Phone */}
                                            <div>
                                                <label className="mb-1 block text-sm font-medium text-gray-600 dark:text-white/70">
                                                    Phone Number
                                                </label>
                                                <input
                                                    type="text"
                                                    value={collaborator?.user?.phone}
                                                    readOnly
                                                    className="w-full rounded-md border border-gray-300 bg-gray-50 px-4 py-2 text-gray-800 shadow-sm dark:border-gray-700 dark:bg-deepcharcoal dark:text-white"
                                                />
                                            </div>

                                            {/* Type */}
                                            <div>
                                                <label className="mb-1 block text-sm font-medium text-gray-600 dark:text-white/70">
                                                    Type
                                                </label>
                                                <input
                                                    type="text"
                                                    value={collaborator?.type}
                                                    readOnly
                                                    className="w-full rounded-md border border-gray-300 bg-gray-50 px-4 py-2 text-gray-800 shadow-sm dark:border-gray-700 dark:bg-deepcharcoal dark:text-white"
                                                />
                                            </div>

                                            {/* Type */}
                                            <div>
                                                <label className="mb-1 block text-sm font-medium text-gray-600 dark:text-white/70">
                                                    Referral Code
                                                </label>
                                                <input
                                                    type="text"
                                                    value={collaborator?.referral_code}
                                                    readOnly
                                                    className="w-full rounded-md border border-gray-300 bg-gray-50 px-4 py-2 text-gray-800 shadow-sm dark:border-gray-700 dark:bg-deepcharcoal dark:text-white"
                                                />
                                            </div>

                                            {/* Bank Account */}
                                            <div>
                                                <label className="mb-1 block text-sm font-medium text-gray-600 dark:text-white/70">
                                                    Bank Account Number
                                                </label>
                                                <input
                                                    type="text"
                                                    value={collaborator?.bank_account_no}
                                                    readOnly
                                                    className="w-full rounded-md border border-gray-300 bg-gray-50 px-4 py-2 text-gray-800 shadow-sm dark:border-gray-700 dark:bg-deepcharcoal dark:text-white"
                                                />
                                            </div>

                                            {/* Address */}
                                            <div>
                                                <label className="mb-1 block text-sm font-medium text-gray-600 dark:text-white/70">
                                                    Address
                                                </label>
                                                <textarea
                                                    type="text"
                                                    value={collaborator?.address}
                                                    readOnly
                                                    className="w-full text-wrap break-words rounded-md border border-gray-300 bg-gray-50 px-4 py-2 text-gray-800 shadow-sm dark:border-gray-700 dark:bg-deepcharcoal dark:text-white"
                                                />
                                            </div>

                                            <div className="flex flex-wrap gap-4">
                                                {/* Roles */}
                                                <div>
                                                    <label className="mb-1 block text-sm font-medium text-gray-600 dark:text-white/70">
                                                        Role(s)
                                                    </label>
                                                    <div className="flex flex-wrap gap-2">
                                                        {collaborator?.user?.roles &&
                                                        collaborator?.user?.roles.length > 0 ? (
                                                            collaborator?.user?.roles.map(
                                                                (role, index) => (
                                                                    <span
                                                                        key={index}
                                                                        className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 dark:bg-blue-900 dark:text-white"
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

                                                {/* Status */}
                                                <div>
                                                    <label className="mb-1 block text-sm font-medium text-gray-600 dark:text-white/70">
                                                        Status
                                                    </label>
                                                    <div className="flex flex-wrap gap-2">
                                                        {collaborator?.user?.is_active == 1 ? (
                                                            <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800 dark:bg-green-900 dark:text-white">
                                                                Active
                                                            </span>
                                                        ) : (
                                                            <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-800 dark:bg-red-900 dark:text-white">
                                                                In-Active
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Point Accumulation */}
                                                <div>
                                                    <label className="mb-1 block text-sm font-medium text-gray-600 dark:text-white/70">
                                                        Point Accumulation Rate
                                                    </label>
                                                    <div className="flex flex-wrap gap-2">
                                                        {collaborator?.point_accumulation_rate ? (
                                                            <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800 dark:bg-green-900 dark:text-white">
                                                                {
                                                                    collaborator?.point_accumulation_rate
                                                                }
                                                                %
                                                            </span>
                                                        ) : (
                                                            <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 dark:bg-blue-900 dark:text-white">
                                                                Default
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Commission Rate */}
                                                <div>
                                                    <label className="mb-1 block text-sm font-medium text-gray-600 dark:text-white/70">
                                                        Commission Rate
                                                    </label>
                                                    <div className="flex flex-wrap gap-2">
                                                        {collaborator?.commission_rate ? (
                                                            <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800 dark:bg-green-900 dark:text-white">
                                                                {collaborator?.commission_rate}%
                                                            </span>
                                                        ) : (
                                                            <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 dark:bg-blue-900 dark:text-white">
                                                                Default
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
