import Card from '@/Components/Card';
import Input from '@/Components/Input';
import PrimaryButton from '@/Components/PrimaryButton';
import SelectInput from '@/Components/SelectInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { Head, router } from '@inertiajs/react'
import { debounce } from 'lodash';
import React, { useEffect, useMemo, useState } from 'react'

const index = ({ signals, filters }) => {

    const [localFilters, setLocalFilters] = useState({
        status: filters?.status ?? '',
        search: filters?.search ?? '',
    });

    const [marking, setMarking] = useState(false)

    const handlePagination = (url) => {
        if (url) {
            router.visit(url, { preserveScroll: true, preserveState: true });
        }
    };

    const debouncedVisit = useMemo(
        () =>
            debounce((filters) => {
                router.visit(route('dashboard.risk-signals.index'), {
                    data: filters,
                    preserveState: true,
                    replace: true,
                })
            }, 800),
        []
    );


    useEffect(() => {
        debouncedVisit(localFilters)

        return () => {
            debouncedVisit.cancel()
        }
    }, [localFilters])
    return (
        <AuthenticatedLayout>
            <Head title="Risk Signals" />
            <div className="px-6 py-6 mx-auto max-w-7xl">

                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-white/80">
                        Risk Signals
                    </h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-white/70">
                        Informational indicators only. No automatic enforcement or penalties.
                    </p>
                </div>

                {/* Filters */}
                <div className="mb-6">
                    <div className="flex flex-wrap items-center max-w-2xl gap-3">

                        <SelectInput
                            Id={'status'}
                            Name={'status'}
                            Value={localFilters?.status}
                            Action={(value) => setLocalFilters(prev => ({
                                ...prev,
                                status: value,
                            }))}
                            CustomCss={"w-[190px]"}
                            items={[
                                { id: 'open', name: "Open" },
                                { id: 'resolved', name: "Resolved" },
                                { id: 'expired', name: "Expired" },
                            ]}
                            itemKey={'name'}
                            customPlaceHolder={true}
                            Placeholder={"Filter By Status"}

                        />

                        <Input
                            Type={'text'}
                            Id={'search'}
                            CustomCss={"w-[270px] mt-2"}
                            Name={'search'}
                            Placeholder={"Search By User Name, Email, Phone"}
                            Value={localFilters?.search}
                            Action={(e) => setLocalFilters(prev => ({
                                ...prev,
                                search: e.target.value,
                            }))}


                        />
                    </div>
                </div>

                {/* Cards */}
                <Card
                    Content={<>
                        {signals.data.map(signal => (
                            <Card
                                key={signal.id}
                                CustomCss={"my-3"}
                                Content={

                                    <>
                                        {/* Top */}
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="font-semibold text-gray-900 uppercase dark:text-white/80">
                                                    Signal: {signal.signal_type.replace(/_/g, ' ')}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-white/70">
                                                    Context: {signal.context}
                                                </p>
                                            </div>

                                            <span className={`px-2 py-1 text-xs rounded-full
                                    ${signal.status === 'expired' && 'bg-gray-200 text-gray-700'}
                                    ${signal.status === 'resolved' && 'bg-green-100 text-green-700'}
                                    ${signal.status === 'open' && 'bg-red-100 text-red-700'}
                                `}>
                                                {signal.status.toUpperCase()}
                                            </span>
                                        </div>

                                        {/* Meta */}
                                        <div className="mt-3 text-sm text-gray-700 dark:text-white/75">
                                            <p className="font-medium">Details</p>
                                            <ul className="pl-5 mt-1 break-words list-disc">

                                                {signal.user && (
                                                    <>
                                                        <li>User Name: {signal?.user?.name}</li>
                                                        <li>User Email: {signal?.user?.email}</li>
                                                        <li>User Phone: {signal?.user?.phone}</li>
                                                    </>
                                                )}
                                                {signal.meta?.count && (
                                                    <li>Requests: {signal.meta.count}</li>
                                                )}
                                                {signal.meta?.window && (
                                                    <li>Window: {signal.meta.window}</li>
                                                )}
                                                {signal.meta?.device && (
                                                    <li>Device ID: {signal.meta.device}</li>
                                                )}


                                            </ul>
                                        </div>

                                        {/* Dates */}
                                        <div className="grid grid-cols-2 gap-4 mt-4 text-xs text-gray-500 dark:text-white/70">
                                            <div>
                                                <p>Detected At</p>
                                                <p>{signal.detected_at}</p>
                                            </div>
                                            <div>
                                                <p>Expires At</p>
                                                <p>{signal.expires_at}</p>
                                            </div>
                                            {signal.resolved_at && (
                                                <div>
                                                    <p>Resolved At</p>
                                                    <p>{signal.resolved_at}</p>
                                                </div>
                                            )}

                                            {signal.resolved_by && (
                                                <div>
                                                    <p>Resolved By</p>
                                                    <p>{signal.resolved_by?.name}</p>
                                                    <p>{signal.resolved_by?.email}</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Footer */}
                                        <div className="flex items-center justify-between pt-3 mt-4 border-t">
                                            <p className="text-xs text-gray-500 dark:text-white/70">
                                                User ID: {signal.user_id}
                                            </p>

                                            {signal.status === 'open' ? (
                                                <PrimaryButton
                                                    CustomClass={'w-[200px]'}
                                                    Text={"Mark as Resolved"}
                                                    Action={() => {
                                                        setMarking(true)
                                                        router.put(route('dashboard.risk-signals.update', signal?.id), {

                                                        }, {
                                                            onFinish: () => {
                                                                setMarking(false);
                                                            }
                                                        })
                                                    }}
                                                    Type={'button'}
                                                    Spinner={marking}
                                                />
                                            ) : (
                                                <span className="text-xs text-gray-400 dark:text-white/60">
                                                    {signal.status === 'expired'
                                                        ? 'Expired – no action allowed'
                                                        : 'Resolved'}
                                                </span>
                                            )}
                                        </div>
                                    </>
                                }
                            />
                        ))}

                        {signals?.data?.length === 0 && (
                            <div className="flex items-center justify-center min-h-[200px]">
                                <p className="p-5 text-center text-gray-900 rounded-md dark:text-white">
                                    No data found
                                </p>
                            </div>
                        )}
                    </>}
                />


                {/* Pagination */}
                {signals.links && (
                    <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800">
                        <div className="flex items-center justify-between">
                            <PrimaryButton
                                Text={
                                    <>
                                        <svg
                                            className="fill-current"
                                            width="20"
                                            height="20"
                                            viewBox="0 0 20 20"
                                            fill="none"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                clipRule="evenodd"
                                                d="M2.58301 9.99868C2.58272 10.1909 2.65588 10.3833 2.80249 10.53L7.79915 15.5301C8.09194 15.8231 8.56682 15.8233 8.85981 15.5305C9.15281 15.2377 9.15297 14.7629 8.86018 14.4699L5.14009 10.7472L16.6675 10.7472C17.0817 10.7472 17.4175 10.4114 17.4175 9.99715C17.4175 9.58294 17.0817 9.24715 16.6675 9.24715L5.14554 9.24715L8.86017 5.53016C9.15297 5.23717 9.15282 4.7623 8.85983 4.4695C8.56684 4.1767 8.09197 4.17685 7.79917 4.46984L2.84167 9.43049C2.68321 9.568 2.58301 9.77087 2.58301 9.99715Z"
                                            />
                                        </svg>
                                        <span className="hidden mx-2 sm:inline"> Previous </span>
                                    </>
                                }
                                Disabled={!signals.links[0].url}
                                Action={() => handlePagination(signals.links[0].url)}
                                CustomClass="w-[140px] h-[40px]"
                                Type="button"
                            />
                            <ul className="hidden items-center gap-0.5 sm:flex">
                                {signals.links.slice(1, -1).map((link, idx) => (
                                    <li key={idx}>
                                        <button
                                            onClick={() => handlePagination(link.url)}
                                            disabled={!link.url || link.active}
                                            className={`text-theme-sm flex h-10 w-10 items-center justify-center rounded-lg font-medium ${link.active
                                                ? 'bg-indigo-800/[0.08] text-indigo-500'
                                                : 'text-gray-700 hover:bg-indigo-500/[0.08] hover:text-indigo-500 dark:text-gray-400 dark:hover:text-indigo-500'
                                                }`}
                                        >
                                            {link.label}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                            <PrimaryButton
                                Text={
                                    <>
                                        <span className="hidden sm:inline"> Next </span>
                                        <svg
                                            className="mx-2 fill-current"
                                            width="20"
                                            height="20"
                                            viewBox="0 0 20 20"
                                            fill="none"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                clipRule="evenodd"
                                                d="M17.4175 9.9986C17.4178 10.1909 17.3446 10.3832 17.198 10.53L12.2013 15.5301C11.9085 15.8231 11.4337 15.8233 11.1407 15.5305C10.8477 15.2377 10.8475 14.7629 11.1403 14.4699L14.8604 10.7472L3.33301 10.7472C2.91879 10.7472 2.58301 10.4114 2.58301 9.99715C2.58301 9.58294 2.91879 9.24715 3.33301 9.24715L14.8549 9.24715L11.1403 5.53016C10.8475 5.23717 10.8477 4.7623 11.1407 4.4695C11.4336 4.1767 11.9085 4.17685 12.2013 4.46984L17.1588 9.43049C17.3173 9.568 17.4175 9.77087 17.4175 9.99715Z"
                                            />
                                        </svg>
                                    </>
                                }
                                Disabled={!signals.links[signals.links.length - 1].url}
                                Action={() =>
                                    handlePagination(signals.links[signals.links.length - 1].url)
                                }
                                CustomClass="w-[140px] h-[40px] mx-2"
                                Type="button"
                            />
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    )
}

export default index
