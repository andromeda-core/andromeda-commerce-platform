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
    variant = "danger", // Not using Now
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



    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[10002] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/30 backdrop-blur-sm"
                onClick={handleBackdropClick}
            />

            {/* Modal */}
            <div className="relative z-10 w-full max-w-md px-8 py-6 rounded-md bg-backgroundLight animate-scale-in dark:bg-surface-1-dark">
                <div className="flex flex-col items-center text-center">


                    {/* Title */}
                    <h3 className="mb-2 text-xl font-semibold text-main-text-light dark:text-main-text-dark">
                        {title}
                    </h3>

                    {/* Message */}
                    <p className="mb-6 text-sm text-sub-text-light dark:text-sub-text-dark">
                        {message}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex w-full gap-3">
                        {showCancel && (
                            <button
                                onClick={handleCancel}
                                className="flex-1 px-4 py-2.5 text-sm font-medium  rounded-md bg-surface-2-light  text-main-text-light transition-all hover:bg-surface-3-light dark:hover:bg-surface-3-dark/80 dark:text-sub-text-dark dark:bg-surface-3-dark"
                            >
                                {cancelText}
                            </button>
                        )}

                        {showConfirm && (
                            <button
                                onClick={handleConfirm}
                                className={`flex-1 rounded-md px-4 py-2.5 text-sm font-medium transition-colors bg-main-text-light  text-main-text-dark  hover:bg-main-text-light/80 dark:bg-main-text-dark dark:text-main-text-light  dark:hover:bg-main-text-dark/80`}
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
