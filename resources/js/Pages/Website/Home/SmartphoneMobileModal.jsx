import React, { useRef, useEffect, useState, useLayoutEffect } from 'react';
import { router } from '@inertiajs/react';
import QRCode from 'react-qr-code';
import { createPortal } from 'react-dom';
import LinkCopiedModal from '@/Components/LinkCopiedModal';
import gsap from 'gsap';
import SmartphoneMobileGalleryModal from './SmartphoneMobileGalleryModal';

const SmartphoneMobileModal = ({
    smartphones,
    smartphoneMobileModalOpen,
    setSmartphoneMobileModalOpen,
    smartphone,
    setSmartphone,
    selectedSmartphoneIndex,
    setSelectedSmartphoneIndex,
    hasMoreSmartphones,
    fetchMorePostsAndProducts,
    smartphoneMobileGallery,
    setSmartphoneMobileGallery,
}) => {
    useEffect(() => {
        if (!smartphoneMobileModalOpen) return;

        const url = new URL(window.location);
        if (!url.searchParams.get('m-slug') && smartphone?.slug && smartphoneMobileModalOpen) {
            console.log('PUSHING URLSTATE');
            url.searchParams.set('m-slug', smartphone.slug);
            window.history.pushState({ modal: 'smartphone-viewer' }, '', url.toString());
        }

        return () => {
            hasInitializedScroll.current = false;
        };
    }, [smartphoneMobileModalOpen, smartphone?.slug]);

    const [localSmartphones, setLocalSmartphones] = useState(smartphones || []);

    const hasInitializedScroll = useRef(false);
    useEffect(() => {
        setLocalSmartphones(smartphones);
    }, [smartphones]);

    const scrollContainerRef = useRef(null);
    const [actionDropdownOpen, setActionDropdownOpen] = useState(null);
    const actionDropdownRef = useRef(null);
    const [showQrCode, setShowQrCode] = useState(false);
    const [linkCopied, setLinkCopied] = useState(false);

    // Scroll to the currently selected smartphone when modal opens or index changes
    useEffect(() => {
        if (!smartphoneMobileModalOpen) return;
        const container = scrollContainerRef.current;
        if (!container || selectedSmartphoneIndex < 0) return;

        const alignToIndex = () => {
            const itemHeight = container.firstElementChild?.offsetHeight || window.innerHeight;
            const targetScroll = selectedSmartphoneIndex * itemHeight;
            gsap.set(container, { scrollTop: targetScroll });

            requestAnimationFrame(() => {
                setTimeout(() => {
                    hasInitializedScroll.current = true;
                }, 100);
            });
        };

        // Run after next frame
        requestAnimationFrame(() => {
            setTimeout(alignToIndex, 0);
        });
    }, [smartphoneMobileModalOpen]);

    // Handle snap scrolling with eager upward correction Without Inifnity Loop
    // useEffect(() => {
    //     const container = scrollContainerRef.current;
    //     if (!container || !smartphoneMobileModal) return;

    //     let lastSlug = smartphone?.slug;
    //     let lastIndex = selectedSmartphoneIndex;
    //     let scrollTimeout;

    //     const handleScroll = () => {
    //         if (!smartphoneMobileModal) return;
    //         if (scrollTimeout) clearTimeout(scrollTimeout);

    //         scrollTimeout = setTimeout(() => {
    //             const scrollTop = container.scrollTop;
    //             const itemHeight = container.firstElementChild?.offsetHeight || window.innerHeight;
    //             const newIndex = Math.round(scrollTop / itemHeight);

    //             if (newIndex < 0 || newIndex >= smartphones.length) return;

    //             const newSmartphone = smartphones[newIndex];

    //             // prevent re-update only if both index AND slug match
    //             if (newSmartphone?.slug === lastSlug && newIndex === lastIndex) return;

    //             // update both trackers
    //             lastSlug = newSmartphone?.slug;
    //             lastIndex = newIndex;

    //             // update URL
    //             const url = new URL(window.location);
    //             url.searchParams.set('m-slug', newSmartphone.slug);
    //             window.history.replaceState({ modal: 'smartphone-viewer' }, '', url.toString());

    //             // update parent state safely
    //             setSelectedSmartphoneIndex(newIndex);
    //             // clone to force React to detect change even if same ref
    //             setSmartphone({ ...newSmartphone });

    //             // preload if near end
    //             if (hasMoreSmartphones && newIndex >= smartphones.length - 4) {
    //                 fetchMorePostsAndProducts();
    //             }
    //         }, 120);
    //     };

    //     container.addEventListener('scroll', handleScroll, { passive: true });

    //     return () => {
    //         container.removeEventListener('scroll', handleScroll);
    //         if (scrollTimeout) clearTimeout(scrollTimeout);
    //     };
    // }, [smartphones, smartphoneMobileModal]);

    //  refs for tracking
    const lastUpdateRef = useRef({ slug: null, index: null });
    const lastScrollTopRef = useRef(0);
    const scrollIdleTimeoutRef = useRef(null);

    const hasUserScrolledRef = useRef(false);

    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container || localSmartphones.length === 0 || !smartphoneMobileModalOpen) return;

        const itemHeight = container.firstElementChild?.offsetHeight || window.innerHeight;
        let isLocked = false;
        let lockTimeout = null;
        let isProcessingLoop = false;

        const lockScroll = (duration = 1000) => {
            isLocked = true;
            clearTimeout(lockTimeout);
            lockTimeout = setTimeout(() => (isLocked = false), duration);
        };

        const updateNormalScrolling = () => {
            const scrollTop = container.scrollTop;
            const newIndex = Math.round(scrollTop / itemHeight);
            if (newIndex < 0 || newIndex >= localSmartphones.length) return;

            const newSmartphone = localSmartphones[newIndex];
            if (!newSmartphone) return;

            if (
                newSmartphone.slug === lastUpdateRef.current.slug &&
                newIndex === lastUpdateRef.current.index
            )
                return;

            lastUpdateRef.current = { slug: newSmartphone.slug, index: newIndex };

            const url = new URL(window.location);
            url.searchParams.set('m-slug', newSmartphone.slug);
            window.history.replaceState({ modal: 'smartphone-viewer' }, '', url.toString());

            const globalIndex = smartphones.findIndex((s) => s.id === newSmartphone.id);
            setSelectedSmartphoneIndex(globalIndex >= 0 ? globalIndex : newIndex);
            setSmartphone({ ...newSmartphone });

            if (hasMoreSmartphones && newIndex >= localSmartphones.length - 4) {
                fetchMorePostsAndProducts();
            }
        };

        // 🔥 UNIFIED SEAMLESS LOOP with fade for top
        const seamlessLoop = (direction) => {
            if (isProcessingLoop) return;

            isProcessingLoop = true;
            lockScroll(1000);

            // Calculate which item user is viewing BEFORE any changes
            const currentScrollTop = container.scrollTop;
            const currentViewIndex = Math.round(currentScrollTop / itemHeight);
            const viewingItem = localSmartphones[currentViewIndex];

            //  For top loop only: quick fade to hide transition
            // if (direction === 'top') {
            //     container.style.transition = 'opacity 0.06s ease-out';
            //     container.style.opacity = '0';
            // }

            setTimeout(
                () => {
                    // Reorder array
                    setLocalSmartphones((prev) => {
                        const arr = [...prev];

                        if (direction === 'top') {
                            const last = arr.pop();
                            arr.unshift(last);
                        } else {
                            const first = arr.shift();
                            arr.push(first);
                        }

                        requestAnimationFrame(() => {
                            const newItemIndex = arr.findIndex((s) => s.id === viewingItem.id);
                            const targetScroll = newItemIndex * itemHeight;

                            container.scrollTop = targetScroll;
                            lastScrollTopRef.current = targetScroll;

                            const globalIndex = smartphones.findIndex(
                                (s) => s.id === viewingItem.id,
                            );
                            setSmartphone({ ...viewingItem });
                            setSelectedSmartphoneIndex(
                                globalIndex >= 0 ? globalIndex : newItemIndex,
                            );

                            const url = new URL(window.location);
                            url.searchParams.set('m-slug', viewingItem.slug);
                            window.history.replaceState(
                                { modal: 'smartphone-viewer' },
                                '',
                                url.toString(),
                            );

                            // console.log(
                            //     `${direction.toUpperCase()} LOOP:`,
                            //     viewingItem.name,
                            //     'at index',
                            //     newItemIndex,
                            // );

                            // 🔥 Fade back in for top loop
                            if (direction === 'top') {
                                setTimeout(() => {
                                    container.style.opacity = '1';
                                }, 10);
                            }

                            // Release lock
                            setTimeout(
                                () => {
                                    isProcessingLoop = false;
                                },
                                direction === 'top' ? 100 : 50,
                            );
                        });

                        return arr;
                    });

                    if (direction === 'bottom' && hasMoreSmartphones) {
                        fetchMorePostsAndProducts();
                    }
                },
                direction === 'top' ? 60 : 0,
            ); // 60ms delay for top fade
        };

        const loopTick = () => {
            if (!hasInitializedScroll.current || isLocked || isProcessingLoop) return;

            const scrollTop = container.scrollTop;
            const scrollHeight = container.scrollHeight;
            const clientHeight = container.clientHeight;
            const currentIndex = Math.round(scrollTop / itemHeight);

            // 🔥 Mark user interaction
            if (scrollTop > 5) {
                hasUserScrolledRef.current = true;
            }

            // 🔥 Allow loop if at edge and trying to scroll
            const isAtFirstItem = currentIndex === 0 && scrollTop <= 2;
            const isAtLastItem = currentIndex === localSmartphones.length - 1;
            const isAtBottomEdge = scrollTop + clientHeight >= scrollHeight - 2;

            const shouldEnableLoop =
                hasUserScrolledRef.current || isAtFirstItem || (isAtLastItem && isAtBottomEdge);

            if (!shouldEnableLoop) return;

            //  TOP LOOP
            if (scrollTop <= 2) {
                seamlessLoop('top');
                return;
            }

            // BOTTOM LOOP
            if (scrollTop + clientHeight >= scrollHeight - 2) {
                seamlessLoop('bottom');
                return;
            }

            //  NORMAL SCROLL
            if (scrollTop !== lastScrollTopRef.current) {
                lastScrollTopRef.current = scrollTop;
                clearTimeout(scrollIdleTimeoutRef.current);
                scrollIdleTimeoutRef.current = setTimeout(() => {
                    if (!isLocked) updateNormalScrolling();
                }, 100);
            }
        };

        gsap.ticker.add(loopTick);

        return () => {
            gsap.ticker.remove(loopTick);
            clearTimeout(lockTimeout);
            clearTimeout(scrollIdleTimeoutRef.current);
        };
    }, [
        localSmartphones,
        smartphoneMobileModalOpen,
        hasMoreSmartphones,
        smartphones,
        selectedSmartphoneIndex,
    ]);

    // Reset on modal open
    useEffect(() => {
        if (smartphoneMobileModalOpen) {
            hasUserScrolledRef.current = false;
        }
    }, [smartphoneMobileModalOpen]);

    //  Reset scroll flag when modal opens
    useEffect(() => {
        if (smartphoneMobileModalOpen) {
            hasUserScrolledRef.current = false;
        }
    }, [smartphoneMobileModalOpen]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (actionDropdownRef.current && !actionDropdownRef.current.contains(event.target)) {
                setActionDropdownOpen(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const navigateToHashtag = async (hashtag) => {
        const tag = encodeURIComponent(hashtag);
        try {
            router.visit(route('website.posts.hashtag.index', tag), {
                replace: true,
                preserveState: true,
                preserveScroll: true,
            });
        } catch (error) {
            console.error('Hashtag navigation failed:', error);
        }
    };

    if (!smartphoneMobileModalOpen) return null;
    return (
        <>
            {/* No fade-in, no isReady - just render like Desktop */}
            {createPortal(
                <div className="fixed inset-0 z-50 bg-white dark:bg-deepcharcoal">
                    <div
                        ref={scrollContainerRef}
                        style={{
                            height: '100%',
                            overflowY: 'scroll',
                            scrollSnapType: 'y mandatory',
                            overscrollBehavior: 'contain',
                            WebkitOverflowScrolling: 'touch',
                            willChange: 'scroll-position, opacity',
                            transform: 'translateZ(0)',
                            transition: 'opacity 0.08s ease-out',
                        }}
                    >
                        {localSmartphones.map((item, index) => (
                            <div
                                key={item.id}
                                className="relative flex h-screen w-full snap-start flex-col"
                                style={{
                                    height: '100%',
                                    scrollSnapAlign: 'start',
                                    scrollSnapStop: 'always',
                                }}
                            >
                                {/* Header: Tag + Three Dots */}
                                <div className="flex shrink-0 items-center justify-between px-4 pb-2 pt-3">
                                    {item?.tag && (
                                        <button
                                            onClick={() => navigateToHashtag(item.tag)}
                                            className="text-sm font-semibold text-gray-900 dark:text-white"
                                        >
                                            {item.tag}
                                        </button>
                                    )}

                                    <div
                                        className="relative"
                                        ref={
                                            actionDropdownOpen === index ? actionDropdownRef : null
                                        }
                                    >
                                        <button
                                            onClick={() =>
                                                setActionDropdownOpen(
                                                    actionDropdownOpen === index ? null : index,
                                                )
                                            }
                                            className="text-gray-900 dark:text-white"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth={1.5}
                                                stroke="currentColor"
                                                className="h-5 w-5"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                                                />
                                            </svg>
                                        </button>

                                        {actionDropdownOpen === index && (
                                            <div className="absolute right-0 top-8 z-20 w-48 rounded-lg border border-gray-200 bg-white shadow-lg dark:border-white/10 dark:bg-deepcharcoal">
                                                <div className="py-1">
                                                    <button
                                                        onClick={() => {
                                                            setShowQrCode(true);
                                                            setActionDropdownOpen(null);
                                                        }}
                                                        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-zinc-800"
                                                    >
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            strokeWidth={1.5}
                                                            stroke="currentColor"
                                                            className="h-5 w-5"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z"
                                                            />
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                d="M6.75 6.75h.75v.75h-.75v-.75ZM6.75 16.5h.75v.75h-.75v-.75ZM16.5 6.75h.75v.75h-.75v-.75ZM13.5 13.5h.75v.75h-.75v-.75ZM13.5 19.5h.75v.75h-.75v-.75ZM19.5 13.5h.75v.75h-.75v-.75ZM19.5 19.5h.75v.75h-.75v-.75ZM16.5 16.5h.75v.75h-.75v-.75Z"
                                                            />
                                                        </svg>
                                                        <span>QR Code</span>
                                                    </button>

                                                    <button
                                                        onClick={() => {
                                                            const url =
                                                                route('home') +
                                                                '?m-slug=' +
                                                                item.slug;
                                                            navigator.clipboard.writeText(
                                                                url.trim(),
                                                            );
                                                            setLinkCopied(true);
                                                            setActionDropdownOpen(null);
                                                        }}
                                                        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-zinc-800"
                                                    >
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            strokeWidth={1.5}
                                                            stroke="currentColor"
                                                            className="h-5 w-5"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0 1 18 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3 1.5 1.5 3-3.75"
                                                            />
                                                        </svg>
                                                        <span>Copy Link</span>
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Image - Takes remaining space */}
                                <div className="relative flex-1 overflow-hidden">
                                    {item?.images?.length > 0 && (
                                        <div className="flex h-full w-full items-center justify-center p-4">
                                            <img
                                                key={item.id}
                                                src={item.images[0]}
                                                alt={item.name}
                                                className="max-h-full max-w-full rounded-lg object-contain"
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Bottom: Name + Shop Now Button */}
                                <div
                                    className="shrink-0 bg-white px-4 pt-3 dark:bg-deepcharcoal"
                                    style={{
                                        // paddingBottom:
                                        //     'calc(var(--bottom-bar-height, 60px) + 16px)',

                                        paddingBottom: '6rem',
                                    }}
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <p className="flex-1 text-sm leading-relaxed text-gray-900 dark:text-white/80">
                                            {item?.content && item.content.length > 30 ? (
                                                <span
                                                    dangerouslySetInnerHTML={{
                                                        __html:
                                                            item.content.substring(0, 30) + '...',
                                                    }}
                                                />
                                            ) : (
                                                <span
                                                    dangerouslySetInnerHTML={{
                                                        __html: item?.content,
                                                    }}
                                                />
                                            )}
                                        </p>

                                        <button
                                            onClick={() => {
                                                setSmartphoneMobileGallery(true);
                                                window.history.pushState(
                                                    {
                                                        modal: 'smartphone-gallery',
                                                    },
                                                    '',
                                                );
                                            }}
                                            className="h-[30px] w-[130px] shrink-0 rounded-lg bg-black px-6 text-xs font-semibold text-white transition-colors hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-100"
                                        >
                                            Shop Now
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>,
                document.getElementById('modal-root') || document.body,
            )}

            {/* QR Code Modal - Same as Desktop */}

            {showQrCode &&
                createPortal(
                    <div className="fixed inset-0 z-[100] flex items-center justify-center">
                        {/* Overlay */}
                        <div
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
                            onClick={() => setShowQrCode(false)}
                        ></div>

                        {/* Modal */}
                        <div
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="qrCodeTitle"
                            className={`relative z-[101] w-full max-w-sm rounded-2xl bg-white/50 p-6 text-gray-900 shadow-xl sm:max-w-md`}
                        >
                            <div className="flex justify-end">
                                <button onClick={() => setShowQrCode(false)}>✕</button>
                            </div>
                            <div className="text-center">
                                <h2 id="qrCodeTitle" className="mb-3 text-base font-semibold">
                                    Scan QR Code
                                </h2>
                                <div className="flex justify-center">
                                    <QRCode
                                        className="size-48 sm:size-52 md:size-60"
                                        value={route('home') + '/?m-slug=' + smartphone?.slug}
                                        viewBox="0 0 256 256"
                                        level="H"
                                        includemargin="true"
                                        bgColor="#ffffff"
                                        fgColor="#000000"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>,
                    document.body,
                )}

            {/* Link Copied Modal */}
            {linkCopied && (
                <LinkCopiedModal linkCopied={linkCopied} setLinkCopied={setLinkCopied} />
            )}

            {/* Smartphone Gallery */}
            {smartphoneMobileGallery && <SmartphoneMobileGalleryModal smartphone={smartphone} />}
        </>
    );
};

export default SmartphoneMobileModal;
