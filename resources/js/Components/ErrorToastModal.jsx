import { useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function ErrorToastModal({ showError, setShowError, message }) {
    useEffect(() => {
        if (showError) {
            const timer = setTimeout(() => {
                setShowError(false);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [showError, setShowError]);

    if (!showError) return null;

    return createPortal(
        <div className="fixed inset-0 z-[10002] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/30 backdrop-blur-sm"
                onClick={() => setShowError(false)}
            />

            {/* Modal */}
            <div className="relative z-10 w-full max-w-sm px-8 py-6 bg-white shadow-2xl animate-scale-in rounded-2xl dark:bg-deepcharcoal">
                <div className="flex flex-col items-center text-center">
                    {/* Error Icon */}
                    <div className="flex items-center justify-center w-16 h-16 mb-6 bg-red-100 rounded-full dark:bg-red-900/20">
                        <svg
                            className="w-8 h-8 text-red-600 dark:text-red-400"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 11.793a1 1 0 1 1-1.414 1.414L10 11.414l-2.293 2.293a1 1 0 0 1-1.414-1.414L8.586 10 6.293 7.707a1 1 0 0 1 1.414-1.414L10 8.586l2.293-2.293a1 1 0 0 1 1.414 1.414L11.414 10l2.293 2.293Z" />
                        </svg>
                    </div>

                    {/* Title */}
                    <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                        Error!
                    </h3>

                    {/* Message */}
                    <p className="text-sm text-gray-600 dark:text-gray-300">{message}</p>
                </div>
            </div>
        </div>,
        document.getElementById('modal-root') || document.body,
    );
}
