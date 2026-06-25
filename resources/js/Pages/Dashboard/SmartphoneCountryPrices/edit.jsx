import Card from '@/Components/Card';
import Input from '@/Components/Input';
import LinkButton from '@/Components/LinkButton';
import PrimaryButton from '@/Components/PrimaryButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BreadCrumb from '@/Components/BreadCrumb';
import { Head, useForm } from '@inertiajs/react';
import SelectInput from '@/Components/SelectInput';

export default function edit({ countries, sales, currency, smartphone_country_price }) {
    // Create Data Form Data
    const { data, setData, put, processing, errors, reset } = useForm({
        smartphone_for_sale_id: smartphone_country_price.smartphone_for_sale_id || '',
        country_id: smartphone_country_price.country_id || '',
        price: smartphone_country_price.price || '',
    });

    // Create Data Form Request
    const submit = (e) => {
        e.preventDefault();
        put(route('dashboard.smartphone-country-prices.update', smartphone_country_price.id));
    };

    return (
        <>
            <AuthenticatedLayout>
                <Head title="Smartphone Country Prices" />

                <BreadCrumb
                    header={'Edit Smartphone Country Price'}
                    parent={'Smartphone Country Prices'}
                    parent_link={route('dashboard.smartphone-country-prices.index')}
                    child={'Edit Smartphone Country Price'}
                />

                <Card
                    Content={
                        <>
                            <div className="my-3 flex flex-wrap justify-end">
                                <LinkButton
                                    Text={'Back To Smartphone Country Prices'}
                                    URL={route('dashboard.smartphone-country-prices.index')}
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
                                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                <SelectInput
                                                    InputName={'Smartphone For Sale (Smartphone)'}
                                                    Id={'smartphone_for_sale_id'}
                                                    Name={'smartphone_for_sale_id'}
                                                    Error={errors.smartphone_for_sale_id}
                                                    Value={data.smartphone_for_sale_id}
                                                    Required={true}
                                                    Action={(value) =>
                                                        setData('smartphone_for_sale_id', value)
                                                    }
                                                    items={sales}
                                                    itemKey={'name'}
                                                />

                                                <SelectInput
                                                    InputName={'Country'}
                                                    Id={'country_id'}
                                                    Name={'country_id'}
                                                    Error={errors.country_id}
                                                    Value={data.country_id}
                                                    Required={true}
                                                    Action={(value) => setData('country_id', value)}
                                                    items={countries}
                                                    itemKey={'name'}
                                                />

                                                <div className="flex items-center">
                                                    <Input
                                                        CustomCss={'w-[40px] mt-5'}
                                                        Value={currency?.symbol}
                                                        readOnly={true}
                                                    />
                                                    <Input
                                                        InputName={'Price'}
                                                        Error={errors.price}
                                                        Value={data.price}
                                                        Action={(e) =>
                                                            setData('price', e.target.value)
                                                        }
                                                        Placeholder={'Enter Price'}
                                                        Id={'price'}
                                                        Name={'price'}
                                                        Type={'number'}
                                                        Required={true}
                                                    />
                                                </div>
                                            </div>

                                            <PrimaryButton
                                                Text={'Update Smartphone Country Price'}
                                                Type={'submit'}
                                                CustomClass={'lg:w-[350px]'}
                                                Disabled={
                                                    processing ||
                                                    data.country_id === '' ||
                                                    data.smartphone_for_sale_id === '' ||
                                                    data.price === ''
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
            </AuthenticatedLayout>
        </>
    );
}
