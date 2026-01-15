import { useTranslation } from '@/Hooks/useTranslation';
import useWindowSize from '@/Hooks/useWindowSize';
import MainLayout from '@/Layouts/Website/MainLayout';
import { Head, Link } from '@inertiajs/react';
import React, { useEffect, useRef, useState } from 'react';

const index = () => {
    const [activeSection, setActiveSection] = useState('collect');
    const isProgrammaticScroll = useRef(false);
    const windowSize = useWindowSize();
    const scrollTimeout = useRef(null);

    // Translation Hook
    const { __ } = useTranslation();

    useEffect(() => {
        const handleScroll = () => {
            if (isProgrammaticScroll.current) return;

            if (scrollTimeout.current) {
                clearTimeout(scrollTimeout.current);
            }

            scrollTimeout.current = setTimeout(() => {
                const sections = document.querySelectorAll('[data-section]');
                let current = activeSection;

                sections.forEach((section) => {
                    const rect = section.getBoundingClientRect();
                    if (rect.top <= 150 && rect.bottom > 150) {
                        current = section.dataset.section;
                    }
                });

                const scrollBottom =
                    window.innerHeight + window.scrollY >=
                    document.documentElement.scrollHeight - 5;

                if (scrollBottom) {
                    const lastSection = sections[sections.length - 1];
                    current = lastSection.dataset.section;
                }

                setActiveSection(current);
            }, 120);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => {
            window.removeEventListener('scroll', handleScroll);
            if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
        };
    }, []);


    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (!element) return;

        isProgrammaticScroll.current = true;

        const yOffset = -120;
        const y =
            element.getBoundingClientRect().top +
            window.pageYOffset +
            yOffset;

        window.scrollTo({ top: y, behavior: 'smooth' });

        // Immediately highlight clicked item
        setActiveSection(id);

        // unlock after animation time
        setTimeout(() => {
            isProgrammaticScroll.current = false;
        }, 600); // smooth scroll duration approx
    };


    const sections = [
        {
            id: 'collect',
            title: __('Information We Collect'),

        },
        {
            id: 'use',
            title: __('How We Use Information'),

        },
        {
            id: 'legal',
            title: __('Legal Basis'),

        },
        {
            id: 'retention',
            title: __('Data Retention'),

        },
        {
            id: 'sharing',
            title: __('Data Sharing'),

        },
        {
            id: 'rights',
            title: __('User Rights'),

        },
        {
            id: 'cookies',
            title: __('Cookies & Tracking'),

        },

        {
            id: 'data_transfer',
            title: __('Data Transfer'),

        },

        {
            id: 'data_security',
            title: __('Data Security'),

        },

        {
            id: 'data_protection_officer',
            title: __('Data Protection Officer'),

        },
        {
            id: 'deletion',
            title: __('Data Deletion'),

        },
    ];

    return (
        <MainLayout>
            <Head title={__('Privacy Policy', true)} />
            <div className="sm:px-6 lg:px-8">
                <div className={`px-6  mx-auto ${windowSize.width > 1024 ? 'pb-10' : 'pb-24'} lg:max-w-6xl sm:max-w-3xl`}>
                    {/* Hero Section */}
                    <div className="relative overflow-hidden text-main-text-dark dark:text-main-text-light ">
                        <div className="absolute inset-0" />

                        <div className="relative mx-auto my-10 lg:max-w-6xl sm:max-w-3xl ">


                            <h1 className="text-2xl font-semibold text-main-text-light dark:text-main-text-dark">
                                {__('Privacy Policy')}
                            </h1>

                            <p className="max-w-3xl mt-1 text-sm text-sub-text-light dark:sub-text-dark">
                                {__('Your privacy matters to us. Learn how 30 Centuries Inc., the operator of Andromeda Blue, protects and manages your personal information.')}
                            </p>

                            <div className="flex flex-wrap gap-4 mt-5">
                                <div className="flex items-center gap-2 rounded-full bg-surface-1-light dark:bg-surface-1-dark px-3 py-1.5">

                                    <div className="w-2 h-2 bg-green-500 rounded-full" />

                                    <span className="text-sm font-medium text-sub-text-light dark:text-sub-text-dark">
                                        {__('Last Updated')}: October 22, 2025
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 rounded-full  bg-surface-1-light dark:bg-surface-1-dark px-3 py-1.5">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-sub-text-light dark:text-sub-text-dark">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
                                    </svg>


                                    <span className="text-sm font-medium text-sub-text-light dark:text-sub-text-dark">
                                        {__('Global Policy')}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2 rounded-full  bg-surface-1-light dark:bg-surface-1-dark px-3 py-1.5">

                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-sub-text-light dark:text-sub-text-dark">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                                    </svg>



                                    <span className="text-sm font-medium text-sub-text-light dark:text-sub-text-dark">
                                        {__('Legal Documents')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="mx-auto lg:max-w-6xl sm:max-w-3xl lg:flex lg:gap-8">
                        {/* Sticky Table of Contents */}
                        <aside className="hidden shrink-0 lg:block lg:w-80">
                            <div className="sticky top-24">
                                <div className="p-6 rounded-md bg-surface-1-light dark:bg-surface-1-dark dark:backdrop-blur-xl">
                                    <h3 className="px-2 mb-4 font-semibold text-main-text-light text-md dark:text-main-text-dark">
                                        {__('Contents')}
                                    </h3>
                                    <nav className="space-y-1">
                                        {sections.map((section, idx) => (
                                            <button
                                                key={section.id}
                                                onClick={() => scrollToSection(section.id)}
                                                className={`group flex w-full items-center gap-3 rounded-md px-4 py-3 text-left text-sm font-medium transition-all ${activeSection === section.id
                                                    ? 'menu-sub-item-active'
                                                    : 'menu-sub-item-inactive'
                                                    }`}
                                            >

                                                <span className="flex-1">{section.title}</span>
                                                <svg
                                                    className={`h-4 w-4 transition-transform ${activeSection === section.id ? 'translate-x-1' : ''}`}
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    strokeWidth={3}
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="m8.25 4.5 7.5 7.5-7.5 7.5"
                                                    />
                                                </svg>
                                            </button>
                                        ))}
                                    </nav>
                                </div>
                            </div>
                        </aside>

                        {/* Content */}
                        <main className="flex-1 space-y-6 ">
                            {/* Company Info */}
                            <section className="p-8 rounded-md bg-surface-1-light dark:bg-surface-1-dark dark:backdrop-blur-xl">
                                <p className="leading-relaxed text-sub-text-light dark:text-sub-text-dark">
                                    {__("This Privacy Policy explains how 30 Centuries Inc. collects, uses, and protects your personal information when you use andromeda.blue and its features, including Facebook Login and delivery notifications via Messenger, Instagram Direct Messages, and Threads Direct Messages.")}
                                </p>
                            </section>

                            <section
                                className="w-auto p-8 rounded-md bg-surface-1-light dark:bg-surface-1-dark dark:backdrop-blur-xl"
                            >
                                {/* Information We Collect */}
                                <div
                                    id="collect"
                                    data-section="collect"
                                    className='mb-8'
                                >
                                    <div

                                        className="flex items-center gap-4 mb-3">

                                        <h2
                                            className="text-lg font-semibold text-main-text-light dark:text-main-text-dark">
                                            1. {__('Information We Collect')}
                                        </h2>
                                    </div>

                                    <div className="space-y-4">
                                        <ul className="pl-5 space-y-2 text-sm text-sub-text-light list-[lower-alpha] dark:text-sub-text-dark">
                                            <li>
                                                {__('Information from Facebook Login: Name, email, profile picture, Messenger/Instagram ID (if authorized).')}
                                            </li>

                                            <li>
                                                {__('Order & Delivery Info: Shipping address, contact details, order history, payment status.')}
                                            </li>

                                            <li>
                                                {__('Technical Data: IP address, browser type, cookies, device information, and activity logs.')}
                                            </li>
                                        </ul>

                                    </div>
                                </div>

                                {/* How We Use the Information      */}
                                <div
                                    id="use"
                                    data-section="use"
                                    className='mb-8'
                                >
                                    <div
                                        className="flex items-center gap-4 mb-3">

                                        <h2
                                            className="text-lg font-semibold text-main-text-light dark:text-main-text-dark">
                                            2. {__('How We Use the Information')}
                                        </h2>
                                    </div>

                                    <div className="space-y-4">
                                        <ul className="pl-4 space-y-2 text-sm text-sub-text-light list-[lower-alpha] dark:text-sub-text-dark">
                                            <li>
                                                {__('To enable Facebook Login authentication and secure user identiﬁcation')}
                                            </li>

                                            <li>
                                                {__('To process orders, payments, and deliveries')}
                                            </li>

                                            <li>
                                                {__('To send delivery updates via Facebook Messenger, Instagram Direct, and Threads DMs')}
                                            </li>

                                            <li>
                                                {__(' To provide customer support and improve services')}
                                            </li>
                                        </ul>

                                    </div>
                                </div>

                                {/* Legal Basis for Processing */}
                                <div
                                    id="legal"
                                    data-section="legal"
                                    className='mb-8'
                                >
                                    <div
                                        className="flex items-center gap-4 mb-3">

                                        <h2
                                            className="text-lg font-semibold text-main-text-light dark:text-main-text-dark">
                                            3. {__('Legal Basis for Processing')}
                                        </h2>
                                    </div>

                                    <div className="space-y-4">
                                        <p className="leading-relaxed text-sub-text-light dark:text-sub-text-dark">
                                            {__("Data is processed based on user consent, contract fulfillment, and legal compliance (e.g., fraud prevention, tax reporting).")}
                                        </p>

                                    </div>
                                </div>


                                {/* Data Retention */}
                                <div
                                    id="retention"
                                    data-section="retention"
                                    className='mb-8'
                                >
                                    <div
                                        className="flex items-center gap-4 mb-3">

                                        <h2
                                            className="text-lg font-semibold text-main-text-light dark:text-main-text-dark">
                                            4. {__('Data Retention')}
                                        </h2>
                                    </div>

                                    <div className="space-y-4">
                                        <p className="leading-relaxed text-sub-text-light dark:text-sub-text-dark">
                                            {__('Data is retained only as long as necessary for the stated purposes. Facebook Login data is deleted upon account deletion or permission revocation.')}
                                        </p>

                                    </div>
                                </div>

                                {/* Data Sharing & Third Parties */}
                                <div
                                    id="sharing"
                                    data-section="sharing"
                                    className='mb-8'
                                >
                                    <div
                                        className="flex items-center gap-4 mb-3">

                                        <h2
                                            className="text-lg font-semibold text-main-text-light dark:text-main-text-dark">
                                            5. {__('Data Sharing & Third Parties')}
                                        </h2>
                                    </div>

                                    <div>
                                        <p className="leading-relaxed text-sub-text-light dark:text-sub-text-dark">
                                            . {__('We do not sell or rent personal data')}
                                        </p>
                                        <p className="leading-relaxed text-sub-text-light dark:text-sub-text-dark">
                                            . {__('Shared only with service providers (payments, shipping, IT)')}
                                        </p>

                                        <p className="leading-relaxed text-sub-text-light dark:text-sub-text-dark">
                                            . {__('Shared with Meta Platforms, Inc. for Facebook Login and messaging API usage')}
                                        </p>

                                        <p className="leading-relaxed text-sub-text-light dark:text-sub-text-dark">
                                            . {__('May be disclosed to authorities when required by law')}
                                        </p>

                                    </div>
                                </div>


                                {/* User Rights & Data Deletion */}
                                <div
                                    id="rights"
                                    data-section="rights"
                                    className='mb-8'
                                >
                                    <div
                                        className="flex items-center gap-4 mb-3">

                                        <h2
                                            className="text-lg font-semibold text-main-text-light dark:text-main-text-dark">
                                            6. {__('User Rights & Data Deletion')}
                                        </h2>
                                    </div>

                                    <div className="space-y-4">
                                        <p className="leading-relaxed text-sub-text-light dark:text-sub-text-dark">
                                            {__('Users can request account and data deletion anytime via our Data Deletion Policy or by revoking Facebook Login permissions through their Facebook settings.')}
                                        </p>

                                    </div>
                                </div>


                                {/*Cookies & Tracking */}
                                <div
                                    id="cookies"
                                    data-section="cookies"
                                    className='mb-8'
                                >
                                    <div
                                        className="flex items-center gap-4 mb-3">

                                        <h2
                                            className="text-lg font-semibold text-main-text-light dark:text-main-text-dark">
                                            7. {__('Cookies & Tracking')}
                                        </h2>
                                    </div>

                                    <div className="space-y-4">
                                        <p className="leading-relaxed text-sub-text-light dark:text-sub-text-dark">
                                            {__('andromeda.blue uses cookies for personalization. Disabling cookies may limit certain features.')}
                                        </p>

                                    </div>
                                </div>



                                {/* International Data Transfers */}
                                <div
                                    id="data_transfer"
                                    data-section="data_transfer"
                                    className='mb-8'
                                >
                                    <div
                                        className="flex items-center gap-4 mb-3">

                                        <h2
                                            className="text-lg font-semibold text-main-text-light dark:text-main-text-dark">
                                            8. {__('International Data Transfers')}
                                        </h2>
                                    </div>

                                    <div className="space-y-4">
                                        <p className="leading-relaxed text-sub-text-light dark:text-sub-text-dark">
                                            {__('Data may be stored outside your country. We ensure legal safeguards for all international transfers.')}
                                        </p>

                                    </div>
                                </div>


                                {/* Data Security */}
                                <div
                                    id="data_security"
                                    data-section="data_security"
                                    className='mb-8'
                                >
                                    <div
                                        className="flex items-center gap-4 mb-3">

                                        <h2
                                            className="text-lg font-semibold text-main-text-light dark:text-main-text-dark">
                                            9. {__('Data Security')}
                                        </h2>
                                    </div>

                                    <div className="space-y-4">
                                        <p className="leading-relaxed text-sub-text-light dark:text-sub-text-dark">
                                            {__('All data is protected with SSL/TLS encryption and strict access control for authorized personnel only.')}
                                        </p>

                                    </div>
                                </div>


                                {/* 10. Data Protection Officer */}
                                <div
                                    id="data_protection_officer"
                                    data-section="data_protection_officer"
                                    className='mb-8'
                                >
                                    <div
                                        className="flex items-center gap-4 mb-3">

                                        <h2
                                            className="text-lg font-semibold text-main-text-light dark:text-main-text-dark">
                                            10. {__('Data Protection Officer (DPO)')}
                                        </h2>
                                    </div>

                                    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                                        <div className="px-4 py-3 break-words rounded-md bg-backgroundLight dark:bg-surface-2-dark">
                                            <p className="text-xs font-medium text-main-text-light dark:text-main-text-dark">{__('Email Address')}</p>
                                            <p className="mt-1 text-sm font-normal text-sub-text-light dark:text-sub-text-dark">contact@andromeda.blue</p>
                                        </div>

                                        <div className="px-4 py-3 break-words rounded-md bg-backgroundLight dark:bg-surface-2-dark">
                                            <p className="text-xs font-medium text-main-text-light dark:text-main-text-dark">{__('Phone Number')}</p>
                                            <p className="mt-1 text-sm font-normal text-sub-text-light dark:text-sub-text-dark">+1 (516) 518 3469 447</p>
                                        </div>

                                    </div>

                                    <div className="grid grid-cols-1 gap-3 mt-3">
                                        <div className="px-4 py-3 break-words rounded-md bg-backgroundLight dark:bg-surface-2-dark">
                                            <p className="text-xs font-medium text-main-text-light dark:text-main-text-dark">{__('Address')}</p>
                                            <p className="mt-1 text-sm font-normal text-sub-text-light dark:text-sub-text-dark">BROADWAY 2ND FL 2144 NEW YORK NY 10013</p>
                                        </div>
                                    </div>
                                </div>
                            </section>





                            {/* Data Deletion Policy */}
                            <section
                                id="deletion"
                                data-section="deletion"
                                className="p-8 rounded-md scroll-mt-24 bg-surface-1-light dark:bg-surface-1-dark dark:backdrop-blur-xl"
                            >
                                <div className="flex items-center gap-4 mb-6">
                                    <h2
                                        className="text-xl font-semibold text-main-text-light dark:text-main-text-dark">
                                        {__('Data Deletion Policy')}
                                    </h2>
                                </div>



                                <div className="flex items-center gap-4 mb-2">
                                    <h2
                                        className="text-lg font-semibold text-main-text-light dark:text-main-text-dark">
                                        {__('How to Request Data Deletion')}
                                    </h2>
                                </div>

                                <div>
                                    <p className="leading-relaxed text-sub-text-light dark:text-sub-text-dark">
                                        . {__('Visit')} : andromeda.blue/data-deletion
                                    </p>


                                    <p className="leading-relaxed text-sub-text-light dark:text-sub-text-dark">
                                        . {__('Or contact us at privacy@andromeda.blue with subject line "Data Deletion Request"')}
                                    </p>

                                </div>




                                <div className="flex items-center gap-4 mt-6 mb-3 ">
                                    <h2
                                        className="text-lg font-semibold text-main-text-light dark:text-main-text-dark">
                                        {__('Data Deletion Process')}
                                    </h2>
                                </div>

                                <div>
                                    <p className="leading-relaxed text-sub-text-light dark:text-sub-text-dark">
                                        {__('Upon receiving a veriﬁed request, all Facebook Login data, order details, and delivery information will be permanently deleted, unless retention is required by law.')}
                                    </p>
                                </div>



                                <div className="flex items-center gap-4 mt-6 mb-3">
                                    <h2
                                        className="text-lg font-semibold text-main-text-light dark:text-main-text-dark">
                                        {__('Revoking Facebook Login Permissions')}
                                    </h2>
                                </div>

                                <div className='pb-5'>
                                    <p className="leading-relaxed text-sub-text-light dark:text-sub-text-dark">
                                        {__('Users may revoke permissions from their Facebook account under Settings → Business Integrations to disconnect andromeda.blue.')}
                                    </p>
                                </div>




                                {/* Company & Legal Information (Meta Verification) */}
                                <div className="flex items-center gap-4 mt-4 mb-3">
                                    <h2 className="text-lg font-semibold text-main-text-light dark:text-main-text-dark">
                                        {__('Company & Legal Information')}
                                    </h2>
                                </div>

                                <div className="pb-8">
                                    <p className="leading-relaxed text-sub-text-light dark:text-sub-text-dark">
                                        {__('This website')} (<Link className='font-semibold hover:underline text-main-text-light dark:text-main-text-dark' href={route('home')}>{route('home')}</Link>) {__('is operated by')} <strong>30 Centuries Inc.</strong>
                                    </p>

                                    <div className="mt-2 space-y-2 text-sub-text-light dark:text-sub-text-dark">

                                        <div className='flex flex-col gap-0 lg:gap-2 lg:flex-row'>
                                            <strong className="block text-main-text-light dark:text-main-text-dark">
                                                {__('Legal Entity Name')}
                                            </strong>
                                            <span>30 Centuries Inc.</span>
                                        </div>

                                        <div className='flex flex-col gap-0 lg:gap-2 lg:flex-row'>
                                            <strong className="block text-main-text-light dark:text-main-text-dark">
                                                {__('Operating Brand')}
                                            </strong>
                                            <span>Andromeda Blue</span>
                                        </div>

                                        <div className='flex flex-col gap-0 lg:gap-2 lg:flex-row'>
                                            <strong className="block text-main-text-light dark:text-main-text-dark">
                                                {__('Contact Email')}
                                            </strong>
                                            <span>contact@andromeda.blue</span>
                                        </div>

                                    </div>

                                </div>


                            </section>

                            {/* Footer CTA */}
                            <section className="p-8 rounded-md bg-surface-1-light backdrop-blur-xl dark:bg-surface-1-dark">
                                <div className="text-center">
                                    <h3 className="mb-4 text-xl font-semibold text-main-text-light dark:text-main-text-dark">
                                        {__('Have Questions About Your Privacy')}?
                                    </h3>
                                    <p className="max-w-xl mx-auto mb-6 font-medium text-sub-text-light dark:text-sub-text-dark">
                                        {__("We're here to help. Contact our Data Protection Ofﬁcer for any privacy-related inquiries.")}
                                    </p>
                                    <Link
                                        href={route('website.contact.index')}
                                        className="inline-flex items-center justify-center w-full px-6 py-3 font-semibold transition-all rounded-md lg:px-20 sm:w-auto text-main-text-dark bg-main-text-light dark:bg-main-text-dark dark:text-main-text-light hover:bg-main-text-light/80 dark:hover:bg-main-text-dark/80"
                                    >
                                        {__('Contact Us')}
                                    </Link>
                                </div>
                            </section>
                        </main>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default index;
