import React, { useEffect, useState } from 'react';

export default function Toast({ flash }) {
    const [showSuccess, setShowSuccess] = useState(!!flash.success);
    const [showError, setShowError] = useState(!!flash.error);
    const [showInfo, setShowInfo] = useState(!!flash.info);

    useEffect(() => {
        setShowSuccess(false);
        setShowInfo(false);
        setShowError(false);
        if (flash.success) {
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 6000);
        }
        if (flash.error) {
            setShowError(true);
            setTimeout(() => setShowError(false), 6000);
        }

        if (flash.info) {
            setShowInfo(true);
            setTimeout(() => setShowInfo(false), 6000);
        }
    }, [flash]);

    return (
        <>
            <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 transform space-y-3">
                {/* Success Toast */}
                {showSuccess && (
                    <div
                        className="animate-slide-up flex max-w-xl items-center rounded-lg bg-green-400 p-4 text-green-800 shadow-sm transition-all duration-500 ease-out"
                        role="alert"
                    >
                        <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-green-600">
                            <svg
                                className="h-5 w-5"
                                aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
                            </svg>
                        </div>
                        <div className="text-md p-3 font-normal text-green-800">
                            {flash.success}
                        </div>
                        <button
                            onClick={() => setShowSuccess(false)}
                            className="-mx-1.5 -my-1.5 ms-auto inline-flex h-8 w-8 items-center justify-center rounded-lg p-1.5 text-green-800 hover:bg-green-300 focus:ring-2 focus:ring-gray-300"
                            aria-label="Close"
                        >
                            <svg
                                className="h-3 w-3"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 14 14"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                                />
                            </svg>
                        </button>
                    </div>
                )}

                {/* Error Toast */}
                {showError && (
                    <div
                        className="text-white-500 animate-slide-up flex w-full max-w-xl items-center rounded-lg bg-red-500 p-4 shadow-sm transition-all duration-500 ease-out"
                        role="alert"
                    >
                        <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-500">
                            <svg
                                className="h-5 w-5"
                                aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 11.793a1 1 0 1 1-1.414 1.414L10 11.414l-2.293 2.293a1 1 0 0 1-1.414-1.414L8.586 10 6.293 7.707a1 1 0 0 1 1.414-1.414L10 8.586l2.293-2.293a1 1 0 0 1 1.414 1.414L11.414 10l2.293 2.293Z" />
                            </svg>
                        </div>
                        <div className="text-md p-3 font-normal text-white">{flash.error}</div>
                        <button
                            onClick={() => setShowError(false)}
                            className="-mx-1.5 -my-1.5 ms-auto inline-flex h-8 w-8 items-center justify-center rounded-lg text-white hover:text-white/50 focus:ring-2"
                            aria-label="Close"
                        >
                            <svg
                                className="h-3 w-3"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 14 14"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                                />
                            </svg>
                        </button>
                    </div>
                )}

                {/* Info Toast */}
                {showInfo && (
                    <div
                        className="animate-slide-up flex w-full max-w-xl items-center rounded-lg bg-indigo-500 p-4 text-white shadow-sm transition-all duration-500 ease-out"
                        role="alert"
                    >
                        <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-500">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="h-6 w-6"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
                                />
                            </svg>
                        </div>
                        <div className="text-md p-3 font-normal">{flash.info}</div>
                        <button
                            onClick={() => setShowInfo(false)}
                            className="-mx-1.5 -my-1.5 ms-auto inline-flex h-8 w-8 items-center justify-center rounded-lg text-white hover:text-white/50 focus:ring-2"
                            aria-label="Close"
                        >
                            <svg
                                className="h-3 w-3"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 14 14"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                                />
                            </svg>
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}
