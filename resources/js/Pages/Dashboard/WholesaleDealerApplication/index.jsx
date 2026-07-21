import Card from '@/Components/Card';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BreadCrumb from '@/Components/BreadCrumb';
import { Head, usePage } from '@inertiajs/react';
import Table from '@/Components/Table';
import { useEffect, useState } from 'react';

const STATUS_BADGE = {
    new: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-white',
    reviewing: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-white',
    qualified: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-white',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-white',
};

export default function index({ wholesale_dealer_applications }) {
    const { props } = usePage();
    const [columns, setColumns] = useState([]);

    useEffect(() => {
        setColumns([
            { label: 'Application ID', key: 'application_id' },
            { label: 'Company / Store Name', key: 'company_store_name' },
            { label: 'Contact Person', key: 'contact_person' },
            { label: 'Business Email', key: 'business_email' },
            { label: 'Country', key: 'country_of_registration' },
            {
                label: 'Status',
                key: 'status',
                badge: (value) => STATUS_BADGE[value] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-white',
            },
            {
                label: 'Submitted',
                key: 'created_at',
                render: (item) =>
                    item.created_at ? new Date(item.created_at).toLocaleString() : 'N/A',
            },
        ]);
    }, []);

    return (
        <>
            <AuthenticatedLayout>
                <Head title="Wholesale Dealer Applications" />

                <BreadCrumb
                    header={'Wholesale Dealer Applications'}
                    parent={'Dashboard'}
                    parent_link={route('dashboard')}
                    child={'Wholesale Dealer Applications'}
                />

                <Card
                    Content={
                        <>
                            <Table
                                SearchRoute={'dashboard.wholesale-dealer-applications.index'}
                                Search={true}
                                DefaultSearchInput={true}
                                items={wholesale_dealer_applications}
                                props={props}
                                columns={columns}
                                DeleteAction={false}
                                customActions={[
                                    {
                                        type: 'link',
                                        label: 'View',
                                        href: (item) =>
                                            route(
                                                'dashboard.wholesale-dealer-applications.show',
                                                item.public_id,
                                            ),
                                    },
                                ]}
                            />
                        </>
                    }
                />
            </AuthenticatedLayout>
        </>
    );
}
