import PrimaryButton from '@/Components/PrimaryButton';
import SelectInput from '@/Components/SelectInput';

export default function CountryShippingRepeater({
    data,
    setData,
    countries,
    shipping_fee_lists,
    import_tax_lists,
    errors,
}) {
    // Country Based Shipping & Import Repeater Handlers
    const addCountryShipping = () => {
        setData('country_shippings', [
            ...data.country_shippings,
            { country_id: '', shipping_fee_id: '', import_tax_id: '' },
        ]);
    };

    const removeCountryShipping = (index) => {
        setData(
            'country_shippings',
            data.country_shippings.filter((_, i) => i !== index),
        );
    };

    const handleCountryShippingChange = (index, field, value) => {
        const updated = data.country_shippings.map((row, i) =>
            i === index ? { ...row, [field]: value } : row,
        );
        setData('country_shippings', updated);
    };

    // Frontend duplicate-country guard: exclude countries already chosen in OTHER rows
    const availableCountriesForRow = (index) => {
        const chosen = data.country_shippings
            .filter((_, i) => i !== index)
            .map((row) => String(row.country_id))
            .filter((id) => id !== '' && id !== 'null' && id !== 'undefined');

        return countries.filter((c) => !chosen.includes(String(c.id)));
    };

    return (
        <div className="mt-10">
            <div className="mb-3 flex w-full flex-wrap items-center justify-between gap-3">
                <h3 className="text-base font-semibold text-main-text-light dark:text-main-text-dark">
                    Country Based Shipping &amp; Import
                </h3>
                <PrimaryButton
                    Text={'Add Row'}
                    Type={'button'}
                    Id={'add_country_shipping'}
                    CustomClass={'w-[150px]'}
                    Action={addCountryShipping}
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

            {data.country_shippings.length > 0 && (
                <div
                    className="col-span-1 grid grid-cols-1 gap-5 overflow-x-auto align-middle scrollbar-thin dark:scrollbar-track-slate-900 dark:scrollbar-thumb-slate-700"
                    style={{ overflow: 'visible' }}
                >
                    <table className="w-full border-collapse">
                        <tbody>
                            {data.country_shippings.map((row, index) => (
                                <tr key={index}>
                                    <td className="border p-2 align-top dark:border-gray-700">
                                        <SelectInput
                                            InputName={'Country'}
                                            Id={`country_shippings_${index}_country_id`}
                                            Name={`country_shippings_${index}_country_id`}
                                            Value={row.country_id}
                                            items={availableCountriesForRow(index)}
                                            itemKey={'name'}
                                            customPlaceHolder={true}
                                            Placeholder={'Select Country'}
                                            Required={true}
                                            Action={(value) =>
                                                handleCountryShippingChange(
                                                    index,
                                                    'country_id',
                                                    value,
                                                )
                                            }
                                            Error={
                                                errors[
                                                    `country_shippings.${index}.country_id`
                                                ]
                                            }
                                        />
                                    </td>
                                    <td className="border p-2 align-top dark:border-gray-700">
                                        <SelectInput
                                            InputName={'Shipping Fee'}
                                            Id={`country_shippings_${index}_shipping_fee_id`}
                                            Name={`country_shippings_${index}_shipping_fee_id`}
                                            Value={row.shipping_fee_id}
                                            items={shipping_fee_lists}
                                            itemKey={'name'}
                                            customPlaceHolder={true}
                                            Placeholder={'Select Shipping Fee'}
                                            Action={(value) =>
                                                handleCountryShippingChange(
                                                    index,
                                                    'shipping_fee_id',
                                                    value,
                                                )
                                            }
                                            Error={
                                                errors[
                                                    `country_shippings.${index}.shipping_fee_id`
                                                ]
                                            }
                                        />
                                    </td>
                                    <td className="border p-2 align-top dark:border-gray-700">
                                        <SelectInput
                                            InputName={'Import Tax'}
                                            Id={`country_shippings_${index}_import_tax_id`}
                                            Name={`country_shippings_${index}_import_tax_id`}
                                            Value={row.import_tax_id}
                                            items={import_tax_lists}
                                            itemKey={'name'}
                                            customPlaceHolder={true}
                                            Placeholder={'Select Import Tax'}
                                            Action={(value) =>
                                                handleCountryShippingChange(
                                                    index,
                                                    'import_tax_id',
                                                    value,
                                                )
                                            }
                                            Error={
                                                errors[
                                                    `country_shippings.${index}.import_tax_id`
                                                ]
                                            }
                                        />
                                    </td>
                                    <td className="border p-2 align-top dark:border-gray-700">
                                        <div className="flex items-center justify-center">
                                            <PrimaryButton
                                                Type={'button'}
                                                Id={`remove_country_shipping_${index}`}
                                                Action={() => removeCountryShipping(index)}
                                                CustomClass={
                                                    'w-[50px] bg-red-500 hover:bg-red-600'
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
                                                            d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                                                        />
                                                    </svg>
                                                }
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
