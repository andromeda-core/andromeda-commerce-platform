import Card from '@/Components/Card';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BreadCrumb from '@/Components/BreadCrumb';
import { Head, useForm, usePage } from '@inertiajs/react';
import Table from '@/Components/Table';

import { useEffect, useState } from 'react';
import SelectInput from '@/Components/SelectInput';
import can from '@/Hooks/useCan';

export default function index({ lodging_collaborator_commissions }) {
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

    const [status, setStatus] = useState(props.status ?? '');
    const [parentSearched, setParentSearched] = useState(false);

    const [columns, setColumns] = useState([]);
    useEffect(() => {
        const columns = [
            {
                label: 'Collaborator Name',
                render: (item) => item?.collaborator?.user?.name ?? 'N/A',
            },
            {
                key: 'reservation.reservation_no',
                label: 'Reservation No.',
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

        setColumns(columns);
    }, []);

    return (
        <>
            <AuthenticatedLayout>
                <Head title="Accommodation Collaborator Commissions" />

                <BreadCrumb
                    header={'Accommodation Collaborator Commissions'}
                    parent={'Dashboard'}
                    parent_link={route('dashboard')}
                    child={'Accommodation Collaborator Commissions'}
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
                                    'dashboard.accommodation-commissions.collaborator-commissions.destroybyselection'
                                }
                                SingleDeleteRoute={
                                    'dashboard.accommodation-commissions.collaborator-commissions.destroy'
                                }
                                EditRoute={
                                    can('Accommodation Collaborator Commissions Edit')
                                        ? 'dashboard.accommodation-commissions.collaborator-commissions.edit'
                                        : null
                                }
                                SearchRoute={'dashboard.accommodation-commissions.collaborator-commissions.index'}
                                Search={true}
                                DefaultSearchInput={true}
                                items={lodging_collaborator_commissions}
                                props={props}
                                columns={columns}
                                searchProps={{ status: status }}
                                ParentSearched={parentSearched}
                                DeleteAction={can('Accommodation Collaborator Commissions Delete')}
                                canSelect={can('Accommodation Collaborator Commissions Delete')}
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
