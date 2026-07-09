import Card from '@/Components/Card';
import LinkButton from '@/Components/LinkButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BreadCrumb from '@/Components/BreadCrumb';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import Table from '@/Components/Table';
import SelectInput from '@/Components/SelectInput';

import { useEffect, useState } from 'react';
import can from '@/Hooks/useCan';

export default function index({ posts, postAuthors }) {
    // Bulk Delete Form Data
    const { props } = usePage();
    const canEdit = can('Posts Edit');
    const [postedBy, setPostedBy] = useState(props.user_id ?? '');
    const [parentSearched, setParentSearched] = useState(false);
    const {
        data: BulkselectedIds,
        setData: setBulkSelectedIds,
        delete: BulkDelete,
        reset: resetBulkSelectedIds,
    } = useForm({
        ids: [],
    });

    // Single Delete Form Data
    const {
        data: SingleSelectedId,
        setData: setSingleSelectedId,
        delete: SingleDelete,
        reset: resetSingleSelectedId,
    } = useForm({
        id: null,
    });

    const [columns, setColumns] = useState([]);
    const [actions, setActions] = useState([]);
    useEffect(() => {
        const columns = [
            {
                label: 'Post Title',
                render: (item) => {
                    return (
                        <Link
                            href={route('dashboard.posts.show', encodeURIComponent(item?.slug))}
                            className="cursor-pointer break-words text-blue-500 underline"
                        >
                            {item.title}
                        </Link>
                    );
                },
            },
            { key: 'location_name', label: 'Location Name' },
            { key: 'floor.name', label: 'Floor' },
            { key: 'tag', label: 'Tag' },

            {
                label: 'Post Type',
                render: (item) => {
                    return (
                        <span className="rounded-lg bg-blue-500 p-2 text-white">
                            {item.post_type.charAt(0).toUpperCase() +
                                item.post_type.slice(1).toLowerCase()}
                        </span>
                    );
                },
            },

            {
                label: 'Status',
                render: (item) => {
                    if (item.status === 1) {
                        return (
                            <span className="rounded-lg bg-green-500 p-3 text-white">Active</span>
                        );
                    } else {
                        return (
                            <span className="rounded-lg bg-red-500 p-2 text-white">In Active</span>
                        );
                    }
                },
            },

            { key: 'user.name', label: 'Posted By' },
            { key: 'added_at', label: 'Added At' },
        ];

        const customActions = [
            {
                label: 'View',
                type: 'link',
                href: (item) => route('dashboard.posts.show', encodeURIComponent(item.slug)),
            },

            ...(canEdit
                ? [
                      {
                          label: 'Edit',
                          type: 'link',
                          href: (item) =>
                              route('dashboard.posts.edit', encodeURIComponent(item.slug)),
                      },
                  ]
                : []),
        ];

        setActions(customActions);
        setColumns(columns);
    }, []);

    return (
        <>
            <AuthenticatedLayout>
                <Head title="Posts" />

                <BreadCrumb
                    header={'Posts'}
                    parent={'Dashboard'}
                    parent_link={route('dashboard')}
                    child={'Posts'}
                />

                <Card
                    Content={
                        <>
                            <div className="my-3 flex flex-wrap items-center justify-between gap-3">
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                    Total Posts: {posts?.total ?? 0}
                                </p>

                                {can('Posts Create') && (
                                    <LinkButton
                                        Text={'Create Post'}
                                        URL={route('dashboard.posts.create')}
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
                                )}
                            </div>

                            <Table
                                setBulkSelectedIds={setBulkSelectedIds}
                                setSingleSelectedId={setSingleSelectedId}
                                SingleSelectedId={SingleSelectedId}
                                resetBulkSelectedIds={resetBulkSelectedIds}
                                resetSingleSelectedId={resetSingleSelectedId}
                                BulkDeleteMethod={BulkDelete}
                                SingleDeleteMethod={SingleDelete}
                                BulkDeleteRoute={'dashboard.posts.destroybyselection'}
                                SingleDeleteRoute={'dashboard.posts.destroy'}
                                SearchRoute={'dashboard.posts.index'}
                                DeleteAction={can('Posts Delete')}
                                canSelect={can('Posts Edit')}
                                Search={true}
                                DefaultSearchInput={true}
                                items={posts}
                                props={props}
                                columns={columns}
                                customActions={actions}
                                searchProps={{ user_id: postedBy }}
                                ParentSearched={parentSearched}
                                customSearch={
                                    <div className="relative">
                                        <SelectInput
                                            CustomCss={'w-auto md:w-[250px]'}
                                            InputName={'Posted By'}
                                            items={postAuthors}
                                            itemKey={'name'}
                                            Value={postedBy}
                                            Action={(value) => {
                                                setPostedBy(value ?? '');
                                                setParentSearched(true);
                                            }}
                                        />
                                    </div>
                                }
                            />
                        </>
                    }
                />
            </AuthenticatedLayout>
        </>
    );
}
