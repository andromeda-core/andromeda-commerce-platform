import Card from '@/Components/Card';
import LinkButton from '@/Components/LinkButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BreadCrumb from '@/Components/BreadCrumb';
import { Head, useForm, usePage } from '@inertiajs/react';
import Table from '@/Components/Table';
import { useEffect, useState } from 'react';
import PrimaryButton from '@/Components/PrimaryButton';
import SelectInput from '@/Components/SelectInput';
import can from '@/Hooks/useCan';

export default function index({ inventories, batches, storage_locations, smartphones }) {
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

    const [searchProgress, setSearchProgress] = useState(false);
    const [batch_id, setBatchId] = useState(props.batch_id ?? '');
    const [smartphone_id, setSmartphoneId] = useState(props.smartphone_id ?? '');
    const [storage_location_id, setStorageLocationId] = useState(props.storage_location_id ?? '');
    const [status, setStatus] = useState(props.status ?? '');

    const [ParentSearched, setParentSearched] = useState(false);

    useEffect(() => {
        setSearchProgress(false);
    }, []);

    const { currency } = usePage().props;

    const [columns, setColumns] = useState([]);
    useEffect(() => {
        const columns = [
            { key: 'smartphone.model_name.name', label: 'Smartphone Name' },
            {
                key: 'batch.batch_name',
                label: 'Batch Name',
            },
            { key: 'storage_location.name', label: 'Storage Location Name' },
            { key: 'imei1', label: 'IMEI 1' },
            { key: 'imei2', label: 'IMEI 2' },
            { key: 'eid', label: 'EID' },
            { key: 'serial_no', label: 'Serial No' },
            { key: 'returned_date', label: 'Returned Date' },
            {
                label: 'Status',
                render: (item) => {
                    return (
                        <span
                            className={`rounded-lg ${item.status == 'in_stock' && 'bg-green-500'} ${item.status == 'returned' && 'bg-red-500'} ${item.status == 'on_hold' && 'bg-yellow-500'} ${item.status == 'sold' && 'bg-blue-500'} p-2 text-white`}
                        >
                            {item.status}
                        </span>
                    );
                },
            },
            {
                label: 'Unit Price',
                render: (item) => {
                    return (
                        <span className="rounded-lg bg-blue-500 p-2 text-white">
                            {currency?.symbol}
                            {item.batch.final_unit_price}
                        </span>
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
                <Head title="Inventories" />

                <BreadCrumb
                    header={'Inventories'}
                    parent={'Dashboard'}
                    parent_link={route('dashboard')}
                    child={'Inventories'}
                />

                <Card
                    Content={
                        <>
                            {/* <div className="flex flex-wrap justify-end my-3">
                                <LinkButton
                                    Text={'Create Inventory'}
                                    URL={route('dashboard.inventories.create')}
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
                            </div> */}

                            <Table
                                setBulkSelectedIds={setBulkSelectedIds}
                                setSingleSelectedId={setSingleSelectedId}
                                SingleSelectedId={SingleSelectedId}
                                resetBulkSelectedIds={resetBulkSelectedIds}
                                resetSingleSelectedId={resetSingleSelectedId}
                                BulkDeleteMethod={BulkDelete}
                                SingleDeleteMethod={SingleDelete}
                                BulkDeleteRoute={'dashboard.inventories.destroybyselection'}
                                SingleDeleteRoute={'dashboard.inventories.destroy'}
                                EditRoute={
                                    can('Inventories Edit') ? 'dashboard.inventories.edit' : null
                                }
                                SearchRoute={'dashboard.inventories.index'}
                                Search={true}
                                DefaultSearchInput={false}
                                items={inventories}
                                props={props}
                                ParentSearched={ParentSearched}
                                searchProps={{
                                    batch_id: batch_id,
                                    smartphone_id: smartphone_id,
                                    storage_location_id: storage_location_id,
                                    status: status,
                                }}
                                columns={columns}
                                DeleteAction={can('Inventories Delete')}
                                canSelect={can('Inventories Delete')}
                                customSearch={
                                    <>
                                        <div className="relative mb-2 w-[200px]">
                                            <SelectInput
                                                Id={'batch_id'}
                                                Name={'batch_id'}
                                                InputName={'Batch'}
                                                items={batches}
                                                itemKey={'batch_name'}
                                                customPlaceHolder={true}
                                                Value={batch_id}
                                                Action={(value) => {
                                                    setBatchId(value);
                                                }}
                                            />
                                        </div>

                                        <div className="relative mb-2 w-[200px]">
                                            <SelectInput
                                                Id={'smartphone_id'}
                                                Name={'smartphone_id'}
                                                InputName={'Smartphone'}
                                                items={smartphones}
                                                itemKey={'name'}
                                                customPlaceHolder={true}
                                                Value={smartphone_id}
                                                Action={(value) => {
                                                    setSmartphoneId(value);
                                                }}
                                            />
                                        </div>

                                        <div className="relative mb-2 w-[200px]">
                                            <SelectInput
                                                Id={'storage_location_id'}
                                                Name={'storage_location_id'}
                                                InputName={'Storage Location'}
                                                items={storage_locations}
                                                itemKey={'name'}
                                                Value={storage_location_id}
                                                customPlaceHolder={true}
                                                Action={(value) => {
                                                    setStorageLocationId(value);
                                                }}
                                            />
                                        </div>

                                        <div className="relative mb-2 w-[200px]">
                                            <SelectInput
                                                Id={'status'}
                                                Name={'status'}
                                                InputName={'Status'}
                                                items={[
                                                    { name: 'in_stock' },
                                                    { name: 'returned' },
                                                    { name: 'on_hold' },
                                                    { name: 'sold' },
                                                ]}
                                                itemKey={'name'}
                                                Value={status}
                                                customPlaceHolder={true}
                                                Action={(value) => {
                                                    setStatus(value);
                                                }}
                                            />
                                        </div>

                                        <div className="relative mb-2">
                                            <PrimaryButton
                                                Type={'button'}
                                                Text={'Apply'}
                                                Disabled={searchProgress}
                                                Spinner={searchProgress}
                                                Icon={
                                                    <>
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
                                                                d="M6 13.5V3.75m0 9.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 3.75V16.5m12-3V3.75m0 9.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 3.75V16.5m-6-9V3.75m0 3.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 9.75V10.5"
                                                            />
                                                        </svg>
                                                    </>
                                                }
                                                Id={'apply_search'}
                                                Action={() => {
                                                    setParentSearched(true);
                                                    setSearchProgress(true);
                                                }}
                                            />
                                        </div>
                                    </>
                                }
                            />
                        </>
                    }
                />
            </AuthenticatedLayout>
        </>
    );
}
