import MainLayout from '@/Layouts/Website/MainLayout';
import { Head, Link } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

const index = () => {
    const [activeSection, setActiveSection] = useState('collect');

    useEffect(() => {
        const handleScroll = () => {
            const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = (window.scrollY / totalHeight) * 100;

            const sections = document.querySelectorAll('[data-section]');
            sections.forEach((section) => {
                const rect = section.getBoundingClientRect();
                if (rect.top <= 150 && rect.bottom >= 150) {
                    setActiveSection(section.getAttribute('data-section'));
                }
            });
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const sections = [
        {
            id: 'collect',
            title: 'Information We Collect',
            icon: (
                <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125"
                    />
                </svg>
            ),
        },
        {
            id: 'use',
            title: 'How We Use Information',
            icon: (
                <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                    />
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                    />
                </svg>
            ),
        },
        {
            id: 'legal',
            title: 'Legal Basis',
            icon: (
                <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                    />
                </svg>
            ),
        },
        {
            id: 'retention',
            title: 'Data Retention',
            icon: (
                <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
                    />
                </svg>
            ),
        },
        {
            id: 'sharing',
            title: 'Data Sharing',
            icon: (
                <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418"
                    />
                </svg>
            ),
        },
        {
            id: 'rights',
            title: 'User Rights',
            icon: (
                <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z"
                    />
                </svg>
            ),
        },
        {
            id: 'cookies',
            title: 'Cookies & Tracking',
            icon: (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-5 w-5"
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
            ),
        },
        {
            id: 'deletion',
            title: 'Data Deletion',
            icon: (
                <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                    />
                </svg>
            ),
        },
    ];

    return (
        <MainLayout>
            <Head title="Privacy Policy" />
            <div className="sm:px-6 sm:pb-20 lg:px-8">
                <div className="min-h-screen">
                    {/* Hero Section */}
                    <div className="relative overflow-hidden border-b border-gray-800 bg-gradient-to-br from-gray-900 via-black to-gray-950 text-white">
                        {/* Background Accents */}
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-blue-500/5 to-purple-500/10" />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.2),transparent_60%)]" />

                        <div className="relative mx-auto max-w-4xl px-6 py-16 lg:py-24">
                            {/* Icon & Label */}
                            <div className="mb-6 flex items-center gap-3">
                                <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-700 p-3 shadow-lg shadow-indigo-500/30">
                                    <svg
                                        className="h-7 w-7 text-white"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={1.5}
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
                                        />
                                    </svg>
                                </div>
                                <span className="text-sm font-semibold uppercase tracking-wider text-indigo-400">
                                    Legal Documents
                                </span>
                            </div>

                            {/* Title */}
                            <h1 className="mb-6 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-5xl font-bold text-transparent lg:text-6xl">
                                Privacy Policy
                            </h1>

                            {/* Subtitle */}
                            <p className="mb-8 max-w-3xl text-xl text-gray-400">
                                Your privacy matters to us. Learn how W IN DOUBLE SPACE CORP. LTD
                                protects and manages your personal information.
                            </p>

                            {/* Tags */}
                            <div className="flex flex-wrap gap-4 text-sm">
                                <div className="flex items-center gap-2 rounded-lg border border-green-500/20 bg-green-500/10 px-3 py-1.5">
                                    <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                                    <span className="font-medium text-green-400">
                                        Last Updated: October 22, 2025
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 rounded-lg border border-blue-500/20 bg-blue-500/10 px-3 py-1.5">
                                    <svg
                                        className="h-4 w-4 text-blue-400"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={1.5}
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418"
                                        />
                                    </svg>
                                    <span className="font-medium text-blue-400">Global Policy</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="mx-auto max-w-5xl px-6 py-12 lg:flex lg:gap-8">
                        {/* Sticky Table of Contents */}
                        <aside className="hidden shrink-0 lg:block lg:w-80">
                            <div className="sticky top-24">
                                <div className="rounded-2xl bg-white p-6 shadow-lg dark:bg-deepcharcoal dark:backdrop-blur-xl">
                                    <h3 className="mb-4 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                        Contents
                                    </h3>
                                    <nav className="space-y-1">
                                        {sections.map((section, idx) => (
                                            <button
                                                key={section.id}
                                                onClick={() => scrollToSection(section.id)}
                                                className={`group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition-all ${
                                                    activeSection === section.id
                                                        ? 'menu-item-active'
                                                        : 'menu-item-inactive'
                                                }`}
                                            >
                                                <span
                                                    className={`flex h-6 w-6 items-center justify-center rounded-lg transition-colors ${
                                                        activeSection === section.id
                                                            ? 'text-indigo-600 dark:text-indigo-300'
                                                            : 'text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-300'
                                                    }`}
                                                >
                                                    {section.icon}
                                                </span>
                                                <span className="flex-1">{section.title}</span>
                                                <svg
                                                    className={`h-4 w-4 transition-transform ${activeSection === section.id ? 'translate-x-1' : ''}`}
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    strokeWidth={2}
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
                            <section className="rounded-2xl bg-white p-8 shadow-lg dark:bg-deepcharcoal dark:backdrop-blur-xl">
                                <p className="leading-relaxed text-gray-700 dark:text-gray-300">
                                    This Privacy Policy explains how W IN DOUBLE SPACE CORP. LTD
                                    collects, uses, and protects your personal information when you
                                    use yesbigshop.com and its features, including Facebook Login
                                    and delivery notifications via Messenger, Instagram Direct
                                    Messages, and Threads Direct Messages.
                                </p>
                            </section>

                            {/* Section 1 */}
                            <section
                                id="collect"
                                data-section="collect"
                                className="rounded-2xl bg-white p-8 shadow-lg dark:bg-deepcharcoal dark:backdrop-blur-xl"
                            >
                                <div className="mb-6 flex items-center gap-4">
                                    <div className="rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 p-3 shadow-lg dark:shadow-blue-500/20">
                                        <svg
                                            className="h-6 w-6 text-white"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={1.5}
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125"
                                            />
                                        </svg>
                                    </div>
                                    <h2 className="text-2xl font-medium text-gray-900 dark:text-white/80">
                                        1. Information We Collect
                                    </h2>
                                </div>

                                <div className="space-y-4">
                                    <div className="group rounded-xl border border-gray-200 bg-white p-6 transition-all hover:shadow-md dark:border-gray-700/50 dark:bg-deepcharcoal">
                                        <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white/80">
                                            Information from Facebook Login
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-300">
                                            Name, email, profile picture, Messenger/Instagram ID if
                                            authorized.
                                        </p>
                                    </div>

                                    <div className="group rounded-xl border border-gray-200 bg-white p-6 transition-all hover:shadow-md dark:border-gray-700/50 dark:bg-deepcharcoal">
                                        <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white/80">
                                            Order & Delivery Info
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-300">
                                            Shipping address, contact details, order history,
                                            payment status.
                                        </p>
                                    </div>

                                    <div className="group rounded-xl border border-gray-200 bg-white p-6 transition-all hover:shadow-md dark:border-gray-700/50 dark:bg-deepcharcoal">
                                        <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white/80">
                                            Technical Data
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-300">
                                            IP address, browser type, cookies, device information,
                                            and activity logs.
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {/* Section 2 */}
                            <section
                                id="use"
                                data-section="use"
                                className="rounded-2xl bg-white p-8 shadow-lg dark:bg-deepcharcoal dark:backdrop-blur-xl"
                            >
                                <div className="mb-6 flex items-center gap-4">
                                    <div className="rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 p-3 shadow-lg dark:shadow-purple-500/20">
                                        <svg
                                            className="h-6 w-6 text-white"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={1.5}
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                                            />
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                                            />
                                        </svg>
                                    </div>
                                    <h2 className="text-2xl font-medium text-gray-900 dark:text-white/80">
                                        2. How We Use the Information
                                    </h2>
                                </div>

                                <div className="grid gap-4">
                                    {[
                                        'To enable Facebook Login authentication and secure user identification',
                                        'To process orders, payments, and deliveries',
                                        'To send delivery updates via Facebook Messenger, Instagram Direct, and Threads DMs',
                                        'To provide customer support and improve services',
                                    ].map((item, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-5 transition-all dark:border-gray-700/50 dark:bg-deepcharcoal"
                                        >
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 text-sm font-medium text-white shadow-md">
                                                {idx + 1}
                                            </div>
                                            <p className="flex-1 pt-1 text-gray-700 dark:text-gray-300">
                                                {item}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* Section 3 */}
                            <section
                                id="legal"
                                data-section="legal"
                                className="rounded-2xl bg-white p-8 shadow-lg dark:bg-deepcharcoal dark:backdrop-blur-xl"
                            >
                                <div className="mb-6 flex items-center gap-4">
                                    <div className="rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 p-3 shadow-lg dark:shadow-green-500/20">
                                        <svg
                                            className="h-6 w-6 text-white"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={1.5}
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                                            />
                                        </svg>
                                    </div>
                                    <h2 className="text-2xl font-medium text-gray-900 dark:text-white/80">
                                        3. Legal Basis for Processing
                                    </h2>
                                </div>
                                <p className="leading-relaxed text-gray-700 dark:text-gray-300">
                                    Data is processed based on user consent, contract fulfillment,
                                    and legal compliance (e.g., fraud prevention, tax reporting).
                                </p>
                            </section>

                            {/* Section 4 */}
                            <section
                                id="retention"
                                data-section="retention"
                                className="rounded-2xl bg-white p-8 shadow-lg dark:bg-deepcharcoal dark:backdrop-blur-xl"
                            >
                                <div className="mb-6 flex items-center gap-4">
                                    <div className="rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 p-3 shadow-lg dark:shadow-amber-500/20">
                                        <svg
                                            className="h-6 w-6 text-white"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={1.5}
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
                                            />
                                        </svg>
                                    </div>
                                    <h2 className="text-2xl font-medium text-gray-900 dark:text-white/80">
                                        4. Data Retention
                                    </h2>
                                </div>
                                <p className="leading-relaxed text-gray-700 dark:text-gray-300">
                                    Data is retained only as long as necessary for the stated
                                    purposes. Facebook Login data is deleted upon account deletion
                                    or permission revocation.
                                </p>
                            </section>

                            {/* Section 5 */}
                            <section
                                id="sharing"
                                data-section="sharing"
                                className="rounded-2xl bg-white p-8 shadow-lg dark:bg-deepcharcoal dark:backdrop-blur-xl"
                            >
                                <div className="mb-6 flex items-center gap-4">
                                    <div className="rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 p-3 shadow-lg dark:shadow-indigo-500/20">
                                        <svg
                                            className="h-6 w-6 text-white"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={1.5}
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418"
                                            />
                                        </svg>
                                    </div>
                                    <h2 className="text-2xl font-medium text-gray-900 dark:text-white/80">
                                        5. Data Sharing & Third Parties
                                    </h2>
                                </div>

                                <div className="space-y-3">
                                    {[
                                        {
                                            icon: '🔒',
                                            text: 'We do not sell or rent personal data',
                                        },
                                        {
                                            icon: '🤝',
                                            text: 'Shared only with service providers (payments, shipping, IT)',
                                        },
                                        {
                                            icon: '📱',
                                            text: 'Shared with Meta Platforms, Inc. for Facebook Login and messaging API usage',
                                        },
                                        {
                                            icon: '⚖️',
                                            text: 'May be disclosed to authorities when required by law',
                                        },
                                    ].map((item, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700/50 dark:bg-deepcharcoal"
                                        >
                                            <span className="text-2xl">{item.icon}</span>
                                            <p className="flex-1 pt-1 text-gray-700 dark:text-gray-300">
                                                {item.text}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* Section 6 */}
                            <section
                                id="rights"
                                data-section="rights"
                                className="rounded-2xl bg-white p-8 shadow-lg dark:bg-deepcharcoal dark:backdrop-blur-xl"
                            >
                                <div className="mb-6 flex items-center gap-4">
                                    <div className="rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 p-3 shadow-lg dark:shadow-cyan-500/20">
                                        <svg
                                            className="h-6 w-6 text-white"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={1.5}
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z"
                                            />
                                        </svg>
                                    </div>
                                    <h2 className="text-2xl font-medium text-gray-900 dark:text-white/80">
                                        6. User Rights & Data Deletion
                                    </h2>
                                </div>
                                <p className="leading-relaxed text-gray-700 dark:text-gray-300">
                                    Users can request account and data deletion anytime via our{' '}
                                    <Link
                                        href={route('website.data-deletion.index')}
                                        className="font-semibold text-indigo-600 underline decoration-indigo-400/30 underline-offset-4 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                                    >
                                        Data Deletion Policy
                                    </Link>{' '}
                                    or by revoking Facebook Login permissions through their Facebook
                                    settings.
                                </p>
                            </section>

                            {/* Section 7 */}
                            <section
                                id="cookies"
                                data-section="cookies"
                                className="rounded-2xl bg-white p-8 shadow-lg dark:bg-deepcharcoal dark:backdrop-blur-xl"
                            >
                                <div className="mb-6 flex items-center gap-4">
                                    <div className="rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 p-3 shadow-lg dark:shadow-pink-500/20">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={1.5}
                                            stroke="currentColor"
                                            className="h-6 w-6 text-white"
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
                                    <h2 className="text-2xl font-medium text-gray-900 dark:text-white/80">
                                        7. Cookies & Tracking
                                    </h2>
                                </div>
                                <p className="leading-relaxed text-gray-700 dark:text-gray-300">
                                    yesbigshop.com uses cookies for personalization. Disabling
                                    cookies may limit certain features.
                                </p>
                            </section>

                            {/* Additional Sections */}
                            <section className="rounded-2xl bg-white p-8 shadow-lg dark:bg-deepcharcoal dark:backdrop-blur-xl">
                                <div className="mb-6 flex items-center gap-4">
                                    <div className="rounded-xl bg-gradient-to-br from-deepcharcoal to-rose-500 p-3 shadow-lg dark:shadow-pink-500/20">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={1.5}
                                            stroke="currentColor"
                                            className="h-6 w-6 text-white"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
                                            />
                                        </svg>
                                    </div>
                                    <h2 className="text-2xl font-medium text-gray-900 dark:text-white/80">
                                        8. International Data Transfers
                                    </h2>
                                </div>

                                <p className="leading-relaxed text-gray-700 dark:text-gray-300">
                                    Data may be stored outside your country. We ensure legal
                                    safeguards for all international transfers.
                                </p>
                            </section>

                            <section className="rounded-2xl bg-white p-8 shadow-lg dark:bg-deepcharcoal dark:backdrop-blur-xl">
                                <div className="mb-6 flex items-center gap-4">
                                    <div className="rounded-xl bg-gradient-to-br from-zinc-800 to-pink-200 p-3 shadow-lg dark:shadow-pink-500/20">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={1.5}
                                            stroke="currentColor"
                                            className="h-6 w-6 text-white"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
                                            />
                                        </svg>
                                    </div>
                                    <h2 className="text-2xl font-medium text-gray-900 dark:text-white/80">
                                        9. Data Security
                                    </h2>
                                </div>

                                <p className="leading-relaxed text-gray-700 dark:text-gray-300">
                                    All data is protected with SSL/TLS encryption and strict access
                                    control for authorized personnel only.
                                </p>
                            </section>

                            <section className="rounded-2xl bg-white p-8 shadow-lg dark:bg-deepcharcoal dark:backdrop-blur-xl">
                                <div className="mb-6 flex items-center gap-4">
                                    <div className="rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 p-3 shadow-lg dark:shadow-violet-500/20">
                                        <svg
                                            className="h-6 w-6 text-white"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={1.5}
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                                            />
                                        </svg>
                                    </div>
                                    <h2 className="text-2xl font-medium text-gray-900 dark:text-white/80">
                                        10. Data Protection Officer (DPO)
                                    </h2>
                                </div>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-deepcharcoal">
                                        <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                            Email
                                        </span>
                                        <a
                                            href="mailto:privacy@windoublespace.com"
                                            className="mt-1 block font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                                        >
                                            privacy@windoublespace.com
                                        </a>
                                    </div>
                                    <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-deepcharcoal">
                                        <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                            Phone
                                        </span>
                                        <p className="mt-1 font-semibold text-gray-900 dark:text-white/80">
                                            +82-10-5788-7778
                                        </p>
                                    </div>
                                    <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-deepcharcoal md:col-span-2">
                                        <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                            Address
                                        </span>
                                        <p className="mt-1 font-semibold text-gray-900 dark:text-white/80">
                                            Rm 1108, 320 Gangnam-daero, Gangnam-gu, Seoul, Republic
                                            of Korea
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {/* Data Deletion Policy */}
                            <section
                                id="deletion"
                                data-section="deletion"
                                className="scroll-mt-24 rounded-2xl border border-red-200 bg-gradient-to-br from-red-50 to-pink-50 p-8 shadow-lg dark:border-red-800/50 dark:from-red-900/20 dark:to-pink-900/20 dark:backdrop-blur-xl"
                            >
                                <div className="mb-6 flex items-center gap-4">
                                    <div className="rounded-xl bg-gradient-to-br from-red-500 to-pink-500 p-3 shadow-lg dark:shadow-red-500/20">
                                        <svg
                                            className="h-6 w-6 text-white"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={1.5}
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                                            />
                                        </svg>
                                    </div>
                                    <h2 className="text-2xl font-medium text-gray-900 dark:text-white/80">
                                        Data Deletion Policy
                                    </h2>
                                </div>

                                <div className="space-y-4">
                                    <div className="rounded-xl border border-red-200 bg-white p-6 dark:border-gray-700/50 dark:bg-gray-800/30">
                                        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white/80">
                                            How to Request Data Deletion
                                        </h3>
                                        <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                                            <li className="flex items-start gap-3">
                                                <svg
                                                    className="mt-0.5 h-5 w-5 shrink-0 text-indigo-600 dark:text-indigo-400"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    strokeWidth={2}
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="m8.25 4.5 7.5 7.5-7.5 7.5"
                                                    />
                                                </svg>
                                                <span>
                                                    Visit:{' '}
                                                    <Link
                                                        href={route('website.data-deletion.index')}
                                                        className="font-semibold text-indigo-600 underline hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                                                    >
                                                        {route(
                                                            'website.data-deletion.index',
                                                        ).replaceAll(/https?:\/\//g, '')}
                                                    </Link>
                                                </span>
                                            </li>
                                            <li className="flex items-start gap-3">
                                                <svg
                                                    className="mt-0.5 h-5 w-5 shrink-0 text-indigo-600 dark:text-indigo-400"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    strokeWidth={2}
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="m8.25 4.5 7.5 7.5-7.5 7.5"
                                                    />
                                                </svg>
                                                <span>
                                                    Or contact us at{' '}
                                                    <a
                                                        href="mailto:privacy@windoublespace.com"
                                                        className="break-all font-semibold text-indigo-600 underline hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                                                    >
                                                        privacy@windoublespace.com
                                                    </a>{' '}
                                                    with subject line "Data Deletion Request"
                                                </span>
                                            </li>
                                        </ul>
                                    </div>

                                    <div className="rounded-xl border border-red-200 bg-white p-6 dark:border-gray-700/50 dark:bg-gray-800/30">
                                        <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white/80">
                                            Data Deletion Process
                                        </h3>
                                        <p className="text-gray-700 dark:text-gray-300">
                                            Upon receiving a verified request, all Facebook Login
                                            data, order details, and delivery information will be
                                            permanently deleted, unless retention is required by
                                            law.
                                        </p>
                                    </div>

                                    <div className="rounded-xl border border-red-200 bg-white p-6 dark:border-gray-700/50 dark:bg-gray-800/30">
                                        <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white/80">
                                            Revoking Facebook Login Permissions
                                        </h3>
                                        <p className="text-gray-700 dark:text-gray-300">
                                            Users may revoke permissions from their Facebook account
                                            under{' '}
                                            <em className="font-semibold text-indigo-600 dark:text-indigo-400">
                                                Settings → Business Integrations
                                            </em>{' '}
                                            to disconnect yesbigshop.com.
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {/* Footer CTA */}
                            <section className="rounded-2xl bg-white p-8 shadow-lg backdrop-blur-xl dark:border dark:border-gray-800 dark:bg-deepcharcoal">
                                <div className="text-center">
                                    <h3 className="mb-4 text-2xl font-medium text-gray-900 dark:text-white/80">
                                        Have Questions About Your Privacy?
                                    </h3>
                                    <p className="mx-auto mb-6 max-w-2xl text-gray-700 dark:text-gray-300">
                                        We're here to help. Contact our Data Protection Officer for
                                        any privacy-related inquiries.
                                    </p>
                                    <a
                                        href="mailto:privacy@windoublespace.com"
                                        className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-4 font-semibold text-white shadow-lg transition-all hover:bg-indigo-400"
                                    >
                                        <svg
                                            className="h-5 w-5"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={1.5}
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                                            />
                                        </svg>
                                        Contact Us
                                    </a>
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
