import Card from '@/Components/Card';

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

import { Head, router, usePage } from '@inertiajs/react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    BarElement,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import useDarkMode from '@/Hooks/useDarkMode';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler,
);

export default function Dashboard({
    users_count,
    customers_count,
    suppliers_count,
    collaborators_count,
    distributors_count,
    posts_count,
    months,
    total_orders,
    total_sales,
    new_customers,
    returning_customers,
    shipping_statuses,
    collaborators_performance,
    distributors_performance,
    suppliers_performance,
}) {
    const { auth, currency } = usePage().props;
    const isDark = useDarkMode();
    const isMobile = window.innerWidth < 640;
    const orders_chart_data = {
        labels: months,
        datasets: [
            {
                label: 'Orders',
                data: Object.values(total_orders),
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                tension: 0.4,
                fill: true,
            },
            {
                label: 'Sales',
                data: Object.values(total_sales),
                borderColor: 'rgb(16, 185, 129)',
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                tension: 0.4,
                fill: true,
            },
        ],
    };

    const orders_chart_options = {
        maintainAspectRatio: false,
        responsive: true,
        layout: {
            padding: { top: 20, bottom: 50, left: 0, right: 0 },
        },
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    color: isDark ? '#fff' : '#000',
                },
            },
            title: {
                display: true,
                text: 'Monthly Orders Analytics',
                color: isDark ? '#fff' : '#000',
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        const datasetLabel = context.dataset.label || '';
                        const value = context.formattedValue;

                        if (datasetLabel === 'Sales') {
                            return `${datasetLabel}: ${currency.symbol}${value}`;
                        }
                        return `${datasetLabel}: ${value}`;
                    },
                },
            },
        },
        scales: {
            x: {
                ticks: {
                    color: isDark ? '#fff' : '#000',
                    autoSkip: true,
                    maxRotation: isMobile ? 0 : 30,
                    minRotation: 0,
                    padding: 5,
                    callback: function (value, index) {
                        const label = months[index];
                        return isMobile ? label.substring(0, 3) : label;
                    },
                },
                grid: {
                    color: isDark ? '#374151' : '#e5e7eb',
                    drawTicks: false,
                    clip: false,
                },
            },
            y: {
                ticks: {
                    color: isDark ? '#fff' : '#000',
                    padding: 8,
                    callback: function (value, index, ticks) {
                        const chart = this.chart;
                        const salesVisible = chart.isDatasetVisible(
                            chart.data.datasets.findIndex((ds) => ds.label === 'Sales'),
                        );

                        if (salesVisible) {
                            return `${currency.symbol}${value}`;
                        }
                        return value;
                    },
                },
                grid: {
                    color: isDark ? '#374151' : '#e5e7eb',
                },
                title: {
                    display: true,

                    color: isDark ? '#fff' : '#000',
                    padding: { top: 5, bottom: 5 },
                },
            },
        },
    };

    const purchasing_customers_type_data = {
        labels: ['New Customers', 'Returning Customers'],
        datasets: [
            {
                data: [new_customers, returning_customers],
                backgroundColor: ['rgb(24, 5, 156)', 'rgb(210, 12, 107)'],
                borderColor: ['rgb(24, 5, 156)', 'rgb(210, 12, 107)'],
                borderWidth: 1,
            },
        ],
    };

    const purchasing_customers_type_options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    color: isDark ? '#fff' : '#000',
                },
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        return context.formattedValue + '%';
                    },
                },
            },
            title: {
                display: true,
                text: 'New vs Returning Customers',
                color: isDark ? '#fff' : '#000',
            },
        },
    };

    const statusColors = {
        paid: 'rgb(59, 130, 246)',
        pending: 'rgb(234, 179, 8)',
        shipped: 'rgb(236, 72, 153)',
        arrived_locally: 'rgb(120, 113, 108)',
        delivered: 'rgb(34, 197, 94)',
    };

    const shipping_statuses_data = {
        labels: Object.keys(shipping_statuses),
        datasets: [
            {
                label: 'Orders',
                data: Object.values(shipping_statuses),
                backgroundColor: Object.keys(shipping_statuses).map(
                    (status) => statusColors[status],
                ),
            },
        ],
    };

    const shipping_statuses_options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    color: isDark ? '#fff' : '#000',
                },
            },

            title: {
                display: true,
                text: 'Shipping Status Overview',
                color: isDark ? '#fff' : '#000',
            },
        },
    };

    const collaborators_performance_data = {
        labels: collaborators_performance.map((c) => c.name),
        datasets: [
            {
                label: 'Orders',
                data: collaborators_performance.map((c) => c.total_orders),
                backgroundColor: 'rgba(13, 148, 136, 0.8)',
                borderColor: 'rgb(13, 148, 136)',
                borderWidth: 1,
            },
            {
                label: 'Sales',
                data: collaborators_performance.map((c) => c.total_sales),
                backgroundColor: 'rgba(16, 185, 129, 0.8)',
                borderColor: 'rgb(16, 185, 129)',
                borderWidth: 1,
            },
            {
                label: 'Paid Commissions',
                data: collaborators_performance.map((c) => c.paid_commissions),
                backgroundColor: 'rgba(59, 130, 246, 0.8)',
                borderColor: 'rgb(59, 130, 246)',
                borderWidth: 1,
            },
            {
                label: 'Unpaid Commissions',
                data: collaborators_performance.map((c) => c.unpaid_commissions),
                backgroundColor: 'rgba(239, 68, 68, 0.8)',
                borderColor: 'rgb(239, 68, 68)',
                borderWidth: 1,
            },
        ],
    };

    const collaborators_performance_options = {
        indexAxis: 'y',
        maintainAspectRatio: false,
        responsive: true,
        layout: {
            padding: { left: 10, right: 20, top: 20, bottom: 20 },
        },
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    color: isDark ? '#fff' : '#000',
                    boxWidth: 15,
                    font: { size: isMobile ? 9 : 12 },
                },
            },
            title: {
                display: true,
                text: 'Collaborators Performance',
                color: isDark ? '#fff' : '#000',
                font: { size: isMobile ? 11 : 14 },
            },
            callbacks: {
                label: function (context) {
                    const datasetLabel = context.dataset.label || '';
                    const value = context.formattedValue;

                    if (datasetLabel === 'Sales' || datasetLabel.includes('Commissions')) {
                        return `${datasetLabel}: ${currency.symbol}${value}`;
                    }

                    return `${datasetLabel}: ${value}`;
                },
            },
        },
        scales: {
            x: {
                ticks: {
                    color: isDark ? '#fff' : '#000',
                    font: { size: isMobile ? 9 : 12 },
                    callback: function (value) {
                        return `${currency.symbol}${value}`;
                    },
                },
                grid: { color: isDark ? '#374151' : '#e5e7eb' },
                title: {
                    display: true,
                    text: 'Orders / Sales / Commissions',
                    color: isDark ? '#fff' : '#000',
                },
            },
            y: {
                ticks: {
                    color: isDark ? '#fff' : '#000',
                    font: { size: isMobile ? 8 : 12 },
                    autoSkip: false,
                    maxRotation: 0,
                    minRotation: 0,
                    callback: function (value, index) {
                        const label = collaborators_performance[index]?.name || value;
                        return isMobile
                            ? label.length > 12
                                ? label.slice(0, 12) + '…'
                                : label
                            : label.length > 20
                                ? label.slice(0, 20) + '…'
                                : label;
                    },
                },
                grid: { color: isDark ? '#374151' : '#e5e7eb' },
            },
        },
    };

    const distributors_performance_data = {
        labels: distributors_performance.map((d) => d.name),
        datasets: [
            {
                label: 'Orders',
                data: distributors_performance.map((d) => d.total_orders),
                backgroundColor: 'rgba(13, 148, 136, 0.8)',
                borderColor: 'rgb(13, 148, 136)',
                borderWidth: 1,
            },
            {
                label: 'Sales',
                data: distributors_performance.map((d) => d.total_sales),
                backgroundColor: 'rgba(16, 185, 129, 0.8)',
                borderColor: 'rgb(16, 185, 129)',
                borderWidth: 1,
            },
            {
                label: 'Paid Commissions',
                data: distributors_performance.map((d) => d.paid_commissions),
                backgroundColor: 'rgba(59, 130, 246, 0.8)', // blue-500
                borderColor: 'rgb(59, 130, 246)',
                borderWidth: 1,
            },
            {
                label: 'Unpaid Commissions',
                data: distributors_performance.map((d) => d.unpaid_commissions),
                backgroundColor: 'rgba(239, 68, 68, 0.8)', // red-500
                borderColor: 'rgb(239, 68, 68)',
                borderWidth: 1,
            },
        ],
    };

    const distributors_performance_options = {
        indexAxis: 'y',
        maintainAspectRatio: false,
        responsive: true,
        layout: {
            padding: { left: 10, right: 20, top: 20, bottom: 20 },
        },
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    color: isDark ? '#fff' : '#000',
                    boxWidth: 15,
                    font: { size: isMobile ? 9 : 12 },
                },
            },
            title: {
                display: true,
                text: 'Distributors Performance',
                color: isDark ? '#fff' : '#000',
                font: { size: isMobile ? 11 : 14 },
            },
            callbacks: {
                label: function (context) {
                    const datasetLabel = context.dataset.label || '';
                    const value = context.formattedValue;

                    if (datasetLabel === 'Sales' || datasetLabel.includes('Commissions')) {
                        return `${datasetLabel}: ${currency.symbol}${value}`;
                    }

                    return `${datasetLabel}: ${value}`;
                },
            },
        },
        scales: {
            x: {
                ticks: {
                    color: isDark ? '#fff' : '#000',
                    font: { size: isMobile ? 9 : 12 },
                    callback: function (value) {
                        return `${currency.symbol}${value}`;
                    },
                },
                grid: { color: isDark ? '#374151' : '#e5e7eb' },
                title: {
                    display: true,
                    text: 'Orders / Sales / Commissions',
                    color: isDark ? '#fff' : '#000',
                },
            },
            y: {
                ticks: {
                    color: isDark ? '#fff' : '#000',
                    font: { size: isMobile ? 8 : 12 },
                    autoSkip: false,
                    maxRotation: 0,
                    minRotation: 0,
                    callback: function (value, index) {
                        const label = distributors_performance[index]?.name || value;
                        return isMobile
                            ? label.length > 12
                                ? label.slice(0, 12) + '…'
                                : label
                            : label.length > 20
                                ? label.slice(0, 20) + '…'
                                : label;
                    },
                },
                grid: { color: isDark ? '#374151' : '#e5e7eb' },
            },
        },
    };

    const suppliers_performance_data = {
        labels: suppliers_performance.map((c) => c.name),
        datasets: [
            {
                label: 'Orders',
                data: suppliers_performance.map((c) => c.total_orders),
                backgroundColor: 'rgba(13, 148, 136, 0.8)',
                borderColor: 'rgb(13, 148, 136)',
                borderWidth: 1,
            },
            {
                label: 'Sales',
                data: suppliers_performance.map((c) => c.total_sales),
                backgroundColor: 'rgba(16, 185, 129, 0.8)',
                borderColor: 'rgb(16, 185, 129)',
                borderWidth: 1,
            },
            {
                label: 'Paid Commissions',
                data: suppliers_performance.map((c) => c.paid_commissions),
                backgroundColor: 'rgba(59, 130, 246, 0.8)',
                borderColor: 'rgb(59, 130, 246)',
                borderWidth: 1,
            },
            {
                label: 'Unpaid Commissions',
                data: suppliers_performance.map((c) => c.unpaid_commissions),
                backgroundColor: 'rgba(239, 68, 68, 0.8)',
                borderColor: 'rgb(239, 68, 68)',
                borderWidth: 1,
            },
        ],
    };

    const suppliers_performance_options = {
        indexAxis: 'y',
        maintainAspectRatio: false,
        responsive: true,
        layout: {
            padding: { left: 10, right: 20, top: 20, bottom: 20 },
        },
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    color: isDark ? '#fff' : '#000',
                    boxWidth: 15,
                    font: { size: isMobile ? 9 : 12 },
                },
            },
            title: {
                display: true,
                text: 'Suppliers Performance',
                color: isDark ? '#fff' : '#000',
                font: { size: isMobile ? 11 : 14 },
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        const datasetLabel = context.dataset.label || '';
                        const value = context.formattedValue;

                        if (datasetLabel === 'Sales' || datasetLabel.includes('Commissions')) {
                            return `${datasetLabel}: ${currency.symbol}${value}`;
                        }

                        return `${datasetLabel}: ${value}`;
                    },
                },
            },
        },
        scales: {
            x: {
                ticks: {
                    color: isDark ? '#fff' : '#000',
                    font: { size: isMobile ? 9 : 12 },
                    callback: function (value) {
                        return `${currency.symbol}${value}`;
                    },
                },
                grid: { color: isDark ? '#374151' : '#e5e7eb' },
                title: {
                    display: true,
                    text: 'Orders / Sales / Commissions',
                    color: isDark ? '#fff' : '#000',
                },
            },
            y: {
                ticks: {
                    color: isDark ? '#fff' : '#000',
                    font: { size: isMobile ? 8 : 12 },
                    autoSkip: false, // show all labels
                    callback: function (value) {
                        const label = this.getLabelForValue(value);
                        return isMobile
                            ? label.length > 12
                                ? label.slice(0, 12) + '…'
                                : label
                            : label.length > 20
                                ? label.slice(0, 20) + '…'
                                : label;
                    },
                },
                grid: { color: isDark ? '#374151' : '#e5e7eb' },
            },
        },
    };

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />
            <Card
                Content={
                    <>
                        <div className="flex justify-center my-6">
                            <h3 className="text-3xl font-bold text-gray-900 dark:text-white/80">
                                Welcome back,
                                <span className="ml-2 text-transparent bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text">
                                    {auth.user.name}
                                </span>{' '}
                                👋
                            </h3>
                        </div>

                        {auth.user.role === 'Admin' && (
                            <>
                                <div className="grid grid-cols-1 gap-5 my-10 md:grid-cols-3">
                                    <div className="relative flex flex-col items-center justify-center p-6 space-y-5 text-center transition-transform duration-200 bg-white shadow-md rounded-xl hover:-translate-y-1 hover:shadow-xl dark:bg-zinc-900/50">
                                        {/* Icon */}
                                        <div className="p-4 rounded-full shadow-lg bg-gradient-to-tr from-blue-500 to-indigo-500">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth={1.5}
                                                stroke="currentColor"
                                                className="text-white h-9 w-9"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128V19.125c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0Zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0Z"
                                                />
                                            </svg>
                                        </div>

                                        {/* Content */}
                                        <div className="space-y-2">
                                            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                                                Total Users
                                            </h3>
                                            <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                                {users_count}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="relative flex flex-col items-center justify-center p-6 space-y-5 text-center transition-transform duration-200 bg-white shadow-md rounded-xl hover:-translate-y-1 hover:shadow-xl dark:bg-zinc-900/50">
                                        {/* Icon */}
                                        <div className="p-4 rounded-full shadow-lg bg-gradient-to-tr from-blue-500 to-indigo-500">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth={1.5}
                                                stroke="currentColor"
                                                className="text-white h-9 w-9"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"
                                                />
                                            </svg>
                                        </div>

                                        {/* Content */}
                                        <div className="space-y-2">
                                            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                                                Total Customers
                                            </h3>
                                            <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                                {customers_count}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="relative flex flex-col items-center justify-center p-6 space-y-5 text-center transition-transform duration-200 bg-white shadow-md rounded-xl hover:-translate-y-1 hover:shadow-xl dark:bg-zinc-900/50">
                                        {/* Icon */}
                                        <div className="p-4 rounded-full shadow-lg bg-gradient-to-tr from-blue-500 to-indigo-500">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth={1.5}
                                                stroke="currentColor"
                                                className="text-white size-9"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"
                                                />
                                            </svg>
                                        </div>

                                        {/* Content */}
                                        <div className="space-y-2">
                                            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                                                Total Suppliers
                                            </h3>
                                            <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                                {suppliers_count}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="relative flex flex-col items-center justify-center p-6 space-y-5 text-center transition-transform duration-200 bg-white shadow-md rounded-xl hover:-translate-y-1 hover:shadow-xl dark:bg-zinc-900/50">
                                        {/* Icon */}
                                        <div className="p-4 rounded-full shadow-lg bg-gradient-to-tr from-blue-500 to-indigo-500">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth="1.5"
                                                stroke="currentColor"
                                                className="text-white size-9"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0M12 12.75h.008v.008H12v-.008Z"
                                                ></path>
                                            </svg>
                                        </div>

                                        {/* Content */}
                                        <div className="space-y-2">
                                            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                                                Total Collaborators
                                            </h3>
                                            <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                                {collaborators_count}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="relative flex flex-col items-center justify-center p-6 space-y-5 text-center transition-transform duration-200 bg-white shadow-md rounded-xl hover:-translate-y-1 hover:shadow-xl dark:bg-zinc-900/50">
                                        {/* Icon */}
                                        <div className="p-4 rounded-full shadow-lg bg-gradient-to-tr from-blue-500 to-indigo-500">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth="1.5"
                                                stroke="currentColor"
                                                className="text-white size-9"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M6 6.878V6a2.25 2.25 0 0 1 2.25-2.25h7.5A2.25 2.25 0 0 1 18 6v.878m-12 0c.235-.083.487-.128.75-.128h10.5c.263 0 .515.045.75.128m-12 0A2.25 2.25 0 0 0 4.5 9v.878m13.5-3A2.25 2.25 0 0 1 19.5 9v.878m0 0a2.246 2.246 0 0 0-.75-.128H5.25c-.263 0-.515.045-.75.128m15 0A2.25 2.25 0 0 1 21 12v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6c0-.98.626-1.813 1.5-2.122"
                                                ></path>
                                            </svg>
                                        </div>

                                        {/* Content */}
                                        <div className="space-y-2">
                                            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                                                Total Distributors
                                            </h3>
                                            <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                                {distributors_count}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="relative flex flex-col items-center justify-center p-6 space-y-5 text-center transition-transform duration-200 bg-white shadow-md rounded-xl hover:-translate-y-1 hover:shadow-xl dark:bg-zinc-900/50">
                                        {/* Icon */}
                                        <div className="p-4 rounded-full shadow-lg bg-gradient-to-tr from-blue-500 to-indigo-500">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth={1.5}
                                                stroke="currentColor"
                                                className="text-white size-9"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                                                />
                                            </svg>
                                        </div>

                                        {/* Content */}
                                        <div className="space-y-2">
                                            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                                                Total Posts
                                            </h3>
                                            <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                                {posts_count}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Doughnut Charts */}
                                <div className="grid grid-cols-1 gap-5 mx-5 my-10 place-items-center sm:grid-cols-2 lg:grid-cols-2">
                                    <div className="relative h-[400px] w-full max-w-sm rounded-xl bg-white p-6 text-center shadow-md transition-transform duration-200 hover:-translate-y-1 hover:shadow-xl dark:bg-zinc-900/50">
                                        <Doughnut
                                            data={purchasing_customers_type_data}
                                            options={purchasing_customers_type_options}
                                        />
                                    </div>

                                    <div className="relative h-[400px] w-full max-w-sm rounded-xl bg-white p-6 text-center shadow-md transition-transform duration-200 hover:-translate-y-1 hover:shadow-xl dark:bg-zinc-900/50">
                                        <Doughnut
                                            data={shipping_statuses_data}
                                            options={shipping_statuses_options}
                                        />
                                    </div>
                                </div>

                                {/* Orders + Sales Line Chart */}

                                <div className="flex justify-end w-full mb-1">
                                    <select
                                        onChange={(e) => {
                                            router.reload({
                                                data: { months_count: e.target.value },
                                                only: ['total_orders', 'total_sales', 'months'],
                                                preserveState: true,
                                                replace: true,
                                                preserveUrl: true,
                                            });
                                        }}
                                        className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                                    >
                                        <option value="12">Last 12 Months</option>
                                        <option value="6">Last 6 Months</option>
                                        <option value="3">Last 3 Months</option>
                                        <option value="2">Last Month</option>
                                    </select>
                                </div>

                                <div className="grid grid-cols-1 gap-5 my-2">
                                    <div className="relative h-[500px] w-full rounded-xl bg-white p-6 shadow-md transition-transform duration-200 hover:-translate-y-1 hover:shadow-xl dark:bg-zinc-900/50">
                                        <Line
                                            data={orders_chart_data}
                                            options={orders_chart_options}
                                        />
                                    </div>
                                </div>

                                {/* Collaborator Performance Bar Chart */}
                                <div className="grid grid-cols-1 gap-5 my-10">
                                    <div className="relative h-[400px] w-full rounded-xl bg-white p-6 text-center shadow-md transition-transform duration-200 hover:-translate-y-1 hover:shadow-xl dark:bg-zinc-900/50">
                                        <Bar
                                            data={collaborators_performance_data}
                                            options={collaborators_performance_options}
                                        />
                                    </div>
                                </div>

                                {/* Distributor Performance Bar Chart */}
                                <div className="grid grid-cols-1 gap-5 my-10">
                                    <div className="relative h-[400px] w-full rounded-xl bg-white p-6 text-center shadow-md transition-transform duration-200 hover:-translate-y-1 hover:shadow-xl dark:bg-zinc-900/50">
                                        <Bar
                                            data={distributors_performance_data}
                                            options={distributors_performance_options}
                                        />
                                    </div>
                                </div>

                                {/* Suppliers Performance Bar Chart */}
                                <div className="grid grid-cols-1 gap-5 my-10">
                                    <div className="relative h-[400px] w-full rounded-xl bg-white p-6 text-center shadow-md transition-transform duration-200 hover:-translate-y-1 hover:shadow-xl dark:bg-zinc-900/50">
                                        <Bar
                                            data={suppliers_performance_data}
                                            options={suppliers_performance_options}
                                        />
                                    </div>
                                </div>
                            </>
                        )}
                    </>
                }
            />
        </AuthenticatedLayout>
    );
}
