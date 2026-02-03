import React, { memo, useEffect, useRef } from 'react';
import MobileFeedGallery from './MobileFeedGallery';
import useDarkMode from '@/Hooks/useDarkMode';

const MobileFeedSinglePage = ({
    feedGallery,
    setShowQrCode,
    setLinkCopied,
    auth,
    generateURL,
    navigateToHashtag,
    MobileFeedGalleryOpen,
    setMobileFeedGalleryOpen,
    currency,
    placeholderImage,
    showErrorMessage,
    showInfoMessage,
    ErrorMessage,
    InfoMessage,
    setInfoMessage,
    setShowInfoMessage,
    setErrorMessage,
    setShowErrorMessage,
    setFeedGallery,
    setFeedOpen,
    setMediaItems,
    setFeedIndex,
    isSinglePageRef,
    generateSmartphoneURL,
    setBookmarkStatusChanged,
    setSpatiotemporalInfoModal,
    spatiotemporalInfoModal,
    __,
}) => {
    useEffect(() => {
        const url = new URL(window.location);
        window.history.pushState({}, '', url.toString());
        setMobileFeedGalleryOpen(true);
    }, []);


    const shouldCleanupBrowserHistoryRef = useRef(true);
    const isDarkMode = useDarkMode();


    useEffect(() => {
        if (!MobileFeedGalleryOpen) {
            if (shouldCleanupBrowserHistoryRef.current) {
                window.history.replaceState({}, '', window.location.pathname);
            }

            setFeedGallery(null);
            setMediaItems([]);
            setFeedOpen(false);
            setFeedIndex(0);
            isSinglePageRef.current = false;
        }
    }, [MobileFeedGalleryOpen])


    return (
        <>
            {MobileFeedGalleryOpen && (
                <MobileFeedGallery
                    feedGallery={feedGallery}
                    setShowQrCode={setShowQrCode}
                    setLinkCopied={setLinkCopied}
                    auth={auth}
                    currency={currency}
                    navigateToHashtag={navigateToHashtag}
                    placeholderImage={placeholderImage}
                    generateURL={generateURL}
                    generateSmartphoneURL={generateSmartphoneURL}
                    showErrorMessage={showErrorMessage}
                    showInfoMessage={showInfoMessage}
                    ErrorMessage={ErrorMessage}
                    InfoMessage={InfoMessage}
                    setInfoMessage={setInfoMessage}
                    setShowInfoMessage={setShowInfoMessage}
                    setErrorMessage={setErrorMessage}
                    setShowErrorMessage={setShowErrorMessage}
                    setMobileFeedGalleryOpen={setMobileFeedGalleryOpen}
                    setBookmarkStatusChanged={setBookmarkStatusChanged}
                    isDarkMode={isDarkMode}
                    shouldCleanupBrowserHistoryRef={shouldCleanupBrowserHistoryRef}
                    spatiotemporalInfoModal={spatiotemporalInfoModal}
                    setSpatiotemporalInfoModal={setSpatiotemporalInfoModal}
                    __={__}
                />
            )}
        </>
    );
};

export default memo(MobileFeedSinglePage);
