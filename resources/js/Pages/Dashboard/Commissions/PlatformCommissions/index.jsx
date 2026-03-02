import Card from '@/Components/Card';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BreadCrumb from '@/Components/BreadCrumb';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import Table from '@/Components/Table';

import { useEffect, useState } from 'react';
import SelectInput from '@/Components/SelectInput';
import can from '@/Hooks/useCan';

export default function Index({ platform_commissions }) {
    const { props } = usePage();
    const { currency } = usePage().props;

    // Bulk Delete Form Data
    const {
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

    // Permissions (Supplier -> Platform)
    const canView = can('Platform Commissions View');

    const [columns, setColumns] = useState([]);

    // Status filter is virtual based on recorded_at
    const [status, setStatus] = useState(props.status ?? '');
    const [parentSearched, setParentSearched] = useState(false);

    useEffect(() => {
        const columns = [
            {
                key: 'order.order_no',
                label: 'Order No.',
                render: (item) => {
                    const orderNo = item?.order?.order_no ?? '-';

                    // If you have order show route, you can link it:
                    // const href = route('dashboard.orders.show', item?.order?.id);
                    // return <Link className="text-blue-500 underline" href={href}>{orderNo}</Link>;

                    return <span>{orderNo}</span>;
                },
            },
            {
                label: 'Commission Rate',
                render: (item) => {
                    return (
                        <span className="p-2 text-sm text-white bg-blue-500 rounded-lg">
                            {Number(item?.commission_rate ?? 0)}%
                        </span>
                    );
                },
            },
            {
                label: 'Commission Amount',
                render: (item) => {
                    return (
                        <span className="p-2 text-sm text-white bg-blue-500 rounded-lg">
                            {currency?.symbol}{item?.commission_amount ?? 0}
                        </span>
                    );
                },
            },
            {
                label: 'Payout Method',
                render: (item) => {
                    const method = item?.payout_method ?? '-';
                    return (
                        <span className="p-2 text-sm text-white bg-gray-800 rounded-lg">
                            {method.replace(/_/g, ' ').toUpperCase()}
                        </span>
                    );
                },
            },
            {
                label: 'Received Amount',
                render: (item) => {
                    const val = item?.received_amount;

                    if (val === null || val === undefined) {
                        return <span className="text-gray-500">Not recorded</span>;
                    }

                    const symbol = item?.currency?.symbol ?? '';
                    return (
                        <span className="p-2 text-sm text-white bg-green-600 rounded-lg">
                            {symbol}{val}
                        </span>
                    );
                },
            },
            {
                label: 'Received Method',
                render: (item) => {
                    return (
                        <span className="p-2 text-sm text-white bg-gray-700 rounded-lg">
                            {item?.received_method ? item?.received_method.replace(/_/g, ' ').toUpperCase() : 'Not recorded'}
                        </span>
                    );
                },
            },
            {
                label: 'Currency',
                render: (item) => {
                    const c = item?.currency;
                    if (!c) return <span className="text-gray-500">-</span>;
                    return <span>{c?.code ?? c?.name ?? '-'}</span>;
                },
            },
            {
                label: 'Record Status',
                render: (item) => {
                    const recorded = !!item?.recorded_at;
                    return (
                        <span
                            className={`${recorded ? 'bg-green-500' : 'bg-red-500'} rounded-lg p-2 text-white`}
                        >
                            {recorded ? 'Recorded' : 'Pending'}
                        </span>
                    );
                },
            },
            {
                key: 'recorded_at',
                label: 'Recorded At',
                render: (item) => item?.recorded_at ?? '-',
            },
            {
                label: 'Recorded By',
                render: (item) => item?.recorded_by ? (item?.recorded_by?.name ?? item?.recordedBy?.name ?? '-') : (item?.recordedBy?.name ?? '-'),
            },
            {
                key: 'added_at',
                label: 'Created At',
            },
        ];


        setColumns(columns);
    }, [canView, currency?.symbol]);

    return (
        <AuthenticatedLayout>
            <Head title="Platform Commissions" />

            <BreadCrumb
                header={'Platform Commissions'}
                parent={'Dashboard'}
                parent_link={route('dashboard')}
                child={'Platform Commissions'}
            />

            <Card
                Content={
                    <Table
                        SingleSelectedId={SingleSelectedId}
                        setBulkSelectedIds={setBulkSelectedIds}
                        setSingleSelectedId={setSingleSelectedId}
                        resetBulkSelectedIds={resetBulkSelectedIds}
                        resetSingleSelectedId={resetSingleSelectedId}
                        BulkDeleteMethod={BulkDelete}
                        SingleDeleteMethod={SingleDelete}
                        BulkDeleteRoute={'dashboard.commissions.platform-commissions.destroybyselection'}
                        SingleDeleteRoute={'dashboard.commissions.platform-commissions.destroy'}
                        EditRoute={
                            can('Platform Commissions Edit')
                                ? 'dashboard.commissions.platform-commissions.edit'
                                : null
                        }
                        SearchRoute={'dashboard.commissions.platform-commissions.index'}
                        Search={true}
                        DefaultSearchInput={true}
                        items={platform_commissions}
                        props={props}
                        columns={columns}
                        searchProps={{ status: status }}
                        ParentSearched={parentSearched}
                        DeleteAction={can('Platform Commissions Delete')}
                        canSelect={can('Platform Commissions Delete')}
                        customSearch={
                            <div className="relative">
                                <SelectInput
                                    CustomCss={'w-auto md:w-[250px]'}
                                    InputName={'Status'}
                                    items={[
                                        { id: 'pending', name: 'Pending' },
                                        { id: 'recorded', name: 'Recorded' },
                                    ]}
                                    itemKey={'name'}
                                    Value={status}
                                    Action={(value) => {
                                        setStatus(value);
                                        setParentSearched(true);
                                    }}
                                />
                            </div>
                        }
                    />
                }
            />
        </AuthenticatedLayout>
    );
}
