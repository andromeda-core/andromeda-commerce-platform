import Card from '@/Components/Card';
import LinkButton from '@/Components/LinkButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BreadCrumb from '@/Components/BreadCrumb';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import Table from '@/Components/Table';
import { useEffect, useState } from 'react';
import can from '@/Hooks/useCan';

export default function index({ lodging_products }) {
    const { props } = usePage();
    const { auth } = props;

    // Owner-controlled per-property distributor management: the toggle is Admin/Operator-only
    // (never shown to a Distributor, even though they may now hold "Lodging Products Edit"), and
    // the Edit action/link for a Distributor row must reflect the per-property toggle, not just
    // the raw permission.
    const isAdmin = auth?.user?.role === 'Admin';
    const isOperator = auth?.user?.role === 'Accommodation Operator';
    const isDistributor = auth?.user?.role === 'Accommodation Distributor';
    const canManageDistributorToggle = isAdmin || isOperator;
    // can() calls usePage() internally (a hook) — must be evaluated here, at the top level of the
    // component body, never inside the useEffect/.map() below (Rules of Hooks).
    const canEditLodgingProducts = can('Lodging Products Edit');

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

    const toggleDistributorManagement = (id) => {
        router.put(
            route('dashboard.lodging-products.toggle-distributor-management', id),
            {},
            { preserveScroll: true },
        );
    };

    const [columns, setColumns] = useState([]);
    const [actions, setActions] = useState([]);

    useEffect(() => {
        const columns = [
            {
                label: 'Property Name',
                render: (item) => (
                    <Link
                        href={route('dashboard.lodging-products.show', item?.id)}
                        className="text-blue-500 underline cursor-pointer"
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
            { key: 'floor_start.name', label: 'Floor Start' },
            { key: 'floor_end.name', label: 'Floor End' },
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
            {
                label: 'Distributor',
                render: (item) => {
                    const distributorUser = item?.accommodation_distributor?.user;
                    if (!distributorUser) {
                        return 'N/A';
                    }
                    return (
                        <div className="flex flex-col">
                            <span>{distributorUser.name}</span>
                            <span className="text-xs text-gray-400">{distributorUser.email}</span>
                        </div>
                    );
                },
            },
        ];

        // Owner-controlled per-property distributor management toggle — Admin/Operator only
        // (mirrors the smartphones toggle-sold-out checkbox+pill pattern exactly). A Distributor
        // viewer never sees this column at all.
        if (canManageDistributorToggle) {
            columns.push({
                label: 'Distributor Management',
                render: (item) => {
                    if (!item.accommodation_distributor_id) {
                        return (
                            <span className="text-xs text-gray-400">No distributor assigned</span>
                        );
                    }

                    const canManage = !!item.accommodation_distributor_can_manage;

                    return (
                        <label className="inline-flex cursor-pointer items-center">
                            <input
                                type="checkbox"
                                value={canManage}
                                onChange={() => toggleDistributorManagement(item.id)}
                                checked={canManage}
                                className="peer sr-only"
                            />
                            <div className="peer relative h-6 w-11 rounded-full bg-gray-200 after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-green-500 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:border-gray-600 dark:bg-gray-700 dark:peer-checked:bg-green-500 dark:peer-focus:ring-green-800 rtl:peer-checked:after:-translate-x-full"></div>
                            <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                                {canManage ? 'Can Manage' : 'View Only'}
                            </span>
                        </label>
                    );
                },
            });
        }

        const customActions = [
            {
                label: 'View',
                type: 'link',
                href: (item) => route('dashboard.lodging-products.show', item?.id),
            },
        ];

        // A Distributor may hold "Lodging Products Edit" (per-property toggle feature) but the
        // global EditRoute below is deliberately disabled for them (see EditRoute prop) since it
        // has no per-row awareness of the toggle. This per-row action replaces it for Distributor
        // viewers only, hidden entirely on any row where accommodation_distributor_can_manage is
        // not true — never shows an Edit link that would then 403 on click.
        if (isDistributor && canEditLodgingProducts) {
            customActions.push({
                label: 'Edit',
                type: 'link',
                href: (item) => route('dashboard.lodging-products.edit', item?.id),
                show: (item) => item.accommodation_distributor_can_manage === true,
            });
        }

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
                            <div className="flex flex-wrap justify-end my-3">
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
                                // A Distributor's Edit access is per-property (the manage toggle),
                                // which this global, row-unaware EditRoute can't express — their
                                // Edit link is rendered as a per-row customAction instead (see
                                // above). Admin/Operator behavior is completely unchanged.
                                !isDistributor && canEditLodgingProducts
                                    ? 'dashboard.lodging-products.edit'
                                    : null
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
