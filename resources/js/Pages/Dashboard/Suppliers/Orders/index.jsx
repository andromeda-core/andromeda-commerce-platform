import Card from '@/Components/Card';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BreadCrumb from '@/Components/BreadCrumb';
import { Head, Link, usePage } from '@inertiajs/react';
import Table from '@/Components/Table';

import { useMemo, useState } from 'react';
import SelectInput from '@/Components/SelectInput';
import can from '@/Hooks/useCan';

export default function index({ orders }) {

    const { props } = usePage();

    const { currency } = usePage().props;

    const [expandedStock, setExpandedStock] = useState({});
    const toggleStock = (orderId) => {
        setExpandedStock((prev) => ({
            ...prev,
            [orderId]: !prev?.[orderId],
        }));
    };



    const canViewOrder = can('Orders View');
    const canViewSupplier = can('Suppliers View');

    const columns = useMemo(() => {
        return [
            {
                label: 'Order No',
                render: (item) => {
                    if (canViewOrder) {
                        return (
                            <Link
                                href={route('dashboard.orders.show', item?.order?.id)}
                                className="text-blue-500 underline cursor-pointer"
                            >
                                {item?.order?.order_no}
                            </Link>
                        );

                    } else {
                        return (
                            <p

                                className="text-black dark:text-white"
                            >
                                {item?.order?.order_no}
                            </p>
                        );
                    }
                },
            },


            {
                label: "Fulfillment",
                render: (item) => {
                    const stock = item?.stock_needed;
                    const canFulfill = item?.status === 'assigned' && stock && !stock.is_complete;

                    if (!canFulfill) {
                        return <span className="text-gray-500">—</span>;
                    }



                    return (
                        <Link
                            className="inline-block px-3 py-1 text-purple-600 underline rounded-lg"
                            href={route("dashboard.supplier-assigned-orders.fulfill", item?.id)}
                        >
                            Fulfill Stock
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

            { key: 'order.shipping_country', label: 'Destination Country' },

            {
                label: 'Total Amount',
                render: (item) => {
                    return (
                        <span className="p-2 text-white bg-gray-500 rounded-lg">
                            {currency?.symbol}
                            {Number(item?.order?.full_amount).toLocaleString('en-US')}
                        </span>
                    );
                },
            },



            {
                label: 'Assigned By',
                render: (item) => {
                    if (item?.assigned_by?.name) {
                        return (
                            <span className="p-2 rounded-lg text-violet-500">
                                {item?.assigned_by?.name}
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
                label: 'Supplier',
                render: (item) => {
                    if (canViewSupplier) {
                        if (item?.supplier?.user?.name) {
                            return (
                                <span className="p-2">
                                    <Link className='text-blue-600 underline' href={route('dashboard.suppliers.show', item?.supplier?.id)}>{item?.supplier?.user?.name}</Link>
                                </span>
                            );
                        } else {
                            return (
                                "N/A"
                            )
                        }
                    } else {
                        if (item?.supplier?.user?.name) {
                            return (
                                <p

                                    className="text-black dark:text-white"
                                >
                                    {item?.supplier?.user?.name}
                                </p>
                            );
                        } else {
                            return (
                                "N/A"
                            )
                        }
                    }

                },
            },

            {
                label: 'Stock Assignment Status',
                render: (item) => {
                    if (item?.status) {
                        return (
                            <span className="p-2 text-white rounded-lg bg-violet-500">
                                {item?.status.replace(/_/g, ' ').toUpperCase()}
                            </span>
                        );
                    } else {
                        return (
                            "N/A"
                        )
                    }
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
                <Head title="Supplier Assigned Orders" />

                <BreadCrumb
                    header={'Supplier Assigned Orders'}
                    parent={'Dashboard'}
                    parent_link={route('dashboard')}
                    child={'Supplier Assigned Orders'}
                />

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
                                EditRoute={null}
                                SearchRoute={'dashboard.supplier-assigned-orders.index'}
                                Search={true}
                                DefaultSearchInput={true}
                                items={orders}
                                props={props}
                                columns={columns}
                                searchProps={{ status: status }}
                                ParentSearched={parentSearched}
                                DeleteAction={false}
                                canSelect={false}
                                customSearch={
                                    <>
                                        <div className="relative">
                                            <SelectInput
                                                CustomCss={'w-auto md:w-[250px]'}
                                                InputName={'Status'}
                                                items={[
                                                    { id: 'assigned', name: 'Assigned' },
                                                    { id: 'fulfilled', name: 'Fulfilled' },

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
