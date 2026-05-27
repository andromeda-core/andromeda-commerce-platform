import { router, usePage } from '@inertiajs/react';
import React, { useRef, useState } from 'react';
import useWindowSize from '@/Hooks/useWindowSize';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import Toast from '@/Components/Toast';
import Spinner from '@/Components/Spinner';
import WebSelectInput from '@/Components/WebSelectInput';
import { useTranslation } from '@/Hooks/useTranslation';
import { ChevronLeft } from 'lucide-react';

const AUTO_ID = 'auto';

const CurrencySwitcher = ({ isOpen, close }) => {
    const { displayCurrency, availableCurrencies = [] } = usePage().props;

    // Determine the "current" value from Inertia shared props (single source of truth)
    const initialValue =
        displayCurrency?.is_fallback || !displayCurrency?.currency_id
            ? AUTO_ID
            : displayCurrency.currency_id;

    const [activeCurrencyIdState, setActiveCurrencyIdState] = useState(initialValue);
    const [currencyHasChanged, setCurrencyHasChanged] = useState(false);

    // Translation Hook
    const { __ } = useTranslation();

    const windowSize = useWindowSize();
    const isMobile = windowSize.width <= 1024;
    const [filterSaving, setFilterSaving] = useState(false);

    const [showInfoToast, setShowInfoToast] = useState(false);
    const [infoMessage, setInfoMessage] = useState('');

    const filterModalRef = useRef(isOpen);

    // Build items list: Auto-detect first, then all currencies
    const itemsForSelect = [
        { id: AUTO_ID, name: __('Auto-detect') },
        ...availableCurrencies.map((c) => ({
            id: c.id,
            name: c.country?.name
                ? `${c.symbol} ${c.name} (${c.country.name})`
                : `${c.symbol} ${c.name}`,
        })),
    ];

    useEffect(() => {
        if (isOpen) {
            window.history.replaceState({}, '', window.location.pathname);
            // Re-sync state when modal opens (in case displayCurrency changed since last open)
            setActiveCurrencyIdState(initialValue);
            setCurrencyHasChanged(false);
        }
    }, [isOpen]);

    useEffect(() => {
        filterModalRef.current = isOpen;
    }, [isOpen]);

    // Currency Saving Via Cookie Or Resetting To Auto
    const handleSaveFilters = () => {
        setFilterSaving(true);

        const onSuccess = () => {
            window.history.replaceState({}, '', window.location.pathname);
            setTimeout(() => {
                window.location.reload();
            }, 30);
        };

        const onError = () => {
            setFilterSaving(false);
            setInfoMessage(__('An error occurred while updating currency preference.'));
            setShowInfoToast(true);
        };

        if (activeCurrencyIdState === AUTO_ID) {
            router.post(route('website.currency.reset'), {}, { onSuccess, onError });
        } else {
            router.post(
                route('website.currency.switch'),
                { currency_id: activeCurrencyIdState },
                { onSuccess, onError },
            );
        }
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
            const isCurrencyRoute =
                url.includes('currency/switch') || url.includes('currency/reset');
            const isIntentionalNavigation = isIntentionalNavigationRef.current;

            // Allow intentional navigations
            if (isCurrencyRoute || isIntentionalNavigation) {
                isIntentionalNavigationRef.current = false;
                return;
            }
        };

        window.addEventListener('popstate', handlePopState);
        const removeRouterEvent = router.on('before', preventInertiaNavigation);

        //Expose flag setter for intentional navigation
        window.__allowNextCurrencyNavigation = () => {
            isIntentionalNavigationRef.current = true;
        };

        return () => {
            window.removeEventListener('popstate', handlePopState);
            if (removeRouterEvent) removeRouterEvent();
            delete window.__allowNextCurrencyNavigation;
        };
    }, []);

    if (!isOpen) return null;

    // Mobile Design
    if (isMobile) {
        return createPortal(
            <>
                <div className="fixed inset-0 z-[50] flex flex-col bg-backgroundLight dark:bg-backgroundDark">
                    {/* Mobile Header */}
                    <div className="relative z-10 flex w-full flex-col overflow-y-auto bg-backgroundLight text-main-text-light dark:bg-backgroundDark dark:text-main-text-dark">
                        <div className="flex items-center justify-center px-4 py-3">
                            <button
                                onClick={close}
                                className="absolute left-4 rounded-full p-1 text-main-text-light dark:text-main-text-dark"
                            >
                                <ChevronLeft />
                            </button>

                            <h2 className="mx-10 text-xl font-semibold tracking-tight text-main-text-light dark:text-main-text-dark">
                                {__('Currency')}
                            </h2>
                        </div>
                    </div>

                    {/* Mobile Content */}
                    <div className="flex-1 overflow-y-auto pb-32">
                        <div className="rounded-md">
                            <div className="px-8 py-6">
                                <div className="space-y-5">
                                    <WebSelectInput
                                        key={availableCurrencies.length}
                                        Id={'currency_code'}
                                        Name={'currency_code'}
                                        Value={activeCurrencyIdState}
                                        Required={false}
                                        Action={(value) => {
                                            setActiveCurrencyIdState(value);
                                            setCurrencyHasChanged(value !== initialValue);
                                        }}
                                        items={itemsForSelect}
                                        itemKey={'name'}
                                        Placeholder={__('Select Currency')}
                                        customPlaceHolder={true}
                                        optionWindowHeight="calc(100vh  - 300px)"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="h-24"></div>

                        {/* Apply Button */}
                        <div className="absolute bottom-12 left-0 right-0 my-6 bg-inherit px-9">
                            <button
                                disabled={
                                    filterSaving ||
                                    !currencyHasChanged ||
                                    activeCurrencyIdState === ''
                                }
                                onClick={() => handleSaveFilters()}
                                className={`w-full rounded-md bg-black px-4 py-3 text-base font-semibold text-white transition-colors hover:bg-black/80 disabled:bg-[#e1e1e1] dark:bg-white dark:text-black dark:hover:bg-white/80 ${filterSaving || !currencyHasChanged || activeCurrencyIdState === '' ? 'cursor-not-allowed dark:opacity-50' : ''}`}
                            >
                                <div className="flex items-center justify-center gap-3">
                                    {filterSaving && (
                                        <Spinner
                                            customSize={'size-4'}
                                            Color={'fill-black dark:fill-white'}
                                        />
                                    )}
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
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <div className="fixed inset-0 bg-black/30" onClick={close} />

                <div className="relative flex max-h-[70vh] min-h-[70vh] w-full max-w-md flex-col rounded-md border border-surface-1-light bg-backgroundLight dark:border-surface-3-dark dark:bg-surface-1-dark">
                    <div className="flex-1 pt-8">
                        <div className="px-8 pb-4 text-start">
                            <h1 className="text-xl font-semibold text-main-text-light dark:text-main-text-dark">
                                {__('Currency')}
                            </h1>
                        </div>

                        <div className="rounded-md">
                            <div className="px-8 py-6">
                                <div className="space-y-5">
                                    <WebSelectInput
                                        key={availableCurrencies.length}
                                        Id={'currency_code'}
                                        Name={'currency_code'}
                                        Value={activeCurrencyIdState}
                                        Required={false}
                                        Action={(value) => {
                                            setActiveCurrencyIdState(value);
                                            setCurrencyHasChanged(value !== initialValue);
                                        }}
                                        items={itemsForSelect}
                                        itemKey={'name'}
                                        Placeholder={__('Select Currency')}
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
                    <div className="absolute bottom-0 left-0 right-0 my-6 bg-inherit px-9">
                        <button
                            disabled={
                                filterSaving || !currencyHasChanged || activeCurrencyIdState === ''
                            }
                            onClick={() => handleSaveFilters()}
                            className={`w-full rounded-md bg-black px-4 py-3 text-base font-semibold text-white transition-colors hover:bg-black/80 disabled:bg-[#e1e1e1] dark:bg-white dark:text-black dark:hover:bg-white/80 ${filterSaving || !currencyHasChanged || activeCurrencyIdState === '' ? 'cursor-not-allowed dark:opacity-50' : ''}`}
                        >
                            <div className="flex items-center justify-center gap-3">
                                {filterSaving && (
                                    <Spinner
                                        customSize={'size-4'}
                                        Color={'fill-black dark:fill-white'}
                                    />
                                )}
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

export default CurrencySwitcher;
