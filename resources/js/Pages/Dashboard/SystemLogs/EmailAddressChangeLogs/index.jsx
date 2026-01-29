import Card from '@/Components/Card';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BreadCrumb from '@/Components/BreadCrumb';
import { Head, usePage } from '@inertiajs/react';
import Table from '@/Components/Table';
import { useEffect, useState } from 'react';

export default function index({ system_logs }) {
    const { props } = usePage();
    const [columns, setColumns] = useState([]);
    useEffect(() => {
        const columns = [
            { key: 'user.name', label: 'Customer Name' },
            { key: 'user.email', label: 'Customer Email' },
            { key: 'user.phone', label: 'Customer Phone' },
            { key: 'old_email', label: 'Old Email' },
            { key: 'new_email', label: 'New Email' },
            { key: 'ip_address', label: 'IP Address' },
            { key: 'user_agent', label: 'User Agent' },
            { key: 'changed_at', label: 'Changed At' },
        ];
        setColumns(columns);
    }, []);


    return (
        <>
            <AuthenticatedLayout>
                <Head title="Customer Email Change Logs" />

                <BreadCrumb
                    header={'Customer Email Change Logs'}
                    parent={'System Logs'}
                    parent_link={route('dashboard.system-logs.index')}
                    child={'Customer Email Change Logs'}
                />

                <Card
                    Content={
                        <>
                            <Table
                                DeleteAction={false}
                                SearchRoute={'dashboard.system-logs.email-change-logs.index'}
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
