import BreadCrumb from '@/Components/BreadCrumb';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import React from 'react';

export default function ShowCategory({ category }) {
    return (
        <AuthenticatedLayout>
            <Head title="Categories" />

            <BreadCrumb
                header={'View Category'}
                parent={'Categories'}
                parent_link={route('dashboard.categories.index')}
                child={'View Category'}
            />

            <div className="mx-auto max-w-5xl space-y-8 p-6">
                {/* Category Card */}
                <div className="overflow-hidden rounded-2xl bg-white shadow dark:bg-zinc-900">
                    {/* Thumbnail */}
                    <div className="flex h-64 w-full items-center justify-center bg-gray-100 dark:bg-deepcharcoal">
                        {category?.thumbnail_url ? (
                            <img
                                src={category.thumbnail_url}
                                alt={category.name}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <span className="text-gray-400 dark:text-gray-500">
                                No Thumbnail Available
                            </span>
                        )}
                    </div>

                    {/* Content */}
                    <div className="space-y-4 p-6">
                        {/* Name */}
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            {category?.name}
                        </h1>

                        {/* Description */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-600 dark:text-gray-400">
                                Description
                            </label>
                            <p className="break-words text-gray-700 dark:text-gray-300">
                                {category?.short_description || 'No description provided.'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* smartphones List */}
                <div className="overflow-hidden rounded-2xl bg-white p-6 shadow dark:bg-deepcharcoal">
                    <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
                        Smartphones in this Category
                    </h2>

                    {category?.smartphones?.length > 0 ? (
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
                            {category.smartphones.map((smartphone) => (
                                <div
                                    onClick={() =>
                                        router.visit(
                                            route('dashboard.smartphones.show', smartphone.id),
                                        )
                                    }
                                    key={smartphone.id}
                                    className="cursor-pointer rounded-xl border border-gray-200 bg-gray-50 p-4 shadow-sm transition hover:shadow-md dark:border-gray-700 dark:bg-deepcharcoal"
                                >
                                    <div className="flex h-40 w-full items-center justify-center overflow-hidden rounded-lg bg-white dark:bg-deepcharcoal">
                                        {smartphone.smartphone_image_urls ? (
                                            <img
                                                src={smartphone.smartphone_image_urls[0]}
                                                alt={smartphone.model_name?.name}
                                                className="h-full w-full object-contain"
                                            />
                                        ) : (
                                            <span className="text-sm text-gray-400 dark:text-gray-500">
                                                No Image
                                            </span>
                                        )}
                                    </div>
                                    <div className="mt-3">
                                        <h3 className="text-md truncate font-medium text-gray-900 dark:text-white">
                                            {smartphone?.model_name?.name}
                                        </h3>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 dark:text-gray-400">
                            No Smartphone found in this category.
                        </p>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
