import React from 'react'
import { createPortal } from 'react-dom'

const ActivateNavigationPrompt = ({ setNeedsActivation }) => {
    return (
        createPortal(
            <div
                className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/30 backdrop-blur-sm cursor-pointer px-4"
                onClick={() => setNeedsActivation(false)}
            >
                {/* Main card */}
                <div
                    className="relative flex flex-col items-center w-full max-w-xs gap-4 p-6 bg-white border border-gray-200 shadow-xl select-none dark:bg-deepcharcoal dark:border-white/10 rounded-2xl animate-fade-scale"
                    onClick={() => setNeedsActivation(false)}
                >
                    {/* Top accent */}
                    <div className="absolute top-0 h-1 bg-indigo-600 left-1/4 right-1/4 rounded-t-2xl"></div>

                    {/* Tap icon */}
                    <div className="relative">
                        {/* Single pulse ring */}
                        <div className="absolute border-2 rounded-full -inset-2 border-indigo-600/20 animate-ping"></div>

                        {/* Icon container */}
                        <div className="relative flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-full shadow-lg shadow-indigo-600/20 animate-float">
                            <span className="text-3xl">👆</span>
                        </div>
                    </div>

                    {/* Text */}
                    <div className="space-y-1 text-center">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Tap to Continue
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-white/70">
                            Activate navigation to explore
                        </p>
                    </div>

                    {/* Status indicator */}
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-white/50">
                        <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-pulse"></span>
                        Ready
                    </div>
                </div>
            </div>,
            document.body
        )
    )
}

export default ActivateNavigationPrompt
