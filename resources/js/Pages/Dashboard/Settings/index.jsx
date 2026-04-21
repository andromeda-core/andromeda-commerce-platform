import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BreadCrumb from '@/Components/BreadCrumb';
import { Head } from '@inertiajs/react';
import React, { useState } from 'react';
import LinkButton from '@/Components/LinkButton';
import Card from '@/Components/Card';
import can from '@/Hooks/useCan';

export default function index() {
    const [activeTab, setActiveTab] = useState('Basic');

    const tabs = ['Basic', 'Integrations', 'Operations', 'Financial', 'Policies', 'Regional'];

    const allTabContent = {
        Basic: [
            {
                title: 'General',
                desc: 'Manage your application settings including app name, contact information, and branding like logos—all from one place.',
                button: 'General Settings',
                url: route('dashboard.settings.general.setting'),
            },
            {
                title: 'Dormancy',
                desc: 'Easily manage and configure Dormancy Setting across your application to control User Dormancy Threshold.',
                button: 'Dormancy Settings',
                url: route('dashboard.settings.dormancy-setting.index'),
            },
            {
                title: 'Role',
                desc: 'Easily manage and configure and create roles across your application to control responsibilities.',
                button: 'Role Settings',
                url: route('dashboard.settings.roles.index'),
            },
        ],
        Integrations: [
            {
                title: 'AWS',
                desc: 'Configure and manage Amazon Web Services credentials for storage, cloud services, and infrastructure integrations.',
                button: 'Manage Keys',
                url: route('dashboard.settings.aws-settings.index'),
            },
            {
                title: 'Meta',
                desc: 'Manage Meta platform credentials and API integrations for Messaging, services.',
                button: 'Manage Keys',
                url: route('dashboard.settings.meta-settings.index'),
            },
            {
                title: 'Google Map',
                desc: 'Set up and maintain Google Maps API configurations for geolocation, address validation, and map services.',
                button: 'Manage Keys',
                url: route('dashboard.settings.google-map-settings.index'),
            },
            {
                title: 'SMTP',
                desc: 'Configure SMTP server settings to enable secure and reliable email communications from the platform.',
                button: 'Manage Keys',
                url: route('dashboard.settings.smtp.setting'),
            },
            {
                title: 'NOWPayment',
                desc: 'Manage NOWPayments API credentials to enable cryptocurrency payment processing within the system.',
                button: 'Manage Keys',
                url: route('dashboard.settings.now-payment-settings.index'),
            },
        ],
        Operations: [
            {
                title: 'Storage Locations',
                desc: 'Manage warehouse and storage locations to accurately track inventory distribution and operational logistics.',
                button: 'Manage Locations',
                url: route('dashboard.settings.storage_locations.index'),
            },
            {
                title: 'Courier Companies',
                desc: 'Configure and manage courier partners to streamline shipping operations and delivery workflows.',
                button: 'Manage Companies',
                url: route('dashboard.settings.courier-company-settings.index'),
            },
        ],
        Financial: [
            {
                title: 'Currency',
                desc: 'Manage supported currencies, and monetary preferences for global transactions.',
                button: 'Manage Currencies',
                url: route('dashboard.settings.currencies.index'),
            },
            {
                title: 'Commission',
                desc: 'Define and control commission structures to automate earnings calculations across sales and partnerships.',
                button: 'Manage Commissions',
                url: route('dashboard.settings.commission-settings.index'),
            },
            {
                title: 'Additional Fees',
                desc: 'Configure supplementary fees and service charges applied during transactions and operational processes.',
                button: 'Manage Additional Fees',
                url: route('dashboard.settings.additional_fee_lists.index'),
            },
            {
                title: 'Reward Rate',
                desc: 'Set and manage reward point conversion rates to maintain an effective and balanced loyalty system.',
                button: 'Manage Reward Rate',
                url: route('dashboard.settings.reward-point-setting.index'),
            },
            {
                title: 'Unsettled Account Notifications',
                desc: 'Monitor and manage alerts related to unsettled accounts to ensure financial transparency and timely resolution.',
                button: 'View Notifications',
                url: route('dashboard.settings.unsettled-accounts-notification-settings.index'),
            },

            {
                title: 'Attribution Reward Rate',
                desc: 'Set and manage attribution reward conversion rates to maintain an effective and balanced loyalty system.',
                button: 'Manage Attribution Reward Rate',
                url: route('dashboard.settings.attribution-reward-setting.index'),
            },
        ],
        Policies: [
            {
                title: 'Return Policy',
                desc: 'Create and maintain return policy guidelines to ensure transparent refund and return procedures.',
                button: 'Manage Return Policy',
                url: route('dashboard.settings.return-policy-settings.index'),
            },
            {
                title: 'Shipping Policy',
                desc: 'Define shipping terms, delivery conditions, and logistics policies for consistent customer communication.',
                button: 'Manage Shipping Policy',
                url: route('dashboard.settings.shipping-policy-settings.index'),
            },
            {
                title: 'Privacy Policy',
                desc: 'Manage privacy policy content to ensure compliance with data protection regulations and transparency standards.',
                button: 'Manage Privacy Policy',
                url: route('dashboard.settings.privacy-policy-settings.index'),
            },
            {
                title: 'Terms of Service',
                desc: 'Maintain and update the platform’s terms of service to clearly define usage rules and legal agreements.',
                button: 'Manage Terms of Service',
                url: route('dashboard.settings.terms-of-service-settings.index'),
            },
        ],
        Regional: [
            {
                title: 'Countries',
                desc: 'Manage supported countries to control regional availability, taxation, and operational coverage.',
                button: 'Manage Countries',
                url: route('dashboard.settings.countries.index'),
            },
            {
                title: 'Special Countries',
                desc: 'Configure special country rules and exceptions for region-specific policies and operational adjustments.',
                button: 'Manage Special Countries',
                url: route('dashboard.settings.special-countries.index'),
            },
        ],
    };
    const visibleTabContent = Object.fromEntries(
        Object.entries(allTabContent).map(([tabName, items]) => {
            const allowedItems = items.filter((item) => can(item.title));
            return [tabName, allowedItems];
        }),
    );

    const visibleTabs = tabs.filter((tab) => (visibleTabContent[tab]?.length ?? 0) > 0);

    function SubCard({ title, desc, button, url }) {
        return (
            <div className="flex min-h-[260px] flex-col justify-between rounded-md border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-zinc-950/50">
                <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white/80">
                        {title}
                    </h3>
                    <p className="mt-3 leading-relaxed text-gray-600 dark:text-white/80">{desc}</p>
                </div>

                <div className="mt-6 flex justify-end">
                    <LinkButton
                        Text={button}
                        URL={url}
                        CustomClass="!px-1 !py-4 font-medium text-white bg-black rounded-md"
                    ></LinkButton>
                </div>
            </div>
        );
    }

    return (
        <AuthenticatedLayout>
            <Head title="Settings" />

            <BreadCrumb
                header={'Settings'}
                parent={'Dashboard'}
                parent_link={route('dashboard')}
                child={'Settings'}
            />

            <Card
                Content={
                    <>
                        {/* Top bar */}
                        <div className="flex flex-wrap items-center justify-between">
                            {/* Tabs */}
                            <div className="flex gap-8 overflow-auto py-2 lg:py-0">
                                {visibleTabs.map((t) => {
                                    const isActive = activeTab === t;
                                    return (
                                        <button
                                            key={t}
                                            onClick={() => setActiveTab(t)}
                                            aria-current={isActive ? 'page' : undefined}
                                            className={`relative border-b-2 border-transparent pb-3 text-sm font-semibold transition-colors duration-200 ${
                                                isActive
                                                    ? 'border-black text-black dark:border-white dark:text-white'
                                                    : 'text-gray-600 hover:border-black hover:text-black dark:text-white/60 dark:hover:border-white dark:hover:text-white'
                                            } `}
                                        >
                                            {t}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Back Button */}
                            <LinkButton
                                Text={'Back To Dashboard'}
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
                                URL={route('dashboard')}
                                CustomClass="px-6 !py-4 font-medium text-white bg-black rounded-md"
                            ></LinkButton>
                        </div>

                        {/* Cards grid */}
                        <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-3">
                            {(visibleTabContent[activeTab] || []).map((c, idx) => (
                                <SubCard key={idx} {...c} />
                            ))}
                        </div>
                    </>
                }
            />

            {/* <Card
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
                                    'flex justify-center items-center flex-col max-w-lg mx-auto min-h-[400px]'
                                }
                                Content={
                                    <>
                                        <div className="flex items-center justify-center w-20 h-20 mb-3 bg-gray-100 rounded-full">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth={1.5}
                                                stroke="currentColor"
                                                className={`size-10 dark:border-white`}
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 0 1 1.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.559.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.894.149c-.424.07-.764.383-.929.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 0 1-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.398.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 0 1-.12-1.45l.527-.737c.25-.35.272-.806.108-1.204-.165-.397-.506-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 0 1 .12-1.45l.773-.773a1.125 1.125 0 0 1 1.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894Z"
                                                />
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                                                />
                                            </svg>
                                        </div>

                                        <h2 className="mb-2 text-xl font-semibold text-center text-gray-800 dark:text-white">
                                            General Settings
                                        </h2>

                                        <p className="mb-6 leading-relaxed text-center text-gray-600 dark:text-white">
                                            Manage your application settings including app name,
                                            contact information, and branding like logos—all from
                                            one place.
                                        </p>

                                        <LinkButton
                                            URL={route('dashboard.settings.general.setting')}
                                            Text={'Manage General Settings'}
                                            CustomClass="w-full md:w-[280px] "
                                            Icon={
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    strokeWidth={1.5}
                                                    stroke="currentColor"
                                                    className={`size-6`}
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 0 1 1.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.559.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.894.149c-.424.07-.764.383-.929.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 0 1-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.398.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 0 1-.12-1.45l.527-.737c.25-.35.272-.806.108-1.204-.165-.397-.506-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 0 1 .12-1.45l.773-.773a1.125 1.125 0 0 1 1.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894Z"
                                                    />
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                                                    />
                                                </svg>
                                            }
                                        />
                                    </>
                                }
                            />

                            <Card
                                CustomCss={
                                    'flex justify-center items-center flex-col max-w-lg mx-auto min-h-[400px]'
                                }
                                Content={
                                    <>
                                        <div className="flex items-center justify-center w-20 h-20 mb-3 bg-gray-100 rounded-full">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth={1.5}
                                                stroke="currentColor"
                                                className={`size-9 dark:border-white`}
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
                                                />
                                            </svg>
                                        </div>

                                        <h2 className="mb-2 text-xl font-semibold text-center text-gray-800 dark:text-white">
                                            Role Settings
                                        </h2>

                                        <p className="mb-6 leading-relaxed text-center text-gray-600 dark:text-white">
                                            Easily manage and configure and create roles across your
                                            application to control responsibilities.
                                        </p>

                                        <LinkButton
                                            URL={route('dashboard.settings.roles.index')}
                                            Text={'Manage Roles'}
                                            CustomClass="w-full md:w-[280px] mt-10 "
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
                                                        d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
                                                    />
                                                </svg>
                                            }
                                        />
                                    </>
                                }
                            />


                            <Card
                                CustomCss={
                                    'flex justify-center items-center flex-col max-w-lg mx-auto min-h-[400px]'
                                }
                                Content={
                                    <>
                                        <div className="flex items-center justify-center w-20 h-20 mb-3 bg-gray-100 rounded-full">

                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`size-9 dark:border-white`}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                            </svg>

                                        </div>

                                        <h2 className="mb-2 text-xl font-semibold text-center text-gray-800 dark:text-white">
                                            Dormancy Settings
                                        </h2>

                                        <p className="mb-6 leading-relaxed text-center text-gray-600 dark:text-white">
                                            Easily manage and configure and Dormancy Setting  across your
                                            application to control User Dormancy Threshold.
                                        </p>

                                        <LinkButton
                                            URL={route('dashboard.settings.dormancy-setting.index')}
                                            Text={'Manage Dormancy Setting'}
                                            CustomClass="w-full md:w-[280px] mt-10 "
                                            Icon={
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                                </svg>

                                            }
                                        />
                                    </>
                                }
                            />


                            <Card
                                CustomCss={
                                    'flex justify-center items-center flex-col max-w-lg mx-auto min-h-[400px]'
                                }
                                Content={
                                    <>
                                        <div className="flex items-center justify-center w-20 h-20 mb-3 bg-gray-100 rounded-full">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth={1.5}
                                                stroke="currentColor"
                                                className={`size-10 dark:border-white`}
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 0 1 1.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.559.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.894.149c-.424.07-.764.383-.929.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 0 1-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.398.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 0 1-.12-1.45l.527-.737c.25-.35.272-.806.108-1.204-.165-.397-.506-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 0 1 .12-1.45l.773-.773a1.125 1.125 0 0 1 1.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894Z"
                                                />
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                                                />
                                            </svg>
                                        </div>

                                        <h2 className="mb-2 text-xl font-semibold text-center text-gray-800 dark:text-white">
                                            Unsettled Account Notification Settings
                                        </h2>

                                        <p className="mb-6 leading-relaxed text-center text-gray-600 dark:text-white">
                                            Manage your application Unsettled Account Notification Settings,
                                            To Handle Notifications Of The Unsettled Accounts Accross the Site
                                        </p>

                                        <LinkButton
                                            URL={route('dashboard.settings.unsettled-accounts-notification-settings.index')}
                                            Text={'Manage Settings'}
                                            CustomClass="w-full md:w-[280px] "
                                            Icon={
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    strokeWidth={1.5}
                                                    stroke="currentColor"
                                                    className={`size-6`}
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 0 1 1.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.559.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.894.149c-.424.07-.764.383-.929.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 0 1-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.398.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 0 1-.12-1.45l.527-.737c.25-.35.272-.806.108-1.204-.165-.397-.506-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 0 1 .12-1.45l.773-.773a1.125 1.125 0 0 1 1.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894Z"
                                                    />
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                                                    />
                                                </svg>
                                            }
                                        />
                                    </>
                                }
                            />




                            <Card
                                CustomCss={
                                    'flex justify-center items-center flex-col max-w-lg mx-auto min-h-[400px]'
                                }
                                Content={
                                    <>
                                        <div className="flex items-center justify-center w-20 h-20 mb-3 bg-gray-100 rounded-full">
                                            <svg
                                                viewBox="0 0 16 16"
                                                className="size-9 fill-black"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                            >
                                                <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                                                <g
                                                    id="SVGRepo_tracerCarrier"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                ></g>
                                                <g id="SVGRepo_iconCarrier">
                                                    {' '}
                                                    <path d="M4.51 7.687c0 .197.02.357.058.475.042.117.096.245.17.384a.233.233 0 01.037.123c0 .053-.032.107-.1.16l-.336.224a.255.255 0 01-.138.048c-.054 0-.107-.026-.16-.074a1.652 1.652 0 01-.192-.251 4.137 4.137 0 01-.165-.315c-.415.491-.936.737-1.564.737-.447 0-.804-.129-1.064-.385-.261-.256-.394-.598-.394-1.025 0-.454.16-.822.484-1.1.325-.278.756-.416 1.304-.416.18 0 .367.016.564.042.197.027.4.07.612.118v-.39c0-.406-.085-.689-.25-.854-.17-.166-.458-.246-.868-.246-.186 0-.377.022-.574.07a4.23 4.23 0 00-.575.181 1.525 1.525 0 01-.186.07.326.326 0 01-.085.016c-.075 0-.112-.054-.112-.166v-.262c0-.085.01-.15.037-.186a.399.399 0 01.15-.113c.185-.096.409-.176.67-.24.26-.07.537-.101.83-.101.633 0 1.096.144 1.394.432.293.288.442.726.442 1.314v1.73h.01zm-2.161.811c.175 0 .356-.032.548-.096.191-.064.362-.182.505-.342a.848.848 0 00.181-.341c.032-.129.054-.283.054-.465V7.03a4.43 4.43 0 00-.49-.09 3.996 3.996 0 00-.5-.033c-.357 0-.618.07-.793.214-.176.144-.26.347-.26.614 0 .25.063.437.196.566.128.133.314.197.559.197zm4.273.577c-.096 0-.16-.016-.202-.054-.043-.032-.08-.106-.112-.208l-1.25-4.127a.938.938 0 01-.049-.214c0-.085.043-.133.128-.133h.522c.1 0 .17.016.207.053.043.032.075.107.107.208l.894 3.535.83-3.535c.026-.106.058-.176.1-.208a.365.365 0 01.214-.053h.425c.102 0 .17.016.213.053.043.032.08.107.101.208l.841 3.578.92-3.578a.458.458 0 01.107-.208.346.346 0 01.208-.053h.495c.085 0 .133.043.133.133 0 .027-.006.054-.01.086a.76.76 0 01-.038.133l-1.283 4.127c-.032.107-.069.177-.111.209a.34.34 0 01-.203.053h-.457c-.101 0-.17-.016-.213-.053-.043-.038-.08-.107-.101-.214L8.213 5.37l-.82 3.439c-.026.107-.058.176-.1.213-.043.038-.118.054-.213.054h-.458zm6.838.144a3.51 3.51 0 01-.82-.096c-.266-.064-.473-.134-.612-.214-.085-.048-.143-.101-.165-.15a.378.378 0 01-.031-.149v-.272c0-.112.042-.166.122-.166a.3.3 0 01.096.016c.032.011.08.032.133.054.18.08.378.144.585.187.213.042.42.064.633.064.336 0 .596-.059.777-.176a.575.575 0 00.277-.508.52.52 0 00-.144-.373c-.095-.102-.276-.193-.537-.278l-.772-.24c-.388-.123-.676-.305-.851-.545a1.275 1.275 0 01-.266-.774c0-.224.048-.422.143-.593.096-.17.224-.32.384-.438.16-.122.34-.213.553-.277.213-.064.436-.091.67-.091.118 0 .24.005.357.021.122.016.234.038.346.06.106.026.208.052.303.085.096.032.17.064.224.096a.46.46 0 01.16.133.289.289 0 01.047.176v.251c0 .112-.042.171-.122.171a.552.552 0 01-.202-.064 2.427 2.427 0 00-1.022-.208c-.303 0-.543.048-.708.15-.165.1-.25.256-.25.475 0 .149.053.277.16.379.106.101.303.202.585.293l.756.24c.383.123.66.294.825.513.165.219.244.47.244.748 0 .23-.047.437-.138.619a1.436 1.436 0 01-.388.47c-.165.133-.362.23-.591.299-.24.075-.49.112-.761.112z"></path>{' '}
                                                    <g
                                                        fill="#F90"
                                                        fillRule="evenodd"
                                                        clipRule="evenodd"
                                                    >
                                                        {' '}
                                                        <path d="M14.465 11.813c-1.75 1.297-4.294 1.986-6.481 1.986-3.065 0-5.827-1.137-7.913-3.027-.165-.15-.016-.353.18-.235 2.257 1.313 5.04 2.109 7.92 2.109 1.941 0 4.075-.406 6.039-1.239.293-.133.543.192.255.406z"></path>{' '}
                                                        <path d="M15.194 10.98c-.223-.287-1.479-.138-2.048-.069-.17.022-.197-.128-.043-.24 1-.705 2.645-.502 2.836-.267.192.24-.053 1.89-.99 2.68-.143.123-.281.06-.218-.1.213-.53.687-1.72.463-2.003z"></path>{' '}
                                                    </g>{' '}
                                                </g>
                                            </svg>
                                        </div>

                                        <h2 className="mb-2 text-xl font-semibold text-center text-gray-800 dark:text-white">
                                            AWS Settings
                                        </h2>

                                        <p className="mb-6 leading-relaxed text-center text-gray-600 dark:text-white">
                                            Easily manage and configure, create AWS Setting across
                                            your application to control Connectivity With AWS
                                            Globally In The System.
                                        </p>

                                        <LinkButton
                                            URL={route('dashboard.settings.aws-settings.index')}
                                            Text={'Manage AWS Settings'}
                                            CustomClass="w-full md:w-[300px] mt-10 "
                                            Icon={
                                                <svg
                                                    viewBox="0 0 16 16"
                                                    className="size-6 fill-white"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                >
                                                    <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                                                    <g
                                                        id="SVGRepo_tracerCarrier"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    ></g>
                                                    <g id="SVGRepo_iconCarrier">
                                                        {' '}
                                                        <path d="M4.51 7.687c0 .197.02.357.058.475.042.117.096.245.17.384a.233.233 0 01.037.123c0 .053-.032.107-.1.16l-.336.224a.255.255 0 01-.138.048c-.054 0-.107-.026-.16-.074a1.652 1.652 0 01-.192-.251 4.137 4.137 0 01-.165-.315c-.415.491-.936.737-1.564.737-.447 0-.804-.129-1.064-.385-.261-.256-.394-.598-.394-1.025 0-.454.16-.822.484-1.1.325-.278.756-.416 1.304-.416.18 0 .367.016.564.042.197.027.4.07.612.118v-.39c0-.406-.085-.689-.25-.854-.17-.166-.458-.246-.868-.246-.186 0-.377.022-.574.07a4.23 4.23 0 00-.575.181 1.525 1.525 0 01-.186.07.326.326 0 01-.085.016c-.075 0-.112-.054-.112-.166v-.262c0-.085.01-.15.037-.186a.399.399 0 01.15-.113c.185-.096.409-.176.67-.24.26-.07.537-.101.83-.101.633 0 1.096.144 1.394.432.293.288.442.726.442 1.314v1.73h.01zm-2.161.811c.175 0 .356-.032.548-.096.191-.064.362-.182.505-.342a.848.848 0 00.181-.341c.032-.129.054-.283.054-.465V7.03a4.43 4.43 0 00-.49-.09 3.996 3.996 0 00-.5-.033c-.357 0-.618.07-.793.214-.176.144-.26.347-.26.614 0 .25.063.437.196.566.128.133.314.197.559.197zm4.273.577c-.096 0-.16-.016-.202-.054-.043-.032-.08-.106-.112-.208l-1.25-4.127a.938.938 0 01-.049-.214c0-.085.043-.133.128-.133h.522c.1 0 .17.016.207.053.043.032.075.107.107.208l.894 3.535.83-3.535c.026-.106.058-.176.1-.208a.365.365 0 01.214-.053h.425c.102 0 .17.016.213.053.043.032.08.107.101.208l.841 3.578.92-3.578a.458.458 0 01.107-.208.346.346 0 01.208-.053h.495c.085 0 .133.043.133.133 0 .027-.006.054-.01.086a.76.76 0 01-.038.133l-1.283 4.127c-.032.107-.069.177-.111.209a.34.34 0 01-.203.053h-.457c-.101 0-.17-.016-.213-.053-.043-.038-.08-.107-.101-.214L8.213 5.37l-.82 3.439c-.026.107-.058.176-.1.213-.043.038-.118.054-.213.054h-.458zm6.838.144a3.51 3.51 0 01-.82-.096c-.266-.064-.473-.134-.612-.214-.085-.048-.143-.101-.165-.15a.378.378 0 01-.031-.149v-.272c0-.112.042-.166.122-.166a.3.3 0 01.096.016c.032.011.08.032.133.054.18.08.378.144.585.187.213.042.42.064.633.064.336 0 .596-.059.777-.176a.575.575 0 00.277-.508.52.52 0 00-.144-.373c-.095-.102-.276-.193-.537-.278l-.772-.24c-.388-.123-.676-.305-.851-.545a1.275 1.275 0 01-.266-.774c0-.224.048-.422.143-.593.096-.17.224-.32.384-.438.16-.122.34-.213.553-.277.213-.064.436-.091.67-.091.118 0 .24.005.357.021.122.016.234.038.346.06.106.026.208.052.303.085.096.032.17.064.224.096a.46.46 0 01.16.133.289.289 0 01.047.176v.251c0 .112-.042.171-.122.171a.552.552 0 01-.202-.064 2.427 2.427 0 00-1.022-.208c-.303 0-.543.048-.708.15-.165.1-.25.256-.25.475 0 .149.053.277.16.379.106.101.303.202.585.293l.756.24c.383.123.66.294.825.513.165.219.244.47.244.748 0 .23-.047.437-.138.619a1.436 1.436 0 01-.388.47c-.165.133-.362.23-.591.299-.24.075-.49.112-.761.112z"></path>{' '}
                                                        <g
                                                            fill="#F90"
                                                            fillRule="evenodd"
                                                            clipRule="evenodd"
                                                        >
                                                            {' '}
                                                            <path d="M14.465 11.813c-1.75 1.297-4.294 1.986-6.481 1.986-3.065 0-5.827-1.137-7.913-3.027-.165-.15-.016-.353.18-.235 2.257 1.313 5.04 2.109 7.92 2.109 1.941 0 4.075-.406 6.039-1.239.293-.133.543.192.255.406z"></path>{' '}
                                                            <path d="M15.194 10.98c-.223-.287-1.479-.138-2.048-.069-.17.022-.197-.128-.043-.24 1-.705 2.645-.502 2.836-.267.192.24-.053 1.89-.99 2.68-.143.123-.281.06-.218-.1.213-.53.687-1.72.463-2.003z"></path>{' '}
                                                        </g>{' '}
                                                    </g>
                                                </svg>
                                            }
                                        />
                                    </>
                                }
                            />

                            <Card
                                CustomCss={
                                    'flex justify-center items-center flex-col max-w-lg mx-auto min-h-[400px]'
                                }
                                Content={
                                    <>
                                        <div className="flex items-center justify-center w-20 h-20 mb-3 bg-gray-100 rounded-full">
                                            <svg
                                                fill="#1c71d8"
                                                className="size-9"
                                                viewBox="0 0 32 32"
                                                id="Camada_1"
                                                version="1.1"
                                                xmlSpace="preserve"
                                                xmlns="http://www.w3.org/2000/svg"
                                                xmlnsXlink="http://www.w3.org/1999/xlink"
                                            >
                                                <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                                                <g
                                                    id="SVGRepo_tracerCarrier"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                ></g>
                                                <g id="SVGRepo_iconCarrier">
                                                    <path d="M5,19.5c0-4.6,2.3-9.4,5-9.4c1.5,0,2.7,0.9,4.6,3.6c-1.8,2.8-2.9,4.5-2.9,4.5c-2.4,3.8-3.2,4.6-4.5,4.6 C5.9,22.9,5,21.7,5,19.5 M20.7,17.8L19,15c-0.4-0.7-0.9-1.4-1.3-2c1.5-2.3,2.7-3.5,4.2-3.5c3,0,5.4,4.5,5.4,10.1 c0,2.1-0.7,3.3-2.1,3.3S23.3,22,20.7,17.8 M16.4,11c-2.2-2.9-4.1-4-6.3-4C5.5,7,2,13.1,2,19.5c0,4,1.9,6.5,5.1,6.5 c2.3,0,3.9-1.1,6.9-6.3c0,0,1.2-2.2,2.1-3.7c0.3,0.5,0.6,1,0.9,1.6l1.4,2.4c2.7,4.6,4.2,6.1,6.9,6.1c3.1,0,4.8-2.6,4.8-6.7 C30,12.6,26.4,7,22.1,7C19.8,7,18,8.8,16.4,11"></path>
                                                </g>
                                            </svg>
                                        </div>

                                        <h2 className="mb-2 text-xl font-semibold text-center text-gray-800 dark:text-white">
                                            Meta Settings
                                        </h2>

                                        <p className="mb-6 leading-relaxed text-center text-gray-600 dark:text-white">
                                            Easily manage and configure, create Meta Setting across
                                            your application to control Connectivity With Meta
                                            Globally In The System.
                                        </p>

                                        <LinkButton
                                            URL={route('dashboard.settings.meta-settings.index')}
                                            Text={'Manage Meta Settings'}
                                            CustomClass="w-full md:w-[300px] mt-10 "
                                            Icon={
                                                <svg
                                                    className="size-6 fill-white dark:fill-[#1c71d8]"
                                                    viewBox="0 0 32 32"
                                                    id="Camada_1"
                                                    version="1.1"
                                                    xmlSpace="preserve"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    xmlnsXlink="http://www.w3.org/1999/xlink"
                                                >
                                                    <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                                                    <g
                                                        id="SVGRepo_tracerCarrier"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    ></g>
                                                    <g id="SVGRepo_iconCarrier">
                                                        <path d="M5,19.5c0-4.6,2.3-9.4,5-9.4c1.5,0,2.7,0.9,4.6,3.6c-1.8,2.8-2.9,4.5-2.9,4.5c-2.4,3.8-3.2,4.6-4.5,4.6 C5.9,22.9,5,21.7,5,19.5 M20.7,17.8L19,15c-0.4-0.7-0.9-1.4-1.3-2c1.5-2.3,2.7-3.5,4.2-3.5c3,0,5.4,4.5,5.4,10.1 c0,2.1-0.7,3.3-2.1,3.3S23.3,22,20.7,17.8 M16.4,11c-2.2-2.9-4.1-4-6.3-4C5.5,7,2,13.1,2,19.5c0,4,1.9,6.5,5.1,6.5 c2.3,0,3.9-1.1,6.9-6.3c0,0,1.2-2.2,2.1-3.7c0.3,0.5,0.6,1,0.9,1.6l1.4,2.4c2.7,4.6,4.2,6.1,6.9,6.1c3.1,0,4.8-2.6,4.8-6.7 C30,12.6,26.4,7,22.1,7C19.8,7,18,8.8,16.4,11"></path>
                                                    </g>
                                                </svg>
                                            }
                                        />
                                    </>
                                }
                            />


                            <Card
                                CustomCss={
                                    'flex justify-center items-center flex-col max-w-lg mx-auto min-h-[400px]'
                                }
                                Content={
                                    <>
                                        <div className="flex items-center justify-center w-20 h-20 mb-3 bg-gray-100 rounded-full">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth={1.5}
                                                stroke="currentColor"
                                                className={`size-9 dark:border-white`}
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                                                />
                                            </svg>
                                        </div>

                                        <h2 className="mb-2 text-xl font-semibold text-center text-gray-800 dark:text-white">
                                            SMTP Settings
                                        </h2>

                                        <p className="mb-6 leading-relaxed text-center text-gray-600 dark:text-white">
                                            Manage your application SMTP settings That Will Be Use
                                            For Sending Mails.
                                        </p>

                                        <LinkButton
                                            URL={route('dashboard.settings.smtp.setting')}
                                            Text={'Manage SMTP Settings'}
                                            CustomClass="w-full md:w-[280px] mt-10 "
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
                                                        d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                                                    />
                                                </svg>
                                            }
                                        />
                                    </>
                                }
                            />

                            <Card
                                CustomCss={
                                    'flex justify-center items-center flex-col max-w-lg mx-auto min-h-[400px]'
                                }
                                Content={
                                    <>
                                        <div className="flex items-center justify-center w-20 h-20 mb-3 bg-gray-100 rounded-full">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                x="0px"
                                                y="0px"
                                                className="size-9"
                                                viewBox="0 0 48 48"
                                            >
                                                <path
                                                    fill="#48b564"
                                                    d="M35.76,26.36h0.01c0,0-3.77,5.53-6.94,9.64c-2.74,3.55-3.54,6.59-3.77,8.06	C24.97,44.6,24.53,45,24,45s-0.97-0.4-1.06-0.94c-0.23-1.47-1.03-4.51-3.77-8.06c-0.42-0.55-0.85-1.12-1.28-1.7L28.24,22l8.33-9.88	C37.49,14.05,38,16.21,38,18.5C38,21.4,37.17,24.09,35.76,26.36z"
                                                ></path>
                                                <path
                                                    fill="#fcc60e"
                                                    d="M28.24,22L17.89,34.3c-2.82-3.78-5.66-7.94-5.66-7.94h0.01c-0.3-0.48-0.57-0.97-0.8-1.48L19.76,15	c-0.79,0.95-1.26,2.17-1.26,3.5c0,3.04,2.46,5.5,5.5,5.5C25.71,24,27.24,23.22,28.24,22z"
                                                ></path>
                                                <path
                                                    fill="#2c85eb"
                                                    d="M28.4,4.74l-8.57,10.18L13.27,9.2C15.83,6.02,19.69,4,24,4C25.54,4,27.02,4.26,28.4,4.74z"
                                                ></path>
                                                <path
                                                    fill="#ed5748"
                                                    d="M19.83,14.92L19.76,15l-8.32,9.88C10.52,22.95,10,20.79,10,18.5c0-3.54,1.23-6.79,3.27-9.3	L19.83,14.92z"
                                                ></path>
                                                <path
                                                    fill="#5695f6"
                                                    d="M28.24,22c0.79-0.95,1.26-2.17,1.26-3.5c0-3.04-2.46-5.5-5.5-5.5c-1.71,0-3.24,0.78-4.24,2L28.4,4.74	c3.59,1.22,6.53,3.91,8.17,7.38L28.24,22z"
                                                ></path>
                                            </svg>
                                        </div>

                                        <h2 className="mb-2 text-xl font-semibold text-center text-gray-800 dark:text-white">
                                            Google Map Settings
                                        </h2>

                                        <p className="mb-6 leading-relaxed text-center text-gray-600 dark:text-white">
                                            Easily manage and configure, create Google Map Setting
                                            across your application to control Connectivity With
                                            Google Maps Globally In The System.
                                        </p>

                                        <LinkButton
                                            URL={route(
                                                'dashboard.settings.google-map-settings.index',
                                            )}
                                            Text={'Manage Google Map Settings'}
                                            CustomClass="w-full md:w-[300px] mt-10 "
                                            Icon={
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    x="0px"
                                                    y="0px"
                                                    className="size-6"
                                                    viewBox="0 0 48 48"
                                                >
                                                    <path
                                                        fill="#48b564"
                                                        d="M35.76,26.36h0.01c0,0-3.77,5.53-6.94,9.64c-2.74,3.55-3.54,6.59-3.77,8.06	C24.97,44.6,24.53,45,24,45s-0.97-0.4-1.06-0.94c-0.23-1.47-1.03-4.51-3.77-8.06c-0.42-0.55-0.85-1.12-1.28-1.7L28.24,22l8.33-9.88	C37.49,14.05,38,16.21,38,18.5C38,21.4,37.17,24.09,35.76,26.36z"
                                                    ></path>
                                                    <path
                                                        fill="#fcc60e"
                                                        d="M28.24,22L17.89,34.3c-2.82-3.78-5.66-7.94-5.66-7.94h0.01c-0.3-0.48-0.57-0.97-0.8-1.48L19.76,15	c-0.79,0.95-1.26,2.17-1.26,3.5c0,3.04,2.46,5.5,5.5,5.5C25.71,24,27.24,23.22,28.24,22z"
                                                    ></path>
                                                    <path
                                                        fill="#2c85eb"
                                                        d="M28.4,4.74l-8.57,10.18L13.27,9.2C15.83,6.02,19.69,4,24,4C25.54,4,27.02,4.26,28.4,4.74z"
                                                    ></path>
                                                    <path
                                                        fill="#ed5748"
                                                        d="M19.83,14.92L19.76,15l-8.32,9.88C10.52,22.95,10,20.79,10,18.5c0-3.54,1.23-6.79,3.27-9.3	L19.83,14.92z"
                                                    ></path>
                                                    <path
                                                        fill="#5695f6"
                                                        d="M28.24,22c0.79-0.95,1.26-2.17,1.26-3.5c0-3.04-2.46-5.5-5.5-5.5c-1.71,0-3.24,0.78-4.24,2L28.4,4.74	c3.59,1.22,6.53,3.91,8.17,7.38L28.24,22z"
                                                    ></path>
                                                </svg>
                                            }
                                        />
                                    </>
                                }
                            />

                            <Card
                                CustomCss={
                                    'flex justify-center items-center flex-col max-w-lg mx-auto min-h-[400px]'
                                }
                                Content={
                                    <>
                                        <div className="flex items-center justify-center w-20 h-20 mb-3 bg-gray-100 rounded-full">
                                            <svg
                                                width="163"
                                                height="21"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    d="M12.386 13.815l-.506.161V1.05h1.84V16h-1.84L2.174 3.258l.506-.161V16H.84V1.05h1.84l9.706 12.765zm12.278 2.415c-1.365 0-2.607-.314-3.726-.943-1.104-.644-1.986-1.541-2.645-2.691-.66-1.15-.99-2.507-.99-4.071 0-1.564.33-2.921.99-4.071.659-1.165 1.54-2.062 2.645-2.691 1.119-.629 2.361-.943 3.726-.943 1.364 0 2.599.314 3.703.943 1.119.629 2.008 1.526 2.668 2.691.659 1.15.989 2.507.989 4.071 0 1.564-.33 2.921-.99 4.071a7.137 7.137 0 01-2.667 2.691c-1.104.629-2.339.943-3.703.943zm0-1.725c1.042 0 1.978-.222 2.806-.667.828-.46 1.487-1.135 1.978-2.024.49-.89.736-1.986.736-3.289 0-1.303-.246-2.392-.736-3.266-.491-.89-1.15-1.564-1.978-2.024-.828-.46-1.764-.69-2.806-.69-1.028 0-1.963.23-2.806.69-.828.46-1.488 1.135-1.978 2.024-.491.874-.736 1.963-.736 3.266s.245 2.4.736 3.289c.49.89 1.15 1.564 1.978 2.024.843.445 1.778.667 2.806.667zM38.924 16l-5.38-14.95h1.978l4.623 12.972h-.552L44.03 1.05h1.978l4.439 12.972h-.552L54.519 1.05h1.932L51.115 16h-1.932L44.767 2.568h.506L40.857 16h-1.932z"
                                                    fill="#64ACFF"
                                                />
                                                <path
                                                    d="M60.78 10.71V8.985h4.692c.92 0 1.663-.284 2.23-.851.584-.583.875-1.334.875-2.254 0-.95-.291-1.702-.874-2.254-.568-.567-1.311-.851-2.231-.851h-4.324V16h-1.84V1.05h6.164c.69 0 1.334.107 1.932.322.598.215 1.12.529 1.564.943.46.414.813.92 1.058 1.518.26.598.39 1.28.39 2.047 0 .767-.13 1.449-.39 2.047a4.11 4.11 0 01-1.058 1.518 4.496 4.496 0 01-1.564.943 5.676 5.676 0 01-1.932.322H60.78zm16.675 5.52a4.46 4.46 0 01-2.507-.759c-.751-.521-1.357-1.227-1.817-2.116-.445-.905-.667-1.932-.667-3.082s.23-2.177.69-3.082c.46-.905 1.08-1.618 1.863-2.139a4.77 4.77 0 012.668-.782c1.073 0 1.886.276 2.438.828.567.537.95 1.257 1.15 2.162.215.905.322 1.909.322 3.013 0 .583-.061 1.219-.184 1.909a7.501 7.501 0 01-.644 1.955 3.997 3.997 0 01-1.242 1.518c-.537.383-1.227.575-2.07.575zm.46-1.748c.782 0 1.426-.192 1.932-.575.521-.383.905-.89 1.15-1.518.245-.644.368-1.35.368-2.116 0-.843-.13-1.58-.391-2.208-.245-.644-.629-1.142-1.15-1.495-.506-.368-1.142-.552-1.91-.552-1.15 0-2.038.406-2.667 1.219-.629.797-.943 1.81-.943 3.036 0 .813.153 1.541.46 2.185a3.96 3.96 0 001.288 1.495 3.386 3.386 0 001.863.529zm3.45-9.982h1.84V16h-1.68l-.045-.414a35.32 35.32 0 00-.07-.966 11.69 11.69 0 01-.045-.92V4.5zm4.403 0h1.978l4.117 11.04-1.61.46-4.485-11.5zm10.695 0l-6.417 16.1h-2.001l2.783-6.21 3.68-9.89h1.955zm2.552 0h1.84V16h-1.84V4.5zm5.796-.23c.613 0 1.165.092 1.656.276.491.184.905.452 1.242.805.337.353.598.782.782 1.288.184.49.276 1.05.276 1.679V16h-1.84V8.778c0-.89-.207-1.556-.621-2.001-.414-.445-1.035-.667-1.863-.667-.629 0-1.211.161-1.748.483a3.964 3.964 0 00-1.334 1.334c-.337.552-.544 1.196-.621 1.932l-.023-1.334c.077-.644.23-1.227.46-1.748a4.95 4.95 0 01.897-1.334 3.817 3.817 0 011.242-.874c.475-.2.974-.299 1.495-.299zm7.728 0c.613 0 1.165.092 1.656.276.491.184.905.452 1.242.805.337.353.598.782.782 1.288.184.49.276 1.05.276 1.679V16h-1.84V8.778c0-.89-.207-1.556-.621-2.001-.414-.445-1.035-.667-1.863-.667-.629 0-1.211.161-1.748.483a3.964 3.964 0 00-1.334 1.334c-.337.552-.544 1.196-.621 1.932l-.023-1.334c.077-.644.23-1.227.46-1.748a4.95 4.95 0 01.897-1.334 3.817 3.817 0 011.242-.874c.475-.2.974-.299 1.495-.299zm15.68 8.027h1.725a4.735 4.735 0 01-.828 2.024 4.501 4.501 0 01-1.656 1.403c-.675.337-1.457.506-2.346.506-1.074 0-2.04-.253-2.898-.759a5.765 5.765 0 01-2.047-2.116c-.491-.905-.736-1.932-.736-3.082s.237-2.177.713-3.082a5.592 5.592 0 012.001-2.139c.843-.521 1.794-.782 2.852-.782 1.119 0 2.062.253 2.829.759.782.49 1.357 1.219 1.725 2.185.383.95.537 2.124.46 3.519h-8.74c.076.751.283 1.41.621 1.978a3.706 3.706 0 001.334 1.334c.552.307 1.18.46 1.886.46.782 0 1.441-.2 1.978-.598.552-.414.928-.95 1.127-1.61zm-3.151-6.302c-.951 0-1.748.276-2.392.828-.644.552-1.074 1.303-1.288 2.254h6.739c-.062-1.012-.391-1.779-.989-2.3a3.003 3.003 0 00-2.07-.782zm7.917-1.495h1.84V16h-1.84V4.5zm5.796-.23c.614 0 1.166.092 1.656.276.491.184.905.452 1.242.805.338.353.598.782.782 1.288.184.49.276 1.05.276 1.679V16h-1.84V8.778c0-.89-.207-1.556-.621-2.001-.414-.445-1.035-.667-1.863-.667-.628 0-1.211.161-1.748.483a3.973 3.973 0 00-1.334 1.334c-.337.552-.544 1.196-.621 1.932l-.023-1.334c.077-.644.23-1.227.46-1.748.246-.521.545-.966.897-1.334a3.817 3.817 0 011.242-.874c.476-.2.974-.299 1.495-.299zm6.735.23h6.762v1.725h-6.762V4.5zm2.461-2.99h1.84V16h-1.84V1.51zm6.523 10.787h1.702c.046.66.291 1.196.736 1.61.46.414 1.119.621 1.978.621.521 0 .927-.069 1.219-.207.306-.138.529-.322.667-.552.138-.245.207-.514.207-.805 0-.353-.092-.629-.276-.828a1.856 1.856 0 00-.713-.529 8.32 8.32 0 00-1.012-.391 222.72 222.72 0 01-1.38-.529c-.46-.2-.897-.43-1.311-.69a3.474 3.474 0 01-.966-.989c-.246-.399-.368-.874-.368-1.426 0-.46.092-.89.276-1.288a2.97 2.97 0 01.782-1.058 3.86 3.86 0 011.219-.713 4.643 4.643 0 011.564-.253c.766 0 1.41.153 1.932.46.536.307.943.744 1.219 1.311.291.552.444 1.196.46 1.932h-1.587c-.108-.69-.33-1.188-.667-1.495-.322-.322-.79-.483-1.403-.483-.629 0-1.112.138-1.449.414-.338.276-.506.644-.506 1.104 0 .337.122.621.368.851.245.215.559.414.943.598.398.169.82.345 1.265.529.444.184.874.368 1.288.552.414.184.782.399 1.104.644.322.245.575.552.759.92.199.353.299.797.299 1.334 0 .644-.154 1.219-.46 1.725-.292.49-.729.874-1.311 1.15-.568.276-1.265.414-2.093.414-.752 0-1.396-.092-1.932-.276a4.319 4.319 0 01-1.311-.759 4.13 4.13 0 01-.828-1.012 3.648 3.648 0 01-.368-1.035 2.77 2.77 0 01-.046-.851z"
                                                    fill="#FEFEFE"
                                                />
                                            </svg>
                                        </div>

                                        <h2 className="mb-2 text-xl font-semibold text-center text-gray-800 dark:text-white">
                                            NOWPayment Settings
                                        </h2>

                                        <p className="mb-6 leading-relaxed text-center text-gray-600 dark:text-white">
                                            Effortlessly manage and configure NOWPayments settings
                                            across your application to enable seamless
                                            cryptocurrency payment processing globally within the
                                            system.
                                        </p>

                                        <LinkButton
                                            URL={route(
                                                'dashboard.settings.now-payment-settings.index',
                                            )}
                                            Text={'Manage NOWPayment Setting'}
                                            CustomClass="w-full md:w-[300px] mt-10 "
                                            Icon={
                                                <svg
                                                    width="163"
                                                    height="21"
                                                    fill="none"
                                                    className="size-6"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <path
                                                        d="M12.386 13.815l-.506.161V1.05h1.84V16h-1.84L2.174 3.258l.506-.161V16H.84V1.05h1.84l9.706 12.765zm12.278 2.415c-1.365 0-2.607-.314-3.726-.943-1.104-.644-1.986-1.541-2.645-2.691-.66-1.15-.99-2.507-.99-4.071 0-1.564.33-2.921.99-4.071.659-1.165 1.54-2.062 2.645-2.691 1.119-.629 2.361-.943 3.726-.943 1.364 0 2.599.314 3.703.943 1.119.629 2.008 1.526 2.668 2.691.659 1.15.989 2.507.989 4.071 0 1.564-.33 2.921-.99 4.071a7.137 7.137 0 01-2.667 2.691c-1.104.629-2.339.943-3.703.943zm0-1.725c1.042 0 1.978-.222 2.806-.667.828-.46 1.487-1.135 1.978-2.024.49-.89.736-1.986.736-3.289 0-1.303-.246-2.392-.736-3.266-.491-.89-1.15-1.564-1.978-2.024-.828-.46-1.764-.69-2.806-.69-1.028 0-1.963.23-2.806.69-.828.46-1.488 1.135-1.978 2.024-.491.874-.736 1.963-.736 3.266s.245 2.4.736 3.289c.49.89 1.15 1.564 1.978 2.024.843.445 1.778.667 2.806.667zM38.924 16l-5.38-14.95h1.978l4.623 12.972h-.552L44.03 1.05h1.978l4.439 12.972h-.552L54.519 1.05h1.932L51.115 16h-1.932L44.767 2.568h.506L40.857 16h-1.932z"
                                                        fill="#64ACFF"
                                                    />
                                                    <path
                                                        d="M60.78 10.71V8.985h4.692c.92 0 1.663-.284 2.23-.851.584-.583.875-1.334.875-2.254 0-.95-.291-1.702-.874-2.254-.568-.567-1.311-.851-2.231-.851h-4.324V16h-1.84V1.05h6.164c.69 0 1.334.107 1.932.322.598.215 1.12.529 1.564.943.46.414.813.92 1.058 1.518.26.598.39 1.28.39 2.047 0 .767-.13 1.449-.39 2.047a4.11 4.11 0 01-1.058 1.518 4.496 4.496 0 01-1.564.943 5.676 5.676 0 01-1.932.322H60.78zm16.675 5.52a4.46 4.46 0 01-2.507-.759c-.751-.521-1.357-1.227-1.817-2.116-.445-.905-.667-1.932-.667-3.082s.23-2.177.69-3.082c.46-.905 1.08-1.618 1.863-2.139a4.77 4.77 0 012.668-.782c1.073 0 1.886.276 2.438.828.567.537.95 1.257 1.15 2.162.215.905.322 1.909.322 3.013 0 .583-.061 1.219-.184 1.909a7.501 7.501 0 01-.644 1.955 3.997 3.997 0 01-1.242 1.518c-.537.383-1.227.575-2.07.575zm.46-1.748c.782 0 1.426-.192 1.932-.575.521-.383.905-.89 1.15-1.518.245-.644.368-1.35.368-2.116 0-.843-.13-1.58-.391-2.208-.245-.644-.629-1.142-1.15-1.495-.506-.368-1.142-.552-1.91-.552-1.15 0-2.038.406-2.667 1.219-.629.797-.943 1.81-.943 3.036 0 .813.153 1.541.46 2.185a3.96 3.96 0 001.288 1.495 3.386 3.386 0 001.863.529zm3.45-9.982h1.84V16h-1.68l-.045-.414a35.32 35.32 0 00-.07-.966 11.69 11.69 0 01-.045-.92V4.5zm4.403 0h1.978l4.117 11.04-1.61.46-4.485-11.5zm10.695 0l-6.417 16.1h-2.001l2.783-6.21 3.68-9.89h1.955zm2.552 0h1.84V16h-1.84V4.5zm5.796-.23c.613 0 1.165.092 1.656.276.491.184.905.452 1.242.805.337.353.598.782.782 1.288.184.49.276 1.05.276 1.679V16h-1.84V8.778c0-.89-.207-1.556-.621-2.001-.414-.445-1.035-.667-1.863-.667-.629 0-1.211.161-1.748.483a3.964 3.964 0 00-1.334 1.334c-.337.552-.544 1.196-.621 1.932l-.023-1.334c.077-.644.23-1.227.46-1.748a4.95 4.95 0 01.897-1.334 3.817 3.817 0 011.242-.874c.475-.2.974-.299 1.495-.299zm7.728 0c.613 0 1.165.092 1.656.276.491.184.905.452 1.242.805.337.353.598.782.782 1.288.184.49.276 1.05.276 1.679V16h-1.84V8.778c0-.89-.207-1.556-.621-2.001-.414-.445-1.035-.667-1.863-.667-.629 0-1.211.161-1.748.483a3.964 3.964 0 00-1.334 1.334c-.337.552-.544 1.196-.621 1.932l-.023-1.334c.077-.644.23-1.227.46-1.748a4.95 4.95 0 01.897-1.334 3.817 3.817 0 011.242-.874c.475-.2.974-.299 1.495-.299zm15.68 8.027h1.725a4.735 4.735 0 01-.828 2.024 4.501 4.501 0 01-1.656 1.403c-.675.337-1.457.506-2.346.506-1.074 0-2.04-.253-2.898-.759a5.765 5.765 0 01-2.047-2.116c-.491-.905-.736-1.932-.736-3.082s.237-2.177.713-3.082a5.592 5.592 0 012.001-2.139c.843-.521 1.794-.782 2.852-.782 1.119 0 2.062.253 2.829.759.782.49 1.357 1.219 1.725 2.185.383.95.537 2.124.46 3.519h-8.74c.076.751.283 1.41.621 1.978a3.706 3.706 0 001.334 1.334c.552.307 1.18.46 1.886.46.782 0 1.441-.2 1.978-.598.552-.414.928-.95 1.127-1.61zm-3.151-6.302c-.951 0-1.748.276-2.392.828-.644.552-1.074 1.303-1.288 2.254h6.739c-.062-1.012-.391-1.779-.989-2.3a3.003 3.003 0 00-2.07-.782zm7.917-1.495h1.84V16h-1.84V4.5zm5.796-.23c.614 0 1.166.092 1.656.276.491.184.905.452 1.242.805.338.353.598.782.782 1.288.184.49.276 1.05.276 1.679V16h-1.84V8.778c0-.89-.207-1.556-.621-2.001-.414-.445-1.035-.667-1.863-.667-.628 0-1.211.161-1.748.483a3.973 3.973 0 00-1.334 1.334c-.337.552-.544 1.196-.621 1.932l-.023-1.334c.077-.644.23-1.227.46-1.748.246-.521.545-.966.897-1.334a3.817 3.817 0 011.242-.874c.476-.2.974-.299 1.495-.299zm6.735.23h6.762v1.725h-6.762V4.5zm2.461-2.99h1.84V16h-1.84V1.51zm6.523 10.787h1.702c.046.66.291 1.196.736 1.61.46.414 1.119.621 1.978.621.521 0 .927-.069 1.219-.207.306-.138.529-.322.667-.552.138-.245.207-.514.207-.805 0-.353-.092-.629-.276-.828a1.856 1.856 0 00-.713-.529 8.32 8.32 0 00-1.012-.391 222.72 222.72 0 01-1.38-.529c-.46-.2-.897-.43-1.311-.69a3.474 3.474 0 01-.966-.989c-.246-.399-.368-.874-.368-1.426 0-.46.092-.89.276-1.288a2.97 2.97 0 01.782-1.058 3.86 3.86 0 011.219-.713 4.643 4.643 0 011.564-.253c.766 0 1.41.153 1.932.46.536.307.943.744 1.219 1.311.291.552.444 1.196.46 1.932h-1.587c-.108-.69-.33-1.188-.667-1.495-.322-.322-.79-.483-1.403-.483-.629 0-1.112.138-1.449.414-.338.276-.506.644-.506 1.104 0 .337.122.621.368.851.245.215.559.414.943.598.398.169.82.345 1.265.529.444.184.874.368 1.288.552.414.184.782.399 1.104.644.322.245.575.552.759.92.199.353.299.797.299 1.334 0 .644-.154 1.219-.46 1.725-.292.49-.729.874-1.311 1.15-.568.276-1.265.414-2.093.414-.752 0-1.396-.092-1.932-.276a4.319 4.319 0 01-1.311-.759 4.13 4.13 0 01-.828-1.012 3.648 3.648 0 01-.368-1.035 2.77 2.77 0 01-.046-.851z"
                                                        fill="#FEFEFE"
                                                    />
                                                </svg>
                                            }
                                        />
                                    </>
                                }
                            />



                            <Card
                                CustomCss={
                                    'flex justify-center items-center flex-col max-w-lg mx-auto min-h-[400px]'
                                }
                                Content={
                                    <>
                                        <div className="flex items-center justify-center w-20 h-20 mb-3 bg-gray-100 rounded-full">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth={1.5}
                                                stroke="currentColor"
                                                className={`size-9 dark:border-white`}
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M4.098 19.902a3.75 3.75 0 0 0 5.304 0l6.401-6.402M6.75 21A3.75 3.75 0 0 1 3 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 0 0 3.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008Z"
                                                />
                                            </svg>
                                        </div>

                                        <h2 className="mb-2 text-xl font-semibold text-center text-gray-800 dark:text-white">
                                            Color Settings
                                        </h2>

                                        <p className="mb-6 leading-relaxed text-center text-gray-600 dark:text-white">
                                            Easily manage and configure and create Colors across
                                            your application to control SmartPhone Color Varients.
                                        </p>

                                        <LinkButton
                                            URL={route('dashboard.settings.colors.index')}
                                            Text={'Manage Colors'}
                                            CustomClass="w-full md:w-[280px] mt-10 "
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
                                                        d="M4.098 19.902a3.75 3.75 0 0 0 5.304 0l6.401-6.402M6.75 21A3.75 3.75 0 0 1 3 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 0 0 3.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008Z"
                                                    />
                                                </svg>
                                            }
                                        />
                                    </>
                                }
                            />

                            <Card
                                CustomCss={
                                    'flex justify-center items-center flex-col max-w-lg mx-auto min-h-[400px]'
                                }
                                Content={
                                    <>
                                        <div className="flex items-center justify-center w-20 h-20 mb-3 bg-gray-100 rounded-full">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth={1.5}
                                                stroke="currentColor"
                                                className={`size-9 dark:border-white`}
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"
                                                />
                                            </svg>
                                        </div>

                                        <h2 className="mb-2 text-xl font-semibold text-center text-gray-800 dark:text-white">
                                            Model Name Settings
                                        </h2>

                                        <p className="mb-6 leading-relaxed text-center text-gray-600 dark:text-white">
                                            Easily manage and configure and create Mode Names across
                                            your application to control SmartPhone Model Name.
                                        </p>

                                        <LinkButton
                                            URL={route('dashboard.settings.model_names.index')}
                                            Text={'Manage Model Names'}
                                            CustomClass="w-full md:w-[280px] mt-10 "
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
                                                        d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"
                                                    />
                                                </svg>
                                            }
                                        />
                                    </>
                                }
                            />

                            <Card
                                CustomCss={
                                    'flex justify-center items-center flex-col max-w-lg mx-auto min-h-[400px]'
                                }
                                Content={
                                    <>
                                        <div className="flex items-center justify-center w-20 h-20 mb-3 bg-gray-100 rounded-full">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth="1.5"
                                                stroke="currentColor"
                                                className={`size-9 dark:border-white`}
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M4.5 6.75h15m-15 10.5h15M5.25 3A2.25 2.25 0 003 5.25v2.25A2.25 2.25 0 005.25 9.75h13.5A2.25 2.25 0 0021 7.5V5.25A2.25 2.25 0 0018.75 3H5.25zm0 12A2.25 2.25 0 003 17.25v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 19.5v-2.25A2.25 2.25 0 0018.75 15H5.25z"
                                                />
                                            </svg>
                                        </div>

                                        <h2 className="mb-2 text-xl font-semibold text-center text-gray-800 dark:text-white">
                                            Capacity Settings
                                        </h2>

                                        <p className="mb-6 leading-relaxed text-center text-gray-600 dark:text-white">
                                            Easily manage and configure and create Capacity across
                                            your application to control SmartPhone Capacity.
                                        </p>

                                        <LinkButton
                                            URL={route('dashboard.settings.capacities.index')}
                                            Text={'Manage Capacity'}
                                            CustomClass="w-full md:w-[280px] mt-10 "
                                            Icon={
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    strokeWidth="1.5"
                                                    stroke="currentColor"
                                                    className="size-6"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M4.5 6.75h15m-15 10.5h15M5.25 3A2.25 2.25 0 003 5.25v2.25A2.25 2.25 0 005.25 9.75h13.5A2.25 2.25 0 0021 7.5V5.25A2.25 2.25 0 0018.75 3H5.25zm0 12A2.25 2.25 0 003 17.25v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 19.5v-2.25A2.25 2.25 0 0018.75 15H5.25z"
                                                    />
                                                </svg>
                                            }
                                        />
                                    </>
                                }
                            />

                            <Card
                                CustomCss={
                                    'flex justify-center items-center flex-col max-w-lg mx-auto min-h-[400px]'
                                }
                                Content={
                                    <>
                                        <div className="flex items-center justify-center w-20 h-20 mb-3 bg-gray-100 rounded-full">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth={1.5}
                                                stroke="currentColor"
                                                className={`size-9 dark:border-white`}
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                                                />
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                                                />
                                            </svg>
                                        </div>

                                        <h2 className="mb-2 text-xl font-semibold text-center text-gray-800 dark:text-white">
                                            Storage Location Settings
                                        </h2>

                                        <p className="mb-6 leading-relaxed text-center text-gray-600 dark:text-white">
                                            Easily manage and configure and create Storage Locations
                                            across your application to control Inventory Storage
                                            Locations.
                                        </p>

                                        <LinkButton
                                            URL={route(
                                                'dashboard.settings.storage_locations.index',
                                            )}
                                            Text={'Manage Storage Locations'}
                                            CustomClass="w-full md:w-[280px] mt-10 "
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
                                                        d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                                                    />
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                                                    />
                                                </svg>
                                            }
                                        />
                                    </>
                                }
                            />

                            <Card
                                CustomCss={
                                    'flex justify-center items-center flex-col max-w-lg mx-auto min-h-[400px]'
                                }
                                Content={
                                    <>
                                        <div className="flex items-center justify-center w-20 h-20 mb-3 bg-gray-100 rounded-full">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth={1.5}
                                                stroke="currentColor"
                                                className={`size-9 dark:border-white`}
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                                                />
                                            </svg>
                                        </div>

                                        <h2 className="mb-2 text-xl font-semibold text-center text-gray-800 dark:text-white">
                                            Currency Settings
                                        </h2>

                                        <p className="mb-6 leading-relaxed text-center text-gray-600 dark:text-white">
                                            Easily manage and configure and create Currencies across
                                            your application to control Currencies In The System.
                                        </p>

                                        <LinkButton
                                            URL={route('dashboard.settings.currencies.index')}
                                            Text={'Manage Currencies'}
                                            CustomClass="w-full md:w-[280px] mt-10 "
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
                                                        d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                                                    />
                                                </svg>
                                            }
                                        />
                                    </>
                                }
                            />

                            <Card
                                CustomCss={
                                    'flex justify-center items-center flex-col max-w-lg mx-auto min-h-[400px]'
                                }
                                Content={
                                    <>
                                        <div className="flex items-center justify-center w-20 h-20 mb-3 bg-gray-100 rounded-full">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth={1.5}
                                                stroke="currentColor"
                                                className={`size-9 dark:border-white`}
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z"
                                                />
                                            </svg>
                                        </div>

                                        <h2 className="mb-2 text-xl font-semibold text-center text-gray-800 dark:text-white">
                                            Additional Fee list Settings
                                        </h2>

                                        <p className="mb-6 leading-relaxed text-center text-gray-600 dark:text-white">
                                            Easily manage and configure and create Additional Fee
                                            lists across your application to control Additional Fee
                                            lists In The System.
                                        </p>

                                        <LinkButton
                                            URL={route(
                                                'dashboard.settings.additional_fee_lists.index',
                                            )}
                                            Text={'Manage Additional Fee lists'}
                                            CustomClass="w-full md:w-[280px] mt-10 "
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
                                                        d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z"
                                                    />
                                                </svg>
                                            }
                                        />
                                    </>
                                }
                            />

                            <Card
                                CustomCss={
                                    'flex justify-center items-center flex-col max-w-lg mx-auto min-h-[400px]'
                                }
                                Content={
                                    <>
                                        <div className="flex items-center justify-center w-20 h-20 mb-3 bg-gray-100 rounded-full">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth={1.5}
                                                stroke="currentColor"
                                                className={`size-9 dark:border-white`}
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M21 11.25v8.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1 0 9.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1 1 14.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z"
                                                />
                                            </svg>
                                        </div>

                                        <h2 className="mb-2 text-xl font-semibold text-center text-gray-800 dark:text-white">
                                            Reward Point Setting
                                        </h2>

                                        <p className="mb-6 leading-relaxed text-center text-gray-600 dark:text-white">
                                            Easily manage and configure and create Reward Point
                                            Setting across your application to control Reward Points
                                            In The System.
                                        </p>

                                        <LinkButton
                                            URL={route(
                                                'dashboard.settings.reward-point-setting.index',
                                            )}
                                            Text={'Manage Reward Point Setting'}
                                            CustomClass="w-full md:w-[300px] mt-10 "
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
                                                        d="M21 11.25v8.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1 0 9.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1 1 14.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z"
                                                    />
                                                </svg>
                                            }
                                        />
                                    </>
                                }
                            />

                            <Card
                                CustomCss={
                                    'flex justify-center items-center flex-col max-w-lg mx-auto min-h-[400px]'
                                }
                                Content={
                                    <>
                                        <div className="flex items-center justify-center w-20 h-20 mb-3 bg-gray-100 rounded-full">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth={1.5}
                                                stroke="currentColor"
                                                className={`size-9 dark:border-white`}
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941"
                                                />
                                            </svg>
                                        </div>

                                        <h2 className="mb-2 text-xl font-semibold text-center text-gray-800 dark:text-white">
                                            Commission Setting
                                        </h2>

                                        <p className="mb-6 leading-relaxed text-center text-gray-600 dark:text-white">
                                            Easily manage and configure and create Commission
                                            Setting across your application to control Commissions
                                            In The System.
                                        </p>

                                        <LinkButton
                                            URL={route(
                                                'dashboard.settings.commission-settings.index',
                                            )}
                                            Text={'Manage Commission Setting'}
                                            CustomClass="w-full md:w-[300px] mt-10 "
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
                                                        d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941"
                                                    />
                                                </svg>
                                            }
                                        />
                                    </>
                                }
                            />

                            <Card
                                CustomCss={
                                    'flex justify-center items-center flex-col max-w-lg mx-auto min-h-[400px]'
                                }
                                Content={
                                    <>
                                        <div className="flex items-center justify-center w-20 h-20 mb-3 bg-gray-100 rounded-full">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth={1.5}
                                                stroke="currentColor"
                                                className={`size-9 dark:border-white`}
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M3 3v1.5M3 21v-6m0 0 2.77-.693a9 9 0 0 1 6.208.682l.108.054a9 9 0 0 0 6.086.71l3.114-.732a48.524 48.524 0 0 1-.005-10.499l-3.11.732a9 9 0 0 1-6.085-.711l-.108-.054a9 9 0 0 0-6.208-.682L3 4.5M3 15V4.5"
                                                />
                                            </svg>
                                        </div>

                                        <h2 className="mb-2 text-xl font-semibold text-center text-gray-800 dark:text-white">
                                            Countries
                                        </h2>

                                        <p className="mb-6 leading-relaxed text-center text-gray-600 dark:text-white">
                                            Easily manage and configure and create Countries across
                                            your application to control Countries In The System.
                                        </p>

                                        <LinkButton
                                            URL={route('dashboard.settings.countries.index')}
                                            Text={'Manage Countries'}
                                            CustomClass="w-full md:w-[300px] mt-10 "
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
                                                        d="M3 3v1.5M3 21v-6m0 0 2.77-.693a9 9 0 0 1 6.208.682l.108.054a9 9 0 0 0 6.086.71l3.114-.732a48.524 48.524 0 0 1-.005-10.499l-3.11.732a9 9 0 0 1-6.085-.711l-.108-.054a9 9 0 0 0-6.208-.682L3 4.5M3 15V4.5"
                                                    />
                                                </svg>
                                            }
                                        />
                                    </>
                                }
                            />

                            <Card
                                CustomCss={
                                    'flex justify-center items-center flex-col max-w-lg mx-auto min-h-[400px]'
                                }
                                Content={
                                    <>
                                        <div className="flex items-center justify-center w-20 h-20 mb-3 bg-gray-100 rounded-full">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth={1.5}
                                                stroke="currentColor"
                                                className={`size-9 dark:border-white`}
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418"
                                                />
                                            </svg>
                                        </div>

                                        <h2 className="mb-2 text-xl font-semibold text-center text-gray-800 dark:text-white">
                                            Special Countries
                                        </h2>

                                        <p className="mb-6 leading-relaxed text-center text-gray-600 dark:text-white">
                                            Easily manage and configure, create Special Countries
                                            across your application to control Meta OAUTH For Push
                                            Notifications Outside Of The System.
                                        </p>

                                        <LinkButton
                                            URL={route(
                                                'dashboard.settings.special-countries.index',
                                            )}
                                            Text={'Manage Special Countries'}
                                            CustomClass="w-full md:w-[300px] mt-10 "
                                            Icon={
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    strokeWidth={1.5}
                                                    stroke="currentColor"
                                                    className={`size-6`}
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418"
                                                    />
                                                </svg>
                                            }
                                        />
                                    </>
                                }
                            />




                            <Card
                                CustomCss={
                                    'flex justify-center items-center flex-col max-w-lg mx-auto min-h-[400px]'
                                }
                                Content={
                                    <>
                                        <div className="flex items-center justify-center w-20 h-20 mb-3 bg-gray-100 rounded-full">

                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`size-9 dark:border-white`}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9.75h4.875a2.625 2.625 0 0 1 0 5.25H12M8.25 9.75 10.5 7.5M8.25 9.75 10.5 12m9-7.243V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0c1.1.128 1.907 1.077 1.907 2.185Z" />
                                            </svg>
                                        </div>

                                        <h2 className="mb-2 text-xl font-semibold text-center text-gray-800 dark:text-white">
                                            Return Policies
                                        </h2>

                                        <p className="mb-6 leading-relaxed text-center text-gray-600 dark:text-white">
                                            Easily manage and configure, create Return Policies
                                            across your application to control Smartphone Return Policy
                                        </p>

                                        <LinkButton
                                            URL={route(
                                                'dashboard.settings.return-policy-settings.index',
                                            )}
                                            Text={'Manage Return Policies'}
                                            CustomClass="w-full md:w-[300px] mt-10 "
                                            Icon={


                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`size-6`}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9.75h4.875a2.625 2.625 0 0 1 0 5.25H12M8.25 9.75 10.5 7.5M8.25 9.75 10.5 12m9-7.243V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0c1.1.128 1.907 1.077 1.907 2.185Z" />
                                                </svg>

                                            }
                                        />
                                    </>
                                }
                            />



                            <Card
                                CustomCss={
                                    'flex justify-center items-center flex-col max-w-lg mx-auto min-h-[400px]'
                                }
                                Content={
                                    <>
                                        <div className="flex items-center justify-center w-20 h-20 mb-3 bg-gray-100 rounded-full">

                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`size-9 dark:border-white`}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9.75h4.875a2.625 2.625 0 0 1 0 5.25H12M8.25 9.75 10.5 7.5M8.25 9.75 10.5 12m9-7.243V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0c1.1.128 1.907 1.077 1.907 2.185Z" />
                                            </svg>
                                        </div>

                                        <h2 className="mb-2 text-xl font-semibold text-center text-gray-800 dark:text-white">
                                            Shipping Policies
                                        </h2>

                                        <p className="mb-6 leading-relaxed text-center text-gray-600 dark:text-white">
                                            Easily manage and configure, create Shipping Policies
                                            across your application to control Smartphone Shipping Policy
                                        </p>

                                        <LinkButton
                                            URL={route(
                                                'dashboard.settings.shipping-policy-settings.index',
                                            )}
                                            Text={'Manage Shipping Policies'}
                                            CustomClass="w-full md:w-[300px] mt-10 "
                                            Icon={


                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`size-6`}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9.75h4.875a2.625 2.625 0 0 1 0 5.25H12M8.25 9.75 10.5 7.5M8.25 9.75 10.5 12m9-7.243V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0c1.1.128 1.907 1.077 1.907 2.185Z" />
                                                </svg>

                                            }
                                        />
                                    </>
                                }
                            />



                            <Card
                                CustomCss={
                                    'flex justify-center items-center flex-col max-w-lg mx-auto min-h-[400px]'
                                }
                                Content={
                                    <>
                                        <div className="flex items-center justify-center w-20 h-20 mb-3 bg-gray-100 rounded-full">

                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`size-9 dark:border-white`}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9.75h4.875a2.625 2.625 0 0 1 0 5.25H12M8.25 9.75 10.5 7.5M8.25 9.75 10.5 12m9-7.243V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0c1.1.128 1.907 1.077 1.907 2.185Z" />
                                            </svg>
                                        </div>

                                        <h2 className="mb-2 text-xl font-semibold text-center text-gray-800 dark:text-white">
                                            Terms Of Service
                                        </h2>

                                        <p className="mb-6 leading-relaxed text-center text-gray-600 dark:text-white">
                                            Easily manage and configure, create  Terms Of Services
                                            across your application to control Smartphone  Terms Of Service
                                        </p>

                                        <LinkButton
                                            URL={route(
                                                'dashboard.settings.terms-of-service-settings.index',
                                            )}
                                            Text={'Manage Terms Of Service'}
                                            CustomClass="w-full md:w-[300px] mt-10 "
                                            Icon={


                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`size-6`}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9.75h4.875a2.625 2.625 0 0 1 0 5.25H12M8.25 9.75 10.5 7.5M8.25 9.75 10.5 12m9-7.243V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0c1.1.128 1.907 1.077 1.907 2.185Z" />
                                                </svg>

                                            }
                                        />
                                    </>
                                }
                            />



                            <Card
                                CustomCss={
                                    'flex justify-center items-center flex-col max-w-lg mx-auto min-h-[400px]'
                                }
                                Content={
                                    <>
                                        <div className="flex items-center justify-center w-20 h-20 mb-3 bg-gray-100 rounded-full">

                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`size-9 dark:border-white`}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9.75h4.875a2.625 2.625 0 0 1 0 5.25H12M8.25 9.75 10.5 7.5M8.25 9.75 10.5 12m9-7.243V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0c1.1.128 1.907 1.077 1.907 2.185Z" />
                                            </svg>
                                        </div>

                                        <h2 className="mb-2 text-xl font-semibold text-center text-gray-800 dark:text-white">
                                            Privacy Policy
                                        </h2>

                                        <p className="mb-6 leading-relaxed text-center text-gray-600 dark:text-white">
                                            Easily manage and configure, create  Privacy Policies
                                            across your application to control Smartphone  Privacy Policy
                                        </p>

                                        <LinkButton
                                            URL={route(
                                                'dashboard.settings.privacy-policy-settings.index',
                                            )}
                                            Text={'Manage Privacy Policy'}
                                            CustomClass="w-full md:w-[300px] mt-10 "
                                            Icon={


                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`size-6`}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9.75h4.875a2.625 2.625 0 0 1 0 5.25H12M8.25 9.75 10.5 7.5M8.25 9.75 10.5 12m9-7.243V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0c1.1.128 1.907 1.077 1.907 2.185Z" />
                                                </svg>

                                            }
                                        />
                                    </>
                                }
                            />





                            <Card
                                CustomCss={
                                    'flex justify-center items-center flex-col max-w-lg mx-auto min-h-[400px]'
                                }
                                Content={
                                    <>
                                        <div className="flex items-center justify-center w-20 h-20 mb-3 bg-gray-100 rounded-full">



                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`size-9 dark:border-white`}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                                            </svg>

                                        </div>

                                        <h2 className="mb-2 text-xl font-semibold text-center text-gray-800 dark:text-white">
                                            Courier Companies
                                        </h2>

                                        <p className="mb-6 leading-relaxed text-center text-gray-600 dark:text-white">
                                            Easily manage and configure, create Courier Companies
                                            across your application to control Smartphone Courier Company
                                        </p>

                                        <LinkButton
                                            URL={route(
                                                'dashboard.settings.courier-company-settings.index',
                                            )}
                                            Text={'Manage Courier Companies'}
                                            CustomClass="w-full md:w-[300px] mt-10 "
                                            Icon={


                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                                                </svg>


                                            }
                                        />
                                    </>
                                }
                            />



                            <Card
                                CustomCss={
                                    'flex justify-center items-center flex-col max-w-lg mx-auto min-h-[400px]'
                                }
                                Content={
                                    <>
                                        <div className="flex items-center justify-center w-20 h-20 mb-3 bg-gray-100 rounded-full">





                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`size-9 dark:border-white`}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
                                            </svg>


                                        </div>

                                        <h2 className="mb-2 text-xl font-semibold text-center text-gray-800 dark:text-white">
                                            Conditions
                                        </h2>

                                        <p className="mb-6 leading-relaxed text-center text-gray-600 dark:text-white">
                                            Easily manage and configure, create Conditions
                                            across your application to control Smartphone Condition
                                        </p>

                                        <LinkButton
                                            URL={route(
                                                'dashboard.settings.condition-settings.index',
                                            )}
                                            Text={'Manage Conditions'}
                                            CustomClass="w-full md:w-[300px] mt-10 "
                                            Icon={


                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
                                                </svg>



                                            }
                                        />
                                    </>
                                }
                            />




                            <Card
                                CustomCss={
                                    'flex justify-center items-center flex-col max-w-lg mx-auto min-h-[400px]'
                                }
                                Content={
                                    <>
                                        <div className="flex items-center justify-center w-20 h-20 mb-3 bg-gray-100 rounded-full">


                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`size-9 dark:border-white`}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 0 1-.657.643 48.39 48.39 0 0 1-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 0 1-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 0 0-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 0 1-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 0 0 .657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 0 1-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.4.604-.4.959v0c0 .333.277.599.61.58a48.1 48.1 0 0 0 5.427-.63 48.05 48.05 0 0 0 .582-4.717.532.532 0 0 0-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.401.96.401v0a.656.656 0 0 0 .658-.663 48.422 48.422 0 0 0-.37-5.36c-1.886.342-3.81.574-5.766.689a.578.578 0 0 1-.61-.58v0Z" />
                                            </svg>



                                        </div>

                                        <h2 className="mb-2 text-xl font-semibold text-center text-gray-800 dark:text-white">
                                            Addons
                                        </h2>

                                        <p className="mb-6 leading-relaxed text-center text-gray-600 dark:text-white">
                                            Easily manage and configure, create Addons
                                            across your application
                                        </p>

                                        <LinkButton
                                            URL={route(
                                                'dashboard.settings.addon-settings.index',
                                            )}
                                            Text={'Manage Addons'}
                                            CustomClass="w-full md:w-[300px] mt-10 "
                                            Icon={


                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 0 1-.657.643 48.39 48.39 0 0 1-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 0 1-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 0 0-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 0 1-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 0 0 .657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 0 1-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.4.604-.4.959v0c0 .333.277.599.61.58a48.1 48.1 0 0 0 5.427-.63 48.05 48.05 0 0 0 .582-4.717.532.532 0 0 0-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.401.96.401v0a.656.656 0 0 0 .658-.663 48.422 48.422 0 0 0-.37-5.36c-1.886.342-3.81.574-5.766.689a.578.578 0 0 1-.61-.58v0Z" />
                                                </svg>




                                            }
                                        />
                                    </>
                                }
                            />
                        </div>
                    </>
                }
            /> */}
        </AuthenticatedLayout>
    );
}
