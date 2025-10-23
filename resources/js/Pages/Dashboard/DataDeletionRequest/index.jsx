import Card from '@/Components/Card';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BreadCrumb from '@/Components/BreadCrumb';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import Table from '@/Components/Table';

import { useEffect, useState } from 'react';
import SelectInput from '@/Components/SelectInput';

export default function index({ data_deletion_requests }) {
    const { props } = usePage();
    const [columns, setColumns] = useState([]);

    useEffect(() => {
        const columns = [
            {
                label: 'Name',
                key: 'name',
            },

            {
                label: 'Email',
                key: 'email',
            },

            {
                label: 'Phone',
                key: 'phone',
            },

            {
                label: 'IP Address',
                key: 'ip_address',
            },

            {
                label: 'Reason Of Deletion',
                key: 'reason',
            },

            { key: 'added_at', label: 'Added At' },
        ];

        setColumns(columns);
    }, []);

    return (
        <>
            <AuthenticatedLayout>
                <Head title="Data Deletion Requests" />

                <BreadCrumb
                    header={'Data Deletion Requests'}
                    parent={'Dashboard'}
                    parent_link={route('dashboard')}
                    child={'Data Deletion Requests'}
                />

                <Card
                    Content={
                        <>
                            <Table
                                SearchRoute={'dashboard.data-deletion-requests.index'}
                                Search={true}
                                DefaultSearchInput={true}
                                items={data_deletion_requests}
                                props={props}
                                columns={columns}
                                DeleteAction={false}
                            />
                        </>
                    }
                />
            </AuthenticatedLayout>
        </>
    );
}
