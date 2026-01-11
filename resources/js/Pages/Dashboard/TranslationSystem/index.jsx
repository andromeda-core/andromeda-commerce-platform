import Card from '@/Components/Card'
import LinkButton from '@/Components/LinkButton'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { Head } from '@inertiajs/react'
import React from 'react'

const index = () => {
    return (
        <AuthenticatedLayout>
            <Head title='Translation System' />
            <Card
                Content={
                    <>
                        <div className="flex flex-wrap justify-end gap-4 my-3">
                            <LinkButton
                                Text={'Back To Dashboard'}
                                URL={route('dashboard')}
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

                        <div className="grid grid-cols-1 gap-5 my-10 sm:grid-cols-2">
                            <Card
                                CustomCss={
                                    'flex justify-center items-center flex-col w-full max-w-lg mx-auto min-h-[400px]'
                                }
                                Content={
                                    <>
                                        <div className="flex items-center justify-center w-20 h-20 mb-3 bg-gray-100 rounded-full">


                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`size-10 dark:border-white`}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="m10.5 21 5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 0 1 6-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 0 1-3.827-5.802" />
                                            </svg>

                                        </div>

                                        <h2 className="mb-2 text-xl font-semibold text-center text-gray-800 dark:text-white">
                                            Lanagues
                                        </h2>

                                        <p className="mb-6 leading-relaxed text-center text-gray-600 dark:text-white">
                                            Manage your application Languages,
                                        </p>

                                        <LinkButton
                                            URL={route('dashboard.translation-system.languages.index')}
                                            Text={'Manage Languages'}
                                            CustomClass="w-full md:w-[280px] "
                                            Icon={
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`size-6 dark:border-white`}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="m10.5 21 5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 0 1 6-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 0 1-3.827-5.802" />
                                                </svg>
                                            }
                                        />
                                    </>
                                }
                            />



                            <Card
                                CustomCss={
                                    'flex justify-center items-center flex-col w-full max-w-lg mx-auto min-h-[400px]'
                                }
                                Content={
                                    <>
                                        <div className="flex items-center justify-center w-20 h-20 mb-3 bg-gray-100 rounded-full">


                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`size-10 dark:border-white`}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="m10.5 21 5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 0 1 6-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 0 1-3.827-5.802" />
                                            </svg>

                                        </div>

                                        <h2 className="mb-2 text-xl font-semibold text-center text-gray-800 dark:text-white">
                                            Translation Keys
                                        </h2>

                                        <p className="mb-6 leading-relaxed text-center text-gray-600 dark:text-white">
                                            Manage your application Translation Keys (Only For Developer),
                                        </p>

                                        <LinkButton
                                            URL={route('dashboard.translation-system.translation-keys.index')}
                                            Text={'Manage Translation Keys'}
                                            CustomClass="w-full md:w-[280px] "
                                            Icon={
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`size-6 dark:border-white`}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="m10.5 21 5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 0 1 6-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 0 1-3.827-5.802" />
                                                </svg>
                                            }
                                        />
                                    </>
                                }
                            />

                        </div>
                    </>
                }
            />



        </AuthenticatedLayout>
    )
}

export default index
