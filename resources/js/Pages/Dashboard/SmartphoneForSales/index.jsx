import Card from '@/Components/Card';
import LinkButton from '@/Components/LinkButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BreadCrumb from '@/Components/BreadCrumb';
import { Head, useForm, usePage } from '@inertiajs/react';
import Table from '@/Components/Table';
import { useEffect, useState } from 'react';
import can from '@/Hooks/useCan';
export default function index({ smartphone_for_sales }) {
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
            { key: 'smartphone.model_name.name', label: 'Smartphone' },
            {
                label: 'Selling Price',
                render: (item) => {
                    return (
                        <span className="p-2 text-white bg-blue-500 rounded-lg">
                            {currency?.symbol}
                            {Number(item.selling_price).toLocaleString('en-US')}
                        </span>
                    );
                },
            },
            {
                label: 'Final Total Selling Price',
                render: (item) => {
                    return (
                        <span className="p-2 text-white bg-blue-500 rounded-lg">
                            {currency?.symbol}
                            {Number(item.total_price).toLocaleString('en-US')}
                        </span>
                    );
                },
            },
            { key: 'added_at', label: 'Added At' },
        ];

        setColumns(columns);
    }, []);

    return (
        <>
            <AuthenticatedLayout>
                <Head title="Smartphone For Sale" />

                <BreadCrumb
                    header={'Smartphone For Sale'}
                    parent={'Dashboard'}
                    parent_link={route('dashboard')}
                    child={'Smartphone For Sale'}
                />

                <Card
                    Content={
                        <>
                            {can('Smartphone For Sales Create') && (
                                <div className="flex flex-wrap justify-end my-3">
                                    <LinkButton
                                        Text={'Create Smartphone For Sale'}
                                        URL={route('dashboard.smartphone-for-sales.create')}
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
                            )}

                            <Table
                                setBulkSelectedIds={setBulkSelectedIds}
                                setSingleSelectedId={setSingleSelectedId}
                                SingleSelectedId={SingleSelectedId}
                                resetBulkSelectedIds={resetBulkSelectedIds}
                                resetSingleSelectedId={resetSingleSelectedId}
                                BulkDeleteMethod={BulkDelete}
                                SingleDeleteMethod={SingleDelete}
                                BulkDeleteRoute={
                                    'dashboard.smartphone-for-sales.destroybyselection'
                                }
                                SingleDeleteRoute={'dashboard.smartphone-for-sales.destroy'}
                                EditRoute={
                                    can('Smartphone For Sales Edit')
                                        ? 'dashboard.smartphone-for-sales.edit'
                                        : null
                                }
                                SearchRoute={'dashboard.smartphone-for-sales.index'}
                                Search={true}
                                DefaultSearchInput={true}
                                items={smartphone_for_sales}
                                props={props}
                                columns={columns}
                                DeleteAction={can('Smartphone For Sales Delete')}
                                canSelect={can('Smartphone For Sales Delete')}
                            />
                        </>
                    }
                />
            </AuthenticatedLayout>
        </>
    );
}
