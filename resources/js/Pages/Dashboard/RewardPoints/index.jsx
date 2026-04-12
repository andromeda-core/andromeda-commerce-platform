import Card from '@/Components/Card';
import LinkButton from '@/Components/LinkButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BreadCrumb from '@/Components/BreadCrumb';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import Table from '@/Components/Table';

import { useEffect, useState } from 'react';
import can from '@/Hooks/useCan';

export default function index({ reward_points }) {
    // Bulk Delete Form Data
    const { props } = usePage();
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
                label: 'User Name',
                render: (item) => {
                    return (
                        <Link
                            className="text-blue-500 underline"
                            href={route('dashboard.users.show', item?.user?.id)}
                        >
                            {item?.user?.name}
                        </Link>
                    );
                },
            },

            {

                label: 'Points',
                render: (item) => {
                    return (
                        <span className="p-2 text-white rounded-lg bg-violet-500">{Number(item?.points).toLocaleString('en-US')}</span>
                    );
                }

            },
            {
                key: 'expires_at',
                label: 'Expires At',
                badge: (value) => 'p-2 bg-red-500 rounded-lg text-white',
            },

            { key: 'added_at', label: 'Added At' },
        ];

        const customActions = [
            {
                label: 'View',
                type: 'link',
                href: (item) => route('dashboard.users.show', item?.user?.id),
            },
        ];

        setActions(customActions);
        setColumns(columns);
    }, []);

    return (
        <>
            <AuthenticatedLayout>
                <Head title="Reward Points" />

                <BreadCrumb
                    header={'Reward Points'}
                    parent={'Dashboard'}
                    parent_link={route('dashboard')}
                    child={'Reward Points'}
                />

                <Card
                    Content={
                        <>
                            {can('Reward Points Create') && (
                                <div className="flex flex-wrap justify-end my-3">
                                    <LinkButton
                                        Text={'Create Reward point'}
                                        URL={route('dashboard.reward-points.create')}
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
                                </div>
                            )}

                            <Table
                                setBulkSelectedIds={setBulkSelectedIds}
                                setSingleSelectedId={setSingleSelectedId}
                                SingleSelectedId={SingleSelectedId}
                                resetBulkSelectedIds={resetBulkSelectedIds}
                                resetSingleSelectedId={resetSingleSelectedId}
                                BulkDeleteMethod={BulkDelete}
                                SingleDeleteMethod={SingleDelete}
                                BulkDeleteRoute={'dashboard.reward-points.destroybyselection'}
                                SingleDeleteRoute={'dashboard.reward-points.destroy'}
                                EditRoute={
                                    can('Reward Points Edit')
                                        ? 'dashboard.reward-points.edit'
                                        : null
                                }
                                SearchRoute={'dashboard.reward-points.index'}
                                Search={true}
                                DefaultSearchInput={true}
                                items={reward_points}
                                props={props}
                                customActions={actions}
                                columns={columns}
                                DeleteAction={can('Reward Points Delete')}
                                canSelect={can('Reward Points Delete')}
                            />
                        </>
                    }
                />
            </AuthenticatedLayout>
        </>
    );
}
