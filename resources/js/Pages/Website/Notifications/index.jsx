import { useTranslation } from '@/Hooks/useTranslation';
import useWindowSize from '@/Hooks/useWindowSize';
import MainLayout from '@/Layouts/Website/MainLayout';
import { Head, router } from '@inertiajs/react';
import React, { useState } from 'react';
import {
    BellIcon,
    ClockIcon,
    CheckCircleIcon,
    TrashIcon,
    EyeIcon
} from '@heroicons/react/24/outline';

// Spinner Component
const Spinner = ({ size = 'sm' }) => {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6'
    };

    return (
        <svg
            className={`animate-spin ${sizeClasses[size]}`}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
        >
            <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
            ></circle>
            <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
        </svg>
    );
};

const index = ({ notifications }) => {
    const windowSize = useWindowSize();
    const { __ } = useTranslation();
    const [filter, setFilter] = useState('all');
    const [loadingStates, setLoadingStates] = useState({
        markAllAsRead: false,
        markAsRead: {},
        delete: {}
    });

    // Group notifications by date
    const groupNotificationsByDate = (notifications) => {
        const groups = {
            today: [],
            yesterday: [],
            thisWeek: [],
            older: []
        };

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);

        notifications.forEach(notification => {
            const notifDate = new Date(notification.created_at);
            const notifDateOnly = new Date(notifDate.getFullYear(), notifDate.getMonth(), notifDate.getDate());

            if (notifDateOnly.getTime() === today.getTime()) {
                groups.today.push(notification);
            } else if (notifDateOnly.getTime() === yesterday.getTime()) {
                groups.yesterday.push(notification);
            } else if (notifDate >= weekAgo) {
                groups.thisWeek.push(notification);
            } else {
                groups.older.push(notification);
            }
        });

        return groups;
    };

    // Get icon based on notification type
    // const getNotificationIcon = (type) => {
    //     switch (type) {
    //         case 'order':
    //             return <ShoppingCartIcon className="w-5 h-5" />;
    //         case 'delivery':
    //             return <CubeIcon className="w-5 h-5" />;
    //         case 'promotion':
    //             return <TagIcon className="w-5 h-5" />;
    //         case 'alert':
    //             return <ExclamationCircleIcon className="w-5 h-5" />;
    //         case 'success':
    //             return <CheckCircleIcon className="w-5 h-5" />;
    //         default:
    //             return <InformationCircleIcon className="w-5 h-5" />;
    //     }
    // };

    // Handle mark as read
    const markAsRead = (notificationId) => {
        setLoadingStates(prev => ({
            ...prev,
            markAsRead: { ...prev.markAsRead, [notificationId]: true }
        }));

        router.put(route('website.notifications.mark-as-seen'), {
            notification_id: notificationId
        }, {
            preserveScroll: true,
            onFinish: () => {
                setLoadingStates(prev => ({
                    ...prev,
                    markAsRead: { ...prev.markAsRead, [notificationId]: false }
                }));
            }
        });
    };

    // Handle delete notification
    const deleteNotification = (notificationId) => {
        setLoadingStates(prev => ({
            ...prev,
            delete: { ...prev.delete, [notificationId]: true }
        }));

        router.delete(route('website.notifications.destroy', notificationId), {
            preserveScroll: true,
            onFinish: () => {
                setLoadingStates(prev => ({
                    ...prev,
                    delete: { ...prev.delete, [notificationId]: false }
                }));
            }
        });
    };

    // Mark all as read
    const markAllAsRead = () => {
        setLoadingStates(prev => ({ ...prev, markAllAsRead: true }));

        router.put(route('website.notifications.mark-all-as-seen'), {}, {
            preserveScroll: true,
            onFinish: () => {
                setLoadingStates(prev => ({ ...prev, markAllAsRead: false }));
            }
        });
    };

    // Filter notifications
    const filteredNotifications = notifications?.filter(notif => {
        if (filter === 'unread') return !notif.read_at;
        if (filter === 'read') return notif.read_at;
        return true;
    }) || [];

    const groupedNotifications = groupNotificationsByDate(filteredNotifications);
    const unreadCount = notifications?.filter(n => !n.read_at).length || 0;

    return (
        <MainLayout>
            <Head title={__('Notifications', true)} />
            <div className="sm:px-6 lg:px-8">
                <div className={`px-6 mx-auto ${windowSize.width > 1024 ? 'pb-10' : 'pb-24'} lg:max-w-6xl sm:max-w-3xl`}>

                    {/* Header Section */}
                    <div className="py-8">
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <BellIcon className="w-8 h-8 dark:text-main-text-dark text-main-text-light" />
                                    {unreadCount > 0 && (
                                        <span className="absolute flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full -top-1 -right-1">
                                            {unreadCount}
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <h1 className="text-[24px] font-semibold dark:text-main-text-dark text-main-text-light">
                                        {__('Notifications')}
                                    </h1>
                                    <p className="mt-1 text-sm dark:text-sub-text-dark text-sub-text-light">
                                        {unreadCount > 0
                                            ? `${unreadCount} ${__('unread notification')}${unreadCount > 1 ? 's' : ''}`
                                            : __('All caught up!')
                                        }
                                    </p>
                                </div>
                            </div>

                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    disabled={loadingStates.markAllAsRead}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-200 bg-white border rounded-lg dark:text-main-text-dark text-main-text-light dark:bg-surface-2-dark dark:lg:hover:bg-surface-3-dark lg:hover:bg-surface-3-light dark:border-primary-input-border-dark border-primary-input-border-light disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loadingStates.markAllAsRead ? (
                                        <>
                                            <Spinner size="sm" />
                                            {__('Processing') + "..."}
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
                        <div className="flex gap-2 p-1 bg-white rounded-md dark:bg-surface-1-dark w-fit">
                            <button
                                onClick={() => setFilter('all')}
                                className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${filter === 'all'
                                    ? 'dark:bg-surface-3-dark bg-white dark:text-main-text-dark text-main-text-light shadow-sm'
                                    : 'dark:text-sub-text-dark text-sub-text-light dark:lg:hover:bg-surface-2-dark lg:hover:bg-surface-2-light'
                                    }`}
                            >
                                {__('All')} ({notifications?.length || 0})
                            </button>
                            <button
                                onClick={() => setFilter('unread')}
                                className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${filter === 'unread'
                                    ? 'dark:bg-surface-3-dark bg-white dark:text-main-text-dark text-main-text-light shadow-sm'
                                    : 'dark:text-sub-text-dark text-sub-text-light dark:lg:hover:bg-surface-2-dark lg:hover:bg-surface-2-light'
                                    }`}
                            >
                                {__('Unread')} ({unreadCount})
                            </button>
                            <button
                                onClick={() => setFilter('read')}
                                className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${filter === 'read'
                                    ? 'dark:bg-surface-3-dark bg-white dark:text-main-text-dark text-main-text-light shadow-sm'
                                    : 'dark:text-sub-text-dark text-sub-text-light dark:lg:hover:bg-surface-2-dark lg:hover:bg-surface-2-light'
                                    }`}
                            >
                                {__('Read')} ({notifications?.filter(n => n.read_at).length || 0})
                            </button>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="mx-auto lg:max-w-6xl sm:max-w-3xl">
                        {filteredNotifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 bg-white border rounded-md dark:bg-surface-1-dark dark:border-surface-3-dark border-surface-3-light">
                                <div className="p-4 mb-4 rounded-full ">
                                    <BellIcon className="w-12 h-12 dark:text-main-text-dark text-main-text-light" />
                                </div>
                                <h3 className="mb-2 text-xl font-semibold dark:text-main-text-dark text-main-text-light">
                                    {__('No notifications')}
                                </h3>
                                <p className="max-w-md text-center dark:text-sub-text-dark text-sub-text-light">
                                    {filter === 'unread'
                                        ? __('You have no unread notifications at the moment')
                                        : filter === 'read'
                                            ? __('You have no read notifications')
                                            : __('You have no notifications yet. Check back later!')
                                    }
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                {/* Today */}
                                {groupedNotifications.today.length > 0 && (
                                    <NotificationGroup
                                        title={__('Today')}
                                        notifications={groupedNotifications.today}
                                        markAsRead={markAsRead}
                                        deleteNotification={deleteNotification}
                                        loadingStates={loadingStates}
                                        __={__}
                                    />
                                )}

                                {/* Yesterday */}
                                {groupedNotifications.yesterday.length > 0 && (
                                    <NotificationGroup
                                        title={__('Yesterday')}
                                        notifications={groupedNotifications.yesterday}
                                        markAsRead={markAsRead}
                                        deleteNotification={deleteNotification}
                                        loadingStates={loadingStates}
                                        __={__}
                                    />
                                )}

                                {/* This Week */}
                                {groupedNotifications.thisWeek.length > 0 && (
                                    <NotificationGroup
                                        title={__('This Week')}
                                        notifications={groupedNotifications.thisWeek}
                                        markAsRead={markAsRead}
                                        deleteNotification={deleteNotification}
                                        loadingStates={loadingStates}
                                        __={__}
                                    />
                                )}

                                {/* Older */}
                                {groupedNotifications.older.length > 0 && (
                                    <NotificationGroup
                                        title={__('Older')}
                                        notifications={groupedNotifications.older}
                                        markAsRead={markAsRead}
                                        deleteNotification={deleteNotification}
                                        loadingStates={loadingStates}
                                        __={__}
                                    />
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
const NotificationGroup = ({ title, notifications, width, markAsRead, deleteNotification, loadingStates, __ }) => {
    return (
        <div>
            <h2 className="mb-3 text-sm font-semibold tracking-wider uppercase dark:text-sub-text-dark text-sub-text-light">
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
};

// Notification Item Component
const NotificationItem = ({ notification, markAsRead, deleteNotification, loadingStates, __ }) => {
    const isUnread = !notification.read_at;
    const isMarkingAsRead = loadingStates.markAsRead[notification.id];
    const isDeleting = loadingStates.delete[notification.id];
    const hasActionUrl = notification.data?.action_url;

    // Format time ago
    const timeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        const intervals = {
            year: 31536000,
            month: 2592000,
            week: 604800,
            day: 86400,
            hour: 3600,
            minute: 60
        };

        for (const [unit, secondsInUnit] of Object.entries(intervals)) {
            const interval = Math.floor(seconds / secondsInUnit);
            if (interval >= 1) {
                return `${interval} ${__(unit, true)}${interval > 1 ? 's' : ''} ${__('ago', true)}`;
            }
        }
        return __('Just now', true);
    };

    const handleClick = () => {
        if (hasActionUrl && !isDeleting && !isMarkingAsRead) {
            router.visit(notification.data.action_url);
        }
    };

    return (
        <div
            onClick={handleClick}
            className={`group relative flex gap-4 p-4 rounded-md transition-all duration-200 ${hasActionUrl ? 'cursor-pointer' : 'cursor-default'}
                       border ${isUnread
                    ? 'dark:bg-surface-1-dark bg-white dark:border-surface-3-dark border-surface-3-light'
                    : 'dark:bg-surface-1-dark bg-white dark:border-surface-3-dark border-surface-3-light'
                }
                       dark:lg:hover:bg-surface-2-dark lg:hover:bg-surface-2-light

                       ${(isDeleting || isMarkingAsRead) ? 'opacity-60 pointer-events-none' : ''}`}
        >
            {/* Unread Indicator */}
            {isUnread && (
                <div className="absolute left-0 w-1 h-12 -translate-y-1/2 bg-blue-500 rounded-r-full top-1/2" />
            )}


            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-1">
                    <h3 className={`font-semibold ${isUnread
                        ? 'dark:text-main-text-dark text-main-text-light'
                        : 'dark:text-main-text-dark text-main-text-light'
                        }`}>
                        {notification.data?.title || __('Notification')}
                    </h3>

                    {/* Action Buttons */}
                    <div className={`flex items-center gap-1 transition-opacity duration-200'
                        }`}>
                        {isUnread && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    markAsRead(notification.id);
                                }}
                                disabled={isMarkingAsRead || isDeleting}
                                className="p-2 transition-colors duration-200 rounded-md dark:lg:hover:bg-surface-3-dark lg:hover:bg-white dark:text-main-text-dark text-main-text-light dark:lg:hover:text-green-400 lg:hover:text-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
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
                            className="p-2 transition-colors duration-200 rounded-md dark:lg:hover:bg-surface-3-dark lg:hover:bg-white dark:text-main-text-dark text-main-text-light dark:lg:hover:text-red-400 lg:hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            title={__('Delete')}
                        >
                            {isDeleting ? (
                                <Spinner size="sm" />
                            ) : (
                                <TrashIcon className="w-4 h-4" />
                            )}
                        </button>
                    </div>
                </div>

                <p className="mb-2 text-sm dark:text-main-text-dark text-main-text-light line-clamp-5">
                    {notification.data?.message || __('No message available')}
                </p>

                <div className="flex items-center gap-2 text-xs dark:text-main-text-dark text-main-text-light">
                    <ClockIcon className="w-3 h-3" />
                    <span>{timeAgo(notification.created_at)}</span>
                </div>
            </div>
        </div>
    );
};

export default index;
