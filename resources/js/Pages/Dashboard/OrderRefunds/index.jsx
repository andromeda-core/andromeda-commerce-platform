import Card from '@/Components/Card';
import LinkButton from '@/Components/LinkButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BreadCrumb from '@/Components/BreadCrumb';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import Table from '@/Components/Table';

import { useEffect, useState } from 'react';
import SelectInput from '@/Components/SelectInput';
import can from '@/Hooks/useCan';

export default function index({ order_refunds }) {
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

    const { currency } = usePage().props;
    const [columns, setColumns] = useState([]);
    useEffect(() => {
        const columns = [
            {
                label: 'Order No',
                render: (item) => {
                    return (
                        <Link
                            href={route('dashboard.orders.show', item?.order?.id)}
                            className="text-blue-500 underline cursor-pointer"
                        >
                            {item?.order?.order_no ?? 'N/A'}
                        </Link>
                    );
                },
            },
            { key: 'customer.user.name', label: 'Customer Name' },
            { key: 'customer.user.email', label: 'Customer Email' },
            { key: 'customer.user.phone', label: 'Customer Phone' },



            {
                label: 'Status',
                render: (item) => {
                    return (
                        <span className="p-2 text-white bg-indigo-500 rounded-lg">
                            {item.refund_status.replace(/_/g, ' ').toUpperCase()}
                        </span>
                    )
                },
            },


            {
                label: 'Order Payment Method',
                render: (item) => {
                    return (
                        <span className="p-2 text-white bg-gray-500 rounded-lg">
                            {item.order?.payment_method?.replace(/_/g, ' ').toUpperCase()}
                        </span>
                    );
                },
            },

            {
                label: 'Refund Amount',
                render: (item) => {
                    return (
                        <span className="p-2 text-white bg-gray-500 rounded-lg">
                            {currency?.symbol}
                            {item.refund_amount}
                        </span>
                    );
                },
            },

            { key: 'requested_at', label: 'Requested At' },
            { key: 'approved_at', label: 'Approved At' },
            { key: 'rejected_at', label: 'Rejected At' },
            { key: 'completed_at', label: 'Completed At' },
            { key: 'added_at', label: 'Added At' },
        ];



        setColumns(columns);
    }, []);

    const [status, setStatus] = useState(props.refund_status ?? '');
    const [parentSearched, setParentSearched] = useState(false);

    return (
        <>
            <AuthenticatedLayout>
                <Head title="Order Refunds" />

                <BreadCrumb
                    header={'Order Refunds'}
                    parent={'Dashboard'}
                    parent_link={route('dashboard')}
                    child={'Order Refunds'}
                />

                <Card
                    Content={
                        <>
                            <Table
                                setBulkSelectedIds={setBulkSelectedIds}
                                setSingleSelectedId={setSingleSelectedId}
                                SingleSelectedId={SingleSelectedId}
                                resetBulkSelectedIds={resetBulkSelectedIds}
                                resetSingleSelectedId={resetSingleSelectedId}
                                BulkDeleteMethod={BulkDelete}
                                SingleDeleteMethod={SingleDelete}
                                DeleteAction={false}
                                EditRoute={can('Order Refunds Edit') ? 'dashboard.order-refunds.edit' : null}
                                SearchRoute={'dashboard.order-refunds.index'}
                                Search={true}
                                DefaultSearchInput={false}
                                items={order_refunds}
                                props={props}
                                columns={columns}
                                searchProps={{ refund_status: status }}
                                ParentSearched={parentSearched}
                                canSelect={false}
                                customSearch={
                                    <>
                                        <div className="relative">
                                            <SelectInput
                                                CustomCss={'w-auto md:w-[250px]'}
                                                InputName={'Status'}
                                                items={[
                                                    {
                                                        id: 'requested',
                                                        name: "Requested"
                                                    },
                                                    {
                                                        id: 'approved',
                                                        name: "Approved"
                                                    },
                                                    {
                                                        id: 'rejected',
                                                        name: "Rejected"
                                                    },
                                                    {
                                                        id: 'completed',
                                                        name: "Completed"
                                                    },
                                                ]}
                                                itemKey={'name'}
                                                Value={status}
                                                Action={(value) => {
                                                    setStatus(value);
                                                    setParentSearched(true);
                                                }}
                                            />
                                        </div>
                                    </>
                                }
                            />
                        </>
                    }
                />
            </AuthenticatedLayout>
        </>
    );
}
