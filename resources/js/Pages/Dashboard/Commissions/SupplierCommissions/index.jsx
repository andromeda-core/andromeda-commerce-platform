import Card from '@/Components/Card';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BreadCrumb from '@/Components/BreadCrumb';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import Table from '@/Components/Table';

import { useEffect, useState } from 'react';
import SelectInput from '@/Components/SelectInput';
import can from '@/Hooks/useCan';

export default function index({ supplier_commissions }) {
    // Bulk Delete Form Data
    const { props } = usePage();
    const { currency } = usePage().props;
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

    const canView = can('Suppliers View');

    const [columns, setColumns] = useState([]);
    const [actions, setActions] = useState([]);

    const [status, setStatus] = useState(props.status ?? '');
    const [parentSearched, setParentSearched] = useState(false);

    useEffect(() => {
        const columns = [
            {
                label: 'Supplier Name',
                render: (item) => {
                    return (
                        <div key={item.id}>
                            {canView ? (
                                <Link
                                    className="text-blue-500 underline"
                                    href={route('dashboard.suppliers.show', item.supplier?.id)}
                                >
                                    {item.supplier?.user?.name}
                                </Link>
                            ) : (
                                item.supplier?.user?.name
                            )}
                        </div>
                    );
                },
            },
            {
                key: 'order.order_no',
                label: 'Order No.',
            },

            {
                label: 'Commission Rate',
                render: (item) => {
                    return (
                        <span className="p-2 text-sm text-white bg-blue-500 rounded-lg">
                            {item.commission_rate}%
                        </span>
                    );
                },
            },

            {
                label: 'Commission Amount',
                render: (item) => {
                    return (
                        <span className="p-2 text-sm text-white bg-blue-500 rounded-lg">
                            {currency?.symbol}{Number(item.commission_amount).toLocaleString('en-US')}
                        </span>
                    );
                },
            },

            {
                label: 'Commission Status',
                render: (item) => {
                    return (
                        <span
                            className={`${item.status == 'paid' ? 'bg-green-500' : 'bg-red-500'} rounded-lg p-2 text-white`}
                        >
                            {item.status == 'paid' ? 'Paid' : 'Un-Paid'}
                        </span>
                    );
                },
            },

            { key: 'paid_at', label: 'Paid At' },
            { key: 'added_at', label: 'Added At' },
        ];

        const customActions = [
            ...(canView
                ? [
                    {
                        label: 'View',
                        type: 'link',
                        href: (item) => route('dashboard.suppliers.show', item?.supplier?.id),
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
                <Head title="Supplier Commissions" />

                <BreadCrumb
                    header={'Supplier Commissions'}
                    parent={'Dashboard'}
                    parent_link={route('dashboard')}
                    child={'Supplier Commissions'}
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
                                BulkDeleteRoute={
                                    'dashboard.commissions.supplier-commissions.destroybyselection'
                                }
                                SingleDeleteRoute={
                                    'dashboard.commissions.supplier-commissions.destroy'
                                }
                                EditRoute={
                                    can('Supplier Commissions Edit')
                                        ? 'dashboard.commissions.supplier-commissions.edit'
                                        : null
                                }
                                SearchRoute={'dashboard.commissions.supplier-commissions.index'}
                                Search={true}
                                DefaultSearchInput={true}
                                items={supplier_commissions}
                                props={props}
                                customActions={actions}
                                columns={columns}
                                searchProps={{ status: status }}
                                ParentSearched={parentSearched}
                                DeleteAction={can('Supplier Commissions Delete')}
                                canSelect={can('Supplier Commissions Delete')}
                                customSearch={
                                    <>
                                        <div className="relative">
                                            <SelectInput
                                                CustomCss={'w-auto md:w-[250px]'}
                                                InputName={'Status'}
                                                items={[
                                                    { id: 'paid', name: 'Paid' },
                                                    { id: 'unpaid', name: 'Un-Paid' },
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
