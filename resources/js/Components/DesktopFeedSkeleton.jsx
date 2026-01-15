const DesktopFeedSkeleton = () => {
    return (
        <div className="fixed inset-0 z-[100] bg-backgroundLight dark:bg-backgroundDark">
            <div className="h-full mt-10 overflow-hidden">
                <div className="relative mx-auto w-full max-w-[1300px] px-6 lg:px-[96px] xl:px-[120px]">

                    {/* Navigation arrows placeholders */}
                    <div className="absolute left-[clamp(8px,3vw,24px)] top-1/2 -translate-y-1/2">
                        <div className="w-12 h-12 rounded-full animate-pulse bg-surface-1-light dark:bg-surface-2-dark" />
                    </div>

                    <div className="absolute right-[clamp(8px,2vw,32px)] top-1/2 flex -translate-y-1/2 flex-col gap-6">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div
                                key={i}
                                className="w-12 h-12 rounded-full animate-pulse bg-surface-1-light dark:bg-surface-2-dark"
                            />
                        ))}
                    </div>

                    {/* Main content */}
                    <div className="mx-auto flex h-[90vh] w-full flex-col lg:w-[90%] xl:w-[75%]">

                        {/* Header */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-8 h-8 rounded-full animate-pulse bg-surface-1-light dark:bg-surface-2-dark" />
                            <div className="w-24 h-6 rounded-md animate-pulse bg-surface-1-light dark:bg-surface-2-dark" />
                        </div>

                        {/* Content body */}
                        <div className="flex-1 pr-2 space-y-4 overflow-y-auto">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="w-full h-4 rounded animate-pulse bg-surface-1-light dark:bg-surface-2-dark"
                                    style={{ width: `${90 - i * 3}%` }}
                                />
                            ))}

                            {/* Metadata pills */}
                            <div className="flex flex-wrap gap-3 pt-6">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="h-8 rounded-full w-28 animate-pulse bg-surface-1-light dark:bg-surface-2-dark"
                                    />
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default DesktopFeedSkeleton;
