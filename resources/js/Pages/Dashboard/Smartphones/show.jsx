import BreadCrumb from '@/Components/BreadCrumb';
import Card from '@/Components/Card';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { Navigation, Pagination } from 'swiper/modules';
import LinkButton from '@/Components/LinkButton';

export default function Show({ smartphone }) {
    const { currency } = usePage().props;

    return (
        <AuthenticatedLayout>
            <Head title="Smartphones" />
            <BreadCrumb
                header={'View Smartphone'}
                parent={'Smartphones'}
                parent_link={route('dashboard.smartphones.index')}
                child={'View Smartphone'}
            />

            <Card
                Content={
                    <>
                        <div className="flex flex-wrap justify-end gap-4 my-3">
                            <LinkButton
                                Text={'Edit Smartphone'}
                                URL={route('dashboard.smartphones.edit', smartphone.id)}
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
                                            d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
                                        />
                                    </svg>
                                }
                            />

                            <LinkButton
                                Text={'Back To Smartphones'}
                                URL={route('dashboard.smartphones.index')}
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

                        <div className="p-6">
                            {/* Smartphone Info Section */}
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div>
                                    <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-gray-200">
                                        Smartphone Details
                                    </h2>
                                    <dl className="divide-y divide-gray-200 dark:divide-gray-700">
                                        <div className="flex justify-between py-3">
                                            <dt className="text-gray-600 dark:text-gray-400">
                                                Model
                                            </dt>
                                            <dd className="font-medium text-gray-900 dark:text-gray-100">
                                                {smartphone?.model_name?.name || 'N/A'}
                                            </dd>
                                        </div>
                                        <div className="flex justify-between py-3">
                                            <dt className="text-gray-600 dark:text-gray-400">
                                                Category
                                            </dt>
                                            <dd className="font-medium text-gray-900 dark:text-gray-100">
                                                {smartphone.category?.name || 'N/A'}
                                            </dd>
                                        </div>
                                        <div className="flex justify-between py-3">
                                            <dt className="text-gray-600 dark:text-gray-400">
                                                Colors
                                            </dt>
                                            <dd className="flex flex-wrap justify-end gap-3 font-medium text-gray-900 dark:text-gray-100">
                                                {smartphone.colors?.length > 0 ? (
                                                    smartphone.colors.map((color) => (
                                                        <span
                                                            key={color.id}
                                                            className="flex items-center gap-2 px-2 py-1 border border-gray-300 rounded-md dark:border-gray-600"
                                                        >
                                                            <span
                                                                className="w-4 h-4 border rounded-full"
                                                                style={{
                                                                    backgroundColor: color.code,
                                                                }}
                                                            ></span>
                                                            {color.name}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-gray-500 dark:text-gray-400">
                                                        N/A
                                                    </span>
                                                )}
                                            </dd>
                                        </div>

                                        <div className="flex justify-between py-3">
                                            <dt className="text-gray-600 dark:text-gray-400">
                                                Capacity
                                            </dt>
                                            <dd className="font-medium text-gray-900 dark:text-gray-100">
                                                {smartphone.capacity?.name || 'N/A'}
                                            </dd>
                                        </div>
                                        <div className="flex justify-between py-3">
                                            <dt className="text-gray-600 dark:text-gray-400">
                                                UPC
                                            </dt>
                                            <dd className="font-medium text-gray-900 dark:text-gray-100">
                                                {smartphone.upc || 'N/A'}
                                            </dd>
                                        </div>

                                        <div className="flex justify-between py-3">
                                            <dt className="text-gray-600 dark:text-gray-400">
                                                Selling Price
                                            </dt>
                                            <dd className="font-medium text-gray-900 dark:text-gray-100">
                                                {(smartphone?.selling_info &&
                                                    currency.symbol +
                                                    ' ' +
                                                    smartphone?.selling_info?.total_price) ||
                                                    'N/A'}
                                            </dd>
                                        </div>

                                        <div className="flex justify-between py-3">
                                            <dt className="text-gray-600 dark:text-gray-400">
                                                Tag
                                            </dt>
                                            <dd className="font-medium text-gray-900 dark:text-gray-100">
                                                {smartphone?.tag || 'N/A'}
                                            </dd>
                                        </div>


                                        <div className="flex justify-between py-3">
                                            <dt className="text-gray-600 dark:text-gray-400">
                                                Country/Region
                                            </dt>
                                            <dd className="font-medium text-gray-900 dark:text-gray-100">
                                                {smartphone?.country?.name || 'N/A'}
                                            </dd>
                                        </div>



                                        <div className="flex justify-between py-3">
                                            <dt className="text-gray-600 dark:text-gray-400">
                                                Condition
                                            </dt>
                                            <dd className="font-medium text-gray-900 dark:text-gray-100">
                                                {smartphone?.condition?.name || 'N/A'}
                                            </dd>
                                        </div>


                                        <div className="flex justify-between py-3">
                                            <dt className="text-gray-600 dark:text-gray-400">
                                                Return Policy
                                            </dt>
                                            <dd className="font-medium text-gray-900 dark:text-gray-100">
                                                {smartphone?.return_policy?.name || 'N/A'}
                                            </dd>
                                        </div>


                                        <div className="flex justify-between py-3">
                                            <dt className="text-gray-600 dark:text-gray-400">
                                                Courier Company
                                            </dt>
                                            <dd className="font-medium text-gray-900 dark:text-gray-100">
                                                {smartphone?.courier_company?.courier_name || 'N/A'}
                                            </dd>
                                        </div>


                                        <div className="flex justify-between py-3">
                                            <dt className="text-gray-600 dark:text-gray-400">
                                                Max Delivery Days
                                            </dt>
                                            <dd className="font-medium text-gray-900 dark:text-gray-100">
                                                {smartphone?.delivery_days || 'N/A'}
                                            </dd>
                                        </div>
                                    </dl>
                                </div>

                                {/* Smartphone Images */}
                                <div>
                                    <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-gray-200">
                                        Smartphone Images
                                    </h2>
                                    <div className="grid grid-cols-1 gap-4">
                                        <Swiper
                                            style={{
                                                '--swiper-navigation-color': '#222',
                                                '--swiper-pagination-color': '#222',
                                            }}
                                            pagination={{
                                                clickable: true,
                                            }}
                                            loop
                                            navigation={true}
                                            modules={[Pagination, Navigation]}
                                            className="mySwiper h-[400px] w-full"
                                        >
                                            {Array.isArray(smartphone?.smartphone_image_urls) &&
                                                smartphone.smartphone_image_urls.map(
                                                    (img, index) =>
                                                        img && (
                                                            <SwiperSlide key={`img-${index}`}>
                                                                <img
                                                                    src={img}
                                                                    alt={`Image ${index + 1}`}
                                                                    loading="lazy"
                                                                    className="object-cover w-full h-full rounded-lg select-none"
                                                                />
                                                                <div className="swiper-lazy-preloader dark:swiper-lazy-preloader-white"></div>
                                                            </SwiperSlide>
                                                        ),
                                                )}
                                        </Swiper>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                }
            />
        </AuthenticatedLayout>
    );
}
