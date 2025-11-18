import Card from '@/Components/Card';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BreadCrumb from '@/Components/BreadCrumb';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import Table from '@/Components/Table';

import { useEffect, useState } from 'react';
import SelectInput from '@/Components/SelectInput';
import can from '@/Hooks/useCan';

export default function index({ collaborator_commissions }) {
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

    const canView = can('Collaborators View');

    const [status, setStatus] = useState(props.status ?? '');
    const [parentSearched, setParentSearched] = useState(false);

    const [columns, setColumns] = useState([]);
    const [actions, setActions] = useState([]);

    useEffect(() => {
        const columns = [
            {
                label: 'Collaborator Name',
                render: (item) => {
                    return (
                        <div key={item.id}>
                            {canView ? (
                                <Link
                                    className="text-blue-500 underline"
                                    href={route(
                                        'dashboard.collaborators.show',
                                        item.collaborator?.id,
                                    )}
                                >
                                    {item.collaborator?.user?.name}
                                </Link>
                            ) : (
                                item.collaborator?.user?.name
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
                        <span className="rounded-lg bg-blue-500 p-2 text-sm text-white">
                            {item.commission_rate}%
                        </span>
                    );
                },
            },

            {
                label: 'Commission Amount',
                render: (item) => {
                    return (
                        <span className="rounded-lg bg-blue-500 p-2 text-sm text-white">
                            {currency?.symbol} {item.commission_amount}
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
                        href: (item) =>
                            route('dashboard.collaborators.show', item?.collaborator?.id),
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
                <Head title="Collaborator Commissions" />

                <BreadCrumb
                    header={'Collaborator Commissions'}
                    parent={'Dashboard'}
                    parent_link={route('dashboard')}
                    child={'Collaborator Commissions'}
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
                                    'dashboard.commissions.collaborator-commissions.destroybyselection'
                                }
                                SingleDeleteRoute={
                                    'dashboard.commissions.collaborator-commissions.destroy'
                                }
                                EditRoute={
                                    can('Collaborator Commissions Edit')
                                        ? 'dashboard.commissions.collaborator-commissions.edit'
                                        : null
                                }
                                SearchRoute={'dashboard.commissions.collaborator-commissions.index'}
                                Search={true}
                                DefaultSearchInput={true}
                                items={collaborator_commissions}
                                props={props}
                                customActions={actions}
                                columns={columns}
                                searchProps={{ status: status }}
                                ParentSearched={parentSearched}
                                DeleteAction={can('Collaborator Commissions Delete')}
                                canSelect={can('Collaborator Commissions Delete')}
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
