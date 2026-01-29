import Card from '@/Components/Card';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BreadCrumb from '@/Components/BreadCrumb';
import { Head, usePage } from '@inertiajs/react';
import Table from '@/Components/Table';
import { useEffect, useState } from 'react';

export default function index({ system_logs }) {


    const formatAddress = (address) => {
        if (!address) return '—';

        return `
${address.name ?? ''}
${address.phone ? ' | ' + address.phone : ''}

${address.address_line1 ?? ''}
${address.address_line2 ?? ''}

${address.city ?? ''}, ${address.state ?? ''}
${address.postal_code ?? ''}
${address.country?.name ?? address.country ?? ''}
    `.trim();
    };


    const { props } = usePage();
    const [columns, setColumns] = useState([]);
    useEffect(() => {
        const columns = [
            { key: 'user.name', label: 'Customer Name' },
            { key: 'user.email', label: 'Customer Email' },
            { key: 'user.phone', label: 'Customer Phone' },

            {
                key: 'old_shipping_address',
                label: 'Old Shipping Address',
                render: (row) => {
                    if (!row?.old_shipping_address) {
                        return "N/A";
                    } else {
                        return formatAddress(row.old_shipping_address);
                    }
                },
            },
            {
                key: 'new_shipping_address',
                label: 'New Shipping Address',
                render: (row) => {
                    if (!row?.new_shipping_address) {
                        return "N/A";
                    } else {
                        return formatAddress(row.new_shipping_address);
                    }
                },
            },

            { key: 'ip_address', label: 'IP Address' },
            { key: 'user_agent', label: 'User Agent' },
            { key: 'changed_at', label: 'Changed At' },
        ];

        setColumns(columns);
    }, []);



    return (
        <>
            <AuthenticatedLayout>
                <Head title="Customer Shipping Address Change Logs" />

                <BreadCrumb
                    header={'Customer Shipping Address Change Logs'}
                    parent={'System Logs'}
                    parent_link={route('dashboard.system-logs.index')}
                    child={'Customer Shipping Address Change Logs'}
                />

                <Card
                    Content={
                        <>
                            <Table
                                DeleteAction={false}
                                SearchRoute={'dashboard.system-logs.shipping-address-change-logs.index'}
                                Search={true}
                                DefaultSearchInput={true}
                                items={system_logs}
                                props={props}
                                columns={columns}
                                canSelect={false}

                            />
                        </>
                    }
                />
            </AuthenticatedLayout>
        </>
    );
}
