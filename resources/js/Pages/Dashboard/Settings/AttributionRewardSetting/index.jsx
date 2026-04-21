import BreadCrumb from '@/Components/BreadCrumb';
import Card from '@/Components/Card';
import Input from '@/Components/Input';
import LinkButton from '@/Components/LinkButton';
import PrimaryButton from '@/Components/PrimaryButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';

export default function index({ setting }) {
    const { props } = usePage();
    const currency = props?.currency;

    const { data, setData, errors, put, processing } = useForm({
        calculation_type: setting?.calculation_type ?? 'percentage',
        value: setting?.value ?? '',
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('dashboard.settings.attribution-reward-setting.save'));
    };

    const isPercentage = data.calculation_type === 'percentage';
    const isFixed = data.calculation_type === 'fixed';

    return (
        <AuthenticatedLayout>
            <Head title="Settings - Attribution Reward Setting" />

            <BreadCrumb
                header="Settings - Attribution Reward Setting"
                parent="Settings"
                parent_link={route('dashboard.settings.index')}
                child="Attribution Reward Setting"
            />

            <Card
                Content={
                    <>
                        <div className="my-3 flex flex-wrap justify-end gap-4">
                            <LinkButton
                                Text="Back To Settings"
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

                        <form onSubmit={submit}>
                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                {/* Calculation Type Toggle */}
                                <div>
                                    <p className="mb-2 text-sm font-medium text-gray-700 dark:text-white/70">
                                        Calculation Type <span className="text-red-500">*</span>
                                    </p>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setData('calculation_type', 'percentage')
                                            }
                                            className={`flex-1 rounded-lg border-2 px-4 py-2.5 text-sm font-medium transition-all ${
                                                isPercentage
                                                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-500 dark:bg-indigo-900/20 dark:text-indigo-300'
                                                    : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300 dark:border-gray-700 dark:bg-transparent dark:text-gray-400 dark:hover:border-gray-600'
                                            }`}
                                        >
                                            % Percentage
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setData('calculation_type', 'fixed')}
                                            className={`flex-1 rounded-lg border-2 px-4 py-2.5 text-sm font-medium transition-all ${
                                                isFixed
                                                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-500 dark:bg-indigo-900/20 dark:text-indigo-300'
                                                    : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300 dark:border-gray-700 dark:bg-transparent dark:text-gray-400 dark:hover:border-gray-600'
                                            }`}
                                        >
                                            {currency?.symbol ?? '$'} Fixed Amount
                                        </button>
                                    </div>
                                    {errors.calculation_type && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {errors.calculation_type}
                                        </p>
                                    )}
                                </div>

                                {/* Value Input */}
                                <div className="flex items-center">
                                    <Input
                                        CustomCss="w-[60px] mt-5"
                                        Value={isPercentage ? '%' : (currency?.symbol ?? '$')}
                                        readOnly={true}
                                    />
                                    <Input
                                        InputName={
                                            isPercentage
                                                ? 'Reward Percentage'
                                                : `Reward Amount (${currency?.name ?? 'Fixed'})`
                                        }
                                        Id="value"
                                        Name="value"
                                        Error={errors.value}
                                        Placeholder={isPercentage ? 'e.g. 5 for 5%' : `e.g. 10`}
                                        Type="number"
                                        Value={data.value}
                                        Action={(e) => setData('value', e.target.value)}
                                        Required={true}
                                    />
                                </div>
                            </div>

                            {/* Info text */}
                            <div className="my-4 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5 dark:border-gray-800 dark:bg-white/[0.02]">
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {isPercentage
                                        ? `Partner will receive ${data.value || '0'}% of the order total as attribution reward.`
                                        : `Partner will receive a flat ${currency?.symbol ?? '$'}${data.value || '0'} per order as attribution reward.`}
                                </p>
                            </div>

                            <PrimaryButton
                                Text="Save Attribution Reward Setting"
                                Type="submit"
                                CustomClass="w-[300px]"
                                Disabled={processing || data.value === ''}
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
                        </form>
                    </>
                }
            />
        </AuthenticatedLayout>
    );
}
