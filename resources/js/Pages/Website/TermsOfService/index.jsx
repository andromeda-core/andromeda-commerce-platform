import { useTranslation } from '@/Hooks/useTranslation';
import useWindowSize from '@/Hooks/useWindowSize';
import MainLayout from '@/Layouts/Website/MainLayout';
import { Head, Link } from '@inertiajs/react';
import { ChevronLeft } from 'lucide-react';
import React, { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import goBackOrHome from '@/Helpers/backNavigationHelper';

const index = ({ terms_of_service }) => {
    const [activeSection, setActiveSection] = useState(null);
    const isProgrammaticScroll = useRef(false);
    const windowSize = useWindowSize();

    // Translation Hook
    const { __ } = useTranslation();

    const tocRef = useRef(null);

    const makeId = (title) => {
        const slug = title
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, '_')
            .replace(/^_+|_+$/g, '');

        return `${slug}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    };

    const dynamicSections = useMemo(() => {
        return (
            terms_of_service?.content?.map((section) => ({
                id: makeId(section.title),
                title: section.title,
                content: section.content,
            })) || []
        );
    }, [terms_of_service]);

    const sections = [
        ...dynamicSections.map((s) => ({ id: s.id, title: s.title })),
        { id: 'data_protection_officer', title: __('Data Protection Officer') },
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
            <Head title={__('Terms Of Service', true)} />
            <div className="sm:px-6 lg:px-8">
                <div
                    className={`mx-auto px-6 lg:mt-6 ${windowSize.width > 1024 ? 'pb-10' : 'pb-24'} sm:max-w-3xl lg:max-w-6xl`}
                >
                    {/* Hero Section */}
                    <div className="relative overflow-hidden text-main-text-dark dark:text-main-text-light">
                        <div className="absolute inset-0" />

                        <div className="relative mx-auto my-2 sm:max-w-3xl lg:max-w-6xl">
                            <button
                                onClick={goBackOrHome}
                                className="inline-flex items-center gap-2 mb-4 text-sm font-medium transition-colors text-main-text-light dark:text-main-text-dark lg:hidden lg:hover:text-main-text-light/80 dark:lg:hover:text-main-text-dark/80"
                            >
                                <ChevronLeft />
                            </button>

                            <h1 className="text-[24px] font-semibold text-main-text-light dark:text-main-text-dark">
                                {__('Terms Of Service')}
                            </h1>

                            <p className="max-w-3xl mt-1 text-sm dark:sub-text-dark text-sub-text-light">
                                {__(
                                    'These Terms govern your access to and use of this website and all related services, including purchases, payments, and compliance obligations.',
                                )}
                            </p>

                            <div className="flex flex-wrap gap-4 mt-5">
                                <div className="flex items-center gap-2 rounded-full bg-surface-1-light px-3 py-1.5 dark:bg-surface-1-dark">
                                    <div className="w-2 h-2 bg-green-500 rounded-full" />

                                    <span className="text-sm font-medium text-sub-text-light dark:text-sub-text-dark">
                                        {__('Last Updated')}: {terms_of_service?.human_updated_at}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="mx-auto my-5 sm:max-w-3xl lg:flex lg:max-w-6xl lg:gap-8">
                        {/* Sticky Table of Contents */}
                        <aside className="hidden shrink-0 lg:block lg:w-80">
                            <div className="sticky top-24">
                                <div
                                    ref={tocRef}
                                    className="h-[calc(100vh-7rem)] overflow-y-auto overscroll-contain rounded-md bg-surface-1-light p-6 scrollbar-thin scrollbar-none dark:bg-surface-1-dark dark:backdrop-blur-xl"
                                >
                                    <h3 className="px-2 mb-4 font-semibold text-md text-main-text-light dark:text-main-text-dark">
                                        {__('Contents')}
                                    </h3>
                                    <nav className="space-y-1">
                                        {sections.map((section) => (
                                            <button
                                                key={section.id}
                                                onClick={() => scrollToSection(section.id)}
                                                className={`over group flex w-full items-center gap-3 rounded-md px-4 py-3 text-left text-sm font-medium transition-all ${
                                                    activeSection === section.id
                                                        ? 'menu-sub-item-active'
                                                        : 'menu-sub-item-inactive'
                                                }`}
                                            >
                                                <span className="flex-1 break-all">
                                                    {section.title}
                                                </span>
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
                        <main className="flex-1 space-y-6">
                            {/* Company Info */}
                            <section className="p-8 rounded-md bg-surface-1-light dark:bg-surface-1-dark dark:backdrop-blur-xl">
                                <p className="leading-relaxed text-sub-text-light dark:text-sub-text-dark">
                                    {__(
                                        'These Terms of Service (“Terms”) govern your access to and use of the website and services operated by',
                                    )}
                                    {terms_of_service?.company_name},{' '}
                                    {__('a corporation organized under the laws of the State of')}{' '}
                                    {terms_of_service?.country},{terms_of_service?.state} (
                                    {__('“Company,” “we,” “us,” or “our”')}).
                                    {__(
                                        'By accessing this website, creating an account, or purchasing any products, you acknowledge that you have read, understood, and agree to be bound by these Terms, together with our Shipping Policy, Refund Policy, and all applicable compliance disclosures.',
                                    )}
                                </p>
                            </section>

                            <section className="w-auto p-8 rounded-md bg-surface-1-light dark:bg-surface-1-dark dark:backdrop-blur-xl">
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
                                                    <ul className="list-[lower-alpha] space-y-2 pl-5 text-sm text-sub-text-light dark:text-sub-text-dark">
                                                        {section.content.map((item, idx) => (
                                                            <li key={idx}>{item}</li>
                                                        ))}
                                                    </ul>
                                                )}

                                                {/* Content as Paragraph */}
                                                {typeof section.content === 'string' && (
                                                    <p
                                                        className="leading-relaxed text-sub-text-light dark:text-sub-text-dark"
                                                        dangerouslySetInnerHTML={{
                                                            __html: section.content,
                                                        }}
                                                    ></p>
                                                )}
                                            </div>

                                            {index == dynamicSections.length - 1 && (
                                                <Fragment key={sections.length - 1}>
                                                    {/* 10. Data Protection Officer */}
                                                    <div
                                                        id="data_protection_officer"
                                                        data-section="data_protection_officer"
                                                        className="scroll-mt-10"
                                                    >
                                                        <div className="flex items-center gap-4 mb-3">
                                                            <h2 className="text-lg font-semibold text-main-text-light dark:text-main-text-dark">
                                                                {index + 2}.{' '}
                                                                {__(
                                                                    'Data Protection Officer (DPO)',
                                                                )}
                                                            </h2>
                                                        </div>

                                                        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                                                            <div className="px-4 py-3 break-words rounded-md bg-backgroundLight dark:bg-surface-2-dark">
                                                                <p className="text-xs font-medium text-main-text-light dark:text-main-text-dark">
                                                                    {__('Name')}
                                                                </p>
                                                                <p className="mt-1 text-sm font-normal text-sub-text-light dark:text-sub-text-dark">
                                                                    {terms_of_service?.dpo_name}
                                                                </p>
                                                            </div>

                                                            <div className="px-4 py-3 break-words rounded-md bg-backgroundLight dark:bg-surface-2-dark">
                                                                <p className="text-xs font-medium text-main-text-light dark:text-main-text-dark">
                                                                    {__('Email Address')}
                                                                </p>
                                                                <p className="mt-1 text-sm font-normal text-sub-text-light dark:text-sub-text-dark">
                                                                    {terms_of_service?.dpo_email}
                                                                </p>
                                                            </div>

                                                            <div className="px-4 py-3 break-words rounded-md bg-backgroundLight dark:bg-surface-2-dark">
                                                                <p className="text-xs font-medium text-main-text-light dark:text-main-text-dark">
                                                                    {__('Phone Number')}
                                                                </p>
                                                                <p className="mt-1 text-sm font-normal text-sub-text-light dark:text-sub-text-dark">
                                                                    {terms_of_service?.dpo_phone}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-1 gap-3 mt-3">
                                                            <div className="px-4 py-3 break-words rounded-md bg-backgroundLight dark:bg-surface-2-dark">
                                                                <p className="text-xs font-medium text-main-text-light dark:text-main-text-dark">
                                                                    {__('Address')}
                                                                </p>
                                                                <p className="mt-1 text-sm font-normal text-sub-text-light dark:text-sub-text-dark">
                                                                    {terms_of_service?.dpo_address}
                                                                </p>
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
                                        {__(
                                            "We're here to help. Contact our Data Protection Ofﬁcer for any privacy-related inquiries.",
                                        )}
                                    </p>
                                    <Link
                                        href={route('website.contact.index')}
                                        className="inline-flex items-center justify-center w-full px-6 py-3 font-semibold transition-all rounded-md bg-main-text-light text-main-text-dark hover:bg-main-text-light/80 dark:bg-main-text-dark dark:text-main-text-light dark:hover:bg-main-text-dark/80 sm:w-auto lg:px-20"
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
