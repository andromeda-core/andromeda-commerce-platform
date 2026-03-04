import Card from '@/Components/Card';
import LinkButton from '@/Components/LinkButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BreadCrumb from '@/Components/BreadCrumb';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import Table from '@/Components/Table';

import { useEffect, useState } from 'react';
import can from '@/Hooks/useCan';

export default function index({ smartphone_country_prices }) {
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

    const [columns, setColumns] = useState([]);
    useEffect(() => {
        const columns = [

            { key: 'selling_info.smartphone.model_name.name', label: 'Smartphone' },
            { key: 'country.name', label: 'Country' },

            {
                label: 'Default Price',
                render: (item) => {
                    return (
                        <span className="p-3 text-white rounded-lg bg-violet-500">{props.currency?.symbol ?? '$'}{item?.selling_info?.total_price} </span>
                    );
                },
            },

            {
                label: 'New Price',
                render: (item) => {
                    return (
                        <span className="p-3 text-white bg-purple-500 rounded-lg">{props.currency?.symbol ?? '$'}{item?.price} </span>
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
                <Head title="Smartphone Country Prices" />

                <BreadCrumb
                    header={'Smartphone Country Prices'}
                    parent={'Dashboard'}
                    parent_link={route('dashboard')}
                    child={'Smartphone Country Prices'}
                />

                <Card
                    Content={
                        <>
                            {can('Smartphone Country Price Create') && (
                                <div className="flex flex-wrap justify-end my-3">
                                    <LinkButton
                                        Text={'Create Smartphone Country Price'}
                                        URL={route('dashboard.smartphone-country-prices.create')}
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
                                BulkDeleteRoute={'dashboard.smartphone-country-prices.destroybyselection'}
                                SingleDeleteRoute={'dashboard.smartphone-country-prices.destroy'}
                                SearchRoute={'dashboard.smartphone-country-prices.index'}
                                DeleteAction={can('Smartphone Country Price Delete')}
                                EditRoute={can('Smartphone Country Price Edit') ? 'dashboard.smartphone-country-prices.edit' : null}
                                canSelect={can('Smartphone Country Price Edit')}
                                Search={false}
                                items={smartphone_country_prices}
                                props={props}
                                columns={columns}
                            />
                        </>
                    }
                />
            </AuthenticatedLayout>
        </>
    );
}
