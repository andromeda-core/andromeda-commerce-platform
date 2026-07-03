import Card from '@/Components/Card';
import LinkButton from '@/Components/LinkButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BreadCrumb from '@/Components/BreadCrumb';
import { Head, useForm, usePage } from '@inertiajs/react';
import Table from '@/Components/Table';

import { useEffect, useState } from 'react';
import can from '@/Hooks/useCan';

export default function index({ accommodation_operators }) {
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
            { key: 'company_name', label: 'Property / Company Name' },
            { key: 'user.name', label: 'Operator Name' },
            { key: 'user.email', label: 'Operator Email' },
            { key: 'user.phone', label: 'Operator Phone' },

            {
                label: 'Address',
                render: (item) => {
                    return (
                        <span className="w-[200px] text-wrap break-words">
                            {item.address ?? 'N/A'}
                        </span>
                    );
                },
            },

            { key: 'postal_code', label: 'Postal Code' },
            { key: 'bank_name', label: 'Bank Name' },
            { key: 'bank_account_name', label: 'Bank Account Name' },
            { key: 'bank_account_no', label: 'Bank Account No' },
            { key: 'iban', label: 'IBAN' },
            { key: 'swift_code', label: 'SWIFT Code' },

            { key: 'added_at', label: 'Added At' },
        ];

        setColumns(columns);
    }, []);

    return (
        <>
            <AuthenticatedLayout>
                <Head title="Accommodation Operators" />

                <BreadCrumb
                    header={'Accommodation Operators'}
                    parent={'Dashboard'}
                    parent_link={route('dashboard')}
                    child={'Accommodation Operators'}
                />

                <Card
                    Content={
                        <>
                            {can('Accommodation Operators Create') && (
                                <div className="my-3 flex flex-wrap justify-end">
                                    <LinkButton
                                        Text={'Create Accommodation Operator'}
                                        URL={route('dashboard.accommodation-operators.create')}
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
                                BulkDeleteRoute={'dashboard.accommodation-operators.destroybyselection'}
                                SingleDeleteRoute={'dashboard.accommodation-operators.destroy'}
                                EditRoute={
                                    can('Accommodation Operators Edit')
                                        ? 'dashboard.accommodation-operators.edit'
                                        : null
                                }
                                SearchRoute={'dashboard.accommodation-operators.index'}
                                Search={true}
                                DefaultSearchInput={true}
                                items={accommodation_operators}
                                props={props}
                                columns={columns}
                                DeleteAction={can('Accommodation Operators Delete')}
                                canSelect={can('Accommodation Operators Delete')}
                            />
                        </>
                    }
                />
            </AuthenticatedLayout>
        </>
    );
}
