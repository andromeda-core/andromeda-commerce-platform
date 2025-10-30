import { useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function SuccessToastModal({ showSuccess, setShowSuccess, message }) {
    useEffect(() => {
        if (showSuccess) {
            const timer = setTimeout(() => {
                setShowSuccess(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [showSuccess, setShowSuccess]);

    if (!showSuccess) return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/30 backdrop-blur-sm"
                onClick={() => setShowSuccess(false)}
            />

            {/* Modal */}
            <div className="relative z-10 w-full max-w-sm animate-scale-in rounded-2xl bg-white px-8 py-6 shadow-2xl dark:bg-deepcharcoal">
                <div className="flex flex-col items-center text-center">
                    {/* Success Icon */}
                    <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                        <svg
                            className="h-8 w-8 text-green-600 dark:text-green-400"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
                        </svg>
                    </div>

                    {/* Title */}
                    <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                        Success!
                    </h3>

                    {/* Message */}
                    <p className="text-sm text-gray-600 dark:text-gray-300">{message}</p>
                </div>
            </div>
        </div>,
        document.body,
    );
}
