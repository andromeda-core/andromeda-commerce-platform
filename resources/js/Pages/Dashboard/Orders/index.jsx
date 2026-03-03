import Card from '@/Components/Card';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BreadCrumb from '@/Components/BreadCrumb';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import Table from '@/Components/Table';

import { useMemo, useState } from 'react';
import SelectInput from '@/Components/SelectInput';
import can from '@/Hooks/useCan';
import Spinner from '@/Components/Spinner';
import { useConfirm } from '@/Hooks/useConfirm';

export default function index({ orders }) {
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

    const [cancelModal, setCancelModal] = useState(false);

    const { confirm, ConfirmDialog } = useConfirm();

    const [expandedStock, setExpandedStock] = useState({});
    const toggleStock = (orderId) => {
        setExpandedStock((prev) => ({
            ...prev,
            [orderId]: !prev?.[orderId],
        }));
    };

    // Toggle Cash Collected Status
    const { put } = useForm({});
    const toggleCashCollectedStatus = (id) => {
        put(route('dashboard.orders.updatecashcollectedstatus', id));
    };


    const canAssignSupplier = can("Orders Edit");
    const canCancelOrder = can("Orders Edit");


    const {
        data: cancelData,
        setData: setCancelData,
        put: cancelOrder,
        processing: cancelProcessing,
        errors: cancelErrors,
        reset: resetCancelForm,
        clearErrors: clearCancelErrors,
    } = useForm({
        order_id: null,
        reason: '',
    });

    const openCancelModal = (orderId) => {
        setCancelModal(true);
        clearCancelErrors();
        setCancelData({
            order_id: orderId,
            reason: '',
        });
    };

    const closeCancelModal = () => {
        setCancelModal(false);
        resetCancelForm();
        clearCancelErrors();
    };

    const submitCancel = async (e) => {
        e.preventDefault();

        const result = await confirm({
            title: 'Confirm Cancelation',
            text: 'Are you sure you want to Cancel this Order?',
            icon: 'info',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'No',
        });

        if (result.isConfirmed) {
            cancelOrder(route('dashboard.orders.cancel'), {
                preserveScroll: true,
                onSuccess: () => {
                    closeCancelModal();
                },
            });
        }


    };


    const actions = useMemo(() => {
        return [
            {
                label: "View",
                type: "link",
                href: (item) => route("dashboard.orders.show", item?.id),
            },


            {
                label: "Cancel Order",
                type: "button",
                onClick: (item) => {
                    openCancelModal(item?.id);
                },
                show: (item) => canCancelOrder && ['canceled', 'expired', 'refund_requested', 'refund_approved', 'refund_completed', 'refund_rejected', 'delivered', 'failed'].includes(item?.status) ? false : true,

            }

        ];
    }, []);

    const columns = useMemo(() => {
        return [
            {
                label: 'Order No',
                render: (item) => {
                    return (
                        <Link
                            href={route('dashboard.orders.show', item?.id)}
                            className="text-blue-500 underline cursor-pointer"
                        >
                            {item.order_no}
                        </Link>
                    );
                },
            },
            { key: 'customer.user.name', label: 'Customer Name' },
            { key: 'customer.user.email', label: 'Customer Email' },
            { key: 'customer.user.phone', label: 'Customer Phone' },


            {
                label: "Supplier",
                render: (item) => {
                    const assignment = item?.assigned_supplier;
                    const supplierName = assignment?.supplier?.user?.name;

                    const stock = item?.stock_needed;
                    if (assignment) {
                        return (
                            <div className="min-w-[180px]">
                                <span className="px-2 py-1 text-white bg-gray-700 rounded-lg">
                                    Assigned
                                </span>
                                {supplierName ? (
                                    <div className="mt-1 text-xs text-gray-600 dark:text-gray-300">
                                        Name: <Link className='text-blue-600 underline' href={route('dashboard.suppliers.show', assignment?.supplier?.id)}>{supplierName}</Link>
                                    </div>
                                ) : null}
                            </div>
                        );
                    }

                    if (!canAssignSupplier) {
                        return <span className="text-gray-400">Not Assigned</span>;
                    }


                    if (stock.is_complete) {
                        return (
                            <span className="px-2 py-1 text-white bg-green-600 rounded-lg">
                                Not Needed
                            </span>
                        );
                    }
                    return (
                        <Link
                            href={route("dashboard.orders.assignsupplier.index", item?.id)}
                            className="inline-block px-3 py-1 text-purple-600 rounded-lg"
                        >
                            Assign a Supplier
                        </Link>
                    );
                },
            },

            {
                label: 'Stock Needed',
                render: (item) => {
                    const stock = item?.stock_needed;
                    if (!stock) return <span className="text-gray-500">—</span>;

                    if (stock.is_complete) {
                        return (
                            <span className="px-2 py-1 text-white bg-green-600 rounded-lg">
                                READY
                            </span>
                        );
                    }

                    const isExpanded = !!expandedStock?.[item.id];
                    const items = stock.items || [];
                    const visibleItems = isExpanded ? items : items.slice(0, 3);

                    return (
                        <div className="min-w-[240px]">
                            <span className="px-2 py-1 text-white bg-red-600 rounded-lg">
                                MISSING: {stock.missing_total_qty}
                            </span>

                            <div className="mt-2 space-y-1">
                                {visibleItems.map((x, idx) => (
                                    <div key={`${item.id}-${idx}`} className="text-xs text-gray-700 dark:text-gray-300">
                                        • {x.name} <span className="font-semibold">(missing {x.missing})</span>
                                    </div>
                                ))}

                                {items.length > 3 && (
                                    <button
                                        type="button"
                                        onClick={() => toggleStock(item.id)}
                                        className="text-xs text-blue-600 underline dark:text-blue-400"
                                    >
                                        {isExpanded ? 'Show less' : `+${items.length - 3} more...`}
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                },
            },

            {
                label: 'Stock Assignment Status',
                render: (item) => {
                    if (item.assigned_supplier?.status) {
                        return (
                            <span className="p-2 text-white rounded-lg bg-violet-500">
                                {item.assigned_supplier?.status.replace(/_/g, ' ').toUpperCase()}
                            </span>
                        );
                    } else {
                        return (
                            "N/A"
                        )
                    }
                },
            },

            {
                label: 'Cash Collected Status',
                render: (item) => {
                    if (
                        item.status !== 'pending' &&
                        item.status !== 'failed' &&
                        item.status !== 'expired' &&
                        item.status !== 'awaiting_payment'
                    ) {
                        if (item.is_cash_collected === 1) {
                            return (
                                <>
                                    <label className="inline-flex items-center cursor-pointer">
                                        {can('Orders Edit') && (
                                            <>
                                                <input
                                                    type="checkbox"
                                                    value={item.is_cash_collected}
                                                    onChange={() =>
                                                        toggleCashCollectedStatus(item.id)
                                                    }
                                                    checked={item.is_cash_collected === 1}
                                                    className="sr-only peer"
                                                />
                                                <div className="peer relative h-6 w-11 rounded-full bg-gray-200 after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-green-500 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:border-gray-600 dark:bg-gray-700 dark:peer-checked:bg-green-500 dark:peer-focus:ring-green-800 rtl:peer-checked:after:-translate-x-full"></div>
                                            </>
                                        )}
                                        <span className="text-sm font-medium text-gray-900 ms-3 dark:text-gray-300">
                                            Yes
                                        </span>
                                    </label>
                                </>
                            );
                        } else {
                            return (
                                <>
                                    <label className="inline-flex items-center cursor-pointer">
                                        {can('Orders Edit') && (
                                            <>
                                                <input
                                                    type="checkbox"
                                                    value={item.is_cash_collected}
                                                    onChange={() =>
                                                        toggleCashCollectedStatus(item.id)
                                                    }
                                                    checked={false}
                                                    className="sr-only peer"
                                                />
                                                <div className="peer relative h-6 w-11 rounded-full bg-red-500 after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-red-500 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 dark:border-gray-600 dark:bg-red-500 dark:peer-checked:bg-red-500 dark:peer-focus:ring-red-800 rtl:peer-checked:after:-translate-x-full"></div>
                                            </>
                                        )}
                                        <span className="text-sm font-medium text-gray-900 ms-3 dark:text-gray-300">
                                            No
                                        </span>
                                    </label>
                                </>
                            );
                        }
                    } else {
                        return 'Not Applicable';
                    }
                },
            },



            {
                label: 'Status',
                render: (item) => {
                    if (item.status === 'pending') {
                        return (
                            <span className="p-2 text-yellow-800 bg-yellow-500 rounded-lg">
                                {item.status.replace(/_/g, ' ').toUpperCase()}
                            </span>
                        );
                    } else if (item.status === 'paid') {
                        return <span className="p-2 text-white bg-blue-500 rounded-lg"> {item.status.replace(/_/g, ' ').toUpperCase()}</span>;
                    } else if (item.status === 'shipped') {
                        return (
                            <span className="p-2 text-white bg-pink-500 rounded-lg"> {item.status.replace(/_/g, ' ').toUpperCase()}</span>
                        );
                    } else if (item.status === 'arrived_locally') {
                        return (
                            <span className="p-1 text-white rounded-lg bg-stone-500">
                                {item.status.replace(/_/g, ' ').toUpperCase()}
                            </span>
                        );
                    } else if (item.status === 'delivered') {
                        return (
                            <span className="p-2 text-white bg-green-500 rounded-lg">
                                {item.status.replace(/_/g, ' ').toUpperCase()}
                            </span>
                        );
                    } else if (item.status === 'awaiting_payment') {
                        return (
                            <span className="p-2 text-white bg-indigo-500 rounded-lg">
                                {item.status.replace(/_/g, ' ').toUpperCase()}
                            </span>
                        );
                    } else if (item.status === 'failed') {
                        return <span className="p-2 text-white bg-red-500 rounded-lg"> {item.status.replace(/_/g, ' ').toUpperCase()}</span>;
                    } else if (item.status === 'expired') {
                        return (
                            <span className="p-2 text-white bg-red-500 rounded-lg"> {item.status.replace(/_/g, ' ').toUpperCase()}</span>
                        );
                    } else if (item.status === 'blockchain_confirmation_pending') {
                        return (
                            <span className="p-2 text-white bg-indigo-500 rounded-lg">
                                {item.status.replace(/_/g, ' ').toUpperCase()}
                            </span>
                        );
                    } else {
                        return (
                            <span className="p-2 text-white bg-indigo-500 rounded-lg">
                                {item.status.replace(/_/g, ' ').toUpperCase()}
                            </span>
                        )
                    }
                },
            },

            {
                label: 'Default Payment Method',
                render: (item) => {
                    return (
                        <span className="p-2 text-white rounded-lg bg-violet-800">
                            {item.payment_method?.replace(/_/g, ' ').toUpperCase()}
                        </span>
                    );
                },
            },

            {
                label: 'Secondary Payment Method',
                render: (item) => {
                    return (
                        <span className="p-2 text-white rounded-lg bg-violet-800">
                            {item.secondary_payment_method?.replace(/_/g, ' ').toUpperCase() || "N/A"}
                        </span>
                    );
                },
            },

            {
                label: 'Remeaning Amount',
                render: (item) => {
                    return (
                        <span className="p-2 text-white bg-gray-500 rounded-lg">
                            {currency?.symbol}
                            {item.amount}
                        </span>
                    );
                },
            },


            {
                label: 'Paid With Points Amount',
                render: (item) => {
                    return (
                        <span className="p-2 text-white bg-gray-500 rounded-lg">
                            {currency?.symbol}
                            {item.points_used || 0}
                        </span>
                    );
                },
            },


            {
                label: 'Total Amount',
                render: (item) => {
                    return (
                        <span className="p-2 text-white bg-gray-500 rounded-lg">
                            {currency?.symbol}
                            {item.full_amount}
                        </span>
                    );
                },
            },

            { key: 'added_at', label: 'Added At' },
        ];
    }, [expandedStock, currency?.symbol])

    const [status, setStatus] = useState(props.status ?? '');
    const [parentSearched, setParentSearched] = useState(false);

    return (
        <>
            <AuthenticatedLayout>
                <Head title="Orders" />

                <BreadCrumb
                    header={'Orders'}
                    parent={'Dashboard'}
                    parent_link={route('dashboard')}
                    child={'Orders'}
                />

                <ConfirmDialog />

                <Card
                    Content={
                        <>
                            {/* {can('Orders Create') && (
                                <div className="flex flex-wrap justify-end my-3">
                                    <LinkButton
                                        Text={'Create Order'}
                                        URL={route('dashboard.orders.create')}
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
                            )} */}

                            <Table
                                setBulkSelectedIds={setBulkSelectedIds}
                                setSingleSelectedId={setSingleSelectedId}
                                SingleSelectedId={SingleSelectedId}
                                resetBulkSelectedIds={resetBulkSelectedIds}
                                resetSingleSelectedId={resetSingleSelectedId}
                                BulkDeleteMethod={BulkDelete}
                                SingleDeleteMethod={SingleDelete}
                                BulkDeleteRoute={'dashboard.orders.destroybyselection'}
                                SingleDeleteRoute={'dashboard.orders.destroy'}
                                EditRoute={can('Orders Edit') ? 'dashboard.orders.edit' : null}
                                SearchRoute={'dashboard.orders.index'}
                                Search={true}
                                DefaultSearchInput={true}
                                items={orders}
                                props={props}
                                columns={columns}
                                customActions={actions}
                                searchProps={{ status: status }}
                                ParentSearched={parentSearched}
                                DeleteAction={can('Orders Delete')}
                                canSelect={can('Orders Delete')}
                                customSearch={
                                    <>
                                        <div className="relative">
                                            <SelectInput
                                                CustomCss={'w-auto md:w-[250px]'}
                                                InputName={'Status'}
                                                items={[
                                                    { id: 'pending', name: 'Pending' },
                                                    { id: 'paid', name: 'Paid' },
                                                    { id: 'shipped', name: 'Shipped' },
                                                    {
                                                        id: 'arrived_locally',
                                                        name: 'Arrived Locally',
                                                    },
                                                    { id: 'delivered', name: 'Delivered' },
                                                    {
                                                        id: 'awaiting_payment',
                                                        name: 'Awaiting Payment',
                                                    },
                                                    { id: 'failed', name: 'Failed' },
                                                    { id: 'expired', name: 'Expired' },
                                                    {
                                                        id: 'blockchain_confirmation_pending',
                                                        name: 'Blockchain Confirmation Pending',
                                                    },
                                                    {
                                                        id: 'refund_requested',
                                                        name: "Refund Requested"
                                                    },
                                                    {
                                                        id: 'refund_approved',
                                                        name: "Refund Approved"
                                                    },
                                                    {
                                                        id: 'refund_rejected',
                                                        name: "Refund Rejected"
                                                    },
                                                    {
                                                        id: 'refund_completed',
                                                        name: "Refund Completed"
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


                {cancelModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                        {/* Backdrop */}
                        <div
                            className="absolute inset-0 bg-black/50"
                            onClick={closeCancelModal}
                        />

                        {/* Modal */}
                        <div className="relative z-10 w-full max-w-xl px-8 py-4 border rounded-md bg-backgroundLight animate-scale-in dark:bg-deepcharcoal border-surface-3-light dark:border-surface-3-dark">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        Cancel Order
                                    </h2>
                                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                                        Please provide a reason (minimum 30 characters). Customer will receive an email notification.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={closeCancelModal}
                                    className="p-2 text-gray-500 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                                >
                                    ✕
                                </button>
                            </div>

                            <form onSubmit={submitCancel} className="mt-5 space-y-4">
                                <div>
                                    <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
                                        Reason
                                    </label>

                                    <textarea
                                        rows={5}
                                        value={cancelData.reason}
                                        onChange={(e) => setCancelData('reason', e.target.value)}
                                        className={`w-full rounded-xl border px-4 py-3 text-sm dark:bg-gray-950 dark:text-white ${cancelErrors.reason
                                            ? 'border-red-500'
                                            : 'border-gray-300 dark:border-gray-700'
                                            }`}
                                        placeholder="Write the cancellation reason..."
                                    />

                                    {cancelErrors.reason && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {cancelErrors.reason}
                                        </p>
                                    )}

                                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                        {cancelData.reason?.length || 0}/1000
                                    </div>
                                </div>

                                <div className="flex items-center justify-end gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={closeCancelModal}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                                        disabled={cancelProcessing}
                                    >
                                        Close
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={cancelProcessing || (cancelData.reason?.length ?? 0) < 30}
                                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {cancelProcessing ? <Spinner /> : "Confirm Cancel"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </AuthenticatedLayout>
        </>
    );
}
