import { useTranslation } from '@/Hooks/useTranslation';
import useWindowSize from '@/Hooks/useWindowSize';
import MainLayout from '@/Layouts/Website/MainLayout';
import { Head, Link, router } from '@inertiajs/react';
import { ChevronLeft } from 'lucide-react';
import React, { Fragment, useEffect, useMemo, useRef, useState } from 'react';

const index = ({ return_policy, smartphone_slug }) => {
    const [activeSection, setActiveSection] = useState(null);
    const isProgrammaticScroll = useRef(false);
    const windowSize = useWindowSize();

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

    const tocRef = useRef(null);

    const dynamicSections = useMemo(() => {
        return return_policy?.content?.map(section => ({
            id: makeId(section.title),
            title: section.title,
            content: section.content,
        })) || [];
    }, [return_policy]);


    const sections = [
        ...dynamicSections.map(s => ({ id: s.id, title: s.title })),
        { id: 'data_protection_officer', title: __('Data Protection Officer') },
    ];

    useEffect(() => {
        const handleScroll = () => {
            if (isProgrammaticScroll.current) return;

            const sections = document.querySelectorAll('[data-section]');
            let current = null;

            for (let i = 0; i < sections.length; i++) {
                const section = sections[i];
                const rect = section.getBoundingClientRect();

                if (rect.top <= 160 && rect.bottom > 160) {
                    current = section.dataset.section;
                    break;
                }
            }

            if (!current && sections.length > 0) {
                current = sections[0].dataset.section;
            }

            setActiveSection(prev => (prev === current ? prev : current));
        };

        // IMPORTANT: capture phase use karo
        document.addEventListener('scroll', handleScroll, true);

        return () => {
            document.removeEventListener('scroll', handleScroll, true);
        };
    }, []);



    // Smartphone URL Generation
    const generateSmartphoneURL = (isDirect = false, isSinglePage = false) => {
        return (
            `?m-slug=${smartphone_slug}${isSinglePage ? '&single_page=true' : ''}${isDirect ? '&direct=true' : ''}`
        );
    }


    const scrollToSection = (id) => {
        isProgrammaticScroll.current = true;
        setActiveSection(id);
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setTimeout(() => (isProgrammaticScroll.current = false), 600);
    };

    useEffect(() => {
        const el = tocRef.current;
        if (!el) return;

        const onWheel = (e) => {
            const isScrollingDown = e.deltaY > 0;
            const isScrollingUp = e.deltaY < 0;

            const atTop = window.scrollY === 0;
            const atBottom =
                window.innerHeight + window.scrollY >= document.body.scrollHeight;


            if (
                (isScrollingUp && atTop) ||
                (isScrollingDown && atBottom)
            ) {
                return;
            }

            e.preventDefault();

            window.scrollBy({
                top: e.deltaY,
                behavior: "auto",
            });
        };

        el.addEventListener("wheel", onWheel, { passive: false });

        return () => {
            el.removeEventListener("wheel", onWheel);
        };
    }, []);





    return (
        <MainLayout>
            <Head title={__('Return Policy', true)} />
            <div className="sm:px-6 lg:px-8">
                <div className={`px-6 lg:mt-6  mx-auto ${windowSize.width > 1024 ? 'pb-10' : 'pb-24'} lg:max-w-6xl sm:max-w-3xl`}>



                    {/* Hero Section */}
                    <div className="relative overflow-hidden text-main-text-dark dark:text-main-text-light ">
                        <div className="absolute inset-0" />

                        <div className="relative mx-auto my-2 lg:max-w-6xl sm:max-w-3xl">
                            <button
                                onClick={() => {
                                    router.get(route('home') + generateSmartphoneURL(true, true));

                                }}
                                className="inline-flex items-center gap-2 mb-4 text-sm font-medium transition-colors lg:hidden text-main-text-light lg:hover:text-main-text-light/80 dark:text-main-text-dark dark:lg:hover:text-main-text-dark/80"

                            >
                                <ChevronLeft />

                            </button>

                            <h1 className="text-[24px] font-semibold text-main-text-light dark:text-main-text-dark">
                                {__('Return Policy')}
                            </h1>

                            <p className="max-w-3xl mt-1 text-sm text-sub-text-light dark:sub-text-dark">
                                {__('This Policy defines the conditions, limitations, and procedures for returns, refunds, and cancellations.')}
                            </p>

                            <div className="flex flex-wrap gap-4 mt-5">
                                <div className="flex items-center gap-2 rounded-full bg-surface-1-light dark:bg-surface-1-dark px-3 py-1.5">

                                    <div className="w-2 h-2 bg-green-500 rounded-full" />

                                    <span className="text-sm font-medium text-sub-text-light dark:text-sub-text-dark">
                                        {__('Last Updated')}: {return_policy?.human_updated_at}
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
                                <div ref={tocRef} className="p-6 rounded-md bg-surface-1-light dark:bg-surface-1-dark dark:backdrop-blur-xl">
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
                            {/* Info */}
                            <section className="p-8 rounded-md bg-surface-1-light dark:bg-surface-1-dark dark:backdrop-blur-xl">
                                <p className="leading-relaxed text-sub-text-light dark:text-sub-text-dark">
                                    {__('This Global Refund & Return Policy')} (“{__('Global Policy')}”)
                                    {__("governs all return, refund, cancellation, and related requests for products purchased from")}
                                    {return_policy?.company_name} {" "} ({__('“Company,” “we,” “us,” or “our”')}).
                                    {__("This Global Policy applies across the entire website and forms an integral and binding part of our")}:
                                </p>

                                <ul className="mt-3 ml-5 space-y-1 list-disc text-sub-text-light dark:text-sub-text-dark">
                                    <li>{__('Terms of Service')}</li>
                                    <li>{__('Shipping Policy')}</li>
                                    <li>{__('Compliance & Regulatory Disclosures')}</li>
                                </ul>

                                <p className="mt-3 leading-relaxed text-sub-text-light dark:text-sub-text-dark">
                                    {__('These documents must be read together, not in isolation.')}
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
                                                                <p className="mt-1 text-sm font-normal text-sub-text-light dark:text-sub-text-dark">{return_policy?.dpo_name}</p>
                                                            </div>

                                                            <div className="px-4 py-3 break-words rounded-md bg-backgroundLight dark:bg-surface-2-dark">
                                                                <p className="text-xs font-medium text-main-text-light dark:text-main-text-dark">{__('Email Address')}</p>
                                                                <p className="mt-1 text-sm font-normal text-sub-text-light dark:text-sub-text-dark">{return_policy?.dpo_email}</p>
                                                            </div>


                                                            <div className="px-4 py-3 break-words rounded-md bg-backgroundLight dark:bg-surface-2-dark">
                                                                <p className="text-xs font-medium text-main-text-light dark:text-main-text-dark">{__('Phone Number')}</p>
                                                                <p className="mt-1 text-sm font-normal text-sub-text-light dark:text-sub-text-dark">{return_policy?.dpo_phone}</p>
                                                            </div>


                                                        </div>

                                                        <div className="grid grid-cols-1 gap-3 mt-3">
                                                            <div className="px-4 py-3 break-words rounded-md bg-backgroundLight dark:bg-surface-2-dark">
                                                                <p className="text-xs font-medium text-main-text-light dark:text-main-text-dark">{__('Address')}</p>
                                                                <p className="mt-1 text-sm font-normal text-sub-text-light dark:text-sub-text-dark">{return_policy?.dpo_address}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Fragment>
                                            )}
                                        </Fragment>
                                    );
                                })}



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
