import Card from '@/Components/Card';
import Input from '@/Components/Input';
import LinkButton from '@/Components/LinkButton';
import PrimaryButton from '@/Components/PrimaryButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BreadCrumb from '@/Components/BreadCrumb';
import { Head, useForm, usePage } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import SelectInput from '@/Components/SelectInput';
import Toast from '@/Components/Toast';
import Swal from 'sweetalert2';
import BarcodeScannerComponent from 'react-qr-barcode-scanner';
export default function edit({ smartphone_for_sale, shipping_fee_lists, import_tax_lists, smartphones }) {
    // Edit Data Form Data
    const { data, setData, put, processing, errors } = useForm({
        smartphone_id: smartphone_for_sale.smartphone_id || '',
        selling_price: smartphone_for_sale.selling_price || '',
        shipping_fee_id: smartphone_for_sale.shipping_fee_id || '',
        import_tax_id: smartphone_for_sale.import_tax_id || '',
    });

    const { currency } = usePage().props;
    // Extra Cost Data Handling
    const [additionalFees, setAdditionalFees] = useState((data.shipping_fee_id || data.import_tax_id) ? true : false);

    // Scanners
    const [smartphoneScannerOpen, setSmartphoneScannerOpen] = useState(false);

    // Edit Data Form Request
    const submit = (e) => {
        e.preventDefault();

        put(route('dashboard.smartphone-for-sales.update', smartphone_for_sale.id));
    };

    return (
        <>
            <AuthenticatedLayout>
                <Head title="Smartphone For Sales" />

                <BreadCrumb
                    header={'Edit Smartphone For Sale'}
                    parent={'Smartphone For Sales'}
                    parent_link={route('dashboard.smartphone-for-sales.index')}
                    child={'Edit Smartphone For Sale'}
                />


                <Card
                    Content={
                        <>
                            <div className="flex flex-wrap justify-end my-3">
                                <LinkButton
                                    Text={'Back To Smartphone For Sales'}
                                    URL={route('dashboard.smartphone-for-sales.index')}
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

                            <form onSubmit={submit}>
                                <Card
                                    Content={
                                        <>
                                            <div className="grid grid-cols-1 gap-4 mb-10 md:grid-cols-2">
                                                <div className="flex items-center">
                                                    <PrimaryButton
                                                        Type={'button'}
                                                        Id={'scan_smartphone'}
                                                        ClassName={
                                                            'dark:bg-deepcharcoal mt-6 dark:text-white p-2  rounded-lg text-center dark:hover:bg-gray-700 transition duration-200 ease-in-out hover:bg-blue-700 hover:text-white bg-slate-100'
                                                        }
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
                                                                    d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z"
                                                                />
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    d="M6.75 6.75h.75v.75h-.75v-.75ZM6.75 16.5h.75v.75h-.75v-.75ZM16.5 6.75h.75v.75h-.75v-.75ZM13.5 13.5h.75v.75h-.75v-.75ZM13.5 19.5h.75v.75h-.75v-.75ZM19.5 13.5h.75v.75h-.75v-.75ZM19.5 19.5h.75v.75h-.75v-.75ZM16.5 16.5h.75v.75h-.75v-.75Z"
                                                                />
                                                            </svg>
                                                        }
                                                        Action={() =>
                                                            setSmartphoneScannerOpen(true)
                                                        }
                                                    />

                                                    <SelectInput
                                                        InputName={'Smartphone'}
                                                        Id={'smartphone_id'}
                                                        Name={'smartphone_id'}
                                                        Value={data.smartphone_id}
                                                        Error={errors.smartphone_id}
                                                        Required={true}
                                                        items={smartphones}
                                                        itemKey={'name'}
                                                        Placeholder={'Select Smartphone'}
                                                        Action={(value) => {
                                                            setData('smartphone_id', value);
                                                        }}
                                                    />
                                                </div>

                                                <div className="flex items-center">
                                                    <Input
                                                        CustomCss={'w-[40px] mt-5'}
                                                        Value={currency?.symbol}
                                                        readOnly={true}
                                                    />
                                                    <Input
                                                        InputName={'Selling Price'}
                                                        Id={'selling_price'}
                                                        Name={'selling_price'}
                                                        Value={data.selling_price}
                                                        Error={errors.selling_price}
                                                        Required={true}
                                                        Placeholder={'Enter Selling Price'}
                                                        Type={'number'}
                                                        Action={(e) => {
                                                            setData(
                                                                'selling_price',
                                                                e.target.value,
                                                            );
                                                        }}
                                                    />
                                                </div>
                                            </div>

                                            {!additionalFees && (
                                                <div className="flex items-center justify-end w-full">
                                                    <PrimaryButton
                                                        Text={'Add Additional Fee'}
                                                        Type={'button'}
                                                        Id={'add_additional_fee'}
                                                        CustomClass={'w-[200px]'}
                                                        Action={() => setAdditionalFees(true)}
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
                                                                    d="m4.5 5.25 7.5 7.5 7.5-7.5m-15 6 7.5 7.5 7.5-7.5"
                                                                />
                                                            </svg>
                                                        }
                                                    />
                                                </div>
                                            )}

                                            {additionalFees && (
                                                <div
                                                    className="grid grid-cols-1 col-span-1 gap-5 overflow-x-auto align-middle scrollbar-thin dark:scrollbar-track-slate-900 dark:scrollbar-thumb-slate-700"
                                                    style={{ overflow: 'visible' }}
                                                >
                                                    <table className="w-full border-collapse">

                                                        <tbody>
                                                            <tr>
                                                                <td className="w-1/2 p-2 border dark:border-gray-700">
                                                                    <SelectInput
                                                                        InputName={
                                                                            'Shipping Fee'
                                                                        }
                                                                        Id={'shipping_fee_id'}
                                                                        Name={'shipping_fee_id'}
                                                                        Value={data.shipping_fee_id}
                                                                        items={
                                                                            shipping_fee_lists
                                                                        }
                                                                        itemKey={'name'}
                                                                        customPlaceHolder={true}
                                                                        Placeholder={"Select Shipping Fee"}
                                                                        Action={(value) => {
                                                                            setData(
                                                                                'shipping_fee_id',
                                                                                value,
                                                                            );
                                                                        }
                                                                        }
                                                                        Error={
                                                                            errors.shipping_fee_id
                                                                        }
                                                                    />
                                                                </td>
                                                                <td className="w-1/2 p-2 border dark:border-gray-700">
                                                                    <SelectInput
                                                                        InputName={
                                                                            'Import Tax'
                                                                        }
                                                                        Id={'import_tax_id'}
                                                                        Name={'import_tax_id'}
                                                                        Value={data.import_tax_id}
                                                                        items={
                                                                            import_tax_lists
                                                                        }
                                                                        itemKey={'name'}
                                                                        customPlaceHolder={true}
                                                                        Placeholder={"Select Import Tax"}
                                                                        Action={(value) => {
                                                                            setData(
                                                                                'import_tax_id',
                                                                                value,
                                                                            );
                                                                        }
                                                                        }
                                                                        Error={
                                                                            errors.import_tax_id
                                                                        }
                                                                    />
                                                                </td>

                                                                <td className="p-2 border dark:border-gray-700">
                                                                    <div className="flex items-center justify-center">
                                                                        <PrimaryButton
                                                                            Type={'button'}
                                                                            Id={
                                                                                'delete_additional_fee'
                                                                            }
                                                                            Action={() => {
                                                                                setAdditionalFees(
                                                                                    false
                                                                                )
                                                                                setData('shipping_fee_id', '');
                                                                                setData('import_tax_id', '');
                                                                            }
                                                                            }
                                                                            CustomClass={
                                                                                'w-[50px] bg-red-500 hover:bg-red-600'
                                                                            }
                                                                            Icon={
                                                                                <svg
                                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                                    fill="none"
                                                                                    viewBox="0 0 24 24"
                                                                                    strokeWidth={
                                                                                        1.5
                                                                                    }
                                                                                    stroke="currentColor"
                                                                                    className="size-6"
                                                                                >
                                                                                    <path
                                                                                        strokeLinecap="round"
                                                                                        strokeLinejoin="round"
                                                                                        d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                                                                                    />
                                                                                </svg>
                                                                            }
                                                                        />
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}

                                            <PrimaryButton
                                                Text={'Update Smartphone For Sale'}
                                                Type={'submit'}
                                                CustomClass={'w-[300px] '}
                                                Disabled={
                                                    processing ||
                                                    data.smartphone_id === '' ||
                                                    data.selling_price == 0 ||
                                                    data.selling_price === '' ||
                                                    (additionalFees && (
                                                        data.shipping_fee_id === '' &&
                                                        data.import_tax_id === ''
                                                    ))
                                                }
                                                Spinner={processing}
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
                                            />
                                        </>
                                    }
                                />
                            </form>
                        </>
                    }
                />

                {smartphoneScannerOpen && (
                    <>
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto sm:p-6">
                            <div className="fixed inset-0 backdrop-blur-[32px]"></div>

                            {/* Modal content */}
                            <div className="relative z-10 w-full max-w-lg max-h-screen p-6 overflow-y-auto bg-white shadow-xl rounded-2xl dark:bg-gray-800 sm:p-8">
                                <div className="text-center">
                                    <h2 className="text-lg font-medium text-gray-800 dark:text-white">
                                        Place The Camera On The Barcode
                                    </h2>

                                    {smartphoneScannerOpen && (
                                        <div className="flex items-center justify-center">
                                            <div className="rounded-2xl" style={{ marginTop: 20 }}>
                                                <BarcodeScannerComponent
                                                    width={400}
                                                    height={400}
                                                    onUpdate={(err, result) => {
                                                        if (result) {
                                                            axios
                                                                .get(
                                                                    route(
                                                                        'dashboard.inventories.getsmartphonebyupc',
                                                                        result.text,
                                                                    ),
                                                                )
                                                                .then((response) => {
                                                                    if (
                                                                        response.data.status ==
                                                                        false
                                                                    ) {
                                                                        Swal.fire({
                                                                            icon: 'info',
                                                                            title: 'Oops...',
                                                                            text: response.data
                                                                                .message,
                                                                        });
                                                                    } else {
                                                                        setData(
                                                                            'smartphone_id',
                                                                            response.data.smartphone
                                                                                .id,
                                                                        );
                                                                    }
                                                                })
                                                                .catch((error) => {
                                                                    Swal.fire({
                                                                        icon: 'info',
                                                                        title: 'Oops...',
                                                                        text: error,
                                                                    });
                                                                });

                                                            setSmartphoneScannerOpen(false);
                                                        }
                                                    }}
                                                />

                                                <div className="flex items-center justify-center">
                                                    <PrimaryButton
                                                        Action={() => {
                                                            setSmartphoneScannerOpen(false);
                                                        }}
                                                        Text={'Close Scanner'}
                                                        Type={'button'}
                                                        CustomClass={'mt-4'}
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
                                                                    d="M6 18 18 6M6 6l12 12"
                                                                />
                                                            </svg>
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </AuthenticatedLayout>
        </>
    );
}
