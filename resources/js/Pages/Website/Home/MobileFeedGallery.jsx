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
        cart_items,
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
        smartphone_addon_items,
        generateSmartphoneURL,
        shouldCleanupBrowserHistoryRef,
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
                    cart_items={cart_items}
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
                    smartphone_addon_items={smartphone_addon_items}
                    generateSmartphoneURL={generateSmartphoneURL}
                    shouldCleanupBrowserHistoryRef={shouldCleanupBrowserHistoryRef}
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
                />
            )}
        </>
    )
}

export default MobileFeedGallery
