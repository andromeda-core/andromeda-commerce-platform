import Card from '@/Components/Card';
import Input from '@/Components/Input';
import PrimaryButton from '@/Components/PrimaryButton';
import SelectInput from '@/Components/SelectInput';
import Textarea from '@/Components/Textarea';
import TipTapEditor from '@/Components/TipTapEditor';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { Head, Link, router, useForm } from '@inertiajs/react'
import { debounce } from 'lodash';
import React, { useEffect, useMemo, useRef, useState } from 'react'

const index = ({ unsettledAccounts, filters }) => {

    const [localFilters, setLocalFilters] = useState({
        status: filters?.status ?? '',
        search: filters?.search ?? '',
    });

    const firstRender = useRef(true);

    const [marking, setMarking] = useState(false);
    const [openAction, setOpenAction] = useState(null);
    const [selectedAccount, setSelectedAccount] = useState(null);


    const [showMessageModal, setShowMessageModal] = useState(false);
    const [showNoteModal, setShowNoteModal] = useState(false);


    const { data: note, setData: setNote, put: updateNote, reset: resetNote, processing: noteProcessing } = useForm({
        note: '',
    });


    const { data: message, setData: setMessage, post: sendMessage, processing: messageProcessing, reset: resetMessage, } = useForm({
        message: '',
    });



    const handlePagination = (url) => {
        if (url) {
            router.visit(url, { preserveScroll: true, preserveState: true });
        }
    };

    const debouncedVisit = useMemo(
        () =>
            debounce((filters) => {
                router.visit(route('dashboard.unsettled-accounts.index'), {
                    data: filters,
                    preserveState: true,
                    replace: true,
                })
            }, 800),
        []
    );

    const handleNoteUpdate = () => {
        if (note.note === '') return;
        updateNote(route('dashboard.unsettled-accounts.update-note', selectedAccount.id), {
            onFinish: () => {
                setShowNoteModal(false);
                setSelectedAccount(null);
                resetNote('note');
            }
        });
    }

    const handleSendMessage = () => {

        if (message.message === '<p></p>' || message.message === '') return;

        sendMessage(route('dashboard.unsettled-accounts.send-message', selectedAccount.id), {
            onFinish: () => {
                setShowMessageModal(false);
                setSelectedAccount(null);
                resetMessage('message');
            }
        });
    }

    useEffect(() => {

        if (firstRender.current) {
            firstRender.current = false;
            return;
        }

        debouncedVisit(localFilters)

        return () => {
            debouncedVisit.cancel()
        }
    }, [localFilters]);

    useEffect(() => {

        if (!selectedAccount) return;

        if (showNoteModal) {
            setNote('note', selectedAccount.note || '');
        }

    }, [selectedAccount, showNoteModal])


    return (
        <AuthenticatedLayout>
            <Head title="Unsettled Accounts" />

            <div className="px-6 py-6 mx-auto max-w-7xl">

                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-white/80">
                        Unsettled Accounts
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
                            ]}
                            itemKey={'name'}
                            customPlaceHolder={true}
                            Placeholder={"Filter By Status"}

                        />

                        <Input
                            Type={'text'}
                            Id={'search'}
                            CustomCss={"w-[300px] mt-2"}
                            Name={'search'}
                            Placeholder={"Search By User Name, Email, Phone, Order No"}
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
                        {unsettledAccounts.data.map(account => (
                            <Card
                                key={account.id}
                                CustomCss={"my-3"}
                                Content={
                                    <>
                                        {/* Header */}
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="font-semibold text-gray-900 uppercase dark:text-white/80">
                                                    Issue: {account.reason.replaceAll('_', ' ')}
                                                </p>
                                                {account.order && (
                                                    <p className="text-xs text-gray-500 dark:text-white/70">
                                                        Order No: <Link className='text-sm font-medium text-indigo-600 hover:underline' href={route('dashboard.orders.show.by_order_no', account.order.order_no)}>{account.order.order_no}</Link>
                                                    </p>
                                                )}
                                            </div>

                                            <span
                                                className={`px-2 py-1 text-xs rounded-full
                            ${account.status === 'open' && 'bg-red-100 text-red-700'}
                            ${account.status === 'resolved' && 'bg-green-100 text-green-700'}
                            ${account.status === 'expired' && 'bg-gray-200 text-gray-700'}
                        `}
                                            >
                                                {account.status.toUpperCase()}
                                            </span>
                                        </div>

                                        {/* Internal Note */}
                                        {account.note && (
                                            <div className="p-3 mt-4 text-yellow-900 border-l-4 border-yellow-400 rounded-md bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-200 dark:border-yellow-500"
                                            >
                                                <p className="mb-1 text-xs font-semibold uppercase">
                                                    Internal Note
                                                </p>

                                                <p className="text-sm leading-relaxed break-words">
                                                    {account.note}
                                                </p>


                                            </div>
                                        )}


                                        {/* User Info */}
                                        <div className="mt-3 text-sm text-gray-700 dark:text-white/75">
                                            <p className="font-medium">User Details</p>
                                            <ul className="pl-5 mt-1 list-disc">
                                                <li>Name: {account.user?.name}</li>
                                                <li>Email: {account.user?.email}</li>
                                                {account.user?.phone && <li>Phone: {account.user.phone}</li>}
                                            </ul>
                                        </div>


                                        {/* Meta */}
                                        {account.meta && Object.keys(account.meta).length > 0 && (
                                            <div className="mt-3 text-sm text-gray-700 dark:text-white/75">
                                                <p className="font-medium">Details</p>
                                                <ul className="pl-5 mt-1 break-words list-disc">
                                                    {account.meta.payment_status && (
                                                        <li>Payment Status: {account.meta.payment_status}</li>
                                                    )}
                                                    {account.meta.order_nos && (
                                                        <li className="flex flex-wrap gap-1">
                                                            <span>Order No's:</span>

                                                            {account.meta.order_nos.map((orderNo, idx) => (
                                                                <Link
                                                                    key={idx}
                                                                    href={route('dashboard.orders.show.by_order_no', orderNo)}
                                                                    className="text-sm font-medium text-indigo-600 hover:underline"
                                                                >
                                                                    {orderNo}
                                                                    {idx < account.meta.order_nos.length - 1 && ','}
                                                                </Link>
                                                            ))}
                                                        </li>
                                                    )}
                                                    {account.meta.failed_orders_count && (
                                                        <li>
                                                            Failed Orders Count: {account.meta.failed_orders_count}
                                                        </li>
                                                    )}
                                                </ul>
                                            </div>
                                        )}




                                        {/* Dates */}
                                        <div className="grid grid-cols-2 gap-4 mt-4 text-xs text-gray-500 dark:text-white/70">
                                            <div>
                                                <p>Detected At</p>
                                                <p>{account.detected_at}</p>
                                            </div>

                                            {account.resolved_at && (
                                                <div>
                                                    <p>Resolved At</p>
                                                    <p>{account.resolved_at}</p>
                                                </div>
                                            )}

                                            {account.resolved_by && (
                                                <div>
                                                    <p>Resolved By</p>
                                                    {account?.is_system_resolved ? (
                                                        <>
                                                            <p>System</p>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <p>{account.resolved_by.name}</p>
                                                            <p>{account.resolved_by.email}</p>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </div>


                                        {/* Actions */}
                                        <div className="flex items-center justify-end pt-3 mt-4 border-t">
                                            {account.status === 'open' ? (
                                                <div className="relative">


                                                    <PrimaryButton
                                                        Text={
                                                            <>
                                                                <span>Actions</span>
                                                                <div className="flex gap-3">
                                                                    <svg
                                                                        className="w-4 h-4 ml-2"
                                                                        fill="none"
                                                                        stroke="currentColor"
                                                                        viewBox="0 0 24 24"
                                                                    >
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                                    </svg>
                                                                </div>
                                                            </>

                                                        }
                                                        Action={() => {
                                                            setOpenAction(open => open === account.id ? null : account.id)
                                                        }}
                                                        Type={'button'}

                                                    />

                                                    {openAction === account.id && (
                                                        <div className="absolute right-0 z-20 w-56 mt-2 bg-white border border-gray-200 rounded-md shadow-lg dark:bg-zinc-900 dark:border-gray-700">
                                                            <ul className="py-1 text-sm text-gray-700 dark:text-gray-200">

                                                                {/* Mark as resolved */}
                                                                <li>
                                                                    <button
                                                                        onClick={() => {
                                                                            setMarking(true)
                                                                            router.put(
                                                                                route('dashboard.unsettled-accounts.update', account.id),
                                                                                {},
                                                                                {
                                                                                    onFinish: () => {
                                                                                        setMarking(false)
                                                                                        setOpenAction(null)
                                                                                    },
                                                                                }
                                                                            )
                                                                        }}
                                                                        className="flex w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-zinc-800"
                                                                    >
                                                                        Mark as Resolved
                                                                    </button>
                                                                </li>

                                                                {/* Custom message */}
                                                                <li>
                                                                    <button
                                                                        onClick={() => {
                                                                            setSelectedAccount(account)
                                                                            setShowMessageModal(true)
                                                                            setOpenAction(null)
                                                                        }}
                                                                        className="flex w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-zinc-800"
                                                                    >
                                                                        Send Custom Message
                                                                    </button>
                                                                </li>

                                                                {/* Add note */}
                                                                <li>
                                                                    <button
                                                                        onClick={() => {
                                                                            setSelectedAccount(account)
                                                                            setShowNoteModal(true)
                                                                            setOpenAction(null)
                                                                        }}
                                                                        className="flex w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-zinc-800"
                                                                    >
                                                                        Add Internal Note
                                                                    </button>
                                                                </li>
                                                            </ul>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-400 dark:text-white/60">
                                                    {account.status === 'expired'
                                                        ? 'Expired – no action allowed'
                                                        : 'Resolved'}
                                                </span>
                                            )}
                                        </div>

                                    </>
                                }
                            />
                        ))}


                        {unsettledAccounts?.data?.length === 0 && (
                            <div className="flex items-center justify-center min-h-[200px]">
                                <p className="p-5 text-center text-gray-900 rounded-md dark:text-white">
                                    No data found
                                </p>
                            </div>
                        )}
                    </>}
                />


                {/* Pagination */}
                {unsettledAccounts.links && (
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
                                Disabled={!unsettledAccounts.links[0].url}
                                Action={() => handlePagination(unsettledAccounts.links[0].url)}
                                CustomClass="w-[140px] h-[40px]"
                                Type="button"
                            />
                            <ul className="hidden items-center gap-0.5 sm:flex">
                                {unsettledAccounts.links.slice(1, -1).map((link, idx) => (
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
                                Disabled={!unsettledAccounts.links[unsettledAccounts.links.length - 1].url}
                                Action={() =>
                                    handlePagination(unsettledAccounts.links[unsettledAccounts.links.length - 1].url)
                                }
                                CustomClass="w-[140px] h-[40px] mx-2"
                                Type="button"
                            />
                        </div>
                    </div>
                )}


                {/* Custom Message Send Modal */}
                {showMessageModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
                        onClick={() => {
                            setShowMessageModal(false);
                            setSelectedAccount(null);
                            setMessage('message', '');
                        }}
                    >
                        <div
                            className="w-full max-w-2xl p-5 bg-white rounded-lg dark:bg-zinc-900"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                Send Custom Message
                            </h3>

                            <TipTapEditor
                                Action={(value) => {
                                    setMessage('message', value);
                                }}
                                Id={'send_message'}
                                Value={message.message}
                            />

                            <div className="flex justify-end gap-2 mt-4">


                                <PrimaryButton
                                    Type={"button"}
                                    Text={"Cancel"}
                                    Action={() => {
                                        setShowMessageModal(false);
                                        setSelectedAccount(null);
                                        setMessage('message', '');
                                    }}
                                />
                                <PrimaryButton Text="Send Message"
                                    Spinner={messageProcessing}
                                    Type={'button'}
                                    Id={'send_message'}
                                    Action={handleSendMessage}
                                    Disabled={message.message === '<p></p>' || message.message === ''}
                                />
                            </div>
                        </div>
                    </div>
                )}


                {/* Add Note Modal */}
                {showNoteModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
                        onClick={() => {
                            setShowNoteModal(false);
                            setNote('note', '');
                            setSelectedAccount(null);
                        }}
                    >
                        <div
                            className="w-full max-w-2xl p-5 bg-white rounded-lg dark:bg-zinc-900"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                Add Internal Note
                            </h3>


                            <Textarea
                                Action={(e) => {
                                    setNote('note', e.target.value);
                                }}
                                Placeholder='Internal note (admin only)'
                                Id={'note'}
                                Name={'note'}
                                Value={note.note}
                                Rows={10}

                            />

                            <div className="flex justify-end gap-2 mt-4">


                                <PrimaryButton
                                    Type={"button"}
                                    Text={"Cancel"}
                                    Action={() => {
                                        setShowNoteModal(false);
                                        setNote('note', '');
                                        setSelectedAccount(null);
                                    }}
                                />
                                <PrimaryButton
                                    Text="Save Note"
                                    Spinner={noteProcessing}
                                    Type={'button'}
                                    Id={'update_note'}
                                    Action={handleNoteUpdate}
                                    Disabled={note.note === ''}
                                />
                            </div>
                        </div>
                    </div>
                )}


            </div>
        </AuthenticatedLayout>
    )
}

export default index
