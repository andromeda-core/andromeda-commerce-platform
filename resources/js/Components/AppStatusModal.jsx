import { motion, AnimatePresence } from "framer-motion";

export default function AppStatusModal({ show, type, title, message, onConfirm }) {
    if (!show) return null;

    const colors = {
        info: "bg-indigo-600",
        success: "bg-green-600",
        error: "bg-red-600",
        warning: "bg-yellow-500",
    };


    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm"
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="p-5 rounded-md shadow-2xl bg-backgroundLight w-80 text-main-text-light dark:bg-surface-1-dark dark:text-main-text-dark"
                    >
                        <div className="flex flex-col items-center mb-4">
                            <div className={`h-12 w-12 rounded-full ${colors[type]} flex items-center justify-center text-white text-xl`}>
                                {type === "info" && "ℹ️"}
                                {type === "success" && <>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                    </svg>

                                </>}
                                {type === "error" && "⚠️"}
                                {type === "warning" && "⚡"}
                            </div>
                            <h2 className="mt-3 text-lg font-semibold text-center">{title}</h2>
                            <p className="mt-2 text-sm text-center text-sub-text-light dark:text-sub-text-dark opacity-80">{message}</p>
                        </div>

                        <div className="flex gap-3 mt-4">

                            {onConfirm && (
                                <button
                                    className="flex-1 py-2 text-sm rounded-md text-main-text-dark bg-main-text-light dark:bg-main-text-dark dark:text-main-text-light"
                                    onClick={onConfirm}
                                >
                                    OK
                                </button>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
