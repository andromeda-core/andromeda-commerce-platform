import Card from '@/Components/Card';
import LinkButton from '@/Components/LinkButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BreadCrumb from '@/Components/BreadCrumb';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import Table from '@/Components/Table';
import SelectInput from '@/Components/SelectInput';
import Input from '@/Components/Input';

import { useEffect, useState } from 'react';
import can from '@/Hooks/useCan';

export default function index({
    smartphone_country_prices,
    countries = [],
    missing_smartphones = [],
    country_id = '',
    q = '',
}) {
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

    // Country filter + smartphone search (server-side, combines with paginate + withQueryString)
    const [countryFilter, setCountryFilter] = useState(country_id || '');
    const [searchTerm, setSearchTerm] = useState(q || '');

    const selectedCountryName = countries.find((c) => String(c.id) === String(countryFilter))?.name;

    const applyFilters = (next = {}) => {
        const params = {
            country_id: next.country_id !== undefined ? next.country_id : countryFilter,
            q: next.q !== undefined ? next.q : searchTerm,
        };
        if (!params.country_id) delete params.country_id;
        if (!params.q) delete params.q;

        router.get(route('dashboard.smartphone-country-prices.index'), params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    // SelectInput passes the selected value directly, and '' when cleared
    const onCountryChange = (value) => {
        setCountryFilter(value);
        applyFilters({ country_id: value });
    };

    // debounce smartphone search (350ms); skips initial mount
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm !== (q || '')) {
                applyFilters({ q: searchTerm });
            }
        }, 350);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const [columns, setColumns] = useState([]);
    useEffect(() => {
        const columns = [
            { key: 'selling_info.smartphone.model_name.name', label: 'Smartphone' },
            { key: 'country.name', label: 'Country' },

            {
                label: 'Default Price',
                render: (item) => {
                    return (
                        <span className="rounded-lg bg-violet-500 p-3 text-white">
                            {props.currency?.symbol ?? '$'}
                            {Number(item?.selling_info?.total_price).toLocaleString('en-US')}{' '}
                        </span>
                    );
                },
            },

            {
                label: 'New Price',
                render: (item) => {
                    return (
                        <span className="rounded-lg bg-purple-500 p-3 text-white">
                            {props.currency?.symbol ?? '$'}
                            {Number(item?.price).toLocaleString('en-US')}{' '}
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
                                <div className="my-3 flex flex-wrap justify-end">
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

                            {/* Filter bar: country (SelectInput, clearable = All) + smartphone search (Input) */}
                            <div className="my-3 grid grid-cols-1 gap-3 md:grid-cols-3">
                                <div>
                                    <SelectInput
                                        InputName={'Country'}
                                        Id={'country_filter'}
                                        Name={'country_filter'}
                                        Value={countryFilter}
                                        Action={onCountryChange}
                                        items={countries}
                                        itemKey={'name'}
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <Input
                                        InputName={'Search Smartphone'}
                                        Id={'smartphone_search'}
                                        Name={'smartphone_search'}
                                        Type={'text'}
                                        Value={searchTerm}
                                        Action={(e) => setSearchTerm(e.target.value)}
                                        Placeholder={'Search by smartphone model name'}
                                    />
                                </div>
                            </div>

                            {/* Missing panel: only when a country is selected */}
                            {countryFilter && (
                                <div className="my-3 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-white/5">
                                    <h3 className="mb-4 text-base font-semibold text-red-600 dark:text-white/80">
                                        Missing for {selectedCountryName || 'selected country'} (
                                        {missing_smartphones.length})
                                    </h3>
                                    {missing_smartphones.length === 0 ? (
                                        <p className="text-sm text-main-text-light dark:text-main-text-dark">
                                            All products have a price for this country.
                                        </p>
                                    ) : (
                                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                            {missing_smartphones.map((item) => (
                                                <div
                                                    key={item.id}
                                                    className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2 dark:border-gray-700 dark:bg-deepcharcoal"
                                                >
                                                    <span className="text-sm text-main-text-light dark:text-main-text-dark">
                                                        {item.name}
                                                    </span>

                                                    {can('Smartphone Country Price Create') && (
                                                        <Link
                                                            href={route(
                                                                'dashboard.smartphone-country-prices.create',
                                                                {
                                                                    smartphone_for_sale_id: item.id,
                                                                    country_id: countryFilter,
                                                                    ...(q ? { q } : {}),
                                                                },
                                                            )}
                                                            className="rounded-md bg-violet-500 px-3 py-1 text-xs font-medium text-white hover:bg-violet-600"
                                                        >
                                                            Create
                                                        </Link>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
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
                                BulkDeleteRoute={
                                    'dashboard.smartphone-country-prices.destroybyselection'
                                }
                                SingleDeleteRoute={'dashboard.smartphone-country-prices.destroy'}
                                SearchRoute={'dashboard.smartphone-country-prices.index'}
                                DeleteAction={can('Smartphone Country Price Delete')}
                                EditRoute={
                                    can('Smartphone Country Price Edit')
                                        ? 'dashboard.smartphone-country-prices.edit'
                                        : null
                                }
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
