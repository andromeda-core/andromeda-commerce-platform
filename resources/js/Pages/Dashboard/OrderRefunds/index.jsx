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
                            className="cursor-pointer text-blue-500 underline"
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
                label: 'Defect Evidance Video',
                render: (item) => {
                    if (item?.defect_evidence_video) {
                        return (
                            <a
                                target={'__blank'}
                                href={item?.defect_evidence_video}
                                className="rounded-lg p-2 text-indigo-500 underline"
                            >
                                View View
                            </a>
                        );
                    } else {
                        return 'N/A';
                    }
                },
            },

            {
                label: 'Return Packaging Video',
                render: (item) => {
                    if (item?.return_packaging_video) {
                        return (
                            <a
                                target={'__blank'}
                                href={item?.return_packaging_video}
                                className="rounded-lg p-2 text-indigo-500 underline"
                            >
                                View View
                            </a>
                        );
                    } else {
                        return 'N/A';
                    }
                },
            },

            {
                label: 'Order Status',
                render: (item) => {
                    return (
                        <span className="rounded-lg bg-indigo-500 p-2 text-white">
                            {item.order?.previous_status
                                ? item.order?.previous_status.replace(/_/g, ' ').toUpperCase()
                                : item.order?.status.replace(/_/g, ' ').toUpperCase()}
                        </span>
                    );
                },
            },

            {
                label: 'Refund Auto Rejected',
                render: (item) => {
                    return item.is_auto_rejected ? (
                        <span className="rounded-lg bg-red-500 p-2 text-white">Yes</span>
                    ) : (
                        <span className="rounded-lg bg-green-500 p-2 text-white">No</span>
                    );
                },
            },

            {
                label: 'Status',
                render: (item) => {
                    return (
                        <span className="rounded-lg bg-indigo-500 p-2 text-white">
                            {item.refund_status.replace(/_/g, ' ').toUpperCase()}
                        </span>
                    );
                },
            },

            {
                label: 'Order Payment Method',
                render: (item) => {
                    return (
                        <span className="rounded-lg bg-gray-500 p-2 text-white">
                            {item.order?.payment_method?.replace(/_/g, ' ').toUpperCase()}
                        </span>
                    );
                },
            },

            {
                label: 'Refund Amount',
                render: (item) => {
                    return (
                        <span className="rounded-lg bg-gray-500 p-2 text-white">
                            {currency?.symbol}
                            {Number(item.refund_amount).toLocaleString('en-US')}
                        </span>
                    );
                },
            },

            { key: 'requested_at', label: 'Requested At' },
            { key: 'approved_at', label: 'Approved At' },
            { key: 'rejected_at', label: 'Rejected At' },
            { key: 'completed_at', label: 'Completed At' },
            { key: 'withdrawn_at', label: 'Withdrawn At' },
            { key: 'return_tracking_uploaded_at', label: 'Return Tracking Uploaded At' },
            { key: 'return_tracking_deadline_at', label: 'Return Tracking Deadline At' },
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
                                DeleteAction={false}
                                EditRoute={
                                    can('Order Refunds Edit')
                                        ? 'dashboard.order-refunds.edit'
                                        : null
                                }
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
                                                        name: 'Requested',
                                                    },
                                                    {
                                                        id: 'approved',
                                                        name: 'Approved',
                                                    },
                                                    {
                                                        id: 'rejected',
                                                        name: 'Rejected',
                                                    },
                                                    {
                                                        id: 'completed',
                                                        name: 'Completed',
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
