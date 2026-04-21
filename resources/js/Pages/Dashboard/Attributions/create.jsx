import Card from '@/Components/Card';
import LinkButton from '@/Components/LinkButton';
import PrimaryButton from '@/Components/PrimaryButton';
import SelectInput from '@/Components/SelectInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BreadCrumb from '@/Components/BreadCrumb';
import { Head, useForm } from '@inertiajs/react';

const NodeDisplay = ({ label, value, color }) => {
    const colors = {
        blue: {
            wrap: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/50',
            icon: 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400',
            label: 'text-blue-500 dark:text-blue-400',
            val: 'text-blue-800 dark:text-blue-200',
            empty: 'text-blue-300 dark:text-blue-700',
        },
        violet: {
            wrap: 'bg-violet-50 dark:bg-violet-900/20 border-violet-200 dark:border-violet-800/50',
            icon: 'bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400',
            label: 'text-violet-500 dark:text-violet-400',
            val: 'text-violet-800 dark:text-violet-200',
            empty: 'text-violet-300 dark:text-violet-700',
        },
        emerald: {
            wrap: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/50',
            icon: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400',
            label: 'text-emerald-500 dark:text-emerald-400',
            val: 'text-emerald-800 dark:text-emerald-200',
            empty: 'text-emerald-300 dark:text-emerald-700',
        },
    };
    const c = colors[color];
    const icons = {
        blue: (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 18h.01M8 21l4-4 4 4M3 9l9-9 9 9M12 12v6"
                />
            </svg>
        ),
        violet: (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
            </svg>
        ),
        emerald: (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
            </svg>
        ),
    };

    return (
        <div
            className={`flex min-h-[64px] items-center gap-3 rounded-xl border px-4 py-3 ${c.wrap}`}
        >
            <div
                className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${c.icon}`}
            >
                {icons[color]}
            </div>
            <div className="min-w-0">
                <p className={`mb-0.5 text-xs font-medium ${c.label}`}>{label}</p>
                {value ? (
                    <p className={`truncate text-sm font-semibold ${c.val}`}>{value}</p>
                ) : (
                    <p className={`text-sm italic ${c.empty}`}>Not selected</p>
                )}
            </div>
        </div>
    );
};

const ArrowConnector = ({ active }) => (
    <div className="flex w-8 flex-shrink-0 items-center justify-center">
        <div className="flex items-center gap-0.5">
            <div
                className={`h-px w-3 transition-colors ${active ? 'bg-gray-400 dark:bg-gray-500' : 'bg-gray-200 dark:bg-gray-700'}`}
            ></div>
            <svg
                className={`h-4 w-4 transition-colors ${active ? 'text-gray-500 dark:text-gray-400' : 'text-gray-200 dark:text-gray-700'}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
            </svg>
        </div>
    </div>
);

export default function Create({ smartphones, posts, users }) {
    const { data, setData, post, processing, errors } = useForm({
        smartphone_id: '',
        user_id: '',
        post_id: '',
    });

    const selectedSmartphone = smartphones?.find((s) => s.id == data.smartphone_id);
    const selectedUser = users?.find((u) => u.id == data.user_id);
    const selectedPost = posts?.find((p) => p.id == data.post_id);
    const canSubmit = data.smartphone_id && data.user_id;

    const submit = (e) => {
        e.preventDefault();
        post(route('dashboard.attribution-links.store'));
    };

    return (
        <AuthenticatedLayout>
            <Head title="Create Attribution Link" />

            <BreadCrumb
                header="Create Attribution Link"
                parent="Attribution Links"
                parent_link={route('dashboard.attribution-links.index')}
                child="Create"
            />

            <Card
                Content={
                    <>
                        <div className="my-3 flex flex-wrap justify-end">
                            <LinkButton
                                Text="Back To Attribution Links"
                                URL={route('dashboard.attribution-links.index')}
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
                                        {/* Form Inputs */}
                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <SelectInput
                                                InputName="Product (Smartphone)"
                                                Error={errors.smartphone_id}
                                                Value={data.smartphone_id}
                                                Action={(value) => setData('smartphone_id', value)}
                                                Placeholder="Select Product"
                                                Id="smartphone_id"
                                                Name="smartphone_id"
                                                Required={true}
                                                items={smartphones}
                                                itemKey="name"
                                            />

                                            <SelectInput
                                                InputName="Partner (User)"
                                                Error={errors.user_id}
                                                Value={data.user_id}
                                                Action={(value) => setData('user_id', value)}
                                                Placeholder="Select Partner"
                                                Id="user_id"
                                                Name="user_id"
                                                Required={true}
                                                items={users}
                                                itemKey="name"
                                            />

                                            <SelectInput
                                                InputName="Post (Optional)"
                                                Error={errors.post_id}
                                                Value={data.post_id}
                                                Action={(value) => setData('post_id', value)}
                                                Placeholder="Select Post (Optional)"
                                                Id="post_id"
                                                Name="post_id"
                                                Required={false}
                                                items={posts}
                                                itemKey="title"
                                                customPlaceHolder={true}
                                            />
                                        </div>

                                        {/* Connection Preview */}
                                        <div className="mt-6 rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-white/[0.02]">
                                            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                                                Link Preview
                                            </p>

                                            <div className="flex items-center gap-2">
                                                <div className="flex-1">
                                                    <NodeDisplay
                                                        label="Product"
                                                        value={selectedSmartphone?.name}
                                                        color="blue"
                                                    />
                                                </div>

                                                <ArrowConnector active={!!selectedSmartphone} />

                                                <div className="flex-1">
                                                    <NodeDisplay
                                                        label="Partner"
                                                        value={selectedUser?.name}
                                                        color="violet"
                                                    />
                                                </div>

                                                <ArrowConnector active={canSubmit} />

                                                <div className="flex-1">
                                                    <NodeDisplay
                                                        label="Post (Optional)"
                                                        value={selectedPost?.title}
                                                        color="emerald"
                                                    />
                                                </div>
                                            </div>

                                            {/* Status line */}
                                            <div
                                                className={`mt-4 flex items-center gap-2 rounded-lg border px-3 py-2.5 transition-colors ${
                                                    canSubmit
                                                        ? 'border-green-100 bg-green-50 dark:border-green-800/40 dark:bg-green-900/20'
                                                        : 'border-gray-100 bg-white dark:border-gray-800 dark:bg-transparent'
                                                }`}
                                            >
                                                <div
                                                    className={`h-2 w-2 flex-shrink-0 rounded-full ${canSubmit ? 'bg-green-400' : 'bg-gray-200 dark:bg-gray-700'}`}
                                                ></div>
                                                <p
                                                    className={`text-xs ${canSubmit ? 'text-green-700 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}`}
                                                >
                                                    {canSubmit
                                                        ? `Ready — will generate: ${window.location.origin}/link/lnk_...`
                                                        : 'Select a product and a partner to enable link generation'}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Submit */}
                                        <div className="mt-5">
                                            <PrimaryButton
                                                Text="Generate Attribution Link"
                                                CustomClass="w-[250px]"
                                                Disabled={processing || !canSubmit}
                                                Spinner={processing}
                                                Icon={
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        strokeWidth={1.5}
                                                        stroke="currentColor"
                                                        className="size-5"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244"
                                                        />
                                                    </svg>
                                                }
                                            />
                                        </div>
                                    </>
                                }
                            />
                        </form>
                    </>
                }
            />
        </AuthenticatedLayout>
    );
}
