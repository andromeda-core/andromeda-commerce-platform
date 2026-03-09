import Card from '@/Components/Card';
import LinkButton from '@/Components/LinkButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BreadCrumb from '@/Components/BreadCrumb';
import { Head, usePage } from '@inertiajs/react';
import Table from '@/Components/Table';
import { useEffect, useState } from 'react';


export default function index({ inventory_verifications }) {
    // Bulk Delete Form Data
    const { props } = usePage();
    const [columns, setColumns] = useState([]);

    useEffect(() => {
        const columns = [

            { key: 'verified_by.name', label: 'Verified By Name' },
            { key: 'verified_by.email', label: 'Verified By Email' },
            { key: 'verified_by.phone', label: 'Verified By Phone' },



            {
                label: 'View Video', render: (item) => {
                    if (item?.video) {

                        return (
                            <a href={item?.video} target='__blank' className="text-blue-500 underline cursor-pointer">
                                View Video
                            </a>
                        )
                    } else {
                        return 'Processing...'
                    }

                }
            },

            {
                key: 'imei',
                label: 'IMEI',
            },

            {
                key: 'verified_at',
                label: 'Verified At',
            },

        ];


        setColumns(columns);
    }, []);

    return (
        <>
            <AuthenticatedLayout>
                <Head title="Inventory Verifications" />

                <BreadCrumb
                    header={'Inventory Verifications'}
                    parent={'Dashboard'}
                    parent_link={route('dashboard')}
                    child={'Inventory Verifications'}
                />

                <Card
                    Content={
                        <>

                            <div className="flex flex-wrap justify-end my-3">
                                <LinkButton
                                    Text={'Verify Inventory'}
                                    URL={route('dashboard.inventory-verifications.create')}
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

                            <Table

                                EditRoute={null}
                                // SearchRoute={'dashboard.distributors.index'}
                                Search={false}
                                DefaultSearchInput={false}
                                items={inventory_verifications}
                                props={props}
                                columns={columns}
                                DeleteAction={false}
                                canSelect={false}
                            />
                        </>
                    }
                />
            </AuthenticatedLayout>
        </>
    );
}
