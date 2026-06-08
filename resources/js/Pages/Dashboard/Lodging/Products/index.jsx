import Card from '@/Components/Card';
import LinkButton from '@/Components/LinkButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BreadCrumb from '@/Components/BreadCrumb';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import Table from '@/Components/Table';
import { useEffect, useState } from 'react';
import can from '@/Hooks/useCan';

export default function index({ lodging_products }) {
    const { props } = usePage();

    const {
        data: BulkselectedIds,
        setData: setBulkSelectedIds,
        delete: BulkDelete,
        reset: resetBulkSelectedIds,
    } = useForm({ ids: [] });

    const {
        data: SingleSelectedId,
        setData: setSingleSelectedId,
        delete: SingleDelete,
        reset: resetSingleSelectedId,
    } = useForm({ id: null });

    const [columns, setColumns] = useState([]);
    const [actions, setActions] = useState([]);

    useEffect(() => {
        const columns = [
            {
                label: 'Property Name',
                render: (item) => (
                    <Link
                        href={route('dashboard.lodging-products.show', item?.id)}
                        className="cursor-pointer text-blue-500 underline"
                    >
                        {item.property_name}
                    </Link>
                ),
            },
            {
                key: 'property_type',
                label: 'Type',
                badge: () => 'p-2 bg-blue-500 rounded-lg text-white capitalize',
            },
            { key: 'city_region', label: 'City / Region' },
            { key: 'floor.name', label: 'Floor' },
            {
                label: 'Rooms',
                render: (item) => item?.rooms_count ?? 0,
            },
            {
                label: 'Active',
                render: (item) => (
                    <span
                        className={`rounded-lg p-2 text-white ${item.is_active ? 'bg-green-500' : 'bg-gray-400'}`}
                    >
                        {item.is_active ? 'Active' : 'Inactive'}
                    </span>
                ),
            },
            {
                label: 'Reservations',
                render: (item) => (
                    <span
                        className={`rounded-lg p-2 text-white ${item.is_reservation_closed ? 'bg-red-500' : 'bg-green-500'}`}
                    >
                        {item.is_reservation_closed ? 'Closed' : 'Open'}
                    </span>
                ),
            },
            {
                label: 'Tag',
                render: (item) => item?.tag || 'N/A',
            },
        ];

        const customActions = [
            {
                label: 'View',
                type: 'link',
                href: (item) => route('dashboard.lodging-products.show', item?.id),
            },
        ];

        setActions(customActions);
        setColumns(columns);
    }, []);

    return (
        <AuthenticatedLayout>
            <Head title="Lodging Products" />

            <BreadCrumb
                header={'Lodging Products'}
                parent={'Dashboard'}
                parent_link={route('dashboard')}
                child={'Lodging Products'}
            />

            <Card
                Content={
                    <>
                        {can('Lodging Products Create') && (
                            <div className="my-3 flex flex-wrap justify-end">
                                <LinkButton
                                    Text={'Create Lodging Product'}
                                    URL={route('dashboard.lodging-products.create')}
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
                            BulkDeleteRoute={'dashboard.lodging-products.destroybyselection'}
                            SingleDeleteRoute={'dashboard.lodging-products.destroy'}
                            EditRoute={
                                can('Lodging Products Edit') ? 'dashboard.lodging-products.edit' : null
                            }
                            SearchRoute={'dashboard.lodging-products.index'}
                            Search={true}
                            DefaultSearchInput={true}
                            items={lodging_products}
                            props={props}
                            columns={columns}
                            customActions={actions}
                            DeleteAction={can('Lodging Products Delete')}
                            canSelect={can('Lodging Products Delete')}
                        />
                    </>
                }
            />
        </AuthenticatedLayout>
    );
}
