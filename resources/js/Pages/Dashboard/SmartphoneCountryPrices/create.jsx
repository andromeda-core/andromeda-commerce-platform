import Card from '@/Components/Card';
import Input from '@/Components/Input';
import LinkButton from '@/Components/LinkButton';
import PrimaryButton from '@/Components/PrimaryButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BreadCrumb from '@/Components/BreadCrumb';
import { Head, useForm } from '@inertiajs/react';
import SelectInput from '@/Components/SelectInput';


export default function create({ countries, sales, currency }) {
    // Create Data Form Data
    const { data, setData, post, processing, errors, reset } = useForm({
        smartphone_for_sale_id: '',
        country_id: '',
        price: '',
    });


    // Create Data Form Request
    const submit = (e) => {
        e.preventDefault();
        post(route('dashboard.smartphone-country-prices.store'));
    };



    return (
        <>
            <AuthenticatedLayout>
                <Head title="Smartphone Country Prices" />

                <BreadCrumb
                    header={'Create Smartphone Country Price'}
                    parent={'Smartphone Country Prices'}
                    parent_link={route('dashboard.smartphone-country-prices.index')}
                    child={'Create Smartphone Country Price'}
                />

                <Card
                    Content={
                        <>
                            <div className="flex flex-wrap justify-end my-3">
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
                                                    Action={(value) => setData('smartphone_for_sale_id', value)}
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
                                                        Action={(e) => setData('price', e.target.value)}
                                                        Placeholder={'Enter Price'}
                                                        Id={'price'}
                                                        Name={'price'}
                                                        Type={'number'}
                                                        Required={true}
                                                    />
                                                </div>



                                            </div>



                                            <PrimaryButton
                                                Text={'Create Smartphone Country Price'}
                                                Type={'submit'}
                                                CustomClass={'w-[300px]'}
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
                                                            d="M12 4.5v15m7.5-7.5h-15"
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
