import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

export default function ConfirmationModal({
    isOpen,
    onClose,
    title = "Are you sure?",
    message = "This action cannot be undone.",
    confirmText = "Yes",
    cancelText = "No",
    showConfirm = true,
    showCancel = true,
    variant = "danger",
    promiseResolve = null, // Added for promise support
}) {
    const handleConfirm = () => {
        if (promiseResolve) {
            promiseResolve(true);
        }
        onClose();
    };

    const handleCancel = () => {
        if (promiseResolve) {
            promiseResolve(false);
        }
        onClose();
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            handleCancel();
        }
    };

    // Variant configurations
    const variants = {
        danger: {
            icon: "bg-red-100 dark:bg-red-900/20",
            iconColor: "text-red-600 dark:text-red-400",
            confirmBtn: "bg-red-600 hover:bg-red-700 text-white",
            iconPath: "M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 7.793a1 1 0 0 1 0 1.414l-2.293 2.293 2.293 2.293a1 1 0 1 1-1.414 1.414L10 13.414l-2.293 2.293a1 1 0 0 1-1.414-1.414L8.586 12 6.293 9.707a1 1 0 0 1 1.414-1.414L10 10.586l2.293-2.293a1 1 0 0 1 1.414 0Z"
        },
        warning: {
            icon: "bg-yellow-100 dark:bg-yellow-900/20",
            iconColor: "text-yellow-600 dark:text-yellow-400",
            confirmBtn: "bg-yellow-600 hover:bg-yellow-700 text-white",
            iconPath: "M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM10 15a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm1-4a1 1 0 0 1-2 0V6a1 1 0 0 1 2 0v5Z"
        },
        info: {
            icon: "bg-blue-100 dark:bg-blue-900/20",
            iconColor: "text-blue-600 dark:text-blue-400",
            confirmBtn: "bg-blue-600 hover:bg-blue-700 text-white",
            iconPath: "M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"
        },
        success: {
            icon: "bg-green-100 dark:bg-green-900/20",
            iconColor: "text-green-600 dark:text-green-400",
            confirmBtn: "bg-green-600 hover:bg-green-700 text-white",
            iconPath: "M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z"
        }
    };

    const currentVariant = variants[variant] || variants.danger;

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/30 backdrop-blur-sm"
                onClick={handleBackdropClick}
            />

            {/* Modal */}
            <div className="relative z-10 w-full max-w-sm px-8 py-6 bg-white shadow-2xl animate-scale-in rounded-2xl dark:bg-deepcharcoal">
                <div className="flex flex-col items-center text-center">
                    {/* Icon */}
                    <div className={`mb-6 flex h-16 w-16 items-center justify-center rounded-full ${currentVariant.icon}`}>
                        <svg
                            className={`h-8 w-8 ${currentVariant.iconColor}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path d={currentVariant.iconPath} />
                        </svg>
                    </div>

                    {/* Title */}
                    <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                        {title}
                    </h3>

                    {/* Message */}
                    <p className="mb-6 text-sm text-gray-600 dark:text-gray-300">
                        {message}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex w-full gap-3">
                        {showCancel && (
                            <button
                                onClick={handleCancel}
                                className="flex-1 rounded-lg bg-gray-200 px-4 py-2.5 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                            >
                                {cancelText}
                            </button>
                        )}

                        {showConfirm && (
                            <button
                                onClick={handleConfirm}
                                className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${currentVariant.confirmBtn}`}
                            >
                                {confirmText}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>,
        document.getElementById('modal-root') || document.body,
    );
}
