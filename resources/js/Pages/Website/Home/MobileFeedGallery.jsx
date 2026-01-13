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
                    __={__}
                />
            )}
        </>
    )
}

export default MobileFeedGallery
