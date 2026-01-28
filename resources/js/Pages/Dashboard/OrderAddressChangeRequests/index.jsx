import Card from '@/Components/Card';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BreadCrumb from '@/Components/BreadCrumb';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import Table from '@/Components/Table';

import { useEffect, useState } from 'react';
import SelectInput from '@/Components/SelectInput';
import can from '@/Hooks/useCan';

export default function index({ order_address_change_requests }) {
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
                            {item.status.replace(/_/g, ' ').toUpperCase()}
                        </span>
                    )
                },
            },



            { key: 'requested_at', label: 'Requested At' },
            { key: 'approved_at', label: 'Approved At' },
            { key: 'rejected_at', label: 'Rejected At' },
            { key: 'added_at', label: 'Added At' },
        ];



        setColumns(columns);
    }, []);

    const [status, setStatus] = useState(props.status ?? '');
    const [parentSearched, setParentSearched] = useState(false);

    return (
        <>
            <AuthenticatedLayout>
                <Head title="Order Address Changes" />

                <BreadCrumb
                    header={'Order Address Changes'}
                    parent={'Dashboard'}
                    parent_link={route('dashboard')}
                    child={'Order Address Changes'}
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
                                EditRoute={can('Order Address Changes Edit') ? 'dashboard.order-address-change-requests.edit' : null}
                                SearchRoute={'dashboard.order-address-change-requests.index'}
                                Search={true}
                                DefaultSearchInput={false}
                                items={order_address_change_requests}
                                props={props}
                                columns={columns}
                                searchProps={{ status: status }}
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
                                                    }

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
