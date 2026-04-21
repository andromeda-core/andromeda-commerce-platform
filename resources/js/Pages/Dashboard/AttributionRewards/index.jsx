import Card from '@/Components/Card';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BreadCrumb from '@/Components/BreadCrumb';
import PrimaryButton from '@/Components/PrimaryButton';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import Table from '@/Components/Table';
import { useEffect, useState } from 'react';
import can from '@/Hooks/useCan';

const StatusBadge = ({ status }) => {
    const map = {
        accrued: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        released: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        reversed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    return (
        <span
            className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${map[status] ?? map.accrued}`}
        >
            {status?.charAt(0).toUpperCase() + status?.slice(1)}
        </span>
    );
};

const ReleaseButton = ({ reward }) => {
    const { put, processing } = useForm();

    if (reward.status !== 'accrued') return null;

    return (
        <PrimaryButton
            Text="Release"
            Type="button"
            CustomClass="w-[100px]"
            Spinner={processing}
            Disabled={processing}
            Action={() => put(route('dashboard.attribution-rewards.update', reward.id))}
            Icon={
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-4"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"
                    />
                </svg>
            }
        />
    );
};

export default function Index({ attribution_rewards }) {
    const { props } = usePage();

    const canEdit = can('Attribution Rewards Edit');
    const canViewOrder = can('Orders View');
    const currency = props?.currency;

    const {
        data: BulkselectedIds,
        setData: setBulkSelectedIds,
        delete: BulkDelete,
        reset: resetBulkSelectedIds,
    } = useForm({ ids: [] });

    const {
        data: SingleSelectedId,
        setData: setSingleSelectedId,
        delete: SingleDelete,
        reset: resetSingleSelectedId,
    } = useForm({ id: null });

    const [columns, setColumns] = useState([]);

    useEffect(() => {
        setColumns([
            {
                label: 'Order',
                render: (item) =>
                    canViewOrder ? (
                        <Link
                            href={route('dashboard.orders.show', item.order?.id)}
                            className="text-sm font-medium text-blue-500 hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
                        >
                            #{item.order?.order_no ?? 'N/A'}
                        </Link>
                    ) : (
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            #{item.order?.order_no ?? 'N/A'}
                        </span>
                    ),
            },
            {
                label: 'Product',
                render: (item) => (
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                        {item.smartphone?.model_name?.name ?? 'N/A'}
                    </span>
                ),
            },
            {
                label: 'Partner',
                render: (item) => (
                    <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {item.rewarded_to?.name ?? 'N/A'}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                            {item.rewarded_to?.email ?? ''}
                        </p>
                    </div>
                ),
            },
            // Reward Base
            {
                label: 'Reward Base',
                render: (item) => (
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                        {currency?.symbol ?? '$'}
                        {parseFloat(item.order_amount).toFixed(2)}
                    </span>
                ),
            },

            // Calculation
            {
                label: 'Calculation',
                render: (item) => (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                        {item.calculation_type === 'percentage'
                            ? `${item.calculation_value}%`
                            : `${currency?.symbol ?? '$'}${item.calculation_value} Fixed`}
                    </span>
                ),
            },

            // Reward Amount
            {
                label: 'Reward Amount',
                render: (item) => (
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                        {currency?.symbol ?? '$'}
                        {parseFloat(item.reward_amount).toFixed(2)}
                    </span>
                ),
            },
            {
                label: 'Status',
                render: (item) => <StatusBadge status={item.status} />,
            },
            {
                label: 'Released At',
                render: (item) => (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                        {item.released_at ?? '—'}
                    </span>
                ),
            },
            {
                label: 'Reversed At',
                render: (item) => (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                        {item.reversed_at ?? '—'}
                    </span>
                ),
            },
            ...(canEdit
                ? [
                      {
                          label: 'Action',
                          render: (item) => <ReleaseButton reward={item} />,
                      },
                  ]
                : []),
        ]);
    }, [canEdit]);

    return (
        <AuthenticatedLayout>
            <Head title="Attribution Rewards" />

            <BreadCrumb
                header="Attribution Rewards"
                parent="Dashboard"
                parent_link={route('dashboard')}
                child="Attribution Rewards"
            />

            <Card
                Content={
                    <Table
                        setBulkSelectedIds={setBulkSelectedIds}
                        setSingleSelectedId={setSingleSelectedId}
                        SingleSelectedId={SingleSelectedId}
                        resetBulkSelectedIds={resetBulkSelectedIds}
                        resetSingleSelectedId={resetSingleSelectedId}
                        BulkDeleteMethod={BulkDelete}
                        SingleDeleteMethod={SingleDelete}
                        DeleteAction={false}
                        canSelect={false}
                        Search={false}
                        items={attribution_rewards}
                        props={props}
                        columns={columns}
                        customActions={[]}
                    />
                }
            />
        </AuthenticatedLayout>
    );
}
