import { useTranslation } from '@/Hooks/useTranslation';
import useWindowSize from '@/Hooks/useWindowSize';
import MainLayout from '@/Layouts/Website/MainLayout';
import { Head, router } from '@inertiajs/react';
import React, { useState, useEffect, useRef } from 'react';
import {
    BellIcon,
    ClockIcon,
    CheckCircleIcon,
    TrashIcon,
    EyeIcon,
} from '@heroicons/react/24/outline';
import { useConfirm } from '@/Hooks/useConfirm';
import Spinner from '@/Components/Spinner';



const index = ({ notifications = [], totalCounts, currentFilter }) => {

    const windowSize = useWindowSize();
    const { __ } = useTranslation();
    const { confirm, ConfirmDialog } = useConfirm();

    const [localNotifications, setLocalNotifications] = useState(notifications?.data || []);
    const [nextPageUrl, setNextPageUrl] = useState(notifications?.next_page_url || null);
    const [loadingMore, setLoadingMore] = useState(false);
    const [filterLoading, setFilterLoading] = useState(false);
    const [loadingStates, setLoadingStates] = useState({
        markAllAsRead: false,
        markAsRead: {},
        delete: {},
    });

    const safeCounts = totalCounts ?? { all: 0, unread: 0, read: 0 };

    const isLoadMoreRef = useRef(false);

    const prevFilterRef = useRef(currentFilter);

    useEffect(() => {
        const isFilterChange = prevFilterRef.current !== currentFilter;

        if (isFilterChange || !isLoadMoreRef.current) {
            setLocalNotifications(notifications?.data || []);
            setNextPageUrl(notifications?.next_page_url || null);
            prevFilterRef.current = currentFilter;
            setFilterLoading(false);
        } else {
            // Load More: append, deduplicate
            setLocalNotifications((prev) => {
                const existingIds = new Set(prev.map((n) => n.id));
                const newItems = (notifications?.data || []).filter((n) => !existingIds.has(n.id));
                return [...prev, ...newItems];
            });
            setNextPageUrl(notifications?.next_page_url || null);
        }

        isLoadMoreRef.current = false;
    }, [notifications, currentFilter]);

    const switchFilter = (newFilter) => {
        if (newFilter === currentFilter || filterLoading) return;
        setFilterLoading(true);

        router.get(
            route('website.notifications.index'),
            { filter: newFilter },
            {
                only: ['notifications', 'totalCounts', 'currentFilter'],
                preserveScroll: true,
                preserveState: true,
                onFinish: () => setFilterLoading(false),
                onError: () => setFilterLoading(false),
            },
        );
    };

    // Load More - same filter, next page
    const loadMore = () => {
        if (!nextPageUrl || loadingMore) return;
        setLoadingMore(true);
        isLoadMoreRef.current = true;

        router.visit(nextPageUrl, {
            preserveState: true,
            preserveScroll: true,
            only: ['notifications'],
            onFinish: () => setLoadingMore(false),
            onError: () => {
                isLoadMoreRef.current = false;
                setLoadingMore(false);
            },
        });
    };

    const markAsRead = async (notificationId) => {
        const result = await confirm({
            title: __('Confirm Marking as Read'),
            text: __('Are you sure you want to mark this Notification as Read?'),
            icon: 'info',
            showCancelButton: true,
            confirmButtonText: __('Yes'),
            cancelButtonText: __('No'),
        });
        if (!result.isConfirmed) return;

        setLoadingStates((prev) => ({
            ...prev,
            markAsRead: { ...prev.markAsRead, [notificationId]: true },
        }));

        router.put(
            route('website.notifications.mark-as-seen'),
            {
                notification_id: notificationId,
            },
            {
                preserveScroll: true,
                onFinish: () =>
                    setLoadingStates((prev) => ({
                        ...prev,
                        markAsRead: { ...prev.markAsRead, [notificationId]: false },
                    })),
            },
        );
    };

    const deleteNotification = async (notificationId) => {
        const result = await confirm({
            title: __('Confirm Notification Deletion'),
            text: __('Are you sure you want to Delete this Notification?'),
            icon: 'info',
            showCancelButton: true,
            confirmButtonText: __('Yes'),
            cancelButtonText: __('No'),
        });
        if (!result.isConfirmed) return;

        setLoadingStates((prev) => ({
            ...prev,
            delete: { ...prev.delete, [notificationId]: true },
        }));

        router.delete(route('website.notifications.destroy', notificationId), {
            preserveScroll: true,
            onFinish: () =>
                setLoadingStates((prev) => ({
                    ...prev,
                    delete: { ...prev.delete, [notificationId]: false },
                })),
        });
    };

    const markAllAsRead = async () => {
        const result = await confirm({
            title: __('Confirm Marking All as Read'),
            text: __('Are you sure you want to mark All Notifications as Read?'),
            icon: 'info',
            showCancelButton: true,
            confirmButtonText: __('Yes'),
            cancelButtonText: __('No'),
        });
        if (!result.isConfirmed) return;

        setLoadingStates((prev) => ({ ...prev, markAllAsRead: true }));

        router.put(
            route('website.notifications.mark-all-as-seen'),
            {},
            {
                preserveScroll: true,
                onFinish: () => setLoadingStates((prev) => ({ ...prev, markAllAsRead: false })),
            },
        );
    };

    const groupNotificationsByDate = (notifications) => {
        const groups = { today: [], yesterday: [], thisWeek: [], older: [] };
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);

        notifications.forEach((notification) => {
            const notifDate = new Date(notification.created_at);
            const notifDay = new Date(
                notifDate.getFullYear(),
                notifDate.getMonth(),
                notifDate.getDate(),
            );
            if (notifDay.getTime() === today.getTime()) groups.today.push(notification);
            else if (notifDay.getTime() === yesterday.getTime())
                groups.yesterday.push(notification);
            else if (notifDate >= weekAgo) groups.thisWeek.push(notification);
            else groups.older.push(notification);
        });

        return groups;
    };

    const grouped = groupNotificationsByDate(localNotifications);

    const tabs = [
        { key: 'all', label: __('All'), count: safeCounts.all },
        { key: 'unread', label: __('Unread'), count: safeCounts.unread },
        { key: 'read', label: __('Read'), count: safeCounts.read },
    ];

    return (
        <MainLayout>
            <Head title={__('Notifications', true)} />
            <ConfirmDialog />
            <div className="sm:px-6 lg:px-8">
                <div
                    className={`mx-auto px-6 ${windowSize.width > 1024 ? 'pb-10' : 'pb-24'} sm:max-w-3xl lg:max-w-6xl`}
                >
                    {/* Header */}
                    <div className="py-8">
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <BellIcon className="w-8 h-8 text-main-text-light dark:text-main-text-dark" />
                                    {safeCounts.unread > 0 && (
                                        <span className="absolute flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full -right-1 -top-1">
                                            {safeCounts.unread}
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <h1 className="text-[24px] font-semibold text-main-text-light dark:text-main-text-dark">
                                        {__('Notifications')}
                                    </h1>
                                    <p className="mt-1 text-sm text-sub-text-light dark:text-sub-text-dark">
                                        {safeCounts.unread > 0
                                            ? `${totalCounts.unread} ${__('unread notification')}${safeCounts.unread > 1 ? 's' : ''}`
                                            : __('All caught up!')}
                                    </p>
                                </div>
                            </div>

                            {safeCounts.unread > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    disabled={loadingStates.markAllAsRead}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-200 bg-white border rounded-lg border-primary-input-border-light text-main-text-light disabled:cursor-not-allowed disabled:opacity-50 dark:border-primary-input-border-dark dark:bg-surface-2-dark dark:text-main-text-dark lg:hover:bg-surface-3-light dark:lg:hover:bg-surface-3-dark"
                                >
                                    {loadingStates.markAllAsRead ? (
                                        <>
                                            <Spinner size="sm" />
                                            {__('Processing') + '...'}
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircleIcon className="w-4 h-4" />
                                            {__('Mark all as read')}
                                        </>
                                    )}
                                </button>
                            )}
                        </div>

                        {/* Filter Tabs */}
                        <div className="flex gap-2 p-1 bg-white rounded-md w-fit dark:bg-surface-1-dark">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.key}
                                    onClick={() => switchFilter(tab.key)}
                                    disabled={filterLoading}
                                    className={`rounded-md px-4 py-2 text-sm font-medium transition-all duration-200 disabled:cursor-not-allowed ${currentFilter === tab.key
                                        ? 'bg-white text-main-text-light shadow-sm dark:bg-surface-3-dark dark:text-main-text-dark'
                                        : 'text-sub-text-light dark:text-sub-text-dark lg:hover:bg-surface-2-light dark:lg:hover:bg-surface-2-dark'
                                        }`}
                                >
                                    {filterLoading && currentFilter !== tab.key
                                        ? // Show spinner on the tab being navigated to
                                        tab.key === tab.key
                                            ? tab.label
                                            : tab.label
                                        : tab.label}{' '}
                                    ({tab.count})
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="mx-auto sm:max-w-3xl lg:max-w-6xl">
                        {filterLoading ? (
                            // Skeleton while switching tabs
                            <div className="space-y-2">
                                {[...Array(5)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="h-20 rounded-md animate-pulse bg-surface-2-light dark:bg-surface-2-dark"
                                    />
                                ))}
                            </div>
                        ) : localNotifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 bg-white border rounded-md border-surface-3-light dark:border-surface-3-dark dark:bg-surface-1-dark">
                                <BellIcon className="w-12 h-12 mb-4 text-main-text-light dark:text-main-text-dark" />
                                <h3 className="mb-2 text-xl font-semibold text-main-text-light dark:text-main-text-dark">
                                    {__('No notifications')}
                                </h3>
                                <p className="max-w-md text-center text-sub-text-light dark:text-sub-text-dark">
                                    {currentFilter === 'unread'
                                        ? __('You have no unread notifications at the moment')
                                        : currentFilter === 'read'
                                            ? __('You have no read notifications')
                                            : __('You have no notifications yet. Check back later!')}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                {grouped.today.length > 0 && (
                                    <NotificationGroup
                                        title={__('Today')}
                                        notifications={grouped.today}
                                        markAsRead={markAsRead}
                                        deleteNotification={deleteNotification}
                                        loadingStates={loadingStates}
                                        __={__}
                                    />
                                )}
                                {grouped.yesterday.length > 0 && (
                                    <NotificationGroup
                                        title={__('Yesterday')}
                                        notifications={grouped.yesterday}
                                        markAsRead={markAsRead}
                                        deleteNotification={deleteNotification}
                                        loadingStates={loadingStates}
                                        __={__}
                                    />
                                )}
                                {grouped.thisWeek.length > 0 && (
                                    <NotificationGroup
                                        title={__('This Week')}
                                        notifications={grouped.thisWeek}
                                        markAsRead={markAsRead}
                                        deleteNotification={deleteNotification}
                                        loadingStates={loadingStates}
                                        __={__}
                                    />
                                )}
                                {grouped.older.length > 0 && (
                                    <NotificationGroup
                                        title={__('Older')}
                                        notifications={grouped.older}
                                        markAsRead={markAsRead}
                                        deleteNotification={deleteNotification}
                                        loadingStates={loadingStates}
                                        __={__}
                                    />
                                )}

                                {/* Load More */}
                                {nextPageUrl && (
                                    <div className="flex justify-center pt-4">
                                        <button
                                            onClick={loadMore}
                                            disabled={loadingMore}
                                            className="flex items-center gap-2 rounded-lg border border-primary-input-border-light bg-white px-6 py-2.5 text-sm font-medium text-main-text-light transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 dark:border-primary-input-border-dark dark:bg-surface-2-dark dark:text-main-text-dark lg:hover:bg-surface-3-light dark:lg:hover:bg-surface-3-dark"
                                        >
                                            {loadingMore ? (
                                                <>
                                                    <Spinner size="sm" />
                                                    {__('Loading') + '...'}
                                                </>
                                            ) : (
                                                __('Load More')
                                            )}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

// Notification Group Component
const NotificationGroup = ({
    title,
    notifications,
    markAsRead,
    deleteNotification,
    loadingStates,
    __,
}) => (
    <div>
        <h2 className="mb-3 text-sm font-semibold tracking-wider uppercase text-sub-text-light dark:text-sub-text-dark">
            {title}
        </h2>
        <div className="space-y-2">
            {notifications.map((notification) => (
                <NotificationItem
                    key={notification.id}
                    notification={notification}
                    markAsRead={markAsRead}
                    deleteNotification={deleteNotification}
                    loadingStates={loadingStates}
                    __={__}
                />
            ))}
        </div>
    </div>
);

// Notification Item Component
const NotificationItem = ({ notification, markAsRead, deleteNotification, loadingStates, __ }) => {
    const isUnread = !notification.read_at;
    const isMarkingAsRead = loadingStates.markAsRead[notification.id];
    const isDeleting = loadingStates.delete[notification.id];
    const hasActionUrl = notification.data?.action_url;

    const timeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        const intervals = {
            year: 31536000,
            month: 2592000,
            week: 604800,
            day: 86400,
            hour: 3600,
            minute: 60,
        };
        for (const [unit, secondsInUnit] of Object.entries(intervals)) {
            const interval = Math.floor(seconds / secondsInUnit);
            if (interval >= 1)
                return `${interval} ${__(unit, true)}${interval > 1 ? 's' : ''} ${__('ago', true)}`;
        }
        return __('Just now', true);
    };

    return (
        <div
            onClick={() => {
                if (hasActionUrl && !isDeleting && !isMarkingAsRead)
                    router.visit(notification.data.action_url);
            }}
            className={`group relative flex gap-4 rounded-md border p-4 transition-all duration-200 ${hasActionUrl ? 'cursor-pointer' : 'cursor-default'} border-surface-3-light bg-white dark:border-surface-3-dark dark:bg-surface-1-dark lg:hover:bg-surface-2-light dark:lg:hover:bg-surface-2-dark ${isDeleting || isMarkingAsRead ? 'pointer-events-none opacity-60' : ''}`}
        >
            {isUnread && (
                <div className="absolute left-0 w-1 h-12 -translate-y-1/2 bg-blue-500 rounded-r-full top-1/2" />
            )}

            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-1">
                    <h3 className="font-semibold text-main-text-light dark:text-main-text-dark">
                        {notification.data?.title || __('Notification')}
                    </h3>
                    <div className="flex items-center gap-1">
                        {isUnread && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    markAsRead(notification.id);
                                }}
                                disabled={isMarkingAsRead || isDeleting}
                                className="p-2 transition-colors duration-200 rounded-md text-main-text-light disabled:cursor-not-allowed disabled:opacity-50 dark:text-main-text-dark lg:hover:bg-white lg:hover:text-green-600 dark:lg:hover:bg-surface-3-dark dark:lg:hover:text-green-400"
                                title={__('Mark as read')}
                            >
                                {isMarkingAsRead ? (
                                    <Spinner size="sm" />
                                ) : (
                                    <EyeIcon className="w-4 h-4" />
                                )}
                            </button>
                        )}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification.id);
                            }}
                            disabled={isDeleting || isMarkingAsRead}
                            className="p-2 transition-colors duration-200 rounded-md text-main-text-light disabled:cursor-not-allowed disabled:opacity-50 dark:text-main-text-dark lg:hover:bg-white lg:hover:text-red-600 dark:lg:hover:bg-surface-3-dark dark:lg:hover:text-red-400"
                            title={__('Delete')}
                        >
                            {isDeleting ? <Spinner size="sm" /> : <TrashIcon className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                <p className="mb-2 text-sm line-clamp-5 text-main-text-light dark:text-main-text-dark">
                    {notification.data?.message || __('No message available')}
                </p>

                <div className="flex items-center gap-2 text-xs text-main-text-light dark:text-main-text-dark">
                    <ClockIcon className="w-3 h-3" />
                    <span>{timeAgo(notification.created_at)}</span>
                </div>
            </div>
        </div>
    );
};

export default index;
