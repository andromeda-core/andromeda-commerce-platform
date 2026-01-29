import React, { useEffect, useState } from 'react';
// Example: import dynamic icons (Lucide or Heroicons)
import * as HeroIcons from '@heroicons/react/24/outline';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import BreadCrumb from '@/Components/BreadCrumb';
import Card from '@/Components/Card';
import LinkButton from '@/Components/LinkButton';
import PrimaryButton from '@/Components/PrimaryButton';

export default function manage({ all_permissions, assigned_permissions = [], role_id }) {
    const [selected, setSelected] = useState(assigned_permissions);

    const toggleCheckbox = (id) => {
        setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    };

    const { data, setData, put, processing } = useForm({
        permission_ids: [],
    });

    useEffect(() => {
        setData('permission_ids', selected);
    }, [selected]);

    const submit = () => {
        put(route('dashboard.settings.permissions.sync', role_id));
    };

    const getAllIds = () => {
        return Object.values(all_permissions).flatMap((group) =>
            group.items.map((item) => item.id),
        );
    };
    return (
        <AuthenticatedLayout>
            <Head title="Settings - Manage Permissions" />

            <BreadCrumb
                header={'Settings - Manage Permissions'}
                parent={'Role'}
                parent_link={route('dashboard.settings.roles.index')}
                child={'Manage Permissions'}
            />

            <Card
                Content={
                    <>
                        <div className="flex flex-wrap justify-between my-1">
                            <label className="flex items-center gap-2 px-2 rounded-lg cursor-pointer ">
                                <input
                                    type="checkbox"
                                    className={
                                        selected.length === all_permissions.length
                                            ? 'mr-3 flex h-5 w-5 items-center justify-center rounded-md border-[1.25px] border-indigo-500 bg-indigo-500 dark:border-gray-700'
                                            : 'mr-3 flex h-5 w-5 items-center justify-center rounded-md border-[1.25px] border-gray-300 bg-transparent'
                                    }
                                    checked={selected.length === getAllIds().length}
                                    onChange={() => {
                                        if (selected.length === getAllIds().length) {
                                            setSelected([]);
                                        } else {
                                            setSelected(getAllIds());
                                        }
                                    }}
                                />
                                <span className="text-sm text-gray-700 dark:text-white/80">
                                    Select All
                                </span>
                            </label>

                            <LinkButton
                                Text={'Back To Roles'}
                                URL={route('dashboard.settings.roles.index')}
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

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            {Object.values(all_permissions).map((permissionGroup, index) => {
                                const Icon =
                                    HeroIcons[permissionGroup.icon] ||
                                    HeroIcons['QuestionMarkCircleIcon'];

                                return (
                                    <div
                                        key={index}
                                        className="w-full p-6 bg-white border shadow-md rounded-2xl dark:bg-deepcharcoal"
                                    >
                                        {/* Header with Icon + Parent Name */}
                                        <div className="flex items-center gap-3 mb-4">
                                            {Icon && (
                                                <Icon className="w-6 h-6 text-indigo-600 dark:text-white" />
                                            )}
                                            <h2 className="text-lg font-semibold text-gray-800 dark:text-white/80">
                                                {permissionGroup.parent_name}
                                            </h2>
                                        </div>

                                        {/* List of Items */}
                                        <div className="space-y-2">
                                            {permissionGroup.items?.map((item) => (
                                                <label
                                                    key={item.id}
                                                    className="flex items-center gap-3 py-2 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        className={
                                                            selected.includes(item.id)
                                                                ? 'mr-1 flex h-5 w-5 items-center justify-center rounded-md border-[1.25px] border-indigo-500 bg-indigo-500 dark:border-gray-700'
                                                                : 'mr-1 flex h-5 w-5 items-center justify-center rounded-md border-[1.25px] border-gray-300 bg-transparent'
                                                        }
                                                        checked={selected.includes(item.id)}
                                                        onChange={() => toggleCheckbox(item.id)}
                                                    />
                                                    <span className="text-sm text-gray-700 dark:text-white/80">
                                                        {item.name}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <PrimaryButton
                            Text={'Update Permissions'}
                            Type={'submit'}
                            CustomClass={'w-[200px] '}
                            Disabled={processing}
                            Spinner={processing}
                            Action={submit}
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
        </AuthenticatedLayout>
    );
}
