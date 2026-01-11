import Card from '@/Components/Card';
import LinkButton from '@/Components/LinkButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BreadCrumb from '@/Components/BreadCrumb';
import { Head, useForm, usePage } from '@inertiajs/react';
import Table from '@/Components/Table';

import { useEffect, useState } from 'react';

export default function index({ languages }) {
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
    const [customActions, setCustomActions] = useState([]);
    useEffect(() => {
        const columns = [
            { key: 'name', label: 'Language Name' },
            { key: 'code', label: 'Language Code' },
            { key: 'added_at', label: 'Added At' },
        ];


        const customActions = [
            // Appending Button in Action Dropdon Example
            {
                label: 'Manage Translations',
                type: 'link',
                href: (item) => route('dashboard.translation-system.translations.index', encodeURIComponent(item?.code)),
            },
        ];

        setCustomActions(customActions);
        setColumns(columns);
    }, []);

    return (
        <>
            <AuthenticatedLayout>
                <Head title="Translation System - Languages" />

                <BreadCrumb
                    header={'Translation System - Languages'}
                    parent={'Translation System'}
                    parent_link={route('dashboard.translation-system.index')}
                    child={'Languages'}
                />

                <Card
                    Content={
                        <>
                            <div className="flex flex-wrap justify-end gap-4 my-3">
                                <LinkButton
                                    Text={'Back To Translation System'}
                                    URL={route('dashboard.translation-system.index')}
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
                                                d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"
                                            />
                                        </svg>
                                    }
                                />


                                <LinkButton
                                    Text={'Create Language'}
                                    URL={route('dashboard.translation-system.languages.create')}
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
                                setBulkSelectedIds={setBulkSelectedIds}
                                setSingleSelectedId={setSingleSelectedId}
                                SingleSelectedId={SingleSelectedId}
                                resetBulkSelectedIds={resetBulkSelectedIds}
                                resetSingleSelectedId={resetSingleSelectedId}
                                BulkDeleteMethod={BulkDelete}
                                SingleDeleteMethod={SingleDelete}
                                EditRoute={'dashboard.translation-system.languages.edit'}
                                BulkDeleteRoute={
                                    'dashboard.translation-system.languages.destroybyselection'
                                }
                                SingleDeleteRoute={'dashboard.translation-system.languages.destroy'}
                                Search={false}
                                DefaultSearchInput={false}
                                items={languages}
                                props={props}
                                columns={columns}
                                customActions={customActions}
                            />
                        </>
                    }
                />
            </AuthenticatedLayout>
        </>
    );
}
