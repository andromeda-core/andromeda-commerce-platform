import BreadCrumb from '@/Components/BreadCrumb'
import Card from '@/Components/Card'
import LinkButton from '@/Components/LinkButton'
import PrimaryButton from '@/Components/PrimaryButton'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { Head, useForm } from '@inertiajs/react'
import React from 'react'

const reasons = [
    {
        key: 'payment_pending_too_long',
        label: 'Payment Pending Too Long',
    },
    {
        key: 'payment_failed',
        label: 'Payment Failed',
    },
    {
        key: 'refund_not_resolved',
        label: 'Refund Not Resolved',
    },
    {
        key: 'paid_but_not_fulfilled',
        label: 'Paid But Not Fulfilled',
    },
    {
        key: 'repeated_failed_orders_in_this_week',
        label: 'Repeated Failed Orders (This Week)',
    },
]

const Index = ({ settings }) => {

    const { data, setData, put, processing } = useForm({
        settings: settings || {},
    })

    const handleChange = (reason, field, value) => {
        setData('settings', {
            ...data.settings,
            [reason]: {
                ...data.settings?.[reason],
                [field]: value,
            },
        })
    }

    const submit = (e) => {
        e.preventDefault()
        put(route('dashboard.settings.unsettled-accounts-notification-settings.save'));
    }

    return (
        <AuthenticatedLayout>
            <Head title="Settings - Unsettled Accounts Notification Settings" />
            <BreadCrumb
                header={"Settings - Unsettled Accounts Notification Settings"}
                child={"Unsettled Accounts Notification Settings"}
                parent={"Settings"}
                parent_link={route('dashboard.settings.index')}
            />
            <Card
                Content={
                    <>

                        <div className="flex flex-wrap justify-end gap-4 my-3">

                            <LinkButton
                                Text={'Back To Settings'}
                                URL={route('dashboard.settings.index')}
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
                        </div>


                        <form onSubmit={submit} className="space-y-6">
                            <div className="p-5 pt-4 overflow-x-auto bg-white border border-gray-200 rounded-md dark:border-gray-800 dark:bg-zinc-950/50 ">
                                <table className="min-w-full">
                                    <thead>
                                        <tr>
                                            <th className="px-4 py-3 text-sm font-medium text-left text-gray-700 dark:text-gray-300">
                                                Reason
                                            </th>


                                            <th className="px-4 py-3 text-sm font-medium text-left text-gray-700 dark:text-gray-300">
                                                Delay (Hours)
                                            </th>
                                            <th className="px-4 py-3 text-sm font-medium text-left text-gray-700 dark:text-gray-300">
                                                Channel
                                            </th>
                                            <th className="px-4 py-3 text-sm font-medium text-center text-gray-700 dark:text-gray-300">
                                                Active
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                        {reasons.map((reason) => (
                                            <tr
                                                key={reason.key}
                                                className="transition bg-white dark:bg-zinc-950/50"
                                            >
                                                <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200">
                                                    {reason.label}
                                                </td>


                                                <td className="px-4 py-3">
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        placeholder="e.g. 24"
                                                        className="text-sm text-gray-900 bg-white border border-gray-300 rounded-md dark:bg-deepcharcoal dark:text-gray-100 dark:border-gray-700 focus:ring-3 focus:outline-hidden focus:border-blue-300 focus:ring-blue-500/10 dark:focus:border-blue-800 dark:focus:ring-blue-500/10"
                                                        value={data.settings?.[reason.key]?.delay || ''}
                                                        onChange={(e) =>
                                                            handleChange(reason.key, 'delay', e.target.value)
                                                        }
                                                    />

                                                </td>

                                                <td className="px-4 py-3">
                                                    <select
                                                        className="text-sm text-gray-900 bg-white border border-gray-300 rounded-md dark:bg-deepcharcoal dark:text-gray-100 dark:border-gray-700 focus:ring-3 focus:outline-hidden focus:border-blue-300 focus:ring-blue-500/10 dark:focus:border-blue-800 dark:focus:ring-blue-500/10"
                                                        value={data.settings?.[reason.key]?.channel || ''}
                                                        onChange={(e) =>
                                                            handleChange(reason.key, 'channel', e.target.value)
                                                        }
                                                    >

                                                        <option value="">Select</option>
                                                        <option value="email">Email</option>
                                                        <option value="in_app">In-App</option>
                                                    </select>

                                                </td>

                                                <td className="px-4 py-3 text-center">
                                                    <input
                                                        type="checkbox"
                                                        className="w-4 h-4 text-indigo-600 bg-white border-gray-300 rounded cursor-pointer dark:border-gray-600 dark:bg-gray-800 focus:ring-indigo-500"
                                                        checked={!!data.settings?.[reason.key]?.is_active}
                                                        onChange={(e) =>
                                                            handleChange(
                                                                reason.key,
                                                                'is_active',
                                                                e.target.checked
                                                            )
                                                        }
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="flex justify-start">

                                <PrimaryButton
                                    Type={"submit"}
                                    Text={"Save Settings"}
                                    CustomClass={"w-[250px]"}
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
                                                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
                                            />
                                        </svg>
                                    }
                                    Spinner={processing}

                                />
                            </div>
                        </form>

                    </>
                }
            />
        </AuthenticatedLayout>
    )
}

export default Index
