
import { useTranslation } from '@/Hooks/useTranslation';
import useWindowSize from '@/Hooks/useWindowSize';
import MainLayout from '@/Layouts/Website/MainLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { ChevronLeft } from 'lucide-react';
import React, { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import goBackOrHome from '@/Helpers/backNavigationHelper';

const index = ({ privacy_policy }) => {
    const [activeSection, setActiveSection] = useState(null);
    const isProgrammaticScroll = useRef(false);
    const windowSize = useWindowSize();
    const { generalSetting } = usePage().props;

    const tocRef = useRef(null);

    // Translation Hook
    const { __ } = useTranslation();

    const makeId = (title) => {
        const slug = title
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, '_')
            .replace(/^_+|_+$/g, '');

        return `${slug}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    };

    const dynamicSections = useMemo(() => {
        return privacy_policy?.content?.map(section => ({
            id: makeId(section.title),
            title: section.title,
            content: section.content,
        })) || [];
    }, [privacy_policy]);


    const sections = [
        ...dynamicSections.map(s => ({ id: s.id, title: s.title })),
        { id: 'data_protection_officer', title: __('Data Protection Officer') },
        { id: 'deletion', title: __('Data Deletion') },
    ];


    const scrollToSection = (id) => {
        isProgrammaticScroll.current = true;
        setActiveSection(id);
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setTimeout(() => (isProgrammaticScroll.current = false), 600);
    };

    useEffect(() => {
        const el = tocRef.current;
        if (!el) return;

        let frame = null;

        const setMaxHeight = () => {
            const stickyOffset = 96; // top-24 = 6rem = 96px
            const top = el.getBoundingClientRect().top;
            const effectiveTop = Math.max(top, stickyOffset);
            el.style.height = `${window.innerHeight - effectiveTop - 16}px`;
        };

        const onScrollOrResize = () => {
            if (frame) return;
            frame = requestAnimationFrame(() => {
                frame = null;
                setMaxHeight();
            });
        };

        setMaxHeight();
        window.addEventListener('scroll', onScrollOrResize, { passive: true });
        window.addEventListener('resize', onScrollOrResize);

        return () => {
            window.removeEventListener('scroll', onScrollOrResize);
            window.removeEventListener('resize', onScrollOrResize);
            if (frame) cancelAnimationFrame(frame);
        };
    }, []);

    return (
        <MainLayout>
            <Head title={__('Privacy Policy', true)} />
            <div className="sm:px-6 lg:px-8">
                <div className={`px-6 lg:mt-6 mx-auto ${windowSize.width > 1024 ? 'pb-10' : 'pb-24'} lg:max-w-6xl sm:max-w-3xl`}>

                    {/* Hero Section */}
                    <div className="relative overflow-hidden text-main-text-dark dark:text-main-text-light ">
                        <div className="absolute inset-0" />


                        <div className="relative mx-auto my-2 lg:max-w-6xl sm:max-w-3xl ">

                            <button
                                onClick={goBackOrHome}
                                className="inline-flex items-center gap-2 mb-4 text-sm font-medium transition-colors lg:hidden text-main-text-light lg:hover:text-main-text-light/80 dark:text-main-text-dark dark:lg:hover:text-main-text-dark/80"
                            >
                                <ChevronLeft />
                            </button>

                            <h1 className="text-[24px] font-semibold text-main-text-light dark:text-main-text-dark">
                                {__('Privacy Policy')}
                            </h1>

                            <p className="max-w-3xl mt-1 text-sm text-sub-text-light dark:sub-text-dark">
                                {__('This Policy explains how we collect, use, store, and protect your personal information when you use our services.')}
                            </p>

                            <div className="flex flex-wrap gap-4 mt-5">
                                <div className="flex items-center gap-2 rounded-full bg-surface-1-light dark:bg-surface-1-dark px-3 py-1.5">

                                    <div className="w-2 h-2 bg-green-500 rounded-full" />

                                    <span className="text-sm font-medium text-sub-text-light dark:text-sub-text-dark">
                                        {__('Last Updated')}: {privacy_policy?.human_updated_at}
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
                    <div className="mx-auto my-5 lg:max-w-6xl sm:max-w-3xl lg:flex lg:gap-8">
                        {/* Sticky Table of Contents */}
                        <aside className="hidden shrink-0 lg:block lg:w-80">
                            <div className="sticky top-24">
                                <div ref={tocRef} className="h-[calc(100vh-7rem)] overflow-y-auto overscroll-contain rounded-md bg-surface-1-light p-6 scrollbar-thin scrollbar-none dark:bg-surface-1-dark dark:backdrop-blur-xl">
                                    <h3 className="px-2 mb-4 font-semibold text-main-text-light text-md dark:text-main-text-dark">
                                        {__('Contents')}
                                    </h3>
                                    <nav className="space-y-1">
                                        {sections.map((section) => (
                                            <button
                                                key={section.id}
                                                onClick={() => scrollToSection(section.id)}
                                                className={`group flex w-full items-center gap-3 rounded-md px-4 py-3 text-left text-sm font-medium transition-all ${activeSection === section.id
                                                    ? 'menu-sub-item-active'
                                                    : 'menu-sub-item-inactive'
                                                    }`}
                                            >

                                                <span className="flex-1 break-all">{section.title}</span>
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
                                    {__("This Privacy Policy explains how")}  {privacy_policy?.company_name} {" "} ({__('“Company,” “we,” “us,” or “our”')}). {__("collects, uses, stores, shares, and protects personal information in connection with the operation of our international e-commerce platform for mobile device sales (the “Service”).")}
                                </p>


                                <p className="mt-2 leading-relaxed text-sub-text-light dark:text-sub-text-dark">
                                    {__("This Privacy Policy is an integral part of, and must be read together with, our Terms of Service, Shipping Policy, and Return & Refund Policy.")}
                                </p>


                            </section>

                            <section
                                className="w-auto p-8 rounded-md bg-surface-1-light dark:bg-surface-1-dark dark:backdrop-blur-xl"
                            >

                                {dynamicSections?.map((section, index) => {

                                    return (
                                        <Fragment key={index}>
                                            <div
                                                key={section?.id}
                                                id={section?.id}
                                                data-section={section?.id}
                                                className="mb-8 break-words break-all scroll-mt-32"
                                            >
                                                <h2 className="mb-3 text-lg font-semibold text-main-text-light dark:text-main-text-dark">
                                                    {index + 1}. {section.title}
                                                </h2>

                                                {/* Content as List */}
                                                {Array.isArray(section.content) && (
                                                    <ul className="pl-5 space-y-2 text-sm list-[lower-alpha] text-sub-text-light dark:text-sub-text-dark">
                                                        {section.content.map((item, idx) => (
                                                            <li key={idx}>{item}</li>
                                                        ))}
                                                    </ul>
                                                )}

                                                {/* Content as Paragraph */}
                                                {typeof section.content === 'string' && (
                                                    <p className="leading-relaxed text-sub-text-light dark:text-sub-text-dark"
                                                        dangerouslySetInnerHTML={{ __html: section.content }}
                                                    >

                                                    </p>
                                                )}



                                            </div>

                                            {index == dynamicSections.length - 1 && (
                                                <Fragment key={sections.length - 1}>
                                                    {/* 10. Data Protection Officer */}
                                                    <div
                                                        id="data_protection_officer"
                                                        data-section="data_protection_officer"
                                                        className='scroll-mt-10'
                                                    >
                                                        <div
                                                            className="flex items-center gap-4 mb-3">

                                                            <h2
                                                                className="text-lg font-semibold text-main-text-light dark:text-main-text-dark">
                                                                {index + 2}. {__('Data Protection Officer (DPO)')}
                                                            </h2>
                                                        </div>

                                                        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                                                            <div className="px-4 py-3 break-words rounded-md bg-backgroundLight dark:bg-surface-2-dark">
                                                                <p className="text-xs font-medium text-main-text-light dark:text-main-text-dark">{__('Name')}</p>
                                                                <p className="mt-1 text-sm font-normal text-sub-text-light dark:text-sub-text-dark">{privacy_policy?.dpo_name}</p>
                                                            </div>

                                                            <div className="px-4 py-3 break-words rounded-md bg-backgroundLight dark:bg-surface-2-dark">
                                                                <p className="text-xs font-medium text-main-text-light dark:text-main-text-dark">{__('Email Address')}</p>
                                                                <p className="mt-1 text-sm font-normal text-sub-text-light dark:text-sub-text-dark">{privacy_policy?.dpo_email}</p>
                                                            </div>


                                                            <div className="px-4 py-3 break-words rounded-md bg-backgroundLight dark:bg-surface-2-dark">
                                                                <p className="text-xs font-medium text-main-text-light dark:text-main-text-dark">{__('Phone Number')}</p>
                                                                <p className="mt-1 text-sm font-normal text-sub-text-light dark:text-sub-text-dark">{privacy_policy?.dpo_phone}</p>
                                                            </div>


                                                        </div>

                                                        <div className="grid grid-cols-1 gap-3 mt-3">
                                                            <div className="px-4 py-3 break-words rounded-md bg-backgroundLight dark:bg-surface-2-dark">
                                                                <p className="text-xs font-medium text-main-text-light dark:text-main-text-dark">{__('Address')}</p>
                                                                <p className="mt-1 text-sm font-normal text-sub-text-light dark:text-sub-text-dark">{privacy_policy?.dpo_address}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Fragment>
                                            )}
                                        </Fragment>
                                    );
                                })}



                            </section>

                            {/* Data Deletion Policy */}
                            <section
                                id="deletion"
                                data-section="deletion"
                                className="p-8 rounded-md scroll-mt-32 bg-surface-1-light dark:bg-surface-1-dark dark:backdrop-blur-xl"
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
                                        {__('This website')} (<Link className='font-semibold hover:underline text-main-text-light dark:text-main-text-dark' href={route('home')}>{route('home')}</Link>) {__('is operated by')} <strong>{privacy_policy?.company_name}</strong>
                                    </p>

                                    <div className="mt-2 space-y-2 text-sub-text-light dark:text-sub-text-dark">

                                        <div className='flex flex-col gap-0 lg:gap-2 lg:flex-row'>
                                            <strong className="block text-main-text-light dark:text-main-text-dark">
                                                {__('Legal Entity Name')}:
                                            </strong>
                                            <span>{privacy_policy?.company_name}</span>
                                        </div>

                                        <div className='flex flex-col gap-0 lg:gap-2 lg:flex-row'>
                                            <strong className="block text-main-text-light dark:text-main-text-dark">
                                                {__('Operating Brand')}:
                                            </strong>
                                            <span>{generalSetting?.app_name}</span>
                                        </div>

                                        <div className='flex flex-col gap-0 lg:gap-2 lg:flex-row'>
                                            <strong className="block text-main-text-light dark:text-main-text-dark">
                                                {__('Contact Email')}:
                                            </strong>
                                            <span>{generalSetting?.contact_email}</span>
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
