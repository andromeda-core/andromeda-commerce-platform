import { useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function InfoToastModal({ showInfo, setShowInfo, message }) {
    useEffect(() => {
        if (showInfo) {
            const timer = setTimeout(() => {
                setShowInfo(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [showInfo, setShowInfo]);

    if (!showInfo) return null;

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/30 backdrop-blur-sm"
                onClick={() => setShowInfo(false)}
            />

            {/* Modal */}
            <div className="relative z-10 w-full max-w-sm animate-scale-in rounded-2xl bg-white px-8 py-6 shadow-2xl dark:bg-deepcharcoal">
                <div className="flex flex-col items-center text-center">
                    {/* Info Icon */}
                    <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
                        <svg
                            className="h-8 w-8 text-blue-600 dark:text-blue-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    </div>

                    {/* Title */}
                    <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                        Information
                    </h3>

                    {/* Message */}
                    <p className="text-sm text-gray-600 dark:text-gray-300">{message}</p>
                </div>
            </div>
        </div>,
        document.getElementById('modal-root') || document.body,
    );
}
