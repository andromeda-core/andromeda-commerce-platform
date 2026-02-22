import React from 'react'
import SmartphoneMobileFeedGallery from "./SmartphoneMobileFeedGallery";
import PostMobileFeedGallery from './PostMobileFeedGallery';
const MobileFeedGallery = (
    {
        feedGallery,
        setShowQrCode,
        setLinkCopied,
        auth,
        currency,
        navigateToHashtag,
        placeholderImage,
        generateURL,
        __,
        showErrorMessage,
        showInfoMessage,
        ErrorMessage,
        InfoMessage,
        setInfoMessage,
        setShowInfoMessage,
        setErrorMessage,
        setShowErrorMessage,
        setBookmarkStatusChanged,
        isDarkMode,
        setMobileFeedGalleryOpen,
        generateSmartphoneURL,
        shouldCleanupBrowserHistoryRef,
        setSpatiotemporalInfoModal,
        spatiotemporalInfoModal,
        previous_url = null,
    }

) => {

    return (
        <>
            {feedGallery?.type === 'smartphones' && (
                <SmartphoneMobileFeedGallery
                    smartphone={feedGallery}
                    setShowQrCode={setShowQrCode}
                    setLinkCopied={setLinkCopied}
                    auth={auth}
                    currency={currency}
                    navigateToHashtag={navigateToHashtag}
                    placeholderImage={placeholderImage}
                    showErrorMessage={showErrorMessage}
                    showInfoMessage={showInfoMessage}
                    ErrorMessage={ErrorMessage}
                    InfoMessage={InfoMessage}
                    setInfoMessage={setInfoMessage}
                    setShowInfoMessage={setShowInfoMessage}
                    setErrorMessage={setErrorMessage}
                    setShowErrorMessage={setShowErrorMessage}
                    setMobileFeedGalleryOpen={setMobileFeedGalleryOpen}
                    generateSmartphoneURL={generateSmartphoneURL}
                    shouldCleanupBrowserHistoryRef={shouldCleanupBrowserHistoryRef}
                    spatiotemporalInfoModal={spatiotemporalInfoModal}
                    setSpatiotemporalInfoModal={setSpatiotemporalInfoModal}
                    previous_url={previous_url}
                    __={__}

                />
            )}



            {feedGallery?.type === 'posts' && (
                <PostMobileFeedGallery
                    generateURL={generateURL}
                    navigateToHashtag={navigateToHashtag}
                    placeholderImage={placeholderImage}
                    post={feedGallery}
                    setLinkCopied={setLinkCopied}
                    setShowQrCode={setShowQrCode}
                    setBookmarkStatusChanged={setBookmarkStatusChanged}
                    isDarkMode={isDarkMode}
                    auth={auth}
                    __={__}
                    setMobileFeedGalleryOpen={setMobileFeedGalleryOpen}
                    spatiotemporalInfoModal={spatiotemporalInfoModal}
                    setSpatiotemporalInfoModal={setSpatiotemporalInfoModal}
                    previous_url={previous_url}
                />
            )}
        </>
    )
}

export default MobileFeedGallery
