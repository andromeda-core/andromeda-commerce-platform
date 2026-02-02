import { router } from '@inertiajs/react';
import React, { useRef, useState } from 'react';
import useWindowSize from '@/Hooks/useWindowSize';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import Toast from '@/Components/Toast';
import Spinner from '@/Components/Spinner';
import WebSelectInput from '@/Components/WebSelectInput';
import { useLanguageStore } from '@/Hooks/useLanguageStore';
import { useTranslation } from '@/Hooks/useTranslation';

const GlobalLanguageFilter = ({ isOpen, close, languages, loading, previousUrlRef }) => {

    const activeLanguageId = useLanguageStore((state) => state.activeLanguageId);
    const [activeLanguageIdState, setActiveLanguageIdState] = useState(activeLanguageId);
    const [languageHasChanged, setLanguageHasChanged] = useState(false);



    // Translation Hook
    const { __ } = useTranslation();

    const windowSize = useWindowSize();
    const isMobile = windowSize.width <= 1024;
    const [filterSaving, setFilterSaving] = useState(false);

    const [showInfoToast, setShowInfoToast] = useState(false);
    const [infoMessage, setInfoMessage] = useState('');


    const filterModalRef = useRef(isOpen);


    useEffect(() => {
        if (isOpen) {
            window.history.replaceState({}, '', window.location.pathname);
        }
    }, [isOpen]);


    // Syncing With Zustand Language ID
    useEffect(() => {
        setActiveLanguageIdState(activeLanguageId);
    }, [activeLanguageId]);

    useEffect(() => {
        filterModalRef.current = isOpen;
    }, [isOpen]);


    // Filters Saving In Cookie Or Updating Existing
    const handleSaveFilters = () => {
        setFilterSaving(true);
        router.post(route('website.languages.set-language'), {
            language_id: activeLanguageIdState,
            language_locale: languages.find(lang => lang.id === activeLanguageIdState)?.code || 'en',

        }, {
            onSuccess: () => {
                window.history.replaceState({}, '', window.location.pathname);
                setTimeout(() => {
                    window.location.reload();
                }, 30);
            },
            onError: () => {
                setFilterSaving(false);
                setInfoMessage(__('An error occurred while updating language preference.'));
                setShowInfoToast(true);
            }
        });
    };



    const ToastModal = () => {
        return (
            showInfoToast && (
                <Toast
                    flash={{ info: infoMessage }}
                    onClosed={(type) => {
                        if (type === 'info') {
                            setInfoMessage(null);
                            setShowInfoToast(false);
                        }
                    }}
                />
            )
        );
    };




    // POP STATE HANDLING
    useEffect(() => {
        // Flag for intentional navigation
        const isIntentionalNavigationRef = { current: false };

        const handlePopState = (e) => {
            const currentUrl = new URL(window.location.href);
            const modalParam = currentUrl.searchParams.get('modal');
            if (!modalParam && filterModalRef.current) {
                close();
            }
        };

        const preventInertiaNavigation = (event) => {
            const url = event.detail?.visit?.url?.href || '';
            // Allow specific routes (intentional navigation)
            const isGlobalFiltersRoute = url.includes('languages-get');
            const isIntentionalNavigation = isIntentionalNavigationRef.current;

            // Allow intentional navigations
            if (isGlobalFiltersRoute || isIntentionalNavigation) {
                isIntentionalNavigationRef.current = false;
                return;
            }

        };

        window.addEventListener('popstate', handlePopState);
        const removeRouterEvent = router.on('before', preventInertiaNavigation);

        //Expose flag setter for intentional navigation
        window.__allowNextFilterNavigation = () => {
            isIntentionalNavigationRef.current = true;
        };

        return () => {
            window.removeEventListener('popstate', handlePopState);
            if (removeRouterEvent) removeRouterEvent();
            delete window.__allowNextFilterNavigation;
        };
    }, []);




    if (!isOpen) return null;

    // Mobile Design
    if (isMobile) {
        return createPortal(
            <>

                <div className="fixed inset-0 z-[50] flex flex-col bg-backgroundLight dark:bg-backgroundDark">
                    {/* Mobile Header */}
                    <div className="relative z-10 flex flex-col w-full overflow-y-auto text-main-text-light bg-backgroundLight dark:bg-backgroundDark dark:text-main-text-dark ">
                        <div className="flex items-center justify-center px-4 py-3 ">
                            <button
                                onClick={close}
                                className="absolute p-1 rounded-full text-main-text-light left-4 dark:text-main-text-dark "
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="size-6"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
                                    />
                                </svg>
                            </button>

                            <h2 className="mx-10 text-xl font-semibold tracking-tight text-main-text-light dark:text-main-text-dark">
                                {__('Language')}
                            </h2>
                        </div>
                    </div>

                    {/* Mobile Content */}
                    <div className="flex-1 pb-32 overflow-y-auto">


                        <div className="rounded-md">
                            <div className="px-8 py-6">
                                <div className="space-y-5">
                                    <WebSelectInput
                                        key={languages}
                                        Id={'language_code'}
                                        Name={'language_code'}
                                        Value={activeLanguageIdState}
                                        Required={false}
                                        Action={(value) => {
                                            setActiveLanguageIdState(value);
                                            setLanguageHasChanged(value !== activeLanguageId);
                                        }}
                                        items={languages}
                                        itemKey={'name'}
                                        Placeholder={loading ? __('Loading Languages') : __('Select Language')}
                                        customPlaceHolder={true}
                                        optionWindowHeight="calc(100vh  - 300px)"

                                    />
                                </div>
                            </div>
                        </div>

                        <div className="h-24"></div>


                        {/* Apply Button */}
                        <div className="absolute left-0 right-0 my-6 bottom-12 px-9 bg-inherit">
                            <button
                                disabled={filterSaving || !languageHasChanged || activeLanguageIdState === ''}
                                onClick={() => handleSaveFilters()}
                                className={`w-full px-4 py-3 text-base font-semibold text-white transition-colors disabled:bg-[#e1e1e1]  bg-black rounded-md dark:text-black dark:bg-white dark:hover:bg-white/80 hover:bg-black/80 ${(filterSaving || !languageHasChanged || activeLanguageIdState === '') ? 'dark:opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <div className="flex items-center justify-center gap-3">
                                    {filterSaving && <Spinner customSize={'size-4'} Color={"fill-black dark:fill-white"} />}
                                    <span>{__('Apply')}</span>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>


                <ToastModal />
            </>,
            document.getElementById('modal-root') || document.body,
        );
    }

    // Desktop Design
    return createPortal(
        <>

            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 ">
                <div
                    className="fixed inset-0 bg-black/30 backdrop-blur-sm"
                    onClick={close}
                />

                <div className="relative w-full max-w-md border rounded-md min-h-[70vh] max-h-[70vh] border-surface-1-light bg-backgroundLight dark:bg-surface-1-dark dark:border-surface-3-dark flex flex-col">

                    <div className="flex-1 pt-8">
                        <div className="px-8 pb-4 text-start">
                            <h1 className="text-xl font-semibold text-main-text-light dark:text-main-text-dark">
                                {__('Language')}
                            </h1>
                        </div>

                        <div className="rounded-md">
                            <div className="px-8 py-6">
                                <div className="space-y-5">
                                    <WebSelectInput
                                        key={languages}
                                        Id={'language_code'}
                                        Name={'language_code'}
                                        Value={activeLanguageIdState}
                                        Required={false}
                                        Action={(value) => {
                                            setActiveLanguageIdState(value);
                                            setLanguageHasChanged(value !== activeLanguageId);
                                        }}
                                        items={languages}
                                        itemKey={'name'}
                                        Placeholder={loading ? __('Loading Languages') : __('Select Language')}
                                        customPlaceHolder={true}
                                        optionWindowHeight="calc(75vh - 300px)"

                                    />
                                </div>
                            </div>
                        </div>

                        {/* Space to prevent apply button overlapping the dropdown */}
                        <div className="h-24"></div>
                    </div>

                    {/* Apply Button */}
                    <div className="absolute bottom-0 left-0 right-0 my-6 px-9 bg-inherit">
                        <button
                            disabled={filterSaving || !languageHasChanged || activeLanguageIdState === ''}
                            onClick={() => handleSaveFilters()}
                            className={`w-full px-4 py-3 text-base font-semibold text-white transition-colors disabled:bg-[#e1e1e1]  bg-black rounded-md dark:text-black dark:bg-white dark:hover:bg-white/80 hover:bg-black/80 ${(filterSaving || !languageHasChanged || activeLanguageIdState === '') ? 'dark:opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <div className="flex items-center justify-center gap-3">
                                {filterSaving && <Spinner customSize={'size-4'} Color={"fill-black dark:fill-white"} />}
                                <span>{__('Apply')}</span>
                            </div>
                        </button>
                    </div>
                </div>
            </div>


            <ToastModal />
        </>,
        document.getElementById('modal-root') || document.body,
    );
};

export default GlobalLanguageFilter;
